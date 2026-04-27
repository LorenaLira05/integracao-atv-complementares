<div align="center">
  <img src="https://upload.wikimedia.org/wikipedia/commons/8/86/Senac_logo.svg" alt="Senac Logo" width="150" />
  <h1>🎓 Sistema de Gestão Acadêmica SENAC</h1>
  <p><strong>Plataforma Completa para Gestão de Atividades Complementares e Protocolos</strong></p>
  
  [![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=node.js&logoColor=white)](https://nodejs.org/)
  [![Express.js](https://img.shields.io/badge/Express.js-000000?style=for-the-badge&logo=express&logoColor=white)](https://expressjs.com/)
  [![PostgreSQL](https://img.shields.io/badge/PostgreSQL-316192?style=for-the-badge&logo=postgresql&logoColor=white)](https://www.postgresql.org/)
  [![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)](https://developer.mozilla.org/en-US/docs/Web/JavaScript)
  [![HTML5](https://img.shields.io/badge/HTML5-E34F26?style=for-the-badge&logo=html5&logoColor=white)](https://developer.mozilla.org/en-US/docs/Web/HTML)
  [![CSS3](https://img.shields.io/badge/CSS3-1572B6?style=for-the-badge&logo=css3&logoColor=white)](https://developer.mozilla.org/en-US/docs/Web/CSS)
</div>

---

## 📌 Sobre o Projeto

O **Sistema de Gestão de Atividades Complementares** é uma solução web *Full Stack* desenvolvida para digitalizar e automatizar o controle de horas complementares nas unidades do SENAC. O sistema elimina a necessidade de planilhas manuais e processos descentralizados (como trocas de e-mails), unificando a experiência de Alunos, Coordenadores e Administradores em um único portal dinâmico e seguro.

A aplicação foi desenhada com foco em **Alta Performance, Escalabilidade e Experiência do Usuário (UX)**, utilizando uma identidade visual estritamente alinhada com as diretrizes da marca SENAC.

---

## 👥 Perfis de Acesso

O sistema é dividido em três módulos principais de acesso, cada um com suas permissões específicas protegidas via JWT:

| Perfil | Responsabilidades |
| :--- | :--- |
| 🛡️ **Super Admin** | Gerenciamento global do sistema. Responsável por cadastrar novos **Cursos** e **Coordenadores**, além de configurar os parâmetros da plataforma. |
| 👨‍🏫 **Coordenador** | Gestão acadêmica do seu curso específico. Valida/reprova submissões de certificados, analisa horas enviadas pelos alunos e acompanha as métricas de eficiência no painel. |
| 🎓 **Aluno** *(Fase 2)* | Submissão de horas complementares, envio de certificados e acompanhamento da evolução da sua carga horária necessária para formação. |

---

## 🖥️ Módulos e Interface (Frontend)

O Frontend foi projetado como uma **Single Page Experience** utilizando a metodologia CBA (Component-Based Architecture) adaptada para Vanilla JavaScript.

- **`index.html` (Login):** Portal de acesso unificado com design *split-screen*, seleção visual de perfil e integração JWT.
- **`dashboardadm.html` (Visão Geral):** Painel do Coordenador com os principais KPIs de horas validadas e submissões pendentes.
- **`alunos.html` (Gestão de Alunos):** Tabela dinâmica que lista os alunos matriculados no curso sob gestão do Coordenador.
- **`submissoes.html` (Análise):** Fila de trabalho do coordenador para avaliar os certificados enviados.
- **`protocoloadm.html` (Protocolos):** Visualização de chamados e solicitações administrativas.
- **`relatorios.html` (Métricas):** Painel analítico com gráficos integrados gerados com dados reais do backend.
- **`configuracao.html` (Ajustes):** Tela para configurações da conta do usuário.
- **`cursosuperadm.html` (Super Admin):** Área de gestão exclusiva para administradores globais (Cursos e Coordenadores).

---

## ⚙️ Arquitetura e Tecnologias

O projeto é dividido em **Backend (API RESTful)** e **Frontend (UI estática consumidora da API)**, ambos servidos através do ambiente Node.js.

### 🏗️ Estrutura de Diretórios

```text
teste/
├── backend/
│   ├── src/
│   │   ├── config/          → Conexão com PostgreSQL (database.js) e variáveis (.env)
│   │   ├── controllers/     → Regras de negócio (Admin, Coordenador, Auth)
│   │   ├── middleware/      → Validação de JWT e permissões de rotas (auth.js)
│   │   ├── routes/          → Mapeamento dos Endpoints (API)
│   │   └── server.js        → Arquivo principal de inicialização do Express
│   ├── uploads/             → Armazenamento local temporário (Multer) para certificados
│   └── package.json         → Dependências do servidor Node
│
├── frontend/
│   ├── pages/               → Telas do sistema (.html)
│   ├── services/            
│   │   ├── script.js        → Motor de renderização dinâmica (Sidebar, Menus, Ativos)
│   │   └── apiHelper.js     → Centralizador de requisições `fetch` com injeção automática de Token
│   ├── styles/              → Design System Modular
│   │   ├── sidebar.css      → Estilos globais (Zero Style Drift)
│   │   └── style.css        → Estilos globais de autenticação e inputs
│   └── assets/              → Imagens e ícones
```

### 🔐 Segurança e Autenticação

- **Auth Guard no Frontend:** O sistema verifica ativamente o perfil do usuário e a validade do Token no LocalStorage via `protegerPagina()`. Tentativas de burlar as URLs resultam em redirecionamento para o login.
- **Middlewares no Backend:** Todas as rotas (exceto login) exigem validação criptográfica do Token JWT e verificam se o perfil bate com o recurso solicitado. (Ex: Coordenador não acessa rotas de Super Admin).

---

## 🚀 Como Executar o Projeto Localmente

Siga o passo a passo abaixo para rodar a aplicação completa (Backend e Frontend) na sua máquina:

### 1. Pré-requisitos
- [Node.js](https://nodejs.org/en/) instalado (versão 18+ recomendada)
- [PostgreSQL](https://www.postgresql.org/) rodando na máquina local (versão 14+)

### 2. Configurar o Banco de Dados
Certifique-se de que o seu Postgres possui um banco criado (Ex: `atividades_complementares`). O banco base deve ser restaurado a partir do *dump* disponibilizado no repositório.

### 3. Configurar Variáveis de Ambiente
Na pasta `backend/src/config/`, crie ou edite o arquivo `.env` com as seguintes credenciais:
```env
PORT=3001
DB_HOST=localhost
DB_PORT=5432
DB_NAME=atividades_complementares
DB_USER=postgres
DB_PASSWORD=sua_senha_do_banco
JWT_SECRET=chave_secreta_super_segura
```

### 4. Instalar Dependências e Rodar o Servidor
Abra o terminal na pasta `backend` e execute:
```bash
npm install
node src/server.js
```

### 5. Acessar o Sistema
O Node.js subirá o Backend e servirá automaticamente a pasta `frontend`.
Abra seu navegador e acesse: **`http://localhost:3001`**

---

## 📡 Resumo dos Principais Endpoints da API

| Rota | Método | Descrição | Permissão |
| :--- | :--- | :--- | :--- |
| `/auth/login` | `POST` | Realiza login e retorna JWT Token | Público |
| `/admin/cursos` | `GET/POST` | Gerenciamento de cursos | Super Admin |
| `/admin/coordenador` | `POST` | Cadastro de novos coordenadores | Super Admin |
| `/coordenador/aluno` | `POST` | Vinculação de alunos | Coordenador |
| `/coordenador/submissoes/:curso_id` | `GET` | Listagem de certificados enviados | Coordenador |
| `/coordenador/validar/:id` | `PATCH` | Valida ou recusa uma hora complementar | Coordenador |
| `/dashboard/relatorios` | `GET` | Retorna o compilado de KPIs e dados analíticos | Coordenador |

---

<div align="center">
  <br>
  <p><strong>Desenvolvido com 💙 para o Projeto SENAC 2026.</strong></p>
  <p>Transformando a jornada acadêmica através da tecnologia.</p>
</div>
