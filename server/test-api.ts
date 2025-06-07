import express from 'express';
import { storage } from './storage';

const router = express.Router();

// Middleware para simular autenticação de API Key
const validateApiKey = async (req: any, res: any, next: any) => {
  const apiKey = req.headers['x-api-key'];
  
  if (!apiKey) {
    return res.status(401).json({ 
      error: 'API Key required',
      message: 'Include X-API-Key header'
    });
  }

  // Para demonstração, aceitar qualquer chave que comece com "test_"
  if (typeof apiKey === 'string' && apiKey.startsWith('test_')) {
    req.apiKey = { 
      id: 1,
      houseId: 1,
      houseName: 'Casa de Teste',
      isActive: true
    };
    return next();
  }

  return res.status(401).json({ 
    error: 'Invalid API Key',
    message: 'API Key not found or inactive'
  });
};

// Endpoint de documentação
router.get('/docs', validateApiKey, (req, res) => {
  res.json({
    title: 'AfiliadosBet API Documentation',
    version: '1.0.0',
    description: 'API para integração de dados de conversão',
    base_url: `${req.protocol}://${req.get('host')}/api/v1`,
    authentication: {
      type: 'API Key',
      header: 'X-API-Key',
      description: 'Inclua sua API Key no header de cada requisição'
    },
    endpoints: {
      'POST /conversions': {
        description: 'Registrar uma conversão (click, registro, depósito, lucro)',
        parameters: {
          event_type: 'string (required) - click, registration, deposit, profit',
          customer_id: 'string (required) - ID único do cliente',
          subid: 'string (required) - Username do afiliado',
          amount: 'string (optional) - Valor da conversão',
          commission: 'string (optional) - Comissão calculada',
          metadata: 'object (optional) - Dados adicionais'
        },
        example: {
          event_type: 'deposit',
          customer_id: 'cliente_123',
          subid: 'meuafiliado',
          amount: '100.00',
          commission: '30.00',
          metadata: {
            currency: 'BRL',
            payment_method: 'pix'
          }
        }
      },
      'GET /affiliates': {
        description: 'Listar afiliados ativos para sua casa',
        parameters: {
          page: 'number (optional) - Página (default: 1)',
          limit: 'number (optional) - Itens por página (default: 10)',
          status: 'string (optional) - active, inactive, all'
        }
      },
      'GET /stats': {
        description: 'Obter estatísticas da sua casa',
        parameters: {
          start_date: 'string (optional) - Data início (YYYY-MM-DD)',
          end_date: 'string (optional) - Data fim (YYYY-MM-DD)'
        }
      }
    }
  });
});

// Endpoint para registrar conversões
router.post('/conversions', validateApiKey, async (req, res) => {
  try {
    const { event_type, customer_id, subid, amount, commission, metadata } = req.body;

    // Validações básicas
    if (!event_type || !customer_id || !subid) {
      return res.status(400).json({
        error: 'Missing required fields',
        required: ['event_type', 'customer_id', 'subid']
      });
    }

    // Buscar afiliado pelo username (subid)
    const affiliate = await storage.getUserByUsername(subid);
    if (!affiliate) {
      return res.status(404).json({
        error: 'Affiliate not found',
        message: `No affiliate found with username: ${subid}`
      });
    }

    // Simular criação de conversão
    const conversionData = {
      userId: affiliate.id,
      houseId: req.apiKey.houseId,
      type: event_type,
      customerId: customer_id,
      amount: amount || null,
      commission: commission || null,
      conversionData: metadata || {}
    };

    // Para demonstração, vamos simular o sucesso
    const conversion = {
      id: Date.now(),
      ...conversionData,
      convertedAt: new Date(),
      status: 'processed'
    };

    res.status(201).json({
      success: true,
      message: 'Conversion processed successfully',
      data: {
        conversion_id: conversion.id,
        event_type: event_type,
        affiliate: {
          id: affiliate.id,
          username: affiliate.username,
          email: affiliate.email
        },
        house: {
          id: req.apiKey.houseId,
          name: req.apiKey.houseName
        },
        amount: amount,
        commission: commission,
        processed_at: conversion.convertedAt
      }
    });

  } catch (error) {
    console.error('Error processing conversion:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to process conversion'
    });
  }
});

// Endpoint para listar afiliados
router.get('/affiliates', validateApiKey, async (req, res) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const status = req.query.status as string || 'active';

    // Para demonstração, retornar dados simulados
    const affiliates = [
      {
        id: 1,
        username: 'afiliado1',
        email: 'afiliado1@exemplo.com',
        fullName: 'João Silva',
        status: 'active',
        joined_date: '2024-01-15',
        total_conversions: 25,
        total_commission: '750.00'
      },
      {
        id: 2,
        username: 'afiliado2',
        email: 'afiliado2@exemplo.com',
        fullName: 'Maria Santos',
        status: 'active',
        joined_date: '2024-01-20',
        total_conversions: 18,
        total_commission: '540.00'
      }
    ];

    const filteredAffiliates = status === 'all' 
      ? affiliates 
      : affiliates.filter(a => a.status === status);

    const startIndex = (page - 1) * limit;
    const paginatedAffiliates = filteredAffiliates.slice(startIndex, startIndex + limit);

    res.json({
      success: true,
      data: {
        affiliates: paginatedAffiliates,
        pagination: {
          page,
          limit,
          total: filteredAffiliates.length,
          total_pages: Math.ceil(filteredAffiliates.length / limit)
        },
        house: {
          id: req.apiKey.houseId,
          name: req.apiKey.houseName
        }
      }
    });

  } catch (error) {
    console.error('Error fetching affiliates:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to fetch affiliates'
    });
  }
});

// Endpoint para estatísticas
router.get('/stats', validateApiKey, async (req, res) => {
  try {
    const startDate = req.query.start_date as string;
    const endDate = req.query.end_date as string;

    // Para demonstração, retornar estatísticas simuladas
    const stats = {
      house: {
        id: req.apiKey.houseId,
        name: req.apiKey.houseName
      },
      period: {
        start_date: startDate || '2024-01-01',
        end_date: endDate || new Date().toISOString().split('T')[0]
      },
      conversions: {
        total: 156,
        by_type: {
          clicks: 1250,
          registrations: 89,
          deposits: 45,
          profits: 22
        }
      },
      financial: {
        total_volume: '15,670.00',
        total_commission: '4,701.00',
        pending_payments: '1,240.00',
        paid_commission: '3,461.00'
      },
      top_affiliates: [
        {
          username: 'afiliado1',
          conversions: 25,
          commission: '750.00'
        },
        {
          username: 'afiliado2',
          conversions: 18,
          commission: '540.00'
        }
      ]
    };

    res.json({
      success: true,
      data: stats
    });

  } catch (error) {
    console.error('Error fetching stats:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to fetch stats'
    });
  }
});

// Endpoint de teste de conectividade
router.get('/ping', validateApiKey, (req, res) => {
  res.json({
    success: true,
    message: 'API is working',
    timestamp: new Date().toISOString(),
    house: {
      id: req.apiKey.houseId,
      name: req.apiKey.houseName
    }
  });
});

export default router;