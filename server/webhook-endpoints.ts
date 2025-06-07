import express from 'express';
import { storage } from './storage';

const router = express.Router();

// Middleware para validar API Key das casas de apostas
const validateWebhookApiKey = async (req: any, res: any, next: any) => {
  const apiKey = req.headers['x-api-key'] || req.headers['authorization']?.replace('Bearer ', '');
  
  if (!apiKey) {
    return res.status(401).json({ 
      success: false,
      error: 'API Key required',
      message: 'Include X-API-Key header or Authorization Bearer token'
    });
  }

  try {
    // Buscar casa de apostas pela API Key
    const house = await storage.findHouseByApiKey(apiKey as string);
    
    if (!house) {
      return res.status(401).json({ 
        success: false,
        error: 'Invalid API Key',
        message: 'API Key not found or inactive'
      });
    }

    req.house = house;
    req.apiKey = apiKey;
    next();
  } catch (error) {
    console.error('Erro na validação da API Key:', error);
    return res.status(500).json({ 
      success: false,
      error: 'Internal server error'
    });
  }
};

// Middleware para log de requisições recebidas
const logIncomingRequest = async (req: any, res: any, next: any) => {
  try {
    const logData = {
      houseId: req.house?.id,
      endpoint: req.path,
      method: req.method,
      headers: JSON.stringify(req.headers),
      body: JSON.stringify(req.body),
      ipAddress: req.ip || req.connection.remoteAddress,
      userAgent: req.headers['user-agent'] || null,
      status: 'received'
    };

    await storage.createApiRequestLog(logData);
    next();
  } catch (error) {
    console.error('Erro ao criar log da requisição:', error);
    next();
  }
};

// WEBHOOK: Receber conversões de casas de apostas
router.post('/conversions', validateWebhookApiKey, logIncomingRequest, async (req: any, res: any) => {
  try {
    const { event_type, customer_id, subid, amount, commission, metadata } = req.body;

    if (!event_type || !customer_id || !subid) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields',
        required: ['event_type', 'customer_id', 'subid'],
        received: Object.keys(req.body)
      });
    }

    // Buscar afiliado pelo subid
    const affiliate = await storage.findAffiliateByUsername(subid);
    if (!affiliate) {
      return res.status(404).json({
        success: false,
        error: 'Affiliate not found',
        message: `No affiliate found with subid: ${subid}`
      });
    }

    // Buscar link de afiliado para esta casa
    const affiliateLink = await storage.findAffiliateLinkByUserAndHouse(affiliate.id, req.house.id);
    
    // Calcular comissão se não fornecida
    let calculatedCommission = commission;
    if (!calculatedCommission && amount && req.house.commissionType) {
      const numericAmount = parseFloat(amount);
      if (req.house.commissionType === 'percentage' && req.house.revshareValue) {
        calculatedCommission = (numericAmount * req.house.revshareValue / 100).toFixed(2);
      } else if (req.house.commissionType === 'fixed' && req.house.cpaValue) {
        calculatedCommission = req.house.cpaValue.toString();
      }
    }

    // Registrar conversão
    const conversionData = {
      userId: affiliate.id,
      houseId: req.house.id,
      type: event_type,
      affiliateLinkId: affiliateLink?.id || null,
      amount: amount || null,
      commission: calculatedCommission || null,
      customerId: customer_id,
      conversionData: metadata || {}
    };

    const conversion = await storage.createConversion(conversionData);

    // Log de sucesso
    await storage.updateApiRequestLog(req.logId, { 
      status: 'processed',
      response: JSON.stringify({ conversion_id: conversion.id })
    });

    return res.status(200).json({
      success: true,
      message: 'Conversion received and processed',
      data: {
        conversion_id: conversion.id,
        affiliate: {
          id: affiliate.id,
          username: affiliate.username,
          email: affiliate.email
        },
        house: {
          id: req.house.id,
          name: req.house.name
        },
        event_type,
        amount: amount || '0.00',
        commission: calculatedCommission || '0.00',
        processed_at: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('Erro ao processar conversão:', error);
    
    // Log de erro
    if (req.logId) {
      await storage.updateApiRequestLog(req.logId, { 
        status: 'error',
        response: JSON.stringify({ error: error.message })
      });
    }

    return res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: 'Failed to process conversion'
    });
  }
});

