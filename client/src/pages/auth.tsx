import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, Eye, EyeOff, AlertCircle, TrendingUp, DollarSign, Zap, Shield, Crown, Rocket } from "lucide-react";
import { useLogin, useAuth, useRegister } from "@/hooks/use-auth";
import { loginSchema, registerSchema, type LoginData, type RegisterData } from "@shared/schema";
import logoPath from "@assets/Afiliados Bet positivo.png";
import { motion, AnimatePresence } from "framer-motion";

const AnimatedIcon = ({ icon: Icon, delay = 0, color = "text-emerald-400" }: { icon: any, delay?: number, color?: string }) => (
  <motion.div
    initial={{ scale: 0, rotate: -180 }}
    animate={{ scale: 1, rotate: 0 }}
    transition={{ delay, duration: 0.6, type: "spring", stiffness: 200 }}
    className={`${color} opacity-80`}
  >
    <Icon className="w-5 h-5" />
  </motion.div>
);

const MoneyAnimation = () => (
  <div className="absolute inset-0 pointer-events-none overflow-hidden">
    {[...Array(8)].map((_, i) => (
      <motion.div
        key={i}
        className="absolute text-green-400 text-2xl font-bold opacity-20"
        initial={{ y: "100vh", x: Math.random() * 100 + "%" }}
        animate={{ y: "-10vh", rotate: 360 }}
        transition={{
          duration: 8 + Math.random() * 4,
          repeat: Infinity,
          delay: i * 1.5,
          ease: "linear"
        }}
      >
        💰
      </motion.div>
    ))}
  </div>
);

