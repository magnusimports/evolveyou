import { firestore } from './firebaseConfig';

class SyncService {
  constructor() {
    this.isOnline = navigator.onLine;
    this.pendingSync = [];
    this.syncInProgress = false;
    
    // Monitorar status de conexão
    window.addEventListener('online', () => {
      this.isOnline = true;
      this.processPendingSync();
    });
    
    window.addEventListener('offline', () => {
      this.isOnline = false;
    });
  }

  // Salvar dados do usuário
  async saveUserData(userId, data, collection = 'users') {
    try {
      const docRef = firestore.collection(collection).doc(userId);
      
      if (this.isOnline) {
        await docRef.set(data, { merge: true });
        console.log(`✅ Dados salvos na nuvem: ${collection}/${userId}`);
      } else {
        // Salvar localmente e adicionar à fila de sincronização
        this.addToPendingSync('save', collection, userId, data);
        console.log(`📱 Dados salvos localmente: ${collection}/${userId}`);
      }
      
      // Sempre salvar localmente para acesso offline
      this.saveToLocalStorage(`${collection}_${userId}`, data);
      
      return { success: true, synced: this.isOnline };
    } catch (error) {
      console.error('Erro ao salvar dados:', error);
      
      // Fallback para localStorage
      this.saveToLocalStorage(`${collection}_${userId}`, data);
      this.addToPendingSync('save', collection, userId, data);
      
      return { success: true, synced: false, error: error.message };
    }
  }

  // Carregar dados do usuário
  async loadUserData(userId, collection = 'users') {
    try {
      let data = null;
      let fromCloud = false;
      
      if (this.isOnline) {
        try {
          const doc = await firestore.collection(collection).doc(userId).get();
          if (doc.exists) {
            data = doc.data();
            fromCloud = true;
            
            // Atualizar cache local
            this.saveToLocalStorage(`${collection}_${userId}`, data);
            console.log(`☁️ Dados carregados da nuvem: ${collection}/${userId}`);
          }
        } catch (error) {
          console.warn('Erro ao carregar da nuvem, usando cache local:', error);
        }
      }
      
      // Se não conseguiu carregar da nuvem, usar cache local
      if (!data) {
        data = this.loadFromLocalStorage(`${collection}_${userId}`);
        console.log(`📱 Dados carregados do cache local: ${collection}/${userId}`);
      }
      
      return {
        data,
        fromCloud,
        cached: !!data
      };
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      
      // Fallback para localStorage
      const data = this.loadFromLocalStorage(`${collection}_${userId}`);
      return {
        data,
        fromCloud: false,
        cached: !!data,
        error: error.message
      };
    }
  }

  // Salvar dados da anamnese
  async saveAnamneseData(userId, anamneseData) {
    const data = {
      ...anamneseData,
      userId,
      updatedAt: new Date().toISOString(),
      version: Date.now() // Para controle de versão
    };
    
    return await this.saveUserData(userId, data, 'anamneses');
  }

  // Carregar dados da anamnese
  async loadAnamneseData(userId) {
    return await this.loadUserData(userId, 'anamneses');
  }

  // Salvar perfil nutricional
  async saveNutritionalProfile(userId, profile) {
    const data = {
      ...profile,
      userId,
      updatedAt: new Date().toISOString(),
      calculatedAt: new Date().toISOString()
    };
    
    return await this.saveUserData(userId, data, 'nutritional_profiles');
  }

  // Carregar perfil nutricional
  async loadNutritionalProfile(userId) {
    return await this.loadUserData(userId, 'nutritional_profiles');
  }

  // Salvar histórico de peso
  async saveWeightEntry(userId, weightData) {
    const entryId = `weight_${Date.now()}`;
    const data = {
      ...weightData,
      userId,
      id: entryId,
      createdAt: new Date().toISOString()
    };
    
    try {
      if (this.isOnline) {
        await firestore.collection('weight_history').add(data);
        console.log('✅ Peso salvo na nuvem');
      } else {
        this.addToPendingSync('add', 'weight_history', null, data);
        console.log('📱 Peso salvo localmente');
      }
      
      // Salvar no histórico local
      const localHistory = this.loadFromLocalStorage('weight_history') || [];
      localHistory.push(data);
      this.saveToLocalStorage('weight_history', localHistory);
      
      return { success: true, synced: this.isOnline };
    } catch (error) {
      console.error('Erro ao salvar peso:', error);
      
      // Fallback para localStorage
      const localHistory = this.loadFromLocalStorage('weight_history') || [];
      localHistory.push(data);
      this.saveToLocalStorage('weight_history', localHistory);
      this.addToPendingSync('add', 'weight_history', null, data);
      
      return { success: true, synced: false, error: error.message };
    }
  }

