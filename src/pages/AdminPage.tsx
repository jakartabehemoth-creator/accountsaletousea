import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import AnimatedBackground from '@/components/AnimatedBackground';
import { Game, GameAccount, User, PaymentMethod } from '@/types';
import { getCurrentUser } from '@/lib/localStorage';
import { apiStorage } from '@/lib/apiStorage';
import { ArrowLeft, Plus, Trash, Users, Gamepad2, CreditCard, Settings } from 'lucide-react';
import { toast } from 'sonner';

interface AdminPageProps {
  onBack: () => void;
  onLogin: () => void;
}

interface AccountFormData {
  gameId: string;
  level: string;
  rank: string;
  status: 'Fresh' | 'First Owner' | 'Cheated';
  price: string;
  description: string;
}

const GameForm = ({ onSubmit, onCancel }: { onSubmit: (data: { name: string }) => void; onCancel: () => void }) => {
  const [name, setName] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim()) {
      onSubmit({ name: name.trim() });
      setName('');
    }
  };

  return (
    <Card className="bg-white/10 backdrop-blur-sm border-white/20">
      <CardHeader>
        <CardTitle className="text-white">Add New Game</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="gameName" className="text-white">Game Name</Label>
            <Input
              id="gameName"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="bg-white/20 border-white/30 text-white"
              placeholder="Enter game name"
              required
            />
          </div>
          <div className="flex gap-3">
            <Button type="submit" className="bg-green-600 hover:bg-green-700">
              Add Game
            </Button>
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancel
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

const AccountForm = ({ games, onSubmit, onCancel }: { 
  games: Game[]; 
  onSubmit: (data: AccountFormData) => void; 
  onCancel: () => void;
}) => {
  const [formData, setFormData] = useState<AccountFormData>({
    gameId: '',
    level: '',
    rank: '',
    status: 'Fresh',
    price: '',
    description: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.gameId && formData.level && formData.rank && formData.price) {
      onSubmit(formData);
      setFormData({
        gameId: '',
        level: '',
        rank: '',
        status: 'Fresh',
        price: '',
        description: '',
      });
    }
  };

  const handleChange = (field: keyof AccountFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <Card className="bg-white/10 backdrop-blur-sm border-white/20">
      <CardHeader>
        <CardTitle className="text-white">Add New Account</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="gameId" className="text-white">Game</Label>
            <Select value={formData.gameId} onValueChange={(value) => handleChange('gameId', value)}>
              <SelectTrigger className="bg-white/20 border-white/30">
                <SelectValue placeholder="Select a game" />
              </SelectTrigger>
              <SelectContent>
                {games.map((game) => (
                  <SelectItem key={game.id} value={game.id}>
                    {game.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="level" className="text-white">Level</Label>
              <Input
                id="level"
                type="number"
                value={formData.level}
                onChange={(e) => handleChange('level', e.target.value)}
                className="bg-white/20 border-white/30 text-white"
                placeholder="Account level"
                required
              />
            </div>
            <div>
              <Label htmlFor="rank" className="text-white">Rank</Label>
              <Input
                id="rank"
                value={formData.rank}
                onChange={(e) => handleChange('rank', e.target.value)}
                className="bg-white/20 border-white/30 text-white"
                placeholder="Account rank"
                required
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="status" className="text-white">Status</Label>
              <Select 
                value={formData.status} 
                onValueChange={(value: 'Fresh' | 'First Owner' | 'Cheated') => handleChange('status', value)}
              >
                <SelectTrigger className="bg-white/20 border-white/30">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Fresh">Fresh</SelectItem>
                  <SelectItem value="First Owner">First Owner</SelectItem>
                  <SelectItem value="Cheated">Cheated</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="price" className="text-white">Price ($)</Label>
              <Input
                id="price"
                type="number"
                step="0.01"
                value={formData.price}
                onChange={(e) => handleChange('price', e.target.value)}
                className="bg-white/20 border-white/30 text-white"
                placeholder="Price in USD"
                required
              />
            </div>
          </div>
          <div>
            <Label htmlFor="description" className="text-white">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleChange('description', e.target.value)}
              className="bg-white/20 border-white/30 text-white"
              placeholder="Account description (optional)"
              rows={3}
            />
          </div>
          <div className="flex gap-3">
            <Button type="submit" className="bg-green-600 hover:bg-green-700">
              Add Account
            </Button>
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancel
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

const PaymentForm = ({ onSubmit, onCancel }: { 
  onSubmit: (data: { name: string; details: string }) => void; 
  onCancel: () => void;
}) => {
  const [formData, setFormData] = useState({
    name: '',
    details: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.name.trim() && formData.details.trim()) {
      onSubmit(formData);
      setFormData({ name: '', details: '' });
    }
  };

  return (
    <Card className="bg-white/10 backdrop-blur-sm border-white/20">
      <CardHeader>
        <CardTitle className="text-white">Add Payment Method</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="methodName" className="text-white">Method Name</Label>
            <Input
              id="methodName"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              className="bg-white/20 border-white/30 text-white"
              placeholder="Payment method name"
              required
            />
          </div>
          <div>
            <Label htmlFor="methodDetails" className="text-white">Details</Label>
            <Textarea
              id="methodDetails"
              value={formData.details}
              onChange={(e) => setFormData(prev => ({ ...prev, details: e.target.value }))}
              className="bg-white/20 border-white/30 text-white"
              placeholder="Payment method details"
              required
            />
          </div>
          <div className="flex gap-3">
            <Button type="submit" className="bg-green-600 hover:bg-green-700">
              Add Method
            </Button>
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancel
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export const AdminPage = ({ onBack, onLogin }: AdminPageProps) => {
  const [games, setGamesState] = useState<Game[]>([]);
  const [accounts, setAccountsState] = useState<GameAccount[]>([]);
  const [users, setUsersState] = useState<User[]>([]);
  const [paymentMethods, setPaymentMethodsState] = useState<PaymentMethod[]>([]);
  const [activeTab, setActiveTab] = useState('games');
  const [showAddForm, setShowAddForm] = useState(false);

  const currentUser = getCurrentUser();

  useEffect(() => {
    if (!currentUser || currentUser.role !== 'admin') {
      toast.error('Access denied. Admin privileges required.');
      onLogin();
      return;
    }
    loadData();
  }, [currentUser, onLogin]);

  const loadData = async () => {
    try {
      const [gamesData, accountsData, usersData, paymentMethodsData] = await Promise.all([
        apiStorage.getGames(),
        apiStorage.getAccounts(), 
        apiStorage.getUsers(),
        apiStorage.getPaymentMethods()
      ]);
      
      setGamesState(gamesData);
      setAccountsState(accountsData);
      setUsersState(usersData);
      setPaymentMethodsState(paymentMethodsData);
    } catch (error) {
      console.error('Failed to load data:', error);
      toast.error('Failed to load admin data');
    }
  };

  if (!currentUser || currentUser.role !== 'admin') {
    return null;
  }

  const handleAddGame = async (gameData: { name: string }) => {
    try {
      const newGame = await apiStorage.createGame(gameData.name);
      if (newGame) {
        const updatedGames = [...games, newGame];
        setGamesState(updatedGames);
        setShowAddForm(false);
        toast.success('Game added successfully!');
      }
    } catch (error) {
      console.error('Failed to add game:', error);
      toast.error('Failed to add game');
    }
  };

  const handleAddAccount = async (accountData: AccountFormData) => {
    try {
      const newAccount = await apiStorage.createAccount(accountData);
      if (newAccount) {
        const updatedAccounts = [...accounts, newAccount];
        setAccountsState(updatedAccounts);
        setShowAddForm(false);
        toast.success('Account added successfully!');
      }
    } catch (error) {
      console.error('Failed to add account:', error);
      toast.error('Failed to add account');
    }
  };

  const handlePromoteUser = async (userId: string, newRole: 'admin' | 'moderator' | 'user') => {
    try {
      const success = await apiStorage.updateUserRole(userId, newRole);
      if (success) {
        const updatedUsers = users.map(user => 
          user.id === userId ? { ...user, role: newRole } : user
        );
        setUsersState(updatedUsers);
        toast.success(`User role updated to ${newRole}!`);
      }
    } catch (error) {
      console.error('Failed to update user role:', error);
      toast.error('Failed to update user role');
    }
  };

  const handleAddPaymentMethod = async (methodData: { name: string; details: string }) => {
    try {
      const newMethod = await apiStorage.createPaymentMethod(methodData.name, methodData.details);
      if (newMethod) {
        const updatedMethods = [...paymentMethods, newMethod];
        setPaymentMethodsState(updatedMethods);
        setShowAddForm(false);
        toast.success('Payment method added successfully!');
      }
    } catch (error) {
      console.error('Failed to add payment method:', error);
      toast.error('Failed to add payment method');
    }
  };

  const handleDelete = async (id: string, type: 'game' | 'account' | 'user' | 'payment') => {
    try {
      switch (type) {
        case 'game': {
          await apiStorage.deleteGame(id);
          const updatedGames = games.filter(g => g.id !== id);
          setGamesState(updatedGames);
          break;
        }
        case 'account': {
          await apiStorage.deleteAccount(id);
          const updatedAccounts = accounts.filter(a => a.id !== id);
          setAccountsState(updatedAccounts);
          break;
        }
        case 'payment': {
          await apiStorage.deletePaymentMethod(id);
          const updatedMethods = paymentMethods.filter(p => p.id !== id);
          setPaymentMethodsState(updatedMethods);
          break;
        }
      }
      toast.success('Item deleted successfully!');
    } catch (error) {
      console.error('Failed to delete item:', error);
      toast.error('Failed to delete item');
    }
  };

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
            <Settings className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-white">Admin Panel</h1>
        </div>
        
        <Badge variant="secondary" className="bg-red-500/20 text-red-300 border-red-400/30">
          Admin Access
        </Badge>
      </header>

      {/* Content */}
      <main className="relative z-10 px-6 py-12">
        <div className="max-w-6xl mx-auto">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-4 bg-white/10 backdrop-blur-sm">
              <TabsTrigger value="games" className="data-[state=active]:bg-blue-600">
                <Gamepad2 className="w-4 h-4 mr-2" />
                Games
              </TabsTrigger>
              <TabsTrigger value="accounts" className="data-[state=active]:bg-blue-600">
                <Settings className="w-4 h-4 mr-2" />
                Accounts
              </TabsTrigger>
              <TabsTrigger value="users" className="data-[state=active]:bg-blue-600">
                <Users className="w-4 h-4 mr-2" />
                Users
              </TabsTrigger>
              <TabsTrigger value="payments" className="data-[state=active]:bg-blue-600">
                <CreditCard className="w-4 h-4 mr-2" />
                Payments
              </TabsTrigger>
            </TabsList>

            <TabsContent value="games" className="space-y-6">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-white">Manage Games</h2>
                <Button onClick={() => setShowAddForm(true)} className="bg-green-600 hover:bg-green-700">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Game
                </Button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {games.map((game) => (
                  <Card key={game.id} className="bg-white/10 backdrop-blur-sm border-white/20">
                    <CardHeader>
                      <CardTitle className="text-white flex justify-between items-center">
                        {game.name}
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => handleDelete(game.id, 'game')}
                          className="text-red-400 hover:bg-red-500/20"
                        >
                          <Trash className="w-4 h-4" />
                        </Button>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-gray-300 text-sm">
                        Accounts: {accounts.filter(a => a.gameId === game.id).length}
                      </p>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {showAddForm && activeTab === 'games' && (
                <GameForm onSubmit={handleAddGame} onCancel={() => setShowAddForm(false)} />
              )}
            </TabsContent>

            <TabsContent value="accounts" className="space-y-6">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-white">Manage Accounts</h2>
                <Button onClick={() => setShowAddForm(true)} className="bg-green-600 hover:bg-green-700">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Account
                </Button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {accounts.map((account) => (
                  <Card key={account.id} className="bg-white/10 backdrop-blur-sm border-white/20">
                    <CardHeader>
                      <CardTitle className="text-white flex justify-between items-center text-sm">
                        {account.gameName}
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => handleDelete(account.id, 'account')}
                          className="text-red-400 hover:bg-red-500/20"
                        >
                          <Trash className="w-4 h-4" />
                        </Button>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-300">Level:</span>
                        <span className="text-white">{account.level}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-300">Rank:</span>
                        <span className="text-white">{account.rank}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-300">Price:</span>
                        <span className="text-green-400">${account.price}</span>
                      </div>
                      <Badge className="w-fit">{account.status}</Badge>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {showAddForm && activeTab === 'accounts' && (
                <AccountForm 
                  games={games}
                  onSubmit={handleAddAccount} 
                  onCancel={() => setShowAddForm(false)} 
                />
              )}
            </TabsContent>

            <TabsContent value="users" className="space-y-6">
              <h2 className="text-2xl font-bold text-white">Manage Users</h2>
              
              <div className="grid gap-4">
                {users.map((user) => (
                  <Card key={user.id} className="bg-white/10 backdrop-blur-sm border-white/20">
                    <CardContent className="p-6 flex justify-between items-center">
                      <div>
                        <h3 className="text-white font-semibold">{user.username}</h3>
                        <p className="text-gray-300 text-sm">{user.email}</p>
                        <p className="text-gray-400 text-xs">
                          Joined: {new Date(user.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="flex items-center gap-3">
                        <Badge className={
                          user.role === 'admin' ? 'bg-red-500/20 text-red-300' :
                          user.role === 'moderator' ? 'bg-yellow-500/20 text-yellow-300' :
                          'bg-blue-500/20 text-blue-300'
                        }>
                          {user.role}
                        </Badge>
                        <Select 
                          value={user.role} 
                          onValueChange={(role: 'admin' | 'moderator' | 'user') => 
                            handlePromoteUser(user.id, role)
                          }
                        >
                          <SelectTrigger className="w-32 bg-white/20 border-white/30">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="user">User</SelectItem>
                            <SelectItem value="moderator">Moderator</SelectItem>
                            <SelectItem value="admin">Admin</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="payments" className="space-y-6">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-white">Payment Methods</h2>
                <Button onClick={() => setShowAddForm(true)} className="bg-green-600 hover:bg-green-700">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Payment Method
                </Button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {paymentMethods.map((method) => (
                  <Card key={method.id} className="bg-white/10 backdrop-blur-sm border-white/20">
                    <CardHeader>
                      <CardTitle className="text-white flex justify-between items-center">
                        <div className="flex items-center gap-2">
                          <span>{method.icon}</span>
                          {method.name}
                        </div>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => handleDelete(method.id, 'payment')}
                          className="text-red-400 hover:bg-red-500/20"
                        >
                          <Trash className="w-4 h-4" />
                        </Button>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-gray-300 text-sm">{method.details}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {showAddForm && activeTab === 'payments' && (
                <PaymentForm onSubmit={handleAddPaymentMethod} onCancel={() => setShowAddForm(false)} />
              )}
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  );
};