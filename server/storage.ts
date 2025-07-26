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

// Interface para o storage
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
  trackClick(click: Omit<ClickTracking, 'id' | 'createdAt'>): Promise<void>;
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
    const hashedPassword = await bcrypt.hash(userData.password, 10);
    
    const [user] = await db
      .insert(users)
      .values({
        ...userData,
        password: hashedPassword,
      })
      .returning();
    return user;
  }

  async getUserById(id: number): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.id, id));
    return result[0];
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.username, username));
    return result[0];
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.email, email));
    return result[0];
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
      .set({ ...updates })
      .where(eq(users.id, id))
      .returning();
    return user;
  }

  async createBettingHouse(houseData: InsertBettingHouse): Promise<BettingHouse> {
    // Gerar identificador único se não fornecido
    const identifier = houseData.identifier || 
      `${houseData.name.toLowerCase().replace(/[^a-z0-9]/g, '')}${Date.now()}`;
    
    // Gerar token de segurança único
    const securityToken = `token_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    // Preparar dados para inserção
    const dataToInsert = {
      ...houseData,
      identifier,
      securityToken,
      parameterMapping: houseData.parameterMapping || JSON.stringify({
        subid: "subid",
        amount: "amount",
        customer_id: "customer_id"
      }),
      enabledPostbacks: houseData.enabledPostbacks || JSON.stringify([])
    };
    
    const [house] = await db
      .insert(bettingHouses)
      .values(dataToInsert)
      .returning();
    
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
    const result = await db.select().from(bettingHouses).where(eq(bettingHouses.id, id));
    return result[0];
  }

  async updateBettingHouse(id: number, updates: Partial<BettingHouse>): Promise<BettingHouse> {
    const [house] = await db
      .update(bettingHouses)
      .set(updates)
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
    return await db
      .select()
      .from(affiliateLinks)
      .where(and(eq(affiliateLinks.userId, userId), eq(affiliateLinks.isActive, true)));
  }

  async getAffiliateLinkByUserAndHouse(userId: number, houseId: number): Promise<AffiliateLink | undefined> {
    const result = await db
      .select()
      .from(affiliateLinks)
      .where(
        and(
          eq(affiliateLinks.userId, userId),
          eq(affiliateLinks.houseId, houseId),
          eq(affiliateLinks.isActive, true)
        )
      );
    return result[0];
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
      .orderBy(desc(conversions.createdAt));
  }

  async getConversionsByHouseId(houseId: number): Promise<Conversion[]> {
    return await db
      .select()
      .from(conversions)
      .where(eq(conversions.houseId, houseId))
      .orderBy(desc(conversions.createdAt));
  }

  async trackClick(clickData: Omit<ClickTracking, 'id' | 'createdAt'>): Promise<void> {
    await db.insert(clickTracking).values(clickData);
  }

  async getClicksByUserId(userId: number): Promise<ClickTracking[]> {
    return await db
      .select()
      .from(clickTracking)
      .where(eq(clickTracking.userId, userId))
      .orderBy(desc(clickTracking.createdAt));
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
      .orderBy(desc(payments.requestedAt));
  }

  async updatePaymentStatus(id: number, status: string, transactionId?: string): Promise<void> {
    const updates: any = { status };
    if (status === 'completed') {
      updates.processedAt = new Date();
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
    // Get conversion stats from conversions table
    const conversionStats = await db
      .select({
        type: conversions.type,
        totalCount: count(),
        totalCommission: sql<string>`sum(CAST(${conversions.commission} AS DECIMAL))`,
      })
      .from(conversions)
      .where(eq(conversions.userId, userId))
      .groupBy(conversions.type);

    const totalClicks = conversionStats.find(s => s.type === 'click')?.totalCount || 0;
    const registrations = conversionStats.find(s => s.type === 'registration')?.totalCount || 0;
    const deposits = conversionStats.filter(s => 
      s.type === 'deposit' || 
      s.type === 'first_deposit' || 
      s.type === 'recurring_deposit'
    ).reduce((sum, stat) => sum + (stat.totalCount || 0), 0);
    
    const totalCommission = conversionStats.reduce((sum, stat) => {
      const commission = parseFloat(stat.totalCommission?.toString() || '0');
      return sum + commission;
    }, 0);
    const conversionRate = totalClicks > 0 ? (registrations / totalClicks) * 100 : 0;

    return {
      totalClicks,
      totalRegistrations: registrations,
      totalDeposits: deposits,
      totalCommission,
      conversionRate,
    };
  }

  async getAdminStats(): Promise<{
    totalAffiliates: number;
    activeHouses: number;
    totalVolume: number;
    paidCommissions: number;
  }> {
    const totalAffiliatesResult = await db.select({ count: count() }).from(users).where(eq(users.role, 'affiliate'));
    const activeHousesResult = await db.select({ count: count() }).from(bettingHouses).where(eq(bettingHouses.isActive, true));
    
    const totalConversionsResult = await db.select({ 
      totalAmount: sql<string>`sum(CAST(${conversions.amount} AS DECIMAL))`,
      totalCommission: sql<string>`sum(CAST(${conversions.commission} AS DECIMAL))`
    }).from(conversions);

    return {
      totalAffiliates: totalAffiliatesResult[0]?.count || 0,
      activeHouses: activeHousesResult[0]?.count || 0,
      totalVolume: parseFloat(totalConversionsResult[0]?.totalAmount || '0'),
      paidCommissions: parseFloat(totalConversionsResult[0]?.totalCommission || '0'),
    };
  }

  async getTopAffiliates(limit: number = 5): Promise<Array<User & { totalCommission: number }>> {
    const result = await db
      .select({
        id: users.id,
        username: users.username,
        fullName: users.fullName,
        email: users.email,
        cpf: users.cpf,
        birthDate: users.birthDate,
        phone: users.phone,
        city: users.city,
        state: users.state,
        country: users.country,
        role: users.role,
        isActive: users.isActive,
        pixKeyType: users.pixKeyType,
        pixKeyValue: users.pixKeyValue,
        createdAt: users.createdAt,
        updatedAt: users.updatedAt,
        password: users.password,
        totalCommission: sql<number>`COALESCE(sum(CAST(${conversions.commission} AS DECIMAL)), 0)`,
      })
      .from(users)
      .leftJoin(conversions, eq(users.id, conversions.userId))
      .where(eq(users.role, 'affiliate'))
      .groupBy(users.id)
      .orderBy(sql`COALESCE(sum(CAST(${conversions.commission} AS DECIMAL)), 0) desc`)
      .limit(limit);

    return result;
  }

  async getTopHouses(limit: number = 5): Promise<Array<BettingHouse & { totalVolume: number; affiliateCount: number }>> {
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
        cpaValue: bettingHouses.cpaValue,
        revshareValue: bettingHouses.revshareValue,
        revshareAffiliatePercent: bettingHouses.revshareAffiliatePercent,
        cpaAffiliatePercent: bettingHouses.cpaAffiliatePercent,
        minDeposit: bettingHouses.minDeposit,
        paymentMethods: bettingHouses.paymentMethods,
        isActive: bettingHouses.isActive,
        identifier: bettingHouses.identifier,
        enabledPostbacks: bettingHouses.enabledPostbacks,
        securityToken: bettingHouses.securityToken,
        parameterMapping: bettingHouses.parameterMapping,
        integrationType: bettingHouses.integrationType,
        apiConfig: bettingHouses.apiConfig,
        apiBaseUrl: bettingHouses.apiBaseUrl,
        apiKey: bettingHouses.apiKey,
        apiSecret: bettingHouses.apiSecret,
        apiVersion: bettingHouses.apiVersion,
        syncInterval: bettingHouses.syncInterval,
        lastSyncAt: bettingHouses.lastSyncAt,
        syncStatus: bettingHouses.syncStatus,
        syncErrorMessage: bettingHouses.syncErrorMessage,
        endpointMapping: bettingHouses.endpointMapping,
        authType: bettingHouses.authType,
        authHeaders: bettingHouses.authHeaders,
        createdAt: bettingHouses.createdAt,
        updatedAt: bettingHouses.updatedAt,
        totalVolume: sql<number>`COALESCE(sum(CAST(${conversions.amount} AS DECIMAL)), 0)`,
        affiliateCount: sql<number>`COUNT(DISTINCT ${affiliateLinks.userId})`,
      })
      .from(bettingHouses)
      .leftJoin(conversions, eq(bettingHouses.id, conversions.houseId))
      .leftJoin(affiliateLinks, eq(bettingHouses.id, affiliateLinks.houseId))
      .groupBy(bettingHouses.id)
      .orderBy(sql`COALESCE(sum(CAST(${conversions.amount} AS DECIMAL)), 0) desc`)
      .limit(limit);

    return result;
  }

  async getAllAffiliates(): Promise<Array<User & { affiliateHouses?: number; totalConversions?: number; totalCommission?: number }>> {
    const result = await db
      .select({
        id: users.id,
        username: users.username,
        fullName: users.fullName,
        email: users.email,
        cpf: users.cpf,
        birthDate: users.birthDate,
        phone: users.phone,
        city: users.city,
        state: users.state,
        country: users.country,
        role: users.role,
        isActive: users.isActive,
        pixKeyType: users.pixKeyType,
        pixKeyValue: users.pixKeyValue,
        createdAt: users.createdAt,
        updatedAt: users.updatedAt,
        password: users.password,
        affiliateHouses: sql<number>`COUNT(DISTINCT ${affiliateLinks.houseId})`,
        totalConversions: sql<number>`COUNT(${conversions.id})`,
        totalCommission: sql<number>`COALESCE(sum(CAST(${conversions.commission} AS DECIMAL)), 0)`,
      })
      .from(users)
      .leftJoin(affiliateLinks, eq(users.id, affiliateLinks.userId))
      .leftJoin(conversions, eq(users.id, conversions.userId))
      .where(eq(users.role, 'affiliate'))
      .groupBy(users.id)
      .orderBy(users.username);

    return result;
  }

  async getAffiliatesByHouseId(houseId: number): Promise<Array<User & { affiliateLink?: AffiliateLink }>> {
    const result = await db
      .select()
      .from(users)
      .leftJoin(affiliateLinks, and(
        eq(users.id, affiliateLinks.userId),
        eq(affiliateLinks.houseId, houseId)
      ))
      .where(eq(users.role, 'affiliate'));

    return result.map(row => ({
      ...row.users,
      affiliateLink: row.affiliate_links || undefined
    }));
  }

  async updateUserStatus(id: number, isActive: boolean): Promise<void> {
    await db
      .update(users)
      .set({ isActive })
      .where(eq(users.id, id));
  }

  async resetUserPassword(id: number): Promise<void> {
    const newPassword = 'temp123';
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    
    await db
      .update(users)
      .set({ password: hashedPassword })
      .where(eq(users.id, id));
  }

  async deleteUser(id: number): Promise<void> {
    await db.delete(users).where(eq(users.id, id));
  }

  async validatePassword(password: string, hashedPassword: string): Promise<boolean> {
    return await bcrypt.compare(password, hashedPassword);
  }

  // Postback operations
  async getPostbackUrl(houseId: number): Promise<string> {
    const house = await this.getBettingHouseById(houseId);
    if (!house) throw new Error('Casa não encontrada');
    
    return `https://your-domain.com/api/postback/${house.identifier}?token=${house.securityToken}`;
  }

  generateSecurityToken(): string {
    return `token_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  async updateHousePostbackConfig(id: number, config: { enabledPostbacks: string[], parameterMapping: any }): Promise<BettingHouse> {
    const [house] = await db
      .update(bettingHouses)
      .set({
        enabledPostbacks: JSON.stringify(config.enabledPostbacks),
        parameterMapping: JSON.stringify(config.parameterMapping)
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
    // Extract user ID from subid
    const userId = parseInt(data.subid);
    
    // Find house by identifier
    const house = await db.select().from(bettingHouses).where(eq(bettingHouses.identifier, data.house));
    if (!house.length) {
      throw new Error('Casa não encontrada');
    }

    // Calculate commission based on house configuration
    let commission = 0;
    const houseData = house[0];
    
    if (houseData.commissionType === 'CPA' && data.event === 'registration') {
      commission = parseFloat(houseData.commissionValue || '0');
    } else if (houseData.commissionType === 'RevShare' && data.event === 'deposit') {
      commission = data.amount * (parseFloat(houseData.revshareAffiliatePercent?.toString() || '0') / 100);
    }

    // Create conversion record
    const conversion = await this.createConversion({
      userId,
      houseId: houseData.id,
      type: data.event,
      amount: data.amount.toString(),
      commission: commission.toString(),
      conversionData: data.rawData,
      status: 'pending'
    });

    return {
      success: true,
      commission,
      logId: conversion.id
    };
  }

  async getPostbackLogs(houseId?: number, limit: number = 100): Promise<any[]> {
    let query = db.select().from(conversions);
    
    if (houseId) {
      query = query.where(eq(conversions.houseId, houseId));
    }
    
    return await query.orderBy(desc(conversions.createdAt)).limit(limit);
  }

  async getEventStats(userId: number): Promise<{ [event: string]: number }> {
    const stats = await db
      .select({
        type: conversions.type,
        count: count()
      })
      .from(conversions)
      .where(eq(conversions.userId, userId))
      .groupBy(conversions.type);

    const result: { [event: string]: number } = {};
    stats.forEach(stat => {
      result[stat.type] = stat.count;
    });

    return result;
  }

  async getCommissionStats(userId: number): Promise<{ total: number; byType: { [type: string]: number } }> {
    const stats = await db
      .select({
        type: conversions.type,
        totalCommission: sql<string>`sum(CAST(${conversions.commission} AS DECIMAL))`
      })
      .from(conversions)
      .where(eq(conversions.userId, userId))
      .groupBy(conversions.type);

    const byType: { [type: string]: number } = {};
    let total = 0;

    stats.forEach(stat => {
      const commission = parseFloat(stat.totalCommission || '0');
      byType[stat.type] = commission;
      total += commission;
    });

    return { total, byType };
  }
}

export const storage = new DatabaseStorage();