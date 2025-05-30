import { useEffect, useState } from "react";
import logoPath from "@assets/Afiliados Bet positivo.png";

export default function SimpleLanding() {
  const [statsCount, setStatsCount] = useState({ earnings: 0, affiliates: 0, commission: 0 });

  useEffect(() => {
    document.title = "AfiliadosBet - Sistema de Afiliados para Casas de Apostas | Ganhe Comissões";
    
    // Animate statistics
    const interval = setInterval(() => {
      setStatsCount(prev => ({
        earnings: Math.min(prev.earnings + 150, 15000),
        affiliates: Math.min(prev.affiliates + 28, 2847),
        commission: Math.min(prev.commission + 0.5, 45)
      }));
    }, 20);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="dark min-h-screen bg-gradient-to-br from-slate-900 via-blue-950 to-green-950 overflow-hidden relative">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-20 left-10 w-72 h-72 bg-green-500 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-blue-500 rounded-full blur-3xl animate-bounce"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-emerald-500 rounded-full blur-3xl opacity-20 animate-ping"></div>
      </div>

      {/* Navigation */}
      <nav className="relative z-10 bg-slate-800/50 backdrop-blur-md border-b border-blue-800/30">
        <div className="container mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <img src={logoPath} alt="AfiliadosBet" className="h-10 w-10" />
            <span className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-green-400 bg-clip-text text-transparent">
              AfiliadosBet
            </span>
          </div>
          <div className="flex items-center space-x-4">
            <button 
              onClick={() => window.location.href = "/login"}
              className="text-blue-300 hover:text-white transition-colors px-4 py-2"
            >
              Entrar
            </button>
            <button 
              onClick={() => window.location.href = "/register"}
              className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white px-6 py-2 rounded-lg font-semibold shadow-lg shadow-green-900/30 transition-all transform hover:scale-105"
            >
              Cadastrar Grátis
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="relative z-10 container mx-auto px-6 py-20">
        <div className="text-center">
          {/* Badge */}
          <div className="inline-flex items-center px-4 py-2 mb-8 bg-gradient-to-r from-blue-900/50 to-green-900/50 border border-blue-500/30 rounded-full">
            <div className="w-2 h-2 bg-green-400 rounded-full mr-3 animate-pulse"></div>
            <span className="text-blue-300 text-sm font-semibold">🚀 #1 Sistema de Afiliados de Apostas do Brasil</span>
          </div>

          {/* Main Title */}
          <h1 className="text-5xl md:text-7xl font-black mb-8 leading-tight">
            <span className="text-white">Transforme Seu </span>
            <br />
            <span className="bg-gradient-to-r from-blue-400 via-green-400 to-emerald-400 bg-clip-text text-transparent animate-pulse">
              Tráfego em Dinheiro
            </span>
          </h1>

          {/* Subtitle */}
          <p className="text-xl md:text-2xl text-gray-300 mb-12 max-w-4xl mx-auto leading-relaxed">
            Ganhe até <span className="text-green-400 font-bold">R$ 15.000+ por mês</span> como afiliado das melhores casas de apostas do mercado. 
            Sistema completo com comissões de até <span className="text-blue-400 font-bold">45%</span> e pagamentos garantidos.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-6 justify-center items-center mb-16">
            <button 
              onClick={() => window.location.href = "/register"}
              className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white px-10 py-5 text-xl font-bold rounded-xl shadow-2xl shadow-green-900/50 transition-all transform hover:scale-105 hover:shadow-green-900/70 animate-pulse"
            >
              💰 Começar Agora Grátis
            </button>
            <button 
              onClick={() => window.scrollTo({ top: window.innerHeight, behavior: 'smooth' })}
              className="border-2 border-blue-400 text-blue-300 hover:bg-blue-600 hover:text-white px-10 py-5 text-xl font-semibold rounded-xl transition-all transform hover:scale-105"
            >
              ⚡ Como Funciona
            </button>
          </div>

          {/* Statistics */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 bg-slate-800/40 backdrop-blur-sm rounded-2xl p-8 border border-blue-800/30 shadow-2xl">
            <div className="text-center group hover:scale-105 transition-transform">
              <div className="text-4xl md:text-5xl font-black text-green-400 mb-2">
                R$ {statsCount.earnings.toLocaleString()}+
              </div>
              <p className="text-gray-300">Ganho Médio Mensal</p>
              <div className="w-full bg-slate-700 rounded-full h-2 mt-3">
                <div className="bg-gradient-to-r from-green-500 to-emerald-500 h-2 rounded-full transition-all duration-1000" style={{ width: `${(statsCount.earnings / 15000) * 100}%` }}></div>
              </div>
            </div>
            <div className="text-center group hover:scale-105 transition-transform">
              <div className="text-4xl md:text-5xl font-black text-blue-400 mb-2">
                {statsCount.affiliates.toLocaleString()}+
              </div>
              <p className="text-gray-300">Afiliados Ativos</p>
              <div className="w-full bg-slate-700 rounded-full h-2 mt-3">
                <div className="bg-gradient-to-r from-blue-500 to-cyan-500 h-2 rounded-full transition-all duration-1000" style={{ width: `${(statsCount.affiliates / 2847) * 100}%` }}></div>
              </div>
            </div>
            <div className="text-center group hover:scale-105 transition-transform">
              <div className="text-4xl md:text-5xl font-black text-emerald-400 mb-2">
                {statsCount.commission.toFixed(0)}%
              </div>
              <p className="text-gray-300">Comissão Máxima</p>
              <div className="w-full bg-slate-700 rounded-full h-2 mt-3">
                <div className="bg-gradient-to-r from-emerald-500 to-green-500 h-2 rounded-full transition-all duration-1000" style={{ width: `${(statsCount.commission / 45) * 100}%` }}></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="relative z-10 bg-slate-800/30 backdrop-blur-sm py-20">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
              Por Que Escolher o AfiliadosBet?
            </h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              O sistema mais completo e confiável para afiliados de casas de apostas
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-8 border border-green-800/30 hover:border-green-500/50 transition-all group hover:scale-105">
              <div className="text-6xl mb-6 group-hover:animate-bounce">💰</div>
              <h3 className="text-2xl font-bold text-green-400 mb-4">Comissões Altas</h3>
              <p className="text-gray-300">Ganhe até 45% de comissão sobre cada apostador que trouxer. Sem limites de ganhos.</p>
            </div>

            {/* Feature 2 */}
            <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-8 border border-blue-800/30 hover:border-blue-500/50 transition-all group hover:scale-105">
              <div className="text-6xl mb-6 group-hover:animate-spin">📊</div>
              <h3 className="text-2xl font-bold text-blue-400 mb-4">Analytics em Tempo Real</h3>
              <p className="text-gray-300">Acompanhe seus cliques, conversões e ganhos em tempo real com dashboards intuitivos.</p>
            </div>

            {/* Feature 3 */}
            <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-8 border border-emerald-800/30 hover:border-emerald-500/50 transition-all group hover:scale-105">
              <div className="text-6xl mb-6 group-hover:animate-pulse">🛡️</div>
              <h3 className="text-2xl font-bold text-emerald-400 mb-4">Pagamentos Garantidos</h3>
              <p className="text-gray-300">Pagamentos pontuais e seguros. Histórico de 100% de pagamentos em dia.</p>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Final */}
      <div className="relative z-10 bg-gradient-to-r from-green-900/50 to-blue-900/50 py-20">
        <div className="container mx-auto px-6 text-center">
          <h2 className="text-4xl md:text-6xl font-bold text-white mb-8">
            Pronto Para Ganhar Dinheiro?
          </h2>
          <p className="text-xl text-gray-300 mb-10 max-w-2xl mx-auto">
            Junte-se a mais de 2.800 afiliados que já estão lucrando todos os dias. Cadastro gratuito em menos de 2 minutos.
          </p>
          <button 
            onClick={() => window.location.href = "/register"}
            className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white px-12 py-6 text-2xl font-bold rounded-xl shadow-2xl shadow-green-900/50 transition-all transform hover:scale-110 animate-pulse"
          >
            🚀 Começar Agora Grátis
          </button>
        </div>
      </div>
    </div>
  );
}