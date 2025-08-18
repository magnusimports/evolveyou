// Serviço de Notificações Inteligentes
class NotificationService {
  constructor() {
    this.permission = null;
    this.isSupported = 'Notification' in window;
    this.scheduledNotifications = new Map();
    this.userPreferences = this.loadPreferences();
    this.init();
  }

  // Inicializar serviço
  async init() {
    if (!this.isSupported) {
      console.warn('Notificações não suportadas neste navegador');
      return;
    }

    // Verificar permissão atual
    this.permission = Notification.permission;
    
    // Carregar preferências salvas
    this.userPreferences = this.loadPreferences();
    
    // Iniciar agendamento automático
    this.scheduleIntelligentNotifications();
  }

  // Solicitar permissão para notificações
  async requestPermission() {
    if (!this.isSupported) {
      throw new Error('Notificações não suportadas');
    }

    if (this.permission === 'granted') {
      return true;
    }

    try {
      const permission = await Notification.requestPermission();
      this.permission = permission;
      return permission === 'granted';
    } catch (error) {
      console.error('Erro ao solicitar permissão:', error);
      return false;
    }
  }

  // Enviar notificação
  async sendNotification(options) {
    if (!this.canSendNotification()) {
      console.warn('Não é possível enviar notificação');
      return null;
    }

    const {
      title,
      body,
      icon = '/favicon.ico',
      badge = '/favicon.ico',
      tag,
      data = {},
      actions = [],
      requireInteraction = false,
      silent = false
    } = options;

    try {
      const notification = new Notification(title, {
        body,
        icon,
        badge,
        tag,
        data,
        actions,
        requireInteraction,
        silent
      });

      // Configurar eventos
      notification.onclick = (event) => {
        event.preventDefault();
        window.focus();
        
        // Executar ação personalizada se definida
        if (data.action) {
          this.handleNotificationAction(data.action, data);
        }
        
        notification.close();
      };

      notification.onclose = () => {
        console.log('Notificação fechada:', title);
      };

      notification.onerror = (error) => {
        console.error('Erro na notificação:', error);
      };

      // Auto-fechar após tempo definido
      if (data.autoClose !== false) {
        setTimeout(() => {
          notification.close();
        }, data.duration || 5000);
      }

      return notification;
    } catch (error) {
      console.error('Erro ao criar notificação:', error);
      return null;
    }
  }

  // Verificar se pode enviar notificação
  canSendNotification() {
    return this.isSupported && 
           this.permission === 'granted' && 
           this.userPreferences.enabled;
  }

  // Agendar notificação
  scheduleNotification(id, options, delay) {
    if (this.scheduledNotifications.has(id)) {
      clearTimeout(this.scheduledNotifications.get(id));
    }

    const timeoutId = setTimeout(() => {
      this.sendNotification(options);
      this.scheduledNotifications.delete(id);
    }, delay);

    this.scheduledNotifications.set(id, timeoutId);
    
    console.log(`Notificação agendada: ${id} em ${delay}ms`);
  }

  // Cancelar notificação agendada
  cancelScheduledNotification(id) {
    if (this.scheduledNotifications.has(id)) {
      clearTimeout(this.scheduledNotifications.get(id));
      this.scheduledNotifications.delete(id);
      console.log(`Notificação cancelada: ${id}`);
    }
  }

  // Notificações inteligentes baseadas no perfil
  scheduleIntelligentNotifications() {
    if (!this.canSendNotification()) return;

    // Agendar lembretes de refeição
    this.scheduleMealReminders();
    
    // Agendar lembretes de hidratação
    this.scheduleHydrationReminders();
    
    // Agendar lembretes de exercício
    this.scheduleExerciseReminders();
    
    // Agendar lembretes de pesagem
    this.scheduleWeightReminders();
  }

