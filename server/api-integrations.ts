import { Request, Response } from "express";
import { db } from "./db";
import * as schema from "@shared/schema";
import { eq } from "drizzle-orm";

// Interface para configuração de API de casas
interface ApiConfig {
  baseUrl: string;
  authType: 'bearer' | 'apikey' | 'basic' | 'custom';
  authData: {
    token?: string;
    apiKey?: string;
    username?: string;
    password?: string;
    headers?: Record<string, string>;
  };
  endpoints: {
    affiliateStats: string;
    conversions: string;
    commissions: string;
  };
  dataMapping: {
    subidField: string;
    amountField: string;
    eventField: string;
  };
  syncSchedule: 'realtime' | 'hourly' | 'daily';
}

// Classe para gerenciar integrações por API
export class ApiIntegrationManager {
  
  // Buscar dados de conversão via API
  static async fetchConversionsFromApi(houseId: number, dateFrom?: string, dateTo?: string) {
    try {
      const house = await db
        .select()
        .from(schema.bettingHouses)
        .where(eq(schema.bettingHouses.id, houseId))
        .limit(1);

      if (!house[0] || house[0].integrationType !== 'api') {
        throw new Error('Casa não configurada para integração por API');
      }

      const apiConfig = house[0].apiConfig as ApiConfig;
      
      // Construir URL da API
      const url = new URL(apiConfig.endpoints.conversions, apiConfig.baseUrl);
      if (dateFrom) url.searchParams.append('date_from', dateFrom);
      if (dateTo) url.searchParams.append('date_to', dateTo);

      // Configurar headers de autenticação
      const headers = await this.buildAuthHeaders(apiConfig);

      // Fazer requisição para a API
      const response = await fetch(url.toString(), {
        method: 'GET',
        headers,
      });

      if (!response.ok) {
        throw new Error(`Erro na API: ${response.status} - ${response.statusText}`);
      }

      const data = await response.json();
      
      // Processar e sincronizar dados
      return await this.processApiConversions(houseId, data, apiConfig);
      
    } catch (error) {
      console.error(`Erro ao buscar conversões da API para casa ${houseId}:`, error);
      throw error;
    }
  }

