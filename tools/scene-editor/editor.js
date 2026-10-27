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
sun.shadow.mapSize.set(4096, 4096);
Object.assign(sun.shadow.camera, { left: -95, right: 95, top: 95, bottom: -95, near: 1, far: 260 });
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
edCam.position.set(34, 18, 54);
const orbit = new OrbitControls(edCam, canvas);
orbit.target.set(0, 5, 6);
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
  t: 0, duration: 7, playing: false, loop: false, pip: true, needEval: false,
  freezeAt: null, ramp: 0.8, manualFreeze: false, manualScale: 1, frozenFor: 0, timeScale: 1,
  view: 'free', letterbox: false, autoKey: false, mode: 'translate', pps: 90, spawning: null, nextId: 1,
};
const camEnt = {
  id: 'cam', type: 'camera', name: 'Shot camera', root: shotCam, keys: [],
  params: { fov: 40, lookAt: '', lookY: 1.2, drift: 0, push: 0, pan: 0, tilt: 0, roll: 0 },
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
    w.rotation.z = Math.PI / 2; w.position.set(x, 0.62, z); w.castShadow = true;
    for (const side of [1, -1]) w.add(box(0.95, 0.06, 0.16, 0x8a8a8a, 0, 0.26 * side, 0));
    w.add(box(0.16, 0.06, 0.95, 0x8a8a8a, 0, 0.26, 0)); w.add(box(0.16, 0.06, 0.95, 0x8a8a8a, 0, -0.26, 0));
    g.add(w); (g.userData.wheels = g.userData.wheels || []).push({ obj: w, base: w.quaternion.clone(), axis: new V3(0, -1, 0), r: 0.62 });
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
function hash2(ix, iz, seed) { let h = (Math.imul(ix, 374761393) + Math.imul(iz, 668265263) + Math.imul(seed, 2147483647)) | 0; h = Math.imul(h ^ (h >>> 13), 1274126177); return ((h ^ (h >>> 16)) >>> 0) / 4294967296; }
function vnoise(x, z, seed) {
  const ix = Math.floor(x), iz = Math.floor(z), fx = x - ix, fz = z - iz, sx = fx * fx * (3 - 2 * fx), sz = fz * fz * (3 - 2 * fz);
  const a = hash2(ix, iz, seed), b = hash2(ix + 1, iz, seed), c = hash2(ix, iz + 1, seed), d = hash2(ix + 1, iz + 1, seed);
  return a + (b - a) * sx + (c - a) * sz + (a - b - c + d) * sx * sz;
}
const smooth = (a, b, x) => { const t = clamp((x - a) / (b - a), 0, 1); return t * t * (3 - 2 * t); };
// Long ridge along Z with rolling bumps. The bumps calm down inside a corridor around x = 0 so the road stays readable.
function hillH(x, z, p) {
  const sz = p.sigma * p.stretch;
  const base = p.height * Math.exp(-(x * x) / (2 * p.sigma * p.sigma) - (z * z) / (2 * sz * sz));
  if (!p.bumps) return base;
  const corr = p.corridor > 0 ? 0.1 + 0.9 * smooth(p.corridor, p.corridor + 7, Math.abs(x)) : 1;
  const env = Math.min(1, base / 1.5);
  const n = (vnoise(x * 0.11, z * 0.11, p.seed) - 0.5) * 2 + (vnoise(x * 0.5, z * 0.5, p.seed + 7) - 0.5) * 0.7;
  return base + n * p.bumps * corr * env;
}
function hillGeometry(p) {
  const geo = new THREE.PlaneGeometry(140, 260, 94, 174).rotateX(-Math.PI / 2);
  const pos = geo.attributes.position;
  for (let i = 0; i < pos.count; i++) pos.setY(i, hillH(pos.getX(i), pos.getZ(i), p));
  geo.computeVertexNormals(); return geo;
}
function buildHill(p) {
  const m = new THREE.Mesh(hillGeometry(p), mat(0x75623f));
  m.receiveShadow = m.castShadow = true;
  const g = new THREE.Group(); g.add(m); g.userData.hillMesh = m; return g;
}
function rebuildHill(ent) { const m = ent.root.userData.hillMesh; m.geometry.dispose(); m.geometry = hillGeometry(ent.params); }
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
  truck:  { label: 'Truck (stand-in)', build: buildTruck, params: { follow: true, airAt: 1000, wheelSpin: 6 } },
  fence:  { label: 'Fence', build: buildFence, params: { segments: 6, impact: 2, breaker: '', power: 9, up: 8, spin: 8, reach: 5, push: 0.45, seed: 1, conform: true, driftSpin: 0.35, driftMove: 0.12, auto: true, nose: 4 } },
  hill:   { label: 'Hill', build: buildHill, params: { height: 10, sigma: 12, stretch: 2.4, bumps: 0.7, corridor: 4, seed: 3 } },
  road:   { label: 'Road (from truck path)', build: () => new THREE.Group(), params: { breaker: '', width: 6, until: 3 }, instant: true, world: true },
  forest: { label: 'Forest and rocks', build: () => new THREE.Group(), params: { cx: 0, cz: -10, width: 110, depth: 200, trees: 110, rocks: 60, clear: 10, seed: 5 }, instant: true, world: true },
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
  ent.noGizmo = !!def.world;
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
  c: ent.id === 'cam' ? [ent.params.pan || 0, ent.params.tilt || 0, ent.params.roll || 0] : undefined,
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
  return { p: catmull(p0, a.p, b.p, p3, u), q: q.toArray(), s: lerp3(a.s, b.s, u), f: a.f !== undefined ? a.f + (b.f - a.f) * u : undefined, c: a.c && b.c ? lerp3(a.c, b.c, u) : a.c };
}
function applyPose(ent, pose) {
  ent.root.position.fromArray(pose.p); ent.root.quaternion.fromArray(pose.q); ent.root.scale.fromArray(pose.s);
  if (ent.id === 'cam') {
    if (pose.f !== undefined) { shotCam.fov = pose.f; shotCam.updateProjectionMatrix(); }
    if (pose.c) [ent.params.pan, ent.params.tilt, ent.params.roll] = pose.c;
  }
}
const isTruck = o => o.type === 'truck' || (o.type === 'glb' && o.params.truck);
function followPose(pose) { // sit the truck on the ground: height, pitch and roll from the terrain, heading from the keys
  const q = new Q().fromArray(pose.q), f = new V3(0, 0, 1).applyQuaternion(q); f.y = 0;
  if (f.lengthSq() < 1e-6) return pose;
  f.normalize();
  const xa = new V3(f.z, 0, -f.x), p = pose.p, L = 3.2, W = 1.3, g = (dx, dz) => groundAt(p[0] + dx, p[2] + dz);
  const hf = g(f.x * L, f.z * L), hb = g(-f.x * L, -f.z * L), hr = g(xa.x * W, xa.z * W), hl = g(-xa.x * W, -xa.z * W);
  const nq = new Q().setFromEuler(new E(0, Math.atan2(f.x, f.z), 0)).multiply(new Q().setFromEuler(new E(-Math.atan2(hf - hb, 2 * L), 0, Math.atan2(hr - hl, 2 * W))));
  return { ...pose, p: [p[0], (hf + hb + hr + hl) / 4 + 0.02, p[2]], q: nq.toArray() };
}
function fullPose(ent, t) { const pose = poseAt(ent, t); return isTruck(ent) && ent.params.follow && ent.keys.length && t < ent.params.airAt ? followPose(pose) : pose; }
function evaluateAll(t) {
  for (const ent of S.objects) if (ent.keys.length) applyPose(ent, fullPose(ent, t));
  for (const ent of S.objects) if (ent.root.userData.wheels) updateWheels(ent, t);
  for (const ent of S.objects) { if (ent.type === 'fence') updateFence(ent, t); else if (ent.type === 'road') updateRoad(ent); else if (ent.type === 'forest') updateForest(ent); }
  aimCamera();
  camHelper.update();
}
const rad = THREE.MathUtils.degToRad;
function liveUpdate(t) { // while frozen: only the slow residual motion, so nothing you edit is overwritten
  for (const ent of S.objects) { if (ent.root.userData.wheels) updateWheels(ent, t); if (ent.type === 'fence') updateFence(ent, t); }
}
function aimCamera() { // with Look at set, the camera aims at the object; Pan, Tilt and Roll then turn it from there
  const tgt = camEnt.params.lookAt && byId(camEnt.params.lookAt);
  if (!tgt) return;
  const v = new V3(); tgt.root.getWorldPosition(v); v.y += camEnt.params.lookY; shotCam.lookAt(v);
  const { pan = 0, tilt = 0, roll = 0 } = camEnt.params;
  shotCam.rotateY(rad(pan)); shotCam.rotateX(rad(tilt)); shotCam.rotateZ(rad(roll));
}
// Sway and push-in while frozen are applied only while drawing, then taken back, so the camera you edit never moves.
function applyDrift() {
  const amt = frozenAmount(), { drift, push } = camEnt.params;
  if ((!drift && !push) || amt < 0.01) return () => {};
  const p0 = shotCam.position.clone(), q0 = shotCam.quaternion.clone();
  const right = new V3(1, 0, 0).applyQuaternion(q0), fwd = new V3(0, 0, -1).applyQuaternion(q0);
  const tgt = camEnt.params.lookAt && byId(camEnt.params.lookAt); let maxPush = Infinity;
  if (tgt) { const v = new V3(); tgt.root.getWorldPosition(v); maxPush = p0.distanceTo(v) * 0.4; }
  const pushM = clamp(push * Math.min(S.frozenFor, 8), -maxPush, maxPush);
  shotCam.position.addScaledVector(right, Math.sin(S.frozenFor * 0.45) * drift * amt).addScaledVector(fwd, pushM);
  shotCam.updateMatrixWorld(true);
  return () => { shotCam.position.copy(p0); shotCam.quaternion.copy(q0); shotCam.updateMatrixWorld(true); };
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
  const br = byId(ent.params.breaker) || S.objects.find(isTruck);
  return JSON.stringify([ent.params, ent.keys, ent.keys.length ? 0 : [ent.root.position.toArray(), ent.root.quaternion.toArray()],
    br && [br.id, br.keys, br.params, br.keys.length ? 0 : br.root.position.toArray()],
    S.objects.filter(o => o.type === 'hill').map(h => [h.params, h.root.position.toArray(), h.root.scale.toArray()])]);
}
// Time when the truck's nose first crosses the fence line (the fence's local Z plane).
function findContact(ent, br) {
  const P = ent.params, fp = poseAt(ent, 0), n = new V3(0, 0, 1).applyQuaternion(new Q().fromArray(fp.q)), c = new V3(...fp.p);
  let prev = null;
  for (let t = 0; t <= S.duration + 1e-6; t += 0.005) {
    const ps = fullPose(br, t), f = new V3(0, 0, 1).applyQuaternion(new Q().fromArray(ps.q));
    const sd = new V3(...ps.p).addScaledVector(f, P.nose).sub(c).dot(n);
    if (prev !== null && Math.sign(sd) !== Math.sign(prev) && prev !== 0) return t;
    prev = sd;
  }
  return null;
}
function bakeFence(ent) {
  const pieces = ent.root.userData.pieces, P = ent.params, rnd = mulberry(P.seed * 9973);
  const br = byId(P.breaker) || S.objects.find(isTruck);
  const out = { sig: fenceSignature(ent), tracks: [], delays: [], lifts: [], axes: [], dirs: [] };
  if (!br) { out.tracks = pieces.map(() => null); out.lifts = pieces.map(() => 0); out.T = P.impact; return out; }
  const T = (P.auto && findContact(ent, br)) ?? P.impact; out.T = T;
  const pa = fullPose(br, T - 0.05).p, pb = fullPose(br, T + 0.05).p, pc = fullPose(br, T).p;
  const vT = new V3(...pb).sub(new V3(...pa)).multiplyScalar(10), tp = new V3(...pc);
  const fp = poseAt(ent, T);
  const M = new THREE.Matrix4().compose(new V3(...fp.p), new Q(...fp.q), new V3(...fp.s));
  const fq = new Q(...fp.q);
  ent.root.updateMatrixWorld();
  for (const m of pieces) {
    const wp = m.userData.rest.p.clone().applyMatrix4(M), wq = fq.clone().multiply(m.userData.rest.q);
    const lift = P.conform ? groundAt(wp.x, wp.z) - fp.p[1] : 0; wp.y += lift; out.lifts.push(lift);
    const d = Math.hypot(wp.x - tp.x, wp.z - tp.z);
    if (d > P.reach) { out.tracks.push(null); out.delays.push(0); out.axes.push(null); out.dirs.push(null); continue; }
    const f = clamp(1 - (d / P.reach) ** 2, 0.4, 1);
    const outDir = new V3(wp.x - tp.x, 0, wp.z - tp.z); if (outDir.lengthSq() < 1e-4) outDir.set(rnd() - 0.5, 0, rnd() - 0.5); outDir.normalize();
    const v = vT.clone().multiplyScalar(P.push * (0.7 + 0.3 * f))
      .addScaledVector(outDir, P.power * f * (0.5 + rnd()))
      .add(new V3((rnd() - 0.5) * P.power * 0.6, P.up * f * (0.5 + rnd() * 0.8), (rnd() - 0.5) * P.power * 0.6));
    const axis = new V3(rnd() - 0.5, rnd() - 0.5, rnd() - 0.5).normalize(), w = P.spin * f * (0.5 + rnd());
    const hy = Math.min(...m.userData.size) / 2 + 0.02; out.axes.push(axis.clone()); out.dirs.push(v.clone().normalize());
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
    out.tracks.push(buf); out.delays.push(d * 0.004);
  }
  return out;
}
const _ip = new V3(), _iq = new Q(), _iq2 = new Q(), _rq = new Q(), _qd = new Q(), _qs = new Q();
function updateFence(ent, t) {
  if (!ent.bake || ent.bake.sig !== fenceSignature(ent)) ent.bake = bakeFence(ent);
  const pieces = ent.root.userData.pieces, P = ent.params;
  ent.root.updateMatrixWorld();
  ent.root.getWorldQuaternion(_rq); _rq.invert();
  pieces.forEach((m, i) => {
    const tr = ent.bake.tracks[i], tau = (t - ent.bake.T - ent.bake.delays[i]) * SIM_FPS;
    if (!tr || tau <= 0) { m.position.copy(m.userData.rest.p); m.position.y += ent.bake.lifts[i] || 0; m.quaternion.copy(m.userData.rest.q); return; }
    const a = clamp(Math.floor(tau), 0, SIM_STEPS - 1), b = Math.min(a + 1, SIM_STEPS - 1), u = clamp(tau - a, 0, 1);
    _ip.set(tr[a * 7], tr[a * 7 + 1], tr[a * 7 + 2]).lerp(new V3(tr[b * 7], tr[b * 7 + 1], tr[b * 7 + 2]), u);
    _iq.set(tr[a * 7 + 3], tr[a * 7 + 4], tr[a * 7 + 5], tr[a * 7 + 6]);
    _iq2.set(tr[b * 7 + 3], tr[b * 7 + 4], tr[b * 7 + 5], tr[b * 7 + 6]); _iq.slerp(_iq2, u);
    if (S.frozenFor > 0 && ent.bake.axes[i]) { _iq.premultiply(_qd.setFromAxisAngle(ent.bake.axes[i], P.driftSpin * S.frozenFor)); _ip.addScaledVector(ent.bake.dirs[i], P.driftMove * S.frozenFor); }
    m.position.copy(ent.root.worldToLocal(_ip.clone())); m.quaternion.copy(_rq).multiply(_iq);
  });
}

