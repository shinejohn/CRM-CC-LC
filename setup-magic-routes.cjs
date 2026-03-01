const fs = require('fs');
const path = require('path');

const magicPagesDir = path.join(__dirname, 'magic/pages');
const files = fs.readdirSync(magicPagesDir).filter(f => f.endsWith('.tsx'));

let imports = `import React from 'react';\nimport { Route, Outlet, useNavigate } from 'react-router';\nimport { AppShell as MagicAppShell } from '../magic/components/AppShell';\n\n`;

imports += `const routeMap: Record<string, string> = {
  'billing': 'billingdashboard',
  'customers': 'customerslistpage',
  'customer-detail': 'customerdetailpage',
  'customer-add': 'addeditcustomerform',
  'customer-bulk-import': 'bulkcustomerimportpage',
  'contact-detail': 'contactdetailpage',
  'contact-add': 'contactdetailpage',
  'pipeline': 'pipelinepage',
  'deal-detail': 'dealdetailpage',
  'invoice-detail': 'invoicedetailpage',
  'invoice-new': 'invoicedetailpage',
  'business-configurator': 'businessconfiguratorpage',
  'business-info-edit': 'businessinfoeditpage',
  'marketing-diagnostic': 'marketingdiagnosticwizard',
  'process-builder': 'processbuilderpage',
  'faq-management': 'faqmanagementpage',
  'survey-management': 'surveymanagementpage',
  'alphasite-components': 'alphasitecomponentspage',
  'business': 'mybusinessprofilepage',
  'settings': 'businessmodesettingspage',
  'learning': 'learningcenterhub',
  'content-create': 'contentcreationflow',
  'content-type-selection': 'contenttypeselection',
  'session-detail': 'strategysessiondetail',
  'proposal-detail': 'proposaldetailpage',
  'implementation-detail': 'implementationprojectdetail',
  'course-detail': 'coursedetailpage',
  'root': 'centralcommanddashboard',
  'quote-new': 'quoteslistpage',
  'job-detail': 'jobboardpage'
};

function RouteWrapper({ children }: { children: React.ReactElement }) {
  const navigate = useNavigate();
  const handleNavigate = (path: string, param?: any) => {
    // Some routes pass an ID as the second parameter 'param'
    const target = routeMap[path];
    if (target) {
      navigate('/magic/' + target + (param ? '?id=' + param : ''));
    } else {
      console.log('Unhandled target mapping:', path);
      // Fallback
      navigate('/magic/' + path.replace(/[^a-zA-Z0-9]/g, '').toLowerCase() + 'page');
    }
  };
  return React.cloneElement(children, { onNavigate: handleNavigate });
}

`;

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
        const match = content.match(/export function ([a-zA-Z0-9_]+)/);
        if (match) realExport = match[1];
        else continue;
    }

    imports += `import { ${realExport} } from '../../magic/pages/${componentName}';\n`;
    routes += `      <Route path="${routePath}" element={<RouteWrapper><${realExport} /></RouteWrapper>} />\n`;
}

routes += `    </Route>\n  );\n}\n`;

fs.writeFileSync(path.join(__dirname, 'src/command-center/MagicRoutes.tsx'), imports + routes);
console.log('Successfully regenerated src/command-center/MagicRoutes.tsx with RouteWrapper!');
