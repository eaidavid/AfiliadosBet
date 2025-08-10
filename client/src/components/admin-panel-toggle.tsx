import { motion } from "framer-motion";
import { useAuth } from "@/hooks/use-auth";
import { useIsMobile } from "@/hooks/use-mobile";
import { Shield, Settings } from "lucide-react";
import { Link } from "wouter";
import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { User, Eye, EyeOff } from "lucide-react";


export default function AdminPanelToggle() {
  const [isAdminView, setIsAdminView] = useState(true);
  const [, setLocation] = useLocation();
  const { isAdmin } = useAuth();
  const isMobile = useIsMobile();


  if (!isAdmin) return null;

  const toggleView = () => {
    setIsAdminView(!isAdminView);
    if (isAdminView) {
      // Mudando para visão de usuário - usar rota do dashboard do usuário
      console.log("🔄 Redirecionando para painel do usuário...");
      setLocation("/home");
    } else {
      // Voltando para visão de admin
      console.log("🔄 Redirecionando para painel admin...");
      setLocation("/admin");
    }
  };

  return (
    <motion.div
      className="fixed top-4 right-4 z-50"
      initial={{ opacity: 0, scale: 0 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: 0.5, type: "spring", stiffness: 400, damping: 20 }}
    >
      <Button onClick={toggleView} variant="outline" size="icon">
        {isAdminView ? <User className="w-5 h-5 text-gray-500" /> : <Shield className="w-5 h-5 text-blue-500" />}
      </Button>
    </motion.div>
  );
}