  // Construir headers de autenticação baseado no tipo
  private static async buildAuthHeaders(apiConfig: ApiConfig): Promise<Record<string, string>> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'User-Agent': 'AfiliadosBet/1.0',
      ...apiConfig.authData.headers,
    };

    switch (apiConfig.authType) {
      case 'bearer':
        headers['Authorization'] = `Bearer ${apiConfig.authData.token}`;
        break;
      
      case 'apikey':
        headers['X-API-Key'] = apiConfig.authData.apiKey!;
        break;
      
      case 'basic':
        const credentials = Buffer.from(
          `${apiConfig.authData.username}:${apiConfig.authData.password}`
        ).toString('base64');
        headers['Authorization'] = `Basic ${credentials}`;
        break;
    }

    return headers;
  }

  // Processar conversões recebidas da API
  private static async processApiConversions(houseId: number, apiData: any, apiConfig: ApiConfig) {
    const processedConversions = [];
    
    for (const conversion of apiData.conversions || apiData.data || []) {
      try {
        // Extrair dados usando o mapeamento configurado
        const subid = conversion[apiConfig.dataMapping.subidField];
        const amount = parseFloat(conversion[apiConfig.dataMapping.amountField] || '0');
        const eventType = conversion[apiConfig.dataMapping.eventField];
        
        // Buscar afiliado pelo username (subid)
        const affiliate = await db
          .select()
          .from(schema.users)
          .where(eq(schema.users.username, subid))
          .limit(1);

        if (!affiliate[0]) {
          console.log(`Afiliado não encontrado: ${subid}`);
          continue;
        }

        // Verificar se conversão já existe
        const existingConversion = await db
          .select()
          .from(schema.conversions)
          .where(eq(schema.conversions.customerId, conversion.customer_id))
          .limit(1);

        if (existingConversion[0]) {
          console.log(`Conversão já existe: ${conversion.customer_id}`);
          continue;
        }

        // Calcular comissão
        const commission = await this.calculateCommission(houseId, eventType, amount);

        // Inserir conversão no banco
        const [newConversion] = await db
          .insert(schema.conversions)
          .values({
            userId: affiliate[0].id,
            houseId,
            type: eventType,
            amount: amount.toString(),
            commission: commission.toString(),
            customerId: conversion.customer_id,
            conversionData: {
              source: 'api_sync',
              originalData: conversion,
              syncedAt: new Date().toISOString(),
            },
          })
          .returning();

        processedConversions.push(newConversion);
        
      } catch (error) {
        console.error('Erro ao processar conversão:', error);
      }
    }

    return {
      processed: processedConversions.length,
      total: apiData.conversions?.length || 0,
      conversions: processedConversions,
    };
  }

  // Calcular comissão baseada no tipo da casa
  private static async calculateCommission(houseId: number, eventType: string, amount: number): Promise<number> {
    const house = await db
      .select()
      .from(schema.bettingHouses)
      .where(eq(schema.bettingHouses.id, houseId))
      .limit(1);

    if (!house[0]) return 0;

    const commissionType = house[0].commissionType;
    
    switch (commissionType) {
      case 'CPA':
        if (eventType === 'first_deposit' || eventType === 'deposit') {
          return parseFloat(house[0].cpaValue || house[0].commissionValue || '0');
        }
        return 0;
      
      case 'RevShare':
        if (eventType === 'profit') {
          const rate = parseFloat(house[0].revshareValue || house[0].commissionValue || '0') / 100;
          return amount * rate;
        }
        return 0;
      
      case 'Hybrid':
        if (eventType === 'first_deposit') {
          return parseFloat(house[0].cpaValue || '0');
        } else if (eventType === 'profit') {
          const rate = parseFloat(house[0].revshareValue || '0') / 100;
          return amount * rate;
        }
        return 0;
      
      default:
        return 0;
    }
  }

  // Sincronização automática de dados
  static async syncAllApiHouses() {
    try {
      const apiHouses = await db
        .select()
        .from(schema.bettingHouses)
        .where(eq(schema.bettingHouses.integrationType, 'api'));

      const results = [];
      
      for (const house of apiHouses) {
        try {
          const result = await this.fetchConversionsFromApi(house.id);
          results.push({
            houseId: house.id,
            houseName: house.name,
            success: true,
            ...result,
          });
        } catch (error) {
          results.push({
            houseId: house.id,
            houseName: house.name,
            success: false,
            error: error instanceof Error ? error.message : 'Erro desconhecido',
          });
        }
      }

      return results;
    } catch (error) {
      console.error('Erro na sincronização automática:', error);
      throw error instanceof Error ? error : new Error('Erro desconhecido na sincronização');
    }
  }

  // Testar configuração de API
  static async testApiConnection(houseId: number): Promise<{ success: boolean; message: string; data?: any }> {
    try {
      const house = await db
        .select()
        .from(schema.bettingHouses)
        .where(eq(schema.bettingHouses.id, houseId))
        .limit(1);

      if (!house[0]) {
        return { success: false, message: 'Casa não encontrada' };
      }

      const apiConfig = house[0].apiConfig as ApiConfig;
      const headers = await this.buildAuthHeaders(apiConfig);

      // Testar endpoint de stats (geralmente mais simples)
      const testUrl = new URL(apiConfig.endpoints.affiliateStats || apiConfig.endpoints.conversions, apiConfig.baseUrl);
      
      const response = await fetch(testUrl.toString(), {
        method: 'GET',
        headers,
      });

      if (!response.ok) {
        return {
          success: false,
          message: `Erro HTTP ${response.status}: ${response.statusText}`,
        };
      }

      const data = await response.json();
      
      return {
        success: true,
        message: 'Conexão com API estabelecida com sucesso',
        data: {
          status: response.status,
          responseSize: JSON.stringify(data).length,
          hasData: Array.isArray(data) ? data.length > 0 : Object.keys(data).length > 0,
        },
      };
      
    } catch (error) {
      return {
        success: false,
        message: `Erro de conexão: ${error.message}`,
      };
    }
  }
}

// Rotas para API de integração
export function setupApiIntegrationRoutes(app: any) {
  
  // Sincronizar conversões de uma casa específica
  app.post('/api/admin/houses/:id/sync', async (req: Request, res: Response) => {
    try {
      const houseId = parseInt(req.params.id);
      const { dateFrom, dateTo } = req.body;
      
      const result = await ApiIntegrationManager.fetchConversionsFromApi(houseId, dateFrom, dateTo);
      
      res.json({
        success: true,
        message: `${result.processed} conversões sincronizadas`,
        data: result,
      });
      
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message,
      });
    }
  });

  // Testar conexão com API
  app.post('/api/admin/houses/:id/test-api', async (req: Request, res: Response) => {
    try {
      const houseId = parseInt(req.params.id);
      const result = await ApiIntegrationManager.testApiConnection(houseId);
      
      res.json(result);
      
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  });

  // Sincronização em lote de todas as casas API
  app.post('/api/admin/sync-all-api', async (req: Request, res: Response) => {
    try {
      const results = await ApiIntegrationManager.syncAllApiHouses();
      
      res.json({
        success: true,
        message: 'Sincronização completa',
        results,
      });
      
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message,
      });
    }
  });
}