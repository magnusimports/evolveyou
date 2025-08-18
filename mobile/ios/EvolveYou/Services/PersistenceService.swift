//
//  PersistenceService.swift
//  EvolveYou
//
//  Created by EvolveYou Team on 17/08/2025.
//

import Foundation
import CoreData
import SwiftUI

// MARK: - Persistence Service
class PersistenceService: ObservableObject {
    static let shared = PersistenceService()
    
    // MARK: - Core Data Stack
    lazy var persistentContainer: NSPersistentContainer = {
        let container = NSPersistentContainer(name: "EvolveYou")
        
        container.loadPersistentStores { _, error in
            if let error = error as NSError? {
                print("Core Data error: \\(error), \\(error.userInfo)")
            }
        }
        
        container.viewContext.automaticallyMergesChangesFromParent = true
        return container
    }()
    
    var context: NSManagedObjectContext {
        return persistentContainer.viewContext
    }
    
    // MARK: - Save Context
    func save() {
        if context.hasChanges {
            do {
                try context.save()
            } catch {
                print("Save error: \\(error)")
            }
        }
    }
    
    // MARK: - UserDefaults Keys
    private enum Keys {
        static let currentAnswers = "current_anamnese_answers"
        static let completedAnamnese = "completed_anamnese"
        static let userProfile = "user_nutritional_profile"
        static let lastSyncDate = "last_sync_date"
        static let appVersion = "app_version"
        static let onboardingCompleted = "onboarding_completed"
        static let notificationSettings = "notification_settings"
    }
    
    // MARK: - Anamnese Answers Persistence
    func saveCurrentAnswers(_ answers: [String: String]) {
        if let data = try? JSONEncoder().encode(answers) {
            UserDefaults.standard.set(data, forKey: Keys.currentAnswers)
        }
    }
    
    func getCurrentAnswers() -> [String: String] {
        guard let data = UserDefaults.standard.data(forKey: Keys.currentAnswers),
              let answers = try? JSONDecoder().decode([String: String].self, from: data) else {
            return [:]
        }
        return answers
    }
    
    func clearCurrentAnswers() {
        UserDefaults.standard.removeObject(forKey: Keys.currentAnswers)
    }
    
    // MARK: - Nutritional Profile Persistence
    func saveNutritionalProfile(_ profile: NutritionalProfile) {
        let encoder = JSONEncoder()
        encoder.dateEncodingStrategy = .iso8601
        
        if let data = try? encoder.encode(profile) {
            UserDefaults.standard.set(data, forKey: Keys.userProfile)
            UserDefaults.standard.set(Date(), forKey: Keys.lastSyncDate)
        }
    }
    
    func getNutritionalProfile() -> NutritionalProfile? {
        guard let data = UserDefaults.standard.data(forKey: Keys.userProfile) else {
            return nil
        }
        
        let decoder = JSONDecoder()
        decoder.dateDecodingStrategy = .iso8601
        
        return try? decoder.decode(NutritionalProfile.self, from: data)
    }
    
    func clearNutritionalProfile() {
        UserDefaults.standard.removeObject(forKey: Keys.userProfile)
    }
    
    // MARK: - Anamnese Completion Status
    func markAnamneseAsCompleted() {
        UserDefaults.standard.set(true, forKey: Keys.completedAnamnese)
        UserDefaults.standard.set(Date(), forKey: Keys.lastSyncDate)
    }
    
    func isAnamneseCompleted() -> Bool {
        return UserDefaults.standard.bool(forKey: Keys.completedAnamnese)
    }
    
    func resetAnamneseCompletion() {
        UserDefaults.standard.removeObject(forKey: Keys.completedAnamnese)
        clearCurrentAnswers()
        clearNutritionalProfile()
    }
    
    // MARK: - App Settings
    func setOnboardingCompleted(_ completed: Bool) {
        UserDefaults.standard.set(completed, forKey: Keys.onboardingCompleted)
    }
    
    func isOnboardingCompleted() -> Bool {
        return UserDefaults.standard.bool(forKey: Keys.onboardingCompleted)
    }
    
