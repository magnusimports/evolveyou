//
//  ResultsView.swift
//  EvolveYou
//
//  Created by EvolveYou Team on 17/08/2025.
//

import SwiftUI

struct ResultsView: View {
    @EnvironmentObject var anamneseModel: AnamneseModel
    @State private var animateCards = false
    @State private var showingShareSheet = false
    
    var body: some View {
        ScrollView {
            VStack(spacing: 32) {
                // Header
                headerSection
                
                // Metrics Cards
                if let profile = anamneseModel.nutritionalProfile {
                    metricsSection(profile: profile)
                    macronutrientsSection(profile: profile)
                    recommendationsSection(profile: profile)
                } else {
                    // Fallback with calculated values
                    calculatedMetricsSection
                }
                
                // Action Buttons
                actionButtonsSection
            }
            .padding(.horizontal, 24)
            .padding(.vertical, 32)
        }
        .background(backgroundGradient)
        .navigationBarHidden(true)
        .onAppear {
            animateContent()
        }
        .sheet(isPresented: $showingShareSheet) {
            ShareSheet(items: [generateShareText()])
        }
    }
    
    // MARK: - Header Section
    private var headerSection: some View {
        VStack(spacing: 24) {
            // Success Icon
            Image(systemName: "checkmark.circle.fill")
                .font(.system(size: 64, weight: .light))
                .foregroundColor(.green)
                .scaleEffect(animateCards ? 1.0 : 0.8)
                .animation(.easeOut(duration: 0.8).delay(0.2), value: animateCards)
            
            VStack(spacing: 12) {
                Text("Seu Perfil Nutricional")
                    .font(.system(size: 28, weight: .bold, design: .rounded))
                    .foregroundColor(.white)
                    .multilineTextAlignment(.center)
                
                Text("Baseado em suas respostas, criamos um perfil personalizado com recomendações científicas")
                    .font(.system(size: 16, weight: .medium))
                    .foregroundColor(.white.opacity(0.9))
                    .multilineTextAlignment(.center)
                    .lineLimit(3)
            }
            .opacity(animateCards ? 1.0 : 0.0)
            .offset(y: animateCards ? 0 : 20)
            .animation(.easeOut(duration: 0.8).delay(0.4), value: animateCards)
        }
    }
    
    // MARK: - Metrics Section
    private func metricsSection(profile: NutritionalProfile) -> some View {
        VStack(spacing: 16) {
            SectionHeader(title: "Métricas Corporais", icon: "chart.bar.fill")
            
            LazyVGrid(columns: [
                GridItem(.flexible()),
                GridItem(.flexible())
            ], spacing: 16) {
                MetricCard(
                    title: "IMC",
                    value: String(format: "%.1f", profile.bmi),
                    unit: "kg/m²",
                    color: bmiColor(profile.bmi),
                    subtitle: bmiCategory(profile.bmi)
                )
                
                MetricCard(
                    title: "TMB",
                    value: String(format: "%.0f", profile.bmr),
                    unit: "kcal",
                    color: .orange,
                    subtitle: "Taxa Metabólica"
                )
                
                MetricCard(
                    title: "TDEE",
                    value: String(format: "%.0f", profile.tdee),
                    unit: "kcal",
                    color: .blue,
                    subtitle: "Gasto Diário"
                )
                
                MetricCard(
                    title: "Hidratação",
                    value: String(format: "%.1f", profile.waterLiters),
                    unit: "L",
                    color: .cyan,
                    subtitle: "Água por dia"
                )
            }
        }
        .opacity(animateCards ? 1.0 : 0.0)
        .offset(y: animateCards ? 0 : 30)
        .animation(.easeOut(duration: 0.8).delay(0.6), value: animateCards)
    }
    
    // MARK: - Macronutrients Section
    private func macronutrientsSection(profile: NutritionalProfile) -> some View {
        VStack(spacing: 16) {
            SectionHeader(title: "Macronutrientes", icon: "leaf.fill")
            
            VStack(spacing: 12) {
                MacronutrientBar(
                    title: "Proteína",
                    value: profile.proteinGrams,
                    unit: "g",
                    color: .red,
                    percentage: macroPercentage(profile.proteinGrams * 4, total: profile.tdee)
                )
                
                MacronutrientBar(
                    title: "Carboidrato",
                    value: profile.carbGrams,
                    unit: "g",
                    color: .green,
                    percentage: macroPercentage(profile.carbGrams * 4, total: profile.tdee)
                )
                
                MacronutrientBar(
                    title: "Gordura",
                    value: profile.fatGrams,
                    unit: "g",
                    color: .yellow,
                    percentage: macroPercentage(profile.fatGrams * 9, total: profile.tdee)
                )
            }
            .padding(20)
            .background(
                RoundedRectangle(cornerRadius: 20)
                    .fill(Color.white.opacity(0.15))
                    .backdrop(BlurView(style: .systemUltraThinMaterialLight))
            )
        }
        .opacity(animateCards ? 1.0 : 0.0)
        .offset(y: animateCards ? 0 : 30)
        .animation(.easeOut(duration: 0.8).delay(0.8), value: animateCards)
    }
    
