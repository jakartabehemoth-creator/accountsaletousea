import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from '@/components/ui/dialog';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  Plus, 
  Edit, 
  Trash2, 
  Users, 
  Gamepad2, 
  ShoppingCart, 
  CreditCard,
  Shield,
  UserCheck
} from 'lucide-react';
import { storage } from '@/lib/storage';
import { Game, Account, User, PaymentMethod } from '@/types';
import Layout from '@/components/Layout';

export default function AdminPage() {
  const navigate = useNavigate();
  const currentUser = storage.getCurrentUser();
  
  const [games, setGames] = useState<Game[]>([]);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  
  const [showGameDialog, setShowGameDialog] = useState(false);
  const [showAccountDialog, setShowAccountDialog] = useState(false);
  const [showPaymentDialog, setShowPaymentDialog] = useState(false);
  const [editingItem, setEditingItem] = useState<Account | null>(null);

  useEffect(() => {
    if (!currentUser || (currentUser.role !== 'admin' && currentUser.role !== 'moderator')) {
      navigate('/');
      return;
    }
    loadData();
  }, [currentUser, navigate]);

  const loadData = () => {
    setGames(storage.getGames());
    setAccounts(storage.getAccounts());
    setUsers(storage.getUsers());
    setPaymentMethods(storage.getPaymentMethods());
  };

  const handleAddGame = (formData: FormData) => {
    const name = formData.get('name') as string;
    
    const newGame: Game = {
      id: Date.now().toString(),
      name,
      icon: '/assets/game-default.png',
      createdAt: new Date().toISOString()
    };

    const updatedGames = [...games, newGame];
    storage.saveGames(updatedGames);
    setGames(updatedGames);
    setShowGameDialog(false);
  };

  const handleAddAccount = (formData: FormData) => {
    const gameId = formData.get('gameId') as string;
    const level = formData.get('level') as string;
    const rank = formData.get('rank') as string;
    const status = formData.get('status') as 'Fresh' | 'First Owner' | 'Cheated';
    const price = parseFloat(formData.get('price') as string);
    const description = formData.get('description') as string;

    const newAccount: Account = {
      id: editingItem?.id || Date.now().toString(),
      gameId,
      level,
      rank,
      status,
      price,
      description,
      images: [],
      isAvailable: true,
      createdAt: editingItem?.createdAt || new Date().toISOString()
    };

    let updatedAccounts;
    if (editingItem) {
      updatedAccounts = accounts.map(a => a.id === editingItem.id ? newAccount : a);
    } else {
      updatedAccounts = [...accounts, newAccount];
    }

    storage.saveAccounts(updatedAccounts);
    setAccounts(updatedAccounts);
    setShowAccountDialog(false);
    setEditingItem(null);
  };

  const handleDeleteAccount = (id: string) => {
    if (confirm('Are you sure you want to delete this account?')) {
      const updatedAccounts = accounts.filter(a => a.id !== id);
      storage.saveAccounts(updatedAccounts);
      setAccounts(updatedAccounts);
    }
  };

  const handlePromoteUser = (userId: string, newRole: 'admin' | 'moderator' | 'user') => {
    const updatedUsers = users.map(u => 
      u.id === userId ? { ...u, role: newRole } : u
    );
    storage.saveUsers(updatedUsers);
    setUsers(updatedUsers);
  };

  const handleAddPaymentMethod = (formData: FormData) => {
    const name = formData.get('name') as string;
    
    const newPaymentMethod: PaymentMethod = {
      id: Date.now().toString(),
      name,
      icon: '/assets/payment-default.png',
      isActive: true
    };

    const updatedMethods = [...paymentMethods, newPaymentMethod];
    storage.savePaymentMethods(updatedMethods);
    setPaymentMethods(updatedMethods);
    setShowPaymentDialog(false);
  };

  const togglePaymentMethod = (id: string) => {
    const updatedMethods = paymentMethods.map(pm => 
      pm.id === id ? { ...pm, isActive: !pm.isActive } : pm
    );
    storage.savePaymentMethods(updatedMethods);
    setPaymentMethods(updatedMethods);
  };

  if (!currentUser || (currentUser.role !== 'admin' && currentUser.role !== 'moderator')) {
    return null;
  }

  const getGameName = (gameId: string) => {
    return games.find(g => g.id === gameId)?.name || 'Unknown Game';
  };

  const isAdmin = currentUser.role === 'admin';

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">
            {isAdmin ? 'Admin Panel' : 'Moderator Panel'}
          </h1>
          <p className="text-gray-400">
            Manage games, accounts, {isAdmin ? 'users, and payment methods' : 'and view statistics'}
          </p>
        </div>

        <Tabs defaultValue="accounts" className="space-y-6">
          <TabsList className="bg-black/40 border-gray-700">
            <TabsTrigger value="accounts" className="data-[state=active]:bg-blue-600">
              <ShoppingCart className="w-4 h-4 mr-2" />
              Accounts
            </TabsTrigger>
            <TabsTrigger value="games" className="data-[state=active]:bg-blue-600">
              <Gamepad2 className="w-4 h-4 mr-2" />
              Games
            </TabsTrigger>
            {isAdmin && (
              <>
                <TabsTrigger value="users" className="data-[state=active]:bg-blue-600">
                  <Users className="w-4 h-4 mr-2" />
                  Users
                </TabsTrigger>
                <TabsTrigger value="payments" className="data-[state=active]:bg-blue-600">
                  <CreditCard className="w-4 h-4 mr-2" />
                  Payments
                </TabsTrigger>
              </>
            )}
          </TabsList>

          {/* Accounts Management */}
          <TabsContent value="accounts" className="space-y-6">
            <Card className="bg-black/40 border-gray-700">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-white">Account Management</CardTitle>
                <Dialog open={showAccountDialog} onOpenChange={setShowAccountDialog}>
                  <DialogTrigger asChild>
                    <Button className="bg-blue-600 hover:bg-blue-700">
                      <Plus className="w-4 h-4 mr-2" />
                      Add Account
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="bg-black/90 border-gray-700 text-white">
                    <DialogHeader>
                      <DialogTitle>
                        {editingItem ? 'Edit Account' : 'Add New Account'}
                      </DialogTitle>
                    </DialogHeader>
                    <form action={handleAddAccount} className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="gameId">Game</Label>
                          <Select name="gameId" defaultValue={editingItem?.gameId}>
                            <SelectTrigger className="bg-black/40 border-gray-700">
                              <SelectValue placeholder="Select a game" />
                            </SelectTrigger>
                            <SelectContent className="bg-black/90 border-gray-700">
                              {games.map(game => (
                                <SelectItem key={game.id} value={game.id}>
                                  {game.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label htmlFor="status">Status</Label>
                          <Select name="status" defaultValue={editingItem?.status || 'Fresh'}>
                            <SelectTrigger className="bg-black/40 border-gray-700">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent className="bg-black/90 border-gray-700">
                              <SelectItem value="Fresh">Fresh</SelectItem>
                              <SelectItem value="First Owner">First Owner</SelectItem>
                              <SelectItem value="Cheated">Cheated</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-3 gap-4">
                        <div>
                          <Label htmlFor="level">Level</Label>
                          <Input
                            name="level"
                            defaultValue={editingItem?.level}
                            className="bg-black/40 border-gray-700"
                            required
                          />
                        </div>
                        <div>
                          <Label htmlFor="rank">Rank</Label>
                          <Input
                            name="rank"
                            defaultValue={editingItem?.rank}
                            className="bg-black/40 border-gray-700"
                            required
                          />
                        </div>
                        <div>
                          <Label htmlFor="price">Price ($)</Label>
                          <Input
                            name="price"
                            type="number"
                            step="0.01"
                            defaultValue={editingItem?.price}
                            className="bg-black/40 border-gray-700"
                            required
                          />
                        </div>
                      </div>
                      
                      <div>
                        <Label htmlFor="description">Description</Label>
                        <Textarea
                          name="description"
                          defaultValue={editingItem?.description}
                          className="bg-black/40 border-gray-700"
                          rows={3}
                        />
                      </div>
                      
                      <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700">
                        {editingItem ? 'Update Account' : 'Add Account'}
                      </Button>
                    </form>
                  </DialogContent>
                </Dialog>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {accounts.map(account => (
                    <div key={account.id} className="flex items-center justify-between p-4 bg-gray-800/50 rounded-lg">
                      <div className="space-y-1">
                        <div className="flex items-center space-x-2">
                          <span className="font-medium text-white">
                            {getGameName(account.gameId)} - Level {account.level}
                          </span>
                          <Badge variant={account.status === 'Fresh' ? 'default' : 
                                         account.status === 'First Owner' ? 'secondary' : 'destructive'}>
                            {account.status}
                          </Badge>
                          <Badge variant={account.isAvailable ? 'default' : 'secondary'}>
                            {account.isAvailable ? 'Available' : 'Sold'}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-400">
                          Rank: {account.rank} • Price: ${account.price}
                        </p>
                      </div>
                      <div className="flex space-x-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setEditingItem(account);
                            setShowAccountDialog(true);
                          }}
                          className="text-blue-400 hover:text-blue-300"
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteAccount(account.id)}
                          className="text-red-400 hover:text-red-300"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Games Management */}
          <TabsContent value="games" className="space-y-6">
            <Card className="bg-black/40 border-gray-700">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-white">Games Management</CardTitle>
                {isAdmin && (
                  <Dialog open={showGameDialog} onOpenChange={setShowGameDialog}>
                    <DialogTrigger asChild>
                      <Button className="bg-blue-600 hover:bg-blue-700">
                        <Plus className="w-4 h-4 mr-2" />
                        Add Game
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="bg-black/90 border-gray-700 text-white">
                      <DialogHeader>
                        <DialogTitle>Add New Game</DialogTitle>
                      </DialogHeader>
                      <form action={handleAddGame} className="space-y-4">
                        <div>
                          <Label htmlFor="name">Game Name</Label>
                          <Input
                            name="name"
                            className="bg-black/40 border-gray-700"
                            required
                          />
                        </div>
                        <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700">
                          Add Game
                        </Button>
                      </form>
                    </DialogContent>
                  </Dialog>
                )}
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {games.map(game => {
                    const gameAccounts = accounts.filter(a => a.gameId === game.id);
                    return (
                      <Card key={game.id} className="bg-gray-800/50 border-gray-700">
                        <CardContent className="p-4">
                          <div className="flex items-center space-x-3">
                            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                              <Gamepad2 className="w-6 h-6 text-white" />
                            </div>
                            <div className="flex-1">
                              <h3 className="font-medium text-white">{game.name}</h3>
                              <p className="text-sm text-gray-400">
                                {gameAccounts.length} accounts
                              </p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Users Management (Admin Only) */}
          {isAdmin && (
            <TabsContent value="users" className="space-y-6">
              <Card className="bg-black/40 border-gray-700">
                <CardHeader>
                  <CardTitle className="text-white">User Management</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {users.map(user => (
                      <div key={user.id} className="flex items-center justify-between p-4 bg-gray-800/50 rounded-lg">
                        <div className="space-y-1">
                          <div className="flex items-center space-x-2">
                            <span className="font-medium text-white">{user.username}</span>
                            <Badge 
                              variant={user.role === 'admin' ? 'default' : 
                                      user.role === 'moderator' ? 'secondary' : 'outline'}
                            >
                              {user.role}
                            </Badge>
                          </div>
                          <p className="text-sm text-gray-400">{user.email}</p>
                        </div>
                        {user.id !== currentUser.id && (
                          <div className="flex space-x-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handlePromoteUser(user.id, user.role === 'user' ? 'moderator' : 'user')}
                              className="text-blue-400 hover:text-blue-300"
                            >
                              <UserCheck className="w-4 h-4 mr-1" />
                              {user.role === 'user' ? 'Make Moderator' : 'Remove Moderator'}
                            </Button>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          )}

          {/* Payment Methods Management (Admin Only) */}
          {isAdmin && (
            <TabsContent value="payments" className="space-y-6">
              <Card className="bg-black/40 border-gray-700">
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle className="text-white">Payment Methods</CardTitle>
                  <Dialog open={showPaymentDialog} onOpenChange={setShowPaymentDialog}>
                    <DialogTrigger asChild>
                      <Button className="bg-blue-600 hover:bg-blue-700">
                        <Plus className="w-4 h-4 mr-2" />
                        Add Payment Method
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="bg-black/90 border-gray-700 text-white">
                      <DialogHeader>
                        <DialogTitle>Add Payment Method</DialogTitle>
                      </DialogHeader>
                      <form action={handleAddPaymentMethod} className="space-y-4">
                        <div>
                          <Label htmlFor="name">Payment Method Name</Label>
                          <Input
                            name="name"
                            className="bg-black/40 border-gray-700"
                            placeholder="e.g., PayPal, Stripe, etc."
                            required
                          />
                        </div>
                        <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700">
                          Add Payment Method
                        </Button>
                      </form>
                    </DialogContent>
                  </Dialog>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {paymentMethods.map(method => (
                      <div key={method.id} className="flex items-center justify-between p-4 bg-gray-800/50 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <CreditCard className="w-5 h-5 text-gray-400" />
                          <span className="font-medium text-white">{method.name}</span>
                          <Badge variant={method.isActive ? 'default' : 'secondary'}>
                            {method.isActive ? 'Active' : 'Inactive'}
                          </Badge>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => togglePaymentMethod(method.id)}
                          className={method.isActive ? 'text-red-400 hover:text-red-300' : 'text-green-400 hover:text-green-300'}
                        >
                          {method.isActive ? 'Deactivate' : 'Activate'}
                        </Button>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          )}
        </Tabs>
      </div>
    </Layout>
  );
}