    func getLastSyncDate() -> Date? {
        return UserDefaults.standard.object(forKey: Keys.lastSyncDate) as? Date
    }
    
    func setAppVersion(_ version: String) {
        UserDefaults.standard.set(version, forKey: Keys.appVersion)
    }
    
    func getAppVersion() -> String? {
        return UserDefaults.standard.string(forKey: Keys.appVersion)
    }
    
    // MARK: - Notification Settings
    func saveNotificationSettings(_ settings: NotificationSettings) {
        if let data = try? JSONEncoder().encode(settings) {
            UserDefaults.standard.set(data, forKey: Keys.notificationSettings)
        }
    }
    
    func getNotificationSettings() -> NotificationSettings {
        guard let data = UserDefaults.standard.data(forKey: Keys.notificationSettings),
              let settings = try? JSONDecoder().decode(NotificationSettings.self, from: data) else {
            return NotificationSettings.default
        }
        return settings
    }
    
    // MARK: - Data Migration
    func migrateDataIfNeeded() {
        let currentVersion = Bundle.main.infoDictionary?["CFBundleShortVersionString"] as? String ?? "1.0.0"
        let savedVersion = getAppVersion()
        
        if savedVersion != currentVersion {
            performDataMigration(from: savedVersion, to: currentVersion)
            setAppVersion(currentVersion)
        }
    }
    
    private func performDataMigration(from oldVersion: String?, to newVersion: String) {
        // Handle data migration between app versions
        print("Migrating data from \\(oldVersion ?? "unknown") to \\(newVersion)")
        
        // Example migration logic
        if oldVersion == nil {
            // First install - no migration needed
            return
        }
        
        // Add specific migration logic here as needed
    }
    
    // MARK: - Data Export/Import
    func exportUserData() -> [String: Any] {
        var exportData: [String: Any] = [:]
        
        // Export anamnese answers
        exportData["answers"] = getCurrentAnswers()
        
        // Export nutritional profile
        if let profile = getNutritionalProfile() {
            let encoder = JSONEncoder()
            encoder.dateEncodingStrategy = .iso8601
            if let profileData = try? encoder.encode(profile),
               let profileDict = try? JSONSerialization.jsonObject(with: profileData) {
                exportData["profile"] = profileDict
            }
        }
        
        // Export settings
        exportData["settings"] = [
            "onboardingCompleted": isOnboardingCompleted(),
            "anamneseCompleted": isAnamneseCompleted(),
            "notificationSettings": getNotificationSettings()
        ]
        
        exportData["exportDate"] = ISO8601DateFormatter().string(from: Date())
        exportData["appVersion"] = getAppVersion()
        
        return exportData
    }
    
    func importUserData(_ data: [String: Any]) -> Bool {
        do {
            // Import anamnese answers
            if let answers = data["answers"] as? [String: String] {
                saveCurrentAnswers(answers)
            }
            
            // Import nutritional profile
            if let profileDict = data["profile"] as? [String: Any],
               let profileData = try? JSONSerialization.data(withJSONObject: profileDict) {
                let decoder = JSONDecoder()
                decoder.dateDecodingStrategy = .iso8601
                if let profile = try? decoder.decode(NutritionalProfile.self, from: profileData) {
                    saveNutritionalProfile(profile)
                }
            }
            
            // Import settings
            if let settings = data["settings"] as? [String: Any] {
                if let onboardingCompleted = settings["onboardingCompleted"] as? Bool {
                    setOnboardingCompleted(onboardingCompleted)
                }
                
                if let anamneseCompleted = settings["anamneseCompleted"] as? Bool,
                   anamneseCompleted {
                    markAnamneseAsCompleted()
                }
            }
            
            return true
        } catch {
            print("Import error: \\(error)")
            return false
        }
    }
    
    // MARK: - Data Cleanup
    func clearAllData() {
        // Clear UserDefaults
        let keys = [
            Keys.currentAnswers,
            Keys.completedAnamnese,
            Keys.userProfile,
            Keys.lastSyncDate,
            Keys.onboardingCompleted,
            Keys.notificationSettings
        ]
        
        for key in keys {
            UserDefaults.standard.removeObject(forKey: key)
        }
        
        // Clear Core Data
        clearCoreData()
    }
    
