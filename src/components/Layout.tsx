import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { LogOut, Settings, User, Shield, Home } from 'lucide-react';
import { storage } from '@/lib/storage';
import AnimatedBackground from './AnimatedBackground';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const location = useLocation();
  const currentUser = storage.getCurrentUser();

  const handleLogout = () => {
    storage.setCurrentUser(null);
    window.location.href = '/';
  };

  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="min-h-screen relative">
      <AnimatedBackground />

      {/* Header */}
      <header className="relative z-10 bg-black/20 backdrop-blur-md border-b border-white/10">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <Link to="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
              <img src="/favicon1.png" alt="Account Sale Icon" className="w-5 h-5" />
            </div>
            <span className="text-xl font-bold text-white">Account Sale</span>
          </Link>

          <nav className="hidden md:flex items-center space-x-6">
            <Link
              to="/"
              className={`text-sm transition-colors ${
                isActive('/') ? 'text-blue-400' : 'text-gray-300 hover:text-white'
              }`}
            >
              <Home className="w-4 h-4 inline mr-2" />
              Home
            </Link>

            {currentUser && (
              <>
                {(currentUser.role === 'admin' || currentUser.role === 'moderator') && (
                  <Link
                    to="/admin"
                    className={`text-sm transition-colors ${
                      isActive('/admin') ? 'text-blue-400' : 'text-gray-300 hover:text-white'
                    }`}
                  >
                    <Shield className="w-4 h-4 inline mr-2" />
                    Admin Panel
                  </Link>
                )}
              </>
            )}
          </nav>

          <div className="flex items-center space-x-4">
            {currentUser ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                    <Avatar className="h-10 w-10">
                      <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white">
                        {currentUser.username.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56 bg-black/90 border-gray-700">
                  <DropdownMenuItem className="flex-col items-start text-gray-300">
                    <div className="font-medium text-white">{currentUser.username}</div>
                    <div className="text-xs text-gray-400">{currentUser.role}</div>
                  </DropdownMenuItem>
                  <DropdownMenuItem className="text-gray-300 hover:text-white">
                    <User className="mr-2 h-4 w-4" />
                    Profile
                  </DropdownMenuItem>
                  <DropdownMenuItem className="text-gray-300 hover:text-white">
                    <Settings className="mr-2 h-4 w-4" />
                    Settings
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={handleLogout}
                    className="text-red-400 hover:text-red-300"
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <div className="flex items-center space-x-2">
                <Link to="/login">
                  <Button variant="ghost" className="text-gray-300 hover:text-white">
                    Login
                  </Button>
                </Link>
                <Link to="/register">
                  <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
                    Register
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-10">{children}</main>
    </div>
  );
};

export default Layout;
