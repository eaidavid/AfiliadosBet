// Replit-specific optimizations for premium stability
export function setupKeepAlive(port: number) {
  console.log(`🔥 Setting up Replit keep-alive system on port ${port}`);
  
  // Simple interval to keep the process active
  const keepAliveInterval = setInterval(() => {
    const timestamp = new Date().toLocaleTimeString();
    console.log(`💓 Keep-alive heartbeat: ${timestamp}`);
  }, 30000); // Every 30 seconds

  // Cleanup on exit
  process.on('SIGTERM', () => clearInterval(keepAliveInterval));
  process.on('SIGINT', () => clearInterval(keepAliveInterval));

  return keepAliveInterval;
}