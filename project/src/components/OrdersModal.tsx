import { X, Package, Trash2, CreditCard } from 'lucide-react';
import { useState, useEffect } from 'react';
import { Order, Payment } from '../types/database';
import { supabase } from '../lib/supabase';
import { PaymentModal } from './PaymentModal';

interface OrdersModalProps {
  isOpen: boolean;
  onClose: () => void;
  orders: Order[];
  onOrderDeleted?: () => void;
}

export function OrdersModal({ isOpen, onClose, orders, onOrderDeleted }: OrdersModalProps) {
  const [payments, setPayments] = useState<Record<string, Payment>>({});
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);

  useEffect(() => {
    if (isOpen && orders.length > 0) {
      loadPayments();
    }
  }, [isOpen, orders]);

  async function loadPayments() {
    const orderIds = orders.map(o => o.order_id);
    const { data } = await supabase
      .from('payments')
      .select('*')
      .in('order_id', orderIds);

    if (data) {
      const paymentsMap = data.reduce((acc, payment) => {
        acc[payment.order_id] = payment;
        return acc;
      }, {} as Record<string, Payment>);
      setPayments(paymentsMap);
    }
  }

  if (!isOpen) return null;

  const handleDeleteOrder = async (orderId: string) => {
    if (!confirm('Are you sure you want to delete this order?')) return;

    const { error } = await supabase
      .from('orders')
      .delete()
      .eq('order_id', orderId);

    if (error) {
      alert('Error deleting order: ' + error.message);
      return;
    }

    if (onOrderDeleted) {
      onOrderDeleted();
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'delivered':
        return 'bg-green-100 text-green-800';
      case 'shipped':
        return 'bg-blue-100 text-blue-800';
      case 'processing':
        return 'bg-yellow-100 text-yellow-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] flex flex-col">
        <div className="flex justify-between items-center p-6 border-b">
          <h2 className="text-2xl font-bold text-gray-900">My Orders</h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-6 h-6 text-gray-600" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          {orders.length === 0 ? (
            <div className="text-center py-12">
              <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 text-lg">No orders yet</p>
            </div>
          ) : (
            <div className="space-y-4">
              {orders.map((order) => (
                <div
                  key={order.order_id}
                  className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow"
                >
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <p className="text-sm text-gray-500">
                        Order ID: {order.order_id.slice(0, 8)}...
                      </p>
                      <p className="text-sm text-gray-500 mt-1">
                        {new Date(order.order_date).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                        })}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span
                        className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(
                          order.status
                        )}`}
                      >
                        {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                      </span>
                      <button
                        onClick={() => handleDeleteOrder(order.order_id)}
                        className="p-2 rounded-lg hover:bg-red-50 transition-colors"
                        title="Delete order"
                      >
                        <Trash2 className="w-5 h-5 text-red-600" />
                      </button>
                    </div>
                  </div>

                  <div className="flex justify-between items-center">
                    <div className="flex-1">
                      <p className="text-2xl font-bold text-orange-600">
                        ₹{order.order_amount.toFixed(2)}
                      </p>
                      {order.shipping_address && (
                        <p className="text-sm text-gray-600 mt-1">
                          {order.shipping_address}
                        </p>
                      )}
                      {payments[order.order_id] && (
                        <div className="mt-2 flex items-center space-x-2">
                          <CreditCard className="w-4 h-4 text-gray-500" />
                          <span className="text-sm text-gray-600">
                            {payments[order.order_id].payment_mode.replace('_', ' ').toUpperCase()}
                          </span>
                          <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                            payments[order.order_id].status === 'completed'
                              ? 'bg-green-100 text-green-700'
                              : payments[order.order_id].status === 'pending'
                              ? 'bg-yellow-100 text-yellow-700'
                              : 'bg-red-100 text-red-700'
                          }`}>
                            {payments[order.order_id].status.toUpperCase()}
                          </span>
                        </div>
                      )}
                    </div>
                    <div className="flex flex-col items-end space-y-2">
                      {order.shipping_date && (
                        <div className="text-right">
                          <p className="text-sm text-gray-500">Expected Delivery</p>
                          <p className="text-sm font-medium text-gray-900">
                            {new Date(order.shipping_date).toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric',
                            })}
                          </p>
                        </div>
                      )}
                      {!payments[order.order_id] && (
                        <button
                          onClick={() => {
                            setSelectedOrder(order);
                            setIsPaymentModalOpen(true);
                          }}
                          className="flex items-center space-x-1 bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-600 transition-colors text-sm font-medium"
                        >
                          <CreditCard className="w-4 h-4" />
                          <span>Pay Now</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {selectedOrder && (
        <PaymentModal
          isOpen={isPaymentModalOpen}
          onClose={() => {
            setIsPaymentModalOpen(false);
            setSelectedOrder(null);
          }}
          orderId={selectedOrder.order_id}
          amount={selectedOrder.order_amount}
          onPaymentSuccess={() => {
            loadPayments();
            setSelectedOrder(null);
          }}
        />
      )}
    </div>
  );
}
