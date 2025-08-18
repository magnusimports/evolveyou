import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import NotificationSettings from '../notifications/NotificationSettings';
import CoachButton from '../coach/CoachButton';
import CoachModal from '../coach/CoachModal';
import { 
  User, 
  Activity, 
  Target, 
  TrendingUp, 
  Calendar, 
  Clock, 
  Droplets, 
  Zap,
  Apple,
  BarChart3,
  Settings,
  LogOut,
  Wifi,
  WifiOff,
  RefreshCw,
  CheckCircle,
  AlertCircle,
  Bell,
  Bot
} from 'lucide-react';

const Dashboard = () => {
  const { currentUser, logout, syncStatus, loadNutritionalProfile, loadAnamneseData } = useAuth();
  const [activeTab, setActiveTab] = useState('hoje');
  const [nutritionalProfile, setNutritionalProfile] = useState(null);
  const [anamneseData, setAnamneseData] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // Estado do Coach EVO
  const [isCoachOpen, setIsCoachOpen] = useState(false);

  // Carregar dados do usuário
  useEffect(() => {
    const loadUserData = async () => {
      try {
        setLoading(true);
        
        // Carregar perfil nutricional
        const profile = await loadNutritionalProfile();
        if (profile) {
          setNutritionalProfile(profile);
        }
        
        // Carregar dados da anamnese
        const anamnese = await loadAnamneseData();
        if (anamnese) {
          setAnamneseData(anamnese);
        }
        
      } catch (error) {
        console.error('Erro ao carregar dados:', error);
      } finally {
        setLoading(false);
      }
    };

    if (currentUser) {
      loadUserData();
    }
  }, [currentUser, loadNutritionalProfile, loadAnamneseData]);

  // Dados mockados para demonstração
  const mockData = {
    today: {
      calories: {
        consumed: 1247,
        target: nutritionalProfile?.tdee || 2100,
        remaining: (nutritionalProfile?.tdee || 2100) - 1247
      },
      water: {
        consumed: 1.8,
        target: 2.5
      },
      weight: {
        current: nutritionalProfile?.weight || 70,
        target: (nutritionalProfile?.weight || 70) - 5,
        change: -0.3
      },
      meals: [
        { id: 1, name: 'Café da Manhã', time: '08:00', calories: 387, status: 'completed' },
        { id: 2, name: 'Lanche da Manhã', time: '10:30', calories: 156, status: 'completed' },
        { id: 3, name: 'Almoço', time: '12:30', calories: 704, status: 'completed' },
        { id: 4, name: 'Lanche da Tarde', time: '15:30', calories: 203, status: 'pending' },
        { id: 5, name: 'Jantar', time: '19:00', calories: 542, status: 'pending' },
        { id: 6, name: 'Ceia', time: '21:30', calories: 108, status: 'pending' }
      ],
      activities: [
        { id: 1, name: 'Caminhada', duration: 30, calories: 150, time: '07:00' },
        { id: 2, name: 'Treino de Força', duration: 45, calories: 280, time: '18:00' }
      ]
    },
    progress: {
      weightHistory: [
        { date: '2025-01-01', weight: 75.2 },
        { date: '2025-01-08', weight: 74.8 },
        { date: '2025-01-15', weight: 74.3 },
        { date: '2025-01-22', weight: 73.9 },
        { date: '2025-01-29', weight: 73.5 }
      ],
      weeklyStats: {
        caloriesAvg: 1890,
        waterAvg: 2.1,
        exerciseDays: 5,
        goalCompliance: 87
      }
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
    }
  };

  const getSyncStatusIcon = () => {
    if (!syncStatus.isOnline) {
      return <WifiOff className="w-4 h-4 text-red-500" />;
    }
    if (syncStatus.syncInProgress) {
      return <RefreshCw className="w-4 h-4 text-blue-500 animate-spin" />;
    }
    if (syncStatus.pendingItems > 0) {
      return <AlertCircle className="w-4 h-4 text-yellow-500" />;
    }
    return <CheckCircle className="w-4 h-4 text-green-500" />;
  };

  const getSyncStatusText = () => {
    if (!syncStatus.isOnline) return 'Offline';
    if (syncStatus.syncInProgress) return 'Sincronizando...';
    if (syncStatus.pendingItems > 0) return `${syncStatus.pendingItems} pendentes`;
    return 'Sincronizado';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-green-500 rounded-full flex items-center justify-center mb-4 mx-auto animate-pulse">
            <span className="text-white text-2xl font-bold">E</span>
          </div>
          <p className="text-gray-600">Carregando dados...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-green-500 rounded-full flex items-center justify-center">
                <span className="text-white text-lg font-bold">E</span>
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">EvolveYou</h1>
                <p className="text-sm text-gray-500">Olá, {currentUser?.displayName || currentUser?.email}</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              {/* Status de Sincronização */}
              <div className="flex items-center space-x-2 px-3 py-1 bg-gray-100 rounded-full">
                {getSyncStatusIcon()}
                <span className="text-sm text-gray-600">{getSyncStatusText()}</span>
              </div>
              
              <button
                onClick={handleLogout}
                className="flex items-center space-x-2 px-4 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <LogOut className="w-4 h-4" />
                <span className="hidden sm:inline">Sair</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation Tabs */}
      <div className="bg-white/60 backdrop-blur-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex space-x-8">
            {[
              { id: 'hoje', label: 'Hoje', icon: Calendar },
              { id: 'progresso', label: 'Progresso', icon: TrendingUp },
              { id: 'perfil', label: 'Perfil', icon: User },
              { id: 'notificacoes', label: 'Notificações', icon: Bell }
            ].map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'hoje' && (
          <div className="space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* Calorias */}
              <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 border border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Calorias</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {mockData.today.calories.consumed}
                    </p>
                    <p className="text-sm text-gray-500">
                      de {mockData.today.calories.target} kcal
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                    <Zap className="w-6 h-6 text-orange-600" />
                  </div>
                </div>
                <div className="mt-4">
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-orange-500 h-2 rounded-full" 
                      style={{ 
                        width: `${Math.min((mockData.today.calories.consumed / mockData.today.calories.target) * 100, 100)}%` 
                      }}
                    ></div>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    {mockData.today.calories.remaining > 0 ? 'Restam' : 'Excesso de'} {Math.abs(mockData.today.calories.remaining)} kcal
                  </p>
                </div>
              </div>

              {/* Hidratação */}
              <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 border border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Hidratação</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {mockData.today.water.consumed}L
                    </p>
                    <p className="text-sm text-gray-500">
                      de {mockData.today.water.target}L
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Droplets className="w-6 h-6 text-blue-600" />
                  </div>
                </div>
                <div className="mt-4">
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-500 h-2 rounded-full" 
                      style={{ 
                        width: `${Math.min((mockData.today.water.consumed / mockData.today.water.target) * 100, 100)}%` 
                      }}
                    ></div>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    Restam {(mockData.today.water.target - mockData.today.water.consumed).toFixed(1)}L
                  </p>
                </div>
              </div>

              {/* Peso */}
              <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 border border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Peso Atual</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {mockData.today.weight.current}kg
                    </p>
                    <p className="text-sm text-gray-500">
                      Meta: {mockData.today.weight.target}kg
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                    <Target className="w-6 h-6 text-green-600" />
                  </div>
                </div>
                <div className="mt-4">
                  <p className={`text-sm font-medium ${mockData.today.weight.change < 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {mockData.today.weight.change > 0 ? '+' : ''}{mockData.today.weight.change}kg esta semana
                  </p>
                </div>
              </div>

              {/* Atividade */}
              <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 border border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Atividade</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {mockData.today.activities.reduce((acc, act) => acc + act.calories, 0)}
                    </p>
                    <p className="text-sm text-gray-500">kcal queimadas</p>
                  </div>
                  <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                    <Activity className="w-6 h-6 text-purple-600" />
                  </div>
                </div>
                <div className="mt-4">
                  <p className="text-sm text-gray-500">
                    {mockData.today.activities.length} atividades hoje
                  </p>
                </div>
              </div>
            </div>

            {/* Refeições */}
            <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <Apple className="w-5 h-5 mr-2 text-green-600" />
                Refeições de Hoje
              </h3>
              <div className="space-y-3">
                {mockData.today.meals.map((meal) => (
                  <div key={meal.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className={`w-3 h-3 rounded-full ${
                        meal.status === 'completed' ? 'bg-green-500' : 'bg-gray-300'
                      }`}></div>
                      <div>
                        <p className="font-medium text-gray-900">{meal.name}</p>
                        <p className="text-sm text-gray-500">{meal.time}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-gray-900">{meal.calories} kcal</p>
                      <p className={`text-xs ${
                        meal.status === 'completed' ? 'text-green-600' : 'text-gray-500'
                      }`}>
                        {meal.status === 'completed' ? 'Concluída' : 'Pendente'}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Atividades */}
            <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <Activity className="w-5 h-5 mr-2 text-purple-600" />
                Atividades de Hoje
              </h3>
              <div className="space-y-3">
                {mockData.today.activities.map((activity) => (
                  <div key={activity.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium text-gray-900">{activity.name}</p>
                      <p className="text-sm text-gray-500">{activity.time} • {activity.duration} min</p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-gray-900">{activity.calories} kcal</p>
                      <p className="text-xs text-green-600">Concluída</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'progresso' && (
          <div className="space-y-6">
            {/* Estatísticas da Semana */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 border border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Calorias Médias</p>
                    <p className="text-2xl font-bold text-gray-900">{mockData.progress.weeklyStats.caloriesAvg}</p>
                    <p className="text-sm text-gray-500">kcal/dia</p>
                  </div>
                  <BarChart3 className="w-8 h-8 text-orange-600" />
                </div>
              </div>

              <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 border border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Hidratação Média</p>
                    <p className="text-2xl font-bold text-gray-900">{mockData.progress.weeklyStats.waterAvg}L</p>
                    <p className="text-sm text-gray-500">por dia</p>
                  </div>
                  <Droplets className="w-8 h-8 text-blue-600" />
                </div>
              </div>

              <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 border border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Dias Ativos</p>
                    <p className="text-2xl font-bold text-gray-900">{mockData.progress.weeklyStats.exerciseDays}</p>
                    <p className="text-sm text-gray-500">de 7 dias</p>
                  </div>
                  <Activity className="w-8 h-8 text-purple-600" />
                </div>
              </div>

              <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 border border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Conformidade</p>
                    <p className="text-2xl font-bold text-gray-900">{mockData.progress.weeklyStats.goalCompliance}%</p>
                    <p className="text-sm text-gray-500">das metas</p>
                  </div>
                  <Target className="w-8 h-8 text-green-600" />
                </div>
              </div>
            </div>

            {/* Histórico de Peso */}
            <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Evolução do Peso</h3>
              <div className="space-y-2">
                {mockData.progress.weightHistory.map((entry, index) => (
                  <div key={entry.date} className="flex items-center justify-between p-2 hover:bg-gray-50 rounded">
                    <span className="text-sm text-gray-600">{new Date(entry.date).toLocaleDateString('pt-BR')}</span>
                    <span className="font-medium">{entry.weight} kg</span>
                    {index > 0 && (
                      <span className={`text-sm ${
                        entry.weight < mockData.progress.weightHistory[index - 1].weight 
                          ? 'text-green-600' 
                          : 'text-red-600'
                      }`}>
                        {entry.weight < mockData.progress.weightHistory[index - 1].weight ? '↓' : '↑'}
                        {Math.abs(entry.weight - mockData.progress.weightHistory[index - 1].weight).toFixed(1)}kg
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'perfil' && (
          <div className="space-y-6">
            {/* Informações do Usuário */}
            <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Informações Pessoais</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <p className="text-gray-900">{currentUser?.email}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nome</label>
                  <p className="text-gray-900">{currentUser?.displayName || 'Não informado'}</p>
                </div>
              </div>
            </div>

            {/* Perfil Nutricional */}
            {nutritionalProfile && (
              <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 border border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Perfil Nutricional</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">TMB</label>
                    <p className="text-2xl font-bold text-gray-900">{nutritionalProfile.bmr}</p>
                    <p className="text-sm text-gray-500">kcal/dia</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">TDEE</label>
                    <p className="text-2xl font-bold text-gray-900">{nutritionalProfile.tdee}</p>
                    <p className="text-sm text-gray-500">kcal/dia</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">IMC</label>
                    <p className="text-2xl font-bold text-gray-900">{nutritionalProfile.bmi}</p>
                    <p className="text-sm text-gray-500">kg/m²</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Calculado em</label>
                    <p className="text-sm text-gray-900">
                      {new Date(nutritionalProfile.calculatedAt).toLocaleDateString('pt-BR')}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Status da Anamnese */}
            {anamneseData && (
              <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 border border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Status da Anamnese</h3>
                <div className="flex items-center space-x-3">
                  <CheckCircle className="w-6 h-6 text-green-500" />
                  <div>
                    <p className="font-medium text-gray-900">Anamnese Concluída</p>
                    <p className="text-sm text-gray-500">
                      Finalizada em {new Date(anamneseData.completedAt).toLocaleDateString('pt-BR')}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Status de Sincronização */}
            <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Status de Sincronização</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Status da Conexão</span>
                  <div className="flex items-center space-x-2">
                    {syncStatus.isOnline ? (
                      <Wifi className="w-4 h-4 text-green-500" />
                    ) : (
                      <WifiOff className="w-4 h-4 text-red-500" />
                    )}
                    <span className={`text-sm ${syncStatus.isOnline ? 'text-green-600' : 'text-red-600'}`}>
                      {syncStatus.isOnline ? 'Online' : 'Offline'}
                    </span>
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Itens Pendentes</span>
                  <span className="text-sm text-gray-900">{syncStatus.pendingItems}</span>
                </div>
                
                {syncStatus.lastSync && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Última Sincronização</span>
                    <span className="text-sm text-gray-900">
                      {new Date(syncStatus.lastSync).toLocaleString('pt-BR')}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Aba Notificações */}
        {activeTab === 'notificacoes' && (
          <NotificationSettings />
        )}
      </main>
      
      {/* Coach EVO Components */}
      <CoachButton 
        onClick={() => setIsCoachOpen(!isCoachOpen)}
        isActive={isCoachOpen}
      />
      
      <CoachModal 
        isOpen={isCoachOpen}
        onClose={() => setIsCoachOpen(false)}
        userId={currentUser?.uid || 'demo_user'}
      />
    </div>
  );
};

export default Dashboard;

