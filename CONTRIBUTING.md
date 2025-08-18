# 🤝 Guia de Contribuição - EvolveYou

Obrigado por considerar contribuir com o EvolveYou! Este documento fornece diretrizes para contribuições efetivas.

## 📋 Índice

- [Código de Conduta](#código-de-conduta)
- [Como Contribuir](#como-contribuir)
- [Configuração do Ambiente](#configuração-do-ambiente)
- [Processo de Desenvolvimento](#processo-de-desenvolvimento)
- [Padrões de Código](#padrões-de-código)
- [Testes](#testes)
- [Documentação](#documentação)
- [Pull Requests](#pull-requests)

## 📜 Código de Conduta

Este projeto adere ao [Código de Conduta do Contributor Covenant](CODE_OF_CONDUCT.md). Ao participar, você concorda em manter este código.

## 🚀 Como Contribuir

### Tipos de Contribuição

Aceitamos vários tipos de contribuições:

- 🐛 **Bug Reports**: Relate problemas encontrados
- ✨ **Feature Requests**: Sugira novas funcionalidades
- 📝 **Documentação**: Melhore ou adicione documentação
- 🔧 **Code**: Implemente correções ou novas features
- 🧪 **Testes**: Adicione ou melhore testes
- 🎨 **Design**: Melhore UI/UX

### Antes de Começar

1. **Verifique Issues Existentes**: Procure por issues relacionadas
2. **Discuta Grandes Mudanças**: Abra uma issue para discutir antes de implementar
3. **Leia a Documentação**: Familiarize-se com a arquitetura do projeto

## ⚙️ Configuração do Ambiente

### 1. Fork e Clone

```bash
# Fork o repositório no GitHub
# Clone seu fork
git clone https://github.com/SEU-USERNAME/evolveyou.git
cd evolveyou

# Adicione o repositório original como upstream
git remote add upstream https://github.com/evolveyou/evolveyou.git
```

### 2. Instalação Automática

```bash
# Execute o script de instalação
./scripts/setup/install.sh
```

### 3. Configuração Manual

Se preferir configurar manualmente, siga o [Guia de Instalação](docs/INSTALLATION.md).

### 4. Verificação

```bash
# Execute os testes para verificar se tudo está funcionando
npm test
```

## 🔄 Processo de Desenvolvimento

### 1. Sincronização

Sempre sincronize com o repositório upstream antes de começar:

```bash
git fetch upstream
git checkout main
git merge upstream/main
```

### 2. Criação de Branch

Use nomes descritivos para branches:

```bash
# Para features
git checkout -b feature/nome-da-feature

# Para correções
git checkout -b fix/descricao-do-bug

# Para documentação
git checkout -b docs/topico-documentacao
```

### 3. Desenvolvimento

- Faça commits pequenos e frequentes
- Use mensagens de commit descritivas
- Teste suas mudanças regularmente

### 4. Testes

Execute testes antes de fazer push:

```bash
# Todos os testes
npm test

# Testes específicos
npm run test:backend
npm run test:frontend

# Linting
npm run lint
```

## 📝 Padrões de Código

### Convenções de Commit

Usamos [Conventional Commits](https://conventionalcommits.org/):

```
type(scope): description

feat(auth): add Google OAuth integration
fix(api): resolve timeout issue in user service
docs(readme): update installation instructions
style(ui): improve button hover states
refactor(coach): optimize AI response generation
test(anamnese): add unit tests for calculations
chore(deps): update dependencies
```

### Tipos de Commit

- `feat`: Nova funcionalidade
- `fix`: Correção de bug
- `docs`: Documentação
- `style`: Formatação, sem mudança de lógica
- `refactor`: Refatoração de código
- `test`: Adição ou correção de testes
- `chore`: Tarefas de manutenção

### Padrões de Código

#### JavaScript/TypeScript

```javascript
// Use ESLint + Prettier
// Configuração em .eslintrc.js e .prettierrc

// Nomes descritivos
const calculateUserBMR = (weight, height, age, gender) => {
  // Implementação
};

// Comentários JSDoc para funções públicas
/**
 * Calcula a Taxa Metabólica Basal do usuário
 * @param {number} weight - Peso em kg
 * @param {number} height - Altura em cm
 * @param {number} age - Idade em anos
 * @param {string} gender - 'male' ou 'female'
 * @returns {number} BMR em calorias
 */
```

#### Python

```python
# Use Black + Flake8
# Configuração em pyproject.toml e .flake8

# Type hints
def calculate_bmr(weight: float, height: float, age: int, gender: str) -> float:
    """
    Calcula a Taxa Metabólica Basal do usuário.
    
    Args:
        weight: Peso em kg
        height: Altura em cm
        age: Idade em anos
        gender: 'male' ou 'female'
        
    Returns:
        BMR em calorias
    """
    # Implementação
```

#### React Components

```jsx
// Use TypeScript para componentes
interface UserProfileProps {
  user: User;
  onUpdate: (user: User) => void;
}

export const UserProfile: React.FC<UserProfileProps> = ({ user, onUpdate }) => {
  // Implementação
};

// Hooks customizados
export const useUserProfile = (userId: string) => {
  // Implementação
};
```

### Estrutura de Arquivos

```
src/
├── components/          # Componentes reutilizáveis
│   ├── ui/             # Componentes básicos de UI
│   └── features/       # Componentes específicos de features
├── pages/              # Páginas/rotas
├── hooks/              # Hooks customizados
├── services/           # Serviços e APIs
├── utils/              # Utilitários
├── types/              # Definições de tipos
└── constants/          # Constantes
```

## 🧪 Testes

### Tipos de Testes

#### 1. Testes Unitários

```javascript
// Jest + Testing Library para frontend
import { render, screen } from '@testing-library/react';
import { UserProfile } from './UserProfile';

test('renders user name', () => {
  const user = { name: 'João Silva', email: 'joao@email.com' };
  render(<UserProfile user={user} />);
  expect(screen.getByText('João Silva')).toBeInTheDocument();
});
```

```python
# Pytest para backend
import pytest
from src.services.anamnese_service import calculate_bmr

def test_calculate_bmr_male():
    bmr = calculate_bmr(weight=80, height=175, age=30, gender='male')
    assert bmr == pytest.approx(1801.25, rel=1e-2)
```

#### 2. Testes de Integração

```python
# Teste de API completa
def test_anamnese_submission(client, auth_headers):
    response = client.post('/anamnese/submit', 
                          json=anamnese_data, 
                          headers=auth_headers)
    assert response.status_code == 201
    assert 'anamnese_id' in response.json()
```

#### 3. Testes E2E

```javascript
// Playwright para testes end-to-end
test('complete anamnese flow', async ({ page }) => {
  await page.goto('/anamnese');
  await page.fill('[data-testid="age-input"]', '30');
  await page.click('[data-testid="submit-button"]');
  await expect(page.locator('[data-testid="results"]')).toBeVisible();
});
```

### Cobertura de Testes

Mantemos cobertura mínima de:
- **Backend**: 80%
- **Frontend**: 70%
- **Funções críticas**: 95%

```bash
# Verificar cobertura
npm run test:coverage
```

## 📚 Documentação

### Tipos de Documentação

1. **README**: Visão geral e quick start
2. **API Docs**: Documentação das APIs
3. **Code Comments**: Comentários no código
4. **Architecture Docs**: Documentação da arquitetura

### Padrões de Documentação

#### Markdown

```markdown
# Use títulos hierárquicos
## Seções principais
### Subseções

- Use listas para itens
- **Negrito** para ênfase
- `código` para comandos
- [Links](url) para referências

```bash
# Blocos de código com linguagem
comando --exemplo
```

#### JSDoc

```javascript
/**
 * Descrição da função
 * @param {type} param - Descrição do parâmetro
 * @returns {type} Descrição do retorno
 * @example
 * // Exemplo de uso
 * const result = myFunction(param);
 */
```

#### Python Docstrings

```python
def my_function(param: str) -> str:
    """
    Descrição da função.
    
    Args:
        param: Descrição do parâmetro
        
    Returns:
        Descrição do retorno
        
    Example:
        >>> my_function("test")
        "result"
    """
```

## 🔄 Pull Requests

### Antes de Submeter

1. **Sincronize** com upstream
2. **Execute testes** localmente
3. **Verifique linting**
4. **Atualize documentação** se necessário

### Template de PR

```markdown
## Descrição
Breve descrição das mudanças

## Tipo de Mudança
- [ ] Bug fix
- [ ] Nova feature
- [ ] Breaking change
- [ ] Documentação

## Como Testar
1. Passos para testar
2. Casos de teste específicos

## Checklist
- [ ] Testes passando
- [ ] Linting OK
- [ ] Documentação atualizada
- [ ] Changelog atualizado (se necessário)

## Screenshots (se aplicável)
```

### Processo de Review

1. **Automated Checks**: CI/CD deve passar
2. **Code Review**: Pelo menos 1 aprovação
3. **Testing**: Testes manuais se necessário
4. **Merge**: Squash and merge preferido

### Critérios de Aprovação

- ✅ Código segue padrões estabelecidos
- ✅ Testes adequados incluídos
- ✅ Documentação atualizada
- ✅ Sem breaking changes não documentadas
- ✅ Performance não degradada

## 🐛 Reportando Bugs

### Template de Bug Report

```markdown
**Descrição do Bug**
Descrição clara e concisa do bug

**Passos para Reproduzir**
1. Vá para '...'
2. Clique em '....'
3. Role para baixo até '....'
4. Veja o erro

**Comportamento Esperado**
O que deveria acontecer

**Screenshots**
Se aplicável, adicione screenshots

**Ambiente:**
- OS: [e.g. iOS]
- Browser [e.g. chrome, safari]
- Versão [e.g. 22]

**Contexto Adicional**
Qualquer outro contexto sobre o problema
```

## ✨ Sugerindo Features

### Template de Feature Request

```markdown
**A feature está relacionada a um problema?**
Descrição clara do problema

**Descreva a solução desejada**
Descrição clara e concisa da solução

**Descreva alternativas consideradas**
Outras soluções ou features consideradas

**Contexto Adicional**
Screenshots, mockups, ou contexto adicional
```

## 🏷️ Versionamento

Seguimos [Semantic Versioning](https://semver.org/):

- **MAJOR**: Mudanças incompatíveis na API
- **MINOR**: Funcionalidades adicionadas de forma compatível
- **PATCH**: Correções de bugs compatíveis

## 📞 Suporte

### Canais de Comunicação

- **GitHub Issues**: Para bugs e feature requests
- **GitHub Discussions**: Para perguntas e discussões
- **Email**: dev@evolveyou.com.br (para questões sensíveis)

### Tempo de Resposta

- **Issues críticas**: 24 horas
- **Issues normais**: 72 horas
- **Feature requests**: 1 semana

## 🎉 Reconhecimento

Contribuidores são reconhecidos:

- **README**: Lista de contribuidores
- **Changelog**: Créditos por versão
- **GitHub**: Contributor insights

## 📄 Licença

Ao contribuir, você concorda que suas contribuições serão licenciadas sob a mesma licença do projeto (MIT).

---

**Obrigado por contribuir com o EvolveYou! 🚀**

