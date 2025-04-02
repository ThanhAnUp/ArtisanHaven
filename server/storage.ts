import { 
  type Product, 
  type InsertProduct, 
  type Review,
  type InsertReview,
  type CartItem,
  type InsertCartItem,
  type CartItemWithProduct,
  type Workshop,
  type InsertWorkshop,
  type Order,
  type InsertOrder,
  type OrderItem,
  type InsertOrderItem,
  type Newsletter,
  type InsertNewsletter,
  type Contact,
  type InsertContact,
  type OrderWithItems
} from "@shared/schema";

export interface IStorage {
  // Product operations
  getProducts(): Promise<Product[]>;
  getProductById(id: number): Promise<Product | undefined>;
  getFeaturedProducts(): Promise<Product[]>;
  getProductsByCategory(category: string): Promise<Product[]>;
  searchProducts(query: string): Promise<Product[]>;
  createProduct(product: InsertProduct): Promise<Product>;
  
  // Review operations
  getReviewsByProductId(productId: number): Promise<Review[]>;
  createReview(review: InsertReview): Promise<Review>;
  
  // Cart operations
  getCartItemsBySessionId(sessionId: string): Promise<CartItemWithProduct[]>;
  getCartItemById(id: number): Promise<CartItem | undefined>;
  createCartItem(cartItem: InsertCartItem): Promise<CartItem>;
  updateCartItemQuantity(id: number, quantity: number): Promise<CartItem | undefined>;
  deleteCartItem(id: number): Promise<boolean>;
  clearCart(sessionId: string): Promise<boolean>;
  
  // Workshop operations
  getWorkshops(): Promise<Workshop[]>;
  getWorkshopById(id: number): Promise<Workshop | undefined>;
  createWorkshop(workshop: InsertWorkshop): Promise<Workshop>;
  
  // Order operations
  createOrder(order: InsertOrder, items: InsertOrderItem[]): Promise<Order>;
  updateOrderWithItems(orderId: number, items: InsertOrderItem[]): Promise<Order>;
  getOrderById(id: number): Promise<OrderWithItems | undefined>;
  getOrdersBySessionId(sessionId: string): Promise<Order[]>;
  
  // Newsletter operations
  subscribeToNewsletter(newsletter: InsertNewsletter): Promise<Newsletter>;
  
  // Contact form operations
  submitContactForm(contact: InsertContact): Promise<Contact>;
}

export class MemStorage implements IStorage {
  private products: Map<number, Product>;
  private reviews: Map<number, Review>;
  private cartItems: Map<number, CartItem>;
  private workshops: Map<number, Workshop>;
  private orders: Map<number, Order>;
  private orderItems: Map<number, OrderItem>;
  private newsletterSubscriptions: Map<number, Newsletter>;
  private contactSubmissions: Map<number, Contact>;
  
  currentProductId: number;
  currentReviewId: number;
  currentCartItemId: number;
  currentWorkshopId: number;
  currentOrderId: number;
  currentOrderItemId: number;
  currentNewsletterId: number;
  currentContactId: number;

  constructor() {
    this.products = new Map();
    this.reviews = new Map();
    this.cartItems = new Map();
    this.workshops = new Map();
    this.orders = new Map();
    this.orderItems = new Map();
    this.newsletterSubscriptions = new Map();
    this.contactSubmissions = new Map();
    
    this.currentProductId = 1;
    this.currentReviewId = 1;
    this.currentCartItemId = 1;
    this.currentWorkshopId = 1;
    this.currentOrderId = 1;
    this.currentOrderItemId = 1;
    this.currentNewsletterId = 1;
    this.currentContactId = 1;
    
    // Initialize with some sample products
    this.initializeProducts();
    this.initializeWorkshops();
    this.initializeReviews();
  }

