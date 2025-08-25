import React, { useState } from 'react';
import { AnimatedBackground } from '@/components/ui/animated-background';
import { Header } from '@/components/Header';
import { AuthModal } from '@/components/AuthModal';
import { GameCategories } from '@/components/GameCategories';
import { AccountListing } from '@/components/AccountListing';
import { PurchaseModal } from '@/components/PurchaseModal';
import { ChatModal } from '@/components/ChatModal';
import { AdminPanel } from '@/components/AdminPanel';
import { GameAccount } from '@/types';

export default function Index() {
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isAdminPanelOpen, setIsAdminPanelOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedAccount, setSelectedAccount] = useState<GameAccount | null>(null);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('');
  const [isPurchaseModalOpen, setIsPurchaseModalOpen] = useState(false);
  const [isChatModalOpen, setIsChatModalOpen] = useState(false);

  const handleCategorySelect = (category: string) => {
    setSelectedCategory(category);
  };

  const handleBackToCategories = () => {
    setSelectedCategory(null);
  };

  const handlePurchase = (account: GameAccount) => {
    setSelectedAccount(account);
    setIsPurchaseModalOpen(true);
  };

  const handleProceedToChat = (account: GameAccount, paymentMethod: string) => {
    setSelectedAccount(account);
    setSelectedPaymentMethod(paymentMethod);
    setIsChatModalOpen(true);
  };

  return (
    <div className="min-h-screen relative">
      <AnimatedBackground />
      
      <Header 
        onAuthClick={() => setIsAuthModalOpen(true)}
        onAdminClick={() => setIsAdminPanelOpen(true)}
      />
      
      <main className="pt-20">
        {!selectedCategory ? (
          <>
            <div className="container mx-auto px-6 py-20 text-center">
              <h1 className="text-6xl font-bold mb-6 bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text text-transparent">
                Account Sale to Use
              </h1>
              <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
                Your trusted marketplace for cheap gaming accounts. Buy and sell accounts for your favorite games with confidence.
              </p>
            </div>
            <GameCategories onCategorySelect={handleCategorySelect} />
          </>
        ) : (
          <AccountListing
            category={selectedCategory}
            onBack={handleBackToCategories}
            onPurchase={handlePurchase}
          />
        )}
      </main>

      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
      />

      <AdminPanel
        isOpen={isAdminPanelOpen}
        onClose={() => setIsAdminPanelOpen(false)}
      />

      <PurchaseModal
        account={selectedAccount}
        isOpen={isPurchaseModalOpen}
        onClose={() => setIsPurchaseModalOpen(false)}
        onProceedToChat={handleProceedToChat}
      />

      <ChatModal
        account={selectedAccount}
        paymentMethod={selectedPaymentMethod}
        isOpen={isChatModalOpen}
        onClose={() => setIsChatModalOpen(false)}
      />
    </div>
  );
}