// Chapter 5: where the wave picture fails, where the simple photon rule bends, and a myth.
// "wait": the classical waiting time. If light were a smooth wave, an atom could only soak up the energy
//   falling on its own cross-section. With a catch radius of 0.1 nm (about one atom), light of intensity
//   I delivers I × π r² watts to it, so collecting potassium's work function of 2.29 eV would take
//   t = φ ÷ (I π r²): 12 seconds at 1 W/m², over three hours at 0.001 W/m². (The standard textbook
//   estimate, e.g. Young & Freedman, University Physics, ch. 38.) Measured: emission begins in under
//   3 × 10⁻⁹ s (Lawrence and Beams, Phys. Rev. 32, 478, 1928). In the photon picture the light is 400 nm
//   (3.10 eV) on a 1 cm² plate; photons per second = I × 10⁻⁴ ÷ hf, and the share that free an electron
//   uses the same yield as chapter 1 (about 1 in 15,000 here), so the first electron is expected after
//   1 ÷ (photons × yield) seconds: a matter of chance, not of saving up.
// "ladder": photon energy E = hf across the spectrum against the energies that matter: silicon's band
//   gap 1.12 eV, caesium's work function 1.95 eV, a carbon–carbon bond 3.6 eV (348 kJ/mol), zinc's work
//   function about 4.3 eV, and 13.6 eV to ionise a hydrogen atom. A photon of a 2.45 GHz microwave oven
//   carries 1.0 × 10⁻⁵ eV; however many there are, none can do what one ultraviolet photon does.
//   A dental or chest X-ray photon carries tens of keV.
// Limits of the simple rule, stated in the text: very intense lasers can make one electron absorb
// several photons at once (multiphoton emission, seen from the 1960s); a real tube's stopping voltage
// is shifted by the contact potential between its two metals; and the photoelectric effect alone does
// not strictly prove that light is made of particles (Lamb and Scully, 1969): the proof came from later
// experiments such as Compton scattering (1923) and photon antibunching (Kimble, Dagenais and Mandel, 1977).
import { THREE, M, box, sphere, clamp, approach } from '../kit.js';
import {
  METALS, HC_EVNM, H, QE, C, Y1, photonEv, nmColor, colourName, sci, si, fmt0, big, fmtEv, fmtHz, fmtLam, fmtDur, COL, HEX,
  board, panelBg, title, axes, dot, text, dots, fitNarrow, placeBoard, fit, focusSwitch, showLabels, rng,
} from '../photo.js';

const PHI = METALS.k.phi, R_ATOM = 1e-10, NM_W = 400, E_W = photonEv(NM_W);
export function wait(s) {
  const I = s.inten, tWave = (PHI * QE) / (I * Math.PI * R_ATOM * R_ATOM);
  const photons = (I * 1e-4) / (E_W * QE), y = Y1 * Math.pow(E_W - PHI, 2), eRate = photons * y;
  return { I, tWave, photons, y, eRate, tFirst: 1 / eRate };
}
const TARGETS = [
  { name: 'silicon', short: 'silicon gap', what: 'band gap', e: 1.12, color: 0x4f6fa8 },
  { name: 'caesium', short: 'caesium', what: 'work function', e: 1.95, color: 0xd9c98a },
  { name: 'a chemical bond', short: 'C–C bond', what: 'C–C bond', e: 3.6, color: 0x7be08c },
  { name: 'zinc', short: 'zinc', what: 'work function', e: 4.3, color: 0x9aa6b4 },
  { name: 'a hydrogen atom', short: 'ionise hydrogen', what: 'to ionise', e: 13.6, color: 0xff9a6b },
];
const PRESETS = [
  { label: 'FM radio', nm: 3e9 }, { label: 'Microwave oven', nm: (C / 2.45e9) * 1e9 }, { label: 'TV remote', nm: 940 }, { label: 'Red light', nm: 650 },
  { label: 'Violet light', nm: 400 }, { label: 'UV-B (sunburn)', nm: 300 }, { label: 'X-ray', nm: 0.02 },
];
const drawCol = (nm) => (nm < 10 ? 'rgb(200,230,255)' : nm > 1e6 ? 'rgb(255,140,90)' : nmColor(nm));
const VIEWS = {
  wait: { pos: [0.1, 3.3, 8.8], target: [0.1, 2.9, 0] },
  ladder: { pos: [0.1, 3.4, 9.6], target: [0.1, 2.9, 0] },
};

