import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertProductSchema, insertReviewSchema, insertCartItemSchema, insertOrderSchema, insertOrderItemSchema, insertNewsletterSchema, insertContactSchema } from "@shared/schema";
import { z } from "zod";
import { v4 as uuidv4 } from "uuid";
import { ZodError } from "zod";
import { fromZodError } from "zod-validation-error";
import session from "express-session";
import memorystore from "memorystore";

// Create memory store
const MemoryStore = memorystore(session);

// Helper function to get or create a session ID
const getOrCreateSessionId = (req: any): string => {
  if (!req.session.id) {
    req.session.id = uuidv4();
  }
  return req.session.id;
};

export async function registerRoutes(app: Express): Promise<Server> {
  // SESSION MANAGEMENT
  
  app.use(session({
    cookie: { maxAge: 86400000 },
    store: new MemoryStore({
      checkPeriod: 86400000 // prune expired entries every 24h
    }),
    resave: false,
    secret: process.env.SESSION_SECRET || "artisan-haven-secret",
    saveUninitialized: true
  }));

  // ERROR HANDLING MIDDLEWARE
  const handleError = (err: any, res: any) => {
    console.error(err);
    if (err instanceof ZodError) {
      const validationError = fromZodError(err);
      return res.status(400).json({ error: validationError.message });
    }
    res.status(500).json({ error: err.message || "Internal Server Error" });
  };

  // PRODUCTS API
  app.get("/api/products", async (req, res) => {
    try {
      const products = await storage.getProducts();
      res.json(products);
    } catch (err) {
      handleError(err, res);
    }
  });

  app.get("/api/products/featured", async (req, res) => {
    try {
      const products = await storage.getFeaturedProducts();
      res.json(products);
    } catch (err) {
      handleError(err, res);
    }
  });

  app.get("/api/products/category/:category", async (req, res) => {
    try {
      const { category } = req.params;
      const products = await storage.getProductsByCategory(category);
      res.json(products);
    } catch (err) {
      handleError(err, res);
    }
  });

  app.get("/api/products/search", async (req, res) => {
    try {
      const query = req.query.q as string;
      if (!query) {
        return res.status(400).json({ error: "Search query is required" });
      }
      const products = await storage.searchProducts(query);
      res.json(products);
    } catch (err) {
      handleError(err, res);
    }
  });

  app.get("/api/products/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ error: "Invalid product ID" });
      }
      
      const product = await storage.getProductById(id);
      if (!product) {
        return res.status(404).json({ error: "Product not found" });
      }
      res.json(product);
    } catch (err) {
      handleError(err, res);
    }
  });

  // REVIEWS API
  app.get("/api/products/:id/reviews", async (req, res) => {
    try {
      const productId = parseInt(req.params.id);
      if (isNaN(productId)) {
        return res.status(400).json({ error: "Invalid product ID" });
      }
      
      const reviews = await storage.getReviewsByProductId(productId);
      res.json(reviews);
    } catch (err) {
      handleError(err, res);
    }
  });

  app.post("/api/products/:id/reviews", async (req, res) => {
    try {
      const productId = parseInt(req.params.id);
      if (isNaN(productId)) {
        return res.status(400).json({ error: "Invalid product ID" });
      }
      
      const product = await storage.getProductById(productId);
      if (!product) {
        return res.status(404).json({ error: "Product not found" });
      }
      
      const reviewData = insertReviewSchema.parse({ ...req.body, productId });
      const review = await storage.createReview(reviewData);
      res.status(201).json(review);
    } catch (err) {
      handleError(err, res);
    }
  });

  // CART API
  app.get("/api/cart", async (req, res) => {
    try {
      const sessionId = getOrCreateSessionId(req);
      const cartItems = await storage.getCartItemsBySessionId(sessionId);
      res.json(cartItems);
    } catch (err) {
      handleError(err, res);
    }
  });

  app.post("/api/cart", async (req, res) => {
    try {
      const sessionId = getOrCreateSessionId(req);
      const cartItemData = insertCartItemSchema.parse({ ...req.body, sessionId });
      
      // Validate product exists
      const product = await storage.getProductById(cartItemData.productId);
      if (!product) {
        return res.status(404).json({ error: "Product not found" });
      }
      
      const cartItem = await storage.createCartItem(cartItemData);
      res.status(201).json(cartItem);
    } catch (err) {
      handleError(err, res);
    }
  });

  app.put("/api/cart/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ error: "Invalid cart item ID" });
      }
      
      const { quantity } = req.body;
      const quantitySchema = z.number().int().positive();
      const validatedQuantity = quantitySchema.parse(quantity);
      
      const cartItem = await storage.updateCartItemQuantity(id, validatedQuantity);
      if (!cartItem) {
        return res.status(404).json({ error: "Cart item not found" });
      }
      
      res.json(cartItem);
    } catch (err) {
      handleError(err, res);
    }
  });

  app.delete("/api/cart/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ error: "Invalid cart item ID" });
      }
      
      const success = await storage.deleteCartItem(id);
      if (!success) {
        return res.status(404).json({ error: "Cart item not found" });
      }
      
      res.status(204).end();
    } catch (err) {
      handleError(err, res);
    }
  });

  app.delete("/api/cart", async (req, res) => {
    try {
      const sessionId = getOrCreateSessionId(req);
      await storage.clearCart(sessionId);
      res.status(204).end();
    } catch (err) {
      handleError(err, res);
    }
  });

  // WORKSHOPS API
  app.get("/api/workshops", async (req, res) => {
    try {
      const workshops = await storage.getWorkshops();
      res.json(workshops);
    } catch (err) {
      handleError(err, res);
    }
  });

  app.get("/api/workshops/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ error: "Invalid workshop ID" });
      }
      
      const workshop = await storage.getWorkshopById(id);
      if (!workshop) {
        return res.status(404).json({ error: "Workshop not found" });
      }
      
      res.json(workshop);
    } catch (err) {
      handleError(err, res);
    }
  });

  // ORDERS API
  app.post("/api/orders", async (req, res) => {
    try {
      const sessionId = getOrCreateSessionId(req);
      
      // Get cart items
      const cartItems = await storage.getCartItemsBySessionId(sessionId);
      if (cartItems.length === 0) {
        return res.status(400).json({ error: "Cart is empty" });
      }
      
      // Calculate total
      const total = cartItems.reduce((sum, item) => {
        return sum + (Number(item.product.price) * item.quantity);
      }, 0);
      
      // Create order
      const orderData = insertOrderSchema.parse({
        ...req.body,
        sessionId,
        total: total.toString()
      });
      
      // First create order, then create order items with the order ID
      const order = await storage.createOrder(orderData, []); // Pass empty array initially
      
      // Now create order items with the correct order ID
      const orderItemsData = cartItems.map(item => ({
        orderId: order.id,
        productId: item.productId,
        quantity: item.quantity,
        price: item.product.price
      }));
      
      // Update the order with items
      const updatedOrder = await storage.updateOrderWithItems(order.id, orderItemsData);
      res.status(201).json(order);
    } catch (err) {
      handleError(err, res);
    }
  });

  app.get("/api/orders/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ error: "Invalid order ID" });
      }
      
      const order = await storage.getOrderById(id);
      if (!order) {
        return res.status(404).json({ error: "Order not found" });
      }
      
      res.json(order);
    } catch (err) {
      handleError(err, res);
    }
  });

  // NEWSLETTER SUBSCRIPTION
  app.post("/api/newsletter", async (req, res) => {
    try {
      const newsletterData = insertNewsletterSchema.parse(req.body);
      const subscription = await storage.subscribeToNewsletter(newsletterData);
      res.status(201).json(subscription);
    } catch (err) {
      handleError(err, res);
    }
  });

  // CONTACT FORM
  app.post("/api/contact", async (req, res) => {
    try {
      const contactData = insertContactSchema.parse(req.body);
      const submission = await storage.submitContactForm(contactData);
      res.status(201).json(submission);
    } catch (err) {
      handleError(err, res);
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
