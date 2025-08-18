// Configuração Firebase para produção
// Em desenvolvimento, usar mock para evitar dependências externas

const firebaseConfig = {
  apiKey: "AIzaSyC_mock_key_for_development",
  authDomain: "evolveyou-prod.firebaseapp.com",
  projectId: "evolveyou-prod",
  storageBucket: "evolveyou-prod.appspot.com",
  messagingSenderId: "1062253516",
  appId: "1:1062253516:web:mock_app_id",
  measurementId: "G-MOCK_MEASUREMENT_ID"
};

// Mock Firebase para desenvolvimento
// Em produção, substituir por Firebase SDK real
export const mockFirebaseAuth = {
  currentUser: null,
  
  signInWithEmailAndPassword: async (email, password) => {
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    if (email === 'admin@evolveyou.com' && password === 'admin123') {
      return {
        user: {
          uid: 'mock-user-123',
          email: email,
          displayName: 'Usuário Teste',
          photoURL: null,
          emailVerified: true,
          metadata: {
            creationTime: new Date().toISOString(),
            lastSignInTime: new Date().toISOString()
          }
        }
      };
    }
    
    throw new Error('Credenciais inválidas');
  },
  
  createUserWithEmailAndPassword: async (email, password) => {
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    return {
      user: {
        uid: 'mock-user-' + Date.now(),
        email: email,
        displayName: null,
        photoURL: null,
        emailVerified: false,
        metadata: {
          creationTime: new Date().toISOString(),
          lastSignInTime: new Date().toISOString()
        }
      }
    };
  },
  
  signOut: async () => {
    await new Promise(resolve => setTimeout(resolve, 500));
    return true;
  },
  
  sendPasswordResetEmail: async (email) => {
    await new Promise(resolve => setTimeout(resolve, 1000));
    return true;
  },
  
  updateProfile: async (user, profile) => {
    await new Promise(resolve => setTimeout(resolve, 1000));
    return { ...user, ...profile };
  }
};

// Mock Firestore para desenvolvimento
export const mockFirestore = {
  collection: (collectionName) => ({
    doc: (docId) => ({
      set: async (data, options = {}) => {
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // Simular salvamento no localStorage para persistência
        const key = `firestore_${collectionName}_${docId}`;
        const existingData = localStorage.getItem(key);
        
        if (options.merge && existingData) {
          const merged = { ...JSON.parse(existingData), ...data };
          localStorage.setItem(key, JSON.stringify(merged));
        } else {
          localStorage.setItem(key, JSON.stringify(data));
        }
        
        return { id: docId };
      },
      
      get: async () => {
        await new Promise(resolve => setTimeout(resolve, 300));
        
        const key = `firestore_${collectionName}_${docId}`;
        const data = localStorage.getItem(key);
        
        return {
          exists: !!data,
          id: docId,
          data: () => data ? JSON.parse(data) : null
        };
      },
      
      update: async (data) => {
        await new Promise(resolve => setTimeout(resolve, 500));
        
        const key = `firestore_${collectionName}_${docId}`;
        const existingData = localStorage.getItem(key);
        
        if (existingData) {
          const merged = { ...JSON.parse(existingData), ...data };
          localStorage.setItem(key, JSON.stringify(merged));
        }
        
        return { id: docId };
      },
      
      delete: async () => {
        await new Promise(resolve => setTimeout(resolve, 300));
        
        const key = `firestore_${collectionName}_${docId}`;
        localStorage.removeItem(key);
        
        return true;
      }
    }),
    
    add: async (data) => {
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const docId = 'mock-doc-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9);
      const key = `firestore_${collectionName}_${docId}`;
      
      const docData = {
        ...data,
        id: docId,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      localStorage.setItem(key, JSON.stringify(docData));
      
      return { id: docId };
    },
    
    where: (field, operator, value) => ({
      get: async () => {
        await new Promise(resolve => setTimeout(resolve, 400));
        
        // Simular busca no localStorage
        const docs = [];
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i);
          if (key && key.startsWith(`firestore_${collectionName}_`)) {
            const data = JSON.parse(localStorage.getItem(key));
            
            // Simular filtro simples
            if (operator === '==' && data[field] === value) {
              docs.push({
                id: data.id,
                data: () => data
              });
            }
          }
        }
        
        return { docs };
      }
    })
  })
};

// Configuração de ambiente
export const isProduction = process.env.NODE_ENV === 'production';
export const useRealFirebase = process.env.VITE_USE_REAL_FIREBASE === 'true';

// Exportar configuração baseada no ambiente
export { firebaseConfig };
export const auth = mockFirebaseAuth;
export const firestore = mockFirestore;

// Funções utilitárias
export const initializeFirebase = () => {
  if (useRealFirebase) {
    console.log('🔥 Inicializando Firebase real...');
    // Aqui seria inicializado o Firebase real
    // import { initializeApp } from 'firebase/app';
    // import { getAuth } from 'firebase/auth';
    // import { getFirestore } from 'firebase/firestore';
    // const app = initializeApp(firebaseConfig);
    // return { auth: getAuth(app), firestore: getFirestore(app) };
  } else {
    console.log('🧪 Usando Firebase mock para desenvolvimento');
    return { auth: mockFirebaseAuth, firestore: mockFirestore };
  }
};

export default {
  auth,
  firestore,
  config: firebaseConfig,
  initialize: initializeFirebase
};

