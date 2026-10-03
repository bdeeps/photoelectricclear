// Chapter 2: the photoelectric effect used to catch single photons. Two scenes.
// "pmt": a photomultiplier tube. A photon frees one electron from the photocathode (the true
//   photoelectric effect: emission into a vacuum). A bialkali photocathode does this for about 1 photon
//   in 4 at its best colour (quantum efficiency about 25 %, Hamamatsu PMT Handbook, ch. 4). The electron
//   is pulled to a chain of dynodes, each about 100 V more positive than the last; each hit knocks out
//   δ secondary electrons, typically 4 to 5 (Wikipedia "Photomultiplier tube"). δ rises with the voltage
//   between stages roughly as V^0.75 (Hamamatsu: δ = a·E^k, k = 0.7 to 0.8); here δ = 4.5 × (V ÷ 100)^0.75.
//   Gain = δⁿ: ten stages at 100 V give 4.5¹⁰ = 3.4 million, twelve give 69 million, within the usual
//   10⁶ to 10⁸. Charge per pulse = gain × e. The real transit takes tens of nanoseconds; it is slowed here.
// "night": an image intensifier (night-vision goggles). Lens → photocathode → microchannel plate →
//   phosphor screen. Light gain up to about 30,000 with one plate (Wikipedia "Image intensifier").
//   The grain you see is real: so few photons arrive that each picture cell gets only a handful.
//   Photoelectrons per cell per frame are worked out from the light level: 1 lux of 555 nm light is
//   1 ÷ 683 W/m² = 4.1 × 10¹⁵ photons per m² per second; the scene reflects 30 %; an f/1.2 lens puts
//   ρ ÷ (4N²) of the scene's illuminance on the cathode; a cell is 20 µm square; a frame is 1/30 s;
//   the cathode's quantum efficiency is taken as 25 %. Light levels (Wikipedia "Lux"): clear moonless
//   night about 0.002 lux (0.001 used for starlight under trees), quarter moon about 0.01, full moon
//   0.05 to 0.3 (0.1 used).
import { THREE, M, box, clamp, approach } from '../kit.js';
import {
  QE, sci, si, fmt0, big, COL, HEX, board, panelBg, title, text, dots, fitNarrow, placeBoard, fit, focusSwitch, showLabels, rng, poisson,
} from '../photo.js';

const QEFF = 0.25;
export const delta = (V) => 4.5 * Math.pow(V / 100, 0.75);
export function pmt(s) {
  const n = Math.round(s.stages), d = delta(s.vstage), gain = Math.pow(d, n);
  const det = s.rate * QEFF;
  return { n, d, gain, det, q: gain * QE, I: det * gain * QE, hv: (n + 1) * s.vstage };
}
const LUX = { star: 0.001, quarter: 0.01, full: 0.1 }, LUXNAME = { star: 'starlight', quarter: 'a quarter moon', full: 'a full moon' };
const NV_GAIN = 30000;
export function night(s) {
  const lux = LUX[s.sky];
  const photons = 4.1e15 * lux;                               // per m² per second on the scene, as if all 555 nm
  const img = (photons * 0.3) / (4 * 1.2 * 1.2);              // per m² per second on the photocathode
  const cell = img * 400e-12 / 30;                            // photons per 20 µm cell per frame
  return { lux, photons, cell, pe: cell * QEFF };
}
// The scene the goggles look at: brightness 0..1 for a point (u across, v up, both 0..1).
export function sceneB(u, v) {
  let b = v > 0.42 ? 0.22 + 0.1 * (v - 0.42) : 0.12;                                 // sky and ground
  if (Math.hypot((u - 0.2) / 0.16, (v - 0.68) / 0.2) < 1 || (Math.abs(u - 0.2) < 0.025 && v > 0.3 && v < 0.6)) b = 0.04;   // a tree
  if (u > 0.62 && u < 0.9 && v > 0.36 && v < 0.62) b = 0.3;                           // a hut
  if (u > 0.58 && u < 0.94 && v >= 0.62 && v < 0.62 + 0.16 * (1 - Math.abs(u - 0.76) / 0.18)) b = 0.16;   // its roof
  if (u > 0.7 && u < 0.78 && v > 0.44 && v < 0.54) b = 1;                             // a lit window
  if (Math.hypot((u - 0.45) / 0.07, (v - 0.36) / 0.045) < 1 || (u > 0.4 && u < 0.5 && v > 0.26 && v < 0.34 && (Math.abs(u - 0.415) < 0.012 || Math.abs(u - 0.485) < 0.012)) || Math.hypot((u - 0.52) / 0.025, (v - 0.42) / 0.035) < 1) b = 0.55;   // a dog
  return b;
}
const GW = 44, GH = 30;
const VIEWS = {
  pmt: { pos: [0.1, 3.2, 8.8], target: [0.1, 2.9, 0] },
  night: { pos: [0.1, 3.2, 9.4], target: [0.1, 2.9, 0] },
};
const YT = 2.2;

