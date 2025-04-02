import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useLocation } from 'wouter';
import ProductCard from '@/components/ProductCard';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import type { Product } from '@shared/schema';

const Shop = () => {
  // Get the current location to parse URL params
  const [location, setLocation] = useLocation();
  
  // Parse URL parameters
  const getUrlParams = () => {
    if (!location.includes('?')) return { category: null, q: null };
    
    const params = new URLSearchParams(location.split('?')[1]);
    return {
      category: params.get('category'),
      q: params.get('q')
    };
  };
  
  // Basic state
  const urlParams = getUrlParams();
  const [activeCategory, setActiveCategory] = useState(urlParams.category || 'all');
  const [searchTerm, setSearchTerm] = useState(urlParams.q || '');
  const [isSearching, setIsSearching] = useState(!!urlParams.q);
  
  // Update states when URL changes
  useEffect(() => {
    const params = getUrlParams();
    if (params.q) {
      setSearchTerm(params.q);
      setIsSearching(true);
      setActiveCategory('all');
      
      // Log cho debug
      console.log('Đã nhận từ khóa tìm kiếm từ URL:', params.q);
    } else if (params.category) {
      setActiveCategory(params.category);
      setIsSearching(false);
      setSearchTerm('');
    } else {
      setActiveCategory('all');
      setIsSearching(false);
      setSearchTerm('');
    }
  }, [location]);

  // Fetch all products
  const { data: allProducts, isLoading } = useQuery<Product[]>({
    queryKey: ['/api/products'],
  });

  // Fetch products by category when filter is applied
  const { data: filteredProducts, isLoading: isLoadingFiltered } = useQuery<Product[]>({
    queryKey: ['/api/products/category', activeCategory],
    queryFn: async () => {
      const res = await fetch(`/api/products/category/${activeCategory}`);
      if (!res.ok) throw new Error('Không thể tải danh mục sản phẩm');
      return res.json();
    },
    enabled: activeCategory !== 'all',
  });

  // Fetch products by search term
  const encodedSearchTerm = encodeURIComponent(searchTerm);
  
  // Debug log
  useEffect(() => {
    if (isSearching && searchTerm) {
      console.log('Đang gửi yêu cầu tìm kiếm:', searchTerm);
    }
  }, [isSearching, searchTerm]);
  
  const { data: searchResults, isLoading: isLoadingSearch } = useQuery<Product[]>({
    queryKey: ['/api/products/search', searchTerm],
    queryFn: async () => {
      console.log('Gọi API tìm kiếm với từ khóa:', searchTerm);
      const res = await fetch(`/api/products/search?q=${encodedSearchTerm}`);
      if (!res.ok) throw new Error('Không thể tìm kiếm sản phẩm');
      const data = await res.json();
      console.log('Kết quả tìm kiếm:', data);
      return data;
    },
    enabled: isSearching && searchTerm.length > 0,
    refetchOnWindowFocus: false,
    retry: 1
  });

  // Handle category filter change
  const handleCategoryChange = (category: string) => {
    console.log('Đang chuyển đổi danh mục sang:', category);
    setActiveCategory(category);
    setIsSearching(false);
    setSearchTerm('');
    
    // Update URL with the category
    if (category === 'all') {
      setLocation('/shop');
    } else {
      // Gọi trực tiếp API cho danh mục để đảm bảo dữ liệu được tải
      setTimeout(() => {
        fetch(`/api/products/category/${category}`)
          .then(res => {
            if (!res.ok) throw new Error('Lỗi lấy danh mục');
            return res.json();
          })
          .then(data => {
            console.log('Kết quả danh mục trực tiếp:', data);
          })
          .catch(err => {
            console.error('Lỗi khi lấy danh mục:', err);
          });
      }, 100);
      
      setLocation(`/shop?category=${category}`);
    }
  };

  // Handle search - import queryClient nếu cần
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      setIsSearching(true);
      
      // Đặt một timeout để đảm bảo state được cập nhật trước khi API được gọi
      setTimeout(() => {
        // Gọi API một cách trực tiếp bên cạnh việc cập nhật URL
        fetch(`/api/products/search?q=${encodeURIComponent(searchTerm)}`)
          .then(res => {
            if (!res.ok) throw new Error('Lỗi tìm kiếm');
            return res.json();
          })
          .then(data => {
            console.log('Kết quả tìm kiếm trực tiếp:', data);
          })
          .catch(err => {
            console.error('Lỗi khi tìm kiếm:', err);
          });
      }, 100);
      
      setLocation(`/shop?q=${encodeURIComponent(searchTerm)}`);
    }
  };

  // Reset search
  const resetSearch = () => {
    console.log('Đang reset tìm kiếm và quay về trang tất cả sản phẩm');
    setSearchTerm('');
    setIsSearching(false);
    setLocation('/shop');
    
    // Tải lại trang để đảm bảo trạng thái được làm mới
    setTimeout(() => {
      window.location.href = '/shop';
    }, 100);
  };

  // Determine which products to display
  const productsToDisplay = isSearching 
    ? searchResults 
    : activeCategory === 'all' 
      ? allProducts 
      : filteredProducts;

  // Loading state
  const isLoadingProducts = isLoading || 
    (activeCategory !== 'all' && isLoadingFiltered) || 
    (isSearching && isLoadingSearch);

  return (
    <div className="py-10 bg-neutral-light min-h-screen">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-heading font-semibold mb-2">Bộ Sưu Tập Sản Phẩm</h1>
          <p className="text-muted-foreground">
            Khám phá những sản phẩm thủ công tinh tế được làm bằng tình yêu và kỹ thuật điêu luyện
          </p>
        </div>

        {/* Search and Filters */}
        <div className="mb-10 bg-white p-6 rounded-lg shadow-sm">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            {/* Search Form */}
            <form 
              onSubmit={handleSearch} 
              className="flex w-full md:w-auto"
            >
              <div className="relative flex-1">
                <input
                  type="text"
                  placeholder="Tìm kiếm sản phẩm..."
                  className="pl-10 pr-4 py-2 w-full border border-border rounded-l focus:outline-none focus:ring-1 focus:ring-primary"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                <i className="bx bx-search absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground"></i>
                {searchTerm && (
                  <button
                    type="button"
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-primary"
                    onClick={resetSearch}
                  >
                    <i className="bx bx-x"></i>
                  </button>
                )}
              </div>
              <Button 
                type="submit" 
                className="rounded-l-none bg-primary hover:bg-primary/90"
              >
                Tìm kiếm
              </Button>
            </form>

            {/* Category Filters */}
            <div className="flex flex-wrap gap-2">
              <CategoryButton 
                category="all" 
                active={activeCategory === 'all'} 
                onClick={() => handleCategoryChange('all')}
              >
                Tất cả
              </CategoryButton>
              <CategoryButton 
                category="jewelry" 
                active={activeCategory === 'jewelry'} 
                onClick={() => handleCategoryChange('jewelry')}
              >
                Trang sức
              </CategoryButton>
              <CategoryButton 
                category="home_decor" 
                active={activeCategory === 'home_decor'} 
                onClick={() => handleCategoryChange('home_decor')}
              >
                Trang trí nhà
              </CategoryButton>
              <CategoryButton 
                category="ceramics" 
                active={activeCategory === 'ceramics'} 
                onClick={() => handleCategoryChange('ceramics')}
              >
                Gốm sứ
              </CategoryButton>
              <CategoryButton 
                category="textiles" 
                active={activeCategory === 'textiles'} 
                onClick={() => handleCategoryChange('textiles')}
              >
                Dệt may
              </CategoryButton>
            </div>
          </div>
        </div>

        {/* Products Grid */}
        {isLoadingProducts ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {Array.from({ length: 8 }).map((_, index) => (
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
        ) : productsToDisplay && productsToDisplay.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {productsToDisplay.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <div className="text-5xl mb-4">
              <i className="bx bx-search"></i>
            </div>
            <h3 className="text-2xl font-medium mb-2">Không tìm thấy sản phẩm</h3>
            <p className="text-muted-foreground mb-6">
              {isSearching 
                ? `Không tìm thấy sản phẩm nào khớp với từ khóa "${searchTerm}"`
                : `Không có sản phẩm nào trong danh mục này`}
            </p>
            <Button 
              onClick={isSearching ? resetSearch : () => handleCategoryChange('all')} 
              className="bg-primary hover:bg-primary/90"
            >
              {isSearching ? 'Xóa tìm kiếm' : 'Xem tất cả sản phẩm'}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

// Category Button Component
interface CategoryButtonProps {
  category: string;
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}

const CategoryButton = ({ category, active, onClick, children }: CategoryButtonProps) => (
  <button
    onClick={onClick}
    className={`px-4 py-2 text-sm font-medium rounded transition-colors ${
      active 
        ? 'bg-primary text-white' 
        : 'bg-white hover:bg-primary hover:text-white'
    }`}
  >
    {children}
  </button>
);

export default Shop;
