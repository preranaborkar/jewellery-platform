// components/ProductDetailsPage.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Star,
  Heart,
  ShoppingCart,
  ShoppingBag,
  Package,
  Truck,
  Shield,
  RefreshCw,
  ArrowLeft,
  Plus,
  Minus,
  Check,
  X,
  AlertCircle,
  Users,
  Award,
  Info
} from 'lucide-react';

// Import your existing hooks and services
import { useCart } from '../../hooks/useCart';
import { useWishlist } from '../../hooks/useWishList';
import { useReview } from '../../hooks/useOder';
import useProductsByCategory from '../../hooks/useProductsByCategory'; // Assuming you have this

const ProductDetailsPage = () => {
  const { productId } = useParams();
  const navigate = useNavigate();

  // Product state
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // UI state
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState('description');
  const [showFullDescription, setShowFullDescription] = useState(false);

  // Rating state
  const [productRating, setProductRating] = useState(null);
  const [userReview, setUserReview] = useState(null);

  // Hooks
  const {
    addToCart,
    removeFromCart,
    isInCart,
    getCartItemQuantity,
    loading: cartLoading,
    error: cartError
  } = useCart();

  const {
    addToWishlist,
    removeFromWishlist,
    isInWishlist,
    loading: wishlistLoading,
    error: wishlistError
  } = useWishlist();

const {
    fetchProductDetails,
}=useProductsByCategory();

  const { getProductRating, getUserReview } = useReview();

  // Fetch product data
  const fetchProductData = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetchProductDetails(productId);
      if (response) {
        setProduct(response.data || response);
        // Fetch product rating and user review
        const rating = await getProductRating(productId);
        setProductRating(rating?.data || rating);
        const review = await getUserReview(productId);
        setUserReview(review?.data || review);
      } else {
        setError('Product not found');
      }
    } catch (err) {
      setError(err.message || 'Failed to fetch product details');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProductData();
    // eslint-disable-next-line
  }, [productId]);


  // Handle add to cart
  const handleAddToCart = async () => {
    try {
      await addToCart(productId, quantity);
    } catch (error) {
      console.error('Failed to add to cart:', error);
    }
  };

  // Handle remove from cart
  const handleRemoveFromCart = async () => {
    try {
      await removeFromCart(productId);
    } catch (error) {
      console.error('Failed to remove from cart:', error);
    }
  };

  // Handle wishlist toggle
  const handleWishlistToggle = async () => {
    try {
      if (isInWishlist(productId)) {
        await removeFromWishlist(productId);
      } else {
        await addToWishlist(productId);
      }
    } catch (error) {
      console.error('Failed to toggle wishlist:', error);
    }
  };

  // Handle buy now
  const handleBuyNow = () => {
    // Navigate to checkout with this product
    navigate('/checkout', { 
      state: { 
        directPurchase: true, 
        product: product, 
        quantity: quantity 
      } 
    });
  };

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(amount);
  };

  // Get rating stars
  const getRatingStars = (rating, size = 16) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;

    for (let i = 0; i < 5; i++) {
      if (i < fullStars) {
        stars.push(
          <Star key={i} size={size} className="fill-yellow-400 text-yellow-400" />
        );
      } else if (i === fullStars && hasHalfStar) {
        stars.push(
          <div key={i} className="relative">
            <Star size={size} className="text-gray-300" />
            <div className="absolute inset-0 overflow-hidden" style={{ width: '50%' }}>
              <Star size={size} className="fill-yellow-400 text-yellow-400" />
            </div>
          </div>
        );
      } else {
        stars.push(
          <Star key={i} size={size} className="text-gray-300" />
        );
      }
    }
    return stars;
  };

  // Get product rating data
  const displayRating = productRating?.averageRating || product?.ratingsAverage || 0;
  const displayReviewCount = productRating?.reviewCount || product?.ratingsCount || 0;

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#E4D4C8' }}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-2 border-b-transparent mx-auto mb-4" style={{ borderColor: '#523A28' }}></div>
          <p style={{ color: '#523A28' }}>Loading product details...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#E4D4C8' }}>
        <div className="text-center max-w-md mx-auto p-6">
          <AlertCircle size={48} className="mx-auto mb-4" style={{ color: '#A47551' }} />
          <h2 className="text-xl font-semibold mb-2" style={{ color: '#523A28' }}>
            Product Not Found
          </h2>
          <p className="mb-4" style={{ color: '#A47551' }}>
            {error}
          </p>
          <button
            onClick={() => navigate(-1)}
            className="px-6 py-2 rounded-lg font-medium transition-colors"
            style={{ backgroundColor: '#523A28', color: '#E4D4C8' }}
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  // No product found
  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#E4D4C8' }}>
        <div className="text-center">
          <Package size={48} className="mx-auto mb-4" style={{ color: '#A47551' }} />
          <p style={{ color: '#523A28' }}>Product not found</p>
        </div>
      </div>
    );
  }

  const inCart = isInCart(productId);
  const cartQuantity = getCartItemQuantity(productId);
  const inWishlist = isInWishlist(productId);

  // Safe access to product images
  const productImages = product.image || [];
  const hasImages = productImages.length > 0;

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#E4D4C8' }}>
      <div className="container mx-auto px-4 py-8">
        {/* Back Button */}
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 mb-6 px-4 py-2 rounded-lg transition-colors hover:bg-opacity-80"
          style={{ backgroundColor: '#D0B49F', color: '#523A28' }}
        >
          <ArrowLeft size={16} />
          Back
        </button>

        {/* Error Messages */}
        {cartError && (
          <div className="mb-4 p-4 rounded-lg border border-red-300 bg-red-50 text-red-700">
            {cartError}
          </div>
        )}
        {wishlistError && (
          <div className="mb-4 p-4 rounded-lg border border-red-300 bg-red-50 text-red-700">
            {wishlistError}
          </div>
        )}

        {/* Main Product Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          {/* Product Images */}
          <div className="space-y-4">
            {/* Main Image */}
            <div className="aspect-square bg-white rounded-lg overflow-hidden shadow-lg">
              {hasImages ? (
                <img
                  src={productImages[selectedImageIndex]?.url || productImages[selectedImageIndex]}
                  alt={product.name}
                  className="w-full h-full object-contain"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <Package size={64} style={{ color: '#A47551' }} />
                </div>
              )}
            </div>

            {/* Image Thumbnails */}
            {productImages.length > 1 && (
              <div className="flex gap-2 overflow-x-auto pb-2">
                {productImages.map((img, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImageIndex(index)}
                    className={`flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 ${
                      selectedImageIndex === index ? 'border-opacity-100' : 'border-opacity-20'
                    }`}
                    style={{ borderColor: '#523A28' }}
                  >
                    <img
                      src={img?.url || img}
                      alt={`${product.name} ${index + 1}`}
                      className="w-full h-full object-contain bg-white"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="space-y-6">
            {/* Product Title */}
            <div>
              <h1 className="text-3xl font-bold mb-2" style={{ color: '#523A28' }}>
                {product.name}
              </h1>
              {product.shortDescription && (
                <p className="text-lg" style={{ color: '#A47551' }}>
                  {product.shortDescription}
                </p>
              )}
            </div>

            {/* Rating */}
            {displayRating > 0 ? (
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <div className="flex">
                    {getRatingStars(displayRating, 20)}
                  </div>
                  <span className="text-xl font-semibold" style={{ color: '#523A28' }}>
                    {displayRating.toFixed(1)}
                  </span>
                </div>
                <div className="flex items-center gap-2" style={{ color: '#A47551' }}>
                  <Users size={16} />
                  <span>{displayReviewCount} {displayReviewCount === 1 ? 'review' : 'reviews'}</span>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <div className="flex">
                  {getRatingStars(0, 20)}
                </div>
                <span style={{ color: '#A47551' }}>No reviews yet</span>
              </div>
            )}

            {/* Price */}
            <div className="space-y-2">
              <div className="flex items-center gap-4">
                <span className="text-3xl font-bold" style={{ color: '#523A28' }}>
                  {formatCurrency(product.price)}
                </span>
                {product.originalPrice && product.originalPrice > product.price && (
                  <>
                    <span className="text-xl line-through" style={{ color: '#A47551' }}>
                      {formatCurrency(product.originalPrice)}
                    </span>
                    <span className="px-2 py-1 rounded text-sm font-medium bg-green-100 text-green-800">
                      {Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)}% OFF
                    </span>
                  </>
                )}
              </div>
              <p className="text-sm" style={{ color: '#A47551' }}>
                Inclusive of all taxes
              </p>
            </div>

            {/* Product Details */}
            <div className="grid grid-cols-2 gap-4 p-4 rounded-lg" style={{ backgroundColor: '#D0B49F' }}>
              {product.metalType && (
                <div>
                  <span className="text-sm font-medium" style={{ color: '#A47551' }}>Metal Type</span>
                  <p className="font-semibold capitalize" style={{ color: '#523A28' }}>{product.metalType}</p>
                </div>
              )}
              {product.metalPurity && (
                <div>
                  <span className="text-sm font-medium" style={{ color: '#A47551' }}>Purity</span>
                  <p className="font-semibold" style={{ color: '#523A28' }}>{product.metalPurity}</p>
                </div>
              )}
              <div>
                <span className="text-sm font-medium" style={{ color: '#A47551' }}>Stock</span>
                <p className={`font-semibold ${product.stock > 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {product.stock > 0 ? `${product.stock} available` : 'Out of stock'}
                </p>
              </div>
              <div>
                <span className="text-sm font-medium" style={{ color: '#A47551' }}>Category</span>
                <p className="font-semibold" style={{ color: '#523A28' }}>
                  {product.category?.name || 'Uncategorized'}
                </p>
              </div>
            </div>

            {/* Quantity Selector */}
            <div className="flex items-center gap-4">
              <span className="font-medium" style={{ color: '#523A28' }}>Quantity:</span>
              <div className="flex items-center border rounded-lg" style={{ borderColor: '#A47551' }}>
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="p-2 hover:bg-opacity-80 transition-colors"
                  style={{ color: '#523A28' }}
                >
                  <Minus size={16} />
                </button>
                <span className="px-4 py-2 min-w-[60px] text-center font-medium" style={{ color: '#523A28' }}>
                  {quantity}
                </span>
                <button
                  onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                  className="p-2 hover:bg-opacity-80 transition-colors"
                  style={{ color: '#523A28' }}
                  disabled={quantity >= product.stock}
                >
                  <Plus size={16} />
                </button>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-4">
              <div className="flex gap-3">
                {!inCart ? (
                  <button
                    onClick={handleAddToCart}
                    disabled={product.stock === 0 || cartLoading}
                    className="flex-1 flex items-center justify-center gap-2 px-6 py-3 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    style={{ backgroundColor: '#523A28', color: '#E4D4C8' }}
                  >
                    {cartLoading ? (
                      <>
                        <RefreshCw size={20} className="animate-spin" />
                        Adding...
                      </>
                    ) : product.stock === 0 ? (
                      'Out of Stock'
                    ) : (
                      <>
                        <ShoppingCart size={20} />
                        Add to Cart
                      </>
                    )}
                  </button>
                ) : (
                  <div className="flex gap-2 flex-1">
                    <button
                      onClick={handleBuyNow}
                      className="flex-1 flex items-center justify-center gap-2 px-6 py-3 rounded-lg font-medium transition-colors"
                      style={{ backgroundColor: '#2D5016', color: '#E4D4C8' }}
                    >
                      <ShoppingBag size={20} />
                      Buy Now
                    </button>
                    <button
                      onClick={handleRemoveFromCart}
                      disabled={cartLoading}
                      className="px-4 py-3 rounded-lg font-medium transition-colors disabled:opacity-50"
                      style={{ backgroundColor: '#c06767ff', color: '#E4D4C8' }}
                    >
                      {cartLoading ? (
                        <RefreshCw size={20} className="animate-spin" />
                      ) : (
                        <X size={20} />
                      )}
                    </button>
                  </div>
                )}

                <button
                  onClick={handleWishlistToggle}
                  disabled={wishlistLoading}
                  className={`px-4 py-3 rounded-lg transition-colors disabled:opacity-50 ${
                    inWishlist ? 'bg-red-500 text-white' : 'border border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  {wishlistLoading ? (
                    <RefreshCw size={20} className="animate-spin" />
                  ) : (
                    <Heart
                      size={20}
                      className={inWishlist ? 'fill-current' : ''}
                      style={{ color: inWishlist ? 'white' : '#523A28' }}
                    />
                  )}
                </button>
              </div>

              {inCart && (
                <div className="p-3 rounded-lg bg-green-50 border border-green-200 flex items-center gap-2">
                  <Check size={20} className="text-green-600" />
                  <span className="text-green-800">
                    {cartQuantity} {cartQuantity === 1 ? 'item' : 'items'} in cart
                  </span>
                </div>
              )}
            </div>

           
          </div>
        </div>

        {/* Product Details Tabs */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="border-b border-gray-200 mb-6">
            <nav className="flex space-x-8">
              {['description'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`py-2 px-1 border-b-2 font-medium text-sm capitalize transition-colors ${
                    activeTab === tab
                      ? 'border-opacity-100 text-opacity-100'
                      : 'border-transparent text-opacity-60 hover:text-opacity-80'
                  }`}
                  style={{ 
                    borderColor: activeTab === tab ? '#523A28' : 'transparent',
                    color: '#523A28' 
                  }}
                >
                  {tab}
                </button>
              ))}
            </nav>
          </div>

          <div className="min-h-[200px]">
            {activeTab === 'description' && (
              <div className="space-y-4">
                <h3 className="text-xl font-semibold" style={{ color: '#523A28' }}>
                  Product Description
                </h3>
                <div className="prose max-w-none" style={{ color: '#A47551' }}>
                  {product.description ? (
                    <>
                      {showFullDescription ? (
                        <p className="whitespace-pre-wrap">{product.description}</p>
                      ) : (
                        <p className="whitespace-pre-wrap">
                          {product.description.length > 300 
                            ? `${product.description.substring(0, 300)}...` 
                            : product.description
                          }
                        </p>
                      )}
                      {product.description.length > 300 && (
                        <button
                          onClick={() => setShowFullDescription(!showFullDescription)}
                          className="mt-2 text-sm font-medium hover:underline"
                          style={{ color: '#523A28' }}
                        >
                          {showFullDescription ? 'Read Less' : 'Read More'}
                        </button>
                      )}
                    </>
                  ) : (
                    <p>No description available.</p>
                  )}
                </div>
              </div>
            )}

           

            
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetailsPage;