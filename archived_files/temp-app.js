import express from 'express';
import session from 'express-session';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Middleware
app.use(express.json());
app.use(express.static('dist/client'));

// Configurar sessões simples
app.use(session({
  secret: 'afiliadosbet-temp-secret',
  resave: false,
  saveUninitialized: false,
  cookie: { maxAge: 30 * 24 * 60 * 60 * 1000 }
}));

// Admin user mockado
const adminUser = {
  id: 1,
  email: 'admin@admin.com',
  username: 'admin',
  role: 'admin',
  fullName: 'Administrador Sistema'
};

// Rota de login - sempre retorna sucesso com admin
app.post('/api/auth/login', (req, res) => {
  console.log('Login attempt:', req.body);
  req.session.user = adminUser;
  res.json({ user: adminUser });
});

// Rota de verificação - sempre retorna admin logado
app.get('/api/auth/me', (req, res) => {
  res.json({ user: adminUser });
});

// Logout
app.post('/api/auth/logout', (req, res) => {
  req.session.destroy();
  res.json({ message: 'Logged out' });
});

// Rotas mockadas para o painel admin
app.get('/api/admin/stats', (req, res) => {
  res.json({
    totalAffiliates: 15,
    activeHouses: 8,
    totalVolume: 125000,
    paidCommissions: 25000
  });
});

app.get('/api/admin/top-affiliates', (req, res) => {
  res.json([
    { id: 1, fullName: 'João Silva', email: 'joao@test.com', totalCommission: 5000 },
    { id: 2, fullName: 'Maria Santos', email: 'maria@test.com', totalCommission: 4500 }
  ]);
});

app.get('/api/admin/top-houses', (req, res) => {
  res.json([
    { id: 1, name: 'Bet365', totalVolume: 50000, affiliateCount: 10 },
    { id: 2, name: 'Betano', totalVolume: 45000, affiliateCount: 8 }
  ]);
});

app.get('/api/betting-houses', (req, res) => {
  res.json([
    {
      id: 1,
      name: 'Bet365',
      description: 'Casa de apostas líder mundial',
      baseUrl: 'https://bet365.com',
      logoUrl: '',
      commissionRate: 25,
      isActive: true,
      createdAt: '2024-01-01T00:00:00Z'
    },
    {
      id: 2,
      name: 'Betano',
      description: 'Apostas esportivas online',
      baseUrl: 'https://betano.com',
      logoUrl: '',
      commissionRate: 30,
      isActive: true,
      createdAt: '2024-01-02T00:00:00Z'
    }
  ]);
});

app.post('/api/betting-houses', (req, res) => {
  console.log('Creating betting house:', req.body);
  const newHouse = {
    id: Date.now(),
    ...req.body,
    createdAt: new Date().toISOString()
  };
  res.status(201).json(newHouse);
});

app.put('/api/betting-houses/:id', (req, res) => {
  console.log('Updating betting house:', req.params.id, req.body);
  res.json({ id: req.params.id, ...req.body });
});

app.delete('/api/betting-houses/:id', (req, res) => {
  console.log('Deleting betting house:', req.params.id);
  res.json({ message: 'Betting house deleted' });
});

// Servir arquivos estáticos para todas as outras rotas
app.get('*', (req, res) => {
  res.sendFile(path.join(process.cwd(), 'dist/client/index.html'));
});

const PORT = 3000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`✅ Servidor temporário rodando na porta ${PORT}`);
  console.log(`🔑 Login automático como admin habilitado`);
});