import { ShoppingCart, User, LogOut, Package, Settings } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

interface NavbarProps {
  cartItemsCount: number;
  onCartClick: () => void;
  onAuthClick: () => void;
  onOrdersClick: () => void;
  onAdminClick: () => void;
  isAdmin: boolean;
}

export function Navbar({ cartItemsCount, onCartClick, onAuthClick, onOrdersClick, onAdminClick, isAdmin }: NavbarProps) {
  const { user, customer, signOut } = useAuth();

  return (
    <nav className="bg-white shadow-md sticky top-0 z-50 border-b border-orange-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-2">
            <ShoppingCart className="w-8 h-8 text-orange-500" />
            <span className="text-xl font-bold text-gray-900">vfstr</span>
          </div>

          <div className="flex items-center space-x-4">
            {isAdmin && (
              <button
                onClick={onAdminClick}
                className="flex items-center space-x-1 px-3 py-2 rounded-lg hover:bg-orange-100 transition-colors"
                title="Admin Dashboard"
              >
                <Settings className="w-5 h-5 text-orange-500" />
                <span className="text-sm font-medium text-gray-700">Admin</span>
              </button>
            )}

            {user && (
              <button
                onClick={onOrdersClick}
                className="flex items-center space-x-1 px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <Package className="w-5 h-5 text-gray-600" />
                <span className="text-sm font-medium text-gray-700">Orders</span>
              </button>
            )}

            <button
              onClick={onCartClick}
              className="relative flex items-center space-x-1 px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <ShoppingCart className="w-5 h-5 text-gray-600" />
              {cartItemsCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-orange-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                  {cartItemsCount}
                </span>
              )}
            </button>

            {user ? (
              <div className="flex items-center space-x-2">
                <div className="flex items-center space-x-2 px-3 py-2 bg-gray-100 rounded-lg">
                  <User className="w-5 h-5 text-gray-600" />
                  <span className="text-sm font-medium text-gray-700">{customer?.name || 'User'}</span>
                </div>
                <button
                  onClick={() => signOut()}
                  className="p-2 rounded-lg hover:bg-red-50 transition-colors"
                  title="Sign Out"
                >
                  <LogOut className="w-5 h-5 text-red-600" />
                </button>
              </div>
            ) : (
              <button
                onClick={onAuthClick}
                className="flex items-center space-x-1 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors font-medium"
              >
                <User className="w-5 h-5" />
                <span>Sign In</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