  // Initialize with demo products
  private initializeProducts() {
    const sampleProducts: InsertProduct[] = [
      {
        name: "Handcrafted Gold Necklace",
        description: "Elegantly designed gold necklace handcrafted with precision and care. This stunning piece features delicate links and a subtle pendant that catches the light beautifully.",
        price: "89.00",
        imageUrl: "https://images.unsplash.com/photo-1600721391776-b5cd0e0048f9?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80",
        category: "jewelry",
        inStock: true,
        featured: true,
        rating: "4.5",
        reviewCount: 24
      },
      {
        name: "Macrame Wall Hanging",
        description: "Beautiful handwoven macrame wall hanging that adds texture and warmth to any space. Made from 100% cotton rope with natural wooden beads.",
        price: "65.00",
        imageUrl: "https://images.unsplash.com/photo-1583847268964-b28dc8f51f92?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80",
        category: "home_decor",
        inStock: true,
        featured: true,
        rating: "5.0",
        reviewCount: 18
      },
      {
        name: "Handmade Ceramic Bowl Set",
        description: "Set of four uniquely crafted ceramic bowls perfect for everyday use or special occasions. Each bowl features a beautiful reactive glaze that makes it one-of-a-kind.",
        price: "120.00",
        imageUrl: "https://images.unsplash.com/photo-1610701596061-2ecf227e85b2?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80",
        category: "ceramics",
        inStock: true,
        featured: true,
        rating: "4.0",
        reviewCount: 12
      },
      {
        name: "Artisan Silver Earrings",
        description: "Elegantly designed silver earrings handcrafted with precision. These lightweight earrings feature a modern design that complements any outfit.",
        price: "45.00",
        imageUrl: "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80",
        category: "jewelry",
        inStock: true,
        featured: true,
        rating: "3.5",
        reviewCount: 9
      },
      {
        name: "Handwoven Basket",
        description: "Beautifully handwoven storage basket made from natural seagrass. Perfect for organizing your home while adding a touch of artisanal charm.",
        price: "79.00",
        imageUrl: "https://images.unsplash.com/photo-1489533119213-66a5cd877091?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80",
        category: "home_decor",
        inStock: true,
        featured: true,
        rating: "5.0",
        reviewCount: 32
      },
      {
        name: "Ceramic Flower Vase",
        description: "Handcrafted ceramic vase with a unique organic shape and matte finish. Perfect for displaying fresh or dried flower arrangements.",
        price: "55.00",
        imageUrl: "https://images.unsplash.com/photo-1576020799627-aeac74d58064?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80",
        category: "ceramics",
        inStock: true,
        featured: true,
        rating: "3.5",
        reviewCount: 7
      },
      {
        name: "Handmade Wooden Bracelet",
        description: "Stylish wooden bracelet handcrafted from sustainable materials. Features a comfortable elastic band that fits most wrist sizes.",
        price: "39.00",
        imageUrl: "https://images.unsplash.com/photo-1608343288140-5ec0fc5b6010?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80",
        category: "jewelry",
        inStock: true,
        featured: true,
        rating: "4.0",
        reviewCount: 15
      },
      {
        name: "Hand-painted Throw Pillow",
        description: "Unique throw pillow with a hand-painted design on 100% linen. Adds an artistic touch to any sofa or bed.",
        price: "48.00",
        imageUrl: "https://images.unsplash.com/photo-1517705008128-361805f42e86?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80",
        category: "home_decor",
        inStock: true,
        featured: true,
        rating: "4.0",
        reviewCount: 21
      },
      {
        name: "Beaded Statement Necklace",
        description: "Bold statement necklace featuring handcrafted clay beads in earthy tones. Each piece is unique and makes a striking accessory.",
        price: "95.00",
        imageUrl: "https://images.unsplash.com/photo-1630019852942-f89202989a59?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80",
        category: "jewelry",
        inStock: true,
        featured: false,
        rating: "4.0",
        reviewCount: 16
      },
      {
        name: "Handwoven Wall Tapestry",
        description: "Intricately woven wall tapestry made from natural fibers. A stunning focal point for any room.",
        price: "140.00",
        imageUrl: "https://images.unsplash.com/photo-1615529328331-f8917597711f?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80",
        category: "textiles",
        inStock: true,
        featured: false,
        rating: "4.5",
        reviewCount: 7
      },
      {
        name: "Hand-Painted Ceramic Mug",
        description: "Uniquely designed ceramic mug, individually hand-painted by our artisans. Microwave and dishwasher safe.",
        price: "28.00",
        imageUrl: "https://images.unsplash.com/photo-1574311938562-789d16858154?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80",
        category: "ceramics",
        inStock: true,
        featured: false,
        rating: "4.0",
        reviewCount: 29
      },
      {
        name: "Handcrafted Leather Wallet",
        description: "Minimalist leather wallet handmade from premium full-grain leather. Features slots for cards and bills with beautiful hand stitching.",
        price: "65.00",
        imageUrl: "https://images.unsplash.com/photo-1627123424574-724758594e93?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80",
        category: "textiles",
        inStock: true,
        featured: false,
        rating: "4.5",
        reviewCount: 13
      }
    ];

    sampleProducts.forEach(product => {
      this.createProduct(product);
    });
  }

