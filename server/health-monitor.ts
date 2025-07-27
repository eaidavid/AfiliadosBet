// Premium health monitoring system for Replit optimization
import { Express } from 'express';

export function setupHealthEndpoints(app: Express) {
  // Primary health check for Replit
  app.get('/health', (req, res) => {
    res.status(200).json({ 
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: Math.floor(process.uptime())
    });
  });

  // Detailed system health
  app.get('/api/health/detailed', (req, res) => {
    const memUsage = process.memoryUsage();
    
    res.status(200).json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: Math.floor(process.uptime()),
      memory: {
        rss: Math.round(memUsage.rss / 1024 / 1024) + ' MB',
        heapTotal: Math.round(memUsage.heapTotal / 1024 / 1024) + ' MB',
        heapUsed: Math.round(memUsage.heapUsed / 1024 / 1024) + ' MB',
        external: Math.round(memUsage.external / 1024 / 1024) + ' MB'
      },
      env: process.env.NODE_ENV || 'development',
      nodeVersion: process.version,
      platform: process.platform
    });
  });

  // Keep-alive endpoint for Replit
  app.get('/ping', (req, res) => {
    res.status(200).send('pong');
  });
}

export function setupKeepAlive(port: number) {
  // Periodic self-ping to keep Replit awake
  const PING_INTERVAL = 25000; // 25 seconds
  
  const keepAlive = setInterval(async () => {
    try {
      const response = await fetch(`http://localhost:${port}/ping`);
      if (response.ok) {
        console.log(`💓 Keep-alive ping successful`);
      }
    } catch (error) {
      console.warn('⚠️ Keep-alive ping failed:', error);
    }
  }, PING_INTERVAL);

  // Clean up on process exit
  process.on('SIGTERM', () => clearInterval(keepAlive));
  process.on('SIGINT', () => clearInterval(keepAlive));
  
  return keepAlive;
}