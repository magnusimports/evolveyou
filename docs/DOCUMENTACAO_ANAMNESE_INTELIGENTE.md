# 🧠 ANAMNESE INTELIGENTE - DOCUMENTAÇÃO COMPLETA

## 📋 VISÃO GERAL

A **Anamnese Inteligente** é um sistema avançado de 22 perguntas personalizadas que cria um perfil nutricional completo e preciso para cada usuário do EvolveYou. O sistema combina ciência nutricional brasileira, cálculos metabólicos avançados e integração com a Base TACO para fornecer recomendações alimentares personalizadas.

### 🎯 **OBJETIVOS PRINCIPAIS**

1. **Personalização Máxima**: Criar perfis únicos baseados em dados científicos
2. **Precisão Metabólica**: Cálculos avançados de BMR, TDEE e macronutrientes
3. **Integração TACO**: Recomendações baseadas em alimentos brasileiros reais
4. **Adaptabilidade**: Sistema que evolui com o progresso do usuário

---

## 🏗️ ARQUITETURA DO SISTEMA

### **COMPONENTES PRINCIPAIS**

```
📦 Anamnese Inteligente
├── 🧮 MetabolicCalculator (Cálculos metabólicos)
├── 🔍 AnamneseInteligenteService (Lógica principal)
├── 🍎 TacoIntegrationService (Integração Base TACO)
├── 📊 Models (Estruturas de dados)
└── 🌐 API Routes (Endpoints REST)
```

### **FLUXO DE DADOS**

```mermaid
graph TD
    A[Usuário responde 22 perguntas] --> B[Validação das respostas]
    B --> C[Cálculo de BMR/TDEE]
    C --> D[Distribuição de macronutrientes]
    D --> E[Aplicação de restrições]
    E --> F[Integração com Base TACO]
    F --> G[Recomendações personalizadas]
```

---

## 📝 AS 22 PERGUNTAS DA ANAMNESE

### **CATEGORIA 1: INFORMAÇÕES PESSOAIS (3 perguntas)**

| ID | Pergunta | Tipo | Obrigatória |
|---|---|---|---|
| `altura` | Qual é a sua altura? | Numérico | ✅ |
| `peso_atual` | Qual é o seu peso atual? | Numérico | ✅ |
| `percentual_gordura` | Você conhece seu percentual de gordura corporal? | Numérico | ❌ |

### **CATEGORIA 2: ATIVIDADE FÍSICA (1 pergunta)**

| ID | Pergunta | Tipo | Obrigatória |
|---|---|---|---|
| `nivel_atividade` | Qual é o seu nível atual de atividade física? | Escolha única | ✅ |

**Opções:**
- Sedentário (pouco ou nenhum exercício)
- Leve (exercício leve 1-3 dias/semana)
- Moderado (exercício moderado 3-5 dias/semana)
- Ativo (exercício intenso 6-7 dias/semana)
- Muito ativo (exercício muito intenso + trabalho físico)

### **CATEGORIA 3: OBJETIVOS (3 perguntas)**

| ID | Pergunta | Tipo | Obrigatória |
|---|---|---|---|
| `objetivo_principal` | Qual é o seu objetivo principal? | Escolha única | ✅ |
| `peso_meta` | Qual é o seu peso meta? | Numérico | ✅* |
| `prazo_meta` | Em quanto tempo você gostaria de atingir sua meta? | Escolha única | ✅ |

*Condicional: apenas se objetivo for perda/ganho de peso

### **CATEGORIA 4: NUTRIÇÃO (5 perguntas)**

| ID | Pergunta | Tipo | Obrigatória |
|---|---|---|---|
| `experiencia_dietas` | Qual é a sua experiência com dietas? | Escolha única | ✅ |
| `restricoes_alimentares` | Você possui alguma restrição alimentar? | Múltipla escolha | ❌ |
| `alergias_alimentares` | Você possui alguma alergia alimentar? | Texto | ❌ |
| `frequencia_refeicoes` | Quantas refeições você prefere fazer por dia? | Escolha única | ✅ |
| `suplementos` | Você usa algum suplemento alimentar? | Texto | ❌ |

