export interface User {
  id: string;
  username: string;
  email: string;
  role: 'admin' | 'moderator' | 'user';
  createdAt: string;
}

export interface Game {
  id: string;
  name: string;
  icon?: string;
  createdAt: string;
}

export interface Account {
  id: string;
  gameId: string;
  gameName?: string; // add this field, optional if you want
  level: string;
  rank: string;
  status: 'Fresh' | 'First Owner' | 'Cheated';
  price: number;
  description: string;
  images: string[];
  isAvailable: boolean;
  createdAt: string;
}

// ✅ Alias for compatibility with components using `GameAccount`
export type GameAccount = Account;

export interface PaymentMethod {
  id: string;
  name: string;
  icon?: string;
  isActive: boolean;
}

export interface ChatMessage {
  id: string;
  userId: string;
  message: string;
  timestamp: string;
  isAdmin: boolean;
  isRead?: boolean;
  imageUrl?: string;
  fileName?: string;
}

export interface Purchase {
  id: string;
  userId: string;
  accountId: string;
  paymentMethod: string;
  status: 'pending' | 'completed' | 'cancelled';
  chatMessages: ChatMessage[];
  createdAt: string;
}
