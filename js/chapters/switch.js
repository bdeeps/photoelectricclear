// Chapter 3: light as a switch. Two scenes, both using the photoelectric effect's quieter cousin, the
// INTERNAL photoelectric effect: a photon frees an electron inside a semiconductor, without throwing it
// out into a vacuum. The energy to beat is the band gap Eg, not a work function, and it is smaller.
// "door": the safety beam of a lift or automatic door. An infrared LED (940 nm is the common choice,
//   photon energy 1.32 eV) shines across the doorway on a silicon photodiode. Silicon's band gap is
//   1.12 eV (Sze, Physics of Semiconductor Devices), so it sees light up to hc ÷ Eg = 1,107 nm.
//   Responsivity R = η × λ(nm) ÷ 1239.84 amps per watt, where η is the quantum efficiency; a silicon
//   photodiode gives about 0.6 A/W near 940 nm (typical datasheet figure; the ideal η = 1 line is 0.76 A/W at
//   940 nm). Here η = 0.8 × (1 − e^(−(λg − λ)/50 nm)): about 0.8 through the working range and falling to
//   zero at the cut-off, a simple fit to the usual curve. Other gaps: Ge 0.66 eV, GaAs 1.42 eV, CdS
//   2.42 eV. The beam power reaching the sensor is taken as 20 µW.
// "lamp": a dusk-to-dawn street light with a cadmium sulphide light-dependent resistor (LDR). Light
//   frees electrons inside the CdS, so its resistance falls: R = R₁₀ × (lux ÷ 10)^−γ with R₁₀ = 15 kΩ and
//   γ = 0.7 (GL5528 datasheet: 10 to 20 kΩ at 10 lux, γ about 0.7, dark resistance about 1 MΩ, peak
//   response near 540 nm). The lamp is set to switch on below 10 lux and off above 30 lux.
//   Light levels (Wikipedia "Lux"): full moon about 0.1 to 0.3 lux, twilight about 3 to 10, sunrise or
//   sunset about 400, overcast day about 1,000, daylight 10,000 to 25,000, direct sun about 100,000.
import { THREE, M, box, sphere, clamp, approach } from '../kit.js';
import {
  GAPS, HC_EVNM, photonEv, nmColor, colourName, QE, sci, si, fmt0, COL, HEX,
  board, panelBg, title, axes, curve, line, dot, text, rainbow, dots, fitNarrow, placeBoard, fit, focusSwitch, showLabels, rng,
} from '../photo.js';

const P_BEAM = 20e-6;                                        // W reaching the sensor
export const eta = (nm, gap) => { const lg = HC_EVNM / gap; return nm >= lg ? 0 : 0.8 * (1 - Math.exp(-(lg - nm) / 50)); };
export function sensor(s) {
  const m = GAPS[s.mat], E = photonEv(s.nm), lg = HC_EVNM / m.gap, q = eta(s.nm, m.gap);
  const R = (q * s.nm) / HC_EVNM, photons = P_BEAM / (E * QE);
  return { m, E, lg, q, R, I: R * P_BEAM, photons, sees: R * P_BEAM > 1e-6 };
}
const R10 = 15e3, GAMMA = 0.7, R_DARK = 1e6;
export function ldr(lux) { return Math.min(R_DARK, R10 * Math.pow(lux / 10, -GAMMA)); }
const skyName = (l) => (l < 0.5 ? 'moonlit night' : l < 30 ? 'twilight' : l < 700 ? 'sunrise or sunset' : l < 5000 ? 'overcast day' : l < 50000 ? 'daylight' : 'direct sun');
const fmtR = (r) => (r >= 1e6 ? `${+(r / 1e6).toPrecision(2)} MΩ` : r >= 1e3 ? `${+(r / 1e3).toPrecision(3)} kΩ` : `${Math.round(r)} Ω`);
const fmtLux = (l) => `${l < 10 ? +l.toPrecision(2) : fmt0(+l.toPrecision(2))} lux`;
const VIEWS = {
  door: { pos: [0.5, 3.7, 9.8], target: [-0.6, 2.75, 0] },
  lamp: { pos: [0.1, 3.3, 9.4], target: [0.1, 3.0, 0] },
};

