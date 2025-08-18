# SISTEMA DE COLETA DE FEEDBACK E ANALYTICS BETA
## EvolveYou - Monitoramento e Análise de Testes Beta

---

**Autor:** Manus AI  
**Data:** 09 de Agosto de 2025  
**Versão:** 1.0  
**Tipo:** Especificação Técnica - Sistema de Analytics

---

## 1. VISÃO GERAL DO SISTEMA

### 1.1 Objetivos do Sistema
O Sistema de Coleta de Feedback e Analytics Beta foi projetado para capturar, processar e analisar dados quantitativos e qualitativos durante o programa de testes beta do Sistema de Anamnese Inteligente. O sistema implementa múltiplas camadas de coleta de dados, desde métricas técnicas automatizadas até feedback qualitativo estruturado, proporcionando visão 360° da experiência dos usuários beta.

### 1.2 Arquitetura Técnica
O sistema utiliza uma arquitetura baseada em microserviços, integrando-se de forma não intrusiva ao Sistema de Anamnese Inteligente existente. A coleta de dados é realizada através de instrumentação automática, APIs de feedback, e formulários integrados, garantindo que a experiência do usuário não seja comprometida pela coleta de dados.

### 1.3 Componentes Principais
- **Analytics Engine**: Coleta automática de métricas de uso
- **Feedback API**: Endpoints para coleta de feedback estruturado
- **Survey System**: Questionários dinâmicos integrados
- **Data Pipeline**: Processamento e agregação de dados
- **Dashboard Analytics**: Visualização em tempo real
- **Reporting Engine**: Relatórios automatizados

---

## 2. MÉTRICAS TÉCNICAS AUTOMATIZADAS

### 2.1 Métricas de Performance
- **Tempo de resposta por endpoint** (ms)
- **Taxa de erro por funcionalidade** (%)
- **Throughput de requisições** (req/s)
- **Uso de recursos do servidor** (CPU, memória)
- **Latência de rede por região** (ms)
- **Disponibilidade do sistema** (uptime %)

### 2.2 Métricas de Uso
- **Tempo de conclusão da anamnese** (minutos)
- **Taxa de abandono por pergunta** (%)
- **Frequência de acesso ao sistema** (sessões/semana)
- **Duração média das sessões** (minutos)
- **Funcionalidades mais utilizadas** (ranking)
- **Padrões de navegação** (fluxos de tela)

### 2.3 Métricas de Negócio
- **Taxa de conclusão da anamnese** (%)
- **Retenção de usuários** (D1, D7, D30)
- **Engajamento com recomendações** (%)
- **Satisfação geral** (NPS)
- **Intenção de pagamento** (%)
- **Indicação para outros** (%)

---

## 3. IMPLEMENTAÇÃO TÉCNICA

### 3.1 Instrumentação do Sistema Existente
```python
# Middleware de Analytics para FastAPI
from fastapi import Request, Response
import time
import json
from datetime import datetime

class BetaAnalyticsMiddleware:
    def __init__(self, app):
        self.app = app
    
    async def __call__(self, scope, receive, send):
        if scope["type"] == "http":
            request = Request(scope, receive)
            start_time = time.time()
            
            # Capturar dados da requisição
            analytics_data = {
                "timestamp": datetime.utcnow().isoformat(),
                "user_id": self.extract_user_id(request),
                "endpoint": request.url.path,
                "method": request.method,
                "user_agent": request.headers.get("user-agent"),
                "ip_address": request.client.host
            }
            
            # Processar requisição
            response = Response()
            await self.app(scope, receive, send)
            
            # Calcular métricas
            response_time = (time.time() - start_time) * 1000
            analytics_data.update({
                "response_time_ms": response_time,
                "status_code": response.status_code,
                "response_size": len(response.body) if hasattr(response, 'body') else 0
            })
            
            # Enviar para sistema de analytics
            await self.send_analytics(analytics_data)
        
        else:
            await self.app(scope, receive, send)
    
    def extract_user_id(self, request):
        # Extrair user_id do token JWT ou session
        auth_header = request.headers.get("authorization")
        if auth_header:
            # Decodificar JWT e extrair user_id
            pass
        return None
    
    async def send_analytics(self, data):
        # Enviar dados para sistema de analytics
        # Implementar queue assíncrona para não impactar performance
        pass
```

