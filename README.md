<div align="center">
  <img src="https://upload.wikimedia.org/wikipedia/commons/8/86/Senac_logo.svg" alt="Senac Logo" width="150" />
  <h1>Sistema de Gestão Acadêmica SENAC</h1>
  <p><strong>Plataforma Completa para Gestão de Atividades Complementares e Protocolos</strong></p>
  
---

# Sistema de Gerenciamento de Horas Complementares

Sistema completo para gerenciamento de horas complementares acadêmicas desenvolvido para a **Faculdade Senac**. Permite que alunos submetam atividades com certificados, coordenadores analisem e aprovem submissões, e o super admin monitore tudo com insights gerados por IA.

---

##  Arquitetura

```
integracao-atv-complementares/
├── sistema-horas-complementares/
│   ├── backend/          # API REST — Node.js + Express 5
│   └── frontend/         # Interface web — HTML/CSS/JS
└── mobile/               # App mobile — React Native + Expo
```

---

## Funcionalidades

### 👨‍🎓 Aluno
- Submissão de atividades complementares com upload de certificados (PDF/imagem)
- Acompanhamento de status de cada submissão (pendente, aprovado, reprovado, devolvido para ajuste)
- Resumo de horas acumuladas por categoria
- Notificações sobre aprovações e feedbacks
- Extrato imprimível de horas

### 👩‍🏫 Coordenador
- Análise de submissões dos alunos do próprio curso
- Aprovação/reprovação com feedback
- OCR automático de certificados via Tesseract.js
- Relatórios de desempenho por curso
- Exportação de dados em CSV

### 🛡️ Super Admin
- Gestão de cursos, coordenadores e alunos
- Dashboard com métricas gerais da instituição
- Classificação de risco de evasão por aluno (pipeline Python)
- Insights e recomendações geradas por IA (Groq LLM)
- Atualização manual do pipeline de análise

---

## Stack Tecnológica

### Backend
| Tecnologia | Uso |
|---|---|
| Node.js + Express 5 | Servidor e API REST |
| PostgreSQL + `pg` | Banco de dados |
| JWT + bcryptjs | Autenticação e autorização |
| Nodemailer | E-mails de notificação e 2FA |
| Tesseract.js + Sharp + pdf2pic | OCR de certificados |
| Groq SDK | Insights via LLM |
| Multer | Upload de arquivos |
| node-cron | Execução agendada do pipeline (todo dia às 3h) |
| Python + psycopg2 | Scripts de análise e classificação de risco |

### Frontend Web
- HTML5 + CSS3 + JavaScript puro
- Servido estaticamente pelo próprio Express

### Mobile
| Tecnologia | Uso |
|---|---|
| React Native 0.81 | App mobile |
| Expo SDK 54 | Build e desenvolvimento |
| React Navigation 7 | Navegação entre telas |
| Axios | Requisições à API |
| expo-document-picker / expo-image-picker | Upload de arquivos |
| TypeScript | Tipagem estática |

---

## Como rodar

### Pré-requisitos
- Node.js 18+
- Python 3.10+
- PostgreSQL 14+

### 1. Banco de dados

Crie o banco de dados:
```sql
CREATE DATABASE atividades_complementares;
```

### 2. Backend

```bash
cd sistema-horas-complementares/backend
npm install
```

Crie o arquivo `.env` e então:

```bash
# desenvolvimento
npm run dev

# produção
npm start
```

O servidor sobe em `http://localhost:3001`.

### 3. Frontend Web

O frontend é servido automaticamente pelo backend — basta acessar `http://localhost:3001` no navegador.

### 4. App Mobile

```bash
cd mobile
npm install
```

Configure o arquivo `mobile/.env`:
```env
EXPO_PUBLIC_API_URL=http://<seu-ip-local>:3001
```

```bash
npx expo start
```

Escaneie o QR Code com o aplicativo **Expo Go** (Android/iOS).

---

## Variáveis de Ambiente

Crie um `.env` na raiz do backend com as seguintes variáveis:

```env
# Servidor
PORT=3001

# Banco de dados
DB_HOST=localhost
DB_PORT=5432
DB_NAME=atividades_complementares_senac
DB_USER=postgres
DB_PASSWORD=sua_senha

# Autenticação
JWT_SECRET=sua_chave_jwt_secreta

# E-mail (Nodemailer)
MAIL_USER=seu@email.com
MAIL_PASS=sua_senha_de_app

# IA (Groq)
GROQ_API_KEY=sua_chave_groq
```

