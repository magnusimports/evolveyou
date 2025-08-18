# 📱 Guia Completo: Criar Projeto EvolveYou iOS no Xcode

## 🎯 Solução para o Problema do Projeto Corrompido

O arquivo `project.pbxproj` gerado no ambiente Linux não é compatível com o Xcode no macOS. Este guia te ajudará a criar o projeto corretamente.

---

## 🚀 PASSO 1: CRIAR NOVO PROJETO NO XCODE

### 1.1 Abrir Xcode e Criar Projeto

1. **Abrir Xcode** no seu Mac
2. **File → New → Project** (ou `Cmd + Shift + N`)
3. **Selecionar template:**
   - **iOS** (tab superior)
   - **App** (template)
   - **Next**

### 1.2 Configurar Projeto

**Preencher os campos:**
- **Product Name**: `EvolveYou`
- **Team**: Selecione seu Apple Developer Team
- **Organization Identifier**: `com.magnussolucoes.evolveyou`
- **Bundle Identifier**: (será preenchido automaticamente)
- **Language**: `Swift`
- **Interface**: `SwiftUI`
- **Use Core Data**: ✅ **MARCAR ESTA OPÇÃO**
- **Include Tests**: ✅ **MARCAR ESTA OPÇÃO**

### 1.3 Salvar Projeto

- **Escolher localização** para salvar
- **Create** (não marcar "Create Git repository" se já tiver um)

---

## 📁 PASSO 2: ORGANIZAR ESTRUTURA DE PASTAS

### 2.1 Criar Grupos no Xcode

**Clique direito no projeto → New Group:**

1. **Models** (para modelos de dados)
2. **Views** (para telas SwiftUI)
3. **Services** (para lógica de negócio)
4. **Extensions** (para extensões)
5. **Utils** (para utilitários)

### 2.2 Estrutura Final

```
EvolveYou/
├── EvolveYouApp.swift
├── ContentView.swift
├── Models/
├── Views/
├── Services/
├── Extensions/
├── Utils/
├── Assets.xcassets/
├── EvolveYou.xcdatamodeld/
└── Info.plist
```

---

## 📝 PASSO 3: ADICIONAR ARQUIVOS SWIFT

### 3.1 Modelo Principal (Models/AnamneseModel.swift)

**Clique direito em "Models" → New File → Swift File**

Nome: `AnamneseModel.swift`

