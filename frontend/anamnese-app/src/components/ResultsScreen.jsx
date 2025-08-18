import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  User, 
  Target, 
  Activity, 
  Heart, 
  Droplets, 
  Calculator,
  Download,
  Share2,
  RefreshCw,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import apiService from '../services/api';

const ResultsScreen = ({ answers, onRestart, onSaveProfile }) => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    calculateProfile();
  }, [answers]);

  const calculateProfile = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Tentar usar API real primeiro
      const userId = 'demo_user_' + Date.now();
      const result = await apiService.calculateProfile(userId, answers);
      
      if (result.success) {
        setProfile(result.data.profile);
      } else {
        // Fallback para dados mock se API falhar
        console.log('API falhou, usando dados mock:', result.error);
        const mockProfile = apiService.generateMockProfile(answers);
        setProfile(mockProfile.profile);
      }
    } catch (error) {
      console.error('Erro ao calcular perfil:', error);
      // Fallback para dados mock
      const mockProfile = apiService.generateMockProfile(answers);
      setProfile(mockProfile.profile);
    }
    
    setLoading(false);
  };

  const handleSave = async () => {
    try {
      setLoading(true);
      
      // Tentar salvar via API
      const userId = 'demo_user_' + Date.now();
      const result = await apiService.updateProfile(userId, profile);
      
      if (result.success) {
        onSaveProfile(profile);
        alert('Perfil salvo com sucesso!');
      } else {
        // Fallback para salvamento local
        onSaveProfile(profile);
        alert('Perfil salvo localmente (API indisponível)');
      }
    } catch (error) {
      console.error('Erro ao salvar perfil:', error);
      onSaveProfile(profile);
      alert('Perfil salvo localmente');
    } finally {
      setLoading(false);
    }
  };

  const handleShare = () => {
    const shareData = {
      title: 'Meu Perfil Nutricional - EvolveYou',
      text: `Confira meu perfil nutricional personalizado! IMC: ${profile?.calculos_metabolicos?.imc}, TDEE: ${profile?.calculos_metabolicos?.tdee} kcal`,
      url: window.location.href
    };

    if (navigator.share) {
      navigator.share(shareData);
    } else {
      // Fallback para clipboard
      navigator.clipboard.writeText(`${shareData.title}\n${shareData.text}\n${shareData.url}`);
      alert('Link copiado para a área de transferência!');
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen space-y-4">
        <RefreshCw className="h-8 w-8 animate-spin text-blue-600" />
        <h2 className="text-xl font-semibold">Calculando seu perfil nutricional...</h2>
        <p className="text-muted-foreground text-center max-w-md">
          Estamos analisando suas respostas e criando um perfil personalizado com base em dados científicos.
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen space-y-4">
        <AlertCircle className="h-8 w-8 text-red-500" />
        <h2 className="text-xl font-semibold">Erro ao calcular perfil</h2>
        <p className="text-muted-foreground text-center max-w-md">{error}</p>
        <Button onClick={calculateProfile}>Tentar Novamente</Button>
      </div>
    );
  }

  if (!profile) return null;

  const getIMCInfo = (imc) => {
    if (imc < 18.5) return { category: 'Abaixo do peso', color: 'bg-blue-500' };
    if (imc < 25) return { category: 'Peso normal', color: 'bg-green-500' };
    if (imc < 30) return { category: 'Sobrepeso', color: 'bg-yellow-500' };
    return { category: 'Obesidade', color: 'bg-red-500' };
  };

  const imcInfo = getIMCInfo(profile.calculos_metabolicos?.imc || 0);

  return (
    <div className="max-w-4xl mx-auto space-y-6 p-4">
      {/* Header */}
      <Card>
        <CardHeader className="text-center">
          <div className="flex items-center justify-center mb-4">
            <CheckCircle2 className="h-12 w-12 text-green-500" />
          </div>
          <CardTitle className="text-2xl">Anamnese Concluída!</CardTitle>
          <p className="text-muted-foreground">
            Seu perfil nutricional personalizado está pronto
          </p>
        </CardHeader>
      </Card>

      {/* Dados Básicos */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Dados Pessoais
          </CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <div className="text-sm text-muted-foreground">Nome</div>
            <div className="font-semibold">{profile.dados_basicos?.nome || 'Usuário'}</div>
          </div>
          <div>
            <div className="text-sm text-muted-foreground">Idade</div>
            <div className="font-semibold">{profile.dados_basicos?.idade || 0} anos</div>
          </div>
          <div>
            <div className="text-sm text-muted-foreground">Peso</div>
            <div className="font-semibold">{profile.dados_basicos?.peso || 0} kg</div>
          </div>
          <div>
            <div className="text-sm text-muted-foreground">Altura</div>
            <div className="font-semibold">{profile.dados_basicos?.altura || 0} cm</div>
          </div>
        </CardContent>
      </Card>

      {/* Cálculos Metabólicos */}
      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calculator className="h-5 w-5" />
              Cálculos Metabólicos
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center">
              <span>IMC</span>
              <div className="flex items-center gap-2">
                <Badge className={imcInfo.color}>{profile.calculos_metabolicos?.imc || 0}</Badge>
                <span className="text-sm text-muted-foreground">{imcInfo.category}</span>
              </div>
            </div>
            <Separator />
            <div className="flex justify-between">
              <span>TMB (Taxa Metabólica Basal)</span>
              <span className="font-semibold">{profile.calculos_metabolicos?.tmb || 0} kcal/dia</span>
            </div>
            <div className="flex justify-between">
              <span>TDEE (Gasto Energético Total)</span>
              <span className="font-semibold">{profile.calculos_metabolicos?.tdee || 0} kcal/dia</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5" />
              Macronutrientes
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between">
              <span>Proteína</span>
              <span className="font-semibold">{profile.macronutrientes?.proteina || 0}g</span>
            </div>
            <div className="flex justify-between">
              <span>Carboidrato</span>
              <span className="font-semibold">{profile.macronutrientes?.carboidrato || 0}g</span>
            </div>
            <div className="flex justify-between">
              <span>Gordura</span>
              <span className="font-semibold">{profile.macronutrientes?.gordura || 0}g</span>
            </div>
            <Separator />
            <div className="flex justify-between">
              <span className="font-semibold">Total de Calorias</span>
              <span className="font-semibold text-blue-600">{profile.macronutrientes?.calorias || 0} kcal</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Hidratação e Atividade */}
      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Droplets className="h-5 w-5" />
              Hidratação
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600">{profile.hidratacao?.agua_recomendada || 0}L</div>
              <div className="text-sm text-muted-foreground">por dia</div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Nível de Atividade
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Badge variant="outline" className="w-full justify-center py-2">
              {(profile.estilo_vida?.nivel_atividade || '').replace('_', ' ').toUpperCase()}
            </Badge>
          </CardContent>
        </Card>
      </div>

      {/* Restrições e Alergias */}
      {((profile.restricoes?.alimentares?.length > 0) || (profile.restricoes?.alergias?.length > 0)) && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Heart className="h-5 w-5" />
              Restrições e Alergias
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {profile.restricoes?.alimentares?.length > 0 && (
              <div>
                <div className="text-sm font-medium mb-2">Restrições Alimentares:</div>
                <div className="flex flex-wrap gap-2">
                  {profile.restricoes.alimentares.map((restricao, index) => (
                    <Badge key={index} variant="secondary">
                      {restricao.replace('_', ' ')}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
            {profile.restricoes?.alergias?.length > 0 && (
              <div>
                <div className="text-sm font-medium mb-2">Alergias:</div>
                <div className="flex flex-wrap gap-2">
                  {profile.restricoes.alergias.map((alergia, index) => (
                    <Badge key={index} variant="destructive">
                      {alergia}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Recomendações */}
      {profile.recomendacoes?.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Recomendações Personalizadas</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {profile.recomendacoes.map((recomendacao, index) => (
                <li key={index} className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                  <span className="text-sm">{recomendacao}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {/* Ações */}
      <div className="flex flex-col sm:flex-row gap-4">
        <Button onClick={handleSave} className="flex-1" disabled={loading}>
          <Download className="h-4 w-4 mr-2" />
          {loading ? 'Salvando...' : 'Salvar Perfil'}
        </Button>
        <Button variant="outline" onClick={handleShare} className="flex-1">
          <Share2 className="h-4 w-4 mr-2" />
          Compartilhar
        </Button>
        <Button variant="outline" onClick={onRestart} className="flex-1">
          <RefreshCw className="h-4 w-4 mr-2" />
          Refazer Anamnese
        </Button>
      </div>
    </div>
  );
};

export default ResultsScreen;