/* ---------------- wheels, road, forest ---------------- */
const hillSig = () => S.objects.filter(o => o.type === 'hill').map(h => [h.params, h.root.position.toArray(), h.root.scale.toArray(), h.root.quaternion.toArray()]);
function pathPoints(br, until, step) { // the truck's route on the ground, one point every `step` metres
  const out = []; let acc = step, prev = null;
  for (let t = 0; t <= until + 1e-6; t += 0.02) {
    const p = fullPose(br, t).p; if (prev) acc += Math.hypot(p[0] - prev[0], p[2] - prev[2]);
    if (acc >= step) { out.push({ x: p[0], z: p[2] }); acc = 0; } prev = p;
  }
  return out;
}
function arcAt(ent, t) { // distance travelled by time t, for wheel roll
  if (!ent.keys.length) return 0;
  const sig = JSON.stringify([ent.keys, ent.params.follow, ent.params.airAt, S.duration, hillSig()]);
  if (!ent.arc || ent.arc.sig !== sig) {
    const n = Math.ceil(S.duration * 30) + 2, tbl = new Float32Array(n); let prev = fullPose(ent, 0).p;
    for (let i = 1; i < n; i++) { const p = fullPose(ent, i / 30).p; tbl[i] = tbl[i - 1] + Math.hypot(p[0] - prev[0], p[1] - prev[1], p[2] - prev[2]); prev = p; }
    ent.arc = { sig, tbl };
  }
  const tbl = ent.arc.tbl, x = clamp(t * 30, 0, tbl.length - 1.001), a = Math.floor(x);
  return tbl[a] + (tbl[a + 1] - tbl[a]) * (x - a);
}
function updateWheels(ent, t) { // wheels roll with the truck, and keep turning while time is frozen
  const dist = arcAt(ent, t) + Math.min(S.frozenFor, 30) * (ent.params.wheelSpin || 0);
  for (const w of ent.root.userData.wheels) w.obj.quaternion.copy(w.base).multiply(_qs.setFromAxisAngle(w.axis, dist / w.r));
}
function updateRoad(ent) {
  const br = byId(ent.params.breaker) || S.objects.find(isTruck);
  const sig = JSON.stringify([ent.params, br && [br.id, br.keys, br.params], hillSig()]);
  if (ent.built === sig) return; ent.built = sig;
  ent.root.children.slice().forEach(c => { ent.root.remove(c); c.geometry.dispose(); });
  if (!br || !br.keys.length) return;
  const pts = pathPoints(br, ent.params.until, 3); if (pts.length < 2) return;
  const pos = [], idx = [], w = ent.params.width / 2;
  pts.forEach((p, i) => {
    const a = pts[Math.max(0, i - 1)], b = pts[Math.min(pts.length - 1, i + 1)];
    let tx = b.x - a.x, tz = b.z - a.z; const l = Math.hypot(tx, tz) || 1; tx /= l; tz /= l;
    for (const sd of [1, -1]) { const x = p.x - tz * w * sd, z = p.z + tx * w * sd; pos.push(x, groundAt(x, z) + 0.06, z); }
    if (i) { const k = i * 2; idx.push(k - 2, k - 1, k, k - 1, k + 1, k); }
  });
  const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); g.setIndex(idx); g.computeVertexNormals();
  const m = new THREE.Mesh(g, new THREE.MeshStandardMaterial({ color: 0x3d3324, roughness: 1, flatShading: true, polygonOffset: true, polygonOffsetFactor: -2, side: THREE.DoubleSide }));
  m.receiveShadow = true; ent.root.add(m);
}
function updateForest(ent) { // trees and rocks scattered by seed, kept clear of the truck's route
  const P = ent.params, tr = S.objects.find(isTruck);
  const sig = JSON.stringify([P, tr && [tr.id, tr.keys, tr.params], hillSig(), S.duration]);
  if (ent.built === sig) return; ent.built = sig;
  ent.root.children.slice().forEach(c => { ent.root.remove(c); c.geometry.dispose(); });
  const path = tr && tr.keys.length ? pathPoints(tr, S.duration, 4) : [];
  const rnd = mulberry(P.seed * 7919), clear = (x, z, d) => path.every(p => Math.hypot(p.x - x, p.z - z) > d);
  const trees = [], rocks = [];
  for (let n = 0; trees.length < P.trees && n < P.trees * 12; n++) {
    const x = P.cx + (rnd() - 0.5) * P.width, z = P.cz + (rnd() - 0.5) * P.depth;
    if (clear(x, z, P.clear)) trees.push({ x, z, y: groundAt(x, z), s: 0.8 + rnd() * 0.9, r: rnd() * 6.28, c: rnd() });
  }
  for (let n = 0; rocks.length < P.rocks && n < P.rocks * 12; n++) {
    const x = P.cx + (rnd() - 0.5) * P.width, z = P.cz + (rnd() - 0.5) * P.depth;
    if (clear(x, z, P.clear * 0.7)) rocks.push({ x, z, y: groundAt(x, z), s: 0.4 + rnd() * rnd() * 2.6, r: rnd() * 6.28, c: rnd() });
  }
  const dummy = new THREE.Object3D(), col = new THREE.Color();
  const layer = (geo, list, base, yOff) => {
    const im = new THREE.InstancedMesh(geo, new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 1, flatShading: true }), Math.max(1, list.length));
    im.count = list.length;
    list.forEach((t, i) => { dummy.position.set(t.x, t.y + yOff * t.s, t.z); dummy.rotation.set(0, t.r, 0); dummy.scale.setScalar(t.s); dummy.updateMatrix(); im.setMatrixAt(i, dummy.matrix); col.set(base).offsetHSL(0, 0, (t.c - 0.5) * 0.08); im.setColorAt(i, col); });
    im.castShadow = im.receiveShadow = true; im.frustumCulled = false; ent.root.add(im);
  };
  layer(new THREE.BoxGeometry(0.35, 2.2, 0.35), trees, 0x4a3a28, 1.1);
  layer(new THREE.ConeGeometry(1.7, 2.6, 6), trees, 0x2f4a2a, 3.0);
  layer(new THREE.ConeGeometry(1.35, 2.4, 6), trees, 0x37562f, 4.3);
  layer(new THREE.ConeGeometry(0.95, 2.2, 6), trees, 0x3f6234, 5.5);
  layer(new THREE.IcosahedronGeometry(1, 0), rocks, 0x6d6a63, 0.3);
}