    private func clearCoreData() {
        let entities = persistentContainer.managedObjectModel.entities
        
        for entity in entities {
            if let entityName = entity.name {
                let fetchRequest = NSFetchRequest<NSFetchRequestResult>(entityName: entityName)
                let deleteRequest = NSBatchDeleteRequest(fetchRequest: fetchRequest)
                
                do {
                    try context.execute(deleteRequest)
                } catch {
                    print("Failed to clear entity \\(entityName): \\(error)")
                }
            }
        }
        
        save()
    }
    
    // MARK: - Data Validation
    func validateStoredData() -> [String] {
        var issues: [String] = []
        
        // Validate anamnese answers
        let answers = getCurrentAnswers()
        if !answers.isEmpty {
            let requiredFields = ["2", "3", "4", "5"] // age, gender, weight, height
            for field in requiredFields {
                if answers[field]?.isEmpty ?? true {
                    issues.append("Campo obrigatório ausente: \\(field)")
                }
            }
        }
        
        // Validate nutritional profile
        if let profile = getNutritionalProfile() {
            if profile.bmi <= 0 || profile.bmi > 100 {
                issues.append("IMC inválido: \\(profile.bmi)")
            }
            
            if profile.bmr <= 0 || profile.bmr > 5000 {
                issues.append("TMB inválida: \\(profile.bmr)")
            }
            
            if profile.tdee <= 0 || profile.tdee > 8000 {
                issues.append("TDEE inválida: \\(profile.tdee)")
            }
        }
        
        return issues
    }
}

// MARK: - Notification Settings Model
struct NotificationSettings: Codable {
    let dailyReminders: Bool
    let weeklyProgress: Bool
    let mealReminders: Bool
    let waterReminders: Bool
    let exerciseReminders: Bool
    
    static let `default` = NotificationSettings(
        dailyReminders: true,
        weeklyProgress: true,
        mealReminders: false,
        waterReminders: true,
        exerciseReminders: false
    )
}

// MARK: - Core Data Model (EvolveYou.xcdatamodeld would contain these entities)
/*
 Entity: UserSession
 - id: UUID
 - startDate: Date
 - endDate: Date?
 - questionsAnswered: Int32
 - completed: Bool
 
 Entity: AnswerHistory
 - id: UUID
 - questionId: String
 - answer: String
 - timestamp: Date
 - session: UserSession (relationship)
 
 Entity: ProfileHistory
 - id: UUID
 - bmi: Double
 - bmr: Double
 - tdee: Double
 - proteinGrams: Double
 - carbGrams: Double
 - fatGrams: Double
 - waterLiters: Double
 - createdDate: Date
 */

// MARK: - Persistence Extensions
extension PersistenceService {
    
    // MARK: - Session Management
    func createNewSession() -> UUID {
        let sessionId = UUID()
        UserDefaults.standard.set(sessionId.uuidString, forKey: "current_session_id")
        UserDefaults.standard.set(Date(), forKey: "session_start_date")
        return sessionId
    }
    
    func getCurrentSessionId() -> UUID? {
        guard let sessionString = UserDefaults.standard.string(forKey: "current_session_id") else {
            return nil
        }
        return UUID(uuidString: sessionString)
    }
    
    func endCurrentSession() {
        UserDefaults.standard.removeObject(forKey: "current_session_id")
        UserDefaults.standard.set(Date(), forKey: "session_end_date")
    }
    
    // MARK: - Progress Tracking
    func saveProgress(questionIndex: Int, totalQuestions: Int) {
        let progress = Double(questionIndex) / Double(totalQuestions)
        UserDefaults.standard.set(progress, forKey: "anamnese_progress")
        UserDefaults.standard.set(Date(), forKey: "last_progress_update")
    }
    
    func getProgress() -> Double {
        return UserDefaults.standard.double(forKey: "anamnese_progress")
    }
    
    func clearProgress() {
        UserDefaults.standard.removeObject(forKey: "anamnese_progress")
        UserDefaults.standard.removeObject(forKey: "last_progress_update")
    }
}