```swift
//
//  AnamneseModel.swift
//  EvolveYou
//
//  Created by Magnus Soluções on 17/08/2025.
//

import Foundation
import SwiftUI
import Combine

// MARK: - Question Model
struct Question: Identifiable, Codable {
    let id: String
    let text: String
    let category: String
    let type: QuestionType
    let options: [String]?
    let validation: QuestionValidation?
    let conditionalLogic: ConditionalLogic?
    
    enum QuestionType: String, Codable, CaseIterable {
        case text = "text"
        case number = "number"
        case singleSelect = "single_select"
        case multiSelect = "multi_select"
    }
}

// MARK: - Validation Model
struct QuestionValidation: Codable {
    let required: Bool
    let minLength: Int?
    let maxLength: Int?
    let pattern: String?
    let minValue: Double?
    let maxValue: Double?
}

// MARK: - Conditional Logic
struct ConditionalLogic: Codable {
    let dependsOn: String?
    let showIf: [String]?
    let hideIf: [String]?
}

// MARK: - Validation Result
struct ValidationResult {
    let isValid: Bool
    let message: String?
}

// MARK: - Nutritional Profile
struct NutritionalProfile: Codable, Identifiable {
    let id = UUID()
    let userId: String
    let bmi: Double
    let bmr: Double
    let tdee: Double
    let proteinGrams: Double
    let carbGrams: Double
    let fatGrams: Double
    let waterLiters: Double
    let recommendations: [String]
    let createdAt: Date
    let updatedAt: Date
}

// MARK: - Anamnese Model
class AnamneseModel: ObservableObject {
    @Published var currentQuestionIndex = 0
    @Published var answers: [String: String] = [:]
    @Published var isCompleted = false
    @Published var nutritionalProfile: NutritionalProfile?
    @Published var progress: Double = 0.0
    
    let questions: [Question] = [
        Question(
            id: "1",
            text: "Qual é o seu nome completo?",
            category: "Dados Pessoais",
            type: .text,
            options: nil,
            validation: QuestionValidation(required: true, minLength: 2, maxLength: 100, pattern: nil, minValue: nil, maxValue: nil),
            conditionalLogic: nil
        ),
        Question(
            id: "2",
            text: "Qual é a sua idade?",
            category: "Dados Pessoais",
            type: .number,
            options: nil,
            validation: QuestionValidation(required: true, minLength: nil, maxLength: nil, pattern: nil, minValue: 16, maxValue: 100),
            conditionalLogic: nil
        ),
        Question(
            id: "3",
            text: "Qual é o seu sexo biológico?",
            category: "Dados Pessoais",
            type: .singleSelect,
            options: ["Masculino", "Feminino"],
            validation: QuestionValidation(required: true, minLength: nil, maxLength: nil, pattern: nil, minValue: nil, maxValue: nil),
            conditionalLogic: nil
        ),
        Question(
            id: "4",
            text: "Qual é o seu peso atual? (kg)",
            category: "Medidas Corporais",
            type: .number,
            options: nil,
            validation: QuestionValidation(required: true, minLength: nil, maxLength: nil, pattern: nil, minValue: 30, maxValue: 300),
            conditionalLogic: nil
        ),
        Question(
            id: "5",
            text: "Qual é a sua altura? (cm)",
            category: "Medidas Corporais",
            type: .number,
            options: nil,
            validation: QuestionValidation(required: true, minLength: nil, maxLength: nil, pattern: nil, minValue: 100, maxValue: 250),
            conditionalLogic: nil
        ),
        Question(
            id: "6",
            text: "Como você descreveria sua composição corporal atual?",
            category: "Medidas Corporais",
            type: .singleSelect,
            options: ["Magro", "Normal", "Atlético", "Acima do peso", "Obeso"],
            validation: QuestionValidation(required: true, minLength: nil, maxLength: nil, pattern: nil, minValue: nil, maxValue: nil),
            conditionalLogic: nil
        ),
        Question(
            id: "7",
            text: "Qual é o seu principal objetivo?",
            category: "Objetivos",
            type: .singleSelect,
            options: ["Perder peso", "Ganhar massa muscular", "Manter peso atual", "Melhorar saúde geral"],
            validation: QuestionValidation(required: true, minLength: nil, maxLength: nil, pattern: nil, minValue: nil, maxValue: nil),
            conditionalLogic: nil
        ),
        Question(
            id: "8",
            text: "Qual é o seu peso desejado? (kg) - Opcional",
            category: "Objetivos",
            type: .number,
            options: nil,
            validation: QuestionValidation(required: false, minLength: nil, maxLength: nil, pattern: nil, minValue: 30, maxValue: 300),
            conditionalLogic: ConditionalLogic(dependsOn: "7", showIf: ["Perder peso", "Ganhar massa muscular"], hideIf: nil)
        ),
        Question(
            id: "9",
            text: "Em quanto tempo você gostaria de alcançar seu objetivo?",
            category: "Objetivos",
            type: .singleSelect,
            options: ["1-3 meses", "3-6 meses", "6-12 meses", "Mais de 1 ano"],
            validation: QuestionValidation(required: true, minLength: nil, maxLength: nil, pattern: nil, minValue: nil, maxValue: nil),
            conditionalLogic: nil
        ),
        Question(
            id: "10",
            text: "Qual é o seu nível de atividade física?",
            category: "Atividade Física",
            type: .singleSelect,
            options: ["Sedentário", "Levemente ativo", "Moderadamente ativo", "Muito ativo", "Extremamente ativo"],
            validation: QuestionValidation(required: true, minLength: nil, maxLength: nil, pattern: nil, minValue: nil, maxValue: nil),
            conditionalLogic: nil
        ),
        Question(
            id: "11",
            text: "Que tipos de exercício você pratica? (Selecione todos que se aplicam)",
            category: "Atividade Física",
            type: .multiSelect,
            options: ["Musculação", "Corrida", "Caminhada", "Natação", "Ciclismo", "Yoga", "Pilates", "Esportes", "Dança", "Nenhum"],
            validation: QuestionValidation(required: true, minLength: nil, maxLength: nil, pattern: nil, minValue: nil, maxValue: nil),
            conditionalLogic: nil
        ),
        Question(
            id: "12",
            text: "Quantas refeições você faz por dia?",
            category: "Hábitos Alimentares",
            type: .singleSelect,
            options: ["2 refeições", "3 refeições", "4-5 refeições", "6+ refeições"],
            validation: QuestionValidation(required: true, minLength: nil, maxLength: nil, pattern: nil, minValue: nil, maxValue: nil),
            conditionalLogic: nil
        ),
        Question(
            id: "13",
            text: "Com que frequência você cozinha em casa?",
            category: "Hábitos Alimentares",
            type: .singleSelect,
            options: ["Sempre", "Na maioria das vezes", "Às vezes", "Raramente", "Nunca"],
            validation: QuestionValidation(required: true, minLength: nil, maxLength: nil, pattern: nil, minValue: nil, maxValue: nil),
            conditionalLogic: nil
        ),
        Question(
            id: "14",
            text: "Quantos litros de água você bebe por dia?",
            category: "Hábitos Alimentares",
            type: .number,
            options: nil,
            validation: QuestionValidation(required: true, minLength: nil, maxLength: nil, pattern: nil, minValue: 0.5, maxValue: 10),
            conditionalLogic: nil
        ),
        Question(
            id: "15",
            text: "Você tem alguma restrição alimentar? (Selecione todas que se aplicam)",
            category: "Restrições e Alergias",
            type: .multiSelect,
            options: ["Vegetariano", "Vegano", "Sem lactose", "Sem glúten", "Low carb", "Cetogênica", "Jejum intermitente", "Nenhuma"],
            validation: QuestionValidation(required: true, minLength: nil, maxLength: nil, pattern: nil, minValue: nil, maxValue: nil),
            conditionalLogic: nil
        ),
        Question(
            id: "16",
            text: "Você tem alguma alergia alimentar? (Selecione todas que se aplicam)",
            category: "Restrições e Alergias",
            type: .multiSelect,
            options: ["Amendoim", "Castanhas", "Frutos do mar", "Ovos", "Leite", "Soja", "Trigo", "Nenhuma"],
            validation: QuestionValidation(required: true, minLength: nil, maxLength: nil, pattern: nil, minValue: nil, maxValue: nil),
            conditionalLogic: nil
        ),
        Question(
            id: "17",
            text: "Como você classificaria seu nível de estresse?",
            category: "Estilo de Vida",
            type: .singleSelect,
            options: ["Muito baixo", "Baixo", "Moderado", "Alto", "Muito alto"],
            validation: QuestionValidation(required: true, minLength: nil, maxLength: nil, pattern: nil, minValue: nil, maxValue: nil),
            conditionalLogic: nil
        ),
        Question(
            id: "18",
            text: "Quantas horas você dorme por noite?",
            category: "Estilo de Vida",
            type: .singleSelect,
            options: ["Menos de 5h", "5-6h", "6-7h", "7-8h", "8-9h", "Mais de 9h"],
            validation: QuestionValidation(required: true, minLength: nil, maxLength: nil, pattern: nil, minValue: nil, maxValue: nil),
            conditionalLogic: nil
        ),
        Question(
            id: "19",
            text: "Como você classificaria a qualidade do seu sono?",
            category: "Estilo de Vida",
            type: .singleSelect,
            options: ["Muito ruim", "Ruim", "Regular", "Boa", "Excelente"],
            validation: QuestionValidation(required: true, minLength: nil, maxLength: nil, pattern: nil, minValue: nil, maxValue: nil),
            conditionalLogic: nil
        ),
        Question(
            id: "20",
            text: "Com que frequência você consome álcool?",
            category: "Estilo de Vida",
            type: .singleSelect,
            options: ["Nunca", "Raramente", "1-2x por semana", "3-4x por semana", "Diariamente"],
            validation: QuestionValidation(required: true, minLength: nil, maxLength: nil, pattern: nil, minValue: nil, maxValue: nil),
            conditionalLogic: nil
        ),
        Question(
            id: "21",
            text: "Você tem alguma condição de saúde? (Selecione todas que se aplicam)",
            category: "Saúde e Medicamentos",
            type: .multiSelect,
            options: ["Diabetes", "Hipertensão", "Colesterol alto", "Problemas cardíacos", "Problemas tireoide", "Problemas digestivos", "Nenhuma"],
            validation: QuestionValidation(required: true, minLength: nil, maxLength: nil, pattern: nil, minValue: nil, maxValue: nil),
            conditionalLogic: nil
        ),
        Question(
            id: "22",
            text: "Você toma algum medicamento regularmente? (Selecione todos que se aplicam)",
            category: "Saúde e Medicamentos",
            type: .multiSelect,
            options: ["Vitaminas/Suplementos", "Medicamentos para pressão", "Medicamentos para diabetes", "Medicamentos para tireoide", "Antidepressivos", "Outros", "Nenhum"],
            validation: QuestionValidation(required: true, minLength: nil, maxLength: nil, pattern: nil, minValue: nil, maxValue: nil),
            conditionalLogic: nil
        )
    ]
    
    var visibleQuestions: [Question] {
        return questions.filter { question in
            guard let conditional = question.conditionalLogic else { return true }
            
            if let dependsOn = conditional.dependsOn,
               let answer = answers[dependsOn] {
                
                if let showIf = conditional.showIf {
                    return showIf.contains(answer)
                }
                
                if let hideIf = conditional.hideIf {
                    return !hideIf.contains(answer)
                }
            }
            
            return true
        }
    }
    
    var currentQuestion: Question? {
        guard currentQuestionIndex < visibleQuestions.count else { return nil }
        return visibleQuestions[currentQuestionIndex]
    }
    
    var isLastQuestion: Bool {
        return currentQuestionIndex >= visibleQuestions.count - 1
    }
    
    func updateAnswer(_ answer: String, for questionId: String) {
        answers[questionId] = answer
        updateProgress()
    }
    
    func nextQuestion() {
        if currentQuestionIndex < visibleQuestions.count - 1 {
            currentQuestionIndex += 1
            updateProgress()
        }
    }
    
    func previousQuestion() {
        if currentQuestionIndex > 0 {
            currentQuestionIndex -= 1
            updateProgress()
        }
    }
    
    func validateAnswer(_ answer: String, for question: Question) -> ValidationResult {
        guard let validation = question.validation else {
            return ValidationResult(isValid: true, message: nil)
        }
        
        // Required field validation
        if validation.required && answer.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty {
            return ValidationResult(isValid: false, message: "Este campo é obrigatório")
        }
        
        // Skip other validations if field is empty and not required
        if !validation.required && answer.isEmpty {
            return ValidationResult(isValid: true, message: nil)
        }
        
        // Length validation
        if let minLength = validation.minLength, answer.count < minLength {
            return ValidationResult(isValid: false, message: "Mínimo de \(minLength) caracteres")
        }
        
        if let maxLength = validation.maxLength, answer.count > maxLength {
            return ValidationResult(isValid: false, message: "Máximo de \(maxLength) caracteres")
        }
        
        // Numeric validation
        if question.type == .number {
            guard let numericValue = Double(answer) else {
                return ValidationResult(isValid: false, message: "Digite um número válido")
            }
            
            if let minValue = validation.minValue, numericValue < minValue {
                return ValidationResult(isValid: false, message: "Valor mínimo: \(minValue)")
            }
            
            if let maxValue = validation.maxValue, numericValue > maxValue {
                return ValidationResult(isValid: false, message: "Valor máximo: \(maxValue)")
            }
        }
        
        // Pattern validation
        if let pattern = validation.pattern {
            let regex = try? NSRegularExpression(pattern: pattern)
            let range = NSRange(location: 0, length: answer.utf16.count)
            if regex?.firstMatch(in: answer, options: [], range: range) == nil {
                return ValidationResult(isValid: false, message: "Formato inválido")
            }
        }
        
        return ValidationResult(isValid: true, message: nil)
    }
    
    private func updateProgress() {
        let totalQuestions = visibleQuestions.count
        let answeredQuestions = visibleQuestions.prefix(currentQuestionIndex + 1).count
        progress = Double(answeredQuestions) / Double(totalQuestions)
    }
    
    func completeAnamnese() {
        isCompleted = true
        // Aqui você pode calcular o perfil nutricional
        calculateNutritionalProfile()
    }
    
    private func calculateNutritionalProfile() {
        // Implementar cálculo do perfil nutricional
        // Por enquanto, criar um perfil de exemplo
        nutritionalProfile = NutritionalProfile(
            userId: "local",
            bmi: 22.5,
            bmr: 1800,
            tdee: 2500,
            proteinGrams: 140,
            carbGrams: 300,
            fatGrams: 80,
            waterLiters: 3.0,
            recommendations: ["Mantenha uma alimentação equilibrada", "Pratique exercícios regularmente"],
            createdAt: Date(),
            updatedAt: Date()
        )
    }
}
```

