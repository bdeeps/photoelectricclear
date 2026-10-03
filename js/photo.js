// Shared parts for PhotoelectricClear: constants, the photoelectric equation, metals and semiconductors
// with sourced numbers, number formats, a colour for any wavelength, chart boards, glowing dots and the
// layout helpers every chapter uses. Boards and stage helpers follow WaveClear and CurrentClear so the
// physics boxes look alike. +x right, +y up, +z towards you.
import { THREE, M, box, canvasTexture, clamp } from './kit.js';

// ---------------------------------------------------------------- constants (exact since the 2019 SI)
export const H = 6.62607015e-34;        // J s, Planck constant (BIPM SI Brochure, 9th ed.)
export const QE = 1.602176634e-19;      // C, elementary charge; also joules in one electronvolt
export const C = 299792458;             // m/s
export const ME = 9.1093837e-31;        // kg, electron mass (CODATA 2018)
export const HC_EVNM = (H * C) / QE * 1e9;   // 1239.84 eV nm: photon energy in eV = 1239.84 ÷ wavelength in nm
export const H_OVER_E = H / QE;         // 4.1357 × 10⁻¹⁵ V s: the slope of Millikan's straight line
export const TAU = Math.PI * 2;

export const photonEv = (nm) => HC_EVNM / nm;
export const freqOf = (nm) => C / (nm * 1e-9);
export const nmOfEv = (ev) => HC_EVNM / ev;
// Speed of an electron with kinetic energy K eV (far below light speed here, so ½mv² is fine).
export const speedOf = (K) => Math.sqrt((2 * Math.max(0, K) * QE) / ME);

// Work functions in eV. CRC Handbook of Chemistry and Physics (2008, p. 12-124), as tabulated in
// Wikipedia "Work function". Where the handbook gives a range (it depends on the crystal face and on
// how clean the surface is) the model uses a value inside the range, and says so in the text:
// Cs 1.95, K 2.29, Na 2.75, Ca 2.87, Mg 3.66 (single values); Zn 3.63–4.9 (4.3 used),
// Cu 4.53–5.10 (4.7 used), Pt 5.12–5.93 (5.6 used).
export const METALS = {
  cs: { name: 'Caesium', sym: 'Cs', phi: 1.95, color: 0xd9c98a },
  k: { name: 'Potassium', sym: 'K', phi: 2.29, color: 0xc9ccd4 },
  na: { name: 'Sodium', sym: 'Na', phi: 2.75, color: 0xd6d8dc },
  zn: { name: 'Zinc', sym: 'Zn', phi: 4.3, color: 0x9aa6b4, range: '3.63–4.9' },
  cu: { name: 'Copper', sym: 'Cu', phi: 4.7, color: 0xc8773a, range: '4.53–5.10' },
  pt: { name: 'Platinum', sym: 'Pt', phi: 5.6, color: 0xe2e4e8, range: '5.12–5.93' },
};
// Band gaps at room temperature in eV (Sze, Physics of Semiconductor Devices; Kittel):
// Si 1.12, Ge 0.66, GaAs 1.42, CdS 2.42.
export const GAPS = {
  si: { name: 'Silicon', gap: 1.12 },
  ge: { name: 'Germanium', gap: 0.66 },
  gaas: { name: 'Gallium arsenide', gap: 1.42 },
  cds: { name: 'Cadmium sulphide', gap: 2.42 },
};

// The photoelectric equation for a vacuum phototube.
//   Kmax = hf − φ (Einstein 1905), stopping voltage Vs = Kmax ÷ e, threshold f₀ = φ ÷ h.
// How many electrons each photon frees (the quantum yield) is small for a clean metal, and near the
// threshold it grows as the square of the spare energy: Y ∝ (hf − φ)² (Fowler, Phys. Rev. 38, 45, 1931).
// With a retarding voltage Vr the same law gives a current ∝ (hf − φ − eVr)² (DuBridge 1933), so the
// current falls smoothly to zero exactly at Vr = Vs. The size of the yield, 1 electron per 10,000
// photons at 1 eV above threshold (capped at 1 per 500), is a typical order of magnitude for metals,
// not a property of any one surface. The model is the ideal textbook tube: it leaves out the contact
// potential between emitter and collector, which shifts a real tube's readings by a constant.
export const Y1 = 1e-4, YCAP = 2e-3;
export function tube(s) {
  const m = METALS[s.metal], E = photonEv(s.nm), f = freqOf(s.nm);
  const K = E - m.phi, on = K > 0;
  const photons = (s.mw * 1e-3) / (E * QE);                 // photons reaching the plate each second
  const yieldSat = on ? Math.min(YCAP, Y1 * K * K) : 0;
  const Isat = photons * yieldSat * QE;
  const Vr = Math.max(0, -s.volt);                           // retarding part of the collector voltage
  const pass = on ? (Vr >= K ? 0 : Math.pow((K - Vr) / K, 2)) : 0;
  return { m, E, f, K, on, photons, yieldSat, Isat, I: Isat * pass, pass, Vs: Math.max(0, K), f0: (m.phi * QE) / H, lam0: nmOfEv(m.phi), v: speedOf(K) };
}

