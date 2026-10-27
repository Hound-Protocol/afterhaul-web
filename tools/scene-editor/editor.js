// AFTERHAUL scene editor. One scene, not a general engine.
// Objects are placed with gizmos, keyed on a timeline, and the fence break is BAKED (see bakeFence):
// pieces follow a recorded path, so freezing time is just stopping the playhead.
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { TransformControls } from 'three/addons/controls/TransformControls.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

const $ = (s, r = document) => r.querySelector(s);
const V3 = THREE.Vector3, Q = THREE.Quaternion, E = THREE.Euler;
const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
const fmt = v => String(Math.round(v * 100) / 100 + 0);
const SAVE_KEY = 'afterhaul-scene-editor-v1';

/* ---------------- renderer, scene, cameras ---------------- */
const stage = $('#stage'), canvas = $('#view');
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, preserveDrawingBuffer: true });
renderer.setPixelRatio(Math.min(devicePixelRatio || 1, 2));
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x2b2218);
scene.fog = new THREE.Fog(0x2b2218, 90, 320);
scene.add(new THREE.HemisphereLight(0xf2d9a8, 0x2a2118, 1.0));
const sun = new THREE.DirectionalLight(0xffd9a0, 2.4);
sun.position.set(30, 45, 20);
sun.castShadow = true;
sun.shadow.mapSize.set(2048, 2048);
Object.assign(sun.shadow.camera, { left: -45, right: 45, top: 45, bottom: -45, near: 1, far: 140 });
scene.add(sun);

const ground = new THREE.Mesh(new THREE.PlaneGeometry(500, 500).rotateX(-Math.PI / 2),
  new THREE.MeshStandardMaterial({ color: 0x6b5a3e, roughness: 1, flatShading: true }));
ground.receiveShadow = true;
scene.add(ground);
const grid = new THREE.GridHelper(100, 100, 0x8a7a5a, 0x4a4030);
grid.position.y = 0.01;
grid.material.transparent = true; grid.material.opacity = 0.35;
scene.add(grid);

const edCam = new THREE.PerspectiveCamera(50, 1, 0.1, 1200);
edCam.position.set(16, 9, 18);
const orbit = new OrbitControls(edCam, canvas);
orbit.target.set(0, 1, 0);
orbit.enableDamping = true;
orbit.update();

const shotCam = new THREE.PerspectiveCamera(40, 16 / 9, 0.1, 1200);
shotCam.position.set(10, 3, 12);
shotCam.lookAt(0, 1.5, 0);
scene.add(shotCam);
const camBody = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.4, 0.7), new THREE.MeshBasicMaterial({ color: 0xf0a202 }));
camBody.position.z = 0.3;
shotCam.add(camBody);
const camHelper = new THREE.CameraHelper(shotCam);
scene.add(camHelper);

/* ---------------- state ---------------- */
const S = {
  objects: [], selected: null, selKey: null,
  t: 0, duration: 8, playing: false, loop: false,
  freezeAt: null, ramp: 0.8, manualFreeze: false, manualScale: 1, frozenFor: 0, timeScale: 1,
  view: 'free', letterbox: false, autoKey: false, mode: 'translate', pps: 90, spawning: null, nextId: 1,
};
const camEnt = {
  id: 'cam', type: 'camera', name: 'Shot camera', root: shotCam, keys: [],
  params: { fov: 40, lookAt: '', lookY: 1.2, drift: 0, push: 0 },
};
shotCam.userData.eid = 'cam';
S.objects.push(camEnt);
const byId = id => S.objects.find(o => o.id === id);

/* ---------------- builders ---------------- */
const mat = (c, o = {}) => new THREE.MeshStandardMaterial({ color: c, roughness: 0.95, flatShading: true, ...o });
function box(w, h, d, color, x = 0, y = 0, z = 0) {
  const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat(color));
  m.position.set(x, y, z); m.castShadow = m.receiveShadow = true; return m;
}
function buildTruck() { // stand-in, front is +Z. Replace with the real GLB (Add GLB).
  const g = new THREE.Group();
  g.add(box(2.4, 0.5, 8, 0x3a3a3a, 0, 0.9, 0));
  g.add(box(2.4, 1.9, 2.0, 0xb23a1c, 0, 2.0, 2.7));
  g.add(box(2.2, 0.8, 0.1, 0x9ab4bc, 0, 2.5, 3.72));
  g.add(box(2.5, 1.4, 4.6, 0x7b6a4a, 0, 1.85, -1.4));
  for (const z of [3, 0.2, -2.2, -3.4]) for (const x of [-1.3, 1.3]) {
    const w = new THREE.Mesh(new THREE.CylinderGeometry(0.62, 0.62, 0.5, 10), mat(0x111111));
    w.rotation.z = Math.PI / 2; w.position.set(x, 0.62, z); w.castShadow = true; g.add(w);
  }
  return g;
}
function buildCrate() { return box(1, 1, 1, 0x8a6a3a, 0, 0.5, 0); }
function buildBarrel() {
  const m = new THREE.Mesh(new THREE.CylinderGeometry(0.4, 0.4, 1.0, 9), mat(0x7a2e1a));
  m.position.y = 0.5; m.castShadow = true; return m;
}
function buildRock() {
  const m = new THREE.Mesh(new THREE.IcosahedronGeometry(1, 0), mat(0x6d6a63));
  m.scale.set(1.3, 0.8, 1); m.position.y = 0.6; m.castShadow = m.receiveShadow = true;
  const g = new THREE.Group(); g.add(m); return g;
}
function buildTree() {
  const g = new THREE.Group();
  g.add(box(0.4, 2.4, 0.4, 0x4a3a28, 0, 1.2, 0));
  for (let i = 0; i < 3; i++) {
    const c = new THREE.Mesh(new THREE.ConeGeometry(1.7 - i * 0.4, 2.6, 6), mat(0x2f4a2a));
    c.position.y = 3 + i * 1.5; c.castShadow = true; g.add(c);
  }
  return g;
}
const hillH = (x, z, p) => p.height * Math.exp(-(x * x + z * z) / (2 * p.sigma * p.sigma));
function buildHill(p) {
  const geo = new THREE.PlaneGeometry(70, 70, 36, 36).rotateX(-Math.PI / 2);
  const pos = geo.attributes.position;
  for (let i = 0; i < pos.count; i++) pos.setY(i, hillH(pos.getX(i), pos.getZ(i), p));
  geo.computeVertexNormals();
  const m = new THREE.Mesh(geo, mat(0x75623f));
  m.receiveShadow = m.castShadow = true;
  const g = new THREE.Group(); g.add(m); g.userData.hillMesh = m; return g;
}
const FENCE_SEG = 2.0;
function buildFence(p) { // posts and boards are separate pieces so they can break apart
  const g = new THREE.Group(); const pieces = [];
  const add = (m, size) => { m.userData.size = size; m.userData.rest = { p: m.position.clone(), q: m.quaternion.clone() }; pieces.push(m); g.add(m); };
  const n = p.segments, half = (n * FENCE_SEG) / 2;
  for (let i = 0; i <= n; i++) add(box(0.2, 1.6, 0.2, 0x5a4630, -half + i * FENCE_SEG, 0.8, 0), [0.2, 1.6, 0.2]);
  for (let i = 0; i < n; i++) for (let r = 0; r < 4; r++) for (let h = 0; h < 2; h++) {
    const len = FENCE_SEG / 2 - 0.04;
    add(box(len, 0.2, 0.06, r % 2 ? 0x8a7048 : 0x7a6240, -half + i * FENCE_SEG + FENCE_SEG * (0.25 + h * 0.5), 0.3 + r * 0.38, 0.14), [len, 0.2, 0.06]);
  }
  g.userData.pieces = pieces; return g;
}
const TYPES = {
  truck:  { label: 'Truck (stand-in)', build: buildTruck, params: {} },
  fence:  { label: 'Fence', build: buildFence, params: { segments: 6, impact: 2, breaker: '', power: 7, up: 6, spin: 8, reach: 4, seed: 1 } },
  hill:   { label: 'Hill', build: buildHill, params: { height: 9, sigma: 10 } },
  rock:   { label: 'Rock', build: buildRock, params: {} },
  tree:   { label: 'Tree', build: buildTree, params: {} },
  crate:  { label: 'Crate', build: buildCrate, params: {} },
  barrel: { label: 'Barrel', build: buildBarrel, params: {} },
};

