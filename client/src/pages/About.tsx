import React from 'react';
import { Button } from '@/components/ui/button';
import { Link } from 'wouter';

const About = () => {
  return (
    <div className="bg-neutral-light">
      {/* Hero Section */}
      <section className="bg-secondary py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-heading font-semibold mb-6">Our Story</h1>
            <p className="text-lg">
              Artisan Haven was founded with a passion for preserving traditional craftsmanship and 
              connecting skilled artisans with people who appreciate handcrafted quality.
            </p>
          </div>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center gap-12">
            <div className="md:w-1/2 order-2 md:order-1">
              <h2 className="text-3xl font-heading font-semibold mb-6">Our Mission</h2>
              <p className="mb-4">
                At Artisan Haven, we believe in the power of handcrafted goods to bring beauty, 
                meaning, and connection to our lives. Our mission is to support independent 
                artisans by providing a platform where they can showcase their creations to a 
                global audience.
              </p>
              <p className="mb-4">
                We carefully select each maker based on their commitment to quality, 
                sustainability, and authentic craftsmanship. Every item in our collection tells 
                a story – of tradition, innovation, and the hands that crafted it.
              </p>
              <p>
                By choosing Artisan Haven, you're not just buying a product; you're supporting 
                a sustainable ecosystem that values fair trade, ethical practices, and the 
                preservation of traditional crafts for generations to come.
              </p>
            </div>
            <div className="md:w-1/2 order-1 md:order-2">
              <img 
                src="https://images.unsplash.com/photo-1591195853828-11db59a44f6b?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80"
                alt="Artisan crafting a piece" 
                className="rounded-lg shadow-lg w-full h-auto"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-heading font-semibold text-center mb-12">Our Values</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-neutral-light p-8 rounded-lg">
              <div className="text-primary text-4xl mb-4">
                <i className="bx bx-bulb"></i>
              </div>
              <h3 className="text-xl font-heading font-medium mb-4">Authentic Craftsmanship</h3>
              <p>
                We celebrate the beauty of handmade goods and the skilled artisans who create them. Each piece 
                tells a story of tradition, innovation, and human connection.
              </p>
            </div>
            <div className="bg-neutral-light p-8 rounded-lg">
              <div className="text-primary text-4xl mb-4">
                <i className="bx bx-world"></i>
              </div>
              <h3 className="text-xl font-heading font-medium mb-4">Ethical Practices</h3>
              <p>
                We ensure fair compensation for all artisans and promote sustainable, environmentally 
                responsible methods in the creation and delivery of our products.
              </p>
            </div>
            <div className="bg-neutral-light p-8 rounded-lg">
              <div className="text-primary text-4xl mb-4">
                <i className="bx bx-heart"></i>
              </div>
              <h3 className="text-xl font-heading font-medium mb-4">Community Impact</h3>
              <p>
                We believe in the power of handcrafted goods to transform communities, preserve cultural 
                heritage, and create meaningful livelihoods around the world.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-heading font-semibold text-center mb-12">Meet Our Team</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="mb-6 relative inline-block">
                <img 
                  src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?ixlib=rb-1.2.1&auto=format&fit=crop&w=400&q=80" 
                  alt="Sarah Johnson" 
                  className="w-48 h-48 rounded-full object-cover mx-auto"
                />
              </div>
              <h3 className="text-xl font-heading font-medium">Sarah Johnson</h3>
              <p className="text-accent mb-3">Founder & Creative Director</p>
              <p className="text-sm text-muted-foreground">
                With a background in fine arts and a passion for traditional crafts, Sarah founded 
                Artisan Haven to bridge the gap between talented artisans and conscious consumers.
              </p>
            </div>
            <div className="text-center">
              <div className="mb-6 relative inline-block">
                <img 
                  src="https://images.unsplash.com/photo-1531384441138-2736e62e0919?ixlib=rb-1.2.1&auto=format&fit=crop&w=400&q=80" 
                  alt="Michael Rodriguez" 
                  className="w-48 h-48 rounded-full object-cover mx-auto"
                />
              </div>
              <h3 className="text-xl font-heading font-medium">Michael Rodriguez</h3>
              <p className="text-accent mb-3">Head of Artisan Relations</p>
              <p className="text-sm text-muted-foreground">
                Michael travels the world to discover talented artisans and works closely with them 
                to bring their unique creations to our marketplace.
              </p>
            </div>
            <div className="text-center">
              <div className="mb-6 relative inline-block">
                <img 
                  src="https://images.unsplash.com/photo-1581992652564-44c42f5ad3ad?ixlib=rb-1.2.1&auto=format&fit=crop&w=400&q=80" 
                  alt="Emily Chen" 
                  className="w-48 h-48 rounded-full object-cover mx-auto"
                />
              </div>
              <h3 className="text-xl font-heading font-medium">Emily Chen</h3>
              <p className="text-accent mb-3">Sustainability Manager</p>
              <p className="text-sm text-muted-foreground">
                Emily ensures our operations align with our commitment to environmental sustainability 
                and ethical business practices.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Process Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-heading font-semibold text-center mb-12">Our Process</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="bg-secondary h-20 w-20 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-primary text-2xl font-accent font-bold">01</span>
              </div>
              <h3 className="text-lg font-medium mb-2">Artisan Selection</h3>
              <p className="text-sm text-muted-foreground">
                We carefully select artisans based on their skill, creativity, and commitment to quality.
              </p>
            </div>
            <div className="text-center">
              <div className="bg-secondary h-20 w-20 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-primary text-2xl font-accent font-bold">02</span>
              </div>
              <h3 className="text-lg font-medium mb-2">Product Curation</h3>
              <p className="text-sm text-muted-foreground">
                Each item is thoughtfully curated to ensure it meets our standards for quality and design.
              </p>
            </div>
            <div className="text-center">
              <div className="bg-secondary h-20 w-20 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-primary text-2xl font-accent font-bold">03</span>
              </div>
              <h3 className="text-lg font-medium mb-2">Quality Assurance</h3>
              <p className="text-sm text-muted-foreground">
                We inspect all products to ensure they meet our high standards before reaching our customers.
              </p>
            </div>
            <div className="text-center">
              <div className="bg-secondary h-20 w-20 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-primary text-2xl font-accent font-bold">04</span>
              </div>
              <h3 className="text-lg font-medium mb-2">Sustainable Delivery</h3>
              <p className="text-sm text-muted-foreground">
                Products are carefully packaged using eco-friendly materials and shipped to your doorstep.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-secondary">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-heading font-semibold mb-6">Join Our Community</h2>
          <p className="max-w-2xl mx-auto mb-8">
            Discover the beauty of handcrafted treasures and support skilled artisans from around the world.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              size="lg" 
              className="bg-primary hover:bg-primary/90 text-white font-accent"
              asChild
            >
              <Link href="/shop">Shop Our Collection</Link>
            </Button>
            <Button 
              size="lg" 
              variant="outline" 
              className="border-primary text-primary hover:bg-primary hover:text-white font-accent"
              asChild
            >
              <Link href="/contact">Contact Us</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default About;
