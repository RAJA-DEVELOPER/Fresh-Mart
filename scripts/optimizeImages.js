const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const IMAGE_DIR = path.join(__dirname, '../public/images');

async function processDirectory(directory) {
    const files = fs.readdirSync(directory);

    for (const file of files) {
        const fullPath = path.join(directory, file);
        const stats = fs.statSync(fullPath);

        if (stats.isDirectory()) {
            await processDirectory(fullPath);
        } else if (/\.(png|jpe?g)$/i.test(file)) {
            const webpPath = fullPath.replace(/\.(png|jpe?g)$/i, '.webp');
            
            // Check if webp already exists and is newer
            if (fs.existsSync(webpPath)) {
                const webpStats = fs.statSync(webpPath);
                if (webpStats.mtime > stats.mtime) {
                    console.log(`Skipping ${file} (WebP already exists and is up to date)`);
                    continue;
                }
            }

            console.log(`Converting ${file} to WebP...`);
            try {
                await sharp(fullPath)
                    .webp({ quality: 80 })
                    .toFile(webpPath);
                
                const oldSize = (stats.size / 1024).toFixed(2);
                const newSize = (fs.statSync(webpPath).size / 1024).toFixed(2);
                console.log(`Successfully converted ${file}: ${oldSize}KB -> ${newSize}KB`);
            } catch (err) {
                console.error(`Error converting ${file}:`, err.message);
            }
        }
    }
}

console.log('Starting image optimization...');
processDirectory(IMAGE_DIR)
    .then(() => console.log('Image optimization complete!'))
    .catch(err => console.error('Error during optimization:', err));
