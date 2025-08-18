# 🔌 Documentação das APIs - EvolveYou

## 📋 Visão Geral

O EvolveYou possui uma arquitetura de microserviços com APIs RESTful bem definidas. Todas as APIs seguem padrões REST e retornam dados em formato JSON.

### Base URLs
- **Users Service**: `http://localhost:8001` (dev) | `https://api.evolveyou.com.br` (prod)
- **Coach EVO Service**: `http://localhost:8004` (dev) | `https://coach.evolveyou.com.br` (prod)

### Autenticação
Todas as APIs protegidas requerem token Firebase JWT no header:
```
Authorization: Bearer <firebase-jwt-token>
```

## 🔐 Users Service API

### Authentication

#### POST /auth/register
Registra novo usuário.

**Request:**
```json
{
  "email": "usuario@email.com",
  "password": "senha123",
  "name": "Nome do Usuário"
}
```

**Response:**
```json
{
  "success": true,
  "user": {
    "uid": "firebase-uid",
    "email": "usuario@email.com",
    "name": "Nome do Usuário",
    "created_at": "2025-01-18T10:00:00Z"
  },
  "token": "firebase-jwt-token"
}
```

#### POST /auth/login
Autentica usuário existente.

**Request:**
```json
{
  "email": "usuario@email.com",
  "password": "senha123"
}
```

**Response:**
```json
{
  "success": true,
  "user": {
    "uid": "firebase-uid",
    "email": "usuario@email.com",
    "name": "Nome do Usuário"
  },
  "token": "firebase-jwt-token"
}
```

### User Profile

#### GET /users/profile
Obtém perfil do usuário autenticado.

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
{
  "uid": "firebase-uid",
  "email": "usuario@email.com",
  "name": "Nome do Usuário",
  "profile": {
    "age": 30,
    "gender": "male",
    "height": 175,
    "weight": 80,
    "activity_level": "moderate",
    "goals": ["weight_loss"],
    "dietary_restrictions": ["vegetarian"]
  },
  "anamnese_completed": true,
  "created_at": "2025-01-18T10:00:00Z",
  "updated_at": "2025-01-18T12:00:00Z"
}
```

#### PUT /users/profile
Atualiza perfil do usuário.

**Headers:**
```
Authorization: Bearer <token>
```

**Request:**
```json
{
  "name": "Novo Nome",
  "profile": {
    "weight": 78,
    "activity_level": "very_active"
  }
}
```

**Response:**
```json
{
  "success": true,
  "message": "Perfil atualizado com sucesso",
  "user": {
    // dados atualizados do usuário
  }
}
```

### Anamnese

#### POST /anamnese/submit
Submete respostas da anamnese.

**Headers:**
```
Authorization: Bearer <token>
```

**Request:**
```json
{
  "answers": {
    "personal_info": {
      "age": 30,
      "gender": "male",
      "height": 175,
      "weight": 80
    },
    "activity_level": "moderate",
    "primary_goal": "weight_loss",
    "dietary_restrictions": ["vegetarian"],
    // ... outras respostas
  },
  "calculated_results": {
    "bmr": 1800,
    "tdee": 2200,
    "target_calories": 1700,
    "bmi": 26.1,
    "macros": {
      "protein": {"grams": 127, "calories": 510},
      "carbs": {"grams": 149, "calories": 595},
      "fat": {"grams": 66, "calories": 595}
    }
  }
}
```

**Response:**
```json
{
  "success": true,
  "message": "Anamnese salva com sucesso",
  "anamnese_id": "anamnese-uuid",
  "recommendations": {
    "daily_calories": 1700,
    "daily_protein": 127,
    "daily_carbs": 149,
    "daily_fat": 66,
    "water_intake": 2800
  }
}
```

#### GET /anamnese/results
Obtém resultados da anamnese do usuário.

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
{
  "anamnese_id": "anamnese-uuid",
  "completed_at": "2025-01-18T10:00:00Z",
  "answers": {
    // respostas da anamnese
  },
  "calculated_results": {
    // resultados calculados
  },
  "recommendations": {
    // recomendações personalizadas
  }
}
```

### TACO Integration

#### GET /taco/foods
Lista alimentos da Base TACO.

**Query Parameters:**
- `search` (string): Termo de busca
- `category` (string): Categoria do alimento
- `limit` (int): Limite de resultados (padrão: 20)
- `offset` (int): Offset para paginação

**Response:**
```json
{
  "foods": [
    {
      "id": "001",
      "name": "Arroz, integral, cozido",
      "category": "Cereais e derivados",
      "nutrition": {
        "calories": 124,
        "protein": 2.6,
        "carbs": 25.8,
        "fat": 1.0,
        "fiber": 2.7,
        "sodium": 1
      },
      "portion_size": 100
    }
  ],
  "total": 150,
  "page": 1,
  "pages": 8
}
```

#### GET /taco/foods/{food_id}
Obtém detalhes de um alimento específico.

