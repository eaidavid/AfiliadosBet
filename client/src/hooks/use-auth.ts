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

        // Always check with server first to avoid auto-login issues
        const response = await fetch("/api/auth/me", {
          credentials: "include"
        });
        
        if (response.ok) {
          const data = await response.json();
          const userData = data.user || data; // Handle both response formats
          if (isMounted && userData && userData.id) {
            setUser(userData);
            setError(null);
            // Cache the auth state only for valid sessions
            localStorage.setItem('auth_user', JSON.stringify(userData));
            localStorage.setItem('auth_timestamp', Date.now().toString());
          } else {
            // Invalid user data, clear everything
            if (isMounted) {
              setUser(null);
              localStorage.removeItem('auth_user');
              localStorage.removeItem('auth_timestamp');
            }
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
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include", // Important for sessions
        body: JSON.stringify({
          email: credentials.usernameOrEmail,
          password: credentials.password
        })
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Erro no login");
      }
      
      return await response.json();
    },
    onSuccess: (data) => {
      // Clear any logout flags
      localStorage.removeItem('is_logged_out');
      
      // Store auth state for reliability
      if (data.user) {
        localStorage.setItem('auth_user', JSON.stringify(data.user));
        localStorage.setItem('auth_timestamp', Date.now().toString());
        
        // Invalidar cache para atualizar estado de autenticação
        queryClient.invalidateQueries({ queryKey: ["/api/auth/me"] });
        
        // Force navigation based on user role
        setTimeout(() => {
          if (data.user.role === 'admin') {
            window.location.href = "/admin";
          } else {
            window.location.href = "/home";
          }
        }, 100);
      }
    },
    onError: (error) => {
      console.error("Login failed:", error);
      // Clear any cached auth state on login failure
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
