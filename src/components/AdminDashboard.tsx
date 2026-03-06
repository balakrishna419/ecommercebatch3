import { X, CreditCard as Edit2, Trash2, Plus, Package, Users, BarChart3 as BarChart } from 'lucide-react';
import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Product, Category } from '../types/database';
import { UserManagement } from './UserManagement';
import { InventoryManagement } from './InventoryManagement';

interface AdminDashboardProps {
  isOpen: boolean;
  onClose: () => void;
}

type TabType = 'products' | 'users' | 'inventory';

export function AdminDashboard({ isOpen, onClose }: AdminDashboardProps) {
  const [activeTab, setActiveTab] = useState<TabType>('products');
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState<Partial<Product>>({
    product_name: '',
    brand: '',
    category_id: '',
    mrp: 0,
    stock: 0,
    description: '',
    image_url: '',
    is_repair_service: false,
  });

  useEffect(() => {
    if (isOpen) {
      loadProducts();
      loadCategories();
    }
  }, [isOpen]);

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
      .select('*');
    if (data) setCategories(data);
  }

  const handleEdit = (product: Product) => {
    setSelectedProduct(product);
    setFormData(product);
    setShowForm(true);
  };

  const handleAddNew = () => {
    setSelectedProduct(null);
    setFormData({
      product_name: '',
      brand: '',
      category_id: '',
      mrp: 0,
      stock: 0,
      description: '',
      image_url: '',
      is_repair_service: false,
    });
    setShowForm(true);
  };

  const handleSave = async () => {
    if (!formData.product_name || !formData.category_id) {
      alert('Please fill in all required fields');
      return;
    }

    if (selectedProduct) {
      const { error } = await supabase
        .from('products')
        .update({
          product_name: formData.product_name,
          brand: formData.brand,
          category_id: formData.category_id,
          mrp: formData.mrp,
          stock: formData.stock,
          description: formData.description,
          image_url: formData.image_url,
          is_repair_service: formData.is_repair_service,
        })
        .eq('product_id', selectedProduct.product_id);

      if (error) {
        alert('Error updating product: ' + error.message);
        return;
      }
    } else {
      const { error } = await supabase
        .from('products')
        .insert({
          product_name: formData.product_name,
          brand: formData.brand,
          category_id: formData.category_id,
          mrp: formData.mrp,
          stock: formData.stock,
          description: formData.description,
          image_url: formData.image_url,
          is_repair_service: formData.is_repair_service,
        });

      if (error) {
        alert('Error creating product: ' + error.message);
        return;
      }
    }

    setShowForm(false);
    setSelectedProduct(null);
    await loadProducts();
  };

  const handleDelete = async (productId: string) => {
    if (!confirm('Are you sure you want to delete this product?')) return;

    const { error } = await supabase
      .from('products')
      .delete()
      .eq('product_id', productId);

    if (error) {
      alert('Error deleting product: ' + error.message);
      return;
    }

    await loadProducts();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-6xl w-full max-h-[90vh] flex flex-col">
        <div className="flex justify-between items-center p-6 border-b">
          <h2 className="text-2xl font-bold text-gray-900">Admin Dashboard</h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-6 h-6 text-gray-600" />
          </button>
        </div>

        <div className="border-b">
          <div className="flex space-x-1 p-2">
            <button
              onClick={() => {
                setActiveTab('products');
                setShowForm(false);
              }}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
                activeTab === 'products'
                  ? 'bg-orange-500 text-white'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              <Package className="w-4 h-4" />
              <span>Products</span>
            </button>
            <button
              onClick={() => {
                setActiveTab('users');
                setShowForm(false);
              }}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
                activeTab === 'users'
                  ? 'bg-orange-500 text-white'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              <Users className="w-4 h-4" />
              <span>Users</span>
            </button>
            <button
              onClick={() => {
                setActiveTab('inventory');
                setShowForm(false);
              }}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
                activeTab === 'inventory'
                  ? 'bg-orange-500 text-white'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              <BarChart className="w-4 h-4" />
              <span>Inventory</span>
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          {activeTab === 'users' ? (
            <UserManagement />
          ) : activeTab === 'inventory' ? (
            <InventoryManagement />
          ) : showForm ? (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">
                {selectedProduct ? 'Edit Product' : 'Add New Product'}
              </h3>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Product Name *
                  </label>
                  <input
                    type="text"
                    value={formData.product_name || ''}
                    onChange={(e) => setFormData({ ...formData, product_name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent text-sm"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Brand
                  </label>
                  <input
                    type="text"
                    value={formData.brand || ''}
                    onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent text-sm"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Category *
                  </label>
                  <select
                    value={formData.category_id || ''}
                    onChange={(e) => setFormData({ ...formData, category_id: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent text-sm"
                  >
                    <option value="">Select category</option>
                    {categories.map((cat) => (
                      <option key={cat.category_id} value={cat.category_id}>
                        {cat.category_name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Price (₹) *
                  </label>
                  <input
                    type="number"
                    value={formData.mrp || 0}
                    onChange={(e) => setFormData({ ...formData, mrp: parseFloat(e.target.value) })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent text-sm"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Stock *
                  </label>
                  <input
                    type="number"
                    value={formData.stock || 0}
                    onChange={(e) => setFormData({ ...formData, stock: parseInt(e.target.value) })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent text-sm"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Image URL
                  </label>
                  <input
                    type="url"
                    value={formData.image_url || ''}
                    onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent text-sm"
                  />
                </div>

                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description
                  </label>
                  <textarea
                    value={formData.description || ''}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent text-sm"
                  />
                </div>

                <div className="col-span-2">
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.is_repair_service || false}
                      onChange={(e) => setFormData({ ...formData, is_repair_service: e.target.checked })}
                      className="w-4 h-4 border border-gray-300 rounded focus:ring-2 focus:ring-orange-500"
                    />
                    <span className="text-sm font-medium text-gray-700">Mark as Repair Service</span>
                  </label>
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={handleSave}
                  className="flex-1 bg-orange-500 text-white py-2 rounded-lg hover:bg-orange-600 transition-colors font-medium"
                >
                  Save Product
                </button>
                <button
                  onClick={() => setShowForm(false)}
                  className="flex-1 bg-gray-300 text-gray-700 py-2 rounded-lg hover:bg-gray-400 transition-colors font-medium"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <button
                onClick={handleAddNew}
                className="flex items-center space-x-2 bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-600 transition-colors font-medium"
              >
                <Plus className="w-4 h-4" />
                <span>Add New Product</span>
              </button>

              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b bg-gray-50">
                      <th className="px-4 py-2 text-left font-semibold text-gray-700">Product</th>
                      <th className="px-4 py-2 text-left font-semibold text-gray-700">Price</th>
                      <th className="px-4 py-2 text-left font-semibold text-gray-700">Stock</th>
                      <th className="px-4 py-2 text-left font-semibold text-gray-700">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {products.map((product) => (
                      <tr key={product.product_id} className="border-b hover:bg-gray-50">
                        <td className="px-4 py-2 text-gray-900">
                          <div>
                            <p className="font-medium">{product.product_name}</p>
                            <p className="text-xs text-gray-500">{product.brand}</p>
                          </div>
                        </td>
                        <td className="px-4 py-2 text-gray-900 font-medium">
                          ₹{product.mrp.toFixed(2)}
                        </td>
                        <td className="px-4 py-2">
                          <span className={`px-2 py-1 rounded text-xs font-medium ${
                            product.stock > 0
                              ? 'bg-green-100 text-green-700'
                              : 'bg-red-100 text-red-700'
                          }`}>
                            {product.stock}
                          </span>
                        </td>
                        <td className="px-4 py-2">
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleEdit(product)}
                              className="p-1 rounded hover:bg-blue-100 transition-colors"
                            >
                              <Edit2 className="w-4 h-4 text-blue-600" />
                            </button>
                            <button
                              onClick={() => handleDelete(product.product_id)}
                              className="p-1 rounded hover:bg-red-100 transition-colors"
                            >
                              <Trash2 className="w-4 h-4 text-red-600" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
