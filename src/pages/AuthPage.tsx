import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AnimatedBackground from '@/components/AnimatedBackground';
import { apiStorage } from '@/lib/apiStorage';
import { ArrowLeft, Gamepad2 } from 'lucide-react';
import { toast } from 'sonner';

interface AuthPageProps {
  mode: 'login' | 'register';
  onBack: () => void;
  onSuccess: () => void;
}

export const AuthPage = ({ mode, onBack, onSuccess }: AuthPageProps) => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (mode === 'login') {
        const success = await apiStorage.loginUser(formData.username, formData.password);
        if (success) {
          toast.success('Login successful!');
          onSuccess();
        } else {
          toast.error('Invalid username or password');
        }
      } else {
        const success = await apiStorage.registerUser(formData.username, formData.email || `${formData.username}@example.com`, formData.password);
        if (success) {
          toast.success('Registration successful!');
          onSuccess();
        } else {
          toast.error('Username already exists');
        }
      }
    } catch (error) {
      toast.error('An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  return (
    <div className="min-h-screen relative overflow-hidden flex items-center justify-center">
      <AnimatedBackground />
      
      {/* Back Button */}
      <Button 
        variant="ghost" 
        onClick={onBack} 
        className="absolute top-6 left-6 text-white hover:bg-white/10 z-20"
      >
        <ArrowLeft className="w-5 h-5 mr-2" />
        Back
      </Button>

      {/* Auth Form */}
      <Card className="w-full max-w-md bg-white/10 backdrop-blur-sm border-white/20 relative z-10">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
              <Gamepad2 className="w-8 h-8 text-white" />
            </div>
          </div>
          <CardTitle className="text-2xl text-white">
            {mode === 'login' ? 'Welcome Back' : 'Create Account'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="username" className="text-white">Username</Label>
              <Input
                id="username"
                name="username"
                type="text"
                value={formData.username}
                onChange={handleChange}
                required
                className="bg-white/20 border-white/30 text-white placeholder-gray-300"
                placeholder="Enter your username"
              />
            </div>
            
            {mode === 'register' && (
              <div>
                <Label htmlFor="email" className="text-white">Email (Optional)</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="bg-white/20 border-white/30 text-white placeholder-gray-300"
                  placeholder="Enter your email"
                />
              </div>
            )}
            
            <div>
              <Label htmlFor="password" className="text-white">Password</Label>
              <Input
                id="password"
                name="password"
                type="password"
                value={formData.password}
                onChange={handleChange}
                required
                className="bg-white/20 border-white/30 text-white placeholder-gray-300"
                placeholder="Enter your password"
              />
            </div>
            
            <Button 
              type="submit" 
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white"
              disabled={isLoading}
            >
              {isLoading ? 'Processing...' : (mode === 'login' ? 'Login' : 'Register')}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};