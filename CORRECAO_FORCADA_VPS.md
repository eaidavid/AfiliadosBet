# 🚨 CORREÇÃO FORÇADA - VPS NÃO RECONHECE MUDANÇAS

## PROBLEMA IDENTIFICADO
- Git pull mostra "Already up to date" mas script detecta que correções não estão aplicadas
- Arquivos podem estar em cache ou git não está sincronizado corretamente

## SOLUÇÃO FORÇADA

### 1. FORÇAR ATUALIZAÇÃO COMPLETA
```bash
# Parar aplicação
pm2 stop afiliadosbet
pm2 delete afiliadosbet

# Reset completo do git
git fetch --all
git reset --hard origin/main
git clean -fd

# Verificar se mudanças foram aplicadas
git log --oneline -3
```

### 2. APLICAR CORREÇÕES MANUALMENTE
Se ainda não funcionou, aplicar as correções diretamente:

#### A. Corrigir client/src/hooks/use-auth.ts
```bash
# Fazer backup
cp client/src/hooks/use-auth.ts client/src/hooks/use-auth.ts.backup

# Aplicar correção
sed -i 's/window\.location\.replace(targetPath);/setTimeout(() => {\n          console.log("🔄 Executando redirecionamento para:", targetPath);\n          window.location.href = targetPath;\n        }, 500);/' client/src/hooks/use-auth.ts
```

#### B. Corrigir client/src/pages/auth.tsx
```bash
# Fazer backup
cp client/src/pages/auth.tsx client/src/pages/auth.tsx.backup

# Comentar o useEffect
sed -i '/useEffect(() => {/,/}, \[isAuthenticated, isAdmin, setLocation\]);/ s/^/  \/\/ /' client/src/pages/auth.tsx
```

### 3. VERIFICAR SE CORREÇÕES FORAM APLICADAS
```bash
# Verificar auth hook
grep -n "window.location.href = targetPath" client/src/hooks/use-auth.ts

# Verificar auth page
grep -n "DESABILITADO para evitar loops" client/src/pages/auth.tsx

# Se aparecer resultado, correções foram aplicadas
```

### 4. ALTERNATIVA: SUBSTITUIÇÃO DIRETA DOS ARQUIVOS

#### A. Criar versão corrigida do use-auth.ts
```bash
cat > client/src/hooks/use-auth.ts << 'EOF'
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

        const response = await fetch("/api/auth/me", {
          credentials: "include"
        });
        
        if (response.ok) {
          const data = await response.json();
          const userData = data.user || data;
          if (isMounted && userData && userData.id) {
            setUser(userData);
            setError(null);
            localStorage.setItem('auth_user', JSON.stringify(userData));
            localStorage.setItem('auth_timestamp', Date.now().toString());
          } else {
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
            localStorage.removeItem('auth_user');
            localStorage.removeItem('auth_timestamp');
          }
        }
      } catch (err) {
        if (isMounted) {
          setUser(null);
          setError(err instanceof Error ? err : new Error("Auth check failed"));
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
      
      return await response.json();
    },
    onSuccess: (data) => {
      localStorage.removeItem('is_logged_out');
      
      if (data.user) {
        localStorage.setItem('auth_user', JSON.stringify(data.user));
        localStorage.setItem('auth_timestamp', Date.now().toString());
        
        queryClient.invalidateQueries({ queryKey: ["/api/auth/me"] });
        
        const targetPath = data.user.role === 'admin' ? '/admin' : '/home';
        console.log('🔄 Redirecionando para:', targetPath);
        
        setTimeout(() => {
          console.log('🔄 Executando redirecionamento para:', targetPath);
          window.location.href = targetPath;
        }, 500);
      }
    },
    onError: (error) => {
      console.error('Login failed:', error);
    }
  });
}

export function useLogout() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async () => {
      const response = await fetch("/api/auth/logout", {
        method: "POST",
        credentials: "include"
      });
      
      if (!response.ok) {
        throw new Error("Logout failed");
      }
      
      return response.json();
    },
    onSuccess: () => {
      localStorage.setItem('is_logged_out', 'true');
      localStorage.removeItem('auth_user');
      localStorage.removeItem('auth_timestamp');
      
      queryClient.invalidateQueries({ queryKey: ["/api/auth/me"] });
      
      window.location.href = "/";
    }
  });
}

export function useRegister() {
  return useMutation({
    mutationFn: async (userData: RegisterData) => {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(userData),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Erro no registro");
      }
      
      return response.json();
    },
  });
}
EOF
```

### 5. BUILD E RESTART
```bash
# Limpar cache
rm -rf node_modules dist .vite
npm cache clean --force

# Reinstalar e build
npm install
npm run build

# Configurar .env
cat > .env << 'EOF'
NODE_ENV=production
DATABASE_URL=postgresql://afiliadosbet:Alepoker800@localhost:5432/afiliadosbetdb
SESSION_SECRET=afiliadosbet_super_secret_key_2025
PORT=3000
HOST=0.0.0.0
EOF

# Limpar sessões PostgreSQL
psql -U afiliadosbet -h localhost -d afiliadosbetdb -c "
DROP TABLE IF EXISTS sessions;
CREATE TABLE sessions (
  sid varchar PRIMARY KEY,
  sess json NOT NULL,
  expire timestamp(6) NOT NULL
);
"

# Iniciar
NODE_ENV=production pm2 start npm --name "afiliadosbet" -- start
```

### 6. VERIFICAÇÃO FINAL
```bash
# Ver logs
pm2 logs afiliadosbet --lines 20

# Testar se correção foi aplicada
grep -n "window.location.href = targetPath" client/src/hooks/use-auth.ts

# Deve mostrar: linha com window.location.href = targetPath
```

## TESTE NO NAVEGADOR
1. Acesse: https://afiliadosbet.com.br/auth
2. Login: admin@afiliadosbet.com.br / admin123
3. Aguarde 0.5 segundos
4. Deve redirecionar para /admin

## SE AINDA FALHAR
Execute a Opção A do arquivo INSTRUCOES_LOGIN_PRODUCAO.md (reset completo)