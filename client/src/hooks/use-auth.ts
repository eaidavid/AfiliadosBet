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

        // First check localStorage for cached auth state
        const cachedUser = localStorage.getItem('auth_user');
        const timestamp = localStorage.getItem('auth_timestamp');
        
        if (cachedUser && timestamp) {
          const age = Date.now() - parseInt(timestamp);
          // Use cached data if less than 5 minutes old
          if (age < 5 * 60 * 1000) {
            const userData = JSON.parse(cachedUser);
            if (isMounted) {
              setUser(userData);
              setIsLoading(false);
              return;
            }
          }
        }

        const response = await fetch("/api/auth/me", {
          credentials: "include"
        });
        
        if (response.ok) {
          const data = await response.json();
          const userData = data.user || data; // Handle both response formats
          if (isMounted && userData) {
            setUser(userData);
            setError(null);
            // Cache the auth state
            localStorage.setItem('auth_user', JSON.stringify(userData));
            localStorage.setItem('auth_timestamp', Date.now().toString());
          }
        } else {
          if (isMounted) {
            setUser(null);
            setError(null);
            // Clear cached auth state
            localStorage.removeItem('auth_user');
            localStorage.removeItem('auth_timestamp');
          }
        }
      } catch (err) {
        if (isMounted) {
          setUser(null);
          setError(err instanceof Error ? err : new Error("Auth check failed"));
          // Clear cached auth state on error
          localStorage.removeItem('auth_user');
          localStorage.removeItem('auth_timestamp');
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
      const response = await apiRequest("/api/auth/login", {
        method: "POST",
        body: {
          email: credentials.usernameOrEmail,
          password: credentials.password
        }
      });
      return response;
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
          window.location.href = "/home";
        }
      }, 200);
    },
  });
}

export function useRegister() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (userData: InsertUser) => {
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
      // Clear all cached auth data
      localStorage.removeItem('auth_user');
      localStorage.removeItem('auth_timestamp');
      
      // Clear all React Query cache
      queryClient.clear();
      
      // Force page reload to clear all state
      window.location.href = "/";
      window.location.reload();
    },
    onError: () => {
      // Even if logout fails on server, clear local data
      localStorage.removeItem('auth_user');
      localStorage.removeItem('auth_timestamp');
      queryClient.clear();
      window.location.href = "/";
      window.location.reload();
    }
  });
}
