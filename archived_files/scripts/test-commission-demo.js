#!/usr/bin/env node

/**
 * Demo Script - Sistema de Cálculo de Comissões AfiliadosBet
 * 
 * Este script demonstra como funciona a divisão matemática de comissões
 * entre afiliados e master admin usando as fórmulas implementadas.
 */

import { exec } from 'child_process';
import util from 'util';
const execPromise = util.promisify(exec);

const BASE_URL = 'http://localhost:5000';

async function testDatabase() {
  console.log('🔍 Verificando configuração da casa Brazino no banco...');
  
  try {
    const { stdout } = await execPromise(`
      psql "${process.env.DATABASE_URL}" -c "
        SELECT 
          id, name, commission_type, 
          revshare_affiliate_percent, cpa_affiliate_percent,
          commission_value, cpa_value, revshare_value
        FROM betting_houses 
        WHERE identifier = 'brazino' OR name ILIKE '%brazino%'
        LIMIT 1;
      "
    `);
    
    console.log('📊 Configuração atual:');
    console.log(stdout);
    
    // Configurar percentuais para teste
    console.log('\n⚙️ Configurando percentuais de teste...');
    await execPromise(`
      psql "${process.env.DATABASE_URL}" -c "
        UPDATE betting_houses 
        SET 
          commission_type = 'RevShare',
          commission_value = '35',
          revshare_value = '35',
          revshare_affiliate_percent = 20.00
        WHERE identifier = 'brazino' OR name ILIKE '%brazino%';
      "
    `);
    
    console.log('✅ Configuração atualizada para teste RevShare');
    return true;
  } catch (error) {
    console.error('❌ Erro na configuração:', error.message);
    return false;
  }
}

async function testRevShareCalculation() {
  console.log('\n🧮 TESTE 1: Cálculo RevShare');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  
  // Cenário: Casa tem 35% de revshare, afiliado recebe 20% desse valor
  const postbackValue = 350; // R$ 350 (35% de R$ 1000 apostado)
  
  console.log(`📋 Cenário:`);
  console.log(`   • Casa: Brazino (RevShare 35%)`);
  console.log(`   • Valor do postback: R$ ${postbackValue}`);
  console.log(`   • Percentual total da casa: 35%`);
  console.log(`   • Percentual repassado ao afiliado: 20%`);
  
  console.log(`\n🔢 Fórmula aplicada:`);
  console.log(`   • Comissão afiliado = R$ ${postbackValue} × (20/35) = R$ ${(postbackValue * 20/35).toFixed(2)}`);
  console.log(`   • Comissão master = R$ ${postbackValue} - R$ ${(postbackValue * 20/35).toFixed(2)} = R$ ${(postbackValue - (postbackValue * 20/35)).toFixed(2)}`);
  
  try {
    const response = await fetch(`${BASE_URL}/postback/brazino/deposit?subid=teste_revshare&amount=${postbackValue}&customer_id=12345`);
    const result = await response.text();
    
    if (response.ok) {
      console.log('✅ Postback processado com sucesso');
      console.log('📄 Resposta:', result);
    } else {
      console.log('⚠️ Resposta do servidor:', result.substring(0, 200) + '...');
    }
  } catch (error) {
    console.error('❌ Erro no teste:', error.message);
  }
}

async function testCPACalculation() {
  console.log('\n🧮 TESTE 2: Cálculo CPA');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  
  // Configurar casa para CPA
  try {
    await execPromise(`
      psql "${process.env.DATABASE_URL}" -c "
        UPDATE betting_houses 
        SET 
          commission_type = 'CPA',
          cpa_value = '500',
          cpa_affiliate_percent = 70.00
        WHERE identifier = 'brazino' OR name ILIKE '%brazino%';
      "
    `);
    
    const cpaValue = 500; // R$ 500 por conversão
    
    console.log(`📋 Cenário:`);
    console.log(`   • Casa: Brazino (CPA)`);
    console.log(`   • Valor CPA: R$ ${cpaValue}`);
    console.log(`   • Percentual repassado ao afiliado: 70%`);
    
    console.log(`\n🔢 Fórmula aplicada:`);
    console.log(`   • Comissão afiliado = R$ ${cpaValue} × 70% = R$ ${(cpaValue * 0.70).toFixed(2)}`);
    console.log(`   • Comissão master = R$ ${cpaValue} - R$ ${(cpaValue * 0.70).toFixed(2)} = R$ ${(cpaValue * 0.30).toFixed(2)}`);
    
    const response = await fetch(`${BASE_URL}/postback/brazino/deposit?subid=teste_cpa&amount=${cpaValue}&customer_id=12346`);
    const result = await response.text();
    
    if (response.ok) {
      console.log('✅ Postback CPA processado com sucesso');
      console.log('📄 Resposta:', result);
    } else {
      console.log('⚠️ Resposta do servidor:', result.substring(0, 200) + '...');
    }
    
  } catch (error) {
    console.error('❌ Erro no teste CPA:', error.message);
  }
}

async function checkConversions() {
  console.log('\n📊 VERIFICAÇÃO DOS RESULTADOS');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  
  try {
    const { stdout } = await execPromise(`
      psql "${process.env.DATABASE_URL}" -c "
        SELECT 
          id, subid, amount, commission, master_commission,
          commission_type, created_at
        FROM conversions 
        WHERE subid LIKE 'teste_%'
        ORDER BY created_at DESC
        LIMIT 5;
      "
    `);
    
    console.log('🎯 Conversões registradas:');
    console.log(stdout);
    
    // Mostrar dados detalhados
    const { stdout: details } = await execPromise(`
      psql "${process.env.DATABASE_URL}" -c "
        SELECT 
          subid,
          amount as valor_postback,
          commission as comissao_afiliado,
          master_commission as comissao_master,
          (commission + COALESCE(master_commission, 0)) as total_verificacao,
          conversion_data
        FROM conversions 
        WHERE subid LIKE 'teste_%'
        ORDER BY created_at DESC;
      "
    `);
    
    console.log('\n📋 Detalhamento das comissões:');
    console.log(details);
    
  } catch (error) {
    console.error('❌ Erro na verificação:', error.message);
  }
}

async function runDemo() {
  console.log('🚀 DEMO - Sistema de Cálculo de Comissões AfiliadosBet');
  console.log('══════════════════════════════════════════════════════════');
  
  const dbConfigured = await testDatabase();
  if (!dbConfigured) {
    console.log('❌ Falha na configuração do banco. Abortando demo.');
    return;
  }
  
  await testRevShareCalculation();
  await new Promise(resolve => setTimeout(resolve, 2000)); // Aguardar 2s
  
  await testCPACalculation();
  await new Promise(resolve => setTimeout(resolve, 2000)); // Aguardar 2s
  
  await checkConversions();
  
  console.log('\n🎉 Demo concluído!');
  console.log('💡 Próximos passos: Verificar no painel admin os resultados detalhados');
}

// Executar demo se chamado diretamente
if (import.meta.url === `file://${process.argv[1]}`) {
  runDemo().catch(console.error);
}

export { runDemo };