import express from 'express';
import session from 'express-session';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Middleware
app.use(express.json());
app.use(express.static('client/dist'));

// Configurar sessões
app.use(session({
  secret: 'afiliadosbet-temp-secret',
  resave: false,
  saveUninitialized: false,
  cookie: { maxAge: 30 * 24 * 60 * 60 * 1000 }
}));

// Admin user sempre logado
const adminUser = {
  id: 1,
  email: 'admin@admin.com',
  username: 'admin',
  role: 'admin',
  fullName: 'Administrador Sistema'
};

// APIs necessárias para o painel
app.post('/api/auth/login', (req, res) => {
  req.session.user = adminUser;
  res.json({ user: adminUser });
});

app.get('/api/auth/me', (req, res) => {
  res.json({ user: adminUser });
});

app.post('/api/auth/logout', (req, res) => {
  req.session.destroy();
  res.json({ message: 'Logged out' });
});

app.get('/api/admin/stats', (req, res) => {
  res.json({
    totalAffiliates: 25,
    activeHouses: 12,
    totalVolume: 185000,
    paidCommissions: 37000
  });
});

app.get('/api/admin/top-affiliates', (req, res) => {
  res.json([
    { id: 1, fullName: 'João Silva', email: 'joao@test.com', totalCommission: 8500 },
    { id: 2, fullName: 'Maria Santos', email: 'maria@test.com', totalCommission: 7200 },
    { id: 3, fullName: 'Pedro Costa', email: 'pedro@test.com', totalCommission: 6800 },
  ]);
});

app.get('/api/admin/top-houses', (req, res) => {
  res.json([
    { id: 1, name: 'Bet365', totalVolume: 75000, affiliateCount: 15 },
    { id: 2, name: 'Betano', totalVolume: 62000, affiliateCount: 12 },
    { id: 3, name: 'Sportingbet', totalVolume: 48000, affiliateCount: 8 }
  ]);
});

app.get('/api/betting-houses', (req, res) => {
  res.json([
    {
      id: 1,
      name: 'Bet365',
      description: 'Casa de apostas líder mundial em esportes',
      baseUrl: 'https://bet365.com',
      logoUrl: '/images/bet365-logo.png',
      commissionRate: 25,
      isActive: true,
      createdAt: '2024-01-15T10:30:00Z'
    },
    {
      id: 2,
      name: 'Betano',
      description: 'Apostas esportivas e cassino online',
      baseUrl: 'https://betano.com',
      logoUrl: '/images/betano-logo.png',
      commissionRate: 30,
      isActive: true,
      createdAt: '2024-01-20T14:45:00Z'
    },
    {
      id: 3,
      name: 'Sportingbet',
      description: 'Tradição em apostas esportivas',
      baseUrl: 'https://sportingbet.com',
      logoUrl: '/images/sporting-logo.png',
      commissionRate: 28,
      isActive: true,
      createdAt: '2024-02-01T09:15:00Z'
    }
  ]);
});

app.post('/api/betting-houses', (req, res) => {
  const newHouse = {
    id: Date.now(),
    ...req.body,
    createdAt: new Date().toISOString()
  };
  console.log('Casa criada:', newHouse);
  res.status(201).json(newHouse);
});

app.put('/api/betting-houses/:id', (req, res) => {
  const updatedHouse = {
    id: parseInt(req.params.id),
    ...req.body,
    updatedAt: new Date().toISOString()
  };
  console.log('Casa atualizada:', updatedHouse);
  res.json(updatedHouse);
});

app.delete('/api/betting-houses/:id', (req, res) => {
  console.log('Casa removida:', req.params.id);
  res.json({ message: 'Casa removida com sucesso' });
});

app.get('/api/affiliates', (req, res) => {
  res.json([
    {
      id: 1,
      fullName: 'João Silva',
      email: 'joao@test.com',
      username: 'joaosilva',
      phone: '11999999999',
      city: 'São Paulo',
      state: 'SP',
      isActive: true,
      createdAt: '2024-01-10T08:00:00Z',
      affiliateHouses: 3
    },
    {
      id: 2,
      fullName: 'Maria Santos',
      email: 'maria@test.com',
      username: 'mariasantos',
      phone: '21888888888',
      city: 'Rio de Janeiro',
      state: 'RJ',
      isActive: true,
      createdAt: '2024-01-12T10:30:00Z',
      affiliateHouses: 2
    }
  ]);
});

