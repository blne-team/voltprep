// Text of the battery-sag scenario.
const root = {
  tab: 'Battery sag',
  title: 'Battery or supply sag under load',
  intro: 'A battery behaves like an ideal voltage (its EMF) behind a small internal resistance. Presets use the AA datasheet’s fresh-cell range.',
  fields: {
    preset: 'Battery',
    emf: 'Open-circuit voltage (EMF)',
    internalResistance: 'Internal resistance',
    loadResistance: 'Load resistance',
    cutoffVoltage: 'Device stops working below',
  },
  presetOption: (part: string, emf: string, internal: string) => `${part}: ${emf}, ${internal} internal`,
  readout: {
    terminalVoltage: 'Voltage at the terminals',
    current: 'Current',
    sag: 'Sag inside the battery',
    loadPower: 'Power to the load',
    internalPower: 'Power heating the battery',
    lostFraction: 'Share of power lost inside',
  },
  flags: {
    brownout: (terminal: string, cutoff: string) => `The terminal voltage falls to ${terminal}, below the device’s ${cutoff}: this is why it browns out under load.`,
    highLoss: (limit: string, share: string) => `More than ${limit} of the power is heating the battery (${share}) instead of the load.`,
  },
  words: (v: { emf: string; current: string; internal: string; sag: string; terminal: string; load: string }) =>
    `With no load the battery reads its ${v.emf}. Connect the load and ${v.current} flows through the battery’s own ${v.internal} too, which takes ${v.sag}. The load is left with ${v.terminal}, and it receives ${v.load}.`,
  steps: {
    current: 'Current round the loop',
    sag: 'Volts lost inside',
    terminal: 'Terminal voltage',
    power: 'Power to the load and inside',
  },
  meter: (emf: string, terminal: string, current: string) =>
    `Measure the open-circuit voltage (about ${emf}), then the voltage with the load on (about ${terminal}) and the current (about ${current}). The internal resistance is roughly the voltage change divided by the current: Energizer’s pulse method works the same way.`,
  sketchLabel: (emf: string, internal: string, load: string, terminal: string, current: string) =>
    `A battery drawn as ${emf} behind ${internal} of internal resistance, feeding a ${load} load with ${current}; ${terminal} at the terminals.`,
};

export type BatteryCopy = typeof root;

const fr: BatteryCopy = {
  tab: 'Pile sous charge',
  title: 'Chute de tension d’une pile ou d’une alimentation sous charge',
  intro: 'Une pile se comporte comme une tension idéale (sa force électromotrice) derrière une petite résistance interne. Les préréglages reprennent la plage de la fiche AA pour une pile neuve.',
  fields: {
    preset: 'Pile',
    emf: 'Tension à vide (f.é.m.)',
    internalResistance: 'Résistance interne',
    loadResistance: 'Résistance de la charge',
    cutoffVoltage: 'L’appareil s’arrête sous',
  },
  presetOption: (part, emf, internal) => `${part} : ${emf}, ${internal} internes`,
  readout: {
    terminalVoltage: 'Tension aux bornes',
    current: 'Courant',
    sag: 'Chute dans la pile',
    loadPower: 'Puissance à la charge',
    internalPower: 'Puissance qui chauffe la pile',
    lostFraction: 'Part de puissance perdue',
  },
  flags: {
    brownout: (terminal, cutoff) => `La tension aux bornes tombe à ${terminal}, sous les ${cutoff} de l’appareil : voilà pourquoi il décroche sous charge.`,
    highLoss: (limit, share) => `Plus de ${limit} de la puissance chauffe la pile (${share}) au lieu d’aller à la charge.`,
  },
  words: (v) =>
    `À vide, la pile affiche sa f.é.m. de ${v.emf}. Branchez la charge : ${v.current} traverse aussi la résistance interne de ${v.internal}, qui prend ${v.sag}. Il reste ${v.terminal} à la charge, qui reçoit ${v.load}.`,
  steps: {
    current: 'Courant dans la boucle',
    sag: 'Volts perdus dans la pile',
    terminal: 'Tension aux bornes',
    power: 'Puissance à la charge et dans la pile',
  },
  meter: (emf, terminal, current) =>
    `Mesurez la tension à vide (environ ${emf}), puis la tension en charge (environ ${terminal}) et le courant (environ ${current}). La résistance interne vaut à peu près la variation de tension divisée par le courant : la méthode par impulsion d’Energizer suit le même principe.`,
  sketchLabel: (emf, internal, load, terminal, current) =>
    `Pile représentée par ${emf} derrière ${internal} de résistance interne, alimentant une charge de ${load} avec ${current}; ${terminal} aux bornes.`,
};

export const batteryCopy = { root, fr };
