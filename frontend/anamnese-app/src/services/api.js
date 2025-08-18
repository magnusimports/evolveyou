// Serviço de integração com APIs backend do EvolveYou
const API_BASE_URL = 'https://users-service-1062253516.us-central1.run.app';

class ApiService {
  constructor() {
    this.baseURL = API_BASE_URL;
    this.headers = {
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    };
  }

  // Método genérico para fazer requisições
  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    
    const config = {
      headers: this.headers,
      ...options
    };

    try {
      const response = await fetch(url, config);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      return { success: true, data };
    } catch (error) {
      console.error('API Request Error:', error);
      return { success: false, error: error.message };
    }
  }

  // ========== ANAMNESE ENDPOINTS ==========

  // Obter perguntas da anamnese
  async getQuestions() {
    return this.request('/anamnese/questions');
  }

  // Salvar resposta individual
  async saveAnswer(userId, questionId, answer) {
    return this.request('/anamnese/answer', {
      method: 'POST',
      body: JSON.stringify({
        user_id: userId,
        question_id: questionId,
        answer: answer
      })
    });
  }

  // Salvar múltiplas respostas
  async saveAnswers(userId, answers) {
    const answersArray = Object.entries(answers).map(([questionId, answer]) => ({
      question_id: parseInt(questionId),
      answer: answer
    }));

    return this.request('/anamnese/answers/batch', {
      method: 'POST',
      body: JSON.stringify({
        user_id: userId,
        answers: answersArray
      })
    });
  }

  // Obter status da anamnese
  async getAnamneseStatus(userId) {
    return this.request(`/anamnese/status?user_id=${userId}`);
  }

  // Obter todas as respostas do usuário
  async getUserAnswers(userId) {
    return this.request(`/anamnese/answers?user_id=${userId}`);
  }

  // Calcular perfil nutricional
  async calculateProfile(userId, answers) {
    return this.request('/anamnese/calculate-profile', {
      method: 'POST',
      body: JSON.stringify({
        user_id: userId,
        answers: answers
      })
    });
  }

  // Obter perfil nutricional
  async getUserProfile(userId) {
    return this.request(`/anamnese/profile?user_id=${userId}`);
  }

  // Atualizar perfil nutricional
  async updateProfile(userId, profileData) {
    return this.request('/anamnese/profile/update', {
      method: 'PUT',
      body: JSON.stringify({
        user_id: userId,
        profile_data: profileData
      })
    });
  }

  // Resetar anamnese
  async resetAnamnese(userId) {
    return this.request('/anamnese/reset', {
      method: 'DELETE',
      body: JSON.stringify({
        user_id: userId
      })
    });
  }

  // ========== RECOMENDAÇÕES TACO ==========

  // Obter recomendações de alimentos
  async getFoodRecommendations(userId, filters = {}) {
    const queryParams = new URLSearchParams({
      user_id: userId,
      ...filters
    });
    
    return this.request(`/taco/foods/recommendations?${queryParams}`);
  }

  // Obter sugestões de refeições
  async getMealSuggestions(userId, mealType, preferences = {}) {
    return this.request('/taco/meals/suggestions', {
      method: 'POST',
      body: JSON.stringify({
        user_id: userId,
        meal_type: mealType,
        preferences: preferences
      })
    });
  }

  // Buscar alimentos na base TACO
  async searchFoods(query, filters = {}) {
    return this.request('/taco/foods/search', {
      method: 'POST',
      body: JSON.stringify({
        query: query,
        filters: filters
      })
    });
  }

  // Obter todos os alimentos TACO
  async getAllFoods(page = 1, limit = 50) {
    return this.request(`/taco/foods/all?page=${page}&limit=${limit}`);
  }

  // Obter informações sobre restrições
  async getRestrictionsInfo() {
    return this.request('/taco/restrictions/info');
  }

  // ========== UTILITÁRIOS ==========

  // Verificar saúde da API
  async healthCheck() {
    return this.request('/health');
  }

  // Simular dados para desenvolvimento
  generateMockProfile(answers) {
    const peso = parseFloat(answers[4]) || 70;
    const altura = parseInt(answers[5]) || 170;
    const idade = parseInt(answers[2]) || 30;
    const sexo = answers[3] || 'masculino';
    const objetivo = answers[7] || 'manter_peso';
    const atividade = answers[10] || 'moderado';

    // Cálculo do IMC
    const alturaM = altura / 100;
    const imc = peso / (alturaM * alturaM);

    // Cálculo do TMB (Mifflin-St Jeor)
    let tmb;
    if (sexo === 'masculino') {
      tmb = (10 * peso) + (6.25 * altura) - (5 * idade) + 5;
    } else {
      tmb = (10 * peso) + (6.25 * altura) - (5 * idade) - 161;
    }

    // Fatores de atividade
    const fatoresAtividade = {
      'sedentario': 1.2,
      'leve': 1.375,
      'moderado': 1.55,
      'intenso': 1.725,
      'muito_intenso': 1.9
    };

    const fator = fatoresAtividade[atividade] || 1.55;
    const tdee = tmb * fator;

    // Macronutrientes baseados no objetivo
    let proteina = peso * 2.2;
    let carboidrato, gordura;

    switch (objetivo) {
      case 'perder_peso':
        carboidrato = peso * 2.0;
        gordura = peso * 0.8;
        break;
      case 'ganhar_massa':
        carboidrato = peso * 4.0;
        gordura = peso * 1.2;
        break;
      default:
        carboidrato = peso * 3.0;
        gordura = peso * 1.0;
    }

    const calorias = (proteina * 4) + (carboidrato * 4) + (gordura * 9);

    // Hidratação
    let aguaBase = peso * 35; // 35ml por kg
    if (atividade === 'intenso' || atividade === 'muito_intenso') {
      aguaBase += 500;
    }

    return {
      user_id: 'mock_user',
      profile: {
        dados_basicos: {
          nome: answers[1] || 'Usuário',
          idade: idade,
          sexo: sexo,
          peso: peso,
          altura: altura
        },
        calculos_metabolicos: {
          imc: Math.round(imc * 10) / 10,
          tmb: Math.round(tmb),
          tdee: Math.round(tdee),
          categoria_imc: this.getIMCCategory(imc)
        },
        macronutrientes: {
          proteina: Math.round(proteina),
          carboidrato: Math.round(carboidrato),
          gordura: Math.round(gordura),
          calorias: Math.round(calorias)
        },
        hidratacao: {
          agua_recomendada: Math.round(aguaBase / 1000 * 10) / 10
        },
        objetivos: {
          principal: objetivo,
          meta_peso: answers[8] || null,
          prazo: answers[9] || null
        },
        restricoes: {
          alimentares: answers[15] ? answers[15].split(',').filter(r => r !== 'nenhuma') : [],
          alergias: answers[16] ? answers[16].split(',').filter(a => a !== 'nenhuma') : []
        },
        estilo_vida: {
          nivel_atividade: atividade,
          qualidade_sono: answers[19] || 'regular',
          nivel_estresse: answers[17] || 'moderado',
          habitos: {
            fumo_alcool: answers[20] || 'nao',
            refeicoes_dia: answers[12] || '3'
          }
        },
        recomendacoes: this.generateRecommendations(answers)
      },
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
  }

  getIMCCategory(imc) {
    if (imc < 18.5) return 'Abaixo do peso';
    if (imc < 25) return 'Peso normal';
    if (imc < 30) return 'Sobrepeso';
    return 'Obesidade';
  }

  generateRecommendations(answers) {
    const recommendations = [];
    
    const objetivo = answers[7];
    const atividade = answers[10];
    const sono = answers[18];
    const agua = parseFloat(answers[14]);

    // Recomendações baseadas no objetivo
    if (objetivo === 'perder_peso') {
      recommendations.push('Mantenha um déficit calórico moderado de 300-500 calorias por dia');
      recommendations.push('Priorize alimentos ricos em proteína para preservar massa muscular');
      recommendations.push('Inclua exercícios de resistência 3-4x por semana');
    } else if (objetivo === 'ganhar_massa') {
      recommendations.push('Mantenha um superávit calórico de 200-400 calorias por dia');
      recommendations.push('Consuma proteína a cada 3-4 horas ao longo do dia');
      recommendations.push('Foque em exercícios compostos com cargas progressivas');
    } else if (objetivo === 'melhorar_saude') {
      recommendations.push('Priorize alimentos integrais e minimamente processados');
      recommendations.push('Inclua variedade de frutas e vegetais coloridos');
      recommendations.push('Mantenha regularidade nos horários das refeições');
    }

    // Recomendações baseadas na atividade física
    if (atividade === 'sedentario') {
      recommendations.push('Comece com caminhadas de 30 minutos, 3x por semana');
      recommendations.push('Aumente gradualmente a intensidade dos exercícios');
    } else if (atividade === 'muito_intenso') {
      recommendations.push('Garanta recuperação adequada entre treinos intensos');
      recommendations.push('Monitore sinais de overtraining');
    }

    // Recomendações baseadas no sono
    if (sono === 'menos_5' || sono === '5_6') {
      recommendations.push('Priorize dormir 7-9 horas por noite para melhor recuperação');
      recommendations.push('Evite cafeína 6 horas antes de dormir');
    }

    // Recomendações baseadas na hidratação
    if (agua < 2) {
      recommendations.push('Aumente gradualmente o consumo de água ao longo do dia');
      recommendations.push('Use lembretes para beber água regularmente');
    }

    return recommendations;
  }

  // Configurar autenticação (para futuro uso com Firebase)
  setAuthToken(token) {
    this.headers['Authorization'] = `Bearer ${token}`;
  }

  // Remover autenticação
  clearAuth() {
    delete this.headers['Authorization'];
  }
}

// Instância singleton do serviço
const apiService = new ApiService();

export default apiService;

