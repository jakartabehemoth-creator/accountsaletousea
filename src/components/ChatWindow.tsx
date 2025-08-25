import { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ChatMessage } from '@/types';
import { getChatMessages, setChatMessages, getCurrentUser } from '@/lib/localStorage';
import { Send, X } from 'lucide-react';

interface ChatWindowProps {
  accountId: string;
  onClose: () => void;
}

export const ChatWindow = ({ accountId, onClose }: ChatWindowProps) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const currentUser = getCurrentUser();

  useEffect(() => {
    loadMessages();
  }, [accountId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const loadMessages = () => {
    const allMessages = getChatMessages();
    const accountMessages = allMessages.filter(msg => msg.accountId === accountId);
    setMessages(accountMessages);
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !currentUser) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      accountId,
      userId: currentUser.id,
      username: currentUser.username,
      message: newMessage,
      timestamp: new Date().toISOString(),
      isAdmin: false,
    };

    const allMessages = getChatMessages();
    allMessages.push(userMessage);
    setChatMessages(allMessages);
    setMessages(prev => [...prev, userMessage]);
    setNewMessage('');
    setIsLoading(true);

    // Simulate admin response
    setTimeout(() => {
      const adminMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        accountId,
        userId: 'admin',
        username: 'Admin',
        message: getAdminResponse(newMessage),
        timestamp: new Date().toISOString(),
        isAdmin: true,
      };

      const updatedMessages = getChatMessages();
      updatedMessages.push(adminMessage);
      setChatMessages(updatedMessages);
      setMessages(prev => [...prev, adminMessage]);
      setIsLoading(false);
    }, 1000 + Math.random() * 2000);
  };

  const getAdminResponse = (userMessage: string): string => {
    const responses = [
      "Hi! Thank you for your interest in this account. How can I help you today?",
      "I can provide more details about this account. What specific information do you need?",
      "This account is verified and ready for transfer. Do you have any questions about the purchase process?",
      "I can arrange the account transfer once payment is confirmed. Which payment method would you prefer?",
      "The account comes with all original details and security questions. Is there anything else you'd like to know?",
    ];
    return responses[Math.floor(Math.random() * responses.length)];
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-md h-96 bg-white/10 backdrop-blur-sm border-white/20">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-white">Chat with Admin</CardTitle>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="w-4 h-4" />
          </Button>
        </CardHeader>
        <CardContent className="flex flex-col h-full">
          <ScrollArea className="flex-1 mb-4">
            <div className="space-y-3">
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
                      <span className="text-xs font-medium">{message.username}</span>
                      <span className="text-xs opacity-70">
                        {new Date(message.timestamp).toLocaleTimeString()}
                      </span>
                    </div>
                    <p className="text-sm">{message.message}</p>
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
          <div className="flex gap-2">
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
        </CardContent>
      </Card>
    </div>
  );
};