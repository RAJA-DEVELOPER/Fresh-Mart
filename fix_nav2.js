const fs = require('fs');

const desktopLinks = '\n                <a href=\"/contact.html\" class=\"hover:text-emerald-600 transition-colors\">Contact</a>\n                <a href=\"/auth.html\" id=\"nav-login\" class=\"hover:text-emerald-600 transition-colors flex items-center\" title=\"Login / Register\"><i class=\"fas fa-user-circle text-[1.35rem]\"></i></a>\n                <a href=\"/dashboard.html\" id=\"nav-dash\"\n                    class=\"hover:text-emerald-600 transition-colors hidden text-emerald-700\">Dashboard</a>\n';

const mobileLinks = '\n                    <a href=\"/contact.html\" class=\"hover:text-emerald-600 py-1 transition-colors\">Contact</a>\n                    <a href=\"/auth.html\" id=\"mobile-nav-login\"\n                        class=\"hover:text-emerald-600 py-1 transition-colors\">Login/Register</a>\n                    <a href=\"/dashboard.html\" id=\"mobile-nav-dash\"\n                        class=\"hover:text-emerald-600 py-1 transition-colors hidden\">Dashboard</a>\n                    <button id=\"mobile-nav-logout\" onclick=\"utils.logout()\"\n                        class=\"hidden text-left text-red-500 py-1 transition-colors font-bold mt-4 pt-4 border-t border-gray-100\">Sign\n                        Out</button>\n';

const files = fs.readdirSync('public').filter(f => f.endsWith('.html'));
files.forEach(f => {
    let content = fs.readFileSync('public/' + f, 'utf8');

    // Desktop Nav Fix
    content = content.replace(/(<nav class=\"hidden xl:flex items-center space-x-6 mx-4 text-sm font-semibold text-gray-600\">)(.*?)(<\/nav>)/s, (match, p1, p2, p3) => {
        if (!p2.includes('/contact.html')) {
            return p1 + p2.replace(/\s+$/, '') + desktopLinks + '            ' + p3;
        }
        return match;
    });

    // Mobile Nav Fix
    content = content.replace(/(<nav class=\"flex flex-col space-y-4 text-lg font-medium text-gray-600\">)(.*?)(<\/nav>)/s, (match, p1, p2, p3) => {
        if (!p2.includes('/contact.html')) {
            return p1 + p2.replace(/\s+$/, '') + mobileLinks + '                ' + p3;
        }
        return match;
    });

    fs.writeFileSync('public/' + f, content);
});
console.log('Fixed nav links exactly!');