// HTML da aplicação React
app.get('*', (req, res) => {
  res.send(`
<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>AfiliadosBet - Painel Administrativo</title>
    <script src="https://unpkg.com/react@18/umd/react.development.js"></script>
    <script src="https://unpkg.com/react-dom@18/umd/react-dom.development.js"></script>
    <script src="https://unpkg.com/@babel/standalone/babel.min.js"></script>
    <script src="https://cdn.tailwindcss.com"></script>
    <script>
        tailwind.config = {
            darkMode: 'class',
            theme: {
                extend: {
                    colors: {
                        slate: {
                            950: '#020617',
                            900: '#0f172a',
                            800: '#1e293b',
                            700: '#334155',
                            600: '#475569',
                            400: '#94a3b8',
                            300: '#cbd5e1'
                        }
                    }
                }
            }
        }
    </script>
    <style>
        body { margin: 0; background: #020617; color: white; font-family: system-ui, -apple-system, sans-serif; }
        .gradient-bg { background: linear-gradient(135deg, #00ff88 0%, #0066ff 100%); }
        .card-bg { background: rgba(30, 41, 59, 0.8); }
        .hover-scale { transition: transform 0.2s; }
        .hover-scale:hover { transform: scale(1.02); }
    </style>
</head>
<body class="dark">
    <div id="root"></div>
    
    <script type="text/babel">
        const { useState, useEffect } = React;
        
        // Componente principal do Dashboard
        function AdminDashboard() {
            const [currentPage, setCurrentPage] = useState('dashboard');
            const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
            const [stats, setStats] = useState({});
            const [houses, setHouses] = useState([]);
            const [affiliates, setAffiliates] = useState([]);
            
            useEffect(() => {
                // Carregar dados
                fetch('/api/admin/stats').then(r => r.json()).then(setStats);
                fetch('/api/betting-houses').then(r => r.json()).then(setHouses);
                fetch('/api/affiliates').then(r => r.json()).then(setAffiliates);
            }, []);
            
            const menuItems = [
                { id: 'dashboard', label: 'Dashboard', icon: '📊' },
                { id: 'affiliates', label: 'Afiliados', icon: '👥' },
                { id: 'houses', label: 'Casas de Apostas', icon: '🏢' },
                { id: 'links', label: 'Links', icon: '🔗' },
                { id: 'reports', label: 'Relatórios', icon: '📈' },
                { id: 'settings', label: 'Configurações', icon: '⚙️' }
            ];
            
            const DashboardStats = () => (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    <div className="card-bg p-6 rounded-lg border border-slate-700">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-slate-400 text-sm">Total Afiliados</p>
                                <p className="text-3xl font-bold text-white">{stats.totalAffiliates || 0}</p>
                            </div>
                            <div className="w-12 h-12 bg-blue-500/20 rounded-lg flex items-center justify-center">
                                <span className="text-2xl">👥</span>
                            </div>
                        </div>
                    </div>
                    
                    <div className="card-bg p-6 rounded-lg border border-slate-700">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-slate-400 text-sm">Casas Ativas</p>
                                <p className="text-3xl font-bold text-white">{stats.activeHouses || 0}</p>
                            </div>
                            <div className="w-12 h-12 bg-green-500/20 rounded-lg flex items-center justify-center">
                                <span className="text-2xl">🏢</span>
                            </div>
                        </div>
                    </div>
                    
                    <div className="card-bg p-6 rounded-lg border border-slate-700">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-slate-400 text-sm">Volume Total</p>
                                <p className="text-3xl font-bold text-white">R$ {(stats.totalVolume || 0).toLocaleString()}</p>
                            </div>
                            <div className="w-12 h-12 bg-yellow-500/20 rounded-lg flex items-center justify-center">
                                <span className="text-2xl">💰</span>
                            </div>
                        </div>
                    </div>
                    
                    <div className="card-bg p-6 rounded-lg border border-slate-700">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-slate-400 text-sm">Comissões Pagas</p>
                                <p className="text-3xl font-bold text-white">R$ {(stats.paidCommissions || 0).toLocaleString()}</p>
                            </div>
                            <div className="w-12 h-12 bg-purple-500/20 rounded-lg flex items-center justify-center">
                                <span className="text-2xl">💳</span>
                            </div>
                        </div>
                    </div>
                </div>
            );
            
            const HousesManagement = () => (
                <div className="space-y-6">
                    <div className="flex justify-between items-center">
                        <h2 className="text-2xl font-bold text-white">Casas de Apostas</h2>
                        <button className="gradient-bg px-4 py-2 rounded-lg text-white font-medium">
                            + Adicionar Casa
                        </button>
                    </div>
                    
                    <div className="card-bg rounded-lg border border-slate-700">
                        <div className="p-6">
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead>
                                        <tr className="border-b border-slate-700">
                                            <th className="text-left py-3 px-4 text-slate-300">Nome</th>
                                            <th className="text-left py-3 px-4 text-slate-300">Comissão</th>
                                            <th className="text-left py-3 px-4 text-slate-300">Status</th>
                                            <th className="text-left py-3 px-4 text-slate-300">Ações</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {houses.map(house => (
                                            <tr key={house.id} className="border-b border-slate-700/50">
                                                <td className="py-4 px-4 text-white">{house.name}</td>
                                                <td className="py-4 px-4 text-slate-300">{house.commissionRate}%</td>
                                                <td className="py-4 px-4">
                                                    <span className="px-2 py-1 bg-green-500/20 text-green-400 rounded-full text-xs">
                                                        {house.isActive ? 'Ativo' : 'Inativo'}
                                                    </span>
                                                </td>
                                                <td className="py-4 px-4">
                                                    <button className="text-blue-400 hover:text-blue-300 mr-3">Editar</button>
                                                    <button className="text-red-400 hover:text-red-300">Remover</button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>
            );
            
            const AffiliatesManagement = () => (
                <div className="space-y-6">
                    <div className="flex justify-between items-center">
                        <h2 className="text-2xl font-bold text-white">Afiliados</h2>
                        <button className="gradient-bg px-4 py-2 rounded-lg text-white font-medium">
                            + Adicionar Afiliado
                        </button>
                    </div>
                    
                    <div className="card-bg rounded-lg border border-slate-700">
                        <div className="p-6">
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead>
                                        <tr className="border-b border-slate-700">
                                            <th className="text-left py-3 px-4 text-slate-300">Nome</th>
                                            <th className="text-left py-3 px-4 text-slate-300">Email</th>
                                            <th className="text-left py-3 px-4 text-slate-300">Cidade</th>
                                            <th className="text-left py-3 px-4 text-slate-300">Status</th>
                                            <th className="text-left py-3 px-4 text-slate-300">Ações</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {affiliates.map(affiliate => (
                                            <tr key={affiliate.id} className="border-b border-slate-700/50">
                                                <td className="py-4 px-4 text-white">{affiliate.fullName}</td>
                                                <td className="py-4 px-4 text-slate-300">{affiliate.email}</td>
                                                <td className="py-4 px-4 text-slate-300">{affiliate.city}</td>
                                                <td className="py-4 px-4">
                                                    <span className="px-2 py-1 bg-green-500/20 text-green-400 rounded-full text-xs">
                                                        {affiliate.isActive ? 'Ativo' : 'Inativo'}
                                                    </span>
                                                </td>
                                                <td className="py-4 px-4">
                                                    <button className="text-blue-400 hover:text-blue-300 mr-3">Editar</button>
                                                    <button className="text-red-400 hover:text-red-300">Bloquear</button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>
            );
            
            const renderContent = () => {
                switch(currentPage) {
                    case 'houses': return <HousesManagement />;
                    case 'affiliates': return <AffiliatesManagement />;
                    case 'links': return <div className="text-white">Gerenciamento de Links em desenvolvimento</div>;
                    case 'reports': return <div className="text-white">Relatórios em desenvolvimento</div>;
                    case 'settings': return <div className="text-white">Configurações em desenvolvimento</div>;
                    default: 
                        return (
                            <div className="space-y-6">
                                <div>
                                    <h1 className="text-3xl font-bold text-white mb-2">Painel Administrativo</h1>
                                    <p className="text-slate-400">Visão geral da plataforma e estatísticas principais.</p>
                                </div>
                                <DashboardStats />
                            </div>
                        );
                }
            };
            
            return (
                <div className="min-h-screen bg-slate-950">
                    {/* Sidebar */}
                    <div className="fixed inset-y-0 left-0 w-72 bg-slate-900 border-r border-slate-700 hidden lg:block">
                        <div className="p-6">
                            <div className="text-2xl font-bold text-white mb-8">AfiliadosBet</div>
                            <nav className="space-y-2">
                                {menuItems.map(item => (
                                    <button
                                        key={item.id}
                                        onClick={() => setCurrentPage(item.id)}
                                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-colors \${
                                            currentPage === item.id 
                                                ? 'bg-blue-600 text-white' 
                                                : 'text-slate-400 hover:text-white hover:bg-slate-800'
                                        }`}
                                    >
                                        <span className="text-xl">{item.icon}</span>
                                        {item.label}
                                    </button>
                                ))}
                            </nav>
                        </div>
                    </div>
                    
                    {/* Main Content */}
                    <div className="lg:ml-72">
                        <header className="bg-slate-900 border-b border-slate-700 px-6 py-4">
                            <div className="flex items-center justify-between">
                                <h1 className="text-2xl font-bold text-white">Painel Administrativo</h1>
                                <div className="flex items-center space-x-4">
                                    <div className="w-8 h-8 bg-gradient-to-br from-red-500 to-orange-500 rounded-full flex items-center justify-center">
                                        <span className="text-white text-sm font-semibold">A</span>
                                    </div>
                                    <span className="text-white">Admin</span>
                                </div>
                            </div>
                        </header>
                        
                        <main className="p-6">
                            {renderContent()}
                        </main>
                    </div>
                </div>
            );
        }
        
        // Renderizar a aplicação
        ReactDOM.render(<AdminDashboard />, document.getElementById('root'));
    </script>
</body>
</html>
  `);
});

const PORT = 3000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`✅ Painel administrativo rodando na porta ${PORT}`);
  console.log(`🚀 Acesse: http://afiliadosbet.com.br`);
});