//
//  QuestionView.swift
//  EvolveYou
//
//  Created by EvolveYou Team on 17/08/2025.
//

import SwiftUI

struct QuestionView: View {
    @EnvironmentObject var anamneseModel: AnamneseModel
    @State private var currentAnswer: String = ""
    @State private var selectedOptions: Set<String> = []
    @State private var showValidationError = false
    @State private var animateQuestion = false
    
    var body: some View {
        GeometryReader { geometry in
            VStack(spacing: 0) {
                // Progress Header
                progressHeader
                
                // Question Content
                ScrollView {
                    VStack(spacing: 32) {
                        questionContent
                    }
                    .padding(.horizontal, 24)
                    .padding(.vertical, 32)
                }
                
                // Navigation Footer
                navigationFooter
            }
        }
        .background(backgroundGradient)
        .navigationBarHidden(true)
        .onAppear {
            loadCurrentAnswer()
            animateQuestionAppearance()
        }
        .onChange(of: anamneseModel.currentQuestionIndex) { _ in
            loadCurrentAnswer()
            animateQuestionAppearance()
        }
    }
    
    // MARK: - Progress Header
    private var progressHeader: some View {
        VStack(spacing: 16) {
            // Progress Bar
            VStack(spacing: 8) {
                HStack {
                    Text("Pergunta \(anamneseModel.currentQuestionIndex + 1) de \(anamneseModel.visibleQuestions.count)")
                        .font(.system(size: 14, weight: .medium))
                        .foregroundColor(.white.opacity(0.8))
                    
                    Spacer()
                    
                    Text("\(Int(anamneseModel.progress * 100))%")
                        .font(.system(size: 14, weight: .semibold))
                        .foregroundColor(.white)
                }
                
                ProgressView(value: anamneseModel.progress)
                    .progressViewStyle(LinearProgressViewStyle(tint: .white))
                    .background(Color.white.opacity(0.3))
                    .cornerRadius(4)
            }
            
            // Category Badge
            if let question = anamneseModel.currentQuestion {
                CategoryBadge(
                    icon: question.categoryIcon,
                    title: question.category
                )
            }
        }
        .padding(.horizontal, 24)
        .padding(.top, 16)
        .padding(.bottom, 8)
    }
    
    // MARK: - Question Content
    private var questionContent: some View {
        VStack(spacing: 32) {
            if let question = anamneseModel.currentQuestion {
                // Question Text
                VStack(spacing: 16) {
                    Text(question.text)
                        .font(.system(size: 24, weight: .bold))
                        .foregroundColor(.white)
                        .multilineTextAlignment(.center)
                        .lineLimit(nil)
                        .fixedSize(horizontal: false, vertical: true)
                }
                .opacity(animateQuestion ? 1.0 : 0.0)
                .offset(y: animateQuestion ? 0 : 20)
                .animation(.easeOut(duration: 0.6).delay(0.2), value: animateQuestion)
                
                // Answer Input
                answerInputView(for: question)
                    .opacity(animateQuestion ? 1.0 : 0.0)
                    .offset(y: animateQuestion ? 0 : 30)
                    .animation(.easeOut(duration: 0.6).delay(0.4), value: animateQuestion)
                
                // Validation Error
                if showValidationError {
                    let validation = anamneseModel.validateAnswer(currentAnswer, for: question)
                    if !validation.isValid, let errorMessage = validation.errorMessage {
                        ErrorMessage(text: errorMessage)
                            .transition(.opacity.combined(with: .move(edge: .top)))
                    }
                }
            }
        }
    }
    
    // MARK: - Answer Input View
    @ViewBuilder
    private func answerInputView(for question: Question) -> some View {
        switch question.type {
        case .text:
            textInputView(question: question)
        case .number:
            numberInputView(question: question)
        case .select:
            selectInputView(question: question)
        case .multiSelect:
            multiSelectInputView(question: question)
        case .conditional:
            textInputView(question: question)
        }
    }
    
    // MARK: - Text Input
    private func textInputView(question: Question) -> some View {
        VStack(spacing: 16) {
            TextField(question.placeholder ?? "Digite sua resposta", text: $currentAnswer)
                .textFieldStyle(CustomTextFieldStyle())
                .onChange(of: currentAnswer) { newValue in
                    anamneseModel.updateAnswer(newValue, for: question.id)
                    validateCurrentAnswer()
                }
        }
    }
    
    // MARK: - Number Input
    private func numberInputView(question: Question) -> some View {
        VStack(spacing: 16) {
            TextField(question.placeholder ?? "Digite um número", text: $currentAnswer)
                .textFieldStyle(CustomTextFieldStyle())
                .keyboardType(.decimalPad)
                .onChange(of: currentAnswer) { newValue in
                    anamneseModel.updateAnswer(newValue, for: question.id)
                    validateCurrentAnswer()
                }
        }
    }
    