**Response:**
```json
{
  "id": "001",
  "name": "Arroz, integral, cozido",
  "category": "Cereais e derivados",
  "nutrition": {
    "calories": 124,
    "protein": 2.6,
    "carbs": 25.8,
    "fat": 1.0,
    "fiber": 2.7,
    "sodium": 1,
    "calcium": 5,
    "iron": 0.3,
    "vitamin_c": 0
  },
  "portion_size": 100,
  "common_portions": [
    {"name": "1 xícara", "grams": 150},
    {"name": "1 colher de sopa", "grams": 20}
  ]
}
```

#### POST /taco/recommendations
Obtém recomendações de alimentos baseadas no perfil.

**Headers:**
```
Authorization: Bearer <token>
```

**Request:**
```json
{
  "meal_type": "breakfast",
  "target_calories": 400,
  "preferences": ["vegetarian"],
  "restrictions": ["gluten_free"]
}
```

**Response:**
```json
{
  "recommendations": [
    {
      "food": {
        "id": "001",
        "name": "Arroz, integral, cozido",
        "nutrition": {
          "calories": 124,
          "protein": 2.6,
          "carbs": 25.8,
          "fat": 1.0
        }
      },
      "suggested_portion": 120,
      "reason": "Rico em carboidratos complexos, ideal para café da manhã"
    }
  ],
  "total_nutrition": {
    "calories": 398,
    "protein": 15.2,
    "carbs": 45.8,
    "fat": 12.5
  }
}
```

## 🤖 Coach EVO Service API

### Chat Interface

#### POST /api/v1/chat/start
Inicia nova conversa com o Coach EVO.

**Headers:**
```
Authorization: Bearer <token>
```

**Request:**
```json
{
  "user_context": {
    "name": "João",
    "goals": ["weight_loss"],
    "dietary_restrictions": ["vegetarian"]
  }
}
```

**Response:**
```json
{
  "conversation_id": "conv-uuid",
  "message": "Olá João! Sou o Coach EVO, seu assistente nutricional personalizado. Como posso te ajudar hoje?",
  "suggestions": [
    "Quero planejar minhas refeições",
    "Tenho dúvidas sobre proteínas",
    "Como calcular minhas calorias?"
  ]
}
```

#### POST /api/v1/chat/message
Envia mensagem para o Coach EVO.

**Headers:**
```
Authorization: Bearer <token>
```

**Request:**
```json
{
  "conversation_id": "conv-uuid",
  "message": "Quero um plano de café da manhã saudável",
  "context": {
    "current_meal": "breakfast",
    "available_time": "15_minutes"
  }
}
```

**Response:**
```json
{
  "message": "Perfeito! Baseado no seu perfil vegetariano e objetivo de perda de peso, aqui está um café da manhã ideal:\n\n🥣 **Opção 1: Bowl Nutritivo**\n- 1 xícara de aveia (150g)\n- 1 banana média (100g)\n- 1 colher de sopa de pasta de amendoim (20g)\n- 200ml de leite de amêndoas\n\n📊 **Valores nutricionais:**\n- Calorias: 420\n- Proteínas: 15g\n- Carboidratos: 65g\n- Gorduras: 12g\n\nEssa combinação te dará energia sustentada e saciedade até o almoço!",
  "suggestions": [
    "Quero outras opções de café da manhã",
    "Como preparar essa receita?",
    "Posso substituir algum ingrediente?"
  ],
  "nutrition_data": {
    "total_calories": 420,
    "macros": {
      "protein": 15,
      "carbs": 65,
      "fat": 12
    }
  },
  "taco_foods_used": [
    {"id": "045", "name": "Aveia, flocos"},
    {"id": "089", "name": "Banana, nanica"}
  ]
}
```

#### GET /api/v1/chat/history
Obtém histórico de conversas.

**Headers:**
```
Authorization: Bearer <token>
```

**Query Parameters:**
- `conversation_id` (string): ID da conversa específica
- `limit` (int): Limite de mensagens

**Response:**
```json
{
  "conversations": [
    {
      "id": "conv-uuid",
      "started_at": "2025-01-18T10:00:00Z",
      "last_message_at": "2025-01-18T10:15:00Z",
      "message_count": 5,
      "preview": "Quero um plano de café da manhã saudável"
    }
  ],
  "messages": [
    {
      "id": "msg-uuid",
      "conversation_id": "conv-uuid",
      "role": "user",
      "content": "Quero um plano de café da manhã saudável",
      "timestamp": "2025-01-18T10:00:00Z"
    },
    {
      "id": "msg-uuid-2",
      "conversation_id": "conv-uuid",
      "role": "assistant",
      "content": "Perfeito! Baseado no seu perfil...",
      "timestamp": "2025-01-18T10:00:30Z",
      "metadata": {
        "nutrition_data": {},
        "taco_foods_used": []
      }
    }
  ]
}
```

### Image Analysis

#### POST /api/v1/analysis/meal
Analisa imagem de refeição.

**Headers:**
```
Authorization: Bearer <token>
Content-Type: multipart/form-data
```

**Request:**
```
image: <arquivo-imagem>
meal_type: "lunch"
```

