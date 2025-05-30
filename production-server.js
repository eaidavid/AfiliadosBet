import express from 'express';
import session from 'express-session';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

app.use(express.json());
app.use(express.static('dist'));

app.use(session({
  secret: 'afiliadosbet-secret-2024',
  resave: false,
  saveUninitialized: false,
  cookie: { maxAge: 30 * 24 * 60 * 60 * 1000 }
}));

const adminUser = {
  id: 1,
  email: 'admin@admin.com',
  username: 'admin',
  role: 'admin',
  fullName: 'Administrador Sistema'
};

// APIs
app.post('/api/auth/login', (req, res) => {
  req.session.user = adminUser;
  res.json({ user: adminUser });
});

app.get('/api/auth/me', (req, res) => {
  res.json({ user: adminUser });
});

app.get('/api/admin/stats', (req, res) => {
  res.json({
    totalAffiliates: 45,
    activeHouses: 18,
    totalVolume: 320000,
    paidCommissions: 78000
  });
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
      createdAt: '2024-01-15T10:30:00Z'
    },
    {
      id: 2,
      name: 'Betano', 
      description: 'Apostas esportivas e casino',
      baseUrl: 'https://betano.com',
      logoUrl: '',
      commissionRate: 30,
      isActive: true,
      createdAt: '2024-01-20T14:45:00Z'
    },
    {
      id: 3,
      name: 'Sportingbet',
      description: 'Tradição em apostas',
      baseUrl: 'https://sportingbet.com', 
      logoUrl: '',
      commissionRate: 28,
      isActive: true,
      createdAt: '2024-02-01T09:15:00Z'
    }
  ]);
});

app.get('/api/affiliates', (req, res) => {
  res.json([
    {
      id: 1,
      fullName: 'João Silva',
      email: 'joao@example.com',
      username: 'joaosilva',
      phone: '11999999999',
      city: 'São Paulo',
      state: 'SP',
      isActive: true,
      createdAt: '2024-01-10T08:00:00Z'
    },
    {
      id: 2,
      fullName: 'Maria Santos',
      email: 'maria@example.com', 
      username: 'mariasantos',
      phone: '21888888888',
      city: 'Rio de Janeiro',
      state: 'RJ',
      isActive: true,
      createdAt: '2024-01-12T10:30:00Z'
    }
  ]);
});

app.post('/api/betting-houses', (req, res) => {
  const newHouse = {
    id: Date.now(),
    ...req.body,
    createdAt: new Date().toISOString()
  };
  res.status(201).json(newHouse);
});

app.get('*', (req, res) => {
  res.sendFile(path.join(process.cwd(), 'dist/index.html'));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`✅ AfiliadosBet rodando na porta ${PORT}`);
  console.log(`🌐 Acesse: http://afiliadosbet.com.br`);
});