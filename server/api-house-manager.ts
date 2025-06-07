import { Request, Response } from "express";
import { db } from "./db";
import * as schema from "@shared/schema";
import { eq } from "drizzle-orm";

// Simplified API integration for betting houses
export class ApiHouseManager {
  
  // Create or update API-based betting house
  static async saveApiHouse(houseData: any, houseId?: number) {
    try {
      const apiConfig = houseData.integrationType === 'api' ? {
        baseUrl: houseData.apiBaseUrl,
        authType: houseData.authType,
        authData: {
          token: houseData.authToken,
          apiKey: houseData.authApiKey,
          username: houseData.authUsername,
          password: houseData.authPassword,
          headers: houseData.customHeaders ? JSON.parse(houseData.customHeaders) : {},
        },
        endpoints: {
          affiliateStats: houseData.affiliateStatsEndpoint,
          conversions: houseData.conversionsEndpoint,
          commissions: houseData.commissionsEndpoint,
        },
        dataMapping: {
          subidField: houseData.subidField,
          amountField: houseData.amountField,
          eventField: houseData.eventField,
        },
        syncSchedule: houseData.syncSchedule,
      } : {};

      const housePayload = {
        name: houseData.name,
        description: houseData.description,
        logoUrl: houseData.logoUrl,
        baseUrl: houseData.baseUrl,
        primaryParam: houseData.primaryParam,
        commissionType: houseData.commissionType,
        commissionValue: houseData.commissionValue,
        cpaValue: houseData.cpaValue,
        revshareValue: houseData.revshareValue,
        minDeposit: houseData.minDeposit,
        identifier: houseData.identifier,
        securityToken: houseData.securityToken,
        integrationType: houseData.integrationType,
        apiConfig,
        isActive: true,
      };

      if (houseId) {
        // Update existing house
        await db
          .update(schema.bettingHouses)
          .set(housePayload)
          .where(eq(schema.bettingHouses.id, houseId));
        
        return { success: true, message: 'Casa atualizada com sucesso', id: houseId };
      } else {
        // Create new house
        const [newHouse] = await db
          .insert(schema.bettingHouses)
          .values(housePayload)
          .returning();
        
        return { success: true, message: 'Casa criada com sucesso', id: newHouse.id };
      }
    } catch (error) {
      console.error('Erro ao salvar casa:', error);
      throw new Error(error instanceof Error ? error.message : 'Erro ao salvar casa');
    }
  }