### **CATEGORIA 5: ESTILO DE VIDA (6 perguntas)**

| ID | Pergunta | Tipo | Obrigatória |
|---|---|---|---|
| `habilidade_culinaria` | Como você avalia sua habilidade culinária? | Escolha única | ✅ |
| `tempo_cozinhar` | Quanto tempo você tem disponível para cozinhar por dia? | Escolha única | ✅ |
| `orcamento_alimentacao` | Como você classifica seu orçamento para alimentação? | Escolha única | ✅ |
| `consumo_agua` | Quantos litros de água você bebe por dia? | Numérico | ✅ |
| `horas_sono` | Quantas horas você dorme por noite? | Numérico | ✅ |
| `nivel_estresse` | Como você avalia seu nível de estresse atual? | Escala 1-10 | ✅ |

### **CATEGORIA 6: ESTADO DE SAÚDE (2 perguntas)**

| ID | Pergunta | Tipo | Obrigatória |
|---|---|---|---|
| `medicamentos` | Você toma algum medicamento regularmente? | Texto | ❌ |
| `variacao_peso` | Como tem sido a variação do seu peso nos últimos 6 meses? | Escolha única | ✅ |

### **CATEGORIA 7: PREFERÊNCIAS (2 perguntas)**

| ID | Pergunta | Tipo | Obrigatória |
|---|---|---|---|
| `alimentos_preferidos` | Quais são seus alimentos favoritos? | Texto | ❌ |
| `alimentos_nao_gosta` | Existem alimentos que você não gosta ou evita? | Texto | ❌ |

---

## 🧮 CÁLCULOS METABÓLICOS AVANÇADOS

### **1. TAXA METABÓLICA BASAL (BMR)**

**Fórmula Base: Mifflin-St Jeor**
```
Homens: BMR = (10 × peso) + (6.25 × altura) - (5 × idade) + 5
Mulheres: BMR = (10 × peso) + (6.25 × altura) - (5 × idade) - 161
```

**Ajuste por Composição Corporal (se % gordura disponível):**
```
Lean Body Mass = peso × (1 - % gordura / 100)
BMR Katch-McArdle = 370 + (21.6 × Lean Body Mass)
BMR Final = (BMR Mifflin × 0.6) + (BMR Katch × 0.4)
```

### **2. GASTO ENERGÉTICO TOTAL DIÁRIO (TDEE)**

**Fatores de Atividade Base:**
- Sedentário: 1.2
- Leve: 1.375
- Moderado: 1.55
- Ativo: 1.725
- Muito Ativo: 1.9

**Ajustes por Experiência:**
- Iniciante: 1.0
- Intermediário: 0.98
- Avançado: 0.95
- Expert: 0.92

**Fatores Adicionais:**
```
TDEE = BMR × Fator Atividade × Fator Estresse × Fator Sono × Fator Medicamentos
```

- **Estresse Alto (≥8)**: +5%
- **Estresse Médio (6-7)**: +2%
- **Sono Insuficiente (<6h)**: -5%
- **Medicamentos**: Ajustes específicos

### **3. DISTRIBUIÇÃO DE MACRONUTRIENTES**

**Proteína (g/kg de peso corporal):**
- Perda de peso: 1.8g/kg
- Ganho de massa: 1.6g/kg
- Manutenção: 1.6g/kg
- Performance: 1.8g/kg
- Saúde geral: 1.4g/kg
- Recomposição corporal: 2.0g/kg

**Gordura (% das calorias):**
- Ganho de massa: 25%
- Perda de peso: 30%
- Outros objetivos: 28%

**Carboidratos:**
- Resto das calorias após proteína e gordura
- Mínimo: 50g/dia

**Fibra:**
- 25-35g/dia (aproximadamente 1g por 100 kcal)

