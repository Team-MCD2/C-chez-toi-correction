import fs from 'fs';
import path from 'path';

const replacements = {
  'Ã©': 'é', 'Ã¨': 'è', 'Ãª': 'ê', 'Ã«': 'ë', 'Ã ': 'à', 'Ã€': 'À',
  'Ã¢': 'â', 'Ã¤': 'ä', 'Ã®': 'î', 'Ã¯': 'ï', 'Ã´': 'ô', 'Ã¶': 'ö',
  'Ã¹': 'ù', 'Ã»': 'û', 'Ã¼': 'ü', 'Ã§': 'ç', 'Å“': 'œ', 'ÃŽ': 'Î',
  'â€™': '’', 'Ã‰': 'É', 'Ãˆ': 'È', 'Ã': 'à'
};

const walk = dir => {
  fs.readdirSync(dir).forEach(file => {
    let fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) walk(fullPath);
    else if (['.astro', '.html', '.ts', '.css', '.js'].includes(path.extname(fullPath))) {
      let content = fs.readFileSync(fullPath, 'utf8');
      let modified = false;
      
      // Fix encoding
      for (let [bad, good] of Object.entries(replacements)) {
        if (content.includes(bad)) {
          content = content.split(bad).join(good);
          modified = true;
        }
      }
      
      // Remove entry-header
      const headerRegex = /<header class="entry-header[^>]*>[\s\S]*?<\/header>\s*<!-- \.entry-header -->/gi;
      if (headerRegex.test(content)) {
        content = content.replace(headerRegex, '');
        modified = true;
      }

      if (modified) fs.writeFileSync(fullPath, content);
    }
  });
};

try {
  walk('src');
  walk('public');
  console.log('done');
} catch (e) {
  console.error(e);
}