export default function Auth() {
  const [, setLocation] = useLocation();
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const login = useLogin();
  const register = useRegister();
  const { isAuthenticated, isAdmin } = useAuth();

  const loginForm = useForm<LoginData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      usernameOrEmail: "",
      password: "",
    },
  });

  const registerForm = useForm<RegisterData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      email: "",
      username: "",
      password: "",
      confirmPassword: "",
      fullName: "",
      cpf: "",
      birthDate: "",
    },
  });

  // Redirecionar usuário autenticado (DESABILITADO para evitar loops)
  // useEffect(() => {
  //   if (isAuthenticated) {
  //     if (isAdmin) {
  //       setLocation("/admin");
  //     } else {
  //       setLocation("/home");
  //     }
  //   }
  // }, [isAuthenticated, isAdmin, setLocation]);

  const onLoginSubmit = async (data: LoginData) => {
    try {
      const result = await login.mutateAsync(data);
      console.log("Login successful:", result);
      // Login hook já faz o redirecionamento, não precisamos fazer aqui
    } catch (error) {
      console.error("Login error:", error);
    }
  };

  const onRegisterSubmit = async (data: RegisterData) => {
    try {
      await register.mutateAsync(data);
    } catch (error) {
      console.error("Register error:", error);
    }
  };

  const toggleMode = () => {
    setIsLogin(!isLogin);
    loginForm.reset();
    registerForm.reset();
  };

  const benefits = [
    { icon: TrendingUp, text: "Ganhe até R$ 15.000/mês", color: "text-green-400" },
    { icon: DollarSign, text: "Comissões de até 50%", color: "text-yellow-400" },
    { icon: Zap, text: "Pagamentos instantâneos", color: "text-blue-400" },
    { icon: Shield, text: "100% seguro e confiável", color: "text-purple-400" },
    { icon: Crown, text: "Sistema premium", color: "text-orange-400" },
    { icon: Rocket, text: "Resultados imediatos", color: "text-pink-400" }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex overflow-hidden relative">
      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-20px); }
        }
        @keyframes pulse-glow {
          0%, 100% { box-shadow: 0 0 20px rgba(16, 185, 129, 0.3); }
          50% { box-shadow: 0 0 40px rgba(16, 185, 129, 0.6); }
        }
        .float-animation { animation: float 6s ease-in-out infinite; }
        .pulse-glow { animation: pulse-glow 3s ease-in-out infinite; }
      `}</style>

      <MoneyAnimation />

      {/* Background Effects */}
      <div className="absolute inset-0">
        <div className="absolute top-10 left-10 w-96 h-96 bg-gradient-to-r from-green-500/10 to-emerald-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-10 right-10 w-80 h-80 bg-gradient-to-r from-blue-500/10 to-cyan-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
        <div className="absolute top-1/2 left-1/4 w-64 h-64 bg-gradient-to-r from-purple-500/5 to-pink-500/5 rounded-full blur-2xl animate-pulse" style={{ animationDelay: '2s' }}></div>
      </div>

      {/* Left Panel - Benefits */}
      <div className="hidden lg:flex lg:w-1/2 relative z-10 flex-col justify-center items-center p-12 bg-gradient-to-br from-slate-900/50 to-slate-800/30 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center space-y-8"
        >
          <div className="flex items-center justify-center space-x-4 mb-8">
            <img src={logoPath} alt="AfiliadosBet" className="h-16 w-16 float-animation" />
            <h1 className="text-4xl font-black bg-gradient-to-r from-emerald-400 to-blue-400 bg-clip-text text-transparent">
              AfiliadosBet
            </h1>
          </div>

          <motion.h2 
            className="text-5xl font-black text-white leading-tight"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.8 }}
          >
            Transforme Seu<br />
            <span className="bg-gradient-to-r from-green-400 via-emerald-400 to-green-600 bg-clip-text text-transparent">
              Conhecimento em Renda
            </span>
          </motion.h2>

          <motion.p 
            className="text-xl text-slate-300 max-w-lg"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.8 }}
          >
            Junte-se aos milhares de afiliados que já estão ganhando dinheiro promovendo as melhores casas de apostas do mercado
          </motion.p>

          <motion.div 
            className="grid grid-cols-2 gap-6 max-w-2xl"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7, duration: 0.8 }}
          >
            {benefits.map((benefit, index) => (
              <motion.div
                key={index}
                className="flex items-center space-x-3 p-4 bg-slate-800/40 rounded-xl border border-slate-700/50 backdrop-blur-sm hover:bg-slate-700/40 transition-all duration-300"
                whileHover={{ scale: 1.05, y: -2 }}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.9 + index * 0.1, duration: 0.6 }}
              >
                <AnimatedIcon 
                  icon={benefit.icon} 
                  delay={1 + index * 0.1} 
                  color={benefit.color}
                />
                <span className="text-slate-200 font-medium text-sm">{benefit.text}</span>
              </motion.div>
            ))}
          </motion.div>

          <motion.div
            className="bg-gradient-to-r from-green-600/20 to-emerald-600/20 p-6 rounded-2xl border border-green-500/30 backdrop-blur-sm pulse-glow"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 1.5, duration: 0.8 }}
          >
            <div className="text-center">
              <div className="text-3xl font-black text-green-400 mb-2">+2.847</div>
              <div className="text-slate-300">Afiliados Ativos Ganhando</div>
              <div className="text-2xl font-bold text-white mt-2">R$ 847.293</div>
              <div className="text-slate-400 text-sm">Total pago este mês</div>
            </div>
          </motion.div>
        </motion.div>
      </div>

      {/* Right Panel - Auth Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 lg:p-12 relative z-10">
        <motion.div
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
          className="w-full max-w-md"
        >
          <Card className="bg-slate-900/95 border-slate-700 backdrop-blur-xl shadow-2xl overflow-hidden">
            {/* Header */}
            <div className="p-8 pb-0">
              <div className="lg:hidden text-center mb-6">
                <div className="flex items-center justify-center space-x-3 mb-4">
                  <img src={logoPath} alt="AfiliadosBet" className="h-10 w-10" />
                  <span className="text-2xl font-bold bg-gradient-to-r from-emerald-400 to-blue-400 bg-clip-text text-transparent">
                    AfiliadosBet
                  </span>
                </div>
              </div>

              <div className="text-center mb-8">
                <motion.h3 
                  className="text-3xl font-bold text-white mb-2"
                  key={isLogin ? 'login' : 'register'}
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                >
                  {isLogin ? "Bem-vindo de volta!" : "Comece a ganhar hoje!"}
                </motion.h3>
                <motion.p 
                  className="text-slate-400"
                  key={isLogin ? 'login-sub' : 'register-sub'}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.2, duration: 0.5 }}
                >
                  {isLogin 
                    ? "Acesse sua conta e continue ganhando" 
                    : "Crie sua conta grátis e comece a faturar"
                  }
                </motion.p>
              </div>

              {/* Toggle Buttons */}
              <div className="flex bg-slate-800 rounded-xl p-1 mb-6">
                <button
                  onClick={() => setIsLogin(true)}
                  className={`flex-1 py-3 px-4 rounded-lg font-semibold transition-all duration-300 ${
                    isLogin 
                      ? 'bg-gradient-to-r from-emerald-600 to-blue-600 text-white shadow-lg' 
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Entrar
                </button>
                <button
                  onClick={() => setIsLogin(false)}
                  className={`flex-1 py-3 px-4 rounded-lg font-semibold transition-all duration-300 ${
                    !isLogin 
                      ? 'bg-gradient-to-r from-emerald-600 to-blue-600 text-white shadow-lg' 
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Cadastrar
                </button>
              </div>
            </div>

            <CardContent className="px-8 pb-8">
              <AnimatePresence mode="wait">
                {isLogin ? (
                  <motion.div
                    key="login"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    transition={{ duration: 0.3 }}
                  >
                    <form onSubmit={loginForm.handleSubmit(onLoginSubmit)} className="space-y-4">
                      {login.error && (
                        <Alert variant="destructive">
                          <AlertCircle className="h-4 w-4" />
                          <AlertDescription>
                            {login.error instanceof Error ? login.error.message : "Erro no login. Verifique suas credenciais."}
                          </AlertDescription>
                        </Alert>
                      )}

                      <div className="space-y-2">
                        <Label htmlFor="usernameOrEmail" className="text-slate-200 font-medium">
                          Email ou Usuário
                        </Label>
                        <Input
                          id="usernameOrEmail"
                          type="text"
                          placeholder="Digite seu email ou usuário"
                          className="bg-slate-800 border-slate-600 text-white placeholder-slate-400 focus:border-emerald-500 focus:ring-emerald-500/20 h-12"
                          {...loginForm.register("usernameOrEmail")}
                        />
                        {loginForm.formState.errors.usernameOrEmail && (
                          <p className="text-red-400 text-sm">
                            {loginForm.formState.errors.usernameOrEmail.message}
                          </p>
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="password" className="text-slate-200 font-medium">
                          Senha
                        </Label>
                        <div className="relative">
                          <Input
                            id="password"
                            type={showPassword ? "text" : "password"}
                            placeholder="Digite sua senha"
                            className="bg-slate-800 border-slate-600 text-white placeholder-slate-400 focus:border-emerald-500 focus:ring-emerald-500/20 pr-12 h-12"
                            {...loginForm.register("password")}
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="absolute right-0 top-0 h-full px-3 text-slate-400 hover:text-white hover:bg-transparent"
                            onClick={() => setShowPassword(!showPassword)}
                          >
                            {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                          </Button>
                        </div>
                        {loginForm.formState.errors.password && (
                          <p className="text-red-400 text-sm">
                            {loginForm.formState.errors.password.message}
                          </p>
                        )}
                      </div>

                      <Button
                        type="submit"
                        className="w-full bg-gradient-to-r from-emerald-600 to-blue-600 hover:from-emerald-700 hover:to-blue-700 text-white font-bold text-lg h-14 mt-6 shadow-xl hover:shadow-2xl transform hover:scale-[1.02] transition-all duration-300"
                        disabled={login.isPending}
                      >
                        {login.isPending ? (
                          <>
                            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                            Entrando...
                          </>
                        ) : (
                          <>
                            <DollarSign className="mr-2 h-5 w-5" />
                            Entrar e Ganhar
                          </>
                        )}
                      </Button>
                    </form>
                  </motion.div>
                ) : (
                  <motion.div
                    key="register"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.3 }}
                  >
                    <form onSubmit={registerForm.handleSubmit(onRegisterSubmit)} className="space-y-4">
                      {register.error && (
                        <Alert variant="destructive">
                          <AlertCircle className="h-4 w-4" />
                          <AlertDescription>
                            {register.error instanceof Error ? register.error.message : "Erro no cadastro. Tente novamente."}
                          </AlertDescription>
                        </Alert>
                      )}

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="fullName" className="text-slate-200 font-medium">
                            Nome Completo
                          </Label>
                          <Input
                            id="fullName"
                            type="text"
                            placeholder="Seu nome completo"
                            className="bg-slate-800 border-slate-600 text-white placeholder-slate-400 focus:border-emerald-500 focus:ring-emerald-500/20 h-11"
                            {...registerForm.register("fullName")}
                          />
                          {registerForm.formState.errors.fullName && (
                            <p className="text-red-400 text-sm">
                              {registerForm.formState.errors.fullName.message}
                            </p>
                          )}
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="username" className="text-slate-200 font-medium">
                            Usuário
                          </Label>
                          <Input
                            id="username"
                            type="text"
                            placeholder="Nome de usuário"
                            className="bg-slate-800 border-slate-600 text-white placeholder-slate-400 focus:border-emerald-500 focus:ring-emerald-500/20 h-11"
                            {...registerForm.register("username")}
                          />
                          {registerForm.formState.errors.username && (
                            <p className="text-red-400 text-sm">
                              {registerForm.formState.errors.username.message}
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="email" className="text-slate-200 font-medium">
                          Email
                        </Label>
                        <Input
                          id="email"
                          type="email"
                          placeholder="seu@email.com"
                          className="bg-slate-800 border-slate-600 text-white placeholder-slate-400 focus:border-emerald-500 focus:ring-emerald-500/20 h-11"
                          {...registerForm.register("email")}
                        />
                        {registerForm.formState.errors.email && (
                          <p className="text-red-400 text-sm">
                            {registerForm.formState.errors.email.message}
                          </p>
                        )}
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="cpf" className="text-slate-200 font-medium">
                            CPF
                          </Label>
                          <Input
                            id="cpf"
                            type="text"
                            placeholder="000.000.000-00"
                            className="bg-slate-800 border-slate-600 text-white placeholder-slate-400 focus:border-emerald-500 focus:ring-emerald-500/20 h-11"
                            {...registerForm.register("cpf")}
                          />
                          {registerForm.formState.errors.cpf && (
                            <p className="text-red-400 text-sm">
                              {registerForm.formState.errors.cpf.message}
                            </p>
                          )}
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="birthDate" className="text-slate-200 font-medium">
                            Data de Nascimento
                          </Label>
                          <Input
                            id="birthDate"
                            type="date"
                            className="bg-slate-800 border-slate-600 text-white placeholder-slate-400 focus:border-emerald-500 focus:ring-emerald-500/20 h-11"
                            {...registerForm.register("birthDate")}
                          />
                          {registerForm.formState.errors.birthDate && (
                            <p className="text-red-400 text-sm">
                              {registerForm.formState.errors.birthDate.message}
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="register-password" className="text-slate-200 font-medium">
                            Senha
                          </Label>
                          <div className="relative">
                            <Input
                              id="register-password"
                              type={showPassword ? "text" : "password"}
                              placeholder="Crie uma senha forte"
                              className="bg-slate-800 border-slate-600 text-white placeholder-slate-400 focus:border-emerald-500 focus:ring-emerald-500/20 pr-12 h-11"
                              {...registerForm.register("password")}
                            />
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              className="absolute right-0 top-0 h-full px-3 text-slate-400 hover:text-white hover:bg-transparent"
                              onClick={() => setShowPassword(!showPassword)}
                            >
                              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                            </Button>
                          </div>
                          {registerForm.formState.errors.password && (
                            <p className="text-red-400 text-sm">
                              {registerForm.formState.errors.password.message}
                            </p>
                          )}
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="confirmPassword" className="text-slate-200 font-medium">
                            Confirmar Senha
                          </Label>
                          <div className="relative">
                            <Input
                              id="confirmPassword"
                              type={showConfirmPassword ? "text" : "password"}
                              placeholder="Confirme sua senha"
                              className="bg-slate-800 border-slate-600 text-white placeholder-slate-400 focus:border-emerald-500 focus:ring-emerald-500/20 pr-12 h-11"
                              {...registerForm.register("confirmPassword")}
                            />
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              className="absolute right-0 top-0 h-full px-3 text-slate-400 hover:text-white hover:bg-transparent"
                              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            >
                              {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                            </Button>
                          </div>
                          {registerForm.formState.errors.confirmPassword && (
                            <p className="text-red-400 text-sm">
                              {registerForm.formState.errors.confirmPassword.message}
                            </p>
                          )}
                        </div>
                      </div>

                      <Button
                        type="submit"
                        className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-bold text-lg h-14 mt-6 shadow-xl hover:shadow-2xl transform hover:scale-[1.02] transition-all duration-300"
                        disabled={register.isPending}
                      >
                        {register.isPending ? (
                          <>
                            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                            Criando conta...
                          </>
                        ) : (
                          <>
                            <Rocket className="mr-2 h-5 w-5" />
                            Criar Conta e Começar a Ganhar
                          </>
                        )}
                      </Button>

                      <p className="text-xs text-slate-400 text-center mt-4">
                        Ao criar uma conta, você concorda com nossos{" "}
                        <span className="text-emerald-400 hover:underline cursor-pointer">
                          Termos de Uso
                        </span>{" "}
                        e{" "}
                        <span className="text-emerald-400 hover:underline cursor-pointer">
                          Política de Privacidade
                        </span>
                      </p>
                    </form>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Quick Access */}
              <div className="mt-6 p-4 bg-slate-800/50 rounded-xl border border-slate-700/50">
                <p className="text-slate-300 text-sm text-center mb-3">🚀 Acesso rápido para demonstração:</p>
                <div className="grid grid-cols-1 gap-2 text-xs">
                  <div className="flex justify-between items-center p-2 bg-slate-700/50 rounded">
                    <span className="text-slate-400">Admin:</span>
                    <span className="text-emerald-400 font-mono">admin@afiliadosbet.com.br / admin123</span>
                  </div>
                  <div className="flex justify-between items-center p-2 bg-slate-700/50 rounded">
                    <span className="text-slate-400">Afiliado:</span>
                    <span className="text-blue-400 font-mono">afiliado@afiliadosbet.com.br / admin123</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}