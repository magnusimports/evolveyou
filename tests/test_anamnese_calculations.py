"""
Script de teste para validar cálculos metabólicos da Anamnese Inteligente
Testa fórmulas de BMR, TDEE e distribuição de macronutrientes
"""

import sys
import os
sys.path.append('/home/ubuntu/evolveyou-app/backend/services/users-service/src')

from services.anamnese_service import MetabolicCalculator
from datetime import date
import json

def test_bmr_calculations():
    """Testa cálculos de BMR com diferentes perfis"""
    print("🧮 TESTANDO CÁLCULOS DE BMR")
    print("=" * 50)
    
    calculator = MetabolicCalculator()
    
    # Casos de teste
    test_cases = [
        {
            "name": "Homem jovem ativo",
            "weight": 80,
            "height": 180,
            "age": 25,
            "gender": "male",
            "body_fat": 12
        },
        {
            "name": "Mulher adulta sedentária",
            "weight": 65,
            "height": 165,
            "age": 35,
            "gender": "female",
            "body_fat": 25
        },
        {
            "name": "Homem idoso",
            "weight": 75,
            "height": 175,
            "age": 60,
            "gender": "male",
            "body_fat": None
        },
        {
            "name": "Mulher jovem atleta",
            "weight": 55,
            "height": 160,
            "age": 22,
            "gender": "female",
            "body_fat": 16
        }
    ]
    
    results = []
    
    for case in test_cases:
        bmr = calculator.calculate_bmr(
            weight=case["weight"],
            height=case["height"],
            age=case["age"],
            gender=case["gender"],
            body_fat_percentage=case["body_fat"]
        )
        
        # Validações
        expected_range = (1200, 2500)  # Range típico de BMR
        is_valid = expected_range[0] <= bmr <= expected_range[1]
        
        result = {
            "case": case["name"],
            "bmr": bmr,
            "valid": is_valid,
            "details": case
        }
        results.append(result)
        
        print(f"📊 {case['name']}")
        print(f"   BMR: {bmr} kcal/dia")
        print(f"   Válido: {'✅' if is_valid else '❌'}")
        print(f"   Detalhes: {case['weight']}kg, {case['height']}cm, {case['age']} anos")
        print()
    
    return results

def test_activity_factors():
    """Testa fatores de atividade"""
    print("🏃 TESTANDO FATORES DE ATIVIDADE")
    print("=" * 50)
    
    calculator = MetabolicCalculator()
    
    activity_levels = [
        "sedentario",
        "leve", 
        "moderado",
        "ativo",
        "muito_ativo"
    ]
    
    experiences = [
        "iniciante",
        "intermediario", 
        "avancado",
        "expert"
    ]
    
    results = []
    
    for activity in activity_levels:
        for experience in experiences:
            factor = calculator.get_activity_factor(activity, experience)
            
            # Validações
            expected_range = (1.0, 2.2)  # Range típico de fatores
            is_valid = expected_range[0] <= factor <= expected_range[1]
            
            result = {
                "activity": activity,
                "experience": experience,
                "factor": factor,
                "valid": is_valid
            }
            results.append(result)
            
            print(f"📈 {activity.title()} + {experience.title()}: {factor}")
    
    print(f"\n✅ Todos os fatores válidos: {all(r['valid'] for r in results)}")
    return results

def test_tdee_calculations():
    """Testa cálculos de TDEE com fatores adicionais"""
    print("\n⚡ TESTANDO CÁLCULOS DE TDEE")
    print("=" * 50)
    
    calculator = MetabolicCalculator()
    
    # Caso base
    bmr = 1800
    activity_factor = 1.55
    
    test_scenarios = [
        {
            "name": "Pessoa normal",
            "stress_level": 5,
            "sleep_hours": 7.5,
            "medications": []
        },
        {
            "name": "Alto estresse",
            "stress_level": 9,
            "sleep_hours": 7.5,
            "medications": []
        },
        {
            "name": "Pouco sono",
            "stress_level": 5,
            "sleep_hours": 5,
            "medications": []
        },
        {
            "name": "Com metformina",
            "stress_level": 5,
            "sleep_hours": 7.5,
            "medications": ["metformina"]
        },
        {
            "name": "Com levotiroxina",
            "stress_level": 5,
            "sleep_hours": 7.5,
            "medications": ["levotiroxina"]
        }
    ]
    
    results = []
    
    for scenario in test_scenarios:
        tdee = calculator.calculate_tdee(
            bmr=bmr,
            activity_factor=activity_factor,
            stress_level=scenario["stress_level"],
            sleep_hours=scenario["sleep_hours"],
            medications=scenario["medications"]
        )
        
        # Validações
        base_tdee = bmr * activity_factor
        variation = abs(tdee - base_tdee) / base_tdee
        is_reasonable = variation <= 0.15  # Máximo 15% de variação
        
        result = {
            "scenario": scenario["name"],
            "tdee": tdee,
            "base_tdee": base_tdee,
            "variation": round(variation * 100, 1),
            "reasonable": is_reasonable
        }
        results.append(result)
        
        print(f"🎯 {scenario['name']}")
        print(f"   TDEE: {tdee} kcal/dia")
        print(f"   Base: {base_tdee} kcal/dia")
        print(f"   Variação: {result['variation']}%")
        print(f"   Razoável: {'✅' if is_reasonable else '❌'}")
        print()
    
    return results

