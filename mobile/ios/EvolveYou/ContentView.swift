//
//  ContentView.swift
//  EvolveYou
//
//  Created by EvolveYou Team on 17/08/2025.
//

import SwiftUI

struct ContentView: View {
    @EnvironmentObject var anamneseModel: AnamneseModel
    @State private var showingSplash = true
    
    var body: some View {
        Group {
            if showingSplash {
                SplashView()
                    .onAppear {
                        DispatchQueue.main.asyncAfter(deadline: .now() + 2.0) {
                            withAnimation(.easeInOut(duration: 0.8)) {
                                showingSplash = false
                            }
                        }
                    }
            } else {
                NavigationView {
                    mainContent
                }
                .navigationViewStyle(StackNavigationViewStyle())
            }
        }
    }
    
    @ViewBuilder
    private var mainContent: some View {
        switch anamneseModel.currentState {
        case .welcome:
            WelcomeView()
        case .questions:
            QuestionView()
        case .results:
            ResultsView()
        case .completed:
            CompletedView()
        }
    }
}

// MARK: - Splash View
struct SplashView: View {
    @State private var scale: CGFloat = 0.5
    @State private var opacity: Double = 0.0
    
    var body: some View {
        ZStack {
            // Gradient Background
            LinearGradient(
                gradient: Gradient(colors: [
                    Color(red: 0.15, green: 0.4, blue: 0.9),
                    Color(red: 0.3, green: 0.2, blue: 0.9)
                ]),
                startPoint: .topLeading,
                endPoint: .bottomTrailing
            )
            .ignoresSafeArea()
            
            VStack(spacing: 24) {
                // App Icon
                Image(systemName: "brain.head.profile")
                    .font(.system(size: 80, weight: .light))
                    .foregroundColor(.white)
                    .scaleEffect(scale)
                    .opacity(opacity)
                
                // App Name
                Text("EvolveYou")
                    .font(.system(size: 32, weight: .bold, design: .rounded))
                    .foregroundColor(.white)
                    .opacity(opacity)
                
                // Tagline
                Text("Nutrição Inteligente Personalizada")
                    .font(.system(size: 16, weight: .medium))
                    .foregroundColor(.white.opacity(0.8))
                    .opacity(opacity)
            }
        }
        .onAppear {
            withAnimation(.easeOut(duration: 1.0)) {
                scale = 1.0
                opacity = 1.0
            }
        }
    }
}

// MARK: - Completed View
struct CompletedView: View {
    @EnvironmentObject var anamneseModel: AnamneseModel
    
    var body: some View {
        VStack(spacing: 32) {
            Spacer()
            
            // Success Icon
            Image(systemName: "checkmark.circle.fill")
                .font(.system(size: 80))
                .foregroundColor(.green)
            
            VStack(spacing: 16) {
                Text("Anamnese Concluída!")
                    .font(.title)
                    .fontWeight(.bold)
                    .multilineTextAlignment(.center)
                
                Text("Seu perfil nutricional foi criado com sucesso. Agora você pode acessar recomendações personalizadas.")
                    .font(.body)
                    .foregroundColor(.secondary)
                    .multilineTextAlignment(.center)
                    .padding(.horizontal)
            }
            
            Spacer()
            
            VStack(spacing: 16) {
                Button("Ver Meu Perfil") {
                    anamneseModel.currentState = .results
                }
                .buttonStyle(PrimaryButtonStyle())
                
                Button("Refazer Anamnese") {
                    anamneseModel.resetAnamnese()
                }
                .buttonStyle(SecondaryButtonStyle())
            }
            .padding(.horizontal, 24)
            .padding(.bottom, 32)
        }
        .navigationBarHidden(true)
    }
}

// MARK: - Preview
struct ContentView_Previews: PreviewProvider {
    static var previews: some View {
        ContentView()
            .environmentObject(AnamneseModel())
    }
}