  private initializeWorkshops() {
    const sampleWorkshops: InsertWorkshop[] = [
      {
        title: "Ceramic Bowl Making Workshop",
        description: "Learn the art of hand-building ceramic bowls in this beginner-friendly workshop led by master potter Elena Rodriguez.",
        imageUrl: "https://images.unsplash.com/photo-1621600411688-4be93c2c1208?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
        category: "ceramics",
        date: new Date("2023-06-15T10:00:00Z"),
        price: "85",
        spotsAvailable: 10
      },
      {
        title: "Silver Jewelry Making Workshop",
        description: "Create your own sterling silver ring in this hands-on workshop taught by experienced jeweler Marcus Chen.",
        imageUrl: "https://images.unsplash.com/photo-1459411552884-841db9b3cc2a?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
        category: "jewelry",
        date: new Date("2023-07-08T14:00:00Z"),
        price: "120",
        spotsAvailable: 8
      }
    ];

    sampleWorkshops.forEach(workshop => {
      this.createWorkshop(workshop);
    });
  }

  private initializeReviews() {
    const sampleReviews: InsertReview[] = [
      {
        productId: 1,
        name: "Sarah J.",
        location: "Los Angeles, CA",
        rating: 5,
        comment: "The ceramic bowls I purchased are absolutely stunning. The craftsmanship is exceptional, and I love knowing that I'm supporting skilled artisans. Will definitely shop here again!"
      },
      {
        productId: 2,
        name: "Michael T.",
        location: "Chicago, IL",
        rating: 5,
        comment: "I bought a macrame wall hanging as a gift for my sister, and she absolutely loves it! The quality is amazing, and it looks even better in person than in the photos. Shipping was fast too!"
      },
      {
        productId: 4,
        name: "Emily R.",
        location: "Portland, OR",
        rating: 4,
        comment: "The silver earrings I purchased are now my favorite piece of jewelry. The design is unique and the quality is outstanding. I've received so many compliments on them. Highly recommend!"
      }
    ];

    sampleReviews.forEach(review => {
      this.createReview(review);
    });
  }

  async getProducts(): Promise<Product[]> {
    return Array.from(this.products.values());
  }

  async getProductById(id: number): Promise<Product | undefined> {
    return this.products.get(id);
  }

  async getFeaturedProducts(): Promise<Product[]> {
    return Array.from(this.products.values()).filter(product => product.featured);
  }

  async getProductsByCategory(category: string): Promise<Product[]> {
    return Array.from(this.products.values()).filter(
      product => product.category === category
    );
  }

  async searchProducts(query: string): Promise<Product[]> {
    const lowercaseQuery = query.toLowerCase();
    return Array.from(this.products.values()).filter(
      product => 
        product.name.toLowerCase().includes(lowercaseQuery) || 
        product.description.toLowerCase().includes(lowercaseQuery)
    );
  }

  async createProduct(product: InsertProduct): Promise<Product> {
    const id = this.currentProductId++;
    const newProduct: Product = { ...product, id };
    this.products.set(id, newProduct);
    return newProduct;
  }

  async getReviewsByProductId(productId: number): Promise<Review[]> {
    return Array.from(this.reviews.values()).filter(
      review => review.productId === productId
    );
  }

  async createReview(review: InsertReview): Promise<Review> {
    const id = this.currentReviewId++;
    const newReview: Review = { 
      ...review, 
      id, 
      createdAt: new Date() 
    };
    this.reviews.set(id, newReview);
    
    // Update product rating and review count
    const product = await this.getProductById(review.productId);
    if (product) {
      const reviews = await this.getReviewsByProductId(review.productId);
      const totalRating = reviews.reduce((sum, r) => sum + r.rating, 0);
      const avgRating = (totalRating / reviews.length).toFixed(1);
      
      const updatedProduct: Product = {
        ...product,
        rating: avgRating,
        reviewCount: reviews.length
      };
      
      this.products.set(product.id, updatedProduct);
    }
    
    return newReview;
  }

  async getCartItemsBySessionId(sessionId: string): Promise<CartItemWithProduct[]> {
    const items = Array.from(this.cartItems.values()).filter(
      item => item.sessionId === sessionId
    );
    
    const itemsWithProducts: CartItemWithProduct[] = [];
    
    for (const item of items) {
      const product = await this.getProductById(item.productId);
      if (product) {
        itemsWithProducts.push({
          ...item,
          product
        });
      }
    }
    
    return itemsWithProducts;
  }

  async getCartItemById(id: number): Promise<CartItem | undefined> {
    return this.cartItems.get(id);
  }

