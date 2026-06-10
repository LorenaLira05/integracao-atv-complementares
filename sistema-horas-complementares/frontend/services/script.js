/**
 * script.js — Login + Helpers de API
 * Localizado em: /frontend/services/script.js
 */

if (typeof API === 'undefined') {
    var API = window.location.origin.includes(':3001')
        ? ''
        : 'http://localhost:3001';
}

/* ========== LOGIN ========== */

function concluirLogin(data) {
    const perfilReal = (data.perfis && data.perfis.length > 0) ? data.perfis[0] : null;

    if (!perfilReal || !data.token) {
        alert('Erro: Dados de autenticação incompletos vindos do servidor.');
        return;
    }

    // Salva os dados da sessão
    localStorage.setItem('token', data.token);
    localStorage.setItem('perfil', perfilReal);
    if (data.nome) localStorage.setItem('nome', data.nome);
    if (data.email) localStorage.setItem('email', data.email);

    // --- REDIRECIONAMENTO PARA PRIMEIRO ACESSO ---
    if (data.primeiroAcesso === true) {
        window.location.href = '/pages/primeiro_acesso.html';
        return;
    }

    // --- REDIRECIONAMENTO CORRIGIDO ---
    const perfilUpper = perfilReal.toUpperCase();

    if (perfilUpper === 'STUDENT' || perfilUpper === 'STUDENT') {
        window.location.href = '/pages/Dasboard.html';
    } else if (perfilUpper === 'COORDINATOR' || perfilUpper === 'COORDENADOR') {
        window.location.href = '/pages/selecionar_curso.html';
    } else if (perfilUpper === 'ADMIN' || perfilUpper === 'SUPER_ADMIN') {
        window.location.href = '/pages/cursosuperadm.html';
    } else {
        alert('Perfil não reconhecido pelo sistema: ' + perfilReal);
    }
}

function show2FAModal(mensagem, tokenTemp) {
    const overlay = document.createElement('div');
    overlay.style.position = 'fixed';
    overlay.style.top = '0'; overlay.style.left = '0';
    overlay.style.width = '100%'; overlay.style.height = '100%';
    overlay.style.background = 'rgba(0,0,0,0.5)';
    overlay.style.display = 'flex';
    overlay.style.alignItems = 'center';
    overlay.style.justifyContent = 'center';
    overlay.style.zIndex = '9999';

    const modal = document.createElement('div');
    modal.style.background = '#fff';
    modal.style.padding = '30px';
    modal.style.borderRadius = '8px';
    modal.style.width = '350px';
    modal.style.textAlign = 'center';
    modal.style.boxShadow = '0 4px 15px rgba(0,0,0,0.2)';

    modal.innerHTML = `
        <h2 style="margin-bottom: 15px; color: #00478f; font-family: sans-serif;">Verificação 2FA</h2>
        <p style="margin-bottom: 20px; font-size: 14px; color: #555; font-family: sans-serif;">${mensagem}</p>
        <div style="margin-bottom: 20px; text-align: left;">
            <div style="border: 1px solid #ccc; border-radius: 4px; padding: 10px; display: flex; align-items: center;">
                <i class="bx bx-key" style="margin-right: 10px; color: #888; font-size: 20px;"></i>
                <input placeholder="Código de 6 dígitos" type="text" id="codigo2FA" maxlength="6" style="border: none; outline: none; width: 100%; font-size: 16px; font-family: sans-serif;">
            </div>
        </div>
        <button id="btnVerificar2FA" style="width: 100%; padding: 12px; background: #f6821f; color: #fff; border: none; border-radius: 4px; cursor: pointer; font-size: 16px; font-weight: bold; margin-bottom: 10px; font-family: sans-serif;">Verificar</button>
        <button id="btnCancelar2FA" style="width: 100%; padding: 12px; background: #ccc; color: #333; border: none; border-radius: 4px; cursor: pointer; font-size: 16px; font-weight: bold; font-family: sans-serif;">Cancelar</button>
    `;

    overlay.appendChild(modal);
    document.body.appendChild(overlay);

    document.getElementById('btnVerificar2FA').onclick = () => {
        const codigo = document.getElementById('codigo2FA').value.trim();
        if (!codigo) {
            alert('Digite o código.');
            return;
        }

        document.getElementById('btnVerificar2FA').innerText = 'Verificando...';

        fetch('/auth/verificar-2fa', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + tokenTemp
            },
            body: JSON.stringify({ codigo })
        })
        .then(res => res.json())
        .then(data2FA => {
            if (data2FA.erro) {
                alert(data2FA.erro);
                document.getElementById('btnVerificar2FA').innerText = 'Verificar';
                return;
            }
            document.body.removeChild(overlay);
            concluirLogin(data2FA);
        })
        .catch(err => {
            console.error('Erro no 2FA:', err);
            alert('Erro ao verificar o código 2FA.');
            document.getElementById('btnVerificar2FA').innerText = 'Verificar';
        });
    };

    document.getElementById('btnCancelar2FA').onclick = () => {
        document.body.removeChild(overlay);
    };
}

