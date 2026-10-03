// Chapter 1: the photoelectric effect as a live experiment, in a vacuum phototube.
// Light of one wavelength shines on a clean metal plate (the emitter) inside an evacuated glass tube.
// Each photon carries E = hf = hc ÷ λ (1239.84 eV nm ÷ λ). If that beats the metal's work function φ,
// an electron can leave with at most Kmax = hf − φ (Einstein 1905). A collector plate catches the
// electrons; a microammeter reads the current. Make the collector negative and it pushes them back:
// the current reaches zero at the stopping voltage Vs = Kmax ÷ e. Plot Vs against f and every metal
// gives a straight line of slope h ÷ e = 4.136 × 10⁻¹⁵ V s (Millikan, Phys. Rev. 7, 355, 1916).
// Work functions: CRC Handbook values, see photo.js. Current: photons per second = power ÷ hf, times a
// small quantum yield that follows Fowler's law near threshold (see photo.js). Electron speeds in the
// readout are real (v = √(2K/m)); the dots are drawn far slower, with speed ∝ √K so faster is faster.
// The picture shows roughly one electron for every two photons; a real metal frees about one in
// 10,000, which is what the ammeter figure uses.
import { THREE, M, box, clamp, approach } from '../kit.js';
import {
  METALS, tube, photonEv, freqOf, nmColor, colourName, H, QE, H_OVER_E, sci, si, fmt0, COL, HEX,
  board, panelBg, title, axes, line, curve, dot, text, rainbow, dots, makeDisplay, wire, fitNarrow, placeBoard, fit, inReel, rng,
} from '../photo.js';

const YT = 2.2, XE = -1.8, XC = 1.8, GAP = XC - XE;
const LAMP = new THREE.Vector3(1.7, 4.2, 1.5), HIT = new THREE.Vector3(XE + 0.06, YT, 0);
const VS = 1.5;                               // drawn speed per √eV
const fmtNm = (v) => `${Math.round(v)} nm · ${colourName(v)} · ${photonEv(v).toFixed(2)} eV`;

