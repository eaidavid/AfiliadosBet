export default {
  apps: [{
    name: 'afiliadosbet',
    script: 'dist/index.js',
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '1G',
    env: {
      NODE_ENV: 'production',
      PORT: 5000,
      DATABASE_URL: 'postgresql://afiliadosbet:AfiliadosBet1001@localhost:5432/afiliadosbet'
    }
  }]
};