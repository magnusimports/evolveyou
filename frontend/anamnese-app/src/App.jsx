import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Brain, ArrowRight, Users, Target, Activity } from 'lucide-react';
import QuestionCard from './components/QuestionCard';
import ProgressSummary from './components/ProgressSummary';
import ResultsScreen from './components/ResultsScreen';
import { anamneseQuestions, shouldShowQuestion } from './data/questions';
import './App.css';

function App() {
  const [currentScreen, setCurrentScreen] = useState('welcome'); // welcome, questionnaire, results
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [visibleQuestions, setVisibleQuestions] = useState([]);

  useEffect(() => {
    // Filtrar perguntas visíveis baseado nas respostas
    const visible = anamneseQuestions.filter(question => 
      shouldShowQuestion(question, answers)
    );
    setVisibleQuestions(visible);
  }, [answers]);

  const handleStartQuestionnaire = () => {
    setCurrentScreen('questionnaire');
    setCurrentQuestionIndex(0);
    setAnswers({});
  };

  const handleAnswerChange = (questionId, answer) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: answer
    }));
  };

  const handleNext = () => {
    if (currentQuestionIndex < visibleQuestions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    } else {
      // Última pergunta - ir para resultados
      setCurrentScreen('results');
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
    }
  };

  const handleRestart = () => {
    setCurrentScreen('welcome');
    setCurrentQuestionIndex(0);
    setAnswers({});
  };

  const handleSaveProfile = (profile) => {
    // Aqui você salvaria o perfil na API
    console.log('Salvando perfil:', profile);
    alert('Perfil salvo com sucesso!');
  };

  if (currentScreen === 'welcome') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <Card className="w-full max-w-2xl">
          <CardHeader className="text-center space-y-4">
            <div className="mx-auto w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center">
              <Brain className="h-8 w-8 text-white" />
            </div>
            <CardTitle className="text-3xl font-bold">
              Anamnese Inteligente
            </CardTitle>
            <p className="text-lg text-muted-foreground">
              Sistema avançado de avaliação nutricional personalizada
            </p>
          </CardHeader>

          <CardContent className="space-y-6">
            <div className="grid md:grid-cols-3 gap-4">
              <div className="text-center p-4 rounded-lg bg-blue-50">
                <Users className="h-8 w-8 mx-auto mb-2 text-blue-600" />
                <h3 className="font-semibold">Personalizado</h3>
                <p className="text-sm text-muted-foreground">
                  22 perguntas científicas adaptadas ao seu perfil
                </p>
              </div>
              <div className="text-center p-4 rounded-lg bg-green-50">
                <Target className="h-8 w-8 mx-auto mb-2 text-green-600" />
                <h3 className="font-semibold">Preciso</h3>
                <p className="text-sm text-muted-foreground">
                  Cálculos metabólicos baseados em evidências
                </p>
              </div>
              <div className="text-center p-4 rounded-lg bg-purple-50">
                <Activity className="h-8 w-8 mx-auto mb-2 text-purple-600" />
                <h3 className="font-semibold">Completo</h3>
                <p className="text-sm text-muted-foreground">
                  Perfil nutricional completo em minutos
                </p>
              </div>
            </div>

            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <h4 className="font-semibold text-yellow-800 mb-2">
                ⏱️ Tempo estimado: 5-8 minutos
              </h4>
              <ul className="text-sm text-yellow-700 space-y-1">
                <li>• Dados pessoais e medidas corporais</li>
                <li>• Objetivos e nível de atividade física</li>
                <li>• Hábitos alimentares e estilo de vida</li>
                <li>• Restrições alimentares e condições de saúde</li>
              </ul>
            </div>

            <Button 
              onClick={handleStartQuestionnaire}
              className="w-full py-6 text-lg"
              size="lg"
            >
              Iniciar Anamnese
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>

            <p className="text-xs text-center text-muted-foreground">
              Suas informações são privadas e seguras. Utilizamos criptografia de nível bancário.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (currentScreen === 'questionnaire') {
    const currentQuestion = visibleQuestions[currentQuestionIndex];
    
    if (!currentQuestion) {
      return (
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-xl font-semibold mb-2">Carregando pergunta...</h2>
          </div>
        </div>
      );
    }

    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-3 gap-6">
            {/* Pergunta Principal */}
            <div className="lg:col-span-2">
              <QuestionCard
                question={currentQuestion}
                answer={answers[currentQuestion.id]}
                onAnswerChange={handleAnswerChange}
                onNext={handleNext}
                onPrevious={handlePrevious}
                isFirst={currentQuestionIndex === 0}
                isLast={currentQuestionIndex === visibleQuestions.length - 1}
                currentIndex={currentQuestionIndex}
                totalQuestions={visibleQuestions.length}
              />
            </div>

            {/* Resumo de Progresso */}
            <div className="lg:col-span-1">
              <ProgressSummary
                answers={answers}
                currentQuestionIndex={currentQuestionIndex}
                totalQuestions={visibleQuestions.length}
              />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (currentScreen === 'results') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
        <ResultsScreen
          answers={answers}
          onRestart={handleRestart}
          onSaveProfile={handleSaveProfile}
        />
      </div>
    );
  }

  return null;
}

export default App;
