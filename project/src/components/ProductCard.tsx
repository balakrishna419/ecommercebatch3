import { ShoppingCart, Star } from 'lucide-react';
import { Product } from '../types/database';

interface ProductCardProps {
  product: Product;
  onAddToCart: (product: Product) => void;
  averageRating?: number;
}

export function ProductCard({ product, onAddToCart, averageRating }: ProductCardProps) {
  const stars = Math.round(averageRating || 0);

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-all duration-200 hover:-translate-y-1">
      <div className="relative h-48 bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
        {product.image_url ? (
          <img
            src={product.image_url}
            alt={product.product_name}
            className="w-full h-full object-cover"
          />
        ) : (
          <ShoppingCart className="w-16 h-16 text-gray-400" />
        )}
        {product.stock === 0 && (
          <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
            <span className="bg-red-500 text-white px-4 py-2 rounded-lg font-bold">
              Out of Stock
            </span>
          </div>
        )}
      </div>

      <div className="p-4">
        <div className="flex items-start justify-between mb-2">
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-900 line-clamp-2">
              {product.product_name}
            </h3>
            {product.brand && (
              <p className="text-sm text-gray-500 mt-1">{product.brand}</p>
            )}
          </div>
        </div>

        {averageRating !== undefined && averageRating > 0 && (
          <div className="flex items-center space-x-2 mb-2">
            <div className="flex items-center">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={`w-3.5 h-3.5 ${
                    i < stars ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'
                  }`}
                />
              ))}
            </div>
            <span className="text-xs font-medium text-gray-600 bg-gray-100 px-2 py-0.5 rounded">
              {averageRating.toFixed(1)}
            </span>
          </div>
        )}

        {product.description && (
          <p className="text-sm text-gray-600 line-clamp-2 mb-3">
            {product.description}
          </p>
        )}

        <div className="flex items-center justify-between">
          <div>
            <span className="text-2xl font-bold text-orange-600">
              ₹{product.mrp.toFixed(2)}
            </span>
            <p className="text-xs text-gray-500 mt-1">
              {product.stock > 0 ? `${product.stock} in stock` : 'Out of stock'}
            </p>
          </div>

          <button
            onClick={() => onAddToCart(product)}
            disabled={product.stock === 0}
            className="flex items-center space-x-1 bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
          >
            <ShoppingCart className="w-4 h-4" />
            <span>Add</span>
          </button>
        </div>
      </div>
    </div>
  );
}