  async createCartItem(cartItem: InsertCartItem): Promise<CartItem> {
    // Check if item already exists in cart
    const existingItems = await this.getCartItemsBySessionId(cartItem.sessionId);
    const existingItem = existingItems.find(item => item.productId === cartItem.productId);
    
    if (existingItem) {
      // Update quantity instead of creating new item
      return this.updateCartItemQuantity(existingItem.id, existingItem.quantity + cartItem.quantity) as Promise<CartItem>;
    }
    
    const id = this.currentCartItemId++;
    const newCartItem: CartItem = { 
      ...cartItem, 
      id, 
      createdAt: new Date() 
    };
    this.cartItems.set(id, newCartItem);
    return newCartItem;
  }

  async updateCartItemQuantity(id: number, quantity: number): Promise<CartItem | undefined> {
    const cartItem = this.cartItems.get(id);
    if (!cartItem) return undefined;
    
    const updatedItem: CartItem = {
      ...cartItem,
      quantity
    };
    
    this.cartItems.set(id, updatedItem);
    return updatedItem;
  }

  async deleteCartItem(id: number): Promise<boolean> {
    return this.cartItems.delete(id);
  }

  async clearCart(sessionId: string): Promise<boolean> {
    const items = await this.getCartItemsBySessionId(sessionId);
    items.forEach(item => {
      this.cartItems.delete(item.id);
    });
    return true;
  }

  async getWorkshops(): Promise<Workshop[]> {
    return Array.from(this.workshops.values());
  }

  async getWorkshopById(id: number): Promise<Workshop | undefined> {
    return this.workshops.get(id);
  }

  async createWorkshop(workshop: InsertWorkshop): Promise<Workshop> {
    const id = this.currentWorkshopId++;
    const newWorkshop: Workshop = { ...workshop, id };
    this.workshops.set(id, newWorkshop);
    return newWorkshop;
  }

  async createOrder(order: InsertOrder, orderItems: InsertOrderItem[]): Promise<Order> {
    const id = this.currentOrderId++;
    const newOrder: Order = { 
      ...order, 
      id, 
      createdAt: new Date() 
    };
    this.orders.set(id, newOrder);
    
    // Create order items
    for (const item of orderItems) {
      const orderItemId = this.currentOrderItemId++;
      const newOrderItem: OrderItem = {
        ...item,
        id: orderItemId,
        orderId: id
      };
      this.orderItems.set(orderItemId, newOrderItem);
    }
    
    // Clear the cart after creating order
    await this.clearCart(order.sessionId);
    
    return newOrder;
  }
  
  async updateOrderWithItems(orderId: number, items: InsertOrderItem[]): Promise<Order> {
    const order = this.orders.get(orderId);
    if (!order) {
      throw new Error(`Order with id ${orderId} not found`);
    }
    
    // Create order items
    for (const item of items) {
      const orderItemId = this.currentOrderItemId++;
      const newOrderItem: OrderItem = {
        ...item,
        id: orderItemId,
        orderId
      };
      this.orderItems.set(orderItemId, newOrderItem);
    }
    
    // Clear the cart after updating order
    await this.clearCart(order.sessionId);
    
    return order;
  }

  async getOrderById(id: number): Promise<OrderWithItems | undefined> {
    const order = this.orders.get(id);
    if (!order) return undefined;
    
    const orderItems = Array.from(this.orderItems.values())
      .filter(item => item.orderId === id);
    
    const itemsWithProducts = await Promise.all(
      orderItems.map(async (item) => {
        const product = await this.getProductById(item.productId);
        return {
          ...item,
          product: product!
        };
      })
    );
    
    return {
      ...order,
      items: itemsWithProducts
    };
  }

  async getOrdersBySessionId(sessionId: string): Promise<Order[]> {
    return Array.from(this.orders.values())
      .filter(order => order.sessionId === sessionId);
  }

  async subscribeToNewsletter(newsletter: InsertNewsletter): Promise<Newsletter> {
    // Check if email already exists
    const existingEmails = Array.from(this.newsletterSubscriptions.values())
      .map(sub => sub.email);
    
    if (existingEmails.includes(newsletter.email)) {
      // Return existing subscription
      const existing = Array.from(this.newsletterSubscriptions.values())
        .find(sub => sub.email === newsletter.email);
      return existing!;
    }
    
    const id = this.currentNewsletterId++;
    const newSubscription: Newsletter = { 
      ...newsletter, 
      id, 
      createdAt: new Date() 
    };
    this.newsletterSubscriptions.set(id, newSubscription);
    return newSubscription;
  }

  async submitContactForm(contact: InsertContact): Promise<Contact> {
    const id = this.currentContactId++;
    const newSubmission: Contact = { 
      ...contact, 
      id, 
      createdAt: new Date() 
    };
    this.contactSubmissions.set(id, newSubmission);
    return newSubmission;
  }
}

export const storage = new MemStorage();