  // Carregar histórico de peso
  async loadWeightHistory(userId) {
    try {
      let data = [];
      let fromCloud = false;
      
      if (this.isOnline) {
        try {
          const snapshot = await firestore.collection('weight_history')
            .where('userId', '==', userId)
            .get();
          
          data = snapshot.docs.map(doc => doc.data());
          fromCloud = true;
          
          // Atualizar cache local
          this.saveToLocalStorage('weight_history', data);
          console.log('☁️ Histórico de peso carregado da nuvem');
        } catch (error) {
          console.warn('Erro ao carregar histórico da nuvem:', error);
        }
      }
      
      // Se não conseguiu carregar da nuvem, usar cache local
      if (data.length === 0) {
        data = this.loadFromLocalStorage('weight_history') || [];
        console.log('📱 Histórico de peso carregado do cache local');
      }
      
      return {
        data: data.filter(entry => entry.userId === userId),
        fromCloud,
        cached: data.length > 0
      };
    } catch (error) {
      console.error('Erro ao carregar histórico de peso:', error);
      
      const data = this.loadFromLocalStorage('weight_history') || [];
      return {
        data: data.filter(entry => entry.userId === userId),
        fromCloud: false,
        cached: data.length > 0,
        error: error.message
      };
    }
  }

  // Adicionar à fila de sincronização
  addToPendingSync(operation, collection, docId, data) {
    const syncItem = {
      id: Date.now() + Math.random(),
      operation,
      collection,
      docId,
      data,
      timestamp: new Date().toISOString()
    };
    
    this.pendingSync.push(syncItem);
    this.savePendingSyncToStorage();
  }

  // Processar fila de sincronização
  async processPendingSync() {
    if (this.syncInProgress || !this.isOnline || this.pendingSync.length === 0) {
      return;
    }
    
    this.syncInProgress = true;
    console.log(`🔄 Sincronizando ${this.pendingSync.length} itens pendentes...`);
    
    const successfulSyncs = [];
    
    for (const item of this.pendingSync) {
      try {
        switch (item.operation) {
          case 'save':
            await firestore.collection(item.collection).doc(item.docId).set(item.data, { merge: true });
            break;
          case 'add':
            await firestore.collection(item.collection).add(item.data);
            break;
          case 'update':
            await firestore.collection(item.collection).doc(item.docId).update(item.data);
            break;
          case 'delete':
            await firestore.collection(item.collection).doc(item.docId).delete();
            break;
        }
        
        successfulSyncs.push(item.id);
        console.log(`✅ Sincronizado: ${item.operation} ${item.collection}/${item.docId}`);
      } catch (error) {
        console.error(`❌ Erro ao sincronizar ${item.operation} ${item.collection}/${item.docId}:`, error);
      }
    }
    
    // Remover itens sincronizados com sucesso
    this.pendingSync = this.pendingSync.filter(item => !successfulSyncs.includes(item.id));
    this.savePendingSyncToStorage();
    
    this.syncInProgress = false;
    console.log(`🎉 Sincronização concluída. ${successfulSyncs.length} itens sincronizados.`);
  }

  // Salvar fila de sincronização no localStorage
  savePendingSyncToStorage() {
    localStorage.setItem('evolveyou_pending_sync', JSON.stringify(this.pendingSync));
  }

  // Carregar fila de sincronização do localStorage
  loadPendingSyncFromStorage() {
    try {
      const data = localStorage.getItem('evolveyou_pending_sync');
      this.pendingSync = data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Erro ao carregar fila de sincronização:', error);
      this.pendingSync = [];
    }
  }

  // Utilitários para localStorage
  saveToLocalStorage(key, data) {
    try {
      localStorage.setItem(`evolveyou_${key}`, JSON.stringify(data));
    } catch (error) {
      console.error('Erro ao salvar no localStorage:', error);
    }
  }

  loadFromLocalStorage(key) {
    try {
      const data = localStorage.getItem(`evolveyou_${key}`);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error('Erro ao carregar do localStorage:', error);
      return null;
    }
  }

  // Limpar dados locais
  clearLocalData() {
    const keys = Object.keys(localStorage).filter(key => key.startsWith('evolveyou_'));
    keys.forEach(key => localStorage.removeItem(key));
    this.pendingSync = [];
    console.log('🗑️ Dados locais limpos');
  }

  // Status da sincronização
  getSyncStatus() {
    return {
      isOnline: this.isOnline,
      pendingItems: this.pendingSync.length,
      syncInProgress: this.syncInProgress,
      lastSync: this.loadFromLocalStorage('last_sync_time')
    };
  }

  // Forçar sincronização
  async forcSync() {
    if (this.isOnline) {
      await this.processPendingSync();
      this.saveToLocalStorage('last_sync_time', new Date().toISOString());
    }
  }
}

// Instância singleton
const syncService = new SyncService();

// Carregar fila de sincronização ao inicializar
syncService.loadPendingSyncFromStorage();

// Tentar sincronizar a cada 30 segundos se estiver online
setInterval(() => {
  if (syncService.isOnline && !syncService.syncInProgress) {
    syncService.processPendingSync();
  }
}, 30000);

export default syncService;

