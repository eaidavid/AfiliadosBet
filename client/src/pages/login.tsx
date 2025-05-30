import { useState } from "react";
import { useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, Eye, EyeOff, AlertCircle } from "lucide-react";
import { useLogin, useAuth } from "@/hooks/use-auth";
import { loginSchema, type LoginData } from "@shared/schema";
import logoPath from "@assets/Afiliados Bet positivo.png";

export default function Login() {
  const [, setLocation] = useLocation();
  const [showPassword, setShowPassword] = useState(false);
  const login = useLogin();
  const { isAuthenticated, isAdmin } = useAuth();

  const form = useForm<LoginData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      usernameOrEmail: "",
      password: "",
    },
  });

  // Redirecionar usuário autenticado
  if (isAuthenticated) {
    if (isAdmin) {
      setLocation("/admin");
    } else {
      setLocation("/dashboard");
    }
    return null;
  }

  const onSubmit = async (data: LoginData) => {
    try {
      await login.mutateAsync(data);
      // Redirecionamento será tratado pelo useAuth
    } catch (error) {
      console.error("Login error:", error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 via-transparent to-blue-600/5"></div>
      
      <Card className="w-full max-w-md bg-slate-900/90 border-slate-700 backdrop-blur-sm">
        <CardHeader className="text-center space-y-4">
          <div className="w-16 h-16 mx-auto flex items-center justify-center">
            <img 
              src={logoPath} 
              alt="AfiliadosBet Logo" 
              className="w-16 h-16 object-contain"
            />
          </div>
          <CardTitle className="text-3xl font-bold bg-gradient-to-r from-emerald-400 to-blue-400 bg-clip-text text-transparent">
            AfiliadosBet
          </CardTitle>
          <p className="text-slate-400">Faça login para acessar sua conta</p>
        </CardHeader>

        <CardContent>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {login.error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  {login.error instanceof Error ? login.error.message : "Erro no login. Verifique suas credenciais."}
                </AlertDescription>
              </Alert>
            )}

            <div className="space-y-2">
              <Label htmlFor="usernameOrEmail" className="text-slate-200">
                Email ou Usuário
              </Label>
              <Input
                id="usernameOrEmail"
                type="text"
                placeholder="Digite seu email ou usuário"
                className="bg-slate-800 border-slate-600 text-white placeholder-slate-400 focus:border-emerald-500"
                {...form.register("usernameOrEmail")}
              />
              {form.formState.errors.usernameOrEmail && (
                <p className="text-red-400 text-sm">
                  {form.formState.errors.usernameOrEmail.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-slate-200">
                Senha
              </Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Digite sua senha"
                  className="bg-slate-800 border-slate-600 text-white placeholder-slate-400 focus:border-emerald-500 pr-10"
                  {...form.register("password")}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-0 top-0 h-full px-3 text-slate-400 hover:text-white"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
              {form.formState.errors.password && (
                <p className="text-red-400 text-sm">
                  {form.formState.errors.password.message}
                </p>
              )}
            </div>

            <Button
              type="submit"
              className="w-full bg-gradient-to-r from-emerald-600 to-blue-600 hover:from-emerald-700 hover:to-blue-700 text-white font-semibold"
              disabled={login.isPending}
            >
              {login.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Entrando...
                </>
              ) : (
                "Entrar"
              )}
            </Button>

            <div className="text-center">
              <Button
                type="button"
                variant="link"
                className="text-slate-400 hover:text-emerald-400"
                onClick={() => setLocation("/register")}
              >
                Não tem uma conta? Cadastre-se
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}