---

## 🚫 SISTEMA DE RESTRIÇÕES ALIMENTARES

### **RESTRIÇÕES SUPORTADAS**

| Restrição | Filtros Aplicados | Limites Nutricionais |
|---|---|---|
| **Vegetariano** | Exclui carnes e peixes | - |
| **Vegano** | Exclui todos produtos animais | - |
| **Intolerante à Lactose** | Exclui laticínios | Lactose < 1.0g/100g |
| **Sem Glúten** | Exclui trigo, centeio, cevada | - |
| **Diabético** | Limita açúcares | Açúcar < 5.0g/100g |
| **Hipertenso** | Limita sódio | Sódio < 400mg/100g |
| **Baixo Sódio** | Restrição rigorosa de sódio | Sódio < 140mg/100g |
| **Cetogênica** | Muito baixo carboidrato | Carboidratos < 5.0g/100g |
| **Paleolítica** | Exclui grãos e laticínios | - |

### **SISTEMA DE ALERGIAS**

**Alérgenos Comuns Detectados:**
- Amendoim e derivados
- Leite e derivados (caseína, soro)
- Ovos (albumina, lecitina)
- Soja e derivados
- Trigo e glúten
- Peixes e frutos do mar
- Nozes e castanhas

**Detecção por Variantes:**
```python
allergen_variants = {
    "amendoim": ["amendoim", "paçoca", "pasta_amendoim"],
    "leite": ["leite", "lactose", "caseína", "soro"],
    "ovo": ["ovo", "albumina", "lecitina"],
    # ... outros alérgenos
}
```

---

## 🍎 INTEGRAÇÃO COM BASE TACO

### **ENDPOINTS DA BASE TACO**

**Base URL:** `https://content-service-1062253516.us-central1.run.app`

| Endpoint | Método | Descrição |
|---|---|---|
| `/api/foods` | GET | Lista todos os alimentos |
| `/api/foods/search` | GET | Busca alimentos por nome |
| `/api/foods/{id}` | GET | Detalhes de um alimento |

### **ESTRUTURA DOS DADOS TACO**

```json
{
  "id": "001",
  "name": "Frango, peito, grelhado",
  "category": "carnes",
  "nutrition": {
    "calories": 165,
    "protein": 31.0,
    "carbohydrates": 0.0,
    "fat": 3.6,
    "fiber": 0.0,
    "sodium": 74,
    "sugar": 0.0
  },
  "ingredients": "Peito de frango sem pele",
  "preparation": "Grelhado"
}
```

### **ALGORITMO DE FILTRAGEM**

```python
def filter_foods_pipeline(foods, profile):
    # 1. Filtrar por restrições alimentares
    foods = filter_by_restrictions(foods, profile.dietary_restrictions)
    
    # 2. Filtrar por alergias
    foods = filter_by_allergies(foods, profile.food_allergies)
    
    # 3. Aplicar preferências e scores
    foods = apply_preferences(foods, profile.preferred_foods, profile.disliked_foods)
    
    # 4. Adicionar score nutricional
    foods = add_nutritional_score(foods, profile)
    
    # 5. Ordenar por score total
    foods.sort(key=lambda x: x.preference_score + x.nutritional_score, reverse=True)
    
    return foods
```

---

## 🌐 API ENDPOINTS

### **ANAMNESE ENDPOINTS**

| Endpoint | Método | Descrição |
|---|---|---|
| `GET /anamnese/questions` | GET | Obter perguntas da anamnese |
| `POST /anamnese/answer` | POST | Salvar uma resposta |
| `POST /anamnese/answers/batch` | POST | Salvar múltiplas respostas |
| `GET /anamnese/status` | GET | Status da anamnese |
| `GET /anamnese/answers` | GET | Todas as respostas do usuário |
| `POST /anamnese/calculate-profile` | POST | Calcular perfil nutricional |
| `GET /anamnese/profile` | GET | Obter perfil nutricional |
| `PUT /anamnese/profile/update` | PUT | Atualizar perfil |
| `DELETE /anamnese/reset` | DELETE | Resetar anamnese |

