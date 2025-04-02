import React, { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { useQuery, useMutation } from '@tanstack/react-query';
import { queryClient } from '@/lib/queryClient';
import { Skeleton } from '@/components/ui/skeleton';
import type { CartItemWithProduct } from '@shared/schema';

const CartSidebar = () => {
  const [location, navigate] = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const { toast } = useToast();

  // Close cart when navigating to new page
  useEffect(() => {
    setIsOpen(false);
  }, [location]);

  // Set up event listeners for opening the cart
  useEffect(() => {
    const handleCartToggle = () => {
      setIsOpen(prev => !prev);
    };

    // Create custom event for cart toggle
    window.addEventListener('toggle-cart', handleCartToggle);

    return () => {
      window.removeEventListener('toggle-cart', handleCartToggle);
    };
  }, []);

  // Fetch cart items
  const { data: cartItems, isLoading, refetch } = useQuery<CartItemWithProduct[]>({
    queryKey: ['/api/cart'],
    enabled: isOpen, // Only fetch when cart is open
  });

  // Remove item from cart
  const removeMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest('DELETE', `/api/cart/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/cart'] });
      toast({
        title: 'Item removed',
        description: 'The item has been removed from your cart.',
      });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: `Failed to remove item: ${error}`,
        variant: 'destructive',
      });
    }
  });

  // Update item quantity
  const updateQuantityMutation = useMutation({
    mutationFn: async ({ id, quantity }: { id: number, quantity: number }) => {
      await apiRequest('PUT', `/api/cart/${id}`, { quantity });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/cart'] });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: `Failed to update quantity: ${error}`,
        variant: 'destructive',
      });
    }
  });

  // Calculate total
  const calculateTotal = () => {
    if (!cartItems || cartItems.length === 0) return 0;
    return cartItems.reduce((total, item) => {
      return total + (Number(item.product.price) * item.quantity);
    }, 0);
  };

  return (
    <>
      {/* Cart Overlay (only visible when cart is open) */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Cart Sidebar */}
      <div className={`fixed top-0 right-0 h-full w-full sm:w-96 bg-white shadow-lg z-50 transform transition-transform duration-300 ${isOpen ? 'translate-x-0' : 'translate-x-full'} overflow-y-auto`}>
        <div className="p-4 border-b border-secondary">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-heading font-semibold">Your Cart</h3>
            <button 
              className="text-2xl hover:text-primary transition-colors"
              onClick={() => setIsOpen(false)}
            >
              <i className="bx bx-x"></i>
            </button>
          </div>
        </div>

        <div className="p-4 space-y-4">
          {isLoading ? (
            // Skeleton loaders for cart items
            Array.from({ length: 3 }).map((_, index) => (
              <div key={index} className="flex items-center gap-3 pb-4 border-b">
                <Skeleton className="h-16 w-16 rounded" />
                <div className="flex-1">
                  <Skeleton className="h-4 w-32 mb-2" />
                  <Skeleton className="h-4 w-20" />
                </div>
              </div>
            ))
          ) : cartItems && cartItems.length > 0 ? (
            cartItems.map((item) => (
              <div key={item.id} className="flex items-center gap-3 pb-4 border-b">
                <img 
                  src={item.product.imageUrl} 
                  alt={item.product.name} 
                  className="w-16 h-16 object-cover rounded"
                />
                <div className="flex-1">
                  <h4 className="font-medium">{item.product.name}</h4>
                  <div className="flex items-center justify-between mt-1">
                    <span className="font-accent">${Number(item.product.price).toFixed(2)}</span>
                    <div className="flex items-center gap-2">
                      <button 
                        className="w-6 h-6 flex items-center justify-center bg-muted rounded"
                        onClick={() => {
                          if (item.quantity > 1) {
                            updateQuantityMutation.mutate({ id: item.id, quantity: item.quantity - 1 });
                          }
                        }}
                        disabled={item.quantity <= 1 || updateQuantityMutation.isPending}
                      >
                        <i className="bx bx-minus text-xs"></i>
                      </button>
                      
                      <span>{item.quantity}</span>
                      
                      <button 
                        className="w-6 h-6 flex items-center justify-center bg-muted rounded"
                        onClick={() => updateQuantityMutation.mutate({ id: item.id, quantity: item.quantity + 1 })}
                        disabled={updateQuantityMutation.isPending}
                      >
                        <i className="bx bx-plus text-xs"></i>
                      </button>
                    </div>
                  </div>
                </div>
                <button 
                  className="text-sm text-destructive"
                  onClick={() => removeMutation.mutate(item.id)}
                  disabled={removeMutation.isPending}
                >
                  <i className="bx bx-trash"></i>
                </button>
              </div>
            ))
          ) : (
            <div className="flex items-center text-center justify-center h-40 border border-dashed border-secondary rounded p-4">
              <p className="text-muted-foreground">Your cart is empty</p>
            </div>
          )}
        </div>

        <div className="p-4 border-t border-secondary mt-auto">
          <div className="flex items-center justify-between mb-4">
            <span className="font-medium">Subtotal:</span>
            <span className="font-accent font-semibold">
              ${calculateTotal().toFixed(2)}
            </span>
          </div>
          
          <Button 
            className="w-full mb-2 bg-primary hover:bg-primary/90 font-accent"
            onClick={() => navigate('/checkout')}
            disabled={!cartItems || cartItems.length === 0}
          >
            Checkout
          </Button>
          
          <Button 
            variant="outline" 
            className="w-full border-primary text-primary hover:bg-primary hover:text-white font-accent"
            onClick={() => navigate('/cart')}
            disabled={!cartItems || cartItems.length === 0}
          >
            View Cart
          </Button>
        </div>
      </div>
    </>
  );
};

export default CartSidebar;
