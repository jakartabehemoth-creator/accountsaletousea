import { User, Game, GameAccount, PaymentMethod } from '@/types';
import { apiService } from './api';

// Enhanced storage that tries API first, falls back to localStorage
export class ApiStorage {
  private static instance: ApiStorage;
  
  static getInstance(): ApiStorage {
    if (!ApiStorage.instance) {
      ApiStorage.instance = new ApiStorage();
    }
    return ApiStorage.instance;
  }

  // User authentication with API integration
  async loginUser(username: string, password: string = ''): Promise<boolean> {
    try {
      if (password) {
        // Use real API login
        await apiService.login(username, password);
        return true;
      } else {
        // Backward compatibility mode - create temporary session
        const tempUser: User = {
          id: Date.now().toString(),
          username,
          email: `${username}@example.com`,
          role: username === 'admin' ? 'admin' : 'user',
          createdAt: new Date().toISOString()
        };
        localStorage.setItem('account_sale_current_user', JSON.stringify(tempUser));
        return true;
      }
    } catch (error) {
      console.error('Login failed:', error);
      // Fallback for admin login without password
      if (username === 'admin') {
        const adminUser: User = {
          id: '1',
          username: 'admin',
          email: 'admin@accountsale.com',
          role: 'admin',
          createdAt: new Date().toISOString()
        };
        localStorage.setItem('account_sale_current_user', JSON.stringify(adminUser));
        return true;
      }
      return false;
    }
  }

  async registerUser(username: string, email: string, password: string = ''): Promise<boolean> {
    try {
      if (password) {
        // Use real API registration
        await apiService.register(username, email, password);
        return true;
      } else {
        // Backward compatibility mode - check localStorage first
        const users = await this.getUsers();
        const existingUser = users.find(user => 
          user.username === username || user.email === email
        );
        
        if (existingUser) {
          console.log('User already exists in localStorage');
          return false;
        }
        
        const tempUser: User = {
          id: Date.now().toString(),
          username,
          email,
          role: 'user',
          createdAt: new Date().toISOString()
        };
        
        // Add to users list
        users.push(tempUser);
        localStorage.setItem('account_sale_users', JSON.stringify(users));
        localStorage.setItem('account_sale_current_user', JSON.stringify(tempUser));
        return true;
      }
    } catch (error) {
      console.error('Registration failed:', error);
      
      // Fallback to localStorage even if API fails
      const users = await this.getUsers();
      const existingUser = users.find(user => 
        user.username === username || user.email === email
      );
      
      if (existingUser) {
        return false;
      }
      
      const newUser: User = {
        id: Date.now().toString(),
        username,
        email,
        role: 'user',
        createdAt: new Date().toISOString()
      };
      
      users.push(newUser);
      localStorage.setItem('account_sale_users', JSON.stringify(users));
      localStorage.setItem('account_sale_current_user', JSON.stringify(newUser));
      return true;
    }
  }

  logoutUser(): void {
    apiService.logout();
    localStorage.removeItem('account_sale_current_user');
  }

  getCurrentUser(): User | null {
    const user = localStorage.getItem('account_sale_current_user');
    return user ? JSON.parse(user) : null;
  }

  // Games management with API integration
  async getGames(): Promise<Game[]> {
    try {
      const games = await apiService.getGames();
      // Cache locally
      localStorage.setItem('games_cache', JSON.stringify(games));
      return games;
    } catch (error) {
      // Fallback to localStorage
      const cached = localStorage.getItem('games_cache');
      if (cached) return JSON.parse(cached);
      
      // Fallback to original localStorage function
      const originalGames = localStorage.getItem('account_sale_games');
      return originalGames ? JSON.parse(originalGames) : [];
    }
  }

  async createGame(name: string): Promise<Game | null> {
    try {
      const game = await apiService.createGame(name);
      // Update cache
      const games = await this.getGames();
      return game;
    } catch (error) {
      console.error('Failed to create game via API:', error);
      // Fallback to localStorage
      const games = await this.getGames();
      const newGame: Game = {
        id: Date.now().toString(),
        name,
        icon: `/assets/${name.toLowerCase()}.png`,
        createdAt: new Date().toISOString()
      };
      games.push(newGame);
      localStorage.setItem('account_sale_games', JSON.stringify(games));
      return newGame;
    }
  }

  async deleteGame(id: string): Promise<boolean> {
    try {
      await apiService.deleteGame(id);
      return true;
    } catch (error) {
      console.error('Failed to delete game via API:', error);
      // Fallback to localStorage
      const games = await this.getGames();
      const filteredGames = games.filter(g => g.id !== id);
      localStorage.setItem('account_sale_games', JSON.stringify(filteredGames));
      return true;
    }
  }

