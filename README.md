# AfiliadosBet - Sistema de Marketing de Afiliados

Sistema completo de marketing de afiliados para casas de apostas esportivas, com suporte a múltiplos modelos de comissão (CPA, RevShare e Hybrid) e integração universal via API e postbacks.

## 🚀 Instalação Rápida

### Pré-requisitos
- Node.js 20+ 
- PostgreSQL 13+
- npm ou yarn

### Instalação

```bash
# 1. Clonar o repositório
git clone <repository-url>
cd afiliadosbet

# 2. Instalar dependências
npm install

# 3. Configurar variáveis de ambiente
cp .env.example .env
# Editar .env com suas configurações

# 4. Configurar banco de dados
npm run db:push

# 5. Iniciar aplicação
npm run dev
```

## 🔧 Variáveis de Ambiente

Crie um arquivo `.env` na raiz do projeto:

```env
# Banco de Dados
DATABASE_URL=postgresql://usuario:senha@localhost:5432/afiliadosbet

# Aplicação
NODE_ENV=development
PORT=3000
SESSION_SECRET=sua-chave-secreta-super-forte

# Configurações Opcionais
# ADMIN_EMAIL=admin@exemplo.com
# ADMIN_PASSWORD=senha123
```

## 📦 Scripts Disponíveis

```bash
# Desenvolvimento
npm run dev          # Inicia servidor de desenvolvimento

# Produção
npm run build        # Compila aplicação para produção
npm run start        # Inicia servidor de produção

# Banco de Dados
npm run db:push      # Aplica mudanças no schema do banco

# Verificação
npm run check        # Verifica tipos TypeScript
```

## 🏗️ Arquitetura

### Stack Tecnológico
- **Frontend**: React 18 + TypeScript + Tailwind CSS
- **Backend**: Node.js + Express + TypeScript  
- **Banco**: PostgreSQL + Drizzle ORM
- **Autenticação**: Passport.js + Sessions
- **Build**: Vite + esbuild

### Estrutura de Diretórios
```
├── client/          # Frontend React
│   ├── src/
│   │   ├── components/  # Componentes reutilizáveis
│   │   ├── pages/       # Páginas da aplicação
│   │   ├── hooks/       # Hooks customizados
│   │   └── lib/         # Utilitários
├── server/          # Backend API
│   ├── routes.ts    # Rotas principais
│   ├── db.ts        # Configuração do banco
│   └── services/    # Lógica de negócio
├── shared/          # Código compartilhado
│   └── schema.ts    # Schema do banco de dados
└── dist/           # Build de produção
```

## 🔐 Sistema de Autenticação

- **Login**: Email + Senha
- **Roles**: Affiliate (padrão) e Admin
- **Sessões**: Armazenadas no PostgreSQL
- **Segurança**: bcrypt para hash de senhas

## 💰 Modelos de Comissão

### CPA (Cost Per Action)
- Comissão fixa por conversão qualificada
- Baseado em registro + depósito mínimo

### RevShare (Revenue Share)
- Percentual do lucro compartilhado
- Comissão recorrente baseada no profit

### Hybrid
- Combinação de CPA + RevShare
- Flexibilidade máxima para diferentes estratégias

## 🔌 Integrações

### Postbacks
- URL padrão: `/api/postback/:casa/:evento`
- Eventos suportados: register, deposit, profit, chargeback
- Validação por token de segurança

### API
- Integração com APIs externas (Smartico, etc.)
- Sincronização automática configurável
- Suporte a múltiplos tipos de autenticação

## 🚀 Deploy

### Deploy Local/VPS

```bash
# 1. Build da aplicação
npm run build

# 2. Configurar PM2 (recomendado)
npm install -g pm2
pm2 start dist/index.js --name afiliadosbet

# 3. Configurar proxy reverso (Nginx)
# Ver arquivo de configuração em /docs/nginx.conf
```

### Deploy com Docker

```bash
# Build da imagem
docker build -t afiliadosbet .

# Executar container
docker run -d \
  --name afiliadosbet \
  -p 3000:3000 \
  -e DATABASE_URL=postgresql://... \
  afiliadosbet
```

