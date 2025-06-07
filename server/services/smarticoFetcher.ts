import { db } from '../db';
import { bettingHouses, users, conversions } from '../../shared/schema';
import { eq, and } from 'drizzle-orm';

interface SmarticoApiResponse {
  data: Array<{
    affiliate_id: string;
    visit_count: number;
    registration_count: number;
    deposit_total: number;
    commissions_total: number;
    date: string;
  }>;
}

export class SmarticoFetcher {
  constructor() {}

  async syncAllHouses(): Promise<void> {
    console.log('🔄 Iniciando sincronização com API Smartico...');
    
    try {
      // Buscar casas com modo_recebimento = 'api'
      const apiHouses = await db
        .select()
        .from(bettingHouses)
        .where(eq(bettingHouses.modoRecebimento, 'api'));

      console.log(`📊 Encontradas ${apiHouses.length} casas configuradas para API`);

      for (const house of apiHouses) {
        if (house.apiKey) {
          await this.syncHouseData(house);
        } else {
          console.log(`⚠️ Casa ${house.name} não possui API Key configurada`);
        }
      }

      console.log('✅ Sincronização concluída');
    } catch (error) {
      console.error('❌ Erro na sincronização:', error);
    }
  }

  private async syncHouseData(house: any): Promise<void> {
    console.log(`🏠 Sincronizando dados da casa: ${house.name}`);
    
    try {
      const today = new Date().toISOString().split('T')[0];
      const apiData = await this.fetchFromSmartico(house.apiKey, today, today);
      
      if (apiData?.data) {
        for (const item of apiData.data) {
          await this.processAffiliateData(house, item);
        }
        console.log(`✅ Processados ${apiData.data.length} registros para ${house.name}`);
      }
    } catch (error) {
      console.error(`❌ Erro ao sincronizar ${house.name}:`, error);
    }
  }

  private async fetchFromSmartico(apiKey: string, dateFrom: string, dateTo: string): Promise<SmarticoApiResponse | null> {
    try {
      const url = 'https://boapi.smartico.ai/api/af2_media_report_op';
      const params = new URLSearchParams({
        aggregation_period: 'DAY',
        group_by: 'affiliate_id',
        date_from: dateFrom,
        date_to: dateTo
      });

      const response = await fetch(`${url}?${params}`, {
        method: 'GET',
        headers: {
          'Authorization': apiKey,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('❌ Erro ao consultar API Smartico:', error);
      return null;
    }
  }

  private async processAffiliateData(house: any, data: any): Promise<void> {
    const { affiliate_id, visit_count, registration_count, deposit_total, commissions_total, date } = data;
    
    // Buscar afiliado pelo username (affiliate_id)
    const affiliate = await db
      .select()
      .from(users)
      .where(eq(users.username, affiliate_id))
      .limit(1);

    if (affiliate.length === 0) {
      console.log(`⚠️ Afiliado não encontrado: ${affiliate_id}`);
      return;
    }

    const userId = affiliate[0].id;
    const convertedAt = new Date(date);

    // Processar eventos
    await this.processEvents(userId, house.id, {
      visit_count,
      registration_count,
      deposit_total,
      commissions_total
    }, convertedAt, house);
  }

  private async processEvents(userId: number, houseId: number, events: any, convertedAt: Date, house: any): Promise<void> {
    const { visit_count, registration_count, deposit_total, commissions_total } = events;
    
    // Processar cliques
    if (visit_count > 0) {
      await this.saveConversion(userId, houseId, 'click', null, null, convertedAt);
    }

    // Processar registros
    if (registration_count > 0) {
      await this.saveConversion(userId, houseId, 'registration', null, null, convertedAt);
    }

    // Processar depósitos
    if (deposit_total > 0) {
      const commission = this.calculateCommission(deposit_total, house);
      await this.saveConversion(userId, houseId, 'deposit', deposit_total.toString(), commission, convertedAt);
    }

    // Processar lucros
    if (commissions_total > 0) {
      await this.saveConversion(userId, houseId, 'profit', commissions_total.toString(), commissions_total.toString(), convertedAt);
    }
  }

  private calculateCommission(amount: number, house: any): string {
    try {
      if (house.commissionType === 'CPA') {
        return house.commissionValue || '0';
      } else if (house.commissionType === 'RevShare') {
        const percentage = parseFloat(house.commissionValue || '0');
        return (amount * (percentage / 100)).toFixed(2);
      } else if (house.commissionType === 'Hybrid') {
        // Usar valor CPA se disponível
        return house.cpaValue || house.commissionValue || '0';
      }
      return '0';
    } catch (error) {
      console.error('Erro ao calcular comissão:', error);
      return '0';
    }
  }

  private async saveConversion(userId: number, houseId: number, type: string, amount: string | null, commission: string | null, convertedAt: Date): Promise<void> {
    try {
      // Verificar se já existe conversão para evitar duplicação
      const existing = await db
        .select()
        .from(conversions)
        .where(
          and(
            eq(conversions.userId, userId),
            eq(conversions.houseId, houseId),
            eq(conversions.type, type),
            eq(conversions.convertedAt, convertedAt)
          )
        )
        .limit(1);

      if (existing.length === 0) {
        await db.insert(conversions).values({
          userId,
          houseId,
          type,
          amount,
          commission,
          convertedAt,
          customerId: `smartico_${Date.now()}`,
          conversionData: { source: 'smartico_api' }
        });
        
        console.log(`✅ Conversão salva: ${type} para usuário ${userId}`);
      } else {
        console.log(`ℹ️ Conversão já existe: ${type} para usuário ${userId} em ${convertedAt.toISOString()}`);
      }
    } catch (error) {
      console.error('❌ Erro ao salvar conversão:', error);
    }
  }
}