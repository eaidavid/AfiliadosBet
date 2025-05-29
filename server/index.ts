import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";

const app = express();

app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  if (path.startsWith("/api/")) {
    const originalSend = res.send;
    const originalJson = res.json;

    res.send = function (body) {
      return originalSend.call(this, body);
    };

    res.json = function (body) {
      capturedJsonResponse = body;
      return originalJson.call(this, body);
    };
  }

  const originalEnd = res.end;
  res.end = function (chunk?: any, encoding?: any) {
    res.end = originalEnd;
    const duration = Date.now() - start;

    if (path.startsWith("/api")) {
      const formattedJson = capturedJsonResponse
        ? `:: ${JSON.stringify(capturedJsonResponse).slice(0, 80)}...`
        : "";

      log(`${req.method} ${path} ${res.statusCode} in ${duration}ms ${formattedJson}`);
    }

    return originalEnd.call(this, chunk, encoding);
  };
  next();
});

app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
  const status = err.status || err.statusCode || 500;
  const message = err.message || "Internal Server Error";

  res.status(status).json({ message });
  log(`Unhandled application error: ${err.message}`);
});

(async () => {
  try {
    const server = await registerRoutes(app);
    if (process.env.NODE_ENV === "development") {
      await setupVite(app, server);
    } else {
      serveStatic(app);
    }
  } catch (error) {
    console.error("Erro ao iniciar servidor:", error);
    process.exit(1);
  }
})();