function acessarPortal() {
    const perfilSelecionado = document.querySelector('input[name="perfil"]:checked');
    const email = document.getElementById('usuario')?.value?.trim();
    const senha = document.getElementById('senha')?.value;

    if (!perfilSelecionado) {
        alert('Selecione um perfil no formulário.');
        return;
    }
    if (!email || !senha) {
        alert('Preencha e-mail e senha.');
        return;
    }

    const btnLogin = document.querySelector('.btn-login');
    const conteudoOriginalBotao = btnLogin ? btnLogin.innerHTML : null;
    if (btnLogin) {
        btnLogin.innerHTML = '<i class="bx bx-loader-alt bx-spin" style="margin-right: 5px;"></i> Verificando acesso...';
        btnLogin.disabled = true;
        btnLogin.style.cursor = 'not-allowed';
        btnLogin.style.opacity = '0.7';
    }

    fetch('/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, senha })
    })
        .then(res => res.json())
        .then(data => {
            if (btnLogin) {
                btnLogin.innerHTML = conteudoOriginalBotao;
                btnLogin.disabled = false;
                btnLogin.style.cursor = 'pointer';
                btnLogin.style.opacity = '1';
            }

            if (data.erro) {
                alert(data.erro);
                return;
            }

            if (data.tokenTemp) {
                show2FAModal(data.mensagem, data.tokenTemp);
                return;
            }

            concluirLogin(data);
        })
        .catch(err => {
            if (btnLogin) {
                btnLogin.innerHTML = conteudoOriginalBotao;
                btnLogin.disabled = false;
                btnLogin.style.cursor = 'pointer';
                btnLogin.style.opacity = '1';
            }
            console.error('Erro no login:', err);
            alert('Erro na conexão com o servidor. Verifique se o backend está ligado.');
        });
}

/* ========== AUTH GUARD (Proteção de Páginas) ========== */

function protegerPagina(perfisPermitidos) {
    const token = localStorage.getItem('token');
    const perfil = localStorage.getItem('perfil');

    if (!token || !perfil) {
        window.location.href = '/pages/index.html';
        return null;
    }

    // Normaliza para comparação e adiciona alias de nomenclatura (inglês/pt)
    let perfilAtual = perfil.toUpperCase();

    // Tratamento de aliases para que o GUARD permita acesso a palavras equivalentes
    if (perfilAtual === 'COORDINATOR') perfilAtual = 'COORDENADOR';
    if (perfilAtual === 'ADMIN') perfilAtual = 'SUPER_ADMIN';

    const permitidosUpper = perfisPermitidos.map(p => p.toUpperCase());

    // Se a página aceita 'COORDINATOR', mapear para 'COORDENADOR' também no array
    const permitidosExpandidos = [];
    permitidosUpper.forEach(p => {
        permitidosExpandidos.push(p);
        if (p === 'COORDINATOR') permitidosExpandidos.push('COORDENADOR');
        if (p === 'COORDENADOR') permitidosExpandidos.push('COORDINATOR');
        if (p === 'ADMIN') permitidosExpandidos.push('SUPER_ADMIN');
        if (p === 'SUPER_ADMIN') permitidosExpandidos.push('ADMIN');
    });

    if (perfisPermitidos && !permitidosExpandidos.includes(perfilAtual)) {
        alert('Acesso negado para o perfil ' + perfil);
        window.location.href = '/pages/index.html';
        return null;
    }

    return { token, perfil };
}

function logout() {
    localStorage.clear();
    window.location.href = '/pages/index.html';
}

