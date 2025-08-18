//
//  EvolveYouTests.swift
//  EvolveYouTests
//
//  Created by EvolveYou Team on 17/08/2025.
//

import XCTest
@testable import EvolveYou

final class EvolveYouTests: XCTestCase {
    
    var calculationService: CalculationService!
    var anamneseModel: AnamneseModel!
    var persistenceService: PersistenceService!
    
    override func setUpWithError() throws {
        calculationService = CalculationService()
        anamneseModel = AnamneseModel()
        persistenceService = PersistenceService()
    }
    
    override func tearDownWithError() throws {
        calculationService = nil
        anamneseModel = nil
        persistenceService = nil
    }
    
    // MARK: - Calculation Service Tests
    
    func testBMICalculation() throws {
        // Test normal BMI
        let answers1: [String: String] = [
            "4": "70", // weight
            "5": "175", // height
            "2": "30", // age
            "3": "Masculino" // gender
        ]
        
        let profile1 = calculationService.calculateNutritionalProfile(from: answers1)
        XCTAssertEqual(profile1.bmi, 22.86, accuracy: 0.01, "BMI calculation should be accurate")
        
        // Test edge cases
        let answers2: [String: String] = [
            "4": "50",
            "5": "160",
            "2": "25",
            "3": "Feminino"
        ]
        
        let profile2 = calculationService.calculateNutritionalProfile(from: answers2)
        XCTAssertEqual(profile2.bmi, 19.53, accuracy: 0.01, "BMI calculation for different values should be accurate")
    }
    
    func testBMRCalculation() throws {
        // Test male BMR
        let maleAnswers: [String: String] = [
            "4": "80", // weight
            "5": "180", // height
            "2": "25", // age
            "3": "Masculino", // gender
            "6": "Normal" // body composition
        ]
        
        let maleProfile = calculationService.calculateNutritionalProfile(from: maleAnswers)
        let expectedMaleBMR = (10 * 80) + (6.25 * 180) - (5 * 25) + 5 // Mifflin-St Jeor for male
        XCTAssertEqual(maleProfile.bmr, expectedMaleBMR, accuracy: 10, "Male BMR calculation should be accurate")
        
        // Test female BMR
        let femaleAnswers: [String: String] = [
            "4": "60", // weight
            "5": "165", // height
            "2": "30", // age
            "3": "Feminino", // gender
            "6": "Normal" // body composition
        ]
        
        let femaleProfile = calculationService.calculateNutritionalProfile(from: femaleAnswers)
        let expectedFemaleBMR = (10 * 60) + (6.25 * 165) - (5 * 30) - 161 // Mifflin-St Jeor for female
        XCTAssertEqual(femaleProfile.bmr, expectedFemaleBMR, accuracy: 10, "Female BMR calculation should be accurate")
    }
    
    func testTDEECalculation() throws {
        let answers: [String: String] = [
            "4": "70",
            "5": "175",
            "2": "30",
            "3": "Masculino",
            "6": "Normal",
            "10": "Moderadamente ativo", // activity level
            "17": "Moderado", // stress
            "18": "7-8h", // sleep hours
            "19": "Boa" // sleep quality
        ]
        
        let profile = calculationService.calculateNutritionalProfile(from: answers)
        
        // TDEE should be higher than BMR
        XCTAssertGreaterThan(profile.tdee, profile.bmr, "TDEE should be greater than BMR")
        
        // TDEE should be reasonable (between 1.2x and 2.0x BMR for most people)
        let ratio = profile.tdee / profile.bmr
        XCTAssertGreaterThan(ratio, 1.2, "TDEE/BMR ratio should be at least 1.2")
        XCTAssertLessThan(ratio, 2.0, "TDEE/BMR ratio should be less than 2.0 for moderate activity")
    }
    
    func testMacronutrientCalculation() throws {
        let answers: [String: String] = [
            "4": "70",
            "5": "175",
            "2": "30",
            "3": "Masculino",
            "6": "Normal",
            "7": "Ganhar massa muscular", // goal
            "10": "Muito ativo"
        ]
        
        let profile = calculationService.calculateNutritionalProfile(from: answers)
        
        // Test protein calculation
        XCTAssertGreaterThan(profile.proteinGrams, 140, "Protein should be at least 2g per kg for muscle gain")
        XCTAssertLessThan(profile.proteinGrams, 210, "Protein should not exceed 3g per kg")
        
        // Test that macros provide reasonable calories
        let proteinCals = profile.proteinGrams * 4
        let carbCals = profile.carbGrams * 4
        let fatCals = profile.fatGrams * 9
        let totalMacroCals = proteinCals + carbCals + fatCals
        
        XCTAssertEqual(totalMacroCals, profile.tdee, accuracy: 100, "Macro calories should approximately equal TDEE")
    }
    
