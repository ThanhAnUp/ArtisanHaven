import { db } from "./db";
import { eq, sql, asc, desc } from "drizzle-orm";
import {
  products,
  reviews,
  cartItems,
  workshops,
  orders,
  orderItems,
  newsletters,
  contacts,
  Product,
  Review,
  CartItem,
  Workshop,
  Order,
  OrderItem,
  Newsletter,
  Contact,
  InsertProduct,
  InsertReview,
  InsertCartItem,
  InsertWorkshop,
  InsertOrder,
  InsertOrderItem,
  InsertNewsletter,
  InsertContact,
  CartItemWithProduct,
  OrderWithItems
} from "@shared/schema";
import { IStorage } from "./storage";

export class PgStorage implements IStorage {
  
  // Product operations
  async getProducts(): Promise<Product[]> {
    return await db.select().from(products);
  }
  
  async getProductById(id: number): Promise<Product | undefined> {
    const results = await db.select().from(products).where(eq(products.id, id));
    return results.length > 0 ? results[0] : undefined;
  }
  
  async getFeaturedProducts(): Promise<Product[]> {
    return await db.select().from(products).where(eq(products.featured, true));
  }
  
  async getProductsByCategory(category: string): Promise<Product[]> {
    // Chuyển đổi chuỗi thành enum trước khi truy vấn
    if (category === "jewelry" || category === "home_decor" || category === "ceramics" || category === "textiles") {
      return await db.select().from(products).where(eq(products.category, category));
    }
    return [];
  }
  
  async searchProducts(query: string): Promise<Product[]> {
    const lowercaseQuery = query.toLowerCase();
    return await db
      .select()
      .from(products)
      .where(
        sql`LOWER(${products.name}) LIKE ${`%${lowercaseQuery}%`} OR LOWER(${products.description}) LIKE ${`%${lowercaseQuery}%`}`
      );
  }
  
  async createProduct(product: InsertProduct): Promise<Product> {
    const result = await db.insert(products).values(product).returning();
    return result[0];
  }
  
  // Review operations
  async getReviewsByProductId(productId: number): Promise<Review[]> {
    return await db.select().from(reviews).where(eq(reviews.productId, productId));
  }
  
  async createReview(review: InsertReview): Promise<Review> {
    // Create the review
    const reviewWithDate = { ...review, createdAt: new Date() };
    const result = await db.insert(reviews).values(reviewWithDate).returning();
    const newReview = result[0];
    
    // Update product rating and review count
    const allReviews = await this.getReviewsByProductId(review.productId);
    const totalRating = allReviews.reduce((sum, r) => sum + r.rating, 0);
    const avgRating = (totalRating / allReviews.length).toFixed(1);
    
    await db
      .update(products)
      .set({
        rating: avgRating,
        reviewCount: allReviews.length
      })
      .where(eq(products.id, review.productId));
    
    return newReview;
  }
  
  // Cart operations
  async getCartItemsBySessionId(sessionId: string): Promise<CartItemWithProduct[]> {
    const items = await db
      .select()
      .from(cartItems)
      .where(eq(cartItems.sessionId, sessionId));
    
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
    const results = await db.select().from(cartItems).where(eq(cartItems.id, id));
    return results.length > 0 ? results[0] : undefined;
  }
  
  async createCartItem(cartItem: InsertCartItem): Promise<CartItem> {
    // Check if item already exists in cart
    const existingItems = await this.getCartItemsBySessionId(cartItem.sessionId);
    const existingItem = existingItems.find(item => item.productId === cartItem.productId);
    
    if (existingItem) {
      // Update quantity instead of creating new item
      return await this.updateCartItemQuantity(
        existingItem.id, 
        existingItem.quantity + (cartItem.quantity || 1)
      ) as CartItem;
    }
    
    const cartItemWithDate = {
      ...cartItem,
      createdAt: new Date()
    };
    
    const result = await db.insert(cartItems).values(cartItemWithDate).returning();
    return result[0];
  }
  
  async updateCartItemQuantity(id: number, quantity: number): Promise<CartItem | undefined> {
    const result = await db
      .update(cartItems)
      .set({ quantity })
      .where(eq(cartItems.id, id))
      .returning();
    
    return result.length > 0 ? result[0] : undefined;
  }
  
  async deleteCartItem(id: number): Promise<boolean> {
    const result = await db
      .delete(cartItems)
      .where(eq(cartItems.id, id))
      .returning({ id: cartItems.id });
    
    return result.length > 0;
  }
  
