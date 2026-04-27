const fs = require('fs');
const path = require('path');

const pagesDir = path.join(__dirname, 'frontend', 'pages');

const files = fs.readdirSync(pagesDir).filter(f => f.endsWith('.html'));

let updatedFiles = 0;

for (const file of files) {
    const filePath = path.join(pagesDir, file);
    let content = fs.readFileSync(filePath, 'utf8');

    // Regex para encontrar <nav class="menu-navegacao"> ... </nav> e limpar o conteúdo
    const regex = /<nav class="menu-navegacao">[\s\S]*?<\/nav>/;
    if (regex.test(content)) {
        const novoContent = content.replace(regex, `<nav class="menu-navegacao">\n                <!-- Sidebar links will be dynamically injected by script.js -->\n            </nav>`);
        if (novoContent !== content) {
            fs.writeFileSync(filePath, novoContent, 'utf8');
            console.log(`Updated ${file}`);
            updatedFiles++;
        }
    }
}

console.log(`Successfully updated ${updatedFiles} files.`);
