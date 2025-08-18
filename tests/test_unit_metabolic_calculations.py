"""
Testes de Unidade para Cálculos Metabólicos
Valida precisão e confiabilidade dos algoritmos de cálculo
"""

import unittest
import json
import math
from datetime import datetime, date
from typing import Dict, Any, List

class MetabolicCalculatorTest:
    """Implementação dos cálculos metabólicos para teste"""
    
    def calculate_bmr(self, weight: float, height: float, age: int, gender: str, 
                     body_fat_percentage: float = None) -> float:
        """Calcular BMR usando fórmula Mifflin-St Jeor com ajuste de composição corporal"""
        
        if gender.lower() == 'masculino':
            bmr = (10 * weight) + (6.25 * height) - (5 * age) + 5
        else:
            bmr = (10 * weight) + (6.25 * height) - (5 * age) - 161
        
        # Ajuste por composição corporal
        if body_fat_percentage is not None:
            if gender.lower() == 'masculino':
                if body_fat_percentage < 10:
                    bmr *= 0.85
                elif body_fat_percentage < 15:
                    bmr *= 0.90
                elif 15 <= body_fat_percentage <= 20:
                    bmr *= 1.0
                elif 20 < body_fat_percentage <= 25:
                    bmr *= 1.05
                else:
                    bmr *= 1.10
            else:  # feminino
                if body_fat_percentage < 16:
                    bmr *= 0.85
                elif body_fat_percentage < 20:
                    bmr *= 0.90
                elif 20 <= body_fat_percentage <= 25:
                    bmr *= 1.0
                elif 25 < body_fat_percentage <= 30:
                    bmr *= 1.05
                else:
                    bmr *= 1.10
        
        return round(bmr, 2)
    
    def calculate_tdee(self, bmr: float, activity_level: str, 
                      additional_factors: Dict[str, Any] = None) -> float:
        """Calcular TDEE com fatores adicionais"""
        
        activity_factors = {
            'sedentario': 1.2,
            'levemente_ativo': 1.375,
            'moderadamente_ativo': 1.55,
            'muito_ativo': 1.725,
            'extremamente_ativo': 1.9
        }
        
        base_tdee = bmr * activity_factors.get(activity_level, 1.2)
        
        # Aplicar fatores adicionais
        if additional_factors:
            # Fator de estresse
            stress_level = additional_factors.get('stress_level', 'baixo')
            if stress_level == 'alto':
                base_tdee *= 1.1
            elif stress_level == 'muito_alto':
                base_tdee *= 1.15
            
            # Qualidade do sono
            sleep_quality = additional_factors.get('sleep_quality', 'boa')
            if sleep_quality == 'ruim':
                base_tdee *= 0.95
            elif sleep_quality == 'muito_ruim':
                base_tdee *= 0.90
            
            # Suplementos
            supplements = additional_factors.get('supplements', [])
            pharma_factors = {
                'termogenico': 1.05,
                'creatina': 1.02,
                'cafeina': 1.03,
                'pre_treino': 1.04
            }
            
            for supplement in supplements:
                if supplement in pharma_factors:
                    base_tdee *= pharma_factors[supplement]
            
            # Experiência de treino
            training_exp = additional_factors.get('training_experience', 'intermediario')
            exp_factors = {
                'iniciante': 0.95,
                'intermediario': 1.0,
                'avancado': 1.05,
                'expert': 1.10
            }
            base_tdee *= exp_factors.get(training_exp, 1.0)
        
        return round(base_tdee, 2)
    
    def calculate_macros(self, calories: float, goal: str) -> Dict[str, float]:
        """Calcular distribuição de macronutrientes"""
        
        distributions = {
            'perda_peso': {'carbs': 0.30, 'protein': 0.40, 'fat': 0.30},
            'ganho_massa': {'carbs': 0.45, 'protein': 0.30, 'fat': 0.25},
            'manutencao': {'carbs': 0.40, 'protein': 0.30, 'fat': 0.30},
            'definicao': {'carbs': 0.25, 'protein': 0.45, 'fat': 0.30},
            'performance': {'carbs': 0.50, 'protein': 0.25, 'fat': 0.25}
        }
        
        dist = distributions.get(goal, distributions['manutencao'])
        
        return {
            'carbohydrates_g': round((calories * dist['carbs']) / 4, 1),
            'proteins_g': round((calories * dist['protein']) / 4, 1),
            'fats_g': round((calories * dist['fat']) / 9, 1),
            'carbohydrates_percent': dist['carbs'] * 100,
            'proteins_percent': dist['protein'] * 100,
            'fats_percent': dist['fat'] * 100
        }
    
    def calculate_water_intake(self, weight: float, activity_level: str, 
                              climate: str = 'temperado') -> float:
        """Calcular necessidade de água"""
        
        base_water = weight * 35  # 35ml por kg
        
        # Ajuste por atividade
        activity_multipliers = {
            'sedentario': 1.0,
            'levemente_ativo': 1.1,
            'moderadamente_ativo': 1.2,
            'muito_ativo': 1.3,
            'extremamente_ativo': 1.4
        }
        
        water_intake = base_water * activity_multipliers.get(activity_level, 1.0)
        
        # Ajuste por clima
        if climate == 'quente':
            water_intake *= 1.2
        elif climate == 'muito_quente':
            water_intake *= 1.3
        
        return round(water_intake, 0)

