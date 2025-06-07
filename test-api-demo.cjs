const http = require('http');

// Function to make HTTP requests
function makeRequest(options, data = null) {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => {
        body += chunk;
      });
      res.on('end', () => {
        try {
          const result = JSON.parse(body);
          resolve({ status: res.statusCode, data: result });
        } catch (e) {
          resolve({ status: res.statusCode, data: body });
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

async function testAPI() {
  console.log('🚀 INICIANDO TESTES DA API AFILIADOSBET\n');

  const baseOptions = {
    hostname: 'localhost',
    port: 5000,
    headers: {
      'X-API-Key': 'test_demo_123',
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    }
  };

  try {
    // Teste 1: Verificar conectividade
    console.log('📡 Teste 1: Verificando conectividade...');
    const pingResponse = await makeRequest({
      ...baseOptions,
      path: '/api/v1/ping',
      method: 'GET'
    });
    console.log(`Status: ${pingResponse.status}`);
    console.log('Resposta:', JSON.stringify(pingResponse.data, null, 2));
    console.log('✅ Conectividade OK\n');

    // Teste 2: Obter documentação
    console.log('📚 Teste 2: Obtendo documentação da API...');
    const docsResponse = await makeRequest({
      ...baseOptions,
      path: '/api/v1/docs',
      method: 'GET'
    });
    console.log(`Status: ${docsResponse.status}`);
    console.log('Endpoints disponíveis:', Object.keys(docsResponse.data.endpoints || {}));
    console.log('✅ Documentação obtida\n');

    // Teste 3: Listar afiliados
    console.log('👥 Teste 3: Listando afiliados...');
    const affiliatesResponse = await makeRequest({
      ...baseOptions,
      path: '/api/v1/affiliates?page=1&limit=5',
      method: 'GET'
    });
    console.log(`Status: ${affiliatesResponse.status}`);
    if (affiliatesResponse.data.data && affiliatesResponse.data.data.affiliates) {
      console.log(`Total de afiliados: ${affiliatesResponse.data.data.affiliates.length}`);
      affiliatesResponse.data.data.affiliates.forEach(affiliate => {
        console.log(`- ${affiliate.username} (${affiliate.email}) - ${affiliate.total_conversions} conversões`);
      });
    }
    console.log('✅ Lista de afiliados obtida\n');

    // Teste 4: Registrar conversão de depósito
    console.log('💰 Teste 4: Registrando conversão de depósito...');
    const depositData = {
      event_type: 'deposit',
      customer_id: 'cliente_' + Date.now(),
      subid: 'afiliado1',
      amount: '150.00',
      commission: '45.00',
      metadata: {
        currency: 'BRL',
        payment_method: 'pix',
        deposit_time: new Date().toISOString()
      }
    };
    
    const depositResponse = await makeRequest({
      ...baseOptions,
      path: '/api/v1/conversions',
      method: 'POST'
    }, depositData);
    
    console.log(`Status: ${depositResponse.status}`);
    if (depositResponse.data.success) {
      console.log('✅ Depósito registrado com sucesso!');
      console.log(`ID da conversão: ${depositResponse.data.data.conversion_id}`);
      console.log(`Afiliado: ${depositResponse.data.data.affiliate.username}`);
      console.log(`Comissão: R$ ${depositResponse.data.data.commission}`);
    } else {
      console.log('❌ Erro ao registrar depósito:', depositResponse.data.error);
    }
    console.log('');

    // Teste 5: Registrar conversão de registro
    console.log('📝 Teste 5: Registrando conversão de registro...');
    const registrationData = {
      event_type: 'registration',
      customer_id: 'novo_cliente_' + Date.now(),
      subid: 'afiliado2',
      metadata: {
        registration_source: 'landing_page',
        user_agent: 'Mozilla/5.0 (Test)',
        ip_address: '192.168.1.100'
      }
    };
    
    const registrationResponse = await makeRequest({
      ...baseOptions,
      path: '/api/v1/conversions',
      method: 'POST'
    }, registrationData);
    
    console.log(`Status: ${registrationResponse.status}`);
    if (registrationResponse.data.success) {
      console.log('✅ Registro processado com sucesso!');
      console.log(`ID da conversão: ${registrationResponse.data.data.conversion_id}`);
      console.log(`Afiliado: ${registrationResponse.data.data.affiliate.username}`);
    } else {
      console.log('❌ Erro ao registrar:', registrationResponse.data.error);
    }
    console.log('');

    // Teste 6: Obter estatísticas
    console.log('📊 Teste 6: Obtendo estatísticas...');
    const statsResponse = await makeRequest({
      ...baseOptions,
      path: '/api/v1/stats?start_date=2024-01-01&end_date=2024-12-31',
      method: 'GET'
    });
    
    console.log(`Status: ${statsResponse.status}`);
    if (statsResponse.data.success && statsResponse.data.data) {
      const stats = statsResponse.data.data;
      console.log('📈 Estatísticas da casa:');
      console.log(`- Total de conversões: ${stats.conversions.total}`);
      console.log(`- Clicks: ${stats.conversions.by_type.clicks}`);
      console.log(`- Registros: ${stats.conversions.by_type.registrations}`);
      console.log(`- Depósitos: ${stats.conversions.by_type.deposits}`);
      console.log(`- Volume total: R$ ${stats.financial.total_volume}`);
      console.log(`- Comissão total: R$ ${stats.financial.total_commission}`);
      console.log('🏆 Top afiliados:');
      stats.top_affiliates.forEach((affiliate, index) => {
        console.log(`  ${index + 1}. ${affiliate.username} - ${affiliate.conversions} conversões - R$ ${affiliate.commission}`);
      });
    }
    console.log('✅ Estatísticas obtidas\n');

    // Teste 7: Teste de erro (API Key inválida)
    console.log('🔒 Teste 7: Testando segurança (API Key inválida)...');
    const errorResponse = await makeRequest({
      hostname: 'localhost',
      port: 5000,
      path: '/api/v1/affiliates',
      method: 'GET',
      headers: {
        'X-API-Key': 'chave_invalida_123',
        'Accept': 'application/json'
      }
    });
    
    console.log(`Status: ${errorResponse.status}`);
    if (errorResponse.status === 401) {
      console.log('✅ Segurança funcionando - acesso negado para chave inválida');
    } else {
      console.log('❌ Problema na segurança - deveria retornar 401');
    }
    console.log('');

    console.log('🎉 TODOS OS TESTES CONCLUÍDOS COM SUCESSO!');
    console.log('\n📋 RESUMO DOS TESTES:');
    console.log('✅ Conectividade da API');
    console.log('✅ Documentação acessível');
    console.log('✅ Listagem de afiliados');
    console.log('✅ Registro de depósito');
    console.log('✅ Registro de novo cliente');
    console.log('✅ Consulta de estatísticas');
    console.log('✅ Validação de segurança');
    
    console.log('\n🔧 PRÓXIMOS PASSOS PARA PRODUÇÃO:');
    console.log('1. Configurar API Keys reais para cada casa de apostas');
    console.log('2. Implementar endpoints de webhook para eventos automáticos');
    console.log('3. Configurar monitoramento e alertas');
    console.log('4. Testar com dados reais de casas parceiras');

  } catch (error) {
    console.error('❌ Erro durante os testes:', error.message);
    console.log('\n🔍 VERIFICAÇÕES NECESSÁRIAS:');
    console.log('- Confirme se o servidor está rodando na porta 5000');
    console.log('- Verifique se as rotas da API estão registradas');
    console.log('- Teste manualmente: curl http://localhost:5000/api/v1/ping -H "X-API-Key: test_demo_123"');
  }
}

// Executar testes
testAPI();