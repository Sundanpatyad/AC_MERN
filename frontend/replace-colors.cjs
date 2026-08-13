const fs = require('fs');
const path = require('path');

const replacements = {
  // Backgrounds
  'bg-richblack-900': 'bg-page',
  'bg-richblack-800': 'bg-surface',
  'bg-richblack-700': 'bg-elevated',
  'bg-richblack-600': 'bg-elevated',
  'bg-zinc-900': 'bg-page',
  'bg-zinc-800': 'bg-surface',
  'bg-zinc-700': 'bg-elevated',
  'bg-zinc-900/50': 'bg-page',
  'bg-zinc-800/50': 'bg-surface',
  'bg-zinc-800/60': 'bg-surface',
  
  // Text
  'text-richblack-5': 'text-fg',
  'text-richblack-25': 'text-fg',
  'text-richblack-50': 'text-fg',
  'text-richblack-100': 'text-muted',
  'text-richblack-200': 'text-muted',
  'text-richblack-300': 'text-subtle',
  'text-richblack-400': 'text-subtle',
  'text-richblack-500': 'text-subtle',
  'text-richblack-700': 'text-fg', // Sometimes used on light backgrounds, but let's see
  'text-richblack-800': 'text-fg',
  'text-richblack-900': 'text-fg',
  'text-zinc-100': 'text-fg',
  'text-zinc-200': 'text-fg',
  'text-zinc-300': 'text-muted',
  'text-zinc-400': 'text-muted',
  'text-zinc-500': 'text-subtle',
  'text-zinc-600': 'text-subtle',
  
  // Borders
  'border-richblack-800': 'border-line',
  'border-richblack-700': 'border-line',
  'border-richblack-600': 'border-line',
  'border-richblack-500': 'border-line',
  'border-zinc-800': 'border-line',
  'border-zinc-700': 'border-line',
  'border-zinc-600': 'border-line',
  'border-zinc-700/50': 'border-line',
  
  // Divide
  'divide-richblack-700': 'divide-line',
  'divide-richblack-800': 'divide-line',
  'divide-zinc-700': 'divide-line',
  'divide-zinc-800': 'divide-line',
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
  
  // Create a regex that matches any of the keys, ensuring word boundaries
  // We need to escape slashes in keys like bg-zinc-900/50
  for (const [key, value] of Object.entries(replacements)) {
    const escapedKey = key.replace(/\//g, '\\/');
    // Match the class name with word boundaries or quotes/spaces around it
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
