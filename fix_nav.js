const fs = require('fs');
const path = require('path');

const publicDir = 'public';
const files = fs.readdirSync(publicDir).filter(f => f.endsWith('.html'));

files.forEach(file => {
    const filePath = path.join(publicDir, file);
    let content = fs.readFileSync(filePath, 'utf8');
    
    // There are two navbars, Desktop and Mobile
    // 1. Desktop: <nav class=\"hidden xl:flex ...
    // 2. Mobile: <nav class=\"flex flex-col ...
    
    const reorderNavLinks = (navContent) => {
        // Extract the three matching tags (if present)
        const contactMatch = navContent.match(/<a href="\/contact\.html"[^>]*>.*?<\/a>/s);
        const authMatch = navContent.match(/<a href="\/auth\.html"[^>]*>.*?<\/a>/s);
        const dashMatch = navContent.match(/<a href="\/dashboard\.html"[^>]*>.*?<\/a>/s);
        
        if (!contactMatch || !authMatch || !dashMatch) return navContent;
        
        let newNavContent = navContent;
        
        // Remove them from current navContent
        newNavContent = newNavContent.replace(contactMatch[0], '');
        newNavContent = newNavContent.replace(authMatch[0], '');
        newNavContent = newNavContent.replace(dashMatch[0], '');
        
        // Let's find where to insert them. In the standard template, they are at the end, 
        // right before either the closing </nav> or the logout button.
        // We will insert them right before <button id=\"*nav-logout\" or </nav>
        
        const insertionString = `\n                ${contactMatch[0].trim()}\n                ${authMatch[0].trim()}\n                ${dashMatch[0].trim()}\n`;
        
        if (newNavContent.includes('<button id="mobile-nav-logout"')) {
            newNavContent = newNavContent.replace(/(<button id="mobile-nav-logout"[^>]*>.*?<\/button>)/s, insertionString + '                $1');
        } else {
            newNavContent = newNavContent.replace(/<\/nav>/, insertionString + '            </nav>');
        }
        
        // Clean up any double blank lines introduced by the removals
        newNavContent = newNavContent.replace(/\n\s*\n\s*\n/g, '\n\n');
        
        return newNavContent;
    };

    let modifiedContent = content;

    // Desktop replacement
    modifiedContent = modifiedContent.replace(/(<nav class="hidden xl:flex[^>]*>)(.*?)(<\/nav>)/s, (match, p1, p2, p3) => {
        return p1 + reorderNavLinks(p2) + p3;
    });

    // Mobile replacement
    modifiedContent = modifiedContent.replace(/(<nav class="flex flex-col[^>]*>)(.*?)(<\/nav>)/s, (match, p1, p2, p3) => {
        return p1 + reorderNavLinks(p2) + p3;
    });

    if (content !== modifiedContent) {
        fs.writeFileSync(filePath, modifiedContent);
        console.log(`Updated ${file}`);
    }
});
