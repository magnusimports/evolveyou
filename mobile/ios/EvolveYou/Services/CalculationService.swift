//
//  CalculationService.swift
//  EvolveYou
//
//  Created by EvolveYou Team on 17/08/2025.
//

import Foundation

// MARK: - Calculation Service
class CalculationService {
    
    // MARK: - Main Calculation Method
    func calculateNutritionalProfile(from answers: [String: String], userId: String = "local") -> NutritionalProfile {
        
        // Extract basic data
        let weight = Double(answers["4"] ?? "70") ?? 70.0
        let height = Double(answers["5"] ?? "170") ?? 170.0
        let age = Double(answers["2"] ?? "30") ?? 30.0
        let gender = answers["3"] ?? "Masculino"
        let activityLevel = answers["10"] ?? "Moderadamente ativo"
        let goal = answers["7"] ?? "Manter peso atual"
        let bodyComposition = answers["6"] ?? "Normal"
        let stressLevel = answers["17"] ?? "Moderado"
        let sleepHours = answers["18"] ?? "7-8h"
        let sleepQuality = answers["19"] ?? "Boa"
        let waterIntake = Double(answers["14"] ?? "2.5") ?? 2.5
        
        // Calculate BMI
        let bmi = calculateBMI(weight: weight, height: height)
        
        // Calculate BMR with advanced adjustments
        let bmr = calculateAdvancedBMR(
            weight: weight,
            height: height,
            age: age,
            gender: gender,
            bodyComposition: bodyComposition
        )
        
        // Calculate TDEE with comprehensive factors
        let tdee = calculateAdvancedTDEE(
            bmr: bmr,
            activityLevel: activityLevel,
            stressLevel: stressLevel,
            sleepHours: sleepHours,
            sleepQuality: sleepQuality
        )
        
        // Calculate macronutrients based on goal and individual factors
        let macros = calculateMacronutrients(
            weight: weight,
            goal: goal,
            tdee: tdee,
            activityLevel: activityLevel,
            bodyComposition: bodyComposition
        )
        
        // Calculate water needs
        let waterNeeds = calculateWaterNeeds(
            weight: weight,
            activityLevel: activityLevel,
            currentIntake: waterIntake
        )
        
        // Generate personalized recommendations
        let recommendations = generatePersonalizedRecommendations(
            bmi: bmi,
            goal: goal,
            activityLevel: activityLevel,
            answers: answers
        )
        
        return NutritionalProfile(
            userId: userId,
            bmi: bmi,
            bmr: bmr,
            tdee: tdee,
            proteinGrams: macros.protein,
            carbGrams: macros.carbs,
            fatGrams: macros.fat,
            waterLiters: waterNeeds,
            recommendations: recommendations,
            createdAt: Date(),
            updatedAt: Date()
        )
    }
    
    // MARK: - BMI Calculation
    private func calculateBMI(weight: Double, height: Double) -> Double {
        let heightInMeters = height / 100.0
        return weight / (heightInMeters * heightInMeters)
    }
    
    // MARK: - Advanced BMR Calculation
    private func calculateAdvancedBMR(
        weight: Double,
        height: Double,
        age: Double,
        gender: String,
        bodyComposition: String
    ) -> Double {
        
        // Base BMR using Mifflin-St Jeor equation
        let baseBMR: Double
        if gender.lowercased().contains("masculino") {
            baseBMR = (10 * weight) + (6.25 * height) - (5 * age) + 5
        } else {
            baseBMR = (10 * weight) + (6.25 * height) - (5 * age) - 161
        }
        
        // Adjust for body composition
        let compositionMultiplier: Double = {
            switch bodyComposition {
            case "Magro": return 1.05 // Higher metabolic rate
            case "Atlético": return 1.08 // Muscle mass increases BMR
            case "Acima do peso": return 0.98 // Slightly lower
            case "Obeso": return 0.95 // Lower metabolic efficiency
            default: return 1.0 // Normal
            }
        }()
        
        return baseBMR * compositionMultiplier
    }
    
