import express from 'express';

const webhookApp = express();

// Middleware específico para webhooks
webhookApp.use(express.json());
webhookApp.use(express.urlencoded({ extended: true }));

// WEBHOOK: Receber conversões de casas de apostas
webhookApp.post('/conversions', (req, res) => {
  try {
    const apiKey = req.headers['x-api-key'];
    
    if (!apiKey) {
      return res.status(401).json({ 
        success: false,
        error: 'API Key required',
        message: 'Include X-API-Key header'
      });
    }

    // Validação simples para demonstração
    if (!apiKey.toString().includes('demo') && !apiKey.toString().includes('test') && !apiKey.toString().includes('casa_')) {
      return res.status(401).json({ 
        success: false,
        error: 'Invalid API Key'
      });
    }

    const { event_type, customer_id, subid, amount, commission, metadata } = req.body;

    if (!event_type || !customer_id || !subid) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields',
        required: ['event_type', 'customer_id', 'subid'],
        received: Object.keys(req.body)
      });
    }

    // Simular processamento da conversão
    const conversionId = Math.floor(Math.random() * 100000);
    
    console.log(`🎯 CONVERSÃO RECEBIDA:`, {
      tipo: event_type,
      cliente: customer_id,
      afiliado: subid,
      valor: amount || 'N/A',
      comissao: commission || 'N/A',
      timestamp: new Date().toISOString()
    });

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

  } catch (error) {
    console.error('Erro ao processar conversão:', error);
    return res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

// WEBHOOK: Receber cliques
webhookApp.post('/clicks', (req, res) => {
  try {
    const apiKey = req.headers['x-api-key'];
    
    if (!apiKey) {
      return res.status(401).json({ 
        success: false,
        error: 'API Key required'
      });
    }

    const { subid, customer_id, ip_address, user_agent, landing_page } = req.body;

    if (!subid) {
      return res.status(400).json({
        success: false,
        error: 'Missing required field: subid'
      });
    }

    const clickId = Math.floor(Math.random() * 100000);
    
    console.log(`👆 CLIQUE RECEBIDO:`, {
      afiliado: subid,
      cliente: customer_id || 'N/A',
      ip: ip_address || 'N/A',
      pagina: landing_page || 'N/A',
      timestamp: new Date().toISOString()
    });

    return res.status(200).json({
      success: true,
      message: 'Click tracked successfully',
      data: {
        click_id: clickId,
        affiliate_id: 1,
        house_id: 1,
        tracked_at: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('Erro ao processar clique:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to track click'
    });
  }
});

// WEBHOOK: Ping/Status
webhookApp.get('/ping', (req, res) => {
  const apiKey = req.headers['x-api-key'];
  
  if (!apiKey) {
    return res.status(401).json({ 
      success: false,
      error: 'API Key required'
    });
  }

  return res.status(200).json({
    success: true,
    message: 'AfiliadosBet webhook receiver is active',
    house: {
      id: 1,
      name: 'Casa Demo'
    },
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    endpoints: [
      'POST /webhook/conversions - Receber conversões (registro, depósito, lucro)',
      'POST /webhook/clicks - Receber cliques de afiliados', 
      'GET /webhook/ping - Testar conectividade'
    ],
    supported_events: [
      'click - Clique em link de afiliado',
      'registration - Novo cliente registrado',
      'deposit - Depósito realizado',
      'profit - Lucro gerado pelo cliente',
      'withdrawal - Saque realizado'
    ]
  });
});

// WEBHOOK: Documentação
webhookApp.get('/docs', (req, res) => {
  const apiKey = req.headers['x-api-key'];
  
  if (!apiKey) {
    return res.status(401).json({ 
      success: false,
      error: 'API Key required for documentation access'
    });
  }

  return res.status(200).json({
    title: 'AfiliadosBet Webhook API - Sistema Receptor',
    description: 'API para casas de apostas enviarem dados de conversão em tempo real',
    version: '1.0.0',
    base_url: `${req.protocol}://${req.get('host')}/webhook`,
    authentication: {
      method: 'API Key',
      header: 'X-API-Key',
      description: 'Cada casa de apostas recebe uma API Key única'
    },
    endpoints: {
      'POST /conversions': {
        description: 'Endpoint principal para receber dados de conversão',
        required_fields: ['event_type', 'customer_id', 'subid'],
        optional_fields: ['amount', 'commission', 'metadata'],
        event_types: {
          'registration': 'Novo cliente se registrou',
          'deposit': 'Cliente fez um depósito',
          'profit': 'Cliente gerou lucro',
          'withdrawal': 'Cliente fez um saque'
        },
        example_request: {
          event_type: 'deposit',
          customer_id: 'cliente_123',
          subid: 'afiliado1',
          amount: '250.00',
          commission: '75.00',
          metadata: {
            currency: 'BRL',
            payment_method: 'pix',
            first_deposit: true
          }
        },
        example_response: {
          success: true,
          message: 'Conversion received and processed successfully',
          data: {
            conversion_id: 12345,
            affiliate: { username: 'afiliado1' },
            house: { name: 'Casa Demo' },
            processed_at: '2024-01-01T12:00:00Z'
          }
        }
      },
      'POST /clicks': {
        description: 'Rastrear cliques de afiliados',
        required_fields: ['subid'],
        optional_fields: ['customer_id', 'ip_address', 'user_agent', 'landing_page'],
        example_request: {
          subid: 'afiliado1',
          customer_id: 'visitor_456',
          ip_address: '192.168.1.100',
          landing_page: '/promocao-especial'
        }
      },
      'GET /ping': {
        description: 'Testar conectividade e status do webhook',
        parameters: 'Nenhum',
        example_response: {
          success: true,
          message: 'Webhook receiver is active',
          timestamp: '2024-01-01T12:00:00Z'
        }
      }
    },
    integration_guide: {
      step1: 'Obtenha sua API Key única no painel administrativo',
      step2: 'Configure seus sistemas para enviar dados para nossos endpoints',
      step3: 'Teste a conectividade usando o endpoint /ping',
      step4: 'Comece enviando dados de conversão em tempo real',
      support: 'Para suporte técnico, entre em contato com nossa equipe'
    },
    best_practices: [
      'Envie dados imediatamente após o evento ocorrer',
      'Inclua metadados relevantes para melhor rastreamento',
      'Implemente retry logic para garantir entrega',
      'Use HTTPS em produção para segurança',
      'Monitore os logs de resposta para detectar problemas'
    ]
  });
});

export default webhookApp;