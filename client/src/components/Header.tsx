import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'wouter';
import { useQuery } from '@tanstack/react-query';
import type { CartItemWithProduct } from '@shared/schema';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

const Header = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const searchInputRef = useRef<HTMLInputElement>(null);
  const [location, setLocation] = useLocation();

  // Fetch cart items to show cart badge count
  const { data: cartItems, refetch: refetchCart } = useQuery<CartItemWithProduct[]>({
    queryKey: ['/api/cart'],
  });
  
  // Refetch cart items periodically to ensure badge is updated
  useEffect(() => {
    const interval = setInterval(() => {
      refetchCart();
    }, 3000); // Refetch every 3 seconds
    
    return () => clearInterval(interval);
  }, [refetchCart]);

  // Get total items in cart
  const cartItemCount = cartItems?.reduce((count, item) => count + item.quantity, 0) || 0;

  // Toggle cart sidebar
  const toggleCart = () => {
    // Dispatch custom event to open/close cart
    window.dispatchEvent(new CustomEvent('toggle-cart'));
  };

  // Listen for scroll to add shadow to header
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  // Close mobile menu and search when changing pages
  useEffect(() => {
    setIsMobileMenuOpen(false);
    setIsSearchOpen(false);
  }, [location]);
  
  // Close search when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        isSearchOpen &&
        searchInputRef.current &&
        !searchInputRef.current.contains(event.target as Node) &&
        !(event.target as Element).closest('button')
      ) {
        setIsSearchOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isSearchOpen]);

  return (
    <header className={`sticky top-0 z-50 bg-white ${isScrolled ? 'shadow-md' : 'shadow-sm'} transition-shadow`}>
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-10">
            {/* Logo */}
            <Link href="/">
              <a className="text-2xl font-heading font-bold text-primary">
                Artisan Haven
              </a>
            </Link>
            
            {/* Desktop Navigation */}
            <nav className="hidden md:flex space-x-6">
              <NavLink href="/" label="Trang chủ" />
              <NavLink href="/shop" label="Cửa hàng" />
              <NavLink href="/about" label="Giới thiệu" />
              <NavLink href="/contact" label="Liên hệ" />
            </nav>
          </div>
          
          {/* Action Buttons */}
          <div className="flex items-center space-x-4">
            <div className="relative">
              <button 
                className="p-2 hover:text-primary transition-colors" 
                aria-label="Search"
                onClick={() => {
                  setIsSearchOpen(!isSearchOpen);
                  if (!isSearchOpen) {
                    setTimeout(() => {
                      searchInputRef.current?.focus();
                    }, 100);
                  }
                }}
              >
                <i className="bx bx-search text-xl"></i>
              </button>
              
              {/* Search Popup */}
              {isSearchOpen && (
                <div className="absolute right-0 top-full mt-2 w-64 md:w-80 bg-white shadow-lg rounded-md p-3 z-50">
                  <form 
                    className="flex items-center gap-2"
                    onSubmit={(e) => {
                      e.preventDefault();
                      if (searchQuery.trim()) {
                        setLocation(`/shop?q=${encodeURIComponent(searchQuery)}`);
                        setIsSearchOpen(false);
                        setSearchQuery('');
                      }
                    }}
                  >
                    <Input
                      ref={searchInputRef}
                      type="search"
                      placeholder="Tìm kiếm sản phẩm..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="flex-1"
                    />
                    <Button type="submit" size="sm" className="bg-primary hover:bg-primary/90">
                      <i className="bx bx-search text-sm"></i>
                    </Button>
                  </form>
                </div>
              )}
            </div>
            
            <Link href="/checkout">
              <a className="p-2 hover:text-primary transition-colors">
                <i className="bx bx-user text-xl"></i>
              </a>
            </Link>
            
            <button 
              className="p-2 hover:text-primary transition-colors relative"
              onClick={toggleCart}
              aria-label="Cart"
            >
              <i className="bx bx-shopping-bag text-xl"></i>
              {cartItemCount > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-primary text-white text-xs flex items-center justify-center transition-opacity">
                  {cartItemCount}
                </span>
              )}
            </button>
            
            {/* Mobile Menu Toggle */}
            <button 
              className="md:hidden p-2 hover:text-primary transition-colors"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              aria-label="Menu"
            >
              <i className={`bx ${isMobileMenuOpen ? 'bx-x' : 'bx-menu'} text-xl`}></i>
            </button>
          </div>
        </div>
        
        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden mt-4 pb-2">
            <nav className="flex flex-col space-y-3">
              <NavLink href="/" label="Trang chủ" />
              <NavLink href="/shop" label="Cửa hàng" />
              <NavLink href="/about" label="Giới thiệu" />
              <NavLink href="/contact" label="Liên hệ" />
            </nav>
          </div>
        )}
      </div>
    </header>
  );
};

// NavLink component for consistent styling
const NavLink = ({ href, label }: { href: string, label: string }) => {
  const [location] = useLocation();
  const isActive = location === href;
  
  return (
    <Link href={href}>
      <a className={`text-sm font-medium transition-colors ${isActive ? 'text-primary' : 'hover:text-primary'}`}>
        {label}
      </a>
    </Link>
  );
};

export default Header;