    // MARK: - Select Input
    private func selectInputView(question: Question) -> some View {
        VStack(spacing: 12) {
            if let options = question.options {
                ForEach(options, id: \\.self) { option in
                    SelectOptionButton(
                        title: option,
                        isSelected: currentAnswer == option,
                        action: {
                            currentAnswer = option
                            anamneseModel.updateAnswer(option, for: question.id)
                            validateCurrentAnswer()
                        }
                    )
                }
            }
        }
    }
    
    // MARK: - Multi Select Input
    private func multiSelectInputView(question: Question) -> some View {
        VStack(spacing: 12) {
            if let options = question.options {
                ForEach(options, id: \\.self) { option in
                    MultiSelectOptionButton(
                        title: option,
                        isSelected: selectedOptions.contains(option),
                        action: {
                            toggleMultiSelectOption(option, for: question)
                        }
                    )
                }
            }
        }
    }
    
    // MARK: - Navigation Footer
    private var navigationFooter: some View {
        VStack(spacing: 16) {
            HStack(spacing: 16) {
                // Previous Button
                if anamneseModel.currentQuestionIndex > 0 {
                    Button(action: {
                        withAnimation(.easeInOut(duration: 0.3)) {
                            anamneseModel.previousQuestion()
                        }
                    }) {
                        HStack(spacing: 8) {
                            Image(systemName: "chevron.left")
                                .font(.system(size: 16, weight: .semibold))
                            Text("Anterior")
                                .font(.system(size: 16, weight: .semibold))
                        }
                        .foregroundColor(.blue)
                        .frame(height: 48)
                        .frame(maxWidth: .infinity)
                        .background(Color.white)
                        .cornerRadius(12)
                    }
                } else {
                    // Placeholder to maintain layout
                    Color.clear
                        .frame(height: 48)
                        .frame(maxWidth: .infinity)
                }
                
                // Next Button
                Button(action: {
                    if validateCurrentAnswer() {
                        withAnimation(.easeInOut(duration: 0.3)) {
                            anamneseModel.nextQuestion()
                        }
                    }
                }) {
                    HStack(spacing: 8) {
                        Text(anamneseModel.isLastQuestion ? "Finalizar" : "Próxima")
                            .font(.system(size: 16, weight: .semibold))
                        
                        if !anamneseModel.isLastQuestion {
                            Image(systemName: "chevron.right")
                                .font(.system(size: 16, weight: .semibold))
                        } else {
                            Image(systemName: "checkmark.circle.fill")
                                .font(.system(size: 16, weight: .semibold))
                        }
                    }
                    .foregroundColor(.white)
                    .frame(height: 48)
                    .frame(maxWidth: .infinity)
                    .background(
                        anamneseModel.canProceed ?
                        Color.blue :
                        Color.gray.opacity(0.5)
                    )
                    .cornerRadius(12)
                }
                .disabled(!anamneseModel.canProceed)
            }
            
            // Skip Button (for optional questions)
            if let question = anamneseModel.currentQuestion,
               question.validation?.required == false {
                Button("Pular pergunta") {
                    currentAnswer = ""
                    anamneseModel.updateAnswer("", for: question.id)
                    withAnimation(.easeInOut(duration: 0.3)) {
                        anamneseModel.nextQuestion()
                    }
                }
                .font(.system(size: 14, weight: .medium))
                .foregroundColor(.white.opacity(0.7))
            }
        }
        .padding(.horizontal, 24)
        .padding(.vertical, 16)
        .background(Color.black.opacity(0.1))
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
    private func loadCurrentAnswer() {
        guard let question = anamneseModel.currentQuestion else { return }
        
        if question.type == .multiSelect {
            let answer = anamneseModel.answers[question.id] ?? ""
            selectedOptions = Set(answer.components(separatedBy: ",").filter { !$0.isEmpty })
            currentAnswer = Array(selectedOptions).joined(separator: ",")
        } else {
            currentAnswer = anamneseModel.answers[question.id] ?? ""
        }
        
        showValidationError = false
    }
    
    private func animateQuestionAppearance() {
        animateQuestion = false
        withAnimation {
            animateQuestion = true
        }
    }
    
    @discardableResult
    private func validateCurrentAnswer() -> Bool {
        guard let question = anamneseModel.currentQuestion else { return false }
        
        let validation = anamneseModel.validateAnswer(currentAnswer, for: question)
        
        withAnimation(.easeInOut(duration: 0.3)) {
            showValidationError = !validation.isValid
        }
        
        return validation.isValid
    }
    
    private func toggleMultiSelectOption(_ option: String, for question: Question) {
        // Handle "Nenhuma" option logic
        if option.contains("Nenhum") || option.contains("Nenhuma") {
            if selectedOptions.contains(option) {
                selectedOptions.remove(option)
            } else {
                selectedOptions.removeAll()
                selectedOptions.insert(option)
            }
        } else {
            // Remove "Nenhuma" if selecting other options
            selectedOptions = selectedOptions.filter { !$0.contains("Nenhum") && !$0.contains("Nenhuma") }
            
            if selectedOptions.contains(option) {
                selectedOptions.remove(option)
            } else {
                selectedOptions.insert(option)
            }
        }
        
        currentAnswer = Array(selectedOptions).joined(separator: ",")
        anamneseModel.updateAnswer(currentAnswer, for: question.id)
        validateCurrentAnswer()
    }
}

// MARK: - Category Badge
struct CategoryBadge: View {
    let icon: String
    let title: String
    
