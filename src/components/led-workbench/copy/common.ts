// Interface text shared by every scenario panel.
const root = {
  workbench: 'LED resistor scenario workbench',
  tabs: 'Scenarios',
  controls: 'Your parts',
  readout: 'Answer',
  flags: 'Checks',
  allClear: 'Nothing to flag with these values.',
  views: { words: 'In words', sketch: 'Sketch', maths: 'Maths', meter: 'Check it with a meter' },
  source: 'Source',
  custom: 'Custom (type your datasheet values)',
  optional: 'optional',
  invalid: {
    empty: (label: string) => `Enter a value for “${label}”.`,
    notNumber: (label: string) => `“${label}” must be a number.`,
    range: (label: string, min: string, max: string) => `Enter “${label}” between ${min} and ${max}.`,
  },
  educational: 'Theory model only: it shows circuit relationships, it does not size, approve or certify electrical work. An original Fieldbook tool.',
};

export type CommonCopy = typeof root;

const fr: CommonCopy = {
  workbench: 'Atelier de scénarios : résistance pour LED',
  tabs: 'Scénarios',
  controls: 'Vos composants',
  readout: 'Réponse',
  flags: 'Vérifications',
  allClear: 'Rien à signaler avec ces valeurs.',
  views: { words: 'En mots', sketch: 'Schéma', maths: 'Calculs', meter: 'Vérifier au multimètre' },
  source: 'Source',
  custom: 'Personnalisé (entrez les valeurs de votre fiche technique)',
  optional: 'facultatif',
  invalid: {
    empty: (label) => `Entrez une valeur pour « ${label} ».`,
    notNumber: (label) => `« ${label} » doit être un nombre.`,
    range: (label, min, max) => `Entrez « ${label} » entre ${min} et ${max}.`,
  },
  educational: 'Modèle théorique seulement : il montre les relations dans le circuit, il ne sert pas à dimensionner, approuver ou certifier des travaux électriques. Outil original de Fieldbook.',
};

export const commonCopy = { root, fr };
