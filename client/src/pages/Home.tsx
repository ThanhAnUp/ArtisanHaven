import React from 'react';
import { Link } from 'wouter';
import { Button } from '@/components/ui/button';
import { useQuery } from '@tanstack/react-query';
import { Skeleton } from '@/components/ui/skeleton';
import ProductCard from '@/components/ProductCard';
import type { Product, Workshop } from '@shared/schema';

const Home = () => {
  // Fetch featured products
  const { data: featuredProducts, isLoading: isLoadingProducts } = useQuery<Product[]>({
    queryKey: ['/api/products/featured'],
  });

  // Fetch workshops
  const { data: workshops, isLoading: isLoadingWorkshops } = useQuery<Workshop[]>({
    queryKey: ['/api/workshops'],
  });

  return (
    <>
      {/* Hero Section */}
      <section className="relative bg-secondary overflow-hidden">
        <div className="container mx-auto px-4 py-16 md:py-24 flex flex-col md:flex-row items-center">
          <div className="md:w-1/2 z-10">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-heading font-semibold mb-4 leading-tight">
              Handcrafted with Love and Care
            </h1>
            <p className="text-lg mb-8 max-w-lg">
              Discover unique, artisan-made products crafted by skilled makers from around the world.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Button 
                size="lg" 
                className="bg-primary hover:bg-primary/90 text-white font-accent"
                asChild
              >
                <Link href="/shop">Shop Now</Link>
              </Button>
              <Button 
                size="lg" 
                variant="outline" 
                className="border-primary text-primary hover:bg-primary hover:text-white font-accent"
                asChild
              >
                <Link href="/about">Our Story</Link>
              </Button>
            </div>
          </div>
          <div className="md:w-1/2 mt-10 md:mt-0">
            <img 
              src="https://images.unsplash.com/photo-1562157873-818bc0726f68?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80" 
              alt="Handmade crafts display" 
              className="w-full h-auto rounded-lg shadow-lg object-cover"
            />
          </div>
        </div>
      </section>

      {/* Featured Categories */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-heading font-semibold text-center mb-12">Shop by Category</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
            <CategoryCard
              title="Jewelry"
              imageUrl="https://images.unsplash.com/photo-1556760544-74068565f05c?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80"
              link="/shop?category=jewelry"
            />
            <CategoryCard
              title="Home Decor"
              imageUrl="https://images.unsplash.com/photo-1616046229478-9901c5536a45?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80"
              link="/shop?category=home_decor"
            />
            <CategoryCard
              title="Ceramics"
              imageUrl="https://images.unsplash.com/photo-1603969214776-3ec2683f048e?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80"
              link="/shop?category=ceramics"
            />
            <CategoryCard
              title="Textiles"
              imageUrl="https://images.unsplash.com/photo-1544967082-d9d25d867d66?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80"
              link="/shop?category=textiles"
            />
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-16 bg-neutral-light">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-10">
            <h2 className="text-3xl font-heading font-semibold mb-4 md:mb-0">Featured Products</h2>
            <div className="flex flex-wrap gap-2">
              <Link href="/shop">
                <Button className="bg-primary hover:bg-primary/90 text-white">
                  View All
                </Button>
              </Link>
            </div>
          </div>

          {isLoadingProducts ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-12">
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
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-12">
              {featuredProducts?.slice(0, 8).map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}

          <div className="text-center">
            <Button 
              variant="outline" 
              size="lg"
              className="border-primary text-primary hover:bg-primary hover:text-white font-accent"
              asChild
            >
              <Link href="/shop">View All Products</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Artisan Story Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center gap-10">
            <div className="md:w-1/2">
              <img 
                src="https://images.unsplash.com/photo-1556760544-b790f2be79ca?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80" 
                alt="Artisan crafting jewelry" 
                className="w-full h-auto rounded-lg shadow-lg"
              />
            </div>
            <div className="md:w-1/2">
              <h2 className="text-3xl font-heading font-semibold mb-4">The Story Behind Our Artisans</h2>
              <p className="text-lg mb-6">
                We partner with skilled artisans from around the world who pour their heart and soul into every piece they create. 
                Each item tells a story of tradition, innovation, and exceptional craftsmanship.
              </p>
              <p className="mb-8">
                Our mission is to support these talented makers by bringing their unique creations to a global audience 
                while ensuring they receive fair compensation for their work. When you purchase from Artisan Haven, 
                you're not just buying a product – you're supporting a sustainable livelihood and helping preserve traditional crafts.
              </p>
              <Button 
                size="lg"
                className="bg-primary hover:bg-primary/90 text-white font-accent"
                asChild
              >
                <Link href="/about">Meet Our Artisans</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Workshop Section */}
      <section className="py-16 bg-secondary">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-heading font-semibold mb-4">Join Our Workshops</h2>
            <p className="max-w-2xl mx-auto">
              Learn directly from our skilled artisans in hands-on workshops. Discover traditional techniques and create your own handmade treasures.
            </p>
          </div>

          {isLoadingWorkshops ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {Array.from({ length: 2 }).map((_, index) => (
                <div key={index} className="bg-white rounded-lg shadow-md overflow-hidden">
                  <Skeleton className="w-full h-64" />
                  <div className="p-6">
                    <div className="flex items-center mb-4">
                      <Skeleton className="h-6 w-20 rounded-full" />
                      <Skeleton className="ml-3 h-4 w-24" />
                    </div>
                    <Skeleton className="h-8 w-3/4 mb-2" />
                    <Skeleton className="h-4 w-full mb-4" />
                    <Skeleton className="h-4 w-full mb-4" />
                    <div className="flex items-center justify-between">
                      <Skeleton className="h-6 w-24" />
                      <Skeleton className="h-10 w-24 rounded" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {workshops?.slice(0, 2).map((workshop) => (
                <div key={workshop.id} className="bg-white rounded-lg shadow-md overflow-hidden">
                  <img 
                    src={workshop.imageUrl} 
                    alt={workshop.title} 
                    className="w-full h-64 object-cover"
                  />
                  <div className="p-6">
                    <div className="flex items-center mb-4">
                      <span className="bg-accent text-white text-xs px-3 py-1 rounded-full">
                        {workshop.category === 'ceramics' ? 'Ceramics' : 'Jewelry'}
                      </span>
                      <span className="ml-3 text-sm text-neutral-dark">
                        {new Date(workshop.date).toLocaleDateString()}
                      </span>
                    </div>
                    <h3 className="text-xl font-heading font-medium mb-2">{workshop.title}</h3>
                    <p className="mb-4">{workshop.description}</p>
                    <div className="flex items-center justify-between">
                      <span className="font-accent font-semibold">${Number(workshop.price).toFixed(2)} per person</span>
                      <Button size="sm" className="bg-primary hover:bg-primary/90 text-white">
                        Reserve Spot
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="text-center mt-10">
            <Button 
              variant="outline" 
              size="lg"
              className="border-primary text-primary hover:bg-primary hover:text-white font-accent"
            >
              View All Workshops
            </Button>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-heading font-semibold text-center mb-12">What Our Customers Say</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <TestimonialCard
              name="Sarah J."
              location="Los Angeles, CA"
              image="https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&auto=format&fit=crop&w=100&q=80"
              rating={5}
              comment="The ceramic bowls I purchased are absolutely stunning. The craftsmanship is exceptional, and I love knowing that I'm supporting skilled artisans. Will definitely shop here again!"
            />
            <TestimonialCard
              name="Michael T."
              location="Chicago, IL"
              image="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?ixlib=rb-1.2.1&auto=format&fit=crop&w=100&q=80"
              rating={5}
              comment="I bought a macrame wall hanging as a gift for my sister, and she absolutely loves it! The quality is amazing, and it looks even better in person than in the photos. Shipping was fast too!"
            />
            <TestimonialCard
              name="Emily R."
              location="Portland, OR"
              image="https://images.unsplash.com/photo-1580489944761-15a19d654956?ixlib=rb-1.2.1&auto=format&fit=crop&w=100&q=80"
              rating={4}
              comment="The silver earrings I purchased are now my favorite piece of jewelry. The design is unique and the quality is outstanding. I've received so many compliments on them. Highly recommend!"
            />
          </div>
        </div>
      </section>
    </>
  );
};

// Category Card Component
const CategoryCard = ({ title, imageUrl, link }: { title: string; imageUrl: string; link: string }) => (
  <Link href={link}>
    <a className="group relative overflow-hidden rounded-lg h-40 md:h-60 block">
      <img 
        src={imageUrl} 
        alt={title} 
        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
      />
      <div className="absolute inset-0 bg-neutral-dark bg-opacity-30 flex items-center justify-center">
        <h3 className="text-white font-heading text-lg md:text-xl font-medium">{title}</h3>
      </div>
    </a>
  </Link>
);

// Testimonial Card Component
const TestimonialCard = ({ 
  name, location, image, rating, comment 
}: { 
  name: string; 
  location: string; 
  image: string; 
  rating: number; 
  comment: string; 
}) => (
  <div className="bg-neutral-light p-6 rounded-lg">
    <div className="flex text-yellow-400 mb-4">
      {Array.from({ length: rating }).map((_, i) => (
        <i key={i} className="bx bxs-star"></i>
      ))}
      {Array.from({ length: 5 - rating }).map((_, i) => (
        <i key={i} className="bx bx-star"></i>
      ))}
    </div>
    <p className="italic mb-6">{comment}</p>
    <div className="flex items-center">
      <div className="w-12 h-12 rounded-full overflow-hidden mr-4">
        <img src={image} alt={name} className="w-full h-full object-cover" />
      </div>
      <div>
        <h4 className="font-medium">{name}</h4>
        <p className="text-sm">{location}</p>
      </div>
    </div>
  </div>
);

export default Home;