export default {
  id: 'limits',
  short: 'Limits and a myth',
  title: 'No waiting, and a microwave myth',
  subtitle: 'Where the wave picture fails, where the photon rule bends, and what power has to do with it.',
  view: VIEWS.wait,
  learn: `<p><b>The wait that never came.</b> A wave spreads its energy smoothly. An atom is tiny, so in dim light it would need time to collect enough energy to release an electron: seconds, hours, even months. Physicists looked for that delay. In 1928 Ernest Lawrence and Jesse Beams found that electrons appear in <b>less than 3 billionths of a second</b>, however dim the light. A photon delivers its whole packet to one electron in one go. Dim light does not mean weak photons, only <b>fewer</b> of them.</p>
    <p><b>Myth: more power means more punch.</b> A microwave oven pours out 1,000 watts. A UV lamp that can sunburn you gives a few watts. Yet the microwaves cannot free a single electron from a metal or break a single chemical bond, because each microwave photon carries about <b>0.00001 eV</b> and a bond needs about <b>3.6 eV</b>. Power counts the photons. <b>Frequency decides what each one can do.</b> Microwaves heat food by shaking water molecules, not by knocking atoms apart (see MicrowaveClear). Ultraviolet photons are few but each carries enough to damage the molecules in skin (see SkinClear).</p>
    <p><b>Where the simple rule bends.</b> E = hf − φ assumes one photon per electron. In an extremely intense laser beam an electron can absorb two or more photons at once, and then even red light frees electrons from a metal. This was seen in the 1960s, soon after lasers arrived. At the other end, X-ray photons carry tens of thousands of electronvolts. They eject electrons from deep inside atoms, which is how bone absorbs X-rays (see XRayClear), and at high energies they more often bounce off electrons instead, which is called Compton scattering.</p>
    <p><b>Does it prove photons exist?</b> It convinced almost everyone, and Einstein won the 1921 Nobel Prize for it (not for relativity). Strictly, the experiment can also be explained with quantum atoms and an ordinary light wave, as Willis Lamb and Marlan Scully showed in 1969. The firm proof that light itself comes in packets came from other experiments: Arthur Compton's X-ray scattering in 1923, and single-photon experiments from 1977 onward.</p>
    <p class="tip"><b>Try it:</b> in <b>The wait</b>, dim the light and compare what a wave predicts with what happens. In <b>Photon ladder</b>, jump from the microwave oven to UV-B and see which targets each photon can break.</p>`,
  terms: [
    { t: 'Time delay', d: 'The wait a wave theory predicts before electrons appear in dim light. None is found: under 3 nanoseconds.' },
    { t: 'Intensity', d: 'Light power falling on each square metre. It sets how many photons arrive, not how energetic each is.' },
    { t: 'Ionising radiation', d: 'Radiation whose photons each carry enough energy to tear electrons off atoms: far ultraviolet, X-rays and gamma rays.' },
    { t: 'Multiphoton emission', d: 'An electron absorbing two or more photons at once. It needs the enormous intensity of a pulsed laser.' },
    { t: 'Compton scattering', d: 'A photon bouncing off an electron like a ball, losing some energy: strong evidence that light comes in packets.' },
  ],
  defaults: { focus: 'wait', pic: 'wave', inten: 0.001, lam: (C / 2.45e9) * 1e9 },
  controls: [
    { key: 'focus', type: 'seg', label: 'Look at', options: [{ v: 'wait', label: 'The wait' }, { v: 'ladder', label: 'Photon ladder' }] },
    { key: 'pic', type: 'seg', label: 'The wait: picture of light', options: [{ v: 'wave', label: 'A smooth wave' }, { v: 'photon', label: 'Photons' }] },
    { key: 'inten', type: 'log', label: 'The wait: brightness of the light', min: 1e-6, max: 100, ends: ['a millionth of a W/m²', '100 W/m²'], fmt: (v) => `${v < 0.01 ? sci(v) : +v.toPrecision(2)} W/m²` },
    { key: 'lam', type: 'log', label: 'Photon ladder: wavelength', min: 0.01, max: 1e10, ends: ['0.01 nm X-ray', '10 m radio'], fmt: (v) => `${fmtLam(v)} · ${colourName(v)} · ${fmtEv(photonEv(v))}` },
    { key: 'pre', type: 'buttons', label: 'Photon ladder: jump to', items: PRESETS.map((p) => ({ label: p.label, act: (s) => { s.focus = 'ladder'; s.lam = p.nm; } })) },
  ],
  onChange(s, key) { if (key === 'pic' || key === 'inten') s.focus = 'wait'; if (key === 'lam') s.focus = 'ladder'; },
  quiz: [
    { q: 'Very dim violet light shines on potassium. According to experiment, how long before the first electrons can appear?', options: ['Hours, while atoms save up energy', 'Less than a few billionths of a second', 'About one second', 'Never'], answer: 1, why: 'Each photon hands its whole energy to one electron at once. Dim light sends fewer photons, so fewer electrons, but with no saving-up time.' },
    { q: 'A 1,000 W microwave oven and a 5 W ultraviolet lamp: which one’s photons can break a chemical bond of 3.6 eV?', options: ['The microwave, it has more power', 'Both', 'The ultraviolet lamp', 'Neither'], answer: 2, why: 'A UV photon carries 4 eV or more. A microwave photon carries about 0.00001 eV. Power only tells you how many photons there are.' },
    { q: 'With an ordinary lamp, red light frees no electrons from zinc. What can change that?', options: ['Waiting longer', 'A much bigger zinc plate', 'An extremely intense laser, where one electron can absorb several photons at once', 'Nothing at all, ever'], answer: 2, why: 'Einstein’s rule assumes one photon per electron. In very intense laser light, multiphoton absorption lets several small photons add up.' },
  ],
  reel: [
    { ms: 5600, caption: 'A wave would need hours to free an electron in dim light. Real electrons appear in billionths of a second.', set: { focus: 'wait', pic: 'photon' }, anim: { inten: [1, 0.0001, true] }, view: { pos: [0, 5.2, 7.2], target: [0, 4.9, 0] }, spin: 0 },
    { ms: 5600, caption: 'A 1,000 watt microwave oven cannot do what one ultraviolet photon can. Frequency decides.', set: { focus: 'ladder' }, anim: { lam: [(C / 2.45e9) * 1e9, 200, true] }, view: { pos: [0, 5.2, 8.2], target: [0, 4.9, 0] }, spin: 0 },
  ],

  build({ stage }) {
    const root = new THREE.Group(); stage.root.add(root);
    const rnd = rng(31);

    // ================================================================ THE WAIT
    const Wt = new THREE.Group(); root.add(Wt);
    const plate = box(5.2, 0.5, 1.6, M.metal(METALS.k.color, { roughness: 0.4 })); plate.position.set(0, 1.0, 0); Wt.add(plate);
    const NA = 9, atoms = [];
    for (let i = 0; i < NA; i++) {
      const x = -2.2 + i * 0.55, mat = new THREE.MeshStandardMaterial({ color: 0x8892a6, emissive: new THREE.Color(0, 0, 0), roughness: 0.4 });
      const a = sphere(0.2, mat, 20); a.position.set(x, 1.36, 0.2); Wt.add(a); atoms.push({ x, mat });
    }
    const fronts = Array.from({ length: 5 }, () => { const f = box(5.0, 0.05, 1.5, M.ghost(0xb48cff, 0.35)); Wt.add(f); return f; });
    const wph = dots(40, 0.06, 0xb48cff), wel = dots(30, 0.05, HEX.e); Wt.add(wph, wel);
    const WP = Array.from({ length: 40 }, () => ({ on: false, x: 0, y: 0, z: 0 })), WE = Array.from({ length: 30 }, () => ({ on: false, x: 0, y: 0, z: 0, vx: 0, vy: 0 }));
    const lWait = stage.label('', [0, 3.5, 0.6], Wt, 'hot'), lPlate = stage.label('potassium, φ = 2.29 eV', [0, 0.45, 0.9], Wt), lAtom = stage.label('', [1.6, 1.95, 0.5], Wt);
    const waitLabels = [lWait, lPlate, lAtom];
    let fill = 0, burst = 0, phAcc = 0, firstShown = 0;
    const popE = (x) => { const e = WE.find((q) => !q.on); if (e) Object.assign(e, { on: true, x, y: 1.6, z: 0.2, vx: (rnd() - 0.5) * 1.6, vy: 1.6 + rnd() * 1.4 }); };

    // ================================================================ PHOTON LADDER
    const Ld = new THREE.Group(); root.add(Ld);
    const src = box(0.7, 0.4, 0.5, M.plastic(0x23272f)); src.position.set(1.5, 4.45, 0); Ld.add(src);
    const lph = dots(60, 0.055, 0xffffff), lel = dots(40, 0.045, HEX.e); Ld.add(lph, lel);
    const tg = TARGETS.map((t, i) => {
      const x = -3.4 + i * 1.7;
      const ped = box(1.0, 0.7, 1.0, M.plastic(0x2a2e37)); ped.position.set(x, 0.45, 0); Ld.add(ped);
      let obj;
      if (i === 2) { obj = new THREE.Group(); const a = sphere(0.22, M.plastic(t.color), 20), b = sphere(0.22, M.plastic(t.color), 20), bond = box(0.5, 0.08, 0.08, M.plastic(0xe8eef8)); a.position.x = -0.3; b.position.x = 0.3; obj.add(a, b, bond); obj.parts = [a, b, bond]; }
      else if (i === 4) { obj = new THREE.Group(); obj.add(sphere(0.12, M.plastic(0xff7a59), 16)); const ring = new THREE.Mesh(new THREE.TorusGeometry(0.34, 0.012, 8, 40), M.glow(0x8ef0ff)); obj.add(ring); const e = sphere(0.06, M.glow(0x8ef0ff), 10); e.position.x = 0.34; obj.add(e); obj.orb = e; obj.ring = ring; }
      else obj = box(0.8, 0.26, 0.8, i === 0 ? M.plastic(t.color, { roughness: 0.3 }) : M.metal(t.color, { roughness: 0.4 }));
      obj.position.set(x, i === 2 || i === 4 ? 1.3 : 0.95, 0); Ld.add(obj);
      const lab = stage.label('', [x, 0.02, 0.75], Ld, 'hot');
      return { ...t, x, obj, lab, k: 0 };
    });
    const LP = Array.from({ length: 60 }, (_, i) => ({ t: rnd(), k: i % 5, a: rnd() * 6.28 }));
    const LE = Array.from({ length: 40 }, () => ({ on: false, x: 0, y: 0, z: 0, vx: 0, vy: 0 }));
    const lSrc = stage.label('', [3.1, 4.05, 0], Ld, 'hot');
    const ladLabels = [lSrc, ...tg.map((t) => t.lab)];

    // ================================================================ board
    let S = null, bkey = '';
    const bd = board(root, 3.3, 2.31, 640, 448, (g, w, h) => {
      panelBg(g, w, h); if (!S) return;
      if (S.focus === 'ladder') {
        const E = photonEv(S.lam);
        title(g, 'Energy of one photon');
        const x0 = 30, x1 = w - 30, X = (e) => x0 + ((Math.log10(e) + 7.5) / 13) * (x1 - x0), yb = 150, hb = 56;
        [['radio', 1e-7, 1.24e-6], ['micro', 1.24e-6, 1.24e-3], ['IR', 1.24e-3, 1.65], ['UV', 3.26, 124], ['X-ray', 124, 3e5]].forEach(([n, a, b], i) => { a = Math.max(a, 3.2e-8); g.fillStyle = `hsla(${20 + i * 55},45%,42%,.6)`; g.fillRect(X(a), yb, X(b) - X(a), hb); text(g, n, X(a) + 6, yb + hb + 26, COL.soft, '20px sans-serif'); });
        const gr = g.createLinearGradient(X(1.65), 0, X(3.26), 0); [750, 650, 580, 530, 480, 420, 380].forEach((nm, i) => gr.addColorStop(i / 6, nmColor(nm)));
        g.fillStyle = gr; g.fillRect(X(1.65), yb, X(3.26) - X(1.65), hb);
        TARGETS.forEach((t, i) => { g.strokeStyle = E >= t.e ? COL.ok : 'rgba(255,255,255,.55)'; g.lineWidth = 3; g.beginPath(); g.moveTo(X(t.e), yb - 14 - (i % 2) * 20); g.lineTo(X(t.e), yb + hb); g.stroke(); });
        text(g, 'thresholds: 1.1 to 13.6 eV', X(1.12) - 150, yb - 44, COL.soft, '20px sans-serif');
        g.fillStyle = '#fff'; g.beginPath(); g.moveTo(X(E), yb + hb + 2); g.lineTo(X(E) - 12, yb + hb + 38); g.lineTo(X(E) + 12, yb + hb + 38); g.closePath(); g.fill();
        [1e-6, 1e-3, 1, 1e3].forEach((e) => text(g, e === 1 ? '1 eV' : e < 1 ? `10${e === 1e-6 ? '⁻⁶' : '⁻³'}` : '10³', X(e) - 18, yb + hb + 62, 'rgba(255,255,255,.45)', '19px sans-serif'));
        text(g, `E = hf = ${fmtEv(E)}`, 30, 336, COL.light, 'bold 30px sans-serif');
        const n = TARGETS.filter((t) => E >= t.e).length;
        text(g, n ? `enough for ${n} of the 5 targets` : 'too weak for all 5, at any power', 30, 376, n ? COL.ok : COL.bad, 'bold 23px sans-serif');
        text(g, `1 W of it is ${sci(1 / (E * QE))} photons a second`, 30, 412, COL.soft, '21px sans-serif');
      } else {
        const T = wait(S);
        title(g, 'How long until an electron?');
        const x0 = 40, x1 = w - 40, X = (t) => x0 + (clamp(Math.log10(t), -10, 8) + 10) / 18 * (x1 - x0), y = 250;
        g.strokeStyle = 'rgba(255,255,255,.4)'; g.lineWidth = 2; g.beginPath(); g.moveTo(x0, y); g.lineTo(x1, y); g.stroke();
        [[1e-9, '1 ns'], [1e-3, '1 ms'], [1, '1 s'], [3600, '1 h'], [3.15e7, '1 yr']].forEach(([t, l]) => { g.fillStyle = 'rgba(255,255,255,.5)'; g.fillRect(X(t) - 1, y - 8, 2, 16); text(g, l, X(t) - 20, y + 36, COL.soft, '20px sans-serif'); });
        dot(g, X(T.tWave), y, COL.bad, 12); text(g, `a wave: ${fmtDur(T.tWave)}`, clamp(X(T.tWave) - 110, 30, w - 300), y - 70, COL.bad, 'bold 26px sans-serif');
        g.strokeStyle = COL.bad; g.lineWidth = 2; g.beginPath(); g.moveTo(X(T.tWave), y - 14); g.lineTo(X(T.tWave), y - 60); g.stroke();
        dot(g, X(3e-9), y, COL.ok, 12); text(g, 'measured: under 3 ns', 30, y - 130, COL.ok, 'bold 26px sans-serif');
        g.strokeStyle = COL.ok; g.beginPath(); g.moveTo(X(3e-9), y - 14); g.lineTo(X(3e-9), y - 120); g.stroke();
        text(g, `${S.inten < 0.01 ? sci(S.inten) : +S.inten.toPrecision(2)} W/m² of 400 nm light`, 30, 340, COL.text, '22px sans-serif');
        text(g, `${sci(T.photons)} photons a second on 1 cm²`, 30, 374, COL.light, '22px sans-serif');
        text(g, 'time on a log scale: each tick ×1,000 or more', 30, 420, 'rgba(255,255,255,.45)', '19px sans-serif');
      }
    }, [3.2, 5.9, 0]);

    const setFocus = focusSwitch(stage, { wait: Wt, ladder: Ld }, VIEWS);
    const col = new THREE.Color();
    return {
      update(dt, s, time) {
        dt = Math.max(0, dt); S = s;
        const isW = s.focus !== 'ladder';
        setFocus(isW ? 'wait' : 'ladder');
        const narrow = fitNarrow(stage, []);
        showLabels(waitLabels, isW); showLabels(ladLabels, !isW);
        if (narrow) showLabels([lPlate, lAtom, lSrc], false);
        placeBoard(bd, [[3.2, 5.75, 0], -0.1, 1]);

        if (isW) {
          const T = wait(s), wave = s.pic === 'wave';
          const bright = clamp((Math.log10(s.inten) + 6) / 8, 0, 1);
          fronts.forEach((f, i) => { f.visible = wave; f.position.set(0, 1.4 + ((((i / 5) - time * 0.35) % 1) + 1) % 1 * 3.4, 0); f.material.opacity = 0.08 + 0.3 * bright; });
          if (wave) {
            // time-lapse: the classical wait is squeezed into 6 s of screen time, then every atom lets go at once
            if (burst > 0) { burst -= dt; if (burst <= 0) fill = 0; }
            else { fill += dt / 6; if (fill >= 1) { fill = 1; burst = 1.2; atoms.forEach((a) => popE(a.x)); } }
            atoms.forEach((a) => a.mat.emissive.setRGB(fill * 0.9, fill * 0.5, fill * 1.4));
            WP.forEach((p, i) => { p.on = false; wph.hide(i); });
            lWait.element.style.setProperty('--c', COL.bad);
            lWait.element.textContent = burst > 0 ? `only now, after ${fmtDur(T.tWave)}` : `a wave: atoms slowly saving up… ${fmtDur(T.tWave * fill)} of ${fmtDur(T.tWave)}`;
            lAtom.element.textContent = 'each atom soaks up energy';
          } else {
            atoms.forEach((a) => a.mat.emissive.setRGB(0, 0, 0)); fill = 0; burst = 0;
            // photons arrive one by one (many fewer drawn than real); the unlucky ones are absorbed as heat
            phAcc += dt * (1.5 + 16 * bright);
            while (phAcc >= 1) { phAcc -= 1; const p = WP.find((q) => !q.on); if (p) Object.assign(p, { on: true, x: (rnd() - 0.5) * 4.6, y: 5.0, z: 0.2 + (rnd() - 0.5) * 0.5, hit: rnd() < 0.35 }); }
            WP.forEach((p, i) => { if (!p.on) return wph.hide(i); p.y -= dt * 3.4; if (p.y <= 1.5) { p.on = false; if (p.hit) popE(p.x); return wph.hide(i); } wph.place(i, p.x, p.y, p.z, 1); });
            lWait.element.style.setProperty('--c', COL.ok);
            lWait.element.textContent = `photons: an electron leaves the instant one is absorbed`;
            lAtom.element.textContent = 'no saving up';
          }
          wph.done();
          WE.forEach((e, i) => { if (!e.on) return wel.hide(i); e.x += e.vx * dt; e.y += e.vy * dt; if (e.y > 4.6) { e.on = false; return wel.hide(i); } wel.place(i, e.x, e.y, e.z, 1); });
          wel.done();
        } else {
          const E = photonEv(s.lam);
          col.set(drawCol(s.lam)); lph.material.color.copy(col);
          LP.forEach((p, i) => {
            p.t += dt * 0.55;
            const t = tg[p.k];
            if (p.t >= 1) { p.t -= 1; if (E >= t.e && rnd() < 0.5) { const e = LE.find((q) => !q.on); if (e) Object.assign(e, { on: true, x: t.x, y: t.obj.position.y + 0.2, z: 0.1, vx: (rnd() - 0.5) * 1.4, vy: 1.2 + rnd() }); t.k = 1; } }
            const y0 = 4.25, y1 = t.obj.position.y + 0.15;
            lph.place(i, 1.5 + (t.x - 1.5) * p.t + Math.cos(p.a) * 0.08, y0 + (y1 - y0) * p.t, Math.sin(p.a) * 0.12, 1);
          });
          lph.done();
          LE.forEach((e, i) => { if (!e.on) return lel.hide(i); e.x += e.vx * dt; e.y += e.vy * dt; e.vy -= dt * 0.4; if (e.y > 3.6 || e.y < 0.8) { e.on = false; return lel.hide(i); } lel.place(i, e.x, e.y, e.z, 1); });
          lel.done();
          tg.forEach((t, i) => {
            const ok = E >= t.e; t.k = Math.max(0, t.k - dt * 2);
            t.lab.element.style.setProperty('--c', ok ? COL.ok : 'rgba(255,255,255,.45)');
            t.lab.element.innerHTML = narrow ? `${t.e} eV` : `${t.short}<br><b>${t.e} eV</b>`;
            if (i === 2) { const d = ok ? 0.3 + 0.25 * (0.5 + 0.5 * Math.sin(time * 5)) : 0.3; t.obj.parts[0].position.x = -d; t.obj.parts[1].position.x = d; t.obj.parts[2].visible = !ok || d < 0.36; }
            if (i === 4) { const r = ok ? 0.34 + 0.5 * ((time * 0.8) % 1) : 0.34; t.obj.orb.position.set(Math.cos(time * 4) * r, Math.sin(time * 4) * r, 0); t.obj.ring.visible = !ok; }
          });
          lSrc.element.style.setProperty('--c', s.lam >= 380 && s.lam <= 750 ? drawCol(s.lam) : COL.light);
          lSrc.element.innerHTML = `${colourName(s.lam)}, ${fmtLam(s.lam)}: <b>${fmtEv(E)}</b> a photon`;
        }
        const k = isW ? `w|${s.inten}` : `l|${s.lam}`;
        if (k !== bkey) { bkey = k; bd.redraw(); }
      },
      readout: (s) => fit(((s) => {
        if (s.focus === 'ladder') {
          const E = photonEv(s.lam), f = C / (s.lam * 1e-9), can = TARGETS.filter((t) => E >= t.e);
          const note = E < 1.12 ? `A 1,000 W oven or heater sends ${sci(1000 / (E * QE))} of these a second, and not one can free an electron or break a bond.` : E < 3.6 ? 'Enough to free electrons in silicon and from soft metals, but not to break strong chemical bonds.' : E < 124 ? 'Each photon can break bonds: this is why ultraviolet damages skin and plastics.' : 'Ionising radiation: each photon can knock electrons out of deep inside atoms.';
          return `<div class="big">E = hf = ${fmtEv(E)}</div>
            <div class="row"><span>Light</span><b>${colourName(s.lam)}, ${fmtLam(s.lam)}</b></div>
            <div class="row x"><span>Frequency</span><b>${fmtHz(f)}</b></div>
            <div class="row x"><span>Photons a second in 1 W</span><b>${sci(1 / (E * QE))}</b></div>
            <div class="row"><span>Has enough energy for</span><b>${can.length === 5 ? 'all five targets' : can.length ? can.map((t) => t.short.replace(' gap', '').replace('ionise ', '')).join(', ') : 'none of the five'}</b></div>
            <small>${note}</small>`;
        }
        const T = wait(s);
        return `<div class="big">Wave: ${fmtDur(T.tWave)}. Real: under 3 ns</div>
          <div class="row"><span>Light on the potassium</span><b>${s.inten < 0.01 ? sci(s.inten) : +s.inten.toPrecision(2)} W/m², 400 nm</b></div>
          <div class="row x"><span>Power caught by one atom</span><b>${sci(s.inten * Math.PI * R_ATOM * R_ATOM)} W</b></div>
          <div class="row"><span>Wave theory’s wait, φ ÷ power</span><b>${fmtDur(T.tWave)}</b></div>
          <div class="row x"><span>Photons on 1 cm² a second</span><b>${sci(T.photons)}</b></div>
          <div class="row x"><span>Electrons freed a second</span><b>${sci(T.eRate)}</b></div>
          <small>The first electron is expected after ${fmtDur(T.tFirst)}: pure chance, with no saving up.</small>`;
      })(s)),
    };
  },
};
