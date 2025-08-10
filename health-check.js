#!/usr/bin/env node

// Script de verificação de saúde do AfiliadosBet
// Pode ser usado para monitoramento e auto-restart

const http = require('http');

const PORT = process.env.PORT || 5000;
const HOST = process.env.HOST || 'localhost';

function checkHealth() {
  return new Promise((resolve, reject) => {
    const req = http.request({
      hostname: HOST,
      port: PORT,
      path: '/api/health',
      method: 'GET',
      timeout: 5000
    }, (res) => {
      if (res.statusCode === 200) {
        resolve('OK');
      } else {
        reject(new Error(`Status: ${res.statusCode}`));
      }
    });

    req.on('error', reject);
    req.on('timeout', () => {
      req.destroy();
      reject(new Error('Timeout'));
    });

    req.end();
  });
}

async function main() {
  try {
    await checkHealth();
    console.log('✅ Aplicação está saudável');
    process.exit(0);
  } catch (error) {
    console.error('❌ Aplicação não está respondendo:', error.message);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = { checkHealth };