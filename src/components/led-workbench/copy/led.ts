// Text of the LED resistor scenario. Values arrive already formatted with their units.
const root = {
  tab: 'LED resistor',
  title: 'Size the series resistor for an LED',
  intro: 'Start from the supply and the LED datasheet. Presets come from named datasheets; pick custom to type your own part.',
  fields: {
    supplyVoltage: 'Supply voltage',
    preset: 'LED',
    forwardVoltageTyp: 'Forward voltage, typical',
    forwardVoltageMax: 'Forward voltage, maximum',
    current: 'Current you want',
    ratedCurrent: 'Maximum DC current (datasheet)',
    count: 'LEDs in series',
    series: 'Resistor series',
  },
  colours: { red: 'Red', yellow: 'Yellow', blue: 'Blue', white: 'White' } as Record<string, string>,
  presetOption: (colour: string, part: string, vf: string, at: string) => `${colour}: ${part} (${vf} typical at ${at})`,
  seriesOption: { E24: 'E24 (5% parts)', E12: 'E12 (10% parts)' },
  maxBelowTyp: 'The maximum forward voltage can’t be below the typical one.',
  readout: {
    resistance: 'Resistor to fit',
    exactResistance: 'Exact value',
    currentTyp: 'Current with that resistor',
    currentAtMaxVf: 'Current if Vf is at its maximum',
    resistorPower: 'Power in the resistor',
    rating: 'Resistor rating (2× margin)',
    ledPower: 'Power in the LEDs',
  },
  noRating: 'over 2 W',
  flags: {
    noHeadroom: (string: string, supply: string) =>
      `No headroom: the LEDs need ${string}, which isn’t below the ${supply} supply, so they won’t light properly. Use a higher supply or fewer LEDs in series.`,
    overRated: (current: string, rated: string) => `${current} is above the ${rated} maximum DC current in the datasheet. Ask for less current.`,
    littleHeadroom: (low: string, high: string) =>
      `Little headroom: brightness will vary a lot from one LED to the next. Depending on where the part’s Vf falls, the current could be anywhere from ${low} to ${high}.`,
    warm: (rating: string) => `Resistor runs warm: use a ${rating} part.`,
    hot: (power: string) => `The resistor turns ${power} into heat, too much for a 2 W part with margin. Drop fewer volts across it: a lower supply or more LEDs in series.`,
  },
  words: (v: { supply: string; leds: string; ledsTake: string; string: string; headroom: string; exact: string; current: string; series: string; resistance: string; actual: string }) =>
    `The ${v.supply} supply shares its voltage between ${v.leds} and the resistor. ${v.ledsTake}, so ${v.headroom} is left across the resistor. Ohm’s law on the resistor gives ${v.exact} for ${v.current}. The next ${v.series} value up is ${v.resistance}, which lets ${v.actual} flow.`,
  wordsNoHeadroom: (v: { supply: string; leds: string; string: string }) =>
    `${v.leds.charAt(0).toUpperCase()}${v.leds.slice(1)} need${v.leds === 'the LED' ? 's' : ''} about ${v.string} before any current flows. The ${v.supply} supply doesn’t reach that, so there is nothing left for a resistor to set the current with.`,
  leds: (count: number) => (count === 1 ? 'the LED' : `the ${count} LEDs`),
  ledsTake: (count: number, voltage: string) => (count === 1 ? `The LED takes about ${voltage}` : `Together the LEDs take about ${voltage}`),
  steps: {
    headroom: 'Volts across the resistor',
    resistance: 'Resistance for the current you want',
    actual: 'Current with the standard part',
    atMax: 'Current if Vf is at its maximum',
    power: 'Resistor power, then the 2× margin',
  },
  meter: (headroom: string, resistance: string, current: string) =>
    `With the circuit on, measure across the resistor: expect about ${headroom}. Divide that reading by ${resistance} to get the LED current (about ${current}). Or put the meter in series on its mA range and read the current directly.`,
  meterNoHeadroom: 'Measure the supply with the LEDs connected. If it reads below the LEDs’ forward voltage, they will stay dark or barely glow.',
  sketchLabel: (supply: string, resistance: string, current: string, vf: string) =>
    `Series loop: a ${supply} supply, a ${resistance} resistor and the LEDs at ${vf}, with ${current} flowing.`,
};

export type LedCopy = typeof root;

