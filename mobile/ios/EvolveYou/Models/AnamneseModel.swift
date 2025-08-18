//
//  AnamneseModel.swift
//  EvolveYou
//
//  Created by EvolveYou Team on 17/08/2025.
//

import SwiftUI
import Combine

// MARK: - Anamnese State
enum AnamneseState {
    case welcome
    case questions
    case results
    case completed
}

// MARK: - Question Types
enum QuestionType {
    case text
    case number
    case select
    case multiSelect
    case conditional
}

// MARK: - Question Model
struct Question: Identifiable, Codable {
    let id: String
    let category: String
    let categoryIcon: String
    let text: String
    let type: QuestionType
    let options: [String]?
    let placeholder: String?
    let validation: ValidationRule?
    let conditionalOn: String?
    let conditionalValue: String?
    
    enum CodingKeys: String, CodingKey {
        case id, category, categoryIcon, text, type, options, placeholder, validation, conditionalOn, conditionalValue
    }
}

// MARK: - Validation Rule
struct ValidationRule: Codable {
    let required: Bool
    let minValue: Double?
    let maxValue: Double?
    let minLength: Int?
    let maxLength: Int?
    let pattern: String?
    let errorMessage: String
}

// MARK: - Answer Model
struct Answer: Codable {
    let questionId: String
    let value: String
    let timestamp: Date
}

// MARK: - Nutritional Profile
struct NutritionalProfile: Codable {
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
    @Published var currentState: AnamneseState = .welcome
    @Published var currentQuestionIndex: Int = 0
    @Published var answers: [String: String] = [:]
    @Published var isLoading: Bool = false
    @Published var errorMessage: String?
    @Published var nutritionalProfile: NutritionalProfile?
    @Published var progress: Double = 0.0
    
    private let apiService = APIService()
    private let calculationService = CalculationService()
    private var cancellables = Set<AnyCancellable>()
    
