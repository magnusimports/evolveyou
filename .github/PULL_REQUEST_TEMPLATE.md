# Pull Request

## 📋 Descrição

### Resumo das Mudanças
Breve descrição das mudanças implementadas neste PR.

### Tipo de Mudança
- [ ] 🐛 Bug fix (mudança que corrige um problema)
- [ ] ✨ Nova funcionalidade (mudança que adiciona funcionalidade)
- [ ] 💥 Breaking change (mudança que quebra compatibilidade)
- [ ] 📚 Documentação (mudanças apenas na documentação)
- [ ] 🎨 Estilo (formatação, ponto e vírgula, etc; sem mudança de código)
- [ ] ♻️ Refatoração (mudança de código que não corrige bug nem adiciona funcionalidade)
- [ ] ⚡ Performance (mudança que melhora performance)
- [ ] 🧪 Testes (adição ou correção de testes)
- [ ] 🔧 Chore (mudanças no processo de build, ferramentas auxiliares, etc)

## 🔗 Issues Relacionadas

Fixes #(issue)
Closes #(issue)
Relates to #(issue)

## 🧪 Como Testar

### Pré-requisitos
- [ ] Node.js 18+
- [ ] Python 3.11+
- [ ] Firebase configurado
- [ ] Outro: ___________

### Passos para Testar
1. Clone o branch: `git checkout feature/branch-name`
2. Instale dependências: `npm install` / `pip install -r requirements.txt`
3. Execute: `npm start` / `python -m uvicorn src.main:app --reload`
4. Navegue para: `http://localhost:3000`
5. Teste os seguintes cenários:
   - [ ] Cenário 1: [descrição]
   - [ ] Cenário 2: [descrição]
   - [ ] Cenário 3: [descrição]

### Casos de Teste Específicos
```bash
# Comandos específicos para testar
npm test
python -m pytest tests/test_specific.py
```

## 📸 Screenshots/Vídeos

### Antes
![Antes](url-da-imagem)

### Depois
![Depois](url-da-imagem)

### Demo (se aplicável)
[Link para vídeo ou GIF demonstrativo]

## 🔧 Detalhes Técnicos

### Módulos Afetados
- [ ] Frontend Web (`frontend/web-app/`)
- [ ] Frontend Auth (`frontend/auth-integration/`)
- [ ] Frontend Anamnese (`frontend/anamnese-app/`)
- [ ] Backend Users (`backend/services/users-service/`)
- [ ] Backend Coach EVO (`backend/services/coach-evo-service/`)
- [ ] Mobile iOS (`mobile/ios/`)
- [ ] Documentação (`docs/`)
- [ ] CI/CD (`.github/workflows/`)
- [ ] Infraestrutura
- [ ] Outro: ___________

### Arquivos Principais Modificados
- `path/to/file1.js` - [descrição da mudança]
- `path/to/file2.py` - [descrição da mudança]
- `path/to/file3.md` - [descrição da mudança]

### Dependências Adicionadas/Removidas
```json
// Novas dependências
{
  "package-name": "^1.0.0"
}
```

```txt
# Python requirements
new-package==1.0.0
```

## 📊 Impacto

### Performance
- [ ] Melhoria de performance
- [ ] Sem impacto na performance
- [ ] Possível impacto negativo (explicar abaixo)

### Segurança
- [ ] Melhoria de segurança
- [ ] Sem impacto na segurança
- [ ] Possível impacto na segurança (explicar abaixo)

### Compatibilidade
- [ ] Totalmente compatível
- [ ] Requer migração de dados
- [ ] Breaking change (documentar abaixo)

### Explicações (se necessário)
[Explicar impactos negativos ou breaking changes]

## ✅ Checklist

### Desenvolvimento
- [ ] Código segue os padrões do projeto
- [ ] Realizei self-review do meu código
- [ ] Comentei código em áreas complexas
- [ ] Fiz mudanças correspondentes na documentação
- [ ] Minhas mudanças não geram novos warnings
- [ ] Adicionei testes que provam que minha correção é efetiva ou que minha funcionalidade funciona
- [ ] Testes unitários novos e existentes passam localmente
- [ ] Qualquer mudança dependente foi mergeada e publicada

### Testes
- [ ] Testes unitários passando
- [ ] Testes de integração passando
- [ ] Testes E2E passando (se aplicável)
- [ ] Testado em diferentes browsers (se frontend)
- [ ] Testado em mobile (se aplicável)
- [ ] Testado com dados reais
- [ ] Testado cenários de erro

### Documentação
- [ ] README atualizado (se necessário)
- [ ] Documentação da API atualizada (se necessário)
- [ ] Changelog atualizado
- [ ] Comentários de código adicionados onde necessário

### Segurança
- [ ] Não expõe informações sensíveis
- [ ] Validação de entrada implementada
- [ ] Autorização verificada
- [ ] Logs não contêm dados sensíveis

## 🚀 Deploy

### Ambiente de Deploy
- [ ] Pode ser deployado diretamente
- [ ] Requer configuração adicional
- [ ] Requer migração de dados
- [ ] Requer coordenação com outros times

### Configurações Necessárias
```bash
# Variáveis de ambiente necessárias
NOVA_VARIAVEL=valor
```

### Rollback Plan
Em caso de problemas:
1. [Passo 1 para rollback]
2. [Passo 2 para rollback]

## 📝 Notas Adicionais

### Para Reviewers
- Foque especialmente em: [área específica]
- Teste principalmente: [funcionalidade específica]
- Verifique: [aspecto específico]

### Limitações Conhecidas
- [Limitação 1]
- [Limitação 2]

### Próximos Passos
- [ ] [Tarefa futura relacionada]
- [ ] [Melhoria planejada]

### Links Úteis
- [Documentação relevante](link)
- [Issue original](link)
- [Design/Mockup](link)

---

## 👥 Reviewers

@username1 - [razão para review]
@username2 - [razão para review]

## 🏷️ Labels

Adicione as labels apropriadas:
- `frontend` / `backend` / `mobile` / `docs`
- `bug` / `feature` / `enhancement`
- `breaking-change` / `needs-migration`
- `ready-for-review` / `work-in-progress`