  // Test API connection
  static async testApiConnection(houseId: number) {
    try {
      const house = await db
        .select()
        .from(schema.bettingHouses)
        .where(eq(schema.bettingHouses.id, houseId))
        .limit(1);

      if (!house[0]) {
        return { success: false, message: 'Casa não encontrada' };
      }

      if (house[0].integrationType !== 'api') {
        return { success: false, message: 'Casa não configurada para integração por API' };
      }

      const apiConfig = house[0].apiConfig as any;
      
      if (!apiConfig?.baseUrl) {
        return { success: false, message: 'URL base da API não configurada' };
      }

      // Build authentication headers
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        'User-Agent': 'AfiliadosBet/1.0',
      };

      if (apiConfig.authType === 'bearer' && apiConfig.authData?.token) {
        headers['Authorization'] = `Bearer ${apiConfig.authData.token}`;
      } else if (apiConfig.authType === 'apikey' && apiConfig.authData?.apiKey) {
        headers['X-API-Key'] = apiConfig.authData.apiKey;
      } else if (apiConfig.authType === 'basic' && apiConfig.authData?.username && apiConfig.authData?.password) {
        const credentials = Buffer.from(`${apiConfig.authData.username}:${apiConfig.authData.password}`).toString('base64');
        headers['Authorization'] = `Basic ${credentials}`;
      }

      // Test the API endpoint
      const testEndpoint = apiConfig.endpoints?.conversions || '/api/conversions';
      const testUrl = new URL(testEndpoint, apiConfig.baseUrl);
      
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
        message: `Erro de conexão: ${error instanceof Error ? error.message : 'Erro desconhecido'}`,
      };
    }
  }

  // Sync conversions from API
  static async syncConversions(houseId: number, dateFrom?: string, dateTo?: string) {
    try {
      const house = await db
        .select()
        .from(schema.bettingHouses)
        .where(eq(schema.bettingHouses.id, houseId))
        .limit(1);

      if (!house[0] || house[0].integrationType !== 'api') {
        throw new Error('Casa não configurada para integração por API');
      }

      const apiConfig = house[0].apiConfig as any;
      
      // Build URL with date filters
      const url = new URL(apiConfig.endpoints?.conversions || '/api/conversions', apiConfig.baseUrl);
      if (dateFrom) url.searchParams.append('date_from', dateFrom);
      if (dateTo) url.searchParams.append('date_to', dateTo);

      // Build headers
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        'User-Agent': 'AfiliadosBet/1.0',
      };

      if (apiConfig.authType === 'bearer' && apiConfig.authData?.token) {
        headers['Authorization'] = `Bearer ${apiConfig.authData.token}`;
      } else if (apiConfig.authType === 'apikey' && apiConfig.authData?.apiKey) {
        headers['X-API-Key'] = apiConfig.authData.apiKey;
      }

      // Fetch data from API
      const response = await fetch(url.toString(), {
        method: 'GET',
        headers,
      });

      if (!response.ok) {
        throw new Error(`Erro na API: ${response.status} - ${response.statusText}`);
      }

      const apiData = await response.json();
      
      // Process conversions
      const processedConversions = [];
      const conversions = apiData.conversions || apiData.data || [];
      
      for (const conversion of conversions) {
        try {
          // Extract data using mapping
          const subid = conversion[apiConfig.dataMapping?.subidField || 'subid'];
          const amount = parseFloat(conversion[apiConfig.dataMapping?.amountField || 'amount'] || '0');
          const eventType = conversion[apiConfig.dataMapping?.eventField || 'event_type'];
          
          // Find affiliate by username
          const affiliate = await db
            .select()
            .from(schema.users)
            .where(eq(schema.users.username, subid))
            .limit(1);

          if (!affiliate[0]) {
            console.log(`Afiliado não encontrado: ${subid}`);
            continue;
          }

          // Check if conversion already exists
          if (conversion.customer_id) {
            const existingConversion = await db
              .select()
              .from(schema.conversions)
              .where(eq(schema.conversions.customerId, conversion.customer_id))
              .limit(1);

            if (existingConversion[0]) {
              console.log(`Conversão já existe: ${conversion.customer_id}`);
              continue;
            }
          }

          // Calculate commission
          let commission = 0;
          const commissionType = house[0].commissionType;
          
          if (commissionType === 'CPA' && (eventType === 'first_deposit' || eventType === 'deposit')) {
            commission = parseFloat(house[0].cpaValue || house[0].commissionValue || '0');
          } else if (commissionType === 'RevShare' && eventType === 'profit') {
            const rate = parseFloat(house[0].revshareValue || house[0].commissionValue || '0') / 100;
            commission = amount * rate;
          } else if (commissionType === 'Hybrid') {
            if (eventType === 'first_deposit') {
              commission = parseFloat(house[0].cpaValue || '0');
            } else if (eventType === 'profit') {
              const rate = parseFloat(house[0].revshareValue || '0') / 100;
              commission = amount * rate;
            }
          }

          // Insert conversion
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
          
        } catch (conversionError) {
          console.error('Erro ao processar conversão:', conversionError);
        }
      }

      return {
        processed: processedConversions.length,
        total: conversions.length,
        conversions: processedConversions,
      };
      
    } catch (error) {
      console.error(`Erro ao sincronizar conversões para casa ${houseId}:`, error);
      throw new Error(error instanceof Error ? error.message : 'Erro na sincronização');
    }
  }
}

// Routes for API house management
export function setupApiHouseRoutes(app: any) {
  
  // Test API connection
  app.post('/api/admin/houses/:id/test-api', async (req: Request, res: Response) => {
    try {
      const houseId = parseInt(req.params.id);
      const result = await ApiHouseManager.testApiConnection(houseId);
      res.json(result);
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error instanceof Error ? error.message : 'Erro desconhecido',
      });
    }
  });

  // Sync conversions
  app.post('/api/admin/houses/:id/sync', async (req: Request, res: Response) => {
    try {
      const houseId = parseInt(req.params.id);
      const { dateFrom, dateTo } = req.body;
      
      const result = await ApiHouseManager.syncConversions(houseId, dateFrom, dateTo);
      
      res.json({
        success: true,
        message: `${result.processed} conversões sincronizadas`,
        data: result,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Erro desconhecido',
      });
    }
  });
}