/* ========== API HELPERS ========== */

async function apiFetch(endpoint, options = {}) {
    const token = localStorage.getItem('token');

    const opts = {
        ...options,
        headers: {
            'Content-Type': 'application/json',
            'Authorization': token ? `Bearer ${token}` : '',
            ...(options.headers || {})
        }
    };

    if (options.body && typeof options.body === 'object') {
        opts.body = JSON.stringify(options.body);
    }

    try {
        const res = await fetch(API + endpoint, opts);
        if (res.status === 401) {
            logout();
            throw new Error('Sessão expirada.');
        }
        return await res.json();
    } catch (err) {
        console.error(`Erro em ${endpoint}:`, err);
        throw err;
    }
}

if (typeof apiGet === 'undefined') {
    window.apiGet = (endpoint) => apiFetch(endpoint, { method: 'GET' });
}
if (typeof apiPost === 'undefined') {
    window.apiPost = (endpoint, body) => apiFetch(endpoint, { method: 'POST', body });
}
if (typeof apiPatch === 'undefined') {
    window.apiPatch = (endpoint, body) => apiFetch(endpoint, { method: 'PATCH', body });
}
if (typeof apiDelete === 'undefined') {
    window.apiDelete = (endpoint) => apiFetch(endpoint, { method: 'DELETE' });
}

/* ========== UTILS (Formatação e UI) ========== */

function formatarData(iso) {
    if (!iso) return '—';
    const d = new Date(iso);
    const meses = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
    return `${d.getDate()} ${meses[d.getMonth()]}, ${d.getFullYear()}`;
}

function getIniciais(nome) {
    if (!nome) return '??';
    return nome.split(' ').filter(Boolean).slice(0, 2).map(n => n[0]).join('').toUpperCase();
}

function colorAvatar(nome) {
    const cores = ['bg-azul', 'bg-laranja', 'bg-verde', 'bg-cinza', 'bg-roxo'];
    let h = 0;
    if (nome) {
        for (let i = 0; i < nome.length; i++) h = ((h << 5) - h) + nome.charCodeAt(i);
    }
    return cores[Math.abs(h) % cores.length];
}
const corAvatar = colorAvatar;

/* ========== EVENT LISTENERS ========== */

