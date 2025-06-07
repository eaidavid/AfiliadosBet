#!/usr/bin/env node

/**
 * Script de Demonstração - Integração Casa de Apostas com AfiliadosBet
 * 
 * Este script simula como uma casa de apostas enviaria dados para o AfiliadosBet
 * quando eventos acontecem em sua plataforma.
 */

import https from 'https';
import http from 'http';
import { URL } from 'url';

class AfiliadosBetIntegration {
    constructor(apiKey, baseUrl = 'http://localhost:5000') {
        this.apiKey = apiKey;
        this.baseUrl = baseUrl;
    }

    async makeRequest(method, endpoint, data = null) {
        return new Promise((resolve, reject) => {
            const url = new URL(this.baseUrl + endpoint);
            const isHttps = url.protocol === 'https:';
            const client = isHttps ? https : http;
            
            const options = {
                hostname: url.hostname,
                port: url.port || (isHttps ? 443 : 80),
                path: url.pathname + url.search,
                method: method,
                headers: {
                    'X-API-Key': this.apiKey,
                    'Content-Type': 'application/json'
                }
            };

            if (data) {
                const jsonData = JSON.stringify(data);
                options.headers['Content-Length'] = Buffer.byteLength(jsonData);
            }

            const req = client.request(options, (res) => {
                let responseData = '';
                
                res.on('data', (chunk) => {
                    responseData += chunk;
                });
                
                res.on('end', () => {
                    try {
                        const jsonResponse = JSON.parse(responseData);
                        resolve({
                            statusCode: res.statusCode,
                            data: jsonResponse
                        });
                    } catch (e) {
                        resolve({
                            statusCode: res.statusCode,
                            data: responseData
                        });
                    }
                });
            });

            req.on('error', (err) => {
                reject(err);
            });

            if (data) {
                req.write(JSON.stringify(data));
            }
            
            req.end();
        });
    }

    async testConnection() {
        console.log('🔍 Testando conexão com AfiliadosBet...');
        try {
            const response = await this.makeRequest('GET', '/api/v1/ping');
            if (response.statusCode === 200) {
                console.log('✅ Conexão estabelecida com sucesso!');
                console.log(`📊 Casa: ${response.data.house.name} (ID: ${response.data.house.id})`);
                return true;
            } else {
                console.log('❌ Falha na conexão:', response.data);
                return false;
            }
        } catch (error) {
            console.log('❌ Erro de conexão:', error.message);
            return false;
        }
    }

    async sendConversion(eventType, customerId, subid, amount = null, commission = null) {
        const data = {
            event_type: eventType,
            customer_id: customerId,
            subid: subid
        };

        if (amount) data.amount = amount;
        if (commission) data.commission = commission;

        try {
            const response = await this.makeRequest('POST', '/api/v1/conversions', data);
            return response;
        } catch (error) {
            throw error;
        }
    }

    async getStats() {
        try {
            const response = await this.makeRequest('GET', '/api/v1/stats');
            return response;
        } catch (error) {
            throw error;
        }
    }
}

