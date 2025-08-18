//
//  APIService.swift
//  EvolveYou
//
//  Created by EvolveYou Team on 17/08/2025.
//

import Foundation
import Combine

// MARK: - API Configuration
struct APIConfiguration {
    static let baseURL = "https://users-service-1062253516.us-central1.run.app"
    static let timeout: TimeInterval = 30.0
    static let retryAttempts = 3
}

// MARK: - API Error
enum APIError: Error, LocalizedError {
    case invalidURL
    case noData
    case decodingError(Error)
    case networkError(Error)
    case serverError(Int)
    case unauthorized
    case rateLimited
    case timeout
    
    var errorDescription: String? {
        switch self {
        case .invalidURL:
            return "URL inválida"
        case .noData:
            return "Nenhum dado recebido"
        case .decodingError(let error):
            return "Erro ao processar dados: \\(error.localizedDescription)"
        case .networkError(let error):
            return "Erro de rede: \\(error.localizedDescription)"
        case .serverError(let code):
            return "Erro do servidor (\\(code))"
        case .unauthorized:
            return "Acesso não autorizado"
        case .rateLimited:
            return "Muitas tentativas. Tente novamente em alguns minutos"
        case .timeout:
            return "Tempo limite excedido"
        }
    }
}

// MARK: - API Response Models
struct APIResponse<T: Codable>: Codable {
    let success: Bool
    let data: T?
    let message: String?
    let error: String?
}

struct AnamneseAnswersRequest: Codable {
    let userId: String
    let answers: [String: String]
    let timestamp: Date
}

struct NutritionalProfileRequest: Codable {
    let userId: String
    let profile: NutritionalProfile
}

// MARK: - API Service
class APIService: ObservableObject {
    private let session: URLSession
    private let decoder: JSONDecoder
    private let encoder: JSONEncoder
    
    init() {
        let config = URLSessionConfiguration.default
        config.timeoutIntervalForRequest = APIConfiguration.timeout
        config.timeoutIntervalForResource = APIConfiguration.timeout * 2
        
        self.session = URLSession(configuration: config)
        
        self.decoder = JSONDecoder()
        self.decoder.dateDecodingStrategy = .iso8601
        
        self.encoder = JSONEncoder()
        self.encoder.dateEncodingStrategy = .iso8601
    }
    
    // MARK: - Health Check
    func healthCheck() -> AnyPublisher<Bool, APIError> {
        guard let url = URL(string: "\\(APIConfiguration.baseURL)/health") else {
            return Fail(error: APIError.invalidURL)
                .eraseToAnyPublisher()
        }
        
        return session.dataTaskPublisher(for: url)
            .map { $0.response }
            .tryMap { response in
                guard let httpResponse = response as? HTTPURLResponse else {
                    throw APIError.networkError(URLError(.badServerResponse))
                }
                return httpResponse.statusCode == 200
            }
            .mapError { error in
                if error is APIError {
                    return error as! APIError
                } else {
                    return APIError.networkError(error)
                }
            }
            .eraseToAnyPublisher()
    }
    
    // MARK: - Get Anamnese Questions
    func getAnamneseQuestions() -> AnyPublisher<[Question], APIError> {
        return makeRequest(
            endpoint: "/anamnese/questions",
            method: "GET"
        )
    }
    
    // MARK: - Save Single Answer
    func saveAnswer(questionId: String, answer: String, userId: String = "local") -> AnyPublisher<Bool, APIError> {
        let request = [
            "questionId": questionId,
            "answer": answer,
            "userId": userId,
            "timestamp": ISO8601DateFormatter().string(from: Date())
        ]
        
        return makeRequest(
            endpoint: "/anamnese/answer",
            method: "POST",
            body: request
        )
        .map { (_: APIResponse<[String: String]>) in true }
        .eraseToAnyPublisher()
    }
    
