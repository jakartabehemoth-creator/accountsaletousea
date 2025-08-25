export interface User {
  id: string;
  username: string;
  email: string;
  role: 'admin' | 'moderator' | 'user';
  createdAt: string;
  banned: boolean;
}

export interface GameAccount {
  id: string;
  gameType: 'valorant' | 'bloodstrike' | 'knives-out' | 'farlight';
  level: number;
  rank: string;
  status: 'fresh' | 'cheated';
  price: number;
  currency: string;
  description: string;
  images: string[];
  postedBy: string;
  postedAt: string;
  sold: boolean;
}

export interface ChatMessage {
  id: string;
  chatId: string;
  userId: string;
  username: string;
  message: string;
  image?: string;
  timestamp: string;
  isAdmin: boolean;
}

export interface ChatSession {
  id: string;
  userId: string;
  username: string;
  accountId: string;
  account: GameAccount;
  paymentMethod: string;
  status: 'active' | 'completed' | 'cancelled';
  createdAt: string;
  lastMessageAt: string;
  unreadCount: number;
  participants: string[];  // Added this line
}

export interface PaymentMethod {
  id: string;
  name: string;
  type: 'binance' | 'gcash' | 'paypal';
  details: string;
}
