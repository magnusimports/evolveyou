# 🚀 Guia de Instalação - EvolveYou

## 📋 Pré-requisitos

### Requisitos de Sistema
- **Sistema Operacional**: macOS, Linux ou Windows 10+
- **RAM**: Mínimo 8GB (recomendado 16GB)
- **Armazenamento**: 10GB livres
- **Internet**: Conexão estável para APIs

### Software Necessário

#### 1. Node.js e npm
```bash
# Verificar versão
node --version  # >= 18.0.0
npm --version   # >= 8.0.0

# Instalar via nvm (recomendado)
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
nvm install 18
nvm use 18
```

#### 2. Python
```bash
# Verificar versão
python3 --version  # >= 3.11.0

# macOS (via Homebrew)
brew install python@3.11

# Ubuntu/Debian
sudo apt update
sudo apt install python3.11 python3.11-pip

# Windows
# Baixar de python.org
```

#### 3. Git
```bash
# Verificar versão
git --version  # >= 2.30.0

# macOS
brew install git

# Ubuntu/Debian
sudo apt install git

# Windows
# Baixar de git-scm.com
```

#### 4. Docker (Opcional)
```bash
# Verificar versão
docker --version  # >= 20.10.0

# macOS
brew install docker

# Ubuntu
sudo apt install docker.io docker-compose

# Windows
# Baixar Docker Desktop
```

## 🔧 Configuração do Ambiente

### 1. Clone do Repositório
```bash
git clone https://github.com/evolveyou/evolveyou.git
cd evolveyou
```

### 2. Configuração do Firebase

