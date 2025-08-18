# 🔄 PLANO DE REORGANIZAÇÃO DOS REPOSITÓRIOS EVOLVEYOU

## 📊 SITUAÇÃO ATUAL

### **Repositórios Existentes:**
1. `evolveyou-backend` - Backend com microserviços
2. `evolveyou-frontend` - Aplicativo Flutter
3. `evolveyou-docs` - Documentação
4. `evolveyou-dashboard` - Dashboard de progresso (React)
5. `evolveyou-dashboard-backend` - Backend do dashboard (Node.js)

### **Problemas Identificados:**
- ❌ Estrutura não alinhada com projeto original
- ❌ Falta de funcionalidades core (Coach EVO, Anamnese)
- ❌ Frontend desconectado do backend
- ❌ Documentação desatualizada
- ❌ Falta de padrões de desenvolvimento

---

## 🎯 ESTRUTURA ALVO (CONFORME PROJETO ORIGINAL)

### **Repositório Principal: `evolveyou-app`**
```
evolveyou-app/
├── README.md                    # Documentação principal
├── ARCHITECTURE.md              # Arquitetura do sistema
├── ROADMAP.md                   # Roadmap de desenvolvimento
├── CONTRIBUTING.md              # Guia de contribuição
├── .github/                     # GitHub Actions e templates
│   ├── workflows/               # CI/CD pipelines
│   └── ISSUE_TEMPLATE/          # Templates de issues
├── docs/                        # Documentação completa
│   ├── api/                     # Documentação das APIs
│   ├── frontend/                # Documentação do frontend
│   ├── deployment/              # Guias de deploy
│   └── user-guide/              # Manual do usuário
├── backend/                     # Microserviços backend
│   ├── services/                # Microserviços
│   │   ├── users-service/       # Usuários e autenticação
│   │   ├── plans-service/       # Geração de planos
│   │   ├── content-service/     # Base TACO e exercícios
│   │   ├── tracking-service/    # Acompanhamento diário
│   │   ├── evo-service/         # Coach virtual EVO
│   │   └── gateway-service/     # API Gateway
│   ├── shared/                  # Código compartilhado
│   │   ├── models/              # Modelos de dados
│   │   ├── utils/               # Utilitários
│   │   └── middleware/          # Middleware comum
│   ├── infrastructure/          # Terraform e configs
│   └── docker-compose.yml       # Ambiente local
├── frontend/                    # Aplicativo Flutter
│   ├── lib/                     # Código fonte
│   │   ├── core/                # Funcionalidades core
│   │   │   ├── evo/             # Coach virtual EVO
│   │   │   ├── auth/            # Autenticação
│   │   │   └── api/             # Cliente API
│   │   ├── features/            # Funcionalidades por módulo
│   │   │   ├── onboarding/      # Cadastro e anamnese
│   │   │   ├── dashboard/       # Tela "Hoje"
│   │   │   ├── diet/            # Funcionalidades de dieta
│   │   │   ├── workout/         # Funcionalidades de treino
│   │   │   └── progress/        # Acompanhamento
│   │   ├── shared/              # Componentes compartilhados
│   │   │   ├── widgets/         # Widgets customizados
│   │   │   ├── themes/          # Temas e estilos
│   │   │   └── constants/       # Constantes
│   │   └── main.dart            # Ponto de entrada
│   ├── assets/                  # Recursos visuais
│   │   ├── images/              # Imagens
│   │   ├── icons/               # Ícones
│   │   ├── animations/          # Animações
│   │   └── evo/                 # Assets do Coach EVO
│   └── test/                    # Testes
├── tools/                       # Scripts e ferramentas
│   ├── scripts/                 # Scripts de automação
│   ├── generators/              # Geradores de código
│   └── deployment/              # Scripts de deploy
└── monitoring/                  # Dashboard de monitoramento
    ├── dashboard/               # Dashboard React
    └── backend/                 # Backend do dashboard
```

---

## 🔄 PLANO DE REORGANIZAÇÃO

### **FASE 1: CONSOLIDAÇÃO (Dia 1-2)**

#### **1.1 Criar Repositório Principal**
```bash
# Criar novo repositório unificado
mkdir evolveyou-app
cd evolveyou-app
git init
```

#### **1.2 Migrar Backend**
- Mover `evolveyou-backend/services/` → `backend/services/`
- Reorganizar estrutura conforme padrão
- Adicionar novo `evo-service` para Coach Virtual
- Criar `gateway-service` para API Gateway

#### **1.3 Migrar Frontend**
- Mover `evolveyou-frontend/` → `frontend/`
- Reorganizar por features conforme projeto original
- Criar módulos para funcionalidades core
- Adicionar assets do Coach EVO

#### **1.4 Migrar Documentação**
- Consolidar `evolveyou-docs/` → `docs/`
- Atualizar documentação conforme projeto original
- Criar guias de desenvolvimento

#### **1.5 Migrar Monitoring**
- Mover `evolveyou-dashboard/` → `monitoring/dashboard/`
- Mover `evolveyou-dashboard-backend/` → `monitoring/backend/`

### **FASE 2: IMPLEMENTAÇÃO DE FUNCIONALIDADES CORE (Dia 3-17)**

