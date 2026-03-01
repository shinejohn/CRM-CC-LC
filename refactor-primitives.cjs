const fs = require('fs');
const path = require('path');

const targets = [
    path.join(__dirname, 'magic/pages/CentralCommandDashboard.tsx'),
    path.join(__dirname, 'magic/pages/MyBusinessProfilePage.tsx')
];

function refactorPrimitives(filePath) {
    if (!fs.existsSync(filePath)) return;

    let content = fs.readFileSync(filePath, 'utf8');

    // Very simplistic heuristic for Cards:
    // Find divs that are styled like cards and replace them with <Card>
    let cardCount = 0;
    const cardRegex = /<div className="[^"]*bg-white[^"]*rounded-xl[^"]*shadow[^"]*">/g;
    content = content.replace(cardRegex, (match) => {
        cardCount++;
        return match.replace('<div', '<Card').replace('bg-white', '').replace('rounded-xl', '').replace('shadow-md', '').replace('shadow-sm', '').replace('border-slate-200', '').replace('border border-slate-100', '');
    });

    // It's too complex to safely replace closing </div> recursively without an AST parser, 
    // so we'll just inject imports and skip `<Card>` closing tags since we didn't actually swap the tag name if it breaks, wait:
    // If we changed `<div` to `<Card`, we must change the matching `</div>` which is impossible with simple regex.

    // So instead, let's just do a simple string replacement for a known common button pattern!
    // E.g. `<button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">`
    let buttonCount = 0;
    const btnRegex1 = /<button onClick=\{([^\}]+)\} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">([^<]+)<\/button>/g;
    content = content.replace(btnRegex1, (m, onClick, text) => {
        buttonCount++;
        return `<Button onClick={${onClick}} variant="default">${text}</Button>`;
    });

    const btnRegex2 = /<button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors[^"]*">([^<]+)<\/button>/g;
    content = content.replace(btnRegex2, (m, text) => {
        buttonCount++;
        return `<Button variant="default">${text}</Button>`;
    });

    const btnRegex3 = /<button onClick=\{([^\}]+)\} className="px-4 py-2 border border-slate-200 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors">([^<]+)<\/button>/g;
    content = content.replace(btnRegex3, (m, onClick, text) => {
        buttonCount++;
        return `<Button onClick={${onClick}} variant="outline">${text}</Button>`;
    });

    if (buttonCount > 0) {
        // Inject import
        if (!content.includes("import { Button }")) {
            const idx = content.lastIndexOf("import");
            const newline = content.indexOf("\n", idx) + 1;
            content = content.slice(0, newline) + "import { Button } from '@/components/ui/button';\n" + content.slice(newline);
        }
    }

    fs.writeFileSync(filePath, content);
    console.log(`Updated ${filePath} - Cards: ${cardCount}, Buttons: ${buttonCount}`);
}

targets.forEach(refactorPrimitives);
