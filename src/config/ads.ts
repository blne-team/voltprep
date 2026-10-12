import {
  PUBLIC_GOOGLE_ADSENSE_CLIENT_ID,
  PUBLIC_GOOGLE_ADSENSE_CONTENT_SLOT,
  PUBLIC_GOOGLE_ADSENSE_FOOTER_SLOT,
  PUBLIC_GOOGLE_ADSENSE_HOME_SLOT,
} from 'astro:env/client';

export type AdPlacement = 'home' | 'content' | 'footer';

interface AdPlacementConfig {
  format: 'auto' | 'horizontal';
  slot?: string;
}

function validateClientId(value: string | undefined): string | undefined {
  if (!value) return undefined;
  if (!/^ca-pub-\d{16}$/.test(value)) {
    throw new Error('PUBLIC_GOOGLE_ADSENSE_CLIENT_ID must match ca-pub- followed by 16 digits.');
  }
  return value;
}

function validateSlot(name: string, value: string | undefined): string | undefined {
  if (!value) return undefined;
  if (!/^\d+$/.test(value)) throw new Error(`${name} must contain digits only.`);
  return value;
}

export const adsenseClientId = validateClientId(PUBLIC_GOOGLE_ADSENSE_CLIENT_ID);

export const adPlacements = {
  home: {
    format: 'horizontal',
    slot: validateSlot('PUBLIC_GOOGLE_ADSENSE_HOME_SLOT', PUBLIC_GOOGLE_ADSENSE_HOME_SLOT),
  },
  content: {
    format: 'auto',
    slot: validateSlot('PUBLIC_GOOGLE_ADSENSE_CONTENT_SLOT', PUBLIC_GOOGLE_ADSENSE_CONTENT_SLOT),
  },
  footer: {
    format: 'horizontal',
    slot: validateSlot('PUBLIC_GOOGLE_ADSENSE_FOOTER_SLOT', PUBLIC_GOOGLE_ADSENSE_FOOTER_SLOT),
  },
} satisfies Record<AdPlacement, AdPlacementConfig>;
