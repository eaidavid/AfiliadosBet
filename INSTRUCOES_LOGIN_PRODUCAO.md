# 🔧 CORREÇÃO DE LOGIN EM PRODUÇÃO

## Problema
O login não redireciona após clicar em "Entrar" - fica carregando e volta para tela de login.

## Causa
Frontend não está detectando corretamente o sucesso do login devido a problemas na comunicação com sessões.

## Solução Aplicada
✅ Corrigido hook de login para usar fetch direto com credentials: "include"
✅ Melhorado tratamento de redirecionamento
✅ Adicionado logs para debug
✅ Forçado redirecionamento com window.location.href

## Para Testar
1. Acesse o site
2. Use as credenciais:
   - **Admin**: admin@afiliadosbet.com.br / admin123
   - **Afiliado**: afiliado@afiliadosbet.com.br / admin123

## Se Ainda Não Funcionar
Execute no servidor:

```bash
cd /var/www/afiliadosbet
pm2 logs afiliadosbet --lines 50
```

Procure por:
- "Login successful" nos logs do navegador (F12 → Console)
- Erros de sessão nos logs do PM2

## Debug Adicional
No navegador (F12 → Console), execute:
```javascript
// Teste direto da API
fetch('/api/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  credentials: 'include',
  body: JSON.stringify({
    email: 'admin@afiliadosbet.com.br',
    password: 'admin123'
  })
}).then(r => r.json()).then(console.log);
```

## Credenciais de Teste
- **Admin**: admin@afiliadosbet.com.br / admin123
- **Afiliado**: afiliado@afiliadosbet.com.br / admin123