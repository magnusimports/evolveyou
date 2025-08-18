# 📁 Estrutura do Projeto EvolveYou

## 🏗️ Organização Geral

```
evolveyou/
├── 📚 docs/                    # Documentação completa
│   ├── README.md              # Visão geral do projeto
│   ├── STRUCTURE.md           # Este arquivo - estrutura
│   ├── INSTALLATION.md        # Guia de instalação
│   ├── API.md                 # Documentação das APIs
│   ├── DEPLOYMENT.md          # Guia de deploy
│   └── modules/               # Documentação por módulo
│       ├── coach-evo.md       # Coach Virtual EVO
│       ├── anamnese.md        # Sistema de Anamnese
│       ├── frontend.md        # Frontend Web
│       ├── backend.md         # Backend Services
│       └── mobile.md          # Aplicativo Mobile
│
├── 🖥️ backend/                 # Serviços backend
│   ├── services/              # Microserviços
│   │   ├── users-service/     # Gestão de usuários
│   │   ├── coach-evo-service/ # Coach Virtual EVO
│   │   └── analytics-service/ # Analytics e feedback
│   ├── shared/                # Código compartilhado
│   └── infrastructure/        # Configurações de infra
│
├── 🌐 frontend/                # Aplicação web
│   ├── web-app/               # App React principal
│   ├── landing-page/          # Landing page
│   ├── auth-integration/      # Sistema de autenticação
│   └── anamnese-app/          # Aplicação de anamnese
│
├── 📱 mobile/                  # Aplicativos mobile
│   ├── ios/                   # App iOS (Swift)
│   ├── android/               # App Android (Kotlin)
│   └── flutter/               # App Flutter (cross-platform)
│
├── 🧪 tests/                   # Testes automatizados
│   ├── unit/                  # Testes unitários
│   ├── integration/           # Testes de integração
│   ├── e2e/                   # Testes end-to-end
│   └── performance/           # Testes de performance
│
├── 🔧 scripts/                 # Scripts de automação
│   ├── setup/                 # Scripts de configuração
│   ├── deploy/                # Scripts de deploy
│   └── maintenance/           # Scripts de manutenção
│
└── 🚀 .github/                 # Configurações GitHub
    ├── workflows/             # GitHub Actions
    ├── ISSUE_TEMPLATE/        # Templates de issues
    └── PULL_REQUEST_TEMPLATE/ # Template de PR
```

## 🎯 Módulos Principais

### 🤖 Coach Virtual EVO
- **Localização**: `backend/services/coach-evo-service/`
- **Tecnologia**: Python + FastAPI + Vertex AI
- **Função**: IA conversacional para coaching nutricional

### 🧠 Sistema de Anamnese
- **Localização**: `frontend/anamnese-app/`
- **Tecnologia**: React + TypeScript
- **Função**: Coleta inteligente de dados nutricionais

### 🌐 Frontend Web
- **Localização**: `frontend/web-app/`
- **Tecnologia**: React + Tailwind + Firebase
- **Função**: Interface principal do usuário

### 📱 Aplicativo Mobile
- **Localização**: `mobile/ios/`
- **Tecnologia**: Swift + SwiftUI
- **Função**: App nativo para iOS

### 🔧 Backend Services
- **Localização**: `backend/services/`
- **Tecnologia**: Python + FastAPI + Firebase
- **Função**: APIs e lógica de negócio

## 📊 Tecnologias por Camada

### **Frontend**
- React 18 + TypeScript
- Tailwind CSS + Shadcn/UI
- Framer Motion (animações)
- Firebase SDK

### **Backend**
- Python 3.11 + FastAPI
- Google Cloud (Vertex AI, Firestore)
- Firebase Authentication
- Base TACO (dados nutricionais)

### **Mobile**
- iOS: Swift + SwiftUI
- Android: Kotlin + Jetpack Compose
- Cross-platform: Flutter + Dart

### **Infraestrutura**
- Google Cloud Platform
- Firebase (Auth, Firestore, Storage)
- GitHub Actions (CI/CD)
- Docker (containerização)

## 🔄 Fluxo de Desenvolvimento

1. **Desenvolvimento Local**
   - Clone do repositório
   - Setup do ambiente
   - Desenvolvimento em branches

2. **Testes Automatizados**
   - Testes unitários
   - Testes de integração
   - Validação de qualidade

3. **Deploy Automatizado**
   - Build automático
   - Deploy em staging
   - Deploy em produção

## 📋 Convenções

### **Nomenclatura**
- **Branches**: `feature/nome-da-feature`
- **Commits**: Conventional Commits
- **Arquivos**: kebab-case
- **Componentes**: PascalCase

### **Estrutura de Commits**
```
type(scope): description

feat(coach): add conversation memory
fix(auth): resolve login timeout
docs(readme): update installation guide
```

### **Versionamento**
- Semantic Versioning (SemVer)
- Tags para releases
- Changelog automatizado

## 🚀 Próximos Passos

1. **Organização Completa** ✅
2. **Documentação Técnica** 🔄
3. **CI/CD Pipeline** 📋
4. **Testes Automatizados** 📋
5. **Deploy em Produção** 📋

---

**Última atualização**: 18/08/2025  
**Versão**: 1.0.0  
**Responsável**: EvolveYou Team