// ---------------------------------------------------------------- colours of light
// Approximate colour of light of wavelength nm (380–750), after Dan Bruton's widely used piecewise fit.
export function nmColor(nm) {
  if (nm < 380) return 'rgb(190,150,255)';                  // ultraviolet: invisible, drawn pale violet
  if (nm > 750) return 'rgb(150,50,40)';                    // infrared: invisible, drawn dull red
  let r = 0, g = 0, b = 0;
  if (nm < 440) { r = -(nm - 440) / 60; b = 1; }
  else if (nm < 490) { g = (nm - 440) / 50; b = 1; }
  else if (nm < 510) { g = 1; b = -(nm - 510) / 20; }
  else if (nm < 580) { r = (nm - 510) / 70; g = 1; }
  else if (nm < 645) { r = 1; g = -(nm - 645) / 65; }
  else { r = 1; }
  let k = 1;
  if (nm < 420) k = 0.45 + (0.55 * (nm - 380)) / 40; else if (nm > 700) k = 0.45 + (0.55 * (750 - nm)) / 50;
  const c = (x) => Math.round(255 * Math.pow(clamp(x * k, 0, 1), 0.8));
  return `rgb(${c(r)},${c(g)},${c(b)})`;
}
export function colourName(nm) {
  if (nm < 10) return 'X-ray';
  if (nm < 380) return 'ultraviolet';
  if (nm < 450) return 'violet';
  if (nm < 495) return 'blue';
  if (nm < 570) return 'green';
  if (nm < 590) return 'yellow';
  if (nm < 620) return 'orange';
  if (nm <= 750) return 'red';
  if (nm < 1e6) return 'infrared';
  if (nm < 1e9) return 'microwave';
  return 'radio';
}

// ---------------------------------------------------------------- number formats
const SUP = { '-': '⁻', 0: '⁰', 1: '¹', 2: '²', 3: '³', 4: '⁴', 5: '⁵', 6: '⁶', 7: '⁷', 8: '⁸', 9: '⁹' };
export function sci(v, d = 1) {
  if (!v) return '0';
  let e = Math.floor(Math.log10(Math.abs(v))), m = v / Math.pow(10, e);
  if (+m.toFixed(d) >= 10) { m /= 10; e += 1; }
  return `${m.toFixed(d)} × 10${String(e).split('').map((c) => SUP[c]).join('')}`;
}
export const fmt0 = (v) => Math.round(v).toLocaleString('en-IN');
export const big = (v) => (v < 1e5 ? fmt0(v) : sci(v));
export function si(v, unit, sig = 3) {
  const a = Math.abs(v);
  if (!isFinite(v)) return '∞ ' + unit;
  if (a === 0) return '0 ' + unit;
  const pre = a >= 1e9 ? [1e9, 'G'] : a >= 1e6 ? [1e6, 'M'] : a >= 1e3 ? [1e3, 'k'] : a >= 1 ? [1, ''] : a >= 1e-3 ? [1e-3, 'm'] : a >= 1e-6 ? [1e-6, 'µ'] : a >= 1e-9 ? [1e-9, 'n'] : a >= 1e-12 ? [1e-12, 'p'] : [1e-15, 'f'];
  return `${+(v / pre[0]).toPrecision(sig)} ${pre[1]}${unit}`;
}
export const fmtEv = (e) => (e >= 1e6 ? `${+(e / 1e6).toPrecision(3)} MeV` : e >= 1e3 ? `${+(e / 1e3).toPrecision(3)} keV` : e >= 0.01 ? `${e.toFixed(2)} eV` : `${sci(e)} eV`);
export function fmtHz(f) {
  if (f >= 1e12) return `${sci(f, 2)} Hz`;
  if (f >= 1e9) return `${+(f / 1e9).toPrecision(3)} GHz`;
  if (f >= 1e6) return `${+(f / 1e6).toPrecision(3)} MHz`;
  return `${+(f / 1e3).toPrecision(3)} kHz`;
}
export function fmtLam(nm) {
  if (nm < 1) return `${+(nm * 1000).toPrecision(3)} pm`;
  if (nm < 1e3) return `${+nm.toPrecision(3)} nm`;
  if (nm < 1e6) return `${+(nm / 1e3).toPrecision(3)} µm`;
  if (nm < 1e7) return `${+(nm / 1e6).toPrecision(3)} mm`;
  if (nm < 1e9) return `${+(nm / 1e7).toPrecision(3)} cm`;
  return `${+(nm / 1e9).toPrecision(3)} m`;
}
export function fmtDur(s) {
  if (!isFinite(s)) return 'never';
  if (s < 1e-6) return `${+(s * 1e9).toPrecision(2)} ns`;
  if (s < 1e-3) return `${+(s * 1e6).toPrecision(2)} µs`;
  if (s < 1) return `${+(s * 1e3).toPrecision(2)} ms`;
  if (s < 120) return `${+s.toPrecision(2)} s`;
  if (s < 7200) return `${+(s / 60).toPrecision(2)} minutes`;
  if (s < 86400 * 2) return `${+(s / 3600).toPrecision(2)} hours`;
  if (s < 86400 * 730) return `${+(s / 86400).toPrecision(2)} days`;
  return `${big(+(s / 86400 / 365.25).toPrecision(2))} years`;
}