    // MARK: - Save Batch Answers
    func saveAnamneseAnswers(_ answers: [String: String], userId: String = "local") -> AnyPublisher<Bool, APIError> {
        let request = AnamneseAnswersRequest(
            userId: userId,
            answers: answers,
            timestamp: Date()
        )
        
        return makeRequest(
            endpoint: "/anamnese/answers/batch",
            method: "POST",
            body: request
        )
        .map { (_: APIResponse<[String: String]>) in true }
        .eraseToAnyPublisher()
    }
    
    // MARK: - Calculate Nutritional Profile
    func calculateNutritionalProfile(from answers: [String: String], userId: String = "local") -> AnyPublisher<NutritionalProfile, APIError> {
        let request = [
            "userId": userId,
            "answers": answers
        ] as [String: Any]
        
        return makeRequest(
            endpoint: "/anamnese/calculate-profile",
            method: "POST",
            body: request
        )
        .map { (response: APIResponse<NutritionalProfile>) in
            response.data ?? self.createFallbackProfile(from: answers, userId: userId)
        }
        .eraseToAnyPublisher()
    }
    
    // MARK: - Save Nutritional Profile
    func saveNutritionalProfile(_ profile: NutritionalProfile) -> AnyPublisher<NutritionalProfile, APIError> {
        let request = NutritionalProfileRequest(
            userId: profile.userId,
            profile: profile
        )
        
        return makeRequest(
            endpoint: "/anamnese/profile",
            method: "POST",
            body: request
        )
        .map { (response: APIResponse<NutritionalProfile>) in
            response.data ?? profile
        }
        .eraseToAnyPublisher()
    }
    
    // MARK: - Get User Profile
    func getUserProfile(userId: String = "local") -> AnyPublisher<NutritionalProfile?, APIError> {
        return makeRequest(
            endpoint: "/anamnese/profile?userId=\\(userId)",
            method: "GET"
        )
        .map { (response: APIResponse<NutritionalProfile>) in
            response.data
        }
        .eraseToAnyPublisher()
    }
    
    // MARK: - Get TACO Recommendations
    func getTACORecommendations(userId: String = "local", mealType: String = "all") -> AnyPublisher<[TACOFood], APIError> {
        return makeRequest(
            endpoint: "/taco/foods/recommendations?userId=\\(userId)&mealType=\\(mealType)",
            method: "GET"
        )
        .map { (response: APIResponse<[TACOFood]>) in
            response.data ?? []
        }
        .eraseToAnyPublisher()
    }
    
    // MARK: - Search TACO Foods
    func searchTACOFoods(query: String, restrictions: [String] = []) -> AnyPublisher<[TACOFood], APIError> {
        let request = [
            "query": query,
            "restrictions": restrictions
        ] as [String: Any]
        
        return makeRequest(
            endpoint: "/taco/foods/search",
            method: "POST",
            body: request
        )
        .map { (response: APIResponse<[TACOFood]>) in
            response.data ?? []
        }
        .eraseToAnyPublisher()
    }
    
