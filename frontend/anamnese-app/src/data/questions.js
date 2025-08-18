// 22 Perguntas da Anamnese Inteligente EvolveYou
export const anamneseQuestions = [
  // CATEGORIA 1: DADOS PESSOAIS BÁSICOS
  {
    id: 1,
    category: "dados_pessoais",
    type: "text",
    question: "Qual é o seu nome completo?",
    placeholder: "Digite seu nome completo",
    required: true,
    validation: {
      minLength: 2,
      pattern: /^[a-zA-ZÀ-ÿ\s]+$/,
      message: "Nome deve conter apenas letras e espaços"
    }
  },
  {
    id: 2,
    category: "dados_pessoais",
    type: "number",
    question: "Qual é a sua idade?",
    placeholder: "Digite sua idade",
    required: true,
    validation: {
      min: 16,
      max: 100,
      message: "Idade deve estar entre 16 e 100 anos"
    }
  },
  {
    id: 3,
    category: "dados_pessoais",
    type: "select",
    question: "Qual é o seu sexo biológico?",
    required: true,
    options: [
      { value: "masculino", label: "Masculino" },
      { value: "feminino", label: "Feminino" }
    ]
  },

  // CATEGORIA 2: MEDIDAS CORPORAIS
  {
    id: 4,
    category: "medidas_corporais",
    type: "number",
    question: "Qual é o seu peso atual? (kg)",
    placeholder: "Ex: 70.5",
    required: true,
    validation: {
      min: 30,
      max: 300,
      step: 0.1,
      message: "Peso deve estar entre 30kg e 300kg"
    }
  },
  {
    id: 5,
    category: "medidas_corporais",
    type: "number",
    question: "Qual é a sua altura? (cm)",
    placeholder: "Ex: 175",
    required: true,
    validation: {
      min: 120,
      max: 250,
      message: "Altura deve estar entre 120cm e 250cm"
    }
  },
  {
    id: 6,
    category: "medidas_corporais",
    type: "select",
    question: "Você sabe seu percentual de gordura corporal?",
    required: true,
    options: [
      { value: "nao_sei", label: "Não sei" },
      { value: "muito_baixo", label: "Muito baixo (< 10% H / < 16% M)" },
      { value: "baixo", label: "Baixo (10-15% H / 16-20% M)" },
      { value: "normal", label: "Normal (16-20% H / 21-25% M)" },
      { value: "alto", label: "Alto (21-25% H / 26-30% M)" },
      { value: "muito_alto", label: "Muito alto (> 25% H / > 30% M)" }
    ]
  },

  // CATEGORIA 3: OBJETIVOS
  {
    id: 7,
    category: "objetivos",
    type: "select",
    question: "Qual é o seu principal objetivo?",
    required: true,
    options: [
      { value: "perder_peso", label: "Perder peso" },
      { value: "ganhar_massa", label: "Ganhar massa muscular" },
      { value: "manter_peso", label: "Manter peso atual" },
      { value: "melhorar_saude", label: "Melhorar saúde geral" },
      { value: "performance_esportiva", label: "Melhorar performance esportiva" }
    ]
  },
  {
    id: 8,
    category: "objetivos",
    type: "number",
    question: "Quanto peso você gostaria de perder/ganhar? (kg)",
    placeholder: "Ex: 5 (positivo para ganhar, negativo para perder)",
    required: false,
    conditional: {
      dependsOn: 7,
      showWhen: ["perder_peso", "ganhar_massa"]
    },
    validation: {
      min: -50,
      max: 50,
      message: "Meta deve estar entre -50kg e +50kg"
    }
  },
  {
    id: 9,
    category: "objetivos",
    type: "select",
    question: "Em quanto tempo você quer alcançar seu objetivo?",
    required: true,
    options: [
      { value: "1_mes", label: "1 mês" },
      { value: "3_meses", label: "3 meses" },
      { value: "6_meses", label: "6 meses" },
      { value: "1_ano", label: "1 ano" },
      { value: "sem_pressa", label: "Sem pressa específica" }
    ]
  },

  // CATEGORIA 4: ATIVIDADE FÍSICA
  {
    id: 10,
    category: "atividade_fisica",
    type: "select",
    question: "Com que frequência você pratica atividade física?",
    required: true,
    options: [
      { value: "sedentario", label: "Sedentário (nenhuma atividade)" },
      { value: "leve", label: "Leve (1-3x por semana)" },
      { value: "moderado", label: "Moderado (3-5x por semana)" },
      { value: "intenso", label: "Intenso (6-7x por semana)" },
      { value: "muito_intenso", label: "Muito intenso (2x por dia)" }
    ]
  },
  {
    id: 11,
    category: "atividade_fisica",
    type: "multiselect",
    question: "Que tipos de exercício você pratica?",
    required: false,
    options: [
      { value: "musculacao", label: "Musculação" },
      { value: "cardio", label: "Cardio (corrida, bike, etc.)" },
      { value: "funcional", label: "Treinamento funcional" },
      { value: "esportes", label: "Esportes (futebol, tênis, etc.)" },
      { value: "yoga_pilates", label: "Yoga/Pilates" },
      { value: "natacao", label: "Natação" },
      { value: "caminhada", label: "Caminhada" },
      { value: "outros", label: "Outros" }
    ]
  },

  // CATEGORIA 5: HÁBITOS ALIMENTARES
  {
    id: 12,
    category: "habitos_alimentares",
    type: "select",
    question: "Quantas refeições você faz por dia?",
    required: true,
    options: [
      { value: "2", label: "2 refeições" },
      { value: "3", label: "3 refeições" },
      { value: "4", label: "4 refeições" },
      { value: "5", label: "5 refeições" },
      { value: "6_ou_mais", label: "6 ou mais refeições" }
    ]
  },
  {
    id: 13,
    category: "habitos_alimentares",
    type: "select",
    question: "Como você avalia sua alimentação atual?",
    required: true,
    options: [
      { value: "muito_ruim", label: "Muito ruim" },
      { value: "ruim", label: "Ruim" },
      { value: "regular", label: "Regular" },
      { value: "boa", label: "Boa" },
      { value: "muito_boa", label: "Muito boa" }
    ]
  },
  {
    id: 14,
    category: "habitos_alimentares",
    type: "number",
    question: "Quantos litros de água você bebe por dia?",
    placeholder: "Ex: 2.5",
    required: true,
    validation: {
      min: 0.5,
      max: 10,
      step: 0.1,
      message: "Consumo de água deve estar entre 0.5L e 10L"
    }
  },

  // CATEGORIA 6: RESTRIÇÕES E ALERGIAS
  {
    id: 15,
    category: "restricoes_alergias",
    type: "multiselect",
    question: "Você possui alguma restrição alimentar?",
    required: false,
    options: [
      { value: "vegetariano", label: "Vegetariano" },
      { value: "vegano", label: "Vegano" },
      { value: "sem_lactose", label: "Sem lactose" },
      { value: "sem_gluten", label: "Sem glúten" },
      { value: "low_carb", label: "Low carb" },
      { value: "cetogenica", label: "Cetogênica" },
      { value: "sem_acucar", label: "Sem açúcar" },
      { value: "halal", label: "Halal" },
      { value: "kosher", label: "Kosher" },
      { value: "nenhuma", label: "Nenhuma restrição" }
    ]
  },
  {
    id: 16,
    category: "restricoes_alergias",
    type: "multiselect",
    question: "Você possui alergia a algum alimento?",
    required: false,
    options: [
      { value: "leite", label: "Leite e derivados" },
      { value: "ovos", label: "Ovos" },
      { value: "amendoim", label: "Amendoim" },
      { value: "nozes", label: "Nozes e castanhas" },
      { value: "soja", label: "Soja" },
      { value: "trigo", label: "Trigo" },
      { value: "peixes", label: "Peixes" },
      { value: "crustaceos", label: "Crustáceos" },
      { value: "nenhuma", label: "Nenhuma alergia" }
    ]
  },

  // CATEGORIA 7: ESTILO DE VIDA
  {
    id: 17,
    category: "estilo_vida",
    type: "select",
    question: "Como você classificaria seu nível de estresse?",
    required: true,
    options: [
      { value: "muito_baixo", label: "Muito baixo" },
      { value: "baixo", label: "Baixo" },
      { value: "moderado", label: "Moderado" },
      { value: "alto", label: "Alto" },
      { value: "muito_alto", label: "Muito alto" }
    ]
  },
  {
    id: 18,
    category: "estilo_vida",
    type: "select",
    question: "Quantas horas você dorme por noite?",
    required: true,
    options: [
      { value: "menos_5", label: "Menos de 5 horas" },
      { value: "5_6", label: "5-6 horas" },
      { value: "6_7", label: "6-7 horas" },
      { value: "7_8", label: "7-8 horas" },
      { value: "8_9", label: "8-9 horas" },
      { value: "mais_9", label: "Mais de 9 horas" }
    ]
  },
  {
    id: 19,
    category: "estilo_vida",
    type: "select",
    question: "Como você avalia a qualidade do seu sono?",
    required: true,
    options: [
      { value: "muito_ruim", label: "Muito ruim" },
      { value: "ruim", label: "Ruim" },
      { value: "regular", label: "Regular" },
      { value: "boa", label: "Boa" },
      { value: "muito_boa", label: "Muito boa" }
    ]
  },
  {
    id: 20,
    category: "estilo_vida",
    type: "select",
    question: "Você fuma ou consome álcool regularmente?",
    required: true,
    options: [
      { value: "nao", label: "Não fumo nem bebo" },
      { value: "alcool_social", label: "Bebo socialmente" },
      { value: "alcool_regular", label: "Bebo regularmente" },
      { value: "fumo", label: "Fumo" },
      { value: "ambos", label: "Fumo e bebo" }
    ]
  },

  // CATEGORIA 8: SAÚDE E MEDICAMENTOS
  {
    id: 21,
    category: "saude_medicamentos",
    type: "multiselect",
    question: "Você possui alguma condição de saúde?",
    required: false,
    options: [
      { value: "diabetes", label: "Diabetes" },
      { value: "hipertensao", label: "Hipertensão" },
      { value: "colesterol_alto", label: "Colesterol alto" },
      { value: "tireoide", label: "Problemas de tireoide" },
      { value: "cardiopatia", label: "Problemas cardíacos" },
      { value: "gastrite", label: "Gastrite/úlcera" },
      { value: "ansiedade", label: "Ansiedade/depressão" },
      { value: "artrite", label: "Artrite/artrose" },
      { value: "nenhuma", label: "Nenhuma condição" }
    ]
  },
  {
    id: 22,
    category: "saude_medicamentos",
    type: "select",
    question: "Você toma algum medicamento ou suplemento regularmente?",
    required: true,
    options: [
      { value: "nenhum", label: "Não tomo nada" },
      { value: "vitaminas", label: "Apenas vitaminas" },
      { value: "suplementos", label: "Suplementos esportivos" },
      { value: "medicamentos", label: "Medicamentos prescritos" },
      { value: "ambos", label: "Medicamentos e suplementos" }
    ]
  }
];

