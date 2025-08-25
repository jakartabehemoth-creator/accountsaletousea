import React, { useState, useRef, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Send, Image as ImageIcon, X } from 'lucide-react';
import { GameAccount, ChatMessage, ChatSession } from '@/types';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

interface ChatModalProps {
  account: GameAccount | null;
  paymentMethod: string;
  isOpen: boolean;
  onClose: () => void;
}

export const ChatModal: React.FC<ChatModalProps> = ({
  account,
  paymentMethod,
  isOpen,
  onClose
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { user } = useAuth();

  useEffect(() => {
    if (isOpen && account && user) {
      const chatId = `${account.id}-${user.id}`;
      
      // Load existing messages for this chat
      const existingMessages = JSON.parse(localStorage.getItem('chatMessages') || '[]')
        .filter((msg: ChatMessage) => msg.chatId === chatId);
      
      if (existingMessages.length === 0) {
        // Create new chat session
        const chatSession: ChatSession = {
          id: chatId,
          userId: user.id,
          username: user.username,
          accountId: account.id,
          account: account,
          paymentMethod: paymentMethod,
          status: 'active',
          createdAt: new Date().toISOString(),
          lastMessageAt: new Date().toISOString(),
          unreadCount: 0
        };
        
        // Save chat session
        const existingSessions = JSON.parse(localStorage.getItem('chatSessions') || '[]');
        const updatedSessions = [...existingSessions, chatSession];
        localStorage.setItem('chatSessions', JSON.stringify(updatedSessions));
        
        // Initialize chat with welcome message
        const welcomeMessage: ChatMessage = {
          id: Date.now().toString(),
          chatId: chatId,
          userId: 'admin-1',
          username: 'Admin',
          message: `Hello! I see you're interested in purchasing a ${account.gameType} account (Level ${account.level}, ${account.rank}) for $${account.price} via ${paymentMethod}. How can I help you with this purchase?`,
          timestamp: new Date().toISOString(),
          isAdmin: true
        };
        
        setMessages([welcomeMessage]);
        
        // Save welcome message
        const allMessages = JSON.parse(localStorage.getItem('chatMessages') || '[]');
        localStorage.setItem('chatMessages', JSON.stringify([...allMessages, welcomeMessage]));
      } else {
        setMessages(existingMessages);
      }
    }
  }, [isOpen, account, user, paymentMethod]);

  const handleSendMessage = () => {
    if (!newMessage.trim() && !selectedImage) return;
    if (!user || !account) return;

    const chatId = `${account.id}-${user.id}`;
    const message: ChatMessage = {
      id: Date.now().toString(),
      chatId: chatId,
      userId: user.id,
      username: user.username,
      message: newMessage,
      image: imagePreview || undefined,
      timestamp: new Date().toISOString(),
      isAdmin: user.role === 'admin' || user.role === 'moderator'
    };

    const updatedMessages = [...messages, message];
    setMessages(updatedMessages);
    setNewMessage('');
    setSelectedImage(null);
    setImagePreview(null);

    // Save message to localStorage
    const allMessages = JSON.parse(localStorage.getItem('chatMessages') || '[]');
    localStorage.setItem('chatMessages', JSON.stringify([...allMessages, message]));
    
    // Update chat session
    const chatSessions = JSON.parse(localStorage.getItem('chatSessions') || '[]');
    const updatedSessions = chatSessions.map((session: ChatSession) => {
      if (session.id === chatId) {
        return {
          ...session,
          lastMessageAt: new Date().toISOString(),
          unreadCount: user.role === 'user' ? session.unreadCount + 1 : 0
        };
      }
      return session;
    });
    localStorage.setItem('chatSessions', JSON.stringify(updatedSessions));

    // Auto-reply from admin (simulation) - only for regular users
    if (user.role === 'user') {
      setTimeout(() => {
        const adminReply: ChatMessage = {
          id: (Date.now() + 1).toString(),
          chatId: chatId,
          userId: 'admin-1',
          username: 'Admin',
          message: 'Thank you for your message. I\'ll process your request shortly. Please provide your payment details when ready.',
          timestamp: new Date().toISOString(),
          isAdmin: true
        };
        
        setMessages(prev => [...prev, adminReply]);
        
        // Save admin reply
        const currentMessages = JSON.parse(localStorage.getItem('chatMessages') || '[]');
        localStorage.setItem('chatMessages', JSON.stringify([...currentMessages, adminReply]));
      }, 2000);
    }
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.type === 'image/png' || file.type === 'image/jpeg') {
        setSelectedImage(file);
        const reader = new FileReader();
        reader.onload = (e) => {
          setImagePreview(e.target?.result as string);
        };
        reader.readAsDataURL(file);
      } else {
        toast.error('Only PNG and JPEG images are allowed');
      }
    }
  };

  const removeImage = () => {
    setSelectedImage(null);
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  if (!account) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-slate-800 border-slate-700 text-white max-w-2xl h-[600px] flex flex-col">
        <DialogHeader>
          <DialogTitle className="text-xl">
            Chat - {account.gameType} Account Purchase
          </DialogTitle>
          <div className="text-sm text-gray-400">
            Level {account.level} • {account.rank} • ${account.price} • {paymentMethod}
          </div>
        </DialogHeader>
        
        <ScrollArea className="flex-1 p-4">
          <div className="space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.userId === user?.id ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[70%] p-3 rounded-lg ${
                    message.userId === user?.id
                      ? 'bg-cyan-600 text-white'
                      : message.isAdmin
                      ? 'bg-purple-600 text-white'
                      : 'bg-slate-700 text-white'
                  }`}
                >
                  <div className="text-xs opacity-75 mb-1">
                    {message.username} • {new Date(message.timestamp).toLocaleTimeString()}
                  </div>
                  {message.message && <p>{message.message}</p>}
                  {message.image && (
                    <img
                      src={message.image}
                      alt="Shared image"
                      className="mt-2 max-w-full rounded-lg"
                    />
                  )}
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>

        <div className="p-4 border-t border-slate-700">
          {imagePreview && (
            <div className="mb-3 relative inline-block">
              <img
                src={imagePreview}
                alt="Preview"
                className="h-20 w-20 object-cover rounded-lg"
              />
              <Button
                size="sm"
                variant="destructive"
                className="absolute -top-2 -right-2 h-6 w-6 p-0"
                onClick={removeImage}
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
          )}
          
          <div className="flex space-x-2">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/png,image/jpeg"
              onChange={handleImageSelect}
              className="hidden"
            />
            <Button
              variant="outline"
              size="sm"
              onClick={() => fileInputRef.current?.click()}
              className="border-slate-600 text-white hover:bg-slate-700"
            >
              <ImageIcon className="h-4 w-4" />
            </Button>
            <Input
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Type your message..."
              className="flex-1 bg-slate-700 border-slate-600 text-white"
              onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
            />
            <Button
              onClick={handleSendMessage}
              disabled={!newMessage.trim() && !selectedImage}
              className="bg-gradient-to-r from-cyan-500 to-blue-500"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};