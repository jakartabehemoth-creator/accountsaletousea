import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { GameAccount, Account } from '@/types';
import { Star, Shield, AlertTriangle } from 'lucide-react';

interface AccountCardProps {
  account: Account;
  onPurchase: (accountId: string) => void;
}

export const AccountCard = ({ account, onPurchase }: AccountCardProps) => {
  const getStatusIcon = () => {
    switch (account.status) {
      case 'Fresh':
        return <Star className="w-4 h-4 text-green-500" />;
      case 'First Owner':
        return <Shield className="w-4 h-4 text-blue-500" />;
      case 'Cheated':
        return <AlertTriangle className="w-4 h-4 text-red-500" />;
    }
  };

  const getStatusColor = () => {
    switch (account.status) {
      case 'Fresh':
        return 'bg-green-500/20 text-green-300 border-green-400/30';
      case 'First Owner':
        return 'bg-blue-500/20 text-blue-300 border-blue-400/30';
      case 'Cheated':
        return 'bg-red-500/20 text-red-300 border-red-400/30';
    }
  };

  return (
    <Card className="group transition-all duration-300 hover:scale-105 hover:shadow-lg bg-white/10 backdrop-blur-sm border-white/20 hover:bg-white/20">
      <CardHeader>
        <div className="flex justify-between items-start">
          <CardTitle className="text-white text-lg">{account.gameName}</CardTitle>
          <Badge className={getStatusColor()}>
            <div className="flex items-center gap-1">
              {getStatusIcon()}
              {account.status}
            </div>
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div className="flex justify-between text-sm">
            <span className="text-gray-300">Level:</span>
            <span className="text-white font-semibold">{account.level}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-300">Rank:</span>
            <span className="text-white font-semibold">{account.rank}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-300">Price:</span>
            <span className="text-green-400 font-bold">${account.price}</span>
          </div>
          {account.description && (
            <p className="text-sm text-gray-300 mt-2">{account.description}</p>
          )}
          <Button 
            onClick={() => onPurchase(account.id)}
            className="w-full mt-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
          >
            Proceed to Payment
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};