// ---------------------------------------------------------------- boards (live charts in 3D)
export const COL = { e: '#8ef0ff', light: '#ffe28a', volt: '#c49bff', hot: '#ff7a59', ok: '#5ce1a9', bad: '#ff5a8a', text: '#e8eef8', soft: 'rgba(255,255,255,.6)' };
export const HEX = { e: 0x8ef0ff, light: 0xffe28a, volt: 0xc49bff, hot: 0xff7a59, ok: 0x5ce1a9, bad: 0xff5a8a, hole: 0xff9a6b };
export function panelBg(g, w, h) { g.fillStyle = '#0b0d13'; g.fillRect(0, 0, w, h); g.strokeStyle = 'rgba(255,255,255,.14)'; g.lineWidth = 2; g.strokeRect(1, 1, w - 2, h - 2); }
export function board(root, w, h, pxW, pxH, draw, pos) {
  const tex = canvasTexture(pxW, pxH, draw);
  const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial({ map: tex.tex, toneMapped: false, side: THREE.DoubleSide }));
  m.position.set(...pos); root.add(m);
  return Object.assign(tex, { mesh: m });
}
// Boards are 640 px wide and shown small beside the model, so their type is large.
export function title(g, text, sub = '') {
  g.fillStyle = COL.text; g.font = 'bold 30px sans-serif'; g.fillText(text, 20, 40);
  if (sub) { const x = 34 + g.measureText(text).width; g.font = '21px sans-serif'; g.fillStyle = COL.soft; g.fillText(sub, x, 40); }
}
export function axes(g, w, h, { x0 = 92, x1 = w - 26, y0 = h - 70, y1 = 96, xMax, yMax, xMin = 0, yMin = 0, xTicks, yTicks, xFmt = String, yFmt = String, xLabel = '', yLabel = '', xLog = false, yLog = false }) {
  const X = xLog ? (x) => x0 + (Math.log(x / xMin) / Math.log(xMax / xMin)) * (x1 - x0) : (x) => x0 + ((x - xMin) / (xMax - xMin)) * (x1 - x0);
  const Y = yLog ? (y) => y0 - (Math.log(Math.max(y, yMin) / yMin) / Math.log(yMax / yMin)) * (y0 - y1) : (y) => y0 - ((y - yMin) / (yMax - yMin)) * (y0 - y1);
  g.strokeStyle = 'rgba(255,255,255,.12)'; g.lineWidth = 1; g.fillStyle = COL.soft; g.font = '22px sans-serif';
  for (const t of xTicks) { g.beginPath(); g.moveTo(X(t), y1); g.lineTo(X(t), y0); g.stroke(); const s = xFmt(t); g.fillText(s, X(t) - g.measureText(s).width / 2, y0 + 28); }
  for (const t of yTicks) { g.beginPath(); g.moveTo(x0, Y(t)); g.lineTo(x1, Y(t)); g.stroke(); const s = yFmt(t); g.fillText(s, x0 - 10 - g.measureText(s).width, Y(t) + 7); }
  g.strokeStyle = 'rgba(255,255,255,.4)'; g.lineWidth = 2; g.beginPath(); g.moveTo(x0, y1); g.lineTo(x0, y0); g.lineTo(x1, y0); g.stroke();
  g.fillStyle = 'rgba(255,255,255,.75)'; g.font = '21px sans-serif';
  if (xLabel) g.fillText(xLabel, x1 - g.measureText(xLabel).width, y0 + 58);
  if (yLabel) g.fillText(yLabel, x0 + 8, y1 - 10);
  return { X, Y, x0, x1, y0, y1 };
}
export function line(g, pts, X, Y, col, wdt = 4, dash = null) {
  if (pts.length < 2) return;
  g.strokeStyle = col; g.lineWidth = wdt; g.setLineDash(dash || []); g.lineJoin = 'round'; g.beginPath();
  pts.forEach(([x, y], i) => (i ? g.lineTo(X(x), Y(y)) : g.moveTo(X(x), Y(y))));
  g.stroke(); g.setLineDash([]);
}
export function curve(g, fn, a, b, X, Y, col, wdt = 4, dash = null, n = 200, log = false) {
  const pts = [];
  for (let i = 0; i <= n; i++) { const x = log ? a * Math.pow(b / a, i / n) : a + ((b - a) * i) / n; pts.push([x, fn(x)]); }
  line(g, pts, X, Y, col, wdt, dash);
}
export function dot(g, x, y, col, r = 10) { g.fillStyle = col; g.beginPath(); g.arc(x, y, r, 0, TAU); g.fill(); g.strokeStyle = '#fff'; g.lineWidth = 2; g.stroke(); }
export function text(g, s, x, y, col = COL.text, font = '22px sans-serif') { g.fillStyle = col; g.font = font; g.fillText(s, x, y); }
// A strip of the visible spectrum between pixel positions given by X(nm).
export function rainbow(g, X, y, hgt, a = 380, b = 750) {
  const xa = X(a), xb = X(b), gr = g.createLinearGradient(xa, 0, xb, 0);
  for (let i = 0; i <= 12; i++) gr.addColorStop(i / 12, nmColor(a + ((b - a) * i) / 12));
  g.fillStyle = gr; g.fillRect(Math.min(xa, xb), y, Math.abs(xb - xa), hgt);
}