const fr: LedCopy = {
  tab: 'Résistance pour LED',
  title: 'Choisir la résistance série d’une LED',
  intro: 'Partez de l’alimentation et de la fiche technique de la LED. Les préréglages viennent de fiches nommées; choisissez « personnalisé » pour votre propre composant.',
  fields: {
    supplyVoltage: 'Tension d’alimentation',
    preset: 'LED',
    forwardVoltageTyp: 'Tension directe typique',
    forwardVoltageMax: 'Tension directe maximale',
    current: 'Courant voulu',
    ratedCurrent: 'Courant continu maximal (fiche)',
    count: 'LED en série',
    series: 'Série de résistances',
  },
  colours: { red: 'Rouge', yellow: 'Jaune', blue: 'Bleue', white: 'Blanche' },
  presetOption: (colour, part, vf, at) => `${colour} : ${part} (${vf} typique à ${at})`,
  seriesOption: { E24: 'E24 (pièces à 5\u00a0%)', E12: 'E12 (pièces à 10\u00a0%)' },
  maxBelowTyp: 'La tension directe maximale ne peut pas être inférieure à la typique.',
  readout: {
    resistance: 'Résistance à poser',
    exactResistance: 'Valeur exacte',
    currentTyp: 'Courant avec cette résistance',
    currentAtMaxVf: 'Courant si Vf est au maximum',
    resistorPower: 'Puissance dans la résistance',
    rating: 'Puissance nominale (marge ×2)',
    ledPower: 'Puissance dans les LED',
  },
  noRating: 'plus de 2 W',
  flags: {
    noHeadroom: (string, supply) =>
      `Pas de marge : les LED demandent ${string}, ce qui n’est pas inférieur aux ${supply} de l’alimentation; elles n’éclaireront pas correctement. Prenez une alimentation plus haute ou moins de LED en série.`,
    overRated: (current, rated) => `${current} dépasse le courant continu maximal de ${rated} de la fiche technique. Visez un courant plus faible.`,
    littleHeadroom: (low, high) =>
      `Peu de marge : la luminosité variera beaucoup d’une LED à l’autre. Selon la Vf réelle du composant, le courant peut aller de ${low} à ${high}.`,
    warm: (rating) => `La résistance chauffe : prenez une pièce de ${rating}.`,
    hot: (power) => `La résistance transforme ${power} en chaleur, trop pour une pièce de 2 W avec marge. Faites-lui chuter moins de volts : alimentation plus basse ou plus de LED en série.`,
  },
  words: (v) =>
    `L’alimentation de ${v.supply} partage sa tension entre ${v.leds} et la résistance. ${v.ledsTake}; il reste donc ${v.headroom} aux bornes de la résistance. La loi d’Ohm appliquée à la résistance donne ${v.exact} pour ${v.current}. La valeur ${v.series} suivante est ${v.resistance}, qui laisse passer ${v.actual}.`,
  wordsNoHeadroom: (v) =>
    `${v.leds.charAt(0).toUpperCase()}${v.leds.slice(1)} demandent environ ${v.string} avant de conduire. L’alimentation de ${v.supply} n’y arrive pas : il ne reste rien pour qu’une résistance règle le courant.`,
  leds: (count) => (count === 1 ? 'la LED' : `les ${count} LED`),
  ledsTake: (count, voltage) => (count === 1 ? `La LED prend environ ${voltage}` : `Ensemble, les LED prennent environ ${voltage}`),
  steps: {
    headroom: 'Tension aux bornes de la résistance',
    resistance: 'Résistance pour le courant voulu',
    actual: 'Courant avec la valeur normalisée',
    atMax: 'Courant si Vf est au maximum',
    power: 'Puissance dans la résistance, puis marge ×2',
  },
  meter: (headroom, resistance, current) =>
    `Circuit sous tension, mesurez aux bornes de la résistance : comptez environ ${headroom}. Divisez cette lecture par ${resistance} pour obtenir le courant de la LED (environ ${current}). Ou placez le multimètre en série, calibre mA, et lisez le courant directement.`,
  meterNoHeadroom: 'Mesurez l’alimentation avec les LED branchées. Si elle est sous leur tension directe, elles resteront éteintes ou presque.',
  sketchLabel: (supply, resistance, current, vf) =>
    `Boucle série : alimentation de ${supply}, résistance de ${resistance} et LED à ${vf}, parcourues par ${current}.`,
};

export const ledCopy = { root, fr };
