# 🔥 CORREÇÃO DEFINITIVA - LOOP DE REDIRECIONAMENTO

## PROBLEMA IDENTIFICADO
- Login funciona mas sessão não persiste
- Após login, todas as páginas redirecionam de volta para /auth
- useAuth() não consegue verificar autenticação corretamente

## SOLUÇÃO COMPLETA

### 1. FORÇAR APLICAÇÃO DOS ARQUIVOS CORRETOS

#### A. Substituir client/src/hooks/use-auth.ts COMPLETO
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
        credentials: "include",
        cache: "no-cache"
      });
      
      if (response.ok) {
        const data = await response.json();
        const userData = data.user || data;
        setUser(userData);
        setError(null);
        if (userData && userData.id) {
          localStorage.setItem('auth_user', JSON.stringify(userData));
          localStorage.setItem('auth_timestamp', Date.now().toString());
        }
      } else {
        setUser(null);
        setError(null);
        localStorage.removeItem('auth_user');
        localStorage.removeItem('auth_timestamp');
      }
    } catch (err) {
      setUser(null);
      setError(err instanceof Error ? err : new Error("Auth check failed"));
      localStorage.removeItem('auth_user');
      localStorage.removeItem('auth_timestamp');
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

#### B. Melhorar endpoint /api/auth/me no servidor
```bash
# Fazer backup
cp server/routes.ts server/routes.ts.backup

# Aplicar correção no endpoint me
sed -i '/app\.get("\/api\/auth\/me"/,/});/c\
  app.get("/api/auth/me", (req, res) => {\
    console.log("🔍 Checking auth - Session ID:", req.sessionID);\
    console.log("🔍 Authenticated:", req.isAuthenticated ? req.isAuthenticated() : false);\
    console.log("🔍 User in session:", req.user ? "YES" : "NO");\
    \
    if (req.isAuthenticated && req.isAuthenticated() && req.user) {\
      console.log("✅ User is authenticated:", (req.user as any).email);\
      res.json({ \
        user: { \
          id: (req.user as any).id, \
          email: (req.user as any).email, \
          role: (req.user as any).role,\
          fullName: (req.user as any).fullName \
        } \
      });\
    } else {\
      console.log("❌ User not authenticated");\
      res.status(401).json({ error: "Not authenticated" });\
    }\
  });' server/routes.ts
```

### 2. VERIFICAR SESSÕES NO POSTGRESQL

```bash
# Conectar ao PostgreSQL e verificar
psql -U afiliadosbet -h localhost -d afiliadosbetdb

# Ver se tabela sessions existe
\dt

# Se existir, ver conteúdo
SELECT sid, expire FROM sessions ORDER BY expire DESC LIMIT 5;

# Se não existir, criar
CREATE TABLE IF NOT EXISTS sessions (
  sid varchar PRIMARY KEY,
  sess json NOT NULL,
  expire timestamp(6) NOT NULL
);

# Sair do psql
\q
```

### 3. CONFIGURAR AMBIENTE E REINICIAR

```bash
# Parar aplicação
pm2 stop afiliadosbet
pm2 delete afiliadosbet

# Configurar .env com session mais robusta
cat > .env << 'EOF'
NODE_ENV=production
DATABASE_URL=postgresql://afiliadosbet:Alepoker800@localhost:5432/afiliadosbetdb
SESSION_SECRET=afiliadosbet_super_secret_key_$(date +%s)
PORT=3000
HOST=0.0.0.0
SESSION_SECURE=false
SESSION_MAX_AGE=86400000
EOF

# Limpar tudo
rm -rf node_modules dist .vite
npm cache clean --force

# Reinstalar
npm install

# Build
npm run build

# Iniciar com debug de sessão
NODE_ENV=production DEBUG=express-session pm2 start npm --name "afiliadosbet" -- start
```

### 4. TESTAR PASSO A PASSO

```bash
# Ver logs em tempo real
pm2 logs afiliadosbet | grep -E "(auth|session|login)" --line-buffered

# Em outro terminal, testar API
curl -v -c cookies.txt -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@afiliadosbet.com.br","password":"admin123"}'

# Verificar se session foi criada
curl -v -b cookies.txt http://localhost:3000/api/auth/me

# Ver sessões no banco
psql -U afiliadosbet -h localhost -d afiliadosbetdb -c "SELECT COUNT(*) FROM sessions;"
```

## TESTE NO NAVEGADOR

1. **Abrir DevTools** (F12)
2. **Ir para aba Console**
3. **Acessar**: https://afiliadosbet.com.br/auth
4. **Fazer login**: admin@afiliadosbet.com.br / admin123
5. **Observar logs no console**:
   - 🔐 Tentando login...
   - ✅ Login successful
   - 🎉 Login onSuccess
   - 🔄 Redirecionando para: /admin
   - 🚀 Executando redirecionamento...
6. **Aguardar 1 segundo**
7. **Deve ir para /admin e permanecer lá**

## SE AINDA FALHAR

### Debug avançado:
```bash
# Ver configuração de sessão
pm2 show afiliadosbet

# Ver logs específicos
pm2 logs afiliadosbet | grep -E "(Session|session|Session ID)"

# Reiniciar PostgreSQL
systemctl restart postgresql-15

# Reset completo da aplicação
pm2 stop afiliadosbet
pm2 delete afiliadosbet
git reset --hard origin/main
rm -rf node_modules
npm install
npm run build
NODE_ENV=production pm2 start npm --name "afiliadosbet" -- start
```