**Response:**
```json
{
  "analysis": {
    "detected_foods": [
      {
        "name": "Arroz branco",
        "confidence": 0.95,
        "estimated_portion": 150,
        "taco_match": {
          "id": "002",
          "name": "Arroz, polido, cozido"
        }
      },
      {
        "name": "Feijão preto",
        "confidence": 0.88,
        "estimated_portion": 100,
        "taco_match": {
          "id": "025",
          "name": "Feijão, preto, cozido"
        }
      }
    ],
    "estimated_nutrition": {
      "calories": 380,
      "protein": 12.5,
      "carbs": 75.2,
      "fat": 2.8
    },
    "recommendations": [
      "Adicione uma fonte de proteína como frango ou ovo",
      "Inclua vegetais para mais fibras e vitaminas",
      "Considere trocar o arroz branco por integral"
    ]
  },
  "feedback": {
    "alignment_with_goals": 0.7,
    "suggestions": [
      "Boa escolha de carboidratos complexos",
      "Falta proteína para atingir sua meta diária"
    ]
  }
}
```

### Recommendations

#### GET /api/v1/recommendations/daily
Obtém recomendações diárias personalizadas.

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
{
  "date": "2025-01-18",
  "daily_targets": {
    "calories": 1700,
    "protein": 127,
    "carbs": 149,
    "fat": 66,
    "water": 2800
  },
  "meal_plan": {
    "breakfast": {
      "target_calories": 400,
      "foods": [
        {
          "taco_id": "045",
          "name": "Aveia, flocos",
          "portion": 50,
          "nutrition": {
            "calories": 190,
            "protein": 6.5,
            "carbs": 32.5,
            "fat": 3.5
          }
        }
      ]
    },
    "lunch": {
      "target_calories": 600,
      "foods": []
    },
    "dinner": {
      "target_calories": 500,
      "foods": []
    },
    "snacks": {
      "target_calories": 200,
      "foods": []
    }
  },
  "tips": [
    "Beba água antes das refeições para aumentar a saciedade",
    "Mastigue devagar para melhor digestão",
    "Inclua proteína em todas as refeições"
  ]
}
```

## 📊 Health Check

### GET /health
Verifica status do serviço.

**Response:**
```json
{
  "status": "healthy",
  "timestamp": "2025-01-18T10:00:00Z",
  "version": "1.0.0",
  "services": {
    "database": "connected",
    "firebase": "connected",
    "vertex_ai": "connected"
  }
}
```

## 🔧 Códigos de Status

### Sucesso
- `200 OK` - Requisição bem-sucedida
- `201 Created` - Recurso criado com sucesso
- `204 No Content` - Operação bem-sucedida sem conteúdo

### Erro do Cliente
- `400 Bad Request` - Dados inválidos na requisição
- `401 Unauthorized` - Token de autenticação inválido ou ausente
- `403 Forbidden` - Acesso negado
- `404 Not Found` - Recurso não encontrado
- `422 Unprocessable Entity` - Dados válidos mas não processáveis

### Erro do Servidor
- `500 Internal Server Error` - Erro interno do servidor
- `502 Bad Gateway` - Erro de gateway
- `503 Service Unavailable` - Serviço temporariamente indisponível

## 🔒 Rate Limiting

### Limites por Endpoint
- **Authentication**: 5 req/min por IP
- **Chat**: 30 req/min por usuário
- **Image Analysis**: 10 req/min por usuário
- **General API**: 100 req/min por usuário

### Headers de Rate Limit
```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1642521600
```

## 🧪 Testando as APIs

### Usando cURL

#### Autenticação
```bash
curl -X POST http://localhost:8001/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'
```

#### Chat com Coach EVO
```bash
curl -X POST http://localhost:8004/api/v1/chat/start \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"user_context":{"name":"João","goals":["weight_loss"]}}'
```

### Usando Postman
1. Importe a collection: `docs/postman/EvolveYou-API.json`
2. Configure environment com base URLs
3. Execute requests de exemplo

### Usando Python
```python
import requests

# Login
response = requests.post('http://localhost:8001/auth/login', json={
    'email': 'test@example.com',
    'password': 'password123'
})
token = response.json()['token']

# Chat
headers = {'Authorization': f'Bearer {token}'}
response = requests.post('http://localhost:8004/api/v1/chat/start', 
    headers=headers,
    json={'user_context': {'name': 'João', 'goals': ['weight_loss']}}
)
```

## 📝 Changelog da API

### v1.0.0 (2025-01-18)
- ✅ Implementação inicial das APIs
- ✅ Autenticação Firebase
- ✅ Sistema de anamnese
- ✅ Coach EVO chat
- ✅ Integração Base TACO
- ✅ Análise de imagens

### Próximas Versões
- 🔄 v1.1.0: Webhooks para notificações
- 📋 v1.2.0: API de relatórios avançados
- 📋 v1.3.0: Integração com wearables

---

**Documentação gerada automaticamente** | **Última atualização**: 18/01/2025

