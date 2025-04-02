import React from 'react';
import { Link } from 'wouter';
import { Button } from '@/components/ui/button';
import { StarRating } from '@/components/ui/star-rating';
import { useMutation } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { queryClient } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import type { Product } from '@shared/schema';

interface ProductCardProps {
  product: Product;
}

const ProductCard = ({ product }: ProductCardProps) => {
  const { toast } = useToast();

  const addToCartMutation = useMutation({
    mutationFn: async (productId: number) => {
      return apiRequest('POST', '/api/cart', { 
        productId, 
        quantity: 1 
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/cart'] });
      toast({
        title: 'Item added',
        description: `${product.name} has been added to your cart.`,
      });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: `Failed to add item to cart: ${error}`,
        variant: 'destructive',
      });
    }
  });

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addToCartMutation.mutate(product.id);
  };

  // Format category for display
  const formatCategory = (category: string) => {
    return category.replace('_', ' ').replace(/\b\w/g, (l) => l.toUpperCase());
  };

  return (
    <div className="product-card bg-white rounded-lg shadow-md overflow-hidden transition-all duration-300 hover:shadow-lg">
      <Link href={`/product/${product.id}`}>
        <a className="block">
          <div className="relative overflow-hidden">
            <img 
              src={product.imageUrl} 
              alt={product.name} 
              className="w-full h-64 object-cover transition-transform duration-300"
            />
            <div className="quick-view absolute inset-0 bg-black bg-opacity-20 flex items-center justify-center opacity-0 transition-opacity">
              <Button 
                variant="secondary" 
                size="sm" 
                className="bg-white text-primary hover:bg-primary hover:text-white"
              >
                Quick View
              </Button>
            </div>
          </div>
          <div className="p-4">
            <span className="text-xs text-accent font-medium uppercase">
              {formatCategory(product.category)}
            </span>
            <h3 className="text-lg font-medium mt-1 mb-2">{product.name}</h3>
            
            <StarRating 
              rating={Number(product.rating)} 
              showCount={true} 
              count={product.reviewCount} 
              className="mb-3"
            />
            
            <div className="flex items-center justify-between">
              <span className="font-accent font-semibold text-lg">
                ${Number(product.price).toFixed(2)}
              </span>
              <Button
                size="icon"
                className="w-10 h-10 rounded-full bg-secondary text-primary hover:bg-primary hover:text-white"
                onClick={handleAddToCart}
                disabled={addToCartMutation.isPending}
              >
                <i className="bx bx-plus"></i>
              </Button>
            </div>
          </div>
        </a>
      </Link>
    </div>
  );
};

export default ProductCard;
