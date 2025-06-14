# Melhorias Visuais e Funcionalidades - AfiliadosBet

## 🎨 CATEGORIA 1: INTERFACE E DESIGN VISUAL

### 1.1 Dashboard Moderno com Glassmorphism
**Impacto Visual:** Interface premium e moderna

#### Implementação:
```css
/* Efeito glassmorphism para cards */
.glass-card {
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 20px;
  box-shadow: 0 8px 32px 0 rgba(31, 38, 135, 0.37);
}

.dark .glass-card {
  background: rgba(15, 23, 42, 0.8);
  border: 1px solid rgba(148, 163, 184, 0.2);
}
```

```typescript
// Componente de card moderno
export function ModernCard({ children, className = "", ...props }) {
  return (
    <div 
      className={`glass-card p-6 transition-all duration-300 hover:shadow-2xl hover:scale-105 ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}

// Dashboard com layout moderno
export function ModernDashboard() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 p-6">
        <ModernCard>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-600 dark:text-slate-400">Ganhos Hoje</p>
              <p className="text-3xl font-bold bg-gradient-to-r from-green-400 to-blue-500 bg-clip-text text-transparent">
                R$ 1.247,50
              </p>
            </div>
            <div className="p-3 bg-gradient-to-r from-green-400 to-green-600 rounded-full">
              <TrendingUp className="h-6 w-6 text-white" />
            </div>
          </div>
        </ModernCard>
      </div>
    </div>
  );
}
```

### 1.2 Animações Micro-Interações
**Impacto:** Interface mais viva e responsiva

#### Implementação:
```typescript
// Hook para animações
export function useSpring(value: number, config = { tension: 300, friction: 30 }) {
  const [display, setDisplay] = useState(value);
  
  useEffect(() => {
    let frame: number;
    let startTime: number;
    const duration = 1000;
    
    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      
      const easeOut = 1 - Math.pow(1 - progress, 3);
      setDisplay(Math.round(value * easeOut));
      
      if (progress < 1) {
        frame = requestAnimationFrame(animate);
      }
    };
    
    frame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frame);
  }, [value]);
  
  return display;
}

// Componente de estatística animada
export function AnimatedStat({ label, value, icon: Icon, color = "blue" }) {
  const animatedValue = useSpring(value);
  
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300"
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-slate-600 dark:text-slate-400 mb-1">{label}</p>
          <motion.p 
            className={`text-3xl font-bold text-${color}-600`}
            key={animatedValue}
            initial={{ scale: 1.2 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.2 }}
          >
            {animatedValue.toLocaleString()}
          </motion.p>
        </div>
        <motion.div 
          className={`p-3 bg-${color}-100 dark:bg-${color}-900/30 rounded-full`}
          whileHover={{ scale: 1.1, rotate: 5 }}
          transition={{ duration: 0.2 }}
        >
          <Icon className={`h-6 w-6 text-${color}-600`} />
        </motion.div>
      </div>
    </motion.div>
  );
}
```

### 1.3 Gráficos Interativos Avançados
**Impacto:** Visualização de dados mais rica

#### Implementação:
```typescript
// Gráfico de linha com animação
export function AnimatedLineChart({ data, height = 300 }) {
  const [hoveredPoint, setHoveredPoint] = useState(null);
  
  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-lg">
      <h3 className="text-lg font-semibold mb-4">Evolução dos Ganhos</h3>
      <ResponsiveContainer width="100%" height={height}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
          <XAxis 
            dataKey="date" 
            tick={{ fontSize: 12 }}
            tickFormatter={(date) => format(new Date(date), 'dd/MM')}
          />
          <YAxis 
            tick={{ fontSize: 12 }}
            tickFormatter={(value) => `R$ ${value}`}
          />
          <Tooltip 
            content={({ active, payload, label }) => {
              if (active && payload && payload.length) {
                return (
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="bg-white dark:bg-slate-700 p-3 border border-gray-200 dark:border-slate-600 rounded-lg shadow-lg"
                  >
                    <p className="text-sm font-medium">{format(new Date(label), 'dd/MM/yyyy')}</p>
                    <p className="text-lg font-bold text-green-600">
                      R$ {payload[0].value.toLocaleString()}
                    </p>
                  </motion.div>
                );
              }
              return null;
            }}
          />
          <Line 
            type="monotone" 
            dataKey="earnings" 
            stroke="url(#gradientLine)"
            strokeWidth={3}
            dot={{ fill: '#10b981', strokeWidth: 2, r: 4 }}
            activeDot={{ r: 6, stroke: '#10b981', strokeWidth: 2 }}
          />
          <defs>
            <linearGradient id="gradientLine" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#10b981" />
              <stop offset="100%" stopColor="#3b82f6" />
            </linearGradient>
          </defs>
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

// Gráfico de pizza 3D
export function PieChart3D({ data }) {
  const colors = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];
  
  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-lg">
      <h3 className="text-lg font-semibold mb-4">Distribuição por Casa</h3>
      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            outerRadius={80}
            fill="#8884d8"
            dataKey="value"
            animationBegin={0}
            animationDuration={1000}
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
            ))}
          </Pie>
          <Tooltip 
            formatter={(value, name) => [`R$ ${value.toLocaleString()}`, name]}
          />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