/* ---------------- transform gizmo, selection ---------------- */
const tc = new TransformControls(edCam, canvas);
scene.add(tc.getHelper());
tc.addEventListener('dragging-changed', e => { orbit.enabled = !e.value; });
tc.addEventListener('objectChange', () => {
  const ent = S.selected; if (!ent) return;
  if (S.autoKey) addKey(ent);
  else if (ent.keys.length) toast('Not keyed. Press K (or turn on Auto-key) or it snaps back when time moves.');
  if (ent.type === 'fence' || isTruck(ent)) evaluateAll(S.t);
  if (ent.id === 'cam') {
    if (ent.params.lookAt && S.mode === 'rotate') toast('The camera is aimed at an object. Use Pan, Tilt and Roll, or set Look at to Free aim.');
    aimCamera(); camHelper.update();
  }
  syncInspector(); markDirty();
});
const selBox = new THREE.BoxHelper(new THREE.Object3D(), 0xf0a202); selBox.visible = false; scene.add(selBox);
function select(ent) {
  S.selected = ent; S.selKey = null;
  if (ent && S.view === 'free' && !ent.noGizmo) { tc.attach(ent.root); } else tc.detach();
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
  if (TYPES[type].instant) { const e = createEntity(type); evaluateAll(S.t); select(e); rebuildTimeline(); markDirty(); return; }
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
  const i = numInput(ent.params[key], step, v => {
    ent.params[key] = clamp(v, min, max);
    if (ent.type === 'camera') {
      if (key === 'fov') { shotCam.fov = ent.params.fov; shotCam.updateProjectionMatrix(); }
      if (S.autoKey && ['pan', 'tilt', 'roll'].includes(key)) addKey(ent);
      else if (ent.keys.length && ['pan', 'tilt', 'roll', 'fov'].includes(key)) toast('Not keyed yet. Press K (or turn on Auto-key) to keep it.');
      aimCamera(); camHelper.update(); markDirty(); return;
    }
    if (ent.type === 'hill') rebuildHill(ent);
    evaluateAll(S.t); markDirty();
  });
  i.style.width = '100%'; return rowOf(label, i);
}
function boolRow(ent, key, label) {
  const i = document.createElement('input'); i.type = 'checkbox'; i.checked = !!ent.params[key];
  i.onchange = () => { ent.params[key] = i.checked; if (key === 'truck') renderInspector(); evaluateAll(S.t); markDirty(); };
  return rowOf(label, i);
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
    insp.append(section('Turn the camera'), paramRow(ent, 'pan', 'Pan (deg)', -180, 180, 1), paramRow(ent, 'tilt', 'Tilt (deg)', -90, 90, 1), paramRow(ent, 'roll', 'Roll (deg)', -180, 180, 1));
    const th = document.createElement('p'); th.className = 'hint'; th.textContent = 'Pan, Tilt and Roll work with Look at; press K to key them. With Free aim, turn the camera with the rotate gizmo (E).'; insp.append(th);
    insp.append(section('While frozen'));
    insp.append(paramRow(ent, 'drift', 'Sway (m)', 0, 5, 0.05), paramRow(ent, 'push', 'Push-in (m/s)', -2, 2, 0.02));
    const p = document.createElement('p'); p.className = 'hint'; p.textContent = 'Sway and push-in only run while time is frozen, so the picture stays alive.'; insp.append(p);
  }
  if (ent.type === 'fence') {
    insp.append(section('Break'));
    const sel = document.createElement('select'); sel.innerHTML = '<option value="">First truck</option>' + S.objects.filter(isTruck).map(o => `<option value="${o.id}">${o.name}</option>`).join('');
    sel.value = ent.params.breaker; sel.onchange = () => { ent.params.breaker = sel.value; evaluateAll(S.t); markDirty(); }; insp.append(rowOf('Hit by', sel));
    [['nose', 'Truck nose (m)', 0, 12, 0.25], ['impact', 'Impact (s), if not auto', 0, 60, 0.05], ['push', 'Push (x truck speed)', 0, 1.5, 0.05], ['power', 'Burst', 0, 30, 0.5], ['up', 'Lift', 0, 20, 0.5], ['spin', 'Spin', 0, 30, 0.5], ['reach', 'Reach (m)', 0.5, 20, 0.25], ['seed', 'Seed', 1, 9999, 1]]
      .forEach(a => insp.append(paramRow(ent, ...a)));
    insp.append(boolRow(ent, 'auto', 'Break on contact'), boolRow(ent, 'conform', 'Follow slope'));
    const hit = document.createElement('p'); hit.className = 'hint'; hit.textContent = ent.bake ? `Truck touches the fence at ${ent.bake.T.toFixed(2)} s.` : ''; insp.append(hit);
    insp.append(section('While frozen'), paramRow(ent, 'driftSpin', 'Pieces spin', 0, 3, 0.05), paramRow(ent, 'driftMove', 'Pieces drift', 0, 2, 0.02));
    const p = document.createElement('p'); p.className = 'hint'; p.textContent = 'The break is baked from the truck path. Move the truck keys and it re-bakes. Keep the fence still.'; insp.append(p);
  }
  if (ent.type === 'hill') { insp.append(section('Shape')); [['height', 'Height', 0, 40, 0.5], ['sigma', 'Width', 2, 40, 0.5], ['stretch', 'Length x', 0.5, 8, 0.1], ['bumps', 'Bumps', 0, 3, 0.1], ['corridor', 'Smooth lane', 0, 20, 0.5], ['seed', 'Seed', 1, 999, 1]].forEach(a => insp.append(paramRow(ent, ...a))); }
  if (ent.type === 'road') {
    insp.append(section('Road'));
    const sel = document.createElement('select'); sel.innerHTML = '<option value="">First truck</option>' + S.objects.filter(isTruck).map(o => `<option value="${o.id}">${o.name}</option>`).join('');
    sel.value = ent.params.breaker; sel.onchange = () => { ent.params.breaker = sel.value; evaluateAll(S.t); markDirty(); }; insp.append(rowOf('Follows', sel));
    insp.append(paramRow(ent, 'width', 'Width (m)', 1, 30, 0.5), paramRow(ent, 'until', 'Until (s)', 0.5, 60, 0.1));
    const p = document.createElement('p'); p.className = 'hint'; p.textContent = 'Drawn along the truck path. Change the truck keys and it follows.'; insp.append(p);
  }
  if (ent.type === 'forest') {
    insp.append(section('Forest and rocks'));
    [['trees', 'Trees', 0, 400, 5], ['rocks', 'Rocks', 0, 300, 5], ['clear', 'Clear lane (m)', 2, 40, 0.5], ['width', 'Width (m)', 10, 400, 5], ['depth', 'Depth (m)', 10, 400, 5], ['cx', 'Centre X', -300, 300, 5], ['cz', 'Centre Z', -300, 300, 5], ['seed', 'Seed', 1, 9999, 1]].forEach(a => insp.append(paramRow(ent, ...a)));
    const p = document.createElement('p'); p.className = 'hint'; p.textContent = 'Kept clear of the whole truck route. Change the seed for a different layout.'; insp.append(p);
  }
  if (isTruck(ent)) { insp.append(section('Drive'), boolRow(ent, 'follow', 'Follow ground'), paramRow(ent, 'airAt', 'Airborne at (s)', 0, 1000, 0.05), paramRow(ent, 'wheelSpin', 'Wheels frozen (m/s)', 0, 60, 1)); }
  if (ent.type === 'glb') insp.append(boolRow(ent, 'truck', 'Is the truck'));
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
function setTime(t) { S.t = t; if (S.freezeAt === null || t < S.freezeAt - 0.02) S.frozenFor = 0; evaluateAll(t); updateHead(); if (S.selected) syncInspector(); }

