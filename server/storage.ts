import {
  users,
  bettingHouses,
  affiliateLinks,
  conversions,
  payments,
  clickTracking,
  type User,
  type InsertUser,
  type BettingHouse,
  type InsertBettingHouse,
  type AffiliateLink,
  type InsertAffiliateLink,
  type Conversion,
  type InsertConversion,
  type Payment,
  type InsertPayment,
  type ClickTracking,
  type LoginData,
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, and, sql, count } from "drizzle-orm";
import bcrypt from "bcrypt";

export interface IStorage {
  // User operations
  createUser(user: InsertUser): Promise<User>;
  getUserById(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  authenticateUser(credentials: LoginData): Promise<User | undefined>;
  updateUser(id: number, updates: Partial<User>): Promise<User>;
  
  // Betting house operations
  createBettingHouse(house: InsertBettingHouse): Promise<BettingHouse>;
  getAllBettingHouses(): Promise<BettingHouse[]>;
  getActiveBettingHouses(): Promise<BettingHouse[]>;
  getBettingHouseById(id: number): Promise<BettingHouse | undefined>;
  updateBettingHouse(id: number, updates: Partial<BettingHouse>): Promise<BettingHouse>;
  deleteBettingHouse(id: number): Promise<void>;
  
  // Affiliate link operations
  createAffiliateLink(link: InsertAffiliateLink): Promise<AffiliateLink>;
  getAffiliateLinksByUserId(userId: number): Promise<AffiliateLink[]>;
  getAffiliateLinkByUserAndHouse(userId: number, houseId: number): Promise<AffiliateLink | undefined>;
  deactivateAffiliateLink(id: number): Promise<void>;
  
  // Conversion operations
  createConversion(conversion: InsertConversion): Promise<Conversion>;
  getConversionsByUserId(userId: number): Promise<Conversion[]>;
  getConversionsByHouseId(houseId: number): Promise<Conversion[]>;
  
  // Click tracking operations
  trackClick(click: Omit<ClickTracking, 'id' | 'clickedAt'>): Promise<void>;
  getClicksByUserId(userId: number): Promise<ClickTracking[]>;
  
  // Payment operations
  createPayment(payment: InsertPayment): Promise<Payment>;
  getPaymentsByUserId(userId: number): Promise<Payment[]>;
  updatePaymentStatus(id: number, status: string, transactionId?: string): Promise<void>;
  
  // Statistics operations
  getUserStats(userId: number): Promise<{
    totalClicks: number;
    totalRegistrations: number;
    totalDeposits: number;
    totalCommission: number;
    conversionRate: number;
  }>;
  
  getAdminStats(): Promise<{
    totalAffiliates: number;
    activeHouses: number;
    totalVolume: number;
    paidCommissions: number;
  }>;
  
  getTopAffiliates(limit?: number): Promise<Array<User & { totalCommission: number }>>;
  getTopHouses(limit?: number): Promise<Array<BettingHouse & { totalVolume: number; affiliateCount: number }>>;
  
  // Additional admin operations
  getAllAffiliates(): Promise<Array<User & { affiliateHouses?: number; totalConversions?: number; totalCommission?: number }>>;
  getAffiliatesByHouseId(houseId: number): Promise<Array<User & { affiliateLink?: AffiliateLink }>>;
  updateUserStatus(id: number, isActive: boolean): Promise<void>;
  resetUserPassword(id: number): Promise<void>;
  deleteUser(id: number): Promise<void>;
  validatePassword(password: string, hashedPassword: string): Promise<boolean>;

  // Postback operations
  getPostbackUrl(houseId: number): Promise<string>;
  generateSecurityToken(): string;
  updateHousePostbackConfig(id: number, config: { enabledPostbacks: string[], parameterMapping: any }): Promise<BettingHouse>;
  processPostbackEvent(data: {
    subid: string;
    event: string;
    amount: number;
    house: string;
    customerId?: string;
    rawData: string;
    ip: string;
  }): Promise<{ success: boolean; commission?: number; logId: number }>;
  
  // Statistics for postback events
  getPostbackLogs(houseId?: number, limit?: number): Promise<any[]>;
  getEventStats(userId: number): Promise<{ [event: string]: number }>;
  getCommissionStats(userId: number): Promise<{ total: number; byType: { [type: string]: number } }>;
}

export class DatabaseStorage implements IStorage {
  async createUser(userData: InsertUser): Promise<User> {
    const { confirmPassword, password, ...otherData } = userData;
    const hashedPassword = await bcrypt.hash(password, 10);
    
    const [user] = await db
      .insert(users)
      .values({
        ...otherData,
        password: hashedPassword,
      })
      .returning();
    return user;
  }

