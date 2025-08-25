import React, { useState, useEffect, useRef } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Send, User, Shield } from 'lucide-react';
import { storage } from '@/lib/storage';
import { Account, Game, PaymentMethod, ChatMessage, Purchase } from '@/types';
import Layout from '@/components/Layout';

export default function ChatPage() {
  const { accountId } = useParams<{ accountId: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [account, setAccount] = useState<Account | null>(null);
  const [game, setGame] = useState<Game | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [purchase, setPurchase] = useState<Purchase | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const currentUser = storage.getCurrentUser();

  const paymentMethodId = searchParams.get('payment');

  useEffect(() => {
    if (!currentUser) {
      navigate('/login');
      return;
    }

    if (accountId) {
      // Load account and game info
      const accounts = storage.getAccounts();
      const foundAccount = accounts.find(a => a.id === accountId);
      setAccount(foundAccount || null);

      if (foundAccount) {
        const games = storage.getGames();
        setGame(games.find(g => g.id === foundAccount.gameId) || null);
      }

      // Load payment method
      if (paymentMethodId) {
        const paymentMethods = storage.getPaymentMethods();
        setPaymentMethod(paymentMethods.find(pm => pm.id === paymentMethodId) || null);
      }

      // Load or create purchase
      const purchases = storage.getPurchases();
      let existingPurchase = purchases.find(p => 
        p.accountId === accountId && p.userId === currentUser.id && p.status === 'pending'
      );

      if (!existingPurchase && foundAccount && paymentMethodId) {
        // Create new purchase
        existingPurchase = {
          id: Date.now().toString(),
          userId: currentUser.id,
          accountId: accountId,
          paymentMethod: paymentMethodId,
          status: 'pending',
          chatMessages: [
            {
              id: '1',
              userId: 'admin',
              message: `Hello! I see you're interested in purchasing the ${foundAccount.level} ${game?.name || 'account'} for $${foundAccount.price}. I'll help you complete this transaction safely.`,
              timestamp: new Date().toISOString(),
              isAdmin: true
            }
          ],
          createdAt: new Date().toISOString()
        };
        
        purchases.push(existingPurchase);
        storage.savePurchases(purchases);
      }

      setPurchase(existingPurchase || null);
      setMessages(existingPurchase?.chatMessages || []);
    }
  }, [accountId, paymentMethodId, currentUser, navigate]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = () => {
    if (!newMessage.trim() || !purchase || !currentUser) return;

    const message: ChatMessage = {
      id: Date.now().toString(),
      userId: currentUser.id,
      message: newMessage.trim(),
      timestamp: new Date().toISOString(),
      isAdmin: false
    };

    const updatedMessages = [...messages, message];
    setMessages(updatedMessages);

    // Update purchase in storage
    const purchases = storage.getPurchases();
    const updatedPurchases = purchases.map(p => 
      p.id === purchase.id 
        ? { ...p, chatMessages: updatedMessages }
        : p
    );
    storage.savePurchases(updatedPurchases);

    setNewMessage('');

    // Simulate admin response (in real app, this would be real-time)
    setTimeout(() => {
      const adminResponse: ChatMessage = {
        id: (Date.now() + 1).toString(),
        userId: 'admin',
        message: getAdminResponse(newMessage),
        timestamp: new Date().toISOString(),
        isAdmin: true
      };

      const finalMessages = [...updatedMessages, adminResponse];
      setMessages(finalMessages);

      // Update storage again
      const latestPurchases = storage.getPurchases();
      const finalPurchases = latestPurchases.map(p => 
        p.id === purchase.id 
          ? { ...p, chatMessages: finalMessages }
          : p
      );
      storage.savePurchases(finalPurchases);
    }, 1000 + Math.random() * 2000);
  };

  const getAdminResponse = (userMessage: string): string => {
    const msg = userMessage.toLowerCase();
    
    if (msg.includes('payment') || msg.includes('pay')) {
      return `Great! To complete the payment of $${account?.price}, please send the payment via ${paymentMethod?.name}. I'll provide you with the payment details shortly.`;
    }
    
    if (msg.includes('details') || msg.includes('info')) {
      return `Here are the account details: Level ${account?.level}, Rank ${account?.rank}. The account status is ${account?.status}. Once payment is confirmed, you'll receive the login credentials.`;
    }
    
    if (msg.includes('secure') || msg.includes('safe')) {
      return 'Absolutely! All transactions are secure. We use escrow services and provide 24/7 support. Your purchase is protected.';
    }
    
    if (msg.includes('delivery') || msg.includes('receive')) {
      return 'Account delivery is instant upon payment confirmation. You\'ll receive the login credentials and any additional information via this chat.';
    }

    return 'Thank you for your message. How else can I assist you with this purchase? Feel free to ask about payment details, account information, or security measures.';
  };

  if (!currentUser) {
    return null;
  }

  if (!account || !game) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-8 text-center">
          <p className="text-gray-400">Purchase not found</p>
          <Button onClick={() => navigate('/')} className="mt-4">
            Back to Home
          </Button>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <Button 
          onClick={() => navigate(`/account/${account.id}`)} 
          variant="ghost" 
          className="mb-6 text-gray-300 hover:text-white"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Account Details
        </Button>

        <div className="grid lg:grid-cols-4 gap-6">
          {/* Purchase Summary */}
          <div className="lg:col-span-1">
            <Card className="bg-black/40 border-gray-700 sticky top-4">
              <CardHeader>
                <CardTitle className="text-lg text-white">Purchase Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm text-gray-400">Account</p>
                  <p className="font-medium text-white">{game.name}</p>
                  <p className="text-sm text-gray-300">Level {account.level}</p>
                </div>
                
                <div>
                  <p className="text-sm text-gray-400">Price</p>
                  <p className="text-xl font-bold text-green-400">${account.price}</p>
                </div>

                {paymentMethod && (
                  <div>
                    <p className="text-sm text-gray-400">Payment Method</p>
                    <p className="font-medium text-white">{paymentMethod.name}</p>
                  </div>
                )}

                <Badge 
                  variant={purchase?.status === 'pending' ? 'secondary' : 'default'}
                  className="w-full justify-center"
                >
                  {purchase?.status || 'Unknown'}
                </Badge>
              </CardContent>
            </Card>
          </div>

          {/* Chat Interface */}
          <div className="lg:col-span-3">
            <Card className="bg-black/40 border-gray-700 h-[600px] flex flex-col">
              <CardHeader className="border-b border-gray-700">
                <CardTitle className="text-lg text-white flex items-center">
                  <Shield className="w-5 h-5 mr-2 text-blue-400" />
                  Purchase Support Chat
                </CardTitle>
                <p className="text-sm text-gray-400">
                  Connected with our support team for secure transaction
                </p>
              </CardHeader>
              
              <CardContent className="flex-1 flex flex-col p-0">
                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                  {messages.map(message => (
                    <div 
                      key={message.id} 
                      className={`flex ${message.isAdmin ? 'justify-start' : 'justify-end'}`}
                    >
                      <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                        message.isAdmin 
                          ? 'bg-gray-700 text-white' 
                          : 'bg-blue-600 text-white'
                      }`}>
                        <div className="flex items-center space-x-2 mb-1">
                          {message.isAdmin ? (
                            <Shield className="w-3 h-3" />
                          ) : (
                            <User className="w-3 h-3" />
                          )}
                          <span className="text-xs opacity-75">
                            {message.isAdmin ? 'Support Team' : 'You'}
                          </span>
                        </div>
                        <p className="text-sm">{message.message}</p>
                        <p className="text-xs opacity-50 mt-1">
                          {new Date(message.timestamp).toLocaleTimeString()}
                        </p>
                      </div>
                    </div>
                  ))}
                  <div ref={messagesEndRef} />
                </div>

                {/* Message Input */}
                <div className="border-t border-gray-700 p-4">
                  <div className="flex space-x-2">
                    <Input
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                      placeholder="Type your message..."
                      className="bg-black/40 border-gray-700 text-white"
                    />
                    <Button 
                      onClick={sendMessage}
                      disabled={!newMessage.trim()}
                      className="bg-blue-600 hover:bg-blue-700"
                    >
                      <Send className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </Layout>
  );
}