import React, { useState } from 'react';
import { useRoute, Link } from 'wouter';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { StarRating } from '@/components/ui/star-rating';
import { Skeleton } from '@/components/ui/skeleton';
import ProductCard from '@/components/ProductCard';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { queryClient } from '@/lib/queryClient';
import type { Product, Review } from '@shared/schema';

const ProductDetail = () => {
  const [, params] = useRoute('/product/:id');
  const productId = params?.id ? parseInt(params.id) : null;
  const [quantity, setQuantity] = useState(1);
  const { toast } = useToast();

  // Fetch product details
  const { data: product, isLoading: isLoadingProduct } = useQuery<Product>({
    queryKey: [`/api/products/${productId}`],
    enabled: !!productId,
  });

  // Fetch reviews
  const { data: reviews, isLoading: isLoadingReviews } = useQuery<Review[]>({
    queryKey: [`/api/products/${productId}/reviews`],
    enabled: !!productId,
  });

  // Fetch similar products
  const { data: similarProducts, isLoading: isLoadingSimilar } = useQuery<Product[]>({
    queryKey: ['/api/products'],
    enabled: !!product,
    select: (data) => {
      if (!product) return [];
      return data.filter(p => 
        p.category === product.category && 
        p.id !== product.id
      ).slice(0, 4);
    }
  });

  // Add to cart mutation
  const addToCartMutation = useMutation({
    mutationFn: async () => {
      if (!productId) throw new Error("No product selected");
      return apiRequest('POST', '/api/cart', { 
        productId, 
        quantity 
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/cart'] });
      toast({
        title: 'Success!',
        description: `${product?.name} has been added to your cart.`,
      });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: `Failed to add to cart: ${error}`,
        variant: 'destructive',
      });
    }
  });

  // Format category for display
  const formatCategory = (category?: string) => {
    if (!category) return '';
    return category.replace('_', ' ').replace(/\b\w/g, (l) => l.toUpperCase());
  };

  // Handle quantity change
  const handleQuantityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value);
    if (!isNaN(value) && value > 0) {
      setQuantity(value);
    }
  };

  // Handle add to cart
  const handleAddToCart = () => {
    addToCartMutation.mutate();
  };

  if (isLoadingProduct) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="flex flex-col md:flex-row gap-8">
          <div className="md:w-1/2">
            <Skeleton className="w-full h-[500px] rounded-lg" />
          </div>
          <div className="md:w-1/2">
            <Skeleton className="h-8 w-48 mb-2" />
            <Skeleton className="h-10 w-3/4 mb-4" />
            <Skeleton className="h-6 w-32 mb-6" />
            <Skeleton className="h-4 w-full mb-2" />
            <Skeleton className="h-4 w-full mb-2" />
            <Skeleton className="h-4 w-3/4 mb-8" />
            <div className="flex gap-4 mb-8">
              <Skeleton className="h-12 w-28" />
              <Skeleton className="h-12 flex-1" />
            </div>
            <Skeleton className="h-10 w-full" />
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <div className="text-5xl mb-4">
          <i className="bx bx-error-circle"></i>
        </div>
        <h2 className="text-3xl font-heading font-semibold mb-4">Product Not Found</h2>
        <p className="mb-8">The product you're looking for doesn't exist or has been removed.</p>
        <Button asChild className="bg-primary hover:bg-primary/90">
          <Link href="/shop">Continue Shopping</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="bg-neutral-light pb-16">
      {/* Product Details Section */}
      <div className="bg-white py-12 mb-12 shadow-sm">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row gap-8">
            {/* Product Image */}
            <div className="md:w-1/2">
              <div className="overflow-hidden rounded-lg bg-neutral-light">
                <img 
                  src={product.imageUrl} 
                  alt={product.name} 
                  className="w-full h-auto object-cover transition-transform hover:scale-105 duration-300"
                />
              </div>
            </div>
            
            {/* Product Info */}
            <div className="md:w-1/2">
              <div className="mb-2">
                <span className="text-sm text-accent font-medium uppercase">
                  {formatCategory(product.category)}
                </span>
              </div>
              <h1 className="text-3xl md:text-4xl font-heading font-semibold mb-3">
                {product.name}
              </h1>
              
              <div className="flex items-center mb-6">
                <StarRating 
                  rating={Number(product.rating)} 
                  showCount={true} 
                  count={product.reviewCount} 
                />
              </div>
              
              <div className="text-2xl font-accent font-semibold mb-6">
                ${Number(product.price).toFixed(2)}
              </div>
              
              <div className="mb-8">
                <p className="leading-relaxed">{product.description}</p>
              </div>
              
              {/* Add to Cart */}
              <div className="flex flex-col sm:flex-row gap-4 mb-8">
                <div className="w-28">
                  <Input
                    type="number"
                    min="1"
                    value={quantity}
                    onChange={handleQuantityChange}
                    className="h-12"
                  />
                </div>
                <Button
                  className="flex-1 h-12 bg-primary hover:bg-primary/90 font-accent text-white"
                  onClick={handleAddToCart}
                  disabled={addToCartMutation.isPending}
                >
                  {addToCartMutation.isPending ? 'Adding...' : 'Add to Cart'}
                </Button>
              </div>
              
              {/* Additional Info */}
              <div className="border-t border-secondary pt-6">
                <div className="flex items-center space-x-2 mb-2">
                  <i className="bx bx-check-circle text-primary text-xl"></i>
                  <span>Handcrafted with care by skilled artisans</span>
                </div>
                <div className="flex items-center space-x-2 mb-2">
                  <i className="bx bx-package text-primary text-xl"></i>
                  <span>Free shipping on orders over $75</span>
                </div>
                <div className="flex items-center space-x-2">
                  <i className="bx bx-refresh text-primary text-xl"></i>
                  <span>30-day return policy</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Product Tabs */}
      <div className="container mx-auto px-4 mb-16">
        <Tabs defaultValue="description" className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-8">
            <TabsTrigger value="description">Description</TabsTrigger>
            <TabsTrigger value="details">Details</TabsTrigger>
            <TabsTrigger value="reviews">
              Reviews ({product.reviewCount})
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="description" className="bg-white p-6 rounded-lg shadow-sm">
            <div className="prose max-w-none">
              <h3 className="text-xl font-medium mb-4">About This Product</h3>
              <p>{product.description}</p>
              <p className="mt-4">
                Each piece is unique and may vary slightly from the image shown, 
                as our products are handmade with natural materials and traditional techniques.
              </p>
            </div>
          </TabsContent>
          
          <TabsContent value="details" className="bg-white p-6 rounded-lg shadow-sm">
            <div className="prose max-w-none">
              <h3 className="text-xl font-medium mb-4">Product Details</h3>
              <ul className="space-y-2">
                <li><strong>Category:</strong> {formatCategory(product.category)}</li>
                <li><strong>Materials:</strong> Sustainably sourced, high-quality materials</li>
                <li><strong>Dimensions:</strong> Varies by product</li>
                <li><strong>Care:</strong> See product-specific care instructions</li>
                <li><strong>Origin:</strong> Handcrafted by skilled artisans</li>
              </ul>
            </div>
          </TabsContent>
          
          <TabsContent value="reviews" className="bg-white p-6 rounded-lg shadow-sm">
            <div>
              <h3 className="text-xl font-medium mb-6">Customer Reviews</h3>
              
              {isLoadingReviews ? (
                <div className="space-y-6">
                  {Array.from({ length: 3 }).map((_, index) => (
                    <div key={index} className="border-b pb-6 mb-6">
                      <Skeleton className="h-4 w-40 mb-2" />
                      <Skeleton className="h-4 w-24 mb-4" />
                      <Skeleton className="h-4 w-full mb-2" />
                      <Skeleton className="h-4 w-full mb-2" />
                      <Skeleton className="h-4 w-2/3" />
                    </div>
                  ))}
                </div>
              ) : reviews && reviews.length > 0 ? (
                <div className="space-y-6">
                  {reviews.map((review) => (
                    <div key={review.id} className="border-b border-secondary pb-6 mb-6 last:border-b-0 last:mb-0 last:pb-0">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium">{review.name}</h4>
                        <StarRating rating={review.rating} size="sm" />
                      </div>
                      <p className="text-sm text-muted-foreground mb-3">
                        {review.location} · {new Date(review.createdAt).toLocaleDateString()}
                      </p>
                      <p>{review.comment}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-muted-foreground mb-4">This product doesn't have any reviews yet.</p>
                  <Button className="bg-primary hover:bg-primary/90">Write a Review</Button>
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>
      
      {/* Related Products */}
      <div className="container mx-auto px-4">
        <h2 className="text-2xl font-heading font-semibold mb-8">You May Also Like</h2>
        
        {isLoadingSimilar ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {Array.from({ length: 4 }).map((_, index) => (
              <div key={index} className="bg-white rounded-lg shadow-md overflow-hidden">
                <Skeleton className="w-full h-64" />
                <div className="p-4">
                  <Skeleton className="h-4 w-20 mb-2" />
                  <Skeleton className="h-6 w-48 mb-3" />
                  <Skeleton className="h-4 w-32 mb-4" />
                  <div className="flex items-center justify-between">
                    <Skeleton className="h-6 w-16" />
                    <Skeleton className="h-10 w-10 rounded-full" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : similarProducts && similarProducts.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {similarProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <p className="text-center py-8 text-muted-foreground">
            No similar products found.
          </p>
        )}
      </div>
    </div>
  );
};

export default ProductDetail;
