import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { 
  Bell, 
  BellOff, 
  Clock, 
  Utensils, 
  Droplets, 
  Activity, 
  Target, 
  TrendingUp,
  Settings,
  TestTube,
  CheckCircle,
  AlertCircle,
  Info
} from 'lucide-react';

const NotificationSettings = () => {
  const { 
    notificationService, 
    getNotificationStats, 
    updateNotificationPreferences,
    testNotification 
  } = useAuth();
  
  const [preferences, setPreferences] = useState(null);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState(null);

  // Carregar configurações atuais
  useEffect(() => {
    const loadSettings = async () => {
      try {
        setLoading(true);
        
        const currentStats = getNotificationStats();
        const currentPrefs = notificationService.userPreferences;
        
        setStats(currentStats);
        setPreferences(currentPrefs);
        
      } catch (error) {
        console.error('Erro ao carregar configurações:', error);
        setMessage({
          type: 'error',
          text: 'Erro ao carregar configurações de notificação'
        });
      } finally {
        setLoading(false);
      }
    };

    loadSettings();
  }, [getNotificationStats, notificationService]);

  // Salvar preferências
  const handleSavePreferences = async (newPreferences) => {
    try {
      setSaving(true);
      
      const success = await updateNotificationPreferences(newPreferences);
      
      if (success) {
        setPreferences({ ...preferences, ...newPreferences });
        setMessage({
          type: 'success',
          text: 'Configurações salvas com sucesso!'
        });
      } else {
        throw new Error('Falha ao salvar');
      }
      
    } catch (error) {
      console.error('Erro ao salvar preferências:', error);
      setMessage({
        type: 'error',
        text: 'Erro ao salvar configurações'
      });
    } finally {
      setSaving(false);
      
      // Limpar mensagem após 3 segundos
      setTimeout(() => setMessage(null), 3000);
    }
  };

  // Solicitar permissão
  const handleRequestPermission = async () => {
    try {
      const granted = await notificationService.requestPermission();
      
      if (granted) {
        setStats({ ...stats, permission: 'granted', canSend: true });
        setMessage({
          type: 'success',
          text: 'Permissão concedida! Notificações ativadas.'
        });
      } else {
        setMessage({
          type: 'error',
          text: 'Permissão negada. Ative nas configurações do navegador.'
        });
      }
    } catch (error) {
      console.error('Erro ao solicitar permissão:', error);
      setMessage({
        type: 'error',
        text: 'Erro ao solicitar permissão para notificações'
      });
    }
  };

  // Testar notificação
  const handleTestNotification = () => {
    testNotification();
    setMessage({
      type: 'info',
      text: 'Notificação de teste enviada!'
    });
  };

  // Atualizar configuração específica
  const updateSetting = (category, setting, value) => {
    const newPreferences = {
      ...preferences,
      [category]: {
        ...preferences[category],
        [setting]: value
      }
    };
    
    setPreferences(newPreferences);
    handleSavePreferences(newPreferences);
  };

  // Atualizar configuração de refeição
  const updateMealSetting = (mealId, enabled) => {
    const newPreferences = {
      ...preferences,
      meals: {
        ...preferences.meals,
        [mealId]: enabled
      }
    };
    
    setPreferences(newPreferences);
    handleSavePreferences(newPreferences);
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="bg-white/80 backdrop-blur-sm rounded-xl p-8 border border-gray-200">
          <div className="animate-pulse">
            <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
            <div className="space-y-3">
              <div className="h-4 bg-gray-200 rounded"></div>
              <div className="h-4 bg-gray-200 rounded w-5/6"></div>
              <div className="h-4 bg-gray-200 rounded w-4/6"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!preferences || !stats) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="bg-white/80 backdrop-blur-sm rounded-xl p-8 border border-gray-200 text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Erro ao Carregar Configurações
          </h3>
          <p className="text-gray-600">
            Não foi possível carregar as configurações de notificação.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 border border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <Bell className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Configurações de Notificação
              </h1>
              <p className="text-gray-600">
                Personalize seus lembretes e alertas inteligentes
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            <button
              onClick={handleTestNotification}
              disabled={!stats.canSend}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <TestTube className="w-4 h-4" />
              <span>Testar</span>
            </button>
          </div>
        </div>
      </div>

      {/* Mensagem de Status */}
      {message && (
        <div className={`p-4 rounded-lg border ${
          message.type === 'success' ? 'bg-green-50 border-green-200 text-green-800' :
          message.type === 'error' ? 'bg-red-50 border-red-200 text-red-800' :
          'bg-blue-50 border-blue-200 text-blue-800'
        }`}>
          <div className="flex items-center space-x-2">
            {message.type === 'success' && <CheckCircle className="w-5 h-5" />}
            {message.type === 'error' && <AlertCircle className="w-5 h-5" />}
            {message.type === 'info' && <Info className="w-5 h-5" />}
            <span>{message.text}</span>
          </div>
        </div>
      )}

      {/* Status das Notificações */}
      <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 border border-gray-200">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Status do Sistema</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
            <div className={`w-3 h-3 rounded-full ${
              stats.isSupported ? 'bg-green-500' : 'bg-red-500'
            }`}></div>
            <div>
              <p className="text-sm font-medium text-gray-900">Suporte</p>
              <p className="text-xs text-gray-600">
                {stats.isSupported ? 'Suportado' : 'Não suportado'}
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
            <div className={`w-3 h-3 rounded-full ${
              stats.permission === 'granted' ? 'bg-green-500' : 
              stats.permission === 'denied' ? 'bg-red-500' : 'bg-yellow-500'
            }`}></div>
            <div>
              <p className="text-sm font-medium text-gray-900">Permissão</p>
              <p className="text-xs text-gray-600">
                {stats.permission === 'granted' ? 'Concedida' :
                 stats.permission === 'denied' ? 'Negada' : 'Pendente'}
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
            <div className={`w-3 h-3 rounded-full ${
              stats.canSend ? 'bg-green-500' : 'bg-red-500'
            }`}></div>
            <div>
              <p className="text-sm font-medium text-gray-900">Status</p>
              <p className="text-xs text-gray-600">
                {stats.canSend ? 'Ativo' : 'Inativo'}
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
            <Clock className="w-4 h-4 text-blue-600" />
            <div>
              <p className="text-sm font-medium text-gray-900">Agendadas</p>
              <p className="text-xs text-gray-600">{stats.scheduled} notificações</p>
            </div>
          </div>
        </div>

        {stats.permission !== 'granted' && (
          <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <AlertCircle className="w-5 h-5 text-yellow-600" />
                <span className="text-sm text-yellow-800">
                  Permissão necessária para receber notificações
                </span>
              </div>
              <button
                onClick={handleRequestPermission}
                className="px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition-colors"
              >
                Permitir Notificações
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Configurações Gerais */}
      <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 border border-gray-200">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Configurações Gerais</h2>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Bell className="w-5 h-5 text-gray-600" />
              <div>
                <p className="font-medium text-gray-900">Notificações Ativadas</p>
                <p className="text-sm text-gray-600">Receber todas as notificações</p>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={preferences.enabled}
                onChange={(e) => updateSetting('enabled', null, e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>
        </div>
      </div>

      {/* Lembretes de Refeição */}
      <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 border border-gray-200">
        <div className="flex items-center space-x-3 mb-4">
          <Utensils className="w-5 h-5 text-green-600" />
          <h2 className="text-lg font-semibold text-gray-900">Lembretes de Refeição</h2>
        </div>
        
        <div className="space-y-3">
          {[
            { id: 'breakfast', name: 'Café da Manhã', time: '08:00' },
            { id: 'morning_snack', name: 'Lanche da Manhã', time: '10:30' },
            { id: 'lunch', name: 'Almoço', time: '12:30' },
            { id: 'afternoon_snack', name: 'Lanche da Tarde', time: '15:30' },
            { id: 'dinner', name: 'Jantar', time: '19:00' },
            { id: 'evening_snack', name: 'Ceia', time: '21:30' }
          ].map((meal) => (
            <div key={meal.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <div>
                  <p className="font-medium text-gray-900">{meal.name}</p>
                  <p className="text-sm text-gray-600">{meal.time}</p>
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={preferences.meals[meal.id]}
                  onChange={(e) => updateMealSetting(meal.id, e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-green-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
              </label>
            </div>
          ))}
        </div>
      </div>

      {/* Lembretes de Hidratação */}
      <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 border border-gray-200">
        <div className="flex items-center space-x-3 mb-4">
          <Droplets className="w-5 h-5 text-blue-600" />
          <h2 className="text-lg font-semibold text-gray-900">Lembretes de Hidratação</h2>
        </div>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-gray-900">Ativar Lembretes</p>
              <p className="text-sm text-gray-600">Receber lembretes para beber água</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={preferences.hydration.enabled}
                onChange={(e) => updateSetting('hydration', 'enabled', e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>
          
          {preferences.hydration.enabled && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Intervalo (minutos)
                </label>
                <select
                  value={preferences.hydration.interval}
                  onChange={(e) => updateSetting('hydration', 'interval', parseInt(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value={30}>30 minutos</option>
                  <option value={60}>1 hora</option>
                  <option value={90}>1h 30min</option>
                  <option value={120}>2 horas</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Meta Diária (litros)
                </label>
                <select
                  value={preferences.hydration.target}
                  onChange={(e) => updateSetting('hydration', 'target', parseFloat(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value={1.5}>1.5L</option>
                  <option value={2.0}>2.0L</option>
                  <option value={2.5}>2.5L</option>
                  <option value={3.0}>3.0L</option>
                  <option value={3.5}>3.5L</option>
                </select>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Lembretes de Exercício */}
      <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 border border-gray-200">
        <div className="flex items-center space-x-3 mb-4">
          <Activity className="w-5 h-5 text-purple-600" />
          <h2 className="text-lg font-semibold text-gray-900">Lembretes de Exercício</h2>
        </div>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-gray-900">Ativar Lembretes</p>
              <p className="text-sm text-gray-600">Receber lembretes para se exercitar</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={preferences.exercise.enabled}
                onChange={(e) => updateSetting('exercise', 'enabled', e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
            </label>
          </div>
          
          {preferences.exercise.enabled && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Horários Preferidos
              </label>
              <div className="space-y-2">
                {preferences.exercise.times.map((time, index) => (
                  <div key={index} className="flex items-center space-x-2">
                    <input
                      type="time"
                      value={time}
                      onChange={(e) => {
                        const newTimes = [...preferences.exercise.times];
                        newTimes[index] = e.target.value;
                        updateSetting('exercise', 'times', newTimes);
                      }}
                      className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Lembretes de Pesagem */}
      <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 border border-gray-200">
        <div className="flex items-center space-x-3 mb-4">
          <Target className="w-5 h-5 text-orange-600" />
          <h2 className="text-lg font-semibold text-gray-900">Lembretes de Pesagem</h2>
        </div>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-gray-900">Ativar Lembretes</p>
              <p className="text-sm text-gray-600">Receber lembretes para se pesar</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={preferences.weight.enabled}
                onChange={(e) => updateSetting('weight', 'enabled', e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-orange-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-orange-600"></div>
            </label>
          </div>
          
          {preferences.weight.enabled && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Frequência
              </label>
              <select
                value={preferences.weight.frequency}
                onChange={(e) => updateSetting('weight', 'frequency', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
              >
                <option value="daily">Diariamente</option>
                <option value="weekly">Semanalmente</option>
              </select>
            </div>
          )}
        </div>
      </div>

      {/* Notificações de Progresso */}
      <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 border border-gray-200">
        <div className="flex items-center space-x-3 mb-4">
          <TrendingUp className="w-5 h-5 text-green-600" />
          <h2 className="text-lg font-semibold text-gray-900">Notificações de Progresso</h2>
        </div>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-gray-900">Conquistas</p>
              <p className="text-sm text-gray-600">Notificar quando atingir metas</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={preferences.progress.achievements}
                onChange={(e) => updateSetting('progress', 'achievements', e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-green-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
            </label>
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-gray-900">Metas Diárias</p>
              <p className="text-sm text-gray-600">Notificar sobre metas do dia</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={preferences.progress.goals}
                onChange={(e) => updateSetting('progress', 'goals', e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-green-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
            </label>
          </div>
        </div>
      </div>

      {/* Sugestões Inteligentes */}
      <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 border border-gray-200">
        <div className="flex items-center space-x-3 mb-4">
          <Settings className="w-5 h-5 text-gray-600" />
          <h2 className="text-lg font-semibold text-gray-900">Sugestões Inteligentes</h2>
        </div>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-gray-900">Sugestões Contextuais</p>
              <p className="text-sm text-gray-600">Receber dicas personalizadas baseadas no seu comportamento</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={preferences.smart.contextual}
                onChange={(e) => updateSetting('smart', 'contextual', e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-gray-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-gray-600"></div>
            </label>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 border border-gray-200">
        <div className="text-center text-sm text-gray-600">
          <p>
            As notificações são processadas localmente no seu dispositivo.
            Suas preferências são salvas com segurança.
          </p>
        </div>
      </div>
    </div>
  );
};

export default NotificationSettings;