// ---------------------------------------------------------------- 3D pieces
// n glowing spheres placed each frame with place(i, x, y, z, s); color(i, THREE.Color) tints one.
export function dots(n, r, color = 0xffffff, seg = 10) {
  const mat = new THREE.MeshBasicMaterial({ color, toneMapped: false });
  const mesh = new THREE.InstancedMesh(new THREE.SphereGeometry(r, seg, Math.max(4, seg - 3)), mat, n);
  mesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
  mesh.frustumCulled = false;
  const o = new THREE.Object3D();
  mesh.place = (i, x, y, z, s = 1) => { o.position.set(x, y, z); o.scale.setScalar(Math.max(0.0001, s)); o.updateMatrix(); mesh.setMatrixAt(i, o.matrix); };
  mesh.hide = (i) => mesh.place(i, 0, -80, 0, 0.0001);
  mesh.color = (i, c) => { mesh.setColorAt(i, c); };
  mesh.done = () => { mesh.instanceMatrix.needsUpdate = true; if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true; };
  for (let i = 0; i < n; i++) mesh.hide(i);
  return mesh;
}
// A small screen with text drawn on a canvas (a digital meter). set(big line, small line).
export function makeDisplay(w = 1, h = 0.6, color = '#8ef0ff') {
  const g = new THREE.Group();
  g.add(box(w, h, 0.16, M.plastic(0x1f232b, { roughness: 0.5 })));
  let a = '', b = '';
  const face = canvasTexture(320, 190, (c, W, Hh) => {
    c.fillStyle = '#0b0f14'; c.fillRect(0, 0, W, Hh);
    c.fillStyle = color; c.font = 'bold 60px monospace'; c.fillText(a, (W - c.measureText(a).width) / 2, 96);
    c.fillStyle = 'rgba(255,255,255,.7)'; c.font = '30px sans-serif'; c.fillText(b, (W - c.measureText(b).width) / 2, 152);
  });
  const m = new THREE.Mesh(new THREE.PlaneGeometry(w * 0.9, h * 0.84), new THREE.MeshBasicMaterial({ map: face.tex, toneMapped: false }));
  m.position.z = 0.081; g.add(m);
  let last = '';
  g.set = (x, y = '') => { const k = x + '|' + y; if (k === last) return; last = k; a = x; b = y; face.redraw(); };
  return g;
}
// A thin straight wire through points.
export function wire(points, r, mat) {
  const g = new THREE.Group(), up = new THREE.Vector3(0, 1, 0);
  for (let i = 1; i < points.length; i++) {
    const a = new THREE.Vector3(...points[i - 1]), b = new THREE.Vector3(...points[i]), len = a.distanceTo(b);
    if (len < 1e-4) continue;
    const m = new THREE.Mesh(new THREE.CylinderGeometry(r, r, len, 10), mat);
    m.position.copy(a).add(b).multiplyScalar(0.5); m.quaternion.setFromUnitVectors(up, b.clone().sub(a).normalize()); g.add(m);
    const j = new THREE.Mesh(new THREE.SphereGeometry(r, 10, 8), mat); j.position.copy(b); g.add(j);
  }
  return g;
}

