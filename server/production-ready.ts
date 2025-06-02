import express from "express";
import { registerRoutes } from "./routes";
import { serveStatic } from "./vite";

const app = express();

// Middleware básico
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Error handling
app.use((error: any, req: any, res: any, next: any) => {
  console.error('Server error:', error);
  res.status(500).json({ error: 'Internal server error' });
});

(async () => {
  console.log("Starting AfiliadosBet production server");
  
  try {
    await registerRoutes(app);
    serveStatic(app);
    
    const PORT = parseInt(process.env.PORT || "4000", 10);
    
    app.listen(PORT, "0.0.0.0", () => {
      console.log(`AfiliadosBet server running on port ${PORT}`);
      console.log("Application ready for production");
    });
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
})();