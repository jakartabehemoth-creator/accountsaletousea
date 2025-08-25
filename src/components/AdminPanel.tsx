import React, { useState, useEffect, useRef } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { User, GameAccount, ChatSession, ChatMessage } from '@/types';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { Trash2, Shield, ShieldOff, Crown, Upload, Image as ImageIcon, MessageCircle, Send, Clock, User as UserIcon } from 'lucide-react';

interface AdminPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AdminPanel: React.FC<AdminPanelProps> = ({ isOpen, onClose }) => {
  const [users, setUsers] = useState<User[]>([]);
  const [accounts, setAccounts] = useState<GameAccount[]>([]);
  const [gameIcons, setGameIcons] = useState<{[key: string]: string | null}>({});
  const [chatSessions, setChatSessions] = useState<ChatSession[]>([]);
  const [selectedChatId, setSelectedChatId] = useState<string | null>(null);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [newChatMessage, setNewChatMessage] = useState('');
  const [newAccount, setNewAccount] = useState({
    gameType: '',
    level: '',
    rank: '',
    status: 'fresh',
    price: '',
    description: ''
  });
  const [showAccountForm, setShowAccountForm] = useState(false);  // <-- added this
  const { user } = useAuth();
  const fileInputRefs = useRef<{[key: string]: HTMLInputElement | null}>({});

  useEffect(() => {
    if (isOpen) {
      loadUsers();
      loadAccounts();
      loadGameIcons();
      loadChatSessions();
    }
  }, [isOpen]);

  // Helper to safely parse localStorage data
  const safeParse = <T,>(key: string, defaultValue: T): T => {
    try {
      const item = localStorage.getItem(key);
      if (!item) return defaultValue;
      return JSON.parse(item) as T;
    } catch (e) {
      console.error(`Failed to parse localStorage key "${key}":`, e);
      return defaultValue;
    }
  };

  const loadUsers = () => {
    const storedUsers = safeParse<User[]>('users', []);
    setUsers(storedUsers);
  };

  const loadAccounts = () => {
    const storedAccounts = safeParse<GameAccount[]>('gameAccounts', []);
    setAccounts(storedAccounts);
  };

  const loadGameIcons = () => {
    const storedIcons = safeParse<{[key: string]: string | null}>('gameIcons', {});
    setGameIcons(storedIcons);
  };

  const loadChatSessions = () => {
    const storedSessions = safeParse<ChatSession[]>('chatSessions', []);
    setChatSessions(storedSessions.sort((a, b) => 
      new Date(b.lastMessageAt).getTime() - new Date(a.lastMessageAt).getTime()
    ));
  };

  const loadChatMessages = (chatId: string) => {
    const allMessages = safeParse<ChatMessage[]>('chatMessages', []);
    const sessionMessages = allMessages.filter(msg => msg.chatId === chatId);
    setChatMessages(sessionMessages);

    // Mark messages as read by clearing unread count
    const updatedSessions = chatSessions.map(session => {
      if (session.id === chatId) {
        return { ...session, unreadCount: 0 };
      }
      return session;
    });
    setChatSessions(updatedSessions);
    localStorage.setItem('chatSessions', JSON.stringify(updatedSessions));
  };

  const handleSendChatMessage = () => {
    if (!newChatMessage.trim() || !selectedChatId || !user) return;

    const message: ChatMessage = {
      id: Date.now().toString(),
      chatId: selectedChatId,
      userId: user.id,
      username: user.username,
      message: newChatMessage,
      timestamp: new Date().toISOString(),
      isAdmin: user.role === 'admin' || user.role === 'moderator'
    };

    // Update local state
    setChatMessages(prev => [...prev, message]);
    setNewChatMessage('');

    // Save to localStorage
    const allMessages = safeParse<ChatMessage[]>('chatMessages', []);
    localStorage.setItem('chatMessages', JSON.stringify([...allMessages, message]));

    // Update chat session
    const updatedSessions = chatSessions.map(session => {
      if (session.id === selectedChatId) {
        return {
          ...session,
          lastMessageAt: new Date().toISOString()
        };
      }
      return session;
    });
    setChatSessions(updatedSessions);
    localStorage.setItem('chatSessions', JSON.stringify(updatedSessions));
  };