function person() {
  const g = new THREE.Group(), cloth = M.matte(0x3b6fd8), skin = M.matte(0xc68b64);
  const torso = new THREE.Mesh(new THREE.CapsuleGeometry(0.2, 0.55, 6, 14), cloth); torso.position.y = 1.35; torso.castShadow = true; g.add(torso);
  const head = sphere(0.16, skin, 20); head.position.y = 2.0; g.add(head);
  const legs = [-1, 1].map((k) => { const p = new THREE.Group(); p.position.set(k * 0.1, 0.95, 0); const l = new THREE.Mesh(new THREE.CapsuleGeometry(0.08, 0.75, 4, 10), M.matte(0x2b3242)); l.position.y = -0.46; l.castShadow = true; p.add(l); g.add(p); return p; });
  const arms = [-1, 1].map((k) => { const p = new THREE.Group(); p.position.set(k * 0.27, 1.65, 0); const l = new THREE.Mesh(new THREE.CapsuleGeometry(0.06, 0.55, 4, 10), cloth); l.position.y = -0.33; p.add(l); g.add(p); return p; });
  g.walk = (ph) => { legs[0].rotation.x = Math.sin(ph) * 0.5; legs[1].rotation.x = -Math.sin(ph) * 0.5; arms[0].rotation.x = -Math.sin(ph) * 0.4; arms[1].rotation.x = Math.sin(ph) * 0.4; };
  return g;
}