  // Lembretes de refeição
  scheduleMealReminders() {
    const mealTimes = [
      { id: 'breakfast', time: '08:00', name: 'Café da Manhã' },
      { id: 'morning_snack', time: '10:30', name: 'Lanche da Manhã' },
      { id: 'lunch', time: '12:30', name: 'Almoço' },
      { id: 'afternoon_snack', time: '15:30', name: 'Lanche da Tarde' },
      { id: 'dinner', time: '19:00', name: 'Jantar' },
      { id: 'evening_snack', time: '21:30', name: 'Ceia' }
    ];

    mealTimes.forEach(meal => {
      if (this.userPreferences.meals[meal.id]) {
        this.scheduleDailyNotification(
          `meal_${meal.id}`,
          meal.time,
          {
            title: `🍽️ Hora do ${meal.name}!`,
            body: 'Não se esqueça de registrar sua refeição no EvolveYou',
            tag: 'meal_reminder',
            data: {
              action: 'open_meal_log',
              mealId: meal.id,
              mealName: meal.name
            }
          }
        );
      }
    });
  }

  // Lembretes de hidratação
  scheduleHydrationReminders() {
    if (!this.userPreferences.hydration.enabled) return;

    const interval = this.userPreferences.hydration.interval || 60; // minutos
    const startHour = 8;
    const endHour = 22;

    for (let hour = startHour; hour <= endHour; hour += Math.floor(interval / 60)) {
      this.scheduleDailyNotification(
        `hydration_${hour}`,
        `${hour.toString().padStart(2, '0')}:00`,
        {
          title: '💧 Hora de se hidratar!',
          body: `Beba um copo de água. Meta diária: ${this.userPreferences.hydration.target || 2.5}L`,
          tag: 'hydration_reminder',
          data: {
            action: 'log_water',
            amount: 250
          }
        }
      );
    }
  }

  // Lembretes de exercício
  scheduleExerciseReminders() {
    if (!this.userPreferences.exercise.enabled) return;

    const exerciseTimes = this.userPreferences.exercise.times || ['07:00', '18:00'];
    
    exerciseTimes.forEach((time, index) => {
      this.scheduleDailyNotification(
        `exercise_${index}`,
        time,
        {
          title: '💪 Hora do exercício!',
          body: 'Que tal uma atividade física? Seu corpo agradece!',
          tag: 'exercise_reminder',
          data: {
            action: 'open_exercise_log',
            suggestedDuration: 30
          }
        }
      );
    });
  }

  // Lembretes de pesagem
  scheduleWeightReminders() {
    if (!this.userPreferences.weight.enabled) return;

    const frequency = this.userPreferences.weight.frequency || 'weekly'; // daily, weekly
    
    if (frequency === 'daily') {
      this.scheduleDailyNotification(
        'weight_daily',
        '07:30',
        {
          title: '⚖️ Hora da pesagem!',
          body: 'Registre seu peso para acompanhar seu progresso',
          tag: 'weight_reminder',
          data: {
            action: 'log_weight'
          }
        }
      );
    } else if (frequency === 'weekly') {
      // Agendar para segunda-feira
      this.scheduleWeeklyNotification(
        'weight_weekly',
        1, // Segunda-feira
        '07:30',
        {
          title: '⚖️ Pesagem semanal!',
          body: 'Como está seu progresso esta semana?',
          tag: 'weight_reminder',
          data: {
            action: 'log_weight'
          }
        }
      );
    }
  }

  // Agendar notificação diária
  scheduleDailyNotification(id, time, options) {
    const [hours, minutes] = time.split(':').map(Number);
    const now = new Date();
    const scheduledTime = new Date();
    
    scheduledTime.setHours(hours, minutes, 0, 0);
    
    // Se já passou da hora hoje, agendar para amanhã
    if (scheduledTime <= now) {
      scheduledTime.setDate(scheduledTime.getDate() + 1);
    }
    
    const delay = scheduledTime.getTime() - now.getTime();
    this.scheduleNotification(id, options, delay);
    
    // Reagendar para o próximo dia
    setTimeout(() => {
      this.scheduleDailyNotification(id, time, options);
    }, delay + 24 * 60 * 60 * 1000);
  }

