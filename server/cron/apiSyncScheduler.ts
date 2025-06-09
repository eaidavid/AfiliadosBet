import * as cron from 'node-cron';
import { ApiIntegrationFactory } from '../services/apiIntegrationService';
import { db } from '../db';
import * as schema from '../../shared/schema';
import { eq, and } from 'drizzle-orm';

export class ApiSyncScheduler {
  private static instance: ApiSyncScheduler;
  private scheduledTasks: Map<number, cron.ScheduledTask> = new Map();

  private constructor() {}

  static getInstance(): ApiSyncScheduler {
    if (!ApiSyncScheduler.instance) {
      ApiSyncScheduler.instance = new ApiSyncScheduler();
    }
    return ApiSyncScheduler.instance;
  }

  async initializeScheduler(): Promise<void> {
    console.log('🕐 Inicializando agendador de sincronização API');

    // Buscar todas as casas API e hybrid ativas
    const apiHouses = await db
      .select()
      .from(schema.bettingHouses)
      .where(
        and(
          eq(schema.bettingHouses.isActive, true)
        )
      );

    // Agendar sincronização apenas para casas com API (api ou hybrid)
    for (const house of apiHouses) {
      if (house.integrationType === 'api' || house.integrationType === 'hybrid') {
        await this.scheduleHouseSync(house);
      }
    }

    // Agendar limpeza de logs antigos (diário às 02:00)
    cron.schedule('0 2 * * *', () => {
      this.cleanupOldLogs();
    });

    console.log(`✅ Agendador inicializado com ${apiHouses.length} casas API`);
  }

  async scheduleHouseSync(house: any): Promise<void> {
    const houseId = house.id;
    const syncInterval = house.syncInterval || 30; // Padrão 30 minutos

    // Cancelar agendamento anterior se existir
    if (this.scheduledTasks.has(houseId)) {
      this.scheduledTasks.get(houseId)?.stop();
      this.scheduledTasks.delete(houseId);
    }

    // Criar novo agendamento
    const cronExpression = this.generateCronExpression(syncInterval);
    
    const task = cron.schedule(cronExpression, async () => {
      await this.executeHouseSync(houseId, house.name);
    }, {
      timezone: "America/Sao_Paulo"
    });

    this.scheduledTasks.set(houseId, task);
    
    console.log(`📅 Agendamento criado para ${house.name} (${houseId}): a cada ${syncInterval} minutos`);
  }

  private generateCronExpression(intervalMinutes: number): string {
    // Para intervalos menores que 60 minutos, usar minutos
    if (intervalMinutes <= 60) {
      return `*/${intervalMinutes} * * * *`;
    }
    
    // Para intervalos maiores, converter para horas
    const hours = Math.floor(intervalMinutes / 60);
    return `0 */${hours} * * *`;
  }

  private async executeHouseSync(houseId: number, houseName: string): Promise<void> {
    try {
      console.log(`🔄 Executando sincronização automática: ${houseName} (${houseId})`);

      const service = await ApiIntegrationFactory.createService(houseId);
      if (!service) {
        console.error(`❌ Não foi possível criar serviço para casa ${houseId}`);
        return;
      }

      const result = await service.syncConversions();
      
      if (result.errors.length > 0) {
        console.warn(`⚠️ Sincronização ${houseName} com erros:`, result.errors);
      } else {
        console.log(`✅ Sincronização ${houseName} concluída: ${result.synced} conversões`);
      }

      // Registrar log de sincronização
      await this.logSyncExecution(houseId, result.synced, result.errors);

    } catch (error) {
      console.error(`❌ Erro na sincronização automática ${houseName}:`, error);
      await this.logSyncExecution(houseId, 0, [error instanceof Error ? error.message : 'Erro desconhecido']);
    }
  }

  private async logSyncExecution(houseId: number, syncedCount: number, errors: string[]): Promise<void> {
    // Aqui você pode implementar uma tabela de logs específica ou usar o sistema existente
    console.log(`📝 Log sincronização casa ${houseId}: ${syncedCount} itens, ${errors.length} erros`);
  }

  async updateHouseSchedule(houseId: number): Promise<void> {
    const house = await db
      .select()
      .from(schema.bettingHouses)
      .where(eq(schema.bettingHouses.id, houseId))
      .limit(1);

    if (house[0] && (house[0].integrationType === 'api' || house[0].integrationType === 'hybrid') && house[0].isActive) {
      await this.scheduleHouseSync(house[0]);
    } else {
      // Remover agendamento se casa não é mais API/hybrid ou está inativa
      this.removeHouseSchedule(houseId);
    }
  }

  removeHouseSchedule(houseId: number): void {
    const task = this.scheduledTasks.get(houseId);
    if (task) {
      task.stop();
      this.scheduledTasks.delete(houseId);
      console.log(`🛑 Agendamento removido para casa ${houseId}`);
    }
  }

  async manualSync(houseId: number): Promise<{ success: boolean; message: string; data?: any }> {
    try {
      const service = await ApiIntegrationFactory.createService(houseId);
      if (!service) {
        return { success: false, message: 'Casa não configurada para API ou inativa' };
      }

      const result = await service.syncConversions();
      
      return {
        success: true,
        message: `Sincronização manual concluída: ${result.synced} conversões processadas`,
        data: result
      };

    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Erro na sincronização manual'
      };
    }
  }

  async testHouseConnection(houseId: number): Promise<{ success: boolean; message: string }> {
    try {
      const service = await ApiIntegrationFactory.createService(houseId);
      if (!service) {
        return { success: false, message: 'Casa não configurada para API' };
      }

      return await service.testConnection();

    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Erro no teste de conexão'
      };
    }
  }

  private async cleanupOldLogs(): Promise<void> {
    // Implementar limpeza de logs antigos (mais de 30 dias)
    console.log('🧹 Limpeza de logs antigos executada');
  }

  getActiveSchedules(): { houseId: number; isActive: boolean }[] {
    const result: { houseId: number; isActive: boolean }[] = [];
    this.scheduledTasks.forEach((task, houseId) => {
      result.push({
        houseId,
        isActive: true // Always true if task exists in the map
      });
    });
    return result;
  }

  async stopAllSchedules(): Promise<void> {
    this.scheduledTasks.forEach((task, houseId) => {
      task.stop();
      console.log(`🛑 Agendamento parado para casa ${houseId}`);
    });
    this.scheduledTasks.clear();
  }
}