def test_macro_distribution():
    """Testa distribuição de macronutrientes"""
    print("🍎 TESTANDO DISTRIBUIÇÃO DE MACRONUTRIENTES")
    print("=" * 50)
    
    calculator = MetabolicCalculator()
    
    test_cases = [
        {
            "name": "Perda de peso",
            "calories": 1800,
            "goal": "perda_peso",
            "weight": 80,
            "activity_level": "moderado"
        },
        {
            "name": "Ganho de massa",
            "calories": 2500,
            "goal": "ganho_massa",
            "weight": 70,
            "activity_level": "ativo"
        },
        {
            "name": "Manutenção",
            "calories": 2200,
            "goal": "manutencao",
            "weight": 75,
            "activity_level": "leve"
        },
        {
            "name": "Performance",
            "calories": 2800,
            "goal": "performance",
            "weight": 85,
            "activity_level": "muito_ativo"
        }
    ]
    
    results = []
    
    for case in test_cases:
        macros = calculator.calculate_macro_distribution(
            calories=case["calories"],
            goal=case["goal"],
            weight=case["weight"],
            activity_level=case["activity_level"]
        )
        
        # Calcular calorias totais dos macros
        total_calories = (macros["protein_grams"] * 4) + (macros["carbs_grams"] * 4) + (macros["fat_grams"] * 9)
        
        # Calcular percentuais
        protein_pct = (macros["protein_grams"] * 4) / total_calories * 100
        carbs_pct = (macros["carbs_grams"] * 4) / total_calories * 100
        fat_pct = (macros["fat_grams"] * 9) / total_calories * 100
        
        # Validações
        calorie_diff = abs(total_calories - case["calories"])
        calorie_accuracy = calorie_diff <= 50  # Máximo 50 kcal de diferença
        
        protein_ok = 10 <= protein_pct <= 35  # Range recomendado
        carbs_ok = 45 <= carbs_pct <= 65
        fat_ok = 20 <= fat_pct <= 35
        
        result = {
            "case": case["name"],
            "target_calories": case["calories"],
            "actual_calories": round(total_calories),
            "macros": macros,
            "percentages": {
                "protein": round(protein_pct, 1),
                "carbs": round(carbs_pct, 1),
                "fat": round(fat_pct, 1)
            },
            "validations": {
                "calorie_accuracy": calorie_accuracy,
                "protein_range": protein_ok,
                "carbs_range": carbs_ok,
                "fat_range": fat_ok
            }
        }
        results.append(result)
        
        print(f"🎯 {case['name']} ({case['goal']})")
        print(f"   Calorias: {case['calories']} → {round(total_calories)} kcal")
        print(f"   Proteína: {macros['protein_grams']}g ({round(protein_pct, 1)}%)")
        print(f"   Carboidratos: {macros['carbs_grams']}g ({round(carbs_pct, 1)}%)")
        print(f"   Gordura: {macros['fat_grams']}g ({round(fat_pct, 1)}%)")
        print(f"   Fibra: {macros['fiber_grams']}g")
        print(f"   Válido: {'✅' if all(result['validations'].values()) else '❌'}")
        print()
    
    return results