  async getUserById(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user;
  }

  async authenticateUser(credentials: LoginData): Promise<User | undefined> {
    // Try to find user by email first, then by username
    let user = await this.getUserByEmail(credentials.usernameOrEmail);
    if (!user) {
      user = await this.getUserByUsername(credentials.usernameOrEmail);
    }

    if (!user) {
      return undefined;
    }

    const isPasswordValid = await bcrypt.compare(credentials.password, user.password);
    if (!isPasswordValid) {
      return undefined;
    }

    return user;
  }

  async updateUser(id: number, updates: Partial<User>): Promise<User> {
    const [user] = await db
      .update(users)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(users.id, id))
      .returning();
    return user;
  }

  async createBettingHouse(houseData: InsertBettingHouse): Promise<BettingHouse> {
    console.log(`📋 Dados recebidos para criar casa:`, houseData);
    console.log(`📊 Tipo de comissão recebido: ${houseData.commissionType}`);
    console.log(`💰 Valor da comissão recebido: ${houseData.commissionValue}`);
    
    // Gerar identificador único se não fornecido
    const identifier = houseData.identifier || 
      `${houseData.name.toLowerCase().replace(/[^a-z0-9]/g, '')}${Date.now()}`;
    
    // Mapeamento padrão de parâmetros se não fornecido
    const defaultParameterMapping = {
      subid: "subid",
      amount: "amount",
      customer_id: "customer_id"
    };
    
    // Gerar token de segurança único
    const securityToken = `token_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    // Preparar dados para inserção
    const dataToInsert = {
      ...houseData,
      identifier,
      securityToken,
      parameterMapping: houseData.parameterMapping || defaultParameterMapping,
      enabledPostbacks: houseData.enabledPostbacks || []
    };
    
    console.log(`💾 Dados que serão inseridos no banco:`, dataToInsert);
    
    // Inserir com token de segurança gerado
    const [house] = await db
      .insert(bettingHouses)
      .values(dataToInsert)
      .returning();
    
    console.log(`✅ Casa criada no banco:`, house);
    console.log(`🔐 Token de segurança gerado automaticamente para ${house.name}: ${house.securityToken}`);
    return house;
  }

  async getAllBettingHouses(): Promise<BettingHouse[]> {
    return await db.select().from(bettingHouses).orderBy(desc(bettingHouses.createdAt));
  }

  async getActiveBettingHouses(): Promise<BettingHouse[]> {
    return await db
      .select()
      .from(bettingHouses)
      .where(eq(bettingHouses.isActive, true))
      .orderBy(bettingHouses.name);
  }

  async getBettingHouseById(id: number): Promise<BettingHouse | undefined> {
    const [house] = await db.select().from(bettingHouses).where(eq(bettingHouses.id, id));
    return house;
  }

  async updateBettingHouse(id: number, updates: Partial<BettingHouse>): Promise<BettingHouse> {
    const [house] = await db
      .update(bettingHouses)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(bettingHouses.id, id))
      .returning();
    return house;
  }

  async deleteBettingHouse(id: number): Promise<void> {
    await db.delete(bettingHouses).where(eq(bettingHouses.id, id));
  }

  async createAffiliateLink(linkData: InsertAffiliateLink): Promise<AffiliateLink> {
    const [link] = await db
      .insert(affiliateLinks)
      .values(linkData)
      .returning();
    return link;
  }

  async getAffiliateLinksByUserId(userId: number): Promise<AffiliateLink[]> {
    console.log("Buscando links para userId:", userId, typeof userId);
    const result = await db
      .select()
      .from(affiliateLinks)
      .where(and(eq(affiliateLinks.userId, userId), eq(affiliateLinks.isActive, true)));
    console.log("Resultado da busca:", result.length, result);
    return result;
  }

  async getAffiliateLinkByUserAndHouse(userId: number, houseId: number): Promise<AffiliateLink | undefined> {
    const [link] = await db
      .select()
      .from(affiliateLinks)
      .where(
        and(
          eq(affiliateLinks.userId, userId),
          eq(affiliateLinks.houseId, houseId),
          eq(affiliateLinks.isActive, true)
        )
      );
    return link;
  }

  async deactivateAffiliateLink(id: number): Promise<void> {
    await db
      .update(affiliateLinks)
      .set({ isActive: false })
      .where(eq(affiliateLinks.id, id));
  }

  async createConversion(conversionData: InsertConversion): Promise<Conversion> {
    const [conversion] = await db
      .insert(conversions)
      .values(conversionData)
      .returning();
    return conversion;
  }

  async getConversionsByUserId(userId: number): Promise<Conversion[]> {
    return await db
      .select()
      .from(conversions)
      .where(eq(conversions.userId, userId))
      .orderBy(desc(conversions.convertedAt));
  }

  async getConversionsByHouseId(houseId: number): Promise<Conversion[]> {
    return await db
      .select()
      .from(conversions)
      .where(eq(conversions.houseId, houseId))
      .orderBy(desc(conversions.convertedAt));
  }

  async trackClick(clickData: Omit<ClickTracking, 'id' | 'clickedAt'>): Promise<void> {
    await db.insert(clickTracking).values(clickData);
  }

  async getClicksByUserId(userId: number): Promise<ClickTracking[]> {
    return await db
      .select()
      .from(clickTracking)
      .where(eq(clickTracking.userId, userId))
      .orderBy(desc(clickTracking.clickedAt));
  }

  async createPayment(paymentData: InsertPayment): Promise<Payment> {
    const [payment] = await db
      .insert(payments)
      .values(paymentData)
      .returning();
    return payment;
  }

  async getPaymentsByUserId(userId: number): Promise<Payment[]> {
    return await db
      .select()
      .from(payments)
      .where(eq(payments.userId, userId))
      .orderBy(desc(payments.createdAt));
  }

  async updatePaymentStatus(id: number, status: string, transactionId?: string): Promise<void> {
    const updates: any = { status };
    if (status === 'completed') {
      updates.paidAt = new Date();
    }
    if (transactionId) {
      updates.transactionId = transactionId;
    }

    await db
      .update(payments)
      .set(updates)
      .where(eq(payments.id, id));
  }

  async getUserStats(userId: number): Promise<{
    totalClicks: number;
    totalRegistrations: number;
    totalDeposits: number;
    totalCommission: number;
    conversionRate: number;
  }> {
    // Get conversion stats from conversions table (onde todos os postbacks são salvos)
    const conversionStats = await db
      .select({
        type: conversions.type,
        count: count(),
        totalCommission: sql<number>`sum(CAST(${conversions.commission} AS DECIMAL))`,
      })
      .from(conversions)
      .where(eq(conversions.userId, userId))
      .groupBy(conversions.type);

    console.log(`Conversion stats for user ${userId}:`, conversionStats);

    const totalClicks = conversionStats.find(s => s.type === 'click')?.count || 0;
    const registrations = conversionStats.find(s => s.type === 'registration')?.count || 0;
    const deposits = conversionStats.filter(s => 
      s.type === 'deposit' || 
      s.type === 'first_deposit' || 
      s.type === 'recurring_deposit'
    ).reduce((sum, stat) => sum + (stat.count || 0), 0);
    
    const totalCommission = conversionStats.reduce((sum, stat) => sum + (stat.totalCommission || 0), 0);
    const conversionRate = totalClicks > 0 ? (registrations / totalClicks) * 100 : 0;

    const result = {
      totalClicks,
      totalRegistrations: registrations,
      totalDeposits: deposits,
      totalCommission,
      conversionRate,
    };

    console.log(`Final stats for user ${userId}:`, result);
    return result;
  }

  async getAdminStats(): Promise<{
    totalAffiliates: number;
    activeHouses: number;
    totalVolume: number;
    paidCommissions: number;
    topAffiliates: any[];
    topHouses: any[];
  }> {
    // Buscar todas as estatísticas de forma centralizada
    const totalAffiliates = await db.select({ count: sql`count(*)` }).from(users).where(eq(users.role, 'affiliate'));
    const totalHouses = await db.select({ count: sql`count(*)` }).from(bettingHouses).where(eq(bettingHouses.isActive, true));
    const totalConversions = await db.select({ 
      totalAmount: sql`coalesce(sum(CAST(${conversions.amount} AS DECIMAL)), 0)`,
      totalCommission: sql`coalesce(sum(CAST(${conversions.commission} AS DECIMAL)), 0)`
    }).from(conversions);
    
    // Top afiliados por comissão
    const topAffiliates = await db
      .select({
        id: users.id,
        username: users.username,
        fullName: users.fullName,
        email: users.email,
        totalCommission: sql`coalesce(sum(CAST(${conversions.commission} AS DECIMAL)), 0)`.as('totalCommission'),
        totalConversions: sql`count(${conversions.id})`.as('totalConversions')
      })
      .from(users)
      .leftJoin(conversions, eq(users.id, conversions.userId))
      .where(eq(users.role, 'affiliate'))
      .groupBy(users.id, users.username, users.fullName, users.email)
      .orderBy(sql`coalesce(sum(CAST(${conversions.commission} AS DECIMAL)), 0) desc`)
      .limit(5);

    // Top casas por volume
    const topHouses = await db
      .select({
        id: bettingHouses.id,
        name: bettingHouses.name,
        totalVolume: sql`coalesce(sum(CAST(${conversions.amount} AS DECIMAL)), 0)`.as('totalVolume'),
        totalConversions: sql`count(${conversions.id})`.as('totalConversions'),
        affiliateCount: sql`count(distinct ${conversions.userId})`.as('affiliateCount')
      })
      .from(bettingHouses)
      .leftJoin(conversions, eq(bettingHouses.id, conversions.houseId))
      .where(eq(bettingHouses.isActive, true))
      .groupBy(bettingHouses.id, bettingHouses.name)
      .orderBy(sql`coalesce(sum(CAST(${conversions.amount} AS DECIMAL)), 0) desc`)
      .limit(5);

    return {
      totalAffiliates: Number(totalAffiliates[0]?.count || 0),
      activeHouses: Number(totalHouses[0]?.count || 0),
      totalVolume: Number(totalConversions[0]?.totalAmount || 0),
      paidCommissions: Number(totalConversions[0]?.totalCommission || 0),
      topAffiliates: topAffiliates.map(aff => ({
        ...aff,
        totalCommission: Number(aff.totalCommission),
        totalConversions: Number(aff.totalConversions)
      })),
      topHouses: topHouses.map(house => ({
        ...house,
        totalVolume: Number(house.totalVolume),
        totalConversions: Number(house.totalConversions),
        affiliateCount: Number(house.affiliateCount)
      }))
    };
  }

  async getTopAffiliates(limit = 10): Promise<Array<User & { totalCommission: number }>> {
    const result = await db
      .select({
        id: users.id,
        username: users.username,
        email: users.email,
        fullName: users.fullName,
        totalCommission: sql<number>`sum(${conversions.commission})`,
      })
      .from(users)
      .leftJoin(conversions, eq(users.id, conversions.userId))
      .where(eq(users.role, 'affiliate'))
      .groupBy(users.id, users.username, users.email, users.fullName)
      .orderBy(desc(sql`sum(${conversions.commission})`))
      .limit(limit);

    return result.map(row => ({
      ...row,
      password: '',
      cpf: '',
      birthDate: '',
      phone: null,
      city: null,
      state: null,
      country: 'BR',
      role: 'affiliate' as const,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
      totalCommission: row.totalCommission || 0,
    }));
  }

  async getTopHouses(limit = 10): Promise<Array<BettingHouse & { totalVolume: number; affiliateCount: number }>> {
    const result = await db
      .select({
        id: bettingHouses.id,
        name: bettingHouses.name,
        description: bettingHouses.description,
        logoUrl: bettingHouses.logoUrl,
        baseUrl: bettingHouses.baseUrl,
        primaryParam: bettingHouses.primaryParam,
        additionalParams: bettingHouses.additionalParams,
        commissionType: bettingHouses.commissionType,
        commissionValue: bettingHouses.commissionValue,
        minDeposit: bettingHouses.minDeposit,
        paymentMethods: bettingHouses.paymentMethods,
        isActive: bettingHouses.isActive,
        createdAt: bettingHouses.createdAt,
        updatedAt: bettingHouses.updatedAt,
        totalVolume: sql<number>`sum(${conversions.amount})`,
        affiliateCount: sql<number>`count(distinct ${affiliateLinks.userId})`,
      })
      .from(bettingHouses)
      .leftJoin(conversions, eq(bettingHouses.id, conversions.houseId))
      .leftJoin(affiliateLinks, eq(bettingHouses.id, affiliateLinks.houseId))
      .groupBy(
        bettingHouses.id,
        bettingHouses.name,
        bettingHouses.description,
        bettingHouses.logoUrl,
        bettingHouses.baseUrl,
        bettingHouses.primaryParam,
        bettingHouses.additionalParams,
        bettingHouses.commissionType,
        bettingHouses.commissionValue,
        bettingHouses.minDeposit,
        bettingHouses.paymentMethods,
        bettingHouses.isActive,
        bettingHouses.createdAt,
        bettingHouses.updatedAt
      )
      .orderBy(desc(sql`sum(${conversions.amount})`))
      .limit(limit);

    return result.map(row => ({
      ...row,
      totalVolume: row.totalVolume || 0,
      affiliateCount: row.affiliateCount || 0,
    }));
  }

  async getAllAffiliates(): Promise<Array<User & { affiliateHouses?: number }>> {
    console.log("Iniciando busca de afiliados...");
    
    // Buscar todos os usuários com role 'affiliate'
    const result = await db
      .select()
      .from(users)
      .where(eq(users.role, 'affiliate'));

    console.log(`Encontrados ${result.length} afiliados no banco:`, result.map(u => u.username));

    // Para cada usuário, contar suas casas afiliadas
    const affiliatesWithStats = await Promise.all(
      result.map(async (user) => {
        const [linksCount] = await db
          .select({ count: count() })
          .from(affiliateLinks)
          .where(eq(affiliateLinks.userId, user.id));
        
        return {
          ...user,
          affiliateHouses: linksCount.count,
        };
      })
    );

    console.log("Afiliados com estatísticas:", affiliatesWithStats);
    return affiliatesWithStats;
  }

  async updateUserStatus(id: number, isActive: boolean): Promise<void> {
    await db
      .update(users)
      .set({ isActive })
      .where(eq(users.id, id));
  }

  async resetUserPassword(id: number): Promise<void> {
    // Gerar nova senha temporária
    const tempPassword = Math.random().toString(36).slice(-8);
    const hashedPassword = await bcrypt.hash(tempPassword, 10);
    
    await db
      .update(users)
      .set({ password: hashedPassword })
      .where(eq(users.id, id));
    
    // Em uma implementação real, enviaria email com a nova senha
    console.log(`New password for user ${id}: ${tempPassword}`);
  }

  async deleteUser(id: number): Promise<void> {
    // Primeiro, excluir dados relacionados
    await db.delete(affiliateLinks).where(eq(affiliateLinks.userId, id));
    await db.delete(clickTracking).where(eq(clickTracking.userId, id));
    await db.delete(payments).where(eq(payments.userId, id));
    
    // Depois, excluir o usuário
    await db.delete(users).where(eq(users.id, id));
  }

  // IMPLEMENTAÇÃO DAS FUNÇÕES DE POSTBACK

  async getPostbackUrl(houseId: number): Promise<string> {
    const house = await this.getBettingHouseById(houseId);
    if (!house) {
      throw new Error("Casa de apostas não encontrada");
    }

    const baseUrl = process.env.BASE_URL || "https://yourapp.replit.app";
    return `${baseUrl}/api/postback/${house.securityToken}`;
  }

  generateSecurityToken(): string {
    return `${Date.now()}_${Math.random().toString(36).substring(2, 15)}_${Math.random().toString(36).substring(2, 15)}`;
  }

  async updateHousePostbackConfig(id: number, config: { enabledPostbacks: string[], parameterMapping: any }): Promise<BettingHouse> {
    const [house] = await db
      .update(bettingHouses)
      .set({
        enabledPostbacks: config.enabledPostbacks,
        parameterMapping: config.parameterMapping,
        updatedAt: new Date()
      })
      .where(eq(bettingHouses.id, id))
      .returning();
    return house;
  }

  async processPostbackEvent(data: {
    subid: string;
    event: string;
    amount: number;
    house: string;
    customerId?: string;
    rawData: string;
    ip: string;
  }): Promise<{ success: boolean; commission?: number; logId: number }> {
    
    // 1. Registrar log inicial do postback
    const [logEntry] = await db.insert(schema.postbackLogs).values({
      casa: data.house,
      evento: data.event,
      subid: data.subid,
      valor: data.amount.toString(),
      ip: data.ip,
      raw: data.rawData,
      status: 'PROCESSING'
    }).returning();

    try {
      // 2. Buscar afiliado pelo subid (username)
      const affiliate = await this.getUserByUsername(data.subid);
      if (!affiliate) {
        await db.update(schema.postbackLogs)
          .set({ status: 'ERROR_AFFILIATE_NOT_FOUND' })
          .where(eq(schema.postbackLogs.id, logEntry.id));
        return { success: false, logId: logEntry.id };
      }

      // 3. Buscar casa de apostas
      const [house] = await db.select()
        .from(bettingHouses)
        .where(sql`LOWER(${bettingHouses.name}) = ${data.house.toLowerCase()}`)
        .limit(1);

      if (!house) {
        await db.update(schema.postbackLogs)
          .set({ status: 'ERROR_HOUSE_NOT_FOUND' })
          .where(eq(schema.postbackLogs.id, logEntry.id));
        return { success: false, logId: logEntry.id };
      }

      // 4. Verificar se o evento está habilitado para esta casa
      const enabledEvents = house.enabledPostbacks as string[] || [];
      if (enabledEvents.length > 0 && !enabledEvents.includes(data.event)) {
        await db.update(schema.postbackLogs)
          .set({ status: 'ERROR_EVENT_DISABLED' })
          .where(eq(schema.postbackLogs.id, logEntry.id));
        return { success: false, logId: logEntry.id };
      }

      // 5. Registrar evento na tabela eventos
      const [evento] = await db.insert(schema.eventos).values({
        afiliadoId: affiliate.id,
        casa: data.house,
        evento: data.event,
        valor: data.amount.toString()
      }).returning();

      // 6. Calcular comissão baseada na configuração
      let commissionValue = 0;
      let commissionType = '';

      // Aplicar sua lógica: Casa paga 40%, você repassa 30%
      const houseCommissionRate = 0.40; // 40% que a casa paga
      const affiliateCommissionRate = 0.30; // 30% que você repassa

      switch (data.event) {
        case 'registration':
          // Para CPA, você pode definir um valor fixo ou percentual
          if (house.commissionType === 'cpa') {
            commissionValue = parseFloat(house.commissionValue) * affiliateCommissionRate;
            commissionType = 'CPA';
          }
          break;

        case 'deposit':
        case 'first_deposit':
        case 'revenue':
        case 'profit':
          // Para RevShare, calcular sobre o valor
          if (house.commissionType === 'revshare' && data.amount > 0) {
            const houseCommission = data.amount * houseCommissionRate;
            commissionValue = houseCommission * (affiliateCommissionRate / houseCommissionRate);
            commissionType = 'RevShare';
          }
          break;

        default:
          // Eventos como 'click' normalmente não geram comissão
          commissionType = 'Event';
          break;
      }

      // 7. Salvar comissão se houver
      if (commissionValue > 0) {
        await db.insert(schema.comissoes).values({
          afiliadoId: affiliate.id,
          eventoId: evento.id,
          tipo: commissionType,
          valor: commissionValue.toString(),
          affiliate: affiliate.username
        });

        // 8. Criar registro de conversão
        await this.createConversion({
          userId: affiliate.id,
          houseId: house.id,
          type: data.event,
          amount: data.amount.toString(),
          commission: commissionValue.toString(),
          customerId: data.customerId || null,
          affiliateLinkId: null,
          conversionData: { rawPostback: data.rawData }
        });

        // 9. Criar pagamento pendente
        await this.createPayment({
          userId: affiliate.id,
          amount: commissionValue,
          status: 'pending',
          description: `${commissionType} ${data.event} - ${data.house}`,
          conversionId: evento.id
        });
      }

      // 10. Atualizar log como processado com sucesso
      await db.update(schema.postbackLogs)
        .set({ status: 'SUCCESS' })
        .where(eq(schema.postbackLogs.id, logEntry.id));

      return { success: true, commission: commissionValue, logId: logEntry.id };

    } catch (error) {
      console.error("Erro ao processar postback:", error);
      await db.update(schema.postbackLogs)
        .set({ status: 'ERROR_PROCESSING' })
        .where(eq(schema.postbackLogs.id, logEntry.id));
      return { success: false, logId: logEntry.id };
    }
  }

  async getPostbackLogs(houseId?: number, limit = 100): Promise<any[]> {
    let query = db.select().from(schema.postbackLogs);
    
    if (houseId) {
      const house = await this.getBettingHouseById(houseId);
      if (house) {
        query = query.where(eq(schema.postbackLogs.casa, house.name));
      }
    }
    
    return await query.orderBy(desc(schema.postbackLogs.criadoEm)).limit(limit);
  }

  async getEventStats(userId: number): Promise<{ [event: string]: number }> {
    const events = await db.select({
      evento: schema.eventos.evento,
      count: count()
    })
    .from(schema.eventos)
    .where(eq(schema.eventos.afiliadoId, userId))
    .groupBy(schema.eventos.evento);

    const stats: { [event: string]: number } = {};
    events.forEach(event => {
      stats[event.evento] = event.count;
    });

    return stats;
  }

  async getCommissionStats(userId: number): Promise<{ total: number; byType: { [type: string]: number } }> {
    const commissions = await db.select({
      tipo: schema.comissoes.tipo,
      total: sql<number>`sum(CAST(${schema.comissoes.valor} AS DECIMAL))`
    })
    .from(schema.comissoes)
    .where(eq(schema.comissoes.afiliadoId, userId))
    .groupBy(schema.comissoes.tipo);

    let total = 0;
    const byType: { [type: string]: number } = {};

    commissions.forEach(comm => {
      const value = comm.total || 0;
      byType[comm.tipo] = value;
      total += value;
    });

    return { total, byType };
  }

  async validatePassword(password: string, hashedPassword: string): Promise<boolean> {
    return bcrypt.compare(password, hashedPassword);
  }

  async getAllAffiliates(): Promise<Array<User & { affiliateHouses?: number; totalConversions?: number; totalCommission?: number }>> {
    // Buscar todos os usuários que têm links de afiliação (distintos)
    const affiliatesData = await db
      .selectDistinct({
        id: users.id,
        username: users.username,
        email: users.email,
        fullName: users.fullName,
        cpf: users.cpf,
        phone: users.phone,
        country: users.country,
        role: users.role,
        isActive: users.isActive,
        createdAt: users.createdAt,
        updatedAt: users.updatedAt
      })
      .from(users)
      .innerJoin(affiliateLinks, eq(users.id, affiliateLinks.userId))
      .where(and(
        eq(users.role, "user"),
        eq(affiliateLinks.isActive, true)
      ));

    // Para cada afiliado, buscar estatísticas adicionais
    const affiliatesWithStats = await Promise.all(
      affiliatesData.map(async (affiliate) => {
        // Contar casas afiliadas ativas
        const houseCount = await db
          .select({ count: count() })
          .from(affiliateLinks)
          .where(and(
            eq(affiliateLinks.userId, affiliate.id),
            eq(affiliateLinks.isActive, true)
          ));

        // Buscar conversões
        const userConversions = await db
          .select()
          .from(conversions)
          .where(eq(conversions.userId, affiliate.id));

        const totalConversions = userConversions.length;
        const totalCommission = userConversions.reduce((sum, conv) => 
          sum + parseFloat(conv.commission || '0'), 0
        );

        return {
          ...affiliate,
          affiliateHouses: houseCount[0]?.count || 0,
          totalConversions,
          totalCommission
        };
      })
    );

    return affiliatesWithStats;
  }

  async getAffiliatesByHouseId(houseId: number): Promise<Array<User & { affiliateLink?: AffiliateLink }>> {
    const affiliates = await db
      .select({
        id: users.id,
        username: users.username,
        email: users.email,
        fullName: users.fullName,
        cpf: users.cpf,
        phone: users.phone,
        status: users.status,
        role: users.role,
        createdAt: users.createdAt,
        updatedAt: users.updatedAt,
        linkId: affiliateLinks.id,
        linkGeneratedUrl: affiliateLinks.generatedUrl,
        linkIsActive: affiliateLinks.isActive,
        linkCreatedAt: affiliateLinks.createdAt
      })
      .from(users)
      .innerJoin(affiliateLinks, eq(users.id, affiliateLinks.userId))
      .where(and(
        eq(affiliateLinks.houseId, houseId),
        eq(affiliateLinks.isActive, true)
      ));

    return affiliates.map(affiliate => ({
      id: affiliate.id,
      username: affiliate.username,
      email: affiliate.email,
      fullName: affiliate.fullName,
      cpf: affiliate.cpf,
      phone: affiliate.phone,
      status: affiliate.status,
      role: affiliate.role,
      createdAt: affiliate.createdAt,
      updatedAt: affiliate.updatedAt,
      affiliateLink: {
        id: affiliate.linkId,
        userId: affiliate.id,
        houseId: houseId,
        generatedUrl: affiliate.linkGeneratedUrl,
        isActive: affiliate.linkIsActive,
        createdAt: affiliate.linkCreatedAt
      }
    }));
  }
}

export const storage = new DatabaseStorage();