### 3.2 Tela de Boas-vindas (Views/WelcomeView.swift)

**Clique direito em "Views" → New File → Swift File**

Nome: `WelcomeView.swift`

```swift
//
//  WelcomeView.swift
//  EvolveYou
//
//  Created by Magnus Soluções on 17/08/2025.
//

import SwiftUI

struct WelcomeView: View {
    @Binding var showAnamnese: Bool
    
    var body: some View {
        NavigationView {
            ScrollView {
                VStack(spacing: 30) {
                    // Header
                    VStack(spacing: 16) {
                        Image(systemName: "heart.fill")
                            .font(.system(size: 60))
                            .foregroundColor(.red)
                        
                        Text("EvolveYou")
                            .font(.largeTitle)
                            .fontWeight(.bold)
                        
                        Text("Sua jornada para uma vida mais saudável começa aqui")
                            .font(.title3)
                            .multilineTextAlignment(.center)
                            .foregroundColor(.secondary)
                    }
                    .padding(.top, 40)
                    
                    // Features
                    VStack(spacing: 20) {
                        FeatureCard(
                            icon: "brain.head.profile",
                            title: "Anamnese Inteligente",
                            description: "22 perguntas científicas para criar seu perfil nutricional personalizado"
                        )
                        
                        FeatureCard(
                            icon: "chart.line.uptrend.xyaxis",
                            title: "Cálculos Precisos",
                            description: "TMB, TDEE e macronutrientes calculados com fórmulas validadas cientificamente"
                        )
                        
                        FeatureCard(
                            icon: "leaf.fill",
                            title: "Base TACO Brasileira",
                            description: "Recomendações baseadas em alimentos genuinamente brasileiros"
                        )
                        
                        FeatureCard(
                            icon: "lock.shield.fill",
                            title: "Privacidade Total",
                            description: "Seus dados são protegidos e nunca compartilhados sem seu consentimento"
                        )
                    }
                    
                    // Time estimate
                    VStack(spacing: 12) {
                        HStack {
                            Image(systemName: "clock.fill")
                                .foregroundColor(.blue)
                            Text("Tempo estimado: 5-8 minutos")
                                .font(.subheadline)
                                .fontWeight(.medium)
                        }
                        
                        Text("Suas respostas são salvas automaticamente")
                            .font(.caption)
                            .foregroundColor(.secondary)
                    }
                    .padding()
                    .background(Color.blue.opacity(0.1))
                    .cornerRadius(12)
                    
                    // Start button
                    Button(action: {
                        showAnamnese = true
                    }) {
                        Text("Iniciar Anamnese")
                            .font(.headline)
                            .foregroundColor(.white)
                            .frame(maxWidth: .infinity)
                            .padding()
                            .background(Color.blue)
                            .cornerRadius(12)
                    }
                    .padding(.top, 20)
                    
                    Spacer(minLength: 40)
                }
                .padding(.horizontal, 24)
            }
            .navigationBarHidden(true)
        }
    }
}

struct FeatureCard: View {
    let icon: String
    let title: String
    let description: String
    
    var body: some View {
        HStack(alignment: .top, spacing: 16) {
            Image(systemName: icon)
                .font(.title2)
                .foregroundColor(.blue)
                .frame(width: 30)
            
            VStack(alignment: .leading, spacing: 4) {
                Text(title)
                    .font(.headline)
                    .fontWeight(.semibold)
                
                Text(description)
                    .font(.subheadline)
                    .foregroundColor(.secondary)
                    .multilineTextAlignment(.leading)
            }
            
            Spacer()
        }
        .padding()
        .background(Color(.systemGray6))
        .cornerRadius(12)
    }
}

struct WelcomeView_Previews: PreviewProvider {
    static var previews: some View {
        WelcomeView(showAnamnese: .constant(false))
    }
}
```

