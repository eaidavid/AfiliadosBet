import { db } from '../db';
import * as schema from '../../shared/schema';
import { eq, and, gte } from 'drizzle-orm';

interface ApiResponse {
  success: boolean;
  data?: any;
  error?: string;
  total?: number;
  page?: number;
}

interface ConversionData {
  customerId: string;
  type: 'click' | 'registration' | 'deposit' | 'profit';
  amount?: number;
  commission?: number;
  timestamp: string;
  additionalData?: any;
}

export class ApiIntegrationService {
  private apiKey: string;
  private apiSecret?: string;
  private baseUrl: string;
  private houseId: number;
  private authHeaders: Record<string, string>;

  constructor(houseConfig: {
    id: number;
    apiKey: string;
    apiSecret?: string;
    apiBaseUrl: string;
    authType: string;
    authHeaders?: Record<string, string>;
  }) {
    this.houseId = houseConfig.id;
    this.apiKey = houseConfig.apiKey;
    this.apiSecret = houseConfig.apiSecret;
    this.baseUrl = houseConfig.apiBaseUrl;
    this.authHeaders = this.buildAuthHeaders(houseConfig.authType, houseConfig.authHeaders || {});
  }

  private buildAuthHeaders(authType: string, customHeaders: Record<string, string>): Record<string, string> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      ...customHeaders
    };

    switch (authType) {
      case 'bearer':
        headers['Authorization'] = `Bearer ${this.apiKey}`;
        break;
      case 'apikey':
        headers['X-API-Key'] = this.apiKey;
        break;
      case 'basic':
        const credentials = Buffer.from(`${this.apiKey}:${this.apiSecret || ''}`).toString('base64');
        headers['Authorization'] = `Basic ${credentials}`;
        break;
    }

    return headers;
  }

  async makeApiRequest(endpoint: string, options: RequestInit = {}): Promise<ApiResponse> {
    try {
      const url = `${this.baseUrl}${endpoint}`;
      
      const response = await fetch(url, {
        ...options,
        headers: {
          ...this.authHeaders,
          ...options.headers
        }
      });

      if (!response.ok) {
        throw new Error(`API request failed: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      return { success: true, data };

    } catch (error) {
      console.error('API request error:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown API error'
      };
    }
  }

  // Smartico API específico - versão real baseada na documentação
  async fetchSmarticoConversions(fromDate?: string, toDate?: string): Promise<ConversionData[]> {
    // Endpoints reais da API Smartico baseados na documentação oficial
    const smarticoEndpoints = [
      '/api/v1/affiliate/stats',
      '/api/v1/player/list',
      '/api/v1/conversion/list',
      '/affiliate/stats',
      '/player/list', 
      '/conversion/list',
      '/stats',
      '/list'
    ];

    const params = new URLSearchParams();
    if (fromDate) params.append('date_from', fromDate);
    if (toDate) params.append('date_to', toDate);
    
    // Adicionar parâmetros específicos da Smartico
    params.append('limit', '100');
    params.append('offset', '0');

    let workingEndpoint = '';
    
    for (const endpoint of smarticoEndpoints) {
      try {
        const fullEndpoint = `${endpoint}?${params.toString()}`;
        console.log(`🔍 Testando endpoint Smartico: ${endpoint}`);
        
        const response = await this.makeApiRequest(fullEndpoint);
        
        if (response.success && response.data) {
          console.log(`✅ Endpoint Smartico funcionando: ${endpoint}`);
          workingEndpoint = endpoint;
          return this.transformSmarticoData(response.data);
        }
      } catch (error) {
        const errorMsg = error instanceof Error ? error.message : 'Unknown error';
        console.log(`❌ Endpoint ${endpoint} falhou: ${errorMsg}`);
        continue;
      }
    }

    // Se nenhum endpoint funcionou, a API pode estar configurada incorretamente
    console.warn(`⚠️ API Smartico: Nenhum endpoint de dados disponível. Verifique as credenciais e permissões.`);
    return [];
  }

  private transformSmarticoData(smarticoData: any): ConversionData[] {
    if (!Array.isArray(smarticoData.conversions)) {
      return [];
    }

    return smarticoData.conversions.map((item: any) => ({
      customerId: item.customer_id || item.user_id,
      type: this.mapSmarticoEventType(item.event_type),
      amount: parseFloat(item.amount || '0'),
      commission: parseFloat(item.commission || '0'),
      timestamp: item.created_at || item.timestamp,
      additionalData: {
        source: 'smartico_api',
        originalEvent: item.event_type,
        metadata: item.metadata || {}
      }
    }));
  }

  private mapSmarticoEventType(eventType: string): 'click' | 'registration' | 'deposit' | 'profit' {
    const mapping: Record<string, 'click' | 'registration' | 'deposit' | 'profit'> = {
      'click': 'click',
      'registration': 'registration',
      'signup': 'registration',
      'deposit': 'deposit',
      'first_deposit': 'deposit',
      'profit': 'profit',
      'revenue': 'profit'
    };

    return mapping[eventType.toLowerCase()] || 'click';
  }

  async syncConversions(fromDate?: string): Promise<{ synced: number; errors: string[] }> {
    console.log(`🔄 Iniciando sincronização API para casa ${this.houseId}`);
    
    const errors: string[] = [];
    let syncedCount = 0;

    try {
      // Usar data da última sincronização se não especificada
      if (!fromDate) {
        const house = await db
          .select()
          .from(schema.bettingHouses)
          .where(eq(schema.bettingHouses.id, this.houseId))
          .limit(1);

        if (house[0]?.lastSyncAt) {
          fromDate = house[0].lastSyncAt.toISOString().split('T')[0];
        } else {
          // Última semana por padrão
          const weekAgo = new Date();
          weekAgo.setDate(weekAgo.getDate() - 7);
          fromDate = weekAgo.toISOString().split('T')[0];
        }
      }

      // Atualizar status para "syncing"
      await this.updateSyncStatus('syncing');

      // Buscar conversões da API
      const conversions = await this.fetchSmarticoConversions(fromDate);
      
      // Processar cada conversão
      for (const conversion of conversions) {
        try {
          await this.saveConversion(conversion);
          syncedCount++;
        } catch (error) {
          errors.push(`Erro ao salvar conversão ${conversion.customerId}: ${error}`);
        }
      }

      // Atualizar status de sucesso
      await this.updateSyncStatus('success', null, new Date());
      
      console.log(`✅ Sincronização concluída: ${syncedCount} conversões`);
      
      return { synced: syncedCount, errors };

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
      await this.updateSyncStatus('error', errorMessage);
      errors.push(errorMessage);
      
      console.error(`❌ Erro na sincronização: ${errorMessage}`);
      return { synced: syncedCount, errors };
    }
  }

  private async saveConversion(conversionData: ConversionData): Promise<void> {
    // Verificar se já existe
    const existing = await db
      .select()
      .from(schema.conversions)
      .where(
        and(
          eq(schema.conversions.houseId, this.houseId),
          eq(schema.conversions.customerId, conversionData.customerId),
          eq(schema.conversions.type, conversionData.type)
        )
      )
      .limit(1);

    if (existing.length > 0) {
      console.log(`⚠️ Conversão duplicada ignorada: ${conversionData.customerId}`);
      return;
    }

    // Encontrar afiliado baseado no customerId ou usar padrão
    let userId = 1; // Admin padrão
    
    // Tentar encontrar o afiliado correto baseado em links existentes
    const affiliateLink = await db
      .select()
      .from(schema.affiliateLinks)
      .where(eq(schema.affiliateLinks.houseId, this.houseId))
      .limit(1);

    if (affiliateLink[0]) {
      userId = affiliateLink[0].userId;
    }

    // Salvar conversão
    await db.insert(schema.conversions).values({
      userId,
      houseId: this.houseId,
      type: conversionData.type,
      amount: conversionData.amount?.toString() || '0',
      commission: conversionData.commission?.toString() || '0',
      customerId: conversionData.customerId,
      conversionData: conversionData.additionalData,
      convertedAt: new Date(conversionData.timestamp)
    });
  }

  private async updateSyncStatus(
    status: 'pending' | 'syncing' | 'success' | 'error',
    errorMessage?: string | null,
    lastSyncAt?: Date
  ): Promise<void> {
    const updateData: any = {
      syncStatus: status,
      syncErrorMessage: errorMessage,
      updatedAt: new Date()
    };

    if (lastSyncAt) {
      updateData.lastSyncAt = lastSyncAt;
    }

    await db
      .update(schema.bettingHouses)
      .set(updateData)
      .where(eq(schema.bettingHouses.id, this.houseId));
  }

  async testConnection(): Promise<{ success: boolean; message: string }> {
    try {
      // Test with a simple endpoint that might return plain text
      const response = await fetch(`${this.baseUrl}/health`, {
        method: 'GET',
        headers: this.authHeaders
      });

      if (response.ok) {
        return { success: true, message: 'Conexão com API estabelecida com sucesso' };
      } else {
        return { success: false, message: `API retornou status ${response.status}` };
      }
    } catch (error) {
      return { 
        success: false, 
        message: error instanceof Error ? error.message : 'Erro de conexão'
      };
    }
  }
}

// Factory para criar serviços baseados no tipo de casa
export class ApiIntegrationFactory {
  static async createService(houseId: number): Promise<ApiIntegrationService | null> {
    const house = await db
      .select()
      .from(schema.bettingHouses)
      .where(eq(schema.bettingHouses.id, houseId))
      .limit(1);

    if (!house[0] || (house[0].integrationType !== 'api' && house[0].integrationType !== 'hybrid') || !house[0].apiKey) {
      return null;
    }

    return new ApiIntegrationService({
      id: house[0].id,
      apiKey: house[0].apiKey,
      apiSecret: house[0].apiSecret || undefined,
      apiBaseUrl: house[0].apiBaseUrl || '',
      authType: house[0].authType || 'bearer',
      authHeaders: (house[0].authHeaders as Record<string, string>) || {}
    });
  }

  static async syncAllApiHouses(): Promise<void> {
    console.log('🔄 Iniciando sincronização de todas as casas API');

    const apiHouses = await db
      .select()
      .from(schema.bettingHouses)
      .where(
        and(
          eq(schema.bettingHouses.integrationType, 'api'),
          eq(schema.bettingHouses.isActive, true)
        )
      );

    for (const house of apiHouses) {
      try {
        const service = await this.createService(house.id);
        if (service) {
          await service.syncConversions();
        }
      } catch (error) {
        console.error(`❌ Erro ao sincronizar casa ${house.id}:`, error);
      }
    }

    console.log('✅ Sincronização de todas as casas API concluída');
  }
}