#### **2.1 Coach Virtual EVO (Dia 3-5)**
- Criar `backend/services/evo-service/`
- Implementar APIs do Coach EVO
- Criar componentes Flutter para EVO
- Integrar com frontend

#### **2.2 Anamnese Inteligente (Dia 6-8)**
- Implementar 22 perguntas em 5 categorias
- Criar fluxo de onboarding completo
- Integrar com algoritmo metabólico

#### **2.3 Algoritmo Metabólico Avançado (Dia 9-11)**
- Implementar fatores de ajuste
- Integrar com anamnese
- Criar cálculos personalizados

#### **2.4 Dashboard "Hoje" Funcional (Dia 12-14)**
- Implementar 4 cards interativos
- Conectar com backend
- Criar atualizações em tempo real

#### **2.5 Sistema Full-time (Dia 15-17)**
- Implementar rebalanceamento automático
- Criar algoritmos de compensação
- Integrar com tracking

### **FASE 3: FUNCIONALIDADES PRINCIPAIS (Dia 18-27)**

#### **3.1 Funcionalidades de Dieta (Dia 18-20)**
- Check-in de refeições
- Substituição inteligente
- Tabela nutricional

#### **3.2 Funcionalidades de Treino (Dia 21-23)**
- Player de treino imersivo
- Registro de séries
- Cálculo de gasto calórico

#### **3.3 API Gateway (Dia 24-25)**
- Implementar controle de acesso
- Configurar roteamento
- Integrar autenticação

#### **3.4 Integrações (Dia 26-27)**
- Conectar frontend com backend
- Testar fluxos completos
- Ajustar performance

### **FASE 4: FUNCIONALIDADES AVANÇADAS (Dia 28-35)**

#### **4.1 Equivalência Nutricional (Dia 28-29)**
- Implementar serviço dedicado
- Criar algoritmos de substituição
- Integrar com frontend

#### **4.2 Lista de Compras (Dia 30-31)**
- Implementar geração automática
- Adicionar funcionalidades premium
- Integrar geolocalização

#### **4.3 Ciclos de 45 Dias (Dia 32-33)**
- Implementar renovação automática
- Criar sistema de reavaliação
- Integrar com planos

#### **4.4 Funcionalidades Premium (Dia 34-35)**
- Treino guiado pela EVO
- Análise corporal
- Coach motivacional

---

## 📋 PADRÕES DE DESENVOLVIMENTO

### **Estrutura de Commits**
```
feat: adicionar funcionalidade X
fix: corrigir bug Y
docs: atualizar documentação Z
refactor: refatorar código W
test: adicionar testes para V
```

### **Branches**
- `main` - Produção
- `develop` - Desenvolvimento
- `feature/nome-da-funcionalidade` - Features
- `hotfix/nome-do-fix` - Correções urgentes

### **Documentação**
- README.md em cada módulo
- Comentários em código crítico
- Documentação de APIs
- Guias de setup

### **Testes**
- Testes unitários obrigatórios
- Testes de integração para APIs
- Testes E2E para fluxos críticos
- Coverage mínimo de 80%

---

## 🚀 CRONOGRAMA DE EXECUÇÃO

### **Semana 1 (Dia 1-7)**
- Dia 1-2: Reorganização dos repositórios
- Dia 3-5: Implementação do Coach EVO
- Dia 6-7: Início da anamnese inteligente

### **Semana 2 (Dia 8-14)**
- Dia 8: Conclusão da anamnese
- Dia 9-11: Algoritmo metabólico avançado
- Dia 12-14: Dashboard "Hoje" funcional

### **Semana 3 (Dia 15-21)**
- Dia 15-17: Sistema Full-time
- Dia 18-20: Funcionalidades de dieta
- Dia 21: Início funcionalidades de treino

### **Semana 4 (Dia 22-28)**
- Dia 22-23: Conclusão funcionalidades de treino
- Dia 24-25: API Gateway
- Dia 26-27: Integrações
- Dia 28: Início equivalência nutricional

### **Semana 5 (Dia 29-35)**
- Dia 29: Conclusão equivalência nutricional
- Dia 30-31: Lista de compras
- Dia 32-33: Ciclos de 45 dias
- Dia 34-35: Funcionalidades premium

---

## 📊 MÉTRICAS DE SUCESSO

### **Repositórios**
- ✅ Estrutura unificada e organizada
- ✅ Documentação completa e atualizada
- ✅ Padrões de desenvolvimento estabelecidos
- ✅ CI/CD funcionando

### **Funcionalidades**
- ✅ Coach EVO implementado e funcional
- ✅ Anamnese inteligente completa
- ✅ Dashboard "Hoje" conectado ao backend
- ✅ Sistema Full-time operacional

### **Qualidade**
- ✅ Cobertura de testes > 80%
- ✅ Performance < 2s tempo de resposta
- ✅ Zero bugs críticos
- ✅ Documentação 100% atualizada

---

## 🎯 PRÓXIMOS PASSOS

1. **Aprovar plano de reorganização**
2. **Criar repositório unificado**
3. **Migrar código existente**
4. **Implementar funcionalidades core**
5. **Testar e validar**

**A reorganização transformará a base técnica atual no produto revolucionário planejado originalmente, mantendo toda a qualidade já desenvolvida.**

