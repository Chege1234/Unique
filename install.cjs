const cp = require('child_process');
try {
    cp.execSync('npx vite build', { stdio: 'pipe' });
} catch (e) {
    require('fs').writeFileSync('build-error.log', e.stdout.toString() + '\\n' + e.stderr.toString());
}