  async clearCart(sessionId: string): Promise<boolean> {
    await db
      .delete(cartItems)
      .where(eq(cartItems.sessionId, sessionId));
    
    return true;
  }
  
  // Workshop operations
  async getWorkshops(): Promise<Workshop[]> {
    return await db.select().from(workshops);
  }
  
  async getWorkshopById(id: number): Promise<Workshop | undefined> {
    const results = await db.select().from(workshops).where(eq(workshops.id, id));
    return results.length > 0 ? results[0] : undefined;
  }
  
  async createWorkshop(workshop: InsertWorkshop): Promise<Workshop> {
    const result = await db.insert(workshops).values(workshop).returning();
    return result[0];
  }
  
  // Order operations
  async createOrder(order: InsertOrder, items: InsertOrderItem[]): Promise<Order> {
    const orderWithDate = {
      ...order,
      createdAt: new Date(),
      status: order.status || "pending"
    };
    
    const result = await db.insert(orders).values(orderWithDate).returning();
    const newOrder = result[0];
    
    // Create order items
    for (const item of items) {
      await db.insert(orderItems).values({
        ...item,
        orderId: newOrder.id
      });
    }
    
    // Clear the cart
    await this.clearCart(order.sessionId);
    
    return newOrder;
  }
  
  async updateOrderWithItems(orderId: number, items: InsertOrderItem[]): Promise<Order> {
    const orderResult = await db.select().from(orders).where(eq(orders.id, orderId));
    
    if (orderResult.length === 0) {
      throw new Error(`Order with id ${orderId} not found`);
    }
    
    const order = orderResult[0];
    
    // Create order items
    for (const item of items) {
      await db.insert(orderItems).values({
        ...item,
        orderId
      });
    }
    
    // Clear the cart
    await this.clearCart(order.sessionId);
    
    return order;
  }
  
