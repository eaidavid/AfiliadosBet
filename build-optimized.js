#!/usr/bin/env node

/**
 * Optimized Build Script for AfiliadosBet
 * Handles Vite build with better performance and error handling
 */

import { spawn } from 'child_process';
import { existsSync, mkdirSync } from 'fs';
import path from 'path';

const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

function log(message, color = colors.reset) {
  console.log(`${color}${message}${colors.reset}`);
}

function error(message) {
  log(`❌ ERROR: ${message}`, colors.red);
}

function success(message) {
  log(`✅ ${message}`, colors.green);
}

function info(message) {
  log(`ℹ️ ${message}`, colors.blue);
}

function warning(message) {
  log(`⚠️ ${message}`, colors.yellow);
}

async function runCommand(command, args, options = {}) {
  return new Promise((resolve, reject) => {
    info(`Executando: ${command} ${args.join(' ')}`);
    
    const process = spawn(command, args, {
      stdio: 'inherit',
      shell: true,
      ...options
    });

    process.on('close', (code) => {
      if (code === 0) {
        resolve();
      } else {
        reject(new Error(`Comando falhou com código ${code}`));
      }
    });

    process.on('error', reject);
  });
}

async function checkPrerequisites() {
  info('Verificando pré-requisitos...');
  
  // Verificar se existe client/index.html
  if (!existsSync('client/index.html')) {
    throw new Error('Arquivo client/index.html não encontrado');
  }
  
  // Verificar se existe client/src/main.tsx
  if (!existsSync('client/src/main.tsx')) {
    throw new Error('Arquivo client/src/main.tsx não encontrado');
  }
  
  // Verificar se existe package.json
  if (!existsSync('package.json')) {
    throw new Error('Arquivo package.json não encontrado');
  }
  
  success('Pré-requisitos verificados');
}

async function cleanBuild() {
  info('Limpando diretório de build...');
  
  // Criar diretório dist se não existir
  if (!existsSync('dist')) {
    mkdirSync('dist', { recursive: true });
  }
  
  if (!existsSync('dist/public')) {
    mkdirSync('dist/public', { recursive: true });
  }
  
  success('Diretório preparado');
}

async function buildFrontend() {
  info('Iniciando build do frontend...');
  
  try {
    // Set environment variables for better performance
    const env = {
      ...process.env,
      NODE_ENV: 'production',
      VITE_NODE_ENV: 'production',
      // Disable source maps for faster build
      GENERATE_SOURCEMAP: 'false'
    };
    
    await runCommand('npx', ['vite', 'build'], { env });
    success('Frontend buildado com sucesso');
  } catch (err) {
    error(`Falha no build do frontend: ${err.message}`);
    throw err;
  }
}

async function buildBackend() {
  info('Iniciando build do backend...');
  
  try {
    await runCommand('npx', [
      'esbuild',
      'server/index.ts',
      '--platform=node',
      '--packages=external',
      '--bundle',
      '--format=esm',
      '--outdir=dist',
      '--minify',
      '--target=node18'
    ]);
    success('Backend buildado com sucesso');
  } catch (err) {
    error(`Falha no build do backend: ${err.message}`);
    throw err;
  }
}

async function verifyBuild() {
  info('Verificando build...');
  
  const requiredFiles = [
    'dist/public/index.html',
    'dist/index.js'
  ];
  
  for (const file of requiredFiles) {
    if (!existsSync(file)) {
      throw new Error(`Arquivo necessário não encontrado: ${file}`);
    }
  }
  
  success('Build verificado com sucesso');
}

async function main() {
  const startTime = Date.now();
  
  try {
    log('\n🚀 Iniciando build otimizado do AfiliadosBet\n', colors.cyan);
    
    await checkPrerequisites();
    await cleanBuild();
    await buildFrontend();
    await buildBackend();
    await verifyBuild();
    
    const duration = ((Date.now() - startTime) / 1000).toFixed(2);
    
    log('\n🎉 Build concluído com sucesso!', colors.green);
    info(`Tempo total: ${duration}s`);
    info('Arquivos gerados:');
    info('  - dist/public/ (frontend)');
    info('  - dist/index.js (backend)');
    log('\n📦 Pronto para deploy!\n', colors.cyan);
    
  } catch (err) {
    error(`Build falhou: ${err.message}`);
    process.exit(1);
  }
}

// Execute se chamado diretamente
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}