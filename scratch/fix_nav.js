const fs = require('fs');
const path = require('path');

const publicDir = path.join(__dirname, '../public');

const getHtmlFiles = (dir) => {
    let results = [];
    const list = fs.readdirSync(dir);
    list.forEach(file => {
        file = path.join(dir, file);
        const stat = fs.statSync(file);
        if (stat && stat.isDirectory()) {
            results = results.concat(getHtmlFiles(file));
        } else if (file.endsWith('.html')) {
            results.push(file);
        }
    });
    return results;
};

const files = getHtmlFiles(publicDir);

files.forEach(file => {
    let content = fs.readFileSync(file, 'utf8');
    let changed = false;

    // Replace desktop nav-login
    const navLoginRegex = /<a[^>]*id="nav-login"[^>]*>([\s\S]*?)<\/a>/g;
    content = content.replace(navLoginRegex, (match) => {
        changed = true;
        // Keep the original href and id but standardize classes for an icon
        return `<a href="/auth.html" id="nav-login" class="hover:text-emerald-600 transition-colors flex items-center" title="Login / Register"><i class="fas fa-user-circle text-[1.35rem]"></i></a>`;
    });

    if (changed) {
        fs.writeFileSync(file, content, 'utf8');
        console.log(`Updated ${path.basename(file)}`);
    }
});
console.log('Done fixing navbar');
