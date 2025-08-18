# 🌐 CONFIGURAÇÃO DNS SQUARESPACE - MAGNUS SOLUÇÕES

## 🎯 **OBJETIVO**

Configurar subdomínio personalizado para o Dashboard Beta do EvolveYou no domínio `magnussolucoes.com` hospedado no Squarespace.

---

## 🚀 **OPÇÕES DE CONFIGURAÇÃO**

### **OPÇÃO 1: SUBDOMÍNIO DEDICADO** ⭐ (Recomendada)
- **URL Final**: `beta.magnussolucoes.com`
- **Tipo**: CNAME Record
- **Vantagem**: Separação clara, profissional, fácil de lembrar

### **OPÇÃO 2: SUBDOMÍNIO ESPECÍFICO**
- **URL Final**: `evolveyou.magnussolucoes.com`
- **Tipo**: CNAME Record  
- **Vantagem**: Marca específica, identificação clara

### **OPÇÃO 3: SUBDOMÍNIO DASHBOARD**
- **URL Final**: `dashboard.magnussolucoes.com`
- **Tipo**: CNAME Record
- **Vantagem**: Genérico, pode ser usado para outros projetos

---

## 🔧 **CONFIGURAÇÃO PASSO A PASSO**

### **PASSO 1: ACESSAR CONFIGURAÇÕES DNS**

1. **Acesse**: https://account.squarespace.com/domains/managed/magnussolucoes.com/dns/dns-settings
2. **Faça login** na sua conta Squarespace
3. **Navegue** até a seção "DNS Settings"
4. **Localize** a área "Custom Records"

### **PASSO 2: ADICIONAR CNAME RECORD**

#### **Para beta.magnussolucoes.com:**

```
Tipo: CNAME
Host: beta
Valor: 5000-iw3ui6sb0y2am1j13bzhb-cb94686d.manusvm.computer
TTL: 3600 (1 hora)
```

#### **Para evolveyou.magnussolucoes.com:**

```
Tipo: CNAME
Host: evolveyou
Valor: 5000-iw3ui6sb0y2am1j13bzhb-cb94686d.manusvm.computer
TTL: 3600 (1 hora)
```

#### **Para dashboard.magnussolucoes.com:**

```
Tipo: CNAME
Host: dashboard
Valor: 5000-iw3ui6sb0y2am1j13bzhb-cb94686d.manusvm.computer
TTL: 3600 (1 hora)
```

### **PASSO 3: SALVAR CONFIGURAÇÕES**

1. **Clique** em "Add Record" ou "Save"
2. **Aguarde** a propagação DNS (5-30 minutos)
3. **Teste** o acesso ao subdomínio

---

## 📋 **INSTRUÇÕES DETALHADAS SQUARESPACE**

### **INTERFACE SQUARESPACE**

1. **Login**: Entre na sua conta Squarespace
2. **Domains**: Vá para "Settings" → "Domains"
3. **Manage**: Clique em "Manage" ao lado de magnussolucoes.com
4. **DNS Settings**: Clique na aba "DNS Settings"
5. **Custom Records**: Role até a seção "Custom Records"

### **ADICIONANDO O RECORD**

1. **Clique** em "Add Record"
2. **Selecione** "CNAME" no dropdown de tipo
3. **Host**: Digite o subdomínio desejado (ex: `beta`)
4. **Value**: Cole o valor: `5000-iw3ui6sb0y2am1j13bzhb-cb94686d.manusvm.computer`
5. **TTL**: Deixe padrão ou configure para 3600
6. **Save**: Clique em "Save" ou "Add Record"

### **VERIFICAÇÃO**

Após salvar, você verá o record na lista:
```
Type: CNAME
Host: beta.magnussolucoes.com
Value: 5000-iw3ui6sb0y2am1j13bzhb-cb94686d.manusvm.computer
TTL: 3600
```

---

## ⏱️ **TEMPO DE PROPAGAÇÃO**

### **PROPAGAÇÃO DNS**
- **Mínimo**: 5-15 minutos
- **Típico**: 30 minutos - 2 horas
- **Máximo**: 24-48 horas (raro)

### **COMO VERIFICAR**
```bash
# Via terminal/cmd
nslookup beta.magnussolucoes.com

# Via online
https://dnschecker.org/
```

---

## 🔍 **VERIFICAÇÃO E TESTES**

### **TESTE 1: DNS LOOKUP**
```bash
nslookup beta.magnussolucoes.com
# Deve retornar: 5000-iw3ui6sb0y2am1j13bzhb-cb94686d.manusvm.computer
```

### **TESTE 2: PING**
```bash
ping beta.magnussolucoes.com
# Deve responder com IP válido
```

