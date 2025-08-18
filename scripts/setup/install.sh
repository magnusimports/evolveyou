#!/bin/bash

# EvolveYou - Script de Instalação Automatizada
# Versão: 1.0.0
# Data: 18/01/2025

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Logging function
log() {
    echo -e "${GREEN}[$(date +'%Y-%m-%d %H:%M:%S')] $1${NC}"
}

warn() {
    echo -e "${YELLOW}[$(date +'%Y-%m-%d %H:%M:%S')] WARNING: $1${NC}"
}

error() {
    echo -e "${RED}[$(date +'%Y-%m-%d %H:%M:%S')] ERROR: $1${NC}"
    exit 1
}

# Check if running as root
if [[ $EUID -eq 0 ]]; then
   error "Este script não deve ser executado como root"
fi

log "🚀 Iniciando instalação do EvolveYou..."

# Check system requirements
log "📋 Verificando requisitos do sistema..."

# Check OS
if [[ "$OSTYPE" == "linux-gnu"* ]]; then
    OS="linux"
    log "✅ Sistema operacional: Linux"
elif [[ "$OSTYPE" == "darwin"* ]]; then
    OS="macos"
    log "✅ Sistema operacional: macOS"
else
    error "Sistema operacional não suportado: $OSTYPE"
fi

# Check available memory
MEMORY_GB=$(free -g 2>/dev/null | awk '/^Mem:/{print $2}' || sysctl -n hw.memsize 2>/dev/null | awk '{print int($1/1024/1024/1024)}')
if [[ $MEMORY_GB -lt 8 ]]; then
    warn "Memória RAM disponível: ${MEMORY_GB}GB (recomendado: 8GB+)"
else
    log "✅ Memória RAM: ${MEMORY_GB}GB"
fi

# Check disk space
DISK_SPACE=$(df -h . | awk 'NR==2{print $4}' | sed 's/G//')
if [[ $DISK_SPACE -lt 10 ]]; then
    warn "Espaço em disco disponível: ${DISK_SPACE}GB (recomendado: 10GB+)"
else
    log "✅ Espaço em disco: ${DISK_SPACE}GB"
fi

# Install dependencies based on OS
install_dependencies() {
    log "📦 Instalando dependências..."
    
    if [[ "$OS" == "linux" ]]; then
        # Update package list
        sudo apt update
        
        # Install basic tools
        sudo apt install -y curl wget git build-essential
        
        # Install Node.js via NodeSource
        if ! command -v node &> /dev/null; then
            log "📦 Instalando Node.js..."
            curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
            sudo apt install -y nodejs
        fi
        
        # Install Python 3.11
        if ! command -v python3.11 &> /dev/null; then
            log "📦 Instalando Python 3.11..."
            sudo apt install -y software-properties-common
            sudo add-apt-repository -y ppa:deadsnakes/ppa
            sudo apt update
            sudo apt install -y python3.11 python3.11-pip python3.11-venv
        fi
        
        # Install Docker
        if ! command -v docker &> /dev/null; then
            log "📦 Instalando Docker..."
            curl -fsSL https://get.docker.com -o get-docker.sh
            sudo sh get-docker.sh
            sudo usermod -aG docker $USER
            rm get-docker.sh
        fi
        
    elif [[ "$OS" == "macos" ]]; then
        # Check if Homebrew is installed
        if ! command -v brew &> /dev/null; then
            log "📦 Instalando Homebrew..."
            /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
        fi
        
        # Install dependencies via Homebrew
        log "📦 Instalando dependências via Homebrew..."
        brew update
        brew install node python@3.11 git docker
    fi
}

