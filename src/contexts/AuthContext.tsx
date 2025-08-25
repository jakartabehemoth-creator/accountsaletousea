import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '@/types';
import { initializeSampleData } from '@/utils/sampleData';

interface AuthContextType {
  user: User | null;
  login: (username: string, password: string) => Promise<boolean>;
  register: (username: string, email: string, password: string) => Promise<boolean>;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }

    // Initialize admin account and ensure it's never banned
    let users: User[] = JSON.parse(localStorage.getItem('users') || '[]');
    let credentials: { username: string; password: string }[] = JSON.parse(localStorage.getItem('credentials') || '[]');

    const adminIndex = users.findIndex((u) => u.username === 'admin');
    const adminCredentialsIndex = credentials.findIndex((c) => c.username === 'admin');

    if (adminIndex === -1) {
      // Admin doesn't exist, create it
      const adminUser: User = {
        id: 'admin-1',
        username: 'admin',
        email: 'admin@accountsale.com',
        role: 'admin',
        createdAt: new Date().toISOString(),
        banned: false,
      };
      const adminCredentials = { username: 'admin', password: 'behemoth1@' };
      users.push(adminUser);
      credentials.push(adminCredentials);
      localStorage.setItem('users', JSON.stringify(users));
      localStorage.setItem('credentials', JSON.stringify(credentials));
      console.log('Admin user and credentials created.');
    } else {
      // Admin exists, ensure banned = false
      if (users[adminIndex].banned) {
        users[adminIndex].banned = false;
        localStorage.setItem('users', JSON.stringify(users));
        console.log('Admin was banned, now unbanned.');
      }
      // Also ensure admin credentials exist (important!)
      if (adminCredentialsIndex === -1) {
        credentials.push({ username: 'admin', password: 'behemoth1@' });
        localStorage.setItem('credentials', JSON.stringify(credentials));
        console.log('Admin credentials recreated.');
      }
    }

    // Initialize sample data
    initializeSampleData();
  }, []);

  const login = async (username: string, password: string): Promise<boolean> => {
    const credentials = JSON.parse(localStorage.getItem('credentials') || '[]');
    const userCredential = credentials.find(
      (c: { username: string; password: string }) => c.username === username && c.password === password
    );

    if (!userCredential) {
      console.log(`Login failed: no matching credentials for user "${username}".`);
      return false;
    }

    const users = JSON.parse(localStorage.getItem('users') || '[]');
    const userData = users.find((u: User) => u.username === username);

    if (!userData) {
      console.log(`Login failed: user data not found for username "${username}".`);
      return false;
    }

    // Allow admin to login regardless of banned status
    if (userData.banned && userData.username !== 'admin') {
      console.log(`Login failed: user "${username}" is banned.`);
      return false;
    }

    // Passed all checks - login successful
    console.log(`User "${username}" logged in successfully. Banned: ${userData.banned}`);
    setUser(userData);
    localStorage.setItem('user', JSON.stringify(userData));
    return true;
  };

  const register = async (username: string, email: string, password: string): Promise<boolean> => {
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    const credentials = JSON.parse(localStorage.getItem('credentials') || '[]');

    const existingUser = users.find((u: User) => u.username === username || u.email === email);
    if (existingUser) {
      return false;
    }

    const newUser: User = {
      id: Date.now().toString(),
      username,
      email,
      role: 'user',
      createdAt: new Date().toISOString(),
      banned: false,
    };

    users.push(newUser);
    credentials.push({ username, password });

    localStorage.setItem('users', JSON.stringify(users));
    localStorage.setItem('credentials', JSON.stringify(credentials));

    setUser(newUser);
    localStorage.setItem('user', JSON.stringify(newUser));
    return true;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        register,
        logout,
        isAuthenticated: !!user,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