/* ---------------- playback clock ---------------- */
function timeScale(dt) {
  let s = 1;
  if (S.freezeAt !== null && S.t > S.freezeAt - S.ramp) s = clamp((S.freezeAt - S.t) / S.ramp, 0, 1);
  S.manualScale += ((S.manualFreeze ? 0 : 1) - S.manualScale) * clamp(dt * 7, 0, 1);
  return s * S.manualScale;
}
let last = performance.now();
const frozenAmount = () => {
  if (S.playing) return 1 - S.timeScale;
  if (S.manualFreeze) return 1 - S.manualScale;
  return S.freezeAt !== null && S.t >= S.freezeAt - 0.02 ? 1 : 0;
};
function frame(now) {
  const dt = Math.min(0.1, (now - last) / 1000); last = now;
  S.timeScale = S.playing || S.manualFreeze || S.freezeAt !== null ? timeScale(dt) : 1;
  if (S.playing) {
    if (S.timeScale < 0.003) S.timeScale = 0;
    S.t += dt * S.timeScale;
    if (S.t >= S.duration) { if (S.loop) { S.t = 0; S.frozenFor = 0; } else { S.t = S.duration; setPlaying(false); } }
  }
  const amt = frozenAmount();
  if (amt > 0.001) S.frozenFor = Math.min(S.frozenFor + dt * amt, 30);
  else if (!S.playing && S.frozenFor > 0) { S.frozenFor = 0; S.needEval = true; }
  if (S.playing) { evaluateAll(S.t); updateHead(); }
  else if (S.needEval) { evaluateAll(S.t); S.needEval = false; }
  else if (amt > 0.001) liveUpdate(S.t);
  if (S.selected && S.selected.id !== 'cam' && S.selected.root.children.length < 400) selBox.setFromObject(S.selected.root);
  orbit.update();
  render();
  requestAnimationFrame(frame);
}
const pipEl = $('#pip');
function render() {
  const w = stage.clientWidth, h = stage.clientHeight;
  if (canvas.width !== Math.floor(w * renderer.getPixelRatio()) || canvas.height !== Math.floor(h * renderer.getPixelRatio())) renderer.setSize(w, h, false);
  renderer.setScissorTest(false); renderer.setViewport(0, 0, w, h); renderer.clear();
  const shot = S.view === 'shot';
  const flags = () => { grid.visible = !shot; camHelper.visible = !shot; camBody.visible = !shot; tc.getHelper().visible = !shot && !!S.selected; selBox.visible = !shot && !!S.selected && S.selected.id !== 'cam'; };
  flags();
  if (shot) {
    let vw = w, vh = h; const asp = S.letterbox ? 2.39 : w / h;
    if (w / h > asp) vw = h * asp; else vh = w / asp;
    const x = (w - vw) / 2, y = (h - vh) / 2;
    shotCam.aspect = vw / vh; shotCam.updateProjectionMatrix();
    renderer.setViewport(x, y, vw, vh); renderer.setScissor(x, y, vw, vh); renderer.setScissorTest(true);
    const undo = applyDrift(); renderer.render(scene, shotCam); undo(); pipEl.hidden = true;
  } else {
    edCam.aspect = w / h; edCam.updateProjectionMatrix(); renderer.render(scene, edCam);
    pipEl.hidden = !S.pip;
    if (S.pip) { // what the shot camera sees, in a corner of the free view
      const pw = clamp(w * 0.3, 260, 560), ph = pw / (S.letterbox ? 2.39 : 16 / 9), m = 12;
      pipEl.style.cssText = `left:${w - pw - m}px;top:${h - ph - m}px;width:${pw}px;height:${ph}px`;
      grid.visible = false; camHelper.visible = false; camBody.visible = false; tc.getHelper().visible = false; selBox.visible = false;
      shotCam.aspect = pw / ph; shotCam.updateProjectionMatrix();
      renderer.setViewport(w - pw - m, m, pw, ph); renderer.setScissor(w - pw - m, m, pw, ph); renderer.setScissorTest(true);
      const undo = applyDrift(); renderer.render(scene, shotCam); undo(); renderer.setScissorTest(false);
      flags();
    }
  }
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
  if (v === 'shot') { tc.detach(); evaluateAll(S.t); } else if (S.selected && !S.selected.noGizmo) tc.attach(S.selected.root);
}
$('#snap').onchange = e => { tc.setTranslationSnap(e.target.checked ? 0.5 : null); tc.setRotationSnap(e.target.checked ? THREE.MathUtils.degToRad(15) : null); tc.setScaleSnap(e.target.checked ? 0.1 : null); };
$('#letterbox').onchange = e => { S.letterbox = e.target.checked; };
$('#pipOn').onchange = e => { S.pip = e.target.checked; };
$('#pip').onclick = () => setView('shot');
$('#resetBtn').onclick = () => { if (confirm('Replace the current scene with the new demo scene? Save first if you want to keep this one.')) resetScene(); };
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
function findWheels(root) { // nodes named wheel, tire or tyre roll about their local X axis
  const list = []; const walk = o => { if (/wheel|tire|tyre/i.test(o.name)) { const b = new THREE.Box3().setFromObject(o).getSize(new V3()); list.push({ obj: o, base: o.quaternion.clone(), axis: new V3(1, 0, 0), r: Math.max(0.1, Math.max(b.y, b.z) / 2) }); return; } o.children.forEach(walk); };
  walk(root); root.userData.wheels = list;
}
function serialize() {
  return {
    version: 2, duration: S.duration, freezeAt: S.freezeAt, ramp: S.ramp,
    entities: S.objects.map(o => ({
      id: o.id, type: o.type, name: o.name, params: o.params, file: o.file, keys: o.keys,
      pose: { p: o.root.position.toArray(), q: o.root.quaternion.toArray(), s: o.root.scale.toArray() },
    })),
  };
}
function clearScene() {
  S.objects.filter(o => o.id !== 'cam').forEach(o => scene.remove(o.root));
  S.objects = [camEnt]; S.selected = null; S.selKey = null; tc.detach(); S.nextId = 1;
  camEnt.keys = []; camEnt.params = { fov: 40, lookAt: '', lookY: 1.2, drift: 0, push: 0, pan: 0, tilt: 0, roll: 0 };
  S.freezeAt = null; S.manualFreeze = false; S.manualScale = 1; S.frozenFor = 0;
}
function resetScene() { clearScene(); defaultScene(); rebuildTimeline(); renderInspector(); setTime(0); markDirty(); }
function loadScene(data) {
  clearScene();
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
    const ent = createEntity('crate', { name: f.name.replace(/\.(glb|gltf)$/i, ''), root: g, file: f.name, params: { truck: false, follow: true, airAt: 1000, wheelSpin: 6 } }); ent.type = 'glb'; findWheels(g);
    const b = new THREE.Box3().setFromObject(g); toast(`Loaded ${f.name}: ${b.getSize(new V3()).toArray().map(v => v.toFixed(1)).join(' x ')} m. Add it to the site folder to publish.`);
    select(ent); rebuildTimeline(); markDirty();
  }, undefined, () => toast('Could not read that model.'));
  e.target.value = '';
};

