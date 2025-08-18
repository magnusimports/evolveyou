import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Brain, 
  Target, 
  Zap, 
  Users, 
  ArrowRight, 
  ArrowLeft,
  CheckCircle,
  Star,
  Heart,
  TrendingUp,
  Shield
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { useAuth } from '../contexts/AuthContext';

export default function OnboardingPage() {
  const [currentStep, setCurrentStep] = useState(0);
  const [onboardingData, setOnboardingData] = useState({
    goals: [],
    experience: '',
    preferences: [],
    motivation: ''
  });
  
  const { completeOnboarding } = useAuth();

  const steps = [
    {
      id: 'welcome',
      title: 'Bem-vindo ao EvolveYou!',
      subtitle: 'Vamos personalizar sua experiência nutricional'
    },
    {
      id: 'goals',
      title: 'Quais são seus objetivos?',
      subtitle: 'Selecione todos que se aplicam a você'
    },
    {
      id: 'experience',
      title: 'Qual sua experiência com nutrição?',
      subtitle: 'Isso nos ajuda a personalizar as recomendações'
    },
    {
      id: 'preferences',
      title: 'Suas preferências alimentares',
      subtitle: 'Vamos respeitar suas escolhas'
    },
    {
      id: 'motivation',
      title: 'O que mais te motiva?',
      subtitle: 'Entender sua motivação nos ajuda a te apoiar melhor'
    },
    {
      id: 'complete',
      title: 'Tudo pronto!',
      subtitle: 'Agora vamos fazer sua anamnese nutricional'
    }
  ];

  const goals = [
    { id: 'weight_loss', label: 'Perder Peso', icon: TrendingUp, color: 'text-red-500' },
    { id: 'muscle_gain', label: 'Ganhar Massa Muscular', icon: Target, color: 'text-blue-500' },
    { id: 'maintenance', label: 'Manter Peso Atual', icon: Shield, color: 'text-green-500' },
    { id: 'health', label: 'Melhorar Saúde Geral', icon: Heart, color: 'text-pink-500' },
    { id: 'performance', label: 'Performance Esportiva', icon: Zap, color: 'text-yellow-500' },
    { id: 'habits', label: 'Criar Hábitos Saudáveis', icon: Star, color: 'text-purple-500' }
  ];

  const experiences = [
    { id: 'beginner', label: 'Iniciante', description: 'Pouca ou nenhuma experiência' },
    { id: 'intermediate', label: 'Intermediário', description: 'Algum conhecimento básico' },
    { id: 'advanced', label: 'Avançado', description: 'Boa experiência com nutrição' },
    { id: 'expert', label: 'Especialista', description: 'Profissional ou muito experiente' }
  ];

  const preferences = [
    { id: 'vegetarian', label: 'Vegetariano' },
    { id: 'vegan', label: 'Vegano' },
    { id: 'gluten_free', label: 'Sem Glúten' },
    { id: 'lactose_free', label: 'Sem Lactose' },
    { id: 'low_carb', label: 'Low Carb' },
    { id: 'keto', label: 'Cetogênica' },
    { id: 'paleo', label: 'Paleo' },
    { id: 'mediterranean', label: 'Mediterrânea' }
  ];

  const motivations = [
    { id: 'health', label: 'Saúde e Bem-estar', icon: Heart },
    { id: 'appearance', label: 'Aparência Física', icon: Star },
    { id: 'energy', label: 'Mais Energia', icon: Zap },
    { id: 'confidence', label: 'Autoconfiança', icon: Target },
    { id: 'longevity', label: 'Longevidade', icon: Shield },
    { id: 'family', label: 'Exemplo para Família', icon: Users }
  ];

  const handleGoalToggle = (goalId) => {
    setOnboardingData(prev => ({
      ...prev,
      goals: prev.goals.includes(goalId)
        ? prev.goals.filter(id => id !== goalId)
        : [...prev.goals, goalId]
    }));
  };

  const handlePreferenceToggle = (prefId) => {
    setOnboardingData(prev => ({
      ...prev,
      preferences: prev.preferences.includes(prefId)
        ? prev.preferences.filter(id => id !== prefId)
        : [...prev.preferences, prefId]
    }));
  };

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleComplete = async () => {
    try {
      await completeOnboarding(onboardingData);
      // Navigation will be handled by the auth context
    } catch (error) {
      console.error('Error completing onboarding:', error);
    }
  };

  const canProceed = () => {
    switch (steps[currentStep].id) {
      case 'goals':
        return onboardingData.goals.length > 0;
      case 'experience':
        return onboardingData.experience !== '';
      case 'motivation':
        return onboardingData.motivation !== '';
      default:
        return true;
    }
  };

  const progress = ((currentStep + 1) / steps.length) * 100;

  return (
    <div className="min-h-screen bg-evolveyou-gradient flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-2xl"
      >
        <Card className="glass">
          <CardContent className="p-8">
            {/* Progress Bar */}
            <div className="mb-8">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-white/80">
                  Passo {currentStep + 1} de {steps.length}
                </span>
                <span className="text-sm text-white/80">
                  {Math.round(progress)}%
                </span>
              </div>
              <Progress value={progress} className="h-2 bg-white/20" />
            </div>

            {/* Step Content */}
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3 }}
              className="text-center mb-8"
            >
              <h1 className="text-3xl font-bold text-white mb-2">
                {steps[currentStep].title}
              </h1>
              <p className="text-white/80 text-lg">
                {steps[currentStep].subtitle}
              </p>
            </motion.div>

            {/* Step-specific content */}
            <div className="mb-8">
              {steps[currentStep].id === 'welcome' && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                  className="text-center"
                >
                  <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center mx-auto mb-6">
                    <Brain className="w-12 h-12 text-green-600" />
                  </div>
                  <p className="text-white/90 text-lg mb-6">
                    Você está prestes a descobrir o poder da nutrição inteligente 
                    com IA brasileira. Vamos criar um perfil personalizado para você!
                  </p>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="flex items-center text-white/80">
                      <CheckCircle className="w-4 h-4 mr-2 text-green-400" />
                      Anamnese completa
                    </div>
                    <div className="flex items-center text-white/80">
                      <CheckCircle className="w-4 h-4 mr-2 text-green-400" />
                      IA personalizada
                    </div>
                    <div className="flex items-center text-white/80">
                      <CheckCircle className="w-4 h-4 mr-2 text-green-400" />
                      Base TACO brasileira
                    </div>
                    <div className="flex items-center text-white/80">
                      <CheckCircle className="w-4 h-4 mr-2 text-green-400" />
                      Coach virtual 24/7
                    </div>
                  </div>
                </motion.div>
              )}

              {steps[currentStep].id === 'goals' && (
                <div className="grid grid-cols-2 gap-4">
                  {goals.map((goal, index) => (
                    <motion.div
                      key={goal.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.1 }}
                    >
                      <Card
                        className={`cursor-pointer transition-all duration-200 ${
                          onboardingData.goals.includes(goal.id)
                            ? 'bg-white/20 border-white/40'
                            : 'bg-white/10 border-white/20 hover:bg-white/15'
                        }`}
                        onClick={() => handleGoalToggle(goal.id)}
                      >
                        <CardContent className="p-4 text-center">
                          <goal.icon className={`w-8 h-8 mx-auto mb-2 ${goal.color}`} />
                          <p className="text-white font-medium">{goal.label}</p>
                          {onboardingData.goals.includes(goal.id) && (
                            <CheckCircle className="w-5 h-5 text-green-400 mx-auto mt-2" />
                          )}
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                </div>
              )}

              {steps[currentStep].id === 'experience' && (
                <div className="space-y-3">
                  {experiences.map((exp, index) => (
                    <motion.div
                      key={exp.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.1 }}
                    >
                      <Card
                        className={`cursor-pointer transition-all duration-200 ${
                          onboardingData.experience === exp.id
                            ? 'bg-white/20 border-white/40'
                            : 'bg-white/10 border-white/20 hover:bg-white/15'
                        }`}
                        onClick={() => setOnboardingData(prev => ({ ...prev, experience: exp.id }))}
                      >
                        <CardContent className="p-4 flex items-center justify-between">
                          <div>
                            <p className="text-white font-medium">{exp.label}</p>
                            <p className="text-white/70 text-sm">{exp.description}</p>
                          </div>
                          {onboardingData.experience === exp.id && (
                            <CheckCircle className="w-5 h-5 text-green-400" />
                          )}
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                </div>
              )}

              {steps[currentStep].id === 'preferences' && (
                <div className="grid grid-cols-2 gap-3">
                  {preferences.map((pref, index) => (
                    <motion.div
                      key={pref.id}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.3, delay: index * 0.05 }}
                    >
                      <Card
                        className={`cursor-pointer transition-all duration-200 ${
                          onboardingData.preferences.includes(pref.id)
                            ? 'bg-white/20 border-white/40'
                            : 'bg-white/10 border-white/20 hover:bg-white/15'
                        }`}
                        onClick={() => handlePreferenceToggle(pref.id)}
                      >
                        <CardContent className="p-3 text-center">
                          <p className="text-white text-sm">{pref.label}</p>
                          {onboardingData.preferences.includes(pref.id) && (
                            <CheckCircle className="w-4 h-4 text-green-400 mx-auto mt-1" />
                          )}
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                </div>
              )}

              {steps[currentStep].id === 'motivation' && (
                <div className="grid grid-cols-2 gap-4">
                  {motivations.map((motivation, index) => (
                    <motion.div
                      key={motivation.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.1 }}
                    >
                      <Card
                        className={`cursor-pointer transition-all duration-200 ${
                          onboardingData.motivation === motivation.id
                            ? 'bg-white/20 border-white/40'
                            : 'bg-white/10 border-white/20 hover:bg-white/15'
                        }`}
                        onClick={() => setOnboardingData(prev => ({ ...prev, motivation: motivation.id }))}
                      >
                        <CardContent className="p-4 text-center">
                          <motivation.icon className="w-8 h-8 mx-auto mb-2 text-white" />
                          <p className="text-white font-medium">{motivation.label}</p>
                          {onboardingData.motivation === motivation.id && (
                            <CheckCircle className="w-5 h-5 text-green-400 mx-auto mt-2" />
                          )}
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                </div>
              )}

              {steps[currentStep].id === 'complete' && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5 }}
                  className="text-center"
                >
                  <div className="w-24 h-24 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-6">
                    <CheckCircle className="w-12 h-12 text-white" />
                  </div>
                  <p className="text-white/90 text-lg mb-6">
                    Perfeito! Agora vamos fazer sua anamnese nutricional completa 
                    para personalizar ainda mais sua experiência.
                  </p>
                  <div className="bg-white/10 rounded-lg p-4 mb-6">
                    <h3 className="text-white font-semibold mb-2">Seu Perfil:</h3>
                    <div className="text-white/80 text-sm space-y-1">
                      <p>• {onboardingData.goals.length} objetivo(s) selecionado(s)</p>
                      <p>• Nível: {experiences.find(e => e.id === onboardingData.experience)?.label}</p>
                      <p>• {onboardingData.preferences.length} preferência(s) alimentar(es)</p>
                      <p>• Motivação: {motivations.find(m => m.id === onboardingData.motivation)?.label}</p>
                    </div>
                  </div>
                </motion.div>
              )}
            </div>

            {/* Navigation */}
            <div className="flex justify-between">
              <Button
                variant="outline"
                onClick={handleBack}
                disabled={currentStep === 0}
                className="bg-white/10 border-white/20 text-white hover:bg-white/20"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Voltar
              </Button>

              {currentStep < steps.length - 1 ? (
                <Button
                  onClick={handleNext}
                  disabled={!canProceed()}
                  className="bg-white text-green-600 hover:bg-white/90"
                >
                  Próximo
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              ) : (
                <Button
                  onClick={handleComplete}
                  className="bg-white text-green-600 hover:bg-white/90"
                >
                  Continuar para Anamnese
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}