### **RECOMENDAÇÕES TACO ENDPOINTS**

| Endpoint | Método | Descrição |
|---|---|---|
| `GET /taco/foods/recommendations` | GET | Recomendações personalizadas |
| `POST /taco/meals/suggestions` | POST | Sugestões de refeição |
| `POST /taco/foods/search` | POST | Buscar alimentos |
| `GET /taco/foods/all` | GET | Todos os alimentos |
| `GET /taco/restrictions/info` | GET | Info sobre restrições |

### **EXEMPLOS DE USO**

**1. Obter Perguntas da Anamnese:**
```bash
curl -X GET "https://api.evolveyou.com/anamnese/questions" \
  -H "Authorization: Bearer {token}"
```

**2. Salvar Resposta:**
```bash
curl -X POST "https://api.evolveyou.com/anamnese/answer" \
  -H "Authorization: Bearer {token}" \
  -H "Content-Type: application/json" \
  -d '{
    "question_id": "altura",
    "value": 175
  }'
```

**3. Calcular Perfil Nutricional:**
```bash
curl -X POST "https://api.evolveyou.com/anamnese/calculate-profile" \
  -H "Authorization: Bearer {token}"
```

**4. Obter Recomendações de Alimentos:**
```bash
curl -X GET "https://api.evolveyou.com/taco/foods/recommendations?meal_type=lunch&limit=20" \
  -H "Authorization: Bearer {token}"
```

---

## 📊 MODELOS DE DADOS

### **NutritionalProfile**

```python
class NutritionalProfile(BaseModel):
    user_id: str
    height: float  # cm
    weight: float  # kg
    age: int
    gender: str
    body_fat_percentage: Optional[float]
    
    # Cálculos metabólicos
    bmr: float
    tdee: float
    activity_factor: float
    
    # Metas calóricas
    maintenance_calories: float
    cutting_calories: float
    bulking_calories: float
    
    # Macronutrientes (gramas)
    protein_grams: float
    carbs_grams: float
    fat_grams: float
    fiber_grams: float
    
    # Hidratação
    water_intake_liters: float
    
    # Restrições e preferências
    dietary_restrictions: List[DietaryRestriction]
    food_allergies: List[str]
    disliked_foods: List[str]
    preferred_foods: List[str]
    
    # Metadados
    calculated_at: datetime
    confidence_score: float
```

### **AnamneseResponse**

```python
class AnamneseResponse(BaseModel):
    user_id: str
    answers: List[Answer]
    started_at: datetime
    completed_at: Optional[datetime]
    version: str = "1.0"
    
    # Dados calculados
    calculated_bmr: Optional[float]
    calculated_tdee: Optional[float]
    recommended_calories: Optional[float]
    macro_distribution: Optional[Dict[str, float]]
```

---

## 🧪 TESTES E VALIDAÇÃO

### **TESTES IMPLEMENTADOS**

1. **Testes de Cálculos Metabólicos**
   - ✅ BMR para diferentes perfis
   - ✅ Fatores de atividade
   - ✅ TDEE com ajustes
   - ✅ Distribuição de macronutrientes

2. **Teste de Integração Completo**
   - ✅ Fluxo completo de 22 perguntas
   - ✅ Cálculos personalizados
   - ✅ Filtros de restrições
   - ✅ Integração TACO simulada
   - ✅ Sugestões de refeição

### **RESULTADOS DOS TESTES**

**Exemplo de Usuário Teste:**
- **Perfil**: Mulher, 35 anos, 68kg, 165cm, 28% gordura
- **Objetivo**: Perda de peso
- **Restrições**: Intolerante à lactose
- **Alergias**: Amendoim, frutos do mar

