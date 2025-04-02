import React from 'react';
import { Link, useLocation } from 'wouter';
import { useQuery, useMutation } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { queryClient } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import type { CartItemWithProduct } from '@shared/schema';

const Cart = () => {
  const [, navigate] = useLocation();
  const { toast } = useToast();

  // Fetch cart items
  const { data: cartItems, isLoading } = useQuery<CartItemWithProduct[]>({
    queryKey: ['/api/cart'],
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

  // Clear cart
  const clearCartMutation = useMutation({
    mutationFn: async () => {
      await apiRequest('DELETE', '/api/cart');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/cart'] });
      toast({
        title: 'Cart cleared',
        description: 'Your cart has been cleared.',
      });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: `Failed to clear cart: ${error}`,
        variant: 'destructive',
      });
    }
  });

  // Calculate subtotal
  const calculateSubtotal = () => {
    if (!cartItems || cartItems.length === 0) return 0;
    return cartItems.reduce((total, item) => {
      return total + (Number(item.product.price) * item.quantity);
    }, 0);
  };

  // Calculate shipping (free over $75)
  const calculateShipping = () => {
    const subtotal = calculateSubtotal();
    return subtotal >= 75 ? 0 : 10;
  };

  // Calculate total
  const calculateTotal = () => {
    return calculateSubtotal() + calculateShipping();
  };

  // Check if cart is empty
  const isCartEmpty = !cartItems || cartItems.length === 0;

  return (
    <div className="bg-neutral-light min-h-screen py-12">
      <div className="container mx-auto px-4">
        <h1 className="text-3xl font-heading font-semibold mb-8">Your Shopping Cart</h1>
        
        {isLoading ? (
          <div className="bg-white rounded-lg shadow-sm p-6">
            {Array.from({ length: 3 }).map((_, index) => (
              <div key={index} className="flex items-center py-6 border-b last:border-b-0">
                <Skeleton className="w-24 h-24 rounded" />
                <div className="flex-1 ml-6">
                  <Skeleton className="h-6 w-48 mb-2" />
                  <Skeleton className="h-4 w-32 mb-4" />
                  <Skeleton className="h-10 w-28" />
                </div>
                <div className="text-right">
                  <Skeleton className="h-6 w-24 mb-2 ml-auto" />
                  <Skeleton className="h-10 w-10 rounded-full ml-auto" />
                </div>
              </div>
            ))}
          </div>
        ) : isCartEmpty ? (
          <div className="bg-white rounded-lg shadow-sm p-12 text-center">
            <div className="text-6xl text-muted-foreground mb-6">
              <i className="bx bx-cart"></i>
            </div>
            <h2 className="text-2xl font-heading font-semibold mb-3">Your cart is empty</h2>
            <p className="text-muted-foreground mb-8">
              Looks like you haven't added any items to your cart yet.
            </p>
            <Button className="bg-primary hover:bg-primary/90 font-accent" asChild>
              <Link href="/shop">Continue Shopping</Link>
            </Button>
          </div>
        ) : (
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Cart Items */}
            <div className="lg:w-2/3">
              <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                <div className="hidden md:flex py-4 px-6 bg-neutral-light text-sm font-medium">
                  <div className="w-1/2">Product</div>
                  <div className="w-1/4 text-center">Quantity</div>
                  <div className="w-1/4 text-right">Total</div>
                </div>
                
                {cartItems.map((item) => (
                  <div key={item.id} className="py-6 px-6 border-b last:border-b-0">
                    <div className="flex flex-col md:flex-row md:items-center">
                      {/* Product Info */}
                      <div className="flex items-center w-full md:w-1/2 mb-4 md:mb-0">
                        <Link href={`/product/${item.product.id}`}>
                          <a className="shrink-0">
                            <img 
                              src={item.product.imageUrl} 
                              alt={item.product.name} 
                              className="w-20 h-20 object-cover rounded"
                            />
                          </a>
                        </Link>
                        <div className="ml-4">
                          <Link href={`/product/${item.product.id}`}>
                            <a className="font-medium hover:text-primary transition-colors">
                              {item.product.name}
                            </a>
                          </Link>
                          <p className="text-sm text-muted-foreground">
                            ${Number(item.product.price).toFixed(2)}
                          </p>
                        </div>
                      </div>
                      
                      {/* Quantity */}
                      <div className="w-full md:w-1/4 flex justify-start md:justify-center mb-4 md:mb-0">
                        <div className="flex items-center">
                          <Button 
                            variant="outline" 
                            size="icon" 
                            className="h-8 w-8 rounded-r-none"
                            onClick={() => {
                              if (item.quantity > 1) {
                                updateQuantityMutation.mutate({ id: item.id, quantity: item.quantity - 1 });
                              }
                            }}
                            disabled={item.quantity <= 1 || updateQuantityMutation.isPending}
                          >
                            <i className="bx bx-minus"></i>
                          </Button>
                          <Input
                            className="h-8 w-12 rounded-none text-center"
                            value={item.quantity}
                            onChange={(e) => {
                              const value = parseInt(e.target.value);
                              if (!isNaN(value) && value > 0) {
                                updateQuantityMutation.mutate({ id: item.id, quantity: value });
                              }
                            }}
                          />
                          <Button 
                            variant="outline" 
                            size="icon" 
                            className="h-8 w-8 rounded-l-none"
                            onClick={() => updateQuantityMutation.mutate({ id: item.id, quantity: item.quantity + 1 })}
                            disabled={updateQuantityMutation.isPending}
                          >
                            <i className="bx bx-plus"></i>
                          </Button>
                        </div>
                      </div>
                      
                      {/* Price & Remove */}
                      <div className="w-full md:w-1/4 flex justify-between md:justify-end items-center">
                        <span className="font-medium md:mr-4">
                          ${(Number(item.product.price) * item.quantity).toFixed(2)}
                        </span>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="text-muted-foreground hover:text-destructive"
                          onClick={() => removeMutation.mutate(item.id)}
                          disabled={removeMutation.isPending}
                        >
                          <i className="bx bx-trash"></i>
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
                
                {/* Cart Actions */}
                <div className="p-6 bg-neutral-light flex flex-wrap gap-4 justify-between items-center">
                  <div className="flex flex-wrap gap-4">
                    <Button 
                      variant="outline" 
                      className="border-primary text-primary hover:bg-primary hover:text-white font-accent"
                      asChild
                    >
                      <Link href="/shop">Continue Shopping</Link>
                    </Button>
                    <Button 
                      variant="outline"
                      className="border-destructive text-destructive hover:bg-destructive hover:text-white"
                      onClick={() => {
                        if (window.confirm('Are you sure you want to clear your cart?')) {
                          clearCartMutation.mutate();
                        }
                      }}
                      disabled={clearCartMutation.isPending}
                    >
                      {clearCartMutation.isPending ? 'Clearing...' : 'Clear Cart'}
                    </Button>
                  </div>
                  <Button 
                    className="bg-primary hover:bg-primary/90 font-accent"
                    asChild
                  >
                    <Link href="/checkout">Proceed to Checkout</Link>
                  </Button>
                </div>
              </div>
            </div>
            
            {/* Order Summary */}
            <div className="lg:w-1/3">
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h2 className="text-xl font-heading font-semibold mb-6">Order Summary</h2>
                
                <div className="space-y-4 mb-6">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span className="font-medium">${calculateSubtotal().toFixed(2)}</span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Shipping</span>
                    <span className="font-medium">
                      {calculateShipping() === 0 ? 'Free' : `$${calculateShipping().toFixed(2)}`}
                    </span>
                  </div>
                  
                  {calculateShipping() > 0 && (
                    <div className="text-sm text-muted-foreground">
                      Free shipping on orders over $75
                    </div>
                  )}
                  
                  <div className="border-t pt-4 flex justify-between">
                    <span className="font-medium">Total</span>
                    <span className="font-accent font-semibold text-lg">
                      ${calculateTotal().toFixed(2)}
                    </span>
                  </div>
                </div>
                
                <Button 
                  className="w-full bg-primary hover:bg-primary/90 font-accent"
                  onClick={() => navigate('/checkout')}
                >
                  Proceed to Checkout
                </Button>
                
                <div className="mt-6 text-center text-sm text-muted-foreground">
                  <div className="flex justify-center gap-2 mb-2">
                    <i className="bx bx-lock-alt"></i>
                    <span>Secure Checkout</span>
                  </div>
                  <div className="flex justify-center gap-2">
                    <i className="bx bx-credit-card"></i>
                    <span>We accept all major credit cards</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Cart;