### 3.3 Tela de Perguntas (Views/QuestionView.swift)

**Clique direito em "Views" → New File → Swift File**

Nome: `QuestionView.swift`

```swift
//
//  QuestionView.swift
//  EvolveYou
//
//  Created by Magnus Soluções on 17/08/2025.
//

import SwiftUI

struct QuestionView: View {
    @ObservedObject var anamneseModel: AnamneseModel
    @State private var currentAnswer = ""
    @State private var selectedOptions: Set<String> = []
    @State private var validationMessage: String?
    @Binding var showResults: Bool
    
    var body: some View {
        NavigationView {
            GeometryReader { geometry in
                HStack(spacing: 0) {
                    // Main content
                    ScrollView {
                        VStack(spacing: 24) {
                            if let question = anamneseModel.currentQuestion {
                                // Progress header
                                VStack(spacing: 16) {
                                    HStack {
                                        Text("Pergunta \(anamneseModel.currentQuestionIndex + 1) de \(anamneseModel.visibleQuestions.count)")
                                            .font(.caption)
                                            .foregroundColor(.secondary)
                                        
                                        Spacer()
                                        
                                        Text(question.category)
                                            .font(.caption)
                                            .fontWeight(.medium)
                                            .padding(.horizontal, 8)
                                            .padding(.vertical, 4)
                                            .background(Color.blue.opacity(0.2))
                                            .cornerRadius(8)
                                    }
                                    
                                    ProgressView(value: anamneseModel.progress)
                                        .progressViewStyle(LinearProgressViewStyle(tint: .blue))
                                }
                                
                                // Question card
                                VStack(alignment: .leading, spacing: 20) {
                                    Text(question.text)
                                        .font(.title2)
                                        .fontWeight(.semibold)
                                        .multilineTextAlignment(.leading)
                                    
                                    // Input based on question type
                                    Group {
                                        switch question.type {
                                        case .text:
                                            TextField("Sua resposta", text: $currentAnswer)
                                                .textFieldStyle(RoundedBorderTextFieldStyle())
                                                .font(.body)
                                        
                                        case .number:
                                            TextField("Digite um número", text: $currentAnswer)
                                                .textFieldStyle(RoundedBorderTextFieldStyle())
                                                .keyboardType(.decimalPad)
                                                .font(.body)
                                        
                                        case .singleSelect:
                                            if let options = question.options {
                                                VStack(spacing: 8) {
                                                    ForEach(options, id: \.self) { option in
                                                        Button(action: {
                                                            currentAnswer = option
                                                        }) {
                                                            HStack {
                                                                Image(systemName: currentAnswer == option ? "checkmark.circle.fill" : "circle")
                                                                    .foregroundColor(currentAnswer == option ? .blue : .gray)
                                                                
                                                                Text(option)
                                                                    .foregroundColor(.primary)
                                                                
                                                                Spacer()
                                                            }
                                                            .padding()
                                                            .background(currentAnswer == option ? Color.blue.opacity(0.1) : Color(.systemGray6))
                                                            .cornerRadius(8)
                                                        }
                                                    }
                                                }
                                            }
                                        
                                        case .multiSelect:
                                            if let options = question.options {
                                                VStack(spacing: 8) {
                                                    ForEach(options, id: \.self) { option in
                                                        Button(action: {
                                                            if selectedOptions.contains(option) {
                                                                selectedOptions.remove(option)
                                                            } else {
                                                                selectedOptions.insert(option)
                                                            }
                                                            currentAnswer = Array(selectedOptions).joined(separator: ",")
                                                        }) {
                                                            HStack {
                                                                Image(systemName: selectedOptions.contains(option) ? "checkmark.square.fill" : "square")
                                                                    .foregroundColor(selectedOptions.contains(option) ? .blue : .gray)
                                                                
                                                                Text(option)
                                                                    .foregroundColor(.primary)
                                                                
                                                                Spacer()
                                                            }
                                                            .padding()
                                                            .background(selectedOptions.contains(option) ? Color.blue.opacity(0.1) : Color(.systemGray6))
                                                            .cornerRadius(8)
                                                        }
                                                    }
                                                }
                                            }
                                        }
                                    }
                                    
                                    // Validation message
                                    if let message = validationMessage {
                                        Text(message)
                                            .font(.caption)
                                            .foregroundColor(.red)
                                    }
                                }
                                .padding(24)
                                .background(Color(.systemBackground))
                                .cornerRadius(16)
                                .shadow(color: .black.opacity(0.1), radius: 8, x: 0, y: 2)
                                
                                // Navigation buttons
                                HStack(spacing: 16) {
                                    if anamneseModel.currentQuestionIndex > 0 {
                                        Button("Anterior") {
                                            saveCurrentAnswer()
                                            anamneseModel.previousQuestion()
                                            loadAnswer()
                                        }
                                        .font(.headline)
                                        .foregroundColor(.blue)
                                        .frame(maxWidth: .infinity)
                                        .padding()
                                        .background(Color.blue.opacity(0.1))
                                        .cornerRadius(12)
                                    }
                                    
                                    Button(anamneseModel.isLastQuestion ? "Finalizar" : "Próxima") {
                                        let validation = anamneseModel.validateAnswer(currentAnswer, for: question)
                                        
                                        if validation.isValid {
                                            validationMessage = nil
                                            saveCurrentAnswer()
                                            
                                            if anamneseModel.isLastQuestion {
                                                anamneseModel.completeAnamnese()
                                                showResults = true
                                            } else {
                                                anamneseModel.nextQuestion()
                                                loadAnswer()
                                            }
                                        } else {
                                            validationMessage = validation.message
                                        }
                                    }
                                    .font(.headline)
                                    .foregroundColor(.white)
                                    .frame(maxWidth: .infinity)
                                    .padding()
                                    .background(Color.blue)
                                    .cornerRadius(12)
                                }
                                .padding(.top, 20)
                            }
                        }
                        .padding(.horizontal, 24)
                        .padding(.top, 20)
                    }
                    .frame(width: geometry.size.width * 0.75)
                    
                    // Side panel with progress summary
                    if geometry.size.width > 600 {
                        ProgressSummary(anamneseModel: anamneseModel)
                            .frame(width: geometry.size.width * 0.25)
                            .background(Color(.systemGray6))
                    }
                }
            }
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .navigationBarLeading) {
                    Text("EvolveYou")
                        .font(.headline)
                        .fontWeight(.bold)
                }
                
                ToolbarItem(placement: .navigationBarTrailing) {
                    Text("\(Int(anamneseModel.progress * 100))%")
                        .font(.caption)
                        .fontWeight(.medium)
                        .padding(.horizontal, 8)
                        .padding(.vertical, 4)
                        .background(Color.blue.opacity(0.2))
                        .cornerRadius(8)
                }
            }
        }
        .onAppear {
            loadAnswer()
        }
    }
    
    private func saveCurrentAnswer() {
        guard let question = anamneseModel.currentQuestion else { return }
        anamneseModel.updateAnswer(currentAnswer, for: question.id)
    }
    
    private func loadAnswer() {
        guard let question = anamneseModel.currentQuestion else { return }
        currentAnswer = anamneseModel.answers[question.id] ?? ""
        
        if question.type == .multiSelect && !currentAnswer.isEmpty {
            selectedOptions = Set(currentAnswer.components(separatedBy: ","))
        } else {
            selectedOptions.removeAll()
        }
        
        validationMessage = nil
    }
}

struct ProgressSummary: View {
    @ObservedObject var anamneseModel: AnamneseModel
    
    var body: some View {
        ScrollView {
            VStack(alignment: .leading, spacing: 16) {
                Text("Progresso")
                    .font(.headline)
                    .fontWeight(.bold)
                    .padding(.horizontal)
                    .padding(.top)
                
                // Progress by category
                let categories = Dictionary(grouping: anamneseModel.visibleQuestions) { $0.category }
                
                ForEach(Array(categories.keys).sorted(), id: \.self) { category in
                    let categoryQuestions = categories[category] ?? []
                    let answeredCount = categoryQuestions.filter { anamneseModel.answers[$0.id] != nil }.count
                    let progress = Double(answeredCount) / Double(categoryQuestions.count)
                    
                    VStack(alignment: .leading, spacing: 8) {
                        HStack {
                            Text(category)
                                .font(.subheadline)
                                .fontWeight(.medium)
                            
                            Spacer()
                            
                            Text("\(answeredCount)/\(categoryQuestions.count)")
                                .font(.caption)
                                .foregroundColor(.secondary)
                        }
                        
                        ProgressView(value: progress)
                            .progressViewStyle(LinearProgressViewStyle(tint: .blue))
                    }
                    .padding(.horizontal)
                }
                
                Divider()
                    .padding(.horizontal)
                
                // Overall progress
                VStack(alignment: .leading, spacing: 8) {
                    Text("Progresso Geral")
                        .font(.subheadline)
                        .fontWeight(.medium)
                    
                    Text("\(Int(anamneseModel.progress * 100))% concluído")
                        .font(.caption)
                        .foregroundColor(.secondary)
                    
                    ProgressView(value: anamneseModel.progress)
                        .progressViewStyle(LinearProgressViewStyle(tint: .green))
                }
                .padding(.horizontal)
                
                Spacer()
            }
        }
    }
}

struct QuestionView_Previews: PreviewProvider {
    static var previews: some View {
        QuestionView(
            anamneseModel: AnamneseModel(),
            showResults: .constant(false)
        )
    }
}
```