    // MARK: - Generic Request Method
    private func makeRequest<T: Codable>(
        endpoint: String,
        method: String,
        body: Any? = nil,
        headers: [String: String] = [:]
    ) -> AnyPublisher<T, APIError> {
        
        guard let url = URL(string: "\\(APIConfiguration.baseURL)\\(endpoint)") else {
            return Fail(error: APIError.invalidURL)
                .eraseToAnyPublisher()
        }
        
        var request = URLRequest(url: url)
        request.httpMethod = method
        request.setValue("application/json", forHTTPHeaderField: "Content-Type")
        request.setValue("EvolveYou-iOS/1.0", forHTTPHeaderField: "User-Agent")
        
        // Add custom headers
        for (key, value) in headers {
            request.setValue(value, forHTTPHeaderField: key)
        }
        
        // Add body if provided
        if let body = body {
            do {
                if let bodyData = body as? Data {
                    request.httpBody = bodyData
                } else {
                    request.httpBody = try JSONSerialization.data(withJSONObject: body)
                }
            } catch {
                return Fail(error: APIError.decodingError(error))
                    .eraseToAnyPublisher()
            }
        }
        
        return session.dataTaskPublisher(for: request)
            .retry(APIConfiguration.retryAttempts)
            .tryMap { data, response in
                guard let httpResponse = response as? HTTPURLResponse else {
                    throw APIError.networkError(URLError(.badServerResponse))
                }
                
                switch httpResponse.statusCode {
                case 200...299:
                    return data
                case 401:
                    throw APIError.unauthorized
                case 429:
                    throw APIError.rateLimited
                case 408:
                    throw APIError.timeout
                default:
                    throw APIError.serverError(httpResponse.statusCode)
                }
            }
            .decode(type: T.self, decoder: decoder)
            .mapError { error in
                if let apiError = error as? APIError {
                    return apiError
                } else if error is DecodingError {
                    return APIError.decodingError(error)
                } else {
                    return APIError.networkError(error)
                }
            }
            .eraseToAnyPublisher()
    }
    
    // MARK: - Fallback Profile Creation
    private func createFallbackProfile(from answers: [String: String], userId: String) -> NutritionalProfile {
        let calculationService = CalculationService()
        return calculationService.calculateNutritionalProfile(from: answers, userId: userId)
    }
}

// MARK: - TACO Food Model
struct TACOFood: Codable, Identifiable {
    let id: String
    let name: String
    let category: String
    let calories: Double
    let protein: Double
    let carbs: Double
    let fat: Double
    let fiber: Double
    let sodium: Double
    let servingSize: Double
    let servingUnit: String
    
    enum CodingKeys: String, CodingKey {
        case id, name, category, calories, protein, carbs, fat, fiber, sodium
        case servingSize = "serving_size"
        case servingUnit = "serving_unit"
    }
}

// MARK: - Network Monitor
import Network

class NetworkMonitor: ObservableObject {
    private let monitor = NWPathMonitor()
    private let queue = DispatchQueue(label: "NetworkMonitor")
    
    @Published var isConnected = true
    @Published var connectionType: NWInterface.InterfaceType?
    
    init() {
        startMonitoring()
    }
    
    private func startMonitoring() {
        monitor.pathUpdateHandler = { [weak self] path in
            DispatchQueue.main.async {
                self?.isConnected = path.status == .satisfied
                self?.connectionType = path.availableInterfaces.first?.type
            }
        }
        monitor.start(queue: queue)
    }
    
    deinit {
        monitor.cancel()
    }
}

// MARK: - API Service Extensions
extension APIService {
    
    // MARK: - Offline Support
    func saveAnswersLocally(_ answers: [String: String]) {
        let data = try? JSONSerialization.data(withJSONObject: answers)
        UserDefaults.standard.set(data, forKey: "offline_answers")
    }
    
    func getLocalAnswers() -> [String: String]? {
        guard let data = UserDefaults.standard.data(forKey: "offline_answers"),
              let answers = try? JSONSerialization.jsonObject(with: data) as? [String: String] else {
            return nil
        }
        return answers
    }
    
    func clearLocalAnswers() {
        UserDefaults.standard.removeObject(forKey: "offline_answers")
    }
    
    // MARK: - Cache Management
    func cacheProfile(_ profile: NutritionalProfile) {
        if let data = try? encoder.encode(profile) {
            UserDefaults.standard.set(data, forKey: "cached_profile")
        }
    }
    
    func getCachedProfile() -> NutritionalProfile? {
        guard let data = UserDefaults.standard.data(forKey: "cached_profile"),
              let profile = try? decoder.decode(NutritionalProfile.self, from: data) else {
            return nil
        }
        return profile
    }
    
    func clearCache() {
        UserDefaults.standard.removeObject(forKey: "cached_profile")
        UserDefaults.standard.removeObject(forKey: "offline_answers")
    }
}

