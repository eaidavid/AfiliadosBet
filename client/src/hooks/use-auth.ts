import { useState, useEffect } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import type { User, InsertUser, LoginData, RegisterData } from "@shared/schema";

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let isMounted = true;
    
    const checkAuth = async () => {
      try {
        // Check if user explicitly logged out
        const isLoggedOut = localStorage.getItem('is_logged_out');
        if (isLoggedOut) {
          localStorage.removeItem('is_logged_out');
          localStorage.removeItem('auth_user');
          localStorage.removeItem('auth_timestamp');
          if (isMounted) {
            setUser(null);
            setIsLoading(false);
            return;
          }
        }

        console.log('🔍 Verificando autenticação...');
        
        const response = await fetch("/api/auth/me", {
          credentials: "include",
          cache: "no-cache"
        });
        
        console.log('📡 Response status:', response.status);
        
        if (response.ok) {
          const data = await response.json();
          console.log('📋 Auth data received:', data);
          
          const userData = data.user || data;
          if (isMounted && userData && userData.id) {
            console.log('✅ User authenticated:', userData.email, userData.role);
            setUser(userData);
            setError(null);
            localStorage.setItem('auth_user', JSON.stringify(userData));
            localStorage.setItem('auth_timestamp', Date.now().toString());
          } else {
            console.log('❌ Invalid user data');
            if (isMounted) {
              setUser(null);
              localStorage.removeItem('auth_user');
              localStorage.removeItem('auth_timestamp');
            }
          }
        } else {
          console.log('❌ Auth check failed with status:', response.status);
          if (isMounted) {
            setUser(null);
            setError(null);
            localStorage.removeItem('auth_user');
            localStorage.removeItem('auth_timestamp');
          }
        }
      } catch (err) {
        console.error('❌ Auth check error:', err);
        if (isMounted) {
          setUser(null);
          setError(err instanceof Error ? err : new Error("Auth check failed"));
          localStorage.removeItem('auth_user');
          localStorage.removeItem('auth_timestamp');
        }
      } finally {
        if (isMounted) {
          console.log('🏁 Auth check completed. User:', !!user);
          setIsLoading(false);
        }
      }
    };

    checkAuth();
    
    return () => {
      isMounted = false;
    };
  }, []);

  const refreshUser = async () => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/auth/me", {
        credentials: "include"
      });
      
      if (response.ok) {
        const userData = await response.json();
        setUser(userData);
        setError(null);
      } else {
        setUser(null);
        setError(null);
      }
    } catch (err) {
      setUser(null);
      setError(err instanceof Error ? err : new Error("Auth check failed"));
    } finally {
      setIsLoading(false);
    }
  };

  return {
    user,
    isLoading,
    isAuthenticated: !!user && !!user.id,
    isAdmin: !!user && user.role === "admin",
    error,
    refreshUser
  };
}

export function useLogin() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (credentials: LoginData) => {
      console.log('🔐 Tentando login...');
      
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          email: credentials.usernameOrEmail,
          password: credentials.password
        })
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Erro no login");
      }
      
      const data = await response.json();
      console.log('✅ Login successful:', data);
      return data;
    },
    onSuccess: (data) => {
      console.log('🎉 Login onSuccess:', data);
      
      localStorage.removeItem('is_logged_out');
      
      if (data.user) {
        localStorage.setItem('auth_user', JSON.stringify(data.user));
        localStorage.setItem('auth_timestamp', Date.now().toString());
        
        queryClient.invalidateQueries({ queryKey: ["/api/auth/me"] });
        
        const targetPath = data.user.role === 'admin' ? '/admin' : '/home';
        console.log('🔄 Redirecionando para:', targetPath);
        
        // Aguardar sessão ser criada no servidor
        setTimeout(() => {
          console.log('🚀 Executando redirecionamento...');
          window.location.href = targetPath;
        }, 1000); // 1 segundo para garantir persistência da sessão
      }
    },
    onError: (error) => {
      console.error("❌ Login failed:", error);
      localStorage.removeItem('auth_user');
      localStorage.removeItem('auth_timestamp');
    }
  });
}

export function useRegister() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (userData: RegisterData) => {
      const response = await apiRequest("/api/auth/register", {
        method: "POST",
        body: userData
      });
      return response;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["/api/auth/me"] });
      
      // Aguardar um pouco antes de redirecionar para garantir que o estado seja atualizado
      setTimeout(() => {
        if (data.user?.role === 'admin') {
          window.location.href = "/admin";
        } else {
          window.location.href = "/home";
        }
      }, 100);
    },
  });
}

export function useLogout() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async () => {
      const response = await apiRequest("/api/auth/logout", {
        method: "POST"
      });
      return response;
    },
    onSuccess: () => {
      // Clear all cached auth data immediately
      localStorage.removeItem('auth_user');
      localStorage.removeItem('auth_timestamp');
      localStorage.setItem('is_logged_out', 'true');
      
      // Clear all React Query cache
      queryClient.clear();
      
      // Clear session cookies by setting them to expire
      document.cookie = 'connect.sid=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
      
      // Force immediate navigation and reload
      setTimeout(() => {
        window.location.href = "/";
        window.location.reload();
      }, 100);
    },
    onError: () => {
      // Even if logout fails on server, clear local data
      localStorage.removeItem('auth_user');
      localStorage.removeItem('auth_timestamp');
      localStorage.setItem('is_logged_out', 'true');
      
      // Clear session cookies
      document.cookie = 'connect.sid=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
      
      queryClient.clear();
      
      setTimeout(() => {
        window.location.href = "/";
        window.location.reload();
      }, 100);
    }
  });
}