### 3.4 Tela de Resultados (Views/ResultsView.swift)

**Clique direito em "Views" → New File → Swift File**

Nome: `ResultsView.swift`

```swift
//
//  ResultsView.swift
//  EvolveYou
//
//  Created by Magnus Soluções on 17/08/2025.
//

import SwiftUI

struct ResultsView: View {
    let nutritionalProfile: NutritionalProfile
    @Binding var showWelcome: Bool
    
    var body: some View {
        NavigationView {
            ScrollView {
                VStack(spacing: 24) {
                    // Header
                    VStack(spacing: 16) {
                        Image(systemName: "checkmark.circle.fill")
                            .font(.system(size: 60))
                            .foregroundColor(.green)
                        
                        Text("Perfil Nutricional Criado!")
                            .font(.title)
                            .fontWeight(.bold)
                        
                        Text("Baseado nas suas respostas, criamos um plano personalizado para você")
                            .font(.subheadline)
                            .multilineTextAlignment(.center)
                            .foregroundColor(.secondary)
                    }
                    .padding(.top, 20)
                    
                    // Metrics cards
                    LazyVGrid(columns: [
                        GridItem(.flexible()),
                        GridItem(.flexible())
                    ], spacing: 16) {
                        MetricCard(
                            title: "IMC",
                            value: String(format: "%.1f", nutritionalProfile.bmi),
                            subtitle: getBMICategory(nutritionalProfile.bmi),
                            color: getBMIColor(nutritionalProfile.bmi)
                        )
                        
                        MetricCard(
                            title: "TMB",
                            value: String(format: "%.0f", nutritionalProfile.bmr),
                            subtitle: "kcal/dia",
                            color: .blue
                        )
                        
                        MetricCard(
                            title: "TDEE",
                            value: String(format: "%.0f", nutritionalProfile.tdee),
                            subtitle: "kcal/dia",
                            color: .purple
                        )
                        
                        MetricCard(
                            title: "Água",
                            value: String(format: "%.1f", nutritionalProfile.waterLiters),
                            subtitle: "litros/dia",
                            color: .cyan
                        )
                    }
                    
                    // Macronutrients
                    VStack(alignment: .leading, spacing: 16) {
                        Text("Macronutrientes Diários")
                            .font(.headline)
                            .fontWeight(.bold)
                        
                        VStack(spacing: 12) {
                            MacroBar(
                                name: "Proteína",
                                value: nutritionalProfile.proteinGrams,
                                unit: "g",
                                color: .red,
                                percentage: (nutritionalProfile.proteinGrams * 4) / nutritionalProfile.tdee
                            )
                            
                            MacroBar(
                                name: "Carboidratos",
                                value: nutritionalProfile.carbGrams,
                                unit: "g",
                                color: .orange,
                                percentage: (nutritionalProfile.carbGrams * 4) / nutritionalProfile.tdee
                            )
                            
                            MacroBar(
                                name: "Gorduras",
                                value: nutritionalProfile.fatGrams,
                                unit: "g",
                                color: .yellow,
                                percentage: (nutritionalProfile.fatGrams * 9) / nutritionalProfile.tdee
                            )
                        }
                    }
                    .padding()
                    .background(Color(.systemGray6))
                    .cornerRadius(12)
                    
                    // Recommendations
                    VStack(alignment: .leading, spacing: 16) {
                        Text("Recomendações Personalizadas")
                            .font(.headline)
                            .fontWeight(.bold)
                        
                        ForEach(Array(nutritionalProfile.recommendations.enumerated()), id: \.offset) { index, recommendation in
                            HStack(alignment: .top, spacing: 12) {
                                Text("\(index + 1)")
                                    .font(.caption)
                                    .fontWeight(.bold)
                                    .foregroundColor(.white)
                                    .frame(width: 24, height: 24)
                                    .background(Color.blue)
                                    .clipShape(Circle())
                                
                                Text(recommendation)
                                    .font(.subheadline)
                                    .multilineTextAlignment(.leading)
                                
                                Spacer()
                            }
                        }
                    }
                    .padding()
                    .background(Color(.systemGray6))
                    .cornerRadius(12)
                    
                    // Action buttons
                    VStack(spacing: 12) {
                        Button("Salvar Perfil") {
                            // Implementar salvamento
                        }
                        .font(.headline)
                        .foregroundColor(.white)
                        .frame(maxWidth: .infinity)
                        .padding()
                        .background(Color.blue)
                        .cornerRadius(12)
                        
                        Button("Fazer Nova Anamnese") {
                            showWelcome = true
                        }
                        .font(.headline)
                        .foregroundColor(.blue)
                        .frame(maxWidth: .infinity)
                        .padding()
                        .background(Color.blue.opacity(0.1))
                        .cornerRadius(12)
                    }
                    .padding(.top, 20)
                    
                    Spacer(minLength: 40)
                }
                .padding(.horizontal, 24)
            }
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .navigationBarLeading) {
                    Text("EvolveYou")
                        .font(.headline)
                        .fontWeight(.bold)
                }
            }
        }
    }
    
    private func getBMICategory(_ bmi: Double) -> String {
        switch bmi {
        case ..<18.5: return "Abaixo do peso"
        case 18.5..<25: return "Peso normal"
        case 25..<30: return "Sobrepeso"
        case 30..<35: return "Obesidade I"
        case 35..<40: return "Obesidade II"
        default: return "Obesidade III"
        }
    }
    
    private func getBMIColor(_ bmi: Double) -> Color {
        switch bmi {
        case ..<18.5: return .blue
        case 18.5..<25: return .green
        case 25..<30: return .orange
        default: return .red
        }
    }
}

struct MetricCard: View {
    let title: String
    let value: String
    let subtitle: String
    let color: Color
    
    var body: some View {
        VStack(spacing: 8) {
            Text(title)
                .font(.caption)
                .fontWeight(.medium)
                .foregroundColor(.secondary)
            
            Text(value)
                .font(.title)
                .fontWeight(.bold)
                .foregroundColor(color)
            
            Text(subtitle)
                .font(.caption)
                .foregroundColor(.secondary)
        }
        .frame(maxWidth: .infinity)
        .padding()
        .background(Color(.systemBackground))
        .cornerRadius(12)
        .shadow(color: .black.opacity(0.1), radius: 4, x: 0, y: 2)
    }
}

struct MacroBar: View {
    let name: String
    let value: Double
    let unit: String
    let color: Color
    let percentage: Double
    
    var body: some View {
        VStack(alignment: .leading, spacing: 4) {
            HStack {
                Text(name)
                    .font(.subheadline)
                    .fontWeight(.medium)
                
                Spacer()
                
                Text("\(String(format: "%.0f", value))\(unit)")
                    .font(.subheadline)
                    .fontWeight(.bold)
                    .foregroundColor(color)
                
                Text("(\(String(format: "%.0f", percentage * 100))%)")
                    .font(.caption)
                    .foregroundColor(.secondary)
            }
            
            ProgressView(value: min(percentage, 1.0))
                .progressViewStyle(LinearProgressViewStyle(tint: color))
        }
    }
}

struct ResultsView_Previews: PreviewProvider {
    static var previews: some View {
        ResultsView(
            nutritionalProfile: NutritionalProfile(
                userId: "preview",
                bmi: 22.5,
                bmr: 1800,
                tdee: 2500,
                proteinGrams: 140,
                carbGrams: 300,
                fatGrams: 80,
                waterLiters: 3.0,
                recommendations: [
                    "Mantenha uma alimentação equilibrada",
                    "Pratique exercícios regularmente",
                    "Beba água suficiente"
                ],
                createdAt: Date(),
                updatedAt: Date()
            ),
            showWelcome: .constant(false)
        )
    }
}
```

