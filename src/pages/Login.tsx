import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Eye, EyeOff } from 'lucide-react';
import { storage } from '@/lib/storage';
import Layout from '@/components/Layout';

export default function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const users = storage.getUsers();
    const user = users.find(u => u.username === username);

    // Simple authentication (in real app, you'd hash passwords)
    if (user && (username === 'admin' || password === 'password')) {
      storage.setCurrentUser(user);
      navigate('/');
    } else {
      setError('Invalid username or password');
    }
  };

  return (
    <Layout>
      <div className="min-h-screen flex items-center justify-center px-4">
        <Card className="w-full max-w-md bg-black/40 border-gray-700">
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-center text-white">
              Welcome Back
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              {error && (
                <Alert className="bg-red-900/50 border-red-700">
                  <AlertDescription className="text-red-200">{error}</AlertDescription>
                </Alert>
              )}
              
              <div className="space-y-2">
                <Label htmlFor="username" className="text-gray-300">Username</Label>
                <Input
                  id="username"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="bg-black/40 border-gray-700 text-white"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-gray-300">Password</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="bg-black/40 border-gray-700 text-white pr-10"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-3 text-gray-400 hover:text-white"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <Button 
                type="submit" 
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
              >
                Sign In
              </Button>

              <div className="text-center text-sm text-gray-400">
                Don't have an account?{' '}
                <Link to="/register" className="text-blue-400 hover:text-blue-300">
                  Sign up
                </Link>
              </div>

              <div className="text-center text-xs text-gray-500 mt-4">
                Demo credentials: admin / password
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}