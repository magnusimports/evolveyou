import syncService from './syncService';

class APIService {
  constructor() {
    // URLs dos serviços backend
    this.baseURLs = {
      users: 'https://users-service-1062253516.us-central1.run.app',
      content: 'https://content-service-1062253516.us-central1.run.app',
      local: 'http://localhost:8000' // Para desenvolvimento local
    };
    
    this.defaultHeaders = {
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    };
  }

  // Fazer requisição HTTP com fallback
  async makeRequest(url, options = {}) {
    const config = {
      ...options,
      headers: {
        ...this.defaultHeaders,
        ...options.headers
      }
    };

    try {
      const response = await fetch(url, config);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      return { success: true, data };
    } catch (error) {
      console.error(`Erro na requisição para ${url}:`, error);
      return { success: false, error: error.message };
    }
  }

  // Autenticação com token
  setAuthToken(token) {
    this.defaultHeaders['Authorization'] = `Bearer ${token}`;
  }

  clearAuthToken() {
    delete this.defaultHeaders['Authorization'];
  }

  // === ANAMNESE APIs ===

  // Obter perguntas da anamnese
  async getAnamneseQuestions() {
    const url = `${this.baseURLs.users}/anamnese/questions`;
    const result = await this.makeRequest(url);
    
    if (!result.success) {
      // Fallback para perguntas locais
      return {
        success: true,
        data: this.getLocalAnamneseQuestions(),
        fromCache: true
      };
    }
    
    return result;
  }

  // Salvar resposta da anamnese
  async saveAnamneseAnswer(userId, questionId, answer) {
    const url = `${this.baseURLs.users}/anamnese/answer`;
    const payload = {
      user_id: userId,
      question_id: questionId,
      answer: answer,
      timestamp: new Date().toISOString()
    };

    const result = await this.makeRequest(url, {
      method: 'POST',
      body: JSON.stringify(payload)
    });

    // Sempre salvar localmente também
    await syncService.saveUserData(userId, {
      [`answer_${questionId}`]: answer,
      [`timestamp_${questionId}`]: payload.timestamp
    }, 'anamnese_answers');

    return result;
  }

  // Salvar múltiplas respostas
  async saveAnamneseAnswers(userId, answers) {
    const url = `${this.baseURLs.users}/anamnese/answers/batch`;
    const payload = {
      user_id: userId,
      answers: answers,
      timestamp: new Date().toISOString()
    };

    const result = await this.makeRequest(url, {
      method: 'POST',
      body: JSON.stringify(payload)
    });

    // Salvar localmente
    await syncService.saveAnamneseData(userId, {
      answers: answers,
      completedAt: payload.timestamp
    });

    return result;
  }

  // Calcular perfil nutricional
  async calculateNutritionalProfile(userId, answers) {
    const url = `${this.baseURLs.users}/anamnese/calculate-profile`;
    const payload = {
      user_id: userId,
      answers: answers
    };

    const result = await this.makeRequest(url, {
      method: 'POST',
      body: JSON.stringify(payload)
    });

    if (result.success) {
      // Salvar perfil calculado localmente
      await syncService.saveNutritionalProfile(userId, result.data);
    } else {
      // Fallback para cálculo local
      const localProfile = this.calculateLocalProfile(answers);
      await syncService.saveNutritionalProfile(userId, localProfile);
      
      return {
        success: true,
        data: localProfile,
        fromCache: true
      };
    }

    return result;
  }

  // === BASE TACO APIs ===

  // Obter recomendações de alimentos
  async getFoodRecommendations(userId, filters = {}) {
    const url = `${this.baseURLs.users}/taco/foods/recommendations`;
    const params = new URLSearchParams({
      user_id: userId,
      ...filters
    });

    const result = await this.makeRequest(`${url}?${params}`);
    
    if (!result.success) {
      // Fallback para recomendações locais
      return {
        success: true,
        data: this.getLocalFoodRecommendations(filters),
        fromCache: true
      };
    }
    
    return result;
  }

  // Buscar alimentos
  async searchFoods(query, filters = {}) {
    const url = `${this.baseURLs.content}/foods/search`;
    const payload = {
      query: query,
      filters: filters,
      limit: 20
    };

    const result = await this.makeRequest(url, {
      method: 'POST',
      body: JSON.stringify(payload)
    });

    if (!result.success) {
      // Fallback para busca local
      return {
        success: true,
        data: this.searchLocalFoods(query),
        fromCache: true
      };
    }

    return result;
  }

  // === PERFIL DO USUÁRIO ===

