import React, { createContext, useContext, useState, useEffect } from 'react';
import { auth } from '../services/firebaseConfig';
import syncService from '../services/syncService';
import apiService from '../services/apiService';
import notificationService from '../services/notificationService';

const AuthContext = createContext({});

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [syncStatus, setSyncStatus] = useState(syncService.getSyncStatus());

  // Monitorar status de sincronização
  useEffect(() => {
    const interval = setInterval(() => {
      setSyncStatus(syncService.getSyncStatus());
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  // Simular persistência de sessão com sincronização
  useEffect(() => {
    const loadUserSession = async () => {
      try {
        const savedUser = localStorage.getItem('evolveyou_user');
        if (savedUser) {
          const user = JSON.parse(savedUser);
          setCurrentUser(user);
          
          // Configurar token de autenticação para APIs
          apiService.setAuthToken(user.uid);
          
          // Tentar sincronizar dados do usuário
          if (navigator.onLine) {
            await syncService.loadUserData(user.uid);
          }
        }
      } catch (e) {
        console.error('Erro ao carregar sessão:', e);
        localStorage.removeItem('evolveyou_user');
      } finally {
        setLoading(false);
      }
    };

    loadUserSession();
  }, []);

  const signup = async (email, password, displayName) => {
    try {
      setError(null);
      setLoading(true);
      
      const result = await auth.createUserWithEmailAndPassword(email, password);
      
      // Atualizar perfil com nome
      if (displayName) {
        result.user.displayName = displayName;
      }
      
      // Criar perfil inicial do usuário
      const initialProfile = {
        email: result.user.email,
        displayName: displayName,
        createdAt: new Date().toISOString(),
        lastLoginAt: new Date().toISOString(),
        preferences: {
          notifications: true,
          theme: 'light',
          language: 'pt-BR'
        }
      };
      
      // Salvar perfil inicial
      await syncService.saveUserData(result.user.uid, initialProfile, 'user_profiles');
      
      setCurrentUser(result.user);
      localStorage.setItem('evolveyou_user', JSON.stringify(result.user));
      
      // Configurar token de autenticação
      apiService.setAuthToken(result.user.uid);
      
      return result;
    } catch (error) {
      setError(error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    try {
      setError(null);
      setLoading(true);
      
      const result = await auth.signInWithEmailAndPassword(email, password);
      
      // Atualizar último login
      const loginData = {
        lastLoginAt: new Date().toISOString(),
        loginCount: (await syncService.loadUserData(result.user.uid, 'user_profiles')).data?.loginCount + 1 || 1
      };
      
      await syncService.saveUserData(result.user.uid, loginData, 'user_profiles');
      
      setCurrentUser(result.user);
      localStorage.setItem('evolveyou_user', JSON.stringify(result.user));
      
      // Configurar token de autenticação
      apiService.setAuthToken(result.user.uid);
      
      // Inicializar notificações após login
      await notificationService.requestPermission();
      notificationService.scheduleIntelligentNotifications();
      
      // Forçar sincronização após login
      if (navigator.onLine) {
        await syncService.forcSync();
      }
      
      return result;
    } catch (error) {
      setError(error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      setError(null);
      
      // Tentar sincronizar dados pendentes antes do logout
      if (navigator.onLine && currentUser) {
        await syncService.forcSync();
      }
      
      await auth.signOut();
      
      setCurrentUser(null);
      localStorage.removeItem('evolveyou_user');
      
      // Limpar token de autenticação
      apiService.clearAuthToken();
      
    } catch (error) {
      setError(error.message);
      throw error;
    }
  };

  const resetPassword = async (email) => {
    try {
      setError(null);
      await auth.sendPasswordResetEmail(email);
    } catch (error) {
      setError(error.message);
      throw error;
    }
  };

  const updateUserProfile = async (profile) => {
    try {
      setError(null);
      setLoading(true);
      
      const updatedUser = await auth.updateProfile(currentUser, profile);
      
      // Salvar perfil atualizado
      await syncService.saveUserData(currentUser.uid, {
        ...profile,
        updatedAt: new Date().toISOString()
      }, 'user_profiles');
      
      // Também tentar atualizar via API
      await apiService.updateUserProfile(currentUser.uid, profile);
      
      setCurrentUser(updatedUser);
      localStorage.setItem('evolveyou_user', JSON.stringify(updatedUser));
      
      return updatedUser;
    } catch (error) {
      setError(error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Salvar dados da anamnese
  const saveAnamneseData = async (answers) => {
    if (!currentUser) throw new Error('Usuário não autenticado');
    
    try {
      // Salvar via API
      await apiService.saveAnamneseAnswers(currentUser.uid, answers);
      
      // Calcular perfil nutricional
      const profileResult = await apiService.calculateNutritionalProfile(currentUser.uid, answers);
      
      return {
        success: true,
        profile: profileResult.data,
        synced: !profileResult.fromCache
      };
    } catch (error) {
      console.error('Erro ao salvar anamnese:', error);
      throw error;
    }
  };

  // Carregar dados da anamnese
  const loadAnamneseData = async () => {
    if (!currentUser) return null;
    
    try {
      const result = await syncService.loadAnamneseData(currentUser.uid);
      return result.data;
    } catch (error) {
      console.error('Erro ao carregar anamnese:', error);
      return null;
    }
  };

  // Carregar perfil nutricional
  const loadNutritionalProfile = async () => {
    if (!currentUser) return null;
    
    try {
      const result = await syncService.loadNutritionalProfile(currentUser.uid);
      return result.data;
    } catch (error) {
      console.error('Erro ao carregar perfil nutricional:', error);
      return null;
    }
  };

  const value = {
    currentUser,
    loading,
    error,
    syncStatus,
    signup,
    login,
    logout,
    resetPassword,
    updateUserProfile,
    saveAnamneseData,
    loadAnamneseData,
    loadNutritionalProfile,
    clearError: () => setError(null),
    // Funções de notificação
    notificationService,
    requestNotificationPermission: () => notificationService.requestPermission(),
    sendNotification: (options) => notificationService.sendNotification(options),
    getNotificationStats: () => notificationService.getStats(),
    updateNotificationPreferences: (prefs) => notificationService.savePreferences(prefs),
    testNotification: () => notificationService.testNotification()
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;

