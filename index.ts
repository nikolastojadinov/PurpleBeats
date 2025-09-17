import "dotenv/config";
import express, { type Request, type Response, type NextFunction } from "express";
import path, { dirname } from "path";
import { fileURLToPath } from "url";
import fs from "fs";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";

// --- ESM ekvivalenti za __filename i __dirname ---
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();

// CORS configuration for Pi Network integration
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  
  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    res.sendStatus(200);
  } else {
    next();
  }
});

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// --- Logging middleware samo za API rute ---
app.use((req, res, next) => {
  const start = Date.now();
  const pathName = req.path;
  let capturedJsonResponse: Record<string, any> | undefined;

  const originalResJson = res.json.bind(res);
  // @ts-ignore
  res.json = (bodyJson: any, ...args: any[]) => {
    capturedJsonResponse = bodyJson;
    return originalResJson(bodyJson, ...args);
  };

  res.on("finish", () => {
    if (pathName.startsWith("/api")) {
      const duration = Date.now() - start;
      let line = `${req.method} ${pathName} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) line += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      if (line.length > 80) line = line.slice(0, 79) + "…";
      log(line);
    }
  });

  next();
});

(async () => {
  const server = await registerRoutes(app);

  // --- Public direktorijum ---
  const ROOT = path.join(__dirname, "..");
  const PUBLIC_DIR = path.join(ROOT, "public");
  const ASSETS_DIR = path.join(ROOT, "attached_assets");

  // Serviraj sve fajlove iz public foldera (npr. validation-key.txt)
  app.use(express.static(PUBLIC_DIR));
  
  // Serviraj slike iz attached_assets direktorijuma
  app.use("/attached_assets", express.static(ASSETS_DIR));

  // Eksplicitno serviraj privacy i terms
  app.get("/privacy", (_req, res) => {
    res.sendFile(path.join(PUBLIC_DIR, "privacy", "index.html"));
  });

  app.get("/terms", (_req, res) => {
    res.sendFile(path.join(PUBLIC_DIR, "terms", "index.html"));
  });

  app.get("/legal", (_req, res) => {
    res.sendFile(path.join(PUBLIC_DIR, "legal", "index.html"));
  });

  // Eksplicitno za validation-key.txt (ako Pi zahteva striktno)
  app.get("/validation-key.txt", (_req, res) => {
    res.sendFile(path.join(PUBLIC_DIR, "validation-key.txt"));
  });

  // --- Global error handler ---
  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err?.status || err?.statusCode || 500;
    const message = err?.message || "Internal Server Error";
    res.status(status).json({ message });
    throw err;
  });

  // --- Development vs Production ---
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    // In production, serve the built client files from the correct location
    const clientDistPath = path.join(__dirname, "..", "public");
    
    // Check if build directory exists
    if (!fs.existsSync(clientDistPath)) {
      throw new Error(
        `Could not find the build directory: ${clientDistPath}, make sure to build the client first`
      );
    }
    
    // Serve static files for the React app
    app.use(express.static(clientDistPath));
    
    // SPA fallback - serve index.html for unmatched routes
    app.use("*", (_req, res) => {
      res.sendFile(path.join(clientDistPath, "index.html"));
    });
  }

  // --- Start servera ---
  const port = parseInt(process.env.PORT || "5000", 10);
  server.listen(
    { port, host: "0.0.0.0" },
    () => log(`serving on port ${port}`)
  );
  
  // FORCE development environment for Pi authentication
  process.env.NODE_ENV = process.env.NODE_ENV || 'development';
  process.env.PI_SKIP_VERIFY = process.env.PI_SKIP_VERIFY || 'true';
  
  console.log("Server started with Pi API key:", process.env.PI_API_KEY ? "CONFIGURED" : "MISSING");
  console.log("NODE_ENV:", process.env.NODE_ENV);
  console.log("PI_SKIP_VERIFY:", process.env.PI_SKIP_VERIFY);
})();