    // MARK: - Recommendations Section
    private func recommendationsSection(profile: NutritionalProfile) -> some View {
        VStack(spacing: 16) {
            SectionHeader(title: "Recomendações", icon: "lightbulb.fill")
            
            VStack(spacing: 12) {
                ForEach(Array(profile.recommendations.enumerated()), id: \\.offset) { index, recommendation in
                    RecommendationCard(
                        text: recommendation,
                        index: index
                    )
                }
            }
        }
        .opacity(animateCards ? 1.0 : 0.0)
        .offset(y: animateCards ? 0 : 30)
        .animation(.easeOut(duration: 0.8).delay(1.0), value: animateCards)
    }
    
    // MARK: - Calculated Metrics Section (Fallback)
    private var calculatedMetricsSection: some View {
        VStack(spacing: 16) {
            SectionHeader(title: "Métricas Calculadas", icon: "chart.bar.fill")
            
            if let calculatedProfile = calculateFallbackProfile() {
                LazyVGrid(columns: [
                    GridItem(.flexible()),
                    GridItem(.flexible())
                ], spacing: 16) {
                    MetricCard(
                        title: "IMC",
                        value: String(format: "%.1f", calculatedProfile.bmi),
                        unit: "kg/m²",
                        color: bmiColor(calculatedProfile.bmi),
                        subtitle: bmiCategory(calculatedProfile.bmi)
                    )
                    
                    MetricCard(
                        title: "TMB",
                        value: String(format: "%.0f", calculatedProfile.bmr),
                        unit: "kcal",
                        color: .orange,
                        subtitle: "Taxa Metabólica"
                    )
                    
                    MetricCard(
                        title: "TDEE",
                        value: String(format: "%.0f", calculatedProfile.tdee),
                        unit: "kcal",
                        color: .blue,
                        subtitle: "Gasto Diário"
                    )
                    
                    MetricCard(
                        title: "Hidratação",
                        value: String(format: "%.1f", calculatedProfile.waterLiters),
                        unit: "L",
                        color: .cyan,
                        subtitle: "Água por dia"
                    )
                }
            }
        }
        .opacity(animateCards ? 1.0 : 0.0)
        .offset(y: animateCards ? 0 : 30)
        .animation(.easeOut(duration: 0.8).delay(0.6), value: animateCards)
    }
    
    // MARK: - Action Buttons Section
    private var actionButtonsSection: some View {
        VStack(spacing: 16) {
            Button("Compartilhar Resultados") {
                showingShareSheet = true
            }
            .buttonStyle(PrimaryButtonStyle())
            
            Button("Salvar no Perfil") {
                anamneseModel.markAsCompleted()
            }
            .buttonStyle(SecondaryButtonStyle())
            
            Button("Refazer Anamnese") {
                anamneseModel.resetAnamnese()
            }
            .font(.system(size: 16, weight: .medium))
            .foregroundColor(.white.opacity(0.8))
        }
        .padding(.top, 16)
        .opacity(animateCards ? 1.0 : 0.0)
        .offset(y: animateCards ? 0 : 20)
        .animation(.easeOut(duration: 0.8).delay(1.2), value: animateCards)
    }
    
    // MARK: - Background
    private var backgroundGradient: some View {
        LinearGradient(
            gradient: Gradient(colors: [
                Color(red: 0.15, green: 0.4, blue: 0.9),
                Color(red: 0.3, green: 0.2, blue: 0.9)
            ]),
            startPoint: .topLeading,
            endPoint: .bottomTrailing
        )
        .ignoresSafeArea()
    }
    
    // MARK: - Helper Methods
    private func animateContent() {
        withAnimation {
            animateCards = true
        }
    }
    
    private func bmiColor(_ bmi: Double) -> Color {
        switch bmi {
        case ..<18.5: return .blue
        case 18.5..<25: return .green
        case 25..<30: return .orange
        default: return .red
        }
    }
    
    private func bmiCategory(_ bmi: Double) -> String {
        switch bmi {
        case ..<18.5: return "Abaixo do peso"
        case 18.5..<25: return "Peso normal"
        case 25..<30: return "Sobrepeso"
        default: return "Obesidade"
        }
    }
    
