import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import AnimatedBackground from '@/components/AnimatedBackground';
import { GameCard } from '@/components/GameCard';
import { Game, GameAccount, Account } from '@/types';
import { getGames, getAccounts, initializeDefaultData, getCurrentUser, logoutUser } from '@/lib/localStorage';
import { Settings, LogOut } from 'lucide-react';

interface LandingPageProps {
  onGameSelect: (gameId: string) => void;
  onLogin: () => void;
  onRegister: () => void;
}

export const LandingPage = ({ onGameSelect, onLogin, onRegister }: LandingPageProps) => {
  const [games, setGames] = useState<Game[]>([]);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [currentUser, setCurrentUser] = useState(getCurrentUser());

  useEffect(() => {
    initializeDefaultData();
    setGames(getGames());
    setAccounts(getAccounts());
    
    // Listen for user changes
    const checkUser = () => {
      setCurrentUser(getCurrentUser());
    };
    
    window.addEventListener('storage', checkUser);
    const interval = setInterval(checkUser, 1000);
    
    return () => {
      window.removeEventListener('storage', checkUser);
      clearInterval(interval);
    };
  }, []);

  const getAccountCountForGame = (gameId: string) => {
    return accounts.filter(account => account.gameId === gameId).length;
  };

  const handleLogout = () => {
    logoutUser();
    setCurrentUser(null);
  };

  return (
    <div className="min-h-screen relative overflow-hidden">
      <AnimatedBackground />
      
      {/* Header */}
      <header className="relative z-10 p-6 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center overflow-hidden">
            <img src="/favicon1.png" alt="Logo" className="w-6 h-6 object-contain" />
          </div>
          <h1 className="text-2xl font-bold text-white">Account Sale</h1>
        </div>
        
        <div className="flex gap-3">
          {currentUser ? (
            <div className="flex items-center gap-3">
              <span className="text-white">Welcome, {currentUser.username}</span>
              {currentUser.role === 'admin' && (
                <Button 
                  variant="outline" 
                  onClick={() => window.dispatchEvent(new CustomEvent('navigate-admin'))}
                  className="bg-white/10 border-white/30 text-white hover:bg-white/20"
                >
                  <Settings className="w-4 h-4 mr-2" />
                  Admin Panel
                </Button>
              )}
              <Button 
                variant="outline" 
                onClick={handleLogout}
                className="bg-red-500/10 border-red-400/30 text-red-300 hover:bg-red-500/20"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </Button>
            </div>
          ) : (
            <>
              <Button variant="outline" onClick={onLogin} className="bg-white/10 border-white/30 text-white hover:bg-white/20">
                Login
              </Button>
              <Button onClick={onRegister} className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
                Register
              </Button>
            </>
          )}
        </div>
      </header>

      {/* Hero Section */}
      <main className="relative z-10 px-6 py-12">
        <div className="text-center mb-16">
          <h2 className="text-5xl font-bold text-white mb-6 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
            Premium Gaming Accounts
          </h2>
          <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
            Discover high-quality gaming accounts from top games. Secure transactions, verified sellers, and instant delivery.
          </p>
        </div>

        {/* Games Section */}
        <div className="max-w-6xl mx-auto">
          <h3 className="text-3xl font-bold text-white text-center mb-12">Available Games</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {games.map((game) => (
              <GameCard
                key={game.id}
                game={game}
                accountCount={getAccountCountForGame(game.id)}
                onClick={() => onGameSelect(game.id)}
              />
            ))}
          </div>
        </div>
      </main>
    </div>
  );
};
