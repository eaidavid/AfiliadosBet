const express = require('express');
const app = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// CORS for testing
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'X-API-Key, Content-Type');
  res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  next();
});

// Webhook: Ping/Status
app.get('/ping', (req, res) => {
  const apiKey = req.headers['x-api-key'];
  
  if (!apiKey) {
    return res.status(401).json({ 
      success: false,
      error: 'API Key required'
    });
  }

  console.log(`🏓 PING recebido da casa com API Key: ${apiKey}`);

  return res.status(200).json({
    success: true,
    message: 'AfiliadosBet webhook receiver is active',
    house: {
      id: 1,
      name: 'Casa Demo'
    },
    timestamp: new Date().toISOString(),
    endpoints: [
      'POST /conversions - Receber conversões',
      'POST /clicks - Receber cliques',
      'GET /ping - Testar conectividade'
    ]
  });
});

// Webhook: Receber conversões
app.post('/conversions', (req, res) => {
  const apiKey = req.headers['x-api-key'];
  
  if (!apiKey) {
    return res.status(401).json({ 
      success: false,
      error: 'API Key required'
    });
  }

  const { event_type, customer_id, subid, amount, commission, metadata } = req.body;

  if (!event_type || !customer_id || !subid) {
    return res.status(400).json({
      success: false,
      error: 'Missing required fields',
      required: ['event_type', 'customer_id', 'subid']
    });
  }

  const conversionId = Math.floor(Math.random() * 100000);
  
  console.log(`💰 CONVERSÃO RECEBIDA:`);
  console.log(`  - Tipo: ${event_type}`);
  console.log(`  - Cliente: ${customer_id}`);
  console.log(`  - Afiliado: ${subid}`);
  console.log(`  - Valor: R$ ${amount || '0.00'}`);
  console.log(`  - Comissão: R$ ${commission || '0.00'}`);
  console.log(`  - Timestamp: ${new Date().toISOString()}`);

  return res.status(200).json({
    success: true,
    message: 'Conversion received and processed successfully',
    data: {
      conversion_id: conversionId,
      affiliate: {
        id: 1,
        username: subid,
        email: `${subid}@exemplo.com`
      },
      house: {
        id: 1,
        name: 'Casa Demo'
      },
      event_type,
      amount: amount || '0.00',
      commission: commission || '0.00',
      processed_at: new Date().toISOString()
    }
  });
});

// Webhook: Receber cliques
app.post('/clicks', (req, res) => {
  const apiKey = req.headers['x-api-key'];
  
  if (!apiKey) {
    return res.status(401).json({ 
      success: false,
      error: 'API Key required'
    });
  }

  const { subid, customer_id, ip_address, landing_page } = req.body;

  if (!subid) {
    return res.status(400).json({
      success: false,
      error: 'Missing required field: subid'
    });
  }

  const clickId = Math.floor(Math.random() * 100000);
  
  console.log(`👆 CLIQUE RECEBIDO:`);
  console.log(`  - Afiliado: ${subid}`);
  console.log(`  - Cliente: ${customer_id || 'N/A'}`);
  console.log(`  - IP: ${ip_address || 'N/A'}`);
  console.log(`  - Página: ${landing_page || 'N/A'}`);
  console.log(`  - Timestamp: ${new Date().toISOString()}`);

  return res.status(200).json({
    success: true,
    message: 'Click tracked successfully',
    data: {
      click_id: clickId,
      affiliate_id: 1,
      house_id: 1
    }
  });
});

// Documentação
app.get('/docs', (req, res) => {
  const apiKey = req.headers['x-api-key'];
  
  if (!apiKey) {
    return res.status(401).json({ 
      success: false,
      error: 'API Key required'
    });
  }

  return res.status(200).json({
    title: 'AfiliadosBet Webhook API - Sistema Receptor',
    description: 'API para casas de apostas enviarem dados em tempo real',
    version: '1.0.0',
    base_url: 'http://localhost:3001',
    authentication: {
      method: 'API Key',
      header: 'X-API-Key'
    },
    endpoints: {
      'POST /conversions': {
        description: 'Receber dados de conversão',
        required: ['event_type', 'customer_id', 'subid'],
        optional: ['amount', 'commission', 'metadata'],
        example: {
          event_type: 'deposit',
          customer_id: 'cliente_123',
          subid: 'afiliado1',
          amount: '100.00',
          commission: '30.00'
        }
      },
      'POST /clicks': {
        description: 'Rastrear cliques',
        required: ['subid'],
        optional: ['customer_id', 'ip_address', 'landing_page']
      },
      'GET /ping': {
        description: 'Testar conectividade'
      }
    }
  });
});

const PORT = 3001;
app.listen(PORT, () => {
  console.log(`🚀 WEBHOOK RECEIVER ATIVO NA PORTA ${PORT}`);
  console.log(`📡 Pronto para receber dados das casas de apostas`);
  console.log(`🔗 Teste: curl -H "X-API-Key: casa_demo_123" http://localhost:${PORT}/ping`);
});