### 3.2 API de Feedback
```python
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime

router = APIRouter(prefix="/beta/feedback", tags=["Beta Feedback"])

class FeedbackSubmission(BaseModel):
    user_id: str
    feedback_type: str  # "bug", "suggestion", "rating", "experience"
    category: str  # "anamnese", "recommendations", "ui", "performance"
    rating: Optional[int] = None  # 1-5 scale
    title: str
    description: str
    screenshot_url: Optional[str] = None
    metadata: Optional[dict] = None

class WeeklyFeedback(BaseModel):
    user_id: str
    week_number: int
    overall_satisfaction: int  # 1-10 scale
    ease_of_use: int  # 1-10 scale
    recommendation_quality: int  # 1-10 scale
    performance_rating: int  # 1-10 scale
    would_recommend: bool
    most_liked_feature: str
    least_liked_feature: str
    suggestions: str
    bugs_encountered: List[str]

@router.post("/submit")
async def submit_feedback(
    feedback: FeedbackSubmission,
    current_user: dict = Depends(get_current_beta_user)
):
    """Submeter feedback geral durante o uso"""
    try:
        # Validar se usuário é beta tester ativo
        if not await is_active_beta_user(feedback.user_id):
            raise HTTPException(status_code=403, detail="Usuário não é beta tester ativo")
        
        # Salvar feedback no banco de dados
        feedback_data = {
            **feedback.dict(),
            "timestamp": datetime.utcnow(),
            "session_id": current_user.get("session_id"),
            "app_version": "beta-1.0.0"
        }
        
        await save_feedback(feedback_data)
        
        # Enviar notificação para equipe se for bug crítico
        if feedback.feedback_type == "bug" and feedback.rating <= 2:
            await notify_dev_team(feedback_data)
        
        return {"message": "Feedback recebido com sucesso", "feedback_id": feedback_data["id"]}
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erro ao processar feedback: {str(e)}")

@router.post("/weekly")
async def submit_weekly_feedback(
    weekly_feedback: WeeklyFeedback,
    current_user: dict = Depends(get_current_beta_user)
):
    """Submeter feedback semanal estruturado"""
    try:
        # Validar se é a semana correta para este usuário
        user_start_date = await get_user_beta_start_date(weekly_feedback.user_id)
        expected_week = calculate_current_week(user_start_date)
        
        if weekly_feedback.week_number != expected_week:
            raise HTTPException(
                status_code=400, 
                detail=f"Semana incorreta. Esperado: {expected_week}, Recebido: {weekly_feedback.week_number}"
            )
        
        # Salvar feedback semanal
        weekly_data = {
            **weekly_feedback.dict(),
            "timestamp": datetime.utcnow(),
            "completion_status": "completed"
        }
        
        await save_weekly_feedback(weekly_data)
        
        # Calcular NPS baseado no would_recommend
        nps_score = calculate_nps_score(weekly_feedback.would_recommend, weekly_feedback.overall_satisfaction)
        await update_user_nps(weekly_feedback.user_id, nps_score)
        
        return {"message": "Feedback semanal recebido", "week": weekly_feedback.week_number}
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erro ao processar feedback semanal: {str(e)}")

@router.get("/prompts/{user_id}")
async def get_feedback_prompts(
    user_id: str,
    current_user: dict = Depends(get_current_beta_user)
):
    """Obter prompts de feedback personalizados baseados no uso"""
    try:
        # Analisar padrão de uso do usuário
        usage_pattern = await analyze_user_usage(user_id)
        
        # Gerar prompts personalizados
        prompts = await generate_personalized_prompts(usage_pattern)
        
        return {"prompts": prompts, "user_id": user_id}
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erro ao gerar prompts: {str(e)}")
```

