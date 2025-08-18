import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import './App.css';

// Import pages
import LandingPage from './pages/LandingPage';
import AuthPage from './pages/AuthPage';
import OnboardingPage from './pages/OnboardingPage';
import AnamnesesPage from './pages/AnamnesesPage';
import DashboardPage from './pages/DashboardPage';
import ProfilePage from './pages/ProfilePage';
import MealPlansPage from './pages/MealPlansPage';
import ShoppingListPage from './pages/ShoppingListPage';
import ReportsPage from './pages/ReportsPage';
import SettingsPage from './pages/SettingsPage';

// Loading component
function LoadingScreen() {
  return (
    <div className="min-h-screen bg-evolveyou-gradient flex items-center justify-center">
      <div className="text-center">
        <div className="spinner w-12 h-12 mx-auto mb-4"></div>
        <h2 className="text-2xl font-bold text-white mb-2">EvolveYou</h2>
        <p className="text-white/80">Carregando sua experiência nutricional...</p>
      </div>
    </div>
  );
}

// Protected route component
function ProtectedRoute({ children }) {
  const { currentUser, userProfile, loading } = useAuth();
  
  if (loading) {
    return <LoadingScreen />;
  }
  
  if (!currentUser) {
    return <Navigate to="/auth" replace />;
  }
  
  // Check if user needs onboarding
  if (userProfile && !userProfile.profile?.onboardingCompleted) {
    return <Navigate to="/onboarding" replace />;
  }
  
  // Check if user needs anamnese
  if (userProfile && !userProfile.profile?.anamneseCompleted) {
    return <Navigate to="/anamnese" replace />;
  }
  
  return children;
}

// Public route component (redirect if authenticated)
function PublicRoute({ children }) {
  const { currentUser, userProfile, loading } = useAuth();
  
  if (loading) {
    return <LoadingScreen />;
  }
  
  if (currentUser) {
    // Check if user needs onboarding
    if (userProfile && !userProfile.profile?.onboardingCompleted) {
      return <Navigate to="/onboarding" replace />;
    }
    
    // Check if user needs anamnese
    if (userProfile && !userProfile.profile?.anamneseCompleted) {
      return <Navigate to="/anamnese" replace />;
    }
    
    // User is fully set up, redirect to dashboard
    return <Navigate to="/dashboard" replace />;
  }
  
  return children;
}

// Auth route component (for login/signup)
function AuthRoute({ children }) {
  const { currentUser, userProfile, loading } = useAuth();
  
  if (loading) {
    return <LoadingScreen />;
  }
  
  if (currentUser) {
    // Check if user needs onboarding
    if (userProfile && !userProfile.profile?.onboardingCompleted) {
      return <Navigate to="/onboarding" replace />;
    }
    
    // Check if user needs anamnese
    if (userProfile && !userProfile.profile?.anamneseCompleted) {
      return <Navigate to="/anamnese" replace />;
    }
    
    // User is fully set up, redirect to dashboard
    return <Navigate to="/dashboard" replace />;
  }
  
  return children;
}

// Setup route component (for onboarding/anamnese)
function SetupRoute({ children, requiresAuth = true }) {
  const { currentUser, loading } = useAuth();
  
  if (loading) {
    return <LoadingScreen />;
  }
  
  if (requiresAuth && !currentUser) {
    return <Navigate to="/auth" replace />;
  }
  
  return children;
}

function AppRoutes() {
  return (
    <Routes>
      {/* Public routes */}
      <Route 
        path="/" 
        element={
          <PublicRoute>
            <LandingPage />
          </PublicRoute>
        } 
      />
      
      {/* Auth routes */}
      <Route 
        path="/auth" 
        element={
          <AuthRoute>
            <AuthPage />
          </AuthRoute>
        } 
      />
      
      {/* Setup routes */}
      <Route 
        path="/onboarding" 
        element={
          <SetupRoute>
            <OnboardingPage />
          </SetupRoute>
        } 
      />
      
      <Route 
        path="/anamnese" 
        element={
          <SetupRoute>
            <AnamnesesPage />
          </SetupRoute>
        } 
      />
      
      {/* Protected routes */}
      <Route 
        path="/dashboard" 
        element={
          <ProtectedRoute>
            <DashboardPage />
          </ProtectedRoute>
        } 
      />
      
      <Route 
        path="/profile" 
        element={
          <ProtectedRoute>
            <ProfilePage />
          </ProtectedRoute>
        } 
      />
      
      <Route 
        path="/meal-plans" 
        element={
          <ProtectedRoute>
            <MealPlansPage />
          </ProtectedRoute>
        } 
      />
      
      <Route 
        path="/shopping-list" 
        element={
          <ProtectedRoute>
            <ShoppingListPage />
          </ProtectedRoute>
        } 
      />
      
      <Route 
        path="/reports" 
        element={
          <ProtectedRoute>
            <ReportsPage />
          </ProtectedRoute>
        } 
      />
      
      <Route 
        path="/settings" 
        element={
          <ProtectedRoute>
            <SettingsPage />
          </ProtectedRoute>
        } 
      />
      
      {/* Catch all route */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="App">
          <AppRoutes />
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
