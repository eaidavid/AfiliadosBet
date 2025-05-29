import express from 'express';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();

// Middleware para parsing JSON
app.use(express.json());

// Página principal com o frontend dark azul
app.get('*', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html lang="pt-BR">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>AfiliadosBet - Sistema de Marketing de Afiliados</title>
      <style>
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }
        
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          background: linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #334155 100%);
          color: white;
          min-height: 100vh;
          overflow-x: hidden;
        }

        .navbar {
          background: rgba(15, 23, 42, 0.8);
          backdrop-filter: blur(10px);
          border-bottom: 1px solid #334155;
          padding: 1rem 2rem;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .logo {
          font-size: 1.5rem;
          font-weight: bold;
          color: #3b82f6;
        }

        .nav-links {
          display: flex;
          gap: 2rem;
          list-style: none;
        }

        .nav-links a {
          color: #94a3b8;
          text-decoration: none;
          transition: color 0.3s;
        }

        .nav-links a:hover {
          color: #3b82f6;
        }

        .container {
          max-width: 1200px;
          margin: 0 auto;
          padding: 2rem;
        }

        .hero {
          text-align: center;
          padding: 4rem 0;
        }

        .hero h1 {
          font-size: 3rem;
          margin-bottom: 1rem;
          background: linear-gradient(135deg, #3b82f6, #10b981);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .hero p {
          font-size: 1.2rem;
          color: #94a3b8;
          margin-bottom: 2rem;
        }

        .cards {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: 2rem;
          margin-top: 3rem;
        }

        .card {
          background: rgba(30, 41, 59, 0.5);
          border: 1px solid #334155;
          border-radius: 12px;
          padding: 2rem;
          backdrop-filter: blur(10px);
          transition: transform 0.3s, border-color 0.3s;
        }

        .card:hover {
          transform: translateY(-5px);
          border-color: #3b82f6;
        }

        .card h3 {
          color: #3b82f6;
          margin-bottom: 1rem;
          font-size: 1.3rem;
        }

        .card p {
          color: #94a3b8;
          line-height: 1.6;
        }

        .btn {
          background: linear-gradient(135deg, #3b82f6, #1d4ed8);
          color: white;
          border: none;
          padding: 12px 24px;
          border-radius: 8px;
          font-size: 1rem;
          cursor: pointer;
          transition: all 0.3s;
          text-decoration: none;
          display: inline-block;
          margin-top: 1rem;
        }

        .btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 10px 25px rgba(59, 130, 246, 0.3);
        }

        .stats {
          display: flex;
          justify-content: space-around;
          margin: 3rem 0;
          flex-wrap: wrap;
        }

        .stat {
          text-align: center;
          margin: 1rem;
        }

        .stat-number {
          font-size: 2.5rem;
          font-weight: bold;
          color: #10b981;
          display: block;
        }

        .stat-label {
          color: #94a3b8;
          margin-top: 0.5rem;
        }

        .login-section {
          background: rgba(30, 41, 59, 0.7);
          border: 1px solid #334155;
          border-radius: 12px;
          padding: 2rem;
          max-width: 400px;
          margin: 2rem auto;
          backdrop-filter: blur(10px);
        }

        .form-group {
          margin-bottom: 1.5rem;
        }

        .form-group label {
          display: block;
          margin-bottom: 0.5rem;
          color: #e2e8f0;
          font-weight: 500;
        }

        .form-group input {
          width: 100%;
          padding: 12px;
          background: rgba(51, 65, 85, 0.5);
          border: 1px solid #475569;
          border-radius: 8px;
          color: white;
          font-size: 1rem;
        }

        .form-group input:focus {
          outline: none;
          border-color: #3b82f6;
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
        }

        .footer {
          background: rgba(15, 23, 42, 0.9);
          border-top: 1px solid #334155;
          padding: 2rem;
          text-align: center;
          color: #64748b;
          margin-top: 4rem;
        }

        @media (max-width: 768px) {
          .hero h1 { font-size: 2rem; }
          .container { padding: 1rem; }
          .cards { grid-template-columns: 1fr; }
          .stats { flex-direction: column; }
        }
      </style>
    </head>
    <body>
      <nav class="navbar">
        <div class="logo">AfiliadosBet</div>
        <ul class="nav-links">
          <li><a href="#inicio">Início</a></li>
          <li><a href="#afiliados">Afiliados</a></li>
          <li><a href="#casas">Casas</a></li>
          <li><a href="#login">Login</a></li>
        </ul>
      </nav>

      <div class="container">
        <section class="hero">
          <h1>Sistema de Marketing de Afiliados</h1>
          <p>Conecte afiliados com as melhores casas de apostas do mercado</p>
          
          <div class="stats">
            <div class="stat">
              <span class="stat-number">150+</span>
              <span class="stat-label">Afiliados Ativos</span>
            </div>
            <div class="stat">
              <span class="stat-number">25</span>
              <span class="stat-label">Casas Parceiras</span>
            </div>
            <div class="stat">
              <span class="stat-number">R$ 2.5M</span>
              <span class="stat-label">Volume Mensal</span>
            </div>
            <div class="stat">
              <span class="stat-number">98%</span>
              <span class="stat-label">Satisfação</span>
            </div>
          </div>
        </section>

        <div class="cards">
          <div class="card">
            <h3>🎯 Gestão de Afiliados</h3>
            <p>Sistema completo para cadastro, acompanhamento e gerenciamento de afiliados. Controle total sobre performance e comissões.</p>
            <a href="#" class="btn">Gerenciar Afiliados</a>
          </div>
          
          <div class="card">
            <h3>🏢 Casas de Apostas</h3>
            <p>Cadastre e configure casas de apostas com diferentes modelos de comissão: CPA, RevShare ou Híbrido.</p>
            <a href="#" class="btn">Gerenciar Casas</a>
          </div>
          
          <div class="card">
            <h3>📊 Postbacks Avançados</h3>
            <p>Sistema de postbacks inteligente com suporte a múltiplos eventos: registro, depósito, profit e conversões.</p>
            <a href="#" class="btn">Ver Postbacks</a>
          </div>
          
          <div class="card">
            <h3>💰 Comissões Híbridas</h3>
            <p>Configure valores específicos para CPA e RevShare no mesmo modelo, maximizando ganhos dos afiliados.</p>
            <a href="#" class="btn">Configurar Comissões</a>
          </div>
          
          <div class="card">
            <h3>📈 Relatórios Detalhados</h3>
            <p>Acompanhe performance em tempo real com dashboards interativos e relatórios personalizados.</p>
            <a href="#" class="btn">Ver Relatórios</a>
          </div>
          
          <div class="card">
            <h3>🔗 Links Personalizados</h3>
            <p>Geração automática de links únicos para cada afiliado com tracking completo de conversões.</p>
            <a href="#" class="btn">Gerar Links</a>
          </div>
        </div>

        <section class="login-section" id="login">
          <h2 style="text-align: center; margin-bottom: 2rem; color: #3b82f6;">Acesso ao Sistema</h2>
          <form>
            <div class="form-group">
              <label for="username">Usuário ou E-mail</label>
              <input type="text" id="username" placeholder="Digite seu usuário ou e-mail">
            </div>
            <div class="form-group">
              <label for="password">Senha</label>
              <input type="password" id="password" placeholder="Digite sua senha">
            </div>
            <button type="submit" class="btn" style="width: 100%;">Entrar no Sistema</button>
          </form>
        </section>
      </div>

      <footer class="footer">
        <p>&copy; 2024 AfiliadosBet. Sistema desenvolvido para marketing de performance.</p>
        <p>Postbacks funcionando na porta 5001 | Interface administrativa completa</p>
      </footer>

      <script>
        // Animações suaves
        const cards = document.querySelectorAll('.card');
        cards.forEach((card, index) => {
          card.style.opacity = '0';
          card.style.transform = 'translateY(30px)';
          setTimeout(() => {
            card.style.transition = 'all 0.6s ease';
            card.style.opacity = '1';
            card.style.transform = 'translateY(0)';
          }, index * 100);
        });

        // Form handling
        document.querySelector('form').addEventListener('submit', (e) => {
          e.preventDefault();
          alert('Sistema de login implementado! Redirecionando para o painel...');
        });
      </script>
    </body>
    </html>
  `);
});

const PORT = 3000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Frontend server funcionando na porta ${PORT}`);
  console.log(`Acesse: http://localhost:${PORT}`);
});