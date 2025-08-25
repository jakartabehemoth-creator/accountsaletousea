import { useState, useEffect } from 'react';
import { Toaster } from '@/components/ui/sonner';
import { TooltipProvider } from '@/components/ui/tooltip';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { LandingPage } from './pages/LandingPage';
import { GameAccountsPage } from './pages/GameAccountsPage';
import { AuthPage } from './pages/AuthPage';
import { AdminPage } from './pages/AdminPage';
import { getCurrentUser } from './lib/localStorage';

const queryClient = new QueryClient();

type AppView = 'landing' | 'game-accounts' | 'login' | 'register' | 'admin';

const App = () => {
  const [currentView, setCurrentView] = useState<AppView>('landing');
  const [selectedGameId, setSelectedGameId] = useState<string>('');
  const [currentUser, setCurrentUser] = useState(getCurrentUser());

  useEffect(() => {
    const checkUser = () => {
      setCurrentUser(getCurrentUser());
    };

    // Listen for localStorage changes
    window.addEventListener('storage', checkUser);
    
    // Listen for admin panel navigation
    const handleAdminNavigation = () => {
      const user = getCurrentUser();
      if (user && user.role === 'admin') {
        setCurrentView('admin');
      }
    };
    
    window.addEventListener('navigate-admin', handleAdminNavigation);
    
    // Check user status periodically
    const interval = setInterval(checkUser, 1000);

    return () => {
      window.removeEventListener('storage', checkUser);
      window.removeEventListener('navigate-admin', handleAdminNavigation);
      clearInterval(interval);
    };
  }, []);

  const handleGameSelect = (gameId: string) => {
    setSelectedGameId(gameId);
    setCurrentView('game-accounts');
  };

  const handleLogin = () => {
    setCurrentView('login');
  };

  const handleRegister = () => {
    setCurrentView('register');
  };

  const handleAdmin = () => {
    setCurrentView('admin');
  };

  const handleBack = () => {
    // Simply go back to landing page without logging out
    setCurrentView('landing');
    setSelectedGameId('');
  };

  const handleAuthSuccess = () => {
    const user = getCurrentUser();
    setCurrentUser(user);
    
    // If admin user logs in, redirect to admin panel
    if (user && user.role === 'admin') {
      setCurrentView('admin');
    } else {
      setCurrentView('landing');
    }
  };

  const renderCurrentView = () => {
    switch (currentView) {
      case 'landing':
        return (
          <LandingPage
            onGameSelect={handleGameSelect}
            onLogin={handleLogin}
            onRegister={handleRegister}
          />
        );
      case 'game-accounts':
        return (
          <GameAccountsPage
            gameId={selectedGameId}
            onBack={handleBack}
            onLogin={handleLogin}
          />
        );
      case 'login':
        return (
          <AuthPage
            mode="login"
            onBack={handleBack}
            onSuccess={handleAuthSuccess}
          />
        );
      case 'register':
        return (
          <AuthPage
            mode="register"
            onBack={handleBack}
            onSuccess={handleAuthSuccess}
          />
        );
      case 'admin':
        return (
          <AdminPage
            onBack={handleBack}
            onLogin={handleLogin}
          />
        );
      default:
        return (
          <LandingPage
            onGameSelect={handleGameSelect}
            onLogin={handleLogin}
            onRegister={handleRegister}
          />
        );
    }
  };

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        {renderCurrentView()}
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;