    // MARK: - Advanced TDEE Calculation
    private func calculateAdvancedTDEE(
        bmr: Double,
        activityLevel: String,
        stressLevel: String,
        sleepHours: String,
        sleepQuality: String
    ) -> Double {
        
        // Base activity factor
        let activityFactor: Double = {
            switch activityLevel {
            case "Sedentário": return 1.2
            case "Levemente ativo": return 1.375
            case "Moderadamente ativo": return 1.55
            case "Muito ativo": return 1.725
            case "Extremamente ativo": return 1.9
            default: return 1.55
            }
        }()
        
        // Stress adjustment
        let stressAdjustment: Double = {
            switch stressLevel {
            case "Muito baixo": return 0.98
            case "Baixo": return 0.99
            case "Moderado": return 1.0
            case "Alto": return 1.03
            case "Muito alto": return 1.05
            default: return 1.0
            }
        }()
        
        // Sleep hours adjustment
        let sleepHoursAdjustment: Double = {
            switch sleepHours {
            case "Menos de 5h": return 0.95
            case "5-6h": return 0.97
            case "6-7h": return 0.99
            case "7-8h": return 1.0
            case "8-9h": return 1.01
            case "Mais de 9h": return 0.98
            default: return 1.0
            }
        }()
        
        // Sleep quality adjustment
        let sleepQualityAdjustment: Double = {
            switch sleepQuality {
            case "Muito ruim": return 0.95
            case "Ruim": return 0.97
            case "Regular": return 0.99
            case "Boa": return 1.0
            case "Excelente": return 1.02
            default: return 1.0
            }
        }()
        
        return bmr * activityFactor * stressAdjustment * sleepHoursAdjustment * sleepQualityAdjustment
    }
    
    // MARK: - Macronutrient Calculation
    private func calculateMacronutrients(
        weight: Double,
        goal: String,
        tdee: Double,
        activityLevel: String,
        bodyComposition: String
    ) -> (protein: Double, carbs: Double, fat: Double) {
        
        // Protein calculation (priority macronutrient)
        let proteinMultiplier: Double = {
            switch goal {
            case "Perder peso": return 2.4 // Higher protein for muscle preservation
            case "Ganhar massa muscular": return 2.6 // Maximum protein for muscle building
            case "Manter peso atual": return 2.0 // Maintenance level
            case "Melhorar saúde geral": return 1.8 // General health
            default: return 2.0
            }
        }()
        
        // Adjust protein for activity level
        let activityProteinBonus: Double = {
            switch activityLevel {
            case "Muito ativo", "Extremamente ativo": return 0.2
            case "Moderadamente ativo": return 0.1
            default: return 0.0
            }
        }()
        
        let protein = weight * (proteinMultiplier + activityProteinBonus)
        let proteinCalories = protein * 4
        
        // Fat calculation (essential for hormones)
        let fatPercentage: Double = {
            switch goal {
            case "Perder peso": return 0.25 // 25% of calories
            case "Ganhar massa muscular": return 0.30 // 30% of calories
            case "Manter peso atual": return 0.28 // 28% of calories
            default: return 0.27 // 27% of calories
            }
        }()
        
        let fatCalories = tdee * fatPercentage
        let fat = fatCalories / 9
        
        // Carbohydrate calculation (remaining calories)
        let remainingCalories = tdee - proteinCalories - fatCalories
        let carbs = max(remainingCalories / 4, weight * 1.0) // Minimum 1g per kg
        
        return (protein: protein, carbs: carbs, fat: fat)
    }
    
    // MARK: - Water Needs Calculation
    private func calculateWaterNeeds(
        weight: Double,
        activityLevel: String,
        currentIntake: Double
    ) -> Double {
        
        // Base water needs: 35ml per kg of body weight
        let baseWater = (weight * 35) / 1000
        
        // Activity adjustment
        let activityBonus: Double = {
            switch activityLevel {
            case "Sedentário": return 0.0
            case "Levemente ativo": return 0.3
            case "Moderadamente ativo": return 0.5
            case "Muito ativo": return 0.8
            case "Extremamente ativo": return 1.2
            default: return 0.5
            }
        }()
        
        let recommendedWater = baseWater + activityBonus
        
        // Consider current intake and suggest gradual increase if needed
        if currentIntake < recommendedWater {
            let difference = recommendedWater - currentIntake
            // Suggest gradual increase (max 0.5L increase from current)
            return min(currentIntake + 0.5, recommendedWater)
        }
        
        return recommendedWater
    }
    