document.addEventListener('DOMContentLoaded', () => {
    // Botão Novo Protocolo
    const btnNovoProtocolo = document.querySelector('.botao-novo');
    if (btnNovoProtocolo) {
        btnNovoProtocolo.addEventListener('click', () => {
            window.location.href = '/pages/protocolo.html';
        });
    }

    // Botão Sair
    const btnSair = document.querySelector('.link-sair');
    if (btnSair) {
        btnSair.addEventListener('click', (e) => {
            e.preventDefault();
            logout();
        });
    }

    // Dynamic Sidebar Rendering for ADMIN vs COORDENADOR
    const perfil = localStorage.getItem('perfil') ? localStorage.getItem('perfil').toUpperCase() : '';
    const isSuperAdmin = perfil === 'SUPER_ADMIN' || perfil === 'ADMIN';
    const isCoordenador = perfil === 'COORDINATOR' || perfil === 'COORDENADOR';

    const menuNav = document.querySelector('.menu-navegacao');
    if (menuNav && (isSuperAdmin || isCoordenador)) {
        menuNav.innerHTML = '';
        const currentPage = window.location.pathname.split('/').pop() || '';

        let links = [];
        if (isSuperAdmin) {
            links = [
                { href: 'dashboard_superadmin.html', icon: 'bx-grid-alt', text: 'Dashboard' },
                { href: 'cursosuperadm.html', icon: 'bx-book', text: 'Cursos' },
                { href: 'coordenadores.html', icon: 'bx-user-voice', text: 'Coordenadores' },
                { href: 'submissoes_superadmin.html', icon: 'bx-check-square', text: 'Submissões' },
                { href: 'configuracoes.html', icon: 'bx-cog', text: 'Configurações' }
            ];
        } else if (isCoordenador) {
            links = [
                { href: 'selecionar_curso.html', icon: 'bx-transfer-alt', text: 'Selecionar Curso' },
                { href: 'dashboardadm.html', icon: 'bx-grid-alt', text: 'Dashboard' },
                { href: 'alunos.html', icon: 'bx-group', text: 'Alunos' },
                { href: 'protocoloadm.html', icon: 'bx-upload', text: 'Submissões' },
                { href: 'cadastrar_regra.html', icon: 'bx-list-check', text: 'Regras de Horas' },
                { href: 'relatorios.html', icon: 'bx-bar-chart-alt-2', text: 'Relatórios' },
                { href: 'configuracoes.html', icon: 'bx-cog', text: 'Configurações' }
            ];
        }

        links.forEach(l => {
            // Ajuste para manter o menu lateral sincronizado com a página atual
            let targetActive = currentPage;

            // Submissões e Análise ativam o item "Submissões" (protocoloadm.html)
            if (['protocoloadm.html', 'analise_certificado.html'].includes(currentPage)) {
                targetActive = 'protocoloadm.html';
            }
            // Gestão de Alunos, Edição e Cadastro ativam o item "Alunos"
            else if (['alunos.html', 'editar-aluno.html', 'novo-aluno.html'].includes(currentPage)) {
                targetActive = 'alunos.html';
            }
            // Repositório e Extrato de Horas são visualizações vinculadas ao Dashboard (Início)
            else if (['submissoes.html', 'extrato_certificado.html'].includes(currentPage)) {
                targetActive = isSuperAdmin ? 'dashboard_superadmin.html' : 'dashboardadm.html';
            }
            // Cadastro de coordenador ativa o item "Coordenadores"
            else if (['cadastrar_coordenador.html', 'editar_coordenador.html'].includes(currentPage)) {
                targetActive = 'coordenadores.html';
            }

            const isActive = targetActive === l.href ? 'active' : '';
            menuNav.innerHTML += `<a href="${l.href}" class="link-menu ${isActive}"><i class='bx ${l.icon}'></i> ${l.text}</a>`;
        });
    }

    // ─── Perfil dinâmico da sidebar ───
    const roleMap = {
        'super_admin': 'Super Admin',
        'admin': 'Super Admin',
        'coordinator': 'Coordenador',
        'coordenador': 'Coordenador',
        'student': 'Aluno'
    };

    function preencherSidebar(nome, perfil) {
        const roleTexto = roleMap[perfil.toLowerCase()] || perfil;
        const elNome = document.getElementById('sidebar-nome-global');
        const elRole = document.getElementById('sidebar-role-global');
        const elAvatar = document.getElementById('sidebar-avatar-global');
        if (elNome) elNome.textContent = nome;
        if (elRole) elRole.textContent = roleTexto;
        if (elAvatar) elAvatar.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(nome)}&background=0056b3&color=fff&bold=true`;

        // --- ADICIONADO: Preenchimento do Header também (se existir) ---
        const elHeaderNome = document.getElementById('header-nome-usuario');
        const elHeaderRole = document.getElementById('header-role-usuario');
        const elHeaderAvatar = document.getElementById('header-avatar-img') || document.getElementById('header-avatar-box');

        if (elHeaderNome) elHeaderNome.textContent = nome;
        if (elHeaderRole) elHeaderRole.textContent = roleTexto;

        if (elHeaderAvatar) {
            if (elHeaderAvatar.id === 'header-avatar-box') {
                elHeaderAvatar.textContent = nome.split(' ').filter(Boolean).slice(0, 2).map(n => n[0]).join('').toUpperCase();
            } else if (elHeaderAvatar.tagName === 'IMG') {
                elHeaderAvatar.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(nome)}&background=f6821f&color=fff`;
            } else {
                elHeaderAvatar.style.backgroundImage = `url('https://ui-avatars.com/api/?name=${encodeURIComponent(nome)}&background=f6821f&color=fff')`;
                elHeaderAvatar.style.backgroundSize = 'cover';
            }
        }
    }

    const nomeSalvo = localStorage.getItem('nome');
    const perfilSalvo = localStorage.getItem('perfil') || '';

    if (nomeSalvo) {
        // Nome já salvo no localStorage — usa direto
        preencherSidebar(nomeSalvo, perfilSalvo);
    } else if (perfilSalvo) {
        // Nome ausente (sessão antiga) — tenta buscar via API
        const token = localStorage.getItem('token');
        if (token) {
            fetch('/auth/me', {
                headers: { 'Authorization': `Bearer ${token}` }
            })
                .then(r => r.ok ? r.json() : null)
                .then(data => {
                    if (data && (data.full_name || data.nome)) {
                        const nome = data.full_name || data.nome;
                        localStorage.setItem('nome', nome);
                        preencherSidebar(nome, perfilSalvo);
                    } else {
                        preencherSidebar('Usuário', perfilSalvo);
                    }
                })
                .catch(() => preencherSidebar('Usuário', perfilSalvo));
        }
    }
});

