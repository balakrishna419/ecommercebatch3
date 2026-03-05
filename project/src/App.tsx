import { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { Navbar } from './components/Navbar';
import { AuthModal } from './components/AuthModal';
import { AdminLoginModal } from './components/AdminLoginModal';
import { AdminDashboard } from './components/AdminDashboard';
import { ProductCard } from './components/ProductCard';
import { CartModal } from './components/CartModal';
import { OrdersModal } from './components/OrdersModal';
import { supabase } from './lib/supabase';
import { Product, Category, CartItem, Order } from './types/database';
import { Search, Filter } from 'lucide-react';

function AppContent() {
  const { user, customer, loading } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [cartItemProducts, setCartItemProducts] = useState<Record<string, Product>>({});
  const [orders, setOrders] = useState<Order[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showRepairOnly, setShowRepairOnly] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isCartModalOpen, setIsCartModalOpen] = useState(false);
  const [isOrdersModalOpen, setIsOrdersModalOpen] = useState(false);
  const [isAdminLoginOpen, setIsAdminLoginOpen] = useState(false);
  const [isAdminDashboardOpen, setIsAdminDashboardOpen] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [productRatings, setProductRatings] = useState<Record<string, number>>({});

  useEffect(() => {
    loadProducts();
    loadCategories();
    loadProductRatings();
    const adminAuth = localStorage.getItem('adminAuth');
    if (adminAuth === 'true') {
      setIsAdmin(true);
    }
  }, []);

  useEffect(() => {
    if (user && customer) {
      loadCartItems();
      loadOrders();
    } else {
      setCartItems([]);
      setOrders([]);
    }
  }, [user, customer]);

  async function loadProducts() {
    const { data } = await supabase
      .from('products')
      .select('*')
      .order('created_at', { ascending: false });

    if (data) setProducts(data);
  }

  async function loadCategories() {
    const { data } = await supabase
      .from('categories')
      .select('*')
      .order('category_name');

    if (data) setCategories(data);
  }

  async function loadProductRatings() {
    const { data } = await supabase
      .from('reviews')
      .select('product_id, rating');

    if (data) {
      const ratings: Record<string, number[]> = {};
      data.forEach((review) => {
        if (!ratings[review.product_id]) {
          ratings[review.product_id] = [];
        }
        ratings[review.product_id].push(review.rating);
      });

      const averages: Record<string, number> = {};
      Object.keys(ratings).forEach((productId) => {
        const sum = ratings[productId].reduce((a, b) => a + b, 0);
        averages[productId] = sum / ratings[productId].length;
      });

      setProductRatings(averages);
    }
  }

  async function loadCartItems() {
    if (!customer) return;

    const { data: cart } = await supabase
      .from('carts')
      .select('cart_id')
      .eq('customer_id', customer.customer_id)
      .maybeSingle();

    if (cart) {
      const { data: items } = await supabase
        .from('cart_items')
        .select('*')
        .eq('cart_id', cart.cart_id);

      if (items) {
        setCartItems(items);

        const productIds = items.map(item => item.product_id);
        if (productIds.length > 0) {
          const { data: productsData } = await supabase
            .from('products')
            .select('*')
            .in('product_id', productIds);

          if (productsData) {
            const productsMap = productsData.reduce((acc, prod) => {
              acc[prod.product_id] = prod;
              return acc;
            }, {} as Record<string, Product>);
            setCartItemProducts(productsMap);
          }
        }
      }
    }
  }

  async function loadOrders() {
    if (!customer) return;

    const { data } = await supabase
      .from('orders')
      .select('*')
      .eq('customer_id', customer.customer_id)
      .order('order_date', { ascending: false });

    if (data) setOrders(data);
  }

  async function handleAddToCart(product: Product) {
    if (!user) {
      setIsAuthModalOpen(true);
      return;
    }

    if (!customer) return;

    const { data: cart } = await supabase
      .from('carts')
      .select('cart_id')
      .eq('customer_id', customer.customer_id)
      .maybeSingle();

    let cartId = cart?.cart_id;

    if (!cartId) {
      const { data: newCart } = await supabase
        .from('carts')
        .insert({ customer_id: customer.customer_id })
        .select('cart_id')
        .single();

      cartId = newCart?.cart_id;
    }

    if (cartId) {
      const existingItem = cartItems.find(item => item.product_id === product.product_id);

      if (existingItem) {
        await supabase
          .from('cart_items')
          .update({ quantity: existingItem.quantity + 1 })
          .eq('cart_item_id', existingItem.cart_item_id);
      } else {
        await supabase
          .from('cart_items')
          .insert({
            cart_id: cartId,
            product_id: product.product_id,
            quantity: 1,
            price: product.mrp,
          });
      }

      await loadCartItems();
    }
  }

  async function handleUpdateQuantity(itemId: string, quantity: number) {
    await supabase
      .from('cart_items')
      .update({ quantity })
      .eq('cart_item_id', itemId);

    await loadCartItems();
  }

  async function handleRemoveItem(itemId: string) {
    await supabase
      .from('cart_items')
      .delete()
      .eq('cart_item_id', itemId);

    await loadCartItems();
  }

  async function handleCheckout() {
    if (!customer || cartItems.length === 0) return;

    const total = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);

    const { data: order, error } = await supabase
      .from('orders')
      .insert({
        customer_id: customer.customer_id,
        order_amount: total,
        status: 'pending',
        shipping_address: customer.address || 'No address provided',
      })
      .select()
      .single();

    if (error) {
      alert('Error creating order: ' + error.message);
      return;
    }

    if (order) {
      const orderItems = cartItems.map(item => ({
        order_id: order.order_id,
        product_id: item.product_id,
        quantity: item.quantity,
        mrp: item.price,
      }));

      await supabase.from('order_items').insert(orderItems);

      await supabase
        .from('cart_items')
        .delete()
        .in('cart_item_id', cartItems.map(item => item.cart_item_id));

      await loadCartItems();
      await loadOrders();
      setIsCartModalOpen(false);
      alert('Order placed successfully!');
    }
  }

  const filteredProducts = products.filter(product => {
    const matchesCategory = selectedCategory === 'all' || product.category_id === selectedCategory;
    const matchesSearch = product.product_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         product.brand?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRepair = !showRepairOnly || product.is_repair_service;
    return matchesCategory && matchesSearch && matchesRepair;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar
        cartItemsCount={cartItems.length}
        onCartClick={() => setIsCartModalOpen(true)}
        onAuthClick={() => {
          if (isAdmin) {
            setIsAdminLoginOpen(true);
          } else {
            setIsAuthModalOpen(true);
          }
        }}
        onOrdersClick={() => setIsOrdersModalOpen(true)}
        onAdminClick={() => setIsAdminDashboardOpen(true)}
        isAdmin={isAdmin}
      />

      <div className="bg-gradient-to-r from-orange-500 to-orange-600 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl font-bold mb-4">Welcome to vfstr ecommerce</h1>
          <p className="text-xl text-orange-100">Discover amazing products at great prices</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8 space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div className="space-y-3">
            <div className="flex items-center space-x-2 overflow-x-auto pb-2">
              <Filter className="w-5 h-5 text-gray-600 flex-shrink-0" />
              <button
                onClick={() => setSelectedCategory('all')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors whitespace-nowrap ${
                  selectedCategory === 'all'
                    ? 'bg-orange-500 text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-100'
                }`}
              >
                All Products
              </button>
              {categories.map((category) => (
                <button
                  key={category.category_id}
                  onClick={() => setSelectedCategory(category.category_id)}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors whitespace-nowrap ${
                    selectedCategory === category.category_id
                      ? 'bg-orange-500 text-white'
                      : 'bg-white text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  {category.category_name}
                </button>
              ))}
            </div>

            <div className="flex items-center space-x-2">
              <button
                onClick={() => setShowRepairOnly(!showRepairOnly)}
                className={`px-4 py-2 rounded-lg font-medium transition-colors whitespace-nowrap ${
                  showRepairOnly
                    ? 'bg-blue-500 text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-100'
                }`}
              >
                {showRepairOnly ? '🔧 Repair Services Only' : 'Show Repair Services'}
              </button>
            </div>
          </div>
        </div>

        {filteredProducts.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">No products found</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredProducts.map((product) => (
              <ProductCard
                key={product.product_id}
                product={product}
                onAddToCart={handleAddToCart}
                averageRating={productRatings[product.product_id]}
              />
            ))}
          </div>
        )}
      </div>

      <AuthModal
        isOpen={isAuthModalOpen && !isAdmin}
        onClose={() => setIsAuthModalOpen(false)}
      />

      <AdminLoginModal
        isOpen={isAdminLoginOpen}
        onClose={() => setIsAdminLoginOpen(false)}
        onLoginSuccess={() => {
          setIsAdmin(true);
          setIsAdminDashboardOpen(true);
        }}
      />

      <AdminDashboard
        isOpen={isAdminDashboardOpen}
        onClose={() => setIsAdminDashboardOpen(false)}
      />

      <CartModal
        isOpen={isCartModalOpen}
        onClose={() => setIsCartModalOpen(false)}
        cartItems={cartItems}
        cartItemProducts={cartItemProducts}
        onUpdateQuantity={handleUpdateQuantity}
        onRemoveItem={handleRemoveItem}
        onCheckout={handleCheckout}
      />

      <OrdersModal
        isOpen={isOrdersModalOpen}
        onClose={() => setIsOrdersModalOpen(false)}
        orders={orders}
        onOrderDeleted={async () => {
          if (customer) {
            const { data } = await supabase
              .from('orders')
              .select('*')
              .eq('customer_id', customer.customer_id)
              .order('order_date', { ascending: false });
            if (data) setOrders(data);
          }
        }}
      />
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
