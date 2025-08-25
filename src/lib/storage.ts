import { User, Game, Account, PaymentMethod, Purchase } from '@/types';

const STORAGE_KEYS = {
  USERS: 'account_sale_users',
  GAMES: 'account_sale_games',
  ACCOUNTS: 'account_sale_accounts',
  PAYMENT_METHODS: 'account_sale_payment_methods',
  PURCHASES: 'account_sale_purchases',
  CURRENT_USER: 'account_sale_current_user',
};

// Initialize default data
const initializeStorage = () => {
  // Default games
  const defaultGames: Game[] = [
    { id: '1', name: 'Valorant', icon: '/assets/valorant.png', createdAt: new Date().toISOString() },
    { id: '2', name: 'Farlight', icon: '/assets/farlight.png', createdAt: new Date().toISOString() },
    { id: '3', name: 'Bloodstrike', icon: '/assets/bloodstrike.png', createdAt: new Date().toISOString() },
    { id: '4', name: 'Knives Out', icon: '/assets/knives-out.png', createdAt: new Date().toISOString() },
  ];

  // Default payment methods
  const defaultPaymentMethods: PaymentMethod[] = [
    { id: '1', name: 'PayPal', icon: '/assets/paypal.png', isActive: true },
    { id: '2', name: 'GCash', icon: '/assets/gcash.png', isActive: true },
    { id: '3', name: 'Binance', icon: '/assets/binance.png', isActive: true },
  ];

  // Default admin user
  const defaultUsers: User[] = [
    {
      id: '1',
      username: 'admin',
      email: 'admin@accountsale.com',
      role: 'admin',
      createdAt: new Date().toISOString(),
    },
  ];

  // Initialize if not exists
  if (!localStorage.getItem(STORAGE_KEYS.GAMES)) {
    localStorage.setItem(STORAGE_KEYS.GAMES, JSON.stringify(defaultGames));
  }
  if (!localStorage.getItem(STORAGE_KEYS.PAYMENT_METHODS)) {
    localStorage.setItem(STORAGE_KEYS.PAYMENT_METHODS, JSON.stringify(defaultPaymentMethods));
  }
  if (!localStorage.getItem(STORAGE_KEYS.USERS)) {
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(defaultUsers));
  }
  if (!localStorage.getItem(STORAGE_KEYS.ACCOUNTS)) {
    localStorage.setItem(STORAGE_KEYS.ACCOUNTS, JSON.stringify([]));
  }
  if (!localStorage.getItem(STORAGE_KEYS.PURCHASES)) {
    localStorage.setItem(STORAGE_KEYS.PURCHASES, JSON.stringify([]));
  }
};

// Storage functions
export const storage = {
  // Users
  getUsers: (): User[] => {
    initializeStorage();
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.USERS) || '[]');
  },
  
  saveUsers: (users: User[]): void => {
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
  },

  getCurrentUser: (): User | null => {
    const user = localStorage.getItem(STORAGE_KEYS.CURRENT_USER);
    return user ? JSON.parse(user) : null;
  },

  setCurrentUser: (user: User | null): void => {
    if (user) {
      localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(user));
    } else {
      localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
    }
  },

  // Games
  getGames: (): Game[] => {
    initializeStorage();
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.GAMES) || '[]');
  },
  
  saveGames: (games: Game[]): void => {
    localStorage.setItem(STORAGE_KEYS.GAMES, JSON.stringify(games));
  },

  // Accounts
  getAccounts: (): Account[] => {
    initializeStorage();
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.ACCOUNTS) || '[]');
  },
  
  saveAccounts: (accounts: Account[]): void => {
    localStorage.setItem(STORAGE_KEYS.ACCOUNTS, JSON.stringify(accounts));
  },

  // Payment Methods
  getPaymentMethods: (): PaymentMethod[] => {
    initializeStorage();
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.PAYMENT_METHODS) || '[]');
  },
  
  savePaymentMethods: (methods: PaymentMethod[]): void => {
    localStorage.setItem(STORAGE_KEYS.PAYMENT_METHODS, JSON.stringify(methods));
  },

  // Purchases
  getPurchases: (): Purchase[] => {
    initializeStorage();
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.PURCHASES) || '[]');
  },
  
  savePurchases: (purchases: Purchase[]): void => {
    localStorage.setItem(STORAGE_KEYS.PURCHASES, JSON.stringify(purchases));
  },
};