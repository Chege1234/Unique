const fs = require('fs');
const path = require('path');

function renameToJsx(dir) {
    if (!fs.existsSync(dir)) return;
    const files = fs.readdirSync(dir);
    for (const file of files) {
        const fullPath = path.join(dir, file);
        if (fs.statSync(fullPath).isDirectory()) {
            renameToJsx(fullPath);
        } else {
            const ext = path.extname(fullPath);
            if (ext === '' || ext === '.js') {
                fs.renameSync(fullPath, fullPath + (ext === '' ? '.jsx' : 'x'));
                console.log(`Renamed ${fullPath}`);
            }
        }
    }
}

renameToJsx(path.join(__dirname, 'Pages'));
renameToJsx(path.join(__dirname, 'Components'));

if (fs.existsSync('Layout.js')) {
    fs.renameSync('Layout.js', 'Layout.jsx');
    console.log('Renamed Layout.js');
}
