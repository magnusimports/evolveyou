# 📱 EvolveYou iOS

> O aplicativo de nutrição personalizada mais avançado do Brasil

[![iOS](https://img.shields.io/badge/iOS-15.0+-blue.svg)](https://developer.apple.com/ios/)
[![Swift](https://img.shields.io/badge/Swift-5.9-orange.svg)](https://swift.org/)
[![SwiftUI](https://img.shields.io/badge/SwiftUI-4.0-green.svg)](https://developer.apple.com/swiftui/)
[![License](https://img.shields.io/badge/License-Proprietary-red.svg)](LICENSE)

## 🎯 Visão Geral

O **EvolveYou iOS** é a versão nativa para iPhone e iPad do primeiro aplicativo brasileiro a integrar completamente a **Base TACO** com **Inteligência Artificial** para nutrição personalizada. Desenvolvido em **SwiftUI** com arquitetura moderna e cálculos metabólicos cientificamente validados.

### ✨ Características Principais

- 🧠 **Anamnese Inteligente**: 22 perguntas científicas personalizadas
- 📊 **Cálculos Precisos**: TMB, TDEE e macronutrientes validados
- 🇧🇷 **Base TACO Integrada**: Primeira implementação nativa com alimentos brasileiros
- 📱 **Design iOS Nativo**: Interface seguindo Human Interface Guidelines
- ⚡ **Performance Otimizada**: Carregamento instantâneo e navegação fluida
- 🔒 **Segurança Avançada**: Criptografia e proteção de dados pessoais
- 📴 **Modo Offline**: Funcionalidade completa sem internet

## 🚀 Funcionalidades

### 🧬 Sistema de Anamnese Inteligente

- **22 perguntas científicas** organizadas em 8 categorias
- **Validação em tempo real** com feedback visual
- **Navegação fluida** com barra de progresso
- **Perguntas condicionais** baseadas em respostas anteriores

### 📊 Cálculos Metabólicos Avançados

- **IMC** com classificação automática
- **TMB** usando fórmula Mifflin-St Jeor com ajustes
- **TDEE** considerando atividade, estresse e sono
- **Macronutrientes** personalizados por objetivo
- **Hidratação** baseada em peso e atividade

### 🇧🇷 Integração Base TACO

- **Primeira implementação nativa** no mercado brasileiro
- **Recomendações personalizadas** de alimentos
- **Busca inteligente** com filtros automáticos
- **Sugestões de refeições** completas

## 📱 Requisitos

- **iOS**: 15.0 ou superior
- **Dispositivos**: iPhone 8+ / iPad (6ª geração)+
- **Espaço**: 50MB livres
- **Internet**: Opcional (funciona offline)

## 🏗️ Arquitetura

### 📁 Estrutura do Projeto

```
EvolveYou-iOS/
├── EvolveYou/
│   ├── Models/           # Modelos de dados
│   ├── Views/            # Interfaces SwiftUI
│   ├── Services/         # Lógica de negócio
│   └── Assets.xcassets/  # Recursos visuais
├── EvolveYouTests/       # Testes unitários
└── EvolveYou.xcodeproj/  # Projeto Xcode
```

### 🔧 Tecnologias

- **SwiftUI**: Interface moderna e declarativa
- **Combine**: Programação reativa
- **Core Data**: Persistência local
- **URLSession**: Comunicação com APIs
- **XCTest**: Testes unitários e integração

## 🛠️ Configuração de Desenvolvimento

### Pré-requisitos

- macOS 13.0+ (Ventura)
- Xcode 15.0+
- iOS 15.0+ SDK
- Swift 5.9+

### Instalação

1. **Clone o repositório:**
```bash
git clone https://github.com/magnussolucoes/evolveyou-ios.git
cd evolveyou-ios
```

2. **Abra no Xcode:**
```bash
open EvolveYou.xcodeproj
```

3. **Configure o Team ID:**
   - Selecione o projeto no navigator
   - Vá para "Signing & Capabilities"
   - Selecione seu Team de desenvolvimento

4. **Execute o projeto:**
   - Selecione um simulador ou dispositivo
   - Pressione `Cmd + R`

## 🧪 Testes

### Executar Testes Unitários

```bash
# Via Xcode
Cmd + U

# Via linha de comando
xcodebuild test -scheme EvolveYou -destination 'platform=iOS Simulator,name=iPhone 15'
```

### Cobertura de Testes

O projeto inclui **40+ testes unitários** cobrindo:

- ✅ Cálculos metabólicos (IMC, TMB, TDEE)
- ✅ Validação de dados
- ✅ Persistência local
- ✅ Integração com APIs
- ✅ Casos extremos e edge cases

## 📦 Build e Deploy

### Build para Desenvolvimento

```bash
xcodebuild -scheme EvolveYou -configuration Debug
```

### Build para App Store

```bash
# Archive
xcodebuild -scheme EvolveYou -configuration Release archive

# Upload para TestFlight
xcrun altool --upload-app --file EvolveYou.ipa --username "developer@magnussolucoes.com"
```

## 🔒 Segurança e Privacidade

### Proteção de Dados

- **Criptografia AES-256** para dados sensíveis
- **HTTPS obrigatório** (TLS 1.3)
- **Certificate pinning** implementado
- **Keychain** para armazenamento seguro

### Conformidade LGPD

- ✅ Consentimento informado
- ✅ Finalidade específica
- ✅ Minimização de dados
- ✅ Transparência total
- ✅ Direitos do titular

## 📊 Performance

### Benchmarks

- **Cálculo de perfil**: < 10ms
- **Validação de resposta**: < 1ms
- **Carregamento de tela**: < 100ms
- **Uso de memória**: < 50MB

### Otimizações

- Lazy loading de componentes
- Cache inteligente de dados
- Compressão de imagens
- Debounce em validações

## 🎨 Design System

### Tipografia

- **Títulos**: SF Pro Display, Bold, 28pt
- **Subtítulos**: SF Pro Display, Semibold, 20pt
- **Corpo**: SF Pro Text, Regular, 16pt

### Cores

```swift
// Cores principais
Color.primary        // Azul do sistema
Color.secondary      // Cinza secundário
Color.accentColor    // Verde EvolveYou

// Cores semânticas
Color.green         // Sucesso
Color.red           // Erro
Color.orange        // Aviso
```

### Componentes

- **QuestionCard**: Card de pergunta com validação
- **ProgressSummary**: Resumo de progresso lateral
- **ResultsView**: Tela de resultados completa

## 🔌 APIs

### Endpoints Principais

```swift
// Anamnese
GET    /anamnese/questions
POST   /anamnese/answer
POST   /anamnese/calculate-profile

// Base TACO
GET    /taco/foods/recommendations
POST   /taco/foods/search
```

### Configuração

```swift
struct APIConfiguration {
    static let baseURL = "https://users-service-1062253516.us-central1.run.app"
    static let timeout: TimeInterval = 30.0
    static let retryAttempts = 3
}
```

## 📈 Analytics

### Eventos Rastreados

- Início da anamnese
- Pergunta respondida
- Anamnese concluída
- Perfil calculado
- Recomendação visualizada

### KPIs

- Taxa de conclusão: > 80%
- Tempo médio: 5-8 minutos
- Satisfação: > 4.5/5.0
- Crashes: < 0.1%

## 🚀 Roadmap

### Versão 1.0 (Atual)
- ✅ Anamnese Inteligente
- ✅ Cálculos metabólicos
- ✅ Base TACO integrada
- ✅ Interface iOS nativa

### Versão 1.1 (Próxima)
- 🔄 Autenticação Firebase
- 🔄 Sincronização em nuvem
- 🔄 Notificações push
- 🔄 Widgets iOS

### Versão 1.2 (Futuro)
- 🔮 Coach Virtual EVO (IA)
- 🔮 Análise de fotos
- 🔮 Apple Health integration
- 🔮 Planos automáticos

## 🤝 Contribuição

### Padrões de Código

- **Swift Style Guide**: [Raywenderlich](https://github.com/raywenderlich/swift-style-guide)
- **Commits**: [Conventional Commits](https://www.conventionalcommits.org/)
- **Branches**: `feature/`, `bugfix/`, `hotfix/`

### Pull Requests

1. Fork o projeto
2. Crie uma branch (`git checkout -b feature/nova-funcionalidade`)
3. Commit suas mudanças (`git commit -m 'feat: adiciona nova funcionalidade'`)
4. Push para a branch (`git push origin feature/nova-funcionalidade`)
5. Abra um Pull Request

## 📄 Licença

Este projeto é propriedade da **Magnus Soluções** e está protegido por direitos autorais. Uso não autorizado é proibido.

## 📞 Suporte

- **Email**: developer@magnussolucoes.com
- **Website**: https://magnussolucoes.com
- **Documentação**: https://docs.evolveyou.com.br

## 🏆 Reconhecimentos

- **Base TACO**: NEPA/UNICAMP
- **Fórmulas Metabólicas**: Mifflin-St Jeor et al.
- **Design System**: Apple Human Interface Guidelines

---

**Desenvolvido com ❤️ pela Magnus Soluções**

*O futuro da nutrição personalizada no Brasil* 🇧🇷

