//
//  EvolveYouApp.swift
//  EvolveYou
//
//  Created by EvolveYou Team on 17/08/2025.
//

import SwiftUI

@main
struct EvolveYouApp: App {
    @StateObject private var anamneseModel = AnamneseModel()
    
    var body: some Scene {
        WindowGroup {
            ContentView()
                .environmentObject(anamneseModel)
                .preferredColorScheme(.light)
        }
    }
}

// MARK: - App Configuration
extension EvolveYouApp {
    static let appVersion = "1.0.0"
    static let buildNumber = "1"
    static let appName = "EvolveYou"
    static let appDescription = "Seu assistente inteligente para nutrição personalizada"
}