    private func macroPercentage(_ calories: Double, total: Double) -> Double {
        return (calories / total) * 100
    }
    
    private func calculateFallbackProfile() -> NutritionalProfile? {
        guard let weightStr = anamneseModel.answers["4"],
              let heightStr = anamneseModel.answers["5"],
              let ageStr = anamneseModel.answers["2"],
              let gender = anamneseModel.answers["3"],
              let weight = Double(weightStr),
              let height = Double(heightStr),
              let age = Double(ageStr) else {
            return nil
        }
        
        // Calculate BMI
        let heightM = height / 100
        let bmi = weight / (heightM * heightM)
        
        // Calculate BMR (Mifflin-St Jeor)
        let bmr = gender.lowercased() == "masculino" ?
            (10 * weight) + (6.25 * height) - (5 * age) + 5 :
            (10 * weight) + (6.25 * height) - (5 * age) - 161
        
        // Calculate TDEE
        let activityLevel = anamneseModel.answers["10"] ?? "Moderadamente ativo"
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
        
        let tdee = bmr * activityFactor
        
        // Calculate macros based on goal
        let goal = anamneseModel.answers["7"] ?? "Manter peso atual"
        let (proteinGrams, carbGrams, fatGrams) = calculateMacros(weight: weight, goal: goal, tdee: tdee)
        
        // Calculate water needs
        let waterLiters = (weight * 35) / 1000 + (activityFactor > 1.55 ? 0.5 : 0)
        
        // Generate recommendations
        let recommendations = generateRecommendations(bmi: bmi, goal: goal, activityLevel: activityLevel)
        
        return NutritionalProfile(
            userId: "local",
            bmi: bmi,
            bmr: bmr,
            tdee: tdee,
            proteinGrams: proteinGrams,
            carbGrams: carbGrams,
            fatGrams: fatGrams,
            waterLiters: waterLiters,
            recommendations: recommendations,
            createdAt: Date(),
            updatedAt: Date()
        )
    }
    
    private func calculateMacros(weight: Double, goal: String, tdee: Double) -> (Double, Double, Double) {
        let protein = weight * 2.2 // 2.2g per kg
        
        let (carbMultiplier, fatMultiplier): (Double, Double) = {
            switch goal {
            case "Perder peso": return (2.0, 0.8)
            case "Ganhar massa muscular": return (4.0, 1.2)
            default: return (3.0, 1.0)
            }
        }()
        
        let carbs = weight * carbMultiplier
        let fats = weight * fatMultiplier
        
        return (protein, carbs, fats)
    }
    
    private func generateRecommendations(bmi: Double, goal: String, activityLevel: String) -> [String] {
        var recommendations: [String] = []
        
        // BMI-based recommendations
        if bmi < 18.5 {
            recommendations.append("Considere aumentar gradualmente sua ingestão calórica com alimentos nutritivos")
        } else if bmi > 25 {
            recommendations.append("Mantenha um déficit calórico moderado de 300-500 calorias por dia")
        }
        
        // Goal-based recommendations
        switch goal {
        case "Perder peso":
            recommendations.append("Priorize proteínas em cada refeição para manter a massa muscular")
            recommendations.append("Inclua exercícios de resistência 3x por semana")
        case "Ganhar massa muscular":
            recommendations.append("Consuma proteína a cada 3-4 horas ao longo do dia")
            recommendations.append("Mantenha um superávit calórico de 200-500 calorias")
        default:
            recommendations.append("Mantenha uma alimentação equilibrada com variedade de nutrientes")
        }
        
        // Activity-based recommendations
        if activityLevel == "Sedentário" {
            recommendations.append("Comece com caminhadas de 30 minutos, 3x por semana")
        }
        
        // General recommendations
        recommendations.append("Durma 7-9 horas por noite para melhor recuperação")
        recommendations.append("Mantenha-se hidratado bebendo água regularmente")
        
        return recommendations
    }
    
    private func generateShareText() -> String {
        let profile = anamneseModel.nutritionalProfile ?? calculateFallbackProfile()
        
        guard let profile = profile else {
            return "Confira meu perfil nutricional personalizado criado pelo EvolveYou!"
        }
        
        return """
        🧬 Meu Perfil Nutricional - EvolveYou
        
        📊 Métricas:
        • IMC: \(String(format: "%.1f", profile.bmi)) kg/m² (\(bmiCategory(profile.bmi)))
        • TMB: \(String(format: "%.0f", profile.bmr)) kcal
        • TDEE: \(String(format: "%.0f", profile.tdee)) kcal
        • Hidratação: \(String(format: "%.1f", profile.waterLiters))L/dia
        
        🥗 Macronutrientes:
        • Proteína: \(String(format: "%.0f", profile.proteinGrams))g
        • Carboidrato: \(String(format: "%.0f", profile.carbGrams))g
        • Gordura: \(String(format: "%.0f", profile.fatGrams))g
        
        Criado com base em 22 perguntas científicas personalizadas!
        """
    }
}