class TestMetabolicCalculations(unittest.TestCase):
    """Testes unitários para cálculos metabólicos"""
    
    def setUp(self):
        """Configurar teste"""
        self.calculator = MetabolicCalculatorTest()
        self.test_results = []
    
    def log_test_result(self, test_name: str, expected: float, actual: float, 
                       tolerance: float = 0.01):
        """Log resultado do teste"""
        difference = abs(expected - actual)
        passed = difference <= tolerance
        
        result = {
            'test': test_name,
            'expected': expected,
            'actual': actual,
            'difference': round(difference, 4),
            'tolerance': tolerance,
            'passed': passed,
            'timestamp': datetime.now().isoformat()
        }
        
        self.test_results.append(result)
        
        status = "✅ PASS" if passed else "❌ FAIL"
        print(f"{status} {test_name}: Expected {expected}, Got {actual} (diff: {difference:.4f})")
        
        return passed
    
    def test_bmr_male_basic(self):
        """Teste BMR básico - Homem"""
        # Homem, 30 anos, 80kg, 180cm
        # Fórmula: (10 * 80) + (6.25 * 180) - (5 * 30) + 5 = 800 + 1125 - 150 + 5 = 1780
        bmr = self.calculator.calculate_bmr(80, 180, 30, 'masculino')
        expected = 1780.0  # Valor correto calculado
        
        self.assertTrue(
            self.log_test_result('BMR Homem Básico', expected, bmr, 5.0),
            f"BMR fora da tolerância: {bmr}"
        )
    
    def test_bmr_female_basic(self):
        """Teste BMR básico - Mulher"""
        # Mulher, 25 anos, 60kg, 165cm
        # Fórmula: (10 * 60) + (6.25 * 165) - (5 * 25) - 161 = 600 + 1031.25 - 125 - 161 = 1345.25
        bmr = self.calculator.calculate_bmr(60, 165, 25, 'feminino')
        expected = 1345.25  # Valor correto calculado
        
        self.assertTrue(
            self.log_test_result('BMR Mulher Básico', expected, bmr, 5.0),
            f"BMR fora da tolerância: {bmr}"
        )
    
    def test_bmr_with_body_fat(self):
        """Teste BMR com percentual de gordura"""
        # Homem, 25 anos, 75kg, 175cm, 12% gordura
        bmr = self.calculator.calculate_bmr(75, 175, 25, 'masculino', 12.0)
        bmr_base = self.calculator.calculate_bmr(75, 175, 25, 'masculino')
        expected = bmr_base * 0.90  # 12% está na faixa 10-15%
        
        self.assertTrue(
            self.log_test_result('BMR com Gordura Corporal', expected, bmr, 5.0),
            f"BMR com gordura corporal incorreto: {bmr}"
        )
    
    def test_tdee_sedentary(self):
        """Teste TDEE sedentário"""
        bmr = 1800.0
        tdee = self.calculator.calculate_tdee(bmr, 'sedentario')
        expected = bmr * 1.2
        
        self.assertTrue(
            self.log_test_result('TDEE Sedentário', expected, tdee, 5.0),
            f"TDEE sedentário incorreto: {tdee}"
        )
    
    def test_tdee_with_factors(self):
        """Teste TDEE com fatores adicionais"""
        bmr = 1800.0
        factors = {
            'stress_level': 'alto',
            'sleep_quality': 'boa',
            'supplements': ['termogenico', 'creatina'],
            'training_experience': 'avancado'
        }
        
        tdee = self.calculator.calculate_tdee(bmr, 'moderadamente_ativo', factors)
        
        # Cálculo manual: 1800 * 1.55 * 1.1 * 1.05 * 1.02 * 1.05
        expected = 1800 * 1.55 * 1.1 * 1.05 * 1.02 * 1.05
        
        self.assertTrue(
            self.log_test_result('TDEE com Fatores', expected, tdee, 10.0),
            f"TDEE com fatores incorreto: {tdee}"
        )
    
    def test_macros_weight_loss(self):
        """Teste distribuição de macros para perda de peso"""
        calories = 2000.0
        macros = self.calculator.calculate_macros(calories, 'perda_peso')
        
        # Verificar se soma das calorias bate
        total_cals = (macros['carbohydrates_g'] * 4 + 
                     macros['proteins_g'] * 4 + 
                     macros['fats_g'] * 9)
        
        self.assertTrue(
            self.log_test_result('Macros Perda Peso - Total Calorias', calories, total_cals, 20.0),
            f"Total de calorias dos macros incorreto: {total_cals}"
        )
        
        # Verificar percentuais
        self.assertEqual(macros['carbohydrates_percent'], 30.0)
        self.assertEqual(macros['proteins_percent'], 40.0)
        self.assertEqual(macros['fats_percent'], 30.0)
    
    def test_macros_muscle_gain(self):
        """Teste distribuição de macros para ganho de massa"""
        calories = 2500.0
        macros = self.calculator.calculate_macros(calories, 'ganho_massa')
        
        # Verificar percentuais
        self.assertEqual(macros['carbohydrates_percent'], 45.0)
        self.assertEqual(macros['proteins_percent'], 30.0)
        self.assertEqual(macros['fats_percent'], 25.0)
        
        # Verificar valores absolutos aproximados
        expected_carbs = (2500 * 0.45) / 4  # 281.25g
        expected_protein = (2500 * 0.30) / 4  # 187.5g
        expected_fat = (2500 * 0.25) / 9  # 69.4g
        
        self.assertTrue(
            self.log_test_result('Macros Ganho Massa - Carbos', expected_carbs, macros['carbohydrates_g'], 2.0)
        )
        self.assertTrue(
            self.log_test_result('Macros Ganho Massa - Proteína', expected_protein, macros['proteins_g'], 2.0)
        )
        self.assertTrue(
            self.log_test_result('Macros Ganho Massa - Gordura', expected_fat, macros['fats_g'], 2.0)
        )
    
    def test_water_intake_basic(self):
        """Teste necessidade básica de água"""
        water = self.calculator.calculate_water_intake(70, 'sedentario')
        expected = 70 * 35  # 2450ml
        
        self.assertTrue(
            self.log_test_result('Água Básica', expected, water, 50.0),
            f"Necessidade de água incorreta: {water}"
        )
    
    def test_water_intake_active(self):
        """Teste necessidade de água para pessoa ativa"""
        water = self.calculator.calculate_water_intake(80, 'muito_ativo', 'quente')
        expected = 80 * 35 * 1.3 * 1.2  # Base * atividade * clima
        
        self.assertTrue(
            self.log_test_result('Água Pessoa Ativa', expected, water, 100.0),
            f"Necessidade de água para pessoa ativa incorreta: {water}"
        )
    
    def test_edge_cases(self):
        """Teste casos extremos"""
        
        # BMR com valores mínimos
        bmr_min = self.calculator.calculate_bmr(40, 140, 18, 'feminino')
        self.assertGreater(bmr_min, 800, "BMR muito baixo para valores mínimos")
        
        # BMR com valores máximos
        bmr_max = self.calculator.calculate_bmr(150, 220, 80, 'masculino')
        self.assertLess(bmr_max, 3000, "BMR muito alto para valores máximos")
        
        # TDEE com atividade extrema
        tdee_extreme = self.calculator.calculate_tdee(2000, 'extremamente_ativo')
        expected_extreme = 2000 * 1.9
        self.assertTrue(
            self.log_test_result('TDEE Extremo', expected_extreme, tdee_extreme, 10.0)
        )
    
    def test_consistency(self):
        """Teste consistência dos cálculos"""
        
        # Mesmo input deve dar mesmo output
        bmr1 = self.calculator.calculate_bmr(70, 170, 30, 'masculino')
        bmr2 = self.calculator.calculate_bmr(70, 170, 30, 'masculino')
        
        self.assertEqual(bmr1, bmr2, "Cálculos inconsistentes para mesmo input")
        
        # Aumento de peso deve aumentar BMR
        bmr_70kg = self.calculator.calculate_bmr(70, 170, 30, 'masculino')
        bmr_80kg = self.calculator.calculate_bmr(80, 170, 30, 'masculino')
        
        self.assertGreater(bmr_80kg, bmr_70kg, "BMR não aumentou com peso")
        
        # Aumento de idade deve diminuir BMR
        bmr_20y = self.calculator.calculate_bmr(70, 170, 20, 'masculino')
        bmr_40y = self.calculator.calculate_bmr(70, 170, 40, 'masculino')
        
        self.assertGreater(bmr_20y, bmr_40y, "BMR não diminuiu com idade")
    
    def test_precision(self):
        """Teste precisão dos cálculos"""
        
        # Verificar se os valores são arredondados corretamente
        bmr = self.calculator.calculate_bmr(70.5, 175.3, 25, 'masculino')
        
        # Deve ter no máximo 2 casas decimais
        self.assertEqual(bmr, round(bmr, 2), "BMR não arredondado corretamente")
        
        # Macros devem ter 1 casa decimal
        macros = self.calculator.calculate_macros(2000, 'manutencao')
        
        for key in ['carbohydrates_g', 'proteins_g', 'fats_g']:
            value = macros[key]
            self.assertEqual(value, round(value, 1), f"{key} não arredondado corretamente")
    
    def generate_test_report(self):
        """Gerar relatório dos testes"""
        
        total_tests = len(self.test_results)
        passed_tests = sum(1 for result in self.test_results if result['passed'])
        failed_tests = total_tests - passed_tests
        
        report = {
            'summary': {
                'total_tests': total_tests,
                'passed': passed_tests,
                'failed': failed_tests,
                'success_rate': (passed_tests / total_tests * 100) if total_tests > 0 else 0,
                'timestamp': datetime.now().isoformat()
            },
            'test_results': self.test_results,
            'failed_tests': [r for r in self.test_results if not r['passed']],
            'categories': {
                'bmr_tests': len([r for r in self.test_results if 'BMR' in r['test']]),
                'tdee_tests': len([r for r in self.test_results if 'TDEE' in r['test']]),
                'macro_tests': len([r for r in self.test_results if 'Macros' in r['test']]),
                'water_tests': len([r for r in self.test_results if 'Água' in r['test']])
            }
        }
        
        # Salvar relatório
        with open('/home/ubuntu/unit_test_metabolic_report.json', 'w', encoding='utf-8') as f:
            json.dump(report, f, indent=2, ensure_ascii=False)
        
        return report

