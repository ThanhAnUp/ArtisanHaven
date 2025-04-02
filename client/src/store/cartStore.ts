import { create } from 'zustand';
import { queryClient } from '@/lib/queryClient';
import { apiRequest } from '@/lib/queryClient';
import type { CartItemWithProduct } from '@shared/schema';

// Define the store state shape
interface CartState {
  isOpen: boolean;
  items: CartItemWithProduct[];
  isLoading: boolean;
  error: string | null;
  
  // Actions
  openCart: () => void;
  closeCart: () => void;
  toggleCart: () => void;
  fetchItems: () => Promise<void>;
  addItem: (productId: number, quantity: number) => Promise<void>;
  updateItemQuantity: (id: number, quantity: number) => Promise<void>;
  removeItem: (id: number) => Promise<void>;
  clearCart: () => Promise<void>;
  
  // Derived values
  itemCount: () => number;
  subtotal: () => number;
  shipping: () => number;
  total: () => number;
}

// Create the store
export const useCartStore = create<CartState>((set, get) => ({
  isOpen: false,
  items: [],
  isLoading: false,
  error: null,

  // Cart visibility actions
  openCart: () => set({ isOpen: true }),
  closeCart: () => set({ isOpen: false }),
  toggleCart: () => set((state) => ({ isOpen: !state.isOpen })),

  // Fetch cart items
  fetchItems: async () => {
    set({ isLoading: true });
    try {
      // Use the cached data if available
      const cachedItems = queryClient.getQueryData<CartItemWithProduct[]>(['/api/cart']);
      if (cachedItems) {
        set({ items: cachedItems, isLoading: false });
        return;
      }

      // Otherwise fetch from API
      const response = await apiRequest('GET', '/api/cart');
      const items = await response.json();
      set({ items, isLoading: false });
      
      // Update query cache
      queryClient.setQueryData(['/api/cart'], items);
    } catch (error) {
      set({ error: String(error), isLoading: false });
    }
  },

  // Add item to cart
  addItem: async (productId, quantity) => {
    set({ isLoading: true });
    try {
      await apiRequest('POST', '/api/cart', { productId, quantity });
      await get().fetchItems();
      queryClient.invalidateQueries({ queryKey: ['/api/cart'] });
    } catch (error) {
      set({ error: String(error), isLoading: false });
    }
  },

  // Update item quantity
  updateItemQuantity: async (id, quantity) => {
    set({ isLoading: true });
    try {
      await apiRequest('PUT', `/api/cart/${id}`, { quantity });
      await get().fetchItems();
      queryClient.invalidateQueries({ queryKey: ['/api/cart'] });
    } catch (error) {
      set({ error: String(error), isLoading: false });
    }
  },

  // Remove item from cart
  removeItem: async (id) => {
    set({ isLoading: true });
    try {
      await apiRequest('DELETE', `/api/cart/${id}`);
      await get().fetchItems();
      queryClient.invalidateQueries({ queryKey: ['/api/cart'] });
    } catch (error) {
      set({ error: String(error), isLoading: false });
    }
  },

  // Clear cart
  clearCart: async () => {
    set({ isLoading: true });
    try {
      await apiRequest('DELETE', '/api/cart');
      set({ items: [], isLoading: false });
      queryClient.invalidateQueries({ queryKey: ['/api/cart'] });
    } catch (error) {
      set({ error: String(error), isLoading: false });
    }
  },

  // Derived values
  itemCount: () => {
    const { items } = get();
    return items.reduce((count, item) => count + item.quantity, 0);
  },

  subtotal: () => {
    const { items } = get();
    return items.reduce((total, item) => {
      return total + (Number(item.product.price) * item.quantity);
    }, 0);
  },

  shipping: () => {
    const subtotal = get().subtotal();
    return subtotal >= 75 ? 0 : 10;
  },

  total: () => {
    return get().subtotal() + get().shipping();
  }
}));
