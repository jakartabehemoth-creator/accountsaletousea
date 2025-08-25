const API_BASE_URL = 'http://localhost:5000/api';

class ApiService {
  private token: string | null = null;

  constructor() {
    this.token = localStorage.getItem('auth_token');
  }

  private async request(endpoint: string, options: RequestInit = {}) {
    const url = `${API_BASE_URL}${endpoint}`;
    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    if (this.token) {
      config.headers = {
        ...config.headers,
        Authorization: `Bearer ${this.token}`,
      };
    }

    try {
      const response = await fetch(url, config);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'API request failed');
      }

      return data;
    } catch (error) {
      console.error('API Error:', error);
      throw error;
    }
  }

  // Authentication
  async login(username: string, password: string) {
    const data = await this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ username, password }),
    });
    
    this.token = data.token;
    localStorage.setItem('auth_token', data.token);
    localStorage.setItem('current_user', JSON.stringify(data.user));
    
    return data;
  }

  async register(username: string, email: string, password: string) {
    const data = await this.request('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ username, email, password }),
    });
    
    this.token = data.token;
    localStorage.setItem('auth_token', data.token);
    localStorage.setItem('current_user', JSON.stringify(data.user));
    
    return data;
  }

  async getCurrentUser() {
    try {
      const data = await this.request('/auth/me');
      localStorage.setItem('current_user', JSON.stringify(data.user));
      return data.user;
    } catch (error) {
      this.logout();
      return null;
    }
  }

  logout() {
    this.token = null;
    localStorage.removeItem('auth_token');
    localStorage.removeItem('current_user');
  }

  // Games
  async getGames() {
    return this.request('/games');
  }

  async createGame(name: string) {
    return this.request('/games', {
      method: 'POST',
      body: JSON.stringify({ name }),
    });
  }

  async deleteGame(id: string) {
    return this.request(`/games/${id}`, {
      method: 'DELETE',
    });
  }

  // Accounts
  async getAccounts() {
    return this.request('/accounts');
  }

  async getAccountsByGame(gameId: string) {
    return this.request(`/accounts/game/${gameId}`);
  }

  async createAccount(accountData: {
    gameId: string;
    level: string;
    rank: string;
    status: 'Fresh' | 'First Owner' | 'Cheated';
    price: string;
    description: string;
  }) {
    return this.request('/accounts', {
      method: 'POST',
      body: JSON.stringify(accountData),
    });
  }

  async deleteAccount(id: string) {
    return this.request(`/accounts/${id}`, {
      method: 'DELETE',
    });
  }

  // Payment Methods
  async getPaymentMethods() {
    return this.request('/payments');
  }

  async createPaymentMethod(name: string, details: string) {
    return this.request('/payments', {
      method: 'POST',
      body: JSON.stringify({ name, details }),
    });
  }

  async deletePaymentMethod(id: string) {
    return this.request(`/payments/${id}`, {
      method: 'DELETE',
    });
  }

  // Users
  async getUsers() {
    return this.request('/users');
  }

  async updateUserRole(userId: string, role: 'user' | 'admin' | 'moderator') {
    return this.request(`/users/${userId}/role`, {
      method: 'PATCH',
      body: JSON.stringify({ role }),
    });
  }
}

export const apiService = new ApiService();