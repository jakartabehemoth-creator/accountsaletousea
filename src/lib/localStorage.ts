import { User, Game, GameAccount, ChatMessage, PaymentMethod, Purchase } from '@/types';

// Storage keys
const STORAGE_KEYS = {
  USERS: 'account_sale_users',
  GAMES: 'account_sale_games',
  ACCOUNTS: 'account_sale_accounts',
  CHAT_MESSAGES: 'account_sale_chat_messages',
  PAYMENT_METHODS: 'account_sale_payment_methods',
  PURCHASES: 'account_sale_purchases',
  CURRENT_USER: 'account_sale_current_user',
};

import { createDemoAccounts } from './demoData';

// Initialize default data
export const initializeDefaultData = () => {
  // Initialize default games
  if (!localStorage.getItem(STORAGE_KEYS.GAMES)) {
    const defaultGames: Game[] = [
      {
        id: '1',
        name: 'Valorant',
        icon: '/assets/valorant.png',
        createdAt: new Date().toISOString(),
      },
      {
        id: '2',
        name: 'Farlight',
        icon: '/assets/farlight.png',
        createdAt: new Date().toISOString(),
      },
      {
        id: '3',
        name: 'Bloodstrike',
        icon: '/assets/bloodstrike.png',
        createdAt: new Date().toISOString(),
      },
      {
        id: '4',
        name: 'Knives Out',
        icon: '/assets/knives-out.png',
        createdAt: new Date().toISOString(),
      },
    ];
    localStorage.setItem(STORAGE_KEYS.GAMES, JSON.stringify(defaultGames));
  }

  // Initialize default admin user
  if (!localStorage.getItem(STORAGE_KEYS.USERS)) {
    const defaultUsers: User[] = [
      {
        id: '1',
        username: 'admin',
        email: 'admin@accountsale.com',
        role: 'admin',
        createdAt: new Date().toISOString(),
      },
    ];
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(defaultUsers));
  }

  // Initialize default payment methods
  if (!localStorage.getItem(STORAGE_KEYS.PAYMENT_METHODS)) {
    const defaultPaymentMethods: PaymentMethod[] = [
      {
        id: '1',
        name: 'PayPal',
        icon: '💳',
        details: 'Pay securely with PayPal',
      },
      {
        id: '2',
        name: 'GCash',
        icon: '📱',
        details: 'Mobile payment via GCash',
      },
      {
        id: '3',
        name: 'Binance',
        icon: '₿',
        details: 'Cryptocurrency payment via Binance',
      },
    ];
    localStorage.setItem(STORAGE_KEYS.PAYMENT_METHODS, JSON.stringify(defaultPaymentMethods));
  }

  // Initialize demo accounts
  if (!localStorage.getItem(STORAGE_KEYS.ACCOUNTS)) {
    localStorage.setItem(STORAGE_KEYS.ACCOUNTS, JSON.stringify([]));
    createDemoAccounts();
  }
  if (!localStorage.getItem(STORAGE_KEYS.CHAT_MESSAGES)) {
    localStorage.setItem(STORAGE_KEYS.CHAT_MESSAGES, JSON.stringify([]));
  }
  if (!localStorage.getItem(STORAGE_KEYS.PURCHASES)) {
    localStorage.setItem(STORAGE_KEYS.PURCHASES, JSON.stringify([]));
  }
};

// Generic storage functions
export const getStorageItem = <T>(key: string): T[] => {
  const item = localStorage.getItem(key);
  return item ? JSON.parse(item) : [];
};

export const setStorageItem = <T>(key: string, data: T[]): void => {
  localStorage.setItem(key, JSON.stringify(data));
};

// User management
export const getUsers = (): User[] => getStorageItem<User>(STORAGE_KEYS.USERS);
export const setUsers = (users: User[]): void => setStorageItem(STORAGE_KEYS.USERS, users);

export const getCurrentUser = (): User | null => {
  const userStr = localStorage.getItem(STORAGE_KEYS.CURRENT_USER);
  return userStr ? JSON.parse(userStr) : null;
};

export const setCurrentUser = (user: User | null): void => {
  if (user) {
    localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(user));
  } else {
    localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
  }
};

// Game management
export const getGames = (): Game[] => getStorageItem<Game>(STORAGE_KEYS.GAMES);
export const setGames = (games: Game[]): void => setStorageItem(STORAGE_KEYS.GAMES, games);

// Account management
export const getAccounts = (): GameAccount[] => getStorageItem<GameAccount>(STORAGE_KEYS.ACCOUNTS);
export const setAccounts = (accounts: GameAccount[]): void => setStorageItem(STORAGE_KEYS.ACCOUNTS, accounts);

// Chat management
export const getChatMessages = (): ChatMessage[] => getStorageItem<ChatMessage>(STORAGE_KEYS.CHAT_MESSAGES);
export const setChatMessages = (messages: ChatMessage[]): void => setStorageItem(STORAGE_KEYS.CHAT_MESSAGES, messages);

// Payment methods
export const getPaymentMethods = (): PaymentMethod[] => getStorageItem<PaymentMethod>(STORAGE_KEYS.PAYMENT_METHODS);
export const setPaymentMethods = (methods: PaymentMethod[]): void => setStorageItem(STORAGE_KEYS.PAYMENT_METHODS, methods);

// Purchases
export const getPurchases = (): Purchase[] => getStorageItem<Purchase>(STORAGE_KEYS.PURCHASES);
export const setPurchases = (purchases: Purchase[]): void => setStorageItem(STORAGE_KEYS.PURCHASES, purchases);

// Authentication helpers
export const loginUser = (username: string, password: string): boolean => {
  const users = getUsers();
  const user = users.find(u => u.username === username);
  if (user) {
    setCurrentUser(user);
    return true;
  }
  return false;
};

export const registerUser = (username: string, email: string, password: string): boolean => {
  const users = getUsers();
  
  // Check if username already exists
  const existingUser = users.find(u => u.username === username);
  if (existingUser) {
    return false;
  }
  
  const newUser: User = {
    id: Date.now().toString(),
    username,
    email: email || `${username}@example.com`, // Use default email if none provided
    role: 'user',
    createdAt: new Date().toISOString(),
  };
  
  users.push(newUser);
  setUsers(users);
  setCurrentUser(newUser);
  return true;
};

export const logoutUser = (): void => {
  setCurrentUser(null);
};