import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  sendPasswordResetEmail,
  updateProfile,
  GoogleAuthProvider,
  signInWithPopup
} from 'firebase/auth';
import { doc, setDoc, getDoc, updateDoc } from 'firebase/firestore';
import { auth, db } from '../lib/firebase';

const AuthContext = createContext();

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [userProfile, setUserProfile] = useState(null);

  // Sign up with email and password
  async function signup(email, password, userData = {}) {
    try {
      const { user } = await createUserWithEmailAndPassword(auth, email, password);
      
      // Update display name if provided
      if (userData.name) {
        await updateProfile(user, { displayName: userData.name });
      }
      
      // Create user profile in Firestore
      const userDoc = {
        uid: user.uid,
        email: user.email,
        name: userData.name || '',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        profile: {
          completed: false,
          onboardingCompleted: false,
          anamneseCompleted: false,
          ...userData
        }
      };
      
      await setDoc(doc(db, 'users', user.uid), userDoc);
      setUserProfile(userDoc);
      
      return user;
    } catch (error) {
      console.error('Signup error:', error);
      throw error;
    }
  }

  // Sign in with email and password
  async function login(email, password) {
    try {
      const { user } = await signInWithEmailAndPassword(auth, email, password);
      await loadUserProfile(user.uid);
      return user;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  }

  // Sign in with Google
  async function loginWithGoogle() {
    try {
      const provider = new GoogleAuthProvider();
      provider.addScope('email');
      provider.addScope('profile');
      
      const { user } = await signInWithPopup(auth, provider);
      
      // Check if user profile exists, create if not
      const userDoc = await getDoc(doc(db, 'users', user.uid));
      
      if (!userDoc.exists()) {
        const newUserDoc = {
          uid: user.uid,
          email: user.email,
          name: user.displayName || '',
          photoURL: user.photoURL || '',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          profile: {
            completed: false,
            onboardingCompleted: false,
            anamneseCompleted: false
          }
        };
        
        await setDoc(doc(db, 'users', user.uid), newUserDoc);
        setUserProfile(newUserDoc);
      } else {
        setUserProfile(userDoc.data());
      }
      
      return user;
    } catch (error) {
      console.error('Google login error:', error);
      throw error;
    }
  }

  // Sign out
  async function logout() {
    try {
      await signOut(auth);
      setUserProfile(null);
    } catch (error) {
      console.error('Logout error:', error);
      throw error;
    }
  }

  // Reset password
  async function resetPassword(email) {
    try {
      await sendPasswordResetEmail(auth, email);
    } catch (error) {
      console.error('Reset password error:', error);
      throw error;
    }
  }

  // Load user profile from Firestore
  async function loadUserProfile(uid) {
    try {
      const userDoc = await getDoc(doc(db, 'users', uid));
      if (userDoc.exists()) {
        const profile = userDoc.data();
        setUserProfile(profile);
        return profile;
      }
      return null;
    } catch (error) {
      console.error('Load profile error:', error);
      return null;
    }
  }

  // Update user profile
  async function updateUserProfile(updates) {
    try {
      if (!currentUser) throw new Error('No user logged in');
      
      const updatedProfile = {
        ...userProfile,
        ...updates,
        updatedAt: new Date().toISOString()
      };
      
      await updateDoc(doc(db, 'users', currentUser.uid), updatedProfile);
      setUserProfile(updatedProfile);
      
      return updatedProfile;
    } catch (error) {
      console.error('Update profile error:', error);
      throw error;
    }
  }

  // Complete onboarding
  async function completeOnboarding(onboardingData) {
    try {
      const updates = {
        profile: {
          ...userProfile?.profile,
          ...onboardingData,
          onboardingCompleted: true
        }
      };
      
      return await updateUserProfile(updates);
    } catch (error) {
      console.error('Complete onboarding error:', error);
      throw error;
    }
  }

  // Complete anamnese
  async function completeAnamnese(anamneseData) {
    try {
      const updates = {
        profile: {
          ...userProfile?.profile,
          anamneseCompleted: true
        },
        anamnese: {
          ...anamneseData,
          completedAt: new Date().toISOString()
        }
      };
      
      return await updateUserProfile(updates);
    } catch (error) {
      console.error('Complete anamnese error:', error);
      throw error;
    }
  }

  // Check if user needs onboarding
  function needsOnboarding() {
    return currentUser && userProfile && !userProfile.profile?.onboardingCompleted;
  }

  // Check if user needs anamnese
  function needsAnamnese() {
    return currentUser && userProfile && !userProfile.profile?.anamneseCompleted;
  }

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setCurrentUser(user);
        await loadUserProfile(user.uid);
      } else {
        setCurrentUser(null);
        setUserProfile(null);
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const value = {
    currentUser,
    userProfile,
    loading,
    signup,
    login,
    loginWithGoogle,
    logout,
    resetPassword,
    updateUserProfile,
    completeOnboarding,
    completeAnamnese,
    needsOnboarding,
    needsAnamnese,
    loadUserProfile
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}

