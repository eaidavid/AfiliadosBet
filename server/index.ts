import express from "express";
import { setupVite, serveStatic } from "./vite";
import { db } from "./db";
import { eq, sql, desc } from "drizzle-orm";
import * as schema from "../shared/schema";

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Login endpoint
app.post("/api/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    
    if (email === "admin@afiliadosbet.com" && password === "123456") {
      return res.json({
        user: {
          id: 1,
          email: "admin@afiliadosbet.com",
          name: "Administrador",
          role: "admin"
        },
        token: "admin-token-123"
      });
    }
    
    if (email === "user@afiliadosbet.com" && password === "123456") {
      return res.json({
        user: {
          id: 2,
          email: "user@afiliadosbet.com", 
          name: "David Afiliado",
          role: "user"
        },
        token: "user-token-456"
      });
    }
    
    return res.status(401).json({
      error: "Credenciais inválidas"
    });
    
  } catch (error) {
    console.error("Erro no login:", error);
    res.status(500).json({ error: "Erro interno do servidor" });
  }
});

// Register endpoint
app.post("/api/register", async (req, res) => {
  try {
    const { name, email, password, cpf, phone } = req.body;
    
    const newUser = {
      id: Math.floor(Math.random() * 1000) + 100,
      name,
      email,
      cpf,
      phone,
      role: "user",
      status: "active"
    };
    
    res.json({
      user: newUser,
      token: `user-token-${newUser.id}`
    });
    
  } catch (error) {
    console.error("Erro no registro:", error);
    res.status(500).json({ error: "Erro interno do servidor" });
  }
});

// Sistema de postback com cálculo correto de comissões
app.get("/api/postback/:casa/:evento", async (req, res) => {
  try {
    const { casa, evento } = req.params;
    const { subid, amount, customer_id } = req.query;
    const ip = req.ip || 'unknown';

    console.log(`🔔 Postback recebido: casa=${casa}, evento=${evento}, subid=${subid}, amount=${amount}`);

    // Registrar log inicial
    const logEntry = await db.insert(schema.postbackLogs).values({
      status: 'PROCESSING',
      casa: casa,
      evento: evento,
      subid: subid as string || '',
      valor: parseFloat(amount as string) || 0,
      ip: ip,
      raw: req.url
    }).returning({ id: schema.postbackLogs.id });

    // Buscar casa pelo identificador
    const houses = await db.select()
      .from(schema.bettingHouses)
      .where(eq(schema.bettingHouses.identifier, casa))
      .limit(1);

    if (houses.length === 0) {
      await db.update(schema.postbackLogs)
        .set({ status: 'ERROR_HOUSE_NOT_FOUND' })
        .where(eq(schema.postbackLogs.id, logEntry[0].id));
      
      return res.status(404).json({
        status: 'error',
        message: `Casa '${casa}' não encontrada`
      });
    }

    const house = houses[0];
    
    // Calcular comissão
    let commissionAmount = 0;
    const eventAmount = parseFloat(amount as string) || 0;

    if (house.commissionType === 'RevShare') {
      const percentage = parseFloat(house.commissionValue || '30');
      
      if (['deposit', 'revenue', 'profit'].includes(evento) && eventAmount > 0) {
        commissionAmount = (eventAmount * percentage) / 100;
        console.log(`💰 RevShare: ${percentage}% de R$ ${eventAmount} = R$ ${commissionAmount}`);
      } else if (evento === 'registration') {
        commissionAmount = 50.00;
        console.log(`💰 Comissão por registro: R$ ${commissionAmount}`);
      } else if (evento === 'click') {
        commissionAmount = 5.00;
        console.log(`💰 Comissão por click: R$ ${commissionAmount}`);
      }
    } else if (house.commissionType === 'CPA') {
      if (evento === 'deposit' && eventAmount >= parseFloat(house.minDeposit || '0')) {
        commissionAmount = parseFloat(house.commissionValue || '0');
        console.log(`💰 CPA válido: R$ ${commissionAmount}`);
      }
    }

    // Registrar conversão
    await db.execute(sql`
      INSERT INTO conversions (user_id, house_id, type, amount, commission, customer_id, conversion_data)
      VALUES (2, ${house.id}, ${evento}, ${eventAmount || 0}, ${commissionAmount}, ${subid}, ${JSON.stringify({ 
        customer_id: subid, 
        event: evento, 
        house_name: house.name,
        processed_at: new Date().toISOString() 
      })})
    `);

    // Atualizar log
    await db.update(schema.postbackLogs)
      .set({ status: 'SUCCESS_CONVERSION_REGISTERED' })
      .where(eq(schema.postbackLogs.id, logEntry[0].id));

    console.log(`✅ Conversão registrada: ${house.name} - ${evento} - R$ ${commissionAmount}`);

    return res.json({
      status: 'success',
      message: `Postback processado com sucesso - ${house.name}`,
      event: evento,
      commission: commissionAmount,
      house: house.name,
      logId: logEntry[0].id
    });

  } catch (error) {
    console.error('❌ Erro no postback:', error);
    return res.status(500).json({
      status: 'error',
      message: 'Erro interno do servidor'
    });
  }
});

