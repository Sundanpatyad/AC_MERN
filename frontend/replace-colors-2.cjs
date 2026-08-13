const fs = require('fs');
const path = require('path');

const replacements = {
  // Backgrounds
  'dark:bg-zinc-900': 'dark:bg-page',
  'bg-zinc-950': 'bg-page',
  'bg-zinc-900/80': 'bg-page',
  'bg-zinc-900/60': 'bg-page',
  'bg-zinc-900/40': 'bg-page',
  'bg-zinc-900/30': 'bg-page',
  'bg-zinc-900/20': 'bg-page',
  'bg-zinc-800/60': 'bg-surface',
  'bg-zinc-800/50': 'bg-surface',
  'bg-zinc-800/40': 'bg-surface',
  'bg-zinc-800/30': 'bg-surface',
  'bg-zinc-800/20': 'bg-surface',
  
  // Hovers Backgrounds
  'hover:bg-richblack-900': 'hover:bg-page',
  'hover:bg-richblack-800': 'hover:bg-surface',
  'hover:bg-richblack-700': 'hover:bg-elevated',
  'hover:bg-richblack-600': 'hover:bg-elevated',
  'hover:bg-zinc-900': 'hover:bg-page',
  'hover:bg-zinc-900/60': 'hover:bg-page',
  'hover:bg-zinc-900/40': 'hover:bg-page',
  'hover:bg-zinc-800': 'hover:bg-surface',
  'hover:bg-zinc-800/50': 'hover:bg-surface',
  'hover:bg-zinc-700': 'hover:bg-elevated',
  'hover:bg-zinc-600': 'hover:bg-elevated',
  'hover:bg-zinc-200': 'hover:bg-elevated',
  
  // Text
  'dark:text-zinc-500': 'dark:text-subtle',
  'text-zinc-700': 'text-muted',
  'text-zinc-800': 'text-fg',
  'text-richblack-800': 'text-fg',
  
  // Hovers Text
  'hover:text-zinc-300': 'hover:text-fg',
  'hover:text-zinc-400': 'hover:text-muted',
  'hover:text-richblack-25': 'hover:text-fg',
  'group-hover:text-zinc-300': 'group-hover:text-fg',
  'group-hover:text-zinc-400': 'group-hover:text-muted',
  
  // Borders
  'border-zinc-900': 'border-line',
  'border-zinc-800/60': 'border-line',
  'border-zinc-700/30': 'border-line',
  'border-zinc-500': 'border-line',
  'border-zinc-400': 'border-line',
  'border-zinc-300': 'border-line',
  'border-richblack-400': 'border-line',
  
  // Hovers Borders
  'hover:border-zinc-700': 'hover:border-muted',
  'hover:border-zinc-600': 'hover:border-muted',
  'hover:border-zinc-500': 'hover:border-muted',
  'group-hover:border-zinc-500': 'group-hover:border-muted',
  'group-hover:border-zinc-400': 'group-hover:border-muted',
  
  // Focus Borders
  'focus:border-zinc-600': 'focus:border-muted',
};

function walk(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    if (stat && stat.isDirectory()) {
      results = results.concat(walk(filePath));
    } else {
      if (filePath.endsWith('.jsx') || filePath.endsWith('.tsx') || filePath.endsWith('.js')) {
        results.push(filePath);
      }
    }
  });
  return results;
}

const files = walk('./src');
let changedFiles = 0;

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  let originalContent = content;
  
  for (const [key, value] of Object.entries(replacements)) {
    const escapedKey = key.replace(/\//g, '\\/');
    const regex = new RegExp(`(?<=[\\s"'\\\`{}])${escapedKey}(?=[\\s"'\\\`}])`, 'g');
    content = content.replace(regex, value);
  }
  
  if (content !== originalContent) {
    fs.writeFileSync(file, content, 'utf8');
    changedFiles++;
    console.log(`Updated ${file}`);
  }
});

console.log(`Done. Updated ${changedFiles} files.`);