    // MARK: - Questions Data
    let questions: [Question] = [
        // Dados Pessoais
        Question(
            id: "1",
            category: "Dados Pessoais",
            categoryIcon: "person.circle",
            text: "Qual é o seu nome completo?",
            type: .text,
            options: nil,
            placeholder: "Digite seu nome completo",
            validation: ValidationRule(
                required: true,
                minValue: nil,
                maxValue: nil,
                minLength: 2,
                maxLength: 100,
                pattern: "^[a-zA-ZÀ-ÿ\\s]+$",
                errorMessage: "Nome deve conter apenas letras e espaços"
            ),
            conditionalOn: nil,
            conditionalValue: nil
        ),
        Question(
            id: "2",
            category: "Dados Pessoais",
            categoryIcon: "person.circle",
            text: "Qual é a sua idade?",
            type: .number,
            options: nil,
            placeholder: "Digite sua idade",
            validation: ValidationRule(
                required: true,
                minValue: 16,
                maxValue: 100,
                minLength: nil,
                maxLength: nil,
                pattern: nil,
                errorMessage: "Idade deve estar entre 16 e 100 anos"
            ),
            conditionalOn: nil,
            conditionalValue: nil
        ),
        Question(
            id: "3",
            category: "Dados Pessoais",
            categoryIcon: "person.circle",
            text: "Qual é o seu sexo biológico?",
            type: .select,
            options: ["Masculino", "Feminino"],
            placeholder: nil,
            validation: ValidationRule(
                required: true,
                minValue: nil,
                maxValue: nil,
                minLength: nil,
                maxLength: nil,
                pattern: nil,
                errorMessage: "Selecione uma opção"
            ),
            conditionalOn: nil,
            conditionalValue: nil
        ),
        
        // Medidas Corporais
        Question(
            id: "4",
            category: "Medidas Corporais",
            categoryIcon: "scalemass",
            text: "Qual é o seu peso atual? (kg)",
            type: .number,
            options: nil,
            placeholder: "Ex: 70.5",
            validation: ValidationRule(
                required: true,
                minValue: 30,
                maxValue: 300,
                minLength: nil,
                maxLength: nil,
                pattern: nil,
                errorMessage: "Peso deve estar entre 30 e 300 kg"
            ),
            conditionalOn: nil,
            conditionalValue: nil
        ),
        Question(
            id: "5",
            category: "Medidas Corporais",
            categoryIcon: "scalemass",
            text: "Qual é a sua altura? (cm)",
            type: .number,
            options: nil,
            placeholder: "Ex: 175",
            validation: ValidationRule(
                required: true,
                minValue: 100,
                maxValue: 250,
                minLength: nil,
                maxLength: nil,
                pattern: nil,
                errorMessage: "Altura deve estar entre 100 e 250 cm"
            ),
            conditionalOn: nil,
            conditionalValue: nil
        ),
        Question(
            id: "6",
            category: "Medidas Corporais",
            categoryIcon: "scalemass",
            text: "Como você descreveria sua composição corporal atual?",
            type: .select,
            options: ["Magro", "Normal", "Atlético", "Acima do peso", "Obeso"],
            placeholder: nil,
            validation: ValidationRule(
                required: true,
                minValue: nil,
                maxValue: nil,
                minLength: nil,
                maxLength: nil,
                pattern: nil,
                errorMessage: "Selecione uma opção"
            ),
            conditionalOn: nil,
            conditionalValue: nil
        ),
        
        // Objetivos
        Question(
            id: "7",
            category: "Objetivos",
            categoryIcon: "target",
            text: "Qual é o seu objetivo principal?",
            type: .select,
            options: ["Perder peso", "Ganhar massa muscular", "Manter peso atual", "Melhorar saúde geral"],
            placeholder: nil,
            validation: ValidationRule(
                required: true,
                minValue: nil,
                maxValue: nil,
                minLength: nil,
                maxLength: nil,
                pattern: nil,
                errorMessage: "Selecione um objetivo"
            ),
            conditionalOn: nil,
            conditionalValue: nil
        ),
        Question(
            id: "8",
            category: "Objetivos",
            categoryIcon: "target",
            text: "Qual é o seu peso meta? (kg)",
            type: .number,
            options: nil,
            placeholder: "Ex: 65.0",
            validation: ValidationRule(
                required: false,
                minValue: 30,
                maxValue: 300,
                minLength: nil,
                maxLength: nil,
                pattern: nil,
                errorMessage: "Peso meta deve estar entre 30 e 300 kg"
            ),
            conditionalOn: "7",
            conditionalValue: "Perder peso"
        ),
        Question(
            id: "9",
            category: "Objetivos",
            categoryIcon: "target",
            text: "Em quanto tempo você gostaria de alcançar seu objetivo?",
            type: .select,
            options: ["1-3 meses", "3-6 meses", "6-12 meses", "Mais de 1 ano"],
            placeholder: nil,
            validation: ValidationRule(
                required: true,
                minValue: nil,
                maxValue: nil,
                minLength: nil,
                maxLength: nil,
                pattern: nil,
                errorMessage: "Selecione um prazo"
            ),
            conditionalOn: nil,
            conditionalValue: nil
        ),
        
        // Atividade Física
        Question(
            id: "10",
            category: "Atividade Física",
            categoryIcon: "figure.run",
            text: "Qual é o seu nível de atividade física?",
            type: .select,
            options: ["Sedentário", "Levemente ativo", "Moderadamente ativo", "Muito ativo", "Extremamente ativo"],
            placeholder: nil,
            validation: ValidationRule(
                required: true,
                minValue: nil,
                maxValue: nil,
                minLength: nil,
                maxLength: nil,
                pattern: nil,
                errorMessage: "Selecione seu nível de atividade"
            ),
            conditionalOn: nil,
            conditionalValue: nil
        ),
        Question(
            id: "11",
            category: "Atividade Física",
            categoryIcon: "figure.run",
            text: "Que tipo de exercício você prefere?",
            type: .multiSelect,
            options: ["Caminhada", "Corrida", "Musculação", "Natação", "Ciclismo", "Yoga", "Pilates", "Esportes", "Nenhum"],
            placeholder: nil,
            validation: ValidationRule(
                required: true,
                minValue: nil,
                maxValue: nil,
                minLength: nil,
                maxLength: nil,
                pattern: nil,
                errorMessage: "Selecione pelo menos uma opção"
            ),
            conditionalOn: nil,
            conditionalValue: nil
        ),
        
        // Hábitos Alimentares
        Question(
            id: "12",
            category: "Hábitos Alimentares",
            categoryIcon: "fork.knife",
            text: "Quantas refeições você faz por dia?",
            type: .select,
            options: ["2 refeições", "3 refeições", "4 refeições", "5 refeições", "6 ou mais refeições"],
            placeholder: nil,
            validation: ValidationRule(
                required: true,
                minValue: nil,
                maxValue: nil,
                minLength: nil,
                maxLength: nil,
                pattern: nil,
                errorMessage: "Selecione o número de refeições"
            ),
            conditionalOn: nil,
            conditionalValue: nil
        ),
        Question(
            id: "13",
            category: "Hábitos Alimentares",
            categoryIcon: "fork.knife",
            text: "Você tem horários regulares para as refeições?",
            type: .select,
            options: ["Sempre", "Na maioria das vezes", "Às vezes", "Raramente", "Nunca"],
            placeholder: nil,
            validation: ValidationRule(
                required: true,
                minValue: nil,
                maxValue: nil,
                minLength: nil,
                maxLength: nil,
                pattern: nil,
                errorMessage: "Selecione uma opção"
            ),
            conditionalOn: nil,
            conditionalValue: nil
        ),
        Question(
            id: "14",
            category: "Hábitos Alimentares",
            categoryIcon: "fork.knife",
            text: "Quantos litros de água você bebe por dia?",
            type: .number,
            options: nil,
            placeholder: "Ex: 2.5",
            validation: ValidationRule(
                required: true,
                minValue: 0.5,
                maxValue: 10,
                minLength: nil,
                maxLength: nil,
                pattern: nil,
                errorMessage: "Consumo de água deve estar entre 0.5 e 10 litros"
            ),
            conditionalOn: nil,
            conditionalValue: nil
        ),
        
        // Restrições e Alergias
        Question(
            id: "15",
            category: "Restrições e Alergias",
            categoryIcon: "exclamationmark.triangle",
            text: "Você tem alguma restrição alimentar?",
            type: .multiSelect,
            options: ["Vegetariano", "Vegano", "Sem lactose", "Sem glúten", "Kosher", "Halal", "Low carb", "Cetogênica", "Nenhuma"],
            placeholder: nil,
            validation: ValidationRule(
                required: true,
                minValue: nil,
                maxValue: nil,
                minLength: nil,
                maxLength: nil,
                pattern: nil,
                errorMessage: "Selecione suas restrições ou 'Nenhuma'"
            ),
            conditionalOn: nil,
            conditionalValue: nil
        ),
        Question(
            id: "16",
            category: "Restrições e Alergias",
            categoryIcon: "exclamationmark.triangle",
            text: "Você tem alguma alergia alimentar?",
            type: .multiSelect,
            options: ["Amendoim", "Nozes", "Leite", "Ovos", "Soja", "Trigo", "Peixes", "Frutos do mar", "Nenhuma"],
            placeholder: nil,
            validation: ValidationRule(
                required: true,
                minValue: nil,
                maxValue: nil,
                minLength: nil,
                maxLength: nil,
                pattern: nil,
                errorMessage: "Selecione suas alergias ou 'Nenhuma'"
            ),
            conditionalOn: nil,
            conditionalValue: nil
        ),
        
        // Estilo de Vida
        Question(
            id: "17",
            category: "Estilo de Vida",
            categoryIcon: "moon.stars",
            text: "Como você classificaria seu nível de estresse?",
            type: .select,
            options: ["Muito baixo", "Baixo", "Moderado", "Alto", "Muito alto"],
            placeholder: nil,
            validation: ValidationRule(
                required: true,
                minValue: nil,
                maxValue: nil,
                minLength: nil,
                maxLength: nil,
                pattern: nil,
                errorMessage: "Selecione seu nível de estresse"
            ),
            conditionalOn: nil,
            conditionalValue: nil
        ),
        Question(
            id: "18",
            category: "Estilo de Vida",
            categoryIcon: "moon.stars",
            text: "Quantas horas você dorme por noite?",
            type: .select,
            options: ["Menos de 5h", "5-6h", "6-7h", "7-8h", "8-9h", "Mais de 9h"],
            placeholder: nil,
            validation: ValidationRule(
                required: true,
                minValue: nil,
                maxValue: nil,
                minLength: nil,
                maxLength: nil,
                pattern: nil,
                errorMessage: "Selecione suas horas de sono"
            ),
            conditionalOn: nil,
            conditionalValue: nil
        ),
        Question(
            id: "19",
            category: "Estilo de Vida",
            categoryIcon: "moon.stars",
            text: "Como você classificaria a qualidade do seu sono?",
            type: .select,
            options: ["Muito ruim", "Ruim", "Regular", "Boa", "Excelente"],
            placeholder: nil,
            validation: ValidationRule(
                required: true,
                minValue: nil,
                maxValue: nil,
                minLength: nil,
                maxLength: nil,
                pattern: nil,
                errorMessage: "Selecione a qualidade do seu sono"
            ),
            conditionalOn: nil,
            conditionalValue: nil
        ),
        Question(
            id: "20",
            category: "Estilo de Vida",
            categoryIcon: "moon.stars",
            text: "Você consome álcool ou fuma?",
            type: .multiSelect,
            options: ["Álcool socialmente", "Álcool regularmente", "Fumo ocasional", "Fumo regular", "Nenhum"],
            placeholder: nil,
            validation: ValidationRule(
                required: true,
                minValue: nil,
                maxValue: nil,
                minLength: nil,
                maxLength: nil,
                pattern: nil,
                errorMessage: "Selecione suas opções ou 'Nenhum'"
            ),
            conditionalOn: nil,
            conditionalValue: nil
        ),
        
        // Saúde e Medicamentos
        Question(
            id: "21",
            category: "Saúde e Medicamentos",
            categoryIcon: "cross.case",
            text: "Você tem alguma condição de saúde?",
            type: .multiSelect,
            options: ["Diabetes", "Hipertensão", "Colesterol alto", "Problemas cardíacos", "Problemas tireoide", "Problemas digestivos", "Nenhuma"],
            placeholder: nil,
            validation: ValidationRule(
                required: true,
                minValue: nil,
                maxValue: nil,
                minLength: nil,
                maxLength: nil,
                pattern: nil,
                errorMessage: "Selecione suas condições ou 'Nenhuma'"
            ),
            conditionalOn: nil,
            conditionalValue: nil
        ),
        Question(
            id: "22",
            category: "Saúde e Medicamentos",
            categoryIcon: "cross.case",
            text: "Você toma algum medicamento regularmente?",
            type: .text,
            options: nil,
            placeholder: "Liste os medicamentos ou digite 'Nenhum'",
            validation: ValidationRule(
                required: true,
                minValue: nil,
                maxValue: nil,
                minLength: 1,
                maxLength: 500,
                pattern: nil,
                errorMessage: "Informe os medicamentos ou 'Nenhum'"
            ),
            conditionalOn: nil,
            conditionalValue: nil
        )
    ]
    