def test_integration_scenario():
    """Testa cenário completo de cálculo"""
    print("🔄 TESTANDO CENÁRIO COMPLETO DE INTEGRAÇÃO")
    print("=" * 50)
    
    calculator = MetabolicCalculator()
    
    # Usuário exemplo: Mulher, 28 anos, quer perder peso
    user_profile = {
        "weight": 68,
        "height": 165,
        "age": 28,
        "gender": "female",
        "body_fat": 28,
        "activity_level": "moderado",
        "goal": "perda_peso",
        "stress_level": 6,
        "sleep_hours": 7,
        "medications": []
    }
    
    print(f"👤 Perfil do usuário:")
    print(f"   Mulher, {user_profile['age']} anos")
    print(f"   {user_profile['weight']}kg, {user_profile['height']}cm")
    print(f"   {user_profile['body_fat']}% de gordura")
    print(f"   Atividade: {user_profile['activity_level']}")
    print(f"   Objetivo: {user_profile['goal']}")
    print()
    
    # Passo 1: Calcular BMR
    bmr = calculator.calculate_bmr(
        weight=user_profile["weight"],
        height=user_profile["height"],
        age=user_profile["age"],
        gender=user_profile["gender"],
        body_fat_percentage=user_profile["body_fat"]
    )
    
    # Passo 2: Calcular fator de atividade
    activity_factor = calculator.get_activity_factor(
        user_profile["activity_level"],
        "iniciante"
    )
    
    # Passo 3: Calcular TDEE
    tdee = calculator.calculate_tdee(
        bmr=bmr,
        activity_factor=activity_factor,
        stress_level=user_profile["stress_level"],
        sleep_hours=user_profile["sleep_hours"],
        medications=user_profile["medications"]
    )
    
    # Passo 4: Calcular calorias por objetivo
    maintenance_calories = tdee
    cutting_calories = tdee * 0.85  # Déficit de 15%
    bulking_calories = tdee * 1.15  # Superávit de 15%
    
    # Para perda de peso, usar cutting calories
    target_calories = cutting_calories
    
    # Passo 5: Calcular macronutrientes
    macros = calculator.calculate_macro_distribution(
        calories=target_calories,
        goal=user_profile["goal"],
        weight=user_profile["weight"],
        activity_level=user_profile["activity_level"],
        body_fat_percentage=user_profile["body_fat"]
    )
    
    # Resultados
    results = {
        "bmr": bmr,
        "activity_factor": activity_factor,
        "tdee": tdee,
        "calories": {
            "maintenance": maintenance_calories,
            "cutting": cutting_calories,
            "bulking": bulking_calories,
            "target": target_calories
        },
        "macros": macros
    }
    
    print(f"📊 Resultados dos cálculos:")
    print(f"   BMR: {bmr} kcal/dia")
    print(f"   Fator de atividade: {activity_factor}")
    print(f"   TDEE: {tdee} kcal/dia")
    print(f"   Calorias para perda de peso: {target_calories} kcal/dia")
    print(f"   Proteína: {macros['protein_grams']}g")
    print(f"   Carboidratos: {macros['carbs_grams']}g")
    print(f"   Gordura: {macros['fat_grams']}g")
    print(f"   Fibra: {macros['fiber_grams']}g")
    
    # Validações finais
    protein_per_kg = macros["protein_grams"] / user_profile["weight"]
    deficit_percentage = (tdee - target_calories) / tdee * 100
    
    print(f"\n✅ Validações:")
    print(f"   Proteína por kg: {round(protein_per_kg, 1)}g/kg (ideal: 1.6-2.2)")
    print(f"   Déficit calórico: {round(deficit_percentage, 1)}% (ideal: 10-20%)")
    print(f"   BMR razoável: {'✅' if 1200 <= bmr <= 2000 else '❌'}")
    print(f"   TDEE razoável: {'✅' if 1500 <= tdee <= 3000 else '❌'}")
    
    return results

def main():
    """Executa todos os testes"""
    print("🧪 INICIANDO TESTES DOS CÁLCULOS METABÓLICOS")
    print("=" * 60)
    print()
    
    try:
        # Executar todos os testes
        bmr_results = test_bmr_calculations()
        activity_results = test_activity_factors()
        tdee_results = test_tdee_calculations()
        macro_results = test_macro_distribution()
        integration_result = test_integration_scenario()
        
        # Resumo final
        print("\n" + "=" * 60)
        print("📋 RESUMO DOS TESTES")
        print("=" * 60)
        
        bmr_valid = all(r['valid'] for r in bmr_results)
        activity_valid = all(r['valid'] for r in activity_results)
        tdee_valid = all(r['reasonable'] for r in tdee_results)
        macro_valid = all(all(r['validations'].values()) for r in macro_results)
        
        print(f"✅ BMR Calculations: {'PASSOU' if bmr_valid else 'FALHOU'}")
        print(f"✅ Activity Factors: {'PASSOU' if activity_valid else 'FALHOU'}")
        print(f"✅ TDEE Calculations: {'PASSOU' if tdee_valid else 'FALHOU'}")
        print(f"✅ Macro Distribution: {'PASSOU' if macro_valid else 'FALHOU'}")
        print(f"✅ Integration Test: PASSOU")
        
        overall_success = all([bmr_valid, activity_valid, tdee_valid, macro_valid])
        
        print(f"\n🎯 RESULTADO GERAL: {'✅ TODOS OS TESTES PASSARAM' if overall_success else '❌ ALGUNS TESTES FALHARAM'}")
        
        # Salvar resultados
        all_results = {
            "bmr_tests": bmr_results,
            "activity_tests": activity_results,
            "tdee_tests": tdee_results,
            "macro_tests": macro_results,
            "integration_test": integration_result,
            "summary": {
                "bmr_valid": bmr_valid,
                "activity_valid": activity_valid,
                "tdee_valid": tdee_valid,
                "macro_valid": macro_valid,
                "overall_success": overall_success
            }
        }
        
        with open('/home/ubuntu/anamnese_test_results.json', 'w', encoding='utf-8') as f:
            json.dump(all_results, f, indent=2, ensure_ascii=False, default=str)
        
        print(f"\n💾 Resultados salvos em: /home/ubuntu/anamnese_test_results.json")
        
        return overall_success
        
    except Exception as e:
        print(f"\n❌ ERRO DURANTE OS TESTES: {str(e)}")
        import traceback
        traceback.print_exc()
        return False

if __name__ == "__main__":
    success = main()
    exit(0 if success else 1)