    func testWaterCalculation() throws {
        let answers: [String: String] = [
            "4": "70",
            "10": "Muito ativo",
            "14": "2.0" // current water intake
        ]
        
        let profile = calculationService.calculateNutritionalProfile(from: answers)
        
        // Water needs should be reasonable
        XCTAssertGreaterThan(profile.waterLiters, 2.0, "Water needs should be at least 2L")
        XCTAssertLessThan(profile.waterLiters, 5.0, "Water needs should not exceed 5L for normal cases")
    }
    
    // MARK: - Anamnese Model Tests
    
    func testQuestionNavigation() throws {
        XCTAssertEqual(anamneseModel.currentQuestionIndex, 0, "Should start at first question")
        XCTAssertFalse(anamneseModel.isLastQuestion, "First question should not be last")
        
        // Test navigation
        anamneseModel.currentQuestionIndex = anamneseModel.visibleQuestions.count - 1
        XCTAssertTrue(anamneseModel.isLastQuestion, "Should detect last question")
    }
    
    func testAnswerValidation() throws {
        guard let firstQuestion = anamneseModel.questions.first else {
            XCTFail("Should have questions")
            return
        }
        
        // Test empty answer for required field
        let emptyValidation = anamneseModel.validateAnswer("", for: firstQuestion)
        if firstQuestion.validation?.required == true {
            XCTAssertFalse(emptyValidation.isValid, "Empty answer should be invalid for required field")
        }
        
        // Test valid answer
        let validAnswer = "João Silva"
        let validValidation = anamneseModel.validateAnswer(validAnswer, for: firstQuestion)
        XCTAssertTrue(validValidation.isValid, "Valid answer should pass validation")
    }
    
    func testAnswerStorage() throws {
        let questionId = "1"
        let answer = "Test Answer"
        
        anamneseModel.updateAnswer(answer, for: questionId)
        XCTAssertEqual(anamneseModel.answers[questionId], answer, "Answer should be stored correctly")
    }
    
    func testProgressCalculation() throws {
        anamneseModel.currentQuestionIndex = 5
        let totalQuestions = anamneseModel.visibleQuestions.count
        let expectedProgress = Double(6) / Double(totalQuestions) // +1 because index is 0-based
        
        // Manually trigger progress update
        anamneseModel.currentQuestionIndex = 5
        
        XCTAssertEqual(anamneseModel.progress, expectedProgress, accuracy: 0.01, "Progress should be calculated correctly")
    }
    
    // MARK: - Persistence Service Tests
    
    func testAnswerPersistence() throws {
        let testAnswers: [String: String] = [
            "1": "João Silva",
            "2": "30",
            "3": "Masculino"
        ]
        
        persistenceService.saveCurrentAnswers(testAnswers)
        let retrievedAnswers = persistenceService.getCurrentAnswers()
        
        XCTAssertEqual(retrievedAnswers, testAnswers, "Answers should be persisted and retrieved correctly")
        
        // Clean up
        persistenceService.clearCurrentAnswers()
        let clearedAnswers = persistenceService.getCurrentAnswers()
        XCTAssertTrue(clearedAnswers.isEmpty, "Answers should be cleared")
    }
    
    func testProfilePersistence() throws {
        let testProfile = NutritionalProfile(
            userId: "test",
            bmi: 22.5,
            bmr: 1800,
            tdee: 2500,
            proteinGrams: 140,
            carbGrams: 300,
            fatGrams: 80,
            waterLiters: 3.0,
            recommendations: ["Test recommendation"],
            createdAt: Date(),
            updatedAt: Date()
        )
        
        persistenceService.saveNutritionalProfile(testProfile)
        let retrievedProfile = persistenceService.getNutritionalProfile()
        
        XCTAssertNotNil(retrievedProfile, "Profile should be retrieved")
        XCTAssertEqual(retrievedProfile?.bmi, testProfile.bmi, "BMI should match")
        XCTAssertEqual(retrievedProfile?.bmr, testProfile.bmr, "BMR should match")
        XCTAssertEqual(retrievedProfile?.tdee, testProfile.tdee, "TDEE should match")
        
        // Clean up
        persistenceService.clearNutritionalProfile()
        let clearedProfile = persistenceService.getNutritionalProfile()
        XCTAssertNil(clearedProfile, "Profile should be cleared")
    }
    
    func testAnamneseCompletionStatus() throws {
        XCTAssertFalse(persistenceService.isAnamneseCompleted(), "Should start as not completed")
        
        persistenceService.markAnamneseAsCompleted()
        XCTAssertTrue(persistenceService.isAnamneseCompleted(), "Should be marked as completed")
        
        persistenceService.resetAnamneseCompletion()
        XCTAssertFalse(persistenceService.isAnamneseCompleted(), "Should be reset to not completed")
    }
    
    // MARK: - Integration Tests
    
