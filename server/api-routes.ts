import { Router } from 'express';
import { z } from 'zod';
import crypto from 'crypto';
import type { Request, Response } from 'express';
import { storage } from './storage';

const router = Router();

// Middleware para autenticação de API Key
async function authenticateApiKey(req: Request, res: Response, next: any) {
  try {
    const apiKey = req.headers['x-api-key'] as string;
    
    if (!apiKey) {
      return res.status(401).json({
        error: 'API Key required',
        code: 'MISSING_API_KEY'
      });
    }

    const keyRecord = await storage.getApiKeyByValue(apiKey);
    if (!keyRecord || !keyRecord.isActive) {
      return res.status(401).json({
        error: 'Invalid or inactive API Key',
        code: 'INVALID_API_KEY'
      });
    }

    // Verificar se a chave expirou
    if (keyRecord.expiresAt && new Date() > new Date(keyRecord.expiresAt)) {
      return res.status(401).json({
        error: 'API Key expired',
        code: 'EXPIRED_API_KEY'
      });
    }

    // Atualizar último uso
    await storage.updateApiKeyLastUsed(keyRecord.id);

    // Adicionar informações da chave ao request
    req.apiKey = keyRecord;
    next();
  } catch (error) {
    console.error('Erro na autenticação da API Key:', error);
    res.status(500).json({
      error: 'Internal server error',
      code: 'INTERNAL_ERROR'
    });
  }
}

// Middleware para log de requisições da API
async function logApiRequest(req: Request, res: Response, next: any) {
  const startTime = Date.now();
  
  // Interceptar a resposta para capturar o status code
  const originalSend = res.send;
  let responseData: any;
  
  res.send = function(data) {
    responseData = data;
    return originalSend.call(this, data);
  };

  res.on('finish', async () => {
    try {
      const responseTime = Date.now() - startTime;
      
      await storage.createApiRequestLog({
        apiKeyId: req.apiKey?.id || null,
        endpoint: req.path,
        method: req.method,
        statusCode: res.statusCode,
        responseTime,
        userAgent: req.headers['user-agent'] || '',
        ipAddress: req.ip || req.connection.remoteAddress || '',
        requestData: req.body || null,
        responseData: responseData ? JSON.parse(responseData) : null
      });
    } catch (error) {
      console.error('Erro ao registrar log da API:', error);
    }
  });

  next();
}

// Schema para conversão de dados
const conversionSchema = z.object({
  event_type: z.enum(['click', 'registration', 'deposit', 'profit']),
  customer_id: z.string().min(1),
  subid: z.string().min(1),
  amount: z.string().optional(),
  commission: z.string().optional(),
  timestamp: z.string().optional(),
  metadata: z.record(z.any()).optional()
});

// Schema para webhook
const webhookSchema = z.object({
  event: z.string(),
  data: z.record(z.any()),
  timestamp: z.string().optional()
});

// POST /api/v1/conversions - Receber conversões das casas de apostas
router.post('/conversions', authenticateApiKey, logApiRequest, async (req: Request, res: Response) => {
  try {
    const validatedData = conversionSchema.parse(req.body);
    
    // Buscar o afiliado pelo subid
    const affiliate = await storage.getUserByUsername(validatedData.subid);
    if (!affiliate) {
      return res.status(404).json({
        error: 'Affiliate not found',
        code: 'AFFILIATE_NOT_FOUND'
      });
    }

    // Criar conversão
    const conversion = await storage.createConversion({
      userId: affiliate.id,
      houseId: req.apiKey!.houseId!,
      customerId: validatedData.customer_id,
      type: validatedData.event_type,
      amount: validatedData.amount || '0',
      commission: validatedData.commission || '0',
      status: 'confirmed',
      conversionData: validatedData.metadata || {}
    });

    // Registrar no log de conversões
    await storage.createConversionLog({
      casa: req.apiKey!.house?.name || 'Unknown',
      event_type: validatedData.event_type,
      subid: validatedData.subid,
      customer_id: validatedData.customer_id,
      amount: validatedData.amount || '0',
      commission: validatedData.commission || '0',
      ip: req.ip || '',
      status: 'success',
      status_code: 200,
      user_id: affiliate.id,
      house_id: req.apiKey!.houseId!,
      conversion_data: validatedData.metadata || {}
    });

    res.status(201).json({
      success: true,
      data: {
        conversion_id: conversion.id,
        affiliate_id: affiliate.id,
        house_id: req.apiKey!.houseId,
        processed_at: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('Erro ao processar conversão:', error);
    
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        error: 'Invalid request data',
        code: 'VALIDATION_ERROR',
        details: error.errors
      });
    }

    res.status(500).json({
      error: 'Internal server error',
      code: 'INTERNAL_ERROR'
    });
  }
});

