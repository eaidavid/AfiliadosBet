import { useState, useEffect, useRef } from "react";
import { useLocation } from "wouter";
import { motion, useInView } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
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
  ChevronDown
} from "lucide-react";
import logoPath from "@assets/Documento de David.png";

interface AnimatedCounterProps {
  end: number;
  duration?: number;
  prefix?: string;
  suffix?: string;
}

const AnimatedCounter = ({ end, duration = 2000, prefix = "", suffix = "" }: AnimatedCounterProps) => {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref);

  useEffect(() => {
    if (inView) {
      let startTime: number | null = null;
      const animate = (currentTime: number) => {
        if (startTime === null) startTime = currentTime;
        const progress = Math.min((currentTime - startTime) / duration, 1);
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
}

const TestimonialCard = ({ name, role, content, rating }: TestimonialProps) => (
  <motion.div
    initial={{ opacity: 0, y: 50 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.6 }}
  >
    <Card className="bg-slate-800/50 border-slate-700 backdrop-blur-sm">
      <CardContent className="p-6">
        <div className="flex mb-4">
          {[...Array(rating)].map((_, i) => (
            <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
          ))}
        </div>
        <p className="text-slate-300 mb-4 italic">"{content}"</p>
        <div>
          <p className="text-white font-semibold">{name}</p>
          <p className="text-slate-400 text-sm">{role}</p>
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
    initial={{ opacity: 0, y: 30 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.6, delay }}
    whileHover={{ scale: 1.05 }}
    className="group"
  >
    <Card className="bg-slate-800/50 border-slate-700 backdrop-blur-sm hover:bg-slate-800/70 transition-all duration-300 h-full">
      <CardContent className="p-6 text-center">
        <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-emerald-500 to-blue-600 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
          <Icon className="h-8 w-8 text-white" />
        </div>
        <h3 className="text-xl font-bold text-white mb-2">{title}</h3>
        <p className="text-slate-300">{description}</p>
      </CardContent>
    </Card>
  </motion.div>
);

export default function LandingPage() {
  const [, setLocation] = useLocation();
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  const scrollToSection = (sectionId: string) => {
    document.getElementById(sectionId)?.scrollIntoView({ behavior: 'smooth' });
  };

  const features = [
    {
      icon: TrendingUp,
      title: "Comissões Altas",
      description: "Ganhe até 60% de comissão em CPA e RevShare com as melhores casas de apostas do mercado."
    },
    {
      icon: BarChart3,
      title: "Analytics Avançado",
      description: "Acompanhe suas conversões em tempo real com relatórios detalhados e insights poderosos."
    },
    {
      icon: Zap,
      title: "Links Inteligentes",
      description: "Geração automática de links personalizados com tracking avançado para maximizar conversões."
    },
    {
      icon: Shield,
      title: "Pagamentos Seguros",
      description: "Receba seus pagamentos via PIX de forma rápida e segura, sem complicações."
    },
    {
      icon: Target,
      title: "Suporte 24/7",
      description: "Equipe especializada para te ajudar a maximizar seus ganhos a qualquer hora."
    },
    {
      icon: Rocket,
      title: "Crescimento Rápido",
      description: "Ferramentas e estratégias comprovadas para escalar seus ganhos rapidamente."
    }
  ];

  const testimonials = [
    {
      name: "Carlos Silva",
      role: "Afiliado desde 2023",
      content: "Em 6 meses consegui gerar mais de R$ 15.000 em comissões. A plataforma é incrível!",
      rating: 5
    },
    {
      name: "Ana Santos",
      role: "Top Afiliada",
      content: "O suporte e as ferramentas disponíveis me ajudaram a triplicar meus ganhos.",
      rating: 5
    },
    {
      name: "Pedro Oliveira",
      role: "Empreendedor Digital",
      content: "A melhor plataforma de afiliados que já usei. Recomendo para todos!",
      rating: 5
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      {/* Header */}
      <header className="fixed top-0 w-full z-50 bg-slate-900/80 backdrop-blur-lg border-b border-slate-800">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center space-x-3"
          >
            <img src={logoPath} alt="AfiliadosBet" className="h-10 w-auto" />
            <span className="text-xl font-bold bg-gradient-to-r from-emerald-400 to-blue-400 bg-clip-text text-transparent">
              AfiliadosBet
            </span>
          </motion.div>
          
          <nav className="hidden md:flex space-x-8">
            <button onClick={() => scrollToSection('features')} className="text-slate-300 hover:text-emerald-400 transition-colors">
              Recursos
            </button>
            <button onClick={() => scrollToSection('testimonials')} className="text-slate-300 hover:text-emerald-400 transition-colors">
              Depoimentos
            </button>
            <button onClick={() => scrollToSection('pricing')} className="text-slate-300 hover:text-emerald-400 transition-colors">
              Planos
            </button>
          </nav>

          <Button
            onClick={() => setLocation('/login')}
            className="bg-gradient-to-r from-emerald-600 to-blue-600 hover:from-emerald-700 hover:to-blue-700"
          >
            Entrar
          </Button>
        </div>
      </header>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4">
        <div className="container mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: isVisible ? 1 : 0, y: isVisible ? 0 : 50 }}
            transition={{ duration: 0.8 }}
          >
            <Badge className="mb-6 bg-emerald-500/20 text-emerald-400 border-emerald-500/30">
              🚀 Plataforma #1 em Afiliados de Apostas
            </Badge>
            
            <h1 className="text-5xl md:text-7xl font-bold mb-6">
              <span className="bg-gradient-to-r from-emerald-400 via-blue-400 to-purple-400 bg-clip-text text-transparent">
                Transforme Tráfego
              </span>
              <br />
              <span className="text-white">em Dinheiro</span>
            </h1>
            
            <p className="text-xl md:text-2xl text-slate-300 mb-8 max-w-3xl mx-auto leading-relaxed">
              A plataforma mais avançada para afiliados de apostas esportivas. 
              <strong className="text-emerald-400"> Ganhe até 60% de comissão</strong> e 
              <strong className="text-blue-400"> receba em até 24h via PIX</strong>.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
              <Button
                onClick={() => setLocation('/register')}
                size="lg"
                className="bg-gradient-to-r from-emerald-600 to-blue-600 hover:from-emerald-700 hover:to-blue-700 text-lg px-8 py-4"
              >
                Começar Agora Grátis
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
              
              <Button
                variant="outline"
                size="lg"
                onClick={() => scrollToSection('demo')}
                className="border-slate-600 text-slate-300 hover:bg-slate-800 text-lg px-8 py-4"
              >
                <PlayCircle className="mr-2 h-5 w-5" />
                Ver Demo
              </Button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto">
              <div className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-emerald-400 mb-2">
                  <AnimatedCounter end={15000} prefix="R$ " />+
                </div>
                <p className="text-slate-400">Pago em Comissões</p>
              </div>
              <div className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-blue-400 mb-2">
                  <AnimatedCounter end={500} />+
                </div>
                <p className="text-slate-400">Afiliados Ativos</p>
              </div>
              <div className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-purple-400 mb-2">
                  <AnimatedCounter end={98} suffix="%" />
                </div>
                <p className="text-slate-400">Taxa de Satisfação</p>
              </div>
              <div className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-yellow-400 mb-2">
                  <AnimatedCounter end={24} suffix="h" />
                </div>
                <p className="text-slate-400">Tempo de Pagamento</p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 1 }}
            className="mt-16"
          >
            <ChevronDown 
              className="h-8 w-8 text-slate-400 mx-auto animate-bounce cursor-pointer"
              onClick={() => scrollToSection('features')}
            />
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-4">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
              Por que Escolher o <span className="text-emerald-400">AfiliadosBet?</span>
            </h2>
            <p className="text-xl text-slate-300 max-w-3xl mx-auto">
              Desenvolvemos a plataforma mais completa do mercado para maximizar seus ganhos como afiliado
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <FeatureCard
                key={index}
                icon={feature.icon}
                title={feature.title}
                description={feature.description}
                delay={index * 0.1}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="testimonials" className="py-20 px-4 bg-slate-900/50">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
              O que Nossos <span className="text-emerald-400">Afiliados</span> Dizem
            </h2>
            <p className="text-xl text-slate-300 max-w-2xl mx-auto">
              Histórias reais de sucesso de quem está ganhando dinheiro conosco
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <TestimonialCard key={index} {...testimonial} />
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl md:text-6xl font-bold text-white mb-6">
              Pronto para <span className="text-emerald-400">Começar?</span>
            </h2>
            <p className="text-xl text-slate-300 mb-8 max-w-2xl mx-auto">
              Junte-se a centenas de afiliados que já estão faturando alto com o AfiliadosBet
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
              <Button
                onClick={() => setLocation('/register')}
                size="lg"
                className="bg-gradient-to-r from-emerald-600 to-blue-600 hover:from-emerald-700 hover:to-blue-700 text-xl px-12 py-6"
              >
                Cadastrar Grátis Agora
                <ArrowRight className="ml-2 h-6 w-6" />
              </Button>
            </div>

            <p className="text-slate-400 text-sm">
              ✅ Sem mensalidade • ✅ Sem taxa de setup • ✅ Comece a ganhar hoje mesmo
            </p>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 py-12 px-4 border-t border-slate-800">
        <div className="container mx-auto text-center">
          <div className="flex items-center justify-center space-x-3 mb-6">
            <img src={logoPath} alt="AfiliadosBet" className="h-8 w-auto" />
            <span className="text-xl font-bold bg-gradient-to-r from-emerald-400 to-blue-400 bg-clip-text text-transparent">
              AfiliadosBet
            </span>
          </div>
          <p className="text-slate-400 mb-4">
            A plataforma mais avançada para afiliados de apostas esportivas
          </p>
          <p className="text-slate-500 text-sm">
            © 2024 AfiliadosBet. Todos os direitos reservados.
          </p>
        </div>
      </footer>
    </div>
  );
}