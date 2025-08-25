import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { GameAccount } from '@/types';
import { CreditCard, Smartphone, DollarSign } from 'lucide-react';

interface PurchaseModalProps {
  account: GameAccount | null;
  isOpen: boolean;
  onClose: () => void;
  onProceedToChat: (account: GameAccount, paymentMethod: string) => void;
}

const paymentMethods = [
  {
    id: 'binance',
    name: 'Binance Pay',
    icon: <CreditCard className="h-5 w-5" />,
    description: 'Pay with cryptocurrency via Binance'
  },
  {
    id: 'gcash',
    name: 'GCash (Philippines)',
    icon: <Smartphone className="h-5 w-5" />,
    description: 'Pay with GCash mobile wallet'
  },
  {
    id: 'paypal',
    name: 'PayPal',
    icon: <DollarSign className="h-5 w-5" />,
    description: 'Pay with PayPal account'
  }
];

export const PurchaseModal: React.FC<PurchaseModalProps> = ({
  account,
  isOpen,
  onClose,
  onProceedToChat
}) => {
  const [selectedPayment, setSelectedPayment] = useState('');

  const handleProceed = () => {
    if (!account || !selectedPayment) return;
    onProceedToChat(account, selectedPayment);
    onClose();
  };

  if (!account) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-slate-800 border-slate-700 text-white max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl">Purchase Account</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          <div className="bg-slate-700/50 p-4 rounded-lg">
            <h3 className="font-semibold mb-2">Account Details</h3>
            <div className="space-y-2 text-sm">
              <p><span className="text-gray-400">Game:</span> {account.gameType}</p>
              <p><span className="text-gray-400">Level:</span> {account.level}</p>
              <p><span className="text-gray-400">Rank:</span> {account.rank}</p>
              <p><span className="text-gray-400">Status:</span> {account.status}</p>
              <p className="text-lg font-bold text-cyan-400">Price: ${account.price}</p>
            </div>
          </div>

          <div>
            <h3 className="font-semibold mb-4">Select Payment Method</h3>
            <RadioGroup value={selectedPayment} onValueChange={setSelectedPayment}>
              {paymentMethods.map((method) => (
                <div key={method.id} className="flex items-center space-x-3 p-3 rounded-lg hover:bg-slate-700/30 transition-colors">
                  <RadioGroupItem value={method.id} id={method.id} />
                  <Label htmlFor={method.id} className="flex items-center space-x-3 cursor-pointer flex-1">
                    <div className="text-cyan-400">
                      {method.icon}
                    </div>
                    <div>
                      <p className="font-medium">{method.name}</p>
                      <p className="text-sm text-gray-400">{method.description}</p>
                    </div>
                  </Label>
                </div>
              ))}
            </RadioGroup>
          </div>

          <div className="flex space-x-3">
            <Button variant="outline" onClick={onClose} className="flex-1 border-slate-600 text-white hover:bg-slate-700">
              Cancel
            </Button>
            <Button
              onClick={handleProceed}
              disabled={!selectedPayment}
              className="flex-1 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600"
            >
              Proceed to Chat
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};