### Variáveis de Produção

```env
NODE_ENV=production
DATABASE_URL=postgresql://...
SESSION_SECRET=chave-super-segura-para-producao
PORT=3000
```

## 📊 Funcionalidades

### Para Afiliados
- ✅ Dashboard com métricas em tempo real
- ✅ Geração automática de links de afiliado
- ✅ Tracking detalhado de cliques e conversões
- ✅ Relatórios de performance
- ✅ Solicitação de pagamentos via PIX
- ✅ Histórico completo de ganhos

### Para Administradores
- ✅ Painel completo de gerenciamento
- ✅ Configuração de casas de apostas
- ✅ Gerenciamento de afiliados
- ✅ Configuração de comissões
- ✅ Processamento de pagamentos
- ✅ Logs de postbacks e integrações
- ✅ Relatórios administrativos

### Recursos Técnicos
- ✅ API RESTful completa
- ✅ Autenticação robusta
- ✅ Validação de dados com Zod
- ✅ ORM tipado com Drizzle
- ✅ Interface responsiva
- ✅ Sistema de notificações
- ✅ Logs estruturados

## 🔧 Configuração de Casas

### Exemplo de Configuração

```json
{
  "name": "Casa Exemplo",
  "baseUrl": "https://exemplo.com/afiliado?subid=VALUE",
  "commissionType": "Hybrid",
  "cpaValue": "150.00",
  "revshareValue": "35.00",
  "minDeposit": "50.00",
  "securityToken": "token-seguro-unico",
  "integrationType": "hybrid"
}
```

## 🔍 Troubleshooting

### Problemas Comuns

**1. Erro de Conexão com Banco**
```bash
# Verificar se PostgreSQL está rodando
systemctl status postgresql

# Verificar string de conexão
echo $DATABASE_URL
```

**2. Erro de Dependências**
```bash
# Limpar cache e reinstalar
rm -rf node_modules package-lock.json
npm install
```

**3. Problemas de Build**
```bash
# Verificar tipos
npm run check

# Build limpo
rm -rf dist/
npm run build
```

## 📝 Logs

### Localização dos Logs
- **Desenvolvimento**: Console do terminal
- **Produção**: PM2 logs ou Docker logs

### Comandos Úteis
```bash
# Ver logs do PM2
pm2 logs afiliadosbet

# Ver logs em tempo real
pm2 logs afiliadosbet -f

# Logs do Docker
docker logs afiliadosbet -f
```

## 🛠️ Desenvolvimento

### Configuração do Ambiente
```bash
# Instalar dependências de desenvolvimento
npm install

# Iniciar em modo de desenvolvimento
npm run dev

# Aplicar mudanças no banco
npm run db:push
```

### Estrutura de Desenvolvimento
- Hot reload automático
- TypeScript com checagem estrita
- ESLint + Prettier (configurar conforme necessário)
- Vite para build rápido

## 📈 Performance

### Otimizações Implementadas
- ✅ Compressão de assets
- ✅ Lazy loading de componentes
- ✅ Otimização de queries do banco
- ✅ Cache de sessões
- ✅ Build otimizado para produção

### Monitoramento
- Logs estruturados para debugging
- Métricas de performance via PM2
- Health checks configuráveis

## 🔒 Segurança

### Medidas Implementadas
- ✅ Hash seguro de senhas (bcrypt)
- ✅ Validação de entrada com Zod
- ✅ Sanitização de dados
- ✅ Headers de segurança
- ✅ Rate limiting (configurável)
- ✅ Validação de tokens para postbacks

## 📞 Suporte

Para dúvidas técnicas ou problemas:

1. Verificar logs da aplicação
2. Consultar documentação no código
3. Verificar issues conhecidas
4. Contactar equipe de desenvolvimento

## 📄 Licença

MIT License - Ver arquivo LICENSE para detalhes.

---

**Status**: ✅ Funcional e pronto para produção
**Última atualização**: Junho 2025
**Versão**: 1.0.0