import React from 'react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { User, Settings, LogOut } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface HeaderProps {
  onAuthClick: () => void;
  onAdminClick?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onAuthClick, onAdminClick }) => {
  const { user, logout, isAuthenticated } = useAuth();
  const faviconPath = '/favicon1.png'; // Path to your favicon image in public folder

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-black/20 backdrop-blur-md border-b border-white/10">
      <div className="container mx-auto px-6 py-4 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <img src={faviconPath} alt="Logo" className="h-8 w-8" />
          <h1 className="text-2xl font-bold bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
            Account Sale to Use
          </h1>
        </div>

        <div className="flex items-center space-x-4">
          {isAuthenticated ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="flex items-center space-x-2 text-white hover:bg-white/10">
                  <User className="h-5 w-5" />
                  <span>{user?.username}</span>
                  {user?.role !== 'user' && (
                    <span className="px-2 py-1 text-xs bg-cyan-500/20 text-cyan-300 rounded">
                      {user?.role}
                    </span>
                  )}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="bg-slate-800 border-slate-700">
                {(user?.role === 'admin' || user?.role === 'moderator') && onAdminClick && (
                  <DropdownMenuItem onClick={onAdminClick} className="text-white hover:bg-slate-700">
                    <Settings className="h-4 w-4 mr-2" />
                    Admin Panel
                  </DropdownMenuItem>
                )}
                <DropdownMenuItem onClick={logout} className="text-white hover:bg-slate-700">
                  <LogOut className="h-4 w-4 mr-2" />
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button onClick={onAuthClick} className="bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600">
              Login / Register
            </Button>
          )}
        </div>
      </div>
    </header>
  );
};
