/**
 * apiHelper.js — Core Service Layer (CBA)
 * Utilitário centralizado para comunicação com o backend SENAC.
 * Gerencia Autenticação, Guards de Rota e Transformação de Dados.
 */
 
// Força a conexão com o backend no IP 127.0.0.1 (mais estável que 'localhost')
var API = 'http://127.0.0.1:3001';

// Se já estivermos rodando dentro do próprio servidor, usamos caminho relativo
if (window.location.origin.includes(':3001')) {
    API = '';
}
window.API = API; // Garante visibilidade global
 
/* ---------- Camada de Autenticação (Auth Service) ---------- */
 
// Recupera o Token JWT armazenado no navegador
const getToken = () => localStorage.getItem('token');
 
// Recupera o perfil do usuário (ALUNO, COORDENADOR, SUPER_ADMIN)
const getPerfil = () => localStorage.getItem('perfil');
 
/**
 * requireAuth: Verifica se o usuário está logado.
 * Se não houver token, interrompe a execução e redireciona.
 */
function requireAuth() {
    const token = getToken();
    const perfil = getPerfil();
    
    if (!token || !perfil) {
        alert('Sessão expirada. Faça login novamente.');
        window.location.href = '/pages/index.html'; // Caminho absoluto corrigido
        throw new Error('Acesso não autorizado: Token ausente.');
    }
    return { token, perfil };
}
 
/**
 * requireRole: Proteção de rota baseada em níveis de acesso.
 * @param {Array} allowedRoles - Lista de perfis permitidos (ex: ['ALUNO'])
 */
function requireRole(...allowedRoles) {
    const { token, perfil } = requireAuth();
    
    // Normaliza para comparação (case insensitive e alias pt/en)
    const p = perfil.toUpperCase();
    let normalizedUser = p;
    if (p === 'COORDINATOR') normalizedUser = 'COORDENADOR';
    if (p === 'ADMIN') normalizedUser = 'SUPER_ADMIN';
    if (p === 'STUDENT') normalizedUser = 'ALUNO';

    const permitidosExpandidos = [];
    allowedRoles.forEach(role => {
        const r = role.toUpperCase();
        permitidosExpandidos.push(r);
        if (r === 'COORDINATOR') permitidosExpandidos.push('COORDENADOR');
        if (r === 'COORDENADOR') permitidosExpandidos.push('COORDINATOR');
        if (r === 'ADMIN') permitidosExpandidos.push('SUPER_ADMIN');
        if (r === 'SUPER_ADMIN') permitidosExpandidos.push('ADMIN');
        if (r === 'ALUNO') permitidosExpandidos.push('STUDENT');
        if (r === 'STUDENT') permitidosExpandidos.push('ALUNO');
    });

    if (!permitidosExpandidos.includes(normalizedUser)) {
        alert(`Acesso negado. O perfil ${perfil} não tem permissão para esta área.`);
        window.location.href = '/pages/index.html';
        throw new Error('Acesso negado: Perfil insuficiente.');
    }
    return { token, perfil };
}
 
/**
 * logout: Encerra a sessão e limpa o armazenamento local.
 */
function logout() {
    localStorage.clear(); // Limpa token, perfil, nome e email de uma vez
    window.location.href = '/pages/index.html';
}
 
/* ---------- Camada de Comunicação (API Fetch Service) ---------- */
 
/**
 * apiCall: Motor principal de requisições.
 * Centraliza o tratamento de headers e erros 401.
 */
async function apiCall(endpoint, method = 'GET', body = null) {
    const token = getToken();
    
    try {
        const opts = {
            method,
            headers: {
                'Content-Type': 'application/json',
                'Authorization': token ? `Bearer ${token}` : ''
            }
        };
 
        // Adiciona o corpo da requisição apenas se necessário
        if (body && ['POST', 'PUT', 'PATCH'].includes(method)) {
            opts.body = JSON.stringify(body);
        }
 
        const res = await fetch(`${API}${endpoint}`, opts);
 
        // Se o servidor retornar 401 (Não autorizado), força o logout
        if (res.status === 401) {
            logout();
            return null;
        }
 
        return await res.json();
    } catch (err) {
        console.error(`Erro na requisição [${method}] ${endpoint}:`, err);
        return null;
    }
}
 
// Atalhos para os métodos HTTP mais comuns
if (typeof apiGet === 'undefined') {
    window.apiGet = (endpoint) => apiCall(endpoint, 'GET');
}
if (typeof apiPost === 'undefined') {
    window.apiPost = (endpoint, body) => apiCall(endpoint, 'POST', body);
}
if (typeof apiPatch === 'undefined') {
    window.apiPatch = (endpoint, body) => apiCall(endpoint, 'PATCH', body);
}
 
/* ---------- Camada de UI/Formatadores (Component Helpers) ---------- */
 
/**
 * formatarData: Converte ISO String para formato brasileiro legível.
 */
function formatarData(iso) {
    if (!iso) return '—';
    const d = new Date(iso);
    const meses = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
    return `${d.getDate()} ${meses[d.getMonth()]}, ${d.getFullYear()}`;
}
 
/**
 * statusBadge: Gera o componente HTML de status com as cores do CSS.
 */
function statusBadge(status) {
    const map = {
        'ATIVO':     { class: 'status-ativo-curso', label: 'Ativo' },
        'INATIVO':   { class: 'status-rascunho',     label: 'Inativo' },
        'PENDENTE':  { class: 'status-rascunho',     label: 'Pendente' },
        'APROVADO':  { class: 'status-ativo-curso', label: 'Aprovado' },
        'REJEITADO': { class: 'status-inativo',     label: 'Rejeitado' },
    };
    const s = map[status] || { class: '', label: status || '—' };
    return `<span class="status-tag ${s.class}">${s.label}</span>`;
}
 
/**
 * getInitials: Extrai as iniciais de um nome para o avatar.
 */
function getInitials(nome) {
    if (!nome) return '??';
    return nome.split(' ').filter(Boolean).slice(0, 2).map(n => n[0]).join('').toUpperCase();
}
 
/**
 * initialsColor: Gera uma cor consistente baseada no nome do usuário.
 */
function initialsColor(nome) {
    const cores = ['bg-azul', 'bg-laranja', 'bg-verde', 'bg-cinza', 'bg-roxo'];
    if (!nome) return cores[0];
    
    let sum = 0;
    for (let i = 0; i < nome.length; i++) sum += nome.charCodeAt(i);
    return cores[sum % cores.length];
}
 
/* ---------- Upload (upload.js) ---------- */
 
async function uploadCertificado(atividadeId, arquivo) {
    const token = getToken();
    const formData = new FormData();
    formData.append('certificado', arquivo);
 
    const res = await fetch(`${API}/upload/certificado/${atividadeId}`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: formData
    });
 
    if (res.status === 401) { logout(); return null; }
    return await res.json();
}
 
async function getCertificado(atividadeId) {
    return await apiGet(`/upload/certificado/${atividadeId}`);
}
 
/* ---------- Dashboard (dashboard.js) ---------- */
 
async function getDashboardCoordenador() {
    return await apiGet('/dashboard/coordenador');
}
 
async function getRelatorios() {
    return await apiGet('/dashboard/relatorios');
}