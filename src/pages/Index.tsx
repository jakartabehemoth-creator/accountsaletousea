import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Search, Star, Shield, Users, Gamepad2 } from 'lucide-react';
import { storage } from '@/lib/storage';
import { Game, Account } from '@/types';
import Layout from '@/components/Layout';

export default function HomePage() {
  const [games, setGames] = useState<Game[]>([]);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedGame, setSelectedGame] = useState<string>('');

  useEffect(() => {
    setGames(storage.getGames());
    setAccounts(storage.getAccounts());
  }, []);

  const filteredAccounts = accounts.filter(account => {
    const matchesSearch = account.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         games.find(g => g.id === account.gameId)?.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesGame = selectedGame ? account.gameId === selectedGame : true;
    return matchesSearch && matchesGame && account.isAvailable;
  });

  const getGameName = (gameId: string) => {
    return games.find(g => g.id === gameId)?.name || 'Unknown Game';
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        {/* Hero Section */}
        <div className="text-center py-16 mb-12">
          <h1 className="text-6xl font-bold mb-6 bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 bg-clip-text text-transparent">
            Premium Gaming Accounts
          </h1>
          <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
            Discover high-quality gaming accounts from trusted sellers. Level up your gaming experience instantly.
          </p>
          
          <div className="flex justify-center space-x-8 text-gray-300">
            <div className="flex items-center space-x-2">
              <Shield className="w-5 h-5 text-blue-400" />
              <span>Secure Transactions</span>
            </div>
            <div className="flex items-center space-x-2">
              <Users className="w-5 h-5 text-green-400" />
              <span>24/7 Support</span>
            </div>
            <div className="flex items-center space-x-2">
              <Star className="w-5 h-5 text-yellow-400" />
              <span>Premium Quality</span>
            </div>
          </div>
        </div>

        {/* Search and Filter */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row gap-4 max-w-2xl mx-auto">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Search accounts or games..."
                className="pl-10 bg-black/40 border-gray-700 text-white placeholder-gray-400"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <select
              className="px-4 py-2 bg-black/40 border border-gray-700 rounded-md text-white"
              value={selectedGame}
              onChange={(e) => setSelectedGame(e.target.value)}
            >
              <option value="">All Games</option>
              {games.map(game => (
                <option key={game.id} value={game.id}>{game.name}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Games Grid */}
        <div className="mb-12">
          <h2 className="text-3xl font-bold text-white mb-6 flex items-center">
            <Gamepad2 className="w-8 h-8 mr-3 text-blue-400" />
            Available Games
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {games.map(game => {
              const gameAccounts = accounts.filter(a => a.gameId === game.id && a.isAvailable);
              return (
                <Card 
                  key={game.id} 
                  className="bg-black/40 border-gray-700 hover:border-blue-500 transition-all cursor-pointer group"
                  onClick={() => setSelectedGame(selectedGame === game.id ? '' : game.id)}
                >
                  <CardContent className="p-6 text-center">
                    <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                      <Gamepad2 className="w-8 h-8 text-white" />
                    </div>
                    <h3 className="font-semibold text-white mb-2">{game.name}</h3>
                    <Badge variant="secondary" className="bg-gray-700 text-gray-300">
                      {gameAccounts.length} accounts
                    </Badge>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>

        {/* Accounts Grid */}
        {filteredAccounts.length > 0 ? (
          <div>
            <h2 className="text-3xl font-bold text-white mb-6">
              {selectedGame ? `${getGameName(selectedGame)} Accounts` : 'All Accounts'}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredAccounts.map(account => (
                <Card key={account.id} className="bg-black/40 border-gray-700 hover:border-blue-500 transition-all">
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <CardTitle className="text-white">{getGameName(account.gameId)}</CardTitle>
                      <Badge 
                        variant={account.status === 'Fresh' ? 'default' : 
                                account.status === 'First Owner' ? 'secondary' : 'destructive'}
                      >
                        {account.status}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="text-gray-300">
                      <p><span className="font-medium">Level:</span> {account.level}</p>
                      <p><span className="font-medium">Rank:</span> {account.rank}</p>
                      <p className="text-sm mt-2">{account.description}</p>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <span className="text-2xl font-bold text-green-400">${account.price}</span>
                      <Link to={`/account/${account.id}`}>
                        <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
                          View Details
                        </Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        ) : (
          <div className="text-center py-16">
            <Gamepad2 className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-400 mb-2">No accounts found</h3>
            <p className="text-gray-500">
              {searchTerm || selectedGame 
                ? 'Try adjusting your search or filter criteria.' 
                : 'No accounts are currently available. Check back later!'}
            </p>
          </div>
        )}
      </div>
    </Layout>
  );
}
