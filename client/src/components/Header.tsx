import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'wouter';
import { useQuery } from '@tanstack/react-query';
import type { CartItemWithProduct } from '@shared/schema';

const Header = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [location] = useLocation();

  // Fetch cart items to show cart badge count
  const { data: cartItems } = useQuery<CartItemWithProduct[]>({
    queryKey: ['/api/cart'],
  });

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

  // Close mobile menu when changing pages
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location]);

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
              <NavLink href="/" label="Home" />
              <NavLink href="/shop" label="Shop" />
              <NavLink href="/about" label="About" />
              <NavLink href="/contact" label="Contact" />
            </nav>
          </div>
          
          {/* Action Buttons */}
          <div className="flex items-center space-x-4">
            <button 
              className="p-2 hover:text-primary transition-colors" 
              aria-label="Search"
            >
              <i className="bx bx-search text-xl"></i>
            </button>
            
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
              <NavLink href="/" label="Home" />
              <NavLink href="/shop" label="Shop" />
              <NavLink href="/about" label="About" />
              <NavLink href="/contact" label="Contact" />
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
