#!/usr/bin/env python3
"""
Teste de Integração Base TACO + Plans-Service
Testa se o adaptador funciona corretamente
"""

import asyncio
import json
import sys
import os
import requests
from datetime import datetime

# Adicionar path do plans-service
sys.path.append('/home/ubuntu/evolveyou-backend/services/plans-service/src')

from adapters.taco_data_adapter import TacoDataAdapter

class MockContentService:
    """Mock do Content Service para teste"""
    
    def __init__(self, base_url):
        self.base_url = base_url
    
    async def search_foods(self, query=""):
        """Simula busca de alimentos na Base TACO"""
        try:
            # Buscar alimentos da Base TACO real
            url = f"{self.base_url}/api/foods/search?q=ab"  # Buscar alimentos com 'ab'
            response = requests.get(url, timeout=10)
            
            if response.status_code == 200:
                return response.json()
            else:
                print(f"Erro na API: {response.status_code}")
                return {"data": []}
                
        except Exception as e:
            print(f"Erro ao conectar com Base TACO: {e}")
            return {"data": []}

async def test_taco_integration():
    """Testa a integração completa com a Base TACO"""
    
    print("🧪 TESTE DE INTEGRAÇÃO BASE TACO + PLANS-SERVICE")
    print("=" * 60)
    
    # 1. Inicializar adaptador
    print("\n1. Inicializando adaptador TACO...")
    adapter = TacoDataAdapter()
    print("✅ Adaptador inicializado")
    
    # 2. Conectar com Base TACO
    print("\n2. Conectando com Base TACO em produção...")
    content_service = MockContentService("https://content-service-278319877545.southamerica-east1.run.app")
    
    # 3. Buscar alimentos
    print("3. Buscando alimentos da Base TACO...")
    foods_response = await content_service.search_foods("ab")
    taco_foods = foods_response.get("data", [])
    
    if not taco_foods:
        print("❌ Nenhum alimento encontrado na Base TACO")
        return False
    
    print(f"✅ {len(taco_foods)} alimentos encontrados na Base TACO")
    
    # 4. Testar conversão
    print("\n4. Testando conversão de dados...")
    converted_foods = adapter.convert_foods_from_taco(taco_foods)
    
    if not converted_foods:
        print("❌ Falha na conversão de dados")
        return False
    
    print(f"✅ {len(converted_foods)} alimentos convertidos com sucesso")
    
    # 5. Validar formato convertido
    print("\n5. Validando formato dos dados convertidos...")
    
    for i, food in enumerate(converted_foods[:3]):  # Testar primeiros 3
        print(f"\n--- Alimento {i+1} ---")
        print(f"ID: {food.get('id', 'N/A')}")
        print(f"Nome: {food.get('name', 'N/A')}")
        print(f"Categoria: {food.get('category', 'N/A')}")
        
        nutrition = food.get('nutrition', {})
        print(f"Calorias: {nutrition.get('calories', 0)} kcal/100g")
        print(f"Proteína: {nutrition.get('protein', 0)} g/100g")
        print(f"Carboidratos: {nutrition.get('carbs', 0)} g/100g")
        print(f"Gordura: {nutrition.get('fat', 0)} g/100g")
        
        print(f"Tempo preparo: {food.get('preparation_time', 0)} min")
        print(f"Nível custo: {food.get('cost_level', 'N/A')}")
        print(f"Score disponibilidade: {food.get('availability_score', 0)}")
        print(f"Tags dietéticas: {food.get('dietary_tags', [])}")
        print(f"Alergênicos: {food.get('allergens', [])}")
    
    # 6. Testar casos específicos
    print("\n6. Testando casos específicos...")
    
    # Encontrar alimento com proteína
    protein_foods = [f for f in converted_foods if f['nutrition']['protein'] > 5]
    print(f"✅ {len(protein_foods)} alimentos com proteína > 5g encontrados")
    
    # Encontrar alimentos vegetarianos
    vegetarian_foods = [f for f in converted_foods if 'vegetarian' in f.get('dietary_tags', [])]
    print(f"✅ {len(vegetarian_foods)} alimentos vegetarianos encontrados")
    
    # Encontrar frutas
    fruit_foods = [f for f in converted_foods if f.get('category') == 'frutas']
    print(f"✅ {len(fruit_foods)} frutas encontradas")
    
    # 7. Salvar resultado para análise
    print("\n7. Salvando resultado do teste...")
    
    test_result = {
        "timestamp": datetime.now().isoformat(),
        "taco_foods_count": len(taco_foods),
        "converted_foods_count": len(converted_foods),
        "sample_foods": converted_foods[:5],  # Primeiros 5 para análise
        "statistics": {
            "protein_foods": len(protein_foods),
            "vegetarian_foods": len(vegetarian_foods),
            "fruit_foods": len(fruit_foods)
        }
    }
    
    with open('/home/ubuntu/taco_integration_test_result.json', 'w', encoding='utf-8') as f:
        json.dump(test_result, f, indent=2, ensure_ascii=False)
    
    print("✅ Resultado salvo em: /home/ubuntu/taco_integration_test_result.json")
    
    # 8. Resultado final
    print("\n" + "=" * 60)
    print("🎉 TESTE DE INTEGRAÇÃO CONCLUÍDO COM SUCESSO!")
    print(f"📊 Alimentos TACO: {len(taco_foods)}")
    print(f"📊 Alimentos convertidos: {len(converted_foods)}")
    print(f"📊 Taxa de conversão: {len(converted_foods)/len(taco_foods)*100:.1f}%")
    print("=" * 60)
    
    return True

if __name__ == "__main__":
    try:
        success = asyncio.run(test_taco_integration())
        if success:
            print("\n✅ Integração Base TACO + Plans-Service funcionando!")
            sys.exit(0)
        else:
            print("\n❌ Falha na integração")
            sys.exit(1)
    except Exception as e:
        print(f"\n❌ Erro durante teste: {e}")
        sys.exit(1)