  const updateChatStatus = (chatId: string, status: 'active' | 'completed' | 'cancelled') => {
    const updatedSessions = chatSessions.map(session => {
      if (session.id === chatId) {
        return { ...session, status };
      }
      return session;
    });
    setChatSessions(updatedSessions);
    localStorage.setItem('chatSessions', JSON.stringify(updatedSessions));
    toast.success(`Chat marked as ${status}`);
  };

  const handleUserAction = (userId: string, action: 'ban' | 'unban' | 'promote' | 'demote' | 'delete') => {
    const updatedUsers = users.map(u => {
      if (u.id === userId) {
        switch (action) {
          case 'ban':
            return { ...u, banned: true };
          case 'unban':
            return { ...u, banned: false };
          case 'promote':
            return { ...u, role: u.role === 'user' ? 'moderator' : u.role };
          case 'demote':
            return { ...u, role: u.role === 'moderator' ? 'user' : u.role };
          default:
            return u;
        }
      }
      return u;
    }).filter(u => action !== 'delete' || u.id !== userId);

    setUsers(updatedUsers);
    localStorage.setItem('users', JSON.stringify(updatedUsers));
    toast.success(`User ${action} successful`);
  };

  const handleAddAccount = () => {
    if (!newAccount.gameType || !newAccount.level || !newAccount.rank || !newAccount.price) {
      toast.error('Please fill all required fields');
      return;
    }

    const account: GameAccount = {
      id: Date.now().toString(),
      gameType: newAccount.gameType as 'valorant' | 'bloodstrike' | 'knives-out' | 'farlight',
      level: parseInt(newAccount.level),
      rank: newAccount.rank,
      status: newAccount.status as 'fresh' | 'cheated',
      price: parseFloat(newAccount.price),
      currency: 'USD',
      description: newAccount.description,
      images: [],
      postedBy: user?.id || '',
      postedAt: new Date().toISOString(),
      sold: false
    };

    const updatedAccounts = [...accounts, account];
    setAccounts(updatedAccounts);
    localStorage.setItem('gameAccounts', JSON.stringify(updatedAccounts));
    
    setNewAccount({
      gameType: '',
      level: '',
      rank: '',
      status: 'fresh',
      price: '',
      description: ''
    });
    
    toast.success('Account added successfully');
  };

  const handleDeleteAccount = (accountId: string) => {
    const updatedAccounts = accounts.filter(a => a.id !== accountId);
    setAccounts(updatedAccounts);
    localStorage.setItem('gameAccounts', JSON.stringify(updatedAccounts));
    toast.success('Account deleted successfully');
  };

  const handleIconUpload = (gameType: string, file: File) => {
    if (file.type === 'image/png' || file.type === 'image/jpeg') {
      const reader = new FileReader();
      reader.onload = (e) => {
        const imageUrl = e.target?.result as string;
        const updatedIcons = { ...gameIcons, [gameType]: imageUrl };
        setGameIcons(updatedIcons);
        localStorage.setItem('gameIcons', JSON.stringify(updatedIcons));
        toast.success(`${gameType} icon updated successfully`);
      };
      reader.readAsDataURL(file);
    } else {
      toast.error('Only PNG and JPEG images are allowed');
    }
  };


  const removeIcon = (gameType: string) => {
    const updatedIcons = { ...gameIcons, [gameType]: null };
    setGameIcons(updatedIcons);
    localStorage.setItem('gameIcons', JSON.stringify(updatedIcons));
    toast.success(`${gameType} icon removed`);
  };

  if (!user || (user.role !== 'admin' && user.role !== 'moderator')) {
    return null;
  }

