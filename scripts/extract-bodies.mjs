import fs from 'node:fs';
import path from 'node:path';

const pagesDir = 'src/pages';
const outDir = 'src/components/pages';

fs.mkdirSync(outDir, { recursive: true });

const map = {
  'index.astro': 'HomeBody.astro',
  'services.astro': 'ServicesBody.astro',
  'projets.astro': 'ProjetsBody.astro',
  'contact.astro': 'ContactBody.astro',
  'a-propos-de-c-chez-toit.astro': 'AProposBody.astro',
  'mentions-legales.astro': 'MentionsLegalesBody.astro',
  'politique-de-confidentialite.astro': 'PolitiqueBody.astro',
};

for (const file of Object.keys(map)) {
  const src = path.join(pagesDir, file);
  const content = fs.readFileSync(src, 'utf8');
  const marker = 'const mainHtml = `';
  const start = content.indexOf(marker);
  if (start === -1) {
    console.warn('no mainHtml in', file);
    continue;
  }
  const bodyStart = start + marker.length;
  const layoutMarker = '\r\n---\r\n<Layout';
  const layoutIdx = content.indexOf(layoutMarker, bodyStart);
  if (layoutIdx === -1) {
    console.warn('no Layout marker in', file);
    continue;
  }
  let end = layoutIdx;
  while (end > bodyStart && content[end - 1] !== '`') end--;
  end -= 1;
  const html = content.slice(bodyStart, end).trim();
  const out = `---
/** Structure HTML Elementor d'origine — ${file} */
---

${html}
`;
  fs.writeFileSync(path.join(outDir, map[file]), out);
  console.log('wrote', map[file], html.length, 'chars');
}