function abrirAnalise(id) {
    window.location.href = `analise_certificado.html?id=${id}`;
}

/* ========== EXPORTAÇÕES (CSV / PDF) ========== */

window.exportarDadosParaCSV = function (nomeArquivo, cabecalho, linhas) {
    if (!linhas || linhas.length === 0) {
        alert("Nenhum dado para exportar.");
        return;
    }

    let csvContent = "data:text/csv;charset=utf-8,\uFEFF";
    csvContent += cabecalho.join(";") + "\n";
    linhas.forEach(row => {
        let rowStr = row.map(v => {
            if (v === null || v === undefined) return '""';
            return `"${String(v).replace(/"/g, '""')}"`;
        }).join(";");
        csvContent += rowStr + "\n";
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", nomeArquivo + ".csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
};

window.exportarDadosParaPDF = async function (nomeArquivo, titulo, cabecalho, linhas) {
    if (!linhas || linhas.length === 0) {
        alert("Nenhum dado para exportar.");
        return;
    }

    // Carregar dinamicamente jsPDF se não estiver presente
    if (typeof window.jspdf === 'undefined') {
        await new Promise((resolve, reject) => {
            const script = document.createElement('script');
            script.src = 'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js';
            script.onload = resolve;
            script.onerror = () => reject(new Error('Falha ao carregar jsPDF'));
            document.head.appendChild(script);
        });
    }

    // Carregar dinamicamente jsPDF-AutoTable se não estiver presente
    if (typeof window.jspdf.jsPDF.API.autoTable === 'undefined') {
        await new Promise((resolve, reject) => {
            const script = document.createElement('script');
            script.src = 'https://cdnjs.cloudflare.com/ajax/libs/jspdf-autotable/3.5.28/jspdf.plugin.autotable.min.js';
            script.onload = resolve;
            script.onerror = () => reject(new Error('Falha ao carregar jsPDF-AutoTable'));
            document.head.appendChild(script);
        });
    }

    const { jsPDF } = window.jspdf;
    const doc = new jsPDF('landscape'); // Landscape melhor para tabelas largas

    doc.setFontSize(16);
    doc.text(titulo, 14, 15);
    doc.setFontSize(10);
    doc.text(`Gerado em: ${new Date().toLocaleString('pt-BR')}`, 14, 22);

    doc.autoTable({
        startY: 28,
        head: [cabecalho],
        body: linhas,
        theme: 'striped',
        styles: { fontSize: 8 },
        headStyles: { fillColor: [0, 71, 143] } // Cor azul do Senac
    });

    doc.save(nomeArquivo + ".pdf");
};

window.exportarTelaParaPDF = async function (elementId, nomeArquivo) {
    const el = document.getElementById(elementId);
    if (!el) {
        alert("Elemento não encontrado para exportar.");
        return;
    }

    // Carregar jsPDF
    if (typeof window.jspdf === 'undefined') {
        await new Promise((resolve, reject) => {
            const script = document.createElement('script');
            script.src = 'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js';
            script.onload = resolve;
            document.head.appendChild(script);
        });
    }
    // Carregar html2canvas
    if (typeof window.html2canvas === 'undefined') {
        await new Promise((resolve, reject) => {
            const script = document.createElement('script');
            script.src = 'https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js';
            script.onload = resolve;
            document.head.appendChild(script);
        });
    }

    try {
        const canvas = await window.html2canvas(el, { scale: 2 });
        const imgData = canvas.toDataURL('image/png');
        
        const { jsPDF } = window.jspdf;
        const pdf = new jsPDF('p', 'mm', 'a4');
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
        
        pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
        pdf.save(nomeArquivo + ".pdf");
    } catch (err) {
        console.error("Erro ao gerar PDF da tela:", err);
        alert("Falha ao gerar o PDF da tela.");
    }
};