  // Accounts management with API integration
  async getAccounts(): Promise<GameAccount[]> {
    try {
      const accounts = await apiService.getAccounts();
      localStorage.setItem('accounts_cache', JSON.stringify(accounts));
      return accounts;
    } catch (error) {
      const cached = localStorage.getItem('accounts_cache');
      if (cached) return JSON.parse(cached);
      
      const originalAccounts = localStorage.getItem('account_sale_accounts');
      return originalAccounts ? JSON.parse(originalAccounts) : [];
    }
  }

  async createAccount(accountData: {
    gameId: string;
    level: string;
    rank: string;
    status: 'Fresh' | 'First Owner' | 'Cheated';
    price: string;
    description: string;
  }): Promise<GameAccount | null> {
    try {
      const account = await apiService.createAccount(accountData);
      return account;
    } catch (error) {
      console.error('Failed to create account via API:', error);
      // Fallback to localStorage
      const games = await this.getGames();
      const game = games.find(g => g.id === accountData.gameId);
      
      const newAccount: GameAccount = {
        id: Date.now().toString(),
        gameId: accountData.gameId,
        gameName: game?.name || '',
        level: parseInt(accountData.level),
        rank: accountData.rank,
        status: accountData.status,
        price: parseFloat(accountData.price),
        description: accountData.description,
        screenshots: [],
        createdAt: new Date().toISOString(),
        createdBy: this.getCurrentUser()?.id || '1'
      };
      
      const accounts = await this.getAccounts();
      accounts.push(newAccount);
      localStorage.setItem('account_sale_accounts', JSON.stringify(accounts));
      return newAccount;
    }
  }

  async deleteAccount(id: string): Promise<boolean> {
    try {
      await apiService.deleteAccount(id);
      return true;
    } catch (error) {
      console.error('Failed to delete account via API:', error);
      const accounts = await this.getAccounts();
      const filteredAccounts = accounts.filter(a => a.id !== id);
      localStorage.setItem('account_sale_accounts', JSON.stringify(filteredAccounts));
      return true;
    }
  }

  // Payment methods with API integration
  async getPaymentMethods(): Promise<PaymentMethod[]> {
    try {
      const methods = await apiService.getPaymentMethods();
      localStorage.setItem('payment_methods_cache', JSON.stringify(methods));
      return methods;
    } catch (error) {
      const cached = localStorage.getItem('payment_methods_cache');
      if (cached) return JSON.parse(cached);
      
      const originalMethods = localStorage.getItem('account_sale_payment_methods');
      return originalMethods ? JSON.parse(originalMethods) : [];
    }
  }

  async createPaymentMethod(name: string, details: string): Promise<PaymentMethod | null> {
    try {
      const method = await apiService.createPaymentMethod(name, details);
      return method;
    } catch (error) {
      console.error('Failed to create payment method via API:', error);
      const newMethod: PaymentMethod = {
        id: Date.now().toString(),
        name,
        icon: '💳',
        details
      };
      
      const methods = await this.getPaymentMethods();
      methods.push(newMethod);
      localStorage.setItem('account_sale_payment_methods', JSON.stringify(methods));
      return newMethod;
    }
  }

  async deletePaymentMethod(id: string): Promise<boolean> {
    try {
      await apiService.deletePaymentMethod(id);
      return true;
    } catch (error) {
      console.error('Failed to delete payment method via API:', error);
      const methods = await this.getPaymentMethods();
      const filteredMethods = methods.filter(m => m.id !== id);
      localStorage.setItem('account_sale_payment_methods', JSON.stringify(filteredMethods));
      return true;
    }
  }

  // Users management with API integration
  async getUsers(): Promise<User[]> {
    try {
      return await apiService.getUsers();
    } catch (error) {
      console.error('Failed to fetch users via API:', error);
      const originalUsers = localStorage.getItem('account_sale_users');
      return originalUsers ? JSON.parse(originalUsers) : [];
    }
  }

  async updateUserRole(userId: string, role: 'user' | 'admin' | 'moderator'): Promise<boolean> {
    try {
      await apiService.updateUserRole(userId, role);
      return true;
    } catch (error) {
      console.error('Failed to update user role via API:', error);
      // For localStorage fallback, we'd need to implement this
      return false;
    }
  }
}

// Export singleton instance
export const apiStorage = ApiStorage.getInstance();