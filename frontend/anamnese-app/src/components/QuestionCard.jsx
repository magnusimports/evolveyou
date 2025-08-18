import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { AlertCircle, CheckCircle2 } from 'lucide-react';
import { validateAnswer } from '../data/questions';

const QuestionCard = ({ 
  question, 
  answer, 
  onAnswerChange, 
  onNext, 
  onPrevious, 
  isFirst, 
  isLast,
  currentIndex,
  totalQuestions 
}) => {
  const [localAnswer, setLocalAnswer] = useState(answer || '');
  const [validation, setValidation] = useState({ isValid: true, message: '' });
  const [touched, setTouched] = useState(false);

  useEffect(() => {
    setLocalAnswer(answer || '');
  }, [answer]);

  const handleAnswerChange = (value) => {
    setLocalAnswer(value);
    setTouched(true);
    
    const validationResult = validateAnswer(question, value);
    setValidation(validationResult);
    
    onAnswerChange(question.id, value);
  };

  const handleNext = () => {
    setTouched(true);
    const validationResult = validateAnswer(question, localAnswer);
    setValidation(validationResult);
    
    if (validationResult.isValid) {
      onNext();
    }
  };

  const renderInput = () => {
    switch (question.type) {
      case 'text':
        return (
          <div className="space-y-2">
            <Input
              type="text"
              placeholder={question.placeholder}
              value={localAnswer}
              onChange={(e) => handleAnswerChange(e.target.value)}
              className={`w-full ${!validation.isValid && touched ? 'border-red-500' : ''}`}
            />
          </div>
        );

      case 'number':
        return (
          <div className="space-y-2">
            <Input
              type="number"
              placeholder={question.placeholder}
              value={localAnswer}
              onChange={(e) => handleAnswerChange(e.target.value)}
              step={question.validation?.step || 1}
              min={question.validation?.min}
              max={question.validation?.max}
              className={`w-full ${!validation.isValid && touched ? 'border-red-500' : ''}`}
            />
          </div>
        );

      case 'select':
        return (
          <Select value={localAnswer} onValueChange={handleAnswerChange}>
            <SelectTrigger className={`w-full ${!validation.isValid && touched ? 'border-red-500' : ''}`}>
              <SelectValue placeholder="Selecione uma opção" />
            </SelectTrigger>
            <SelectContent>
              {question.options.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        );

      case 'multiselect':
        const selectedValues = Array.isArray(localAnswer) ? localAnswer : 
                              localAnswer ? localAnswer.split(',') : [];
        
        return (
          <div className="space-y-3">
            {question.options.map((option) => (
              <div key={option.value} className="flex items-center space-x-2">
                <Checkbox
                  id={option.value}
                  checked={selectedValues.includes(option.value)}
                  onCheckedChange={(checked) => {
                    let newValues;
                    if (checked) {
                      newValues = [...selectedValues.filter(v => v !== 'nenhuma'), option.value];
                      if (option.value === 'nenhuma') {
                        newValues = ['nenhuma'];
                      }
                    } else {
                      newValues = selectedValues.filter(v => v !== option.value);
                    }
                    handleAnswerChange(newValues.join(','));
                  }}
                />
                <Label htmlFor={option.value} className="text-sm font-normal cursor-pointer">
                  {option.label}
                </Label>
              </div>
            ))}
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader className="text-center">
        <div className="flex items-center justify-between mb-4">
          <div className="text-sm text-muted-foreground">
            Pergunta {currentIndex + 1} de {totalQuestions}
          </div>
          <div className="text-2xl">
            {question.category === 'dados_pessoais' && '👤'}
            {question.category === 'medidas_corporais' && '📏'}
            {question.category === 'objetivos' && '🎯'}
            {question.category === 'atividade_fisica' && '💪'}
            {question.category === 'habitos_alimentares' && '🍽️'}
            {question.category === 'restricoes_alergias' && '⚠️'}
            {question.category === 'estilo_vida' && '🌙'}
            {question.category === 'saude_medicamentos' && '💊'}
          </div>
        </div>
        
        {/* Barra de Progresso */}
        <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
          <div 
            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${((currentIndex + 1) / totalQuestions) * 100}%` }}
          ></div>
        </div>

        <CardTitle className="text-xl font-semibold text-left">
          {question.question}
          {question.required && <span className="text-red-500 ml-1">*</span>}
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-6">
        {renderInput()}

        {/* Mensagem de Validação */}
        {touched && !validation.isValid && (
          <div className="flex items-center space-x-2 text-red-600 text-sm">
            <AlertCircle className="h-4 w-4" />
            <span>{validation.message}</span>
          </div>
        )}

        {/* Mensagem de Sucesso */}
        {touched && validation.isValid && localAnswer && (
          <div className="flex items-center space-x-2 text-green-600 text-sm">
            <CheckCircle2 className="h-4 w-4" />
            <span>Resposta válida</span>
          </div>
        )}

        {/* Botões de Navegação */}
        <div className="flex justify-between pt-4">
          <Button
            variant="outline"
            onClick={onPrevious}
            disabled={isFirst}
            className="px-6"
          >
            Anterior
          </Button>

          <Button
            onClick={handleNext}
            disabled={!validation.isValid && touched}
            className="px-6"
          >
            {isLast ? 'Finalizar' : 'Próxima'}
          </Button>
        </div>

        {/* Informação sobre obrigatoriedade */}
        {question.required && (
          <p className="text-xs text-muted-foreground text-center">
            * Campo obrigatório
          </p>
        )}
      </CardContent>
    </Card>
  );
};

export default QuestionCard;

