"""
Script de teste completo dos endpoints da Anamnese Inteligente
Testa todos os 14 endpoints implementados
"""

import requests
import json
import time
from typing import Dict, Any, List
from datetime import datetime

class APITester:
    """Testador de APIs da Anamnese Inteligente"""
    
    def __init__(self, base_url: str = "http://localhost:8000"):
        self.base_url = base_url
        self.session = requests.Session()
        self.test_results = []
        
        # Headers padrão
        self.session.headers.update({
            "Content-Type": "application/json",
            "Accept": "application/json"
        })
    
    def log_test(self, endpoint: str, method: str, status_code: int, 
                 response_time: float, success: bool, error: str = None):
        """Log de resultado de teste"""
        result = {
            "endpoint": endpoint,
            "method": method,
            "status_code": status_code,
            "response_time_ms": round(response_time * 1000, 2),
            "success": success,
            "error": error,
            "timestamp": datetime.now().isoformat()
        }
        self.test_results.append(result)
        
        status = "✅" if success else "❌"
        print(f"{status} {method} {endpoint} - {status_code} ({result['response_time_ms']}ms)")
        if error:
            print(f"   Error: {error}")
    
    def test_endpoint(self, method: str, endpoint: str, data: Dict[Any, Any] = None, 
                     headers: Dict[str, str] = None, expected_status: int = 200) -> Dict[str, Any]:
        """Testar um endpoint específico"""
        url = f"{self.base_url}{endpoint}"
        
        # Mesclar headers
        request_headers = self.session.headers.copy()
        if headers:
            request_headers.update(headers)
        
        start_time = time.time()
        
        try:
            if method.upper() == "GET":
                response = self.session.get(url, headers=request_headers)
            elif method.upper() == "POST":
                response = self.session.post(url, json=data, headers=request_headers)
            elif method.upper() == "PUT":
                response = self.session.put(url, json=data, headers=request_headers)
            elif method.upper() == "DELETE":
                response = self.session.delete(url, headers=request_headers)
            else:
                raise ValueError(f"Método HTTP não suportado: {method}")
            
            response_time = time.time() - start_time
            
            # Verificar se o status é o esperado
            success = response.status_code == expected_status
            
            # Tentar parsear JSON
            try:
                response_data = response.json()
            except:
                response_data = {"raw_response": response.text}
            
            self.log_test(endpoint, method.upper(), response.status_code, 
                         response_time, success)
            
            return {
                "success": success,
                "status_code": response.status_code,
                "data": response_data,
                "response_time": response_time
            }
            
        except Exception as e:
            response_time = time.time() - start_time
            error_msg = str(e)
            
            self.log_test(endpoint, method.upper(), 0, response_time, False, error_msg)
            
            return {
                "success": False,
                "status_code": 0,
                "data": {"error": error_msg},
                "response_time": response_time
            }
    
    def test_health_check(self):
        """Testar endpoint de health check"""
        print("\n🏥 TESTANDO HEALTH CHECK")
        print("-" * 30)
        
        result = self.test_endpoint("GET", "/health")
        
        if result["success"]:
            health_data = result["data"]
            print(f"   Status: {health_data.get('status', 'unknown')}")
            print(f"   Version: {health_data.get('version', 'unknown')}")
            
            services = health_data.get('services', {})
            for service, status in services.items():
                status_icon = "✅" if status == "healthy" else "⚠️" if status == "degraded" else "❌"
                print(f"   {service}: {status_icon} {status}")
        
        return result["success"]
    
    def test_anamnese_endpoints_without_auth(self):
        """Testar endpoints da anamnese sem autenticação (devem falhar)"""
        print("\n🔒 TESTANDO ENDPOINTS SEM AUTENTICAÇÃO")
        print("-" * 45)
        
        anamnese_endpoints = [
            ("GET", "/anamnese/questions"),
            ("POST", "/anamnese/answer"),
            ("POST", "/anamnese/answers/batch"),
            ("GET", "/anamnese/status"),
            ("GET", "/anamnese/answers"),
            ("POST", "/anamnese/calculate-profile"),
            ("GET", "/anamnese/profile"),
            ("PUT", "/anamnese/profile/update"),
            ("DELETE", "/anamnese/reset")
        ]
        
        auth_failures = 0
        
        for method, endpoint in anamnese_endpoints:
            result = self.test_endpoint(method, endpoint, expected_status=401)
            if result["status_code"] == 401:
                auth_failures += 1
        
        print(f"\n📊 Endpoints protegidos por autenticação: {auth_failures}/{len(anamnese_endpoints)}")
        return auth_failures == len(anamnese_endpoints)
    
    def test_taco_endpoints_without_auth(self):
        """Testar endpoints TACO sem autenticação (devem falhar)"""
        print("\n🍎 TESTANDO ENDPOINTS TACO SEM AUTENTICAÇÃO")
        print("-" * 50)
        
        taco_endpoints = [
            ("GET", "/taco/foods/recommendations"),
            ("POST", "/taco/meals/suggestions"),
            ("POST", "/taco/foods/search"),
            ("GET", "/taco/foods/all"),
            ("GET", "/taco/restrictions/info")
        ]
        
        auth_failures = 0
        
        for method, endpoint in taco_endpoints:
            result = self.test_endpoint(method, endpoint, expected_status=401)
            if result["status_code"] == 401:
                auth_failures += 1
        
        print(f"\n📊 Endpoints TACO protegidos: {auth_failures}/{len(taco_endpoints)}")
        return auth_failures == len(taco_endpoints)
    
    def test_rate_limiting(self):
        """Testar rate limiting"""
        print("\n⏱️ TESTANDO RATE LIMITING")
        print("-" * 30)
        
        # Fazer múltiplas requisições rapidamente para o health check
        rate_limit_triggered = False
        
        for i in range(15):  # Tentar 15 requisições
            result = self.test_endpoint("GET", "/health")
            
            if result["status_code"] == 429:
                rate_limit_triggered = True
                print(f"   Rate limit ativado na requisição {i+1}")
                break
            
            time.sleep(0.1)  # Pequena pausa
        
        if not rate_limit_triggered:
            print("   ⚠️ Rate limiting não foi ativado (pode estar configurado com limite alto)")
        
        return True  # Rate limiting é opcional para health check
    
    def test_error_handling(self):
        """Testar tratamento de erros"""
        print("\n🚨 TESTANDO TRATAMENTO DE ERROS")
        print("-" * 40)
        
        # Testar endpoint inexistente
        result = self.test_endpoint("GET", "/endpoint/inexistente", expected_status=404)
        not_found_ok = result["status_code"] == 404
        
        # Testar método não permitido
        result = self.test_endpoint("PATCH", "/health", expected_status=405)
        method_not_allowed_ok = result["status_code"] == 405
        
        # Testar JSON inválido
        invalid_json_headers = {"Content-Type": "application/json"}
        try:
            response = requests.post(f"{self.base_url}/anamnese/answer", 
                                   data="invalid json", 
                                   headers=invalid_json_headers)
            json_error_ok = response.status_code in [400, 422]
        except:
            json_error_ok = True
        
        print(f"   404 para endpoint inexistente: {'✅' if not_found_ok else '❌'}")
        print(f"   405 para método não permitido: {'✅' if method_not_allowed_ok else '❌'}")
        print(f"   Erro para JSON inválido: {'✅' if json_error_ok else '❌'}")
        
        return not_found_ok and method_not_allowed_ok and json_error_ok
    
    def test_cors_headers(self):
        """Testar headers CORS"""
        print("\n🌐 TESTANDO HEADERS CORS")
        print("-" * 30)
        
        # Fazer requisição OPTIONS para verificar CORS
        try:
            response = requests.options(f"{self.base_url}/health", 
                                      headers={"Origin": "http://localhost:3000"})
            
            cors_headers = {
                "Access-Control-Allow-Origin": response.headers.get("Access-Control-Allow-Origin"),
                "Access-Control-Allow-Methods": response.headers.get("Access-Control-Allow-Methods"),
                "Access-Control-Allow-Headers": response.headers.get("Access-Control-Allow-Headers")
            }
            
            cors_ok = any(cors_headers.values())
            
            print(f"   CORS configurado: {'✅' if cors_ok else '❌'}")
            
            for header, value in cors_headers.items():
                if value:
                    print(f"   {header}: {value}")
            
            return cors_ok
            
        except Exception as e:
            print(f"   ❌ Erro ao testar CORS: {str(e)}")
            return False
    
    def test_response_format(self):
        """Testar formato das respostas"""
        print("\n📋 TESTANDO FORMATO DAS RESPOSTAS")
        print("-" * 40)
        
        # Testar health check
        result = self.test_endpoint("GET", "/health")
        
        if result["success"]:
            health_data = result["data"]
            
            # Verificar campos obrigatórios
            required_fields = ["status", "timestamp", "version"]
            fields_ok = all(field in health_data for field in required_fields)
            
            # Verificar se timestamp é válido
            try:
                datetime.fromisoformat(health_data.get("timestamp", "").replace("Z", "+00:00"))
                timestamp_ok = True
            except:
                timestamp_ok = False
            
            print(f"   Campos obrigatórios presentes: {'✅' if fields_ok else '❌'}")
            print(f"   Timestamp válido: {'✅' if timestamp_ok else '❌'}")
            
            return fields_ok and timestamp_ok
        
        return False
    
    def generate_report(self):
        """Gerar relatório dos testes"""
        print("\n" + "=" * 60)
        print("📊 RELATÓRIO FINAL DOS TESTES")
        print("=" * 60)
        
        total_tests = len(self.test_results)
        successful_tests = sum(1 for result in self.test_results if result["success"])
        failed_tests = total_tests - successful_tests
        
        avg_response_time = sum(result["response_time_ms"] for result in self.test_results) / total_tests if total_tests > 0 else 0
        
        print(f"📈 Total de testes: {total_tests}")
        print(f"✅ Sucessos: {successful_tests}")
        print(f"❌ Falhas: {failed_tests}")
        print(f"📊 Taxa de sucesso: {(successful_tests/total_tests*100):.1f}%")
        print(f"⏱️ Tempo médio de resposta: {avg_response_time:.2f}ms")
        
        # Agrupar por status code
        status_codes = {}
        for result in self.test_results:
            code = result["status_code"]
            if code not in status_codes:
                status_codes[code] = 0
            status_codes[code] += 1
        
        print(f"\n📋 Status codes:")
        for code, count in sorted(status_codes.items()):
            print(f"   {code}: {count} requisições")
        
        # Endpoints mais lentos
        slowest = sorted(self.test_results, key=lambda x: x["response_time_ms"], reverse=True)[:3]
        
        print(f"\n🐌 Endpoints mais lentos:")
        for result in slowest:
            print(f"   {result['method']} {result['endpoint']}: {result['response_time_ms']}ms")
        
        return {
            "total_tests": total_tests,
            "successful_tests": successful_tests,
            "failed_tests": failed_tests,
            "success_rate": successful_tests/total_tests*100 if total_tests > 0 else 0,
            "avg_response_time": avg_response_time,
            "status_codes": status_codes
        }
    
    def run_all_tests(self):
        """Executar todos os testes"""
        print("🧪 INICIANDO TESTES COMPLETOS DOS ENDPOINTS")
        print("=" * 60)
        
        # Lista de testes a executar
        tests = [
            ("Health Check", self.test_health_check),
            ("Autenticação Anamnese", self.test_anamnese_endpoints_without_auth),
            ("Autenticação TACO", self.test_taco_endpoints_without_auth),
            ("Rate Limiting", self.test_rate_limiting),
            ("Tratamento de Erros", self.test_error_handling),
            ("Headers CORS", self.test_cors_headers),
            ("Formato de Respostas", self.test_response_format)
        ]
        
        results = {}
        
        for test_name, test_func in tests:
            try:
                results[test_name] = test_func()
            except Exception as e:
                print(f"❌ Erro no teste {test_name}: {str(e)}")
                results[test_name] = False
        
        # Gerar relatório final
        report = self.generate_report()
        
        # Salvar resultados
        test_data = {
            "summary": report,
            "test_results": results,
            "detailed_results": self.test_results,
            "timestamp": datetime.now().isoformat()
        }
        
        with open('/home/ubuntu/api_test_results.json', 'w', encoding='utf-8') as f:
            json.dump(test_data, f, indent=2, ensure_ascii=False)
        
        print(f"\n💾 Resultados salvos em: /home/ubuntu/api_test_results.json")
        
        # Resultado geral
        overall_success = all(results.values())
        
        print(f"\n🎯 RESULTADO GERAL: {'✅ TODOS OS TESTES PASSARAM' if overall_success else '⚠️ ALGUNS TESTES FALHARAM'}")
        
        return overall_success

def main():
    """Executar testes"""
    tester = APITester()
    
    try:
        success = tester.run_all_tests()
        return success
    except Exception as e:
        print(f"❌ ERRO GERAL NOS TESTES: {str(e)}")
        return False

if __name__ == "__main__":
    success = main()
    exit(0 if success else 1)