  // Atualizar perfil do usuário
  async updateUserProfile(userId, profileData) {
    const url = `${this.baseURLs.users}/profile/update`;
    const payload = {
      user_id: userId,
      profile: profileData,
      updated_at: new Date().toISOString()
    };

    const result = await this.makeRequest(url, {
      method: 'PUT',
      body: JSON.stringify(payload)
    });

    // Sempre salvar localmente
    await syncService.saveUserData(userId, profileData, 'user_profiles');

    return result;
  }

  // === FALLBACKS LOCAIS ===

  getLocalAnamneseQuestions() {
    return [
      {
        id: 1,
        category: "personal_data",
        question: "Qual é o seu sexo?",
        type: "select",
        options: ["Masculino", "Feminino"],
        required: true
      },
      {
        id: 2,
        category: "personal_data", 
        question: "Qual é a sua idade?",
        type: "number",
        min: 16,
        max: 100,
        required: true
      },
      {
        id: 3,
        category: "body_measurements",
        question: "Qual é o seu peso atual (kg)?",
        type: "number",
        min: 30,
        max: 300,
        step: 0.1,
        required: true
      },
      {
        id: 4,
        category: "body_measurements",
        question: "Qual é a sua altura (cm)?",
        type: "number",
        min: 120,
        max: 250,
        required: true
      },
      {
        id: 5,
        category: "goals",
        question: "Qual é o seu objetivo principal?",
        type: "select",
        options: [
          "Perder peso",
          "Ganhar massa muscular",
          "Manter peso atual",
          "Melhorar saúde geral"
        ],
        required: true
      }
      // ... mais perguntas seriam adicionadas aqui
    ];
  }

  calculateLocalProfile(answers) {
    // Cálculo básico local
    const age = answers.find(a => a.question_id === 2)?.answer || 25;
    const weight = answers.find(a => a.question_id === 3)?.answer || 70;
    const height = answers.find(a => a.question_id === 4)?.answer || 170;
    const sex = answers.find(a => a.question_id === 1)?.answer || 'Masculino';

    // Cálculo TMB (Mifflin-St Jeor)
    let bmr;
    if (sex === 'Masculino') {
      bmr = (10 * weight) + (6.25 * height) - (5 * age) + 5;
    } else {
      bmr = (10 * weight) + (6.25 * height) - (5 * age) - 161;
    }

    // TDEE (assumindo atividade moderada)
    const tdee = bmr * 1.55;

    // IMC
    const heightM = height / 100;
    const bmi = weight / (heightM * heightM);

    return {
      bmr: Math.round(bmr),
      tdee: Math.round(tdee),
      bmi: Math.round(bmi * 10) / 10,
      weight: weight,
      height: height,
      age: age,
      sex: sex,
      calculatedAt: new Date().toISOString()
    };
  }

  getLocalFoodRecommendations(filters) {
    // Recomendações básicas locais
    return [
      {
        id: 1,
        name: "Arroz integral",
        category: "Cereais",
        calories_per_100g: 123,
        carbs: 23,
        protein: 2.6,
        fat: 1.0
      },
      {
        id: 2,
        name: "Frango grelhado",
        category: "Carnes",
        calories_per_100g: 165,
        carbs: 0,
        protein: 31,
        fat: 3.6
      },
      {
        id: 3,
        name: "Brócolis",
        category: "Vegetais",
        calories_per_100g: 34,
        carbs: 7,
        protein: 2.8,
        fat: 0.4
      }
    ];
  }

  searchLocalFoods(query) {
    const foods = this.getLocalFoodRecommendations();
    return foods.filter(food => 
      food.name.toLowerCase().includes(query.toLowerCase())
    );
  }

  // === UTILITÁRIOS ===

  // Verificar status dos serviços
  async checkServicesHealth() {
    const services = ['users', 'content'];
    const results = {};

    for (const service of services) {
      try {
        const url = `${this.baseURLs[service]}/health`;
        const response = await fetch(url, { 
          method: 'GET',
          timeout: 5000 
        });
        
        results[service] = {
          status: response.ok ? 'healthy' : 'unhealthy',
          responseTime: Date.now()
        };
      } catch (error) {
        results[service] = {
          status: 'offline',
          error: error.message
        };
      }
    }

    return results;
  }

  // Obter estatísticas de uso
  getUsageStats() {
    return {
      totalRequests: this.totalRequests || 0,
      successfulRequests: this.successfulRequests || 0,
      failedRequests: this.failedRequests || 0,
      lastRequestTime: this.lastRequestTime || null
    };
  }
}

// Instância singleton
const apiService = new APIService();

export default apiService;