  return (
    <Dialog open={isOpen} onOpenChange={open => !open && onClose()}>
      <DialogContent className="max-w-7xl">
        <DialogHeader>
          <DialogTitle>Admin Panel</DialogTitle>
        </DialogHeader>
        <Tabs defaultValue="users" className="w-full">
          <TabsList>
            <TabsTrigger value="users">Users</TabsTrigger>
            <TabsTrigger value="accounts">Accounts</TabsTrigger>
            <TabsTrigger value="game-icons">Game Icons</TabsTrigger>
            <TabsTrigger value="chat">Chat</TabsTrigger>
          </TabsList>

          <TabsContent value="users" className="space-y-4">
            {/* User management UI here */}
            {users.length === 0 ? (
              <p>No users found</p>
            ) : (
              users.map(u => (
                <Card key={u.id} className="mb-2">
                  <CardHeader>
                    <CardTitle>{u.username}</CardTitle>
                    <Badge variant={u.banned ? 'destructive' : 'secondary'}>
                      {u.banned ? 'Banned' : u.role}
                    </Badge>
                  </CardHeader>
                  <CardContent className="flex justify-between">
                    <div>
                      <p>Email: {u.email}</p>
                      <p>Role: {u.role}</p>
                    </div>
                    <div>
                      {!u.banned ? (
                        <Button variant="destructive" size="sm" onClick={() => handleUserAction(u.id, 'ban')}>
                          Ban
                        </Button>
                      ) : (
                        <Button variant="secondary" size="sm" onClick={() => handleUserAction(u.id, 'unban')}>
                          Unban
                        </Button>
                      )}
                      {u.role === 'user' ? (
                        <Button size="sm" onClick={() => handleUserAction(u.id, 'promote')}>
                          Promote
                        </Button>
                      ) : (
                        <Button size="sm" onClick={() => handleUserAction(u.id, 'demote')}>
                          Demote
                        </Button>
                      )}
                      <Button variant="destructive" size="sm" onClick={() => handleUserAction(u.id, 'delete')}>
                        Delete
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </TabsContent>

          <TabsContent value="accounts" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Add New Account</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button onClick={() => setShowAccountForm(prev => !prev)}>
                  {showAccountForm ? 'Cancel' : 'Add Account'}
                </Button>

                {showAccountForm && (
                  <div className="space-y-4 mt-4">
                    <div>
                      <Label>Game Type</Label>
                      <Select
                        onValueChange={value => setNewAccount(prev => ({ ...prev, gameType: value }))}
                        value={newAccount.gameType}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select game" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="valorant">Valorant</SelectItem>
                          <SelectItem value="bloodstrike">Blood Strike</SelectItem>
                          <SelectItem value="knives-out">Knives Out</SelectItem>
                          <SelectItem value="farlight">Farlight</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label>Level</Label>
                      <Input
                        type="number"
                        value={newAccount.level}
                        onChange={e => setNewAccount(prev => ({ ...prev, level: e.target.value }))}
                      />
                    </div>

                    <div>
                      <Label>Rank</Label>
                      <Input
                        value={newAccount.rank}
                        onChange={e => setNewAccount(prev => ({ ...prev, rank: e.target.value }))}
                      />
                    </div>

                    <div>
                      <Label>Price</Label>
                      <Input
                        type="number"
                        value={newAccount.price}
                        onChange={e => setNewAccount(prev => ({ ...prev, price: e.target.value }))}
                      />
                    </div>

                    <div>
                      <Label>Description</Label>
                      <Textarea
                        value={newAccount.description}
                        onChange={e => setNewAccount(prev => ({ ...prev, description: e.target.value }))}
                      />
                    </div>

                    <Button
                      onClick={() => {
                        handleAddAccount();
                        setShowAccountForm(false);
                      }}
                    >
                      Submit
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
              {accounts.length === 0 ? (
                <p>No accounts available</p>
              ) : (
                accounts.map(account => (
                  <Card key={account.id} className="mb-2">
                    <CardHeader>
                      <CardTitle>
                        {account.gameType} - Level {account.level}
                      </CardTitle>
                      <Badge>{account.status}</Badge>
                    </CardHeader>
                    <CardContent>
                      <p>Rank: {account.rank}</p>
                      <p>Price: ${account.price}</p>
                      <p>{account.description}</p>
                      <Button variant="destructive" size="sm" onClick={() => handleDeleteAccount(account.id)}>
                        Delete
                      </Button>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </TabsContent>

          <TabsContent value="game-icons" className="space-y-4">
            {/* Game icons upload UI */}
            {['valorant', 'bloodstrike', 'knives-out', 'farlight'].map(game => (
              <Card key={game} className="mb-2 flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <p className="capitalize">{game}</p>
                  {gameIcons[game] ? (
                    <img src={gameIcons[game] || ''} alt={`${game} icon`} className="w-10 h-10 rounded" />
                  ) : (
                    <p>No icon uploaded</p>
                  )}
                </div>
                <div>
                  <input
                    type="file"
                    accept="image/png, image/jpeg"
                    className="hidden"
                    ref={el => (fileInputRefs.current[game] = el)}
                    onChange={e => {
                      const file = e.target.files?.[0];
                      if (file) handleIconUpload(game, file);
                    }}
                  />
                  <Button onClick={() => fileInputRefs.current[game]?.click()}>Upload</Button>
                  {gameIcons[game] && (
                    <Button variant="destructive" onClick={() => removeIcon(game)} className="ml-2">
                      Remove
                    </Button>
                  )}
                </div>
              </Card>
            ))}
          </TabsContent>

          <TabsContent value="chat" className="flex space-x-4">
            <div className="w-1/3 border-r border-gray-200 overflow-y-auto max-h-[600px]">
              {chatSessions.length === 0 ? (
                <p>No chat sessions</p>
              ) : (
                chatSessions.map(session => (
                  <Card
                    key={session.id}
                    className={`mb-2 cursor-pointer ${
                      session.id === selectedChatId ? 'bg-gray-100' : ''
                    }`}
                    onClick={() => {
                      setSelectedChatId(session.id);
                      loadChatMessages(session.id);
                    }}
                  >
                    <CardHeader className="flex justify-between items-center">
                      <CardTitle>{session.username || 'Unknown User'}</CardTitle>
                      <Badge>{session.status}</Badge>
                    </CardHeader>
                    <CardContent>
                      <p>Last message at: {new Date(session.lastMessageAt).toLocaleString()}</p>
                      {session.unreadCount > 0 && (
                        <Badge variant="destructive">{session.unreadCount}</Badge>
                      )}
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
            <div className="w-2/3 flex flex-col max-h-[600px]">
              {selectedChatId ? (
                <>
                  <ScrollArea className="flex-grow border border-gray-200 rounded p-4 overflow-y-auto">
                    {chatMessages.length === 0 ? (
                      <p>No messages</p>
                    ) : (
                      chatMessages.map(msg => (
                        <div
                          key={msg.id}
                          className={`mb-2 p-2 rounded ${
                            msg.isAdmin ? 'bg-blue-100 text-blue-900 self-end' : 'bg-gray-100'
                          }`}
                        >
                          <p>
                            <strong>{msg.username}</strong> <small>{new Date(msg.timestamp).toLocaleString()}</small>
                          </p>
                          <p>{msg.message}</p>
                        </div>
                      ))
                    )}
                  </ScrollArea>
                  <div className="flex items-center space-x-2 mt-2">
                    <Input
                      value={newChatMessage}
                      onChange={e => setNewChatMessage(e.target.value)}
                      placeholder="Type your message..."
                      onKeyDown={e => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleSendChatMessage();
                        }
                      }}
                    />
                    <Button onClick={handleSendChatMessage}>
                      <Send size={16} />
                    </Button>
                    <Button onClick={() => updateChatStatus(selectedChatId, 'active')}>Active</Button>
                    <Button onClick={() => updateChatStatus(selectedChatId, 'completed')}>Complete</Button>
                    <Button onClick={() => updateChatStatus(selectedChatId, 'cancelled')}>Cancel</Button>
                  </div>
                </>
              ) : (
                <p>Select a chat session</p>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};