    // MARK: - Personalized Recommendations
    private func generatePersonalizedRecommendations(
        bmi: Double,
        goal: String,
        activityLevel: String,
        answers: [String: String]
    ) -> [String] {
        
        var recommendations: [String] = []
        
        // BMI-based recommendations
        switch bmi {
        case ..<18.5:
            recommendations.append("Seu IMC indica baixo peso. Considere aumentar gradualmente sua ingestão calórica com alimentos nutritivos e densos em energia.")
            recommendations.append("Inclua proteínas de qualidade em cada refeição: ovos, carnes magras, leguminosas e laticínios.")
        case 18.5..<25:
            recommendations.append("Seu IMC está na faixa ideal! Mantenha uma alimentação equilibrada para preservar sua saúde.")
        case 25..<30:
            recommendations.append("Seu IMC indica sobrepeso. Um déficit calórico moderado de 300-500 calorias pode ajudar na perda de peso saudável.")
            recommendations.append("Priorize alimentos com alta densidade nutricional e baixa densidade calórica.")
        default:
            recommendations.append("Considere buscar orientação profissional para um plano de emagrecimento seguro e eficaz.")
            recommendations.append("Foque em mudanças graduais e sustentáveis nos hábitos alimentares.")
        }
        
        // Goal-specific recommendations
        switch goal {
        case "Perder peso":
            recommendations.append("Para perda de peso eficaz, mantenha um déficit calórico de 300-500 calorias por dia.")
            recommendations.append("Priorize proteínas em cada refeição para preservar massa muscular durante o emagrecimento.")
            recommendations.append("Inclua exercícios de resistência 3x por semana para manter o metabolismo ativo.")
            
        case "Ganhar massa muscular":
            recommendations.append("Para ganho de massa muscular, mantenha um superávit calórico de 200-500 calorias.")
            recommendations.append("Consuma proteína a cada 3-4 horas, totalizando 2.6g por kg de peso corporal.")
            recommendations.append("Combine treino de força progressivo com descanso adequado para máximos resultados.")
            
        case "Manter peso atual":
            recommendations.append("Mantenha uma alimentação equilibrada com variedade de nutrientes para preservar sua saúde.")
            recommendations.append("Continue monitorando seu peso semanalmente para ajustes finos se necessário.")
            
        default:
            recommendations.append("Foque em uma alimentação variada e colorida, rica em frutas, vegetais e grãos integrais.")
        }
        
        // Activity-based recommendations
        switch activityLevel {
        case "Sedentário":
            recommendations.append("Comece gradualmente com caminhadas de 30 minutos, 3x por semana.")
            recommendations.append("Considere atividades que você goste para tornar o exercício mais prazeroso e sustentável.")
            
        case "Levemente ativo":
            recommendations.append("Tente aumentar gradualmente a intensidade ou frequência dos seus exercícios.")
            
        case "Muito ativo", "Extremamente ativo":
            recommendations.append("Certifique-se de consumir carboidratos suficientes para sustentar seu alto nível de atividade.")
            recommendations.append("Monitore sinais de overtraining e garanta dias de descanso adequados.")
            
        default:
            recommendations.append("Mantenha consistência na sua rotina de exercícios para melhores resultados.")
        }
        
        // Lifestyle-based recommendations
        if let stressLevel = answers["17"] {
            switch stressLevel {
            case "Alto", "Muito alto":
                recommendations.append("Seu alto nível de estresse pode afetar o metabolismo. Considere técnicas de relaxamento como meditação ou yoga.")
                recommendations.append("Evite dietas muito restritivas, pois podem aumentar o cortisol e o estresse.")
            default:
                break
            }
        }
        
        if let sleepHours = answers["18"] {
            switch sleepHours {
            case "Menos de 5h", "5-6h":
                recommendations.append("Sono insuficiente pode prejudicar o metabolismo e aumentar a fome. Tente dormir 7-9 horas por noite.")
                recommendations.append("Estabeleça uma rotina de sono regular para melhorar a qualidade do descanso.")
            default:
                break
            }
        }
        
        // Restriction-based recommendations
        if let restrictions = answers["15"] {
            if restrictions.contains("Vegetariano") || restrictions.contains("Vegano") {
                recommendations.append("Combine diferentes fontes de proteína vegetal para obter todos os aminoácidos essenciais.")
                recommendations.append("Monitore vitamina B12, ferro, zinco e ômega-3 em sua alimentação.")
            }
            
            if restrictions.contains("Sem lactose") {
                recommendations.append("Inclua fontes alternativas de cálcio como vegetais verde-escuros, gergelim e sardinha.")
            }
            
            if restrictions.contains("Sem glúten") {
                recommendations.append("Varie os grãos sem glúten: quinoa, amaranto, arroz integral e aveia certificada.")
            }
        }
        
        // Health condition recommendations
        if let healthConditions = answers["21"] {
            if healthConditions.contains("Diabetes") {
                recommendations.append("Monitore o índice glicêmico dos alimentos e distribua os carboidratos ao longo do dia.")
            }
            
            if healthConditions.contains("Hipertensão") {
                recommendations.append("Reduza o consumo de sódio e aumente alimentos ricos em potássio como banana e abacate.")
            }
            
            if healthConditions.contains("Colesterol alto") {
                recommendations.append("Inclua fibras solúveis (aveia, feijão) e gorduras boas (azeite, abacate, castanhas).")
            }
        }
        
        // General recommendations
        recommendations.append("Durma 7-9 horas por noite para otimizar a recuperação e o metabolismo.")
        recommendations.append("Mantenha-se hidratado bebendo água regularmente ao longo do dia.")
        recommendations.append("Faça refeições regulares para manter o metabolismo ativo e evitar compulsões.")
        recommendations.append("Inclua alimentos brasileiros da Base TACO para uma nutrição culturalmente adequada.")
        
        // Limit to most relevant recommendations (max 8)
        return Array(recommendations.prefix(8))
    }
}

