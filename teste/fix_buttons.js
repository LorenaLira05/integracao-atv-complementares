const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'frontend', 'pages', 'coordenadores.html');
let content = fs.readFileSync(filePath, 'utf8');

// The user's code formatter split the button into multiple lines.
// We will replace all occurrences of the edit button with a proper <a> tag.
const regex = /<button class="btn-acao-icon"[\s\S]*?onclick="window\.location\.href='editar_coordenador\.html'"[\s\S]*?>[\s\S]*?<i\s+class='bx bx-pencil'><\/i>[\s\S]*?<\/button>/g;

content = content.replace(regex, `<a href="editar_coordenador.html" class="btn-acao-icon" style="text-decoration:none;"><i class='bx bx-pencil'></i></a>`);

fs.writeFileSync(filePath, content, 'utf8');
console.log('Fixed buttons in coordenadores.html');