// ---------------------------------------------------------------- layout
export const inReel = () => document.body.classList.contains('gb-reel');
// On a phone-width stage: hide the minor labels (the board sits under the model there, see placeBoard).
export function fitNarrow(stage, minor = [], shift = 0.01) {
  const narrow = stage.host.clientWidth < 560;
  minor.forEach((l) => { if (l) l.visible = !narrow; });
  const y = narrow && !inReel() ? shift : 0;
  if (!stage.shift || stage.shift[1] !== y) stage.setShift(0, y);
  return narrow;
}
// Boards sit beside the model on a wide screen, above it in the tall reel video, and under it on a
// phone (where the readout fills the top of the stage). Each placement is [position, rotationY, scale].
const PHONE = [[0, -1.25, 1.2], 0, 0.95], REEL = [[0, 7.4, 0], 0, 2];
export const isPhone = () => !inReel() && window.innerWidth < 560;
export function placeBoard(b, wide, reel = REEL, phone = PHONE) {
  const [p, r = 0, s = 1] = inReel() ? reel : isPhone() ? phone : wide;
  b.mesh.position.set(...p); b.mesh.rotation.set(0, r, 0); b.mesh.scale.setScalar(s);
}
// On a phone the readout keeps only its main rows: rows marked "row x" and small notes are dropped.
export const fit = (html) => (isPhone() ? html.replace(/<div class="row x">[\s\S]*?<\/div>\s*/g, '').replace(/<small>[\s\S]*?<\/small>/g, '') : html);
// Show one scene group of a chapter and fly the camera to it (not in the reel, which sets its own views).
export function focusSwitch(stage, groups, views) {
  let cur = '';
  return (id) => {
    if (id === cur) return false;
    cur = id;
    Object.entries(groups).forEach(([k, g]) => { g.visible = k === id; });
    if (!inReel() && views[id]) stage.setView(views[id].pos, views[id].target, 1.0);
    return true;
  };
}
// Hide a label together with its group (CSS2D labels ignore a parent's visibility on some paths).
export function showLabels(list, on) { list.forEach((l) => { if (l) l.visible = on; }); }
// Deterministic pseudo-random numbers so every run (and every video frame) looks the same.
export function rng(seed = 1) { let s = seed >>> 0; return () => { s = (s * 1664525 + 1013904223) >>> 0; return s / 4294967296; }; }
// A Poisson-distributed whole number with mean m (Knuth for small m, a normal approximation above 30).
export function poisson(m, rnd) {
  if (m <= 0) return 0;
  if (m > 30) { const u = Math.max(1e-9, rnd()), v = rnd(); return Math.max(0, Math.round(m + Math.sqrt(m) * Math.sqrt(-2 * Math.log(u)) * Math.cos(TAU * v))); }
  const L = Math.exp(-m); let k = 0, p = 1;
  do { k++; p *= rnd(); } while (p > L);
  return k - 1;
}

export { clamp, THREE, M, box };