### 3.3 Sistema de Questionários Dinâmicos
```python
class SurveyEngine:
    def __init__(self):
        self.question_templates = {
            "onboarding_experience": [
                {
                    "id": "onb_1",
                    "type": "rating",
                    "question": "Como você avalia a clareza das 22 perguntas da anamnese?",
                    "scale": {"min": 1, "max": 5, "labels": ["Muito confusa", "Muito clara"]}
                },
                {
                    "id": "onb_2", 
                    "type": "multiple_choice",
                    "question": "Qual pergunta foi mais difícil de responder?",
                    "options": ["Dados pessoais", "Objetivos", "Atividade física", "Restrições", "Suplementos"]
                },
                {
                    "id": "onb_3",
                    "type": "text",
                    "question": "Que pergunta você adicionaria à anamnese?",
                    "max_length": 500
                }
            ],
            "recommendations_quality": [
                {
                    "id": "rec_1",
                    "type": "rating", 
                    "question": "As recomendações de alimentos fazem sentido para seus objetivos?",
                    "scale": {"min": 1, "max": 5, "labels": ["Não fazem sentido", "Fazem muito sentido"]}
                },
                {
                    "id": "rec_2",
                    "type": "multiple_choice",
                    "question": "Você encontrou facilmente os alimentos recomendados?",
                    "options": ["Todos facilmente", "Maioria facilmente", "Alguns com dificuldade", "Maioria com dificuldade", "Nenhum encontrado"]
                }
            ]
        }
    
    async def generate_adaptive_survey(self, user_id: str, context: str):
        """Gerar questionário adaptativo baseado no contexto do usuário"""
        user_profile = await get_user_beta_profile(user_id)
        usage_data = await get_user_usage_data(user_id)
        
        # Selecionar perguntas baseadas no perfil e uso
        selected_questions = []
        
        if context == "weekly_feedback":
            # Adicionar perguntas base
            selected_questions.extend(self.question_templates["onboarding_experience"])
            
            # Adicionar perguntas específicas baseadas no uso
            if usage_data["recommendations_accessed"] > 5:
                selected_questions.extend(self.question_templates["recommendations_quality"])
            
            # Personalizar perguntas baseadas no perfil
            if user_profile["objective"] == "weight_loss":
                selected_questions.append({
                    "id": "wl_1",
                    "type": "rating",
                    "question": "As calorias recomendadas parecem adequadas para emagrecimento?",
                    "scale": {"min": 1, "max": 5, "labels": ["Muito baixas", "Muito altas"]}
                })
        
        return {
            "survey_id": f"{context}_{user_id}_{datetime.utcnow().strftime('%Y%m%d')}",
            "questions": selected_questions,
            "estimated_time": len(selected_questions) * 30  # 30 segundos por pergunta
        }
```

---

## 4. COLETA DE DADOS COMPORTAMENTAIS

### 4.1 Tracking de Eventos
```python
class EventTracker:
    def __init__(self):
        self.events = {
            # Eventos de onboarding
            "anamnese_started": {"category": "onboarding"},
            "question_answered": {"category": "onboarding", "properties": ["question_id", "answer_type", "time_spent"]},
            "anamnese_completed": {"category": "onboarding", "properties": ["total_time", "completion_rate"]},
            
            # Eventos de uso
            "profile_viewed": {"category": "engagement"},
            "recommendations_accessed": {"category": "engagement"},
            "food_searched": {"category": "engagement", "properties": ["search_term", "results_count"]},
            "meal_suggestion_viewed": {"category": "engagement"},
            
            # Eventos de feedback
            "feedback_button_clicked": {"category": "feedback"},
            "feedback_submitted": {"category": "feedback", "properties": ["feedback_type", "rating"]},
            "survey_started": {"category": "feedback"},
            "survey_completed": {"category": "feedback", "properties": ["completion_time"]},
            
            # Eventos de erro
            "error_encountered": {"category": "error", "properties": ["error_type", "error_message", "page"]},
            "page_load_failed": {"category": "error", "properties": ["page", "error_code"]},
            
            # Eventos de performance
            "slow_response": {"category": "performance", "properties": ["endpoint", "response_time"]},
            "timeout_occurred": {"category": "performance", "properties": ["action", "timeout_duration"]}
        }
    
    async def track_event(self, user_id: str, event_name: str, properties: dict = None):
        """Rastrear evento específico do usuário"""
        if event_name not in self.events:
            raise ValueError(f"Evento não reconhecido: {event_name}")
        
        event_data = {
            "user_id": user_id,
            "event_name": event_name,
            "timestamp": datetime.utcnow(),
            "properties": properties or {},
            "session_id": await get_current_session_id(user_id),
            "category": self.events[event_name]["category"]
        }
        
        # Adicionar contexto adicional
        event_data["context"] = await get_user_context(user_id)
        
        # Salvar evento
        await save_event(event_data)
        
        # Processar regras de negócio
        await process_event_rules(event_data)
    
    async def track_user_journey(self, user_id: str):
        """Rastrear jornada completa do usuário"""
        events = await get_user_events(user_id)
        
        journey_analysis = {
            "total_sessions": len(set([e["session_id"] for e in events])),
            "total_events": len(events),
            "completion_funnel": await calculate_completion_funnel(events),
            "drop_off_points": await identify_drop_off_points(events),
            "engagement_score": await calculate_engagement_score(events)
        }
        
        return journey_analysis
```

