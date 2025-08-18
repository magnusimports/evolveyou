//
//  WelcomeView.swift
//  EvolveYou
//
//  Created by EvolveYou Team on 17/08/2025.
//

import SwiftUI

struct WelcomeView: View {
    @EnvironmentObject var anamneseModel: AnamneseModel
    @State private var animateCards = false
    @State private var animateButton = false
    
    var body: some View {
        ScrollView {
            VStack(spacing: 32) {
                // Header
                headerSection
                
                // Feature Cards
                featureCardsSection
                
                // Info Section
                infoSection
                
                // CTA Button
                ctaSection
            }
            .padding(.horizontal, 24)
            .padding(.vertical, 32)
        }
        .background(backgroundGradient)
        .navigationBarHidden(true)
        .onAppear {
            animateContent()
        }
    }
    
    // MARK: - Header Section
    private var headerSection: some View {
        VStack(spacing: 24) {
            // App Icon
            Image(systemName: "brain.head.profile")
                .font(.system(size: 64, weight: .light))
                .foregroundColor(.white)
                .scaleEffect(animateCards ? 1.0 : 0.8)
                .animation(.easeOut(duration: 0.8).delay(0.2), value: animateCards)
            
            VStack(spacing: 12) {
                Text("Anamnese Inteligente")
                    .font(.system(size: 32, weight: .bold, design: .rounded))
                    .foregroundColor(.white)
                    .multilineTextAlignment(.center)
                
                Text("Crie seu perfil nutricional personalizado com base em ciência e tecnologia avançada")
                    .font(.system(size: 18, weight: .medium))
                    .foregroundColor(.white.opacity(0.9))
                    .multilineTextAlignment(.center)
                    .lineLimit(3)
            }
            .opacity(animateCards ? 1.0 : 0.0)
            .offset(y: animateCards ? 0 : 20)
            .animation(.easeOut(duration: 0.8).delay(0.4), value: animateCards)
        }
    }
    
    // MARK: - Feature Cards Section
    private var featureCardsSection: some View {
        VStack(spacing: 16) {
            FeatureCard(
                icon: "person.crop.circle.badge.checkmark",
                title: "Personalizado",
                description: "22 perguntas científicas para criar seu perfil único",
                delay: 0.6
            )
            
            FeatureCard(
                icon: "brain.head.profile",
                title: "Inteligente",
                description: "Algoritmos avançados baseados em pesquisas nutricionais",
                delay: 0.8
            )
            
            FeatureCard(
                icon: "chart.line.uptrend.xyaxis",
                title: "Preciso",
                description: "Cálculos metabólicos validados cientificamente",
                delay: 1.0
            )
        }
        .opacity(animateCards ? 1.0 : 0.0)
        .offset(y: animateCards ? 0 : 30)
        .animation(.easeOut(duration: 0.8).delay(0.6), value: animateCards)
    }
    
    // MARK: - Info Section
    private var infoSection: some View {
        VStack(spacing: 20) {
            InfoRow(
                icon: "clock",
                title: "Tempo estimado",
                value: "5-8 minutos",
                color: .green
            )
            
            InfoRow(
                icon: "questionmark.circle",
                title: "Total de perguntas",
                value: "22 perguntas",
                color: .blue
            )
            
            InfoRow(
                icon: "lock.shield",
                title: "Privacidade",
                value: "100% seguro",
                color: .orange
            )
        }
        .padding(.vertical, 24)
        .opacity(animateCards ? 1.0 : 0.0)
        .offset(y: animateCards ? 0 : 20)
        .animation(.easeOut(duration: 0.8).delay(1.2), value: animateCards)
    }
    
    // MARK: - CTA Section
    private var ctaSection: some View {
        VStack(spacing: 16) {
            Button(action: {
                withAnimation(.easeInOut(duration: 0.3)) {
                    anamneseModel.startAnamnese()
                }
            }) {
                HStack(spacing: 12) {
                    Image(systemName: "play.circle.fill")
                        .font(.title2)
                    
                    Text("Iniciar Anamnese")
                        .font(.system(size: 18, weight: .semibold))
                }
                .foregroundColor(.blue)
                .frame(maxWidth: .infinity)
                .frame(height: 56)
                .background(Color.white)
                .cornerRadius(16)
                .shadow(color: .black.opacity(0.1), radius: 8, x: 0, y: 4)
            }
            .scaleEffect(animateButton ? 1.0 : 0.9)
            .opacity(animateButton ? 1.0 : 0.0)
            .animation(.easeOut(duration: 0.6).delay(1.4), value: animateButton)
            
            Text("Seus dados são criptografados e protegidos")
                .font(.caption)
                .foregroundColor(.white.opacity(0.7))
                .multilineTextAlignment(.center)
        }
        .padding(.top, 8)
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
    
    // MARK: - Animation
    private func animateContent() {
        withAnimation {
            animateCards = true
        }
        
        DispatchQueue.main.asyncAfter(deadline: .now() + 1.4) {
            withAnimation {
                animateButton = true
            }
        }
    }
}

// MARK: - Feature Card
struct FeatureCard: View {
    let icon: String
    let title: String
    let description: String
    let delay: Double
    
