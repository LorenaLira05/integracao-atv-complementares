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
    'novo-aluno.html'
];

const superAdminNav = `<nav class="menu-navegacao">
                <a href="cursosuperadm.html" class="link-menu"><i class='bx bx-book'></i> Cursos</a>
                <a href="alunos.html" class="link-menu"><i class='bx bx-group'></i> Alunos</a>
                <a href="configadm.html" class="link-menu"><i class='bx bx-cog'></i> Configurações</a>
            </nav>`;

const coordinatorNav = `<nav class="menu-navegacao">
                <a href="dashboardadm.html" class="link-menu"><i class='bx bx-grid-alt'></i> Dashboard</a>
                <a href="cursos.html" class="link-menu"><i class='bx bx-book'></i> Cursos</a>
                <a href="alunos.html" class="link-menu"><i class='bx bx-group'></i> Alunos</a>
                <a href="protocoloadm.html" class="link-menu"><i class='bx bx-file'></i> Protocolos</a>
                <a href="submissoes.html" class="link-menu"><i class='bx bx-upload'></i> Submissões</a>
                <a href="relatorios.html" class="link-menu"><i class='bx bx-bar-chart-alt-2'></i> Relatórios</a>
                <a href="configuracao.html" class="link-menu"><i class='bx bx-cog'></i> Configurações</a>
            </nav>`;

let updatedFiles = 0;

for (const file of files) {
    const filePath = path.join(pagesDir, file);
    let content = fs.readFileSync(filePath, 'utf8');

    const regex = /<nav class="menu-navegacao">[\s\S]*?<\/nav>/;
    if (regex.test(content)) {
        const replacement = superAdminFiles.includes(file) ? superAdminNav : coordinatorNav;
        const novoContent = content.replace(regex, replacement);
        
        if (novoContent !== content) {
            fs.writeFileSync(filePath, novoContent, 'utf8');
            console.log(`Restored ${file}`);
            updatedFiles++;
        }
    }
}

console.log(`Successfully restored ${updatedFiles} files.`);