### 4.2 Heatmaps e Análise de Interação
```python
class InteractionAnalyzer:
    async def track_ui_interactions(self, user_id: str, interaction_data: dict):
        """Rastrear interações com elementos da UI"""
        interaction = {
            "user_id": user_id,
            "timestamp": datetime.utcnow(),
            "element_id": interaction_data.get("element_id"),
            "element_type": interaction_data.get("element_type"),  # button, input, link
            "action": interaction_data.get("action"),  # click, focus, scroll
            "page": interaction_data.get("page"),
            "coordinates": interaction_data.get("coordinates"),  # x, y
            "viewport_size": interaction_data.get("viewport_size"),
            "device_type": interaction_data.get("device_type")
        }
        
        await save_interaction(interaction)
    
    async def generate_heatmap_data(self, page: str, date_range: tuple):
        """Gerar dados para heatmap de uma página específica"""
        interactions = await get_interactions_by_page(page, date_range)
        
        heatmap_data = {}
        for interaction in interactions:
            coords = interaction["coordinates"]
            key = f"{coords['x']},{coords['y']}"
            
            if key not in heatmap_data:
                heatmap_data[key] = {"count": 0, "users": set()}
            
            heatmap_data[key]["count"] += 1
            heatmap_data[key]["users"].add(interaction["user_id"])
        
        # Converter para formato adequado para visualização
        return [
            {
                "x": int(coords.split(",")[0]),
                "y": int(coords.split(",")[1]), 
                "intensity": data["count"],
                "unique_users": len(data["users"])
            }
            for coords, data in heatmap_data.items()
        ]
```

---

## 5. SISTEMA DE ALERTAS E NOTIFICAÇÕES

### 5.1 Alertas Automáticos
```python
class AlertSystem:
    def __init__(self):
        self.alert_rules = {
            "high_error_rate": {
                "condition": "error_rate > 5%",
                "window": "5 minutes",
                "severity": "critical",
                "channels": ["slack", "email"]
            },
            "slow_response_time": {
                "condition": "avg_response_time > 2000ms",
                "window": "10 minutes", 
                "severity": "warning",
                "channels": ["slack"]
            },
            "low_completion_rate": {
                "condition": "anamnese_completion_rate < 70%",
                "window": "1 hour",
                "severity": "warning",
                "channels": ["email"]
            },
            "negative_feedback_spike": {
                "condition": "negative_feedback_rate > 20%",
                "window": "30 minutes",
                "severity": "high",
                "channels": ["slack", "email"]
            }
        }
    
    async def check_alert_conditions(self):
        """Verificar condições de alerta periodicamente"""
        for alert_name, rule in self.alert_rules.items():
            condition_met = await evaluate_condition(rule["condition"], rule["window"])
            
            if condition_met:
                await trigger_alert(alert_name, rule)
    
    async def trigger_alert(self, alert_name: str, rule: dict):
        """Disparar alerta quando condição é atendida"""
        alert_data = {
            "alert_name": alert_name,
            "timestamp": datetime.utcnow(),
            "severity": rule["severity"],
            "condition": rule["condition"],
            "current_metrics": await get_current_metrics()
        }
        
        # Enviar para canais configurados
        for channel in rule["channels"]:
            await send_alert(channel, alert_data)
```

---

## 6. RELATÓRIOS AUTOMATIZADOS

### 6.1 Relatório Diário
```python
async def generate_daily_report():
    """Gerar relatório diário automatizado"""
    today = datetime.utcnow().date()
    
    report_data = {
        "date": today.isoformat(),
        "active_users": await count_active_users(today),
        "new_signups": await count_new_signups(today),
        "anamnese_completions": await count_anamnese_completions(today),
        "feedback_submissions": await count_feedback_submissions(today),
        "avg_response_time": await calculate_avg_response_time(today),
        "error_rate": await calculate_error_rate(today),
        "top_issues": await get_top_issues(today),
        "user_satisfaction": await calculate_daily_satisfaction(today)
    }
    
    # Gerar insights automáticos
    insights = await generate_insights(report_data)
    report_data["insights"] = insights
    
    # Enviar relatório
    await send_daily_report(report_data)
    
    return report_data
```

Este sistema de feedback e analytics fornece a base técnica completa para monitoramento e análise do programa beta, garantindo coleta abrangente de dados para otimização contínua do Sistema de Anamnese Inteligente.

