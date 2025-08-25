import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ArrowLeft, MessageCircle, CreditCard, Shield, Star } from 'lucide-react';
import { storage } from '@/lib/storage';
import { Account, Game, PaymentMethod } from '@/types';
import Layout from '@/components/Layout';

export default function AccountDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [account, setAccount] = useState<Account | null>(null);
  const [game, setGame] = useState<Game | null>(null);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [selectedPayment, setSelectedPayment] = useState<string>('');
  const currentUser = storage.getCurrentUser();

  useEffect(() => {
    if (id) {
      const accounts = storage.getAccounts();
      const foundAccount = accounts.find(a => a.id === id);
      setAccount(foundAccount || null);

      if (foundAccount) {
        const games = storage.getGames();
        setGame(games.find(g => g.id === foundAccount.gameId) || null);
      }
    }
    
    setPaymentMethods(storage.getPaymentMethods().filter(pm => pm.isActive));
  }, [id]);

  const handleProceedToPayment = () => {
    if (!currentUser) {
      navigate('/login');
      return;
    }

    if (!selectedPayment) {
      alert('Please select a payment method');
      return;
    }

    // Navigate to chat page with purchase intent
    navigate(`/chat/${account?.id}?payment=${selectedPayment}`);
  };

  if (!account || !game) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-8 text-center">
          <p className="text-gray-400">Account not found</p>
          <Button onClick={() => navigate('/')} className="mt-4">
            Back to Home
          </Button>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <Button 
          onClick={() => navigate('/')} 
          variant="ghost" 
          className="mb-6 text-gray-300 hover:text-white"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Accounts
        </Button>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Account Details */}
          <div className="lg:col-span-2 space-y-6">
            <Card className="bg-black/40 border-gray-700">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-2xl text-white">{game.name} Account</CardTitle>
                    <p className="text-gray-400 mt-1">Premium gaming account for sale</p>
                  </div>
                  <Badge 
                    variant={account.status === 'Fresh' ? 'default' : 
                            account.status === 'First Owner' ? 'secondary' : 'destructive'}
                    className="text-sm"
                  >
                    {account.status}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="font-semibold text-white mb-3">Account Information</h3>
                    <div className="space-y-2 text-gray-300">
                      <div className="flex justify-between">
                        <span>Level:</span>
                        <span className="font-medium text-white">{account.level}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Rank:</span>
                        <span className="font-medium text-white">{account.rank}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Status:</span>
                        <span className="font-medium text-white">{account.status}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Availability:</span>
                        <span className={`font-medium ${account.isAvailable ? 'text-green-400' : 'text-red-400'}`}>
                          {account.isAvailable ? 'Available' : 'Sold'}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="font-semibold text-white mb-3">Security Features</h3>
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2 text-green-400">
                        <Shield className="w-4 h-4" />
                        <span className="text-sm">Secure Transaction</span>
                      </div>
                      <div className="flex items-center space-x-2 text-green-400">
                        <Star className="w-4 h-4" />
                        <span className="text-sm">Verified Seller</span>
                      </div>
                      <div className="flex items-center space-x-2 text-green-400">
                        <MessageCircle className="w-4 h-4" />
                        <span className="text-sm">24/7 Support</span>
                      </div>
                    </div>
                  </div>
                </div>

                <Separator className="bg-gray-700" />

                <div>
                  <h3 className="font-semibold text-white mb-3">Description</h3>
                  <p className="text-gray-300 leading-relaxed">
                    {account.description || 'No description available.'}
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Purchase Panel */}
          <div className="space-y-6">
            <Card className="bg-black/40 border-gray-700 sticky top-4">
              <CardHeader>
                <CardTitle className="text-xl text-white">Purchase This Account</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-green-400">${account.price}</div>
                  <p className="text-sm text-gray-400">One-time payment</p>
                </div>

                <div>
                  <h4 className="font-medium text-white mb-3">Select Payment Method</h4>
                  <div className="space-y-2">
                    {paymentMethods.map(method => (
                      <label
                        key={method.id}
                        className={`flex items-center space-x-3 p-3 rounded-lg border cursor-pointer transition-all ${
                          selectedPayment === method.id
                            ? 'border-blue-500 bg-blue-500/10'
                            : 'border-gray-700 hover:border-gray-600'
                        }`}
                      >
                        <input
                          type="radio"
                          name="payment"
                          value={method.id}
                          checked={selectedPayment === method.id}
                          onChange={(e) => setSelectedPayment(e.target.value)}
                          className="text-blue-500"
                        />
                        <div className="flex items-center space-x-2">
                          <CreditCard className="w-4 h-4 text-gray-400" />
                          <span className="text-white">{method.name}</span>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>

                <Button 
                  onClick={handleProceedToPayment}
                  disabled={!account.isAvailable}
                  className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:opacity-50"
                >
                  {account.isAvailable ? 'Proceed to Payment' : 'Account Sold'}
                </Button>

                <p className="text-xs text-gray-400 text-center">
                  By proceeding, you'll be connected with our support team for payment processing and account delivery.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </Layout>
  );
}