// Categorias para organização
export const categories = {
  dados_pessoais: {
    title: "Dados Pessoais",
    description: "Informações básicas sobre você",
    icon: "👤"
  },
  medidas_corporais: {
    title: "Medidas Corporais",
    description: "Peso, altura e composição corporal",
    icon: "📏"
  },
  objetivos: {
    title: "Objetivos",
    description: "Suas metas e expectativas",
    icon: "🎯"
  },
  atividade_fisica: {
    title: "Atividade Física",
    description: "Seu nível de exercícios",
    icon: "💪"
  },
  habitos_alimentares: {
    title: "Hábitos Alimentares",
    description: "Como você se alimenta atualmente",
    icon: "🍽️"
  },
  restricoes_alergias: {
    title: "Restrições e Alergias",
    description: "Limitações alimentares",
    icon: "⚠️"
  },
  estilo_vida: {
    title: "Estilo de Vida",
    description: "Sono, estresse e hábitos",
    icon: "🌙"
  },
  saude_medicamentos: {
    title: "Saúde e Medicamentos",
    description: "Condições de saúde e medicamentos",
    icon: "💊"
  }
};

// Função para validar resposta
export const validateAnswer = (question, answer) => {
  if (question.required && (!answer || answer === "")) {
    return { isValid: false, message: "Esta pergunta é obrigatória" };
  }

  if (!answer) return { isValid: true };

  const validation = question.validation;
  if (!validation) return { isValid: true };

  switch (question.type) {
    case "text":
      if (validation.minLength && answer.length < validation.minLength) {
        return { isValid: false, message: `Mínimo ${validation.minLength} caracteres` };
      }
      if (validation.pattern && !validation.pattern.test(answer)) {
        return { isValid: false, message: validation.message };
      }
      break;

    case "number":
      const num = parseFloat(answer);
      if (isNaN(num)) {
        return { isValid: false, message: "Deve ser um número válido" };
      }
      if (validation.min !== undefined && num < validation.min) {
        return { isValid: false, message: validation.message };
      }
      if (validation.max !== undefined && num > validation.max) {
        return { isValid: false, message: validation.message };
      }
      break;
  }

  return { isValid: true };
};

// Função para verificar se pergunta deve ser exibida
export const shouldShowQuestion = (question, answers) => {
  if (!question.conditional) return true;
  
  const dependentAnswer = answers[question.conditional.dependsOn];
  return question.conditional.showWhen.includes(dependentAnswer);
};

