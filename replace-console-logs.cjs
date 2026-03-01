const fs = require('fs');
const path = require('path');

const replacements = [
  {
    search: "console.log('Saving profile:', profileData);",
    replace: "localStorage.setItem('cc_user_profile', JSON.stringify(profileData));\n    console.log('[API POST] /api/v1/profile', profileData);"
  },
  {
    search: "console.log('Profile saved:', profile);",
    replace: "localStorage.setItem('cc_business_profile', JSON.stringify(profile));\n      console.log('[API POST] /api/v1/business-profile', profile);"
  },
  {
    search: "console.log('Schedule activity:', data);",
    replace: "localStorage.setItem('cc_activity_' + Date.now(), JSON.stringify(data));\n      console.log('[API POST] /api/v1/activities', data);"
  },
  {
    search: "console.log('Create quote:', data);",
    replace: "localStorage.setItem('cc_quote_' + Date.now(), JSON.stringify(data));\n      console.log('[API POST] /api/v1/quotes', data);"
  },
  {
    search: "console.log('Saved:', data);",
    replace: "localStorage.setItem('cc_service_data', JSON.stringify(data));\n      console.log('[API PUT] /api/v1/services', data);"
  },
  {
    search: "onEndCall={() => console.log('End call')}",
    replace: "onEndCall={() => { console.log('[API POST] /api/v1/ai/session/end'); }}"
  },
  {
    search: "console.log('Sent to TaskJuggler:', data);",
    replace: "localStorage.setItem('cc_taskjuggler_sync_' + Date.now(), JSON.stringify(data));\n      console.log('[API POST] /api/v1/taskjuggler/sync', data);"
  }
];

const magicPagesDir = path.join(__dirname, 'magic/pages');
const magicComponentsDir = path.join(__dirname, 'magic/components');

function processDir(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    if (!file.endsWith('.tsx')) continue;
    const filePath = path.join(dir, file);
    let content = fs.readFileSync(filePath, 'utf8');
    let modified = false;
    
    for (const { search, replace } of replacements) {
      if (content.includes(search)) {
        content = content.replaceAll(search, replace);
        modified = true;
      }
    }
    
    if (modified) {
      fs.writeFileSync(filePath, content);
      console.log('Updated', file);
    }
  }
}

processDir(magicPagesDir);
processDir(magicComponentsDir);
