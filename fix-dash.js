import fs from 'fs';
import path from 'path';

const replacements = {
  'â€”': '—', 'â€œ': '“', 'â€ ': '”', 'â€“': '–', 'Â': ''
};

const walk = dir => {
  fs.readdirSync(dir).forEach(file => {
    let fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) walk(fullPath);
    else if (['.astro', '.html', '.ts', '.css', '.js'].includes(path.extname(fullPath))) {
      let content = fs.readFileSync(fullPath, 'utf8');
      let modified = false;
      
      for (let [bad, good] of Object.entries(replacements)) {
        if (content.includes(bad)) {
          content = content.split(bad).join(good);
          modified = true;
        }
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