// Estatísticas do usuário
app.get("/api/stats/user", async (req, res) => {
  try {
    const userId = 2;
    
    const userLinks = await db.select()
      .from(schema.affiliateLinks)
      .where(eq(schema.affiliateLinks.userId, userId));

    const userConversions = await db.select()
      .from(schema.conversions)
      .where(eq(schema.conversions.userId, userId));

    const totalClicks = userLinks.length;
    const totalRegistrations = userConversions.filter(c => c.type === 'registration').length;
    const totalDeposits = userConversions.filter(c => c.type === 'deposit').length;
    
    const totalCommission = userConversions.reduce((sum, conversion) => {
      return sum + parseFloat(conversion.commission || '0');
    }, 0);

    const conversionRate = totalClicks > 0 ? (totalRegistrations / totalClicks) * 100 : 0;

    res.json({
      totalClicks,
      totalRegistrations,
      totalDeposits,
      totalCommission: totalCommission.toFixed(2),
      conversionRate: Math.round(conversionRate)
    });

  } catch (error) {
    console.error("Erro ao buscar estatísticas:", error);
    res.status(500).json({ error: "Erro interno do servidor" });
  }
});

// Casas disponíveis
app.get("/api/betting-houses", async (req, res) => {
  try {
    const userId = 2;
    
    const existingLinks = await db.select()
      .from(schema.affiliateLinks)
      .where(eq(schema.affiliateLinks.userId, userId));

    const linkedHouseIds = existingLinks.map(link => link.houseId);

    let availableHouses;
    if (linkedHouseIds.length > 0) {
      availableHouses = await db.select()
        .from(schema.bettingHouses)
        .where(sql`${schema.bettingHouses.id} NOT IN (${sql.join(linkedHouseIds, sql`,`)})`);
    } else {
      availableHouses = await db.select().from(schema.bettingHouses);
    }

    res.json(availableHouses);

  } catch (error) {
    console.error("Erro ao buscar casas:", error);
    res.status(500).json({ error: "Erro interno do servidor" });
  }
});

// Meus links
app.get("/api/my-links", async (req, res) => {
  try {
    const userId = 2;
    
    const links = await db.select()
      .from(schema.affiliateLinks)
      .where(eq(schema.affiliateLinks.userId, userId))
      .orderBy(desc(schema.affiliateLinks.createdAt));

    res.json(links);

  } catch (error) {
    console.error("Erro ao buscar links:", error);
    res.status(500).json({ error: "Erro interno do servidor" });
  }
});

// Relatórios do usuário
app.get("/api/user/reports", async (req, res) => {
  try {
    const userId = 2;
    
    const conversions = await db.select()
      .from(schema.conversions)
      .where(eq(schema.conversions.userId, userId))
      .orderBy(desc(schema.conversions.createdAt));

    res.json(conversions);

  } catch (error) {
    console.error("Erro ao buscar relatórios:", error);
    res.status(500).json({ error: "Erro interno do servidor" });
  }
});

// Estatísticas do admin
app.get("/api/stats/admin", async (req, res) => {
  try {
    const allUsers = await db.select().from(schema.users);
    const allHouses = await db.select().from(schema.bettingHouses);
    const allLinks = await db.select().from(schema.affiliateLinks);
    const allConversions = await db.select().from(schema.conversions);

    const totalUsers = allUsers.length;
    const totalHouses = allHouses.length;
    const totalLinks = allLinks.length;
    const totalConversions = allConversions.length;

    const totalVolume = allConversions.reduce((sum, conversion) => {
      return sum + parseFloat(conversion.amount || '0');
    }, 0);

    const totalCommissions = allConversions.reduce((sum, conversion) => {
      return sum + parseFloat(conversion.commission || '0');
    }, 0);

    res.json({
      totalUsers,
      totalHouses,
      totalLinks,
      totalConversions,
      totalVolume: totalVolume.toFixed(2),
      totalCommissions: totalCommissions.toFixed(2)
    });

  } catch (error) {
    console.error("Erro ao buscar estatísticas do admin:", error);
    res.status(500).json({ error: "Erro interno do servidor" });
  }
});

(async () => {
  console.log("starting up user application");

  if (process.env.NODE_ENV === "development") {
    await setupVite(app);
  } else {
    serveStatic(app);
  }

  const PORT = process.env.PORT || 5000;
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server listening on port ${PORT}`);
    console.log("Application ready to receive requests");
  });
})();