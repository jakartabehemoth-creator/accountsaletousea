import { useState, useEffect, useRef } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { ArrowLeft, Send, User, Shield, Clock, CheckCircle, Paperclip, Download } from 'lucide-react';
import { apiStorage } from '@/lib/apiStorage';
import { ChatMessage, Purchase, Account, PaymentMethod } from '@/types';
import Layout from '@/components/Layout';
import { ImageUpload } from '@/components/ImageUpload';
import { toast } from 'sonner';

export default function ChatPage() {
  const { accountId } = useParams<{ accountId: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [purchase, setPurchase] = useState<Purchase | null>(null);
  const [account, setAccount] = useState<Account | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showImageUpload, setShowImageUpload] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const currentUser = apiStorage.getCurrentUser();

  const paymentMethodId = searchParams.get('payment');

  useEffect(() => {
    if (!currentUser) {
      navigate('/login');
      return;
    }

    loadChatData();
  }, [accountId, paymentMethodId, currentUser]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const loadChatData = async () => {
    if (!accountId || !currentUser) return;

    try {
      // Load account details
      const accounts = await apiStorage.getAccounts();
      const foundAccount = accounts.find(a => a.id === accountId);
      setAccount(foundAccount || null);

      // Load payment method if specified
      if (paymentMethodId) {
        const methods = await apiStorage.getPaymentMethods();
        const method = methods.find(m => m.id === paymentMethodId);
        setPaymentMethod(method || null);
      }

      // Create or load purchase
      let existingPurchase = getPurchase();
      if (!existingPurchase && foundAccount && paymentMethodId) {
        existingPurchase = createPurchase(foundAccount, paymentMethodId);
      }

      if (existingPurchase) {
        setPurchase(existingPurchase);
        setMessages(existingPurchase.chatMessages);
        
        // Send initial admin message if no messages exist
        if (existingPurchase.chatMessages.length === 0) {
          setTimeout(() => {
            sendAdminMessage("Hello! Thank you for your interest in this account. I'm here to help you with the purchase process. How can I assist you today?");
          }, 1000);
        }
      }
    } catch (error) {
      console.error('Failed to load chat data:', error);
      toast.error('Failed to load chat data');
    }
  };

  const getPurchase = (): Purchase | null => {
    const purchases = JSON.parse(localStorage.getItem('account_sale_purchases') || '[]');
    return purchases.find((p: Purchase) => 
      p.accountId === accountId && 
      p.userId === currentUser?.id && 
      p.status !== 'cancelled'
    ) || null;
  };

  const createPurchase = (account: Account, paymentMethodId: string): Purchase => {
    const newPurchase: Purchase = {
      id: Date.now().toString(),
      userId: currentUser!.id,
      accountId: account.id,
      paymentMethod: paymentMethodId,
      status: 'pending',
      chatMessages: [],
      createdAt: new Date().toISOString()
    };

    const purchases = JSON.parse(localStorage.getItem('account_sale_purchases') || '[]');
    purchases.push(newPurchase);
    localStorage.setItem('account_sale_purchases', JSON.stringify(purchases));
    
    return newPurchase;
  };

  const updatePurchase = (updatedPurchase: Purchase) => {
    const purchases = JSON.parse(localStorage.getItem('account_sale_purchases') || '[]');
    const index = purchases.findIndex((p: Purchase) => p.id === updatedPurchase.id);
    if (index !== -1) {
      purchases[index] = updatedPurchase;
      localStorage.setItem('account_sale_purchases', JSON.stringify(purchases));
      setPurchase(updatedPurchase);
    }
  };

  const sendMessage = () => {
    if (!newMessage.trim() || !currentUser || !purchase) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      userId: currentUser.id,
      message: newMessage,
      timestamp: new Date().toISOString(),
      isAdmin: false
    };

    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    
    const updatedPurchase = {
      ...purchase,
      chatMessages: updatedMessages
    };
    updatePurchase(updatedPurchase);
    
    setNewMessage('');
    setIsLoading(true);

    // Simulate admin response
    setTimeout(() => {
      sendAdminMessage(getAdminResponse(newMessage));
    }, 1000 + Math.random() * 2000);
  };

  const sendImageMessage = (imageUrl: string, fileName: string) => {
    if (!currentUser || !purchase) return;

    const imageMessage: ChatMessage = {
      id: Date.now().toString(),
      userId: currentUser.id,
      message: `📷 Sent an image: ${fileName}`,
      timestamp: new Date().toISOString(),
      isAdmin: false,
      imageUrl,
      fileName
    };

    const updatedMessages = [...messages, imageMessage];
    setMessages(updatedMessages);
    
    const updatedPurchase = {
      ...purchase,
      chatMessages: updatedMessages
    };
    updatePurchase(updatedPurchase);
    
    setShowImageUpload(false);
    setIsLoading(true);

    // Admin response to image
    setTimeout(() => {
      sendAdminMessage("Thank you for sending the payment proof! I'm reviewing it now and will confirm your payment shortly.");
    }, 2000 + Math.random() * 3000);
  };

  const sendAdminMessage = (message: string) => {
    if (!purchase) return;

    const adminMessage: ChatMessage = {
      id: (Date.now() + 1).toString(),
      userId: 'admin',
      message,
      timestamp: new Date().toISOString(),
      isAdmin: true
    };

    const updatedMessages = [...messages, adminMessage];
    setMessages(updatedMessages);
    
    const updatedPurchase = {
      ...purchase,
      chatMessages: updatedMessages
    };
    updatePurchase(updatedPurchase);
    setIsLoading(false);
  };

  const getAdminResponse = (userMessage: string): string => {
    const lowerMessage = userMessage.toLowerCase();
    
    if (lowerMessage.includes('payment') || lowerMessage.includes('pay')) {
      return `Perfect! I can see you've selected ${paymentMethod?.name} as your payment method. I'll provide you with the payment details shortly. Please hold on.`;
    }
    
    if (lowerMessage.includes('price') || lowerMessage.includes('cost')) {
      return `The total price for this account is $${account?.price}. This includes secure transfer and 24/7 support.`;
    }
    
    if (lowerMessage.includes('secure') || lowerMessage.includes('safe')) {
      return `Absolutely! All our transactions are secure. We use escrow service and provide account verification before transfer.`;
    }
    
    if (lowerMessage.includes('time') || lowerMessage.includes('how long')) {
      return `Account delivery usually takes 5-15 minutes after payment confirmation. I'll personally handle your transfer.`;
    }

    const responses = [
      "I understand your concern. Let me help you with that right away.",
      "Great question! This account has been fully verified and is ready for immediate transfer.",
      "I can provide detailed payment instructions. Would you like to proceed with the payment?",
      "This account comes with full original details and email access. Any other questions?",
      "I'm here to ensure you have a smooth purchase experience. What else can I help with?"
    ];
    
    return responses[Math.floor(Math.random() * responses.length)];
  };

  const handlePaymentComplete = () => {
    if (!purchase) return;
    
    const completedPurchase = {
      ...purchase,
      status: 'completed' as const
    };
    updatePurchase(completedPurchase);
    
    sendAdminMessage("🎉 Payment confirmed! Your account details will be delivered within 5-10 minutes. Thank you for your purchase!");
    toast.success('Payment completed successfully!');
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  if (!currentUser) {
    return null;
  }

  if (!account || !purchase) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-8 text-center">
          <p className="text-gray-400">Chat session not found</p>
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
          onClick={() => navigate(`/account/${accountId}`)} 
          variant="ghost" 
          className="mb-6 text-gray-300 hover:text-white"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Account Details
        </Button>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Chat Area */}
          <div className="lg:col-span-2">
            <Card className="bg-black/40 border-gray-700 h-[600px] flex flex-col">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <User className="w-5 h-5" />
                  Chat with Admin
                </CardTitle>
              </CardHeader>
              <CardContent className="flex-1 flex flex-col p-4">
                <ScrollArea className="flex-1 mb-4">
                  <div className="space-y-4 pr-4">
                    {messages.map((message) => (
                      <div
                        key={message.id}
                        className={`flex ${message.isAdmin ? 'justify-start' : 'justify-end'}`}
                      >
                        <div
                          className={`max-w-[80%] p-3 rounded-lg ${
                            message.isAdmin
                              ? 'bg-gray-700 text-white'
                              : 'bg-blue-600 text-white'
                          }`}
                        >
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-xs font-medium">
                              {message.isAdmin ? 'Admin' : currentUser.username}
                            </span>
                            <span className="text-xs opacity-70">
                              {new Date(message.timestamp).toLocaleTimeString()}
                            </span>
                          </div>
                          
                          {message.imageUrl ? (
                            <div className="space-y-2">
                              <img
                                src={message.imageUrl}
                                alt={message.fileName || 'Payment proof'}
                                className="w-full max-w-xs rounded-lg cursor-pointer"
                                onClick={() => window.open(message.imageUrl, '_blank')}
                              />
                              <div className="flex items-center justify-between">
                                <span className="text-xs opacity-70">{message.fileName}</span>
                                <button
                                  onClick={() => {
                                    const link = document.createElement('a');
                                    link.href = message.imageUrl!;
                                    link.download = message.fileName || 'image';
                                    link.click();
                                  }}
                                  className="text-xs opacity-70 hover:opacity-100 flex items-center gap-1"
                                >
                                  <Download className="w-3 h-3" />
                                  Download
                                </button>
                              </div>
                            </div>
                          ) : (
                            <p className="text-sm">{message.message}</p>
                          )}
                        </div>
                      </div>
                    ))}
                    {isLoading && (
                      <div className="flex justify-start">
                        <div className="bg-gray-700 text-white p-3 rounded-lg">
                          <div className="flex items-center space-x-2">
                            <div className="w-2 h-2 bg-white rounded-full animate-bounce"></div>
                            <div className="w-2 h-2 bg-white rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                            <div className="w-2 h-2 bg-white rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                          </div>
                        </div>
                      </div>
                    )}
                    <div ref={messagesEndRef} />
                  </div>
                </ScrollArea>
                
                {showImageUpload ? (
                  <ImageUpload
                    onImageSelect={sendImageMessage}
                    onCancel={() => setShowImageUpload(false)}
                  />
                ) : (
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setShowImageUpload(true)}
                      className="border-white/30 text-white hover:bg-white/10"
                    >
                      <Paperclip className="w-4 h-4" />
                    </Button>
                    <Input
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      onKeyPress={handleKeyPress}
                      placeholder="Type your message..."
                      className="flex-1 bg-white/20 border-white/30 text-white placeholder-gray-300"
                    />
                    <Button onClick={sendMessage} disabled={!newMessage.trim()}>
                      <Send className="w-4 h-4" />
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Purchase Info */}
          <div className="space-y-4">
            <Card className="bg-black/40 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white">Purchase Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-gray-400 text-sm">Account</p>
                  <p className="text-white font-medium">{account.gameId} - Level {account.level}</p>
                </div>
                
                <div>
                  <p className="text-gray-400 text-sm">Price</p>
                  <p className="text-green-400 font-bold text-xl">${account.price}</p>
                </div>
                
                {paymentMethod && (
                  <div>
                    <p className="text-gray-400 text-sm">Payment Method</p>
                    <p className="text-white">{paymentMethod.name}</p>
                  </div>
                )}
                
                <Separator className="bg-gray-700" />
                
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-gray-400" />
                  <span className="text-gray-400 text-sm">
                    Created {new Date(purchase.createdAt).toLocaleString()}
                  </span>
                </div>
                
                <Badge 
                  variant={purchase.status === 'completed' ? 'default' : purchase.status === 'pending' ? 'secondary' : 'destructive'}
                  className="w-full justify-center"
                >
                  {purchase.status === 'pending' && <Clock className="w-3 h-3 mr-1" />}
                  {purchase.status === 'completed' && <CheckCircle className="w-3 h-3 mr-1" />}
                  {purchase.status.charAt(0).toUpperCase() + purchase.status.slice(1)}
                </Badge>

                {purchase.status === 'pending' && (
                  <Button 
                    onClick={handlePaymentComplete}
                    className="w-full bg-green-600 hover:bg-green-700"
                  >
                    <Shield className="w-4 h-4 mr-2" />
                    Complete Payment
                  </Button>
                )}
              </CardContent>
            </Card>

            <Card className="bg-black/40 border-gray-700">
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <Shield className="w-5 h-5 text-green-400 mt-0.5" />
                  <div>
                    <h4 className="text-white font-medium">Secure Purchase</h4>
                    <p className="text-gray-400 text-sm mt-1">
                      Your transaction is protected by our secure payment system and 24/7 customer support.
                    </p>
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