export default {
  id: 'switch',
  short: 'Light as a switch',
  title: 'Light that works a switch',
  subtitle: 'In a semiconductor, light frees electrons without throwing them out. That makes a sensor.',
  view: VIEWS.door,
  learn: `<p>Early "electric eyes" really were phototubes: light freed electrons from a metal into a vacuum. From the late 1920s they read the soundtrack printed down the edge of cinema film, and soon they were counting items on factory belts and opening doors.</p>
    <p>Today the job is done inside a solid. In a <b>semiconductor</b> such as silicon, the electrons that bind the atoms together are stuck in place. A photon can knock one loose so that it wanders through the crystal and carries current. It never leaves the surface, so this is called the <b>internal photoelectric effect</b>. The energy needed is the <b>band gap</b>, and it plays the same part as the work function: a photon with less energy than the gap does nothing, however many of them you send.</p>
    <p>Silicon's gap is <b>1.12 eV</b>, much less than any metal's work function, so even <b>infrared</b> can cross it. A lift door or a shop's sliding door shines an invisible 940 nm beam at a <b>photodiode</b>. Each photon carries 1.32 eV, enough for silicon. While the beam arrives, a small current flows. Step into it, the current stops, and the controller holds the doors open. The TV remote works the same way (see RemoteClear).</p>
    <p>A <b>street light</b> that switches itself on at dusk uses an even simpler part: a <b>light-dependent resistor</b>. Daylight frees electrons inside a strip of cadmium sulphide, so it conducts well. As the sky darkens, fewer electrons are free, the resistance climbs from a few hundred ohms to a million, and a circuit turns the lamp on.</p>
    <p class="tip"><b>Try it:</b> in <b>Door</b>, slide the beam's wavelength past 1,107 nm and watch silicon go blind, then switch to germanium. In <b>Street light</b>, bring the evening on and watch the resistance climb.</p>`,
  terms: [
    { t: 'Internal photoelectric effect', d: 'A photon frees an electron inside a solid so it can carry current, without the electron leaving the surface.' },
    { t: 'Band gap', d: 'The least energy needed to free an electron inside a semiconductor: 1.12 eV for silicon.' },
    { t: 'Photodiode', d: 'A semiconductor junction that passes a current in proportion to the light falling on it.' },
    { t: 'Responsivity', d: 'Amps of current per watt of light. For silicon, about 0.6 A/W in the near infrared.' },
    { t: 'Cut-off wavelength', d: 'The longest wavelength a sensor can see: hc ÷ band gap. For silicon, about 1,107 nm.' },
    { t: 'LDR', d: 'Light-dependent resistor: a strip of semiconductor whose resistance falls as the light gets brighter.' },
  ],
  defaults: { focus: 'door', nm: 940, mat: 'si', walk: true, lux: 2000 },
  controls: [
    { key: 'focus', type: 'seg', label: 'Look at', options: [{ v: 'door', label: 'Door beam' }, { v: 'lamp', label: 'Street light' }] },
    { key: 'nm', type: 'range', label: 'Door: wavelength of the beam', min: 400, max: 1800, step: 5, ends: ['400 nm violet', '1,800 nm infrared'], fmt: (v) => `${fmt0(v)} nm · ${colourName(v)} · ${photonEv(v).toFixed(2)} eV` },
    { key: 'mat', type: 'seg', label: 'Door: sensor material', options: [{ v: 'si', label: 'Silicon' }, { v: 'ge', label: 'Germanium' }, { v: 'gaas', label: 'GaAs' }, { v: 'cds', label: 'CdS' }], fmt: (v) => `gap ${GAPS[v].gap} eV, sees up to ${fmt0(HC_EVNM / GAPS[v].gap)} nm` },
    { key: 'walk', type: 'toggle', label: 'Door: someone walking through', hint: 'They break the beam on the way in.' },
    { key: 'lux', type: 'log', label: 'Street light: brightness of the sky', min: 0.1, max: 100000, ends: ['moonlit night', 'direct sun'], fmt: (v) => `${fmtLux(v)} · ${skyName(v)}` },
  ],
  onChange(s, key) { if (key === 'nm' || key === 'mat' || key === 'walk') s.focus = 'door'; if (key === 'lux') s.focus = 'lamp'; },
  quiz: [
    { q: 'Silicon has a band gap of 1.12 eV. Which beam can a silicon photodiode NOT see?', options: ['Red light, 1.9 eV per photon', 'Infrared of 940 nm, 1.32 eV', 'Infrared of 1,500 nm, 0.83 eV', 'Blue light, 2.7 eV'], answer: 2, why: 'A photon needs at least the band gap. 0.83 eV is below 1.12 eV, so it frees no electrons in silicon, however strong the beam.' },
    { q: 'How is the internal photoelectric effect different from the one in a phototube?', options: ['It needs no light', 'The freed electron stays inside the solid and carries current there', 'It only works with X-rays', 'It needs a higher voltage'], answer: 1, why: 'In a phototube the electron escapes into a vacuum. In a semiconductor it is only freed to move within the crystal, which takes less energy.' },
    { q: 'What happens to a light-dependent resistor as evening falls?', options: ['Its resistance rises, because fewer electrons are freed', 'Its resistance falls', 'It makes its own light', 'Nothing changes'], answer: 0, why: 'Fewer photons free fewer electrons, so the strip conducts less. The rising resistance tells the circuit to switch the lamp on.' },
  ],
  reel: [
    { ms: 5600, caption: 'A lift door watches an invisible infrared beam. Break it, the current stops, and the door stays open.', set: { focus: 'door', nm: 940, mat: 'si', walk: true }, anim: {}, view: { pos: [0.6, 5.4, 8.2], target: [0, 4.6, 0] }, spin: 0 },
  ],

  build({ stage }) {
    const root = new THREE.Group(); stage.root.add(root);
    const rnd = rng(5);

    // ================================================================ DOOR (1 unit ≈ 0.5 m)
    const D = new THREE.Group(); root.add(D);
    const floor = box(6.4, 0.08, 5.2, M.matte(0x3a3f4b, { roughness: 0.8 })); floor.position.set(0, 0.04, 0.6); D.add(floor);
    const frameMat = M.metal(0x8a909c, { roughness: 0.45 });
    for (const x of [-1.5, 1.5]) { const p = box(0.22, 4.2, 0.3, frameMat); p.position.set(x, 2.1, 0); D.add(p); }
    const top = box(3.22, 0.3, 0.3, frameMat); top.position.set(0, 4.2, 0); D.add(top);
    const wallL = box(1.5, 4.35, 0.12, M.matte(0x2b303a)), wallR = wallL.clone(); wallL.position.set(-2.36, 2.17, -0.05); wallR.position.set(2.36, 2.17, -0.05); D.add(wallL, wallR);
    const panes = [-1, 1].map((k) => { const p = box(1.4, 3.9, 0.06, M.clear(0xbfe3ff, 0.28)); p.position.set(k * 0.7, 2.05, -0.02); D.add(p); return p; });
    const YB = 1.0, ZB = 0.22;
    const led = box(0.16, 0.2, 0.16, M.plastic(0x1b1d22)); led.position.set(-1.36, YB, ZB); D.add(led);
    const det = box(0.16, 0.2, 0.16, M.plastic(0x1b1d22)); det.position.set(1.36, YB, ZB); D.add(det);
    const detEye = sphere(0.06, new THREE.MeshBasicMaterial({ color: 0x5ce1a9, toneMapped: false }), 12); det.add(detEye); detEye.position.set(-0.09, 0, 0);
    const beamMat = M.ghost(0xff5a5a, 0.5), beam = box(1, 0.035, 0.035, beamMat); D.add(beam);
    const bph = dots(26, 0.045, 0xffffff); D.add(bph);
    const man = person(); D.add(man);
    const lLed = stage.label('LED', [-1.95, YB + 0.45, ZB], D), lDet = stage.label('', [2.3, YB + 0.45, ZB], D, 'hot');
    const lDoor = stage.label('', [0.2, 3.3, 0.3], D, 'hot');
    const doorLabels = [lLed, lDet, lDoor];
    let manZ = 3.4, open = 0, hold = 0, blocked = false;

    // ================================================================ STREET LIGHT
    const Lm = new THREE.Group(); root.add(Lm);
    const sky = new THREE.Mesh(new THREE.PlaneGeometry(9.4, 5.6), new THREE.MeshBasicMaterial({ color: 0x0b1020, toneMapped: false })); sky.position.set(0, 2.9, -1.6); Lm.add(sky);
    const sun = sphere(0.32, new THREE.MeshBasicMaterial({ color: 0xffd76a, toneMapped: false }), 24); sun.castShadow = false; Lm.add(sun);
    const road = box(9.4, 0.08, 3.4, M.matte(0x2a2d34)); road.position.set(0, 0.04, 0); Lm.add(road);
    const pole = box(0.14, 3.6, 0.14, M.metal(0x6c727d, { roughness: 0.5 })); pole.position.set(-1.6, 1.85, 0); Lm.add(pole);
    const arm = box(1.5, 0.1, 0.1, M.metal(0x6c727d)); arm.position.set(-0.9, 3.65, 0); Lm.add(arm);
    const head = box(0.9, 0.16, 0.36, M.plastic(0x23272f)); head.position.set(-0.3, 3.6, 0); Lm.add(head);
    const glowMat = new THREE.MeshBasicMaterial({ color: 0x33302a, toneMapped: false });
    const glow = box(0.76, 0.05, 0.28, glowMat); glow.position.set(-0.3, 3.5, 0); Lm.add(glow);
    const cone = new THREE.Mesh(new THREE.ConeGeometry(1.7, 3.4, 32, 1, true), M.ghost(0xffe2a0, 0)); cone.position.set(-0.3, 1.78, 0); Lm.add(cone);
    const spot = new THREE.PointLight(0xffe2a0, 0, 9, 1.4); spot.position.set(-0.3, 3.3, 0.3); Lm.add(spot);
    const nub = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.09, 0.14, 20), M.plastic(0xd9c15a)); nub.position.set(-0.3, 3.76, 0); Lm.add(nub);
    // the CdS strip, magnified, with freed electrons
    const strip = box(2.6, 0.5, 0.5, M.clear(0xe0b23c, 0.35)); strip.position.set(2.3, 1.15, 0.6); Lm.add(strip);
    for (const x of [0.95, 3.65]) { const c = box(0.1, 0.62, 0.62, M.metal(0xc8773a)); c.position.set(x, 1.15, 0.6); Lm.add(c); }
    const free = dots(80, 0.04, HEX.e); Lm.add(free);
    const FR = Array.from({ length: 80 }, () => ({ x: rnd(), y: rnd(), z: rnd() }));
    const lLdr = stage.label('light sensor (LDR)', [0.6, 4.15, 0], Lm), lStrip = stage.label('', [2.3, 0.45, 0.6], Lm, 'hot'); lStrip.element.style.setProperty('--c', COL.e);
    const lSky = stage.label('', [2.6, 3.9, -1.5], Lm);
    const lampLabels = [lLdr, lStrip, lSky];
    let lampOn = false, lampK = 0;

    // ================================================================ board
    let S = null, bkey = '';
    const bd = board(root, 3.3, 2.31, 640, 448, (g, w, h) => {
      panelBg(g, w, h); if (!S) return;
      if (S.focus === 'lamp') {
        title(g, 'LDR resistance vs light');
        const { X, Y } = axes(g, w, h, { x0: 112, xMin: 0.1, xMax: 1e5, yMin: 100, yMax: 2e6, xLog: true, yLog: true, xTicks: [0.1, 10, 1000, 1e5], yTicks: [100, 1e4, 1e6], xFmt: (v) => (v >= 1000 ? v / 1000 + 'k' : String(v)), yFmt: fmtR, xLabel: 'light (lux) →' });
        curve(g, ldr, 0.1, 1e5, X, Y, COL.e, 6, null, 80, true);
        g.strokeStyle = COL.light; g.setLineDash([6, 6]); g.lineWidth = 2; g.beginPath(); g.moveTo(X(10), Y(100)); g.lineTo(X(10), Y(2e6)); g.stroke(); g.setLineDash([]);
        text(g, 'on below 10 lux', X(10) + 10, Y(6e5), COL.light, '21px sans-serif');
        dot(g, X(S.lux), Y(ldr(S.lux)), COL.light, 10);
        text(g, `${fmtR(ldr(S.lux))} at ${fmtLux(S.lux)}`, 126, 86, COL.text, 'bold 24px sans-serif');
      } else {
        const T = sensor(S);
        title(g, `${T.m.name}: amps per watt`);
        const { X, Y, y0 } = axes(g, w, h, { xMin: 400, xMax: 1800, yMax: 1.4, xTicks: [400, 800, 1200, 1600], yTicks: [0, 0.5, 1], yFmt: (v) => v.toFixed(1), xLabel: 'wavelength (nm) →' });
        rainbow(g, X, y0 - 14, 14, 400, 750);
        curve(g, (nm) => nm / HC_EVNM, 400, 1736, X, Y, 'rgba(255,255,255,.35)', 2, [6, 6]);
        curve(g, (nm) => (eta(nm, T.m.gap) * nm) / HC_EVNM, 400, 1800, X, Y, COL.e, 6, null, 280);
        if (T.lg < 1800) { g.strokeStyle = COL.bad; g.setLineDash([6, 6]); g.lineWidth = 2; g.beginPath(); g.moveTo(X(T.lg), Y(0)); g.lineTo(X(T.lg), Y(1.2)); g.stroke(); g.setLineDash([]); text(g, `cut-off ${fmt0(T.lg)} nm`, clamp(X(T.lg) - 90, 100, w - 230), Y(1.25), COL.bad, 'bold 21px sans-serif'); }
        dot(g, X(S.nm), Y(T.R), T.sees ? COL.light : COL.bad, 10);
        text(g, T.sees ? `${T.R.toFixed(2)} A/W at ${fmt0(S.nm)} nm` : 'photons too weak: blind here', 104, 86, T.sees ? COL.text : COL.bad, 'bold 24px sans-serif');
      }
    }, [3.2, 5.9, 0]);

    const setFocus = focusSwitch(stage, { door: D, lamp: Lm }, VIEWS);
    const c1 = new THREE.Color(), cNight = new THREE.Color(0x0b1020), cDusk = new THREE.Color(0xc96a4a), cDay = new THREE.Color(0x6fb2ff);
    let walkPh = 0;
    return {
      update(dt, s, time) {
        dt = Math.max(0, dt); S = s;
        const isDoor = s.focus !== 'lamp';
        setFocus(isDoor ? 'door' : 'lamp');
        const narrow = fitNarrow(stage, []);
        showLabels(doorLabels, isDoor); showLabels(lampLabels, !isDoor);
        if (narrow) showLabels([lLed, lLdr, lSky], false);
        placeBoard(bd, isDoor ? [[2.75, 5.7, 0.4], -0.2, 0.95] : [[3.2, 5.9, 0], -0.1, 1], [[0, 7.4, 0], 0, 2], [[0, -1.2, 3.0], 0, 0.9]);

        if (isDoor) {
          const T = sensor(s);
          // the walker comes from the front, through the beam and the doorway, then starts again
          if (s.walk) { manZ -= dt * 1.1; walkPh += dt * 7; if (manZ < -2.6) manZ = 3.6; } else { manZ = approach(manZ, 3.4, 3, dt); }
          man.position.set(0, 0.08, manZ); man.walk(s.walk ? walkPh : 0); man.visible = manZ > -2.4;
          blocked = Math.abs(manZ - ZB) < 0.3;
          const lit = T.sees && !blocked;                   // current flows in the photodiode
          // The controller keeps the doors open whenever it loses the beam, and for 2 s afterwards.
          if (!lit) hold = 2.0; else hold = Math.max(0, hold - dt);
          const wantOpen = hold > 0 || manZ < ZB;
          open = approach(open, wantOpen ? 1 : 0, 4, dt);
          panes[0].position.x = -0.7 - open * 1.35; panes[1].position.x = 0.7 + open * 1.35;
          const col = c1.set(nmColor(s.nm)), x0 = -1.28, x1 = blocked ? -0.24 : 1.28;
          beamMat.color.copy(col); beamMat.opacity = s.nm > 750 ? 0.28 : 0.6;
          beam.scale.x = x1 - x0; beam.position.set((x0 + x1) / 2, YB, ZB);
          bph.material.color.copy(col);
          for (let i = 0; i < 26; i++) { const x = x0 + ((((i / 26) + time * 0.9) % 1) * 2.56); if (x > x1) bph.hide(i); else bph.place(i, x, YB + Math.sin(i * 2.4) * 0.03, ZB + Math.cos(i * 1.7) * 0.03, 1); }
          bph.done();
          detEye.material.color.setHex(lit ? 0x5ce1a9 : 0xff5a8a);
          lDet.element.style.setProperty('--c', lit ? COL.ok : COL.bad);
          lDet.element.textContent = !T.sees ? `${T.m.name.toLowerCase()} cannot see this beam` : blocked ? 'beam broken: no current' : `photodiode: ${si(T.I, 'A', 2)}`;
          lDoor.element.style.setProperty('--c', wantOpen ? COL.light : COL.soft);
          lDoor.element.textContent = !T.sees ? 'no signal, so the door stays open to be safe' : wantOpen ? 'door held open' : 'beam seen: door may close';
        } else {
          const lux = s.lux, R = ldr(lux);
          if (lux < 10) lampOn = true; else if (lux > 30) lampOn = false;
          lampK = approach(lampK, lampOn ? 1 : 0, 5, dt);
          const d = clamp(Math.log10(lux / 0.1) / 6, 0, 1);            // 0 night … 1 direct sun
          if (d < 0.55) c1.copy(cNight).lerp(cDusk, clamp((d - 0.25) / 0.3, 0, 1) * 0.8); else c1.copy(cDusk).multiplyScalar(0.8).lerp(cDay, clamp((d - 0.55) / 0.25, 0, 1));
          sky.material.color.copy(c1);
          sun.position.set(3.4 - d * 2.2, 0.2 + d * 5.0, -1.5); sun.visible = d > 0.42;
          sun.material.color.setHex(d < 0.65 ? 0xff9a55 : 0xffe9a0);
          glowMat.color.setRGB(0.2 + 2.2 * lampK, 0.19 + 1.9 * lampK, 0.16 + 1.2 * lampK);
          cone.material.opacity = 0.16 * lampK; spot.intensity = 6 * lampK;
          const n = Math.round(clamp(80 * Math.pow(lux / 1e5, 0.35), 1, 80));
          FR.forEach((p, i) => { if (i >= n) return free.hide(i); p.x = (p.x + dt * 0.25) % 1; free.place(i, 1.05 + p.x * 2.5, 0.95 + p.y * 0.4, 0.4 + p.z * 0.4, 1); });
          free.done();
          lStrip.element.innerHTML = `inside the sensor: <b>${fmtR(R)}</b>`;
          lSky.element.textContent = `${skyName(lux)}, ${fmtLux(lux)}`;
        }
        const k = isDoor ? `d|${s.nm}|${s.mat}` : `l|${s.lux}`;
        if (k !== bkey) { bkey = k; bd.redraw(); }
      },
      readout: (s) => fit(((s) => {
        if (s.focus === 'lamp') {
          const R = ldr(s.lux), on = s.lux < 10 ? true : s.lux > 30 ? false : lampOn;
          return `<div class="big">Lamp ${on ? 'on' : 'off'}: ${fmtR(R)}</div>
            <div class="row"><span>Sky</span><b>${skyName(s.lux)}, ${fmtLux(s.lux)}</b></div>
            <div class="row"><span>Sensor resistance</span><b>${fmtR(R)}</b></div>
            <div class="row x"><span>Current through it at 5 V</span><b>${si(5 / R, 'A', 2)}</b></div>
            <div class="row x"><span>Switches on below</span><b>10 lux (off above 30)</b></div>
            <small>Cadmium sulphide, band gap 2.42 eV: it responds to visible light, best in the green.</small>`;
        }
        const T = sensor(s);
        const head = `<div class="row"><span>Beam</span><b>${fmt0(s.nm)} nm ${colourName(s.nm)}, ${T.E.toFixed(2)} eV a photon</b></div>
          <div class="row"><span>${T.m.name} band gap</span><b>${T.m.gap} eV, cut-off ${fmt0(T.lg)} nm</b></div>`;
        if (!T.sees) return `<div class="big">${T.E.toFixed(2)} eV &lt; gap: blind</div>${head}
          <div class="no">${T.q <= 0 ? `Each photon is ${(T.m.gap - T.E).toFixed(2)} eV short of the gap, so no electrons are freed.` : 'Right at the edge of the gap: almost nothing is absorbed.'} The controller gets no signal and keeps the door open.</div>`;
        return `<div class="big">${T.E.toFixed(2)} eV &gt; ${T.m.gap} eV: seen</div>${head}
          <div class="row x"><span>Responsivity</span><b>${T.R.toFixed(2)} A/W (${Math.round(T.q * 100)} % of photons)</b></div>
          <div class="row"><span>Current from a 20 µW beam</span><b>${blocked ? '0 A, beam broken' : si(T.I, 'A', 2)}</b></div>
          <div class="row x"><span>Photons arriving each second</span><b>${sci(T.photons)}</b></div>`;
      })(s)),
    };
  },
};