    var body: some View {
        HStack(spacing: 8) {
            Image(systemName: icon)
                .font(.system(size: 14, weight: .medium))
                .foregroundColor(.blue)
            
            Text(title)
                .font(.system(size: 14, weight: .semibold))
                .foregroundColor(.blue)
        }
        .padding(.horizontal, 16)
        .padding(.vertical, 8)
        .background(Color.white)
        .cornerRadius(20)
        .shadow(color: .black.opacity(0.1), radius: 4, x: 0, y: 2)
    }
}

// MARK: - Custom Text Field Style
struct CustomTextFieldStyle: TextFieldStyle {
    func _body(configuration: TextField<Self._Label>) -> some View {
        configuration
            .font(.system(size: 18, weight: .medium))
            .foregroundColor(.primary)
            .padding(.horizontal, 20)
            .padding(.vertical, 16)
            .background(Color.white)
            .cornerRadius(16)
            .shadow(color: .black.opacity(0.1), radius: 8, x: 0, y: 4)
    }
}

// MARK: - Select Option Button
struct SelectOptionButton: View {
    let title: String
    let isSelected: Bool
    let action: () -> Void
    
    var body: some View {
        Button(action: action) {
            HStack(spacing: 16) {
                // Selection Indicator
                Image(systemName: isSelected ? "checkmark.circle.fill" : "circle")
                    .font(.system(size: 20, weight: .medium))
                    .foregroundColor(isSelected ? .blue : .gray)
                
                // Title
                Text(title)
                    .font(.system(size: 16, weight: .medium))
                    .foregroundColor(isSelected ? .blue : .primary)
                    .multilineTextAlignment(.leading)
                
                Spacer()
            }
            .padding(.horizontal, 20)
            .padding(.vertical, 16)
            .background(
                RoundedRectangle(cornerRadius: 16)
                    .fill(Color.white)
                    .overlay(
                        RoundedRectangle(cornerRadius: 16)
                            .stroke(isSelected ? Color.blue : Color.gray.opacity(0.3), lineWidth: isSelected ? 2 : 1)
                    )
            )
            .shadow(color: .black.opacity(0.05), radius: 4, x: 0, y: 2)
        }
        .buttonStyle(PlainButtonStyle())
    }
}

// MARK: - Multi Select Option Button
struct MultiSelectOptionButton: View {
    let title: String
    let isSelected: Bool
    let action: () -> Void
    
    var body: some View {
        Button(action: action) {
            HStack(spacing: 16) {
                // Selection Indicator
                Image(systemName: isSelected ? "checkmark.square.fill" : "square")
                    .font(.system(size: 20, weight: .medium))
                    .foregroundColor(isSelected ? .blue : .gray)
                
                // Title
                Text(title)
                    .font(.system(size: 16, weight: .medium))
                    .foregroundColor(isSelected ? .blue : .primary)
                    .multilineTextAlignment(.leading)
                
                Spacer()
            }
            .padding(.horizontal, 20)
            .padding(.vertical, 16)
            .background(
                RoundedRectangle(cornerRadius: 16)
                    .fill(Color.white)
                    .overlay(
                        RoundedRectangle(cornerRadius: 16)
                            .stroke(isSelected ? Color.blue : Color.gray.opacity(0.3), lineWidth: isSelected ? 2 : 1)
                    )
            )
            .shadow(color: .black.opacity(0.05), radius: 4, x: 0, y: 2)
        }
        .buttonStyle(PlainButtonStyle())
    }
}

// MARK: - Error Message
struct ErrorMessage: View {
    let text: String
    
    var body: some View {
        HStack(spacing: 12) {
            Image(systemName: "exclamationmark.triangle.fill")
                .font(.system(size: 16, weight: .medium))
                .foregroundColor(.red)
            
            Text(text)
                .font(.system(size: 14, weight: .medium))
                .foregroundColor(.red)
                .multilineTextAlignment(.leading)
            
            Spacer()
        }
        .padding(.horizontal, 16)
        .padding(.vertical, 12)
        .background(
            RoundedRectangle(cornerRadius: 12)
                .fill(Color.red.opacity(0.1))
                .overlay(
                    RoundedRectangle(cornerRadius: 12)
                        .stroke(Color.red.opacity(0.3), lineWidth: 1)
                )
        )
    }
}

// MARK: - Preview
struct QuestionView_Previews: PreviewProvider {
    static var previews: some View {
        QuestionView()
            .environmentObject(AnamneseModel())
    }
}

