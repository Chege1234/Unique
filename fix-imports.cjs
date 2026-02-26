const fs = require('fs');
const path = require('path');

function fixImports(dir) {
    if (!fs.existsSync(dir)) return;
    const files = fs.readdirSync(dir);
    for (const file of files) {
        const fullPath = path.join(dir, file);
        if (fs.statSync(fullPath).isDirectory()) {
            fixImports(fullPath);
        } else if (fullPath.endsWith('.jsx') || fullPath.endsWith('.js')) {
            let content = fs.readFileSync(fullPath, 'utf8');
            const original = content;
            content = content.replace(/from\s+['"]@?\/?[cC]omponents\//g, "from \"@/Components/");
            content = content.replace(/from\s+"@\/Components\/([^"]+)'/g, 'from "@/Components/$1"');
            content = content.replace(/from\s+'@\/Components\/([^']+)"/g, "from '@/Components/$1'");
            if (original !== content) {
                fs.writeFileSync(fullPath, content);
                console.log(`Updated imports in ${fullPath}`);
            }
        }
    }
}

fixImports(path.join(__dirname, 'Pages'));
fixImports(path.join(__dirname, 'Components'));
fixImports(__dirname); // for Layout.jsx
