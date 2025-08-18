import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowRight, 
  ArrowLeft,
  CheckCircle,
  Brain,
  Target,
  Zap,
  Heart,
  Shield,
  TrendingDown,
  Users,
  Star,
  Calculator,
  Activity
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAuth } from '../contexts/AuthContext';
import { 
  anamneseQuestions, 
  calculateBMR, 
  calculateTDEE, 
  calculateBMI, 
  classifyBMI,
  calculateMacros 
} from '../data/anamneseQuestions';

export default function AnamnesesPage() {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState({});
  const [isCompleting, setIsCompleting] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [calculatedResults, setCalculatedResults] = useState(null);
  
  const { completeAnamnese } = useAuth();

  const iconMap = {
    TrendingDown,
    Target,
    Shield,
    Zap,
    Heart,
    Users,
    Star
  };

  useEffect(() => {
    // Calculate results when we have enough data
    if (answers.personal_info && answers.activity_level && answers.primary_goal) {
      calculateNutritionalProfile();
    }
  }, [answers]);

  const calculateNutritionalProfile = () => {
    const { age, gender, height, weight } = answers.personal_info || {};
    const activityLevel = answers.activity_level;
    const primaryGoal = answers.primary_goal;
    
    if (!age || !gender || !height || !weight || !activityLevel || !primaryGoal) {
      return;
    }

    const bmr = calculateBMR(weight, height, age, gender);
    const tdee = calculateTDEE(bmr, activityLevel);
    const bmi = calculateBMI(weight, height);
    const bmiClassification = classifyBMI(bmi);
    
    // Adjust calories based on goal
    let targetCalories = tdee;
    switch (primaryGoal) {
      case 'weight_loss':
        targetCalories = tdee - 500; // 500 cal deficit
        break;
      case 'muscle_gain':
        targetCalories = tdee + 300; // 300 cal surplus
        break;
      case 'maintenance':
        targetCalories = tdee;
        break;
      case 'performance':
        targetCalories = tdee + 200; // Slight surplus for performance
        break;
    }

    const macros = calculateMacros(targetCalories, primaryGoal);
    
    setCalculatedResults({
      bmr: Math.round(bmr),
      tdee: Math.round(tdee),
      targetCalories: Math.round(targetCalories),
      bmi: Math.round(bmi * 10) / 10,
      bmiClassification,
      macros,
      waterIntake: Math.round(weight * 35), // 35ml per kg
      proteinPerKg: Math.round((macros.protein.grams / weight) * 10) / 10
    });
  };

  const handleAnswerChange = (questionId, value) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: value
    }));
  };

  const handleFormFieldChange = (questionId, fieldId, value) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: {
        ...prev[questionId],
        [fieldId]: value
      }
    }));
  };

  const handleMultipleChoice = (questionId, optionId) => {
    setAnswers(prev => {
      const currentAnswers = prev[questionId] || [];
      const isSelected = currentAnswers.includes(optionId);
      
      if (isSelected) {
        return {
          ...prev,
          [questionId]: currentAnswers.filter(id => id !== optionId)
        };
      } else {
        return {
          ...prev,
          [questionId]: [...currentAnswers, optionId]
        };
      }
    });
  };

  const canProceed = () => {
    const question = anamneseQuestions[currentQuestion];
    const answer = answers[question.id];
    
    if (question.conditional) {
      const dependentAnswer = answers[question.conditional.dependsOn];
      const shouldShow = question.conditional.showIf.some(value => 
        Array.isArray(dependentAnswer) ? dependentAnswer.includes(value) : dependentAnswer === value
      );
      if (!shouldShow) return true; // Skip conditional questions that shouldn't show
    }
    
    switch (question.type) {
      case 'form':
        return question.fields.every(field => 
          !field.required || (answer && answer[field.id])
        );
      case 'single_choice':
        return !!answer;
      case 'multiple_choice':
        return answer && answer.length > 0;
      case 'text_area':
        return !question.required || (answer && answer.trim().length > 0);
      default:
        return true;
    }
  };

  const shouldShowQuestion = (question) => {
    if (!question.conditional) return true;
    
    const dependentAnswer = answers[question.conditional.dependsOn];
    return question.conditional.showIf.some(value => 
      Array.isArray(dependentAnswer) ? dependentAnswer.includes(value) : dependentAnswer === value
    );
  };

  const handleNext = () => {
    if (currentQuestion < anamneseQuestions.length - 1) {
      // Find next question that should be shown
      let nextQuestion = currentQuestion + 1;
      while (nextQuestion < anamneseQuestions.length && !shouldShowQuestion(anamneseQuestions[nextQuestion])) {
        nextQuestion++;
      }
      
      if (nextQuestion < anamneseQuestions.length) {
        setCurrentQuestion(nextQuestion);
      } else {
        handleComplete();
      }
    } else {
      handleComplete();
    }
  };

  const handleBack = () => {
    if (currentQuestion > 0) {
      // Find previous question that should be shown
      let prevQuestion = currentQuestion - 1;
      while (prevQuestion >= 0 && !shouldShowQuestion(anamneseQuestions[prevQuestion])) {
        prevQuestion--;
      }
      
      if (prevQuestion >= 0) {
        setCurrentQuestion(prevQuestion);
      }
    }
  };

  const handleComplete = async () => {
    setIsCompleting(true);
    
    try {
      const anamneseData = {
        answers,
        calculatedResults,
        completedAt: new Date().toISOString()
      };
      
      await completeAnamnese(anamneseData);
      setShowResults(true);
    } catch (error) {
      console.error('Error completing anamnese:', error);
    } finally {
      setIsCompleting(false);
    }
  };

  const progress = ((currentQuestion + 1) / anamneseQuestions.length) * 100;
  const question = anamneseQuestions[currentQuestion];

  if (showResults && calculatedResults) {
    return (
      <div className="min-h-screen bg-evolveyou-gradient flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-4xl"
        >
          <Card className="glass">
            <CardHeader className="text-center">
              <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-8 h-8 text-white" />
              </div>
              <CardTitle className="text-3xl text-white mb-2">
                Anamnese Concluída!
              </CardTitle>
              <p className="text-white/80 text-lg">
                Seu perfil nutricional personalizado está pronto
              </p>
            </CardHeader>
            
            <CardContent className="p-8">
              <div className="grid md:grid-cols-2 gap-6 mb-8">
                {/* Métricas Básicas */}
                <Card className="bg-white/10 border-white/20">
                  <CardContent className="p-6">
                    <h3 className="text-white font-semibold mb-4 flex items-center">
                      <Calculator className="w-5 h-5 mr-2" />
                      Métricas Básicas
                    </h3>
                    <div className="space-y-3 text-white/90">
                      <div className="flex justify-between">
                        <span>IMC:</span>
                        <span className={`font-semibold ${calculatedResults.bmiClassification.color}`}>
                          {calculatedResults.bmi} ({calculatedResults.bmiClassification.category})
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Taxa Metabólica Basal:</span>
                        <span className="font-semibold">{calculatedResults.bmr} kcal</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Gasto Energético Total:</span>
                        <span className="font-semibold">{calculatedResults.tdee} kcal</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Calorias Alvo:</span>
                        <span className="font-semibold text-green-400">{calculatedResults.targetCalories} kcal</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Macronutrientes */}
                <Card className="bg-white/10 border-white/20">
                  <CardContent className="p-6">
                    <h3 className="text-white font-semibold mb-4 flex items-center">
                      <Target className="w-5 h-5 mr-2" />
                      Macronutrientes
                    </h3>
                    <div className="space-y-3 text-white/90">
                      <div className="flex justify-between">
                        <span>Proteínas:</span>
                        <span className="font-semibold text-blue-400">
                          {calculatedResults.macros.protein.grams}g ({calculatedResults.proteinPerKg}g/kg)
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Carboidratos:</span>
                        <span className="font-semibold text-yellow-400">
                          {calculatedResults.macros.carbs.grams}g
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Gorduras:</span>
                        <span className="font-semibold text-orange-400">
                          {calculatedResults.macros.fat.grams}g
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Água recomendada:</span>
                        <span className="font-semibold text-cyan-400">
                          {calculatedResults.waterIntake}ml/dia
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div className="text-center">
                <p className="text-white/90 text-lg mb-6">
                  Agora você pode acessar seu dashboard personalizado com recomendações 
                  baseadas na Base TACO brasileira e conversar com o Coach Virtual EVO!
                </p>
                
                <Button
                  size="lg"
                  className="bg-white text-green-600 hover:bg-white/90 text-lg px-8 py-4"
                  onClick={() => window.location.href = '/dashboard'}
                >
                  Ir para o Dashboard
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-evolveyou-gradient flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-3xl"
      >
        <Card className="glass">
          <CardContent className="p-8">
            {/* Progress Bar */}
            <div className="mb-8">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-white/80">
                  Pergunta {currentQuestion + 1} de {anamneseQuestions.length}
                </span>
                <span className="text-sm text-white/80">
                  {Math.round(progress)}%
                </span>
              </div>
              <Progress value={progress} className="h-2 bg-white/20" />
            </div>

            {/* Question Content */}
            <AnimatePresence mode="wait">
              <motion.div
                key={currentQuestion}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
                className="mb-8"
              >
                <div className="text-center mb-8">
                  <h1 className="text-2xl md:text-3xl font-bold text-white mb-2">
                    {question.title}
                  </h1>
                  {question.subtitle && (
                    <p className="text-white/80 text-lg">
                      {question.subtitle}
                    </p>
                  )}
                </div>

                {/* Question Type Rendering */}
                <div className="space-y-4">
                  {question.type === 'form' && (
                    <div className="grid gap-4">
                      {question.fields.map((field) => (
                        <div key={field.id} className="space-y-2">
                          <Label htmlFor={field.id} className="text-white">
                            {field.label}
                            {field.required && <span className="text-red-400 ml-1">*</span>}
                          </Label>
                          
                          {field.type === 'select' ? (
                            <Select
                              value={answers[question.id]?.[field.id] || ''}
                              onValueChange={(value) => handleFormFieldChange(question.id, field.id, value)}
                            >
                              <SelectTrigger className="bg-white/10 border-white/20 text-white">
                                <SelectValue placeholder="Selecione..." />
                              </SelectTrigger>
                              <SelectContent>
                                {field.options.map((option) => (
                                  <SelectItem key={option.value} value={option.value}>
                                    {option.label}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          ) : (
                            <Input
                              id={field.id}
                              type={field.type}
                              placeholder={field.placeholder}
                              min={field.min}
                              max={field.max}
                              step={field.step}
                              value={answers[question.id]?.[field.id] || ''}
                              onChange={(e) => handleFormFieldChange(question.id, field.id, e.target.value)}
                              className="bg-white/10 border-white/20 text-white placeholder:text-white/60"
                            />
                          )}
                        </div>
                      ))}
                    </div>
                  )}

                  {question.type === 'single_choice' && (
                    <div className="space-y-3">
                      {question.options.map((option) => {
                        const IconComponent = option.icon ? iconMap[option.icon] : null;
                        return (
                          <Card
                            key={option.id}
                            className={`cursor-pointer transition-all duration-200 ${
                              answers[question.id] === option.id
                                ? 'bg-white/20 border-white/40'
                                : 'bg-white/10 border-white/20 hover:bg-white/15'
                            }`}
                            onClick={() => handleAnswerChange(question.id, option.id)}
                          >
                            <CardContent className="p-4 flex items-center justify-between">
                              <div className="flex items-center space-x-3">
                                {IconComponent && (
                                  <IconComponent className="w-6 h-6 text-white" />
                                )}
                                <div>
                                  <p className="text-white font-medium">{option.label}</p>
                                  {option.description && (
                                    <p className="text-white/70 text-sm">{option.description}</p>
                                  )}
                                </div>
                              </div>
                              {answers[question.id] === option.id && (
                                <CheckCircle className="w-5 h-5 text-green-400" />
                              )}
                            </CardContent>
                          </Card>
                        );
                      })}
                    </div>
                  )}

                  {question.type === 'multiple_choice' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {question.options.map((option) => (
                        <Card
                          key={option.id}
                          className={`cursor-pointer transition-all duration-200 ${
                            answers[question.id]?.includes(option.id)
                              ? 'bg-white/20 border-white/40'
                              : 'bg-white/10 border-white/20 hover:bg-white/15'
                          }`}
                          onClick={() => handleMultipleChoice(question.id, option.id)}
                        >
                          <CardContent className="p-3 text-center">
                            <p className="text-white text-sm">{option.label}</p>
                            {answers[question.id]?.includes(option.id) && (
                              <CheckCircle className="w-4 h-4 text-green-400 mx-auto mt-2" />
                            )}
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}

                  {question.type === 'text_area' && (
                    <Textarea
                      placeholder={question.placeholder}
                      value={answers[question.id] || ''}
                      onChange={(e) => handleAnswerChange(question.id, e.target.value)}
                      className="bg-white/10 border-white/20 text-white placeholder:text-white/60 min-h-[100px]"
                    />
                  )}
                </div>
              </motion.div>
            </AnimatePresence>

            {/* Navigation */}
            <div className="flex justify-between">
              <Button
                variant="outline"
                onClick={handleBack}
                disabled={currentQuestion === 0}
                className="bg-white/10 border-white/20 text-white hover:bg-white/20"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Voltar
              </Button>

              <Button
                onClick={handleNext}
                disabled={!canProceed() || isCompleting}
                className="bg-white text-green-600 hover:bg-white/90"
              >
                {isCompleting ? (
                  <>
                    <div className="spinner w-4 h-4 mr-2" />
                    Finalizando...
                  </>
                ) : currentQuestion === anamneseQuestions.length - 1 ? (
                  <>
                    Finalizar Anamnese
                    <CheckCircle className="w-4 h-4 ml-2" />
                  </>
                ) : (
                  <>
                    Próxima
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}