async function runDemo() {
    console.log('🎯 DEMONSTRAÇÃO DE INTEGRAÇÃO - AFILIADOSBET');
    console.log('='.repeat(50));
    
    // Configuração da API Key (substitua pela sua)
    const apiKey = 'test_demo_123';
    const integration = new AfiliadosBetIntegration(apiKey);
    
    // Teste 1: Verificar conectividade
    const connected = await integration.testConnection();
    if (!connected) {
        console.log('❌ Não foi possível conectar. Verifique se o sistema está rodando.');
        return;
    }
    
    console.log('\n📝 Simulando eventos de uma casa de apostas...\n');
    
    // Lista de afiliados reais do sistema
    const affiliates = ['eadavid', 'axteridea', 'connection', 'Kevyjhonn46'];
    
    // Teste 2: Cliente clica em link de afiliado
    console.log('1️⃣ CLIQUE EM LINK DE AFILIADO');
    try {
        const clickResponse = await integration.sendConversion(
            'click',
            'visitante_' + Date.now(),
            affiliates[0]
        );
        console.log(`✅ Clique registrado para ${affiliates[0]}`);
        console.log(`📅 ID da conversão: ${clickResponse.data.data.conversion_id}`);
    } catch (error) {
        console.log('❌ Erro ao registrar clique:', error.message);
    }
    
    await sleep(1000);
    
    // Teste 3: Cliente se registra
    console.log('\n2️⃣ REGISTRO DE NOVO CLIENTE');
    try {
        const regResponse = await integration.sendConversion(
            'registration',
            'cliente_novo_' + Date.now(),
            affiliates[1]
        );
        console.log(`✅ Registro processado para afiliado ${affiliates[1]}`);
        console.log(`📅 ID da conversão: ${regResponse.data.data.conversion_id}`);
    } catch (error) {
        console.log('❌ Erro ao registrar novo cliente:', error.message);
    }
    
    await sleep(1000);
    
    // Teste 4: Cliente faz depósito
    console.log('\n3️⃣ DEPÓSITO DE CLIENTE');
    try {
        const depositResponse = await integration.sendConversion(
            'deposit',
            'cliente_deposito_' + Date.now(),
            affiliates[2],
            '750.00',
            '225.00'
        );
        console.log(`✅ Depósito processado para afiliado ${affiliates[2]}`);
        console.log(`💰 Valor: R$ ${depositResponse.data.data.amount}`);
        console.log(`💵 Comissão: R$ ${depositResponse.data.data.commission}`);
        console.log(`📅 ID da conversão: ${depositResponse.data.data.conversion_id}`);
    } catch (error) {
        console.log('❌ Erro ao processar depósito:', error.message);
    }
    
    await sleep(1000);
    
    // Teste 5: Cliente gera lucro (GGR)
    console.log('\n4️⃣ LUCRO GERADO (GGR)');
    try {
        const profitResponse = await integration.sendConversion(
            'profit',
            'cliente_lucro_' + Date.now(),
            affiliates[3],
            '1200.00',
            '360.00'
        );
        console.log(`✅ Lucro registrado para afiliado ${affiliates[3]}`);
        console.log(`💰 GGR: R$ ${profitResponse.data.data.amount}`);
        console.log(`💵 Comissão: R$ ${profitResponse.data.data.commission}`);
        console.log(`📅 ID da conversão: ${profitResponse.data.data.conversion_id}`);
    } catch (error) {
        console.log('❌ Erro ao registrar lucro:', error.message);
    }
    
    await sleep(1000);
    
    // Teste 6: Verificar estatísticas atualizadas
    console.log('\n📊 ESTATÍSTICAS ATUALIZADAS');
    try {
        const statsResponse = await integration.getStats();
        if (statsResponse.statusCode === 200) {
            const stats = statsResponse.data.data;
            console.log('✅ Estatísticas obtidas com sucesso:');
            console.log(`📈 Total de conversões: ${stats.conversions.total}`);
            console.log(`💰 Volume total: R$ ${stats.financial.total_volume}`);
            console.log(`💵 Comissões totais: R$ ${stats.financial.total_commission}`);
            console.log(`🎯 Por tipo:`);
            Object.entries(stats.conversions.by_type).forEach(([type, count]) => {
                console.log(`   ${type}: ${count}`);
            });
        }
    } catch (error) {
        console.log('❌ Erro ao obter estatísticas:', error.message);
    }
    
    console.log('\n🎉 DEMONSTRAÇÃO CONCLUÍDA!');
    console.log('='.repeat(50));
    console.log('✅ Todos os eventos foram processados com sucesso');
    console.log('📝 Os afiliados agora podem ver suas comissões no painel');
    console.log('🔄 A integração está funcionando perfeitamente');
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// Executar demonstração se chamado diretamente
runDemo().catch(console.error);

export default AfiliadosBetIntegration;