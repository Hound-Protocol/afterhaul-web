# Tester's Field Manual
This is the hands-on manual for testing. It works for the website now and for the game when a test build exists. You do not need to code. Nothing in the game is playable yet, so the game sections (6 and 7) are a plan, not a record.

**Where it fits:**
- The [Quality Guide](HP-GDE-004-quality-testing.md) has your test rig, the kinds of tests and the bug report template.
- The [Quality Policy](HP-POL-006-quality-policy.md) has the severities (S1 to S4) and the release gates.
- [Reporting a Problem](HP-GDE-016-reporting-a-problem.md) says where reports go.

## 1. The testing loop
1. **Get the assignment:** a change to review, a release to sign off, or a feature to try.
2. **Read what changed:** the acceptance criteria and the changelog entry. Know what should happen before you look at what does happen.
3. **Write a charter** (section 3), one per thing you test.
4. **Test:** check what was promised first, then try to break it.
5. **Record** every run, including the ones that passed (section 8).
6. **Report** each problem once, then **retest** when the fix arrives.

## 2. Before you start
- **Note your rig:** browser and version, operating system, screen size. For the game, use the rig table in the Quality Guide.
- **Start clean:** use a private window, or clear the site's data. Do a hard refresh (Ctrl+Shift+R) so you test the new release, not a cached one.
- **Check the build:** the website version is on the page and in the changelog. It must match the release you were asked to test.
- **Open the browser console** (F12 → Console). Red errors count as findings even when the page looks fine.

## 3. Two ways of testing
**Confirm** what was promised. Go through the acceptance list one line at a time, and tick each line only after you have seen it yourself.

**Explore**, then **pinch**: use the feature like a curious, impatient, clumsy person would. Explore in short, focused sessions of 30 to 60 minutes, each with a charter:

```
Charter: Explore <feature> with <method or data> to find <kind of problem>
Build:   Site x.y.z · Rig: Firefox, Fedora, 1920×1080
Time:    45 min
Notes:   what you tried, in order, and what you saw
Found:   links to the reports
Not tested: what you ran out of time for
```

Example: *Explore the Handbook filter with odd input (empty, symbols, very long words) to find crashes or wrong results.*

