const fs = require('fs');
const path = require('path');

const magicPagesDir = path.join(__dirname, 'magic/pages');
const files = fs.readdirSync(magicPagesDir).filter(f => f.endsWith('.tsx'));

let imports = `import React from 'react';\nimport { Route, Outlet } from 'react-router';\nimport { AppShell as MagicAppShell } from '../magic/components/AppShell';\n\n`;
let routes = `export function getMagicRoutes() {\n  return (\n    <Route path="/magic" element={<MagicAppShell><Outlet/></MagicAppShell>}>\n`;

for (const file of files) {
    const componentName = file.replace('.tsx', '');
    let routePath = componentName.toLowerCase();
    
    // Read to check export
    const content = fs.readFileSync(path.join(magicPagesDir, file), 'utf8');
    let realExport = componentName;
    if (content.includes(`export function ${componentName}`)) {
        realExport = componentName;
    } else {
        // Find the actual export function
        const match = content.match(/export function ([a-zA-Z0-9_]+)/);
        if (match) realExport = match[1];
        else continue; // Skip if no export function
    }

    imports += `import { ${realExport} } from '../magic/pages/${componentName}';\n`;
    routes += `      <Route path="${routePath}" element={<${realExport} />} />\n`;
}

routes += `    </Route>\n  );\n}\n`;

fs.writeFileSync(path.join(__dirname, 'src/command-center/MagicRoutes.tsx'), imports + routes);
console.log('Successfully generated src/command-center/MagicRoutes.tsx');
