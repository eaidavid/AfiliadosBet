# Configuração da API Lotogreen - Painel Dedicado

## Informações necessárias do gerente da Lotogreen:

### 1. URL da API específica
**Pergunta:** Qual é a URL base da API do painel dedicado da Lotogreen?
- Exemplos possíveis:
  - `https://lotogreen.smartico.ai`
  - `https://api-lotogreen.smartico.com`
  - `https://panel.lotogreen.com/api`
  - Uma URL customizada específica

**Atual:** `https://boapi.smartico.ai` (URL genérica que não funciona)

### 2. Endpoints disponíveis
**Pergunta:** Quais endpoints estão disponíveis para buscar dados de conversões?
- Solicite a lista completa de endpoints
- Exemplos que podem existir:
  - `/api/v1/conversions`
  - `/conversions`
  - `/affiliate/stats`
  - `/reports/data`

### 3. Autenticação
**Pergunta:** Como deve ser feita a autenticação nas requisições?
- API Key atual: `a5d6e4d4-42fe-11f0-b046-027e66b7665d-524277`
- Método atual: Bearer token ou X-API-Key header
- Confirmar se está correto ou se precisa de ajustes

### 4. Parâmetros necessários
**Pergunta:** Quais parâmetros são obrigatórios nas requisições?
- Filtros de data (date_from, date_to)
- Paginação (limit, offset)
- Identificadores específicos
- Outros parâmetros customizados

### 5. Formato de resposta
**Pergunta:** Qual o formato dos dados retornados?
- Estrutura JSON
- Campos disponíveis
- Exemplo de resposta da API

## Status atual:
- ✅ Conexão básica funcionando (endpoint /health)
- ✅ Autenticação aceita
- ❌ Endpoints de dados retornam 404
- ❌ URL pode estar incorreta para o painel específico

## Próximos passos:
1. Obter URL correta do painel dedicado
2. Confirmar endpoints disponíveis
3. Testar com credenciais corretas
4. Configurar no sistema AfiliadosBet