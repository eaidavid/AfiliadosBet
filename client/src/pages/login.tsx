import { useEffect } from "react";
import { useLocation } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import logoPath from "@assets/Afiliados Bet positivo.png";

export default function Login() {
  const [, setLocation] = useLocation();

  // Redireciona automaticamente para o painel admin
  useEffect(() => {
    const timer = setTimeout(() => {
      setLocation("/admin");
    }, 1500);

    return () => clearTimeout(timer);
  }, [setLocation]);

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
        </CardHeader>

        <CardContent className="text-center">
          <div className="space-y-4">
            <div className="animate-spin w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full mx-auto"></div>
            <p className="text-slate-400">Carregando painel administrativo...</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}