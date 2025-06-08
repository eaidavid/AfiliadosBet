import { pgTable, text, serial, integer, boolean, timestamp, decimal, jsonb, varchar, index } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Session storage table for authentication
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
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
  additionalParams: jsonb("additional_params"), // Optional additional parameters
  commissionType: text("commission_type").notNull(), // 'CPA', 'RevShare', or 'Hybrid'
  commissionValue: text("commission_value"), // Valor principal
  cpaValue: text("cpa_value"), // Valor específico para CPA em modelo Hybrid
  revshareValue: text("revshare_value"), // Valor específico para RevShare em modelo Hybrid
  minDeposit: text("min_deposit"),
  paymentMethods: text("payment_methods"),
  isActive: boolean("is_active").default(true),
  identifier: text("identifier").notNull().unique(), // identificador único para postbacks
  enabledPostbacks: jsonb("enabled_postbacks").default([]), // eventos habilitados: ['registration', 'deposit', etc.]
  securityToken: text("security_token").notNull(), // token de segurança para validação
  parameterMapping: jsonb("parameter_mapping").default({}), // mapeamento de parâmetros: { "subid": "subid", "valor": "amount" }
  
  // Configurações para integração por API
  integrationType: text("integration_type").notNull().default("postback"), // 'postback', 'api', ou 'hybrid'
  apiConfig: jsonb("api_config").default({}), // Configurações específicas da API
  
  // Configurações da API Smartico/Externa
  apiBaseUrl: text("api_base_url"), // URL base da API (ex: https://api.smartico.ai)
  apiKey: text("api_key"), // Chave de autenticação da API
  apiSecret: text("api_secret"), // Secret adicional se necessário
  apiVersion: text("api_version").default("v1"), // Versão da API
  
  // Configurações de sincronização
  syncInterval: integer("sync_interval").default(30), // Intervalo em minutos
  lastSyncAt: timestamp("last_sync_at"), // Última sincronização
  syncStatus: text("sync_status").default("pending"), // 'pending', 'syncing', 'success', 'error'
  syncErrorMessage: text("sync_error_message"), // Última mensagem de erro
  
  // Mapeamento de endpoints específicos
  endpointMapping: jsonb("endpoint_mapping").default({}), // URLs específicas por tipo de evento
  
  // Configurações de autenticação
  authType: text("auth_type").default("bearer"), // 'bearer', 'basic', 'apikey'
  authHeaders: jsonb("auth_headers").default({}), // Headers customizados
  
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
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  clickedAt: timestamp("clicked_at").defaultNow(),
});

// Conversion tracking table (registrations, deposits, etc.)
export const conversions = pgTable("conversions", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  houseId: integer("house_id").notNull().references(() => bettingHouses.id),
  affiliateLinkId: integer("affiliate_link_id").references(() => affiliateLinks.id),
  type: text("type").notNull(), // 'click', 'registration', 'first_deposit', 'deposit', 'profit'
  amount: decimal("amount", { precision: 10, scale: 2 }).default("0"),
  commission: decimal("commission", { precision: 10, scale: 2 }).default("0"),
  customerId: text("customer_id"), // ID do cliente na casa de apostas
  conversionData: jsonb("conversion_data"), // Additional data from postback
  convertedAt: timestamp("converted_at").defaultNow(),
}, (table) => [
  // Índice composto para evitar duplicações por customer_id + house_id + type
  index("idx_customer_house_type").on(table.customerId, table.houseId, table.type),
  // Índice para consultas por customer_id
  index("idx_customer_id").on(table.customerId),
  // Índice para consultas por afiliado
  index("idx_user_conversions").on(table.userId, table.convertedAt),
]);