/* ---------------- start ---------------- */
function defaultScene() { // a long hill, a fence near the crest, a clear road, a forest, and a truck at about 100 km/h
  const hill = createEntity('hill'); hill.root.position.set(0, 0, -20);
  const gy = (x, z) => groundAt(x, z);
  const fz = -8, fy = gy(0, fz);
  const truck = createEntity('truck'); truck.params.airAt = 2.4;
  const fence = createEntity('fence', { params: { impact: 2.4 } }); fence.root.position.set(0, fy, fz);
  const K = (t, x, y, z, pitch = 0) => ({ t, p: [x, y, z], q: new Q().setFromEuler(new E(pitch, Math.PI, 0)).toArray(), s: [1, 1, 1] });
  truck.keys = [K(0, 0, gy(0, 60) + 0.02, 60), K(1.2, 1.2, gy(1.2, 26) + 0.02, 26), K(2.4, 0, fy + 0.02, fz), K(3.3, 0, fy + 1.4, -33, 0.12), K(4.6, 0, fy + 0.6, -66, -0.2)];
  truck.root.position.fromArray(truck.keys[0].p);
  createEntity('road', { params: { until: 3 } });
  createEntity('forest');
  const I = new Q().toArray(), cx = 11, cz = 26;
  camEnt.keys = [
    { t: 0, p: [cx, gy(cx, cz) + 1.4, cz], q: I, s: [1, 1, 1], f: 42, c: [0, 0, 0] },
    { t: 2.55, p: [9, gy(9, 3) + 1.0, 3], q: I, s: [1, 1, 1], f: 32, c: [0, 0, 0] },
  ];
  camEnt.params.lookAt = truck.id; camEnt.params.lookY = 1.6; camEnt.params.drift = 0.3; camEnt.params.push = 0.05;
  S.freezeAt = 2.5; S.ramp = 0.5; S.duration = 7;
  $('#dur').value = S.duration; $('#ramp').value = S.ramp;
}
try { const saved = JSON.parse(localStorage.getItem(SAVE_KEY) || 'null'); if (saved && saved.version === 2) loadScene(saved); else defaultScene(); } catch (_) { defaultScene(); }
rebuildTimeline(); renderInspector(); setTime(S.t);
select(null);
requestAnimationFrame(frame);
window.ED = { S, TYPES, THREE, createEntity, addKey, setTime, select, setView, evaluateAll, serialize, loadScene, setPlaying, byId, edCam, orbit, shotCam, toggleFreeze, startSpawn };
