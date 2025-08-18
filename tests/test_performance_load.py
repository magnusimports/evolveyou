"""
Testes de Performance e Carga
Valida comportamento do sistema sob diferentes níveis de carga
"""

import requests
import time
import threading
import json
import statistics
from datetime import datetime, timedelta
from typing import Dict, Any, List, Tuple
import concurrent.futures
import queue
import psutil
import os

class PerformanceTester:
    """Testador de performance e carga"""
    
    def __init__(self, base_url: str = "http://localhost:8000"):
        self.base_url = base_url
        self.test_results = []
        self.performance_metrics = []
        
    def log_performance_metric(self, test_name: str, metric_type: str, value: float, 
                              unit: str, details: Dict[str, Any] = None):
        """Log métrica de performance"""
        metric = {
            "test_name": test_name,
            "metric_type": metric_type,
            "value": value,
            "unit": unit,
            "details": details or {},
            "timestamp": datetime.now().isoformat()
        }
        
        self.performance_metrics.append(metric)
        print(f"📊 {test_name} - {metric_type}: {value:.2f} {unit}")
        
        if details:
            for key, val in details.items():
                print(f"   {key}: {val}")
    
    def make_request(self, endpoint: str, method: str = "GET", data: Dict[str, Any] = None) -> Dict[str, Any]:
        """Fazer requisição HTTP com medição de tempo"""
        url = f"{self.base_url}{endpoint}"
        
        start_time = time.time()
        start_cpu = psutil.cpu_percent()
        start_memory = psutil.virtual_memory().percent
        
        try:
            if method.upper() == "GET":
                response = requests.get(url, timeout=30)
            elif method.upper() == "POST":
                response = requests.post(url, json=data, timeout=30)
            else:
                raise ValueError(f"Método não suportado: {method}")
            
            end_time = time.time()
            end_cpu = psutil.cpu_percent()
            end_memory = psutil.virtual_memory().percent
            
            duration = end_time - start_time
            
            return {
                "success": response.status_code < 400,
                "status_code": response.status_code,
                "duration": duration,
                "response_size": len(response.content),
                "cpu_usage": end_cpu - start_cpu,
                "memory_usage": end_memory - start_memory,
                "data": response.json() if response.headers.get('content-type', '').startswith('application/json') else response.text
            }
            
        except Exception as e:
            end_time = time.time()
            duration = end_time - start_time
            
            return {
                "success": False,
                "status_code": 0,
                "duration": duration,
                "response_size": 0,
                "cpu_usage": 0,
                "memory_usage": 0,
                "error": str(e),
                "data": None
            }
    
    def test_response_time_baseline(self):
        """Teste baseline de tempo de resposta"""
        print("\n⏱️ TESTANDO PERFORMANCE - BASELINE TEMPO DE RESPOSTA")
        print("-" * 60)
        
        endpoints = [
            "/health",
            "/anamnese/questions",
            "/anamnese/status", 
            "/taco/foods/all"
        ]
        
        baseline_results = {}
        
        for endpoint in endpoints:
            response_times = []
            
            # Fazer 10 requisições para cada endpoint
            for i in range(10):
                result = self.make_request(endpoint)
                if result["success"] or result["status_code"] in [403, 401]:  # 403/401 são respostas válidas
                    response_times.append(result["duration"] * 1000)  # Converter para ms
                time.sleep(0.1)  # Pequena pausa entre requisições
            
            if response_times:
                avg_time = statistics.mean(response_times)
                min_time = min(response_times)
                max_time = max(response_times)
                p95_time = statistics.quantiles(response_times, n=20)[18] if len(response_times) >= 20 else max_time
                
                baseline_results[endpoint] = {
                    "avg_ms": avg_time,
                    "min_ms": min_time,
                    "max_ms": max_time,
                    "p95_ms": p95_time,
                    "samples": len(response_times)
                }
                
                self.log_performance_metric(
                    f"Baseline {endpoint}",
                    "Response Time",
                    avg_time,
                    "ms",
                    {
                        "min": f"{min_time:.2f}ms",
                        "max": f"{max_time:.2f}ms",
                        "p95": f"{p95_time:.2f}ms",
                        "samples": len(response_times)
                    }
                )
        
        return baseline_results
    
    def test_concurrent_load(self, concurrent_users: int = 50, duration_seconds: int = 30):
        """Teste de carga com usuários concorrentes"""
        print(f"\n🚀 TESTANDO PERFORMANCE - CARGA CONCORRENTE ({concurrent_users} usuários)")
        print("-" * 60)
        
        results_queue = queue.Queue()
        start_time = time.time()
        end_time = start_time + duration_seconds
        
        def worker():
            """Worker thread para simular usuário"""
            while time.time() < end_time:
                result = self.make_request("/health")
                results_queue.put(result)
                time.sleep(0.1)  # Simular tempo entre requisições
        
        # Iniciar threads
        threads = []
        for i in range(concurrent_users):
            thread = threading.Thread(target=worker)
            thread.daemon = True
            thread.start()
            threads.append(thread)
        
        # Aguardar conclusão
        for thread in threads:
            thread.join()
        
        # Coletar resultados
        results = []
        while not results_queue.empty():
            results.append(results_queue.get())
        
        # Analisar resultados
        successful_requests = [r for r in results if r["success"]]
        failed_requests = [r for r in results if not r["success"]]
        
        if successful_requests:
            response_times = [r["duration"] * 1000 for r in successful_requests]
            avg_response_time = statistics.mean(response_times)
            p95_response_time = statistics.quantiles(response_times, n=20)[18] if len(response_times) >= 20 else max(response_times)
            throughput = len(successful_requests) / duration_seconds
            
            self.log_performance_metric(
                "Concurrent Load Test",
                "Throughput",
                throughput,
                "req/s",
                {
                    "concurrent_users": concurrent_users,
                    "duration": f"{duration_seconds}s",
                    "total_requests": len(results),
                    "successful_requests": len(successful_requests),
                    "failed_requests": len(failed_requests),
                    "avg_response_time": f"{avg_response_time:.2f}ms",
                    "p95_response_time": f"{p95_response_time:.2f}ms",
                    "error_rate": f"{(len(failed_requests)/len(results)*100):.1f}%"
                }
            )
        
        return {
            "total_requests": len(results),
            "successful_requests": len(successful_requests),
            "failed_requests": len(failed_requests),
            "throughput": throughput if successful_requests else 0,
            "avg_response_time": avg_response_time if successful_requests else 0
        }
    
    def test_stress_increasing_load(self):
        """Teste de stress com carga crescente"""
        print("\n📈 TESTANDO PERFORMANCE - STRESS CARGA CRESCENTE")
        print("-" * 60)
        
        load_levels = [1, 5, 10, 20, 30, 50]
        stress_results = {}
        
        for load_level in load_levels:
            print(f"\n   Testando com {load_level} usuários concorrentes...")
            
            results_queue = queue.Queue()
            test_duration = 10  # 10 segundos por nível
            start_time = time.time()
            end_time = start_time + test_duration
            
            def stress_worker():
                while time.time() < end_time:
                    result = self.make_request("/health")
                    results_queue.put(result)
                    time.sleep(0.05)  # Requisições mais frequentes
            
            # Iniciar threads
            threads = []
            for i in range(load_level):
                thread = threading.Thread(target=stress_worker)
                thread.daemon = True
                thread.start()
                threads.append(thread)
            
            # Aguardar conclusão
            for thread in threads:
                thread.join()
            
            # Coletar resultados
            results = []
            while not results_queue.empty():
                results.append(results_queue.get())
            
            successful_requests = [r for r in results if r["success"]]
            
            if successful_requests:
                response_times = [r["duration"] * 1000 for r in successful_requests]
                avg_response_time = statistics.mean(response_times)
                throughput = len(successful_requests) / test_duration
                
                stress_results[load_level] = {
                    "throughput": throughput,
                    "avg_response_time": avg_response_time,
                    "total_requests": len(results),
                    "success_rate": len(successful_requests) / len(results) * 100
                }
                
                print(f"      Throughput: {throughput:.1f} req/s")
                print(f"      Tempo médio: {avg_response_time:.2f}ms")
                print(f"      Taxa de sucesso: {stress_results[load_level]['success_rate']:.1f}%")
        
        # Log resultado final
        max_throughput = max(result["throughput"] for result in stress_results.values())
        optimal_load = max(stress_results.keys(), key=lambda k: stress_results[k]["throughput"])
        
        self.log_performance_metric(
            "Stress Test",
            "Max Throughput",
            max_throughput,
            "req/s",
            {
                "optimal_load": f"{optimal_load} concurrent users",
                "load_levels_tested": len(load_levels),
                "degradation_point": self.find_degradation_point(stress_results)
            }
        )
        
        return stress_results
    
    def find_degradation_point(self, stress_results: Dict[int, Dict[str, float]]) -> str:
        """Encontrar ponto de degradação da performance"""
        load_levels = sorted(stress_results.keys())
        
        for i in range(1, len(load_levels)):
            current_load = load_levels[i]
            previous_load = load_levels[i-1]
            
            current_response_time = stress_results[current_load]["avg_response_time"]
            previous_response_time = stress_results[previous_load]["avg_response_time"]
            
            # Se tempo de resposta aumentou mais de 50%
            if current_response_time > previous_response_time * 1.5:
                return f"Degradação detectada entre {previous_load} e {current_load} usuários"
        
        return "Nenhuma degradação significativa detectada"
    
    def test_memory_usage_under_load(self):
        """Teste uso de memória sob carga"""
        print("\n🧠 TESTANDO PERFORMANCE - USO DE MEMÓRIA SOB CARGA")
        print("-" * 60)
        
        # Medição inicial
        initial_memory = psutil.virtual_memory().percent
        memory_samples = [initial_memory]
        
        # Fazer muitas requisições para observar uso de memória
        for i in range(100):
            self.make_request("/health")
            
            if i % 10 == 0:  # Amostra a cada 10 requisições
                current_memory = psutil.virtual_memory().percent
                memory_samples.append(current_memory)
            
            time.sleep(0.05)
        
        final_memory = psutil.virtual_memory().percent
        max_memory = max(memory_samples)
        avg_memory = statistics.mean(memory_samples)
        memory_increase = final_memory - initial_memory
        
        self.log_performance_metric(
            "Memory Usage Test",
            "Memory Increase",
            memory_increase,
            "%",
            {
                "initial_memory": f"{initial_memory:.1f}%",
                "final_memory": f"{final_memory:.1f}%",
                "max_memory": f"{max_memory:.1f}%",
                "avg_memory": f"{avg_memory:.1f}%",
                "requests_made": 100
            }
        )
        
        return {
            "initial_memory": initial_memory,
            "final_memory": final_memory,
            "memory_increase": memory_increase,
            "max_memory": max_memory
        }
    
    def test_endpoint_specific_performance(self):
        """Teste performance específica por endpoint"""
        print("\n🎯 TESTANDO PERFORMANCE - ESPECÍFICA POR ENDPOINT")
        print("-" * 60)
        
        endpoints = [
            ("/health", "GET"),
            ("/anamnese/questions", "GET"),
            ("/anamnese/status", "GET"),
            ("/taco/foods/all", "GET")
        ]
        
        endpoint_results = {}
        
        for endpoint, method in endpoints:
            print(f"\n   Testando {method} {endpoint}...")
            
            response_times = []
            response_sizes = []
            cpu_usage = []
            
            # 20 requisições por endpoint
            for i in range(20):
                result = self.make_request(endpoint, method)
                
                # Considerar 403/401 como respostas válidas para endpoints protegidos
                if result["success"] or result["status_code"] in [403, 401]:
                    response_times.append(result["duration"] * 1000)
                    response_sizes.append(result["response_size"])
                    cpu_usage.append(result["cpu_usage"])
                
                time.sleep(0.1)
            
            if response_times:
                endpoint_results[endpoint] = {
                    "avg_response_time": statistics.mean(response_times),
                    "min_response_time": min(response_times),
                    "max_response_time": max(response_times),
                    "avg_response_size": statistics.mean(response_sizes),
                    "avg_cpu_usage": statistics.mean(cpu_usage),
                    "samples": len(response_times)
                }
                
                print(f"      Tempo médio: {endpoint_results[endpoint]['avg_response_time']:.2f}ms")
                print(f"      Tamanho médio: {endpoint_results[endpoint]['avg_response_size']} bytes")
                print(f"      CPU médio: {endpoint_results[endpoint]['avg_cpu_usage']:.1f}%")
        
        return endpoint_results
    
    def test_sustained_load(self, duration_minutes: int = 2):
        """Teste carga sustentada"""
        print(f"\n⏳ TESTANDO PERFORMANCE - CARGA SUSTENTADA ({duration_minutes} min)")
        print("-" * 60)
        
        duration_seconds = duration_minutes * 60
        start_time = time.time()
        end_time = start_time + duration_seconds
        
        results = []
        request_count = 0
        
        while time.time() < end_time:
            result = self.make_request("/health")
            results.append(result)
            request_count += 1
            
            # Log progresso a cada 30 segundos
            elapsed = time.time() - start_time
            if request_count % 100 == 0:
                progress = (elapsed / duration_seconds) * 100
                print(f"      Progresso: {progress:.1f}% - {request_count} requisições")
            
            time.sleep(0.3)  # 1 requisição a cada 300ms
        
        # Analisar resultados
        successful_requests = [r for r in results if r["success"]]
        response_times = [r["duration"] * 1000 for r in successful_requests]
        
        if response_times:
            avg_response_time = statistics.mean(response_times)
            throughput = len(successful_requests) / duration_seconds
            
            # Verificar estabilidade (variação do tempo de resposta)
            response_time_std = statistics.stdev(response_times) if len(response_times) > 1 else 0
            stability_coefficient = response_time_std / avg_response_time if avg_response_time > 0 else 0
            
            self.log_performance_metric(
                "Sustained Load Test",
                "Stability",
                stability_coefficient,
                "coefficient",
                {
                    "duration": f"{duration_minutes} minutes",
                    "total_requests": len(results),
                    "successful_requests": len(successful_requests),
                    "avg_response_time": f"{avg_response_time:.2f}ms",
                    "response_time_std": f"{response_time_std:.2f}ms",
                    "throughput": f"{throughput:.2f} req/s",
                    "stability_rating": "Excellent" if stability_coefficient < 0.2 else "Good" if stability_coefficient < 0.5 else "Poor"
                }
            )
        
        return {
            "total_requests": len(results),
            "successful_requests": len(successful_requests),
            "avg_response_time": avg_response_time if response_times else 0,
            "stability_coefficient": stability_coefficient,
            "throughput": throughput if response_times else 0
        }
    
    def run_all_performance_tests(self):
        """Executar todos os testes de performance"""
        print("🧪 INICIANDO TESTES DE PERFORMANCE E CARGA")
        print("=" * 60)
        
        start_time = time.time()
        
        # Executar testes
        baseline_results = self.test_response_time_baseline()
        concurrent_results = self.test_concurrent_load(concurrent_users=20, duration_seconds=15)
        stress_results = self.test_stress_increasing_load()
        memory_results = self.test_memory_usage_under_load()
        endpoint_results = self.test_endpoint_specific_performance()
        sustained_results = self.test_sustained_load(duration_minutes=1)  # 1 minuto para teste rápido
        
        total_duration = time.time() - start_time
        
        # Gerar relatório
        self.generate_performance_report({
            "baseline": baseline_results,
            "concurrent_load": concurrent_results,
            "stress_test": stress_results,
            "memory_usage": memory_results,
            "endpoint_specific": endpoint_results,
            "sustained_load": sustained_results
        }, total_duration)
        
        return True
    
    def generate_performance_report(self, results: Dict[str, Any], total_duration: float):
        """Gerar relatório de performance"""
        
        print("\n" + "=" * 60)
        print("📊 RELATÓRIO DE PERFORMANCE E CARGA")
        print("=" * 60)
        
        # Resumo executivo
        print(f"⏱️ Duração total dos testes: {total_duration:.1f}s")
        print(f"📊 Métricas coletadas: {len(self.performance_metrics)}")
        
        # Principais descobertas
        print(f"\n🎯 PRINCIPAIS DESCOBERTAS:")
        
        if "concurrent_load" in results:
            concurrent = results["concurrent_load"]
            print(f"   Throughput máximo: {concurrent.get('throughput', 0):.1f} req/s")
            print(f"   Tempo médio de resposta: {concurrent.get('avg_response_time', 0):.2f}ms")
        
        if "memory_usage" in results:
            memory = results["memory_usage"]
            print(f"   Aumento de memória: {memory.get('memory_increase', 0):.1f}%")
        
        if "sustained_load" in results:
            sustained = results["sustained_load"]
            stability = sustained.get('stability_coefficient', 0)
            rating = "Excelente" if stability < 0.2 else "Boa" if stability < 0.5 else "Ruim"
            print(f"   Estabilidade: {rating} (coef: {stability:.3f})")
        
        # Recomendações
        print(f"\n💡 RECOMENDAÇÕES:")
        
        if "concurrent_load" in results:
            throughput = results["concurrent_load"].get("throughput", 0)
            if throughput > 50:
                print("   ✅ Sistema suporta alta carga concorrente")
            elif throughput > 20:
                print("   ⚠️ Sistema suporta carga moderada - considerar otimizações")
            else:
                print("   ❌ Sistema precisa de otimizações para carga concorrente")
        
        if "memory_usage" in results:
            memory_increase = results["memory_usage"].get("memory_increase", 0)
            if memory_increase < 5:
                print("   ✅ Uso de memória estável")
            elif memory_increase < 15:
                print("   ⚠️ Aumento moderado de memória - monitorar")
            else:
                print("   ❌ Possível vazamento de memória - investigar")
        
        # Salvar relatório detalhado
        report_data = {
            "summary": {
                "total_duration": total_duration,
                "metrics_collected": len(self.performance_metrics),
                "timestamp": datetime.now().isoformat()
            },
            "test_results": results,
            "performance_metrics": self.performance_metrics,
            "recommendations": self.generate_recommendations(results)
        }
        
        with open('/home/ubuntu/performance_test_report.json', 'w', encoding='utf-8') as f:
            json.dump(report_data, f, indent=2, ensure_ascii=False)
        
        print(f"\n💾 Relatório detalhado salvo em: /home/ubuntu/performance_test_report.json")
        print(f"\n🎯 RESULTADO GERAL: ✅ TESTES DE PERFORMANCE CONCLUÍDOS")
    
    def generate_recommendations(self, results: Dict[str, Any]) -> List[str]:
        """Gerar recomendações baseadas nos resultados"""
        recommendations = []
        
        # Análise de throughput
        if "concurrent_load" in results:
            throughput = results["concurrent_load"].get("throughput", 0)
            if throughput < 20:
                recommendations.append("Considerar otimização de performance para carga concorrente")
            elif throughput > 100:
                recommendations.append("Excelente capacidade de throughput - sistema bem otimizado")
        
        # Análise de memória
        if "memory_usage" in results:
            memory_increase = results["memory_usage"].get("memory_increase", 0)
            if memory_increase > 10:
                recommendations.append("Investigar possível vazamento de memória")
            elif memory_increase < 2:
                recommendations.append("Uso de memória muito eficiente")
        
        # Análise de estabilidade
        if "sustained_load" in results:
            stability = results["sustained_load"].get("stability_coefficient", 0)
            if stability > 0.5:
                recommendations.append("Melhorar estabilidade do tempo de resposta")
            elif stability < 0.1:
                recommendations.append("Excelente estabilidade de performance")
        
        return recommendations

def main():
    """Executar testes de performance"""
    tester = PerformanceTester()
    
    try:
        success = tester.run_all_performance_tests()
        return success
    except Exception as e:
        print(f"❌ ERRO GERAL NOS TESTES DE PERFORMANCE: {str(e)}")
        return False

if __name__ == "__main__":
    success = main()
    exit(0 if success else 1)

