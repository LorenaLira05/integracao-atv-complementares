# Sistema de Horas Complementares — Senac

Sistema acadêmico para submissão, análise e gestão de horas complementares. Inclui API REST, interface web multi-perfil e aplicativo mobile.

## Índice

- [Arquitetura](#arquitetura)
- [Stack](#stack)
- [Configuração](#configuração)
- [Rodando o projeto](#rodando-o-projeto)
- [API](#api)
- [Pipeline de análise](#pipeline-de-análise)
- [Mobile](#mobile)

---

## Arquitetura

```
/
├── sistema-horas-complementares/
│   ├── backend/      # Node.js · Express 5 · PostgreSQL
│   └── frontend/     # HTML/CSS/JS estático (servido pelo backend)
└── mobile/           # React Native · Expo 54
```

O backend serve o frontend estático e expõe a API REST que o mobile consome. O pipeline de análise em Python é executado via `child_process` agendado com `node-cron`.

---

## Stack

**Backend**

| | |
|---|---|
| Runtime | Node.js 18+ |
| Framework | Express 5 |
| Banco | PostgreSQL 14+ via `pg` |
| Auth | JWT + bcryptjs |
| Upload | Multer |
| OCR | Tesseract.js + Sharp + pdf2pic |
| E-mail | Nodemailer |
| IA | Groq SDK (LLM) |
| Agendamento | node-cron |
| Análise | Python 3.10+ com psycopg2 |

**Mobile**

| | |
|---|---|
| Framework | React Native 0.81 |
| Build | Expo SDK 54 |
| Navegação | React Navigation 7 |
| HTTP | Axios |
| Linguagem | TypeScript |

---

## Configuração

Crie o banco de dados:

```sql
CREATE DATABASE atividades_complementares_senac;
```

Crie `.env` na raiz do projeto com base nas variáveis abaixo:

```env
PORT=
DB_HOST=
DB_PORT=
DB_NAME=
DB_USER=
DB_PASSWORD=
JWT_SECRET=
MAIL_USER=
MAIL_PASS=
GROQ_API_KEY=
```

---

## Rodando o projeto

**Backend**

```bash
cd sistema-horas-complementares/backend
npm install
npm run dev        # nodemon
npm start          # produção
```

O servidor sobe na porta definida em `PORT` (padrão `3001`). O frontend é servido automaticamente em `/`.

**Mobile**

```bash
cd mobile
npm install
```

Configure `mobile/.env`:

```env
EXPO_PUBLIC_API_URL=http://<seu-ip-local>:<porta>
```

```bash
npx expo start
```

Escaneie o QR Code com o **Expo Go**.

---

## API

Todas as rotas protegidas exigem `Authorization: Bearer <token>`.

O middleware valida o JWT e checa se o perfil do usuário está na lista de permissões da rota — um usuário pode ter múltiplos perfis simultaneamente.

**Perfis:** `student` · `coordinator` · `super_admin`

---

### `/auth`

| Método | Rota | Descrição |
|---|---|---|
| POST | `/auth/login` | Autenticação |
| POST | `/auth/primeiro-acesso` | Definição de senha no primeiro acesso |

---

### `/aluno`

| Método | Rota | Perfis | Descrição |
|---|---|---|---|
| POST | `/aluno/submissao` | student, coordinator | Nova submissão (até 10 arquivos) |
| PUT | `/aluno/submissao/:id` | student, coordinator | Editar submissão |
| DELETE | `/aluno/submissao/:id` | student | Deletar submissão |
| GET | `/aluno/submissoes` | student, coordinator | Listar submissões do usuário |
| GET | `/aluno/resumo-horas` | student, coordinator | Horas por categoria |
| GET | `/aluno/meus-dados` | student, coordinator | Dados do perfil |
| GET | `/aluno/cursos` | student, coordinator | Cursos disponíveis |
| GET | `/aluno/notificacoes` | student, coordinator | Notificações |
| POST | `/aluno/notificacoes/ler-todas` | student, coordinator | Marcar todas como lidas |
| GET | `/aluno/extrato-print` | — | Extrato imprimível |
| POST | `/aluno/submissao/:id/arquivo` | student, coordinator | Anexar arquivo adicional |
| GET | `/aluno/submissao/:id/arquivo` | student, coordinator | Recuperar arquivo |

---

### `/coordenador`

Rotas de análise e aprovação de submissões restritas ao escopo do próprio curso do coordenador.

---

### `/admin`

| Método | Rota | Perfis | Descrição |
|---|---|---|---|
| GET/POST | `/admin/cursos` `/admin/curso` | super_admin | Listar / criar curso |
| PUT/DELETE | `/admin/curso/:id` | super_admin | Atualizar / deletar curso |
| GET | `/admin/curso/:id/coordenador` | super_admin | Coordenador do curso |
| GET | `/admin/submissoes` | super_admin | Todas as submissões |
| GET/POST | `/admin/coordenadores` `/admin/coordenador` | super_admin | Listar / cadastrar coordenador |
| PUT/DELETE | `/admin/coordenador/:id` | super_admin | Atualizar / deletar coordenador |
| GET | `/admin/alunos` | super_admin, coordinator | Listar alunos |
| GET | `/admin/limites-cursos` | super_admin | Limites de horas por curso |
| GET | `/admin/logs` | super_admin | Logs do sistema |
| GET | `/admin/exportar-relatorio` | super_admin, coordinator | Exportar CSV |

---

### `/dashboard` · `/upload`

Métricas consolidadas por perfil e gerenciamento de arquivos de certificados.

---

## Pipeline de análise

Scripts Python em `backend/src/scripts/` executados diariamente às **03:00** via `node-cron`, ou sob demanda pelo super admin.

| Script | Responsabilidade |
|---|---|
| `executar_pipeline.py` | Orquestrador — chama todos os demais em sequência |
| `classificacao_risco.py` | Classifica alunos por risco de não completar horas |
| `gerar_insights_ia.py` | Insights narrativos via Groq LLM |
| `gerar_insights_alunos.py` | Análise individual por aluno |
| `gerar_insights_categorias.py` | Análise por categoria de atividade |
| `gerar_insights_cursos.py` | Análise por curso |
| `gerar_recomendacoes.py` | Recomendações automáticas |
| `calcular_tempo_medio.py` | Tempo médio de análise por coordenador |

Resultados são persistidos diretamente no PostgreSQL (tabelas `classificacao_risco`, `insights`, `recomendacoes`).

---

## Mobile

**Fluxo de navegação**

```
Welcome
  └─ Login / ForgotPassword
       └─ FirstAccess (primeiro login)
       └─ SelectCourse
            └─ Dashboard
                 ├─ SubmitHours → SubmitDocument → SubmitSuccess
                 ├─ HoursList → HourDetail
                 ├─ Notifications
                 └─ Profile
```

**Status de submissão**

`submitted` · `pendente` · `aprovado` · `rejeitado` · `returned_for_adjustment`
