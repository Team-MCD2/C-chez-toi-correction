import fs from 'node:fs';
import path from 'node:path';

const pages = [
  'index.astro',
  'services.astro',
  'projets.astro',
  'contact.astro',
  'a-propos-de-c-chez-toit.astro',
  'mentions-legales.astro',
  'politique-de-confidentialite.astro',
];

const out = {};

for (const file of pages) {
  const c = fs.readFileSync(path.join('src/pages', file), 'utf8');
  const bodyMatch = c.match(/const bodyClass = "([^"]+)"/);
  const headMatch = c.match(/const headHtml = `([\s\S]*?)`;\s*\r?\nconst preHtml/);
  const styles = [];
  if (headMatch) {
    const re = /<link href="(\/assets\/wp-content\/uploads\/elementor\/css\/post-\d+[^"]+)"[^>]*rel="stylesheet"/g;
    let m;
    while ((m = re.exec(headMatch[1]))) {
      if (!styles.includes(m[1])) styles.push(m[1]);
    }
  }
  const postId = bodyMatch?.[1].match(/page-id-(\d+)/)?.[1] ?? '';
  const key = file.replace('.astro', '').replace('index', 'home');
  out[key] = {
    bodyClass: bodyMatch?.[1] ?? '',
    elementorPostCss: styles.filter((s) => /post-(?!154|82)\d+/.test(s)),
  };
}

const ts = `/** Meta Elementor par page — genere par scripts/extract-page-meta.mjs */
export type ElementorPageMeta = {
  bodyClass: string;
  elementorPostCss: string[];
};

export const elementorPages: Record<string, ElementorPageMeta> = ${JSON.stringify(out, null, 2)};
`;

fs.writeFileSync('src/data/elementor-pages.ts', ts);
console.log('wrote src/data/elementor-pages.ts');
