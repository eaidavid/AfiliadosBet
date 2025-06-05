import { useState, useEffect, useRef } from "react";
import { useLocation } from "wouter";
import { motion, useInView } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  TrendingUp, 
  Users, 
  DollarSign, 
  BarChart3, 
  Zap, 
  Shield, 
  Target, 
  Rocket,
  CheckCircle,
  Star,
  ArrowRight,
  PlayCircle,
  ChevronDown,
  Trophy,
  Clock,
  Globe,
  Smartphone,
  CreditCard,
  HeadphonesIcon,
  Award,
  Play,
  Timer,
  UserCheck,
  Calendar,
  TrendingDown,
  MessageSquare,
  Lock,
  Wallet,
  BookOpen,
  FileText,
  Info,
  Calculator,
  PieChart,
  TrendingUpIcon,
  Coins
} from "lucide-react";
import logoPath from "@assets/Afiliados Bet positivo.png";

interface AnimatedCounterProps {
  end: number;
  duration?: number;
  prefix?: string;
  suffix?: string;
}

const AnimatedCounter = ({ end, duration = 2000, prefix = "", suffix = "" }: AnimatedCounterProps) => {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true });

  useEffect(() => {
    if (inView) {
      const startTime = Date.now();
      const animate = () => {
        const now = Date.now();
        const progress = Math.min((now - startTime) / duration, 1);
        setCount(Math.floor(progress * end));
        if (progress < 1) {
          requestAnimationFrame(animate);
        }
      };
      requestAnimationFrame(animate);
    }
  }, [inView, end, duration]);

  return <span ref={ref}>{prefix}{count.toLocaleString()}{suffix}</span>;
};

interface TestimonialProps {
  name: string;
  role: string;
  content: string;
  rating: number;
  earnings?: string;
}

const TestimonialCard = ({ name, role, content, rating, earnings }: TestimonialProps) => (
  <motion.div
    initial={{ opacity: 0, y: 50 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.6 }}
  >
    <Card className="bg-white/10 dark:bg-gray-800/50 border-white/20 dark:border-gray-700 backdrop-blur-sm hover:bg-white/20 dark:hover:bg-gray-800/70 transition-all">
      <CardContent className="p-6">
        <div className="flex mb-4">
          {[...Array(rating)].map((_, i) => (
            <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
          ))}
        </div>
        <p className="text-gray-700 dark:text-gray-300 mb-4 italic">"{content}"</p>
        <div className="flex justify-between items-end">
          <div>
            <p className="text-gray-900 dark:text-white font-semibold">{name}</p>
            <p className="text-gray-600 dark:text-gray-400 text-sm">{role}</p>
          </div>
          {earnings && (
            <Badge variant="secondary" className="bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200">
              {earnings}
            </Badge>
          )}
        </div>
      </CardContent>
    </Card>
  </motion.div>
);

interface FeatureCardProps {
  icon: any;
  title: string;
  description: string;
  delay?: number;
}

const FeatureCard = ({ icon: Icon, title, description, delay = 0 }: FeatureCardProps) => (
  <motion.div
    initial={{ opacity: 0, y: 50 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.6, delay }}
    whileHover={{ scale: 1.05 }}
    className="group"
  >
    <Card className="h-full bg-white/10 dark:bg-gray-800/50 border-white/20 dark:border-gray-700 backdrop-blur-sm hover:bg-white/20 dark:hover:bg-gray-800/70 transition-all duration-300">
      <CardHeader className="text-center">
        <div className="mx-auto mb-4 p-3 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 w-fit group-hover:scale-110 transition-transform">
          <Icon className="h-6 w-6 text-white" />
        </div>
        <CardTitle className="text-gray-900 dark:text-white">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-gray-600 dark:text-gray-300 text-center">{description}</p>
      </CardContent>
    </Card>
  </motion.div>
);

