"""
Testes de Performance Rápidos
Versão otimizada para validação técnica em tempo reduzido
"""

import requests
import time
import threading
import json
import statistics
from datetime import datetime
from typing import Dict, Any, List
import concurrent.futures
import queue

class QuickPerformanceTester:
    """Testador de performance otimizado"""
    
    def __init__(self, base_url: str = "http://localhost:8000"):
        self.base_url = base_url
        self.performance_metrics = []
        
    def log_metric(self, test_name: str, metric_type: str, value: float, 
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
    
    def make_request(self, endpoint: str) -> Dict[str, Any]:
        """Fazer requisição HTTP com medição de tempo"""
        url = f"{self.base_url}{endpoint}"
        
        start_time = time.time()
        
        try:
            response = requests.get(url, timeout=10)
            duration = time.time() - start_time
            
            return {
                "success": response.status_code < 400 or response.status_code in [403, 401],
                "status_code": response.status_code,
                "duration": duration,
                "response_size": len(response.content)
            }
            
        except Exception as e:
            duration = time.time() - start_time
            return {
                "success": False,
                "status_code": 0,
                "duration": duration,
                "response_size": 0,
                "error": str(e)
            }
    
    def test_response_time_baseline(self):
        """Teste baseline rápido"""
        print("\n⏱️ TESTANDO PERFORMANCE - BASELINE RÁPIDO")
        print("-" * 50)
        
        endpoints = ["/health", "/anamnese/questions", "/anamnese/status"]
        baseline_results = {}
        
        for endpoint in endpoints:
            response_times = []
            
            # 5 requisições por endpoint
            for i in range(5):
                result = self.make_request(endpoint)
                if result["success"]:
                    response_times.append(result["duration"] * 1000)
                time.sleep(0.1)
            
            if response_times:
                avg_time = statistics.mean(response_times)
                baseline_results[endpoint] = avg_time
                
                self.log_metric(
                    f"Baseline {endpoint}",
                    "Response Time",
                    avg_time,
                    "ms",
                    {"samples": len(response_times)}
                )
        
        return baseline_results
    
    def test_concurrent_load_quick(self):
        """Teste carga concorrente rápido"""
        print("\n🚀 TESTANDO PERFORMANCE - CARGA CONCORRENTE RÁPIDA")
        print("-" * 50)
        
        concurrent_users = 10
        duration_seconds = 5
        results_queue = queue.Queue()
        start_time = time.time()
        end_time = start_time + duration_seconds
        
        def worker():
            while time.time() < end_time:
                result = self.make_request("/health")
                results_queue.put(result)
                time.sleep(0.2)
        
        # Iniciar threads
        with concurrent.futures.ThreadPoolExecutor(max_workers=concurrent_users) as executor:
            futures = [executor.submit(worker) for _ in range(concurrent_users)]
            concurrent.futures.wait(futures)
        
        # Coletar resultados
        results = []
        while not results_queue.empty():
            results.append(results_queue.get())
        
        successful_requests = [r for r in results if r["success"]]
        
        if successful_requests:
            response_times = [r["duration"] * 1000 for r in successful_requests]
            avg_response_time = statistics.mean(response_times)
            throughput = len(successful_requests) / duration_seconds
            
            self.log_metric(
                "Quick Concurrent Load",
                "Throughput",
                throughput,
                "req/s",
                {
                    "concurrent_users": concurrent_users,
                    "duration": f"{duration_seconds}s",
                    "total_requests": len(results),
                    "successful_requests": len(successful_requests),
                    "avg_response_time": f"{avg_response_time:.2f}ms",
                    "success_rate": f"{(len(successful_requests)/len(results)*100):.1f}%"
                }
            )
            
            return {
                "throughput": throughput,
                "avg_response_time": avg_response_time,
                "success_rate": len(successful_requests)/len(results)*100
            }
        
        return {"throughput": 0, "avg_response_time": 0, "success_rate": 0}
    
    def test_stress_quick(self):
        """Teste stress rápido"""
        print("\n📈 TESTANDO PERFORMANCE - STRESS RÁPIDO")
        print("-" * 50)
        
        load_levels = [1, 5, 10, 15]
        stress_results = {}
        
        for load_level in load_levels:
            results_queue = queue.Queue()
            test_duration = 3  # 3 segundos por nível
            start_time = time.time()
            end_time = start_time + test_duration
            
            def stress_worker():
                while time.time() < end_time:
                    result = self.make_request("/health")
                    results_queue.put(result)
                    time.sleep(0.1)
            
            with concurrent.futures.ThreadPoolExecutor(max_workers=load_level) as executor:
                futures = [executor.submit(stress_worker) for _ in range(load_level)]
                concurrent.futures.wait(futures)
            
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
                    "success_rate": len(successful_requests) / len(results) * 100
                }
                
                print(f"   {load_level} usuários: {throughput:.1f} req/s, {avg_response_time:.2f}ms")
        
        # Log resultado final
        if stress_results:
            max_throughput = max(result["throughput"] for result in stress_results.values())
            optimal_load = max(stress_results.keys(), key=lambda k: stress_results[k]["throughput"])
            
            self.log_metric(
                "Quick Stress Test",
                "Max Throughput",
                max_throughput,
                "req/s",
                {
                    "optimal_load": f"{optimal_load} concurrent users",
                    "load_levels_tested": len(load_levels)
                }
            )
        
        return stress_results
    
    def test_endpoint_performance(self):
        """Teste performance por endpoint"""
        print("\n🎯 TESTANDO PERFORMANCE - POR ENDPOINT")
        print("-" * 50)
        
        endpoints = [
            "/health",
            "/anamnese/questions", 
            "/anamnese/status",
            "/taco/foods/all"
        ]
        
        endpoint_results = {}
        
        for endpoint in endpoints:
            response_times = []
            response_sizes = []
            
            # 10 requisições por endpoint
            for i in range(10):
                result = self.make_request(endpoint)
                
                if result["success"]:
                    response_times.append(result["duration"] * 1000)
                    response_sizes.append(result["response_size"])
                
                time.sleep(0.05)
            
            if response_times:
                endpoint_results[endpoint] = {
                    "avg_response_time": statistics.mean(response_times),
                    "min_response_time": min(response_times),
                    "max_response_time": max(response_times),
                    "avg_response_size": statistics.mean(response_sizes),
                    "samples": len(response_times)
                }
                
                print(f"   {endpoint}: {endpoint_results[endpoint]['avg_response_time']:.2f}ms avg")
        
        return endpoint_results
    
    def run_quick_performance_tests(self):
        """Executar todos os testes rápidos"""
        print("🧪 INICIANDO TESTES DE PERFORMANCE RÁPIDOS")
        print("=" * 60)
        
        start_time = time.time()
        
        # Executar testes
        baseline_results = self.test_response_time_baseline()
        concurrent_results = self.test_concurrent_load_quick()
        stress_results = self.test_stress_quick()
        endpoint_results = self.test_endpoint_performance()
        
        total_duration = time.time() - start_time
        
        # Gerar relatório
        self.generate_quick_report({
            "baseline": baseline_results,
            "concurrent_load": concurrent_results,
            "stress_test": stress_results,
            "endpoint_specific": endpoint_results
        }, total_duration)
        
        return True
    
    def generate_quick_report(self, results: Dict[str, Any], total_duration: float):
        """Gerar relatório rápido"""
        
        print("\n" + "=" * 60)
        print("📊 RELATÓRIO DE PERFORMANCE RÁPIDO")
        print("=" * 60)
        
        print(f"⏱️ Duração total: {total_duration:.1f}s")
        print(f"📊 Métricas coletadas: {len(self.performance_metrics)}")
        
        # Principais descobertas
        print(f"\n🎯 PRINCIPAIS DESCOBERTAS:")
        
        if "concurrent_load" in results:
            concurrent = results["concurrent_load"]
            print(f"   Throughput: {concurrent.get('throughput', 0):.1f} req/s")
            print(f"   Tempo médio: {concurrent.get('avg_response_time', 0):.2f}ms")
            print(f"   Taxa de sucesso: {concurrent.get('success_rate', 0):.1f}%")
        
        if "stress_test" in results:
            stress = results["stress_test"]
            if stress:
                max_throughput = max(result["throughput"] for result in stress.values())
                print(f"   Throughput máximo: {max_throughput:.1f} req/s")
        
        # Avaliação geral
        print(f"\n📈 AVALIAÇÃO GERAL:")
        
        if "concurrent_load" in results:
            throughput = results["concurrent_load"].get("throughput", 0)
            response_time = results["concurrent_load"].get("avg_response_time", 0)
            success_rate = results["concurrent_load"].get("success_rate", 0)
            
            if throughput > 15 and response_time < 20 and success_rate > 90:
                print("   ✅ EXCELENTE - Sistema com alta performance")
            elif throughput > 8 and response_time < 50 and success_rate > 80:
                print("   ✅ BOM - Sistema com performance adequada")
            elif throughput > 3 and response_time < 100 and success_rate > 70:
                print("   ⚠️ REGULAR - Sistema precisa de otimizações")
            else:
                print("   ❌ RUIM - Sistema precisa de melhorias significativas")
        
        # Salvar relatório
        report_data = {
            "summary": {
                "total_duration": total_duration,
                "metrics_collected": len(self.performance_metrics),
                "timestamp": datetime.now().isoformat()
            },
            "test_results": results,
            "performance_metrics": self.performance_metrics
        }
        
        with open('/home/ubuntu/performance_quick_report.json', 'w', encoding='utf-8') as f:
            json.dump(report_data, f, indent=2, ensure_ascii=False)
        
        print(f"\n💾 Relatório salvo em: /home/ubuntu/performance_quick_report.json")
        print(f"\n🎯 RESULTADO: ✅ TESTES DE PERFORMANCE CONCLUÍDOS")

def main():
    """Executar testes rápidos"""
    tester = QuickPerformanceTester()
    
    try:
        success = tester.run_quick_performance_tests()
        return success
    except Exception as e:
        print(f"❌ ERRO: {str(e)}")
        return False

if __name__ == "__main__":
    success = main()
    exit(0 if success else 1)

