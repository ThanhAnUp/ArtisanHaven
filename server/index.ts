import express from "express";
import type { Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes.js";
import { db } from "./db.js";
import { pgStorage } from "./pgStorage.js";
import path from "path";

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: any = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "…";
      }

      console.log(`${new Date().toLocaleTimeString()} [express] ${logLine}`);
    }
  });

  next();
});

(async () => {
  try {
    await pgStorage.initializeDatabase();
    console.log(
      `${new Date().toLocaleTimeString()} [express] Database initialized successfully with sample data.`,
    );
  } catch (error) {
    console.log(
      `${new Date().toLocaleTimeString()} [express] Error initializing database: ${error}`,
    );
  }

  const server = await registerRoutes(app);

  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";
    res.status(status).json({ message });
    throw err;
  });

  // Serve static files based on environment
  const publicPath = path.resolve("dist/public");
  // if (process.env.NODE_ENV === "development") {
  //   const { setupVite } = await import("./vite.js");
  //   await setupVite(app, server);
  // } else {
  //   // In production, serve from dist/public directory
  //   app.use(express.static(publicPath));
  //   app.get("*", (_req, res) => {
  //     // Ensure the response is sent even if file doesn't exist
  //     res.sendFile(path.join(publicPath, "index.html"), (err) => {
  //       if (err) {
  //         console.error("Error sending file:", err);
  //         res.status(500).send("Internal Server Error");
  //       }
  //     });
  //   });
  // }

  app.use(express.static(publicPath));
  app.get("*", (_req, res) => {
    // Ensure the response is sent even if file doesn't exist
    res.sendFile(path.join(publicPath, "index.html"), (err) => {
      if (err) {
        console.error("Error sending file:", err);
        res.status(500).send("Internal Server Error");
      }
    });
  });

  const port = 5000;
  server.listen(
    {
      port,
      host: "0.0.0.0",
      reusePort: true,
    },
    () => {
      console.log(
        `${new Date().toLocaleTimeString()} [express] serving on port ${port}`,
      );
    },
  );
})();
