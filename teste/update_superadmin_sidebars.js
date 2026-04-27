const fs = require('fs');
const path = require('path');

const pagesDir = path.join(__dirname, 'frontend', 'pages');
const files = fs.readdirSync(pagesDir).filter(f => f.endsWith('.html'));

const superAdminFiles = [
    'configadm.html',
    'configadm_sistema.html',
    'cursosuperadm.html',
    'cursoadm.html',
    'submissoes_superadmin.html',
    'coordenadores.html',
    'novo-aluno.html' // Maybe shared, but keeping original logic
];

const superAdminNav = `<nav class="menu-navegacao">
                <a href="cursosuperadm.html" class="link-menu"><i class='bx bx-book'></i> Cursos</a>
                <a href="alunos.html" class="link-menu"><i class='bx bx-group'></i> Alunos</a>
                <a href="coordenadores.html" class="link-menu"><i class='bx bx-user-voice'></i> Coordenadores</a>
                <a href="submissoes_superadmin.html" class="link-menu"><i class='bx bx-check-square'></i> Submissões</a>
                <a href="configadm.html" class="link-menu"><i class='bx bx-cog'></i> Configurações</a>
            </nav>`;

let updatedFiles = 0;

for (const file of files) {
    if (!superAdminFiles.includes(file)) continue;

    const filePath = path.join(pagesDir, file);
    let content = fs.readFileSync(filePath, 'utf8');

    const regex = /<nav class="menu-navegacao">[\s\S]*?<\/nav>/;
    if (regex.test(content)) {
        const novoContent = content.replace(regex, superAdminNav);
        
        if (novoContent !== content) {
            fs.writeFileSync(filePath, novoContent, 'utf8');
            console.log(`Updated HTML sidebar for ${file}`);
            updatedFiles++;
        }
    }
}

console.log(`Successfully updated ${updatedFiles} files.`);