#### 2.1. Criar Projeto Firebase
1. Acesse [Firebase Console](https://console.firebase.google.com)
2. Clique em "Adicionar projeto"
3. Nome: `evolveyou-[seu-nome]`
4. Configure Analytics (opcional)

#### 2.2. Configurar Authentication
1. No console Firebase, vá para "Authentication"
2. Clique em "Começar"
3. Aba "Sign-in method":
   - Ative "Email/senha"
   - Ative "Google"
4. Configure domínios autorizados

#### 2.3. Configurar Firestore
1. Vá para "Firestore Database"
2. Clique em "Criar banco de dados"
3. Modo: "Teste" (por enquanto)
4. Localização: "southamerica-east1"

#### 2.4. Configurar Storage
1. Vá para "Storage"
2. Clique em "Começar"
3. Regras padrão de teste

#### 2.5. Obter Configurações
1. Vá para "Configurações do projeto"
2. Aba "Geral" > "Seus apps"
3. Clique no ícone web `</>`
4. Registre o app: "EvolveYou Web"
5. Copie a configuração Firebase

### 3. Configuração do Google Cloud

#### 3.1. Criar Projeto Google Cloud
```bash
# Instalar gcloud CLI
curl https://sdk.cloud.google.com | bash
exec -l $SHELL
gcloud init

# Criar projeto
gcloud projects create evolveyou-[seu-nome]
gcloud config set project evolveyou-[seu-nome]
```

#### 3.2. Ativar APIs Necessárias
```bash
gcloud services enable \
  aiplatform.googleapis.com \
  firestore.googleapis.com \
  storage.googleapis.com \
  cloudbuild.googleapis.com
```

#### 3.3. Criar Service Account
```bash
gcloud iam service-accounts create evolveyou-service \
  --display-name="EvolveYou Service Account"

gcloud projects add-iam-policy-binding evolveyou-[seu-nome] \
  --member="serviceAccount:evolveyou-service@evolveyou-[seu-nome].iam.gserviceaccount.com" \
  --role="roles/aiplatform.user"

gcloud iam service-accounts keys create credentials.json \
  --iam-account=evolveyou-service@evolveyou-[seu-nome].iam.gserviceaccount.com
```

## ⚡ Instalação Rápida (Docker)

### 1. Configurar Variáveis de Ambiente
```bash
# Copiar templates
cp .env.example .env
cp backend/services/users-service/.env.example backend/services/users-service/.env
cp frontend/web-app/.env.example frontend/web-app/.env

# Editar arquivos .env com suas configurações
```

### 2. Iniciar com Docker
```bash
# Build e start de todos os serviços
docker-compose up -d

# Verificar status
docker-compose ps

# Ver logs
docker-compose logs -f
```

### 3. Acessar Aplicação
- **Frontend**: http://localhost:3000
- **API Users**: http://localhost:8001
- **Coach EVO**: http://localhost:8004
- **Grafana**: http://localhost:3001

## 🔨 Instalação Manual

### 1. Backend Setup

#### 1.1. Users Service
```bash
cd backend/services/users-service

# Criar ambiente virtual
python3 -m venv venv
source venv/bin/activate  # Linux/macOS
# ou
venv\Scripts\activate     # Windows

# Instalar dependências
pip install -r requirements.txt

# Configurar variáveis de ambiente
cp .env.example .env
# Editar .env com suas configurações

# Executar
python -m uvicorn src.main:app --reload --port 8001
```

#### 1.2. Coach EVO Service
```bash
cd backend/services/coach-evo-service

# Ativar ambiente virtual
source ../users-service/venv/bin/activate

# Instalar dependências
pip install -r requirements.txt

# Configurar variáveis de ambiente
cp .env.example .env
# Editar .env com suas configurações

# Executar
python -m uvicorn src.main:app --reload --port 8004
```

### 2. Frontend Setup

#### 2.1. Web App Principal
```bash
cd frontend/web-app

# Instalar dependências
npm install

# Configurar variáveis de ambiente
cp .env.example .env
# Editar .env com configuração Firebase

# Executar em desenvolvimento
npm run dev
```

#### 2.2. Auth Integration
```bash
cd frontend/auth-integration

# Instalar dependências
npm install

# Executar
npm run dev
```

#### 2.3. Anamnese App
```bash
cd frontend/anamnese-app

# Instalar dependências
npm install

# Executar
npm run dev
```

### 3. Mobile Setup (iOS)

#### 3.1. Pré-requisitos
- macOS com Xcode 15+
- iOS Simulator ou dispositivo físico
- Apple Developer Account (para deploy)

#### 3.2. Configuração
```bash
cd mobile/ios

# Abrir no Xcode
open EvolveYou.xcodeproj

# Ou via linha de comando
xcodebuild -project EvolveYou.xcodeproj -scheme EvolveYou build
```

## 🧪 Verificação da Instalação

### 1. Testes de Conectividade
```bash
# Testar APIs
curl http://localhost:8001/health
curl http://localhost:8004/health

# Testar frontend
curl http://localhost:3000
```

### 2. Executar Testes
```bash
# Testes backend
cd backend/services/users-service
python -m pytest tests/

# Testes frontend
cd frontend/web-app
npm test

# Testes integração
python tests/test_integration_complete.py
```

### 3. Verificar Logs
```bash
# Docker logs
docker-compose logs -f

# Logs manuais
tail -f backend/services/users-service/logs/app.log
```

## 🔧 Configurações Avançadas

### 1. Configuração de Desenvolvimento
```bash
# Instalar ferramentas de desenvolvimento
npm install -g @commitlint/cli @commitlint/config-conventional
pip install black flake8 pytest-cov

# Configurar hooks
npx husky install
npx husky add .husky/pre-commit "lint-staged"
```

### 2. Configuração de Produção
```bash
# Variáveis de ambiente de produção
export ENVIRONMENT=production
export FIREBASE_PROJECT_ID=evolveyou-prod
export GOOGLE_CLOUD_PROJECT=evolveyou-prod

# Build de produção
npm run build
```

### 3. Monitoramento
```bash
# Iniciar Prometheus + Grafana
docker-compose -f docker-compose.monitoring.yml up -d

# Acessar dashboards
open http://localhost:9090  # Prometheus
open http://localhost:3001  # Grafana (admin/admin)
```

## 🐛 Solução de Problemas

### Problemas Comuns

#### 1. Erro de Porta em Uso
```bash
# Verificar processos
lsof -i :8001
lsof -i :3000

# Matar processo
kill -9 <PID>
```

#### 2. Erro de Dependências Python
```bash
# Limpar cache pip
pip cache purge

# Reinstalar dependências
pip install --force-reinstall -r requirements.txt
```

#### 3. Erro de Permissões Firebase
```bash
# Verificar configuração
firebase projects:list
firebase use evolveyou-[seu-nome]

# Reautenticar
firebase login --reauth
```

#### 4. Erro de Build Frontend
```bash
# Limpar cache
npm cache clean --force
rm -rf node_modules package-lock.json
npm install
```

### Logs de Debug

#### Backend
```bash
# Ativar logs debug
export LOG_LEVEL=DEBUG

# Ver logs detalhados
python -m uvicorn src.main:app --reload --log-level debug
```

#### Frontend
```bash
# Ativar debug React
export REACT_APP_DEBUG=true

# Ver logs no browser console
```

## 📞 Suporte

Se encontrar problemas:

1. **Verifique os logs** primeiro
2. **Consulte a documentação** em `docs/`
3. **Procure issues existentes** no GitHub
4. **Abra uma nova issue** com detalhes do problema

### Informações para Issues
- Sistema operacional
- Versões do Node.js e Python
- Logs de erro completos
- Passos para reproduzir

---

**Próximo**: [Configuração de Deploy](DEPLOYMENT.md)

