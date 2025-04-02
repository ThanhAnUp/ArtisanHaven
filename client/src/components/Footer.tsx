import React, { useState } from 'react';
import { Link } from 'wouter';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { useMutation } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';

const Footer = () => {
  const [email, setEmail] = useState('');
  const { toast } = useToast();

  const newsletterMutation = useMutation({
    mutationFn: async (email: string) => {
      return apiRequest('POST', '/api/newsletter', { email });
    },
    onSuccess: () => {
      toast({
        title: 'Success!',
        description: 'You have been subscribed to our newsletter.',
      });
      setEmail('');
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: `Failed to subscribe: ${error}`,
        variant: 'destructive',
      });
    }
  });

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      toast({
        title: 'Error',
        description: 'Please enter your email address',
        variant: 'destructive',
      });
      return;
    }
    newsletterMutation.mutate(email);
  };

  return (
    <footer className="bg-neutral-dark text-white pt-16 pb-8">
      <div className="container mx-auto px-4">
        {/* Newsletter Section */}
        <div className="max-w-2xl mx-auto text-center mb-16">
          <h2 className="text-3xl font-heading font-semibold mb-4">Join Our Community</h2>
          <p className="mb-8">Subscribe to our newsletter to receive updates on new artisan products, upcoming workshops, and exclusive offers.</p>
          <form className="flex flex-col sm:flex-row gap-3" onSubmit={handleSubscribe}>
            <Input
              type="email"
              placeholder="Your email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="flex-1 bg-white/10 border-0 focus:ring-2 focus:ring-primary"
              required
            />
            <Button 
              type="submit" 
              className="bg-primary text-white font-accent hover:bg-primary/90 whitespace-nowrap"
              disabled={newsletterMutation.isPending}
            >
              {newsletterMutation.isPending ? 'Subscribing...' : 'Subscribe'}
            </Button>
          </form>
        </div>

        {/* Footer Links */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
          <div>
            <h3 className="text-xl font-heading font-semibold mb-4">Artisan Haven</h3>
            <p className="mb-4 text-white/80">Connecting artisans with craft lovers around the world since 2015.</p>
            <div className="flex space-x-4">
              <a href="#" className="text-white hover:text-accent transition-colors">
                <i className="bx bxl-facebook text-xl"></i>
              </a>
              <a href="#" className="text-white hover:text-accent transition-colors">
                <i className="bx bxl-instagram text-xl"></i>
              </a>
              <a href="#" className="text-white hover:text-accent transition-colors">
                <i className="bx bxl-pinterest text-xl"></i>
              </a>
              <a href="#" className="text-white hover:text-accent transition-colors">
                <i className="bx bxl-twitter text-xl"></i>
              </a>
            </div>
          </div>

          <div>
            <h4 className="text-lg font-medium mb-4">Shop</h4>
            <ul className="space-y-2">
              <li><Link href="/shop"><a className="hover:text-accent transition-colors">All Products</a></Link></li>
              <li><Link href="/shop?featured=true"><a className="hover:text-accent transition-colors">Featured Products</a></Link></li>
              <li><a href="#" className="hover:text-accent transition-colors">New Arrivals</a></li>
              <li><a href="#" className="hover:text-accent transition-colors">Best Sellers</a></li>
              <li><a href="#" className="hover:text-accent transition-colors">On Sale</a></li>
            </ul>
          </div>

          <div>
            <h4 className="text-lg font-medium mb-4">About</h4>
            <ul className="space-y-2">
              <li><Link href="/about"><a className="hover:text-accent transition-colors">Our Story</a></Link></li>
              <li><a href="#" className="hover:text-accent transition-colors">Meet the Artisans</a></li>
              <li><a href="#" className="hover:text-accent transition-colors">Workshops</a></li>
              <li><a href="#" className="hover:text-accent transition-colors">Sustainability</a></li>
              <li><a href="#" className="hover:text-accent transition-colors">Press</a></li>
            </ul>
          </div>

          <div>
            <h4 className="text-lg font-medium mb-4">Customer Service</h4>
            <ul className="space-y-2">
              <li><Link href="/contact"><a className="hover:text-accent transition-colors">Contact Us</a></Link></li>
              <li><a href="#" className="hover:text-accent transition-colors">FAQs</a></li>
              <li><a href="#" className="hover:text-accent transition-colors">Shipping Policy</a></li>
              <li><a href="#" className="hover:text-accent transition-colors">Returns & Exchanges</a></li>
              <li><a href="#" className="hover:text-accent transition-colors">Privacy Policy</a></li>
            </ul>
          </div>
        </div>

        {/* Copyright */}
        <div className="border-t border-gray-700 pt-8">
          <p className="text-center text-sm text-white/70">© {new Date().getFullYear()} Artisan Haven. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
