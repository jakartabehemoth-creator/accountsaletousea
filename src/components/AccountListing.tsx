import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ArrowLeft, MessageCircle, Shield, ShieldAlert } from 'lucide-react';
import { GameAccount } from '@/types';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

interface AccountListingProps {
  category: string;
  onBack: () => void;
  onPurchase: (account: GameAccount) => void;
}

export const AccountListing: React.FC<AccountListingProps> = ({ category, onBack, onPurchase }) => {
  const [accounts, setAccounts] = useState<GameAccount[]>([]);
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    const storedAccounts = JSON.parse(localStorage.getItem('gameAccounts') || '[]');
    const filteredAccounts = storedAccounts.filter((account: GameAccount) => 
      account.gameType === category && !account.sold
    );
    setAccounts(filteredAccounts);
  }, [category]);

  const handlePurchaseClick = (account: GameAccount) => {
    if (!isAuthenticated) {
      toast.error('Please login to purchase an account');
      return;
    }
    onPurchase(account);
  };

  const getCategoryName = (cat: string) => {
    const names: { [key: string]: string } = {
      'valorant': 'Valorant',
      'bloodstrike': 'Bloodstrike',
      'knives-out': 'Knives Out',
      'farlight': 'Farlight 84'
    };
    return names[cat] || cat;
  };

  return (
    <div className="container mx-auto px-6 py-20">
      <div className="flex items-center mb-8">
        <Button
          onClick={onBack}
          variant="ghost"
          className="text-white hover:bg-white/10 mr-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <h2 className="text-3xl font-bold text-white">
          {getCategoryName(category)} Accounts
        </h2>
      </div>

      {accounts.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-400 text-lg">No accounts available for this category yet.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {accounts.map((account) => (
            <Card key={account.id} className="bg-slate-800/50 backdrop-blur-sm border-slate-700 hover:border-slate-600 transition-all duration-300">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-white text-lg">
                    Level {account.level}
                  </CardTitle>
                  <Badge 
                    variant={account.status === 'fresh' ? 'default' : 'destructive'}
                    className={account.status === 'fresh' ? 'bg-green-600' : 'bg-red-600'}
                  >
                    <div className="flex items-center gap-1">
                      {account.status === 'fresh' ? (
                        <Shield className="h-3 w-3" />
                      ) : (
                        <ShieldAlert className="h-3 w-3" />
                      )}
                      {account.status === 'fresh' ? 'Fresh' : 'Cheated'}
                    </div>
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-gray-400 text-sm">Rank</p>
                  <p className="text-white font-semibold">{account.rank}</p>
                </div>
                
                <div>
                  <p className="text-gray-400 text-sm">Description</p>
                  <p className="text-white text-sm">{account.description}</p>
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-2xl font-bold text-cyan-400">
                      ${account.price}
                    </p>
                    <p className="text-gray-400 text-sm">USD</p>
                  </div>
                  <Button
                    onClick={() => handlePurchaseClick(account)}
                    className="bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600"
                  >
                    <MessageCircle className="h-4 w-4 mr-2" />
                    Purchase
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};