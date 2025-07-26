import { pgTable, text, integer, decimal, boolean, timestamp, index, serial } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Session storage table for authentication
export const sessions = pgTable(
  "sessions",
  {
    sid: text("sid").primaryKey(),
    sess: text("sess").notNull(), // JSON as text
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// Users table - both affiliates and admins
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  fullName: text("full_name").notNull(),
  cpf: text("cpf").notNull().unique(),
  birthDate: text("birth_date").notNull(),
  phone: text("phone"),
  city: text("city"),
  state: text("state"),
  country: text("country").default("BR"),
  role: text("role").default("affiliate"), // 'affiliate' or 'admin'
  isActive: boolean("is_active").default(true),
  pixKeyType: text("pix_key_type"), // Tipo da chave PIX
  pixKeyValue: text("pix_key_value"), // Valor da chave PIX
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Betting houses table
export const bettingHouses = pgTable("betting_houses", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  logoUrl: text("logo_url"),
  baseUrl: text("base_url").notNull(), // Base affiliate URL with VALUE placeholder
  primaryParam: text("primary_param").notNull(), // subid, affid, etc.
  additionalParams: text("additional_params"), // JSON as text
  commissionType: text("commission_type").notNull(), // 'CPA', 'RevShare', or 'Hybrid'
  commissionValue: text("commission_value"), // Valor principal
  cpaValue: text("cpa_value"), // Valor específico para CPA em modelo Hybrid
  revshareValue: text("revshare_value"), // Valor específico para RevShare em modelo Hybrid
  revshareAffiliatePercent: decimal("revshare_affiliate_percent"), // Porcentagem do afiliado no RevShare
  cpaAffiliatePercent: decimal("cpa_affiliate_percent"), // Porcentagem do afiliado no CPA
  minDeposit: text("min_deposit"), // Depósito mínimo
  paymentMethods: text("payment_methods"), // Métodos de pagamento aceitos
  isActive: boolean("is_active").default(true),
  identifier: text("identifier").notNull().unique(), // Identificador único da casa
  enabledPostbacks: text("enabled_postbacks"), // JSON array of enabled postback events
  securityToken: text("security_token").notNull(), // Token for postback validation
  parameterMapping: text("parameter_mapping"), // JSON mapping for custom parameters
  integrationType: text("integration_type").notNull().default("postback"), // 'postback', 'api', or 'hybrid'
  apiConfig: text("api_config"), // JSON config for API integration
  apiBaseUrl: text("api_base_url"),
  apiKey: text("api_key"),
  apiSecret: text("api_secret"),
  apiVersion: text("api_version").default("v1"),
  syncInterval: integer("sync_interval").default(30), // minutes
  lastSyncAt: timestamp("last_sync_at"),
  syncStatus: text("sync_status").default("pending"),
  syncErrorMessage: text("sync_error_message"),
  endpointMapping: text("endpoint_mapping"), // JSON mapping for API endpoints
  authType: text("auth_type").default("bearer"),
  authHeaders: text("auth_headers"), // JSON for custom auth headers
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Affiliate links table
export const affiliateLinks = pgTable("affiliate_links", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  houseId: integer("house_id").notNull().references(() => bettingHouses.id),
  generatedUrl: text("generated_url").notNull(),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

// Click tracking table
export const clickTracking = pgTable("click_tracking", {
  id: serial("id").primaryKey(),
  linkId: integer("link_id").notNull().references(() => affiliateLinks.id),
  userId: integer("user_id").notNull().references(() => users.id),
  houseId: integer("house_id").notNull().references(() => bettingHouses.id),
  ipAddress: text("ip_address").notNull(),
  userAgent: text("user_agent"),
  referrer: text("referrer"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Conversions table for tracking commissions
export const conversions = pgTable("conversions", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  houseId: integer("house_id").notNull().references(() => bettingHouses.id),
  affiliateLinkId: integer("affiliate_link_id").references(() => affiliateLinks.id),
  type: text("type").notNull(), // 'register', 'deposit', 'profit', 'chargeback'
  amount: text("amount").notNull(), // Amount as string for precision
  commission: text("commission").notNull(), // Calculated commission
  conversionData: text("conversion_data"), // JSON additional data
  status: text("status").default("pending"), // 'pending', 'approved', 'rejected'
  processedAt: timestamp("processed_at"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Payments table for affiliate payments
export const payments = pgTable("payments", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  amount: decimal("amount").notNull(),
  status: text("status").default("pending"), // 'pending', 'approved', 'rejected', 'paid'
  paymentMethod: text("payment_method"), // 'pix', 'bank_transfer'
  pixKey: text("pix_key"),
  transactionId: text("transaction_id"),
  requestedAt: timestamp("requested_at").defaultNow(),
  processedAt: timestamp("processed_at"),
  notes: text("notes"),
});

// Define relationships
export const usersRelations = relations(users, ({ many }) => ({
  affiliateLinks: many(affiliateLinks),
  conversions: many(conversions),
  payments: many(payments),
  clickTracking: many(clickTracking),
}));

export const bettingHousesRelations = relations(bettingHouses, ({ many }) => ({
  affiliateLinks: many(affiliateLinks),
  conversions: many(conversions),
  clickTracking: many(clickTracking),
}));

export const affiliateLinksRelations = relations(affiliateLinks, ({ one, many }) => ({
  user: one(users, {
    fields: [affiliateLinks.userId],
    references: [users.id],
  }),
  house: one(bettingHouses, {
    fields: [affiliateLinks.houseId],
    references: [bettingHouses.id],
  }),
  conversions: many(conversions),
  clickTracking: many(clickTracking),
}));

export const conversionsRelations = relations(conversions, ({ one }) => ({
  user: one(users, {
    fields: [conversions.userId],
    references: [users.id],
  }),
  house: one(bettingHouses, {
    fields: [conversions.houseId],
    references: [bettingHouses.id],
  }),
  affiliateLink: one(affiliateLinks, {
    fields: [conversions.affiliateLinkId],
    references: [affiliateLinks.id],
  }),
}));

export const paymentsRelations = relations(payments, ({ one }) => ({
  user: one(users, {
    fields: [payments.userId],
    references: [users.id],
  }),
}));

export const clickTrackingRelations = relations(clickTracking, ({ one }) => ({
  user: one(users, {
    fields: [clickTracking.userId],
    references: [users.id],
  }),
  house: one(bettingHouses, {
    fields: [clickTracking.houseId],
    references: [bettingHouses.id],
  }),
  affiliateLink: one(affiliateLinks, {
    fields: [clickTracking.linkId],
    references: [affiliateLinks.id],
  }),
}));

// Zod schemas for validation
export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertBettingHouseSchema = createInsertSchema(bettingHouses).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertAffiliateLinkSchema = createInsertSchema(affiliateLinks).omit({
  id: true,
  createdAt: true,
});

export const insertConversionSchema = createInsertSchema(conversions).omit({
  id: true,
  createdAt: true,
});

export const insertPaymentSchema = createInsertSchema(payments).omit({
  id: true,
  requestedAt: true,
});

export const insertClickTrackingSchema = createInsertSchema(clickTracking).omit({
  id: true,
  createdAt: true,
});

// Authentication schemas
export const loginSchema = z.object({
  usernameOrEmail: z.string().min(1, 'Email ou usuário é obrigatório'),
  password: z.string().min(1, 'Senha é obrigatória'),
});

export const registerSchema = insertUserSchema.extend({
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Senhas não coincidem",
  path: ["confirmPassword"],
});

// Type exports
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type LoginData = z.infer<typeof loginSchema>;
export type RegisterData = z.infer<typeof registerSchema>;

export type BettingHouse = typeof bettingHouses.$inferSelect;
export type InsertBettingHouse = z.infer<typeof insertBettingHouseSchema>;

export type AffiliateLink = typeof affiliateLinks.$inferSelect;
export type InsertAffiliateLink = z.infer<typeof insertAffiliateLinkSchema>;

export type Conversion = typeof conversions.$inferSelect;
export type InsertConversion = z.infer<typeof insertConversionSchema>;

export type Payment = typeof payments.$inferSelect;
export type InsertPayment = z.infer<typeof insertPaymentSchema>;

export type ClickTracking = typeof clickTracking.$inferSelect;
export type InsertClickTracking = z.infer<typeof insertClickTrackingSchema>;