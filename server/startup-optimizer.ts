// Premium startup optimizer with port management and crash prevention
import { exec } from 'child_process';
import { promisify } from 'util';
import { createServer } from 'net';

const execAsync = promisify(exec);

export async function findAvailablePort(startPort = 5001, maxPort = 5100) {
  for (let port = startPort; port <= maxPort; port++) {
    try {
      await new Promise((resolve, reject) => {
        const server = createServer();
        server.listen(port, () => {
          server.once('close', () => resolve(port));
          server.close();
        });
        server.on('error', () => reject());
      });
      return port;
    } catch (error) {
      continue;
    }
  }
  throw new Error(`No available port found between ${startPort} and ${maxPort}`);
}

export async function killExistingProcesses(port) {
  try {
    // Kill any existing processes on the port with fallback methods
    try {
      await execAsync(`pkill -f "tsx server/index.ts"`);
    } catch {}
    
    try {
      await execAsync(`pkill -f "node.*server/index.ts"`);  
    } catch {}
    
    // Wait for processes to terminate
    await new Promise(resolve => setTimeout(resolve, 1000));
    console.log('Process cleanup completed');
  } catch (error) {
    console.log('Process cleanup completed with warnings');
  }
}

export function setupGracefulShutdown(server) {
  const gracefulShutdown = (signal) => {
    console.log(`\n🛑 Received ${signal}. Starting graceful shutdown...`);
    
    server.close((error) => {
      if (error) {
        console.error('❌ Error during server shutdown:', error);
        process.exit(1);
      }
      
      console.log('✅ Server closed successfully');
      process.exit(0);
    });
    
    // Force shutdown after 10 seconds
    setTimeout(() => {
      console.log('⚡ Force shutdown after timeout');
      process.exit(1);
    }, 10000);
  };
  
  process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
  process.on('SIGINT', () => gracefulShutdown('SIGINT'));
  process.on('SIGUSR2', () => gracefulShutdown('SIGUSR2')); // nodemon restart
}

export function setupRealtimeHealthCheck(port) {
  // Keep the process alive and responsive to Replit
  const healthInterval = setInterval(() => {
    // Heartbeat to prevent idle timeout
    if (process.env.NODE_ENV !== 'production') {
      console.log(`💓 Health check - Server alive on port ${port}`);
    }
  }, 30000); // Every 30 seconds
  
  process.on('exit', () => {
    clearInterval(healthInterval);
  });
}