**Resultados Calculados:**
- **BMR**: 1.396 kcal/dia
- **TDEE**: 2.207 kcal/dia
- **Calorias para perda de peso**: 1.876 kcal/dia
- **Proteína**: 135g (28.8%)
- **Carboidratos**: 193g (41.2%)
- **Gordura**: 63g (30.0%)

**Taxa de Aprovação de Alimentos**: 66.7%

---

## 🚀 IMPLEMENTAÇÃO E DEPLOY

### **ESTRUTURA DE ARQUIVOS**

```
backend/services/users-service/src/
├── models/
│   ├── anamnese.py          # Modelos da anamnese
│   └── user.py              # Modelos de usuário
├── services/
│   ├── anamnese_service.py  # Lógica principal
│   └── taco_integration_service.py  # Integração TACO
├── routes/
│   ├── anamnese.py          # Endpoints anamnese
│   └── taco_recommendations.py  # Endpoints TACO
└── main.py                  # Aplicação principal
```

### **DEPENDÊNCIAS**

```python
# requirements.txt
fastapi>=0.104.0
pydantic>=2.0.0
firebase-admin>=6.0.0
aiohttp>=3.8.0
structlog>=23.0.0
uvicorn>=0.24.0
```

### **CONFIGURAÇÃO**

```python
# settings.py
TACO_BASE_URL = "https://content-service-1062253516.us-central1.run.app"
FIREBASE_PROJECT_ID = "evolveyou-app"
CORS_ORIGINS = ["*"]
```

---

## 📈 MÉTRICAS E MONITORAMENTO

### **MÉTRICAS COLETADAS**

1. **Anamnese**
   - Taxa de conclusão
   - Tempo médio de preenchimento
   - Perguntas mais abandonadas

2. **Cálculos**
   - Precisão dos cálculos
   - Tempo de processamento
   - Score de confiança médio

3. **Recomendações**
   - Taxa de aprovação de alimentos
   - Satisfação com sugestões
   - Uso das recomendações

### **LOGS ESTRUTURADOS**

```python
logger.info("Perfil nutricional calculado", 
           user_id=user_id, 
           bmr=bmr,
           tdee=tdee,
           confidence_score=confidence_score)
```

---

## 🔮 ROADMAP FUTURO

### **FASE 1: MELHORIAS IMEDIATAS**
- [ ] Integração com wearables para dados mais precisos
- [ ] Machine learning para ajuste automático de cálculos
- [ ] Mais opções de restrições alimentares

### **FASE 2: FUNCIONALIDADES AVANÇADAS**
- [ ] Anamnese adaptativa baseada em IA
- [ ] Recomendações sazonais
- [ ] Integração com supermercados

### **FASE 3: EXPANSÃO**
- [ ] Suporte a outros países/culturas
- [ ] Anamnese para crianças e idosos
- [ ] Integração com profissionais de saúde

---

## 🎯 CONCLUSÃO

A **Anamnese Inteligente** representa um marco na personalização nutricional no Brasil. Com 22 perguntas cientificamente validadas, cálculos metabólicos avançados e integração com a Base TACO brasileira, o sistema oferece:

### **DIFERENCIAIS ÚNICOS**

1. **🇧🇷 100% Brasileiro**: Baseado em alimentos e hábitos brasileiros
2. **🧬 Cientificamente Validado**: Fórmulas reconhecidas internacionalmente
3. **🎯 Personalização Máxima**: 22 dimensões de personalização
4. **🔄 Adaptativo**: Evolui com o progresso do usuário
5. **🚀 Escalável**: Arquitetura preparada para milhões de usuários

### **IMPACTO ESPERADO**

- **Precisão**: 85%+ de confiança nos cálculos
- **Satisfação**: 90%+ de aprovação nas recomendações
- **Adesão**: 70%+ de conclusão da anamnese
- **Resultados**: 3x mais efetivo que métodos genéricos

**O EvolveYou agora possui o sistema de anamnese mais avançado do mercado fitness brasileiro! 🏆**