## 4. The website: what to click
| Section | Check that | Pinch |
|---|---|---|
| **First screen** | Both hero buttons work. Section buttons fit on screen | Switch sections fast. The page must not jump or resize |
| **About** | Text and videos read well. A video loads only when played | Narrow the window to phone width |
| **Wiki** | Folders open. Documents open and close. Links between documents work | Open another document while one is still animating. Use Calm or reduced motion |
| **Wiki filter** | Name and Content modes find the right documents. Ctrl+K, **/**, Enter and Esc work | One letter, a word that is nowhere, 200 characters, `<b>x</b>` |
| **Handbook sheets** | Print opens the print dialog, or Ctrl+P works | Print to a PDF and check the A4 layout |
| **Roadmap** | Status filters work and counts match the data | Click filters quickly one after another |
| **Changelog** | Both logs open and scroll | Very fast scrolling |
| **Community, Press** | Links that should be closed are closed. The logo kit downloads | Every link and button |
| **Update notice** | A notice appears when a new build goes live while the page is open | Dismiss it, then switch sections |

## 5. The pinch list
Try these on anything new. Each line is a classic way software breaks.

**Input:** nothing at all, one character, very long text, emoji, other alphabets, spaces only, pasted text, HTML like `<script>`.

**Timing:** double-click, click twice quickly on two things, click while something is still loading or animating, press Esc halfway.

**Navigation:** Back and Forward, reload in the middle of an action, open the same page in two tabs, open a deep link cold, copy a link and open it in another browser.

**Screens:** phone width (DevTools → device toolbar), a very wide screen, browser zoom at 200 %, portrait and landscape on a phone.

**Accessibility:** keyboard only (Tab, Shift+Tab, Enter, Esc). Can you see where the focus is? Turn on reduced motion in your system settings: animations must stop or shorten.

**Network:** slow network (DevTools → Network → Slow 4G), offline after the page has loaded, ad blockers and privacy extensions on.

**Browsers:** Chromium (Chrome, Edge, Brave), Firefox, and Safari or another WebKit browser.

## 6. Benchmarking the website
Measure, so releases can be compared.

1. Open the site in Chrome or Edge, in a private window with no extensions.
2. DevTools → **Lighthouse**. Choose **Mobile**, categories **Performance** and **Accessibility**, then **Analyze page load**.
3. Run it **3 times** and keep the middle result.
4. Repeat for **Desktop**, and for the Wiki and Roadmap.
5. Write down the scores and these three numbers. The "good" limits are Google's Core Web Vitals:

| Number | What it means | Good |
|---|---|---|
| **LCP** (Largest Contentful Paint) | When the main content appears | 2.5 s or less |
| **CLS** (Cumulative Layout Shift) | How much things jump around while loading | 0.1 or less |
| **TBT** (Total Blocking Time) | How long the page cannot react | 200 ms or less |

**Animations:** DevTools → **Performance**, set CPU to **4× slowdown**, record 10 seconds on the Roadmap and while opening a document. Look for long red bars (slow frames).

**Compare:** put the numbers next to the previous release's. A drop of more than 10 points, or a Core Web Vital crossing its limit, is a finding (S3 normally, S2 if a page becomes hard to use).

## 7. The game (when a test build exists)
Not available yet. This is the plan.

**Safety first:** copy your save folder before every test day. Never attach secrets to a report.

**What to try, in order:**
1. **Install** a build on Windows, or on Linux through Proton ([Linux and Proton Guide](HP-GDE-002-linux-proton.md)). Every unclear step is a documentation bug.
2. **Smoke:** the game starts and the main menu appears.
3. **Drive:** start a truck, drive, stop, save and load.
4. **Sessions:** once sessions exist, host and join a crew, then leave and rejoin.
5. **Soak:** stay in one session for 2 hours and watch memory.

**Pinch the game:**
- Alt-Tab away for a minute. Unplug the network for 10 seconds, then plug it back in.
- Mix Windows and Proton players. Mix controller and keyboard.
- Mix very different frame rates and resolutions.
- Rejoin 10 times in a row.

**Benchmark the game:** use the same save, route and settings. Run 3 times for 90 seconds each. Record average FPS, the **1 % low** and any frame-time spikes over 50 ms. A smooth average with bad 1 % lows still feels like stutter.

| Platform | Tool |
|---|---|
| Linux / Proton | **MangoHud** with logging on |
| Windows | **PresentMon** or **CapFrameX** |

**Network (once sessions exist):** shape the network on a client, never on someone else's machine without asking, with **clumsy** on Windows or `tc netem` on Linux. The profiles below are suggested starting points, not tuned targets:

| Profile | Delay | Packet loss | Jitter |
|---|---|---|---|
| Good | 30 ms | 0 % | 5 ms |
| Typical | 80 ms | 1 % | 15 ms |
| Bad | 200 ms | 5 % | 40 ms |

## 8. Recording results
Write down every run, also the passes: "it worked" is a result.

```
Test:     <charter or checklist name>
Build:    game x.y.z · Site x.y.z
Rig:      <OS / Proton / browser / GPU>
Result:   Pass / Fail / Blocked
Numbers:  <Lighthouse scores, FPS avg / 1 % low>
Found:    <links to reports>
Not tested: <what and why>
```

- **Change review:** post it on the pull request ([Pull Request and Review](HP-SOP-002-pull-request-review.md)).
- **Release sign-off:** it goes into the release quality report ([Quality Policy](HP-POL-006-quality-policy.md)).

## 9. Pinch responsibly
- Test only our things: our website and our builds. Do not probe GitHub, Steam or other services themselves.
- Do not flood anything with scripts. A handful of quick clicks is a test. Thousands is an attack.
- Found a way to see what you should not, or to harm others? Stop, and tell the owner privately. Do not post it in public.
- Being slow or finding nothing is fine. Write down what you tried. That is useful too.
