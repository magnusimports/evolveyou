#!/usr/bin/env python3
"""
Testes Completos do Coach Virtual EVO
Validação de funcionalidades, integração e performance
"""

import asyncio
import aiohttp
import json
import time
import base64
from datetime import datetime
from typing import Dict, List, Any

# Configurações de teste
COACH_EVO_URL = "http://localhost:8004"
TEST_USER_ID = "test_user_coach_evo"

class CoachEVOTester:
    """Classe para testes do Coach Virtual EVO"""
    
    def __init__(self):
        self.base_url = COACH_EVO_URL
        self.test_results = {
            "timestamp": datetime.now().isoformat(),
            "total_tests": 0,
            "passed_tests": 0,
            "failed_tests": 0,
            "test_details": [],
            "performance_metrics": {},
            "integration_status": {}
        }
        
    async def run_all_tests(self):
        """Executa todos os testes"""
        print("🧪 INICIANDO TESTES COMPLETOS DO COACH VIRTUAL EVO")
        print("=" * 60)
        
        # Testes básicos de conectividade
        await self.test_service_health()
        await self.test_service_status()
        
        # Testes de funcionalidades core
        await self.test_conversation_flow()
        await self.test_chat_functionality()
        await self.test_recommendations()
        await self.test_image_analysis()
        
        # Testes de integração
        await self.test_anamnese_integration()
        await self.test_taco_integration()
        
        # Testes de performance
        await self.test_response_times()
        await self.test_concurrent_users()
        
        # Testes de edge cases
        await self.test_error_handling()
        await self.test_input_validation()
        
        # Gerar relatório final
        await self.generate_final_report()
        
    async def test_service_health(self):
        """Testa health check do serviço"""
        test_name = "Service Health Check"
        try:
            start_time = time.time()
            
            async with aiohttp.ClientSession() as session:
                async with session.get(f"{self.base_url}/health") as response:
                    response_time = time.time() - start_time
                    
                    if response.status == 200:
                        data = await response.json()
                        
                        # Validar estrutura da resposta
                        required_fields = ['status', 'service', 'version', 'dependencies']
                        missing_fields = [field for field in required_fields if field not in data]
                        
                        if not missing_fields and data['status'] == 'healthy':
                            self._record_test_success(test_name, {
                                "response_time": response_time,
                                "service_version": data.get('version'),
                                "dependencies": data.get('dependencies', {})
                            })
                        else:
                            self._record_test_failure(test_name, f"Campos ausentes ou status inválido: {missing_fields}")
                    else:
                        self._record_test_failure(test_name, f"Status HTTP: {response.status}")
                        
        except Exception as e:
            self._record_test_failure(test_name, str(e))
    
    async def test_service_status(self):
        """Testa endpoint de status detalhado"""
        test_name = "Service Status"
        try:
            async with aiohttp.ClientSession() as session:
                async with session.get(f"{self.base_url}/api/v1/status") as response:
                    if response.status == 200:
                        data = await response.json()
                        
                        if data.get('status') == 'operational':
                            self._record_test_success(test_name, {
                                "metrics": data.get('metrics', {}),
                                "configuration": data.get('configuration', {})
                            })
                        else:
                            self._record_test_failure(test_name, f"Status não operacional: {data.get('status')}")
                    else:
                        self._record_test_failure(test_name, f"Status HTTP: {response.status}")
                        
        except Exception as e:
            self._record_test_failure(test_name, str(e))
    
    async def test_conversation_flow(self):
        """Testa fluxo completo de conversa"""
        test_name = "Conversation Flow"
        try:
            session_id = None
            
            # 1. Iniciar conversa
            async with aiohttp.ClientSession() as session:
                # Iniciar conversa
                async with session.post(
                    f"{self.base_url}/api/v1/chat/start",
                    params={"user_id": TEST_USER_ID}
                ) as response:
                    if response.status == 200:
                        data = await response.json()
                        session_id = data.get('session_id')
                        
                        if not session_id:
                            self._record_test_failure(test_name, "Session ID não retornado")
                            return
                    else:
                        self._record_test_failure(test_name, f"Erro ao iniciar conversa: {response.status}")
                        return
                
                # 2. Enviar mensagem
                message_data = {
                    "message": "Olá Coach EVO! Como você pode me ajudar?",
                    "session_id": session_id
                }
                
                async with session.post(
                    f"{self.base_url}/api/v1/chat/message",
                    params={"user_id": TEST_USER_ID},
                    json=message_data
                ) as response:
                    if response.status == 200:
                        data = await response.json()
                        
                        # Validar estrutura da resposta
                        required_fields = ['message', 'suggestions', 'session_id']
                        missing_fields = [field for field in required_fields if field not in data]
                        
                        if not missing_fields:
                            self._record_test_success(test_name, {
                                "session_id": session_id,
                                "response_message": data['message']['content'][:100] + "...",
                                "suggestions_count": len(data.get('suggestions', []))
                            })
                        else:
                            self._record_test_failure(test_name, f"Campos ausentes na resposta: {missing_fields}")
                    else:
                        self._record_test_failure(test_name, f"Erro ao enviar mensagem: {response.status}")
                
                # 3. Obter histórico
                async with session.get(
                    f"{self.base_url}/api/v1/chat/history/{session_id}"
                ) as response:
                    if response.status == 200:
                        history = await response.json()
                        if len(history) >= 2:  # Usuário + Coach
                            print(f"✅ Histórico obtido: {len(history)} mensagens")
                        else:
                            print(f"⚠️ Histórico incompleto: {len(history)} mensagens")
                
                # 4. Encerrar conversa
                async with session.delete(
                    f"{self.base_url}/api/v1/chat/session/{session_id}"
                ) as response:
                    if response.status == 200:
                        print("✅ Conversa encerrada com sucesso")
                    else:
                        print(f"⚠️ Erro ao encerrar conversa: {response.status}")
                        
        except Exception as e:
            self._record_test_failure(test_name, str(e))
    
    async def test_chat_functionality(self):
        """Testa funcionalidades específicas do chat"""
        test_name = "Chat Functionality"
        try:
            test_messages = [
                "Quais alimentos são bons para café da manhã?",
                "Como posso ganhar massa muscular?",
                "Preciso perder peso, o que devo comer?",
                "Sou vegetariano, quais proteínas posso consumir?"
            ]
            
            responses = []
            
            async with aiohttp.ClientSession() as session:
                for message in test_messages:
                    message_data = {
                        "message": message
                    }
                    
                    async with session.post(
                        f"{self.base_url}/api/v1/chat/message",
                        params={"user_id": TEST_USER_ID},
                        json=message_data
                    ) as response:
                        if response.status == 200:
                            data = await response.json()
                            responses.append({
                                "question": message,
                                "answer": data['message']['content'][:100] + "...",
                                "suggestions": len(data.get('suggestions', []))
                            })
                        else:
                            responses.append({
                                "question": message,
                                "error": f"Status {response.status}"
                            })
            
            success_count = len([r for r in responses if 'error' not in r])
            
            if success_count == len(test_messages):
                self._record_test_success(test_name, {
                    "messages_tested": len(test_messages),
                    "success_rate": "100%",
                    "sample_responses": responses[:2]
                })
            else:
                self._record_test_failure(test_name, f"Apenas {success_count}/{len(test_messages)} mensagens processadas")
                
        except Exception as e:
            self._record_test_failure(test_name, str(e))
    
    async def test_recommendations(self):
        """Testa sistema de recomendações"""
        test_name = "Recommendations System"
        try:
            contexts = ["breakfast", "lunch", "dinner", "workout", "general"]
            recommendations_results = {}
            
            async with aiohttp.ClientSession() as session:
                for context in contexts:
                    async with session.get(
                        f"{self.base_url}/api/v1/analysis/recommendations/{TEST_USER_ID}",
                        params={"context": context, "limit": 3}
                    ) as response:
                        if response.status == 200:
                            data = await response.json()
                            recommendations_results[context] = {
                                "count": len(data),
                                "status": "success"
                            }
                        else:
                            recommendations_results[context] = {
                                "count": 0,
                                "status": f"error_{response.status}"
                            }
            
            success_contexts = [ctx for ctx, result in recommendations_results.items() if result['status'] == 'success']
            
            if len(success_contexts) >= 3:  # Pelo menos 3 contextos funcionando
                self._record_test_success(test_name, {
                    "contexts_tested": len(contexts),
                    "successful_contexts": len(success_contexts),
                    "results": recommendations_results
                })
            else:
                self._record_test_failure(test_name, f"Apenas {len(success_contexts)} contextos funcionando")
                
        except Exception as e:
            self._record_test_failure(test_name, str(e))
    
    async def test_image_analysis(self):
        """Testa análise de imagens"""
        test_name = "Image Analysis"
        try:
            # Criar imagem mock em base64 (1x1 pixel PNG)
            mock_image_b64 = "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg=="
            
            analysis_data = {
                "image_data": mock_image_b64,
                "user_id": TEST_USER_ID,
                "context": "Análise de refeição"
            }
            
            async with aiohttp.ClientSession() as session:
                async with session.post(
                    f"{self.base_url}/api/v1/analysis/image",
                    json=analysis_data
                ) as response:
                    if response.status == 200:
                        data = await response.json()
                        
                        required_fields = ['analysis', 'confidence', 'processing_time', 'suggestions']
                        missing_fields = [field for field in required_fields if field not in data]
                        
                        if not missing_fields:
                            self._record_test_success(test_name, {
                                "confidence": data.get('confidence'),
                                "processing_time": data.get('processing_time'),
                                "suggestions_count": len(data.get('suggestions', []))
                            })
                        else:
                            self._record_test_failure(test_name, f"Campos ausentes: {missing_fields}")
                    else:
                        self._record_test_failure(test_name, f"Status HTTP: {response.status}")
                        
        except Exception as e:
            self._record_test_failure(test_name, str(e))
    
    async def test_anamnese_integration(self):
        """Testa integração com sistema de anamnese"""
        test_name = "Anamnese Integration"
        try:
            # Testar se o coach consegue acessar dados de perfil nutricional
            async with aiohttp.ClientSession() as session:
                message_data = {
                    "message": "Baseado no meu perfil nutricional, o que devo comer hoje?"
                }
                
                async with session.post(
                    f"{self.base_url}/api/v1/chat/message",
                    params={"user_id": TEST_USER_ID},
                    json=message_data
                ) as response:
                    if response.status == 200:
                        data = await response.json()
                        response_content = data['message']['content'].lower()
                        
                        # Verificar se a resposta menciona conceitos nutricionais
                        nutrition_keywords = ['calorias', 'proteína', 'carboidrato', 'gordura', 'tmb', 'tdee', 'imc']
                        found_keywords = [kw for kw in nutrition_keywords if kw in response_content]
                        
                        if found_keywords:
                            self._record_test_success(test_name, {
                                "nutrition_keywords_found": found_keywords,
                                "response_preview": response_content[:150] + "..."
                            })
                        else:
                            self._record_test_failure(test_name, "Resposta não contém conceitos nutricionais específicos")
                    else:
                        self._record_test_failure(test_name, f"Status HTTP: {response.status}")
                        
        except Exception as e:
            self._record_test_failure(test_name, str(e))
    
    async def test_taco_integration(self):
        """Testa integração com Base TACO"""
        test_name = "TACO Integration"
        try:
            async with aiohttp.ClientSession() as session:
                message_data = {
                    "message": "Quais alimentos brasileiros da Base TACO são ricos em proteína?"
                }
                
                async with session.post(
                    f"{self.base_url}/api/v1/chat/message",
                    params={"user_id": TEST_USER_ID},
                    json=message_data
                ) as response:
                    if response.status == 200:
                        data = await response.json()
                        response_content = data['message']['content'].lower()
                        
                        # Verificar se a resposta menciona alimentos brasileiros
                        brazilian_foods = ['arroz', 'feijão', 'mandioca', 'açaí', 'guaraná', 'caju', 'manga']
                        found_foods = [food for food in brazilian_foods if food in response_content]
                        
                        if found_foods or 'taco' in response_content or 'brasileiro' in response_content:
                            self._record_test_success(test_name, {
                                "brazilian_foods_mentioned": found_foods,
                                "mentions_taco": 'taco' in response_content,
                                "response_preview": response_content[:150] + "..."
                            })
                        else:
                            self._record_test_failure(test_name, "Resposta não menciona alimentos brasileiros ou Base TACO")
                    else:
                        self._record_test_failure(test_name, f"Status HTTP: {response.status}")
                        
        except Exception as e:
            self._record_test_failure(test_name, str(e))
    
    async def test_response_times(self):
        """Testa tempos de resposta"""
        test_name = "Response Times"
        try:
            response_times = []
            
            async with aiohttp.ClientSession() as session:
                for i in range(5):
                    start_time = time.time()
                    
                    message_data = {
                        "message": f"Teste de performance #{i+1}"
                    }
                    
                    async with session.post(
                        f"{self.base_url}/api/v1/chat/message",
                        params={"user_id": f"{TEST_USER_ID}_{i}"},
                        json=message_data
                    ) as response:
                        response_time = time.time() - start_time
                        response_times.append(response_time)
                        
                        if response.status != 200:
                            print(f"⚠️ Erro na requisição {i+1}: Status {response.status}")
            
            if response_times:
                avg_response_time = sum(response_times) / len(response_times)
                max_response_time = max(response_times)
                min_response_time = min(response_times)
                
                # Considerar sucesso se tempo médio < 2 segundos
                if avg_response_time < 2.0:
                    self._record_test_success(test_name, {
                        "average_response_time": round(avg_response_time, 3),
                        "max_response_time": round(max_response_time, 3),
                        "min_response_time": round(min_response_time, 3),
                        "total_requests": len(response_times)
                    })
                else:
                    self._record_test_failure(test_name, f"Tempo médio muito alto: {avg_response_time:.3f}s")
            else:
                self._record_test_failure(test_name, "Nenhuma resposta obtida")
                
        except Exception as e:
            self._record_test_failure(test_name, str(e))
    
    async def test_concurrent_users(self):
        """Testa usuários concorrentes"""
        test_name = "Concurrent Users"
        try:
            concurrent_tasks = []
            
            async def send_concurrent_message(user_index):
                async with aiohttp.ClientSession() as session:
                    message_data = {
                        "message": f"Mensagem concorrente do usuário {user_index}"
                    }
                    
                    async with session.post(
                        f"{self.base_url}/api/v1/chat/message",
                        params={"user_id": f"concurrent_user_{user_index}"},
                        json=message_data
                    ) as response:
                        return response.status == 200
            
            # Criar 10 requisições concorrentes
            for i in range(10):
                task = send_concurrent_message(i)
                concurrent_tasks.append(task)
            
            # Executar todas as tarefas concorrentemente
            results = await asyncio.gather(*concurrent_tasks, return_exceptions=True)
            
            # Contar sucessos
            successful_requests = sum(1 for result in results if result is True)
            
            if successful_requests >= 8:  # Pelo menos 80% de sucesso
                self._record_test_success(test_name, {
                    "concurrent_users": 10,
                    "successful_requests": successful_requests,
                    "success_rate": f"{(successful_requests/10)*100:.1f}%"
                })
            else:
                self._record_test_failure(test_name, f"Apenas {successful_requests}/10 requisições bem-sucedidas")
                
        except Exception as e:
            self._record_test_failure(test_name, str(e))
    
    async def test_error_handling(self):
        """Testa tratamento de erros"""
        test_name = "Error Handling"
        try:
            error_tests = [
                # Mensagem vazia
                {"message": "", "expected_status": 400},
                # Usuário inválido
                {"message": "Teste", "user_id": "", "expected_status": 400},
                # Dados inválidos
                {"invalid_field": "test", "expected_status": 422}
            ]
            
            error_results = []
            
            async with aiohttp.ClientSession() as session:
                for test_case in error_tests:
                    try:
                        user_id = test_case.pop("user_id", TEST_USER_ID)
                        expected_status = test_case.pop("expected_status")
                        
                        async with session.post(
                            f"{self.base_url}/api/v1/chat/message",
                            params={"user_id": user_id},
                            json=test_case
                        ) as response:
                            error_results.append({
                                "test_case": str(test_case),
                                "expected_status": expected_status,
                                "actual_status": response.status,
                                "handled_correctly": response.status == expected_status
                            })
                    except Exception as e:
                        error_results.append({
                            "test_case": str(test_case),
                            "error": str(e),
                            "handled_correctly": False
                        })
            
            correctly_handled = sum(1 for result in error_results if result.get('handled_correctly', False))
            
            if correctly_handled >= len(error_tests) * 0.7:  # 70% dos casos tratados corretamente
                self._record_test_success(test_name, {
                    "total_error_cases": len(error_tests),
                    "correctly_handled": correctly_handled,
                    "error_results": error_results
                })
            else:
                self._record_test_failure(test_name, f"Apenas {correctly_handled}/{len(error_tests)} erros tratados corretamente")
                
        except Exception as e:
            self._record_test_failure(test_name, str(e))
    
    async def test_input_validation(self):
        """Testa validação de entrada"""
        test_name = "Input Validation"
        try:
            # Testar mensagem muito longa
            long_message = "A" * 10000
            
            async with aiohttp.ClientSession() as session:
                message_data = {
                    "message": long_message
                }
                
                async with session.post(
                    f"{self.base_url}/api/v1/chat/message",
                    params={"user_id": TEST_USER_ID},
                    json=message_data
                ) as response:
                    # Deve aceitar ou rejeitar graciosamente
                    if response.status in [200, 400, 413]:  # OK, Bad Request, ou Payload Too Large
                        self._record_test_success(test_name, {
                            "long_message_status": response.status,
                            "message_length": len(long_message),
                            "handled_gracefully": True
                        })
                    else:
                        self._record_test_failure(test_name, f"Status inesperado para mensagem longa: {response.status}")
                        
        except Exception as e:
            self._record_test_failure(test_name, str(e))
    
    def _record_test_success(self, test_name: str, details: Dict[str, Any]):
        """Registra teste bem-sucedido"""
        self.test_results["total_tests"] += 1
        self.test_results["passed_tests"] += 1
        self.test_results["test_details"].append({
            "test_name": test_name,
            "status": "PASSED",
            "details": details,
            "timestamp": datetime.now().isoformat()
        })
        print(f"✅ {test_name}: PASSOU")
    
    def _record_test_failure(self, test_name: str, error: str):
        """Registra teste falhado"""
        self.test_results["total_tests"] += 1
        self.test_results["failed_tests"] += 1
        self.test_results["test_details"].append({
            "test_name": test_name,
            "status": "FAILED",
            "error": error,
            "timestamp": datetime.now().isoformat()
        })
        print(f"❌ {test_name}: FALHOU - {error}")
    
    async def generate_final_report(self):
        """Gera relatório final dos testes"""
        print("\n" + "=" * 60)
        print("📊 RELATÓRIO FINAL DOS TESTES")
        print("=" * 60)
        
        total = self.test_results["total_tests"]
        passed = self.test_results["passed_tests"]
        failed = self.test_results["failed_tests"]
        success_rate = (passed / total * 100) if total > 0 else 0
        
        print(f"Total de Testes: {total}")
        print(f"Testes Aprovados: {passed}")
        print(f"Testes Falhados: {failed}")
        print(f"Taxa de Sucesso: {success_rate:.1f}%")
        
        # Classificação geral
        if success_rate >= 90:
            classification = "🏆 EXCELENTE"
        elif success_rate >= 80:
            classification = "✅ BOM"
        elif success_rate >= 70:
            classification = "⚠️ ACEITÁVEL"
        else:
            classification = "❌ PRECISA MELHORAR"
        
        print(f"Classificação Geral: {classification}")
        
        # Salvar relatório detalhado
        with open("/home/ubuntu/coach_evo_test_results.json", "w", encoding="utf-8") as f:
            json.dump(self.test_results, f, indent=2, ensure_ascii=False)
        
        print(f"\n📄 Relatório detalhado salvo em: coach_evo_test_results.json")
        
        return success_rate

async def main():
    """Função principal"""
    tester = CoachEVOTester()
    success_rate = await tester.run_all_tests()
    
    print(f"\n🎯 RESULTADO FINAL: {success_rate:.1f}% de sucesso")
    
    if success_rate >= 80:
        print("🚀 Coach Virtual EVO aprovado para produção!")
    else:
        print("⚠️ Coach Virtual EVO precisa de ajustes antes da produção.")

if __name__ == "__main__":
    asyncio.run(main())

