import fs from 'node:fs';

const pages = [
  { file: 'index.astro', key: 'home', body: 'HomeBody', zone: true, canonical: '/' },
  { file: 'services.astro', key: 'services', body: 'ServicesBody', zone: true, schemas: ['ServiceSchema', 'ReviewSchema'] },
  { file: 'projets.astro', key: 'projets', body: 'ProjetsBody', zone: true },
  { file: 'contact.astro', key: 'contact', body: 'ContactBody', zone: false },
  { file: 'a-propos-de-c-chez-toit.astro', key: 'a-propos-de-c-chez-toit', body: 'AProposBody', zone: true },
  { file: 'mentions-legales.astro', key: 'mentions-legales', body: 'MentionsLegalesBody', zone: false },
  { file: 'politique-de-confidentialite.astro', key: 'politique-de-confidentialite', body: 'PolitiqueBody', zone: false },
];

for (const p of pages) {
  const old = fs.readFileSync(`src/pages/${p.file}`, 'utf8');
  const titleM = old.match(/const title = `([^`]+)`/);
  const descM = old.match(/const description = `([^`]+)`/);
  const attrsM = old.match(/const bodyAttrs = (\{[\s\S]*?\});/);
  const canonicalM = old.match(/canonical="([^"]+)"/);

  const imports = [
    "import Layout from '../layouts/Layout.astro';",
    `import ${p.body} from '../components/pages/${p.body}.astro';`,
    "import { elementorPages } from '../data/elementor-pages';",
  ];
  if (p.zone) imports.push("import ZoneIntervention from '../components/ZoneIntervention.astro';");
  if (p.schemas) {
    for (const s of p.schemas) {
      imports.push(`import ${s} from '../components/seo/${s}.astro';`);
    }
  }

  const meta = `const meta = elementorPages['${p.key}'];`;
  const title = titleM ? `const title = \`${titleM[1]}\`;` : '';
  const description = descM ? `const description = \`${descM[1]}\`;` : '';
  const attrs = attrsM ? `const bodyAttrs = ${attrsM[1]};` : 'const bodyAttrs = {};';
  const schemaSlots = (p.schemas || []).map((s) => `  <${s} />`).join('\n');
  const zoneSlot = p.zone ? '  <ZoneIntervention variant="soft" />' : '';

  const content = `---
${imports.join('\n')}

${meta}
${title}
${description}
${attrs}
const elementorPostId = meta.bodyClass.match(/page-id-(\\d+)/)?.[1] ?? '0';
---
<Layout
  title={title}
  description={description}
  htmlLang="fr-FR"
  bodyClass={meta.bodyClass}
  bodyAttrs={bodyAttrs}
  elementor
  elementorPostCss={meta.elementorPostCss}
  elementorPostId={Number(elementorPostId)}
  ${canonicalM ? `canonical="${canonicalM[1]}"` : ''}
>
  <${p.body} />
${zoneSlot}
${schemaSlots}
</Layout>
`;

  fs.writeFileSync(`src/pages/${p.file}`, content.replace(/\n\n+/g, '\n\n'));
  console.log('wrote', p.file);
}