  async getOrderById(id: number): Promise<OrderWithItems | undefined> {
    const orderResult = await db.select().from(orders).where(eq(orders.id, id));
    
    if (orderResult.length === 0) {
      return undefined;
    }
    
    const order = orderResult[0];
    
    const orderItemsResult = await db.select().from(orderItems).where(eq(orderItems.orderId, id));
    
    const itemsWithProducts = await Promise.all(
      orderItemsResult.map(async (item) => {
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
    return await db.select().from(orders).where(eq(orders.sessionId, sessionId));
  }
  
  // Newsletter operations
  async subscribeToNewsletter(newsletter: InsertNewsletter): Promise<Newsletter> {
    // Check if email already exists
    const existingResults = await db
      .select()
      .from(newsletters)
      .where(eq(newsletters.email, newsletter.email));
    
    if (existingResults.length > 0) {
      return existingResults[0];
    }
    
    const newsletterWithDate = {
      ...newsletter,
      createdAt: new Date()
    };
    
    const result = await db.insert(newsletters).values(newsletterWithDate).returning();
    return result[0];
  }
  
  // Contact form operations
  async submitContactForm(contact: InsertContact): Promise<Contact> {
    const contactWithDate = {
      ...contact,
      createdAt: new Date()
    };
    
    const result = await db.insert(contacts).values(contactWithDate).returning();
    return result[0];
  }
  
  // Hàm để khởi tạo cơ sở dữ liệu với dữ liệu mẫu
  async initializeDatabase() {
    // Khởi tạo sản phẩm mẫu
    await this.initializeProducts();
    // Khởi tạo hội thảo mẫu
    await this.initializeWorkshops();
    // Khởi tạo đánh giá mẫu
    await this.initializeReviews();
  }
  
  // Phương thức riêng để khởi tạo sản phẩm
  private async initializeProducts() {
    const sampleProducts: InsertProduct[] = [
      {
        name: "Dây Chuyền Vàng Thủ Công",
        description: "Dây chuyền vàng được thiết kế tinh tế, được chế tác thủ công với sự tỉ mỉ và chăm sóc. Sản phẩm tuyệt đẹp này có các mắt xích tinh xảo và mặt dây chuyền nhỏ gọn bắt sáng tuyệt đẹp.",
        price: "2100000",
        imageUrl: "https://images.pexels.com/photos/10983783/pexels-photo-10983783.jpeg?auto=compress&cs=tinysrgb&w=500",
        category: "jewelry",
        inStock: true,
        featured: true,
        rating: "4.5",
        reviewCount: 24
      },
      {
        name: "Trang Trí Macrame Treo Tường",
        description: "Trang trí macrame treo tường được dệt thủ công đẹp mắt mang lại kết cấu và sự ấm áp cho bất kỳ không gian nào. Được làm từ 100% dây cotton với hạt gỗ tự nhiên.",
        price: "1550000",
        imageUrl: "https://images.pexels.com/photos/4992459/pexels-photo-4992459.jpeg?auto=compress&cs=tinysrgb&w=500",
        category: "home_decor",
        inStock: true,
        featured: true,
        rating: "5.0",
        reviewCount: 18
      },
      {
        name: "Bộ Bát Gốm Thủ Công",
        description: "Bộ bốn bát gốm được chế tác độc đáo hoàn hảo cho việc sử dụng hàng ngày hoặc các dịp đặc biệt. Mỗi bát có lớp men phản ứng đẹp mắt làm cho nó trở nên độc nhất vô nhị.",
        price: "2850000",
        imageUrl: "https://images.pexels.com/photos/2148215/pexels-photo-2148215.jpeg?auto=compress&cs=tinysrgb&w=500",
        category: "ceramics",
        inStock: true,
        featured: true,
        rating: "4.0",
        reviewCount: 12
      },
      {
        name: "Bông Tai Bạc Thủ Công",
        description: "Bông tai bạc được thiết kế tinh tế và chế tác thủ công với độ chính xác cao. Những chiếc bông tai nhẹ này có thiết kế hiện đại phù hợp với mọi trang phục.",
        price: "1050000",
        imageUrl: "https://images.pexels.com/photos/10890970/pexels-photo-10890970.jpeg?auto=compress&cs=tinysrgb&w=500",
        category: "jewelry",
        inStock: true,
        featured: true,
        rating: "3.5",
        reviewCount: 9
      },
      {
        name: "Giỏ Đan Thủ Công",
        description: "Giỏ đựng đồ được đan thủ công đẹp mắt làm từ cỏ biển tự nhiên. Hoàn hảo để tổ chức ngôi nhà của bạn đồng thời mang lại nét quyến rũ thủ công.",
        price: "1890000",
        imageUrl: "https://images.pexels.com/photos/10756099/pexels-photo-10756099.jpeg?auto=compress&cs=tinysrgb&w=500",
        category: "home_decor",
        inStock: true,
        featured: true,
        rating: "5.0",
        reviewCount: 32
      },
      {
        name: "Bình Hoa Gốm",
        description: "Bình gốm được chế tác thủ công với hình dáng hữu cơ độc đáo và bề mặt mờ. Hoàn hảo để trưng bày các bó hoa tươi hoặc khô.",
        price: "1350000",
        imageUrl: "https://images.pexels.com/photos/6707628/pexels-photo-6707628.jpeg?auto=compress&cs=tinysrgb&w=500",
        category: "ceramics",
        inStock: true,
        featured: true,
        rating: "3.5",
        reviewCount: 7
      },
      {
        name: "Vòng Tay Gỗ Thủ Công",
        description: "Vòng tay gỗ thời trang được chế tác thủ công từ vật liệu bền vững. Có dây đeo co giãn thoải mái phù hợp với hầu hết kích thước cổ tay.",
        price: "950000",
        imageUrl: "https://images.pexels.com/photos/10623914/pexels-photo-10623914.jpeg?auto=compress&cs=tinysrgb&w=500",
        category: "jewelry",
        inStock: true,
        featured: true,
        rating: "4.0",
        reviewCount: 15
      },
      {
        name: "Gối Trang Trí Vẽ Tay",
        description: "Gối ném độc đáo với thiết kế vẽ tay trên vải lanh 100%. Thêm nét nghệ thuật cho bất kỳ ghế sofa hoặc giường nào.",
        price: "1150000",
        imageUrl: "https://images.pexels.com/photos/6492388/pexels-photo-6492388.jpeg?auto=compress&cs=tinysrgb&w=500",
        category: "home_decor",
        inStock: true,
        featured: true,
        rating: "4.0",
        reviewCount: 21
      },
      {
        name: "Dây Chuyền Hạt Thủ Công",
        description: "Dây chuyền statement táo bạo với các hạt đất sét thủ công màu tự nhiên. Mỗi món đều độc đáo và tạo nên phụ kiện ấn tượng.",
        price: "2250000",
        imageUrl: "https://images.pexels.com/photos/9594144/pexels-photo-9594144.jpeg?auto=compress&cs=tinysrgb&w=500",
        category: "jewelry",
        inStock: true,
        featured: false,
        rating: "4.0",
        reviewCount: 16
      },
      {
        name: "Thảm Dệt Treo Tường",
        description: "Thảm treo tường được dệt phức tạp từ sợi tự nhiên. Một điểm nhấn tuyệt đẹp cho bất kỳ căn phòng nào.",
        price: "3350000",
        imageUrl: "https://images.pexels.com/photos/8037031/pexels-photo-8037031.jpeg?auto=compress&cs=tinysrgb&w=500",
        category: "textiles",
        inStock: true,
        featured: false,
        rating: "4.5",
        reviewCount: 7
      },
      {
        name: "Cốc Gốm Vẽ Tay",
        description: "Cốc gốm thiết kế độc đáo, được vẽ tay riêng từng chiếc bởi các nghệ nhân của chúng tôi. An toàn với lò vi sóng và máy rửa chén.",
        price: "650000",
        imageUrl: "https://images.pexels.com/photos/4346302/pexels-photo-4346302.jpeg?auto=compress&cs=tinysrgb&w=500",
        category: "ceramics",
        inStock: true,
        featured: false,
        rating: "4.0",
        reviewCount: 29
      },
      {
        name: "Ví Da Thủ Công",
        description: "Ví da tối giản được làm thủ công từ da hạt đầy đủ cao cấp. Có các ngăn đựng thẻ và hóa đơn với đường khâu tay đẹp mắt.",
        price: "1550000",
        imageUrl: "https://images.pexels.com/photos/7334004/pexels-photo-7334004.jpeg?auto=compress&cs=tinysrgb&w=500",
        category: "textiles",
        inStock: true,
        featured: false,
        rating: "4.5",
        reviewCount: 13
      }
    ];
    
    for (const product of sampleProducts) {
      await this.createProduct(product);
    }
  }
  
  private async initializeWorkshops() {
    const sampleWorkshops: InsertWorkshop[] = [
      {
        title: "Hội Thảo Làm Bát Gốm",
        description: "Học nghệ thuật làm bát gốm thủ công trong hội thảo thân thiện với người mới bắt đầu này được hướng dẫn bởi nghệ nhân gốm Ngọc Anh.",
        imageUrl: "https://images.pexels.com/photos/3094351/pexels-photo-3094351.jpeg?auto=compress&cs=tinysrgb&w=800",
        category: "ceramics",
        date: new Date("2025-06-15T10:00:00Z"),
        price: "2200000",
        spotsAvailable: 10
      },
      {
        title: "Hội Thảo Làm Trang Sức Bạc",
        description: "Tự tạo nhẫn bạc của riêng bạn trong hội thảo thực hành này được giảng dạy bởi nhà thiết kế trang sức giàu kinh nghiệm Minh Tuấn.",
        imageUrl: "https://images.pexels.com/photos/8113923/pexels-photo-8113923.jpeg?auto=compress&cs=tinysrgb&w=800",
        category: "jewelry",
        date: new Date("2025-07-08T14:00:00Z"),
        price: "2800000",
        spotsAvailable: 8
      }
    ];
    
    for (const workshop of sampleWorkshops) {
      await this.createWorkshop(workshop);
    }
  }
  
  private async initializeReviews() {
    const sampleReviews: InsertReview[] = [
      {
        productId: 1,
        name: "Thanh Hà",
        location: "Hà Nội",
        rating: 5,
        comment: "Dây chuyền vàng mà tôi mua thực sự tuyệt đẹp. Sự khéo léo trong chế tác rất đặc biệt, và tôi thích việc mình đang hỗ trợ các nghệ nhân tài năng. Chắc chắn sẽ mua sắm ở đây một lần nữa!"
      },
      {
        productId: 2,
        name: "Minh Tú",
        location: "TP Hồ Chí Minh",
        rating: 5,
        comment: "Tôi đã mua trang trí macrame treo tường làm quà tặng cho em gái tôi, và cô ấy hoàn toàn yêu thích nó! Chất lượng thật tuyệt vời, và nó trông còn đẹp hơn cả trong ảnh. Giao hàng cũng nhanh chóng!"
      },
      {
        productId: 4,
        name: "Ngọc Mai",
        location: "Đà Nẵng",
        rating: 4,
        comment: "Đôi bông tai bạc mà tôi mua đã trở thành món trang sức yêu thích của tôi. Thiết kế độc đáo và chất lượng xuất sắc. Tôi đã nhận được rất nhiều lời khen. Khuyên mọi người nên mua!"
      }
    ];
    
    for (const review of sampleReviews) {
      await this.createReview(review);
    }
  }
}

// Khởi tạo một instance PgStorage để sử dụng
export const pgStorage = new PgStorage();