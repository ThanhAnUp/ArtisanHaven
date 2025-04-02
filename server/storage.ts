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
  type OrderWithItems,
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
  updateCartItemQuantity(
    id: number,
    quantity: number,
  ): Promise<CartItem | undefined>;
  deleteCartItem(id: number): Promise<boolean>;
  clearCart(sessionId: string): Promise<boolean>;

  // Workshop operations
  getWorkshops(): Promise<Workshop[]>;
  getWorkshopById(id: number): Promise<Workshop | undefined>;
  createWorkshop(workshop: InsertWorkshop): Promise<Workshop>;

  // Order operations
  createOrder(order: InsertOrder, items: InsertOrderItem[]): Promise<Order>;
  updateOrderWithItems(
    orderId: number,
    items: InsertOrderItem[],
  ): Promise<Order>;
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
        name: "Dây Chuyền Vàng Thủ Công",
        description:
          "Dây chuyền vàng được thiết kế tinh tế, được chế tác thủ công với sự tỉ mỉ và chăm sóc. Sản phẩm tuyệt đẹp này có các mắt xích tinh xảo và mặt dây chuyền nhỏ gọn bắt sáng tuyệt đẹp.",
        price: "2.100.000",
        imageUrl:
          "https://images.pexels.com/photos/10983783/pexels-photo-10983783.jpeg?auto=compress&cs=tinysrgb&w=500",
        category: "jewelry",
        inStock: true,
        featured: true,
        rating: "4.5",
        reviewCount: 24,
      },
      {
        name: "Trang Trí Macrame Treo Tường",
        description:
          "Trang trí macrame treo tường được dệt thủ công đẹp mắt mang lại kết cấu và sự ấm áp cho bất kỳ không gian nào. Được làm từ 100% dây cotton với hạt gỗ tự nhiên.",
        price: "1.550.000",
        imageUrl:
          "https://images.pexels.com/photos/4992459/pexels-photo-4992459.jpeg?auto=compress&cs=tinysrgb&w=500",
        category: "home_decor",
        inStock: true,
        featured: true,
        rating: "5.0",
        reviewCount: 18,
      },
      {
        name: "Bộ Bát Gốm Thủ Công",
        description:
          "Bộ bốn bát gốm được chế tác độc đáo hoàn hảo cho việc sử dụng hàng ngày hoặc các dịp đặc biệt. Mỗi bát có lớp men phản ứng đẹp mắt làm cho nó trở nên độc nhất vô nhị.",
        price: "2.850.000",
        imageUrl:
          "https://images.pexels.com/photos/2148215/pexels-photo-2148215.jpeg?auto=compress&cs=tinysrgb&w=500",
        category: "ceramics",
        inStock: true,
        featured: true,
        rating: "4.0",
        reviewCount: 12,
      },
      {
        name: "Bông Tai Bạc Thủ Công",
        description:
          "Bông tai bạc được thiết kế tinh tế và chế tác thủ công với độ chính xác cao. Những chiếc bông tai nhẹ này có thiết kế hiện đại phù hợp với mọi trang phục.",
        price: "1.050.000",
        imageUrl:
          "https://images.pexels.com/photos/10890970/pexels-photo-10890970.jpeg?auto=compress&cs=tinysrgb&w=500",
        category: "jewelry",
        inStock: true,
        featured: true,
        rating: "3.5",
        reviewCount: 9,
      },
      {
        name: "Giỏ Đan Thủ Công 2",
        description:
          "Giỏ đựng đồ được đan thủ công đẹp mắt làm từ cỏ biển tự nhiên. Hoàn hảo để tổ chức ngôi nhà của bạn đồng thời mang lại nét quyến rũ thủ công.",
        price: "1.890.000",
        imageUrl:
          "https://images.pexels.com/photos/2249959/pexels-photo-2249959.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2",
        category: "home_decor",
        inStock: true,
        featured: true,
        rating: "5.0",
        reviewCount: 32,
      },
      {
        name: "Bình Hoa Gốm",
        description:
          "Bình gốm được chế tác thủ công với hình dáng hữu cơ độc đáo và bề mặt mờ. Hoàn hảo để trưng bày các bó hoa tươi hoặc khô.",
        price: "1.350.000",
        imageUrl:
          "https://images.pexels.com/photos/6707628/pexels-photo-6707628.jpeg?auto=compress&cs=tinysrgb&w=500",
        category: "ceramics",
        inStock: true,
        featured: true,
        rating: "3.5",
        reviewCount: 7,
      },
      {
        name: "Vòng Tay Gỗ Thủ Công",
        description:
          "Vòng tay gỗ thời trang được chế tác thủ công từ vật liệu bền vững. Có dây đeo co giãn thoải mái phù hợp với hầu hết kích thước cổ tay.",
        price: "950.000",
        imageUrl:
          "https://images.pexels.com/photos/10623914/pexels-photo-10623914.jpeg?auto=compress&cs=tinysrgb&w=500",
        category: "jewelry",
        inStock: true,
        featured: true,
        rating: "4.0",
        reviewCount: 15,
      },
      {
        name: "Gối Trang Trí Vẽ Tay",
        description:
          "Gối ném độc đáo với thiết kế vẽ tay trên vải lanh 100%. Thêm nét nghệ thuật cho bất kỳ ghế sofa hoặc giường nào.",
        price: "1.150.000",
        imageUrl:
          "https://images.pexels.com/photos/6492388/pexels-photo-6492388.jpeg?auto=compress&cs=tinysrgb&w=500",
        category: "home_decor",
        inStock: true,
        featured: true,
        rating: "4.0",
        reviewCount: 21,
      },
      {
        name: "Dây Chuyền Hạt Thủ Công",
        description:
          "Dây chuyền statement táo bạo với các hạt đất sét thủ công màu tự nhiên. Mỗi món đều độc đáo và tạo nên phụ kiện ấn tượng.",
        price: "2.250.000",
        imageUrl:
          "https://images.pexels.com/photos/9594144/pexels-photo-9594144.jpeg?auto=compress&cs=tinysrgb&w=500",
        category: "jewelry",
        inStock: true,
        featured: false,
        rating: "4.0",
        reviewCount: 16,
      },
      {
        name: "Thảm Dệt Treo Tường",
        description:
          "Thảm treo tường được dệt phức tạp từ sợi tự nhiên. Một điểm nhấn tuyệt đẹp cho bất kỳ căn phòng nào.",
        price: "3.350.000",
        imageUrl:
          "https://images.pexels.com/photos/8037031/pexels-photo-8037031.jpeg?auto=compress&cs=tinysrgb&w=500",
        category: "textiles",
        inStock: true,
        featured: false,
        rating: "4.5",
        reviewCount: 7,
      },
      {
        name: "Cốc Gốm Vẽ Tay",
        description:
          "Cốc gốm thiết kế độc đáo, được vẽ tay riêng từng chiếc bởi các nghệ nhân của chúng tôi. An toàn với lò vi sóng và máy rửa chén.",
        price: "650.000",
        imageUrl:
          "https://images.pexels.com/photos/4346302/pexels-photo-4346302.jpeg?auto=compress&cs=tinysrgb&w=500",
        category: "ceramics",
        inStock: true,
        featured: false,
        rating: "4.0",
        reviewCount: 29,
      },
      {
        name: "Ví Da Thủ Công",
        description:
          "Ví da tối giản được làm thủ công từ da hạt đầy đủ cao cấp. Có các ngăn đựng thẻ và hóa đơn với đường khâu tay đẹp mắt.",
        price: "1.550.000",
        imageUrl:
          "https://images.pexels.com/photos/7334004/pexels-photo-7334004.jpeg?auto=compress&cs=tinysrgb&w=500",
        category: "textiles",
        inStock: true,
        featured: false,
        rating: "4.5",
        reviewCount: 13,
      },
    ];

    sampleProducts.forEach((product) => {
      this.createProduct(product);
    });
  }

  private initializeWorkshops() {
    const sampleWorkshops: InsertWorkshop[] = [
      {
        title: "Hội Thảo Làm Bát Gốm",
        description:
          "Học nghệ thuật làm bát gốm thủ công trong hội thảo thân thiện với người mới bắt đầu này được hướng dẫn bởi nghệ nhân gốm Ngọc Anh.",
        imageUrl:
          "https://images.pexels.com/photos/3094351/pexels-photo-3094351.jpeg?auto=compress&cs=tinysrgb&w=800",
        category: "ceramics",
        date: new Date("2023-06-15T10:00:00Z"),
        price: "2.200.000",
        spotsAvailable: 10,
      },
      {
        title: "Hội Thảo Làm Trang Sức Bạc",
        description:
          "Tự tạo nhẫn bạc của riêng bạn trong hội thảo thực hành này được giảng dạy bởi nhà thiết kế trang sức giàu kinh nghiệm Minh Tuấn.",
        imageUrl:
          "https://images.pexels.com/photos/8113923/pexels-photo-8113923.jpeg?auto=compress&cs=tinysrgb&w=800",
        category: "jewelry",
        date: new Date("2023-07-08T14:00:00Z"),
        price: "2.800.000",
        spotsAvailable: 8,
      },
    ];

    sampleWorkshops.forEach((workshop) => {
      this.createWorkshop(workshop);
    });
  }

  private initializeReviews() {
    const sampleReviews: InsertReview[] = [
      {
        productId: 1,
        name: "Thanh Hà",
        location: "Hà Nội",
        rating: 5,
        comment:
          "Dây chuyền vàng mà tôi mua thực sự tuyệt đẹp. Sự khéo léo trong chế tác rất đặc biệt, và tôi thích việc mình đang hỗ trợ các nghệ nhân tài năng. Chắc chắn sẽ mua sắm ở đây một lần nữa!",
      },
      {
        productId: 2,
        name: "Minh Tú",
        location: "TP Hồ Chí Minh",
        rating: 5,
        comment:
          "Tôi đã mua trang trí macrame treo tường làm quà tặng cho em gái tôi, và cô ấy hoàn toàn yêu thích nó! Chất lượng thật tuyệt vời, và nó trông còn đẹp hơn cả trong ảnh. Giao hàng cũng nhanh chóng!",
      },
      {
        productId: 4,
        name: "Ngọc Mai",
        location: "Đà Nẵng",
        rating: 4,
        comment:
          "Đôi bông tai bạc mà tôi mua đã trở thành món trang sức yêu thích của tôi. Thiết kế độc đáo và chất lượng xuất sắc. Tôi đã nhận được rất nhiều lời khen. Khuyên mọi người nên mua!",
      },
    ];

    sampleReviews.forEach((review) => {
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
    return Array.from(this.products.values()).filter(
      (product) => product.featured,
    );
  }

  async getProductsByCategory(category: string): Promise<Product[]> {
    return Array.from(this.products.values()).filter(
      (product) => product.category === category,
    );
  }

  async searchProducts(query: string): Promise<Product[]> {
    const lowercaseQuery = query.toLowerCase();
    return Array.from(this.products.values()).filter(
      (product) =>
        product.name.toLowerCase().includes(lowercaseQuery) ||
        product.description.toLowerCase().includes(lowercaseQuery),
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
      (review) => review.productId === productId,
    );
  }

  async createReview(review: InsertReview): Promise<Review> {
    const id = this.currentReviewId++;
    const newReview: Review = {
      ...review,
      id,
      createdAt: new Date(),
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
        reviewCount: reviews.length,
      };

      this.products.set(product.id, updatedProduct);
    }

    return newReview;
  }

  async getCartItemsBySessionId(
    sessionId: string,
  ): Promise<CartItemWithProduct[]> {
    const items = Array.from(this.cartItems.values()).filter(
      (item) => item.sessionId === sessionId,
    );

    const itemsWithProducts: CartItemWithProduct[] = [];

    for (const item of items) {
      const product = await this.getProductById(item.productId);
      if (product) {
        itemsWithProducts.push({
          ...item,
          product,
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
    const existingItems = await this.getCartItemsBySessionId(
      cartItem.sessionId,
    );
    const existingItem = existingItems.find(
      (item) => item.productId === cartItem.productId,
    );

    if (existingItem) {
      // Update quantity instead of creating new item
      return this.updateCartItemQuantity(
        existingItem.id,
        existingItem.quantity + cartItem.quantity,
      ) as Promise<CartItem>;
    }

    const id = this.currentCartItemId++;
    const newCartItem: CartItem = {
      ...cartItem,
      id,
      createdAt: new Date(),
    };
    this.cartItems.set(id, newCartItem);
    return newCartItem;
  }

  async updateCartItemQuantity(
    id: number,
    quantity: number,
  ): Promise<CartItem | undefined> {
    const cartItem = this.cartItems.get(id);
    if (!cartItem) return undefined;

    const updatedItem: CartItem = {
      ...cartItem,
      quantity,
    };

    this.cartItems.set(id, updatedItem);
    return updatedItem;
  }

  async deleteCartItem(id: number): Promise<boolean> {
    return this.cartItems.delete(id);
  }

  async clearCart(sessionId: string): Promise<boolean> {
    const items = await this.getCartItemsBySessionId(sessionId);
    items.forEach((item) => {
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

  async createOrder(
    order: InsertOrder,
    orderItems: InsertOrderItem[],
  ): Promise<Order> {
    const id = this.currentOrderId++;
    const newOrder: Order = {
      ...order,
      id,
      createdAt: new Date(),
    };
    this.orders.set(id, newOrder);

    // Create order items
    for (const item of orderItems) {
      const orderItemId = this.currentOrderItemId++;
      const newOrderItem: OrderItem = {
        ...item,
        id: orderItemId,
        orderId: id,
      };
      this.orderItems.set(orderItemId, newOrderItem);
    }

    // Clear the cart after creating order
    await this.clearCart(order.sessionId);

    return newOrder;
  }

  async updateOrderWithItems(
    orderId: number,
    items: InsertOrderItem[],
  ): Promise<Order> {
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
        orderId,
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

    const orderItems = Array.from(this.orderItems.values()).filter(
      (item) => item.orderId === id,
    );

    const itemsWithProducts = await Promise.all(
      orderItems.map(async (item) => {
        const product = await this.getProductById(item.productId);
        return {
          ...item,
          product: product!,
        };
      }),
    );

    return {
      ...order,
      items: itemsWithProducts,
    };
  }

  async getOrdersBySessionId(sessionId: string): Promise<Order[]> {
    return Array.from(this.orders.values()).filter(
      (order) => order.sessionId === sessionId,
    );
  }

  async subscribeToNewsletter(
    newsletter: InsertNewsletter,
  ): Promise<Newsletter> {
    // Check if email already exists
    const existingEmails = Array.from(
      this.newsletterSubscriptions.values(),
    ).map((sub) => sub.email);

    if (existingEmails.includes(newsletter.email)) {
      // Return existing subscription
      const existing = Array.from(this.newsletterSubscriptions.values()).find(
        (sub) => sub.email === newsletter.email,
      );
      return existing!;
    }

    const id = this.currentNewsletterId++;
    const newSubscription: Newsletter = {
      ...newsletter,
      id,
      createdAt: new Date(),
    };
    this.newsletterSubscriptions.set(id, newSubscription);
    return newSubscription;
  }

  async submitContactForm(contact: InsertContact): Promise<Contact> {
    const id = this.currentContactId++;
    const newSubmission: Contact = {
      ...contact,
      id,
      createdAt: new Date(),
    };
    this.contactSubmissions.set(id, newSubmission);
    return newSubmission;
  }
}

// Sử dụng lưu trữ PostgreSQL
import { pgStorage } from "./pgStorage";
export const storage = pgStorage;