function createEntity(type, opts = {}) {
  const def = TYPES[type];
  const params = { ...def.params, ...(opts.params || {}) };
  const root = opts.root || def.build(params);
  const id = opts.id || 'e' + S.nextId++;
  if (opts.id) S.nextId = Math.max(S.nextId, parseInt(String(opts.id).slice(1), 10) + 1 || S.nextId);
  const ent = { id, type, name: opts.name || def.label.replace(' (stand-in)', ''), root, keys: opts.keys || [], params, file: opts.file };
  root.userData.eid = id;
  scene.add(root);
  S.objects.push(ent);
  return ent;
}
function removeEntity(ent) {
  if (ent.id === 'cam') return;
  scene.remove(ent.root);
  S.objects = S.objects.filter(o => o !== ent);
  if (S.selected === ent) select(null);
  rebuildTimeline(); markDirty();
}

/* ---------------- keys, poses, evaluation ---------------- */
const snapshot = (ent, t) => ({
  t, p: ent.root.position.toArray(), q: ent.root.quaternion.toArray(), s: ent.root.scale.toArray(),
  f: ent.id === 'cam' ? shotCam.fov : undefined,
});
function addKey(ent, t = S.t) {
  t = Math.round(t * 100) / 100;
  const k = snapshot(ent, t);
  const same = ent.keys.find(x => Math.abs(x.t - t) < 0.005);
  if (same) Object.assign(same, k); else ent.keys.push(k);
  ent.keys.sort((a, b) => a.t - b.t);
  rebuildTimeline(); markDirty(); return k;
}
const lerp3 = (a, b, u) => [a[0] + (b[0] - a[0]) * u, a[1] + (b[1] - a[1]) * u, a[2] + (b[2] - a[2]) * u];
function catmull(p0, p1, p2, p3, u) {
  const u2 = u * u, u3 = u2 * u;
  return p1.map((_, i) => 0.5 * ((2 * p1[i]) + (-p0[i] + p2[i]) * u + (2 * p0[i] - 5 * p1[i] + 4 * p2[i] - p3[i]) * u2 + (-p0[i] + 3 * p1[i] - 3 * p2[i] + p3[i]) * u3));
}
// Pure: returns {p,q,s,f} at time t from the keys (or the current transform when there are none).
function poseAt(ent, t) {
  const ks = ent.keys;
  if (!ks.length) return { p: ent.root.position.toArray(), q: ent.root.quaternion.toArray(), s: ent.root.scale.toArray(), f: shotCam.fov };
  if (t <= ks[0].t) return ks[0];
  if (t >= ks[ks.length - 1].t) return ks[ks.length - 1];
  let i = 0; while (ks[i + 1].t < t) i++;
  const a = ks[i], b = ks[i + 1], u = (t - a.t) / (b.t - a.t);
  const p0 = (ks[i - 1] || a).p, p3 = (ks[i + 2] || b).p;
  const q = new Q().fromArray(a.q).slerp(new Q().fromArray(b.q), u);
  return { p: catmull(p0, a.p, b.p, p3, u), q: q.toArray(), s: lerp3(a.s, b.s, u), f: a.f !== undefined ? a.f + (b.f - a.f) * u : undefined };
}
function applyPose(ent, pose) {
  ent.root.position.fromArray(pose.p); ent.root.quaternion.fromArray(pose.q); ent.root.scale.fromArray(pose.s);
  if (ent.id === 'cam' && pose.f !== undefined) { shotCam.fov = pose.f; shotCam.updateProjectionMatrix(); }
}
function evaluateAll(t) {
  for (const ent of S.objects) if (ent.keys.length) applyPose(ent, poseAt(ent, t));
  for (const ent of S.objects) if (ent.type === 'fence') updateFence(ent, t);
  aimCamera();
  camHelper.update();
}
function aimCamera() {
  const tgt = camEnt.params.lookAt && byId(camEnt.params.lookAt);
  if (tgt) { const v = new V3(); tgt.root.getWorldPosition(v); v.y += camEnt.params.lookY; shotCam.lookAt(v); }
}
function applyDrift(dt) {
  const amt = 1 - S.timeScale;
  S.frozenFor += dt * amt;
  const { drift, push } = camEnt.params;
  if ((!drift && !push) || amt < 0.01) return;
  const right = new V3(1, 0, 0).applyQuaternion(shotCam.quaternion), fwd = new V3(0, 0, -1).applyQuaternion(shotCam.quaternion);
  shotCam.position.addScaledVector(right, Math.sin(S.frozenFor * 0.45) * drift * amt).addScaledVector(fwd, push * S.frozenFor);
  aimCamera();
}