// MARK: - Section Header
struct SectionHeader: View {
    let title: String
    let icon: String
    
    var body: some View {
        HStack(spacing: 12) {
            Image(systemName: icon)
                .font(.system(size: 20, weight: .semibold))
                .foregroundColor(.white)
            
            Text(title)
                .font(.system(size: 22, weight: .bold))
                .foregroundColor(.white)
            
            Spacer()
        }
    }
}

// MARK: - Metric Card
struct MetricCard: View {
    let title: String
    let value: String
    let unit: String
    let color: Color
    let subtitle: String
    
    var body: some View {
        VStack(spacing: 12) {
            // Icon and Title
            VStack(spacing: 4) {
                Text(title)
                    .font(.system(size: 14, weight: .semibold))
                    .foregroundColor(.secondary)
                
                Text(subtitle)
                    .font(.system(size: 12, weight: .medium))
                    .foregroundColor(.secondary.opacity(0.8))
                    .lineLimit(1)
            }
            
            // Value
            HStack(alignment: .lastTextBaseline, spacing: 4) {
                Text(value)
                    .font(.system(size: 24, weight: .bold))
                    .foregroundColor(color)
                
                Text(unit)
                    .font(.system(size: 14, weight: .medium))
                    .foregroundColor(.secondary)
            }
        }
        .frame(maxWidth: .infinity)
        .padding(16)
        .background(
            RoundedRectangle(cornerRadius: 16)
                .fill(Color.white)
                .shadow(color: .black.opacity(0.1), radius: 8, x: 0, y: 4)
        )
    }
}

// MARK: - Macronutrient Bar
struct MacronutrientBar: View {
    let title: String
    let value: Double
    let unit: String
    let color: Color
    let percentage: Double
    
    var body: some View {
        VStack(spacing: 8) {
            HStack {
                Text(title)
                    .font(.system(size: 16, weight: .semibold))
                    .foregroundColor(.white)
                
                Spacer()
                
                HStack(spacing: 4) {
                    Text("\(String(format: "%.0f", value))\(unit)")
                        .font(.system(size: 16, weight: .bold))
                        .foregroundColor(.white)
                    
                    Text("(\(String(format: "%.0f", percentage))%)")
                        .font(.system(size: 14, weight: .medium))
                        .foregroundColor(.white.opacity(0.8))
                }
            }
            
            GeometryReader { geometry in
                ZStack(alignment: .leading) {
                    RoundedRectangle(cornerRadius: 4)
                        .fill(Color.white.opacity(0.3))
                        .frame(height: 8)
                    
                    RoundedRectangle(cornerRadius: 4)
                        .fill(color)
                        .frame(width: geometry.size.width * (percentage / 100), height: 8)
                        .animation(.easeInOut(duration: 1.0), value: percentage)
                }
            }
            .frame(height: 8)
        }
    }
}

// MARK: - Recommendation Card
struct RecommendationCard: View {
    let text: String
    let index: Int
    
    var body: some View {
        HStack(spacing: 16) {
            // Number Badge
            Text("\(index + 1)")
                .font(.system(size: 14, weight: .bold))
                .foregroundColor(.blue)
                .frame(width: 28, height: 28)
                .background(Color.white)
                .cornerRadius(14)
            
            // Recommendation Text
            Text(text)
                .font(.system(size: 15, weight: .medium))
                .foregroundColor(.white)
                .multilineTextAlignment(.leading)
                .lineLimit(nil)
            
            Spacer()
        }
        .padding(16)
        .background(
            RoundedRectangle(cornerRadius: 16)
                .fill(Color.white.opacity(0.15))
                .backdrop(BlurView(style: .systemUltraThinMaterialLight))
        )
    }
}

// MARK: - Share Sheet
struct ShareSheet: UIViewControllerRepresentable {
    let items: [Any]
    
    func makeUIViewController(context: Context) -> UIActivityViewController {
        UIActivityViewController(activityItems: items, applicationActivities: nil)
    }
    
    func updateUIViewController(_ uiViewController: UIActivityViewController, context: Context) {}
}

// MARK: - Preview
struct ResultsView_Previews: PreviewProvider {
    static var previews: some View {
        ResultsView()
            .environmentObject(AnamneseModel())
    }
}

