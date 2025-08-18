import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, Circle, Clock } from 'lucide-react';
import { categories } from '../data/questions';

const ProgressSummary = ({ answers, currentQuestionIndex, totalQuestions }) => {
  // Calcular progresso por categoria
  const categoryProgress = Object.keys(categories).map(categoryKey => {
    const categoryQuestions = Array.from({ length: totalQuestions }, (_, i) => i + 1)
      .filter(id => {
        // Aqui você precisaria mapear o ID para a categoria
        // Por simplicidade, vamos usar uma lógica baseada em ranges
        if (categoryKey === 'dados_pessoais') return id >= 1 && id <= 3;
        if (categoryKey === 'medidas_corporais') return id >= 4 && id <= 6;
        if (categoryKey === 'objetivos') return id >= 7 && id <= 9;
        if (categoryKey === 'atividade_fisica') return id >= 10 && id <= 11;
        if (categoryKey === 'habitos_alimentares') return id >= 12 && id <= 14;
        if (categoryKey === 'restricoes_alergias') return id >= 15 && id <= 16;
        if (categoryKey === 'estilo_vida') return id >= 17 && id <= 20;
        if (categoryKey === 'saude_medicamentos') return id >= 21 && id <= 22;
        return false;
      });

    const answeredQuestions = categoryQuestions.filter(id => answers[id]);
    const isCompleted = answeredQuestions.length === categoryQuestions.length;
    const isInProgress = answeredQuestions.length > 0 && !isCompleted;
    const isCurrent = categoryQuestions.includes(currentQuestionIndex + 1);

    return {
      key: categoryKey,
      ...categories[categoryKey],
      total: categoryQuestions.length,
      answered: answeredQuestions.length,
      isCompleted,
      isInProgress,
      isCurrent
    };
  });

  const totalAnswered = Object.keys(answers).length;
  const progressPercentage = Math.round((totalAnswered / totalQuestions) * 100);

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <Clock className="h-5 w-5" />
          Progresso da Anamnese
        </CardTitle>
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Progresso geral</span>
            <span className="font-semibold">{progressPercentage}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${progressPercentage}%` }}
            ></div>
          </div>
          <div className="text-xs text-muted-foreground text-center">
            {totalAnswered} de {totalQuestions} perguntas respondidas
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-3">
        {categoryProgress.map((category) => (
          <div 
            key={category.key}
            className={`flex items-center justify-between p-3 rounded-lg border transition-all ${
              category.isCurrent ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
            }`}
          >
            <div className="flex items-center gap-3">
              <span className="text-lg">{category.icon}</span>
              <div>
                <div className="font-medium text-sm">{category.title}</div>
                <div className="text-xs text-muted-foreground">
                  {category.answered}/{category.total} perguntas
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              {category.isCompleted && (
                <Badge variant="default" className="bg-green-500">
                  <CheckCircle2 className="h-3 w-3 mr-1" />
                  Completo
                </Badge>
              )}
              {category.isInProgress && !category.isCompleted && (
                <Badge variant="secondary">
                  <Clock className="h-3 w-3 mr-1" />
                  Em andamento
                </Badge>
              )}
              {!category.isInProgress && !category.isCompleted && (
                <Circle className="h-4 w-4 text-gray-400" />
              )}
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
};

export default ProgressSummary;