const FAQItem = ({ question, answer }: { question: string; answer: string }) => {
  const [isOpen, setIsOpen] = useState(false);
  
  return (
    <Card className="bg-white/10 dark:bg-gray-800/50 border-white/20 dark:border-gray-700 backdrop-blur-sm">
      <CardHeader 
        className="cursor-pointer hover:bg-white/5 dark:hover:bg-gray-800/30 transition-colors"
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="flex justify-between items-center">
          <CardTitle className="text-lg text-gray-900 dark:text-white">{question}</CardTitle>
          <ChevronDown className={`h-5 w-5 text-gray-600 dark:text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
        </div>
      </CardHeader>
      {isOpen && (
        <CardContent className="pt-0">
          <p className="text-gray-600 dark:text-gray-300">{answer}</p>
        </CardContent>
      )}
    </Card>
  );
};

export default function LandingPage() {
  const [, setLocation] = useLocation();

  useEffect(() => {
    // SEO Meta Tags
    document.title = "AfiliadosBet - Sistema de Afiliados para Casas de Apostas | Ganhe Comissões";
    
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute('content', 'Transforme seu tráfego em renda com o melhor sistema de afiliados para casas de apostas do Brasil. Comissões altas, pagamentos garantidos e suporte 24h. Cadastre-se grátis!');
    }

    // Open Graph tags
    const ogTags = [
      { property: 'og:title', content: 'AfiliadosBet - Sistema de Afiliados para Casas de Apostas' },
      { property: 'og:description', content: 'Ganhe até R$ 15.000+ por mês como afiliado de casas de apostas. Sistema completo com links personalizados, analytics em tempo real e pagamentos garantidos.' },
      { property: 'og:type', content: 'website' },
      { property: 'og:url', content: window.location.href },
      { name: 'twitter:card', content: 'summary_large_image' },
      { name: 'twitter:title', content: 'AfiliadosBet - Sistema de Afiliados para Casas de Apostas' },
      { name: 'twitter:description', content: 'Transforme seu tráfego em renda com comissões de até 45% em casas de apostas.' }
    ];

    ogTags.forEach(tag => {
      let meta = document.querySelector(`meta[${tag.property ? 'property' : 'name'}="${tag.property || tag.name}"]`);
      if (!meta) {
        meta = document.createElement('meta');
        if (tag.property) {
          meta.setAttribute('property', tag.property);
        } else {
          meta.setAttribute('name', tag.name || '');
        }
        document.head.appendChild(meta);
      }
      meta.setAttribute('content', tag.content);
    });

    // Structured Data
    const structuredData = {
      "@context": "https://schema.org",
      "@type": "WebSite",
      "name": "AfiliadosBet",
      "description": "Sistema de afiliados para casas de apostas esportivas",
      "url": window.location.href,
      "potentialAction": {
        "@type": "SearchAction",
        "target": `${window.location.href}?q={search_term_string}`,
        "query-input": "required name=search_term_string"
      }
    };

    let script = document.querySelector('script[type="application/ld+json"]') as HTMLScriptElement;
    if (!script) {
      script = document.createElement('script') as HTMLScriptElement;
      script.type = 'application/ld+json';
      document.head.appendChild(script);
    }
    script.textContent = JSON.stringify(structuredData);

  }, []);

  return (
    <>
      <div className="dark min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-indigo-900">
        {/* Navigation */}
        <nav className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-700 sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              {/* Logo Section - Responsivo */}
              <div className="flex items-center space-x-2 sm:space-x-3 flex-shrink-0">
                <img src={logoPath} alt="AfiliadosBet - Sistema de Afiliados" className="h-6 w-6 sm:h-8 sm:w-8" />
                <span className="text-base sm:text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent truncate">
                  AfiliadosBet
                </span>
              </div>

              {/* Menu Desktop */}
              <div className="hidden lg:flex items-center space-x-6">
                <a href="#recursos" className="text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                  Recursos
                </a>
                <a href="#vantagens" className="text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                  Vantagens
                </a>
                <a href="#depoimentos" className="text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                  Depoimentos
                </a>
                <a href="#faq" className="text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                  FAQ
                </a>
              </div>

              {/* Botões - Mobile e Desktop */}
              <div className="flex items-center space-x-2 sm:space-x-4 flex-shrink-0">
                {/* Botão Entrar - Sempre visível mas responsivo */}
                <Button 
                  variant="ghost" 
                  onClick={() => setLocation("/login")} 
                  className="text-white hover:text-gray-900 hover:bg-white text-xs sm:text-sm px-2 sm:px-4 py-1 sm:py-2 h-8 sm:h-10"
                >
                  Entrar
                </Button>
                
                {/* Botão Cadastrar - Responsivo */}
                <Button 
                  onClick={() => setLocation("/register")} 
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-xs sm:text-sm px-2 sm:px-4 py-1 sm:py-2 h-8 sm:h-10 whitespace-nowrap"
                >
                  <span className="hidden sm:inline">Cadastrar Grátis</span>
                  <span className="sm:hidden">Cadastrar</span>
                </Button>
              </div>
            </div>
          </div>
        </nav>

        {/* Hero Section */}
        <section className="relative py-20 lg:py-32 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-600/10 to-purple-600/10"></div>
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
              >
                <Badge className="mb-6 bg-gradient-to-r from-blue-100 to-purple-100 dark:from-blue-900/30 dark:to-purple-900/30 text-blue-800 dark:text-blue-200 border-blue-200 dark:border-blue-700">
                  🚀 #1 Sistema de Afiliados de Apostas do Brasil
                </Badge>
                <h1 className="text-4xl sm:text-5xl lg:text-7xl font-bold text-gray-900 dark:text-white mb-6">
                  Transforme Seu{" "}
                  <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                    Tráfego em Dinheiro
                  </span>
                </h1>
                <p className="text-xl sm:text-2xl text-gray-600 dark:text-gray-300 mb-8 max-w-4xl mx-auto leading-relaxed">
                  Ganhe até <strong className="text-green-600">R$ 15.000+ por mês</strong> como afiliado das melhores casas de apostas do mercado. 
                  Sistema completo com comissões de até <strong>45%</strong> e pagamentos garantidos.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
                  <Button 
                    size="lg" 
                    onClick={() => setLocation("/register")}
                    className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white px-8 py-4 text-lg font-semibold shadow-xl"
                  >
                    <Rocket className="mr-2 h-5 w-5" />
                    Começar Agora Grátis
                  </Button>
                  <Button 
                    variant="outline" 
                    size="lg"
                    className="border-2 border-white text-white hover:bg-white hover:text-gray-900 px-8 py-4 text-lg"
                    onClick={() => document.getElementById('como-funciona')?.scrollIntoView({ behavior: 'smooth' })}
                  >
                    <Play className="mr-2 h-5 w-5" />
                    Como Funciona
                  </Button>
                </div>
              </motion.div>

              {/* Trust Indicators */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
                className="grid grid-cols-2 lg:grid-cols-4 gap-8 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm rounded-2xl p-8 border border-white/20 dark:border-gray-700"
              >
                <div className="text-center">
                  <div className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-2">
                    R$ <AnimatedCounter end={15000} suffix="+" />
                  </div>
                  <p className="text-gray-600 dark:text-gray-300 text-sm">Ganho Médio Mensal</p>
                </div>
                <div className="text-center">
                  <div className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-2">
                    <AnimatedCounter end={2847} suffix="+" />
                  </div>
                  <p className="text-gray-600 dark:text-gray-300 text-sm">Afiliados Ativos</p>
                </div>
                <div className="text-center">
                  <div className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-2">
                    <AnimatedCounter end={45} suffix="%" />
                  </div>
                  <p className="text-gray-600 dark:text-gray-300 text-sm">Comissão Máxima</p>
                </div>
                <div className="text-center">
                  <div className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-2">
                    <AnimatedCounter end={24} suffix="h" />
                  </div>
                  <p className="text-gray-600 dark:text-gray-300 text-sm">Suporte Disponível</p>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Seção de Abas Informativas */}
        <section id="informacoes" className="py-20 bg-white/10 dark:bg-gray-900/40 backdrop-blur-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-4">
                Informações Importantes
              </h2>
              <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
                Tudo que você precisa saber para começar a ganhar dinheiro como afiliado
              </p>
            </div>
            
            <Tabs defaultValue="comissao" className="w-full">
              <TabsList className="grid w-full grid-cols-1 md:grid-cols-3 bg-gray-800/50 dark:bg-gray-900/50 rounded-xl p-1 mb-8">
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
                <Card className="bg-gray-800/30 dark:bg-gray-900/50 border-gray-700/50 backdrop-blur-sm">
                  <CardContent className="p-8">
                    {/* Principais Siglas */}
                    <div className="mb-12">
                      <div className="flex items-center mb-6">
                        <Info className="h-6 w-6 text-blue-400 mr-3" />
                        <h3 className="text-2xl font-bold text-white">Principais Siglas em Casas de Apostas</h3>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                        <Card className="bg-gray-900/50 border-blue-500/20 hover:border-blue-500/40 transition-colors">
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

                        <Card className="bg-gray-900/50 border-blue-500/20 hover:border-blue-500/40 transition-colors">
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

                        <Card className="bg-gray-900/50 border-blue-500/20 hover:border-blue-500/40 transition-colors">
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

                        <Card className="bg-gray-900/50 border-blue-500/20 hover:border-blue-500/40 transition-colors">
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

                        <Card className="bg-gray-900/50 border-blue-500/20 hover:border-blue-500/40 transition-colors">
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

                        <Card className="bg-gray-900/50 border-blue-500/20 hover:border-blue-500/40 transition-colors">
                          <CardContent className="p-6">
                            <div className="flex items-center mb-3">
                              <TrendingUpIcon className="h-5 w-5 text-emerald-400 mr-2" />
                              <h4 className="text-lg font-semibold text-white">ROI (Return on Investment)</h4>
                            </div>
                            <p className="text-gray-300 text-sm leading-relaxed">
                              Retorno sobre Investimento — mede o lucro obtido em relação ao valor investido.
                            </p>
                          </CardContent>
                        </Card>
                      </div>
                    </div>

                    <Separator className="bg-gray-700/50 my-8" />

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
                            
                            <div className="bg-gray-900/50 rounded-lg p-4 mb-4">
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
                            
                            <div className="bg-gray-900/50 rounded-lg p-4 mb-4">
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
                      <Card className="bg-gray-900/50 border-gray-700/50">
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
                                <tr className="border-b border-gray-700">
                                  <th className="text-blue-400 py-3 px-4 font-semibold">Termo</th>
                                  <th className="text-blue-400 py-3 px-4 font-semibold">Significado</th>
                                  <th className="text-blue-400 py-3 px-4 font-semibold">O que representa</th>
                                  <th className="text-blue-400 py-3 px-4 font-semibold">Exemplo prático</th>
                                </tr>
                              </thead>
                              <tbody>
                                <tr className="border-b border-gray-800/50">
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

                      {/* Call to Action */}
                      <div className="mt-8 text-center">
                        <div className="bg-gradient-to-r from-blue-600/20 to-purple-600/20 rounded-xl p-6 border border-blue-500/30">
                          <div className="flex items-center justify-center mb-4">
                            <Trophy className="h-6 w-6 text-yellow-400 mr-2" />
                            <p className="text-yellow-400 font-semibold text-lg">💡 Dica de afiliado:</p>
                          </div>
                          <p className="text-gray-300 mb-6 text-lg">
                            Entender a diferença entre GGR e NGR é essencial para calcular seus ganhos e escolher as melhores oportunidades!
                          </p>
                          <Button 
                            size="lg" 
                            onClick={() => setLocation("/register")}
                            className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white px-8 py-4 text-lg font-semibold"
                          >
                            <Rocket className="mr-2 h-5 w-5" />
                            📲 Junte-se agora ao nosso programa de afiliados
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="termos" className="mt-8">
                <Card className="bg-gray-800/30 dark:bg-gray-900/50 border-gray-700/50 backdrop-blur-sm">
                  <CardContent className="p-8">
                    <div className="text-center py-16">
                      <FileText className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-2xl font-bold text-white mb-4">Termos Técnicos</h3>
                      <p className="text-gray-400 text-lg">
                        Conteúdo em desenvolvimento. Em breve você terá acesso a todos os termos técnicos importantes.
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="direitos" className="mt-8">
                <Card className="bg-gray-800/30 dark:bg-gray-900/50 border-gray-700/50 backdrop-blur-sm">
                  <CardContent className="p-8">
                    <div className="text-center py-16">
                      <BookOpen className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-2xl font-bold text-white mb-4">Direitos e Deveres do Afiliado</h3>
                      <p className="text-gray-400 text-lg">
                        Conteúdo em desenvolvimento. Em breve você terá acesso a todas as informações sobre direitos e deveres.
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </section>

        {/* Como Funciona Section */}
        <section id="como-funciona" className="py-20 bg-white/30 dark:bg-gray-800/30 backdrop-blur-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-4">
                Como Funciona o Sistema
              </h2>
              <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
                Em apenas 3 passos simples você estará ganhando dinheiro como afiliado
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <motion.div
                initial={{ opacity: 0, x: -50 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
                className="text-center"
              >
                <div className="mb-6 mx-auto w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                  <UserCheck className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">1. Cadastre-se Grátis</h3>
                <p className="text-gray-600 dark:text-gray-300">
                  Faça seu cadastro em menos de 2 minutos. Sem taxas, sem burocracia, totalmente gratuito.
                </p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="text-center"
              >
                <div className="mb-6 mx-auto w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center">
                  <Target className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">2. Promova Links</h3>
                <p className="text-gray-600 dark:text-gray-300">
                  Compartilhe seus links personalizados nas redes sociais, WhatsApp, Telegram ou seu site.
                </p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: 50 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.4 }}
                className="text-center"
              >
                <div className="mb-6 mx-auto w-16 h-16 bg-gradient-to-br from-yellow-500 to-orange-600 rounded-full flex items-center justify-center">
                  <Wallet className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">3. Receba Comissões</h3>
                <p className="text-gray-600 dark:text-gray-300">
                  Ganhe comissões automáticas de até 45% por cada cliente que se cadastrar e apostar.
                </p>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="recursos" className="py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-4">
                Por Que Escolher o AfiliadosBet?
              </h2>
              <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
                O sistema mais completo e confiável para afiliados de casas de apostas
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              <FeatureCard
                icon={DollarSign}
                title="Comissões Altas"
                description="Ganhe até 45% de comissão sobre cada apostador que trouxer. Sem limites de ganhos."
                delay={0}
              />
              <FeatureCard
                icon={BarChart3}
                title="Analytics em Tempo Real"
                description="Acompanhe seus cliques, conversões e ganhos em tempo real com dashboards intuitivos."
                delay={0.1}
              />
              <FeatureCard
                icon={Shield}
                title="Pagamentos Garantidos"
                description="Pagamentos pontuais e seguros. Histórico de 100% de pagamentos em dia."
                delay={0.2}
              />
              <FeatureCard
                icon={Smartphone}
                title="Plataforma Mobile"
                description="Gerencie seus links e acompanhe resultados direto do seu celular, a qualquer hora."
                delay={0.3}
              />
              <FeatureCard
                icon={HeadphonesIcon}
                title="Suporte 24/7"
                description="Equipe especializada disponível 24 horas por dia para te ajudar a maximizar ganhos."
                delay={0.4}
              />
              <FeatureCard
                icon={Globe}
                title="Multi-Plataforma"
                description="Links que funcionam em todas as redes sociais e aplicativos de mensagem."
                delay={0.5}
              />
            </div>
          </div>
        </section>

        {/* Benefits Section */}
        <section id="vantagens" className="py-20 bg-gradient-to-r from-blue-600 to-purple-600 text-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl sm:text-4xl font-bold mb-4">
                Vantagens Exclusivas para Afiliados
              </h2>
              <p className="text-xl text-blue-100 max-w-3xl mx-auto">
                Benefícios que fazem a diferença na sua renda mensal
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <motion.div
                initial={{ opacity: 0, x: -50 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
                className="space-y-6"
              >
                <div className="flex items-start space-x-4">
                  <CheckCircle className="h-6 w-6 text-green-400 mt-1 flex-shrink-0" />
                  <div>
                    <h3 className="text-xl font-semibold mb-2">Sem Investimento Inicial</h3>
                    <p className="text-blue-100">Comece a ganhar sem investir um centavo. 100% gratuito para sempre.</p>
                  </div>
                </div>
                <div className="flex items-start space-x-4">
                  <CheckCircle className="h-6 w-6 text-green-400 mt-1 flex-shrink-0" />
                  <div>
                    <h3 className="text-xl font-semibold mb-2">Comissões Vitalícias</h3>
                    <p className="text-blue-100">Ganhe comissão para sempre de cada cliente que trouxer, sem prazo de validade.</p>
                  </div>
                </div>
                <div className="flex items-start space-x-4">
                  <CheckCircle className="h-6 w-6 text-green-400 mt-1 flex-shrink-0" />
                  <div>
                    <h3 className="text-xl font-semibold mb-2">Relatórios Detalhados</h3>
                    <p className="text-blue-100">Acompanhe cliques, conversões e ganhos com dashboards completos em tempo real.</p>
                  </div>
                </div>
                <div className="flex items-start space-x-4">
                  <CheckCircle className="h-6 w-6 text-green-400 mt-1 flex-shrink-0" />
                  <div>
                    <h3 className="text-xl font-semibold mb-2">Links Personalizados</h3>
                    <p className="text-blue-100">Crie links únicos e rastreie a performance de cada campanha individualmente.</p>
                  </div>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: 50 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="space-y-6"
              >
                <div className="flex items-start space-x-4">
                  <CheckCircle className="h-6 w-6 text-green-400 mt-1 flex-shrink-0" />
                  <div>
                    <h3 className="text-xl font-semibold mb-2">Saques Rápidos</h3>
                    <p className="text-blue-100">Receba seus ganhos em até 24h via PIX, TED ou carteira digital.</p>
                  </div>
                </div>
                <div className="flex items-start space-x-4">
                  <CheckCircle className="h-6 w-6 text-green-400 mt-1 flex-shrink-0" />
                  <div>
                    <h3 className="text-xl font-semibold mb-2">Múltiplas Casas de Apostas</h3>
                    <p className="text-blue-100">Promova as melhores casas do mercado e diversifique sua renda.</p>
                  </div>
                </div>
                <div className="flex items-start space-x-4">
                  <CheckCircle className="h-6 w-6 text-green-400 mt-1 flex-shrink-0" />
                  <div>
                    <h3 className="text-xl font-semibold mb-2">Sistema Automatizado</h3>
                    <p className="text-blue-100">Tudo funciona automaticamente: rastreamento, cálculo de comissões e relatórios.</p>
                  </div>
                </div>
                <div className="flex items-start space-x-4">
                  <CheckCircle className="h-6 w-6 text-green-400 mt-1 flex-shrink-0" />
                  <div>
                    <h3 className="text-xl font-semibold mb-2">Interface Intuitiva</h3>
                    <p className="text-blue-100">Painel de controle simples e fácil de usar, mesmo para iniciantes.</p>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Testimonials */}
        <section id="depoimentos" className="py-20 bg-white/30 dark:bg-gray-800/30 backdrop-blur-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-4">
                O Que Nossos Afiliados Dizem
              </h2>
              <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
                Histórias reais de quem transformou a vida com o AfiliadosBet
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              <TestimonialCard
                name="Carlos Silva"
                role="Afiliado há 8 meses"
                content="Comecei sem experiência e hoje ganho mais de R$ 12.000 por mês. O suporte é excepcional e os pagamentos sempre em dia."
                rating={5}
                earnings="R$ 12.340/mês"
              />
              <TestimonialCard
                name="Ana Costa"
                role="Marketing Digital"
                content="O melhor sistema de afiliados que já usei. Interface intuitiva, relatórios detalhados e comissões justas."
                rating={5}
                earnings="R$ 8.750/mês"
              />
              <TestimonialCard
                name="Rafael Santos"
                role="Influencer"
                content="Consegui monetizar meu Instagram de forma consistente. Em 6 meses já tinha uma renda fixa considerável."
                rating={5}
                earnings="R$ 15.200/mês"
              />
              <TestimonialCard
                name="Marina Oliveira"
                role="Blogueira"
                content="Os materiais de marketing prontos facilitaram muito meu trabalho. Recomendo para qualquer pessoa que quer uma renda extra."
                rating={5}
                earnings="R$ 6.980/mês"
              />
              <TestimonialCard
                name="João Pedro"
                role="Youtuber"
                content="Sistema transparente e confiável. Acompanho meus ganhos em tempo real e os pagamentos são pontuais."
                rating={5}
                earnings="R$ 22.150/mês"
              />
              <TestimonialCard
                name="Luciana Ferreira"
                role="Empreendedora"
                content="Mudou minha vida financeira. Hoje tenho uma renda passiva que cresce todo mês com o AfiliadosBet."
                rating={5}
                earnings="R$ 18.670/mês"
              />
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section id="faq" className="py-20">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-4">
                Perguntas Frequentes
              </h2>
              <p className="text-xl text-gray-600 dark:text-gray-300">
                Tire suas dúvidas sobre como funciona o sistema
              </p>
            </div>

            <div className="space-y-4">
              <FAQItem
                question="Como faço para me cadastrar como afiliado?"
                answer="O cadastro é 100% gratuito e simples. Clique em 'Cadastrar Grátis', preencha seus dados básicos e em poucos minutos você estará pronto para começar a ganhar dinheiro como afiliado."
              />
              <FAQItem
                question="Quanto posso ganhar como afiliado?"
                answer="Não há limite de ganhos. Nossos afiliados ganham desde R$ 500 até mais de R$ 20.000 por mês, dependendo do volume de tráfego e qualidade dos indicados. A média dos nossos top afiliados é de R$ 8.000-15.000 mensais."
              />
              <FAQItem
                question="Como e quando recebo meus pagamentos?"
                answer="Os pagamentos são realizados semanalmente via PIX, TED ou carteira digital. O valor mínimo para saque é de apenas R$ 50. Temos histórico de 100% de pagamentos em dia."
              />
              <FAQItem
                question="Preciso ter experiência para ser afiliado?"
                answer="Não! Oferecemos treinamento completo, materiais de marketing prontos e suporte 24h. Muitos dos nossos afiliados de sucesso começaram sem nenhuma experiência anterior."
              />
              <FAQItem
                question="Posso promover em qualquer rede social?"
                answer="Sim! Nossos links funcionam em todas as plataformas: Instagram, Facebook, TikTok, YouTube, WhatsApp, Telegram, Twitter e qualquer outro canal que você quiser usar."
              />
              <FAQItem
                question="Como funciona o sistema de rastreamento?"
                answer="Cada afiliado recebe links únicos e personalizados. O sistema rastreia automaticamente todos os cliques, conversões e comissões em tempo real através do seu painel de controle."
              />
              <FAQItem
                question="Como acompanho meus resultados?"
                answer="Através do painel de controle você acompanha em tempo real: cliques, conversões, comissões ganhas, ranking de performance e muito mais. Tudo com gráficos detalhados e fáceis de entender."
              />
              <FAQItem
                question="Existe alguma taxa ou mensalidade?"
                answer="Não! O AfiliadosBet é 100% gratuito para afiliados. Você só ganha, nunca paga nada. Não há taxas de adesão, mensalidades ou qualquer cobrança."
              />
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 bg-gradient-to-r from-green-600 to-emerald-600 text-white">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
            >
              <h2 className="text-3xl sm:text-5xl font-bold mb-6">
                Pronto Para Transformar Sua Vida Financeira?
              </h2>
              <p className="text-xl text-green-100 mb-8 max-w-2xl mx-auto">
                Junte-se a mais de 2.800 afiliados que já estão ganhando dinheiro todos os dias. 
                Cadastro gratuito em menos de 2 minutos.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-8">
                <Button 
                  size="lg" 
                  onClick={() => setLocation("/register")}
                  className="bg-white text-green-600 hover:bg-gray-100 px-8 py-4 text-lg font-semibold shadow-xl"
                >
                  <Trophy className="mr-2 h-5 w-5" />
                  Começar Agora Grátis
                </Button>
                <Button 
                  variant="outline" 
                  size="lg"
                  className="border-2 border-white text-white hover:bg-white hover:text-green-600 px-8 py-4 text-lg"
                  onClick={() => setLocation("/login")}
                >
                  <Users className="mr-2 h-5 w-5" />
                  Já Tenho Conta
                </Button>
              </div>
              <div className="flex items-center justify-center space-x-6 text-green-100">
                <div className="flex items-center space-x-2">
                  <CheckCircle className="h-5 w-5" />
                  <span>Cadastro Gratuito</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle className="h-5 w-5" />
                  <span>Sem Mensalidades</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle className="h-5 w-5" />
                  <span>Suporte 24h</span>
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Footer */}
        <footer className="bg-gray-900 text-white py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
              <div>
                <div className="flex items-center space-x-3 mb-4">
                  <img src={logoPath} alt="AfiliadosBet" className="h-8 w-8" />
                  <span className="text-xl font-bold">AfiliadosBet</span>
                </div>
                <p className="text-gray-400 mb-4">
                  O melhor sistema de afiliados para casas de apostas do Brasil. Transforme seu tráfego em dinheiro.
                </p>
              </div>
              <div>
                <h3 className="text-lg font-semibold mb-4">Links Rápidos</h3>
                <ul className="space-y-2 text-gray-400">
                  <li><a href="#recursos" className="hover:text-white transition-colors">Recursos</a></li>
                  <li><a href="#vantagens" className="hover:text-white transition-colors">Vantagens</a></li>
                  <li><a href="#depoimentos" className="hover:text-white transition-colors">Depoimentos</a></li>
                  <li><a href="#faq" className="hover:text-white transition-colors">FAQ</a></li>
                </ul>
              </div>
              <div>
                <h3 className="text-lg font-semibold mb-4">Suporte</h3>
                <ul className="space-y-2 text-gray-400">
                  <li>📧 suporte@afiliadosbet.com</li>
                  <li>📱 WhatsApp: (11) 99999-9999</li>
                  <li>🕒 Atendimento 24h</li>
                </ul>
              </div>
              <div>
                <h3 className="text-lg font-semibold mb-4">Legal</h3>
                <ul className="space-y-2 text-gray-400">
                  <li><a href="#" className="hover:text-white transition-colors">Termos de Uso</a></li>
                  <li><a href="#" className="hover:text-white transition-colors">Política de Privacidade</a></li>
                  <li><a href="#" className="hover:text-white transition-colors">Regulamentação</a></li>
                </ul>
              </div>
            </div>
            <Separator className="my-8 bg-gray-700" />
            <div className="text-center text-gray-400">
              <p>&copy; 2024 AfiliadosBet. Todos os direitos reservados.</p>
            </div>
          </div>
        </footer>
      </div>
    </>
  );
}