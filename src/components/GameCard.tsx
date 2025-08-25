import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Game, GameAccount } from '@/types';

interface GameCardProps {
  game: Game;
  accountCount: number;
  onClick: () => void;
}

export const GameCard = ({ game, accountCount, onClick }: GameCardProps) => {
  return (
    <Card 
      className="group cursor-pointer transition-all duration-300 hover:scale-105 hover:shadow-lg bg-white/10 backdrop-blur-sm border-white/20 hover:bg-white/20"
      onClick={onClick}
    >
      <CardContent className="p-6 text-center">
        <div className="mb-4 flex justify-center">
          <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-2xl font-bold text-white">
            {game.name.charAt(0)}
          </div>
        </div>
        <h3 className="text-lg font-semibold text-white mb-2 group-hover:text-blue-300 transition-colors">
          {game.name}
        </h3>
        <Badge variant="secondary" className="bg-blue-500/20 text-blue-300 border-blue-400/30">
          {accountCount} Accounts
        </Badge>
      </CardContent>
    </Card>
  );
};