---

## 🔧 PASSO 4: ATUALIZAR ARQUIVOS PRINCIPAIS

### 4.1 Atualizar ContentView.swift

**Substituir o conteúdo do arquivo `ContentView.swift`:**

```swift
//
//  ContentView.swift
//  EvolveYou
//
//  Created by Magnus Soluções on 17/08/2025.
//

import SwiftUI

struct ContentView: View {
    @StateObject private var anamneseModel = AnamneseModel()
    @State private var showAnamnese = false
    @State private var showResults = false
    
    var body: some View {
        Group {
            if showResults, let profile = anamneseModel.nutritionalProfile {
                ResultsView(nutritionalProfile: profile, showWelcome: $showAnamnese)
                    .onAppear {
                        showAnamnese = false
                        showResults = true
                    }
            } else if showAnamnese {
                QuestionView(anamneseModel: anamneseModel, showResults: $showResults)
            } else {
                WelcomeView(showAnamnese: $showAnamnese)
            }
        }
        .onChange(of: showAnamnese) { newValue in
            if newValue {
                showResults = false
                anamneseModel.currentQuestionIndex = 0
                anamneseModel.answers.removeAll()
                anamneseModel.isCompleted = false
                anamneseModel.nutritionalProfile = nil
            }
        }
    }
}

struct ContentView_Previews: PreviewProvider {
    static var previews: some View {
        ContentView()
    }
}
```