```

### 1.4 Sidebar Flutuante com Blur
**Impacto:** Navigation moderna e elegante

#### Implementação:
```typescript
export function FloatingSidebar({ isOpen, onClose }) {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50"
        >
          {/* Backdrop com blur */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/20 backdrop-blur-sm"
            onClick={onClose}
          />
          
          {/* Sidebar */}
          <motion.div
            initial={{ x: -300, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -300, opacity: 0 }}
            transition={{ type: "spring", damping: 20, stiffness: 300 }}
            className="absolute left-4 top-4 bottom-4 w-80 bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/20"
          >
            <div className="p-6 h-full flex flex-col">
              {/* Header */}
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                    <Zap className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <h2 className="font-bold text-lg">AfiliadosBet</h2>
                    <p className="text-xs text-slate-500">Dashboard Pro</p>
                  </div>
                </div>
                <Button variant="ghost" size="sm" onClick={onClose}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
              
              {/* Menu Items */}
              <nav className="flex-1 space-y-2">
                {menuItems.map((item, index) => (
                  <motion.a
                    key={item.id}
                    href={item.href}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="flex items-center gap-3 p-3 rounded-xl hover:bg-white/50 dark:hover:bg-slate-800/50 transition-all duration-200 group"
                  >
                    <item.icon className="h-5 w-5 text-slate-600 dark:text-slate-400 group-hover:text-blue-600" />
                    <span className="font-medium group-hover:text-blue-600">{item.label}</span>
                  </motion.a>
                ))}
              </nav>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
```

## 🎯 CATEGORIA 2: COMPONENTES INTERATIVOS

### 2.1 Cards de Estatísticas com Sparklines
**Impacto:** Informações mais ricas em menos espaço

#### Implementação:
```typescript
export function StatCardWithSparkline({ title, value, trend, data, color = "blue" }) {
  const isPositive = trend > 0;
  
  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300"
    >
      <div className="flex justify-between items-start mb-4">
        <div>
          <p className="text-sm text-slate-600 dark:text-slate-400">{title}</p>
          <p className="text-3xl font-bold mt-1">{value}</p>
        </div>
        <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
          isPositive 
            ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
            : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
        }`}>
          {isPositive ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
          {Math.abs(trend)}%
        </div>
      </div>
      
      {/* Sparkline */}
      <div className="h-12">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data}>
            <Area 
              type="monotone" 
              dataKey="value" 
              stroke={isPositive ? '#10b981' : '#ef4444'}
              fill={isPositive ? '#10b981' : '#ef4444'}
              fillOpacity={0.2}
              strokeWidth={2}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </motion.div>
  );
}
```

### 2.2 Tabela Avançada com Filtros e Ordenação
**Impacto:** Experiência profissional de dados

#### Implementação:
```typescript
export function AdvancedDataTable({ data, columns, onRowClick }) {
  const [sorting, setSorting] = useState([]);
  const [filtering, setFiltering] = useState('');
  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 10 });
  
  const table = useReactTable({
    data,
    columns,
    state: { sorting, globalFilter: filtering, pagination },
    onSortingChange: setSorting,
    onGlobalFilterChange: setFiltering,
    onPaginationChange: setPagination,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  });
  
  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg overflow-hidden">
      {/* Header com filtros */}
      <div className="p-6 border-b border-slate-200 dark:border-slate-700">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-semibold">Dados dos Afiliados</h3>
          <div className="flex gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                placeholder="Buscar..."
                value={filtering}
                onChange={(e) => setFiltering(e.target.value)}
                className="pl-10 w-64"
              />
            </div>
            <Button variant="outline" className="gap-2">
              <Filter className="h-4 w-4" />
              Filtros
            </Button>
          </div>
        </div>
      </div>
      
      {/* Tabela */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-slate-50 dark:bg-slate-900/50">
            {table.getHeaderGroups().map(headerGroup => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map(header => (
                  <th 
                    key={header.id}
                    className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800"
                    onClick={header.column.getToggleSortingHandler()}
                  >
                    <div className="flex items-center gap-2">
                      {flexRender(header.column.columnDef.header, header.getContext())}
                      {header.column.getIsSorted() === 'asc' && <ChevronUp className="h-4 w-4" />}
                      {header.column.getIsSorted() === 'desc' && <ChevronDown className="h-4 w-4" />}
                    </div>
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
            {table.getRowModel().rows.map(row => (
              <motion.tr 
                key={row.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                whileHover={{ backgroundColor: 'rgba(59, 130, 246, 0.05)' }}
                className="cursor-pointer"
                onClick={() => onRowClick?.(row.original)}
              >
                {row.getVisibleCells().map(cell => (
                  <td key={cell.id} className="px-6 py-4 whitespace-nowrap text-sm">
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>
      
      {/* Paginação */}
      <div className="px-6 py-3 border-t border-slate-200 dark:border-slate-700">
        <div className="flex items-center justify-between">
          <div className="text-sm text-slate-700 dark:text-slate-300">
            Mostrando {table.getState().pagination.pageIndex * table.getState().pagination.pageSize + 1} a{' '}
            {Math.min((table.getState().pagination.pageIndex + 1) * table.getState().pagination.pageSize, table.getPrePaginationRowModel().rows.length)} de{' '}
            {table.getPrePaginationRowModel().rows.length} resultados
          </div>
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
            >
              Anterior
            </Button>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
            >
              Próximo
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
```

### 2.3 Modal de Detalhes Deslizante
**Impacto:** Navegação fluida sem perder contexto

#### Implementação:
```typescript
export function SlideOverDetails({ isOpen, onClose, data }) {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50"
        >
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={onClose}
          />
          
          {/* Slide Over */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: "spring", damping: 20, stiffness: 300 }}
            className="absolute right-0 top-0 h-full w-96 bg-white dark:bg-slate-900 shadow-2xl"
          >
            <div className="h-full flex flex-col">
              {/* Header */}
              <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-700">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-semibold">Detalhes do Afiliado</h2>
                  <Button variant="ghost" size="sm" onClick={onClose}>
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              
              {/* Content */}
              <div className="flex-1 overflow-y-auto p-6">
                <div className="space-y-6">
                  {/* Avatar e Info Básica */}
                  <div className="text-center">
                    <div className="w-20 h-20 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full mx-auto mb-4 flex items-center justify-center">
                      <User className="h-8 w-8 text-white" />
                    </div>
                    <h3 className="text-xl font-semibold">{data?.name}</h3>
                    <p className="text-slate-600 dark:text-slate-400">{data?.email}</p>
                  </div>
                  
                  {/* Estatísticas */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 text-center">
                      <p className="text-2xl font-bold text-blue-600">{data?.totalClicks}</p>
                      <p className="text-sm text-slate-600 dark:text-slate-400">Total Clicks</p>
                    </div>
                    <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4 text-center">
                      <p className="text-2xl font-bold text-green-600">R$ {data?.totalEarnings}</p>
                      <p className="text-sm text-slate-600 dark:text-slate-400">Ganhos</p>
                    </div>
                  </div>
                  
                  {/* Timeline de Atividades */}
                  <div>
                    <h4 className="font-semibold mb-3">Atividades Recentes</h4>
                    <div className="space-y-3">
                      {data?.activities?.map((activity, index) => (
                        <motion.div
                          key={index}
                          initial={{ opacity: 0, x: 20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.1 }}
                          className="flex items-start gap-3 p-3 bg-slate-50 dark:bg-slate-800 rounded-lg"
                        >
                          <div className="w-2 h-2 bg-blue-500 rounded-full mt-2" />
                          <div>
                            <p className="text-sm font-medium">{activity.title}</p>
                            <p className="text-xs text-slate-600 dark:text-slate-400">{activity.time}</p>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Footer */}
              <div className="p-6 border-t border-slate-200 dark:border-slate-700">
                <Button className="w-full">
                  Enviar Mensagem
                </Button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
```

## 📱 CATEGORIA 3: MOBILE E RESPONSIVIDADE

### 3.1 Bottom Navigation Mobile
**Impacto:** Navegação nativa mobile

#### Implementação:
```typescript
export function MobileBottomNavigation({ currentPage, onPageChange }) {
  const navItems = [
    { id: 'dashboard', label: 'Início', icon: Home },
    { id: 'stats', label: 'Stats', icon: BarChart3 },
    { id: 'links', label: 'Links', icon: Link },
    { id: 'earnings', label: 'Ganhos', icon: DollarSign },
    { id: 'profile', label: 'Perfil', icon: User }
  ];
  
  return (
    <motion.div 
      initial={{ y: 100 }}
      animate={{ y: 0 }}
      className="fixed bottom-0 left-0 right-0 bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl border-t border-slate-200 dark:border-slate-700 z-50 md:hidden"
    >
      <div className="flex items-center justify-around py-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentPage === item.id;
          
          return (
            <motion.button
              key={item.id}
              whileTap={{ scale: 0.95 }}
              onClick={() => onPageChange(item.id)}
              className={`flex flex-col items-center gap-1 p-3 rounded-xl transition-all duration-200 ${
                isActive 
                  ? 'text-blue-600 bg-blue-50 dark:bg-blue-900/30' 
                  : 'text-slate-600 dark:text-slate-400'
              }`}
            >
              <Icon className="h-5 w-5" />
              <span className="text-xs font-medium">{item.label}</span>
              {isActive && (
                <motion.div
                  layoutId="activeTab"
                  className="absolute -top-0.5 left-1/2 transform -translate-x-1/2 w-8 h-1 bg-blue-600 rounded-full"
                />
              )}
            </motion.button>
          );
        })}
      </div>
    </motion.div>
  );
}
```

### 3.2 Pull-to-Refresh Nativo
**Impacto:** Experiência mobile nativa

#### Implementação:
```typescript
export function usePullToRefresh(onRefresh: () => Promise<void>) {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [pullDistance, setPullDistance] = useState(0);
  const touchStartY = useRef(0);
  const refreshThreshold = 80;
  
  const handleTouchStart = (e: TouchEvent) => {
    touchStartY.current = e.touches[0].clientY;
  };
  
  const handleTouchMove = (e: TouchEvent) => {
    const currentY = e.touches[0].clientY;
    const distance = currentY - touchStartY.current;
    
    if (distance > 0 && window.scrollY === 0) {
      setPullDistance(Math.min(distance, refreshThreshold * 1.5));
      e.preventDefault();
    }
  };
  
  const handleTouchEnd = async () => {
    if (pullDistance >= refreshThreshold) {
      setIsRefreshing(true);
      await onRefresh();
      setIsRefreshing(false);
    }
    setPullDistance(0);
  };
  
  useEffect(() => {
    document.addEventListener('touchstart', handleTouchStart);
    document.addEventListener('touchmove', handleTouchMove, { passive: false });
    document.addEventListener('touchend', handleTouchEnd);
    
    return () => {
      document.removeEventListener('touchstart', handleTouchStart);
      document.removeEventListener('touchmove', handleTouchMove);
      document.removeEventListener('touchend', handleTouchEnd);
    };
  }, [pullDistance]);
  
  return { isRefreshing, pullDistance };
}

export function PullToRefreshContainer({ onRefresh, children }) {
  const { isRefreshing, pullDistance } = usePullToRefresh(onRefresh);
  
  return (
    <div className="relative">
      {/* Pull indicator */}
      <motion.div
        animate={{ 
          y: pullDistance > 0 ? pullDistance - 40 : -40,
          opacity: pullDistance > 0 ? Math.min(pullDistance / 80, 1) : 0
        }}
        className="absolute top-0 left-1/2 transform -translate-x-1/2 z-10 bg-white dark:bg-slate-800 rounded-full p-3 shadow-lg"
      >
        <motion.div
          animate={{ rotate: isRefreshing ? 360 : pullDistance * 4 }}
          transition={{ duration: isRefreshing ? 1 : 0, repeat: isRefreshing ? Infinity : 0 }}
        >
          <RefreshCw className="h-5 w-5 text-blue-600" />
        </motion.div>
      </motion.div>
      
      {children}
    </div>
  );
}
```

## 🌟 CATEGORIA 4: FUNCIONALIDADES AVANÇADAS

### 4.1 Sistema de Conquistas e Gamificação
**Impacto:** Maior engajamento e retenção

#### Implementação:
```typescript
// Tipos para sistema de conquistas
interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  requirement: number;
  progress: number;
  unlocked: boolean;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
}

// Componente de conquista
export function AchievementCard({ achievement }: { achievement: Achievement }) {
  const progress = Math.min((achievement.progress / achievement.requirement) * 100, 100);
  const rarityColors = {
    common: 'from-gray-400 to-gray-600',
    rare: 'from-blue-400 to-blue-600',
    epic: 'from-purple-400 to-purple-600',
    legendary: 'from-yellow-400 to-orange-600'
  };
  
  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      className={`relative p-4 rounded-xl border-2 transition-all duration-300 ${
        achievement.unlocked 
          ? 'bg-gradient-to-r ' + rarityColors[achievement.rarity] + ' text-white border-transparent shadow-lg'
          : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700'
      }`}
    >
      {achievement.unlocked && (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="absolute -top-2 -right-2 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center"
        >
          <Check className="h-3 w-3 text-white" />
        </motion.div>
      )}
      
      <div className="flex items-center gap-3 mb-3">
        <div className={`text-2xl ${achievement.unlocked ? 'grayscale-0' : 'grayscale'}`}>
          {achievement.icon}
        </div>
        <div className="flex-1">
          <h4 className="font-semibold">{achievement.title}</h4>
          <p className={`text-sm ${achievement.unlocked ? 'text-white/80' : 'text-slate-600 dark:text-slate-400'}`}>
            {achievement.description}
          </p>
        </div>
      </div>
      
      {!achievement.unlocked && (
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Progresso</span>
            <span>{achievement.progress}/{achievement.requirement}</span>
          </div>
          <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 1, ease: "easeOut" }}
              className="h-2 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full"
            />
          </div>
        </div>
      )}
    </motion.div>
  );
}

// Sistema de níveis do usuário
export function UserLevelSystem({ userLevel, currentXP, nextLevelXP }) {
  const progress = (currentXP / nextLevelXP) * 100;
  
  return (
    <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-6 text-white">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-2xl font-bold">Nível {userLevel}</h3>
          <p className="text-blue-100">Afiliado Experiente</p>
        </div>
        <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center">
          <Crown className="h-8 w-8 text-yellow-300" />
        </div>
      </div>
      
      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span>XP: {currentXP}</span>
          <span>Próximo: {nextLevelXP}</span>
        </div>
        <div className="w-full bg-white/20 rounded-full h-3">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 1.5, ease: "easeOut" }}
            className="h-3 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full"
          />
        </div>
      </div>
    </div>
  );
}
```

### 4.2 Sistema de Notificações Toast Avançado
**Impacato:** Feedback visual rico e informativo

#### Implementação:
```typescript
interface ToastData {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  description?: string;
  duration?: number;
  action?: {
    label: string;
    onClick: () => void;
  };
}

export function AdvancedToast({ toast, onRemove }: { toast: ToastData; onRemove: (id: string) => void }) {
  const [progress, setProgress] = useState(100);
  const duration = toast.duration || 5000;
  
  useEffect(() => {
    const interval = setInterval(() => {
      setProgress(prev => {
        const newProgress = prev - (100 / (duration / 100));
        if (newProgress <= 0) {
          onRemove(toast.id);
          return 0;
        }
        return newProgress;
      });
    }, 100);
    
    return () => clearInterval(interval);
  }, [duration, toast.id, onRemove]);
  
  const icons = {
    success: <CheckCircle className="h-5 w-5 text-green-500" />,
    error: <AlertCircle className="h-5 w-5 text-red-500" />,
    warning: <AlertTriangle className="h-5 w-5 text-yellow-500" />,
    info: <Info className="h-5 w-5 text-blue-500" />
  };
  
  const colors = {
    success: 'border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-900/20',
    error: 'border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-900/20',
    warning: 'border-yellow-200 bg-yellow-50 dark:border-yellow-800 dark:bg-yellow-900/20',
    info: 'border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-900/20'
  };
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 50, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 20, scale: 0.9 }}
      className={`relative max-w-sm w-full rounded-xl border shadow-lg backdrop-blur-sm ${colors[toast.type]}`}
    >
      <div className="p-4">
        <div className="flex items-start gap-3">
          {icons[toast.type]}
          <div className="flex-1 min-w-0">
            <h4 className="font-semibold text-sm">{toast.title}</h4>
            {toast.description && (
              <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                {toast.description}
              </p>
            )}
          </div>
          <button
            onClick={() => onRemove(toast.id)}
            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        
        {toast.action && (
          <div className="mt-3 pt-3 border-t border-slate-200 dark:border-slate-700">
            <Button 
              size="sm" 
              variant="outline" 
              onClick={toast.action.onClick}
              className="text-xs"
            >
              {toast.action.label}
            </Button>
          </div>
        )}
      </div>
      
      {/* Progress bar */}
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-slate-200 dark:bg-slate-700 rounded-b-xl overflow-hidden">
        <motion.div
          initial={{ width: '100%' }}
          animate={{ width: `${progress}%` }}
          className={`h-full ${
            toast.type === 'success' ? 'bg-green-500' :
            toast.type === 'error' ? 'bg-red-500' :
            toast.type === 'warning' ? 'bg-yellow-500' :
            'bg-blue-500'
          }`}
        />
      </div>
    </motion.div>
  );
}

export function ToastContainer() {
  const [toasts, setToasts] = useState<ToastData[]>([]);
  
  const addToast = useCallback((toast: Omit<ToastData, 'id'>) => {
    const id = Math.random().toString(36).substr(2, 9);
    setToasts(prev => [...prev, { ...toast, id }]);
  }, []);
  
  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  }, []);
  
  return (
    <div className="fixed top-4 right-4 z-50 space-y-2">
      <AnimatePresence>
        {toasts.map(toast => (
          <AdvancedToast 
            key={toast.id} 
            toast={toast} 
            onRemove={removeToast} 
          />
        ))}
      </AnimatePresence>
    </div>
  );
}
```

### 4.3 Command Palette (Paleta de Comandos)
**Impacto:** Navegação super rápida como apps profissionais

#### Implementação:
```typescript
export function CommandPalette() {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  
  const commands = [
    { id: 'dashboard', label: 'Ir para Dashboard', icon: Home, action: () => navigate('/dashboard') },
    { id: 'new-link', label: 'Criar Novo Link', icon: Plus, action: () => navigate('/links/new') },
    { id: 'view-earnings', label: 'Ver Ganhos', icon: DollarSign, action: () => navigate('/earnings') },
    { id: 'settings', label: 'Configurações', icon: Settings, action: () => navigate('/settings') },
    { id: 'help', label: 'Ajuda e Suporte', icon: HelpCircle, action: () => openHelp() },
    { id: 'dark-mode', label: 'Alternar Tema', icon: Moon, action: () => toggleTheme() },
  ];
  
  const filteredCommands = commands.filter(command =>
    command.label.toLowerCase().includes(query.toLowerCase())
  );
  
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setIsOpen(true);
      }
      if (e.key === 'Escape') {
        setIsOpen(false);
      }
    };
    
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);
  
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-start justify-center pt-20"
        >
          <div 
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setIsOpen(false)}
          />
          
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: -20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: -20 }}
            className="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 overflow-hidden"
          >
            {/* Search Input */}
            <div className="flex items-center gap-3 p-4 border-b border-slate-200 dark:border-slate-700">
              <Search className="h-5 w-5 text-slate-400" />
              <input
                type="text"
                placeholder="Digite um comando ou pesquise..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="flex-1 bg-transparent outline-none text-lg"
                autoFocus
              />
              <kbd className="px-2 py-1 text-xs bg-slate-100 dark:bg-slate-800 rounded border">
                ESC
              </kbd>
            </div>
            
            {/* Commands List */}
            <div className="max-h-80 overflow-y-auto">
              {filteredCommands.length > 0 ? (
                filteredCommands.map((command, index) => {
                  const Icon = command.icon;
                  return (
                    <motion.button
                      key={command.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: index * 0.05 }}
                      onClick={() => {
                        command.action();
                        setIsOpen(false);
                      }}
                      className="w-full flex items-center gap-3 p-4 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors text-left"
                    >
                      <Icon className="h-5 w-5 text-slate-600 dark:text-slate-400" />
                      <span className="flex-1">{command.label}</span>
                      <kbd className="px-2 py-1 text-xs bg-slate-100 dark:bg-slate-800 rounded border">
                        ⏎
                      </kbd>
                    </motion.button>
                  );
                })
              ) : (
                <div className="p-8 text-center text-slate-500 dark:text-slate-400">
                  <Search className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p>Nenhum comando encontrado</p>
                </div>
              )}
            </div>
            
            {/* Footer */}
            <div className="p-3 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-200 dark:border-slate-700">
              <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                <span>Pressione ⏎ para executar</span>
                <span>⌘K para abrir</span>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
```

## 🎮 CATEGORIA 5: GAMIFICAÇÃO E ENGAJAMENTO

### 5.1 Sistema de Rank e Leaderboard
**Impacto:** Competição saudável entre afiliados

#### Implementação:
```typescript
interface RankData {
  rank: number;
  user: {
    id: number;
    name: string;
    avatar?: string;
  };
  earnings: number;
  change: number; // Mudança de posição
}

export function Leaderboard({ data }: { data: RankData[] }) {
  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg overflow-hidden">
      <div className="bg-gradient-to-r from-yellow-400 to-orange-500 p-6 text-white">
        <div className="flex items-center gap-3">
          <Trophy className="h-8 w-8" />
          <div>
            <h2 className="text-2xl font-bold">Top Afiliados</h2>
            <p className="text-yellow-100">Rankings desta semana</p>
          </div>
        </div>
      </div>
      
      <div className="p-6">
        <div className="space-y-4">
          {data.map((item, index) => {
            const isTop3 = index < 3;
            const medals = ['🥇', '🥈', '🥉'];
            
            return (
              <motion.div
                key={item.user.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className={`flex items-center gap-4 p-4 rounded-xl transition-all duration-200 ${
                  isTop3 
                    ? 'bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 border-2 border-yellow-200 dark:border-yellow-800'
                    : 'bg-slate-50 dark:bg-slate-700/50 hover:bg-slate-100 dark:hover:bg-slate-700'
                }`}
              >
                {/* Rank */}
                <div className="flex items-center justify-center w-12 h-12">
                  {isTop3 ? (
                    <span className="text-2xl">{medals[index]}</span>
                  ) : (
                    <span className="text-lg font-bold text-slate-600 dark:text-slate-400">
                      #{item.rank}
                    </span>
                  )}
                </div>
                
                {/* Avatar */}
                <div className="relative">
                  <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                    {item.user.avatar ? (
                      <img src={item.user.avatar} alt={item.user.name} className="w-full h-full rounded-full" />
                    ) : (
                      <User className="h-6 w-6 text-white" />
                    )}
                  </div>
                  {isTop3 && (
                    <div className="absolute -top-1 -right-1 w-6 h-6 bg-yellow-500 rounded-full flex items-center justify-center">
                      <Crown className="h-3 w-3 text-white" />
                    </div>
                  )}
                </div>
                
                {/* Info */}
                <div className="flex-1">
                  <h4 className="font-semibold">{item.user.name}</h4>
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    R$ {item.earnings.toLocaleString()}
                  </p>
                </div>
                
                {/* Change */}
                <div className="flex items-center gap-1 text-sm">
                  {item.change > 0 ? (
                    <>
                      <TrendingUp className="h-4 w-4 text-green-500" />
                      <span className="text-green-600 font-medium">+{item.change}</span>
                    </>
                  ) : item.change < 0 ? (
                    <>
                      <TrendingDown className="h-4 w-4 text-red-500" />
                      <span className="text-red-600 font-medium">{item.change}</span>
                    </>
                  ) : (
                    <span className="text-slate-500">-</span>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
```

### 5.2 Missões Diárias e Desafios
**Impacto:** Engajamento diário aumentado

#### Implementação:
```typescript
interface Mission {
  id: string;
  title: string;
  description: string;
  type: 'daily' | 'weekly' | 'monthly';
  progress: number;
  target: number;
  reward: {
    type: 'xp' | 'bonus' | 'badge';
    value: number | string;
  };
  completed: boolean;
  expiresAt: Date;
}

export function MissionsPanel({ missions }: { missions: Mission[] }) {
  const dailyMissions = missions.filter(m => m.type === 'daily');
  const weeklyMissions = missions.filter(m => m.type === 'weekly');
  
  return (
    <div className="space-y-6">
      {/* Daily Missions */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
            <Calendar className="h-5 w-5 text-blue-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold">Missões Diárias</h3>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Renovam a cada 24 horas
            </p>
          </div>
        </div>
        
        <div className="space-y-4">
          {dailyMissions.map((mission) => (
            <MissionCard key={mission.id} mission={mission} />
          ))}
        </div>
      </div>
      
      {/* Weekly Challenges */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
            <Target className="h-5 w-5 text-purple-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold">Desafios Semanais</h3>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Maiores recompensas
            </p>
          </div>
        </div>
        
        <div className="space-y-4">
          {weeklyMissions.map((mission) => (
            <MissionCard key={mission.id} mission={mission} />
          ))}
        </div>
      </div>
    </div>
  );
}

function MissionCard({ mission }: { mission: Mission }) {
  const progress = Math.min((mission.progress / mission.target) * 100, 100);
  const timeLeft = formatDistanceToNow(mission.expiresAt, { addSuffix: true, locale: ptBR });
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`p-4 rounded-xl border-2 transition-all duration-300 ${
        mission.completed
          ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800'
          : 'bg-slate-50 dark:bg-slate-700/50 border-slate-200 dark:border-slate-600 hover:border-blue-300 dark:hover:border-blue-600'
      }`}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <h4 className="font-semibold flex items-center gap-2">
            {mission.title}
            {mission.completed && <CheckCircle className="h-4 w-4 text-green-500" />}
          </h4>
          <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
            {mission.description}
          </p>
        </div>
        
        <div className="text-right">
          <div className="flex items-center gap-1 text-sm font-medium">
            {mission.reward.type === 'xp' && <Zap className="h-3 w-3 text-yellow-500" />}
            {mission.reward.type === 'bonus' && <DollarSign className="h-3 w-3 text-green-500" />}
            {mission.reward.type === 'badge' && <Award className="h-3 w-3 text-purple-500" />}
            <span>{mission.reward.value}</span>
          </div>
          <p className="text-xs text-slate-500 mt-1">{timeLeft}</p>
        </div>
      </div>
      
      {!mission.completed && (
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Progresso</span>
            <span>{mission.progress}/{mission.target}</span>
          </div>
          <div className="w-full bg-slate-200 dark:bg-slate-600 rounded-full h-2">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 1, ease: "easeOut" }}
              className="h-2 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full"
            />
          </div>
        </div>
      )}
    </motion.div>
  );
}
```

## 📊 CATEGORIA 6: ANALYTICS VISUAIS AVANÇADOS

### 6.1 Heatmap de Performance
**Impacto:** Insights visuais sobre padrões de performance

#### Implementação:
```typescript
export function PerformanceHeatmap({ data }: { data: any[] }) {
  const days = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
  const hours = Array.from({ length: 24 }, (_, i) => i);
  
  const getIntensity = (day: number, hour: number) => {
    const point = data.find(d => d.day === day && d.hour === hour);
    return point ? point.value / Math.max(...data.map(d => d.value)) : 0;
  };
  
  const getColor = (intensity: number) => {
    if (intensity === 0) return 'bg-slate-100 dark:bg-slate-800';
    if (intensity < 0.25) return 'bg-blue-200 dark:bg-blue-900/40';
    if (intensity < 0.5) return 'bg-blue-400 dark:bg-blue-700/60';
    if (intensity < 0.75) return 'bg-blue-600 dark:bg-blue-600/80';
    return 'bg-blue-800 dark:bg-blue-500';
  };
  
  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg p-6">
      <h3 className="text-lg font-semibold mb-6">Mapa de Calor - Atividade por Horário</h3>
      
      <div className="overflow-x-auto">
        <div className="min-w-max">
          {/* Hours header */}
          <div className="flex mb-2">
            <div className="w-12"></div>
            {hours.map(hour => (
              <div key={hour} className="w-8 text-center text-xs text-slate-600 dark:text-slate-400">
                {hour}h
              </div>
            ))}
          </div>
          
          {/* Heatmap grid */}
          {days.map((day, dayIndex) => (
            <div key={day} className="flex items-center mb-1">
              <div className="w-12 text-sm font-medium text-slate-600 dark:text-slate-400">
                {day}
              </div>
              {hours.map(hour => {
                const intensity = getIntensity(dayIndex, hour);
                const value = data.find(d => d.day === dayIndex && d.hour === hour)?.value || 0;
                
                return (
                  <motion.div
                    key={`${dayIndex}-${hour}`}
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: (dayIndex * 24 + hour) * 0.01 }}
                    className={`w-8 h-8 mx-0.5 rounded cursor-pointer transition-all duration-200 hover:scale-110 ${getColor(intensity)}`}
                    title={`${day} ${hour}:00 - ${value} conversões`}
                  />
                );
              })}
            </div>
          ))}
        </div>
      </div>
      
      {/* Legend */}
      <div className="mt-6 flex items-center justify-between">
        <span className="text-sm text-slate-600 dark:text-slate-400">Menos ativo</span>
        <div className="flex gap-1">
          {[0, 0.25, 0.5, 0.75, 1].map(intensity => (
            <div key={intensity} className={`w-3 h-3 rounded ${getColor(intensity)}`} />
          ))}
        </div>
        <span className="text-sm text-slate-600 dark:text-slate-400">Mais ativo</span>
      </div>
    </div>
  );
}
```

### 6.2 Radar Chart de Performance
**Impacto:** Visão holística das métricas do afiliado

#### Implementação:
```typescript
export function PerformanceRadarChart({ data }) {
  const metrics = [
    { key: 'clicks', label: 'Clicks', max: 1000 },
    { key: 'conversions', label: 'Conversões', max: 100 },
    { key: 'revenue', label: 'Receita', max: 5000 },
    { key: 'retention', label: 'Retenção', max: 100 },
    { key: 'engagement', label: 'Engajamento', max: 100 },
    { key: 'quality', label: 'Qualidade', max: 100 }
  ];
  
  const radarData = metrics.map(metric => ({
    metric: metric.label,
    value: (data[metric.key] / metric.max) * 100,
    fullMark: 100
  }));
  
  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg p-6">
      <h3 className="text-lg font-semibold mb-6">Radar de Performance</h3>
      
      <ResponsiveContainer width="100%" height={300}>
        <RadarChart data={radarData}>
          <PolarGrid gridType="polygon" />
          <PolarAngleAxis 
            dataKey="metric" 
            tick={{ fontSize: 12, fill: '#64748b' }}
          />
          <PolarRadiusAxis
            angle={90}
            domain={[0, 100]}
            tick={{ fontSize: 10, fill: '#64748b' }}
          />
          <Radar
            name="Performance"
            dataKey="value"
            stroke="#3b82f6"
            fill="#3b82f6"
            fillOpacity={0.3}
            strokeWidth={2}
            dot={{ fill: '#3b82f6', strokeWidth: 2, r: 4 }}
          />
        </RadarChart>
      </ResponsiveContainer>
      
      {/* Metrics Summary */}
      <div className="grid grid-cols-2 gap-4 mt-6">
        {metrics.map(metric => (
          <div key={metric.key} className="text-center">
            <p className="text-sm text-slate-600 dark:text-slate-400">{metric.label}</p>
            <p className="text-lg font-bold">{data[metric.key]?.toLocaleString()}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
```

## 🔧 IMPLEMENTAÇÃO PRIORITÁRIA

### Semana 1-2: Interface Moderna
- [ ] Implementar glassmorphism nos cards principais
- [ ] Adicionar animações micro-interações
- [ ] Criar gráficos interativos avançados
- [ ] Desenvolver sidebar flutuante

### Semana 3-4: Mobile e Responsividade
- [ ] Bottom navigation mobile
- [ ] Pull-to-refresh nativo
- [ ] Gestos touch avançados
- [ ] Otimização para tablets

### Semana 5-6: Funcionalidades Avançadas
- [ ] Sistema de conquistas
- [ ] Command palette
- [ ] Notificações toast avançadas
- [ ] Modal deslizante de detalhes

### Semana 7-8: Gamificação
- [ ] Leaderboard interativo
- [ ] Sistema de missões
- [ ] Níveis de usuário
- [ ] Recompensas visuais

### Semana 9-10: Analytics Visuais
- [ ] Heatmap de performance
- [ ] Radar chart de métricas
- [ ] Dashboards personalizáveis
- [ ] Relatórios visuais avançados

## 🎯 RESULTADOS ESPERADOS

### Experiência do Usuário
- **80%** aumento no tempo de sessão
- **60%** melhoria na satisfação visual
- **90%** redução em cliques para navegação
- **70%** aumento no engajamento mobile

### Performance Visual
- **Animações fluidas** a 60fps
- **Transições suaves** em todas as interações
- **Feedback visual** imediato para todas as ações
- **Consistência visual** em 100% das telas

### Competitividade
- **Interface premium** no nível de startups unicórnio
- **Funcionalidades únicas** não encontradas em concorrentes
- **Experiência mobile nativa** sem necessidade de app
- **Gamificação envolvente** que vicia positivamente

---

*Este documento apresenta melhorias visuais e funcionais que elevarão o AfiliadosBet a um nível premium, competindo diretamente com as melhores plataformas do mundo.*