    // MARK: - Computed Properties
    var visibleQuestions: [Question] {
        return questions.filter { question in
            guard let conditionalOn = question.conditionalOn,
                  let conditionalValue = question.conditionalValue else {
                return true
            }
            return answers[conditionalOn] == conditionalValue
        }
    }
    
    var currentQuestion: Question? {
        let visible = visibleQuestions
        guard currentQuestionIndex < visible.count else { return nil }
        return visible[currentQuestionIndex]
    }
    
    var isLastQuestion: Bool {
        return currentQuestionIndex >= visibleQuestions.count - 1
    }
    
    var canProceed: Bool {
        guard let question = currentQuestion else { return false }
        let answer = answers[question.id] ?? ""
        return validateAnswer(answer, for: question).isValid
    }
    
    // MARK: - Methods
    func startAnamnese() {
        currentState = .questions
        currentQuestionIndex = 0
        updateProgress()
    }
    
    func nextQuestion() {
        if isLastQuestion {
            completeAnamnese()
        } else {
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
    
    func updateAnswer(_ answer: String, for questionId: String) {
        answers[questionId] = answer
    }
    
    func validateAnswer(_ answer: String, for question: Question) -> (isValid: Bool, errorMessage: String?) {
        guard let validation = question.validation else {
            return (true, nil)
        }
        
        // Required validation
        if validation.required && answer.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty {
            return (false, "Este campo é obrigatório")
        }
        
        // Skip other validations if not required and empty
        if !validation.required && answer.isEmpty {
            return (true, nil)
        }
        
        // Length validation
        if let minLength = validation.minLength, answer.count < minLength {
            return (false, validation.errorMessage)
        }
        
        if let maxLength = validation.maxLength, answer.count > maxLength {
            return (false, validation.errorMessage)
        }
        
        // Numeric validation
        if question.type == .number {
            guard let value = Double(answer) else {
                return (false, "Digite um número válido")
            }
            
            if let minValue = validation.minValue, value < minValue {
                return (false, validation.errorMessage)
            }
            
            if let maxValue = validation.maxValue, value > maxValue {
                return (false, validation.errorMessage)
            }
        }
        
        // Pattern validation
        if let pattern = validation.pattern {
            let regex = try? NSRegularExpression(pattern: pattern)
            let range = NSRange(location: 0, length: answer.utf16.count)
            if regex?.firstMatch(in: answer, options: [], range: range) == nil {
                return (false, validation.errorMessage)
            }
        }
        
        return (true, nil)
    }
    
    private func updateProgress() {
        let totalQuestions = visibleQuestions.count
        progress = totalQuestions > 0 ? Double(currentQuestionIndex + 1) / Double(totalQuestions) : 0.0
    }
    
    private func completeAnamnese() {
        isLoading = true
        
        // Calculate nutritional profile
        let profile = calculationService.calculateNutritionalProfile(from: answers)
        
        // Save to API
        apiService.saveAnamneseAnswers(answers)
            .flatMap { _ in
                self.apiService.saveNutritionalProfile(profile)
            }
            .receive(on: DispatchQueue.main)
            .sink(
                receiveCompletion: { completion in
                    self.isLoading = false
                    if case .failure(let error) = completion {
                        self.errorMessage = error.localizedDescription
                    }
                },
                receiveValue: { savedProfile in
                    self.nutritionalProfile = savedProfile
                    self.currentState = .results
                }
            )
            .store(in: &cancellables)
    }
    
    func resetAnamnese() {
        currentState = .welcome
        currentQuestionIndex = 0
        answers.removeAll()
        nutritionalProfile = nil
        errorMessage = nil
        progress = 0.0
    }
    
    func goToResults() {
        currentState = .results
    }
    
    func markAsCompleted() {
        currentState = .completed
    }
}

// MARK: - QuestionType Codable
extension QuestionType: Codable {
    enum CodingKeys: String, CodingKey {
        case text, number, select, multiSelect, conditional
    }
    
    init(from decoder: Decoder) throws {
        let container = try decoder.singleValueContainer()
        let value = try container.decode(String.self)
        
        switch value {
        case "text": self = .text
        case "number": self = .number
        case "select": self = .select
        case "multiSelect": self = .multiSelect
        case "conditional": self = .conditional
        default: throw DecodingError.dataCorrupted(DecodingError.Context(codingPath: decoder.codingPath, debugDescription: "Invalid question type"))
        }
    }
    
    func encode(to encoder: Encoder) throws {
        var container = encoder.singleValueContainer()
        switch self {
        case .text: try container.encode("text")
        case .number: try container.encode("number")
        case .select: try container.encode("select")
        case .multiSelect: try container.encode("multiSelect")
        case .conditional: try container.encode("conditional")
        }
    }
}

