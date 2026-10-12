import {
  GISCUS_CATEGORY,
  GISCUS_CATEGORY_ID,
  GISCUS_REPO,
  GISCUS_REPO_ID,
} from 'astro:env/server';

export interface GiscusConfig {
  repo: string;
  repoId: string;
  category: string;
  categoryId: string;
}

const values = {
  repo: GISCUS_REPO,
  repoId: GISCUS_REPO_ID,
  category: GISCUS_CATEGORY,
  categoryId: GISCUS_CATEGORY_ID,
};

const configuredCount = Object.values(values).filter(Boolean).length;

if (configuredCount > 0 && configuredCount < Object.keys(values).length) {
  throw new Error(
    'Giscus configuration is incomplete. Set GISCUS_REPO, GISCUS_REPO_ID, GISCUS_CATEGORY, and GISCUS_CATEGORY_ID together.',
  );
}

if (GISCUS_REPO && !/^[A-Za-z0-9_.-]+\/[A-Za-z0-9_.-]+$/.test(GISCUS_REPO)) {
  throw new Error('GISCUS_REPO must use the owner/repository format.');
}

for (const [name, value] of [
  ['GISCUS_REPO_ID', GISCUS_REPO_ID],
  ['GISCUS_CATEGORY_ID', GISCUS_CATEGORY_ID],
] as const) {
  if (value && !/^[A-Za-z0-9_+/=-]+$/.test(value)) {
    throw new Error(`${name} contains invalid characters.`);
  }
}

if (GISCUS_CATEGORY && /[<>\u0000-\u001F]/.test(GISCUS_CATEGORY)) {
  throw new Error('GISCUS_CATEGORY contains invalid characters.');
}

export const giscusConfig: GiscusConfig | undefined =
  GISCUS_REPO && GISCUS_REPO_ID && GISCUS_CATEGORY && GISCUS_CATEGORY_ID
    ? {
        repo: GISCUS_REPO,
        repoId: GISCUS_REPO_ID,
        category: GISCUS_CATEGORY,
        categoryId: GISCUS_CATEGORY_ID,
      }
    : undefined;
