// hooks/useWishlist.js
import { useState, useEffect, useCallback } from 'react';
import { wishlistService } from '../services/wishListService';

export const useWishlist = () => {
  const [wishlist, setWishlist] = useState([]);
  const [wishlistIds, setWishlistIds] = useState(new Set());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [itemCount, setItemCount] = useState(0);

  // Clear error
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Fetch wishlist
  const fetchWishlist = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await wishlistService.getWishlist();
      const wishlistItems = response.data?.wishlist || [];
      
      setWishlist(wishlistItems);
      setWishlistIds(new Set(wishlistItems.map(item => item._id)));
      setItemCount(response.data?.itemCount || wishlistItems.length);
    } catch (err) {
      setError(err.message);
      console.error('Error fetching wishlist:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Add to wishlist
  const addToWishlist = useCallback(async (productId) => {
    if (wishlistIds.has(productId)) {
      throw new Error('Product is already in wishlist');
    }

    setLoading(true);
    setError(null);
    try {
      const response = await wishlistService.addToWishlist(productId);
      const updatedWishlist = response.data?.wishlist || [];
      
      setWishlist(updatedWishlist);
      setWishlistIds(new Set(updatedWishlist.map(item => item._id)));
      setItemCount(response.data?.itemCount || updatedWishlist.length);
      
      return response;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [wishlistIds]);

  // Remove from wishlist
  const removeFromWishlist = useCallback(async (productId) => {
    if (!wishlistIds.has(productId)) {
      throw new Error('Product is not in wishlist');
    }

    setLoading(true);
    setError(null);
    try {
      const response = await wishlistService.removeFromWishlist(productId);
      const updatedWishlist = response.data?.wishlist || [];
      
      setWishlist(updatedWishlist);
      setWishlistIds(new Set(updatedWishlist.map(item => item._id)));
      setItemCount(response.data?.itemCount || updatedWishlist.length);
      
      return response;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [wishlistIds]);

  // Toggle wishlist (add if not in wishlist, remove if in wishlist)
  const toggleWishlist = useCallback(async (productId) => {
    if (wishlistIds.has(productId)) {
      return await removeFromWishlist(productId);
    } else {
      return await addToWishlist(productId);
    }
  }, [wishlistIds, addToWishlist, removeFromWishlist]);

  // Clear entire wishlist
  const clearWishlist = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await wishlistService.clearWishlist();
      setWishlist([]);
      setWishlistIds(new Set());
      setItemCount(0);
      return response;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Check if product is in wishlist
  const isInWishlist = useCallback((productId) => {
    return wishlistIds.has(productId);
  }, [wishlistIds]);

  // Get wishlist count
  const getWishlistCount = useCallback(() => {
    return itemCount;
  }, [itemCount]);

  // Initialize wishlist on mount
  useEffect(() => {
    fetchWishlist();
  }, [fetchWishlist]);

  return {
    // State
    wishlist,
    loading,
    error,
    itemCount,

    // Actions
    fetchWishlist,
    addToWishlist,
    removeFromWishlist,
    toggleWishlist,
    clearWishlist,
    clearError,

    // Helpers
    isInWishlist,
    getWishlistCount
  };
};

export default useWishlist;