# Check and install Node.js
check_node() {
    log "🔍 Verificando Node.js..."
    
    if command -v node &> /dev/null; then
        NODE_VERSION=$(node --version | sed 's/v//')
        REQUIRED_VERSION="18.0.0"
        
        if [[ "$(printf '%s\n' "$REQUIRED_VERSION" "$NODE_VERSION" | sort -V | head -n1)" = "$REQUIRED_VERSION" ]]; then
            log "✅ Node.js versão: $NODE_VERSION"
        else
            error "Node.js versão $NODE_VERSION é muito antiga. Requerido: $REQUIRED_VERSION+"
        fi
    else
        error "Node.js não encontrado. Instalando..."
        install_dependencies
    fi
}

# Check and install Python
check_python() {
    log "🔍 Verificando Python..."
    
    if command -v python3.11 &> /dev/null; then
        PYTHON_VERSION=$(python3.11 --version | awk '{print $2}')
        log "✅ Python versão: $PYTHON_VERSION"
    elif command -v python3 &> /dev/null; then
        PYTHON_VERSION=$(python3 --version | awk '{print $2}')
        if [[ "$(printf '%s\n' "3.11.0" "$PYTHON_VERSION" | sort -V | head -n1)" = "3.11.0" ]]; then
            log "✅ Python versão: $PYTHON_VERSION"
            alias python3.11=python3
        else
            error "Python versão $PYTHON_VERSION é muito antiga. Requerido: 3.11.0+"
        fi
    else
        error "Python não encontrado. Instalando..."
        install_dependencies
    fi
}

# Setup project
setup_project() {
    log "🏗️ Configurando projeto..."
    
    # Install npm dependencies for root
    if [[ -f "package.json" ]]; then
        log "📦 Instalando dependências npm do projeto..."
        npm install
    fi
    
    # Setup backend services
    log "🔧 Configurando backend services..."
    
    # Users Service
    if [[ -d "backend/services/users-service" ]]; then
        cd backend/services/users-service
        log "📦 Configurando Users Service..."
        
        # Create virtual environment
        python3.11 -m venv venv
        source venv/bin/activate
        
        # Install Python dependencies
        pip install --upgrade pip
        pip install -r requirements.txt
        
        # Copy environment file
        if [[ ! -f ".env" && -f ".env.example" ]]; then
            cp .env.example .env
            warn "Arquivo .env criado. Configure suas variáveis de ambiente."
        fi
        
        deactivate
        cd ../../..
    fi
    
    # Coach EVO Service
    if [[ -d "backend/services/coach-evo-service" ]]; then
        cd backend/services/coach-evo-service
        log "📦 Configurando Coach EVO Service..."
        
        # Create virtual environment
        python3.11 -m venv venv
        source venv/bin/activate
        
        # Install Python dependencies
        pip install --upgrade pip
        pip install -r requirements.txt
        
        # Copy environment file
        if [[ ! -f ".env" && -f ".env.example" ]]; then
            cp .env.example .env
            warn "Arquivo .env criado. Configure suas variáveis de ambiente."
        fi
        
        deactivate
        cd ../../..
    fi
    
    # Setup frontend applications
    log "🌐 Configurando frontend applications..."
    
    # Web App
    if [[ -d "frontend/web-app" ]]; then
        cd frontend/web-app
        log "📦 Configurando Web App..."
        
        npm install
        
        # Copy environment file
        if [[ ! -f ".env" && -f ".env.example" ]]; then
            cp .env.example .env
            warn "Arquivo .env criado. Configure suas variáveis de ambiente."
        fi
        
        cd ../..
    fi
    
    # Auth Integration
    if [[ -d "frontend/auth-integration" ]]; then
        cd frontend/auth-integration
        log "📦 Configurando Auth Integration..."
        
        npm install
        
        cd ../..
    fi
    
    # Anamnese App
    if [[ -d "frontend/anamnese-app" ]]; then
        cd frontend/anamnese-app
        log "📦 Configurando Anamnese App..."
        
        npm install
        
        cd ../..
    fi
}

# Setup Git hooks
setup_git_hooks() {
    log "🔗 Configurando Git hooks..."
    
    if command -v npx &> /dev/null; then
        npx husky install
        npx husky add .husky/pre-commit "lint-staged"
        npx husky add .husky/commit-msg 'npx --no -- commitlint --edit "$1"'
        log "✅ Git hooks configurados"
    else
        warn "npx não encontrado. Git hooks não configurados."
    fi
}

# Create development scripts
create_dev_scripts() {
    log "📝 Criando scripts de desenvolvimento..."
    
    # Create start script
    cat > start-dev.sh << 'EOF'
#!/bin/bash

# Start all development services
echo "🚀 Iniciando EvolveYou em modo desenvolvimento..."

# Start backend services in background
echo "🔧 Iniciando backend services..."
cd backend/services/users-service && source venv/bin/activate && python -m uvicorn src.main:app --reload --port 8001 &
cd ../../..
cd backend/services/coach-evo-service && source venv/bin/activate && python -m uvicorn src.main:app --reload --port 8004 &
cd ../../..

# Start frontend
echo "🌐 Iniciando frontend..."
cd frontend/web-app && npm run dev &
cd ../..

echo "✅ Todos os serviços iniciados!"
echo "📱 Frontend: http://localhost:3000"
echo "🔧 Users API: http://localhost:8001"
echo "🤖 Coach EVO: http://localhost:8004"

wait
EOF
    
    chmod +x start-dev.sh
    
    # Create stop script
    cat > stop-dev.sh << 'EOF'
#!/bin/bash

echo "🛑 Parando serviços EvolveYou..."

# Kill processes by port
pkill -f "uvicorn.*8001" 2>/dev/null || true
pkill -f "uvicorn.*8004" 2>/dev/null || true
pkill -f "vite.*3000" 2>/dev/null || true

echo "✅ Serviços parados!"
EOF
    
    chmod +x stop-dev.sh
    
    log "✅ Scripts de desenvolvimento criados"
}

# Run tests
run_tests() {
    log "🧪 Executando testes..."
    
    # Backend tests
    if [[ -d "backend/services/users-service" ]]; then
        cd backend/services/users-service
        source venv/bin/activate
        python -m pytest tests/ -v || warn "Alguns testes do backend falharam"
        deactivate
        cd ../../..
    fi
    
    # Frontend tests
    if [[ -d "frontend/web-app" ]]; then
        cd frontend/web-app
        npm test -- --watchAll=false || warn "Alguns testes do frontend falharam"
        cd ../..
    fi
    
    log "✅ Testes executados"
}

# Main installation flow
main() {
    log "🎯 Iniciando instalação completa do EvolveYou..."
    
    # Check if we're in the right directory
    if [[ ! -f "package.json" || ! -d "backend" || ! -d "frontend" ]]; then
        error "Execute este script no diretório raiz do projeto EvolveYou"
    fi
    
    # Install system dependencies if needed
    if ! command -v node &> /dev/null || ! command -v python3.11 &> /dev/null; then
        read -p "Instalar dependências do sistema? (y/N): " -n 1 -r
        echo
        if [[ $REPLY =~ ^[Yy]$ ]]; then
            install_dependencies
        fi
    fi
    
    # Check requirements
    check_node
    check_python
    
    # Setup project
    setup_project
    
    # Setup Git hooks
    setup_git_hooks
    
    # Create development scripts
    create_dev_scripts
    
    # Ask if user wants to run tests
    read -p "Executar testes? (y/N): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        run_tests
    fi
    
    log "🎉 Instalação concluída com sucesso!"
    echo
    echo -e "${BLUE}📋 Próximos passos:${NC}"
    echo "1. Configure as variáveis de ambiente nos arquivos .env"
    echo "2. Configure Firebase e Google Cloud"
    echo "3. Execute: ./start-dev.sh para iniciar o desenvolvimento"
    echo "4. Acesse: http://localhost:3000"
    echo
    echo -e "${GREEN}📚 Documentação: docs/INSTALLATION.md${NC}"
    echo -e "${GREEN}🆘 Suporte: https://github.com/evolveyou/evolveyou/issues${NC}"
}

# Run main function
main "$@"

