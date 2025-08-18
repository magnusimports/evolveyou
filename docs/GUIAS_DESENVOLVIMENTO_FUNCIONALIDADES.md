# 🛠️ GUIAS DE DESENVOLVIMENTO - FUNCIONALIDADES EVOLVEYOU
*Documentação Técnica Detalhada para Implementação*

## 📋 ÍNDICE DE FUNCIONALIDADES

1. [🤖 Coach Virtual EVO](#coach-virtual-evo)
2. [🧠 Anamnese Inteligente](#anamnese-inteligente)
3. [⚡ Sistema Full-time](#sistema-full-time)
4. [📱 Integração Frontend](#integração-frontend)
5. [🛒 Lista de Compras Inteligente](#lista-de-compras-inteligente)
6. [📊 Relatórios e Analytics](#relatórios-e-analytics)

---

## 🤖 COACH VIRTUAL EVO

### 📖 VISÃO GERAL

O Coach Virtual EVO é o diferencial único do EvolveYou - uma IA conversacional avançada que fornece orientação nutricional personalizada, análise de refeições e suporte contínuo aos usuários.

### 🎯 OBJETIVOS

- Criar experiência conversacional natural e inteligente
- Fornecer orientação nutricional precisa baseada na Base TACO
- Analisar fotos de refeições e fornecer feedback
- Integrar com todos os dados do usuário para personalização máxima

### 🏗️ ARQUITETURA TÉCNICA

#### **Componentes Principais**

```
EVO Service
├── Chat Engine (Vertex AI Integration)
├── Context Manager (User Data Integration)
├── Food Analysis (Base TACO Integration)
├── Photo Recognition (Vision API)
├── Recommendation Engine (ML Models)
└── Response Generator (Natural Language)
```

#### **Stack Tecnológico**
- **Backend**: Python 3.11 + FastAPI
- **IA**: Google Vertex AI (Gemini 2.5 Flash)
- **Visão Computacional**: Google Vision API
- **Database**: Firestore + Redis (cache)
- **Queue**: Google Cloud Tasks
- **Monitoring**: Google Cloud Monitoring

### 📁 ESTRUTURA DE ARQUIVOS

```
backend/services/evo-service/
├── src/
│   ├── main.py                 # FastAPI app
│   ├── models/
│   │   ├── chat.py            # Chat models
│   │   ├── user_context.py    # User context models
│   │   └── food_analysis.py   # Food analysis models
│   ├── services/
│   │   ├── vertex_ai.py       # Vertex AI integration
│   │   ├── vision_api.py      # Vision API integration
│   │   ├── context_manager.py # User context management
│   │   ├── food_analyzer.py   # Food analysis logic
│   │   └── recommendation.py  # Recommendation engine
│   ├── routes/
│   │   ├── chat.py           # Chat endpoints
│   │   ├── analysis.py       # Analysis endpoints
│   │   └── recommendations.py # Recommendation endpoints
│   ├── utils/
│   │   ├── prompts.py        # AI prompts
│   │   ├── validators.py     # Input validation
│   │   └── formatters.py     # Response formatting
│   └── config/
│       ├── settings.py       # Configuration
│       └── prompts/          # Prompt templates
├── tests/
├── requirements.txt
├── Dockerfile
└── README.md
```

### 🔧 IMPLEMENTAÇÃO DETALHADA

#### **1. Configuração Base (Dia 1)**

**main.py**
```python
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from google.cloud import aiplatform
import os

app = FastAPI(title="EVO Service", version="1.0.0")

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize Vertex AI
aiplatform.init(
    project=os.getenv("GOOGLE_CLOUD_PROJECT"),
    location="southamerica-east1"
)

@app.get("/health")
async def health_check():
    return {"status": "healthy", "service": "evo"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
```

**services/vertex_ai.py**
```python
from vertexai.generative_models import GenerativeModel
from typing import Dict, List, Optional
import json

class VertexAIService:
    def __init__(self):
        self.model = GenerativeModel("gemini-2.5-flash-lite")
        
    async def generate_response(
        self, 
        prompt: str, 
        context: Dict,
        conversation_history: List[Dict]
    ) -> str:
        """Generate AI response with context"""
        
        # Build full prompt with context
        full_prompt = self._build_prompt(prompt, context, conversation_history)
        
        # Generate response
        response = await self.model.generate_content_async(full_prompt)
        
        return response.text
    
    def _build_prompt(self, prompt: str, context: Dict, history: List[Dict]) -> str:
        """Build comprehensive prompt with user context"""
        
        base_prompt = f"""
        Você é o EVO, o coach virtual de nutrição do aplicativo EvolveYou.
        
        CONTEXTO DO USUÁRIO:
        - Nome: {context.get('name', 'Usuário')}
        - Objetivo: {context.get('goal', 'Não definido')}
        - Peso: {context.get('weight', 'N/A')} kg
        - Altura: {context.get('height', 'N/A')} cm
        - Nível de atividade: {context.get('activity_level', 'N/A')}
        - Restrições: {context.get('restrictions', 'Nenhuma')}
        
        HISTÓRICO DA CONVERSA:
        {self._format_history(history)}
        
        PERGUNTA ATUAL: {prompt}
        
        INSTRUÇÕES:
        - Seja amigável, motivador e profissional
        - Use dados da Base TACO brasileira quando relevante
        - Forneça informações precisas e baseadas em evidências
        - Adapte as respostas ao perfil do usuário
        - Mantenha respostas concisas mas informativas
        """
        
        return base_prompt
    
    def _format_history(self, history: List[Dict]) -> str:
        """Format conversation history"""
        formatted = []
        for msg in history[-5:]:  # Last 5 messages
            role = "Usuário" if msg['role'] == 'user' else "EVO"
            formatted.append(f"{role}: {msg['content']}")
        return "\n".join(formatted)
```

#### **2. Core do Chat (Dia 2)**

**routes/chat.py**
```python
from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from typing import List, Optional
from ..services.vertex_ai import VertexAIService
from ..services.context_manager import ContextManager
from ..models.chat import ChatMessage, ChatResponse

router = APIRouter(prefix="/chat", tags=["chat"])

class ChatRequest(BaseModel):
    message: str
    user_id: str
    conversation_id: Optional[str] = None

@router.post("/message", response_model=ChatResponse)
async def send_message(
    request: ChatRequest,
    vertex_ai: VertexAIService = Depends(),
    context_manager: ContextManager = Depends()
):
    """Send message to EVO and get response"""
    
    try:
        # Get user context
        user_context = await context_manager.get_user_context(request.user_id)
        
        # Get conversation history
        history = await context_manager.get_conversation_history(
            request.user_id, 
            request.conversation_id
        )
        
        # Generate AI response
        ai_response = await vertex_ai.generate_response(
            request.message,
            user_context,
            history
        )
        
        # Save conversation
        await context_manager.save_message(
            request.user_id,
            request.conversation_id,
            request.message,
            ai_response
        )
        
        return ChatResponse(
            response=ai_response,
            conversation_id=request.conversation_id,
            timestamp=datetime.utcnow()
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/history/{user_id}")
async def get_chat_history(
    user_id: str,
    conversation_id: Optional[str] = None,
    context_manager: ContextManager = Depends()
):
    """Get chat history for user"""
    
    history = await context_manager.get_conversation_history(
        user_id, 
        conversation_id
    )
    
    return {"history": history}
```

#### **3. Análise Nutricional (Dia 3)**

**services/food_analyzer.py**
```python
import requests
from typing import Dict, List, Optional
from ..config.settings import CONTENT_SERVICE_URL

class FoodAnalyzer:
    def __init__(self):
        self.content_service_url = CONTENT_SERVICE_URL
    
    async def analyze_meal_description(self, description: str) -> Dict:
        """Analyze meal from text description"""
        
        # Extract food items from description
        food_items = await self._extract_food_items(description)
        
        # Get nutritional data from Base TACO
        nutritional_data = await self._get_nutritional_data(food_items)
        
        # Calculate totals
        totals = self._calculate_totals(nutritional_data)
        
        return {
            "foods": food_items,
            "nutritional_data": nutritional_data,
            "totals": totals,
            "analysis": await self._generate_analysis(totals)
        }
    
    async def _extract_food_items(self, description: str) -> List[str]:
        """Extract food items from description using AI"""
        
        prompt = f"""
        Extraia os alimentos mencionados nesta descrição de refeição:
        "{description}"
        
        Retorne apenas uma lista de alimentos, um por linha.
        Use nomes simples que possam ser encontrados na Base TACO.
        """
        
        # Use Vertex AI to extract foods
        # Implementation here...
        
        return ["arroz", "feijão", "frango"]  # Example
    
    async def _get_nutritional_data(self, food_items: List[str]) -> List[Dict]:
        """Get nutritional data from Base TACO"""
        
        nutritional_data = []
        
        for food in food_items:
            try:
                response = requests.get(
                    f"{self.content_service_url}/api/foods/search",
                    params={"q": food}
                )
                
                if response.status_code == 200:
                    data = response.json()
                    if data:
                        nutritional_data.append(data[0])
                        
            except Exception as e:
                print(f"Error fetching data for {food}: {e}")
        
        return nutritional_data
    
    def _calculate_totals(self, nutritional_data: List[Dict]) -> Dict:
        """Calculate total nutritional values"""
        
        totals = {
            "calories": 0,
            "protein": 0,
            "carbs": 0,
            "fat": 0,
            "fiber": 0
        }
        
        for food in nutritional_data:
            composition = food.get("composicao", {})
            
            # Assume 100g portions for simplicity
            totals["calories"] += composition.get("Energia", {}).get("valor", 0)
            totals["protein"] += composition.get("Proteína", {}).get("valor", 0)
            totals["carbs"] += composition.get("Carboidrato total", {}).get("valor", 0)
            totals["fat"] += composition.get("Lipídios", {}).get("valor", 0)
            
        return totals
    
    async def _generate_analysis(self, totals: Dict) -> str:
        """Generate nutritional analysis"""
        
        analysis = []
        
        # Basic analysis
        if totals["calories"] > 800:
            analysis.append("Refeição com alto valor calórico")
        elif totals["calories"] < 300:
            analysis.append("Refeição com baixo valor calórico")
        
        if totals["protein"] > 30:
            analysis.append("Rica em proteínas")
        elif totals["protein"] < 10:
            analysis.append("Baixo teor de proteínas")
        
        return ". ".join(analysis) if analysis else "Refeição equilibrada"
```

#### **4. Funcionalidades Avançadas (Dia 4)**

**services/vision_api.py**
```python
from google.cloud import vision
from typing import Dict, List
import base64

class VisionAPIService:
    def __init__(self):
        self.client = vision.ImageAnnotatorClient()
    
    async def analyze_food_image(self, image_data: str) -> Dict:
        """Analyze food image and identify items"""
        
        try:
            # Decode base64 image
            image_bytes = base64.b64decode(image_data)
            image = vision.Image(content=image_bytes)
            
            # Detect objects
            objects = self.client.object_localization(image=image).localized_object_annotations
            
            # Detect labels
            labels = self.client.label_detection(image=image).label_annotations
            
            # Extract food items
            food_items = self._extract_food_items(objects, labels)
            
            return {
                "detected_foods": food_items,
                "confidence": self._calculate_confidence(objects, labels),
                "suggestions": await self._generate_suggestions(food_items)
            }
            
        except Exception as e:
            raise Exception(f"Error analyzing image: {str(e)}")
    
    def _extract_food_items(self, objects: List, labels: List) -> List[str]:
        """Extract food items from detection results"""
        
        food_keywords = [
            "food", "meal", "dish", "fruit", "vegetable", 
            "meat", "rice", "bread", "pasta", "salad"
        ]
        
        detected_foods = []
        
        # From object detection
        for obj in objects:
            if any(keyword in obj.name.lower() for keyword in food_keywords):
                detected_foods.append(obj.name)
        
        # From label detection
        for label in labels:
            if any(keyword in label.description.lower() for keyword in food_keywords):
                detected_foods.append(label.description)
        
        return list(set(detected_foods))  # Remove duplicates
    
    def _calculate_confidence(self, objects: List, labels: List) -> float:
        """Calculate overall confidence score"""
        
        scores = []
        
        for obj in objects:
            scores.append(obj.score)
        
        for label in labels:
            scores.append(label.score)
        
        return sum(scores) / len(scores) if scores else 0.0
    
    async def _generate_suggestions(self, food_items: List[str]) -> List[str]:
        """Generate suggestions based on detected foods"""
        
        suggestions = []
        
        if "salad" in [item.lower() for item in food_items]:
            suggestions.append("Ótima escolha! Saladas são ricas em fibras e vitaminas.")
        
        if "meat" in [item.lower() for item in food_items]:
            suggestions.append("Boa fonte de proteína. Considere a quantidade para seu objetivo.")
        
        return suggestions
```

### 🧪 TESTES

#### **Testes Unitários**

```python
# tests/test_vertex_ai.py
import pytest
from unittest.mock import Mock, patch
from src.services.vertex_ai import VertexAIService

@pytest.fixture
def vertex_ai_service():
    return VertexAIService()

@pytest.mark.asyncio
async def test_generate_response(vertex_ai_service):
    """Test AI response generation"""
    
    with patch.object(vertex_ai_service.model, 'generate_content_async') as mock_generate:
        mock_response = Mock()
        mock_response.text = "Olá! Como posso ajudar com sua nutrição hoje?"
        mock_generate.return_value = mock_response
        
        response = await vertex_ai_service.generate_response(
            "Olá",
            {"name": "João", "goal": "perda de peso"},
            []
        )
        
        assert response == "Olá! Como posso ajudar com sua nutrição hoje?"
        mock_generate.assert_called_once()

@pytest.mark.asyncio
async def test_build_prompt(vertex_ai_service):
    """Test prompt building with context"""
    
    context = {
        "name": "Maria",
        "goal": "ganho de massa",
        "weight": 60,
        "height": 165
    }
    
    history = [
        {"role": "user", "content": "Olá"},
        {"role": "assistant", "content": "Oi Maria!"}
    ]
    
    prompt = vertex_ai_service._build_prompt("Como ganhar massa?", context, history)
    
    assert "Maria" in prompt
    assert "ganho de massa" in prompt
    assert "60" in prompt
    assert "Como ganhar massa?" in prompt
```

#### **Testes de Integração**

```python
# tests/test_integration.py
import pytest
from fastapi.testclient import TestClient
from src.main import app

client = TestClient(app)

def test_chat_endpoint():
    """Test chat endpoint integration"""
    
    response = client.post("/chat/message", json={
        "message": "Olá, EVO!",
        "user_id": "test_user_123"
    })
    
    assert response.status_code == 200
    data = response.json()
    assert "response" in data
    assert "conversation_id" in data
    assert "timestamp" in data

def test_food_analysis():
    """Test food analysis endpoint"""
    
    response = client.post("/analysis/meal", json={
        "description": "Arroz, feijão e frango grelhado",
        "user_id": "test_user_123"
    })
    
    assert response.status_code == 200
    data = response.json()
    assert "foods" in data
    assert "nutritional_data" in data
    assert "totals" in data
```

### 📊 MÉTRICAS E MONITORAMENTO

#### **KPIs Técnicos**
- **Tempo de resposta**: < 2 segundos
- **Precisão nutricional**: > 90%
- **Satisfação do usuário**: > 4.5/5
- **Uptime**: > 99.9%

#### **Monitoramento**
```python
# src/utils/monitoring.py
from google.cloud import monitoring_v3
import time
from functools import wraps

def monitor_performance(func):
    """Decorator to monitor function performance"""
    
    @wraps(func)
    async def wrapper(*args, **kwargs):
        start_time = time.time()
        
        try:
            result = await func(*args, **kwargs)
            
            # Log success metrics
            duration = time.time() - start_time
            log_metric("evo_response_time", duration)
            log_metric("evo_success_count", 1)
            
            return result
            
        except Exception as e:
            # Log error metrics
            log_metric("evo_error_count", 1)
            raise
    
    return wrapper

def log_metric(metric_name: str, value: float):
    """Log metric to Google Cloud Monitoring"""
    # Implementation here...
    pass
```

---

## 🧠 ANAMNESE INTELIGENTE

### 📖 VISÃO GERAL

A Anamnese Inteligente é um questionário adaptativo de 22 perguntas que coleta informações essenciais para criar um perfil nutricional completo e personalizado do usuário.

### 🎯 OBJETIVOS

- Coletar dados precisos sobre o usuário (físicos, objetivos, preferências)
- Calcular Taxa Metabólica Basal (TMB) com precisão
- Identificar restrições alimentares e alergias
- Definir objetivos claros e mensuráveis
- Criar base para personalização de todas as funcionalidades

### 📋 AS 22 PERGUNTAS ESSENCIAIS

#### **Dados Básicos (5 perguntas)**
1. **Nome completo**: Para personalização
2. **Data de nascimento**: Cálculo de idade
3. **Sexo biológico**: Diferenças metabólicas
4. **Peso atual**: Base para cálculos
5. **Altura**: Cálculo de IMC e TMB

#### **Composição Corporal (4 perguntas)**
6. **Percentual de gordura corporal**: Se conhecido
7. **Massa muscular**: Estimativa ou medição
8. **Tipo de corpo**: Ectomorfo, mesomorfo, endomorfo
9. **Histórico de peso**: Variações recentes

#### **Atividade Física (4 perguntas)**
10. **Nível de atividade**: Sedentário a muito ativo
11. **Tipo de exercício**: Cardio, musculação, esportes
12. **Frequência semanal**: Dias por semana
13. **Experiência**: Iniciante, intermediário, avançado

#### **Objetivos (3 perguntas)**
14. **Objetivo principal**: Perda de peso, ganho de massa, manutenção
15. **Meta de peso**: Peso desejado
16. **Prazo**: Tempo para atingir objetivo

#### **Saúde e Restrições (4 perguntas)**
17. **Condições médicas**: Diabetes, hipertensão, etc.
18. **Medicamentos**: Que afetam metabolismo
19. **Alergias alimentares**: Restrições obrigatórias
20. **Preferências dietéticas**: Vegetariano, vegano, etc.

#### **Estilo de Vida (2 perguntas)**
21. **Rotina alimentar**: Horários, número de refeições
22. **Orçamento**: Faixa de investimento em alimentação

### 🏗️ ARQUITETURA TÉCNICA

#### **Componentes Principais**

```
Anamnese Service
├── Question Engine (Adaptive Logic)
├── Calculation Engine (TMB, Macros)
├── Validation Engine (Data Validation)
├── Profile Generator (User Profile)
├── Recommendation Engine (Initial Suggestions)
└── Integration Layer (Other Services)
```

### 📁 ESTRUTURA DE ARQUIVOS

```
backend/services/users-service/
├── src/
│   ├── anamnese/
│   │   ├── models/
│   │   │   ├── questions.py      # Question models
│   │   │   ├── answers.py        # Answer models
│   │   │   └── profile.py        # User profile models
│   │   ├── services/
│   │   │   ├── question_engine.py   # Question logic
│   │   │   ├── calculation_engine.py # TMB calculations
│   │   │   ├── profile_generator.py  # Profile creation
│   │   │   └── validator.py          # Data validation
│   │   ├── routes/
│   │   │   ├── questions.py      # Question endpoints
│   │   │   ├── answers.py        # Answer endpoints
│   │   │   └── profile.py        # Profile endpoints
│   │   └── utils/
│   │       ├── formulas.py       # Calculation formulas
│   │       └── constants.py      # Constants and configs
```

### 🔧 IMPLEMENTAÇÃO DETALHADA

#### **1. Estrutura Base (Dia 6)**

**models/questions.py**
```python
from pydantic import BaseModel
from typing import List, Optional, Union
from enum import Enum

class QuestionType(str, Enum):
    TEXT = "text"
    NUMBER = "number"
    SELECT = "select"
    MULTISELECT = "multiselect"
    SCALE = "scale"
    BOOLEAN = "boolean"

class QuestionOption(BaseModel):
    value: str
    label: str
    description: Optional[str] = None

class Question(BaseModel):
    id: str
    title: str
    description: Optional[str] = None
    type: QuestionType
    required: bool = True
    options: Optional[List[QuestionOption]] = None
    min_value: Optional[float] = None
    max_value: Optional[float] = None
    validation_regex: Optional[str] = None
    depends_on: Optional[str] = None  # Question dependency
    condition: Optional[str] = None   # Show condition

class QuestionnaireSection(BaseModel):
    id: str
    title: str
    description: str
    questions: List[Question]
    order: int

# Define all 22 questions
ANAMNESE_QUESTIONS = [
    QuestionnaireSection(
        id="basic_data",
        title="Dados Básicos",
        description="Informações fundamentais sobre você",
        order=1,
        questions=[
            Question(
                id="full_name",
                title="Qual é o seu nome completo?",
                type=QuestionType.TEXT,
                required=True
            ),
            Question(
                id="birth_date",
                title="Qual é a sua data de nascimento?",
                type=QuestionType.TEXT,
                required=True,
                validation_regex=r"^\d{2}/\d{2}/\d{4}$"
            ),
            Question(
                id="biological_sex",
                title="Qual é o seu sexo biológico?",
                type=QuestionType.SELECT,
                required=True,
                options=[
                    QuestionOption(value="male", label="Masculino"),
                    QuestionOption(value="female", label="Feminino")
                ]
            ),
            Question(
                id="current_weight",
                title="Qual é o seu peso atual? (kg)",
                type=QuestionType.NUMBER,
                required=True,
                min_value=30.0,
                max_value=300.0
            ),
            Question(
                id="height",
                title="Qual é a sua altura? (cm)",
                type=QuestionType.NUMBER,
                required=True,
                min_value=100.0,
                max_value=250.0
            )
        ]
    ),
    # ... outras seções
]
```

**services/question_engine.py**
```python
from typing import Dict, List, Optional
from ..models.questions import Question, ANAMNESE_QUESTIONS

class QuestionEngine:
    def __init__(self):
        self.questions = ANAMNESE_QUESTIONS
    
    def get_next_question(
        self, 
        user_id: str, 
        current_answers: Dict[str, any]
    ) -> Optional[Question]:
        """Get next question based on current answers"""
        
        # Get all answered question IDs
        answered_ids = set(current_answers.keys())
        
        # Find next unanswered question
        for section in self.questions:
            for question in section.questions:
                if question.id not in answered_ids:
                    # Check if question should be shown
                    if self._should_show_question(question, current_answers):
                        return question
        
        return None  # All questions answered
    
    def _should_show_question(
        self, 
        question: Question, 
        answers: Dict[str, any]
    ) -> bool:
        """Check if question should be shown based on dependencies"""
        
        if not question.depends_on or not question.condition:
            return True
        
        dependency_answer = answers.get(question.depends_on)
        if dependency_answer is None:
            return False
        
        # Evaluate condition
        return self._evaluate_condition(
            question.condition, 
            dependency_answer
        )
    
    def _evaluate_condition(self, condition: str, value: any) -> bool:
        """Evaluate show condition"""
        
        # Simple condition evaluation
        # Format: "value == 'expected'" or "value > 18"
        
        try:
            # Replace 'value' with actual value in condition
            condition = condition.replace('value', repr(value))
            return eval(condition)
        except:
            return True
    
    def get_progress(self, answers: Dict[str, any]) -> Dict:
        """Calculate completion progress"""
        
        total_questions = sum(len(section.questions) for section in self.questions)
        answered_questions = len(answers)
        
        return {
            "total": total_questions,
            "answered": answered_questions,
            "percentage": (answered_questions / total_questions) * 100,
            "remaining": total_questions - answered_questions
        }
    
    def validate_answer(self, question_id: str, answer: any) -> Dict:
        """Validate answer for specific question"""
        
        question = self._find_question(question_id)
        if not question:
            return {"valid": False, "error": "Question not found"}
        
        # Type validation
        if question.type == "number":
            if not isinstance(answer, (int, float)):
                return {"valid": False, "error": "Answer must be a number"}
            
            if question.min_value and answer < question.min_value:
                return {"valid": False, "error": f"Value must be at least {question.min_value}"}
            
            if question.max_value and answer > question.max_value:
                return {"valid": False, "error": f"Value must be at most {question.max_value}"}
        
        elif question.type == "select":
            valid_options = [opt.value for opt in question.options or []]
            if answer not in valid_options:
                return {"valid": False, "error": "Invalid option selected"}
        
        # Regex validation
        if question.validation_regex and isinstance(answer, str):
            import re
            if not re.match(question.validation_regex, answer):
                return {"valid": False, "error": "Invalid format"}
        
        return {"valid": True}
    
    def _find_question(self, question_id: str) -> Optional[Question]:
        """Find question by ID"""
        
        for section in self.questions:
            for question in section.questions:
                if question.id == question_id:
                    return question
        return None
```

#### **2. Cálculos Metabólicos (Dia 7)**

**services/calculation_engine.py**
```python
from typing import Dict
import math
from datetime import datetime, date

class CalculationEngine:
    
    def calculate_tmb(self, profile_data: Dict) -> float:
        """Calculate Basal Metabolic Rate using multiple formulas"""
        
        age = self._calculate_age(profile_data["birth_date"])
        weight = profile_data["current_weight"]
        height = profile_data["height"]
        sex = profile_data["biological_sex"]
        
        # Use Harris-Benedict revised formula as primary
        if sex == "male":
            tmb = 88.362 + (13.397 * weight) + (4.799 * height) - (5.677 * age)
        else:
            tmb = 447.593 + (9.247 * weight) + (3.098 * height) - (4.330 * age)
        
        # Adjust for body composition if available
        if "body_fat_percentage" in profile_data:
            tmb = self._adjust_for_body_composition(tmb, profile_data)
        
        return round(tmb, 2)
    
    def calculate_tdee(self, tmb: float, activity_level: str) -> float:
        """Calculate Total Daily Energy Expenditure"""
        
        activity_multipliers = {
            "sedentary": 1.2,        # Little to no exercise
            "lightly_active": 1.375, # Light exercise 1-3 days/week
            "moderately_active": 1.55, # Moderate exercise 3-5 days/week
            "very_active": 1.725,    # Hard exercise 6-7 days/week
            "extremely_active": 1.9  # Very hard exercise, physical job
        }
        
        multiplier = activity_multipliers.get(activity_level, 1.2)
        return round(tmb * multiplier, 2)
    
    def calculate_macro_distribution(
        self, 
        tdee: float, 
        goal: str, 
        profile_data: Dict
    ) -> Dict:
        """Calculate macronutrient distribution"""
        
        # Base calorie adjustment for goal
        calorie_adjustments = {
            "weight_loss": -0.20,    # 20% deficit
            "maintenance": 0.0,      # No change
            "muscle_gain": 0.15,     # 15% surplus
            "recomposition": -0.10   # Small deficit
        }
        
        adjustment = calorie_adjustments.get(goal, 0.0)
        target_calories = tdee * (1 + adjustment)
        
        # Protein calculation (priority)
        weight = profile_data["current_weight"]
        activity_level = profile_data.get("activity_level", "sedentary")
        
        # Protein per kg based on goal and activity
        protein_per_kg = self._get_protein_requirement(goal, activity_level)
        protein_grams = weight * protein_per_kg
        protein_calories = protein_grams * 4
        
        # Fat calculation (minimum 20% of calories)
        fat_percentage = 0.25 if goal == "muscle_gain" else 0.30
        fat_calories = target_calories * fat_percentage
        fat_grams = fat_calories / 9
        
        # Carbohydrates (remaining calories)
        carb_calories = target_calories - protein_calories - fat_calories
        carb_grams = carb_calories / 4
        
        return {
            "calories": round(target_calories),
            "protein": {
                "grams": round(protein_grams, 1),
                "calories": round(protein_calories),
                "percentage": round((protein_calories / target_calories) * 100, 1)
            },
            "carbohydrates": {
                "grams": round(carb_grams, 1),
                "calories": round(carb_calories),
                "percentage": round((carb_calories / target_calories) * 100, 1)
            },
            "fat": {
                "grams": round(fat_grams, 1),
                "calories": round(fat_calories),
                "percentage": round((fat_calories / target_calories) * 100, 1)
            }
        }
    
    def _calculate_age(self, birth_date: str) -> int:
        """Calculate age from birth date"""
        
        birth = datetime.strptime(birth_date, "%d/%m/%Y").date()
        today = date.today()
        
        age = today.year - birth.year
        if today.month < birth.month or (today.month == birth.month and today.day < birth.day):
            age -= 1
        
        return age
    
    def _adjust_for_body_composition(self, tmb: float, profile_data: Dict) -> float:
        """Adjust TMB based on body composition"""
        
        body_fat = profile_data.get("body_fat_percentage", 0)
        
        # Higher muscle mass = higher TMB
        if body_fat < 10:  # Very low body fat (high muscle)
            return tmb * 1.1
        elif body_fat < 15:  # Low body fat
            return tmb * 1.05
        elif body_fat > 30:  # High body fat
            return tmb * 0.95
        
        return tmb
    
    def _get_protein_requirement(self, goal: str, activity_level: str) -> float:
        """Get protein requirement per kg body weight"""
        
        base_requirements = {
            "weight_loss": 1.6,      # Higher protein for muscle preservation
            "maintenance": 1.2,      # Standard requirement
            "muscle_gain": 1.8,      # Higher for muscle building
            "recomposition": 1.8     # High protein for body recomp
        }
        
        base = base_requirements.get(goal, 1.2)
        
        # Adjust for activity level
        if activity_level in ["very_active", "extremely_active"]:
            base += 0.2
        elif activity_level == "moderately_active":
            base += 0.1
        
        return base
```

#### **3. Restrições e Alergias (Dia 8)**

**services/restriction_manager.py**
```python
from typing import Dict, List, Set
from ..models.restrictions import FoodRestriction, AllergyLevel

class RestrictionManager:
    
    def __init__(self):
        self.allergen_foods = self._load_allergen_database()
        self.dietary_restrictions = self._load_dietary_restrictions()
    
    def process_restrictions(self, answers: Dict) -> Dict:
        """Process user restrictions and allergies"""
        
        restrictions = {
            "allergies": [],
            "dietary_preferences": [],
            "medical_restrictions": [],
            "forbidden_foods": set(),
            "warning_foods": set()
        }
        
        # Process allergies
        if "food_allergies" in answers:
            allergies = answers["food_allergies"]
            if isinstance(allergies, list):
                for allergy in allergies:
                    restrictions["allergies"].append(allergy)
                    restrictions["forbidden_foods"].update(
                        self.allergen_foods.get(allergy, [])
                    )
        
        # Process dietary preferences
        if "dietary_preference" in answers:
            preference = answers["dietary_preference"]
            restrictions["dietary_preferences"].append(preference)
            
            if preference == "vegetarian":
                restrictions["forbidden_foods"].update(["carne", "frango", "peixe"])
            elif preference == "vegan":
                restrictions["forbidden_foods"].update([
                    "carne", "frango", "peixe", "leite", "queijo", "ovo"
                ])
        
        # Process medical conditions
        if "medical_conditions" in answers:
            conditions = answers["medical_conditions"]
            if isinstance(conditions, list):
                for condition in conditions:
                    restrictions["medical_restrictions"].append(condition)
                    
                    if condition == "diabetes":
                        restrictions["warning_foods"].update([
                            "açúcar", "doce", "refrigerante"
                        ])
                    elif condition == "hypertension":
                        restrictions["warning_foods"].update([
                            "sal", "embutidos", "conservas"
                        ])
        
        return {
            **restrictions,
            "forbidden_foods": list(restrictions["forbidden_foods"]),
            "warning_foods": list(restrictions["warning_foods"])
        }
    
    def validate_food_compatibility(
        self, 
        food_name: str, 
        user_restrictions: Dict
    ) -> Dict:
        """Check if food is compatible with user restrictions"""
        
        food_lower = food_name.lower()
        
        # Check forbidden foods
        for forbidden in user_restrictions.get("forbidden_foods", []):
            if forbidden.lower() in food_lower:
                return {
                    "compatible": False,
                    "reason": f"Contém {forbidden} (restrição alimentar)",
                    "severity": "forbidden"
                }
        
        # Check warning foods
        for warning in user_restrictions.get("warning_foods", []):
            if warning.lower() in food_lower:
                return {
                    "compatible": True,
                    "reason": f"Contém {warning} (atenção médica)",
                    "severity": "warning"
                }
        
        return {"compatible": True, "severity": "safe"}
    
    def _load_allergen_database(self) -> Dict[str, List[str]]:
        """Load allergen-food mapping database"""
        
        return {
            "lactose": [
                "leite", "queijo", "iogurte", "manteiga", "creme de leite",
                "leite condensado", "sorvete", "chocolate ao leite"
            ],
            "gluten": [
                "trigo", "pão", "macarrão", "biscoito", "bolo", "cerveja",
                "aveia", "centeio", "cevada"
            ],
            "nuts": [
                "amendoim", "castanha", "nozes", "amêndoa", "avelã",
                "pistache", "macadâmia"
            ],
            "soy": [
                "soja", "tofu", "molho de soja", "missô", "tempeh"
            ],
            "eggs": [
                "ovo", "clara", "gema", "maionese", "bolo", "pão de açúcar"
            ],
            "fish": [
                "peixe", "salmão", "atum", "sardinha", "bacalhau", "camarão",
                "lula", "polvo", "caranguejo"
            ]
        }
    
    def _load_dietary_restrictions(self) -> Dict[str, List[str]]:
        """Load dietary restriction mappings"""
        
        return {
            "vegetarian": [
                "carne", "frango", "porco", "boi", "peixe", "camarão",
                "lula", "polvo", "gelatina"
            ],
            "vegan": [
                "carne", "frango", "porco", "boi", "peixe", "camarão",
                "leite", "queijo", "ovo", "mel", "gelatina", "manteiga"
            ],
            "halal": [
                "porco", "bacon", "linguiça", "álcool", "vinho"
            ],
            "kosher": [
                "porco", "camarão", "lula", "polvo", "caranguejo"
            ]
        }
```

### 🧪 TESTES

#### **Testes de Cálculos**

```python
# tests/test_calculations.py
import pytest
from src.anamnese.services.calculation_engine import CalculationEngine

@pytest.fixture
def calc_engine():
    return CalculationEngine()

def test_tmb_calculation_male(calc_engine):
    """Test TMB calculation for male"""
    
    profile = {
        "birth_date": "01/01/1990",
        "current_weight": 80,
        "height": 180,
        "biological_sex": "male"
    }
    
    tmb = calc_engine.calculate_tmb(profile)
    
    # Expected TMB for 33-year-old male, 80kg, 180cm
    assert 1800 < tmb < 2000

def test_macro_distribution(calc_engine):
    """Test macro distribution calculation"""
    
    profile = {
        "current_weight": 70,
        "activity_level": "moderately_active"
    }
    
    macros = calc_engine.calculate_macro_distribution(2000, "weight_loss", profile)
    
    assert macros["calories"] == 1600  # 20% deficit
    assert macros["protein"]["grams"] > 100  # High protein for weight loss
    assert macros["protein"]["percentage"] + macros["carbohydrates"]["percentage"] + macros["fat"]["percentage"] == 100
```

---

*Continuação dos guias de desenvolvimento para as demais funcionalidades...*



## ⚡ SISTEMA FULL-TIME

### 📖 VISÃO GERAL

O Sistema Full-time é o diferencial técnico revolucionário do EvolveYou - um sistema de rebalanceamento automático que ajusta planos nutricionais em tempo real baseado no progresso, aderência e mudanças do usuário.

### 🎯 OBJETIVOS

- Monitorar progresso do usuário continuamente
- Ajustar automaticamente calorias e macros
- Detectar plateaus e fazer correções
- Enviar notificações inteligentes
- Adaptar planos baseado em dados reais

### 🏗️ ARQUITETURA TÉCNICA

#### **Componentes Principais**

```
Full-time System
├── Data Collector (User Metrics)
├── Progress Analyzer (Trend Analysis)
├── Rebalancing Engine (Auto Adjustments)
├── Notification System (Smart Alerts)
├── Event Processor (Real-time Events)
└── ML Predictor (Future Trends)
```

#### **Stack Tecnológico**
- **Backend**: Python 3.11 + FastAPI
- **Queue**: Google Cloud Tasks
- **Database**: Firestore + Redis (cache)
- **ML**: TensorFlow Lite
- **Monitoring**: Google Cloud Monitoring
- **Notifications**: Firebase Cloud Messaging

### 📁 ESTRUTURA DE ARQUIVOS

```
backend/services/fulltime-service/
├── src/
│   ├── main.py                    # FastAPI app
│   ├── models/
│   │   ├── user_metrics.py       # User data models
│   │   ├── progress.py           # Progress models
│   │   ├── adjustments.py        # Adjustment models
│   │   └── notifications.py      # Notification models
│   ├── services/
│   │   ├── data_collector.py     # Data collection
│   │   ├── progress_analyzer.py  # Progress analysis
│   │   ├── rebalancing_engine.py # Auto adjustments
│   │   ├── notification_service.py # Notifications
│   │   └── ml_predictor.py       # ML predictions
│   ├── routes/
│   │   ├── metrics.py           # Metrics endpoints
│   │   ├── adjustments.py       # Adjustment endpoints
│   │   └── notifications.py     # Notification endpoints
│   ├── utils/
│   │   ├── algorithms.py        # Rebalancing algorithms
│   │   ├── validators.py        # Data validation
│   │   └── schedulers.py        # Task scheduling
│   └── config/
│       ├── settings.py          # Configuration
│       └── ml_models/           # ML model files
├── tests/
├── requirements.txt
├── Dockerfile
└── README.md
```

### 🔧 IMPLEMENTAÇÃO DETALHADA

#### **1. Arquitetura do Sistema (Dia 11)**

**services/data_collector.py**
```python
from typing import Dict, List, Optional
from datetime import datetime, timedelta
import asyncio
from google.cloud import firestore
from ..models.user_metrics import UserMetrics, WeightEntry, FoodEntry

class DataCollector:
    def __init__(self):
        self.db = firestore.AsyncClient()
        self.collection_interval = 3600  # 1 hour
    
    async def collect_user_metrics(self, user_id: str) -> UserMetrics:
        """Collect all relevant user metrics"""
        
        # Get recent weight entries
        weight_data = await self._get_weight_history(user_id, days=30)
        
        # Get food tracking data
        food_data = await self._get_food_history(user_id, days=7)
        
        # Get exercise data
        exercise_data = await self._get_exercise_history(user_id, days=7)
        
        # Get adherence metrics
        adherence = await self._calculate_adherence(user_id, days=7)
        
        return UserMetrics(
            user_id=user_id,
            timestamp=datetime.utcnow(),
            weight_history=weight_data,
            food_history=food_data,
            exercise_history=exercise_data,
            adherence_metrics=adherence
        )
    
    async def _get_weight_history(self, user_id: str, days: int) -> List[WeightEntry]:
        """Get weight history for specified days"""
        
        cutoff_date = datetime.utcnow() - timedelta(days=days)
        
        query = (
            self.db.collection("users")
            .document(user_id)
            .collection("weight_entries")
            .where("date", ">=", cutoff_date)
            .order_by("date", direction=firestore.Query.DESCENDING)
        )
        
        docs = await query.get()
        
        return [
            WeightEntry(
                date=doc.get("date"),
                weight=doc.get("weight"),
                body_fat=doc.get("body_fat"),
                muscle_mass=doc.get("muscle_mass")
            )
            for doc in docs
        ]
    
    async def _get_food_history(self, user_id: str, days: int) -> List[FoodEntry]:
        """Get food tracking history"""
        
        cutoff_date = datetime.utcnow() - timedelta(days=days)
        
        query = (
            self.db.collection("users")
            .document(user_id)
            .collection("food_entries")
            .where("date", ">=", cutoff_date)
            .order_by("date", direction=firestore.Query.DESCENDING)
        )
        
        docs = await query.get()
        
        return [
            FoodEntry(
                date=doc.get("date"),
                meal_type=doc.get("meal_type"),
                foods=doc.get("foods", []),
                total_calories=doc.get("total_calories"),
                macros=doc.get("macros", {})
            )
            for doc in docs
        ]
    
    async def _calculate_adherence(self, user_id: str, days: int) -> Dict:
        """Calculate adherence metrics"""
        
        # Get planned vs actual data
        planned_data = await self._get_planned_data(user_id, days)
        actual_data = await self._get_actual_data(user_id, days)
        
        # Calculate adherence percentages
        calorie_adherence = self._calculate_calorie_adherence(planned_data, actual_data)
        macro_adherence = self._calculate_macro_adherence(planned_data, actual_data)
        meal_timing_adherence = self._calculate_timing_adherence(planned_data, actual_data)
        
        return {
            "calorie_adherence": calorie_adherence,
            "macro_adherence": macro_adherence,
            "meal_timing_adherence": meal_timing_adherence,
            "overall_adherence": (calorie_adherence + macro_adherence + meal_timing_adherence) / 3
        }
    
    def _calculate_calorie_adherence(self, planned: Dict, actual: Dict) -> float:
        """Calculate calorie adherence percentage"""
        
        if not planned or not actual:
            return 0.0
        
        planned_calories = planned.get("daily_calories", 0)
        actual_calories = actual.get("average_calories", 0)
        
        if planned_calories == 0:
            return 0.0
        
        # Calculate how close actual is to planned (within 10% is 100%)
        difference = abs(actual_calories - planned_calories) / planned_calories
        
        if difference <= 0.1:  # Within 10%
            return 100.0
        elif difference <= 0.2:  # Within 20%
            return 100.0 - (difference - 0.1) * 500  # Linear decrease
        else:
            return max(0.0, 50.0 - (difference - 0.2) * 100)
```

**services/progress_analyzer.py**
```python
import numpy as np
from typing import Dict, List, Tuple
from datetime import datetime, timedelta
from ..models.progress import ProgressTrend, PlateauDetection

class ProgressAnalyzer:
    def __init__(self):
        self.plateau_threshold_days = 14  # 2 weeks
        self.trend_analysis_days = 30     # 1 month
    
    async def analyze_progress(self, user_metrics: UserMetrics) -> Dict:
        """Comprehensive progress analysis"""
        
        # Weight trend analysis
        weight_trend = self._analyze_weight_trend(user_metrics.weight_history)
        
        # Plateau detection
        plateau_status = self._detect_plateau(user_metrics.weight_history)
        
        # Adherence analysis
        adherence_trend = self._analyze_adherence_trend(user_metrics.adherence_metrics)
        
        # Performance prediction
        predicted_progress = self._predict_future_progress(user_metrics)
        
        return {
            "weight_trend": weight_trend,
            "plateau_status": plateau_status,
            "adherence_trend": adherence_trend,
            "predicted_progress": predicted_progress,
            "recommendations": self._generate_recommendations(
                weight_trend, plateau_status, adherence_trend
            )
        }
    
    def _analyze_weight_trend(self, weight_history: List[WeightEntry]) -> Dict:
        """Analyze weight change trend"""
        
        if len(weight_history) < 3:
            return {"trend": "insufficient_data", "rate": 0.0}
        
        # Sort by date
        sorted_weights = sorted(weight_history, key=lambda x: x.date)
        
        # Extract weights and dates
        weights = [entry.weight for entry in sorted_weights]
        dates = [(entry.date - sorted_weights[0].date).days for entry in sorted_weights]
        
        # Linear regression to find trend
        slope, intercept = np.polyfit(dates, weights, 1)
        
        # Calculate weekly rate
        weekly_rate = slope * 7
        
        # Determine trend direction
        if abs(weekly_rate) < 0.1:
            trend = "stable"
        elif weekly_rate > 0:
            trend = "gaining"
        else:
            trend = "losing"
        
        # Calculate R-squared for trend strength
        y_pred = np.array(dates) * slope + intercept
        ss_res = np.sum((weights - y_pred) ** 2)
        ss_tot = np.sum((weights - np.mean(weights)) ** 2)
        r_squared = 1 - (ss_res / ss_tot) if ss_tot != 0 else 0
        
        return {
            "trend": trend,
            "weekly_rate": round(weekly_rate, 2),
            "strength": round(r_squared, 2),
            "consistency": self._calculate_consistency(weights)
        }
    
    def _detect_plateau(self, weight_history: List[WeightEntry]) -> Dict:
        """Detect if user has hit a plateau"""
        
        if len(weight_history) < self.plateau_threshold_days:
            return {"plateau": False, "duration": 0}
        
        # Get recent weights (last 14 days)
        recent_weights = sorted(weight_history, key=lambda x: x.date)[-14:]
        weights = [entry.weight for entry in recent_weights]
        
        # Check if weight has been stable (< 0.5kg change)
        weight_range = max(weights) - min(weights)
        
        if weight_range < 0.5:
            # Calculate plateau duration
            plateau_start = self._find_plateau_start(weight_history)
            duration = (datetime.utcnow() - plateau_start).days
            
            return {
                "plateau": True,
                "duration": duration,
                "severity": "high" if duration > 21 else "medium"
            }
        
        return {"plateau": False, "duration": 0}
    
    def _predict_future_progress(self, user_metrics: UserMetrics) -> Dict:
        """Predict future progress based on current trends"""
        
        weight_trend = self._analyze_weight_trend(user_metrics.weight_history)
        adherence = user_metrics.adherence_metrics.get("overall_adherence", 0)
        
        # Simple prediction model
        weekly_rate = weight_trend.get("weekly_rate", 0)
        
        # Adjust prediction based on adherence
        adherence_factor = adherence / 100.0
        predicted_rate = weekly_rate * adherence_factor
        
        # Predict weight in 4 weeks
        current_weight = user_metrics.weight_history[0].weight if user_metrics.weight_history else 0
        predicted_weight = current_weight + (predicted_rate * 4)
        
        return {
            "predicted_4_week_weight": round(predicted_weight, 1),
            "predicted_weekly_rate": round(predicted_rate, 2),
            "confidence": round(adherence_factor * weight_trend.get("strength", 0), 2)
        }
    
    def _generate_recommendations(
        self, 
        weight_trend: Dict, 
        plateau_status: Dict, 
        adherence_trend: Dict
    ) -> List[str]:
        """Generate actionable recommendations"""
        
        recommendations = []
        
        # Plateau recommendations
        if plateau_status.get("plateau"):
            duration = plateau_status.get("duration", 0)
            if duration > 21:
                recommendations.append("Considere um refeed day ou break diet de 1-2 semanas")
            elif duration > 14:
                recommendations.append("Reduza calorias em 100-150 ou aumente atividade física")
            else:
                recommendations.append("Continue o plano atual, plateaus curtos são normais")
        
        # Adherence recommendations
        adherence = adherence_trend.get("overall_adherence", 0)
        if adherence < 70:
            recommendations.append("Foque em melhorar a aderência ao plano nutricional")
        elif adherence < 85:
            recommendations.append("Boa aderência! Pequenos ajustes podem otimizar resultados")
        
        # Trend recommendations
        trend = weight_trend.get("trend")
        rate = weight_trend.get("weekly_rate", 0)
        
        if trend == "losing" and rate < -1.0:
            recommendations.append("Perda de peso muito rápida. Considere aumentar calorias")
        elif trend == "gaining" and rate > 0.5:
            recommendations.append("Ganho de peso acima do esperado. Revise o plano")
        
        return recommendations
```

#### **2. Algoritmos de Rebalanceamento (Dia 12)**

**services/rebalancing_engine.py**
```python
from typing import Dict, List, Optional
from datetime import datetime
from ..models.adjustments import CalorieAdjustment, MacroAdjustment
from .progress_analyzer import ProgressAnalyzer

class RebalancingEngine:
    def __init__(self):
        self.progress_analyzer = ProgressAnalyzer()
        self.max_calorie_adjustment = 300  # Max calories to adjust at once
        self.adjustment_frequency_days = 7  # Minimum days between adjustments
    
    async def calculate_adjustments(
        self, 
        user_id: str, 
        user_metrics: UserMetrics,
        current_plan: Dict
    ) -> Dict:
        """Calculate necessary adjustments to user's plan"""
        
        # Analyze current progress
        progress_analysis = await self.progress_analyzer.analyze_progress(user_metrics)
        
        # Check if adjustment is needed
        if not self._should_adjust(progress_analysis, user_metrics):
            return {"adjustments_needed": False, "reason": "No adjustment needed"}
        
        # Calculate calorie adjustments
        calorie_adjustment = self._calculate_calorie_adjustment(
            progress_analysis, 
            current_plan,
            user_metrics
        )
        
        # Calculate macro adjustments
        macro_adjustments = self._calculate_macro_adjustments(
            calorie_adjustment,
            current_plan,
            user_metrics
        )
        
        # Generate adjustment plan
        adjustment_plan = {
            "adjustments_needed": True,
            "calorie_adjustment": calorie_adjustment,
            "macro_adjustments": macro_adjustments,
            "reasoning": self._generate_adjustment_reasoning(progress_analysis),
            "implementation_date": datetime.utcnow(),
            "next_review_date": datetime.utcnow() + timedelta(days=7)
        }
        
        return adjustment_plan
    
    def _should_adjust(self, progress_analysis: Dict, user_metrics: UserMetrics) -> bool:
        """Determine if adjustments are needed"""
        
        # Check for plateau
        if progress_analysis["plateau_status"].get("plateau"):
            plateau_duration = progress_analysis["plateau_status"].get("duration", 0)
            if plateau_duration >= 14:  # 2 weeks plateau
                return True
        
        # Check adherence
        adherence = user_metrics.adherence_metrics.get("overall_adherence", 0)
        if adherence < 60:  # Very low adherence
            return True
        
        # Check weight trend
        weight_trend = progress_analysis["weight_trend"]
        weekly_rate = weight_trend.get("weekly_rate", 0)
        
        # Too fast weight loss
        if weekly_rate < -1.2:
            return True
        
        # No progress for goal
        if abs(weekly_rate) < 0.1 and not progress_analysis["plateau_status"].get("plateau"):
            return True
        
        return False
    
    def _calculate_calorie_adjustment(
        self, 
        progress_analysis: Dict, 
        current_plan: Dict,
        user_metrics: UserMetrics
    ) -> CalorieAdjustment:
        """Calculate calorie adjustment needed"""
        
        current_calories = current_plan.get("daily_calories", 2000)
        adjustment_amount = 0
        reason = ""
        
        # Plateau handling
        if progress_analysis["plateau_status"].get("plateau"):
            plateau_duration = progress_analysis["plateau_status"].get("duration", 0)
            
            if plateau_duration >= 21:  # 3 weeks
                adjustment_amount = -200
                reason = "Plateau de 3+ semanas - redução significativa"
            elif plateau_duration >= 14:  # 2 weeks
                adjustment_amount = -150
                reason = "Plateau de 2+ semanas - redução moderada"
        
        # Weight trend adjustments
        weight_trend = progress_analysis["weight_trend"]
        weekly_rate = weight_trend.get("weekly_rate", 0)
        
        if weekly_rate < -1.2:  # Too fast weight loss
            adjustment_amount = 150
            reason = "Perda de peso muito rápida - aumento de calorias"
        elif weekly_rate > 0.3:  # Unexpected weight gain
            adjustment_amount = -100
            reason = "Ganho de peso inesperado - redução de calorias"
        
        # Adherence-based adjustments
        adherence = user_metrics.adherence_metrics.get("overall_adherence", 0)
        if adherence < 60:
            # Increase calories to improve adherence
            adjustment_amount = 100
            reason = "Baixa aderência - aumento para melhorar sustentabilidade"
        
        # Cap adjustment amount
        adjustment_amount = max(-self.max_calorie_adjustment, 
                              min(self.max_calorie_adjustment, adjustment_amount))
        
        return CalorieAdjustment(
            current_calories=current_calories,
            adjustment_amount=adjustment_amount,
            new_calories=current_calories + adjustment_amount,
            reason=reason,
            confidence=self._calculate_adjustment_confidence(progress_analysis)
        )
    
    def _calculate_macro_adjustments(
        self,
        calorie_adjustment: CalorieAdjustment,
        current_plan: Dict,
        user_metrics: UserMetrics
    ) -> Dict:
        """Calculate macro adjustments based on calorie changes"""
        
        new_calories = calorie_adjustment.new_calories
        current_macros = current_plan.get("macros", {})
        
        # Maintain protein (priority)
        protein_grams = current_macros.get("protein", {}).get("grams", 0)
        protein_calories = protein_grams * 4
        
        # Adjust fat and carbs proportionally
        remaining_calories = new_calories - protein_calories
        
        # Current fat and carb percentages
        current_fat_cal = current_macros.get("fat", {}).get("calories", 0)
        current_carb_cal = current_macros.get("carbohydrates", {}).get("calories", 0)
        current_non_protein = current_fat_cal + current_carb_cal
        
        if current_non_protein > 0:
            fat_ratio = current_fat_cal / current_non_protein
            carb_ratio = current_carb_cal / current_non_protein
        else:
            fat_ratio = 0.3
            carb_ratio = 0.7
        
        # Calculate new macros
        new_fat_calories = remaining_calories * fat_ratio
        new_carb_calories = remaining_calories * carb_ratio
        
        new_fat_grams = new_fat_calories / 9
        new_carb_grams = new_carb_calories / 4
        
        return {
            "protein": {
                "grams": round(protein_grams, 1),
                "calories": round(protein_calories),
                "change": 0
            },
            "fat": {
                "grams": round(new_fat_grams, 1),
                "calories": round(new_fat_calories),
                "change": round(new_fat_grams - current_macros.get("fat", {}).get("grams", 0), 1)
            },
            "carbohydrates": {
                "grams": round(new_carb_grams, 1),
                "calories": round(new_carb_calories),
                "change": round(new_carb_grams - current_macros.get("carbohydrates", {}).get("grams", 0), 1)
            }
        }
```

#### **3. Monitoramento Contínuo (Dia 13)**

**services/monitoring_service.py**
```python
from google.cloud import tasks_v2
from google.cloud import monitoring_v3
from typing import Dict, List
import json
from datetime import datetime, timedelta

class MonitoringService:
    def __init__(self):
        self.tasks_client = tasks_v2.CloudTasksClient()
        self.monitoring_client = monitoring_v3.MetricServiceClient()
        self.project_id = "evolveyou-prod"
        self.queue_path = self.tasks_client.queue_path(
            self.project_id, 
            "southamerica-east1", 
            "fulltime-queue"
        )
    
    async def schedule_user_monitoring(self, user_id: str, frequency_hours: int = 24):
        """Schedule continuous monitoring for user"""
        
        # Create recurring task for user monitoring
        task = {
            "http_request": {
                "http_method": tasks_v2.HttpMethod.POST,
                "url": f"https://fulltime-service-{self.project_id}.run.app/monitor/user",
                "headers": {"Content-Type": "application/json"},
                "body": json.dumps({
                    "user_id": user_id,
                    "timestamp": datetime.utcnow().isoformat()
                }).encode()
            },
            "schedule_time": datetime.utcnow() + timedelta(hours=frequency_hours)
        }
        
        response = self.tasks_client.create_task(
            parent=self.queue_path,
            task=task
        )
        
        return response.name
    
    async def collect_system_metrics(self) -> Dict:
        """Collect system-wide metrics"""
        
        metrics = {
            "active_users": await self._count_active_users(),
            "adjustments_made": await self._count_recent_adjustments(),
            "average_adherence": await self._calculate_average_adherence(),
            "plateau_users": await self._count_plateau_users(),
            "system_performance": await self._get_system_performance()
        }
        
        # Log metrics to Cloud Monitoring
        await self._log_metrics_to_cloud(metrics)
        
        return metrics
    
    async def _count_active_users(self) -> int:
        """Count users active in last 7 days"""
        
        cutoff_date = datetime.utcnow() - timedelta(days=7)
        
        query = (
            self.db.collection("users")
            .where("last_activity", ">=", cutoff_date)
        )
        
        docs = await query.get()
        return len(docs)
    
    async def _count_recent_adjustments(self) -> int:
        """Count adjustments made in last 24 hours"""
        
        cutoff_date = datetime.utcnow() - timedelta(hours=24)
        
        query = (
            self.db.collection("adjustments")
            .where("created_at", ">=", cutoff_date)
        )
        
        docs = await query.get()
        return len(docs)
    
    async def _log_metrics_to_cloud(self, metrics: Dict):
        """Log metrics to Google Cloud Monitoring"""
        
        project_name = f"projects/{self.project_id}"
        
        for metric_name, value in metrics.items():
            if isinstance(value, (int, float)):
                series = monitoring_v3.TimeSeries()
                series.metric.type = f"custom.googleapis.com/evolveyou/{metric_name}"
                series.resource.type = "global"
                
                point = monitoring_v3.Point()
                point.value.double_value = float(value)
                point.interval.end_time.seconds = int(datetime.utcnow().timestamp())
                
                series.points = [point]
                
                self.monitoring_client.create_time_series(
                    name=project_name,
                    time_series=[series]
                )
```

#### **4. Notificações Inteligentes (Dia 14)**

**services/notification_service.py**
```python
from firebase_admin import messaging
from typing import Dict, List, Optional
from datetime import datetime, timedelta
from ..models.notifications import NotificationTemplate, NotificationTrigger

class NotificationService:
    def __init__(self):
        self.notification_templates = self._load_templates()
        self.user_preferences = {}
    
    async def send_adjustment_notification(
        self, 
        user_id: str, 
        adjustment_data: Dict
    ):
        """Send notification about plan adjustments"""
        
        # Get user's FCM token
        fcm_token = await self._get_user_fcm_token(user_id)
        if not fcm_token:
            return
        
        # Generate notification content
        notification_content = self._generate_adjustment_notification(adjustment_data)
        
        # Send notification
        message = messaging.Message(
            notification=messaging.Notification(
                title=notification_content["title"],
                body=notification_content["body"]
            ),
            data={
                "type": "plan_adjustment",
                "adjustment_id": adjustment_data.get("id"),
                "user_id": user_id
            },
            token=fcm_token
        )
        
        response = messaging.send(message)
        
        # Log notification
        await self._log_notification(user_id, "plan_adjustment", notification_content)
        
        return response
    
    async def send_progress_update(self, user_id: str, progress_data: Dict):
        """Send progress update notification"""
        
        fcm_token = await self._get_user_fcm_token(user_id)
        if not fcm_token:
            return
        
        # Check if user wants progress notifications
        if not await self._user_wants_notification(user_id, "progress_updates"):
            return
        
        notification_content = self._generate_progress_notification(progress_data)
        
        message = messaging.Message(
            notification=messaging.Notification(
                title=notification_content["title"],
                body=notification_content["body"]
            ),
            data={
                "type": "progress_update",
                "user_id": user_id
            },
            token=fcm_token
        )
        
        response = messaging.send(message)
        await self._log_notification(user_id, "progress_update", notification_content)
        
        return response
    
    async def send_plateau_alert(self, user_id: str, plateau_data: Dict):
        """Send plateau detection alert"""
        
        fcm_token = await self._get_user_fcm_token(user_id)
        if not fcm_token:
            return
        
        duration = plateau_data.get("duration", 0)
        severity = plateau_data.get("severity", "medium")
        
        if severity == "high":
            title = "🔄 Plateau Detectado - Ação Necessária"
            body = f"Seu peso está estável há {duration} dias. Vamos ajustar seu plano!"
        else:
            title = "📊 Progresso Monitorado"
            body = f"Detectamos estabilidade no peso ({duration} dias). Continue firme!"
        
        message = messaging.Message(
            notification=messaging.Notification(title=title, body=body),
            data={
                "type": "plateau_alert",
                "severity": severity,
                "duration": str(duration),
                "user_id": user_id
            },
            token=fcm_token
        )
        
        response = messaging.send(message)
        await self._log_notification(user_id, "plateau_alert", {"title": title, "body": body})
        
        return response
    
    def _generate_adjustment_notification(self, adjustment_data: Dict) -> Dict:
        """Generate notification content for adjustments"""
        
        calorie_change = adjustment_data.get("calorie_adjustment", {}).get("adjustment_amount", 0)
        reason = adjustment_data.get("calorie_adjustment", {}).get("reason", "")
        
        if calorie_change > 0:
            title = "📈 Plano Atualizado - Mais Calorias"
            body = f"Aumentamos suas calorias em {calorie_change}. {reason}"
        elif calorie_change < 0:
            title = "📉 Plano Atualizado - Menos Calorias"
            body = f"Reduzimos suas calorias em {abs(calorie_change)}. {reason}"
        else:
            title = "🔄 Plano Revisado"
            body = "Fizemos pequenos ajustes no seu plano para otimizar resultados."
        
        return {"title": title, "body": body}
    
    def _generate_progress_notification(self, progress_data: Dict) -> Dict:
        """Generate progress notification content"""
        
        weight_trend = progress_data.get("weight_trend", {})
        weekly_rate = weight_trend.get("weekly_rate", 0)
        trend = weight_trend.get("trend", "stable")
        
        if trend == "losing" and weekly_rate < -0.3:
            title = "🎉 Ótimo Progresso!"
            body = f"Você está perdendo {abs(weekly_rate):.1f}kg por semana. Continue assim!"
        elif trend == "gaining" and weekly_rate > 0.2:
            title = "💪 Ganho de Peso"
            body = f"Ganho de {weekly_rate:.1f}kg/semana. Acompanhando seu objetivo!"
        else:
            title = "📊 Progresso Estável"
            body = "Seu peso está estável. Vamos continuar monitorando."
        
        return {"title": title, "body": body}
    
    async def _user_wants_notification(self, user_id: str, notification_type: str) -> bool:
        """Check if user wants specific notification type"""
        
        user_prefs = await self._get_user_preferences(user_id)
        return user_prefs.get(notification_type, True)  # Default to True
    
    async def _log_notification(self, user_id: str, type: str, content: Dict):
        """Log notification to database"""
        
        await self.db.collection("notifications").add({
            "user_id": user_id,
            "type": type,
            "content": content,
            "sent_at": datetime.utcnow(),
            "status": "sent"
        })
```

### 🧪 TESTES

#### **Testes de Rebalanceamento**

```python
# tests/test_rebalancing.py
import pytest
from unittest.mock import Mock
from src.services.rebalancing_engine import RebalancingEngine
from src.models.user_metrics import UserMetrics, WeightEntry

@pytest.fixture
def rebalancing_engine():
    return RebalancingEngine()

@pytest.mark.asyncio
async def test_plateau_detection_triggers_adjustment(rebalancing_engine):
    """Test that plateau detection triggers calorie adjustment"""
    
    # Create mock data showing plateau
    weight_history = [
        WeightEntry(date=datetime.utcnow() - timedelta(days=i), weight=80.0)
        for i in range(21)  # 21 days of same weight
    ]
    
    user_metrics = UserMetrics(
        user_id="test_user",
        weight_history=weight_history,
        adherence_metrics={"overall_adherence": 85}
    )
    
    current_plan = {"daily_calories": 2000}
    
    adjustments = await rebalancing_engine.calculate_adjustments(
        "test_user", user_metrics, current_plan
    )
    
    assert adjustments["adjustments_needed"] == True
    assert adjustments["calorie_adjustment"].adjustment_amount < 0  # Should reduce calories

@pytest.mark.asyncio
async def test_low_adherence_increases_calories(rebalancing_engine):
    """Test that low adherence triggers calorie increase"""
    
    user_metrics = UserMetrics(
        user_id="test_user",
        weight_history=[],
        adherence_metrics={"overall_adherence": 50}  # Very low adherence
    )
    
    current_plan = {"daily_calories": 1500}
    
    adjustments = await rebalancing_engine.calculate_adjustments(
        "test_user", user_metrics, current_plan
    )
    
    assert adjustments["adjustments_needed"] == True
    assert adjustments["calorie_adjustment"].adjustment_amount > 0  # Should increase calories
```

---

## 📱 INTEGRAÇÃO FRONTEND

### 📖 VISÃO GERAL

A Integração Frontend conecta o aplicativo Flutter com todos os serviços backend, transformando as telas mockup em funcionalidades reais com dados em tempo real.

### 🎯 OBJETIVOS

- Conectar Flutter com Firebase e APIs
- Implementar autenticação completa
- Criar fluxo de dados em tempo real
- Desenvolver interface responsiva
- Garantir experiência fluida offline-first

### 🏗️ ARQUITETURA TÉCNICA

#### **Componentes Principais**

```
Flutter App
├── Authentication Layer (Firebase Auth)
├── Data Layer (Repository Pattern)
├── State Management (Riverpod)
├── Network Layer (Dio + Retrofit)
├── Local Storage (Hive)
├── Real-time Updates (WebSocket)
└── Offline Support (Cache Strategy)
```

#### **Stack Tecnológico**
- **Framework**: Flutter 3.16+
- **State Management**: Riverpod
- **HTTP Client**: Dio
- **Local Storage**: Hive
- **Authentication**: Firebase Auth
- **Real-time**: WebSocket + Stream
- **Navigation**: Go Router

### 📁 ESTRUTURA DE ARQUIVOS

```
frontend/
├── lib/
│   ├── main.dart                    # App entry point
│   ├── core/
│   │   ├── config/
│   │   │   ├── app_config.dart     # App configuration
│   │   │   └── firebase_config.dart # Firebase setup
│   │   ├── network/
│   │   │   ├── api_client.dart     # HTTP client
│   │   │   ├── interceptors.dart   # Request/response interceptors
│   │   │   └── endpoints.dart      # API endpoints
│   │   ├── storage/
│   │   │   ├── local_storage.dart  # Local storage interface
│   │   │   └── cache_manager.dart  # Cache management
│   │   └── utils/
│   │       ├── constants.dart      # App constants
│   │       ├── validators.dart     # Input validators
│   │       └── formatters.dart     # Data formatters
│   ├── data/
│   │   ├── models/                 # Data models
│   │   ├── repositories/           # Repository implementations
│   │   ├── datasources/           # Data sources (remote/local)
│   │   └── mappers/               # Data mappers
│   ├── domain/
│   │   ├── entities/              # Domain entities
│   │   ├── repositories/          # Repository interfaces
│   │   └── usecases/             # Business logic
│   ├── presentation/
│   │   ├── screens/              # App screens
│   │   ├── widgets/              # Reusable widgets
│   │   ├── providers/            # Riverpod providers
│   │   └── theme/               # App theme
│   └── services/
│       ├── auth_service.dart     # Authentication service
│       ├── notification_service.dart # Push notifications
│       └── sync_service.dart     # Data synchronization
```

### 🔧 IMPLEMENTAÇÃO DETALHADA

#### **1. Configuração Firebase (Dia 16)**

**core/config/firebase_config.dart**
```dart
import 'package:firebase_core/firebase_core.dart';
import 'package:firebase_auth/firebase_auth.dart';
import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:firebase_storage/firebase_storage.dart';
import 'package:firebase_messaging/firebase_messaging.dart';

class FirebaseConfig {
  static FirebaseAuth get auth => FirebaseAuth.instance;
  static FirebaseFirestore get firestore => FirebaseFirestore.instance;
  static FirebaseStorage get storage => FirebaseStorage.instance;
  static FirebaseMessaging get messaging => FirebaseMessaging.instance;
  
  static Future<void> initialize() async {
    await Firebase.initializeApp();
    
    // Configure Firestore settings
    firestore.settings = const Settings(
      persistenceEnabled: true,
      cacheSizeBytes: Settings.CACHE_SIZE_UNLIMITED,
    );
    
    // Configure messaging
    await _configureMessaging();
  }
  
  static Future<void> _configureMessaging() async {
    // Request permission for notifications
    NotificationSettings settings = await messaging.requestPermission(
      alert: true,
      badge: true,
      sound: true,
    );
    
    if (settings.authorizationStatus == AuthorizationStatus.authorized) {
      print('User granted permission');
      
      // Get FCM token
      String? token = await messaging.getToken();
      print('FCM Token: $token');
      
      // Handle foreground messages
      FirebaseMessaging.onMessage.listen((RemoteMessage message) {
        print('Got a message whilst in the foreground!');
        print('Message data: ${message.data}');
        
        if (message.notification != null) {
          print('Message also contained a notification: ${message.notification}');
        }
      });
    }
  }
}
```

**core/network/api_client.dart**
```dart
import 'package:dio/dio.dart';
import 'package:firebase_auth/firebase_auth.dart';
import 'interceptors.dart';

class ApiClient {
  late final Dio _dio;
  
  static const String baseUrl = 'https://content-service-278319877545.southamerica-east1.run.app';
  
  ApiClient() {
    _dio = Dio(BaseOptions(
      baseUrl: baseUrl,
      connectTimeout: const Duration(seconds: 30),
      receiveTimeout: const Duration(seconds: 30),
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
    ));
    
    _dio.interceptors.addAll([
      AuthInterceptor(),
      LoggingInterceptor(),
      ErrorInterceptor(),
    ]);
  }
  
  // GET request
  Future<Response<T>> get<T>(
    String path, {
    Map<String, dynamic>? queryParameters,
    Options? options,
  }) async {
    return await _dio.get<T>(
      path,
      queryParameters: queryParameters,
      options: options,
    );
  }
  
  // POST request
  Future<Response<T>> post<T>(
    String path, {
    dynamic data,
    Map<String, dynamic>? queryParameters,
    Options? options,
  }) async {
    return await _dio.post<T>(
      path,
      data: data,
      queryParameters: queryParameters,
      options: options,
    );
  }
  
  // PUT request
  Future<Response<T>> put<T>(
    String path, {
    dynamic data,
    Map<String, dynamic>? queryParameters,
    Options? options,
  }) async {
    return await _dio.put<T>(
      path,
      data: data,
      queryParameters: queryParameters,
      options: options,
    );
  }
  
  // DELETE request
  Future<Response<T>> delete<T>(
    String path, {
    dynamic data,
    Map<String, dynamic>? queryParameters,
    Options? options,
  }) async {
    return await _dio.delete<T>(
      path,
      data: data,
      queryParameters: queryParameters,
      options: options,
    );
  }
}

class AuthInterceptor extends Interceptor {
  @override
  void onRequest(RequestOptions options, RequestInterceptorHandler handler) async {
    // Add Firebase Auth token to requests
    final user = FirebaseAuth.instance.currentUser;
    if (user != null) {
      final token = await user.getIdToken();
      options.headers['Authorization'] = 'Bearer $token';
    }
    
    handler.next(options);
  }
}
```

#### **2. Serviços de API (Dia 17)**

**data/repositories/user_repository.dart**
```dart
import 'package:cloud_firestore/cloud_firestore.dart';
import '../../domain/entities/user_entity.dart';
import '../../domain/repositories/user_repository.dart';
import '../models/user_model.dart';
import '../datasources/user_remote_datasource.dart';
import '../datasources/user_local_datasource.dart';

class UserRepositoryImpl implements UserRepository {
  final UserRemoteDataSource remoteDataSource;
  final UserLocalDataSource localDataSource;
  
  UserRepositoryImpl({
    required this.remoteDataSource,
    required this.localDataSource,
  });
  
  @override
  Future<UserEntity?> getCurrentUser() async {
    try {
      // Try to get from cache first
      final cachedUser = await localDataSource.getCachedUser();
      if (cachedUser != null) {
        return cachedUser.toEntity();
      }
      
      // Fetch from remote
      final remoteUser = await remoteDataSource.getCurrentUser();
      if (remoteUser != null) {
        // Cache the user
        await localDataSource.cacheUser(remoteUser);
        return remoteUser.toEntity();
      }
      
      return null;
    } catch (e) {
      print('Error getting current user: $e');
      return null;
    }
  }
  
  @override
  Future<void> updateUserProfile(UserEntity user) async {
    try {
      final userModel = UserModel.fromEntity(user);
      
      // Update remote
      await remoteDataSource.updateUser(userModel);
      
      // Update cache
      await localDataSource.cacheUser(userModel);
    } catch (e) {
      print('Error updating user profile: $e');
      rethrow;
    }
  }
  
  @override
  Future<void> saveAnamneseAnswers(Map<String, dynamic> answers) async {
    try {
      await remoteDataSource.saveAnamneseAnswers(answers);
    } catch (e) {
      print('Error saving anamnese answers: $e');
      rethrow;
    }
  }
  
  @override
  Stream<UserEntity?> watchUser(String userId) {
    return remoteDataSource.watchUser(userId).map(
      (userModel) => userModel?.toEntity(),
    );
  }
}

// Data source implementations
class UserRemoteDataSource {
  final FirebaseFirestore firestore;
  
  UserRemoteDataSource({required this.firestore});
  
  Future<UserModel?> getCurrentUser() async {
    final user = FirebaseAuth.instance.currentUser;
    if (user == null) return null;
    
    final doc = await firestore.collection('users').doc(user.uid).get();
    
    if (doc.exists) {
      return UserModel.fromFirestore(doc);
    }
    
    return null;
  }
  
  Future<void> updateUser(UserModel user) async {
    await firestore.collection('users').doc(user.id).set(
      user.toFirestore(),
      SetOptions(merge: true),
    );
  }
  
  Future<void> saveAnamneseAnswers(Map<String, dynamic> answers) async {
    final user = FirebaseAuth.instance.currentUser;
    if (user == null) throw Exception('User not authenticated');
    
    await firestore.collection('users').doc(user.uid).update({
      'anamnese_answers': answers,
      'anamnese_completed': true,
      'updated_at': FieldValue.serverTimestamp(),
    });
  }
  
  Stream<UserModel?> watchUser(String userId) {
    return firestore.collection('users').doc(userId).snapshots().map(
      (doc) => doc.exists ? UserModel.fromFirestore(doc) : null,
    );
  }
}
```

#### **3. Telas de Autenticação (Dia 18)**

**presentation/screens/auth/login_screen.dart**
```dart
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../providers/auth_provider.dart';
import '../../widgets/custom_button.dart';
import '../../widgets/custom_text_field.dart';

class LoginScreen extends ConsumerStatefulWidget {
  const LoginScreen({Key? key}) : super(key: key);
  
  @override
  ConsumerState<LoginScreen> createState() => _LoginScreenState();
}

class _LoginScreenState extends ConsumerState<LoginScreen> {
  final _formKey = GlobalKey<FormState>();
  final _emailController = TextEditingController();
  final _passwordController = TextEditingController();
  bool _isLoading = false;
  
  @override
  void dispose() {
    _emailController.dispose();
    _passwordController.dispose();
    super.dispose();
  }
  
  Future<void> _handleEmailLogin() async {
    if (!_formKey.currentState!.validate()) return;
    
    setState(() => _isLoading = true);
    
    try {
      await ref.read(authProvider.notifier).signInWithEmail(
        _emailController.text.trim(),
        _passwordController.text,
      );
      
      if (mounted) {
        context.go('/dashboard');
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Erro no login: ${e.toString()}'),
            backgroundColor: Colors.red,
          ),
        );
      }
    } finally {
      if (mounted) {
        setState(() => _isLoading = false);
      }
    }
  }
  
  Future<void> _handleGoogleLogin() async {
    setState(() => _isLoading = true);
    
    try {
      await ref.read(authProvider.notifier).signInWithGoogle();
      
      if (mounted) {
        context.go('/dashboard');
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Erro no login com Google: ${e.toString()}'),
            backgroundColor: Colors.red,
          ),
        );
      }
    } finally {
      if (mounted) {
        setState(() => _isLoading = false);
      }
    }
  }
  
  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: SafeArea(
        child: Padding(
          padding: const EdgeInsets.all(24.0),
          child: Form(
            key: _formKey,
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: [
                // Logo
                Image.asset(
                  'assets/images/logo.png',
                  height: 120,
                ),
                const SizedBox(height: 48),
                
                // Title
                Text(
                  'Bem-vindo ao EvolveYou',
                  style: Theme.of(context).textTheme.headlineMedium?.copyWith(
                    fontWeight: FontWeight.bold,
                  ),
                  textAlign: TextAlign.center,
                ),
                const SizedBox(height: 8),
                
                Text(
                  'Seu coach virtual de nutrição',
                  style: Theme.of(context).textTheme.bodyLarge?.copyWith(
                    color: Colors.grey[600],
                  ),
                  textAlign: TextAlign.center,
                ),
                const SizedBox(height: 32),
                
                // Email field
                CustomTextField(
                  controller: _emailController,
                  label: 'E-mail',
                  keyboardType: TextInputType.emailAddress,
                  validator: (value) {
                    if (value == null || value.isEmpty) {
                      return 'Digite seu e-mail';
                    }
                    if (!RegExp(r'^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$').hasMatch(value)) {
                      return 'Digite um e-mail válido';
                    }
                    return null;
                  },
                ),
                const SizedBox(height: 16),
                
                // Password field
                CustomTextField(
                  controller: _passwordController,
                  label: 'Senha',
                  obscureText: true,
                  validator: (value) {
                    if (value == null || value.isEmpty) {
                      return 'Digite sua senha';
                    }
                    if (value.length < 6) {
                      return 'Senha deve ter pelo menos 6 caracteres';
                    }
                    return null;
                  },
                ),
                const SizedBox(height: 24),
                
                // Login button
                CustomButton(
                  text: 'Entrar',
                  onPressed: _isLoading ? null : _handleEmailLogin,
                  isLoading: _isLoading,
                ),
                const SizedBox(height: 16),
                
                // Divider
                Row(
                  children: [
                    const Expanded(child: Divider()),
                    Padding(
                      padding: const EdgeInsets.symmetric(horizontal: 16),
                      child: Text(
                        'ou',
                        style: TextStyle(color: Colors.grey[600]),
                      ),
                    ),
                    const Expanded(child: Divider()),
                  ],
                ),
                const SizedBox(height: 16),
                
                // Google login button
                CustomButton(
                  text: 'Continuar com Google',
                  onPressed: _isLoading ? null : _handleGoogleLogin,
                  variant: ButtonVariant.outlined,
                  icon: Image.asset(
                    'assets/images/google_logo.png',
                    height: 20,
                  ),
                ),
                const SizedBox(height: 24),
                
                // Register link
                Row(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    Text(
                      'Não tem conta? ',
                      style: TextStyle(color: Colors.grey[600]),
                    ),
                    GestureDetector(
                      onTap: () => context.go('/register'),
                      child: Text(
                        'Cadastre-se',
                        style: TextStyle(
                          color: Theme.of(context).primaryColor,
                          fontWeight: FontWeight.w600,
                        ),
                      ),
                    ),
                  ],
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}
```

**presentation/providers/auth_provider.dart**
```dart
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:firebase_auth/firebase_auth.dart';
import 'package:google_sign_in/google_sign_in.dart';
import '../../domain/entities/user_entity.dart';
import '../../services/auth_service.dart';

final authProvider = StateNotifierProvider<AuthNotifier, AuthState>((ref) {
  return AuthNotifier(ref.read(authServiceProvider));
});

final authServiceProvider = Provider<AuthService>((ref) {
  return AuthService();
});

class AuthState {
  final UserEntity? user;
  final bool isLoading;
  final String? error;
  
  const AuthState({
    this.user,
    this.isLoading = false,
    this.error,
  });
  
  AuthState copyWith({
    UserEntity? user,
    bool? isLoading,
    String? error,
  }) {
    return AuthState(
      user: user ?? this.user,
      isLoading: isLoading ?? this.isLoading,
      error: error,
    );
  }
}

class AuthNotifier extends StateNotifier<AuthState> {
  final AuthService _authService;
  
  AuthNotifier(this._authService) : super(const AuthState()) {
    _init();
  }
  
  void _init() {
    // Listen to auth state changes
    FirebaseAuth.instance.authStateChanges().listen((User? user) {
      if (user != null) {
        _loadUserProfile(user.uid);
      } else {
        state = const AuthState();
      }
    });
  }
  
  Future<void> _loadUserProfile(String userId) async {
    try {
      final userEntity = await _authService.getCurrentUser();
      state = state.copyWith(user: userEntity, isLoading: false);
    } catch (e) {
      state = state.copyWith(error: e.toString(), isLoading: false);
    }
  }
  
  Future<void> signInWithEmail(String email, String password) async {
    state = state.copyWith(isLoading: true, error: null);
    
    try {
      await _authService.signInWithEmail(email, password);
      // User will be loaded automatically via auth state listener
    } catch (e) {
      state = state.copyWith(error: e.toString(), isLoading: false);
      rethrow;
    }
  }
  
  Future<void> signInWithGoogle() async {
    state = state.copyWith(isLoading: true, error: null);
    
    try {
      await _authService.signInWithGoogle();
      // User will be loaded automatically via auth state listener
    } catch (e) {
      state = state.copyWith(error: e.toString(), isLoading: false);
      rethrow;
    }
  }
  
  Future<void> signUp(String email, String password, String name) async {
    state = state.copyWith(isLoading: true, error: null);
    
    try {
      await _authService.signUp(email, password, name);
      // User will be loaded automatically via auth state listener
    } catch (e) {
      state = state.copyWith(error: e.toString(), isLoading: false);
      rethrow;
    }
  }
  
  Future<void> signOut() async {
    await _authService.signOut();
    state = const AuthState();
  }
}
```

### 🧪 TESTES

#### **Testes de Widget**

```dart
// test/presentation/screens/login_screen_test.dart
import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:mockito/mockito.dart';
import 'package:evolveyou/presentation/screens/auth/login_screen.dart';

class MockAuthService extends Mock implements AuthService {}

void main() {
  group('LoginScreen', () {
    late MockAuthService mockAuthService;
    
    setUp(() {
      mockAuthService = MockAuthService();
    });
    
    Widget createWidget() {
      return ProviderScope(
        overrides: [
          authServiceProvider.overrideWithValue(mockAuthService),
        ],
        child: MaterialApp(
          home: LoginScreen(),
        ),
      );
    }
    
    testWidgets('should display login form', (WidgetTester tester) async {
      await tester.pumpWidget(createWidget());
      
      expect(find.text('Bem-vindo ao EvolveYou'), findsOneWidget);
      expect(find.text('E-mail'), findsOneWidget);
      expect(find.text('Senha'), findsOneWidget);
      expect(find.text('Entrar'), findsOneWidget);
      expect(find.text('Continuar com Google'), findsOneWidget);
    });
    
    testWidgets('should validate email field', (WidgetTester tester) async {
      await tester.pumpWidget(createWidget());
      
      // Tap login button without entering email
      await tester.tap(find.text('Entrar'));
      await tester.pump();
      
      expect(find.text('Digite seu e-mail'), findsOneWidget);
    });
    
    testWidgets('should call signInWithEmail when form is valid', (WidgetTester tester) async {
      when(mockAuthService.signInWithEmail(any, any))
          .thenAnswer((_) async => {});
      
      await tester.pumpWidget(createWidget());
      
      // Enter valid credentials
      await tester.enterText(find.byType(TextFormField).first, 'test@example.com');
      await tester.enterText(find.byType(TextFormField).last, 'password123');
      
      // Tap login button
      await tester.tap(find.text('Entrar'));
      await tester.pump();
      
      verify(mockAuthService.signInWithEmail('test@example.com', 'password123')).called(1);
    });
  });
}
```

---

*Documentação continua com os demais guias de desenvolvimento...*