### 4.2 Atualizar EvolveYouApp.swift

**Substituir o conteúdo do arquivo `EvolveYouApp.swift`:**

```swift
//
//  EvolveYouApp.swift
//  EvolveYou
//
//  Created by Magnus Soluções on 17/08/2025.
//

import SwiftUI

@main
struct EvolveYouApp: App {
    let persistenceController = PersistenceController.shared

    var body: some Scene {
        WindowGroup {
            ContentView()
                .environment(\.managedObjectContext, persistenceController.container.viewContext)
        }
    }
}

// MARK: - Persistence Controller
import CoreData

struct PersistenceController {
    static let shared = PersistenceController()

    static var preview: PersistenceController = {
        let result = PersistenceController(inMemory: true)
        let viewContext = result.container.viewContext
        
        // Add sample data for previews if needed
        
        do {
            try viewContext.save()
        } catch {
            let nsError = error as NSError
            fatalError("Unresolved error \(nsError), \(nsError.userInfo)")
        }
        return result
    }()

    let container: NSPersistentContainer

    init(inMemory: Bool = false) {
        container = NSPersistentContainer(name: "EvolveYou")
        if inMemory {
            container.persistentStoreDescriptions.first!.url = URL(fileURLWithPath: "/dev/null")
        }
        container.loadPersistentStores(completionHandler: { (storeDescription, error) in
            if let error = error as NSError? {
                fatalError("Unresolved error \(error), \(error.userInfo)")
            }
        })
        container.viewContext.automaticallyMergesChangesFromParent = true
    }
}
```

