const fs = require('fs');
const path = require('path');

const publicDir = path.join(__dirname, '..', 'public');

function getAllHtmlFiles(dir) {
    let results = [];
    const list = fs.readdirSync(dir);
    list.forEach(file => {
        file = path.join(dir, file);
        const stat = fs.statSync(file);
        if (stat && stat.isDirectory()) {
            results = results.concat(getAllHtmlFiles(file));
        } else if (file.endsWith('.html')) {
            results.push(file);
        }
    });
    return results;
}

const htmlFiles = getAllHtmlFiles(publicDir);

htmlFiles.forEach(file => {
    let content = fs.readFileSync(file, 'utf8');
    
    // Change sticky to fixed top-0 left-0 w-full
    // Match <header class="sticky top-0 z-50 ..."> or <header class="sticky ...">
    const headerRegex = /<header\s+class="sticky\s+/g;
    if (headerRegex.test(content)) {
        console.log(`Updating header in : ${file}`);
        content = content.replace(headerRegex, '<header class="fixed top-0 left-0 w-full ');
        fs.writeFileSync(file, content);
    }
});

console.log('Navbar stickiness updated across all pages.');