export default {
  id: 'idea',
  short: 'The experiment',
  title: 'Light knocks electrons out of metal',
  subtitle: 'Change the colour, the brightness and the metal, and find the rule: E = hf − φ.',
  view: { pos: [0.1, 3.2, 8.8], target: [0.1, 2.9, 0] },
  learn: `<p>Shine light on a clean metal plate in a vacuum and <b>electrons fly out</b>. That is the <b>photoelectric effect</b>, first seen by Heinrich Hertz in 1887. A second plate catches the electrons, and a meter counts them as a tiny current.</p>
    <p>It sounds simple, but three things about it made no sense if light was only a wave:</p>
    <p><b>1. There is a threshold colour.</b> Below a certain <b>frequency</b>, no electrons come out at all, however bright the light. Red light on zinc does nothing, even from a searchlight.</p>
    <p><b>2. Colour sets the energy, brightness sets the number.</b> Bluer light gives faster electrons. Brighter light gives <b>more</b> electrons, but not faster ones.</p>
    <p><b>3. There is no wait.</b> Even very dim light frees electrons at once.</p>
    <p>In 1905 Albert Einstein explained all three with one idea: light arrives in packets, now called <b>photons</b>, each carrying energy <b>E = hf</b> (Planck's constant × frequency). One photon gives all its energy to one electron. The electron spends a fixed amount, the <b>work function φ</b>, getting out of the metal, and keeps the rest: <b>Kmax = hf − φ</b>. If hf is less than φ, nothing happens, and a brighter beam just sends more photons that are each too weak.</p>
    <p>To measure the electrons' energy, make the collector <b>negative</b>. It pushes them back. The voltage that just stops the fastest ones is the <b>stopping voltage</b>, and it equals Kmax in electronvolts. Plot it against frequency and you get a <b>straight line</b> whose slope is <b>h ÷ e</b>, the same for every metal. Robert Millikan measured exactly that in 1916.</p>
    <p class="tip"><b>Try it:</b> pick zinc and slide the colour from red to ultraviolet: nothing, nothing, then electrons. Go back below the threshold and turn the brightness right up. Then choose caesium, press <b>Find the stopping voltage</b>, record a point, change the colour and record again: your points fall on Millikan's line.</p>`,
  terms: [
    { t: 'Photon', d: 'One packet of light. Its energy is E = h × f, so bluer light has more energetic photons.' },
    { t: 'Work function (φ)', d: 'The least energy needed to pull an electron out of a metal surface: 1.95 eV for caesium, about 4.3 eV for zinc.' },
    { t: 'Threshold frequency', d: 'The lowest frequency of light that can free electrons from a given metal: f₀ = φ ÷ h.' },
    { t: 'Electronvolt (eV)', d: 'The energy an electron gains crossing 1 volt: 1.602 × 10⁻¹⁹ joules. Handy for single photons and electrons.' },
    { t: 'Stopping voltage', d: 'The reverse voltage that just stops the fastest electrons. In volts it equals Kmax in electronvolts.' },
    { t: 'Planck constant (h)', d: '6.626 × 10⁻³⁴ joule seconds: the number that links a photon’s energy to its frequency.' },
  ],
  defaults: { nm: 400, mw: 2, metal: 'cs', volt: 1, chart: 'line', pts: 0 },
  controls: [
    { key: 'nm', type: 'range', label: 'Colour of the light (wavelength)', min: 200, max: 750, step: 1, ends: ['200 nm ultraviolet', '750 nm deep red'], fmt: fmtNm },
    { key: 'mw', type: 'range', label: 'Brightness (light power on the plate)', min: 0, max: 5, step: 0.1, ends: ['dark', '5 mW'], fmt: (v) => `${v.toFixed(1)} mW` },
    { key: 'metal', type: 'seg', label: 'Metal of the emitter plate', options: Object.entries(METALS).map(([v, m]) => ({ v, label: m.sym })), fmt: (v) => `${METALS[v].name}, φ = ${METALS[v].phi} eV` },
    { key: 'volt', type: 'range', label: 'Collector voltage', min: -5, max: 5, step: 0.01, ends: ['−5 V pushes back', '+5 V pulls'], fmt: (v) => `${v > 0 ? '+' : v < 0 ? '−' : ''}${Math.abs(v).toFixed(2)} V` },
    { key: 'act', type: 'buttons', label: 'Measure like Millikan', items: [
      { label: 'Find the stopping voltage', act: (s) => { const T = tube(s); s.volt = T.on ? -Math.min(5, Math.ceil(T.Vs * 100) / 100) : 0; s.chart = 'line'; } },
      { label: 'Record a point', act: (s, inst) => { s.chart = 'line'; inst.record?.(s); } },
      { label: 'Clear points', act: (s, inst) => inst.clearPts?.() },
    ] },
    { key: 'chart', type: 'seg', label: 'Chart', options: [{ v: 'line', label: 'Stopping V vs frequency' }, { v: 'iv', label: 'Current vs voltage' }, { v: 'bright', label: 'Current vs brightness' }] },
  ],
  quiz: [
    { q: 'Red light of 700 nm (1.77 eV per photon) shines on zinc (work function about 4.3 eV). You make it 100 times brighter. What happens?', options: ['Electrons come out 100 times faster', 'Still no electrons', '100 times more electrons', 'Electrons come out after a delay'], answer: 1, why: 'Each photon has only 1.77 eV, less than the 4.3 eV needed. More photons that are each too weak still free nothing.' },
    { q: 'Violet light of 400 nm has photons of 3.10 eV. On caesium (φ = 1.95 eV), what is the stopping voltage?', options: ['3.10 V', '1.95 V', '1.15 V', '5.05 V'], answer: 2, why: 'Kmax = hf − φ = 3.10 − 1.95 = 1.15 eV, so 1.15 volts just stops the fastest electrons.' },
    { q: 'You plot stopping voltage against frequency for caesium and for sodium. How do the two lines compare?', options: ['Same slope, different starting frequency', 'Different slopes, same start', 'They are the same line', 'One is curved'], answer: 0, why: 'The slope is h ÷ e for every metal. Only the threshold changes, because each metal has its own work function.' },
  ],
  reel: [
    { ms: 5800, caption: 'Shine light on metal and electrons fly out, but only when each photon carries enough energy.', set: { metal: 'k', mw: 4, volt: 2, chart: 'line' }, anim: { nm: [720, 380] }, view: { pos: [0, 5.1, 6.9], target: [0, 4.8, 0] }, spin: 0 },
    { ms: 5600, caption: 'Bluer light gives faster electrons. The stopping voltage climbs in a straight line of slope h over e.', set: { metal: 'cs', mw: 4, volt: -0.6, chart: 'line' }, anim: { nm: [560, 230] }, view: { pos: [0, 5.1, 6.9], target: [0, 4.8, 0] }, spin: 0 },
  ],

  build({ stage }) {
    const root = new THREE.Group(); stage.root.add(root);
    const bench = box(6.4, 0.1, 2.2, M.matte(0x3a3f4b, { roughness: 0.7 })); bench.position.set(0, 0.05, 0); root.add(bench);

    // ---------------------------------------------------------------- the tube
    const glass = new THREE.Mesh(new THREE.CapsuleGeometry(0.95, 4.2, 10, 40), M.clear(0xcfe8ff, 0.13)); glass.rotation.z = Math.PI / 2; glass.position.y = YT; root.add(glass);
    const emitMat = M.metal(METALS.cs.color, { roughness: 0.35 });
    const emitter = new THREE.Mesh(new THREE.CylinderGeometry(0.62, 0.62, 0.07, 40), emitMat); emitter.rotation.z = Math.PI / 2; emitter.position.set(XE, YT, 0); emitter.castShadow = true; root.add(emitter);
    const collector = new THREE.Mesh(new THREE.CylinderGeometry(0.62, 0.62, 0.05, 40), M.metal(0xb9bec8)); collector.rotation.z = Math.PI / 2; collector.position.set(XC, YT, 0); root.add(collector);
    const wm = M.metal(0xc8773a, { roughness: 0.3 });
    for (const x of [XE - 0.04, XC + 0.03]) root.add(wire([[x, YT, 0], [x + Math.sign(x) * 0.9, YT, 0]], 0.03, wm));
    for (const x of [-1.5, 1.5]) { const st = box(0.5, YT - 1.05, 0.5, M.plastic(0x2a2e37)); st.position.set(x, (YT - 0.95) / 2 + 0.1, 0); root.add(st); }

    // circuit: emitter → supply → ammeter → collector
    const YW = 0.75;
    root.add(wire([[XE - 0.94, YT, 0], [-3.0, YT, 0], [-3.0, YW, 0.5], [-1.5, YW, 0.5]], 0.03, wm));
    root.add(wire([[-0.3, YW, 0.5], [0.4, YW, 0.5]], 0.03, wm));
    root.add(wire([[1.6, YW, 0.5], [3.0, YW, 0.5], [3.0, YT, 0], [XC + 0.93, YT, 0]], 0.03, wm));
    const supply = makeDisplay(1.2, 0.72, '#c49bff'); supply.position.set(-0.9, YW, 0.6); root.add(supply);
    const meter = makeDisplay(1.2, 0.72, '#8ef0ff'); meter.position.set(1.0, YW, 0.6); root.add(meter);

    // lamp
    const lamp = new THREE.Group(); lamp.position.copy(LAMP); root.add(lamp);
    const dir = HIT.clone().sub(LAMP).normalize(), L = HIT.distanceTo(LAMP);
    lamp.quaternion.setFromUnitVectors(new THREE.Vector3(0, -1, 0), dir);
    const hood = new THREE.Mesh(new THREE.CylinderGeometry(0.34, 0.26, 0.8, 32), M.plastic(0x23272f)); hood.position.y = 0.4; hood.castShadow = true; lamp.add(hood);
    const lensMat = new THREE.MeshBasicMaterial({ color: 0xffffff, toneMapped: false });
    const lens = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.3, 0.04, 32), lensMat); lamp.add(lens);
    const beamMat = M.ghost(0xffffff, 0.1);
    const beam = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.5, L, 32, 1, true), beamMat); beam.position.y = -L / 2; lamp.add(beam);

    // photons and electrons
    const NP = 70, NE = 70;
    const ph = dots(NP, 0.06, 0xffffff), el = dots(NE, 0.05, HEX.e); root.add(ph, el);
    const rnd = rng(7);
    const side = new THREE.Vector3(0, 0, 1), up2 = new THREE.Vector3().crossVectors(dir, side).normalize();
    const P = Array.from({ length: NP }, (_, i) => ({ t: rnd(), a: rnd() * Math.PI * 2, r: Math.sqrt(rnd()) }));
    const E = Array.from({ length: NE }, () => ({ on: false, x: 0, y: 0, z: 0, vx: 0, vy: 0, vz: 0, back: false }));
    const tmp = new THREE.Vector3(), colr = new THREE.Color();
    let flash = 0;
    const emit = (T, y, z) => {
      const e = E.find((q) => !q.on); if (!e) return;
      const Ek = T.K * (1 - Math.sqrt(rnd()));                // share reaching past Vr is ((K − Vr)/K)², as Fowler–DuBridge
      const ang = (rnd() - 0.5) * 0.5, ang2 = rnd() * Math.PI * 2, v = Math.max(0.12, VS * Math.sqrt(Ek));
      Object.assign(e, { on: true, x: XE + 0.08, y, z, vx: v * Math.cos(ang), vy: v * Math.sin(ang) * Math.cos(ang2), vz: v * Math.sin(ang) * Math.sin(ang2), back: false });
    };

    // ---------------------------------------------------------------- board
    let S = null, pts = [];
    const bd = board(root, 3.3, 2.31, 640, 448, (g, w, h) => {
      panelBg(g, w, h); if (!S) return;
      const T = tube(S), m = T.m;
      if (S.chart === 'line') {
        title(g, 'Stopping voltage vs frequency');
        const { X, Y, y0 } = axes(g, w, h, { xMax: 16, yMax: 5, xTicks: [0, 4, 8, 12, 16], yTicks: [0, 1, 2, 3, 4, 5], yFmt: (v) => v + ' V', xLabel: 'frequency (× 10¹⁴ Hz) →' });
        rainbow(g, (nm) => X(freqOf(nm) / 1e14), y0 - 14, 14);
        Object.entries(METALS).forEach(([k, mm]) => {
          const f0 = (mm.phi * QE) / H / 1e14, sel = k === S.metal, fEnd = Math.min(16, f0 + 5 / (H_OVER_E * 1e14));
          line(g, [[f0, 0], [fEnd, (fEnd - f0) * H_OVER_E * 1e14]], X, Y, sel ? COL.e : 'rgba(255,255,255,.3)', sel ? 6 : 2);
          if (sel) text(g, mm.sym, X(f0) - 12, y0 + 58, COL.e, 'bold 21px sans-serif');
        });
        pts.forEach((p) => { g.strokeStyle = '#fff'; g.lineWidth = 3; g.beginPath(); g.arc(X(p.f / 1e14), Y(p.V), 10, 0, Math.PI * 2); g.stroke(); });
        dot(g, X(T.f / 1e14), Y(clamp(T.Vs, 0, 5)), T.on ? COL.light : COL.bad, 10);
        const mine = pts.filter((p) => p.metal === S.metal);
        let note = 'slope = h ÷ e, the same for every metal', nc = COL.text;
        if (mine.length >= 2) {
          const n = mine.length, sx = mine.reduce((a, p) => a + p.f, 0), sy = mine.reduce((a, p) => a + p.V, 0), sxx = mine.reduce((a, p) => a + p.f * p.f, 0), sxy = mine.reduce((a, p) => a + p.f * p.V, 0);
          const den = n * sxx - sx * sx;
          if (den > 1e20) { note = `your points: h = ${sci(((n * sxy - sx * sy) / den) * QE, 2)} J s`; nc = COL.ok; }
        } else if (!T.on) { note = `${m.name}: below threshold, nothing`; nc = COL.bad; }
        text(g, note, 104, 82, nc, 'bold 23px sans-serif');
      } else if (S.chart === 'iv') {
        title(g, 'Current vs collector voltage');
        const top = Math.max(1e-9, tube({ ...S, mw: 5, volt: 5 }).Isat * 1.12);
        const { X, Y } = axes(g, w, h, { x0: 120, xMin: -5, xMax: 5, yMax: top, xTicks: [-5, -2.5, 0, 2.5, 5], yTicks: [0, top / 2, top], xFmt: (v) => v + ' V', yFmt: (v) => si(v, 'A', 2), xLabel: 'collector voltage →' });
        [[5, 'rgba(255,255,255,.3)'], [2.5, 'rgba(255,255,255,.3)'], [S.mw, COL.e]].forEach(([mw, col], i) => curve(g, (v) => tube({ ...S, mw, volt: v }).I, -5, 5, X, Y, col, i === 2 ? 6 : 2, null, 300));
        if (T.on) { g.strokeStyle = COL.volt; g.setLineDash([6, 6]); g.lineWidth = 2; g.beginPath(); g.moveTo(X(-T.Vs), Y(0)); g.lineTo(X(-T.Vs), Y(top * 0.5)); g.stroke(); g.setLineDash([]); text(g, `stops at −${T.Vs.toFixed(2)} V`, clamp(X(-T.Vs) - 150, 124, w - 230), Y(top * 0.55), COL.volt, 'bold 22px sans-serif'); }
        dot(g, X(S.volt), Y(T.I), COL.light, 10);
        text(g, T.on ? 'brighter: more current, same stop' : 'below threshold: no current at all', 128, 82, T.on ? COL.text : COL.bad, 'bold 23px sans-serif');
      } else {
        title(g, 'Current vs brightness');
        const top = Math.max(1e-9, tube({ ...S, mw: 5, volt: 5 }).Isat * 1.12);
        const { X, Y } = axes(g, w, h, { x0: 120, xMax: 5, yMax: top, xTicks: [0, 1, 2, 3, 4, 5], yTicks: [0, top / 2, top], yFmt: (v) => si(v, 'A', 2), xLabel: 'light power (mW) →' });
        curve(g, (mw) => tube({ ...S, mw }).I, 0, 5, X, Y, T.on ? COL.e : COL.bad, 6, null, 50);
        dot(g, X(S.mw), Y(T.I), COL.light, 10);
        text(g, T.on ? (T.pass > 0 ? 'twice the photons, twice the electrons' : 'the collector turns them all back') : 'flat at zero: photons too weak', 128, 82, T.on && T.pass > 0 ? COL.text : COL.bad, 'bold 23px sans-serif');
      }
    }, [3.2, 5.9, 0]);

    const lEm = stage.label('', [XE - 0.5, YT + 1.25, 0], root);
    const lCol = stage.label('collector', [XC + 0.9, YT - 1.2, 0.6], root);
    const lVac = stage.label('vacuum inside the glass', [0.2, YT + 0.78, 0.6], root);
    const lLamp = stage.label('', [LAMP.x + 0.2, LAMP.y - 0.75, LAMP.z], root, 'hot');
    const lState = stage.label('', [0, YT + 0.1, 0.9], root, 'hot');
    const lSup = stage.label('voltage supply', [-0.9, YW - 0.6, 0.6], root), lMet = stage.label('ammeter', [1.0, YW - 0.6, 0.6], root);

    let acc = 0, Ishow = 0, key = '';
    const api = {
      record(s) { const T = tube(s); if (!T.on) return; pts.push({ f: T.f, V: T.Vs, metal: s.metal }); if (pts.length > 24) pts.shift(); s.pts = pts.length; key = ''; },
      clearPts() { pts = []; key = ''; },
      update(dt, s, time) {
        dt = Math.max(0, dt); S = s;
        const narrow = fitNarrow(stage, [lVac, lSup, lMet, lCol, lEm, lLamp]);
        placeBoard(bd, [[3.2, 5.75, 0], -0.1, 1]);
        const T = tube(s), col = nmColor(s.nm);
        colr.set(col);
        lensMat.color.copy(colr).multiplyScalar(0.25 + 0.75 * clamp(s.mw / 5, 0, 1));
        beamMat.color.copy(colr); beamMat.opacity = 0.04 + 0.1 * clamp(s.mw / 5, 0, 1);
        beam.visible = s.mw > 0;
        emitMat.color.setHex(T.m.color);
        ph.material.color.copy(colr);

        // photons: a number in flight ∝ brightness; each one that lands may free an electron
        const n = Math.round(NP * clamp(s.mw / 5, 0, 1));
        for (let i = 0; i < NP; i++) {
          const p = P[i];
          if (i >= n) { ph.hide(i); continue; }
          p.t += (dt * 3.4) / L;
          if (p.t >= 1) {
            p.t -= 1; p.a = rnd() * Math.PI * 2; p.r = Math.sqrt(rnd());
            const yy = YT + p.r * 0.45 * Math.cos(p.a), zz = p.r * 0.45 * Math.sin(p.a);
            if (T.on && rnd() < 0.5) emit(T, yy, zz);
            else if (!T.on) flash = 1;
          }
          const sp = 0.3 + 0.18 * p.t;
          tmp.copy(LAMP).addScaledVector(dir, p.t * L).addScaledVector(side, Math.sin(p.a) * p.r * sp).addScaledVector(up2, Math.cos(p.a) * p.r * sp);
          ph.place(i, tmp.x, tmp.y, tmp.z, 1);
        }
        ph.done();

        // electrons: v² = v₀² + VS² × V × (x ÷ gap), so the collector voltage speeds them up or turns them back
        const ax = (VS * VS * s.volt) / (2 * GAP);
        let turned = 0;
        for (let i = 0; i < NE; i++) {
          const e = E[i];
          if (!e.on || !T.on) { e.on = false; el.hide(i); continue; }
          e.vx += ax * dt; e.x += e.vx * dt; e.y += e.vy * dt; e.z += e.vz * dt;
          if (e.vx < 0) { e.back = true; turned++; }
          const rr = Math.hypot(e.y - YT, e.z);
          if (e.x >= XC - 0.05 || e.x <= XE + 0.04 || rr > 0.85) { e.on = false; el.hide(i); continue; }
          el.place(i, e.x, e.y, e.z, 1);
        }
        el.done();
        flash = Math.max(0, flash - dt * 2);

        Ishow = T.I <= 0 ? 0 : approach(Ishow, T.I, 12, dt);
        meter.set(Ishow < 1e-13 ? '0 A' : si(Ishow, 'A', 3), 'current');
        supply.set(`${s.volt > 0 ? '+' : s.volt < 0 ? '−' : ''}${Math.abs(s.volt).toFixed(2)} V`, 'collector');

        lEm.element.innerHTML = `emitter: <b>${T.m.name.toLowerCase()}</b>, φ = ${T.m.phi} eV`;
        lLamp.element.style.setProperty('--c', s.nm < 380 || s.nm > 750 ? '#c9a8ff' : col);
        lLamp.element.innerHTML = `${Math.round(s.nm)} nm ${colourName(s.nm)}: <b>${T.E.toFixed(2)} eV</b> a photon`;
        const st = s.mw <= 0 ? ['lamp off', COL.soft] : !T.on ? [`no electrons: ${T.E.toFixed(2)} eV is less than ${T.m.phi} eV`, COL.bad] : T.pass <= 0 ? ['every electron is turned back', COL.volt] : s.volt < 0 ? ['only the fastest get across', COL.e] : ['electrons fly across', COL.e];
        lState.element.textContent = st[0]; lState.element.style.setProperty('--c', st[1]);
        lState.position.set(0, narrow ? YT + 1.3 : YT - 0.25, 0.9);

        const k = `${s.chart}|${s.nm}|${s.mw}|${s.metal}|${s.volt}|${pts.length}|${key}`;
        if (k !== api._k) { api._k = k; bd.redraw(); }
      },
      readout: (s) => fit(((s) => {
        const T = tube(s), m = T.m, ph = `${sci(T.photons)} photons/s`;
        const head = `<div class="row"><span>Light</span><b>${Math.round(s.nm)} nm ${colourName(s.nm)}, ${sci(T.f, 2)} Hz</b></div>
          <div class="row x"><span>${m.name}, φ = ${m.phi} eV</span><b>threshold ${Math.round(T.lam0)} nm</b></div>`;
        if (!T.on) return `<div class="big">hf = ${T.E.toFixed(2)} eV, below φ</div>${head}
          <div class="no">No electrons from ${ph}. Each photon is ${(m.phi - T.E).toFixed(2)} eV short, and brighter light only sends more of them.</div>`;
        return `<div class="big">Kmax = ${T.E.toFixed(2)} − ${m.phi} = ${T.K.toFixed(2)} eV</div>${head}
          <div class="row x"><span>Fastest electrons</span><b>${fmt0(T.v / 1000)} km/s</b></div>
          <div class="row"><span>Stopping voltage</span><b>${T.Vs.toFixed(2)} V</b></div>
          <div class="row"><span>Current</span><b>${T.I < 1e-13 ? '0 A' : si(T.I, 'A', 3)} from ${ph}</b></div>${T.pass <= 0 ? '<small>The collector is negative enough to turn back even the fastest electron.</small>' : ''}`;
      })(s)),
    };
    return api;
  },
};
