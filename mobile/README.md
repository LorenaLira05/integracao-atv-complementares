<div align="center">

# 📱 Sistema de Horas Mobile

> Aplicativo mobile para registro, submissão e acompanhamento de horas complementares acadêmicas do SENAC.

![React Native](https://img.shields.io/badge/React%20Native-0.81.5-61DAFB?style=for-the-badge&logo=react&logoColor=white)
![Expo](https://img.shields.io/badge/Expo-SDK%2054-000020?style=for-the-badge&logo=expo&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-5.9-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
![Axios](https://img.shields.io/badge/Axios-1.16-5A29E4?style=for-the-badge&logo=axios&logoColor=white)

</div>

---

## 📋 Sumário

- [Sobre o Projeto](#-sobre-o-projeto)
- [Telas Implementadas](#-telas-implementadas)
- [Pré-requisitos](#-pré-requisitos)
- [Instalação](#-instalação)
- [Rodando o Projeto](#-rodando-o-projeto)
- [Arquitetura de Pastas](#-arquitetura-de-pastas)
- [Fluxo de Navegação](#-fluxo-de-navegação)
- [Componentes Reutilizáveis](#-componentes-reutilizáveis)
- [Dependências](#-dependências)
- [Scripts Disponíveis](#-scripts-disponíveis)

---

## 📖 Sobre o Projeto

O **Sistema de Horas Mobile** é o cliente mobile de um sistema de gestão de horas complementares do SENAC Acre. Ele permite que alunos submetam atividades para aprovação, coordenadores avaliem as submissões e o superadmin gerencie toda a plataforma — tudo pelo celular.

---

## 🖼️ Telas Implementadas

### 1. Tela de Boas-vindas (`WelcomeScreen`)

Primeira tela exibida ao abrir o app. Apresenta o logo do SENAC, slogan e o botão de entrada.

**Arquivos:**
- `src/screens/welcome/WelcomeScreen.tsx` — componente principal com animação de fade-in
- `src/screens/welcome/WelcomeScreen.styles.ts` — estilos separados

**Elementos visuais:**
- Ondas decorativas pêssego no topo e na base (componente `WaveBackground`)
- Logo SENAC centralizado (componente `SenacLogo`)
- Título **"Bem-vindo ao Futuro"** e tagline
- Barra divisória laranja decorativa
- Botão **"Começar Jornada"** com sombra e animação de fade-in

---

### 2. Tela de Primeiro Acesso (`FirstAccessScreen`)

Exibida após o clique em "Começar Jornada". Permite ao usuário criar seu acesso inicial ao sistema.

**Arquivos:**
- `src/screens/firstAccess/FirstAccessScreen.tsx` — componente principal com sub-componentes
- `src/screens/firstAccess/FirstAccessScreen.styles.ts` — estilos separados

**Sub-componentes internos (dentro do arquivo):**

| Sub-componente | Responsabilidade |
|---|---|
| `AvatarPlaceholder` | Círculo com ícone de pessoa representando a foto do perfil |
| `InputField` | Campo reutilizável com ícone Ionicons, borda de foco e toggle de senha |

**Elementos visuais:**
- Mesmas ondas pêssego da WelcomeScreen (reuso de `WaveBackground`)
- Logo SENAC centralizado (reuso de `SenacLogo`)
- Avatar circular com ícone de pessoa
- Título **"Primeiro acesso"** e subtítulo **"Crie uma conta"**
- Campo **Nome** com ícone `person-outline`
- Campo **Matrícula ou E-mail** com ícone `person-outline`
- Campo **Senha** com ícone `lock-closed-outline` e botão de olho (`eye-outline` / `eye-off-outline`)
- Botão **"Entrar"** com sombra azul
- Separador **"ou continue com"**
- Link **"Primeiro acesso? Ative sua conta"** em laranja

---

## ✅ Pré-requisitos

Antes de começar, certifique-se de ter instalado:

| Ferramenta | Versão mínima | Download |
|---|---|---|
| Node.js | 18.x ou superior | [nodejs.org](https://nodejs.org) |
| npm | 9.x ou superior | Incluído com Node.js |
| Expo Go (celular) | Qualquer | [App Store](https://apps.apple.com/app/expo-go/id982107779) / [Play Store](https://play.google.com/store/apps/details?id=host.exp.exponent) |

> **Android Studio / Xcode** são necessários apenas para rodar em emulador local.

---

## 🚀 Instalação

### 1. Clone o repositório

```bash
git clone https://github.com/seu-usuario/sistema-de-horas-mobile.git
cd sistema-de-horas-mobile
```

### 2. Instale as dependências

```bash
npm install
```

### 3. Configure as variáveis de ambiente

Edite `src/constants/index.ts` com a URL correta da sua API:

```ts
export const API_BASE_URL = 'https://sua-api.com/api';
```

---

## ▶️ Rodando o Projeto

### No celular (recomendado)

```bash
npm start
```

Escaneie o QR Code exibido no terminal com o app **Expo Go**.

### No emulador Android

```bash
npm run android
```

### No simulador iOS (somente macOS)

```bash
npm run ios
```

---

## 🌐 Hospedando o App na Web (Expo Web)

Este aplicativo mobile está configurado para rodar também diretamente no navegador de computadores e celulares como um Web App.

### Dependências Web
Foram adicionadas as seguintes dependências no projeto para habilitar o suporte web:
*   `react-native-web` (mapeia primitivos React Native para tags HTML)
*   `react-dom` (renderizador DOM para React)

### Rodando o App no Navegador Localmente
Para abrir a versão web do aplicativo localmente na sua máquina:
```bash
npx expo start --web
# ou: npm run web
```

### Compilando a Versão Web (Build)
Para gerar o código de produção otimizado e estático (HTML/JS/CSS):
```bash
npx expo export --platform web
```
Os arquivos gerados serão salvos na pasta **`dist/`**.

### Deploy Grátis na Vercel (Hospedagem)
Você pode hospedar essa pasta `dist/` automaticamente na Vercel a cada push no GitHub:
1. Crie um projeto na **[Vercel](https://vercel.com/)** e importe seu repositório.
2. Configure as seguintes opções de deploy:
   *   **Root Directory (Diretório Raiz):** `aaa/Sistema-de-horas-mobile`
   *   **Build Command (Comando de Build):** `npx expo export --platform web`
   *   **Output Directory (Diretório de Saída):** `dist`
3. Clique em **Deploy** e o Vercel publicará seu aplicativo móvel na web de forma automática!

---

## 🗂️ Arquitetura de Pastas

```
sistema-de-horas-mobile/
│
├── App.tsx                         # Entry point — monta o RootNavigator
├── index.ts                        # Registro do app no Expo
├── app.json                        # Configurações do Expo (nome, ícone, splash…)
├── tsconfig.json                   # Configuração do TypeScript
├── package.json                    # Dependências e scripts
│
└── src/
    │
    ├── assets/                     # Arquivos estáticos
    │   ├── fonts/                  # Fontes customizadas
    │   ├── icons/                  # Ícones SVG/PNG
    │   └── images/                 # Imagens estáticas
    │
    ├── components/
    │   └── common/
    │       ├── WaveBackground.tsx  # 🆕 Ondas decorativas pêssego (topo/base)
    │       └── SenacLogo.tsx       # 🆕 Logo SENAC em React Native puro
    │
    ├── constants/
    │   └── index.ts                # URL da API, chaves do storage, categorias
    │
    ├── hooks/
    │   ├── useApi.ts               # Hook genérico para chamadas HTTP
    │   ├── useAuth.ts              # Autenticação + persistência de sessão
    │   └── index.ts                # Barrel export
    │
    ├── navigation/
    │   └── RootNavigator.tsx       # Rotas: Welcome → FirstAccess → Login → App
    │
    ├── screens/
    │   ├── welcome/                # 🆕 Tela de Boas-vindas
    │   │   ├── WelcomeScreen.tsx
    │   │   └── WelcomeScreen.styles.ts
    │   ├── firstAccess/            # 🆕 Tela de Primeiro Acesso
    │   │   ├── FirstAccessScreen.tsx
    │   │   └── FirstAccessScreen.styles.ts
    │   ├── auth/
    │   │   └── LoginScreen.tsx
    │   ├── dashboard/
    │   │   └── DashboardScreen.tsx
    │   ├── hours/
    │   │   └── SubmitHoursScreen.tsx
    │   ├── profile/
    │   │   └── ProfileScreen.tsx
    │   └── index.ts                # Barrel export de todas as telas
    │
    ├── services/
    │   └── api/
    │       ├── authService.ts      # Login, logout, primeiro acesso
    │       ├── hoursService.ts     # CRUD de submissões de horas
    │       └── index.ts
    │
    ├── store/
    │   └── slices/                 # Estado global (Redux Toolkit)
    │
    ├── types/
    │   └── index.ts                # Interfaces globais + RootStackParamList
    │
    └── utils/
        ├── formatDate.ts           # Formatação de datas
        ├── validators.ts           # Validações (email, senha, etc.)
        └── index.ts
```

> 🆕 = Arquivo criado/atualizado recentemente

---

## 🗺️ Fluxo de Navegação

```
┌─────────────────────────────────────────────────────────────────┐
│  App abre                                                        │
│       ↓                                                          │
│  WelcomeScreen   ──[Começar Jornada]──►  FirstAccessScreen       │
│                                                ↓                 │
│                                          [Entrar]                │
│                                                ↓                 │
│                                          LoginScreen             │
│                                                ↓                 │
│                                    ┌─────────────────────┐       │
│                                    │    App Stack         │       │
│                                    │  Dashboard           │       │
│                                    │  SubmitHours         │       │
│                                    │  Profile             │       │
│                                    └─────────────────────┘       │
└─────────────────────────────────────────────────────────────────┘
```

Controlado em `src/navigation/RootNavigator.tsx` via `createNativeStackNavigator`.

---

## 🧩 Componentes Reutilizáveis

### `WaveBackground`

```tsx
import WaveBackground from '../../components/common/WaveBackground';

// Onda no topo da tela
<WaveBackground position="top" />

// Onda na base da tela
<WaveBackground position="bottom" />
```

Cria as ondas decorativas pêssego usando `borderRadius` em `View` com `position: 'absolute'`. Reusada na `WelcomeScreen` e `FirstAccessScreen`.

---

### `SenacLogo`

```tsx
import SenacLogo from '../../components/common/SenacLogo';

<SenacLogo />
```

Renderiza o logo do SENAC usando apenas primitivos React Native (triângulos com `borderWidth` + texto). Sem dependência de imagem externa.

---

## 📦 Dependências

### Produção

| Pacote | Versão | Finalidade |
|---|---|---|
| `expo` | ~54.0.33 | Plataforma base do projeto |
| `react-native` | 0.81.5 | Framework mobile |
| `react` | 19.1.0 | Biblioteca de UI |
| `@expo/vector-icons` | ^15.0.3 | 🆕 Ícones vetoriais (Ionicons, MaterialIcons, etc.) |
| `axios` | ^1.16.1 | Cliente HTTP com interceptors |
| `@react-navigation/native` | ^7.2.4 | Navegação entre telas |
| `@react-navigation/native-stack` | ^7.15.1 | Stack Navigator nativo |
| `react-native-screens` | ~4.16.0 | Otimização de telas nativas |
| `react-native-safe-area-context` | ~5.6.0 | Área segura (notch, barra de status) |
| `@react-native-async-storage/async-storage` | ^2.2.0 | Persistência local (token, sessão) |
| `expo-status-bar` | ~3.0.9 | Controle da barra de status |

### Desenvolvimento

| Pacote | Versão | Finalidade |
|---|---|---|
| `typescript` | ~5.9.2 | Tipagem estática |
| `@types/react` | ~19.1.0 | Tipos do React |

---

### Por que `@expo/vector-icons`?

A biblioteca `@expo/vector-icons` fornece acesso a mais de **30.000 ícones vetoriais** de famílias consagradas como **Ionicons**, MaterialIcons, FontAwesome e outras — tudo integrado ao Expo sem configuração adicional.

Ícones utilizados no projeto:

| Ícone | Família | Onde é usado |
|---|---|---|
| `person-outline` | Ionicons | Campo Nome e Matrícula (FirstAccess) |
| `lock-closed-outline` | Ionicons | Campo Senha (FirstAccess) |
| `eye-outline` | Ionicons | Botão mostrar senha |
| `eye-off-outline` | Ionicons | Botão ocultar senha |
| `person` | Ionicons | Avatar placeholder |

```tsx
// Exemplo de uso
import { Ionicons } from '@expo/vector-icons';

<Ionicons name="lock-closed-outline" size={20} color="#9CA3AF" />
```

---

## 🎨 Paleta de Cores

| Token | Cor | Uso |
|---|---|---|
| Azul SENAC | `#1A3D6D` | Títulos, botões, ícones focados |
| Laranja SENAC | `#E87722` | Destaques, links, divider |
| Pêssego (onda) | `#F5C9A0` | Ondas decorativas de fundo |
| Texto principal | `#1A1A2E` | Títulos e labels |
| Texto secundário | `#6B7280` | Subtítulos e placeholders |
| Borda input | `#E5E7EB` | Campos em repouso |

---

## 🔧 Scripts Disponíveis

```bash
# Inicia o servidor de desenvolvimento Expo
npm start

# Abre no emulador Android
npm run android

# Abre no simulador iOS
npm run ios

# Abre no navegador
npm run web

# Verifica erros de TypeScript
npx tsc --noEmit
```

---

## 📄 Licença

Este projeto é de uso acadêmico e privado — SENAC Acre.

---

<div align="center">
  Feito com ❤️ usando React Native + Expo
</div>