  // Agendar notificação semanal
  scheduleWeeklyNotification(id, dayOfWeek, time, options) {
    const [hours, minutes] = time.split(':').map(Number);
    const now = new Date();
    const scheduledTime = new Date();
    
    // Calcular próximo dia da semana
    const currentDay = now.getDay();
    const daysUntilTarget = (dayOfWeek - currentDay + 7) % 7;
    
    scheduledTime.setDate(now.getDate() + daysUntilTarget);
    scheduledTime.setHours(hours, minutes, 0, 0);
    
    // Se já passou da hora hoje e é o mesmo dia, agendar para próxima semana
    if (daysUntilTarget === 0 && scheduledTime <= now) {
      scheduledTime.setDate(scheduledTime.getDate() + 7);
    }
    
    const delay = scheduledTime.getTime() - now.getTime();
    this.scheduleNotification(id, options, delay);
    
    // Reagendar para a próxima semana
    setTimeout(() => {
      this.scheduleWeeklyNotification(id, dayOfWeek, time, options);
    }, delay + 7 * 24 * 60 * 60 * 1000);
  }

  // Notificações de progresso
  sendProgressNotification(type, data) {
    const notifications = {
      goal_achieved: {
        title: '🎉 Meta alcançada!',
        body: `Parabéns! Você atingiu sua meta de ${data.goal}`,
        data: { action: 'view_progress' }
      },
      streak_milestone: {
        title: '🔥 Sequência incrível!',
        body: `${data.days} dias consecutivos! Continue assim!`,
        data: { action: 'view_achievements' }
      },
      weight_progress: {
        title: '📉 Progresso no peso!',
        body: `Você perdeu ${data.amount}kg esta semana!`,
        data: { action: 'view_weight_chart' }
      },
      calorie_goal: {
        title: '🎯 Meta calórica atingida!',
        body: 'Excelente controle alimentar hoje!',
        data: { action: 'view_nutrition' }
      }
    };

    const notification = notifications[type];
    if (notification) {
      this.sendNotification(notification);
    }
  }

  // Notificações contextuais inteligentes
  sendContextualNotification(context, userProfile) {
    const suggestions = this.generateSmartSuggestions(context, userProfile);
    
    if (suggestions.length > 0) {
      const suggestion = suggestions[0]; // Pegar a melhor sugestão
      
      this.sendNotification({
        title: '💡 Sugestão personalizada',
        body: suggestion.message,
        tag: 'smart_suggestion',
        data: {
          action: suggestion.action,
          context: context
        }
      });
    }
  }

  // Gerar sugestões inteligentes
  generateSmartSuggestions(context, userProfile) {
    const suggestions = [];
    const now = new Date();
    const hour = now.getHours();

    // Sugestões baseadas no horário
    if (hour >= 6 && hour <= 9 && context.lastMeal > 12) {
      suggestions.push({
        message: 'Que tal um café da manhã nutritivo? Seu corpo precisa de energia!',
        action: 'suggest_breakfast',
        priority: 8
      });
    }

    // Sugestões baseadas na hidratação
    if (context.waterIntake < userProfile.waterGoal * 0.5 && hour > 12) {
      suggestions.push({
        message: 'Você está bebendo pouca água hoje. Que tal um copo agora?',
        action: 'remind_water',
        priority: 7
      });
    }

    // Sugestões baseadas na atividade
    if (context.exerciseToday === 0 && hour >= 17 && hour <= 20) {
      suggestions.push({
        message: 'Ainda dá tempo para uma atividade física hoje!',
        action: 'suggest_exercise',
        priority: 6
      });
    }

    // Sugestões baseadas no sono
    if (hour >= 22 && context.screenTime > 2) {
      suggestions.push({
        message: 'Que tal diminuir o tempo de tela para um sono melhor?',
        action: 'sleep_tip',
        priority: 5
      });
    }

    return suggestions.sort((a, b) => b.priority - a.priority);
  }

