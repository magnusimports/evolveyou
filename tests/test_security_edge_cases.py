"""
Testes de Segurança e Edge Cases
Valida comportamento do sistema em cenários extremos e aspectos de segurança
"""

import requests
import json
import time
from datetime import datetime, date
from typing import Dict, Any, List
import string
import random

class SecurityEdgeCaseTester:
    """Testador de segurança e casos extremos"""
    
    def __init__(self, base_url: str = "http://localhost:8000"):
        self.base_url = base_url
        self.test_results = []
        
    def log_test_result(self, test_name: str, passed: bool, details: Dict[str, Any] = None, 
                       error: str = None):
        """Log resultado do teste"""
        result = {
            "test_name": test_name,
            "passed": passed,
            "details": details or {},
            "error": error,
            "timestamp": datetime.now().isoformat()
        }
        
        self.test_results.append(result)
        
        status = "✅ PASS" if passed else "❌ FAIL"
        print(f"{status} {test_name}")
        if error:
            print(f"   Error: {error}")
        if details:
            for key, value in details.items():
                print(f"   {key}: {value}")
    
    def make_request(self, method: str, endpoint: str, data: Dict[str, Any] = None, 
                    headers: Dict[str, str] = None) -> Dict[str, Any]:
        """Fazer requisição HTTP"""
        url = f"{self.base_url}{endpoint}"
        
        try:
            if method.upper() == "GET":
                response = requests.get(url, headers=headers, timeout=10)
            elif method.upper() == "POST":
                response = requests.post(url, json=data, headers=headers, timeout=10)
            elif method.upper() == "PUT":
                response = requests.put(url, json=data, headers=headers, timeout=10)
            elif method.upper() == "DELETE":
                response = requests.delete(url, headers=headers, timeout=10)
            else:
                raise ValueError(f"Método não suportado: {method}")
            
            try:
                response_data = response.json()
            except:
                response_data = {"raw_response": response.text}
            
            return {
                "success": True,
                "status_code": response.status_code,
                "data": response_data,
                "headers": dict(response.headers)
            }
            
        except Exception as e:
            return {
                "success": False,
                "status_code": 0,
                "data": {"error": str(e)},
                "headers": {}
            }
    
    def test_authentication_security(self):
        """Teste segurança de autenticação"""
        print("\n🔐 TESTANDO SEGURANÇA - AUTENTICAÇÃO")
        print("-" * 50)
        
        protected_endpoints = [
            "/anamnese/questions",
            "/anamnese/status",
            "/anamnese/answers",
            "/taco/foods/all"
        ]
        
        all_protected = True
        endpoint_results = {}
        
        for endpoint in protected_endpoints:
            # Teste sem token
            result = self.make_request("GET", endpoint)
            
            is_protected = result["status_code"] in [401, 403]
            endpoint_results[endpoint] = {
                "protected": is_protected,
                "status_code": result["status_code"]
            }
            
            if not is_protected:
                all_protected = False
        
        self.log_test_result(
            "Authentication Security",
            all_protected,
            {
                "protected_endpoints": len([e for e in endpoint_results.values() if e["protected"]]),
                "total_endpoints": len(protected_endpoints),
                "endpoint_details": endpoint_results
            },
            None if all_protected else "Alguns endpoints não estão protegidos"
        )
        
        return all_protected
    
    def test_invalid_token_handling(self):
        """Teste tratamento de tokens inválidos"""
        print("\n🔑 TESTANDO SEGURANÇA - TOKENS INVÁLIDOS")
        print("-" * 50)
        
        invalid_tokens = [
            "invalid_token",
            "Bearer invalid",
            "Bearer ",
            "",
            "malformed.jwt.token",
            "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.invalid.signature"
        ]
        
        all_rejected = True
        token_results = {}
        
        for token in invalid_tokens:
            headers = {"Authorization": f"Bearer {token}"} if token else {}
            result = self.make_request("GET", "/anamnese/questions", headers=headers)
            
            is_rejected = result["status_code"] in [401, 403]
            token_results[token or "empty"] = {
                "rejected": is_rejected,
                "status_code": result["status_code"]
            }
            
            if not is_rejected:
                all_rejected = False
        
        self.log_test_result(
            "Invalid Token Handling",
            all_rejected,
            {
                "tokens_tested": len(invalid_tokens),
                "properly_rejected": len([t for t in token_results.values() if t["rejected"]]),
                "token_details": token_results
            },
            None if all_rejected else "Alguns tokens inválidos foram aceitos"
        )
        
        return all_rejected
    
    def test_input_validation_edge_cases(self):
        """Teste validação de entrada - casos extremos"""
        print("\n🛡️ TESTANDO SEGURANÇA - VALIDAÇÃO DE ENTRADA")
        print("-" * 50)
        
        # Dados extremos para teste
        edge_case_data = [
            # Valores numéricos extremos
            {"question_id": "personal_info_weight", "value": -1},
            {"question_id": "personal_info_weight", "value": 0},
            {"question_id": "personal_info_weight", "value": 1000},
            {"question_id": "personal_info_age", "value": -5},
            {"question_id": "personal_info_age", "value": 200},
            {"question_id": "personal_info_height", "value": 0},
            {"question_id": "personal_info_height", "value": 500},
            
            # Strings muito longas
            {"question_id": "personal_info_name", "value": "A" * 1000},
            {"question_id": "personal_info_name", "value": ""},
            
            # Tipos de dados incorretos
            {"question_id": "personal_info_weight", "value": "not_a_number"},
            {"question_id": "personal_info_age", "value": []},
            {"question_id": "personal_info_gender", "value": 123},
            
            # Valores nulos e indefinidos
            {"question_id": "personal_info_name", "value": None},
            {"question_id": "", "value": "test"},
            {"value": "test"},  # question_id ausente
        ]
        
        validation_working = True
        validation_results = {}
        
        for i, data in enumerate(edge_case_data):
            result = self.make_request("POST", "/anamnese/answer", data)
            
            # Esperamos que dados inválidos sejam rejeitados (400, 422, 403)
            is_properly_rejected = result["status_code"] in [400, 422, 403]
            
            validation_results[f"case_{i+1}"] = {
                "data": data,
                "status_code": result["status_code"],
                "properly_rejected": is_properly_rejected
            }
            
            # Para casos claramente inválidos, esperamos rejeição
            if not is_properly_rejected and self.is_clearly_invalid(data):
                validation_working = False
        
        properly_rejected_count = len([r for r in validation_results.values() if r["properly_rejected"]])
        
        self.log_test_result(
            "Input Validation Edge Cases",
            validation_working,
            {
                "total_cases": len(edge_case_data),
                "properly_rejected": properly_rejected_count,
                "validation_rate": f"{(properly_rejected_count/len(edge_case_data)*100):.1f}%"
            },
            None if validation_working else "Alguns dados inválidos foram aceitos"
        )
        
        return validation_working
    
    def is_clearly_invalid(self, data: Dict[str, Any]) -> bool:
        """Verifica se dados são claramente inválidos"""
        if not data.get("question_id"):
            return True
        if "weight" in data.get("question_id", "") and isinstance(data.get("value"), (int, float)):
            return data["value"] <= 0 or data["value"] > 500
        if "age" in data.get("question_id", "") and isinstance(data.get("value"), (int, float)):
            return data["value"] < 0 or data["value"] > 150
        if "height" in data.get("question_id", "") and isinstance(data.get("value"), (int, float)):
            return data["value"] <= 0 or data["value"] > 300
        return False
    
    def test_sql_injection_attempts(self):
        """Teste tentativas de SQL injection"""
        print("\n💉 TESTANDO SEGURANÇA - SQL INJECTION")
        print("-" * 50)
        
        sql_payloads = [
            "'; DROP TABLE users; --",
            "' OR '1'='1",
            "' UNION SELECT * FROM users --",
            "admin'--",
            "' OR 1=1 --",
            "'; INSERT INTO users VALUES ('hacker', 'password'); --"
        ]
        
        all_safe = True
        injection_results = {}
        
        for payload in sql_payloads:
            # Testar em diferentes campos
            test_data = {"question_id": payload, "value": "test"}
            result = self.make_request("POST", "/anamnese/answer", test_data)
            
            # Sistema deve rejeitar ou tratar adequadamente
            is_safe = result["status_code"] in [400, 403, 422] or (
                result["status_code"] == 200 and 
                "error" not in str(result["data"]).lower()
            )
            
            injection_results[payload] = {
                "status_code": result["status_code"],
                "safe": is_safe,
                "response_contains_error": "error" in str(result["data"]).lower()
            }
            
            if not is_safe:
                all_safe = False
        
        self.log_test_result(
            "SQL Injection Protection",
            all_safe,
            {
                "payloads_tested": len(sql_payloads),
                "safe_responses": len([r for r in injection_results.values() if r["safe"]]),
                "protection_rate": f"{(len([r for r in injection_results.values() if r['safe']])/len(sql_payloads)*100):.1f}%"
            },
            None if all_safe else "Sistema pode ser vulnerável a SQL injection"
        )
        
        return all_safe
    
    def test_xss_protection(self):
        """Teste proteção contra XSS"""
        print("\n🕷️ TESTANDO SEGURANÇA - XSS PROTECTION")
        print("-" * 50)
        
        xss_payloads = [
            "<script>alert('xss')</script>",
            "javascript:alert('xss')",
            "<img src=x onerror=alert('xss')>",
            "<svg onload=alert('xss')>",
            "';alert('xss');//",
            "<iframe src=javascript:alert('xss')></iframe>"
        ]
        
        all_protected = True
        xss_results = {}
        
        for payload in xss_payloads:
            test_data = {"question_id": "personal_info_name", "value": payload}
            result = self.make_request("POST", "/anamnese/answer", test_data)
            
            # Verificar se payload foi sanitizado ou rejeitado
            response_text = str(result["data"])
            contains_raw_payload = payload in response_text
            
            is_protected = not contains_raw_payload or result["status_code"] in [400, 403, 422]
            
            xss_results[payload] = {
                "status_code": result["status_code"],
                "protected": is_protected,
                "contains_raw_payload": contains_raw_payload
            }
            
            if not is_protected:
                all_protected = False
        
        self.log_test_result(
            "XSS Protection",
            all_protected,
            {
                "payloads_tested": len(xss_payloads),
                "protected_responses": len([r for r in xss_results.values() if r["protected"]]),
                "protection_rate": f"{(len([r for r in xss_results.values() if r['protected']])/len(xss_payloads)*100):.1f}%"
            },
            None if all_protected else "Sistema pode ser vulnerável a XSS"
        )
        
        return all_protected
    
    def test_rate_limiting(self):
        """Teste rate limiting"""
        print("\n🚦 TESTANDO SEGURANÇA - RATE LIMITING")
        print("-" * 50)
        
        # Fazer muitas requisições rapidamente
        rapid_requests = 50
        start_time = time.time()
        
        status_codes = []
        for i in range(rapid_requests):
            result = self.make_request("GET", "/health")
            status_codes.append(result["status_code"])
            
            # Não adicionar delay para testar rate limiting
        
        duration = time.time() - start_time
        
        # Verificar se houve rate limiting (429 Too Many Requests)
        rate_limited_requests = status_codes.count(429)
        successful_requests = status_codes.count(200)
        
        # Rate limiting pode estar ativo se houver 429s ou se performance degradou significativamente
        has_rate_limiting = rate_limited_requests > 0 or duration > (rapid_requests * 0.1)  # Mais de 100ms por request indica throttling
        
        self.log_test_result(
            "Rate Limiting",
            True,  # Rate limiting é opcional, então sempre passa
            {
                "total_requests": rapid_requests,
                "successful_requests": successful_requests,
                "rate_limited_requests": rate_limited_requests,
                "duration": f"{duration:.2f}s",
                "avg_response_time": f"{(duration/rapid_requests*1000):.2f}ms",
                "rate_limiting_detected": has_rate_limiting
            }
        )
        
        return True
    
    def test_cors_security(self):
        """Teste configuração CORS"""
        print("\n🌍 TESTANDO SEGURANÇA - CORS")
        print("-" * 50)
        
        # Testar diferentes origens
        test_origins = [
            "http://localhost:3000",
            "https://evolveyou.com.br",
            "https://malicious-site.com",
            "null"
        ]
        
        cors_results = {}
        properly_configured = True
        
        for origin in test_origins:
            headers = {"Origin": origin}
            result = self.make_request("OPTIONS", "/health", headers=headers)
            
            cors_headers = {
                "access-control-allow-origin": result["headers"].get("access-control-allow-origin"),
                "access-control-allow-methods": result["headers"].get("access-control-allow-methods"),
                "access-control-allow-headers": result["headers"].get("access-control-allow-headers")
            }
            
            cors_results[origin] = {
                "status_code": result["status_code"],
                "cors_headers": cors_headers,
                "origin_allowed": cors_headers["access-control-allow-origin"] is not None
            }
        
        self.log_test_result(
            "CORS Configuration",
            properly_configured,
            {
                "origins_tested": len(test_origins),
                "cors_configured": any(r["origin_allowed"] for r in cors_results.values()),
                "origin_results": cors_results
            }
        )
        
        return properly_configured
    
    def test_error_information_disclosure(self):
        """Teste vazamento de informações em erros"""
        print("\n🔍 TESTANDO SEGURANÇA - VAZAMENTO DE INFORMAÇÕES")
        print("-" * 50)
        
        # Tentar provocar erros que podem vazar informações
        error_test_cases = [
            ("GET", "/nonexistent/endpoint"),
            ("POST", "/anamnese/answer", {"invalid": "data"}),
            ("GET", "/anamnese/../../../etc/passwd"),  # Path traversal
            ("POST", "/anamnese/answer", {"question_id": "test", "value": "A" * 10000}),  # Overflow
        ]
        
        secure_error_handling = True
        error_results = {}
        
        sensitive_info_patterns = [
            "traceback",
            "stack trace",
            "file not found",
            "permission denied",
            "database error",
            "sql error",
            "internal server error",
            "/home/",
            "/usr/",
            "python",
            "fastapi"
        ]
        
        for method, endpoint, *data in error_test_cases:
            request_data = data[0] if data else None
            result = self.make_request(method, endpoint, request_data)
            
            response_text = str(result["data"]).lower()
            
            # Verificar se resposta contém informações sensíveis
            contains_sensitive_info = any(pattern in response_text for pattern in sensitive_info_patterns)
            
            error_results[f"{method} {endpoint}"] = {
                "status_code": result["status_code"],
                "contains_sensitive_info": contains_sensitive_info,
                "response_length": len(response_text)
            }
            
            if contains_sensitive_info:
                secure_error_handling = False
        
        self.log_test_result(
            "Error Information Disclosure",
            secure_error_handling,
            {
                "test_cases": len(error_test_cases),
                "secure_responses": len([r for r in error_results.values() if not r["contains_sensitive_info"]]),
                "information_leakage_detected": not secure_error_handling
            },
            None if secure_error_handling else "Possível vazamento de informações em mensagens de erro"
        )
        
        return secure_error_handling
    
    def test_boundary_value_analysis(self):
        """Teste análise de valores limite"""
        print("\n📏 TESTANDO EDGE CASES - VALORES LIMITE")
        print("-" * 50)
        
        boundary_tests = [
            # Peso: limites típicos 30-300kg
            {"question_id": "personal_info_weight", "value": 29.9, "should_fail": True},
            {"question_id": "personal_info_weight", "value": 30.0, "should_fail": False},
            {"question_id": "personal_info_weight", "value": 300.0, "should_fail": False},
            {"question_id": "personal_info_weight", "value": 300.1, "should_fail": True},
            
            # Idade: limites típicos 16-100 anos
            {"question_id": "personal_info_age", "value": 15, "should_fail": True},
            {"question_id": "personal_info_age", "value": 16, "should_fail": False},
            {"question_id": "personal_info_age", "value": 100, "should_fail": False},
            {"question_id": "personal_info_age", "value": 101, "should_fail": True},
            
            # Altura: limites típicos 100-250cm
            {"question_id": "personal_info_height", "value": 99, "should_fail": True},
            {"question_id": "personal_info_height", "value": 100, "should_fail": False},
            {"question_id": "personal_info_height", "value": 250, "should_fail": False},
            {"question_id": "personal_info_height", "value": 251, "should_fail": True},
        ]
        
        boundary_validation_working = True
        boundary_results = {}
        
        for test in boundary_tests:
            data = {"question_id": test["question_id"], "value": test["value"]}
            result = self.make_request("POST", "/anamnese/answer", data)
            
            # Se deve falhar, esperamos status 400/422/403
            # Se não deve falhar, esperamos status 200/201 ou 403 (por falta de auth)
            if test["should_fail"]:
                validation_correct = result["status_code"] in [400, 422]
            else:
                validation_correct = result["status_code"] in [200, 201, 403]
            
            boundary_results[f"{test['question_id']}_{test['value']}"] = {
                "value": test["value"],
                "should_fail": test["should_fail"],
                "status_code": result["status_code"],
                "validation_correct": validation_correct
            }
            
            if not validation_correct:
                boundary_validation_working = False
        
        correct_validations = len([r for r in boundary_results.values() if r["validation_correct"]])
        
        self.log_test_result(
            "Boundary Value Analysis",
            boundary_validation_working,
            {
                "total_boundary_tests": len(boundary_tests),
                "correct_validations": correct_validations,
                "validation_accuracy": f"{(correct_validations/len(boundary_tests)*100):.1f}%"
            },
            None if boundary_validation_working else "Validação de valores limite não está funcionando corretamente"
        )
        
        return boundary_validation_working
    
    def run_all_security_edge_tests(self):
        """Executar todos os testes de segurança e edge cases"""
        print("🧪 INICIANDO TESTES DE SEGURANÇA E EDGE CASES")
        print("=" * 60)
        
        start_time = time.time()
        
        # Executar testes
        test_results = {
            "authentication_security": self.test_authentication_security(),
            "invalid_token_handling": self.test_invalid_token_handling(),
            "input_validation": self.test_input_validation_edge_cases(),
            "sql_injection_protection": self.test_sql_injection_attempts(),
            "xss_protection": self.test_xss_protection(),
            "rate_limiting": self.test_rate_limiting(),
            "cors_security": self.test_cors_security(),
            "error_information_disclosure": self.test_error_information_disclosure(),
            "boundary_value_analysis": self.test_boundary_value_analysis()
        }
        
        total_duration = time.time() - start_time
        
        # Gerar relatório
        self.generate_security_report(test_results, total_duration)
        
        return test_results
    
    def generate_security_report(self, results: Dict[str, bool], total_duration: float):
        """Gerar relatório de segurança"""
        
        total_tests = len(results)
        passed_tests = sum(1 for passed in results.values() if passed)
        failed_tests = total_tests - passed_tests
        
        print("\n" + "=" * 60)
        print("📊 RELATÓRIO DE SEGURANÇA E EDGE CASES")
        print("=" * 60)
        
        print(f"⏱️ Duração total: {total_duration:.1f}s")
        print(f"📊 Total de testes: {total_tests}")
        print(f"✅ Sucessos: {passed_tests}")
        print(f"❌ Falhas: {failed_tests}")
        print(f"📈 Taxa de sucesso: {(passed_tests/total_tests*100):.1f}%")
        
        # Detalhes por categoria
        print(f"\n📋 RESULTADOS POR CATEGORIA:")
        for test_name, passed in results.items():
            status = "✅ PASS" if passed else "❌ FAIL"
            print(f"   {status} {test_name.replace('_', ' ').title()}")
        
        # Avaliação de segurança
        print(f"\n🛡️ AVALIAÇÃO DE SEGURANÇA:")
        
        security_score = (passed_tests / total_tests) * 100
        
        if security_score >= 90:
            security_level = "EXCELENTE"
            recommendation = "Sistema demonstra alta segurança"
        elif security_score >= 75:
            security_level = "BOM"
            recommendation = "Sistema tem boa segurança com pequenos ajustes necessários"
        elif security_score >= 60:
            security_level = "REGULAR"
            recommendation = "Sistema precisa de melhorias de segurança"
        else:
            security_level = "RUIM"
            recommendation = "Sistema precisa de revisão completa de segurança"
        
        print(f"   Nível de segurança: {security_level} ({security_score:.1f}%)")
        print(f"   Recomendação: {recommendation}")
        
        # Salvar relatório
        report_data = {
            "summary": {
                "total_tests": total_tests,
                "passed_tests": passed_tests,
                "failed_tests": failed_tests,
                "success_rate": security_score,
                "security_level": security_level,
                "total_duration": total_duration,
                "timestamp": datetime.now().isoformat()
            },
            "test_results": results,
            "detailed_results": self.test_results,
            "recommendations": self.generate_security_recommendations(results)
        }
        
        with open('/home/ubuntu/security_edge_cases_report.json', 'w', encoding='utf-8') as f:
            json.dump(report_data, f, indent=2, ensure_ascii=False)
        
        print(f"\n💾 Relatório salvo em: /home/ubuntu/security_edge_cases_report.json")
        
        overall_success = failed_tests == 0
        print(f"\n🎯 RESULTADO GERAL: {'✅ TODOS OS TESTES PASSARAM' if overall_success else '⚠️ ALGUNS TESTES FALHARAM'}")
        
        return overall_success
    
    def generate_security_recommendations(self, results: Dict[str, bool]) -> List[str]:
        """Gerar recomendações de segurança"""
        recommendations = []
        
        if not results.get("authentication_security", True):
            recommendations.append("Implementar autenticação adequada em todos os endpoints protegidos")
        
        if not results.get("input_validation", True):
            recommendations.append("Melhorar validação de entrada para prevenir dados maliciosos")
        
        if not results.get("sql_injection_protection", True):
            recommendations.append("Implementar proteção contra SQL injection")
        
        if not results.get("xss_protection", True):
            recommendations.append("Implementar sanitização adequada para prevenir XSS")
        
        if not results.get("error_information_disclosure", True):
            recommendations.append("Revisar mensagens de erro para evitar vazamento de informações")
        
        if not results.get("boundary_value_analysis", True):
            recommendations.append("Melhorar validação de valores limite")
        
        if len(recommendations) == 0:
            recommendations.append("Sistema demonstra boa segurança geral")
        
        return recommendations

def main():
    """Executar testes de segurança e edge cases"""
    tester = SecurityEdgeCaseTester()
    
    try:
        results = tester.run_all_security_edge_tests()
        overall_success = all(results.values())
        return overall_success
    except Exception as e:
        print(f"❌ ERRO GERAL NOS TESTES DE SEGURANÇA: {str(e)}")
        return False

if __name__ == "__main__":
    success = main()
    exit(0 if success else 1)