/* ---------------- ground height (hills) ---------------- */
function groundAt(x, z) {
  let y = 0; const v = new V3();
  for (const h of S.objects) if (h.type === 'hill') {
    h.root.updateMatrixWorld();
    v.set(x, 0, z); h.root.worldToLocal(v);
    const ly = hillH(v.x, v.z, h.params);
    y = Math.max(y, h.root.localToWorld(new V3(v.x, ly, v.z)).y);
  }
  return y;
}

/* ---------------- fence break (baked) ---------------- */
function mulberry(seed) { let a = seed >>> 0; return () => { a = (a + 0x6D2B79F5) >>> 0; let t = a; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }
const SIM_FPS = 60, SIM_STEPS = 420;
function fenceSignature(ent) {
  const br = byId(ent.params.breaker) || S.objects.find(o => o.type === 'truck');
  return JSON.stringify([ent.params, ent.keys, ent.keys.length ? 0 : [ent.root.position.toArray(), ent.root.quaternion.toArray()],
    br && [br.id, br.keys, br.keys.length ? 0 : br.root.position.toArray()],
    S.objects.filter(o => o.type === 'hill').map(h => [h.params, h.root.position.toArray(), h.root.scale.toArray()])]);
}
function bakeFence(ent) {
  const pieces = ent.root.userData.pieces, P = ent.params, rnd = mulberry(P.seed * 9973);
  const br = byId(P.breaker) || S.objects.find(o => o.type === 'truck');
  const out = { sig: fenceSignature(ent), tracks: [], delays: [] };
  if (!br) { out.tracks = pieces.map(() => null); return out; }
  const pa = poseAt(br, P.impact - 0.05).p, pb = poseAt(br, P.impact + 0.05).p, pc = poseAt(br, P.impact).p;
  const vT = new V3(...pb).sub(new V3(...pa)).multiplyScalar(10), tp = new V3(...pc);
  const fp = poseAt(ent, P.impact);
  const M = new THREE.Matrix4().compose(new V3(...fp.p), new Q(...fp.q), new V3(...fp.s));
  const fq = new Q(...fp.q);
  ent.root.updateMatrixWorld();
  for (const m of pieces) {
    const wp = m.userData.rest.p.clone().applyMatrix4(M), wq = fq.clone().multiply(m.userData.rest.q);
    const d = Math.hypot(wp.x - tp.x, wp.z - tp.z);
    if (d > P.reach) { out.tracks.push(null); out.delays.push(0); continue; }
    const f = clamp(1 - d / P.reach, 0.25, 1);
    const outDir = new V3(wp.x - tp.x, 0, wp.z - tp.z); if (outDir.lengthSq() < 1e-4) outDir.set(rnd() - 0.5, 0, rnd() - 0.5); outDir.normalize();
    const v = vT.clone().multiplyScalar(0.5 + 0.4 * f)
      .addScaledVector(outDir, P.power * f * (0.5 + rnd()))
      .add(new V3((rnd() - 0.5) * P.power * 0.6, P.up * f * (0.5 + rnd() * 0.8), (rnd() - 0.5) * P.power * 0.6));
    const axis = new V3(rnd() - 0.5, rnd() - 0.5, rnd() - 0.5).normalize(), w = P.spin * f * (0.5 + rnd());
    const hy = Math.min(...m.userData.size) / 2 + 0.02;
    const buf = new Float32Array(SIM_STEPS * 7), dt = 1 / SIM_FPS, p = wp.clone(), q = wq.clone(); let still = false;
    for (let i = 0; i < SIM_STEPS; i++) {
      if (!still) {
        v.y -= 9.8 * dt; v.multiplyScalar(0.998); p.addScaledVector(v, dt);
        q.premultiply(new Q().setFromAxisAngle(axis, w * dt)).normalize();
        const gy = groundAt(p.x, p.z) + hy;
        if (p.y < gy) { p.y = gy; if (v.y < 0) v.y *= -0.22; v.x *= 0.78; v.z *= 0.78; if (v.length() < 0.35) { v.set(0, 0, 0); still = true; } }
      }
      buf.set([p.x, p.y, p.z, q.x, q.y, q.z, q.w], i * 7);
    }
    out.tracks.push(buf); out.delays.push(d * 0.015);
  }
  return out;
}
const _ip = new V3(), _iq = new Q(), _iq2 = new Q(), _rq = new Q();
function updateFence(ent, t) {
  if (!ent.bake || ent.bake.sig !== fenceSignature(ent)) ent.bake = bakeFence(ent);
  const pieces = ent.root.userData.pieces, P = ent.params;
  ent.root.updateMatrixWorld();
  ent.root.getWorldQuaternion(_rq); _rq.invert();
  pieces.forEach((m, i) => {
    const tr = ent.bake.tracks[i], tau = (t - P.impact - ent.bake.delays[i]) * SIM_FPS;
    if (!tr || tau <= 0) { m.position.copy(m.userData.rest.p); m.quaternion.copy(m.userData.rest.q); return; }
    const a = clamp(Math.floor(tau), 0, SIM_STEPS - 1), b = Math.min(a + 1, SIM_STEPS - 1), u = clamp(tau - a, 0, 1);
    _ip.set(tr[a * 7], tr[a * 7 + 1], tr[a * 7 + 2]).lerp(new V3(tr[b * 7], tr[b * 7 + 1], tr[b * 7 + 2]), u);
    _iq.set(tr[a * 7 + 3], tr[a * 7 + 4], tr[a * 7 + 5], tr[a * 7 + 6]);
    _iq2.set(tr[b * 7 + 3], tr[b * 7 + 4], tr[b * 7 + 5], tr[b * 7 + 6]); _iq.slerp(_iq2, u);
    m.position.copy(ent.root.worldToLocal(_ip.clone())); m.quaternion.copy(_rq).multiply(_iq);
  });
}

/* ---------------- transform gizmo, selection ---------------- */
const tc = new TransformControls(edCam, canvas);
scene.add(tc.getHelper());
tc.addEventListener('dragging-changed', e => { orbit.enabled = !e.value; });
tc.addEventListener('objectChange', () => {
  const ent = S.selected; if (!ent) return;
  if (S.autoKey) addKey(ent);
  else if (ent.keys.length) toast('Not keyed. Press K (or turn on Auto-key) or it snaps back when time moves.');
  if (ent.type === 'fence' || ent.type === 'truck') evaluateAll(S.t);
  syncInspector(); markDirty();
});
const selBox = new THREE.BoxHelper(new THREE.Object3D(), 0xf0a202); selBox.visible = false; scene.add(selBox);
function select(ent) {
  S.selected = ent; S.selKey = null;
  if (ent && S.view === 'free') { tc.attach(ent.root); } else tc.detach();
  selBox.visible = !!ent && ent.id !== 'cam'; if (ent && ent.id !== 'cam') selBox.setFromObject(ent.root);
  renderInspector(); highlightTimeline();
}
function entityFromObject(o) { while (o) { if (o.userData && o.userData.eid) return byId(o.userData.eid); o = o.parent; } return null; }

const ray = new THREE.Raycaster(), ndc = new THREE.Vector2();
function setNdc(e) { const r = canvas.getBoundingClientRect(); ndc.set(((e.clientX - r.left) / r.width) * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1); }
function groundPoint(e) {
  setNdc(e); ray.setFromCamera(ndc, edCam);
  const targets = [ground, ...S.objects.filter(o => o.type === 'hill').map(h => h.root.userData.hillMesh)];
  const hit = ray.intersectObjects(targets, false)[0];
  if (hit) return hit.point;
  const p = new V3(); return ray.ray.intersectPlane(new THREE.Plane(new V3(0, 1, 0), 0), p) ? p : null;
}

/* ---------------- spawn ---------------- */
function startSpawn(type) {
  cancelSpawn();
  const ent = createEntity(type);
  ent.root.visible = false; S.spawning = { ent, type };
  document.querySelectorAll('#spawn button').forEach(b => b.classList.toggle('armed', b.dataset.type === type));
  tc.detach();
}
function cancelSpawn() {
  if (!S.spawning) return;
  removeEntity(S.spawning.ent); S.spawning = null;
  document.querySelectorAll('#spawn button').forEach(b => b.classList.remove('armed'));
}
canvas.addEventListener('pointermove', e => {
  if (!S.spawning) return;
  const p = groundPoint(e); if (!p) return;
  S.spawning.ent.root.visible = true; S.spawning.ent.root.position.copy(p);
});
let down = null;
canvas.addEventListener('pointerdown', e => { down = { x: e.clientX, y: e.clientY, tcDrag: tc.dragging }; });
canvas.addEventListener('pointerup', e => {
  if (!down || e.button !== 0) return;
  const moved = Math.hypot(e.clientX - down.x, e.clientY - down.y); const wasGizmo = down.tcDrag || tc.dragging; down = null;
  if (moved > 4 || wasGizmo) return;
  if (S.spawning) {
    const { ent, type } = S.spawning; ent.root.visible = true;
    S.spawning = null; document.querySelectorAll('#spawn button').forEach(b => b.classList.remove('armed'));
    if (S.autoKey) addKey(ent);
    markDirty(); rebuildTimeline();
    if (e.shiftKey) startSpawn(type); else select(ent);
    return;
  }
  if (S.view !== 'free') return;
  setNdc(e); ray.setFromCamera(ndc, edCam);
  const hit = ray.intersectObjects(S.objects.filter(o => o.id === 'cam' || o.root.visible).map(o => o.root), true)[0];
  select(hit ? entityFromObject(hit.object) : null);
});

/* ---------------- UI: spawn list, inspector ---------------- */
const spawnBox = $('#spawn');
for (const [type, def] of Object.entries(TYPES)) {
  const b = document.createElement('button'); b.textContent = def.label; b.dataset.type = type;
  b.onclick = () => startSpawn(type); spawnBox.appendChild(b);
}
let toastTimer;
function toast(msg) { const t = $('#toast'); t.textContent = msg; clearTimeout(toastTimer); toastTimer = setTimeout(() => { t.textContent = ''; }, 3500); }

const insp = $('#insp');
function numInput(value, step, onInput) {
  const i = document.createElement('input'); i.type = 'number'; i.step = step; i.value = fmt(value);
  i.oninput = () => { const v = parseFloat(i.value); if (!isNaN(v)) onInput(v); }; return i;
}
function rowOf(label, ...els) { const r = document.createElement('div'); r.className = 'row'; const l = document.createElement('label'); l.textContent = label; r.append(l); const w = document.createElement('div'); w.className = els.length > 1 ? 'xyz' : ''; w.append(...els); r.append(w); return r; }
function section(t) { const s = document.createElement('div'); s.className = 'sect'; s.textContent = t; return s; }
const afterEdit = ent => { if (S.autoKey) addKey(ent); if (ent.keys.length === 0 || S.autoKey) evaluateAll(S.t); markDirty(); };
function paramRow(ent, key, label, min, max, step) {
  const i = numInput(ent.params[key], step, v => { ent.params[key] = clamp(v, min, max); if (ent.type === 'camera') { if (key === 'fov') { shotCam.fov = ent.params.fov; shotCam.updateProjectionMatrix(); } if (ent.keys.length && key === 'fov') { /* keyed fov wins on next evaluate; key again to store */ } } evaluateAll(S.t); markDirty(); });
  i.style.width = '100%'; return rowOf(label, i);
}
function renderInspector() {
  insp.innerHTML = ''; const ent = S.selected;
  $('#inspTitle').textContent = ent ? ent.name : 'Nothing selected';
  if (!ent) { const p = document.createElement('p'); p.className = 'hint'; p.textContent = 'Click an object, or spawn one from the left.'; insp.append(p); return; }
  const name = document.createElement('input'); name.type = 'text'; name.value = ent.name;
  name.oninput = () => { ent.name = name.value; rebuildTimeline(); markDirty(); }; insp.append(rowOf('Name', name));
  const r = ent.root;
  const mk = (arr, step, set) => arr.map((v, i) => numInput(v, step, x => { set(i, x); afterEdit(ent); }));
  insp.append(rowOf('Position', ...mk(r.position.toArray(), 0.1, (i, x) => { r.position.setComponent(i, x); })));
  insp.append(rowOf('Rotation', ...mk([r.rotation.x, r.rotation.y, r.rotation.z].map(v => THREE.MathUtils.radToDeg(v)), 1, (i, x) => { const e = r.rotation.toArray(); e[i] = THREE.MathUtils.degToRad(x); r.rotation.set(e[0], e[1], e[2]); })));
  if (ent.id !== 'cam') insp.append(rowOf('Scale', ...mk(r.scale.toArray(), 0.1, (i, x) => { r.scale.setComponent(i, x); })));
  if (ent.type === 'camera') {
    insp.append(section('Lens and cinema'));
    const fov = document.createElement('input'); fov.type = 'range'; fov.min = 8; fov.max = 110; fov.step = 0.5; fov.value = shotCam.fov;
    const mm = document.createElement('span'); mm.className = 'hint';
    const upd = () => { mm.textContent = `FOV ${(+fov.value).toFixed(1)} deg, about ${(12 / Math.tan(THREE.MathUtils.degToRad(fov.value) / 2)).toFixed(0)} mm (35 mm film)`; };
    fov.oninput = () => { shotCam.fov = +fov.value; ent.params.fov = +fov.value; shotCam.updateProjectionMatrix(); camHelper.update(); upd(); if (S.autoKey) addKey(ent); markDirty(); };
    upd(); insp.append(rowOf('FOV', fov), mm);
    const sel = document.createElement('select'); sel.innerHTML = '<option value="">Free aim</option>' + S.objects.filter(o => o.id !== 'cam').map(o => `<option value="${o.id}">${o.name}</option>`).join('');
    sel.value = ent.params.lookAt; sel.onchange = () => { ent.params.lookAt = sel.value; evaluateAll(S.t); markDirty(); }; insp.append(rowOf('Look at', sel));
    insp.append(paramRow(ent, 'lookY', 'Aim height', -5, 20, 0.1));
    insp.append(section('While frozen'));
    insp.append(paramRow(ent, 'drift', 'Sway (m)', 0, 5, 0.05), paramRow(ent, 'push', 'Push-in (m/s)', -2, 2, 0.02));
    const p = document.createElement('p'); p.className = 'hint'; p.textContent = 'Sway and push-in only run while time is frozen, so the picture stays alive.'; insp.append(p);
  }
  if (ent.type === 'fence') {
    insp.append(section('Break'));
    const sel = document.createElement('select'); sel.innerHTML = '<option value="">First truck</option>' + S.objects.filter(o => o.type === 'truck').map(o => `<option value="${o.id}">${o.name}</option>`).join('');
    sel.value = ent.params.breaker; sel.onchange = () => { ent.params.breaker = sel.value; evaluateAll(S.t); markDirty(); }; insp.append(rowOf('Hit by', sel));
    [['impact', 'Impact (s)', 0, 60, 0.05], ['power', 'Burst', 0, 30, 0.5], ['up', 'Lift', 0, 20, 0.5], ['spin', 'Spin', 0, 30, 0.5], ['reach', 'Reach (m)', 0.5, 20, 0.25], ['seed', 'Seed', 1, 9999, 1]]
      .forEach(a => insp.append(paramRow(ent, ...a)));
    const p = document.createElement('p'); p.className = 'hint'; p.textContent = 'The break is baked from the truck path. Move the truck keys and it re-bakes. Keep the fence still.'; insp.append(p);
  }
  if (ent.type === 'hill') { insp.append(section('Shape')); insp.append(paramRow(ent, 'height', 'Height', 0, 40, 0.5), paramRow(ent, 'sigma', 'Width', 2, 40, 0.5)); const b = document.createElement('p'); b.className = 'hint'; b.textContent = 'Reshape rebuilds on reload (spawn a new hill to try another).'; insp.append(b); }
  const bar = document.createElement('div'); bar.className = 'insp-btns';
  const mkb = (t, f) => { const b = document.createElement('button'); b.textContent = t; b.onclick = f; bar.append(b); };
  mkb('Key here (K)', () => doKey()); mkb('Clear keys', () => { ent.keys = []; rebuildTimeline(); markDirty(); });
  if (ent.id !== 'cam') { mkb('Duplicate', () => duplicate(ent)); mkb('Delete', () => removeEntity(ent)); }
  insp.append(bar);
}
function syncInspector() {
  const ent = S.selected; if (!ent) return;
  const inputs = insp.querySelectorAll('.xyz'); if (inputs.length < 2) return;
  const r = ent.root;
  const set = (box, arr) => box.querySelectorAll('input').forEach((i, k) => { if (document.activeElement !== i) i.value = fmt(arr[k]); });
  set(inputs[0], r.position.toArray()); set(inputs[1], [r.rotation.x, r.rotation.y, r.rotation.z].map(v => THREE.MathUtils.radToDeg(v)));
  if (inputs[2]) set(inputs[2], r.scale.toArray());
}
function duplicate(ent) {
  const c = createEntity(ent.type, { params: JSON.parse(JSON.stringify(ent.params)), name: ent.name + ' copy', file: ent.file, root: ent.type === 'glb' ? ent.root.clone() : undefined });
  c.root.position.copy(ent.root.position).add(new V3(2, 0, 0)); c.root.quaternion.copy(ent.root.quaternion); c.root.scale.copy(ent.root.scale);
  select(c); rebuildTimeline(); markDirty();
}
function doKey() { const ent = S.selected; if (!ent) { toast('Select an object first.'); return; } addKey(ent); toast(`Key at ${S.t.toFixed(2)} s`); }

/* ---------------- timeline ---------------- */
const tlin = $('#tlin'), ruler = $('#tlruler'), tracks = $('#tltracks'), head = $('#tlhead');
const NAME_W = 150, TRK_X = 10;
function rowEl(label, ent) {
  const row = document.createElement('div'); row.className = 'trow'; if (ent) row.dataset.id = ent.id;
  const n = document.createElement('div'); n.className = 'tname'; n.textContent = label; n.title = label;
  const tr = document.createElement('div'); tr.className = 'ttrack'; tr.style.width = S.duration * S.pps + 'px'; tr.style.setProperty('--pps', S.pps + 'px');
  row.append(n, tr); return { row, n, tr };
}
function rebuildTimeline() {
  tlin.style.setProperty('--pps', S.pps + 'px');
  ruler.innerHTML = ''; tracks.innerHTML = '';
  const r = rowEl('Time (s)'); ruler.append(r.row);
  for (let s = 0; s <= S.duration; s++) { const t = document.createElement('span'); t.className = 'tick'; t.style.left = s * S.pps + 3 + 'px'; t.textContent = s; r.tr.append(t); }
  if (S.freezeAt !== null) {
    const rp = document.createElement('div'); rp.className = 'ramp'; rp.style.left = Math.max(0, S.freezeAt - S.ramp) * S.pps + 'px'; rp.style.width = Math.min(S.ramp, S.freezeAt) * S.pps + 'px'; r.tr.append(rp);
    const fl = document.createElement('div'); fl.className = 'flag'; fl.style.left = S.freezeAt * S.pps + 'px'; r.tr.append(fl);
    dragX(fl, x => { S.freezeAt = clamp(Math.round(x / S.pps * 20) / 20, 0.05, S.duration); markDirty(); }, rebuildTimeline);
  }
  dragX(r.tr, x => setTime(clamp(x / S.pps, 0, S.duration)), null, true);
  S.objects.forEach(ent => {
    const t = rowEl(ent.name, ent); t.row.classList.toggle('sel', S.selected === ent);
    t.n.onclick = () => { if (ent.id !== 'cam' || true) select(ent); };
    t.tr.onpointerdown = e => { if (e.target === t.tr) { select(ent); setTime(clamp((e.clientX - t.tr.getBoundingClientRect().left) / S.pps, 0, S.duration)); } };
    ent.keys.forEach(k => {
      const d = document.createElement('div'); d.className = 'key' + (S.selKey === k ? ' sel' : ''); d.style.left = k.t * S.pps + 'px'; d.title = `${k.t.toFixed(2)} s`;
      d.onpointerdown = e => { e.stopPropagation(); select(ent); S.selKey = k; setTime(k.t); highlightTimeline(); };
      dragX(d, x => { k.t = clamp(Math.round(x / S.pps * 20) / 20, 0, S.duration); d.style.left = k.t * S.pps + 'px'; evaluateAll(S.t); markDirty(); }, () => { ent.keys.sort((a, b) => a.t - b.t); rebuildTimeline(); evaluateAll(S.t); }, false, true);
      t.tr.append(d);
    });
    tracks.append(t.row);
  });
  updateHead();
}
function highlightTimeline() {
  tracks.querySelectorAll('.trow').forEach(r => r.classList.toggle('sel', S.selected && r.dataset.id === S.selected.id));
  tracks.querySelectorAll('.key').forEach(() => {});
}
// pointer drag along a track element: cb(x relative to track left)
function dragX(el, cb, done, immediate = false, keepSel = false) {
  el.addEventListener('pointerdown', e => {
    if (e.button !== 0) return; e.stopPropagation();
    const tr = el.closest('.ttrack'); const left = () => tr.getBoundingClientRect().left;
    el.setPointerCapture(e.pointerId);
    if (immediate) cb(e.clientX - left());
    const mv = ev => cb(ev.clientX - left());
    const up = () => { el.removeEventListener('pointermove', mv); el.removeEventListener('pointerup', up); done && done(); };
    el.addEventListener('pointermove', mv); el.addEventListener('pointerup', up);
  });
}
function updateHead() {
  head.style.left = NAME_W + TRK_X + S.t * S.pps + 'px';
  $('#time').textContent = `${S.t.toFixed(2)} / ${S.duration.toFixed(2)} s${S.timeScale < 0.02 ? '  (frozen)' : ''}`;
}
function setTime(t) { S.t = t; evaluateAll(t); updateHead(); if (S.selected) syncInspector(); }

/* ---------------- playback clock ---------------- */
function timeScale(dt) {
  let s = 1;
  if (S.freezeAt !== null && S.t > S.freezeAt - S.ramp) s = clamp((S.freezeAt - S.t) / S.ramp, 0, 1);
  S.manualScale += ((S.manualFreeze ? 0 : 1) - S.manualScale) * clamp(dt * 7, 0, 1);
  return s * S.manualScale;
}
let last = performance.now();
function frame(now) {
  const dt = Math.min(0.1, (now - last) / 1000); last = now;
  S.timeScale = S.playing || S.manualFreeze || S.freezeAt !== null ? timeScale(dt) : 1;
  if (S.playing) {
    S.t += dt * S.timeScale;
    if (S.timeScale < 0.003) S.timeScale = 0;
    if (S.t >= S.duration) { if (S.loop) { S.t = 0; S.frozenFor = 0; } else { S.t = S.duration; setPlaying(false); } }
    evaluateAll(S.t); updateHead();
  } else if (S.view === 'shot') evaluateAll(S.t);
  if (S.view === 'shot') applyDrift(dt);
  else { if (S.playing) camHelper.update(); }
  if (S.selected && S.selected.id !== 'cam' && S.selBoxOn !== false) selBox.setFromObject(S.selected.root);
  orbit.update();
  render();
  requestAnimationFrame(frame);
}
function render() {
  const w = stage.clientWidth, h = stage.clientHeight;
  if (canvas.width !== Math.floor(w * renderer.getPixelRatio()) || canvas.height !== Math.floor(h * renderer.getPixelRatio())) renderer.setSize(w, h, false);
  renderer.setScissorTest(false); renderer.setViewport(0, 0, w, h); renderer.clear();
  const shot = S.view === 'shot';
  grid.visible = !shot; camHelper.visible = !shot; camBody.visible = !shot; tc.getHelper().visible = !shot && !!S.selected; selBox.visible = !shot && !!S.selected && S.selected.id !== 'cam';
  if (shot) {
    let vw = w, vh = h; const asp = S.letterbox ? 2.39 : w / h;
    if (w / h > asp) vw = h * asp; else vh = w / asp;
    const x = (w - vw) / 2, y = (h - vh) / 2;
    shotCam.aspect = vw / vh; shotCam.updateProjectionMatrix();
    renderer.setViewport(x, y, vw, vh); renderer.setScissor(x, y, vw, vh); renderer.setScissorTest(true);
    renderer.render(scene, shotCam);
  } else { edCam.aspect = w / h; edCam.updateProjectionMatrix(); renderer.render(scene, edCam); }
}
function setPlaying(p) {
  S.playing = p; $('#play').textContent = p ? 'Pause' : 'Play';
  if (p && S.t >= S.duration) { S.t = 0; S.frozenFor = 0; }
}

/* ---------------- toolbar wiring ---------------- */
document.querySelectorAll('[data-mode]').forEach(b => b.onclick = () => { S.mode = b.dataset.mode; tc.setMode(S.mode); document.querySelectorAll('[data-mode]').forEach(x => x.classList.toggle('on', x === b)); });
document.querySelectorAll('[data-view]').forEach(b => b.onclick = () => setView(b.dataset.view));
function setView(v) {
  S.view = v; document.querySelectorAll('[data-view]').forEach(x => x.classList.toggle('on', x.dataset.view === v));
  camBody.visible = v === 'free';
  if (v === 'shot') { tc.detach(); S.frozenFor = 0; evaluateAll(S.t); } else if (S.selected) tc.attach(S.selected.root);
}
$('#snap').onchange = e => { tc.setTranslationSnap(e.target.checked ? 0.5 : null); tc.setRotationSnap(e.target.checked ? THREE.MathUtils.degToRad(15) : null); tc.setScaleSnap(e.target.checked ? 0.1 : null); };
$('#letterbox').onchange = e => { S.letterbox = e.target.checked; };
$('#frame').onclick = frameSelected;
function frameSelected() {
  const ent = S.selected; if (!ent) { toast('Select an object first.'); return; }
  const b = new THREE.Box3().setFromObject(ent.root); const c = b.getCenter(new V3()), r = Math.max(b.getSize(new V3()).length() * 0.9, 3);
  const dir = edCam.position.clone().sub(orbit.target).normalize();
  orbit.target.copy(c); edCam.position.copy(c).addScaledVector(dir, r * 1.6); orbit.update();
}
$('#camFromView').onclick = () => {
  shotCam.position.copy(edCam.position); shotCam.quaternion.copy(edCam.quaternion); shotCam.fov = edCam.fov; shotCam.updateProjectionMatrix(); camEnt.params.lookAt = '';
  if (S.autoKey) addKey(camEnt); select(camEnt); camHelper.update(); markDirty(); toast('Shot camera set from the free view. Press K to key it.');
};
$('#freezeBtn').onclick = toggleFreeze;
function toggleFreeze() { S.manualFreeze = !S.manualFreeze; $('#freezeBtn').setAttribute('aria-pressed', S.manualFreeze); if (!S.manualFreeze) S.frozenFor = 0; if (S.manualFreeze && !S.playing) toast('Freeze holds time while playing. Press Play.'); }
$('#play').onclick = () => setPlaying(!S.playing);
$('#stop').onclick = () => { setPlaying(false); S.frozenFor = 0; S.manualFreeze = false; S.manualScale = 1; $('#freezeBtn').setAttribute('aria-pressed', false); setTime(0); };
$('#keyBtn').onclick = doKey;
$('#autokey').onchange = e => { S.autoKey = e.target.checked; };
$('#loop').onchange = e => { S.loop = e.target.checked; };
$('#dur').onchange = e => { S.duration = clamp(parseFloat(e.target.value) || 8, 1, 60); rebuildTimeline(); markDirty(); };
$('#ramp').onchange = e => { S.ramp = clamp(parseFloat(e.target.value) || 0.8, 0.05, 5); rebuildTimeline(); markDirty(); };
$('#setFreeze').onclick = () => { S.freezeAt = Math.max(S.t, 0.05); rebuildTimeline(); markDirty(); toast(`Freeze at ${S.freezeAt.toFixed(2)} s`); };
$('#clearFreeze').onclick = () => { S.freezeAt = null; rebuildTimeline(); markDirty(); };
$('#zoomIn').onclick = () => { S.pps = clamp(S.pps * 1.3, 30, 400); rebuildTimeline(); };
$('#zoomOut').onclick = () => { S.pps = clamp(S.pps / 1.3, 30, 400); rebuildTimeline(); };
addEventListener('keydown', e => {
  if (/INPUT|SELECT|TEXTAREA/.test(document.activeElement.tagName) && document.activeElement.type !== 'checkbox') return;
  const k = e.key.toLowerCase();
  if (k === 'w') $('[data-mode=translate]').click(); else if (k === 'e') $('[data-mode=rotate]').click(); else if (k === 'r') $('[data-mode=scale]').click();
  else if (k === 'k') doKey(); else if (k === ' ') { e.preventDefault(); setPlaying(!S.playing); } else if (k === 'h') toggleFreeze(); else if (k === 'f') frameSelected();
  else if (k === 'escape') { if (S.spawning) cancelSpawn(); else { select(null); } }
  else if (k === 'delete' || k === 'backspace') {
    if (S.selKey && S.selected) { S.selected.keys = S.selected.keys.filter(x => x !== S.selKey); S.selKey = null; rebuildTimeline(); evaluateAll(S.t); markDirty(); }
    else if (S.selected && S.selected.id !== 'cam') removeEntity(S.selected);
  }
});

/* ---------------- save, load, GLB ---------------- */
function serialize() {
  return {
    version: 1, duration: S.duration, freezeAt: S.freezeAt, ramp: S.ramp,
    entities: S.objects.map(o => ({
      id: o.id, type: o.type, name: o.name, params: o.params, file: o.file, keys: o.keys,
      pose: { p: o.root.position.toArray(), q: o.root.quaternion.toArray(), s: o.root.scale.toArray() },
    })),
  };
}
function loadScene(data) {
  S.objects.filter(o => o.id !== 'cam').forEach(o => scene.remove(o.root));
  S.objects = [camEnt]; S.selected = null; S.selKey = null; tc.detach(); S.nextId = 1;
  S.duration = data.duration || 8; S.freezeAt = data.freezeAt ?? null; S.ramp = data.ramp || 0.8;
  $('#dur').value = S.duration; $('#ramp').value = S.ramp;
  for (const e of data.entities) {
    let ent;
    if (e.id === 'cam') { ent = camEnt; Object.assign(ent.params, e.params); ent.keys = e.keys || []; ent.name = e.name || ent.name; }
    else if (TYPES[e.type]) ent = createEntity(e.type, { id: e.id, name: e.name, params: e.params, keys: e.keys });
    else { ent = createEntity('crate', { id: e.id, name: e.name + ' (model not loaded)', keys: e.keys }); ent.type = 'glb'; ent.file = e.file; }
    ent.root.position.fromArray(e.pose.p); ent.root.quaternion.fromArray(e.pose.q); ent.root.scale.fromArray(e.pose.s);
  }
  shotCam.fov = camEnt.params.fov || 40; shotCam.updateProjectionMatrix();
  rebuildTimeline(); renderInspector(); setTime(0);
}
let saveTimer;
function markDirty() { clearTimeout(saveTimer); saveTimer = setTimeout(() => { try { localStorage.setItem(SAVE_KEY, JSON.stringify(serialize())); } catch (_) { /* storage may be blocked */ } }, 400); }
$('#saveBtn').onclick = () => {
  const blob = new Blob([JSON.stringify(serialize(), null, 1)], { type: 'application/json' });
  const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = 'afterhaul-scene.json'; a.click(); setTimeout(() => URL.revokeObjectURL(a.href), 2000);
};
$('#loadBtn').onclick = () => $('#fileLoad').click();
$('#fileLoad').onchange = async e => { const f = e.target.files[0]; if (!f) return; try { loadScene(JSON.parse(await f.text())); toast('Loaded ' + f.name); } catch (err) { toast('Could not read that file.'); } e.target.value = ''; };
$('#glbBtn').onclick = () => $('#fileGlb').click();
$('#fileGlb').onchange = e => {
  const f = e.target.files[0]; if (!f) return; const url = URL.createObjectURL(f);
  new GLTFLoader().load(url, gltf => {
    gltf.scene.traverse(o => { if (o.isMesh) { o.castShadow = o.receiveShadow = true; } });
    const g = new THREE.Group(); g.add(gltf.scene);
    TYPES.glb = TYPES.glb || { label: 'Model', build: () => g, params: {} };
    const ent = createEntity('crate', { name: f.name.replace(/\.(glb|gltf)$/i, ''), root: g, file: f.name }); ent.type = 'glb';
    const b = new THREE.Box3().setFromObject(g); toast(`Loaded ${f.name}: ${b.getSize(new V3()).toArray().map(v => v.toFixed(1)).join(' x ')} m. Add it to the site folder to publish.`);
    select(ent); rebuildTimeline(); markDirty();
  }, undefined, () => toast('Could not read that model.'));
  e.target.value = '';
};

/* ---------------- start ---------------- */
function defaultScene() {
  const hill = createEntity('hill', { params: { height: 12, sigma: 14 } }); hill.root.position.set(0, 0, -30);
  const fence = createEntity('fence'); fence.root.position.set(0, 0, 14); fence.root.rotation.y = 0;
  const truck = createEntity('truck'); truck.root.position.set(0, 0, 40);
  const face = new Q().setFromEuler(new E(0, Math.PI, 0)).toArray(); // front of the model is +Z, so turn it to drive toward -Z
  const nose = new Q().setFromEuler(new E(0.06, Math.PI, 0)).toArray();
  truck.keys = [
    { t: 0, p: [0, 0.2, 60], q: face, s: [1, 1, 1] },
    { t: 2, p: [0, 0.2, 14], q: face, s: [1, 1, 1] },
    { t: 3, p: [0, 0.2, 2], q: nose, s: [1, 1, 1] },
  ];
  truck.root.position.fromArray(truck.keys[0].p);
  camEnt.keys = [
    { t: 0, p: [14, 2.2, 30], q: new Q().toArray(), s: [1, 1, 1], f: 42 },
    { t: 3, p: [11, 2.6, 18], q: new Q().toArray(), s: [1, 1, 1], f: 34 },
  ];
  camEnt.params.lookAt = truck.id; camEnt.params.lookY = 1.6; camEnt.params.drift = 0.4; camEnt.params.push = 0.12;
  S.freezeAt = 2.5; S.ramp = 0.5; S.duration = 6; $('#ramp').value = S.ramp;
  $('#dur').value = S.duration;
}
try { const saved = localStorage.getItem(SAVE_KEY); if (saved) loadScene(JSON.parse(saved)); else defaultScene(); } catch (_) { defaultScene(); }
rebuildTimeline(); renderInspector(); setTime(S.t);
select(null);
requestAnimationFrame(frame);
window.ED = { S, TYPES, THREE, createEntity, addKey, setTime, select, setView, evaluateAll, serialize, loadScene, setPlaying, byId, edCam, orbit, shotCam, toggleFreeze, startSpawn };
