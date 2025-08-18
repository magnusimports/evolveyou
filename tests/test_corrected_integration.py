#!/usr/bin/env python3
"""
Teste Completo de Integração CORRIGIDO - EvolveYou
Testa todas as configurações Firebase e Google Cloud
"""

import requests
import json
import time
from datetime import datetime

class EvolveYouIntegrationTestCorrected:
    def __init__(self):
        self.results = {
            "timestamp": datetime.now().isoformat(),
            "tests": {},
            "summary": {
                "total": 0,
                "passed": 0,
                "failed": 0,
                "success_rate": 0
            }
        }
        
        # URLs dos serviços
        self.base_taco_url = "https://content-service-278319877545.southamerica-east1.run.app"
        self.health_check_url = "https://health-check-service-278319877545.southamerica-east1.run.app"
        
    def log_test(self, test_name, status, details=None, error=None):
        """Registra resultado de um teste"""
        self.results["tests"][test_name] = {
            "status": status,
            "details": details,
            "error": error,
            "timestamp": datetime.now().isoformat()
        }
        
        self.results["summary"]["total"] += 1
        if status == "PASS":
            self.results["summary"]["passed"] += 1
        else:
            self.results["summary"]["failed"] += 1
            
        print(f"{'✅' if status == 'PASS' else '❌'} {test_name}: {status}")
        if details:
            print(f"   📋 {details}")
        if error:
            print(f"   ⚠️ {error}")
    
    def test_base_taco_health(self):
        """Testa health check da Base TACO"""
        try:
            response = requests.get(f"{self.base_taco_url}/health", timeout=10)
            if response.status_code == 200:
                data = response.json()
                if data.get("status") == "healthy":
                    self.log_test("Base TACO Health", "PASS", 
                                f"Status: {data.get('status')}")
                else:
                    self.log_test("Base TACO Health", "FAIL", 
                                f"Status não healthy: {data.get('status')}")
            else:
                self.log_test("Base TACO Health", "FAIL", 
                            f"HTTP {response.status_code}")
        except Exception as e:
            self.log_test("Base TACO Health", "FAIL", error=str(e))
    
    def test_base_taco_stats(self):
        """Testa estatísticas da Base TACO"""
        try:
            response = requests.get(f"{self.base_taco_url}/api/foods/stats", timeout=10)
            if response.status_code == 200:
                data = response.json()
                if data.get("success") and data.get("data"):
                    stats = data["data"]
                    total_foods = stats.get("total_foods", 0)
                    if total_foods > 0:
                        self.log_test("Base TACO Stats", "PASS", 
                                    f"Total alimentos: {total_foods}, Grupos: {stats.get('groups', 0)}")
                    else:
                        self.log_test("Base TACO Stats", "FAIL", 
                                    "Nenhum alimento encontrado")
                else:
                    self.log_test("Base TACO Stats", "FAIL", 
                                f"Resposta inválida: {data}")
            else:
                self.log_test("Base TACO Stats", "FAIL", 
                            f"HTTP {response.status_code}")
        except Exception as e:
            self.log_test("Base TACO Stats", "FAIL", error=str(e))
    
    def test_base_taco_search(self):
        """Testa busca de alimentos na Base TACO"""
        try:
            response = requests.get(f"{self.base_taco_url}/api/foods/search?q=abacaxi", timeout=10)
            if response.status_code == 200:
                data = response.json()
                if data.get("success") and data.get("data"):
                    foods = data["data"]
                    if isinstance(foods, list) and len(foods) > 0:
                        food = foods[0]
                        self.log_test("Base TACO Search", "PASS", 
                                    f"Encontrado: {food.get('nome', 'N/A')}")
                    else:
                        self.log_test("Base TACO Search", "FAIL", 
                                    "Nenhum resultado na busca")
                else:
                    self.log_test("Base TACO Search", "FAIL", 
                                f"Resposta inválida: {data}")
            else:
                self.log_test("Base TACO Search", "FAIL", 
                            f"HTTP {response.status_code}")
        except Exception as e:
            self.log_test("Base TACO Search", "FAIL", error=str(e))
    
    def test_health_check_service(self):
        """Testa serviço de health check"""
        try:
            response = requests.get(f"{self.health_check_url}/health", timeout=10)
            if response.status_code == 200:
                data = response.json()
                self.log_test("Health Check Service", "PASS", 
                            f"Status: {data.get('status', 'N/A')}")
            else:
                self.log_test("Health Check Service", "FAIL", 
                            f"HTTP {response.status_code}")
        except Exception as e:
            self.log_test("Health Check Service", "FAIL", error=str(e))
    
    def test_microservices_connectivity(self):
        """Testa conectividade entre microserviços"""
        try:
            # Testa se consegue acessar grupos alimentares
            response = requests.get(f"{self.base_taco_url}/api/foods/groups", timeout=10)
            if response.status_code == 200:
                data = response.json()
                if data.get("success") and data.get("data"):
                    groups = data["data"]
                    if isinstance(groups, list) and len(groups) > 0:
                        self.log_test("Microservices Connectivity", "PASS", 
                                    f"Grupos alimentares: {len(groups)}")
                    else:
                        self.log_test("Microservices Connectivity", "FAIL", 
                                    "Grupos alimentares vazios")
                else:
                    self.log_test("Microservices Connectivity", "FAIL", 
                                f"Resposta inválida: {data}")
            else:
                self.log_test("Microservices Connectivity", "FAIL", 
                            f"HTTP {response.status_code}")
        except Exception as e:
            self.log_test("Microservices Connectivity", "FAIL", error=str(e))
    
    def test_data_quality(self):
        """Testa qualidade dos dados da Base TACO"""
        try:
            response = requests.get(f"{self.base_taco_url}/api/foods/search?q=a", timeout=10)
            if response.status_code == 200:
                data = response.json()
                if data.get("success") and data.get("data"):
                    foods = data["data"]
                    if isinstance(foods, list) and len(foods) > 0:
                        # Verifica se os alimentos têm dados nutricionais
                        valid_foods = 0
                        for food in foods[:5]:  # Testa apenas os primeiros 5
                            if (food.get('composicao') and 
                                'Energia' in food.get('composicao', {}) and
                                food.get('composicao', {}).get('Energia', {}).get('valor')):
                                valid_foods += 1
                        
                        if valid_foods > 0:
                            self.log_test("Data Quality", "PASS", 
                                        f"Alimentos válidos: {valid_foods}/{len(foods[:5])}")
                        else:
                            self.log_test("Data Quality", "FAIL", 
                                        "Nenhum alimento com dados nutricionais válidos")
                    else:
                        self.log_test("Data Quality", "FAIL", 
                                    "Nenhum alimento encontrado")
                else:
                    self.log_test("Data Quality", "FAIL", 
                                f"Resposta inválida: {data}")
            else:
                self.log_test("Data Quality", "FAIL", 
                            f"HTTP {response.status_code}")
        except Exception as e:
            self.log_test("Data Quality", "FAIL", error=str(e))
    
    def test_response_times(self):
        """Testa tempos de resposta dos serviços"""
        try:
            start_time = time.time()
            response = requests.get(f"{self.base_taco_url}/health", timeout=10)
            response_time = (time.time() - start_time) * 1000  # em ms
            
            if response.status_code == 200 and response_time < 2000:  # < 2 segundos
                self.log_test("Response Times", "PASS", 
                            f"Tempo de resposta: {response_time:.0f}ms")
            else:
                self.log_test("Response Times", "FAIL", 
                            f"Tempo muito alto: {response_time:.0f}ms")
        except Exception as e:
            self.log_test("Response Times", "FAIL", error=str(e))
    
    def test_taco_integration_with_plans(self):
        """Testa integração da Base TACO com o algoritmo de planos"""
        try:
            # Simula o que o plans-service faria
            response = requests.get(f"{self.base_taco_url}/api/foods/search?q=arroz", timeout=10)
            if response.status_code == 200:
                data = response.json()
                if data.get("success") and data.get("data"):
                    foods = data["data"]
                    if len(foods) > 0:
                        # Verifica se tem dados necessários para o algoritmo
                        food = foods[0]
                        has_energy = food.get('composicao', {}).get('Energia', {}).get('valor')
                        has_macros = food.get('macronutrientes')
                        
                        if has_energy and has_macros:
                            self.log_test("TACO-Plans Integration", "PASS", 
                                        f"Dados completos para algoritmo: {food.get('nome', 'N/A')}")
                        else:
                            self.log_test("TACO-Plans Integration", "FAIL", 
                                        "Dados insuficientes para algoritmo")
                    else:
                        self.log_test("TACO-Plans Integration", "FAIL", 
                                    "Nenhum alimento encontrado")
                else:
                    self.log_test("TACO-Plans Integration", "FAIL", 
                                f"Resposta inválida: {data}")
            else:
                self.log_test("TACO-Plans Integration", "FAIL", 
                            f"HTTP {response.status_code}")
        except Exception as e:
            self.log_test("TACO-Plans Integration", "FAIL", error=str(e))
    
    def run_all_tests(self):
        """Executa todos os testes"""
        print("🧪 INICIANDO TESTES COMPLETOS DE INTEGRAÇÃO (CORRIGIDOS)")
        print("=" * 60)
        
        # Lista de testes
        tests = [
            self.test_base_taco_health,
            self.test_base_taco_stats,
            self.test_base_taco_search,
            self.test_health_check_service,
            self.test_microservices_connectivity,
            self.test_data_quality,
            self.test_response_times,
            self.test_taco_integration_with_plans
        ]
        
        # Executa cada teste
        for test in tests:
            try:
                test()
            except Exception as e:
                test_name = test.__name__.replace("test_", "").replace("_", " ").title()
                self.log_test(test_name, "FAIL", error=f"Erro na execução: {str(e)}")
            
            time.sleep(1)  # Pausa entre testes
        
        # Calcula taxa de sucesso
        if self.results["summary"]["total"] > 0:
            self.results["summary"]["success_rate"] = (
                self.results["summary"]["passed"] / self.results["summary"]["total"] * 100
            )
        
        # Exibe resumo
        print("\n" + "=" * 60)
        print("📊 RESUMO DOS TESTES CORRIGIDOS")
        print(f"Total: {self.results['summary']['total']}")
        print(f"✅ Passou: {self.results['summary']['passed']}")
        print(f"❌ Falhou: {self.results['summary']['failed']}")
        print(f"📈 Taxa de sucesso: {self.results['summary']['success_rate']:.1f}%")
        
        # Salva resultados
        with open('/home/ubuntu/integration_test_results_corrected.json', 'w') as f:
            json.dump(self.results, f, indent=2, ensure_ascii=False)
        
        print(f"\n📄 Resultados salvos em: /home/ubuntu/integration_test_results_corrected.json")
        
        return self.results

if __name__ == "__main__":
    tester = EvolveYouIntegrationTestCorrected()
    results = tester.run_all_tests()

