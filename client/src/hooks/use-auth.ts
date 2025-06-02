import { useState, useEffect } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import type { User, InsertUser, LoginData } from "@shared/schema";

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let isMounted = true;
    
    const checkAuth = async () => {
      try {
        const response = await fetch("/api/auth/me", {
          credentials: "include"
        });
        
        if (response.ok) {
          const userData = await response.json();
          if (isMounted) {
            setUser(userData);
            setError(null);
          }
        } else {
          if (isMounted) {
            setUser(null);
            setError(null); // 401 não é um erro real
          }
        }
      } catch (err) {
        if (isMounted) {
          setUser(null);
          setError(err instanceof Error ? err : new Error("Auth check failed"));
        }
      } finally {
        if (isMounted) {
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
      const response = await apiRequest("POST", "/api/login", {
        email: credentials.usernameOrEmail,
        password: credentials.password
      });
      return response.json();
    },
    onSuccess: (data) => {
      // Invalidar cache para atualizar estado de autenticação
      queryClient.invalidateQueries({ queryKey: ["/api/auth/me"] });
      
      // Store auth state in localStorage for deploy reliability
      if (data.user) {
        localStorage.setItem('auth_user', JSON.stringify(data.user));
        localStorage.setItem('auth_timestamp', Date.now().toString());
      }
      
      // Force navigation based on user role
      setTimeout(() => {
        if (data.user?.role === 'admin') {
          window.location.href = "/admin";
        } else {
          window.location.href = "/dashboard";
        }
      }, 200);
    },
  });
}

export function useRegister() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (userData: InsertUser) => {
      const response = await apiRequest("POST", "/api/register", userData);
      return response.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["/api/auth/me"] });
      
      // Aguardar um pouco antes de redirecionar para garantir que o estado seja atualizado
      setTimeout(() => {
        if (data.user?.role === 'admin') {
          window.location.href = "/admin";
        } else {
          window.location.href = "/dashboard";
        }
      }, 100);
    },
  });
}

export function useLogout() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async () => {
      const response = await apiRequest("POST", "/api/auth/logout");
      return response.json();
    },
    onSuccess: () => {
      // Clear all cache and redirect
      queryClient.clear();
      window.location.href = "/";
    },
  });
}
