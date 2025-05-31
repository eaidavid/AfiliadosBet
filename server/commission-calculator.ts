import { db } from "./db";
import * as schema from "@shared/schema";
import { eq, and } from "drizzle-orm";

interface CommissionResult {
  commission: number;
  type: string;
  valid: boolean;
  reason: string;
}

export class CommissionCalculator {
  
  /**
   * Calcula comissão CPA baseada em registro + depósito mínimo
   */
  static async calculateCPA(
    customerId: string, 
    affiliateId: number, 
    casa: string, 
    house: any,
    depositAmount: number
  ): Promise<CommissionResult> {
    
    // Verificar se já existe registro para este cliente
    const hasRegistration = await db.select()
      .from(schema.conversions)
      .where(and(
        eq(schema.conversions.customerId, customerId),
        eq(schema.conversions.casa, casa),
        eq(schema.conversions.evento, 'registration'),
        eq(schema.conversions.affiliateId, affiliateId)
      ))
      .limit(1);
    
    // Verificar se já foi pago CPA para este cliente
    const cpaPaid = await db.select()
      .from(schema.conversions)
      .where(and(
        eq(schema.conversions.customerId, customerId),
        eq(schema.conversions.casa, casa),
        eq(schema.conversions.commissionType, 'CPA'),
        eq(schema.conversions.affiliateId, affiliateId)
      ))
      .limit(1);
    
    if (cpaPaid.length > 0) {
      return {
        commission: 0,
        type: 'CPA',
        valid: false,
        reason: 'CPA já foi pago para este cliente'
      };
    }
    
    if (hasRegistration.length === 0) {
      return {
        commission: 0,
        type: 'CPA',
        valid: false,
        reason: 'Aguardando evento de registro'
      };
    }
    
    const minDeposit = parseFloat(house.minDeposit || '0');
    if (depositAmount < minDeposit) {
      return {
        commission: 0,
        type: 'CPA',
        valid: false,
        reason: `Depósito R$ ${depositAmount} menor que mínimo R$ ${minDeposit}`
      };
    }
    
    const cpaValue = parseFloat(house.commissionValue || '0');
    return {
      commission: cpaValue,
      type: 'CPA',
      valid: true,
      reason: `CPA válido: Registro + Depósito R$ ${depositAmount} >= Mínimo R$ ${minDeposit}`
    };
  }
  
  /**
   * Calcula comissão RevShare baseada no lucro (profit)
   */
  static calculateRevShare(profitAmount: number, house: any): CommissionResult {
    if (profitAmount <= 0) {
      return {
        commission: 0,
        type: 'RevShare',
        valid: false,
        reason: 'Valor de profit deve ser positivo'
      };
    }
    
    const percentage = parseFloat(house.commissionValue || '0');
    const commission = (profitAmount * percentage) / 100;
    
    return {
      commission,
      type: 'RevShare',
      valid: true,
      reason: `RevShare: ${percentage}% de R$ ${profitAmount}`
    };
  }
  
  /**
   * Calcula comissão Híbrida (CPA + RevShare)
   */
  static async calculateHybrid(
    customerId: string,
    affiliateId: number,
    casa: string,
    house: any,
    amount: number,
    evento: string
  ): Promise<CommissionResult> {
    
    let totalCommission = 0;
    let details = [];
    
    // Componente CPA (apenas para depósitos)
    if (evento === 'deposit') {
      const cpaResult = await this.calculateCPA(customerId, affiliateId, casa, {
        ...house,
        commissionValue: house.cpaValue || '0'
      }, amount);
      
      if (cpaResult.valid) {
        totalCommission += cpaResult.commission;
        details.push(`CPA: R$ ${cpaResult.commission}`);
      }
    }
    
    // Componente RevShare (para profit)
    if (evento === 'profit' && amount > 0) {
      const revShareResult = this.calculateRevShare(amount, {
        ...house,
        commissionValue: house.revshareValue || '0'
      });
      
      if (revShareResult.valid) {
        totalCommission += revShareResult.commission;
        details.push(`RevShare: R$ ${revShareResult.commission}`);
      }
    }
    
    return {
      commission: totalCommission,
      type: 'Hybrid',
      valid: totalCommission > 0,
      reason: details.length > 0 ? details.join(' + ') : 'Nenhuma comissão aplicável'
    };
  }
  
  /**
   * Função principal para calcular comissão baseada no tipo da casa
   */
  static async calculateCommission(
    customerId: string,
    affiliateId: number,
    casa: string,
    house: any,
    evento: string,
    amount: number
  ): Promise<CommissionResult> {
    
    console.log(`🧮 Calculando comissão: ${house.commissionType} para evento ${evento}`);
    
    switch (house.commissionType) {
      case 'CPA':
        if (evento === 'deposit') {
          return await this.calculateCPA(customerId, affiliateId, casa, house, amount);
        }
        break;
        
      case 'RevShare':
        if (evento === 'profit') {
          return this.calculateRevShare(amount, house);
        }
        break;
        
      case 'Hybrid':
        return await this.calculateHybrid(customerId, affiliateId, casa, house, amount, evento);
        
      default:
        break;
    }
    
    return {
      commission: 0,
      type: house.commissionType || 'Unknown',
      valid: false,
      reason: `Evento ${evento} não aplicável para tipo ${house.commissionType}`
    };
  }
}