### **TESTE 3: BROWSER**
- Acesse: `https://beta.magnussolucoes.com`
- Deve carregar a landing page do EvolveYou
- Dashboard em: `https://beta.magnussolucoes.com/dashboard`

---

## 🛠️ **CONFIGURAÇÕES AVANÇADAS**

### **SSL/HTTPS**
O Squarespace automaticamente configura SSL para subdomínios CNAME. Se houver problemas:

1. **Aguarde** 24h para provisioning automático
2. **Contate** suporte Squarespace se necessário
3. **Alternativa**: Use Cloudflare como proxy

### **REDIRECIONAMENTO**
Para redirecionar `magnussolucoes.com/beta` para `beta.magnussolucoes.com`:

1. **Acesse** o editor do site principal
2. **Adicione** página "/beta"
3. **Configure** redirect 301 para subdomínio

### **MÚLTIPLOS SUBDOMÍNIOS**
Você pode configurar vários subdomínios simultaneamente:

```
beta.magnussolucoes.com → Dashboard Beta
evolveyou.magnussolucoes.com → Projeto EvolveYou
dashboard.magnussolucoes.com → Analytics Geral
```

---

## 🚨 **TROUBLESHOOTING**

### **PROBLEMA: DNS NÃO RESOLVE**
**Soluções:**
1. Verificar se o record foi salvo corretamente
2. Aguardar mais tempo para propagação
3. Limpar cache DNS local: `ipconfig /flushdns` (Windows)
4. Testar com DNS público: 8.8.8.8 ou 1.1.1.1

### **PROBLEMA: ERRO SSL**
**Soluções:**
1. Aguardar 24h para provisioning automático
2. Verificar se CNAME está correto
3. Contatar suporte Squarespace
4. Usar HTTP temporariamente

### **PROBLEMA: PÁGINA NÃO CARREGA**
**Soluções:**
1. Verificar se o servidor está online
2. Testar URL original: `5000-iw3ui6sb0y2am1j13bzhb-cb94686d.manusvm.computer`
3. Verificar configuração CNAME
4. Aguardar propagação completa

---

## 📞 **SUPORTE**

### **SQUARESPACE SUPPORT**
- **Chat**: Disponível 24/7 no painel
- **Email**: Via formulário de contato
- **Documentação**: https://support.squarespace.com/

### **VERIFICAÇÃO DNS**
- **DNS Checker**: https://dnschecker.org/
- **What's My DNS**: https://whatsmydns.net/
- **DNS Lookup**: https://mxtoolbox.com/

---

## ✅ **CHECKLIST DE CONFIGURAÇÃO**

### **PRÉ-CONFIGURAÇÃO**
- [ ] Acesso ao painel Squarespace
- [ ] Domínio magnussolucoes.com ativo
- [ ] Permissões de administrador

### **CONFIGURAÇÃO**
- [ ] CNAME record adicionado
- [ ] Valor correto configurado
- [ ] TTL definido (3600)
- [ ] Configurações salvas

### **VERIFICAÇÃO**
- [ ] DNS lookup funcionando
- [ ] Ping respondendo
- [ ] Site carregando via subdomínio
- [ ] SSL funcionando (HTTPS)

### **PÓS-CONFIGURAÇÃO**
- [ ] Teste completo da aplicação
- [ ] Verificação de performance
- [ ] Monitoramento de uptime
- [ ] Documentação atualizada

---

## 🎯 **RESULTADO FINAL**

Após a configuração completa, você terá:

### **URLs FUNCIONAIS**
- **Landing Page**: `https://beta.magnussolucoes.com`
- **Dashboard Beta**: `https://beta.magnussolucoes.com/dashboard`
- **APIs**: `https://beta.magnussolucoes.com/api/*`

### **FUNCIONALIDADES**
- ✅ **SSL automático** via Squarespace
- ✅ **Performance otimizada** com CDN
- ✅ **Monitoramento** em tempo real
- ✅ **Backup automático** das configurações

### **BENEFÍCIOS**
- 🎯 **URL profissional** e memorável
- 🚀 **Performance superior** com CDN
- 🔒 **Segurança** com SSL automático
- 📊 **Analytics** integrados
- 🌐 **Alcance global** otimizado

---

## 🏆 **CONCLUSÃO**

Com esta configuração, o Dashboard Beta do EvolveYou estará disponível em um domínio profissional da Magnus Soluções, proporcionando:

1. **Credibilidade** com domínio próprio
2. **Performance** otimizada
3. **Segurança** enterprise
4. **Facilidade** de acesso e compartilhamento
5. **Profissionalismo** na apresentação

**O EvolveYou agora terá uma presença digital de classe mundial! 🇧🇷🚀**

