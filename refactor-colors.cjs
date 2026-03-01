const fs = require('fs');
const path = require('path');

const dirs = [
    path.join(__dirname, 'magic/pages'),
    path.join(__dirname, 'magic/components')
];

let allHexSet = new Set();
let fileChanges = [];

function parseDir(dir) {
    if (!fs.existsSync(dir)) return;
    const files = fs.readdirSync(dir);
    for (const f of files) {
        const fullPath = path.join(dir, f);
        if (fs.statSync(fullPath).isDirectory()) {
            parseDir(fullPath);
        } else if (fullPath.endsWith('.tsx') || fullPath.endsWith('.ts')) {
            let content = fs.readFileSync(fullPath, 'utf8');
            const hexRegex = /\[#([0-9a-fA-F]{3,8})\]/g;
            const matches = [...content.matchAll(hexRegex)];

            if (matches.length > 0) {
                matches.forEach(m => allHexSet.add(m[1].toLowerCase()));

                let newContent = content.replace(hexRegex, (match, hex) => {
                    return `[color:var(--nexus-${hex.toLowerCase()})]`;
                });

                // Also look for inline style or raw string #HEX where it's not wrapped in brackets
                // e.g. stroke="#3b82f6" -> stroke="var(--nexus-3b82f6)"
                const rawHexRegex = /(["'])(#[0-9a-fA-F]{3,8})\1/g;
                newContent = newContent.replace(rawHexRegex, (match, quote, hex) => {
                    // Exclude if it's within a Tailwind class that doesn't use brackets
                    if (match.includes('bg-') || match.includes('text-')) return match;
                    allHexSet.add(hex.substring(1).toLowerCase());
                    return `${quote}var(--nexus-${hex.substring(1).toLowerCase()})${quote}`;
                });

                fileChanges.push({ path: fullPath, content: newContent });
            } else {
                // Just in case there are raw hexes without brackets
                let newContent = content;
                const rawHexRegex = /(["'])(#[0-9a-fA-F]{3,8})\1/g;
                let changed = false;
                newContent = newContent.replace(rawHexRegex, (match, quote, hex) => {
                    // Skip short hashes that are likely not colors but IDs, or already wrapped inside brackets
                    if (content.includes(`[${hex}]`)) return match;
                    allHexSet.add(hex.substring(1).toLowerCase());
                    changed = true;
                    return `${quote}var(--nexus-${hex.substring(1).toLowerCase()})${quote}`;
                });
                if (changed) {
                    fileChanges.push({ path: fullPath, content: newContent });
                }
            }
        }
    }
}

dirs.forEach(parseDir);

console.log(`Found ${allHexSet.size} unique hex colors.`);

// Create CSS variables string
let cssVars = `\n/* ============================================
   NEXUS DYNAMIC THEME VARIABLES (Phase 3)
   ============================================ */
:root {
`;

[...allHexSet].sort().forEach(hex => {
    cssVars += `  --nexus-${hex}: #${hex};\n`;
});
cssVars += `}\n`;

// Append to index.css
const indexCssPath = path.join(__dirname, 'src/index.css');
if (fs.existsSync(indexCssPath)) {
    let indexContent = fs.readFileSync(indexCssPath, 'utf8');
    if (!indexContent.includes('NEXUS DYNAMIC THEME VARIABLES')) {
        fs.writeFileSync(indexCssPath, indexContent + cssVars);
        console.log('Appended CSS vars to src/index.css');
    }
}

// Write file changes
let count = 0;
fileChanges.forEach(fc => {
    fs.writeFileSync(fc.path, fc.content);
    count++;
});
console.log(`Updated ${count} files with CSS variables.`);
