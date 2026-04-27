const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'frontend', 'pages', 'coordenadores.html');
let content = fs.readFileSync(filePath, 'utf8');

const regex = /<a href="editar_coordenador\.html" class="btn-acao-icon"[\s\S]*?style="text-decoration:none;"><i class='bx bx-pencil'><\/i><\/a>/g;

content = content.replace(regex, `<button class="btn-acao-icon" onclick="window.location.href='editar_coordenador.html'"><i class='bx bx-pencil'></i></button>`);

fs.writeFileSync(filePath, content, 'utf8');
console.log('Reverted buttons back to <button> in coordenadores.html');