  // Manipular ações de notificação
  handleNotificationAction(action, data) {
    switch (action) {
      case 'open_meal_log':
        // Abrir tela de registro de refeição
        window.location.hash = `#/meals/${data.mealId}`;
        break;
        
      case 'log_water':
        // Registrar água automaticamente
        this.logWaterIntake(data.amount);
        break;
        
      case 'open_exercise_log':
        // Abrir tela de exercícios
        window.location.hash = '#/exercises';
        break;
        
      case 'log_weight':
        // Abrir tela de pesagem
        window.location.hash = '#/weight';
        break;
        
      case 'view_progress':
        // Abrir tela de progresso
        window.location.hash = '#/progress';
        break;
        
      default:
        console.log('Ação não reconhecida:', action);
    }
  }

  // Registrar ingestão de água (exemplo)
  logWaterIntake(amount) {
    const currentIntake = parseFloat(localStorage.getItem('waterIntake') || '0');
    const newIntake = currentIntake + (amount / 1000); // Converter ml para litros
    localStorage.setItem('waterIntake', newIntake.toString());
    
    // Mostrar feedback
    this.sendNotification({
      title: '💧 Água registrada!',
      body: `+${amount}ml adicionados. Total: ${newIntake.toFixed(1)}L`,
      tag: 'water_logged',
      data: { autoClose: true, duration: 3000 }
    });
  }

  // Carregar preferências
  loadPreferences() {
    const defaultPreferences = {
      enabled: true,
      meals: {
        breakfast: true,
        morning_snack: true,
        lunch: true,
        afternoon_snack: true,
        dinner: true,
        evening_snack: false
      },
      hydration: {
        enabled: true,
        interval: 60, // minutos
        target: 2.5 // litros
      },
      exercise: {
        enabled: true,
        times: ['07:00', '18:00']
      },
      weight: {
        enabled: true,
        frequency: 'weekly' // daily, weekly
      },
      progress: {
        enabled: true,
        achievements: true,
        goals: true
      },
      smart: {
        enabled: true,
        contextual: true
      }
    };

    try {
      const saved = localStorage.getItem('notificationPreferences');
      return saved ? { ...defaultPreferences, ...JSON.parse(saved) } : defaultPreferences;
    } catch (error) {
      console.error('Erro ao carregar preferências:', error);
      return defaultPreferences;
    }
  }

  // Salvar preferências
  savePreferences(preferences) {
    try {
      this.userPreferences = { ...this.userPreferences, ...preferences };
      localStorage.setItem('notificationPreferences', JSON.stringify(this.userPreferences));
      
      // Reagendar notificações com novas preferências
      this.clearAllScheduled();
      this.scheduleIntelligentNotifications();
      
      return true;
    } catch (error) {
      console.error('Erro ao salvar preferências:', error);
      return false;
    }
  }

  // Limpar todas as notificações agendadas
  clearAllScheduled() {
    this.scheduledNotifications.forEach((timeoutId) => {
      clearTimeout(timeoutId);
    });
    this.scheduledNotifications.clear();
  }

  // Obter estatísticas
  getStats() {
    return {
      isSupported: this.isSupported,
      permission: this.permission,
      canSend: this.canSendNotification(),
      scheduled: this.scheduledNotifications.size,
      preferences: this.userPreferences
    };
  }

  // Testar notificação
  testNotification() {
    this.sendNotification({
      title: '🧪 Teste de Notificação',
      body: 'Se você está vendo isso, as notificações estão funcionando!',
      tag: 'test_notification',
      data: {
        action: 'test_complete',
        autoClose: true,
        duration: 5000
      }
    });
  }
}

// Instância global do serviço
const notificationService = new NotificationService();

export default notificationService;

