import cron from 'node-cron';
import { SmarticoFetcher } from '../services/smarticoFetcher';
import { DatabaseStorage } from '../storage';

export class SmarticoSyncScheduler {
  private fetcher: SmarticoFetcher;
  private isRunning = false;

  constructor(storage: DatabaseStorage) {
    this.fetcher = new SmarticoFetcher(storage);
  }

  start(): void {
    console.log('📅 Iniciando agendador Smartico - execução a cada 30 minutos');
    
    // Executar a cada 30 minutos
    cron.schedule('*/30 * * * *', async () => {
      if (this.isRunning) {
        console.log('⏸️ Sincronização já em andamento, pulando execução');
        return;
      }

      this.isRunning = true;
      console.log('🚀 Executando sincronização agendada do Smartico');
      
      try {
        await this.fetcher.syncAllHouses();
        console.log('✅ Sincronização agendada concluída com sucesso');
      } catch (error) {
        console.error('❌ Erro na sincronização agendada:', error);
      } finally {
        this.isRunning = false;
      }
    }, {
      scheduled: true,
      timezone: "America/Sao_Paulo"
    });

    console.log('✅ Agendador configurado: execução a cada 30 minutos');
  }

  // Método para executar sincronização manual
  async runManualSync(): Promise<void> {
    if (this.isRunning) {
      throw new Error('Sincronização já em andamento');
    }

    this.isRunning = true;
    console.log('🔄 Executando sincronização manual do Smartico');
    
    try {
      await this.fetcher.syncAllHouses();
      console.log('✅ Sincronização manual concluída com sucesso');
    } catch (error) {
      console.error('❌ Erro na sincronização manual:', error);
      throw error;
    } finally {
      this.isRunning = false;
    }
  }
}