// Payment records table
export const payments = pgTable("payments", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  method: text("method").notNull(), // 'pix', 'bank_transfer'
  pixKey: text("pix_key"),
  status: text("status").default("pending"), // 'pending', 'completed', 'failed'
  transactionId: text("transaction_id"),
  paidAt: timestamp("paid_at"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Postback logs table for tracking all postback executions
export const postbackLogs = pgTable("postback_logs", {
  id: serial("id").primaryKey(),
  bettingHouseId: integer("betting_house_id").references(() => bettingHouses.id),
  eventType: text("event_type").notNull(),
  urlDisparada: text("url_disparada").notNull(),
  resposta: text("resposta"),
  statusCode: integer("status_code").notNull(),
  executadoEm: timestamp("executado_em").defaultNow(),
  parametrosUtilizados: text("parametros_utilizados"),
  subid: text("subid"),
  valor: decimal("valor", { precision: 10, scale: 2 }),
  tipoComissao: text("tipo_comissao"),
  isTest: boolean("is_test").default(false),
});

// Registered postbacks table for postback configuration
export const registeredPostbacks = pgTable("registered_postbacks", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  url: text("url").notNull(),
  houseId: integer("house_id").references(() => bettingHouses.id),
  houseName: text("house_name"),
  eventType: text("event_type").notNull(),
  description: text("description"),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// API Keys table for external integrations
export const apiKeys = pgTable("api_keys", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  keyValue: text("key_value").notNull().unique(),
  houseId: integer("house_id").references(() => bettingHouses.id),
  permissions: jsonb("permissions").default(['read', 'write']),
  isActive: boolean("is_active").default(true),
  lastUsed: timestamp("last_used"),
  createdAt: timestamp("created_at").defaultNow(),
  expiresAt: timestamp("expires_at"),
});

// API Request logs for monitoring
export const apiRequestLogs = pgTable("api_request_logs", {
  id: serial("id").primaryKey(),
  apiKeyId: integer("api_key_id").references(() => apiKeys.id),
  endpoint: text("endpoint").notNull(),
  method: text("method").notNull(),
  statusCode: integer("status_code").notNull(),
  responseTime: integer("response_time"), // in milliseconds
  userAgent: text("user_agent"),
  ipAddress: text("ip_address"),
  requestData: jsonb("request_data"),
  responseData: jsonb("response_data"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Webhook configurations
export const webhookConfigs = pgTable("webhook_configs", {
  id: serial("id").primaryKey(),
  houseId: integer("house_id").references(() => bettingHouses.id),
  name: text("name").notNull(),
  url: text("url").notNull(),
  events: jsonb("events").default(['conversion', 'click', 'registration']),
  secret: text("secret").notNull(),
  isActive: boolean("is_active").default(true),
  maxRetries: integer("max_retries").default(3),
  timeoutSeconds: integer("timeout_seconds").default(30),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Webhook delivery logs
export const webhookDeliveryLogs = pgTable("webhook_delivery_logs", {
  id: serial("id").primaryKey(),
  webhookConfigId: integer("webhook_config_id").references(() => webhookConfigs.id),
  eventType: text("event_type").notNull(),
  payload: jsonb("payload").notNull(),
  httpStatus: integer("http_status"),
  responseBody: text("response_body"),
  responseTime: integer("response_time"),
  attempt: integer("attempt").default(1),
  success: boolean("success").default(false),
  errorMessage: text("error_message"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  affiliateLinks: many(affiliateLinks),
  conversions: many(conversions),
  payments: many(payments),
  clicks: many(clickTracking),
}));

export const bettingHousesRelations = relations(bettingHouses, ({ many }) => ({
  affiliateLinks: many(affiliateLinks),
  conversions: many(conversions),
  clicks: many(clickTracking),
  postbackLogs: many(postbackLogs),
  registeredPostbacks: many(registeredPostbacks),
  apiKeys: many(apiKeys),
  webhookConfigs: many(webhookConfigs),
}));

export const apiKeysRelations = relations(apiKeys, ({ one, many }) => ({
  house: one(bettingHouses, {
    fields: [apiKeys.houseId],
    references: [bettingHouses.id],
  }),
  requestLogs: many(apiRequestLogs),
}));

export const webhookConfigsRelations = relations(webhookConfigs, ({ one, many }) => ({
  house: one(bettingHouses, {
    fields: [webhookConfigs.houseId],
    references: [bettingHouses.id],
  }),
  deliveryLogs: many(webhookDeliveryLogs),
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
  clicks: many(clickTracking),
  conversions: many(conversions),
}));

export const clickTrackingRelations = relations(clickTracking, ({ one }) => ({
  link: one(affiliateLinks, {
    fields: [clickTracking.linkId],
    references: [affiliateLinks.id],
  }),
  user: one(users, {
    fields: [clickTracking.userId],
    references: [users.id],
  }),
  house: one(bettingHouses, {
    fields: [clickTracking.houseId],
    references: [bettingHouses.id],
  }),
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
  link: one(affiliateLinks, {
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

export const postbackLogsRelations = relations(postbackLogs, ({ one }) => ({
  house: one(bettingHouses, {
    fields: [postbackLogs.bettingHouseId],
    references: [bettingHouses.id],
  }),
}));

// System configuration table
export const systemConfig = pgTable("system_config", {
  id: serial("id").primaryKey(),
  key: text("key").notNull().unique(),
  value: text("value").notNull(),
  description: text("description"),
  updated_at: timestamp("updated_at").defaultNow(),
  updated_by: integer("updated_by").references(() => users.id),
});

// System settings table for advanced configurations
export const systemSettings = pgTable("system_settings", {
  id: serial("id").primaryKey(),
  setting_key: varchar("setting_key", { length: 255 }).notNull().unique(),
  setting_value: text("setting_value"),
  type: varchar("type", { length: 50 }).notNull(), // text, secret, url, boolean, number
  description: text("description"),
  created_at: timestamp("created_at").defaultNow(),
  updated_at: timestamp("updated_at").defaultNow(),
  updated_by: integer("updated_by").references(() => users.id),
});

// Audit logs table for tracking administrative actions
export const auditLogs = pgTable("audit_logs", {
  id: serial("id").primaryKey(),
  user_id: integer("user_id").references(() => users.id).notNull(),
  action: text("action").notNull(), // CREATE, UPDATE, DELETE
  table_name: text("table_name").notNull(),
  record_id: text("record_id").notNull(),
  old_values: text("old_values"), // JSON string
  new_values: text("new_values"), // JSON string
  ip_address: text("ip_address"),
  user_agent: text("user_agent"),
  created_at: timestamp("created_at").defaultNow(),
});

// Relations
export const systemConfigRelations = relations(systemConfig, ({ one }) => ({
  updatedBy: one(users, {
    fields: [systemConfig.updated_by],
    references: [users.id],
  }),
}));

export const systemSettingsRelations = relations(systemSettings, ({ one }) => ({
  updatedBy: one(users, {
    fields: [systemSettings.updated_by],
    references: [users.id],
  }),
}));

export const auditLogsRelations = relations(auditLogs, ({ one }) => ({
  user: one(users, {
    fields: [auditLogs.user_id],
    references: [users.id],
  }),
}));

// Type exports
export type SystemConfig = typeof systemConfig.$inferSelect;
export type InsertSystemConfig = typeof systemConfig.$inferInsert;
export type SystemSettings = typeof systemSettings.$inferSelect;
export type InsertSystemSettings = typeof systemSettings.$inferInsert;
export type AuditLog = typeof auditLogs.$inferSelect;
export type InsertAuditLog = typeof auditLogs.$inferInsert;
export type ApiKey = typeof apiKeys.$inferSelect;
export type InsertApiKey = typeof apiKeys.$inferInsert;
export type ApiRequestLog = typeof apiRequestLogs.$inferSelect;
export type InsertApiRequestLog = typeof apiRequestLogs.$inferInsert;
export type WebhookConfig = typeof webhookConfigs.$inferSelect;
export type InsertWebhookConfig = typeof webhookConfigs.$inferInsert;
export type WebhookDeliveryLog = typeof webhookDeliveryLogs.$inferSelect;
export type InsertWebhookDeliveryLog = typeof webhookDeliveryLogs.$inferInsert;

// Zod schemas for validation
export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
}).extend({
  confirmPassword: z.string().min(8, "A confirmação deve ter pelo menos 8 caracteres"),
  username: z.string()
    .min(7, "O usuário deve ter pelo menos 7 caracteres")
    .regex(/^[a-zA-Z0-9]+$/, "O usuário deve conter apenas letras e números, sem espaços ou caracteres especiais"),
  password: z.string().min(8, "A senha deve ter pelo menos 8 caracteres"),
  email: z.string().email("Digite um email válido"),
  fullName: z.string().min(2, "Nome completo é obrigatório"),
  cpf: z.string().min(11, "CPF deve ter 11 dígitos").max(14, "CPF inválido"),
}).refine((data) => data.password === data.confirmPassword, {
  message: "As senhas não coincidem",
  path: ["confirmPassword"],
});

export const loginSchema = z.object({
  usernameOrEmail: z.string().min(1, "Username or email is required"),
  password: z.string().min(1, "Password is required"),
});

export const insertBettingHouseSchema = createInsertSchema(bettingHouses).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  securityToken: true, // será gerado automaticamente
}).extend({
  identifier: z.string().optional(),
  enabledPostbacks: z.array(z.string()).optional(),
  parameterMapping: z.record(z.string()).optional(),
  commissionValue: z.string().optional(),
  minDeposit: z.string().optional(),
  logoUrl: z.string().optional(),
  baseUrl: z.string().optional(),
  primaryParam: z.string().optional(),
  additionalParams: z.string().optional().nullable(),
});

export const insertAffiliateLinkSchema = createInsertSchema(affiliateLinks).omit({
  id: true,
  createdAt: true,
});

export const insertConversionSchema = createInsertSchema(conversions).omit({
  id: true,
  convertedAt: true,
});

export const insertPaymentSchema = createInsertSchema(payments).omit({
  id: true,
  createdAt: true,
  paidAt: true,
});

// API Integration schemas
export const insertApiKeySchema = createInsertSchema(apiKeys).omit({
  id: true,
  createdAt: true,
  lastUsed: true,
});

export const insertWebhookConfigSchema = createInsertSchema(webhookConfigs).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertApiRequestLogSchema = createInsertSchema(apiRequestLogs).omit({
  id: true,
  createdAt: true,
});

export const insertWebhookDeliveryLogSchema = createInsertSchema(webhookDeliveryLogs).omit({
  id: true,
  createdAt: true,
});

// Types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type LoginData = z.infer<typeof loginSchema>;
export type BettingHouse = typeof bettingHouses.$inferSelect;
export type InsertBettingHouse = z.infer<typeof insertBettingHouseSchema>;
export type AffiliateLink = typeof affiliateLinks.$inferSelect;
export type InsertAffiliateLink = z.infer<typeof insertAffiliateLinkSchema>;
export type Conversion = typeof conversions.$inferSelect;
export type InsertConversion = z.infer<typeof insertConversionSchema>;
export type Payment = typeof payments.$inferSelect;
export type InsertPayment = z.infer<typeof insertPaymentSchema>;
export type ClickTracking = typeof clickTracking.$inferSelect;

// === NOVAS TABELAS PARA SISTEMA COMPLETO DE POSTBACK ===

// Tabela de eventos
export const eventos = pgTable("eventos", {
  id: serial("id").primaryKey(),
  afiliadoId: integer("afiliado_id").notNull().references(() => users.id),
  casa: varchar("casa").notNull(),
  evento: varchar("evento").notNull(), // click, registration, deposit, revenue, profit
  valor: decimal("valor", { precision: 10, scale: 2 }).default("0"),
  criadoEm: timestamp("criado_em").defaultNow().notNull(),
});

// Tabela de comissões
export const comissoes = pgTable("comissoes", {
  id: serial("id").primaryKey(),
  afiliadoId: integer("afiliado_id").notNull().references(() => users.id),
  eventoId: integer("evento_id").notNull().references(() => eventos.id),
  tipo: varchar("tipo").notNull(), // CPA, RevShare
  valor: decimal("valor", { precision: 10, scale: 2 }).notNull(),
  affiliate: varchar("affiliate").notNull(), // username do afiliado
  criadoEm: timestamp("criado_em").defaultNow().notNull(),
});

// Legacy postback logs table (keeping for compatibility)
export const legacyPostbackLogs = pgTable("legacy_postback_logs", {
  id: serial("id").primaryKey(),
  casa: varchar("casa").notNull(),
  subid: varchar("subid").notNull(),
  evento: varchar("evento").notNull(),
  valor: decimal("valor", { precision: 10, scale: 2 }).default("0"),
  ip: varchar("ip"),
  raw: text("raw"), // query string completa recebida
  status: varchar("status").notNull(), // processando, registrado, erro_subid, erro_casa
  criadoEm: timestamp("criado_em").defaultNow().notNull(),
});

// Relações das novas tabelas
export const eventosRelations = relations(eventos, ({ one }) => ({
  afiliado: one(users, {
    fields: [eventos.afiliadoId],
    references: [users.id],
  }),
}));

export const comissoesRelations = relations(comissoes, ({ one }) => ({
  afiliado: one(users, {
    fields: [comissoes.afiliadoId],
    references: [users.id],
  }),
  evento: one(eventos, {
    fields: [comissoes.eventoId],
    references: [eventos.id],
  }),
}));

export const legacyPostbackLogsRelations = relations(legacyPostbackLogs, ({ one }) => ({
  // Não precisa de relação direta pois subid pode não existir
}));

// Tabela de configurações de postbacks por casa
export const postbacks = pgTable("postbacks", {
  id: serial("id").primaryKey(),
  houseId: integer("house_id").notNull().references(() => bettingHouses.id),
  eventType: text("event_type").notNull(), // "click", "register", "deposit", "revenue"
  url: text("url").notNull(),
  token: text("token").notNull(), // Token único para esta casa e evento
  active: boolean("active").default(true),
  isAutomatic: boolean("is_automatic").default(false), // Se foi gerado automaticamente
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => [
  // Índice único para garantir apenas um postback por casa e tipo de evento
  index("idx_house_event_unique").on(table.houseId, table.eventType),
]);

export const postbacksRelations = relations(postbacks, ({ one }) => ({
  house: one(bettingHouses, {
    fields: [postbacks.houseId],
    references: [bettingHouses.id],
  }),
}));

// Tipos das novas tabelas
export type Evento = typeof eventos.$inferSelect;
export type InsertEvento = typeof eventos.$inferInsert;
export type Comissao = typeof comissoes.$inferSelect;
export type InsertComissao = typeof comissoes.$inferInsert;
export type PostbackLog = typeof postbackLogs.$inferSelect;
export type InsertPostbackLog = typeof postbackLogs.$inferInsert;
export type Postback = typeof postbacks.$inferSelect;
export type InsertPostback = typeof postbacks.$inferInsert;

// Schema para validação de postbacks
export const insertPostbackSchema = createInsertSchema(postbacks).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
}).extend({
  eventType: z.enum(["click", "register", "deposit", "revenue"]),
  url: z.string().url("URL inválida"),
  token: z.string().min(1, "Token é obrigatório"),
  active: z.boolean().default(true),
});
