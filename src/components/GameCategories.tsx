import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Gamepad2, Trophy, Star, Zap } from 'lucide-react';
import { GameAccount } from '@/types';

interface GameCategoriesProps {
  onCategorySelect: (category: string) => void;
}

const gameCategories = [
  {
    id: 'valorant',
    name: 'Valorant',
    icon: <Trophy className="h-8 w-8" />,
    description: 'Valorant Cheap Account',
    color: 'from-red-500 to-orange-500'
  },
  {
    id: 'bloodstrike',
    name: 'Bloodstrike',
    icon: <Zap className="h-8 w-8" />,
    description: 'Bloodstrike Cheap Account',
    color: 'from-purple-500 to-pink-500'
  },
  {
    id: 'knives-out',
    name: 'Knives Out',
    icon: <Star className="h-8 w-8" />,
    description: 'Knives out Cheap Account',
    color: 'from-green-500 to-emerald-500'
  },
  {
    id: 'farlight',
    name: 'Farlight',
    icon: <Gamepad2 className="h-8 w-8" />,
    description: 'Farlight 84 Cheap Account',
    color: 'from-blue-500 to-cyan-500'
  }
];

export const GameCategories: React.FC<GameCategoriesProps> = ({ onCategorySelect }) => {
  const [gameIcons, setGameIcons] = useState<{[key: string]: string | null}>({});
  const [accountCounts, setAccountCounts] = useState<{[key: string]: number}>({});

  useEffect(() => {
    // Load custom icons
    const icons = JSON.parse(localStorage.getItem('gameIcons') || '{}');
    setGameIcons(icons);
    
    // Load account counts
    const accounts: GameAccount[] = JSON.parse(localStorage.getItem('gameAccounts') || '[]');
    const counts = {
      valorant: accounts.filter(acc => acc.gameType === 'valorant' && !acc.sold).length,
      bloodstrike: accounts.filter(acc => acc.gameType === 'bloodstrike' && !acc.sold).length,
      'knives-out': accounts.filter(acc => acc.gameType === 'knives-out' && !acc.sold).length,
      farlight: accounts.filter(acc => acc.gameType === 'farlight' && !acc.sold).length
    };
    setAccountCounts(counts);
  }, []);

  return (
    <div className="container mx-auto px-6 py-20">
      <div className="text-center mb-12">
        <h2 className="text-4xl font-bold text-white mb-4">
          Choose Your Game
        </h2>
        <p className="text-gray-300 text-lg">
          Choose your game to buy we have your favorite games here
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {gameCategories.map((category) => (
          <Card key={category.id} className="bg-slate-800/50 backdrop-blur-sm border-slate-700 hover:border-slate-600 transition-all duration-300 group hover:scale-105">
            <CardHeader className="text-center">
              <div className={`mx-auto w-16 h-16 rounded-full bg-gradient-to-r ${category.color} flex items-center justify-center text-white mb-4 group-hover:scale-110 transition-transform overflow-hidden`}>
                {gameIcons[category.id] ? (
                  <img 
                    src={gameIcons[category.id]} 
                    alt={category.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  category.icon
                )}
              </div>
              <CardTitle className="text-white text-xl">{category.name}</CardTitle>
            </CardHeader>
            <CardContent className="text-center space-y-4">
              <p className="text-gray-400 text-sm">{category.description}</p>
              <Badge variant="secondary" className="bg-slate-700 text-gray-300">
                {accountCounts[category.id] || 0} Available
              </Badge>
              <Button
                onClick={() => onCategorySelect(category.id)}
                className={`w-full bg-gradient-to-r ${category.color} hover:opacity-90 transition-opacity`}
                disabled={!accountCounts[category.id]}
              >
                {accountCounts[category.id] ? 'Browse Accounts' : 'No Accounts Yet'}
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};