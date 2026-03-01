const fs = require('fs');
const path = require('path');

const routesFile = path.join(__dirname, 'src/command-center/MagicRoutes.tsx');
let content = fs.readFileSync(routesFile, 'utf8');

const targets = [
    'BusinessConfiguratorPage',
    'BusinessInfoEditPage',
    'BusinessModeSettingsPage',
    'BusinessProfilePage',
    'ProfilePage',
    'B2BDashboard',
    'CollectionsDashboard',
    'ContentManagerDashboard',
    'OverviewDashboard',
    'PerformanceDashboard',
    'RetailDashboard',
    'ServicesDashboard'
];

targets.forEach(target => {
    // Remove import
    const importRegex = new RegExp(`import \\{ ${target} \\} from '\\.\\.\\/\\.\\.\\/magic\\/pages\\/${target}';\\n*`, 'g');
    content = content.replace(importRegex, '');

    // Remove Route element
    const routeRegex = new RegExp(`<Route path="${target.toLowerCase()}" element={<RouteWrapper><${target} \\/><\\/RouteWrapper>} \\/>\\n*`, 'g');
    content = content.replace(routeRegex, '');

    // Remove routeMap mapping if it strictly matches exactly
    const mapRegex = new RegExp(`\\s*'[^']+':\\s*'${target.toLowerCase()}',?\\n*`, 'g');
    // Wait, routeMap maps lowercase string targets to page names. 
    // Let's replace the value with the centralized targets!
    if (target.includes('Business') || target === 'ProfilePage') {
        content = content.replace(new RegExp(`'${target.toLowerCase()}'`, 'g'), `'mybusinessprofilepage'`);
    } else {
        content = content.replace(new RegExp(`'${target.toLowerCase()}'`, 'g'), `'centralcommanddashboard'`);
    }
});

// Since the mapRegex above replaces the values inside routeMap, some duplicates might exist but the map itself just works.
fs.writeFileSync(routesFile, content);
console.log('Cleaned up routes.');