export default {
  id: 'count',
  short: 'Counting photons',
  title: 'One photon, a million electrons',
  subtitle: 'Photomultipliers and night-vision goggles start with a single freed electron.',
  view: VIEWS.pmt,
  learn: `<p>If one photon frees one electron, then electrons can <b>count photons</b>. The trouble is that one electron is far too small a signal. The fix is to multiply it.</p>
    <p>A <b>photomultiplier tube</b> is the phototube from chapter 1 with a chain of extra plates called <b>dynodes</b>. Light lands on a thin <b>photocathode</b> just inside the glass, and about one photon in four frees an electron. A voltage pulls that electron hard into the first dynode, where the crash knocks out 4 or 5 more. Those are pulled to the next dynode, about 100 volts higher, and each knocks out 4 or 5 again. After ten stages the single electron has become <b>millions</b>, enough for ordinary electronics to hear as a click.</p>
    <p>At very low light the output is not a faint steady glow. It is <b>separate clicks</b>, one per photon caught. That is light arriving in packets, seen directly. Photomultipliers read the flashes in hospital gamma cameras and line the walls of giant neutrino detectors: Japan's Super-Kamiokande watches 50,000 tonnes of water with about 11,000 of them, each half a metre across.</p>
    <p><b>Night-vision goggles</b> do the same thing for a whole picture. A lens focuses the dim scene on a photocathode. Each freed electron enters one of millions of hair-thin glass channels in a <b>microchannel plate</b>, bounces down it multiplying as it goes, and the swarm hits a <b>phosphor screen</b> that glows green. The picture comes out tens of thousands of times brighter. It looks grainy because the light itself is grainy: under starlight each tiny patch of the picture gets only a photon or two per frame.</p>
    <p class="tip"><b>Try it:</b> turn the photon rate right down and watch the clicks separate. Add dynodes and see the gain jump. In <b>Night vision</b>, go from full moon to starlight and watch the grain appear.</p>`,
  terms: [
    { t: 'Photocathode', d: 'A thin light-sensitive layer that gives off electrons when photons hit it.' },
    { t: 'Quantum efficiency', d: 'The share of photons that produce an electron: about 25 % for a good photomultiplier cathode.' },
    { t: 'Dynode', d: 'A plate that gives off several electrons each time one hits it hard.' },
    { t: 'Secondary emission', d: 'Electrons knocked out of a surface by a fast electron, not by light.' },
    { t: 'Gain', d: 'How many electrons come out for each one that starts: δ multiplied by itself once per dynode.' },
    { t: 'Microchannel plate', d: 'A thin glass disc of millions of tiny tubes, each one a miniature electron multiplier.' },
  ],
  defaults: { focus: 'pmt', rate: 100, stages: 10, vstage: 100, sky: 'quarter' },
  controls: [
    { key: 'focus', type: 'seg', label: 'Look at', options: [{ v: 'pmt', label: 'Photomultiplier' }, { v: 'night', label: 'Night vision' }] },
    { key: 'rate', type: 'log', label: 'Photomultiplier: photons arriving each second', min: 1, max: 1e6, ends: ['1 a second', '1 million'], fmt: (v) => `${big(+v.toPrecision(2))} photons/s` },
    { key: 'stages', type: 'range', label: 'Photomultiplier: number of dynodes', min: 6, max: 14, step: 1, fmt: (v) => `${v} dynodes` },
    { key: 'vstage', type: 'range', label: 'Photomultiplier: volts between dynodes', min: 50, max: 150, step: 5, fmt: (v) => `${v} V, δ = ${delta(v).toFixed(1)}` },
    { key: 'sky', type: 'seg', label: 'Night vision: light on the scene', options: [{ v: 'star', label: 'Starlight' }, { v: 'quarter', label: 'Quarter moon' }, { v: 'full', label: 'Full moon' }], fmt: (v) => `${LUX[v]} lux` },
  ],
  onChange(s, key) { if (key === 'rate' || key === 'stages' || key === 'vstage') s.focus = 'pmt'; if (key === 'sky') s.focus = 'night'; },
  quiz: [
    { q: 'Each dynode turns 1 electron into 4. How many electrons leave after 10 dynodes?', options: ['40', 'About 1 million', '4,000', '10,000'], answer: 1, why: 'The gain multiplies at every stage: 4¹⁰ = 1,048,576, about a million.' },
    { q: 'A photomultiplier looks at a very dim light. What does its output look like?', options: ['A weak, perfectly steady current', 'Separate pulses, one for each photon caught', 'Nothing until the light gets brighter', 'A smooth wave'], answer: 1, why: 'Light arrives as photons. Each one that frees an electron gives one sharp pulse, with gaps in between.' },
    { q: 'Why does a night-vision picture look grainy under starlight?', options: ['The phosphor is cheap', 'The lens is dirty', 'So few photons arrive that each patch of the picture gets only one or two per frame', 'Green light is always grainy'], answer: 2, why: 'With a handful of photons per patch, the count jumps about from frame to frame. Multiplying the electrons cannot add photons that never came.' },
  ],
  reel: [
    { ms: 5600, caption: 'A photomultiplier turns one freed electron into millions: four or five more at every dynode.', set: { focus: 'pmt', rate: 20, vstage: 100 }, anim: { stages: [6, 12] }, view: { pos: [0, 4.6, 7.2], target: [0, 4.3, 0] }, spin: 0 },
    { ms: 5200, caption: 'Night-vision goggles do it for a whole picture. Under starlight the grain you see is single photons.', set: { focus: 'night', sky: 'full' }, anim: { sky: ['full', 'star'] }, view: { pos: [-0.6, 4.6, 7.4], target: [-0.6, 4.3, 0] }, spin: 0 },
  ],

  build({ stage }) {
    const root = new THREE.Group(); stage.root.add(root);
    const bench = box(7.2, 0.1, 2.2, M.matte(0x3a3f4b, { roughness: 0.7 })); bench.position.set(0, 0.05, 0); root.add(bench);
    const rnd = rng(11);

    // ================================================================ PHOTOMULTIPLIER
    const Pm = new THREE.Group(); root.add(Pm);
    const XK = -2.55, XA = 2.6, X0 = -1.85, X1 = 1.95, DY = 0.42;
    const glass = new THREE.Mesh(new THREE.CapsuleGeometry(0.95, 5.0, 10, 40), M.clear(0xcfe8ff, 0.12)); glass.rotation.z = Math.PI / 2; glass.position.y = YT; Pm.add(glass);
    const cath = new THREE.Mesh(new THREE.CylinderGeometry(0.8, 0.8, 0.04, 40), M.clear(0xe0b85a, 0.55, { depthWrite: true })); cath.rotation.z = Math.PI / 2; cath.position.set(XK, YT, 0); Pm.add(cath);
    const anode = new THREE.Mesh(new THREE.CylinderGeometry(0.5, 0.5, 0.05, 32), M.metal(0xc8773a)); anode.rotation.z = Math.PI / 2; anode.position.set(XA, YT, 0); Pm.add(anode);
    const dynMat = M.metal(0x9aa6b4, { roughness: 0.35 });
    const dyn = Array.from({ length: 14 }, () => { const d = box(0.34, 0.05, 0.7, dynMat); Pm.add(d); return d; });
    for (const x of [-1.9, 1.9]) { const st = box(0.5, YT - 1.05, 0.5, M.plastic(0x2a2e37)); st.position.set(x, (YT - 0.95) / 2 + 0.1, 0); Pm.add(st); }
    const dynPos = (i, n) => [X0 + ((X1 - X0) * i) / (n - 1), YT + (i % 2 ? DY : -DY)];
    let nNow = 0;
    const layDyn = (n) => { nNow = n; dyn.forEach((d, i) => { d.visible = i < n; if (i < n) { const [x, y] = dynPos(i, n); d.position.set(x, y, 0); d.rotation.z = i % 2 ? -0.5 : 0.5; } }); };
    const phot = dots(8, 0.07, 0x9fd0ff), elec = dots(150, 0.042, HEX.e); Pm.add(phot, elec);
    const OFF = Array.from({ length: 50 }, () => { const a = rnd() * Math.PI * 2, r = Math.sqrt(rnd()); return [Math.cos(a) * r, Math.sin(a) * r * 0.6, (rnd() - 0.5) * 2]; });
    const photons = [], aval = [];
    let nextPh = 0, first = true;                 // the first photon always frees an electron, so the scene opens with one avalanche
    const lCath = stage.label('photocathode', [XK - 0.1, YT + 1.25, 0], Pm), lAn = stage.label('anode', [XA + 0.3, YT + 1.25, 0], Pm);
    const lDyn = stage.label('', [0, YT - 1.25, 0.6], Pm), lCnt = stage.label('', [0, 0, 0], Pm, 'hot'); lCnt.element.style.setProperty('--c', COL.e);
    const lMiss = stage.label('', [XK - 0.9, YT - 0.75, 0.6], Pm, 'hot'); lMiss.element.style.setProperty('--c', COL.light);
    const pmLabels = [lCath, lAn, lDyn, lCnt, lMiss];

    // ================================================================ NIGHT VISION
    const Nv = new THREE.Group(); root.add(Nv);
    const XS = -3.35, XL = -1.95, XC = -1.05, XM = 0.1, XP = 1.25, XEY = 2.1;
    const cv = document.createElement('canvas'); cv.width = GW; cv.height = GH;
    const cg = cv.getContext('2d'), nvTex = new THREE.CanvasTexture(cv); nvTex.colorSpace = THREE.SRGBColorSpace; nvTex.magFilter = THREE.NearestFilter;
    const cv2 = document.createElement('canvas'); cv2.width = GW; cv2.height = GH;
    const cg2 = cv2.getContext('2d'), eyeTex = new THREE.CanvasTexture(cv2); eyeTex.colorSpace = THREE.SRGBColorSpace;
    const scenePanel = new THREE.Mesh(new THREE.PlaneGeometry(2.0, 1.36), new THREE.MeshBasicMaterial({ map: eyeTex, toneMapped: false })); scenePanel.position.set(XS, YT, 0); Nv.add(scenePanel);
    const frame1 = box(2.12, 1.48, 0.06, M.plastic(0x23272f)); frame1.position.set(XS, YT, -0.04); Nv.add(frame1);
    const lens = new THREE.Mesh(new THREE.SphereGeometry(0.62, 32, 16), M.glass()); lens.scale.set(0.22, 1, 1); lens.position.set(XL, YT, 0); Nv.add(lens);
    const body = new THREE.Mesh(new THREE.CylinderGeometry(0.85, 0.85, 3.3, 40, 1, true), M.clear(0x8fa0b8, 0.14)); body.rotation.z = Math.PI / 2; body.position.set(0.1, YT, 0); Nv.add(body);
    const slab = (x, t, mat, r = 0.72) => { const m = new THREE.Mesh(new THREE.CylinderGeometry(r, r, t, 40), mat); m.rotation.z = Math.PI / 2; m.position.set(x, YT, 0); Nv.add(m); return m; };
    slab(XC, 0.05, M.clear(0xe0b85a, 0.6, { depthWrite: true }));
    slab(XM, 0.22, M.metal(0x5d6470, { roughness: 0.6 }));
    const phosMat = new THREE.MeshBasicMaterial({ color: 0x48ff7a, toneMapped: false });
    slab(XP, 0.06, phosMat);
    const eyeLens = new THREE.Mesh(new THREE.SphereGeometry(0.5, 32, 16), M.glass()); eyeLens.scale.set(0.22, 1, 1); eyeLens.position.set(XEY, YT, 0); Nv.add(eyeLens);
    for (const x of [-0.9, 1.1]) { const st = box(0.5, YT - 0.95, 0.5, M.plastic(0x2a2e37)); st.position.set(x, (YT - 0.85) / 2 + 0.1, 0); Nv.add(st); }
    const outPanel = new THREE.Mesh(new THREE.PlaneGeometry(3.3, 2.25), new THREE.MeshBasicMaterial({ map: nvTex, toneMapped: false })); Nv.add(outPanel);
    const nvPh = dots(40, 0.05, 0xdfe8ff), nvE1 = dots(20, 0.035, HEX.e), nvE2 = dots(90, 0.03, HEX.e); Nv.add(nvPh, nvE1, nvE2);
    const NP = Array.from({ length: 40 }, () => ({ t: rnd(), y: (rnd() - 0.5) * 1.1, z: (rnd() - 0.5) * 0.9 }));
    const N1 = Array.from({ length: 20 }, () => ({ t: rnd(), y: (rnd() - 0.5) * 1.0, z: (rnd() - 0.5) * 0.9 }));
    const N2 = Array.from({ length: 90 }, () => ({ t: rnd(), y: (rnd() - 0.5) * 1.1, z: (rnd() - 0.5) * 1.0 }));
    const nvLabels = [
      stage.label('the scene, to the naked eye', [XS, YT - 1.0, 0], Nv), stage.label('lens', [XL, YT + 1.0, 0], Nv), stage.label('photocathode', [XC - 0.15, YT + 1.3, 0], Nv),
      stage.label('microchannel plate', [XM + 0.1, YT - 1.25, 0.6], Nv), stage.label('phosphor screen', [XP + 0.4, YT + 1.3, 0], Nv), stage.label('eyepiece', [XEY + 0.3, YT - 1.0, 0], Nv),
    ];
    const lOut = stage.label('what you see', [0, 0, 0], Nv, 'hot'); lOut.element.style.setProperty('--c', '#5cff8a'); nvLabels.push(lOut);
    let nvAcc = 1, lastSky = '';
    const drawEye = (lux) => {
      const im = cg2.createImageData(GW, GH), k = 18 + 60 * clamp(lux * 10, 0, 1);      // nearly black to the eye
      for (let j = 0; j < GH; j++) for (let i = 0; i < GW; i++) { const b = sceneB((i + 0.5) / GW, 1 - (j + 0.5) / GH), q = (j * GW + i) * 4; im.data[q] = 8 + b * k * 0.8; im.data[q + 1] = 9 + b * k * 0.9; im.data[q + 2] = 14 + b * k; im.data[q + 3] = 255; }
      cg2.putImageData(im, 0, 0); eyeTex.needsUpdate = true;
    };
    // Each new frame is blended with the fading glow of the last few, as the phosphor and your eye do.
    const glowBuf = new Float32Array(GW * GH);
    const drawNv = (pe) => {
      const m = pe * 2.5, im = cg.createImageData(GW, GH), full = Math.max(4, m * 1.6 + 3 * Math.sqrt(m * 1.6));      // the tube's automatic brightness control
      for (let j = 0; j < GH; j++) for (let i = 0; i < GW; i++) {
        const b = sceneB((i + 0.5) / GW, 1 - (j + 0.5) / GH), n = j * GW + i, c = (glowBuf[n] = glowBuf[n] * 0.6 + poisson(pe * b / 0.3, rnd)), v = Math.pow(clamp(c / full, 0, 1), 0.7), q = n * 4;
        im.data[q] = 20 + 150 * v * v; im.data[q + 1] = 18 + 237 * v; im.data[q + 2] = 20 + 110 * v * v; im.data[q + 3] = 255;
      }
      cg.putImageData(im, 0, 0); nvTex.needsUpdate = true;
    };

    // ================================================================ board: the anode signal
    let S = null, trace = [], traceKey = '';
    const bd = board(root, 3.3, 2.31, 640, 448, (g, w, h) => {
      panelBg(g, w, h); if (!S) return;
      const T = pmt(S);
      title(g, 'Signal at the anode');
      const x0 = 30, x1 = w - 30, y0 = h - 120, top = 110;
      g.strokeStyle = 'rgba(255,255,255,.35)'; g.lineWidth = 2; g.beginPath(); g.moveTo(x0, y0); g.lineTo(x1, y0); g.stroke();
      trace.forEach((p) => {
        const x = x0 + p.t * (x1 - x0);
        if (p.hit) { g.strokeStyle = COL.e; g.lineWidth = 4; g.beginPath(); g.moveTo(x, y0); g.lineTo(x, y0 - (y0 - top) * p.a); g.stroke(); }
        else { g.fillStyle = 'rgba(255,226,138,.55)'; g.fillRect(x - 2, y0 + 8, 4, 10); }
      });
      const win = 40 / S.rate;
      text(g, `${win >= 1 ? +win.toPrecision(2) + ' s' : win >= 1e-3 ? +(win * 1e3).toPrecision(2) + ' ms' : +(win * 1e6).toPrecision(2) + ' µs'} of signal`, x0, y0 + 48, COL.soft, '21px sans-serif');
      text(g, 'ticks: photons that freed nothing', x0, y0 + 78, 'rgba(255,226,138,.8)', '21px sans-serif');
      text(g, `each pulse: ${sci(T.gain)} electrons`, x0, 82, COL.e, 'bold 24px sans-serif');
    }, [3.2, 5.9, 0]);
    const newTrace = () => { trace = Array.from({ length: poisson(40, rnd) }, () => ({ t: rnd(), hit: rnd() < QEFF, a: 0.55 + 0.45 * rnd() })); };
    newTrace();

    const setFocus = focusSwitch(stage, { pmt: Pm, night: Nv }, VIEWS);
    let traceT = 0;
    return {
      update(dt, s, time) {
        dt = Math.max(0, dt); S = s;
        const isPm = s.focus !== 'night';
        setFocus(isPm ? 'pmt' : 'night');
        const narrow = fitNarrow(stage, []);
        showLabels(pmLabels, isPm); showLabels(nvLabels, !isPm);
        if (narrow) showLabels([lCath, lAn, nvLabels[1], nvLabels[5], nvLabels[0]], false);
        placeBoard(bd, [[3.2, 5.75, 0], -0.1, 1], [[isPm ? 0 : -0.6, 6.6, 0], 0, 2], [[isPm ? 0 : -0.4, -1.25, 1.2], 0, 0.95]);
        bd.mesh.visible = isPm;
        outPanel.position.copy(bd.mesh.position); outPanel.rotation.copy(bd.mesh.rotation); outPanel.scale.copy(bd.mesh.scale);
        lOut.position.set(bd.mesh.position.x, bd.mesh.position.y - 1.35 * bd.mesh.scale.x, 0.1);

        if (isPm) {
          const T = pmt(s);
          if (T.n !== nNow) layDyn(T.n);
          // a photon every 0.3 s of screen time; one in four frees an electron and starts an avalanche
          nextPh -= dt;
          if (nextPh <= 0) { nextPh = 0.3; photons.push({ x: XK - 2.6, y: YT + (rnd() - 0.5) * 0.8, hit: first || rnd() < QEFF }); first = false; }
          for (let i = photons.length - 1; i >= 0; i--) {
            const p = photons[i]; p.x += dt * 5;
            if (p.x >= XK) { if (p.hit && aval.length < 4) aval.push({ t: 0, y: p.y }); photons.splice(i, 1); }
          }
          for (let i = 0; i < 8; i++) { const p = photons[i]; if (p) phot.place(i, p.x, p.y, 0, 1); else phot.hide(i); }
          phot.done();
          const HOP = 0.26; let used = 0, lead = null;
          for (let a = aval.length - 1; a >= 0; a--) {
            const A = aval[a]; A.t += dt;
            const k = Math.floor(A.t / HOP), u = A.t / HOP - k;
            if (k > T.n) { aval.splice(a, 1); continue; }
            const from = k === 0 ? [XK, A.y] : dynPos(k - 1, T.n), to = k === T.n ? [XA, YT] : dynPos(k, T.n);
            const x = from[0] + (to[0] - from[0]) * u, y = from[1] + (to[1] - from[1]) * u;
            const count = Math.pow(T.d, k), show = Math.min(50, Math.max(1, Math.round(count))), spread = 0.03 + 0.03 * Math.sqrt(show);
            for (let j = 0; j < show && used < 150; j++, used++) elec.place(used, x + OFF[j][0] * spread, y + OFF[j][1] * spread, OFF[j][2] * 0.25 * Math.min(1, show / 12), 1);
            if (!lead || A.t > lead.t) lead = { t: A.t, x, y, count, k };
          }
          for (let i = used; i < 150; i++) elec.hide(i);
          elec.done();
          lCnt.visible = !!lead && !narrow;
          if (lead) { lCnt.position.set(lead.x, YT + 1.25, 0.3); lCnt.element.textContent = lead.k === 0 ? '1 electron' : `after dynode ${lead.k}: ${big(Math.round(lead.count))} electrons`; }
          lDyn.element.innerHTML = `${T.n} dynodes, each ${s.vstage} V above the last: <b>×${T.d.toFixed(1)}</b> a stage`;
          lMiss.element.textContent = 'photons';
          traceT += dt;
          const k2 = `${s.rate}|${T.n}|${s.vstage}`;
          if (traceT > 1.2 || k2 !== traceKey) { if (traceT > 1.2) { traceT = 0; newTrace(); } traceKey = k2; bd.redraw(); }
        } else {
          const N = night(s);
          if (s.sky !== lastSky) { lastSky = s.sky; drawEye(N.lux); nvAcc = 1; }
          nvAcc += dt;
          if (nvAcc > 0.1) { nvAcc = 0; drawNv(N.pe); }
          const nP = s.sky === 'star' ? 6 : s.sky === 'quarter' ? 16 : 40, nE = Math.max(2, Math.round(nP / 3));
          NP.forEach((p, i) => { if (i >= nP) return nvPh.hide(i); p.t = (p.t + dt * 0.5) % 1; const x = XS + 0.1 + (XC - XS - 0.1) * p.t, sq = x < XL ? 1 : 0.75; nvPh.place(i, x, YT + p.y * sq, p.z * sq, 1); });
          N1.forEach((p, i) => { if (i >= nE) return nvE1.hide(i); p.t = (p.t + dt * 0.9) % 1; nvE1.place(i, XC + (XM - 0.11 - XC) * p.t, YT + p.y * 0.8, p.z * 0.8, 1); });
          N2.forEach((p, i) => { if (i >= nE * 4.5) return nvE2.hide(i); p.t = (p.t + dt * 1.3) % 1; nvE2.place(i, XM + 0.12 + (XP - XM - 0.15) * p.t, YT + p.y * 0.8, p.z * 0.8, 1); });
          nvPh.done(); nvE1.done(); nvE2.done();
          phosMat.color.setRGB(0.16 + 0.1 * Math.sin(time * 23) * 0.2, 0.9, 0.38);
        }
      },
      readout: (s) => fit(((s) => {
        if (s.focus === 'night') {
          const N = night(s);
          return `<div class="big">${fmt0(NV_GAIN)}× brighter</div>
            <div class="row"><span>Light on the scene</span><b>${N.lux} lux, ${LUXNAME[s.sky]}</b></div>
            <div class="row x"><span>Photons on each m² a second</span><b>${sci(N.photons)}</b></div>
            <div class="row x"><span>Reaching one picture cell per frame</span><b>${N.cell < 10 ? N.cell.toFixed(1) : fmt0(N.cell)} photons</b></div>
            <div class="row"><span>Electrons freed (1 photon in 4)</span><b>${N.pe < 10 ? N.pe.toFixed(1) : fmt0(N.pe)} per cell</b></div>
            <small>${N.pe < 3 ? 'So few that the count jumps from frame to frame: that is the grain.' : 'Enough photons per cell for a smooth picture.'} Cell 20 µm, f/1.2 lens, 1/30 s frame.</small>`;
        }
        const T = pmt(s);
        return `<div class="big">Gain = ${T.d.toFixed(1)}<sup>${T.n}</sup> = ${sci(T.gain)}</div>
          <div class="row x"><span>Photons arriving</span><b>${big(+s.rate.toPrecision(2))} a second</b></div>
          <div class="row"><span>Caught by the cathode (25 %)</span><b>${big(+T.det.toPrecision(2))} a second</b></div>
          <div class="row"><span>Charge in each pulse</span><b>${si(T.q, 'C', 2)}</b></div>
          <div class="row x"><span>Average anode current</span><b>${si(T.I, 'A', 2)}</b></div>
          <div class="row x"><span>Supply voltage across the chain</span><b>about ${fmt0(T.hv)} V</b></div>`;
      })(s)),
    };
  },
};
