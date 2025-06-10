import { db } from '../db';
import { eq } from 'drizzle-orm';
import * as schema from '../../shared/schema';

// Interface para dados de comissão calculada
export interface CommissionCalculation {
  totalPostbackValue: number;
  affiliateCommission: number;
  masterCommission: number;
  commissionType: 'RevShare' | 'CPA';
  totalPercent: number;
  affiliatePercent: number;
  calculationDetails: {
    tipo_comissao: string;
    valor_total_postback: number;
    percentual_total: number;
    percentual_repassado: number;
    valor_afiliado: number;
    valor_master: number;
  };
}

export class CommissionCalculator {
  /**
   * Calcula a divisão de comissões entre afiliado e master
   * @param houseId ID da casa de apostas
   * @param postbackValue Valor recebido no postback
   * @param commissionType Tipo de comissão ('RevShare' ou 'CPA')
   * @returns Cálculo detalhado das comissões
   */
  static async calculateCommission(
    houseId: number,
    postbackValue: number,
    commissionType: 'RevShare' | 'CPA'
  ): Promise<CommissionCalculation> {
    // Buscar configurações da casa
    const house = await db
      .select()
      .from(schema.bettingHouses)
      .where(eq(schema.bettingHouses.id, houseId))
      .limit(1);

    if (!house[0]) {
      throw new Error(`Casa de apostas ${houseId} não encontrada`);
    }

    const houseData = house[0];

    if (commissionType === 'RevShare') {
      return this.calculateRevShareCommission(houseData, postbackValue);
    } else {
      return this.calculateCPACommission(houseData, postbackValue);
    }
  }

  /**
   * Calcula comissão RevShare
   * Fórmula: comissao_afiliado = valor_postback × (percentual_repassado / percentual_total)
   */
  private static calculateRevShareCommission(
    house: any,
    postbackValue: number
  ): CommissionCalculation {
    // Percentual total enviado pela casa (ex: 35%)
    const totalPercent = parseFloat(house.revshareValue || '0');
    
    // Percentual repassado ao afiliado (ex: 20%)
    const affiliatePercent = parseFloat(house.revshareAffiliatePercent || '0');

    if (totalPercent === 0) {
      throw new Error('Percentual total RevShare não configurado para esta casa');
    }

    if (affiliatePercent === 0) {
      throw new Error('Percentual do afiliado RevShare não configurado para esta casa');
    }

    // Calcular comissões
    const affiliateCommission = postbackValue * (affiliatePercent / totalPercent);
    const masterCommission = postbackValue - affiliateCommission;

    const calculationDetails = {
      tipo_comissao: 'revshare',
      valor_total_postback: postbackValue,
      percentual_total: totalPercent,
      percentual_repassado: affiliatePercent,
      valor_afiliado: affiliateCommission,
      valor_master: masterCommission
    };

    return {
      totalPostbackValue: postbackValue,
      affiliateCommission,
      masterCommission,
      commissionType: 'RevShare',
      totalPercent,
      affiliatePercent,
      calculationDetails
    };
  }

  /**
   * Calcula comissão CPA
   * Fórmula: comissao_afiliado = valor_postback × (percentual_afiliado / 100)
   */
  private static calculateCPACommission(
    house: any,
    postbackValue: number
  ): CommissionCalculation {
    // Percentual repassado ao afiliado em CPA (ex: 70%)
    const affiliatePercent = parseFloat(house.cpaAffiliatePercent || '0');

    if (affiliatePercent === 0) {
      throw new Error('Percentual do afiliado CPA não configurado para esta casa');
    }

    // Calcular comissões
    const affiliateCommission = postbackValue * (affiliatePercent / 100);
    const masterCommission = postbackValue - affiliateCommission;

    const calculationDetails = {
      tipo_comissao: 'cpa',
      valor_total_postback: postbackValue,
      percentual_total: 100,
      percentual_repassado: affiliatePercent,
      valor_afiliado: affiliateCommission,
      valor_master: masterCommission
    };

    return {
      totalPostbackValue: postbackValue,
      affiliateCommission,
      masterCommission,
      commissionType: 'CPA',
      totalPercent: 100,
      affiliatePercent,
      calculationDetails
    };
  }

  /**
   * Valida se os percentuais estão configurados corretamente
   */
  static async validateHouseCommissionConfig(houseId: number): Promise<{
    isValid: boolean;
    errors: string[];
  }> {
    const house = await db
      .select()
      .from(schema.bettingHouses)
      .where(eq(schema.bettingHouses.id, houseId))
      .limit(1);

    if (!house[0]) {
      return { isValid: false, errors: ['Casa de apostas não encontrada'] };
    }

    const houseData = house[0];
    const errors: string[] = [];

    // Validar RevShare
    if (houseData.commissionType === 'RevShare' || houseData.commissionType === 'Hybrid') {
      const totalPercent = parseFloat(houseData.revshareValue || '0');
      const affiliatePercent = parseFloat(houseData.revshareAffiliatePercent || '0');

      if (totalPercent <= 0) {
        errors.push('Percentual total RevShare deve ser maior que 0');
      }

      if (affiliatePercent <= 0) {
        errors.push('Percentual do afiliado RevShare deve ser maior que 0');
      }

      if (affiliatePercent > totalPercent) {
        errors.push('Percentual do afiliado RevShare não pode ser maior que o percentual total');
      }
    }

    // Validar CPA
    if (houseData.commissionType === 'CPA' || houseData.commissionType === 'Hybrid') {
      const affiliatePercent = parseFloat(houseData.cpaAffiliatePercent || '0');

      if (affiliatePercent <= 0) {
        errors.push('Percentual do afiliado CPA deve ser maior que 0');
      }

      if (affiliatePercent > 100) {
        errors.push('Percentual do afiliado CPA não pode ser maior que 100%');
      }
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }
}