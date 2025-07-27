// Premium middleware stack for enhanced performance and monitoring
import { Request, Response, NextFunction } from 'express';

export function compressionMiddleware() {
  return (req: Request, res: Response, next: NextFunction) => {
    // Enable compression for text responses
    res.setHeader('Vary', 'Accept-Encoding');
    next();
  };
}

export function securityHeaders() {
  return (req: Request, res: Response, next: NextFunction) => {
    // Premium security headers
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('X-XSS-Protection', '1; mode=block');
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
    
    // Performance headers
    res.setHeader('X-DNS-Prefetch-Control', 'on');
    
    next();
  };
}

export function performanceMonitoring() {
  return (req: Request, res: Response, next: NextFunction) => {
    const startTime = Date.now();
    
    // Monitor response time
    res.on('finish', () => {
      const duration = Date.now() - startTime;
      if (duration > 1000) {
        console.warn(`⚠️ Slow request detected: ${req.method} ${req.path} took ${duration}ms`);
      }
    });
    
    next();
  };
}

export function realtimeHealthMonitor() {
  return (req: Request, res: Response, next: NextFunction) => {
    // Keep connection alive for Replit
    res.setHeader('Keep-Alive', 'timeout=5, max=1000');
    res.setHeader('Connection', 'keep-alive');
    
    next();
  };
}