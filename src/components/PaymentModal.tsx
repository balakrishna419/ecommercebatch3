import { X } from 'lucide-react';
import { useState } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  orderId: string;
  amount: number;
  onPaymentSuccess: () => void;
}

export function PaymentModal({ isOpen, onClose, orderId, amount, onPaymentSuccess }: PaymentModalProps) {
  const { customer } = useAuth();
  const [paymentMode, setPaymentMode] = useState<'credit_card' | 'debit_card' | 'upi' | 'net_banking' | 'cash_on_delivery'>('upi');
  const [processing, setProcessing] = useState(false);

  if (!isOpen) return null;

  const handlePayment = async () => {
    if (!customer) return;

    setProcessing(true);

    const { error } = await supabase.from('payments').insert({
      order_id: orderId,
      customer_id: customer.customer_id,
      payment_mode: paymentMode,
      amount,
      status: paymentMode === 'cash_on_delivery' ? 'pending' : 'completed',
    });

    if (error) {
      alert('Payment failed: ' + error.message);
      setProcessing(false);
      return;
    }

    alert('Payment processed successfully!');
    setProcessing(false);
    onPaymentSuccess();
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
        <div className="flex justify-between items-center p-6 border-b">
          <h2 className="text-2xl font-bold text-gray-900">Payment Details</h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-6 h-6 text-gray-600" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          <div>
            <p className="text-sm text-gray-500 mb-2">Order Amount</p>
            <p className="text-3xl font-bold text-orange-600">₹{amount.toFixed(2)}</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Select Payment Method
            </label>
            <div className="space-y-2">
              {[
                { value: 'upi', label: 'UPI' },
                { value: 'credit_card', label: 'Credit Card' },
                { value: 'debit_card', label: 'Debit Card' },
                { value: 'net_banking', label: 'Net Banking' },
                { value: 'cash_on_delivery', label: 'Cash on Delivery' },
              ].map((method) => (
                <label
                  key={method.value}
                  className="flex items-center space-x-3 p-3 border border-gray-300 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                >
                  <input
                    type="radio"
                    name="payment_mode"
                    value={method.value}
                    checked={paymentMode === method.value}
                    onChange={(e) => setPaymentMode(e.target.value as typeof paymentMode)}
                    className="w-4 h-4 text-orange-500 focus:ring-orange-500"
                  />
                  <span className="text-gray-900 font-medium">{method.label}</span>
                </label>
              ))}
            </div>
          </div>

          <button
            onClick={handlePayment}
            disabled={processing}
            className="w-full bg-orange-500 text-white py-3 rounded-lg hover:bg-orange-600 transition-colors font-medium disabled:opacity-50"
          >
            {processing ? 'Processing...' : 'Confirm Payment'}
          </button>
        </div>
      </div>
    </div>
  );
}