    func testCompleteAnamneseFlow() throws {
        // Simulate complete anamnese flow
        let completeAnswers: [String: String] = [
            "1": "João Silva",
            "2": "30",
            "3": "Masculino",
            "4": "75",
            "5": "180",
            "6": "Normal",
            "7": "Manter peso atual",
            "8": "",
            "9": "3-6 meses",
            "10": "Moderadamente ativo",
            "11": "Musculação,Corrida",
            "12": "3 refeições",
            "13": "Na maioria das vezes",
            "14": "2.5",
            "15": "Nenhuma",
            "16": "Nenhuma",
            "17": "Moderado",
            "18": "7-8h",
            "19": "Boa",
            "20": "Nenhum",
            "21": "Nenhuma",
            "22": "Nenhum"
        ]
        
        // Test calculation
        let profile = calculationService.calculateNutritionalProfile(from: completeAnswers)
        
        // Validate results
        XCTAssertGreaterThan(profile.bmi, 0, "BMI should be calculated")
        XCTAssertGreaterThan(profile.bmr, 0, "BMR should be calculated")
        XCTAssertGreaterThan(profile.tdee, profile.bmr, "TDEE should be greater than BMR")
        XCTAssertGreaterThan(profile.proteinGrams, 0, "Protein should be calculated")
        XCTAssertGreaterThan(profile.carbGrams, 0, "Carbs should be calculated")
        XCTAssertGreaterThan(profile.fatGrams, 0, "Fat should be calculated")
        XCTAssertGreaterThan(profile.waterLiters, 0, "Water needs should be calculated")
        XCTAssertFalse(profile.recommendations.isEmpty, "Should have recommendations")
        
        // Test persistence
        persistenceService.saveCurrentAnswers(completeAnswers)
        persistenceService.saveNutritionalProfile(profile)
        persistenceService.markAnamneseAsCompleted()
        
        // Verify persistence
        let retrievedAnswers = persistenceService.getCurrentAnswers()
        let retrievedProfile = persistenceService.getNutritionalProfile()
        let isCompleted = persistenceService.isAnamneseCompleted()
        
        XCTAssertEqual(retrievedAnswers.count, completeAnswers.count, "All answers should be persisted")
        XCTAssertNotNil(retrievedProfile, "Profile should be persisted")
        XCTAssertTrue(isCompleted, "Completion status should be persisted")
        
        // Clean up
        persistenceService.clearAllData()
    }
    
    // MARK: - Performance Tests
    
    func testCalculationPerformance() throws {
        let answers: [String: String] = [
            "1": "Test User",
            "2": "30",
            "3": "Masculino",
            "4": "75",
            "5": "180",
            "6": "Normal",
            "7": "Manter peso atual",
            "10": "Moderadamente ativo",
            "14": "2.5",
            "17": "Moderado",
            "18": "7-8h",
            "19": "Boa"
        ]
        
        measure {
            _ = calculationService.calculateNutritionalProfile(from: answers)
        }
    }
    
    func testValidationPerformance() throws {
        guard let question = anamneseModel.questions.first else {
            XCTFail("Should have questions")
            return
        }
        
        measure {
            for i in 0..<1000 {
                _ = anamneseModel.validateAnswer("Test Answer \\(i)", for: question)
            }
        }
    }
    
    // MARK: - Edge Cases Tests
    
    func testInvalidInputHandling() throws {
        let invalidAnswers: [String: String] = [
            "4": "invalid_weight",
            "5": "invalid_height",
            "2": "invalid_age"
        ]
        
        // Should not crash with invalid inputs
        let profile = calculationService.calculateNutritionalProfile(from: invalidAnswers)
        
        // Should use default values
        XCTAssertGreaterThan(profile.bmi, 0, "Should handle invalid inputs gracefully")
        XCTAssertGreaterThan(profile.bmr, 0, "Should handle invalid inputs gracefully")
    }
    
    func testExtremeValues() throws {
        let extremeAnswers: [String: String] = [
            "4": "300", // very high weight
            "5": "250", // very high height
            "2": "100", // very high age
            "3": "Masculino"
        ]
        
        let profile = calculationService.calculateNutritionalProfile(from: extremeAnswers)
        
        // Should handle extreme values reasonably
        XCTAssertGreaterThan(profile.bmi, 0, "Should handle extreme values")
        XCTAssertLessThan(profile.bmi, 100, "BMI should be reasonable even with extreme inputs")
    }
    
    func testEmptyAnswers() throws {
        let emptyAnswers: [String: String] = [:]
        
        // Should not crash with empty answers
        let profile = calculationService.calculateNutritionalProfile(from: emptyAnswers)
        
        XCTAssertGreaterThan(profile.bmi, 0, "Should provide default values for empty answers")
        XCTAssertGreaterThan(profile.bmr, 0, "Should provide default values for empty answers")
    }
}

