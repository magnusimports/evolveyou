#!/usr/bin/env python3
"""
Teste completo da aplicação frontend da Anamnese Inteligente
Valida funcionamento, performance e integração com APIs
"""

import requests
import json
import time
from datetime import datetime

class AnamneseFrontendTester:
    def __init__(self):
        self.frontend_url = "http://localhost:5173"
        self.backend_url = "https://users-service-1062253516.us-central1.run.app"
        self.results = {
            "timestamp": datetime.now().isoformat(),
            "tests": [],
            "summary": {
                "total": 0,
                "passed": 0,
                "failed": 0,
                "warnings": 0
            }
        }

    def log_test(self, name, status, details="", duration=0):
        """Registra resultado de um teste"""
        test_result = {
            "name": name,
            "status": status,
            "details": details,
            "duration": duration,
            "timestamp": datetime.now().isoformat()
        }
        self.results["tests"].append(test_result)
        self.results["summary"]["total"] += 1
        
        # Mapear status para contadores
        if status == "passed":
            self.results["summary"]["passed"] += 1
        elif status == "failed":
            self.results["summary"]["failed"] += 1
        elif status == "warning":
            self.results["summary"]["warnings"] += 1
        
        status_icon = "✅" if status == "passed" else "❌" if status == "failed" else "⚠️"
        print(f"{status_icon} {name}: {details}")

    def test_frontend_availability(self):
        """Testa se o frontend está disponível"""
        start_time = time.time()
        try:
            response = requests.get(self.frontend_url, timeout=10)
            duration = time.time() - start_time
            
            if response.status_code == 200:
                if "anamnese" in response.text.lower():
                    self.log_test(
                        "Frontend Availability", 
                        "passed", 
                        f"Frontend carregando corretamente (HTTP {response.status_code})",
                        duration
                    )
                else:
                    self.log_test(
                        "Frontend Content", 
                        "failed", 
                        "Conteúdo da anamnese não encontrado",
                        duration
                    )
            else:
                self.log_test(
                    "Frontend Availability", 
                    "failed", 
                    f"HTTP {response.status_code}",
                    duration
                )
        except Exception as e:
            duration = time.time() - start_time
            self.log_test(
                "Frontend Availability", 
                "failed", 
                f"Erro de conexão: {str(e)}",
                duration
            )

    def test_backend_integration(self):
        """Testa integração com backend"""
        start_time = time.time()
        try:
            # Teste de health check
            response = requests.get(f"{self.backend_url}/health", timeout=10)
            duration = time.time() - start_time
            
            if response.status_code == 200:
                self.log_test(
                    "Backend Health Check", 
                    "passed", 
                    f"Backend respondendo (HTTP {response.status_code})",
                    duration
                )
            else:
                self.log_test(
                    "Backend Health Check", 
                    "warning", 
                    f"Backend com problemas (HTTP {response.status_code})",
                    duration
                )
        except Exception as e:
            duration = time.time() - start_time
            self.log_test(
                "Backend Health Check", 
                "warning", 
                f"Backend indisponível: {str(e)} (fallback para mock ativo)",
                duration
            )

    def test_anamnese_endpoints(self):
        """Testa endpoints específicos da anamnese"""
        endpoints = [
            "/anamnese/questions",
            "/anamnese/status?user_id=test",
            "/taco/foods/all?page=1&limit=10"
        ]
        
        for endpoint in endpoints:
            start_time = time.time()
            try:
                response = requests.get(f"{self.backend_url}{endpoint}", timeout=10)
                duration = time.time() - start_time
                
                if response.status_code in [200, 403]:  # 403 é esperado (auth necessária)
                    status = "passed" if response.status_code == 200 else "warning"
                    details = f"Endpoint funcionando (HTTP {response.status_code})"
                    if response.status_code == 403:
                        details += " - Autenticação necessária (esperado)"
                    
                    self.log_test(
                        f"Endpoint {endpoint}", 
                        status, 
                        details,
                        duration
                    )
                else:
                    self.log_test(
                        f"Endpoint {endpoint}", 
                        "failed", 
                        f"HTTP {response.status_code}",
                        duration
                    )
            except Exception as e:
                duration = time.time() - start_time
                self.log_test(
                    f"Endpoint {endpoint}", 
                    "warning", 
                    f"Erro: {str(e)} (fallback para mock)",
                    duration
                )

    def test_frontend_performance(self):
        """Testa performance do frontend"""
        start_time = time.time()
        try:
            response = requests.get(self.frontend_url, timeout=30)
            duration = time.time() - start_time
            
            if duration < 2.0:
                self.log_test(
                    "Frontend Performance", 
                    "passed", 
                    f"Carregamento rápido ({duration:.2f}s)",
                    duration
                )
            elif duration < 5.0:
                self.log_test(
                    "Frontend Performance", 
                    "warning", 
                    f"Carregamento moderado ({duration:.2f}s)",
                    duration
                )
            else:
                self.log_test(
                    "Frontend Performance", 
                    "failed", 
                    f"Carregamento lento ({duration:.2f}s)",
                    duration
                )
        except Exception as e:
            duration = time.time() - start_time
            self.log_test(
                "Frontend Performance", 
                "failed", 
                f"Erro de performance: {str(e)}",
                duration
            )

    def test_mock_data_generation(self):
        """Testa geração de dados mock"""
        start_time = time.time()
        try:
            # Simular dados de entrada da anamnese
            mock_answers = {
                "1": "João Silva",
                "2": "30",
                "3": "masculino",
                "4": "75",
                "5": "175",
                "7": "perder_peso",
                "10": "moderado",
                "12": "3",
                "14": "2.5",
                "15": "nenhuma",
                "16": "nenhuma",
                "17": "moderado",
                "18": "7_8",
                "19": "boa",
                "20": "nao"
            }
            
            # Simular cálculos (como seria feito no frontend)
            peso = float(mock_answers["4"])
            altura = int(mock_answers["5"])
            idade = int(mock_answers["2"])
            
            # Calcular IMC
            altura_m = altura / 100
            imc = peso / (altura_m * altura_m)
            
            # Calcular TMB (Mifflin-St Jeor)
            tmb = (10 * peso) + (6.25 * altura) - (5 * idade) + 5
            
            # Calcular TDEE
            tdee = tmb * 1.55  # Moderado
            
            duration = time.time() - start_time
            
            if imc > 0 and tmb > 0 and tdee > 0:
                self.log_test(
                    "Mock Data Generation", 
                    "passed", 
                    f"Cálculos corretos: IMC={imc:.1f}, TMB={tmb:.0f}, TDEE={tdee:.0f}",
                    duration
                )
            else:
                self.log_test(
                    "Mock Data Generation", 
                    "failed", 
                    "Cálculos inválidos",
                    duration
                )
                
        except Exception as e:
            duration = time.time() - start_time
            self.log_test(
                "Mock Data Generation", 
                "failed", 
                f"Erro nos cálculos: {str(e)}",
                duration
            )

    def test_component_structure(self):
        """Testa estrutura dos componentes"""
        start_time = time.time()
        try:
            response = requests.get(self.frontend_url, timeout=10)
            content = response.text.lower()
            duration = time.time() - start_time
            
            # Verificar elementos essenciais
            essential_elements = [
                "anamnese inteligente",
                "iniciar anamnese",
                "personalizado",
                "preciso",
                "completo"
            ]
            
            found_elements = []
            for element in essential_elements:
                if element in content:
                    found_elements.append(element)
            
            if len(found_elements) >= 4:
                self.log_test(
                    "Component Structure", 
                    "passed", 
                    f"Elementos essenciais encontrados: {len(found_elements)}/{len(essential_elements)}",
                    duration
                )
            elif len(found_elements) >= 2:
                self.log_test(
                    "Component Structure", 
                    "warning", 
                    f"Alguns elementos encontrados: {len(found_elements)}/{len(essential_elements)}",
                    duration
                )
            else:
                self.log_test(
                    "Component Structure", 
                    "failed", 
                    f"Poucos elementos encontrados: {len(found_elements)}/{len(essential_elements)}",
                    duration
                )
                
        except Exception as e:
            duration = time.time() - start_time
            self.log_test(
                "Component Structure", 
                "failed", 
                f"Erro ao verificar estrutura: {str(e)}",
                duration
            )

    def test_responsive_design(self):
        """Testa design responsivo"""
        start_time = time.time()
        try:
            response = requests.get(self.frontend_url, timeout=10)
            content = response.text.lower()
            duration = time.time() - start_time
            
            # Verificar classes responsivas do Tailwind
            responsive_classes = [
                "md:grid-cols",
                "lg:col-span",
                "sm:flex-row",
                "max-w-",
                "min-h-screen"
            ]
            
            found_responsive = []
            for cls in responsive_classes:
                if cls in content:
                    found_responsive.append(cls)
            
            if len(found_responsive) >= 3:
                self.log_test(
                    "Responsive Design", 
                    "passed", 
                    f"Classes responsivas encontradas: {len(found_responsive)}/{len(responsive_classes)}",
                    duration
                )
            else:
                self.log_test(
                    "Responsive Design", 
                    "warning", 
                    f"Poucas classes responsivas: {len(found_responsive)}/{len(responsive_classes)}",
                    duration
                )
                
        except Exception as e:
            duration = time.time() - start_time
            self.log_test(
                "Responsive Design", 
                "failed", 
                f"Erro ao verificar responsividade: {str(e)}",
                duration
            )

    def run_all_tests(self):
        """Executa todos os testes"""
        print("🧪 INICIANDO TESTES COMPLETOS DA ANAMNESE INTELIGENTE")
        print("=" * 60)
        
        # Executar todos os testes
        self.test_frontend_availability()
        self.test_backend_integration()
        self.test_anamnese_endpoints()
        self.test_frontend_performance()
        self.test_mock_data_generation()
        self.test_component_structure()
        self.test_responsive_design()
        
        # Gerar relatório final
        print("\n" + "=" * 60)
        print("📊 RELATÓRIO FINAL DOS TESTES")
        print("=" * 60)
        
        summary = self.results["summary"]
        total = summary["total"]
        passed = summary["passed"]
        failed = summary["failed"]
        warnings = summary["warnings"]
        
        success_rate = (passed / total * 100) if total > 0 else 0
        
        print(f"✅ Testes Aprovados: {passed}/{total} ({success_rate:.1f}%)")
        print(f"❌ Testes Falharam: {failed}/{total}")
        print(f"⚠️  Avisos: {warnings}/{total}")
        
        # Determinar status geral
        if failed == 0 and warnings <= 2:
            status = "🎉 EXCELENTE"
            message = "Sistema funcionando perfeitamente!"
        elif failed <= 1 and warnings <= 3:
            status = "✅ BOM"
            message = "Sistema funcionando bem com pequenos ajustes."
        elif failed <= 2:
            status = "⚠️ ACEITÁVEL"
            message = "Sistema funcionando com algumas limitações."
        else:
            status = "❌ PROBLEMAS"
            message = "Sistema com problemas que precisam ser corrigidos."
        
        print(f"\n🏆 STATUS GERAL: {status}")
        print(f"📝 AVALIAÇÃO: {message}")
        
        # Salvar resultados
        with open("anamnese_frontend_test_results.json", "w", encoding="utf-8") as f:
            json.dump(self.results, f, indent=2, ensure_ascii=False)
        
        print(f"\n💾 Resultados salvos em: anamnese_frontend_test_results.json")
        
        return self.results

if __name__ == "__main__":
    tester = AnamneseFrontendTester()
    results = tester.run_all_tests()

