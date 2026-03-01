const fs = require('fs');
const path = require('path');

const magicPagesDir = path.join(__dirname, 'magic/pages');
const magicComponentsDir = path.join(__dirname, 'magic/components');

function processDir(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    if (!file.endsWith('.tsx')) continue;
    const filePath = path.join(dir, file);
    let content = fs.readFileSync(filePath, 'utf8');
    
    // We only process if it has setTimeout and doesn't have simulateApiDelay
    if (content.includes('setTimeout(') && !content.includes('simulateApiDelay')) {
      // Very basic transformation for simple setTimeout blocks
      // It looks for: setTimeout(() => {\n  body\n}, 1500);
      const regex = /setTimeout\(\(\)\s*=>\s*\{([\s\S]*?)\},\s*(\d+)\);/g;
      const originalContent = content;
      
      content = content.replace(regex, (match, body, delay) => {
        return `simulateApiDelay(${delay}).then(() => {${body}});`;
      });

      // Special case for inline setTimeout(() => setSomething(false), 2000);
      const regexInline = /setTimeout\(\(\)\s*=>\s*(.+?),\s*(\d+)\);/g;
      content = content.replace(regexInline, (match, expression, delay) => {
        if (expression.startsWith('{')) return match; // skip if already captured by previous
        return `simulateApiDelay(${delay}).then(() => ${expression});`;
      });
      
      if (content !== originalContent) {
         // insert import at the top
         const importStmt = `import { simulateApiDelay } from '../utils/mockApi';\n`;
         // correct path if it's in pages vs components
         const relativePath = dir.includes('pages') ? '../../magic/utils/mockApi' : '../utils/mockApi';
         const finalImport = `import { simulateApiDelay } from '${relativePath}';\n`;
         
         const lines = content.split('\n');
         const lastImportIdx = lines.findLastIndex(l => l.startsWith('import '));
         lines.splice(lastImportIdx + 1, 0, finalImport);
         
         fs.writeFileSync(filePath, lines.join('\n'));
         console.log('Replaced timeouts in', file);
      }
    }
  }
}

processDir(magicPagesDir);
processDir(magicComponentsDir);
console.log('Timeout replacement complete.');
