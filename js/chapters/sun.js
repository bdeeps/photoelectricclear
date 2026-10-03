// Chapter 4: silicon turning light into electricity. Two scenes.
// A solar cell does NOT use the photoelectric effect of chapter 1. No electron leaves the material.
// It uses the related PHOTOVOLTAIC effect (Becquerel 1839): inside a semiconductor a photon with at
// least the band-gap energy lifts an electron out of a bond, leaving a "hole"; the built-in electric
// field of a p–n junction pushes the electron one way and the hole the other, and that drives a current
// round an outside circuit. The threshold idea is shared: below the gap, nothing.
// "solar": silicon, band gap 1.12 eV, cut-off 1,107 nm. A photon with more than the gap still frees
//   only one electron; the extra energy becomes heat within about a picosecond. So of a photon of energy
//   E, at most Eg ÷ E can be banked. Summed over sunlight, modelled as a 5,772 K black body (the Sun's
//   effective temperature, IAU 2015 nominal value): 23 % of the power is infrared beyond the cut-off and
//   passes through, 33 % is lost as heat by over-energetic photons, and 44 % is left: the "ultimate
//   efficiency" of Shockley and Queisser (J. Appl. Phys. 32, 510, 1961). These three shares are worked
//   out here from Planck's law. After the other unavoidable losses the single-junction limit is about
//   33 %, and about 29.4 % for silicon (Wikipedia "Solar-cell efficiency"). The best laboratory silicon
//   cell in 2017 reached 26.6 %; a good rooftop panel today is about 21 % (commercial modules range to
//   just over 24 %). Standard test sunlight is 1,000 W/m². Panel area 1.7 m², a common 60-cell size.
//   One silicon cell gives roughly 0.6 V, so panels wire many in series.
// "pixel": a camera sensor's photosites are silicon photodiodes that store the freed electrons. For
//   visible light one absorbed photon frees one electron. Quantum efficiency is taken as 60 % (CCDs
//   "commonly respond to 70 percent of the incident light", Wikipedia "Charge-coupled device"; colour
//   filters cost some). The count is random (Poisson), so N electrons come with a noise of √N: that is
//   photon shot noise, and it is why dim pictures look grainy (see CameraClear's ISO chapter).
import { THREE, M, box, clamp, approach } from '../kit.js';
import {
  HC_EVNM, photonEv, nmColor, colourName, QE, H, C, sci, si, fmt0, big, COL, HEX,
  board, panelBg, title, axes, curve, line, dot, text, rainbow, dots, wire, makeDisplay, fitNarrow, placeBoard, fit, focusSwitch, showLabels, rng, poisson,
} from '../photo.js';
import { sceneB } from './count.js';

const EG = 1.12, LG = HC_EVNM / EG, KB = 1.380649e-23, TSUN = 5772;
const AREA = 1.7, EFF = 0.21, QEFF = 0.6;
const planck = (nm) => { const l = nm * 1e-9; return 1 / Math.pow(l, 5) / (Math.exp((H * C) / (l * KB * TSUN)) - 1); };
// Shares of a 5,772 K black body's power: beyond the cut-off, lost as heat, and left over.
const SHARE = (() => { let all = 0, below = 0, use = 0; for (let nm = 100; nm <= 20000; nm += 2) { const p = planck(nm); all += p; if (nm > LG) below += p; else use += (p * nm) / LG; } return { pass: below / all, use: use / all, heat: 1 - below / all - use / all }; })();
const PMAX = planck(502);
// Wavelengths drawn at random in proportion to the Sun's photon numbers (300 to 2,000 nm).
const CDF = (() => { const a = []; let t = 0; for (let nm = 300; nm <= 2000; nm += 10) { t += planck(nm) * nm; a.push([nm, t]); } return a.map(([nm, v]) => [nm, v / t]); })();
const sunNm = (u) => { for (const [nm, v] of CDF) if (u <= v) return nm; return 2000; };
export function cell(s) {
  const E = photonEv(s.nm), ok = E >= EG;
  return { E, ok, keep: ok ? EG / E : 0, heat: ok ? E - EG : 0, photons: s.wm2 / (E * QE), power: s.wm2 * AREA, out: s.wm2 * AREA * EFF };
}
const VIEWS = {
  solar: { pos: [0.1, 3.4, 9.0], target: [0.1, 2.9, 0] },
  pixel: { pos: [0.1, 5.2, 8.0], target: [0.1, 2.6, 0] },
};
const NX = 6, NZ = 4;