// GET /api/v1/affiliates - Listar afiliados para uma casa de apostas
router.get('/affiliates', authenticateApiKey, logApiRequest, async (req: Request, res: Response) => {
  try {
    const { page = '1', limit = '10', status = 'active' } = req.query;
    
    const affiliates = await storage.getAffiliatesForHouse(
      req.apiKey!.houseId!,
      {
        page: parseInt(page as string),
        limit: parseInt(limit as string),
        status: status as string
      }
    );

    res.json({
      success: true,
      data: affiliates,
      pagination: {
        page: parseInt(page as string),
        limit: parseInt(limit as string)
      }
    });

  } catch (error) {
    console.error('Erro ao buscar afiliados:', error);
    res.status(500).json({
      error: 'Internal server error',
      code: 'INTERNAL_ERROR'
    });
  }
});

// POST /api/v1/webhook - Receber webhooks genéricos
router.post('/webhook', authenticateApiKey, logApiRequest, async (req: Request, res: Response) => {
  try {
    const validatedData = webhookSchema.parse(req.body);
    
    // Processar webhook baseado no evento
    switch (validatedData.event) {
      case 'player.registered':
        // Processar registro de jogador
        break;
      case 'player.deposited':
        // Processar depósito
        break;
      case 'player.bet':
        // Processar aposta
        break;
      default:
        console.log('Evento de webhook não reconhecido:', validatedData.event);
    }

    res.json({
      success: true,
      message: 'Webhook processed successfully'
    });

  } catch (error) {
    console.error('Erro ao processar webhook:', error);
    
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        error: 'Invalid webhook data',
        code: 'VALIDATION_ERROR',
        details: error.errors
      });
    }

    res.status(500).json({
      error: 'Internal server error',
      code: 'INTERNAL_ERROR'
    });
  }
});

// GET /api/v1/stats - Estatísticas para a casa de apostas
router.get('/stats', authenticateApiKey, logApiRequest, async (req: Request, res: Response) => {
  try {
    const { start_date, end_date } = req.query;
    
    const stats = await storage.getHouseStats(req.apiKey!.houseId!, {
      startDate: start_date as string,
      endDate: end_date as string
    });

    res.json({
      success: true,
      data: stats
    });

  } catch (error) {
    console.error('Erro ao buscar estatísticas:', error);
    res.status(500).json({
      error: 'Internal server error',
      code: 'INTERNAL_ERROR'
    });
  }
});

// GET /api/v1/docs - Documentação da API
router.get('/docs', (req: Request, res: Response) => {
  const documentation = {
    title: 'AfiliadosBet API v1',
    version: '1.0.0',
    description: 'API para integração de casas de apostas com a plataforma AfiliadosBet',
    base_url: `${req.protocol}://${req.get('host')}/api/v1`,
    authentication: {
      type: 'API Key',
      header: 'X-API-Key',
      description: 'Inclua sua API Key no header X-API-Key'
    },
    endpoints: {
      'POST /conversions': {
        description: 'Registrar conversões (clicks, registros, depósitos, lucros)',
        parameters: {
          event_type: 'string (click|registration|deposit|profit)',
          customer_id: 'string (ID único do cliente)',
          subid: 'string (username do afiliado)',
          amount: 'string (valor da transação) - opcional',
          commission: 'string (valor da comissão) - opcional',
          timestamp: 'string (ISO 8601) - opcional',
          metadata: 'object (dados adicionais) - opcional'
        },
        example: {
          event_type: 'deposit',
          customer_id: 'customer_123',
          subid: 'affiliate_user',
          amount: '100.00',
          commission: '30.00',
          metadata: {
            currency: 'BRL',
            payment_method: 'pix'
          }
        }
      },
      'GET /affiliates': {
        description: 'Listar afiliados ativos',
        parameters: {
          page: 'number (página) - opcional',
          limit: 'number (limite por página) - opcional',
          status: 'string (active|inactive) - opcional'
        }
      },
      'POST /webhook': {
        description: 'Receber webhooks genéricos',
        parameters: {
          event: 'string (tipo do evento)',
          data: 'object (dados do evento)',
          timestamp: 'string (ISO 8601) - opcional'
        }
      },
      'GET /stats': {
        description: 'Obter estatísticas da casa de apostas',
        parameters: {
          start_date: 'string (YYYY-MM-DD) - opcional',
          end_date: 'string (YYYY-MM-DD) - opcional'
        }
      }
    },
    response_format: {
      success: {
        success: true,
        data: 'object|array'
      },
      error: {
        error: 'string (mensagem de erro)',
        code: 'string (código do erro)',
        details: 'array (detalhes da validação) - opcional'
      }
    }
  };

  res.json(documentation);
});

export default router;