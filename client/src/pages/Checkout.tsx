import React, { useState } from 'react';
import { useLocation } from 'wouter';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useQuery, useMutation } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { queryClient } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import type { CartItemWithProduct } from '@shared/schema';

// Form schema
const checkoutFormSchema = z.object({
  fullName: z.string().min(2, { message: 'Full name is required' }),
  email: z.string().email({ message: 'Please enter a valid email address' }),
  address: z.string().min(5, { message: 'Address is required' }),
  city: z.string().min(2, { message: 'City is required' }),
  state: z.string().min(2, { message: 'State is required' }),
  zipCode: z.string().min(5, { message: 'Zip code is required' }),
  country: z.string().min(2, { message: 'Country is required' }),
  cardName: z.string().min(2, { message: 'Name on card is required' }),
  cardNumber: z.string().min(16, { message: 'Valid card number is required' }),
  expDate: z.string().min(5, { message: 'Expiration date is required' }),
  cvv: z.string().min(3, { message: 'CVV is required' }),
});

type CheckoutFormValues = z.infer<typeof checkoutFormSchema>;

const Checkout = () => {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const [isOrderPlaced, setIsOrderPlaced] = useState(false);
  const [orderId, setOrderId] = useState<number | null>(null);

  // Fetch cart items
  const { data: cartItems, isLoading } = useQuery<CartItemWithProduct[]>({
    queryKey: ['/api/cart'],
    onSuccess: (data) => {
      if (data.length === 0) {
        toast({
          title: 'Your cart is empty',
          description: 'Please add items to your cart before checkout.',
          variant: 'destructive',
        });
        navigate('/shop');
      }
    },
  });

  // Submit order mutation
  const orderMutation = useMutation({
    mutationFn: async (data: CheckoutFormValues) => {
      const response = await apiRequest('POST', '/api/orders', {
        fullName: data.fullName,
        email: data.email,
        address: data.address,
        city: data.city,
        state: data.state,
        zipCode: data.zipCode,
        country: data.country,
      });
      return response.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['/api/cart'] });
      toast({
        title: 'Order placed successfully!',
        description: 'Thank you for your purchase.',
      });
      setIsOrderPlaced(true);
      setOrderId(data.id);
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: `Failed to place order: ${error}`,
        variant: 'destructive',
      });
    },
  });

  // Initialize form
  const form = useForm<CheckoutFormValues>({
    resolver: zodResolver(checkoutFormSchema),
    defaultValues: {
      fullName: '',
      email: '',
      address: '',
      city: '',
      state: '',
      zipCode: '',
      country: '',
      cardName: '',
      cardNumber: '',
      expDate: '',
      cvv: '',
    },
  });

  // Handle form submission
  const onSubmit = (data: CheckoutFormValues) => {
    if (!cartItems || cartItems.length === 0) {
      toast({
        title: 'Your cart is empty',
        description: 'Please add items to your cart before checkout.',
        variant: 'destructive',
      });
      return;
    }
    orderMutation.mutate(data);
  };

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

  // Order confirmation view
  if (isOrderPlaced) {
    return (
      <div className="bg-neutral-light min-h-screen py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-sm p-8">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 mb-6 rounded-full bg-primary/20 text-primary">
                <i className="bx bx-check-circle text-3xl"></i>
              </div>
              
              <h1 className="text-3xl font-heading font-semibold mb-4">Order Confirmed!</h1>
              <p className="text-muted-foreground mb-8">
                Thank you for your purchase. Your order has been received and is being processed.
              </p>
              
              <div className="bg-neutral-light p-4 rounded-lg mb-8">
                <p className="font-medium">Order Number: #{orderId}</p>
                <p className="text-sm text-muted-foreground">
                  A confirmation email has been sent to your email address.
                </p>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button 
                  className="bg-primary hover:bg-primary/90 font-accent"
                  asChild
                >
                  <a href={`/api/orders/${orderId}`} target="_blank" rel="noopener noreferrer">
                    <i className="bx bx-file mr-2"></i>
                    View Order Details
                  </a>
                </Button>
                <Button 
                  variant="outline" 
                  className="border-primary text-primary hover:bg-primary hover:text-white font-accent"
                  onClick={() => navigate('/shop')}
                >
                  Continue Shopping
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-neutral-light min-h-screen py-12">
      <div className="container mx-auto px-4">
        <h1 className="text-3xl font-heading font-semibold mb-8">Checkout</h1>
        
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Checkout Form */}
          <div className="lg:w-2/3">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                  {/* Checkout Tabs */}
                  <Tabs defaultValue="shipping" className="w-full">
                    <TabsList className="grid w-full grid-cols-2 mb-8">
                      <TabsTrigger value="shipping">Shipping Info</TabsTrigger>
                      <TabsTrigger value="payment">Payment</TabsTrigger>
                    </TabsList>
                    
                    {/* Shipping Info Tab */}
                    <TabsContent value="shipping" className="space-y-6">
                      <h2 className="text-xl font-heading font-medium mb-4">Shipping Information</h2>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <FormField
                          control={form.control}
                          name="fullName"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Full Name</FormLabel>
                              <FormControl>
                                <Input placeholder="John Doe" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={form.control}
                          name="email"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Email Address</FormLabel>
                              <FormControl>
                                <Input placeholder="your@email.com" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                      
                      <FormField
                        control={form.control}
                        name="address"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Street Address</FormLabel>
                            <FormControl>
                              <Input placeholder="123 Main St" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <FormField
                          control={form.control}
                          name="city"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>City</FormLabel>
                              <FormControl>
                                <Input placeholder="New York" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={form.control}
                          name="state"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>State</FormLabel>
                              <FormControl>
                                <Input placeholder="NY" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={form.control}
                          name="zipCode"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Zip Code</FormLabel>
                              <FormControl>
                                <Input placeholder="10001" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                      
                      <FormField
                        control={form.control}
                        name="country"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Country</FormLabel>
                            <FormControl>
                              <Input placeholder="United States" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <div className="pt-4">
                        <Button 
                          type="button" 
                          className="bg-primary hover:bg-primary/90 font-accent"
                          onClick={() => document.querySelector('[data-value="payment"]')?.click()}
                        >
                          Continue to Payment
                        </Button>
                      </div>
                    </TabsContent>
                    
                    {/* Payment Tab */}
                    <TabsContent value="payment" className="space-y-6">
                      <h2 className="text-xl font-heading font-medium mb-4">Payment Method</h2>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <FormField
                          control={form.control}
                          name="cardName"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Name on Card</FormLabel>
                              <FormControl>
                                <Input placeholder="John Doe" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={form.control}
                          name="cardNumber"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Card Number</FormLabel>
                              <FormControl>
                                <Input placeholder="1234 5678 9012 3456" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <FormField
                          control={form.control}
                          name="expDate"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Expiration Date</FormLabel>
                              <FormControl>
                                <Input placeholder="MM/YY" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={form.control}
                          name="cvv"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>CVV</FormLabel>
                              <FormControl>
                                <Input placeholder="123" type="password" maxLength={4} {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                      
                      <div className="flex gap-4 pt-4">
                        <Button 
                          type="button" 
                          variant="outline"
                          onClick={() => document.querySelector('[data-value="shipping"]')?.click()}
                        >
                          Back to Shipping
                        </Button>
                        <Button 
                          type="submit" 
                          className="bg-primary hover:bg-primary/90 font-accent"
                          disabled={orderMutation.isPending}
                        >
                          {orderMutation.isPending ? 'Processing...' : 'Place Order'}
                        </Button>
                      </div>
                    </TabsContent>
                  </Tabs>
                </form>
              </Form>
            </div>
          </div>
          
          {/* Order Summary */}
          <div className="lg:w-1/3">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-heading font-semibold mb-6">Order Summary</h2>
              
              <div className="mb-6">
                {isLoading ? (
                  <>
                    <Skeleton className="h-16 w-full mb-4" />
                    <Skeleton className="h-16 w-full mb-4" />
                    <Skeleton className="h-16 w-full" />
                  </>
                ) : cartItems && cartItems.length > 0 ? (
                  <div className="space-y-4">
                    {cartItems.map((item) => (
                      <div key={item.id} className="flex gap-4">
                        <img 
                          src={item.product.imageUrl} 
                          alt={item.product.name} 
                          className="w-16 h-16 object-cover rounded"
                        />
                        <div className="flex-1">
                          <h4 className="font-medium">{item.product.name}</h4>
                          <div className="flex justify-between text-sm text-muted-foreground">
                            <span>Qty: {item.quantity}</span>
                            <span>${(Number(item.product.price) * item.quantity).toFixed(2)}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-center text-muted-foreground py-4">Your cart is empty</p>
                )}
              </div>
              
              <Separator className="my-6" />
              
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
              
              <div className="text-center text-sm text-muted-foreground">
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
      </div>
    </div>
  );
};

export default Checkout;
