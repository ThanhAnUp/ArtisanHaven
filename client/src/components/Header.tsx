import React, { useState, useEffect, useRef } from "react";
import { Link, useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import type { CartItemWithProduct } from "@shared/schema";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const Header = () => {
  // State để quản lý giao diện và dữ liệu
  const [isScrolled, setIsScrolled] = useState(false); // Kiểm tra cuộn trang
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false); // Mở/đóng menu di động
  const [isSearchOpen, setIsSearchOpen] = useState(false); // Mở/đóng ô tìm kiếm
  const [searchQuery, setSearchQuery] = useState(""); // Giá trị ô tìm kiếm
  const searchInputRef = useRef<HTMLInputElement>(null); // Ref cho input tìm kiếm
  const [location, setLocation] = useLocation(); // Quản lý điều hướng

  // Lấy dữ liệu giỏ hàng từ API
  const { data: cartItems, refetch: refetchCart } = useQuery<
    CartItemWithProduct[]
  >({
    queryKey: ["/api/cart"],
  });

  // Cập nhật giỏ hàng định kỳ (mỗi 3 giây)
  useEffect(() => {
    const interval = setInterval(() => {
      refetchCart();
    }, 3000);
    return () => clearInterval(interval);
  }, [refetchCart]);

  // Tính tổng số lượng sản phẩm trong giỏ hàng
  const cartItemCount =
    cartItems?.reduce((count, item) => count + item.quantity, 0) || 0;

  // Mở/đóng sidebar giỏ hàng
  const toggleCart = () => {
    window.dispatchEvent(new CustomEvent("toggle-cart"));
  };

  // Thêm hiệu ứng shadow khi cuộn trang
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Đóng menu di động và ô tìm kiếm khi chuyển trang
  useEffect(() => {
    setIsMobileMenuOpen(false);
    setIsSearchOpen(false);
  }, [location]);

  // Đóng ô tìm kiếm khi nhấp ra ngoài
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        isSearchOpen &&
        searchInputRef.current &&
        !searchInputRef.current.contains(event.target as Node) &&
        !(event.target as Element).closest("button")
      ) {
        setIsSearchOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isSearchOpen]);

  return (
    <header
      className={`sticky top-0 z-50 bg-white ${isScrolled ? "shadow-md" : "shadow-sm"} transition-shadow`}
    >
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Logo và điều hướng desktop */}
          <div className="flex items-center space-x-10">
            <Link href="/">
              <a className="text-2xl font-heading font-bold text-primary">
                Artisan Haven
              </a>
            </Link>
            <nav className="hidden md:flex space-x-6">
              <NavLink href="/" label="Trang chủ" />
              <NavLink href="/shop" label="Cửa hàng" />
              <NavLink href="/about" label="Giới thiệu" />
              <NavLink href="/contact" label="Liên hệ" />
            </nav>
          </div>

          {/* Các nút hành động */}
          <div className="flex items-center space-x-4">
            {/* Nút tìm kiếm */}
            <div className="relative">
              <button
                className="p-2 hover:text-primary transition-colors"
                aria-label="Search"
                onClick={() => {
                  setIsSearchOpen(!isSearchOpen);
                  if (!isSearchOpen) {
                    setTimeout(() => searchInputRef.current?.focus(), 100);
                  }
                }}
              >
                <i className="bx bx-search text-xl"></i>
              </button>
              {isSearchOpen && (
                <div className="absolute right-0 top-full mt-2 w-64 md:w-80 bg-white shadow-lg rounded-md p-3 z-50">
                  <form
                    className="flex items-center gap-2"
                    onSubmit={(e) => {
                      e.preventDefault();
                      if (searchQuery.trim()) {
                        setLocation(
                          `/shop?q=${encodeURIComponent(searchQuery)}`,
                        );
                        setIsSearchOpen(false);
                        setSearchQuery("");
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
                    <Button
                      type="submit"
                      size="sm"
                      className="bg-primary hover:bg-primary/90"
                    >
                      <i className="bx bx-search text-sm"></i>
                    </Button>
                  </form>
                </div>
              )}
            </div>

            {/* Nút tài khoản */}
            <Link href="/checkout">
              <a className="p-2 hover:text-primary transition-colors">
                <i className="bx bx-user text-xl"></i>
              </a>
            </Link>

            {/* Nút giỏ hàng */}
            <button
              className="p-2 hover:text-primary transition-colors relative"
              onClick={toggleCart}
              aria-label="Cart"
            >
              <i className="bx bx-shopping-bag text-xl"></i>
              {cartItemCount > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-primary text-white text-xs flex items-center justify-center">
                  {cartItemCount}
                </span>
              )}
            </button>

            {/* Nút menu di động */}
            <button
              className="md:hidden p-2 hover:text-primary transition-colors"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              aria-label="Menu"
            >
              <i
                className={`bx ${isMobileMenuOpen ? "bx-x" : "bx-menu"} text-xl`}
              ></i>
            </button>
          </div>
        </div>

        {/* Menu di động */}
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

// Component NavLink để định dạng liên kết điều hướng
const NavLink = ({ href, label }: { href: string; label: string }) => {
  const [location] = useLocation();
  const isActive = location === href;

  return (
    <Link href={href}>
      <a
        className={`text-sm font-medium transition-colors ${isActive ? "text-primary" : "hover:text-primary"}`}
      >
        {label}
      </a>
    </Link>
  );
};

export default Header;