def run_metabolic_tests():
    """Executar todos os testes metabólicos"""
    
    print("🧪 INICIANDO TESTES DE UNIDADE - CÁLCULOS METABÓLICOS")
    print("=" * 60)
    
    # Criar suite de testes
    suite = unittest.TestLoader().loadTestsFromTestCase(TestMetabolicCalculations)
    
    # Executar testes
    runner = unittest.TextTestRunner(verbosity=2)
    result = runner.run(suite)
    
    # Gerar relatório se houver instância de teste
    if hasattr(result, 'testsRun') and result.testsRun > 0:
        # Encontrar instância do teste para gerar relatório
        for test_case in suite:
            if hasattr(test_case, '_testMethodName'):
                test_instance = test_case._testMethodName
                if hasattr(test_case, 'test_results'):
                    report = test_case.generate_test_report()
                    break
    
    print("\n" + "=" * 60)
    print("📊 RESUMO DOS TESTES DE UNIDADE")
    print("=" * 60)
    print(f"✅ Testes executados: {result.testsRun}")
    print(f"❌ Falhas: {len(result.failures)}")
    print(f"🚨 Erros: {len(result.errors)}")
    
    success_rate = ((result.testsRun - len(result.failures) - len(result.errors)) / result.testsRun * 100) if result.testsRun > 0 else 0
    print(f"📈 Taxa de sucesso: {success_rate:.1f}%")
    
    if result.failures:
        print("\n🔍 FALHAS DETECTADAS:")
        for test, traceback in result.failures:
            error_msg = traceback.split('AssertionError: ')[-1].split('\n')[0]
            print(f"  - {test}: {error_msg}")
    
    if result.errors:
        print("\n🚨 ERROS DETECTADOS:")
        for test, traceback in result.errors:
            error_lines = traceback.split('\n')
            error_msg = error_lines[-2] if len(error_lines) > 1 else str(traceback)
            print(f"  - {test}: {error_msg}")
    
    return result.testsRun == (result.testsRun - len(result.failures) - len(result.errors))

if __name__ == "__main__":
    success = run_metabolic_tests()
    exit(0 if success else 1)