export default {
  id: 'sun',
  short: 'Solar cells and cameras',
  title: 'Solar cells and camera pixels',
  subtitle: 'A solar cell and a camera pixel free electrons inside silicon: a close cousin of the photoelectric effect.',
  view: VIEWS.solar,
  learn: `<p>People often say a solar panel works by the photoelectric effect. It is close, but not quite. In the photoelectric effect an electron is knocked <b>right out of a metal</b> into empty space. In a solar cell nothing leaves. The cell uses the related <b>photovoltaic effect</b>, found by Edmond Becquerel in 1839.</p>
    <p>A solar cell is a slice of silicon made in two layers that meet at a <b>p–n junction</b>. The junction has a built-in electric field. When a photon with at least silicon's <b>band gap</b> of <b>1.12 eV</b> is absorbed, it frees an electron and leaves behind a <b>hole</b>. The field pushes the electron to the top and the hole to the bottom. Join top and bottom with a wire and the electrons flow round through your fan or phone charger. That is the whole trick: no moving parts and no fuel.</p>
    <p>The photon rule still decides what the cell can use. <b>Infrared beyond 1,107 nm</b> has photons below the gap, so it passes through. A blue photon has far more than 1.12 eV, but it still frees only <b>one</b> electron, and the extra turns to heat. Those two losses alone leave silicon with at most about <b>44 %</b> of the Sun's energy. Real panels turn about 21 % into electricity.</p>
    <p>A solar <b>water heater</b> is different again: it simply soaks sunlight up as heat (see SolarHeaterClear). The little strip on a pocket calculator is a true solar cell (see CalculatorClear).</p>
    <p>A <b>camera sensor</b> uses the same freed electrons to count light. Each pixel is a tiny silicon well. During the exposure every absorbed photon adds one electron, and the camera reads the total. Photons arrive at random, so the count is never exact: collect 100 electrons and it wobbles by about 10. That wobble is the grain in a night photo (see CameraClear).</p>
    <p class="tip"><b>Try it:</b> in <b>Solar cell</b>, slide the colour past 1,107 nm and watch the photons fall straight through. Then switch on full sunlight. In <b>Camera pixel</b>, cut the light to a few photons per pixel and watch the picture turn to grain.</p>`,
  terms: [
    { t: 'Photovoltaic effect', d: 'Light producing a voltage and a current inside a material, as in a solar cell. Nothing is thrown out of the surface.' },
    { t: 'p–n junction', d: 'The boundary between two kinds of doped silicon. Its built-in field separates freed electrons from holes.' },
    { t: 'Hole', d: 'The gap left when an electron is freed. It moves through the crystal like a positive charge.' },
    { t: 'Band gap', d: 'The least photon energy silicon can use: 1.12 eV, which is light of 1,107 nm or shorter.' },
    { t: 'Efficiency', d: 'The share of the sunlight’s power that comes out as electricity: about 21 % for a good panel.' },
    { t: 'Shot noise', d: 'The random wobble in a count of photons. For N electrons it is about √N.' },
  ],
  defaults: { focus: 'solar', sun: false, nm: 500, wm2: 1000, photons: 300 },
  controls: [
    { key: 'focus', type: 'seg', label: 'Look at', options: [{ v: 'solar', label: 'Solar cell' }, { v: 'pixel', label: 'Camera pixel' }] },
    { key: 'sun', type: 'toggle', label: 'Solar cell: full sunlight (all colours)', hint: 'Off: light of one colour, chosen below.' },
    { key: 'nm', type: 'range', label: 'Solar cell: colour of the light', min: 300, max: 1500, step: 5, ends: ['300 nm ultraviolet', '1,500 nm infrared'], fmt: (v) => `${fmt0(v)} nm · ${colourName(v)} · ${photonEv(v).toFixed(2)} eV` },
    { key: 'wm2', type: 'range', label: 'Solar cell: strength of the light', min: 0, max: 1000, step: 10, ends: ['dark', 'noon sun, 1,000 W/m²'], fmt: (v) => `${fmt0(v)} W/m²` },
    { key: 'photons', type: 'log', label: 'Camera pixel: photons reaching each pixel', min: 1, max: 30000, ends: ['1, near darkness', '30,000, bright'], fmt: (v) => `${fmt0(+v.toPrecision(2))} per exposure` },
  ],
  onChange(s, key) { if (key === 'nm') { s.focus = 'solar'; s.sun = false; } if (key === 'sun' || key === 'wm2') s.focus = 'solar'; if (key === 'photons') s.focus = 'pixel'; },
  quiz: [
    { q: 'How does a solar cell differ from the photoelectric effect in a phototube?', options: ['It uses sound, not light', 'The freed electron stays inside the silicon and is steered by a junction, not thrown into a vacuum', 'It only works in ultraviolet', 'There is no difference at all'], answer: 1, why: 'A solar cell uses the photovoltaic effect inside a semiconductor junction. The two effects share the photon threshold idea, but no electron leaves the material.' },
    { q: 'A 2.5 eV blue photon is absorbed in silicon (gap 1.12 eV). What happens to its energy?', options: ['It frees two electrons', 'It frees one electron and about 1.4 eV becomes heat', 'It passes straight through', 'All 2.5 eV becomes electricity'], answer: 1, why: 'One photon frees one electron. Only the band gap’s worth, 1.12 eV, can be kept; the other 1.38 eV quickly warms the crystal.' },
    { q: 'A camera pixel collects 100 electrons on average. Roughly how much does the count wobble from shot to shot?', options: ['By about 1', 'By about 10', 'By about 50', 'Not at all'], answer: 1, why: 'Photon counts are random. The wobble is about √N, and √100 = 10, so the signal is only 10 times the noise.' },
  ],
  reel: [
    { ms: 5600, caption: 'A solar cell uses the related photovoltaic effect: light frees electrons inside silicon, and a junction steers them.', set: { focus: 'solar', sun: false, wm2: 1000 }, anim: { nm: [450, 1300] }, view: { pos: [0, 5.3, 7.4], target: [0, 5.0, 0] }, spin: 0 },
    { ms: 5200, caption: 'A camera pixel counts light the same way: one photon in, one electron stored.', set: { focus: 'pixel' }, anim: { photons: [3, 3000, true] }, view: { pos: [0, 6.6, 7.6], target: [0, 4.4, 0] }, spin: 0 },
  ],

  build({ stage }) {
    const root = new THREE.Group(); stage.root.add(root);
    const rnd = rng(23);

    // ================================================================ SOLAR CELL (a slice, hugely magnified)
    const So = new THREE.Group(); root.add(So);
    const W = 4.6, DZ = 1.5, Y0 = 1.0, YJ = 2.35, YTOP = 2.65;
    const back = box(W, 0.1, DZ, M.metal(0xb9bec8)); back.position.set(0, Y0 - 0.05, 0); So.add(back);
    const pLay = box(W, YJ - Y0, DZ, M.clear(0x3a4f86, 0.5)); pLay.position.set(0, (Y0 + YJ) / 2, 0); So.add(pLay);
    const nLay = box(W, YTOP - YJ, DZ, M.clear(0x4f8dff, 0.5)); nLay.position.set(0, (YJ + YTOP) / 2, 0); So.add(nLay);
    const junc = box(W, 0.03, DZ, M.glow(0xffffff, { transparent: true, opacity: 0.55 })); junc.position.set(0, YJ, 0); So.add(junc);
    for (const x of [-1.7, 0, 1.7]) { const f = box(0.16, 0.08, DZ, M.metal(0xd8dde6)); f.position.set(x, YTOP + 0.04, 0); So.add(f); }
    const bus = box(W, 0.08, 0.12, M.metal(0xd8dde6)); bus.position.set(0, YTOP + 0.04, -DZ / 2 + 0.06); So.add(bus);
    const wm = M.metal(0xc8773a, { roughness: 0.3 });
    const XW = W / 2 + 0.7, YL = 0.5;
    So.add(wire([[W / 2, YTOP + 0.04, -DZ / 2 + 0.06], [XW, YTOP + 0.04, -DZ / 2 + 0.06], [XW, YL, 0.5], [0.9, YL, 0.5]], 0.03, wm));
    So.add(wire([[-0.9, YL, 0.5], [-XW, YL, 0.5], [-XW, Y0 - 0.05, 0], [-W / 2, Y0 - 0.05, 0]], 0.03, wm));
    const load = makeDisplay(1.7, 0.66, '#5ce1a9'); load.position.set(0, YL, 0.6); So.add(load);
    const NP = 46, ph = dots(NP, 0.06, 0xffffff), el = dots(40, 0.05, HEX.e), ho = dots(40, 0.05, HEX.hole), heat = dots(40, 0.12, 0xff5030), ext = dots(24, 0.04, HEX.e);
    heat.material.transparent = true; heat.material.opacity = 0.55;
    So.add(ph, el, ho, heat, ext);
    const P = Array.from({ length: NP }, () => ({ x: 0, y: 99, z: 0, nm: 500, col: new THREE.Color(), through: false, on: false }));
    const Q = Array.from({ length: 40 }, () => ({ on: false, x: 0, z: 0, ye: 0, yh: 0, hot: 0, hy: 0, hs: 0 }));
    const solLabels = [
      stage.label('n-type silicon', [-W / 2 - 0.75, (YJ + YTOP) / 2 + 0.15, 0.6], So), stage.label('p-type silicon', [-W / 2 - 0.75, 1.6, 0.6], So),
      stage.label('the junction: a built-in field', [0.6, YJ - 0.38, 0.8], So), stage.label('back contact', [-1.4, Y0 - 0.38, 0.8], So),
    ];
    const lSol = stage.label('', [0, YTOP + 0.75, 0.8], So, 'hot'); solLabels.push(lSol);
    let spawnAcc = 0, flow = 0, flowPh = 0;
    const extPath = [[W / 2, YTOP + 0.04, -DZ / 2 + 0.06], [XW, YTOP + 0.04, -DZ / 2 + 0.06], [XW, YL, 0.5], [-XW, YL, 0.5], [-XW, Y0 - 0.05, 0], [-W / 2, Y0 - 0.05, 0]].map((p) => new THREE.Vector3(...p));
    const extLen = []; { let t = 0; extLen.push(0); for (let i = 1; i < extPath.length; i++) { t += extPath[i].distanceTo(extPath[i - 1]); extLen.push(t); } }
    const tv = new THREE.Vector3();
    const along = (d) => { const Lt = extLen[extLen.length - 1]; d = ((d % Lt) + Lt) % Lt; let i = 1; while (i < extLen.length - 1 && extLen[i] < d) i++; return tv.copy(extPath[i - 1]).lerp(extPath[i], (d - extLen[i - 1]) / (extLen[i] - extLen[i - 1])); };

    // ================================================================ CAMERA PIXELS
    const Px = new THREE.Group(); root.add(Px);
    const SPX = 0.86, base = box(NX * SPX + 0.3, 0.14, NZ * SPX + 0.3, M.plastic(0x1b2a22)); base.position.set(0, 0.93, 0); Px.add(base);
    const wells = [], fills = [];
    const wellMat = M.clear(0x9fc4ff, 0.14), fillMat = new THREE.MeshBasicMaterial({ color: HEX.e, toneMapped: false, transparent: true, opacity: 0.8 });
    for (let j = 0; j < NZ; j++) for (let i = 0; i < NX; i++) {
      const x = (i - (NX - 1) / 2) * SPX, z = (j - (NZ - 1) / 2) * SPX;
      const w = box(0.7, 1.3, 0.7, wellMat); w.position.set(x, 1.65, z); w.castShadow = false; Px.add(w); wells.push(w);
      const f = new THREE.Mesh(new THREE.BoxGeometry(0.6, 1, 0.6), fillMat); f.position.set(x, 1.0, z); Px.add(f); fills.push({ m: f, v: 0, to: 0 });
      const lens = new THREE.Mesh(new THREE.SphereGeometry(0.36, 20, 10, 0, Math.PI * 2, 0, Math.PI / 2), M.clear(0xe6f6ff, 0.3)); lens.scale.y = 0.45; lens.position.set(x, 2.3, z); Px.add(lens);
    }
    const pph = dots(60, 0.05, 0xfff1b0); Px.add(pph);
    const PP = Array.from({ length: 60 }, () => ({ x: (rnd() - 0.5) * NX * SPX, z: (rnd() - 0.5) * NZ * SPX, t: rnd() }));
    const pixLabels = [stage.label('one pixel: a silicon well', [-(NX / 2) * SPX + 0.9, 0.62, NZ * SPX / 2 + 0.2], Px), stage.label('microlens', [(NX / 2) * SPX + 0.6, 2.55, NZ * SPX / 2], Px)];
    const lPix = stage.label('', [0.6, 0.1, NZ * SPX / 2 + 0.6], Px, 'hot'); lPix.element.style.setProperty('--c', COL.e); pixLabels.push(lPix);
    const GW = 44, GH = 30, cv = document.createElement('canvas'); cv.width = GW; cv.height = GH;
    const cg = cv.getContext('2d');
    let frameAcc = 9, frameN = 0;
    const drawImg = (mean) => {
      const im = cg.createImageData(GW, GH), full = Math.max(3, mean + 3 * Math.sqrt(mean));
      for (let j = 0; j < GH; j++) for (let i = 0; i < GW; i++) { const b = sceneB((i + 0.5) / GW, 1 - (j + 0.5) / GH), c = poisson(mean * (0.25 + 0.75 * b), rnd), v = 255 * Math.pow(clamp(c / full, 0, 1), 0.8), q = (j * GW + i) * 4; im.data[q] = v; im.data[q + 1] = v; im.data[q + 2] = v; im.data[q + 3] = 255; }
      cg.putImageData(im, 0, 0);
    };

    // ================================================================ board
    let S = null, bkey = '';
    const bd = board(root, 3.3, 2.31, 640, 448, (g, w, h) => {
      panelBg(g, w, h); if (!S) return;
      if (S.focus === 'pixel') {
        const N = S.photons * QEFF;
        title(g, 'The picture these pixels make');
        g.imageSmoothingEnabled = false; g.drawImage(cv, 60, 62, 520, 300);
        text(g, `${big(+N.toPrecision(2))} electrons a pixel: signal ${(Math.sqrt(N)).toFixed(N < 100 ? 1 : 0)} × the noise`, 24, 404, COL.e, 'bold 23px sans-serif');
        text(g, N < 30 ? 'too few photons: grain' : N < 600 ? 'some grain in the shadows' : 'plenty of photons: clean', 24, 434, COL.soft, '21px sans-serif');
        return;
      }
      title(g, 'Sunlight and what silicon keeps');
      const { X, Y, y0 } = axes(g, w, h, { x0: 40, xMin: 250, xMax: 2000, yMax: 1.1, xTicks: [500, 1000, 1500, 2000], yTicks: [], xLabel: 'wavelength (nm) →' });
      const fillTo = (fn, a, b, col) => { g.fillStyle = col; g.beginPath(); g.moveTo(X(a), Y(0)); for (let nm = a; nm <= b; nm += 10) g.lineTo(X(nm), Y(fn(nm))); g.lineTo(X(b), Y(0)); g.closePath(); g.fill(); };
      const pl = (nm) => planck(nm) / PMAX;
      fillTo(pl, 250, LG, 'rgba(255,90,60,.6)'); fillTo((nm) => (pl(nm) * nm) / LG, 250, LG, 'rgba(92,225,169,.85)'); fillTo(pl, LG, 2000, 'rgba(160,170,190,.45)');
      curve(g, pl, 250, 2000, X, Y, '#fff', 2);
      rainbow(g, X, y0 - 10, 10);
      text(g, `kept ${Math.round(SHARE.use * 100)} %`, X(560), Y(0.16), '#06261a', 'bold 22px sans-serif');
      text(g, `heat ${Math.round(SHARE.heat * 100)} %`, X(500), Y(0.68), '#fff', 'bold 22px sans-serif');
      text(g, `passes through ${Math.round(SHARE.pass * 100)} %`, X(1180), Y(0.42), '#c9d2e3', 'bold 22px sans-serif');
      g.strokeStyle = COL.bad; g.setLineDash([6, 6]); g.lineWidth = 2; g.beginPath(); g.moveTo(X(LG), Y(0)); g.lineTo(X(LG), Y(0.75)); g.stroke(); g.setLineDash([]);
      text(g, 'gap: 1,107 nm', X(LG) + 8, Y(0.68), COL.bad, '21px sans-serif');
      if (!S.sun) { g.strokeStyle = COL.light; g.lineWidth = 4; g.beginPath(); g.moveTo(X(S.nm), Y(0)); g.lineTo(X(S.nm), Y(1.08)); g.stroke(); }
    }, [3.2, 5.9, 0]);

    const setFocus = focusSwitch(stage, { solar: So, pixel: Px }, VIEWS);
    return {
      update(dt, s, time) {
        dt = Math.max(0, dt); S = s;
        const isSol = s.focus !== 'pixel';
        setFocus(isSol ? 'solar' : 'pixel');
        const narrow = fitNarrow(stage, []);
        showLabels(solLabels, isSol); showLabels(pixLabels, !isSol);
        if (narrow) showLabels([solLabels[0], solLabels[1], solLabels[3], pixLabels[0], pixLabels[1]], false);
        placeBoard(bd, isSol ? [[3.2, 5.75, 0], -0.1, 1] : [[3.1, 4.9, -1.2], -0.1, 1.05], [[0, isSol ? 7.7 : 7.0, isSol ? 0 : -1.2], 0, 2], [[0, isSol ? -1.25 : -0.9, isSol ? 1.2 : 2.6], 0, 0.95]);

        if (isSol) {
          const T = cell(s), k = s.wm2 / 1000;
          // photons rain down; each is absorbed (pair + heat), or falls through if it is below the gap
          spawnAcc += dt * 14 * k;
          while (spawnAcc >= 1) {
            spawnAcc -= 1;
            const p = P.find((q) => !q.on); if (!p) break;
            p.nm = s.sun ? sunNm(rnd()) : s.nm; p.col.set(nmColor(p.nm));
            Object.assign(p, { on: true, through: false, x: (rnd() - 0.5) * (W - 0.4), y: 5.3, z: (rnd() - 0.5) * (DZ - 0.3) });
            p.depth = YTOP - 0.06 - Math.pow(clamp((p.nm - 350) / 760, 0, 1), 2) * 1.45;
          }
          let made = 0;
          P.forEach((p, i) => {
            if (!p.on) return ph.hide(i);
            p.y -= dt * 3.2;
            const E = photonEv(p.nm);
            if (E < EG) { if (p.y < 0.2) p.on = false; }
            else if (p.y <= p.depth) {
              p.on = false; made++;
              const q = Q.find((a) => !a.on);
              if (q) Object.assign(q, { on: true, x: p.x, z: p.z, ye: p.depth, yh: p.depth, hot: 1, hy: p.depth, hs: clamp((E - EG) / 1.6, 0.12, 1.3) });
            }
            if (p.on) { ph.place(i, p.x, p.y, p.z, E < EG && p.y < YTOP ? 0.7 : 1); ph.color(i, p.col); } else ph.hide(i);
          });
          ph.done();
          Q.forEach((q, i) => {
            if (!q.on) { el.hide(i); ho.hide(i); heat.hide(i); return; }
            q.ye += dt * 1.1; q.yh -= dt * 1.1; q.hot -= dt * 1.6;
            if (q.ye < YTOP + 0.02) el.place(i, q.x, q.ye, q.z + 0.1, 1); else el.hide(i);
            if (q.yh > Y0 + 0.02) ho.place(i, q.x, q.yh, q.z - 0.1, 1); else ho.hide(i);
            if (q.hot > 0) heat.place(i, q.x, q.hy, q.z, q.hs * (1.4 - q.hot)); else heat.hide(i);
            if (q.ye >= YTOP + 0.02 && q.yh <= Y0 + 0.02 && q.hot <= 0) q.on = false;
          });
          el.done(); ho.done(); heat.done();
          const use = s.sun ? 1 - SHARE.pass : T.ok ? 1 : 0;
          flow = approach(flow, k * use, 4, dt); flowPh += dt * flow * 2.4;
          const Lt = extLen[extLen.length - 1];
          for (let i = 0; i < 24; i++) { if (flow < 0.01) { ext.hide(i); continue; } const p = along(flowPh + (i / 24) * Lt); ext.place(i, p.x, p.y, p.z + 0.05, 1); }
          ext.done();
          load.set(s.sun ? `${fmt0(T.out)} W` : flow > 0.01 ? 'current' : '0 A', s.sun ? '1.7 m² panel' : 'through the load');
          lSol.element.style.setProperty('--c', !s.sun && !T.ok ? COL.bad : COL.light);
          lSol.element.textContent = s.wm2 <= 0 ? 'dark: nothing happens' : s.sun ? 'each photon frees one electron and one hole, or passes through' : T.ok ? `${T.E.toFixed(2)} eV photon: one electron, one hole${T.heat > 0.05 ? ', ' + T.heat.toFixed(2) + ' eV of heat' : ''}` : `${T.E.toFixed(2)} eV is below the gap: it passes through`;
          const key = `s|${s.sun}|${s.nm}`;
          if (key !== bkey) { bkey = key; bd.redraw(); }
        } else {
          const mean = s.photons * QEFF;
          frameAcc += dt;
          if (frameAcc > 0.7) {
            frameAcc = 0; frameN++;
            const full = Math.max(3, mean + 3 * Math.sqrt(mean));
            fills.forEach((f) => { f.to = clamp(poisson(mean, rnd) / full, 0, 1); f.v = 0; });
            drawImg(mean); bkey = '';
          }
          fills.forEach((f) => { f.v = approach(f.v, f.to, 6, dt); const hgt = Math.max(0.01, f.v * 1.25); f.m.scale.y = hgt; f.m.position.y = 1.0 + hgt / 2; });
          const n = Math.round(clamp(8 + 14 * Math.log10(s.photons), 6, 60));
          PP.forEach((p, i) => { if (i >= n) return pph.hide(i); p.t += dt * 0.9; if (p.t > 1) { p.t -= 1; p.x = (rnd() - 0.5) * NX * SPX; p.z = (rnd() - 0.5) * NZ * SPX; } pph.place(i, p.x, 4.9 - p.t * 2.6, p.z, 1); });
          pph.done();
          lPix.element.textContent = `about ${big(+mean.toPrecision(2))} electrons each, give or take ${Math.sqrt(mean).toFixed(mean < 100 ? 1 : 0)}`;
          const key = `p|${s.photons}|${frameN}`;
          if (key !== bkey) { bkey = key; bd.redraw(); }
        }
      },
      readout: (s) => fit(((s) => {
        if (s.focus === 'pixel') {
          const N = s.photons * QEFF, sn = Math.sqrt(N);
          return `<div class="big">${big(+N.toPrecision(2))} electrons, ± ${sn.toFixed(N < 100 ? 1 : 0)}</div>
            <div class="row"><span>Photons reaching the pixel</span><b>${fmt0(+s.photons.toPrecision(2))}</b></div>
            <div class="row x"><span>Each absorbed photon frees</span><b>1 electron</b></div>
            <div class="row x"><span>Share absorbed and counted</span><b>about 60 %</b></div>
            <div class="row"><span>Random wobble, √N</span><b>${sn.toFixed(N < 100 ? 1 : 0)} electrons</b></div>
            <div class="row x"><span>Signal ÷ noise</span><b>${sn.toFixed(N < 100 ? 1 : 0)}</b></div>`;
        }
        const T = cell(s);
        if (s.sun) return `<div class="big">${fmt0(T.out)} W from ${fmt0(T.power)} W of sun</div>
          <div class="row"><span>Infrared beyond 1,107 nm passes through</span><b>${Math.round(SHARE.pass * 100)} %</b></div>
          <div class="row"><span>Lost as heat by over-energetic photons</span><b>${Math.round(SHARE.heat * 100)} %</b></div>
          <div class="row x"><span>Left for silicon at best</span><b>${Math.round(SHARE.use * 100)} %</b></div>
          <div class="row"><span>A good rooftop panel delivers</span><b>about 21 %</b></div>
          <small>A 1.7 m² panel in ${fmt0(s.wm2)} W/m². Other losses bring silicon’s real ceiling to about 29 %.</small>`;
        const head = `<div class="row"><span>Light</span><b>${fmt0(s.nm)} nm ${colourName(s.nm)}</b></div>
          <div class="row x"><span>Silicon band gap</span><b>1.12 eV (1,107 nm)</b></div>`;
        if (!T.ok) return `<div class="big">${T.E.toFixed(2)} eV: below the gap</div>${head}
          <div class="no">These photons free nothing. Silicon is transparent to them, however strong the light.</div>`;
        return `<div class="big">${T.E.toFixed(2)} eV in, ${EG} eV kept</div>${head}
          <div class="row"><span>Lost as heat per photon</span><b>${T.heat.toFixed(2)} eV</b></div>
          <div class="row"><span>Most this colour can give</span><b>${Math.round(T.keep * 100)} % of its energy</b></div>
          <div class="row x"><span>Photons on each m² a second</span><b>${sci(T.photons)}</b></div>`;
      })(s)),
    };
  },
};
