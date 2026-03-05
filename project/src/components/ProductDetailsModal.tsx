import { useState, useEffect } from 'react';
import { X, Heart, Star, ShoppingCart } from 'lucide-react';
import { Product, Review, Wishlist } from '../types/database';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

interface ProductDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: Product | null;
  onAddToCart: (product: Product) => void;
  averageRating?: number;
  customerWishlist?: Wishlist[];
}

export function ProductDetailsModal({
  isOpen,
  onClose,
  product,
  onAddToCart,
  averageRating,
  customerWishlist = [],
}: ProductDetailsModalProps) {
  const { customer } = useAuth();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [newReview, setNewReview] = useState({ rating: 5, description: '' });

  useEffect(() => {
    if (product && isOpen) {
      loadReviews();
      checkWishlist();
    }
  }, [product, isOpen]);

  async function loadReviews() {
    if (!product) return;
    const { data } = await supabase
      .from('reviews')
      .select('*')
      .eq('product_id', product.product_id)
      .order('created_at', { ascending: false });

    if (data) setReviews(data);
  }

  function checkWishlist() {
    if (!product) return;
    const inWishlist = customerWishlist.some(
      (w) => w.product_id === product.product_id
    );
    setIsWishlisted(inWishlist);
  }

  async function handleToggleWishlist() {
    if (!product || !customer) return;

    setLoading(true);
    if (isWishlisted) {
      await supabase
        .from('wishlist')
        .delete()
        .eq('customer_id', customer.customer_id)
        .eq('product_id', product.product_id);
    } else {
      await supabase.from('wishlist').insert({
        customer_id: customer.customer_id,
        product_id: product.product_id,
      });
    }
    setIsWishlisted(!isWishlisted);
    setLoading(false);
  }

  async function handleSubmitReview() {
    if (!product || !customer || !newReview.description.trim()) return;

    setLoading(true);
    await supabase.from('reviews').insert({
      product_id: product.product_id,
      customer_id: customer.customer_id,
      rating: newReview.rating,
      description: newReview.description,
    });

    setNewReview({ rating: 5, description: '' });
    await loadReviews();
    setLoading(false);
  }

  if (!isOpen || !product) return null;

  const stars = Math.round(averageRating || 0);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white flex justify-between items-center p-6 border-b">
          <h2 className="text-2xl font-bold text-gray-900">{product.product_name}</h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          <div className="grid grid-cols-2 gap-6">
            <div className="flex items-center justify-center bg-gray-100 rounded-lg h-64">
              {product.image_url ? (
                <img
                  src={product.image_url}
                  alt={product.product_name}
                  className="w-full h-full object-cover rounded-lg"
                />
              ) : (
                <ShoppingCart className="w-16 h-16 text-gray-400" />
              )}
            </div>

            <div className="space-y-4">
              {product.brand && (
                <p className="text-sm text-gray-500">Brand: {product.brand}</p>
              )}

              <div className="space-y-2">
                <span className="text-3xl font-bold text-orange-600">
                  ₹{product.mrp.toFixed(2)}
                </span>
                <p className="text-sm text-gray-600">
                  {product.stock > 0
                    ? `${product.stock} in stock`
                    : 'Out of stock'}
                </p>
              </div>

              {averageRating !== undefined && averageRating > 0 && (
                <div className="flex items-center space-x-2">
                  <div className="flex items-center">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`w-4 h-4 ${
                          i < stars
                            ? 'fill-yellow-400 text-yellow-400'
                            : 'text-gray-300'
                        }`}
                      />
                    ))}
                  </div>
                  <span className="text-sm font-medium text-gray-600">
                    {averageRating.toFixed(1)} ({reviews.length} reviews)
                  </span>
                </div>
              )}

              <div className="space-y-3 pt-4">
                <button
                  onClick={() => onAddToCart(product)}
                  disabled={product.stock === 0}
                  className="w-full flex items-center justify-center space-x-2 bg-orange-500 text-white py-3 rounded-lg hover:bg-orange-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                >
                  <ShoppingCart className="w-5 h-5" />
                  <span>Add to Cart</span>
                </button>

                {customer && (
                  <button
                    onClick={handleToggleWishlist}
                    disabled={loading}
                    className={`w-full flex items-center justify-center space-x-2 py-3 rounded-lg transition-colors font-medium ${
                      isWishlisted
                        ? 'bg-red-100 text-red-700 hover:bg-red-200'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    <Heart
                      className={`w-5 h-5 ${
                        isWishlisted ? 'fill-current' : ''
                      }`}
                    />
                    <span>
                      {isWishlisted ? 'Remove from Wishlist' : 'Add to Wishlist'}
                    </span>
                  </button>
                )}
              </div>
            </div>
          </div>

          {product.description && (
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Description</h3>
              <p className="text-gray-600">{product.description}</p>
            </div>
          )}

          <div className="border-t pt-6">
            <h3 className="font-semibold text-gray-900 mb-4">
              Reviews and Ratings
            </h3>

            {customer && (
              <div className="bg-gray-50 p-4 rounded-lg mb-6">
                <h4 className="font-medium text-gray-900 mb-3">
                  Leave a Review
                </h4>
                <div className="space-y-3">
                  <div>
                    <label className="text-sm font-medium text-gray-700 block mb-2">
                      Rating
                    </label>
                    <select
                      value={newReview.rating}
                      onChange={(e) =>
                        setNewReview({
                          ...newReview,
                          rating: parseInt(e.target.value),
                        })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                    >
                      {[5, 4, 3, 2, 1].map((r) => (
                        <option key={r} value={r}>
                          {r} Star{r !== 1 ? 's' : ''}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700 block mb-2">
                      Your Review
                    </label>
                    <textarea
                      value={newReview.description}
                      onChange={(e) =>
                        setNewReview({
                          ...newReview,
                          description: e.target.value,
                        })
                      }
                      placeholder="Share your experience with this product..."
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 resize-none"
                      rows={3}
                    />
                  </div>
                  <button
                    onClick={handleSubmitReview}
                    disabled={loading || !newReview.description.trim()}
                    className="w-full bg-orange-500 text-white py-2 rounded-lg hover:bg-orange-600 transition-colors disabled:opacity-50 font-medium"
                  >
                    Submit Review
                  </button>
                </div>
              </div>
            )}

            <div className="space-y-3">
              {reviews.length === 0 ? (
                <p className="text-gray-500 text-center py-4">
                  No reviews yet. Be the first to review!
                </p>
              ) : (
                reviews.map((review) => (
                  <div
                    key={review.review_id}
                    className="border border-gray-200 p-3 rounded-lg"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-1">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`w-3.5 h-3.5 ${
                              i < review.rating
                                ? 'fill-yellow-400 text-yellow-400'
                                : 'text-gray-300'
                            }`}
                          />
                        ))}
                      </div>
                      <span className="text-xs text-gray-500">
                        {new Date(review.created_at).toLocaleDateString()}
                      </span>
                    </div>
                    {review.description && (
                      <p className="text-sm text-gray-700">
                        {review.description}
                      </p>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