    @State private var isVisible = false
    
    var body: some View {
        HStack(spacing: 16) {
            // Icon
            Image(systemName: icon)
                .font(.system(size: 24, weight: .medium))
                .foregroundColor(.blue)
                .frame(width: 48, height: 48)
                .background(Color.white.opacity(0.2))
                .cornerRadius(12)
            
            // Content
            VStack(alignment: .leading, spacing: 4) {
                Text(title)
                    .font(.system(size: 18, weight: .semibold))
                    .foregroundColor(.white)
                
                Text(description)
                    .font(.system(size: 14, weight: .medium))
                    .foregroundColor(.white.opacity(0.8))
                    .lineLimit(2)
            }
            
            Spacer()
        }
        .padding(20)
        .background(
            RoundedRectangle(cornerRadius: 16)
                .fill(Color.white.opacity(0.15))
                .backdrop(BlurView(style: .systemUltraThinMaterialLight))
        )
        .scaleEffect(isVisible ? 1.0 : 0.9)
        .opacity(isVisible ? 1.0 : 0.0)
        .onAppear {
            withAnimation(.easeOut(duration: 0.6).delay(delay)) {
                isVisible = true
            }
        }
    }
}

// MARK: - Info Row
struct InfoRow: View {
    let icon: String
    let title: String
    let value: String
    let color: Color
    
    var body: some View {
        HStack(spacing: 16) {
            Image(systemName: icon)
                .font(.system(size: 20, weight: .medium))
                .foregroundColor(color)
                .frame(width: 32, height: 32)
            
            Text(title)
                .font(.system(size: 16, weight: .medium))
                .foregroundColor(.white.opacity(0.9))
            
            Spacer()
            
            Text(value)
                .font(.system(size: 16, weight: .semibold))
                .foregroundColor(.white)
        }
        .padding(.horizontal, 4)
    }
}

// MARK: - Blur View
struct BlurView: UIViewRepresentable {
    let style: UIBlurEffect.Style
    
    func makeUIView(context: Context) -> UIVisualEffectView {
        UIVisualEffectView(effect: UIBlurEffect(style: style))
    }
    
    func updateUIView(_ uiView: UIVisualEffectView, context: Context) {}
}

// MARK: - View Extensions
extension View {
    func backdrop<Content: View>(_ content: Content) -> some View {
        self.background(content)
    }
}

// MARK: - Button Styles
struct PrimaryButtonStyle: ButtonStyle {
    func makeBody(configuration: Configuration) -> some View {
        configuration.label
            .foregroundColor(.white)
            .frame(maxWidth: .infinity)
            .frame(height: 56)
            .background(
                LinearGradient(
                    gradient: Gradient(colors: [Color.blue, Color.blue.opacity(0.8)]),
                    startPoint: .leading,
                    endPoint: .trailing
                )
            )
            .cornerRadius(16)
            .scaleEffect(configuration.isPressed ? 0.98 : 1.0)
            .animation(.easeInOut(duration: 0.1), value: configuration.isPressed)
    }
}

struct SecondaryButtonStyle: ButtonStyle {
    func makeBody(configuration: Configuration) -> some View {
        configuration.label
            .foregroundColor(.blue)
            .frame(maxWidth: .infinity)
            .frame(height: 56)
            .background(Color.white)
            .cornerRadius(16)
            .overlay(
                RoundedRectangle(cornerRadius: 16)
                    .stroke(Color.blue.opacity(0.3), lineWidth: 1)
            )
            .scaleEffect(configuration.isPressed ? 0.98 : 1.0)
            .animation(.easeInOut(duration: 0.1), value: configuration.isPressed)
    }
}

// MARK: - Preview
struct WelcomeView_Previews: PreviewProvider {
    static var previews: some View {
        WelcomeView()
            .environmentObject(AnamneseModel())
    }
}

