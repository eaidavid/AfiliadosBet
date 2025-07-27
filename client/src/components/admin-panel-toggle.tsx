import { motion } from "framer-motion";
import { useAuth } from "@/hooks/use-auth";
import { useIsMobile } from "@/hooks/use-mobile";
import { Shield, Settings } from "lucide-react";
import { Link } from "wouter";

export default function AdminPanelToggle() {
  const { isAdmin } = useAuth();
  const isMobile = useIsMobile();
  
  if (!isAdmin) return null;
  
  return (
    <motion.div
      className="fixed top-4 right-4 z-50"
      initial={{ opacity: 0, scale: 0 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: 0.5, type: "spring", stiffness: 400, damping: 20 }}
    >
      <Link href="/admin">
        <motion.div
          className="w-12 h-12 bg-gradient-to-r from-red-500/20 to-rose-600/20 backdrop-blur-sm border border-red-500/30 rounded-xl flex items-center justify-center"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
        >
          <Shield className="w-6 h-6 text-red-400" />
        </motion.div>
      </Link>
    </motion.div>
  );
}