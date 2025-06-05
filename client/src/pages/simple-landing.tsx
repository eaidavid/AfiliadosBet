import { useEffect, useState, useRef } from "react";
import logoPath from "@assets/Afiliados Bet positivo.png";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { 
  Calculator, 
  FileText, 
  BookOpen, 
  Info, 
  TrendingUp, 
  PieChart, 
  Wallet, 
  DollarSign, 
  BarChart3, 
  Coins,
  Trophy,
  Rocket,
  Clock,
  Calendar,
  Shield
} from "lucide-react";

// Estilos CSS inline para animações fade-in
const fadeInStyles = `
  @keyframes fadeInUp {
    from {
      opacity: 0;
      transform: translateY(20px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
  .animate-fade-in {
    animation: fadeInUp 0.8s ease-out forwards;
  }
`;

export default function SimpleLanding() {
  const [statsCount, setStatsCount] = useState({ earnings: 0, affiliates: 0, commission: 0 });

  useEffect(() => {
    document.title = "AfiliadosBet - Sistema de Afiliados para Casas de Apostas | Ganhe Comissões";
    
    // Animate statistics
    const interval = setInterval(() => {
      setStatsCount(prev => ({
        earnings: Math.min(prev.earnings + 150, 15000),
        affiliates: Math.min(prev.affiliates + 28, 2847),
        commission: Math.min(prev.commission + 0.5, 50)
      }));
    }, 20);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="dark min-h-screen bg-gradient-to-br from-slate-900 via-blue-950 to-green-950 overflow-hidden relative">
      <style>{fadeInStyles}</style>
      {/* Animated Background Elements */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-20 left-10 w-72 h-72 bg-green-500 rounded-full blur-3xl animate-pulse" style={{ animationDuration: '3s' }}></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-blue-500 rounded-full blur-3xl animate-bounce" style={{ animationDuration: '4s' }}></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-emerald-500 rounded-full blur-3xl opacity-20 animate-ping" style={{ animationDuration: '5s' }}></div>
        <div className="absolute top-10 right-1/4 w-48 h-48 bg-cyan-500 rounded-full blur-2xl opacity-30 animate-pulse" style={{ animationDuration: '2.5s', animationDelay: '1s' }}></div>
        <div className="absolute bottom-10 left-1/4 w-64 h-64 bg-yellow-500 rounded-full blur-2xl opacity-20 animate-bounce" style={{ animationDuration: '3.5s', animationDelay: '0.5s' }}></div>
      </div>
      {/* Navigation */}
      <nav className="relative z-10 bg-slate-800/50 backdrop-blur-md border-b border-blue-800/30">
        <div className="container mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <img src={logoPath} alt="AfiliadosBet" className="h-10 w-10" />
            <span className="font-bold bg-gradient-to-r from-blue-400 to-green-400 bg-clip-text text-transparent text-[16px]">
              AfiliadosBet
            </span>
          </div>
          <div className="flex items-center space-x-4 text-sm">
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
          <div className="inline-flex items-center px-4 py-2 mb-8 bg-gradient-to-r from-blue-900/50 to-green-900/50 border border-blue-500/30 rounded-full animate-pulse transform hover:scale-105 transition-all duration-700 opacity-0 animate-fade-in"
            style={{ animationDelay: '0.2s', animationFillMode: 'forwards' }}
          >
            <div className="w-2 h-2 bg-green-400 rounded-full mr-3 animate-pulse" style={{ animationDuration: '1.5s' }}></div>
            <span className="text-blue-300 text-sm font-semibold">🚀 #1 Sistema de Afiliados de Apostas do Brasil</span>
          </div>

          {/* Main Title */}
          <h1 className="text-5xl md:text-7xl font-black mb-8 leading-tight transform hover:scale-105 transition-all duration-500">
            <span className="text-white animate-pulse" style={{ animationDuration: '2s' }}>Transforme Seu </span>
            <br />
            <span className="bg-gradient-to-r from-blue-400 via-green-400 to-emerald-400 bg-clip-text text-transparent animate-pulse" style={{ animationDuration: '3s', animationDelay: '0.5s' }}>
              Tráfego em Dinheiro
            </span>
          </h1>

          {/* Subtitle */}
          <p className="text-xl md:text-2xl text-gray-300 mb-12 max-w-4xl mx-auto leading-relaxed">
            Ganhe até <span className="text-green-400 font-bold">R$ 15.000+ por mês</span> como afiliado das melhores casas de apostas do mercado. 
            Sistema completo com comissões de até <span className="text-blue-400 font-bold">50%</span> e pagamentos garantidos.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-6 justify-center items-center mb-16">
            <button 
              onClick={() => window.location.href = "/register"}
              className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white px-10 py-5 text-xl font-bold rounded-xl shadow-2xl shadow-green-900/50 transition-all transform hover:scale-110 hover:shadow-green-900/70 animate-bounce hover:animate-none active:scale-95"
              style={{ animationDuration: '2s' }}
            >
              💰 Começar Agora Grátis
            </button>
            <button 
              onClick={() => window.location.href = "/login"}
              className="border-2 border-blue-400 text-blue-300 hover:bg-blue-600 hover:text-white px-10 py-5 text-xl font-semibold rounded-xl transition-all transform hover:scale-105 animate-pulse hover:animate-none active:scale-95"
              style={{ animationDuration: '2.5s', animationDelay: '0.5s' }}
            >
              🔑 Já Tenho Conta - Entrar
            </button>
            <button 
              onClick={() => window.scrollTo({ top: window.innerHeight, behavior: 'smooth' })}
              className="border border-slate-500 text-slate-300 hover:bg-slate-700 hover:text-white px-8 py-4 text-lg font-medium rounded-xl transition-all transform hover:scale-105 opacity-75 hover:opacity-100"
            >
              ⚡ Como Funciona
            </button>
            <button 
              onClick={() => {
                const informacoesSection = document.getElementById('informacoes-importantes');
                if (informacoesSection) {
                  informacoesSection.scrollIntoView({ behavior: 'smooth' });
                }
              }}
              className="border border-blue-500 text-blue-300 hover:bg-blue-600 hover:text-white px-8 py-4 text-lg font-medium rounded-xl transition-all transform hover:scale-105 opacity-75 hover:opacity-100"
            >
              📋 Informações Importantes
            </button>
          </div>

          {/* Statistics */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 bg-slate-800/40 backdrop-blur-sm rounded-2xl p-8 border border-blue-800/30 shadow-2xl transform hover:scale-102 transition-all duration-500">
            <div className="text-center group hover:scale-110 transition-all duration-300 cursor-pointer">
              <div className="text-4xl md:text-5xl font-black text-green-400 mb-2 animate-pulse" style={{ animationDuration: '2s' }}>
                R$ {statsCount.earnings.toLocaleString()}+
              </div>
              <p className="text-gray-300">Ganho Médio Mensal</p>
              <div className="w-full bg-slate-700 rounded-full h-2 mt-3 overflow-hidden">
                <div className="bg-gradient-to-r from-green-500 to-emerald-500 h-2 rounded-full transition-all duration-1000 animate-pulse" style={{ width: `${(statsCount.earnings / 15000) * 100}%`, animationDuration: '3s' }}></div>
              </div>
            </div>
            <div className="text-center group hover:scale-110 transition-all duration-300 cursor-pointer">
              <div className="text-4xl md:text-5xl font-black text-blue-400 mb-2 animate-pulse" style={{ animationDuration: '2.2s', animationDelay: '0.3s' }}>
                {statsCount.affiliates.toLocaleString()}+
              </div>
              <p className="text-gray-300">Afiliados Ativos</p>
              <div className="w-full bg-slate-700 rounded-full h-2 mt-3 overflow-hidden">
                <div className="bg-gradient-to-r from-blue-500 to-cyan-500 h-2 rounded-full transition-all duration-1000 animate-pulse" style={{ width: `${(statsCount.affiliates / 2847) * 100}%`, animationDuration: '3.2s' }}></div>
              </div>
            </div>
            <div className="text-center group hover:scale-110 transition-all duration-300 cursor-pointer">
              <div className="text-4xl md:text-5xl font-black text-emerald-400 mb-2 animate-pulse" style={{ animationDuration: '2.5s', animationDelay: '0.6s' }}>
                {statsCount.commission.toFixed(0)}%
              </div>
              <p className="text-gray-300">Comissão Máxima</p>
              <div className="w-full bg-slate-700 rounded-full h-2 mt-3 overflow-hidden">
                <div className="bg-gradient-to-r from-emerald-500 to-green-500 h-2 rounded-full transition-all duration-1000 animate-pulse" style={{ width: `${(statsCount.commission / 50) * 100}%`, animationDuration: '3.5s' }}></div>
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
            <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-8 border border-green-800/30 hover:border-green-500/50 transition-all duration-500 group hover:scale-110 transform cursor-pointer hover:shadow-2xl hover:shadow-green-900/30">
              <div className="text-6xl mb-6 group-hover:animate-bounce animate-pulse" style={{ animationDuration: '3s' }}>💰</div>
              <h3 className="text-2xl font-bold text-green-400 mb-4 group-hover:animate-pulse">Comissões Altas</h3>
              <p className="text-gray-300">Ganhe até 50% de comissão sobre cada apostador que trouxer. Sem limites de ganhos.</p>
            </div>

            {/* Feature 2 */}
            <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-8 border border-blue-800/30 hover:border-blue-500/50 transition-all duration-500 group hover:scale-110 transform cursor-pointer hover:shadow-2xl hover:shadow-blue-900/30">
              <div className="text-6xl mb-6 group-hover:animate-spin animate-pulse" style={{ animationDuration: '3.5s', animationDelay: '0.5s' }}>📊</div>
              <h3 className="text-2xl font-bold text-blue-400 mb-4 group-hover:animate-pulse">Analytics em Tempo Real</h3>
              <p className="text-gray-300">Acompanhe seus cliques, conversões e ganhos em tempo real com dashboards intuitivos.</p>
            </div>

            {/* Feature 3 */}
            <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-8 border border-emerald-800/30 hover:border-emerald-500/50 transition-all duration-500 group hover:scale-110 transform cursor-pointer hover:shadow-2xl hover:shadow-emerald-900/30">
              <div className="text-6xl mb-6 group-hover:animate-pulse animate-bounce" style={{ animationDuration: '4s', animationDelay: '1s' }}>🛡️</div>
              <h3 className="text-2xl font-bold text-emerald-400 mb-4 group-hover:animate-pulse">Pagamentos Garantidos</h3>
              <p className="text-gray-300">Pagamentos pontuais e seguros. Histórico de 100% de pagamentos em dia.</p>
            </div>
          </div>
        </div>
      </div>
      {/* Como Funciona */}
      <div className="relative z-10 py-20">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
              Como Funciona em 3 Passos Simples
            </h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Em menos de 10 minutos você estará ganhando suas primeiras comissões
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center group">
              <div className="bg-gradient-to-br from-blue-600 to-blue-800 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform shadow-2xl shadow-blue-900/50">
                <span className="text-3xl font-bold text-white">1</span>
              </div>
              <h3 className="text-2xl font-bold text-blue-400 mb-4">Cadastre-se Grátis</h3>
              <p className="text-gray-300 text-lg">Faça seu registro em menos de 2 minutos. Sem taxas, sem burocracia, totalmente gratuito para sempre.</p>
            </div>
            
            <div className="text-center group">
              <div className="bg-gradient-to-br from-green-600 to-green-800 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform shadow-2xl shadow-green-900/50">
                <span className="text-3xl font-bold text-white">2</span>
              </div>
              <h3 className="text-2xl font-bold text-green-400 mb-4">Promova Seus Links</h3>
              <p className="text-gray-300 text-lg">Compartilhe seus links personalizados nas redes sociais, WhatsApp, Telegram ou qualquer canal digital.</p>
            </div>
            
            <div className="text-center group">
              <div className="bg-gradient-to-br from-emerald-600 to-emerald-800 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform shadow-2xl shadow-emerald-900/50">
                <span className="text-3xl font-bold text-white">3</span>
              </div>
              <h3 className="text-2xl font-bold text-emerald-400 mb-4">Receba Comissões</h3>
              <p className="text-gray-300 text-lg">Ganhe automaticamente até 50% de comissão por cada apostador que se cadastrar através dos seus links.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Seção de Abas Informativas */}
      <div id="informacoes-importantes" className="relative z-10 py-20 bg-slate-900/50 backdrop-blur-sm">
        <div className="container mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
              Informações Importantes
            </h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Tudo que você precisa saber para começar a ganhar dinheiro como afiliado
            </p>
          </div>
          
          <Tabs defaultValue="comissao" className="w-full">
            <TabsList className="grid w-full grid-cols-1 md:grid-cols-3 bg-slate-800/50 rounded-xl p-1 mb-8">
              <TabsTrigger 
                value="comissao" 
                className="data-[state=active]:bg-blue-600 data-[state=active]:text-white text-gray-300 hover:text-white transition-all duration-200 py-3 px-6 rounded-lg"
              >
                <Calculator className="mr-2 h-4 w-4" />
                Sobre sua comissão
              </TabsTrigger>
              <TabsTrigger 
                value="termos" 
                className="data-[state=active]:bg-blue-600 data-[state=active]:text-white text-gray-300 hover:text-white transition-all duration-200 py-3 px-6 rounded-lg"
              >
                <FileText className="mr-2 h-4 w-4" />
                Termos Técnicos
              </TabsTrigger>
              <TabsTrigger 
                value="direitos" 
                className="data-[state=active]:bg-blue-600 data-[state=active]:text-white text-gray-300 hover:text-white transition-all duration-200 py-3 px-6 rounded-lg"
              >
                <BookOpen className="mr-2 h-4 w-4" />
                Direitos e Deveres
              </TabsTrigger>
            </TabsList>

            <TabsContent value="comissao" className="mt-8">
              <Card className="bg-slate-800/30 border-slate-700/50 backdrop-blur-sm">
                <CardContent className="p-8">
                  {/* Como Funcionam os Pagamentos */}
                  <div className="mb-12">
                    <div className="flex items-center mb-6">
                      <DollarSign className="h-6 w-6 text-green-400 mr-3" />
                      <h3 className="text-2xl font-bold text-white">Como Funcionam os Pagamentos na Plataforma AfiliadosBet</h3>
                    </div>
                    
                    <p className="text-gray-300 mb-8 text-lg leading-relaxed">
                      Nós sabemos que receber sua comissão de forma rápida e segura é essencial para o seu sucesso. Por isso, aqui na AfiliadosBet, os pagamentos são realizados sempre de forma mensal, garantindo organização e transparência para você.
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                      <Card className="bg-slate-900/50 border-blue-500/20 hover:border-blue-500/40 transition-colors">
                        <CardContent className="p-6">
                          <div className="flex items-center mb-3">
                            <Calendar className="h-5 w-5 text-blue-400 mr-2" />
                            <h4 className="text-lg font-semibold text-white">Período de Apuração</h4>
                          </div>
                          <ul className="text-gray-300 text-sm space-y-1">
                            <li>• O mês começa no dia 1º</li>
                            <li>• O fechamento ocorre no último dia do mês (30 ou 31)</li>
                          </ul>
                        </CardContent>
                      </Card>

                      <Card className="bg-slate-900/50 border-green-500/20 hover:border-green-500/40 transition-colors">
                        <CardContent className="p-6">
                          <div className="flex items-center mb-3">
                            <Clock className="h-5 w-5 text-green-400 mr-2" />
                            <h4 className="text-lg font-semibold text-white">Prazo para Pagamento</h4>
                          </div>
                          <p className="text-gray-300 text-sm">
                            Os pagamentos são processados até o 5º dia útil do mês seguinte ao fechamento do período.
                          </p>
                        </CardContent>
                      </Card>
                    </div>

                    <div className="bg-blue-900/30 rounded-lg p-6 mb-8">
                      <h4 className="text-blue-400 font-semibold mb-3 flex items-center">
                        <Info className="h-5 w-5 mr-2" />
                        Exemplo prático:
                      </h4>
                      <ul className="text-gray-300 space-y-2">
                        <li>• <strong>Período de apuração:</strong> 1º a 31 de maio</li>
                        <li>• <strong>Pagamento:</strong> até o 5º dia útil de junho</li>
                      </ul>
                    </div>

                    <Card className="bg-gradient-to-r from-green-900/30 to-blue-900/30 border-green-500/30">
                      <CardContent className="p-6">
                        <div className="flex items-center mb-4">
                          <Shield className="h-6 w-6 text-green-400 mr-3" />
                          <h4 className="text-xl font-bold text-white">Transparência e Segurança</h4>
                        </div>
                        <p className="text-gray-300 leading-relaxed">
                          Nossa plataforma foi desenvolvida para oferecer total transparência e controle sobre seus ganhos. Você pode acompanhar em tempo real suas métricas, comissões e status de pagamento, tendo sempre a certeza de que o valor devido será pago no prazo combinado.
                        </p>
                        <p className="text-green-400 mt-4 font-semibold">
                          Confie na AfiliadosBet para entregar não só as melhores comissões, mas também a segurança e confiança que você merece.
                        </p>
                      </CardContent>
                    </Card>
                  </div>

                  <Separator className="bg-slate-700/50 my-8" />

                  {/* Como Funciona a Comissão */}
                  <div className="mb-12">
                    <div className="flex items-center mb-6">
                      <BarChart3 className="h-6 w-6 text-purple-400 mr-3" />
                      <h3 className="text-2xl font-bold text-white">Como Funciona a Comissão de Afiliados?</h3>
                    </div>
                    
                    <p className="text-gray-300 mb-8 text-lg leading-relaxed">
                      Se você quer lucrar indicando jogadores para uma casa de apostas, é essencial entender os dois modelos de comissão mais usados no mercado: Revenue Share e CPA.
                    </p>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                      {/* Revenue Share */}
                      <Card className="bg-gradient-to-br from-purple-900/30 to-blue-800/20 border-purple-500/30">
                        <CardContent className="p-8">
                          <div className="flex items-center mb-4">
                            <div className="p-3 bg-purple-500/20 rounded-full mr-4">
                              <TrendingUp className="h-8 w-8 text-purple-400" />
                            </div>
                            <h4 className="text-2xl font-bold text-white">Revenue Share</h4>
                          </div>
                          <p className="text-gray-300 mb-6 leading-relaxed">
                            No modelo Revenue Share, você ganha uma porcentagem sobre o lucro que a casa de apostas tem com os jogadores que você indicou.
                          </p>
                          
                          <div className="bg-slate-900/50 rounded-lg p-4 mb-4">
                            <h5 className="text-purple-400 font-semibold mb-2">Como é calculado:</h5>
                            <ul className="text-gray-300 space-y-1 text-sm">
                              <li>• Jogador perde R$ 400 apostando</li>
                              <li>• Casa desconta 20% de custos administrativos</li>
                              <li>• Receita líquida: R$ 320</li>
                              <li>• Com 50% Revenue Share: <strong className="text-green-400">R$ 160 de comissão</strong></li>
                            </ul>
                          </div>
                          
                          <div className="space-y-2">
                            <div className="flex items-center text-green-400">
                              <span className="mr-2">✅</span>
                              <span className="text-sm">Ganhos recorrentes</span>
                            </div>
                            <div className="flex items-center text-green-400">
                              <span className="mr-2">✅</span>
                              <span className="text-sm">Escalável</span>
                            </div>
                            <div className="flex items-center text-green-400">
                              <span className="mr-2">✅</span>
                              <span className="text-sm">Potencial maior no longo prazo</span>
                            </div>
                          </div>
                        </CardContent>
                      </Card>

                      {/* CPA */}
                      <Card className="bg-gradient-to-br from-orange-900/30 to-yellow-800/20 border-orange-500/30">
                        <CardContent className="p-8">
                          <div className="flex items-center mb-4">
                            <div className="p-3 bg-orange-500/20 rounded-full mr-4">
                              <DollarSign className="h-8 w-8 text-orange-400" />
                            </div>
                            <h4 className="text-2xl font-bold text-white">CPA (Custo por Aquisição)</h4>
                          </div>
                          <p className="text-gray-300 mb-6 leading-relaxed">
                            O CPA é um pagamento fixo por cada novo jogador que você traz, após ele se cadastrar e fazer um depósito qualificado.
                          </p>
                          
                          <div className="bg-slate-900/50 rounded-lg p-4 mb-4">
                            <h5 className="text-orange-400 font-semibold mb-2">Exemplo:</h5>
                            <ul className="text-gray-300 space-y-1 text-sm">
                              <li>• Jogador faz depósito mínimo (R$ 50)</li>
                              <li>• Casa paga R$ 150 por jogador qualificado</li>
                              <li>• Você recebe <strong className="text-green-400">R$ 150</strong>, independente do que ele apostar depois</li>
                            </ul>
                          </div>
                          
                          <div className="space-y-2">
                            <div className="flex items-center text-green-400">
                              <span className="mr-2">✅</span>
                              <span className="text-sm">Pagamentos rápidos</span>
                            </div>
                            <div className="flex items-center text-green-400">
                              <span className="mr-2">✅</span>
                              <span className="text-sm">Previsibilidade no faturamento</span>
                            </div>
                            <div className="flex items-center text-green-400">
                              <span className="mr-2">✅</span>
                              <span className="text-sm">Ótimo para tráfego pago</span>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </div>

                    {/* Tabela Comparativa */}
                    <Card className="bg-slate-900/50 border-slate-700/50 mb-8">
                      <CardHeader>
                        <CardTitle className="text-white flex items-center">
                          <BarChart3 className="h-5 w-5 text-blue-400 mr-2" />
                          Qual é o melhor modelo?
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="overflow-x-auto">
                          <table className="w-full text-left">
                            <thead>
                              <tr className="border-b border-slate-700">
                                <th className="text-blue-400 py-3 px-4 font-semibold">Modelo</th>
                                <th className="text-blue-400 py-3 px-4 font-semibold">Ganhos</th>
                                <th className="text-blue-400 py-3 px-4 font-semibold">Frequência</th>
                                <th className="text-blue-400 py-3 px-4 font-semibold">Ideal para</th>
                              </tr>
                            </thead>
                            <tbody>
                              <tr className="border-b border-slate-800/50">
                                <td className="text-white py-4 px-4 font-semibold">Revenue Share</td>
                                <td className="text-gray-300 py-4 px-4">Percentual sobre perdas líquidas</td>
                                <td className="text-gray-300 py-4 px-4">Recorrente (mensal)</td>
                                <td className="text-gray-300 py-4 px-4">Influenciadores, redes sociais, tráfego orgânico</td>
                              </tr>
                              <tr>
                                <td className="text-white py-4 px-4 font-semibold">CPA</td>
                                <td className="text-gray-300 py-4 px-4">Valor fixo por jogador</td>
                                <td className="text-gray-300 py-4 px-4">Único (por jogador)</td>
                                <td className="text-gray-300 py-4 px-4">Tráfego pago, grandes portais</td>
                              </tr>
                            </tbody>
                          </table>
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  <Separator className="bg-slate-700/50 my-8" />

                  {/* Importante sobre CPA */}
                  <div className="mb-8">
                    <div className="flex items-center mb-6">
                      <Info className="h-6 w-6 text-yellow-400 mr-3" />
                      <h3 className="text-2xl font-bold text-white">Importante: Sobre o Modelo de Comissão CPA</h3>
                    </div>
                    
                    <div className="bg-yellow-900/20 border border-yellow-500/30 rounded-lg p-6 mb-6">
                      <p className="text-gray-300 mb-4 leading-relaxed">
                        Informamos que todas as comissões iniciais em nosso programa de afiliados são baseadas no modelo <strong className="text-green-400">Revenue Share</strong> — ou seja, você ganha uma porcentagem sobre o lucro líquido que a casa de apostas tem com os jogadores que você indicar.
                      </p>
                      <p className="text-blue-400 italic">
                        (Revenue Share é ideal para quem busca ganhos recorrentes e potencialmente maiores no longo prazo.)
                      </p>
                    </div>

                    <h4 className="text-xl font-bold text-white mb-4">Mas e o CPA? Ele está disponível?</h4>
                    <p className="text-gray-300 mb-6 leading-relaxed">
                      Sim! Algumas casas parceiras disponibilizam o modelo de comissão CPA (Custo por Aquisição), porém, para liberar essa opção, precisamos primeiro mensurar a qualidade dos jogadores que você está trazendo.
                    </p>

                    <Card className="bg-gradient-to-r from-blue-900/30 to-purple-900/30 border-blue-500/30">
                      <CardContent className="p-6">
                        <h5 className="text-blue-400 font-semibold mb-4 flex items-center">
                          <Trophy className="h-5 w-5 mr-2" />
                          Requisitos para desbloquear o CPA:
                        </h5>
                        <div className="space-y-3">
                          <div className="flex items-center text-gray-300">
                            <span className="text-green-400 mr-2">✅</span>
                            <span>Atingir pelo menos <strong className="text-white">50 FTDs em 30 dias</strong></span>
                          </div>
                          <div className="flex items-center text-gray-300">
                            <span className="text-green-400 mr-2">✅</span>
                            <span>Cada FTD deve realizar ao menos <strong className="text-white">1 redépósito</strong> no período</span>
                          </div>
                        </div>
                        <div className="bg-slate-900/50 rounded-lg p-4 mt-4">
                          <p className="text-sm text-gray-400">
                            <strong>FTD</strong> = First Time Deposit (jogadores que se cadastram e realizam o primeiro depósito real)
                          </p>
                        </div>
                      </CardContent>
                    </Card>

                    <div className="mt-6 bg-slate-900/50 rounded-lg p-6">
                      <h5 className="text-blue-400 font-semibold mb-3">Por que isso é importante?</h5>
                      <p className="text-gray-300 leading-relaxed">
                        O modelo CPA exige uma análise de qualidade, pois trata-se de uma comissão fixa por aquisição. Portanto, avaliamos se os jogadores estão realmente ativos, engajados e oferecendo valor à operação.
                      </p>
                    </div>
                  </div>

                  {/* Call to Action */}
                  <div className="text-center">
                    <div className="bg-gradient-to-r from-green-600/20 to-blue-600/20 rounded-xl p-6 border border-green-500/30">
                      <div className="flex items-center justify-center mb-4">
                        <Rocket className="h-6 w-6 text-green-400 mr-2" />
                        <p className="text-green-400 font-semibold text-lg">Pronto para começar a lucrar?</p>
                      </div>
                      <div className="space-y-2 mb-6">
                        <p className="text-gray-300">• Comissão de até 50% Revenue Share</p>
                        <p className="text-gray-300">• CPA competitivo e com qualificação rápida</p>
                        <p className="text-gray-300">• Pagamentos mensais e suporte dedicado</p>
                      </div>
                      <button 
                        onClick={() => window.location.href = "/register"}
                        className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white px-8 py-4 text-lg font-semibold rounded-lg shadow-lg shadow-green-900/30 transition-all transform hover:scale-105"
                      >
                        <Rocket className="mr-2 h-5 w-5 inline" />
                        Cadastre-se e comece a ganhar ainda hoje!
                      </button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="termos" className="mt-8">
              <Card className="bg-slate-800/30 border-slate-700/50 backdrop-blur-sm">
                <CardContent className="p-8">
                  {/* Principais Siglas */}
                  <div className="mb-12">
                    <div className="flex items-center mb-6">
                      <Info className="h-6 w-6 text-blue-400 mr-3" />
                      <h3 className="text-2xl font-bold text-white">Principais Siglas em Casas de Apostas</h3>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                      <Card className="bg-slate-900/50 border-blue-500/20 hover:border-blue-500/40 transition-colors">
                        <CardContent className="p-6">
                          <div className="flex items-center mb-3">
                            <TrendingUp className="h-5 w-5 text-green-400 mr-2" />
                            <h4 className="text-lg font-semibold text-white">GGR (Gross Gaming Revenue)</h4>
                          </div>
                          <p className="text-gray-300 text-sm leading-relaxed">
                            Receita Bruta de Jogo — valor total que os jogadores perdem antes de qualquer desconto.
                          </p>
                        </CardContent>
                      </Card>

                      <Card className="bg-slate-900/50 border-blue-500/20 hover:border-blue-500/40 transition-colors">
                        <CardContent className="p-6">
                          <div className="flex items-center mb-3">
                            <PieChart className="h-5 w-5 text-blue-400 mr-2" />
                            <h4 className="text-lg font-semibold text-white">NGR (Net Gaming Revenue)</h4>
                          </div>
                          <p className="text-gray-300 text-sm leading-relaxed">
                            Receita Líquida de Jogo — valor que sobra para a casa após descontar bônus, taxas e custos operacionais. É a base para cálculo das comissões no modelo Revenue Share.
                          </p>
                        </CardContent>
                      </Card>

                      <Card className="bg-slate-900/50 border-blue-500/20 hover:border-blue-500/40 transition-colors">
                        <CardContent className="p-6">
                          <div className="flex items-center mb-3">
                            <Wallet className="h-5 w-5 text-yellow-400 mr-2" />
                            <h4 className="text-lg font-semibold text-white">FTD (First Time Deposit)</h4>
                          </div>
                          <p className="text-gray-300 text-sm leading-relaxed">
                            Primeiro Depósito — o primeiro depósito real feito pelo jogador após o cadastro.
                          </p>
                        </CardContent>
                      </Card>

                      <Card className="bg-slate-900/50 border-blue-500/20 hover:border-blue-500/40 transition-colors">
                        <CardContent className="p-6">
                          <div className="flex items-center mb-3">
                            <DollarSign className="h-5 w-5 text-green-400 mr-2" />
                            <h4 className="text-lg font-semibold text-white">CPA (Cost Per Acquisition)</h4>
                          </div>
                          <p className="text-gray-300 text-sm leading-relaxed">
                            Custo por Aquisição — comissão fixa paga ao afiliado por cada novo jogador que se cadastra e realiza o depósito.
                          </p>
                        </CardContent>
                      </Card>

                      <Card className="bg-slate-900/50 border-blue-500/20 hover:border-blue-500/40 transition-colors">
                        <CardContent className="p-6">
                          <div className="flex items-center mb-3">
                            <BarChart3 className="h-5 w-5 text-purple-400 mr-2" />
                            <h4 className="text-lg font-semibold text-white">Revenue Share</h4>
                          </div>
                          <p className="text-gray-300 text-sm leading-relaxed">
                            Modelo de comissão onde o afiliado recebe uma porcentagem do lucro líquido gerado pelos jogadores indicados.
                          </p>
                        </CardContent>
                      </Card>

                      <Card className="bg-slate-900/50 border-blue-500/20 hover:border-blue-500/40 transition-colors">
                        <CardContent className="p-6">
                          <div className="flex items-center mb-3">
                            <TrendingUp className="h-5 w-5 text-emerald-400 mr-2" />
                            <h4 className="text-lg font-semibold text-white">ROI (Return on Investment)</h4>
                          </div>
                          <p className="text-gray-300 text-sm leading-relaxed">
                            Retorno sobre Investimento — mede o lucro obtido em relação ao valor investido.
                          </p>
                        </CardContent>
                      </Card>
                    </div>
                  </div>

                  <Separator className="bg-slate-700/50 my-8" />

                  {/* Explicação Simples GGR e NGR */}
                  <div className="mb-12">
                    <div className="flex items-center mb-6">
                      <Calculator className="h-6 w-6 text-green-400 mr-3" />
                      <h3 className="text-2xl font-bold text-white">Entenda de Forma Simples: O que é GGR e NGR?</h3>
                    </div>
                    
                    <p className="text-gray-300 mb-8 text-lg leading-relaxed">
                      Se você quer ganhar dinheiro como afiliado em uma casa de apostas, é importante conhecer dois termos muito usados: GGR e NGR. Mas calma! A explicação é simples:
                    </p>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                      {/* GGR Card */}
                      <Card className="bg-gradient-to-br from-green-900/30 to-green-800/20 border-green-500/30">
                        <CardContent className="p-8">
                          <div className="flex items-center mb-4">
                            <div className="p-3 bg-green-500/20 rounded-full mr-4">
                              <Coins className="h-8 w-8 text-green-400" />
                            </div>
                            <h4 className="text-2xl font-bold text-white">GGR (Gross Gaming Revenue)</h4>
                          </div>
                          <p className="text-gray-300 mb-6 leading-relaxed">
                            GGR é a Receita Bruta de Jogo — ou seja, quanto os jogadores perderam no total, antes de qualquer desconto.
                          </p>
                          
                          <div className="bg-slate-900/50 rounded-lg p-4 mb-4">
                            <h5 className="text-green-400 font-semibold mb-2">📌 Exemplo prático:</h5>
                            <ul className="text-gray-300 space-y-1 text-sm">
                              <li>• Um jogador apostou R$ 500</li>
                              <li>• Ganhou de volta R$ 100</li>
                              <li>• Perdeu R$ 400</li>
                            </ul>
                          </div>
                          
                          <div className="bg-green-900/30 rounded-lg p-4">
                            <p className="text-green-400 font-semibold">✅ Nesse caso:</p>
                            <p className="text-white text-lg font-bold">👉 GGR = R$ 400</p>
                          </div>
                        </CardContent>
                      </Card>

                      {/* NGR Card */}
                      <Card className="bg-gradient-to-br from-blue-900/30 to-blue-800/20 border-blue-500/30">
                        <CardContent className="p-8">
                          <div className="flex items-center mb-4">
                            <div className="p-3 bg-blue-500/20 rounded-full mr-4">
                              <PieChart className="h-8 w-8 text-blue-400" />
                            </div>
                            <h4 className="text-2xl font-bold text-white">NGR (Net Gaming Revenue)</h4>
                          </div>
                          <p className="text-gray-300 mb-6 leading-relaxed">
                            NGR é a Receita Líquida de Jogo — o valor que realmente fica com a casa de apostas, depois de descontar:
                          </p>
                          
                          <div className="space-y-3 mb-6">
                            <div className="flex items-center text-gray-300">
                              <span className="text-yellow-400 mr-2">🎁</span>
                              <span>Bônus dados aos jogadores</span>
                            </div>
                            <div className="flex items-center text-gray-300">
                              <span className="text-blue-400 mr-2">💳</span>
                              <span>Taxas de pagamento</span>
                            </div>
                            <div className="flex items-center text-gray-300">
                              <span className="text-purple-400 mr-2">🏢</span>
                              <span>Custos operacionais (normalmente entre 15% e 20%)</span>
                            </div>
                          </div>
                          
                          <div className="bg-slate-900/50 rounded-lg p-4 mb-4">
                            <h5 className="text-blue-400 font-semibold mb-2">📌 Exemplo com base no GGR acima:</h5>
                            <ul className="text-gray-300 space-y-1 text-sm">
                              <li>• GGR = R$ 400</li>
                              <li>• Custos e descontos totais: R$ 80</li>
                            </ul>
                          </div>
                          
                          <div className="bg-blue-900/30 rounded-lg p-4">
                            <p className="text-blue-400 font-semibold">✅ NGR = R$ 320</p>
                            <p className="text-yellow-400 text-sm mt-2">👉 É sobre o NGR que sua comissão é calculada no modelo Revenue Share!</p>
                          </div>
                        </CardContent>
                      </Card>
                    </div>

                    {/* Tabela Resumo */}
                    <Card className="bg-slate-900/50 border-slate-700/50">
                      <CardHeader>
                        <CardTitle className="text-white flex items-center">
                          <BarChart3 className="h-5 w-5 text-blue-400 mr-2" />
                          🔁 Resumo Rápido
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="overflow-x-auto">
                          <table className="w-full text-left">
                            <thead>
                              <tr className="border-b border-slate-700">
                                <th className="text-blue-400 py-3 px-4 font-semibold">Termo</th>
                                <th className="text-blue-400 py-3 px-4 font-semibold">Significado</th>
                                <th className="text-blue-400 py-3 px-4 font-semibold">O que representa</th>
                                <th className="text-blue-400 py-3 px-4 font-semibold">Exemplo prático</th>
                              </tr>
                            </thead>
                            <tbody>
                              <tr className="border-b border-slate-800/50">
                                <td className="text-white py-4 px-4 font-semibold">GGR</td>
                                <td className="text-gray-300 py-4 px-4">Receita Bruta de Jogo</td>
                                <td className="text-gray-300 py-4 px-4">Total perdido pelos jogadores (sem descontos)</td>
                                <td className="text-green-400 py-4 px-4 font-semibold">R$ 400</td>
                              </tr>
                              <tr>
                                <td className="text-white py-4 px-4 font-semibold">NGR</td>
                                <td className="text-gray-300 py-4 px-4">Receita Líquida de Jogo</td>
                                <td className="text-gray-300 py-4 px-4">GGR – custos da casa (bônus, taxas, etc.)</td>
                                <td className="text-blue-400 py-4 px-4 font-semibold">R$ 320</td>
                              </tr>
                            </tbody>
                          </table>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="direitos" className="mt-8">
              <Card className="bg-slate-800/30 border-slate-700/50 backdrop-blur-sm">
                <CardContent className="p-8">
                  <div className="flex items-center mb-8">
                    <BookOpen className="h-6 w-6 text-blue-400 mr-3" />
                    <h3 className="text-2xl font-bold text-white">Direitos e Deveres do Afiliado</h3>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* O que você NÃO pode fazer */}
                    <Card className="bg-gradient-to-br from-red-900/30 to-orange-800/20 border-red-500/30">
                      <CardContent className="p-8">
                        <div className="flex items-center mb-6">
                          <div className="p-3 bg-red-500/20 rounded-full mr-4">
                            <span className="text-2xl">❌</span>
                          </div>
                          <h4 className="text-2xl font-bold text-white">O QUE VOCÊ NÃO PODE FAZER COMO AFILIADO:</h4>
                        </div>

                        <div className="space-y-6">
                          <div className="bg-slate-900/50 rounded-lg p-4 border-l-4 border-red-500">
                            <div className="flex items-center mb-2">
                              <span className="text-red-400 mr-2">🚫</span>
                              <h5 className="text-red-400 font-semibold">Não prometa ganhos!</h5>
                            </div>
                            <p className="text-gray-300 text-sm">
                              Nunca garanta qualquer tipo de lucro ao usuário.
                            </p>
                          </div>

                          <div className="bg-slate-900/50 rounded-lg p-4 border-l-4 border-red-500">
                            <div className="flex items-center mb-2">
                              <span className="text-red-400 mr-2">🚫</span>
                              <h5 className="text-red-400 font-semibold">Fake news, nem pensar!</h5>
                            </div>
                            <p className="text-gray-300 text-sm">
                              É proibido divulgar informações falsas sobre bônus, campanhas ou vitórias.
                            </p>
                          </div>

                          <div className="bg-slate-900/50 rounded-lg p-4 border-l-4 border-red-500">
                            <div className="flex items-center mb-2">
                              <span className="text-red-400 mr-2">🚫</span>
                              <h5 className="text-red-400 font-semibold">Nada de ofensas ou preconceitos!</h5>
                            </div>
                            <p className="text-gray-300 text-sm">
                              Qualquer discurso ofensivo ou preconceituoso é terminantemente proibido.
                            </p>
                          </div>

                          <div className="bg-slate-900/50 rounded-lg p-4 border-l-4 border-red-500">
                            <div className="flex items-center mb-2">
                              <span className="text-red-400 mr-2">🚫</span>
                              <h5 className="text-red-400 font-semibold">Sem política!</h5>
                            </div>
                            <p className="text-gray-300 text-sm">
                              É proibido associar o AfiliadosBet a qualquer posicionamento político.
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    {/* O que você PODE fazer */}
                    <Card className="bg-gradient-to-br from-green-900/30 to-emerald-800/20 border-green-500/30">
                      <CardContent className="p-8">
                        <div className="flex items-center mb-6">
                          <div className="p-3 bg-green-500/20 rounded-full mr-4">
                            <span className="text-2xl">✅</span>
                          </div>
                          <h4 className="text-2xl font-bold text-white">O QUE VOCÊ PODE FAZER COMO AFILIADO:</h4>
                        </div>

                        <div className="space-y-6">
                          <div className="bg-slate-900/50 rounded-lg p-4 border-l-4 border-green-500">
                            <div className="flex items-center mb-2">
                              <span className="text-green-400 mr-2">🔗</span>
                              <h5 className="text-green-400 font-semibold">Use seu link exclusivo</h5>
                            </div>
                            <p className="text-gray-300 text-sm">
                              Divulgue seu link próprio para atrair novos usuários.
                            </p>
                          </div>

                          <div className="bg-slate-900/50 rounded-lg p-4 border-l-4 border-green-500">
                            <div className="flex items-center mb-2">
                              <span className="text-green-400 mr-2">📲</span>
                              <h5 className="text-green-400 font-semibold">Aproveite suas redes sociais</h5>
                            </div>
                            <p className="text-gray-300 text-sm">
                              Compartilhe ações, promoções e torneios da casa.
                            </p>
                          </div>

                          <div className="bg-slate-900/50 rounded-lg p-4 border-l-4 border-green-500">
                            <div className="flex items-center mb-2">
                              <span className="text-green-400 mr-2">🕹️</span>
                              <h5 className="text-green-400 font-semibold">Promova os jogos!</h5>
                            </div>
                            <p className="text-gray-300 text-sm">
                              Foque em jogos populares e/ou exclusivos da plataforma.
                            </p>
                          </div>

                          <div className="bg-slate-900/50 rounded-lg p-4 border-l-4 border-green-500">
                            <div className="flex items-center mb-2">
                              <span className="text-green-400 mr-2">💬</span>
                              <h5 className="text-green-400 font-semibold">Conte sua experiência real</h5>
                            </div>
                            <p className="text-gray-300 text-sm">
                              Mostre seus ganhos (sem prometer) e fale sobre sua vivência com a casa.
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Importante */}
                  <div className="mt-8">
                    <Card className="bg-gradient-to-r from-blue-900/30 to-purple-900/30 border-blue-500/30">
                      <CardContent className="p-6">
                        <div className="flex items-center mb-4">
                          <Info className="h-6 w-6 text-blue-400 mr-3" />
                          <h4 className="text-xl font-bold text-white">Importante Lembrar</h4>
                        </div>
                        <div className="space-y-3 text-gray-300">
                          <p>• Sempre seja transparente e honesto em suas divulgações</p>
                          <p>• Respeite os termos de uso de cada plataforma onde divulga</p>
                          <p>• Mantenha-se atualizado sobre as regras e políticas do programa</p>
                          <p>• Em caso de dúvidas, entre em contato com nosso suporte</p>
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Call to Action */}
                  <div className="mt-8 text-center">
                    <div className="bg-gradient-to-r from-green-600/20 to-blue-600/20 rounded-xl p-6 border border-green-500/30">
                      <div className="flex items-center justify-center mb-4">
                        <Trophy className="h-6 w-6 text-green-400 mr-2" />
                        <p className="text-green-400 font-semibold text-lg">Pronto para ser um afiliado responsável?</p>
                      </div>
                      <p className="text-gray-300 mb-6">
                        Seguindo estas diretrizes, você terá uma jornada de sucesso e ganhos consistentes!
                      </p>
                      <button 
                        onClick={() => window.location.href = "/register"}
                        className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white px-8 py-4 text-lg font-semibold rounded-lg shadow-lg shadow-green-900/30 transition-all transform hover:scale-105"
                      >
                        <Rocket className="mr-2 h-5 w-5 inline" />
                        Começar como Afiliado Agora
                      </button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {/* Depoimentos */}
      <div className="relative z-10 bg-slate-800/30 backdrop-blur-sm py-20">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
              Histórias de Sucesso Reais
            </h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Veja como nossos afiliados transformaram suas vidas financeiras
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-green-800/30 hover:scale-105 transition-all">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-500 rounded-full flex items-center justify-center text-white font-bold mr-4">CS</div>
                <div>
                  <h4 className="text-white font-semibold">Carlos Silva</h4>
                  <p className="text-gray-400 text-sm">Marketing Digital</p>
                </div>
              </div>
              <p className="text-gray-300 mb-4 italic">"Em 6 meses saí de R$ 0 para R$ 12.340 mensais. O suporte é excepcional e nunca tive problemas com pagamentos."</p>
              <div className="text-green-400 font-bold">R$ 12.340/mês</div>
            </div>
            
            <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-blue-800/30 hover:scale-105 transition-all">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-full flex items-center justify-center text-white font-bold mr-4">AC</div>
                <div>
                  <h4 className="text-white font-semibold">Ana Costa</h4>
                  <p className="text-gray-400 text-sm">Influencer</p>
                </div>
              </div>
              <p className="text-gray-300 mb-4 italic">"Consegui monetizar meu Instagram de forma consistente. Interface intuitiva e relatórios detalhados que facilitam muito o trabalho."</p>
              <div className="text-blue-400 font-bold">R$ 8.750/mês</div>
            </div>
            
            <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-emerald-800/30 hover:scale-105 transition-all">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-green-500 rounded-full flex items-center justify-center text-white font-bold mr-4">RS</div>
                <div>
                  <h4 className="text-white font-semibold">Rafael Santos</h4>
                  <p className="text-gray-400 text-sm">Youtuber</p>
                </div>
              </div>
              <p className="text-gray-300 mb-4 italic">"Sistema transparente e confiável. Hoje tenho uma renda passiva que cresce todo mês sem precisar me preocupar."</p>
              <div className="text-emerald-400 font-bold">R$ 15.200/mês</div>
            </div>
          </div>
        </div>
      </div>
      {/* Vantagens Exclusivas */}
      <div className="relative z-10 py-20">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
              Vantagens Exclusivas para Afiliados
            </h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Benefícios que fazem a diferença na sua renda mensal
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-6">
              <div className="flex items-start space-x-4 group hover:scale-105 transition-transform">
                <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                  <span className="text-white text-xl">✓</span>
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-white mb-2">Sem Investimento Inicial</h3>
                  <p className="text-gray-300">Comece a ganhar sem investir um centavo. 100% gratuito para sempre, sem taxas ocultas.</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-4 group hover:scale-105 transition-transform">
                <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                  <span className="text-white text-xl">✓</span>
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-white mb-2">Comissões Vitalícias</h3>
                  <p className="text-gray-300">Ganhe comissão para sempre de cada cliente que trouxer, sem prazo de validade.</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-4 group hover:scale-105 transition-transform">
                <div className="w-8 h-8 bg-emerald-500 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                  <span className="text-white text-xl">✓</span>
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-white mb-2">Saques Rápidos</h3>
                  <p className="text-gray-300">Receba seus ganhos em até 24h via PIX, TED ou carteira digital. Valor mínimo: R$ 50.</p>
                </div>
              </div>
            </div>
            
            <div className="space-y-6">
              <div className="flex items-start space-x-4 group hover:scale-105 transition-transform">
                <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                  <span className="text-white text-xl">✓</span>
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-white mb-2">Múltiplas Casas de Apostas</h3>
                  <p className="text-gray-300">Promova as melhores casas do mercado e diversifique sua fonte de renda.</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-4 group hover:scale-105 transition-transform">
                <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                  <span className="text-white text-xl">✓</span>
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-white mb-2">Sistema Automatizado</h3>
                  <p className="text-gray-300">Tudo funciona automaticamente: rastreamento, cálculo de comissões e relatórios.</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-4 group hover:scale-105 transition-transform">
                <div className="w-8 h-8 bg-emerald-500 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                  <span className="text-white text-xl">✓</span>
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-white mb-2">Suporte 24/7</h3>
                  <p className="text-gray-300">Equipe especializada disponível 24 horas por dia para maximizar seus resultados.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* FAQ */}
      <div className="relative z-10 bg-slate-800/30 backdrop-blur-sm py-20">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
              Perguntas Frequentes
            </h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Tire suas dúvidas sobre como funciona o sistema
            </p>
          </div>
          
          <div className="max-w-4xl mx-auto space-y-4">
            <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl border border-blue-800/30">
              <div className="p-6">
                <h3 className="text-xl font-semibold text-white mb-3">Como faço para me cadastrar como afiliado?</h3>
                <p className="text-gray-300">O cadastro é 100% gratuito e simples. Clique em 'Cadastrar Grátis', preencha seus dados básicos e em poucos minutos você estará pronto para começar a ganhar dinheiro como afiliado.</p>
              </div>
            </div>
            
            <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl border border-green-800/30">
              <div className="p-6">
                <h3 className="text-xl font-semibold text-white mb-3">Quanto posso ganhar como afiliado?</h3>
                <p className="text-gray-300">Não há limite de ganhos. Nossos afiliados ganham desde R$ 500 até mais de R$ 20.000 por mês, dependendo do volume de tráfego e qualidade dos indicados. A média dos nossos top afiliados é de R$ 8.000-15.000 mensais.</p>
              </div>
            </div>
            
            <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl border border-emerald-800/30">
              <div className="p-6">
                <h3 className="text-xl font-semibold text-white mb-3">Como e quando recebo meus pagamentos?</h3>
                <p className="text-gray-300">Os pagamentos são realizados semanalmente via PIX, TED ou carteira digital. O valor mínimo para saque é de apenas R$ 50. Temos histórico de 100% de pagamentos em dia.</p>
              </div>
            </div>
            
            <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl border border-blue-800/30">
              <div className="p-6">
                <h3 className="text-xl font-semibold text-white mb-3">Preciso ter experiência para ser afiliado?</h3>
                <p className="text-gray-300">Não! O sistema é muito intuitivo e oferecemos suporte completo. Muitos dos nossos afiliados de sucesso começaram sem nenhuma experiência anterior em marketing digital.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* Urgência e Escassez */}
      <div className="relative z-10 bg-gradient-to-r from-red-900/30 to-orange-900/30 py-16">
        <div className="container mx-auto px-6 text-center">
          <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl p-8 border border-red-500/30 max-w-4xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              ⚠️ Oportunidade Limitada
            </h2>
            <p className="text-xl text-gray-300 mb-6">
              Devido ao alto volume de cadastros, estamos limitando as novas inscrições para garantir a qualidade do suporte. 
              <span className="text-red-400 font-bold"> Apenas 47 vagas restantes esta semana.</span>
            </p>
            <div className="bg-slate-700 rounded-full h-4 mb-6">
              <div className="bg-gradient-to-r from-red-500 to-orange-500 h-4 rounded-full" style={{ width: '83%' }}></div>
            </div>
            <button 
              onClick={() => window.location.href = "/register"}
              className="bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700 text-white px-10 py-4 text-xl font-bold rounded-xl shadow-2xl shadow-red-900/50 transition-all transform hover:scale-105 animate-pulse"
            >
              🔥 Garantir Minha Vaga Agora
            </button>
          </div>
        </div>
      </div>
      {/* CTA Final */}
      <div className="relative z-10 bg-gradient-to-r from-green-900/50 to-blue-900/50 py-20">
        <div className="container mx-auto px-6 text-center">
          <h2 className="text-4xl md:text-6xl font-bold text-white mb-8">
            Pronto Para Transformar Sua Vida Financeira?
          </h2>
          <p className="text-xl text-gray-300 mb-10 max-w-2xl mx-auto">
            Junte-se a mais de 2.800 afiliados que já estão lucrando todos os dias. Cadastro gratuito em menos de 2 minutos.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-8">
            <button 
              onClick={() => window.location.href = "/register"}
              className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white px-12 py-6 text-2xl font-bold rounded-xl shadow-2xl shadow-green-900/50 transition-all transform hover:scale-110 animate-pulse"
            >
              🚀 Começar Agora Grátis
            </button>
            <button 
              onClick={() => window.location.href = "/login"}
              className="border-2 border-white text-white hover:bg-white hover:text-gray-900 px-12 py-6 text-xl font-semibold rounded-xl transition-all transform hover:scale-105"
            >
              👤 Já Tenho Conta
            </button>
          </div>
          <div className="flex flex-wrap justify-center items-center gap-6 text-gray-300">
            <div className="flex items-center space-x-2">
              <span className="text-green-400">✓</span>
              <span>Cadastro Gratuito</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-blue-400">✓</span>
              <span>Sem Mensalidades</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-emerald-400">✓</span>
              <span>Suporte 24h</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-green-400">✓</span>
              <span>Pagamentos Garantidos</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}