// MARK: - BMI Category Helper
extension CalculationService {
    func getBMICategory(_ bmi: Double) -> String {
        switch bmi {
        case ..<18.5: return "Abaixo do peso"
        case 18.5..<25: return "Peso normal"
        case 25..<30: return "Sobrepeso"
        case 30..<35: return "Obesidade grau I"
        case 35..<40: return "Obesidade grau II"
        default: return "Obesidade grau III"
        }
    }
    
    func getBMIColor(_ bmi: Double) -> String {
        switch bmi {
        case ..<18.5: return "blue"
        case 18.5..<25: return "green"
        case 25..<30: return "orange"
        default: return "red"
        }
    }
}

// MARK: - Validation Helpers
extension CalculationService {
    func validateCalculationInputs(_ answers: [String: String]) -> [String] {
        var errors: [String] = []
        
        // Check required fields
        let requiredFields = ["2", "3", "4", "5"] // age, gender, weight, height
        for field in requiredFields {
            if answers[field]?.isEmpty ?? true {
                errors.append("Campo obrigatório não preenchido: \\(field)")
            }
        }
        
        // Validate numeric ranges
        if let weightStr = answers["4"], let weight = Double(weightStr) {
            if weight < 30 || weight > 300 {
                errors.append("Peso deve estar entre 30 e 300 kg")
            }
        }
        
        if let heightStr = answers["5"], let height = Double(heightStr) {
            if height < 100 || height > 250 {
                errors.append("Altura deve estar entre 100 e 250 cm")
            }
        }
        
        if let ageStr = answers["2"], let age = Double(ageStr) {
            if age < 16 || age > 100 {
                errors.append("Idade deve estar entre 16 e 100 anos")
            }
        }
        
        return errors
    }
}

