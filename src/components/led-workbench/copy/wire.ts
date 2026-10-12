// Text of the DC wire-run scenario (resistivity theory only, never conductor sizing).
const root = {
  tab: 'Wire run',
  title: 'Voltage drop and heating along a DC wire run',
  intro: 'Annealed copper, both conductors counted (out and back). This shows what Ohm’s law says about the run; it does not pick a conductor size.',
  fields: {
    supplyVoltage: 'Supply voltage',
    length: 'Run length, one way',
    area: 'Conductor cross-section',
    current: 'Load current',
    temperature: 'Conductor temperature',
  },
  readout: {
    resistance: 'Round-trip resistance',
    drop: 'Volts lost in the wire',
    dropFraction: 'Share of the supply lost',
    heat: 'Heat in the wire',
    loadVoltage: 'Voltage left at the load',
  },
  flags: {
    highLoss: (share: string) => `More than 10 % of the supply is lost in the wire (${share}). The load sees noticeably less than the supply.`,
    heat: (heat: string, length: string) => `The wire is turning ${heat} into heat along its ${length} of conductor.`,
    exceedsSupply: (current: string, drop: string, supply: string) =>
      `At ${current} this run would drop ${drop}, more than the ${supply} supply. That current can’t flow here; the load would get almost nothing.`,
  },
  words: (v: { current: string; conductor: string; resistance: string; drop: string; supply: string; load: string; heat: string }) =>
    `${v.current} flows out and back through ${v.conductor} of copper, which adds up to ${v.resistance}. Ohm’s law says that resistance takes ${v.drop}, so the load gets ${v.load} of the ${v.supply}. The same current warms the wire by ${v.heat}.`,
  steps: {
    resistivity: 'Copper resistivity at this temperature',
    resistance: 'Resistance of both conductors',
    drop: 'Volts lost',
    heat: 'Heat in the wire',
    load: 'Voltage at the load',
  },
  meter: (drop: string) =>
    `With the load running, measure the voltage at the supply terminals, then at the load terminals. The difference is the drop: expect about ${drop}.`,
  meterExceeds: 'Measure the voltage at the load with it running: it will be far below the supply, and the current lower than you asked for.',
  sketchLabel: (supply: string, drop: string, load: string, current: string) =>
    `A ${supply} supply feeding a load through two long conductors carrying ${current}; ${drop} is lost along the wires, leaving ${load} at the load.`,
};

export type WireCopy = typeof root;

const fr: WireCopy = {
  tab: 'Ligne de câble',
  title: 'Chute de tension et échauffement d’une ligne CC',
  intro: 'Cuivre recuit, les deux conducteurs comptés (aller et retour). On voit ce que la loi d’Ohm dit de la ligne; l’outil ne choisit pas de section de conducteur.',
  fields: {
    supplyVoltage: 'Tension d’alimentation',
    length: 'Longueur de la ligne (aller)',
    area: 'Section du conducteur',
    current: 'Courant de la charge',
    temperature: 'Température du conducteur',
  },
  readout: {
    resistance: 'Résistance aller-retour',
    drop: 'Volts perdus dans le câble',
    dropFraction: 'Part de l’alimentation perdue',
    heat: 'Chaleur dans le câble',
    loadVoltage: 'Tension restante à la charge',
  },
  flags: {
    highLoss: (share) => `Plus de 10 % de l’alimentation se perd dans le câble (${share}). La charge reçoit nettement moins que l’alimentation.`,
    heat: (heat, length) => `Le câble transforme ${heat} en chaleur sur ses ${length} de conducteur.`,
    exceedsSupply: (current, drop, supply) =>
      `À ${current}, cette ligne ferait chuter ${drop}, plus que les ${supply} de l’alimentation. Ce courant ne peut pas circuler ici; la charge ne recevrait presque rien.`,
  },
  words: (v) =>
    `${v.current} fait l’aller-retour dans ${v.conductor} de cuivre, soit ${v.resistance} au total. Selon la loi d’Ohm, cette résistance prend ${v.drop}; la charge reçoit donc ${v.load} sur ${v.supply}. Le même courant chauffe le câble de ${v.heat}.`,
  steps: {
    resistivity: 'Résistivité du cuivre à cette température',
    resistance: 'Résistance des deux conducteurs',
    drop: 'Volts perdus',
    heat: 'Chaleur dans le câble',
    load: 'Tension à la charge',
  },
  meter: (drop) =>
    `Charge en marche, mesurez la tension aux bornes de l’alimentation, puis aux bornes de la charge. L’écart est la chute : comptez environ ${drop}.`,
  meterExceeds: 'Mesurez la tension à la charge en marche : elle sera bien plus basse que l’alimentation, et le courant plus faible que prévu.',
  sketchLabel: (supply, drop, load, current) =>
    `Alimentation de ${supply} reliée à une charge par deux longs conducteurs parcourus par ${current}; ${drop} se perd dans les câbles et il reste ${load} à la charge.`,
};

export const wireCopy = { root, fr };
