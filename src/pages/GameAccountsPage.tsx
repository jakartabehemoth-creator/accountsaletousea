import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import AnimatedBackground from '@/components/AnimatedBackground';
import { AccountCard } from '@/components/AccountCard';
import { ChatWindow } from '@/components/ChatWindow';
import { Game, GameAccount } from '@/types';
import { getGames, getAccounts, getCurrentUser } from '@/lib/localStorage';
import { ArrowLeft, Gamepad2 } from 'lucide-react';

interface GameAccountsPageProps {
  gameId: string;
  onBack: () => void;
  onLogin: () => void;
}

export const GameAccountsPage = ({ gameId, onBack, onLogin }: GameAccountsPageProps) => {
  const [game, setGame] = useState<Game | null>(null);
  const [accounts, setAccounts] = useState<GameAccount[]>([]);
  const [selectedAccount, setSelectedAccount] = useState<string | null>(null);
  const currentUser = getCurrentUser();

  useEffect(() => {
    const games = getGames();
    const foundGame = games.find(g => g.id === gameId);
    setGame(foundGame || null);

    const allAccounts = getAccounts();
    const gameAccounts = allAccounts.filter(account => account.gameId === gameId);
    setAccounts(gameAccounts);
  }, [gameId]);

  const handlePurchase = (accountId: string) => {
    if (!currentUser) {
      onLogin();
      return;
    }
    setSelectedAccount(accountId);
  };

  const handleCloseChat = () => {
    setSelectedAccount(null);
  };

  if (!game) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-white">Game not found</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative overflow-hidden">
      <AnimatedBackground />
      
      {/* Header */}
      <header className="relative z-10 p-6 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <Button variant="ghost" onClick={onBack} className="text-white hover:bg-white/10">
            <ArrowLeft className="w-5 h-5 mr-2" />
            Back
          </Button>
          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
            <Gamepad2 className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-white">{game.name} Accounts</h1>
        </div>
        
        <div className="flex items-center gap-3">
          <Badge variant="secondary" className="bg-blue-500/20 text-blue-300 border-blue-400/30">
            {accounts.length} Available
          </Badge>
          {currentUser && (
            <span className="text-white">Welcome, {currentUser.username}</span>
          )}
        </div>
      </header>

      {/* Content */}
      <main className="relative z-10 px-6 py-12">
        {accounts.length === 0 ? (
          <div className="text-center text-white">
            <h2 className="text-2xl font-bold mb-4">No accounts available</h2>
            <p className="text-gray-300">Check back later for new accounts!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {accounts.map((account) => (
              <AccountCard
                key={account.id}
                account={account}
                onPurchase={handlePurchase}
              />
            ))}
          </div>
        )}
      </main>

      {/* Chat Window */}
      {selectedAccount && (
        <ChatWindow
          accountId={selectedAccount}
          onClose={handleCloseChat}
        />
      )}
    </div>
  );
};