---

## Rotas da API

### Auth — `/auth`
| Método | Rota | Descrição |
|---|---|---|
| POST | `/auth/login` | Login com e-mail e senha |
| POST | `/auth/primeiro-acesso` | Primeiro acesso / redefinir senha |

### Aluno — `/aluno`
| Método | Rota | Descrição |
|---|---|---|
| POST | `/aluno/submissao` | Submeter atividade com certificados |
| PUT | `/aluno/submissao/:id` | Editar submissão |
| DELETE | `/aluno/submissao/:id` | Deletar submissão |
| GET | `/aluno/submissoes` | Listar minhas submissões |
| GET | `/aluno/resumo-horas` | Resumo de horas por categoria |
| GET | `/aluno/meus-dados` | Dados do perfil |
| GET | `/aluno/notificacoes` | Listar notificações |
| POST | `/aluno/notificacoes/ler-todas` | Marcar todas como lidas |

### Coordenador — `/coordenador`
Rotas protegidas para análise, aprovação/reprovação de submissões e relatórios do curso.

### Admin (Super Admin) — `/admin`
Rotas para gestão de cursos, coordenadores, alunos e execução do pipeline de IA.

### Dashboard — `/dashboard`
Métricas consolidadas para os painéis de cada perfil.

### Upload — `/upload`
Upload e recuperação de arquivos de certificados.

---

## Pipeline de Análise (Python)

Os scripts em `backend/src/scripts/` executam análises periódicas no banco:

| Script | Função |
|---|---|
| `executar_pipeline.py` | Orquestra todos os scripts abaixo |
| `classificacao_risco.py` | Classifica alunos por risco de não completar horas |
| `gerar_insights_ia.py` | Gera insights com Groq LLM |
| `gerar_insights_alunos.py` | Insights individuais por aluno |
| `gerar_insights_categorias.py` | Análise por categoria de atividade |
| `gerar_insights_cursos.py` | Análise por curso |
| `gerar_recomendacoes.py` | Recomendações automáticas |
| `calcular_tempo_medio.py` | Tempo médio de análise por coordenador |

O pipeline roda automaticamente **todo dia às 3h** via `node-cron`, e também pode ser acionado manualmente pelo super admin.

---

## Telas do App Mobile

| Tela | Descrição |
|---|---|
| Welcome | Tela inicial com logo Senac |
| Login | Autenticação com e-mail e senha |
| ForgotPassword | Recuperação de senha |
| FirstAccess | Fluxo de primeiro acesso |
| SelectCourse | Seleção do curso ativo |
| Dashboard | Painel principal com resumo de horas |
| SubmitHours | Formulário de nova submissão |
| SubmitDocument | Upload de certificados |
| SubmitSuccess | Confirmação de envio |
| HoursList | Lista de submissões com filtros |
| HourDetail | Detalhes de uma submissão |
| Notifications | Central de notificações |
| Profile | Perfil do aluno |

---

## Perfis de Acesso

| Perfil | Acesso |
|---|---|
| `student` | Submissões, resumo de horas, notificações |
| `coordinator` | Análise de submissões do próprio curso, relatórios |
| `superadmin` | Gestão total, dashboard global, IA insights |

---

## Estrutura de Pastas (Backend)

```
backend/
└── src/
    ├── config/
    │   └── database.js          # Conexão com o PostgreSQL
    ├── controllers/
    │   ├── alunoController.js
    │   ├── coordenadorController.js
    │   ├── adminController.js
    │   ├── authController.js
    │   ├── dashboardController.js
    │   ├── relatoriosController.js
    │   └── uploadController.js
    ├── middleware/
    │   └── auth.js              # Validação de JWT e roles
    ├── routes/
    │   ├── authRoutes.js
    │   ├── aluno.js
    │   ├── coordenador.js
    │   ├── admin.js
    │   ├── dashboard.js
    │   └── upload.js
    ├── scripts/                 # Pipeline Python de análise
    ├── services/
    │   ├── emailService.js      # Nodemailer
    │   └── ocrService.js        # Tesseract.js
    ├── utils/
    │   └── logger.js
    └── server.js
```

---