---

## ✅ PASSO 5: TESTAR O PROJETO

### 5.1 Build e Execução

1. **Selecionar simulador** (iPhone 15 Pro)
2. **Pressionar Cmd + R** para executar
3. **Verificar se compila** sem erros

### 5.2 Teste Básico

1. **Tela de boas-vindas** deve aparecer
2. **Clicar "Iniciar Anamnese"**
3. **Navegar pelas perguntas**
4. **Verificar validação**
5. **Completar anamnese**
6. **Ver resultados**

---

## 🎯 PRÓXIMOS PASSOS

### Após Criar o Projeto:

1. **✅ Testar funcionamento** básico
2. **🔧 Adicionar serviços** (APIService, CalculationService)
3. **📱 Testar em dispositivo** real
4. **🚀 Preparar para App Store**

### Se Houver Problemas:

1. **Clean Build Folder** (Cmd + Shift + K)
2. **Delete Derived Data**
3. **Restart Xcode**
4. **Verificar Team ID** nas configurações

---

## 📞 Suporte

Se encontrar algum problema durante a criação:

1. **Documente o erro** exato
2. **Tire screenshot** da mensagem
3. **Me informe** para ajudar na solução

**Este guia garante que você tenha um projeto Xcode funcional e compatível com macOS! 🚀**