// WEBHOOK: Receber cliques de afiliados
router.post('/clicks', validateWebhookApiKey, logIncomingRequest, async (req: any, res: any) => {
  try {
    const { subid, customer_id, ip_address, user_agent, landing_page } = req.body;

    if (!subid) {
      return res.status(400).json({
        success: false,
        error: 'Missing required field: subid'
      });
    }

    // Buscar afiliado
    const affiliate = await storage.findAffiliateByUsername(subid);
    if (!affiliate) {
      return res.status(404).json({
        success: false,
        error: 'Affiliate not found'
      });
    }

    // Registrar clique como conversão
    const clickData = {
      userId: affiliate.id,
      houseId: req.house.id,
      type: 'click',
      customerId: customer_id || `click_${Date.now()}`,
      conversionData: {
        ip_address,
        user_agent,
        landing_page,
        clicked_at: new Date().toISOString()
      }
    };

    const click = await storage.createConversion(clickData);

    return res.status(200).json({
      success: true,
      message: 'Click tracked successfully',
      data: {
        click_id: click.id,
        affiliate_id: affiliate.id,
        house_id: req.house.id
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

// WEBHOOK: Status/Ping endpoint para casas testarem conectividade
router.get('/ping', validateWebhookApiKey, async (req: any, res: any) => {
  return res.status(200).json({
    success: true,
    message: 'Webhook endpoint is active',
    house: {
      id: req.house.id,
      name: req.house.name
    },
    timestamp: new Date().toISOString(),
    endpoints: [
      'POST /webhook/conversions - Receber conversões (registro, depósito, lucro)',
      'POST /webhook/clicks - Receber cliques de afiliados',
      'GET /webhook/ping - Testar conectividade'
    ]
  });
});

// WEBHOOK: Documentação específica para casas de apostas
router.get('/docs', validateWebhookApiKey, async (req: any, res: any) => {
  return res.status(200).json({
    title: 'AfiliadosBet Webhook API',
    description: 'Endpoints para casas de apostas enviarem dados de conversão',
    house: {
      id: req.house.id,
      name: req.house.name,
      api_key: req.apiKey
    },
    base_url: `${req.protocol}://${req.get('host')}/webhook`,
    authentication: {
      method: 'API Key',
      header: 'X-API-Key',
      example: `curl -H "X-API-Key: ${req.apiKey}" ...`
    },
    endpoints: {
      'POST /webhook/conversions': {
        description: 'Enviar dados de conversão (registro, depósito, lucro)',
        required_fields: ['event_type', 'customer_id', 'subid'],
        optional_fields: ['amount', 'commission', 'metadata'],
        event_types: ['registration', 'deposit', 'profit', 'withdrawal'],
        example: {
          event_type: 'deposit',
          customer_id: 'cliente_123',
          subid: 'afiliado1',
          amount: '100.00',
          commission: '30.00',
          metadata: {
            payment_method: 'pix',
            currency: 'BRL'
          }
        }
      },
      'POST /webhook/clicks': {
        description: 'Rastrear cliques de afiliados',
        required_fields: ['subid'],
        optional_fields: ['customer_id', 'ip_address', 'user_agent', 'landing_page'],
        example: {
          subid: 'afiliado1',
          customer_id: 'visitor_456',
          ip_address: '192.168.1.100',
          user_agent: 'Mozilla/5.0...',
          landing_page: '/promocao-especial'
        }
      }
    },
    response_format: {
      success: {
        success: true,
        message: 'string',
        data: 'object'
      },
      error: {
        success: false,
        error: 'string',
        message: 'string'
      }
    }
  });
});

export { router as webhookRouter };