# 📋 RELATÓRIO COMPLETO DO PROJETO - LUKE MUKE SYSTEM

**Data do Relatório:** 8 de dezembro de 2025  
**Problema Relatado:** Erro "Acesso Negado" ao fazer login após deploy no GitHub, Render, Vercel e Supabase  
**Observação Crítica:** A senha no `appsettings.json` é falsa; a conexão real usa User Secrets

---

## 🎯 RESUMO EXECUTIVO

O Luke Muke System é um ERP completo para gestão de atelier de moda masculina, desenvolvido com:

- **Backend:** ASP.NET Core 8.0 (C#) - Hospedado no Render
- **Frontend:** React + Vite - Hospedado na Vercel
- **Banco de Dados:** PostgreSQL no Supabase
- **Autenticação:** JWT (JSON Web Token)

### ⚠️ PROBLEMA ATUAL

O sistema funciona localmente, mas ao fazer deploy nas plataformas de nuvem, o login retorna **"Acesso Negado"**.

---

## 🏗️ ARQUITETURA DO SISTEMA

### 1. ESTRUTURA DO BACKEND (API .NET)

**Localização:** `StoreManagerApi/`

#### 1.1 Program.cs - Configuração Principal

```csharp
// Chave JWT hardcoded (⚠️ ALERTA DE SEGURANÇA)
var key = Encoding.ASCII.GetBytes("ESTA_E_UMA_CHAVE_MUITO_SECRETA_DO_LUKE_MUKE_SYSTEM_2025");

// Configuração do Banco de Dados
builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseNpgsql(builder.Configuration.GetConnectionString("DefaultConnection")));

// CORS - Permite qualquer origem (⚠️ MUITO PERMISSIVO)
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowReactApp", builder =>
    {
        builder.SetIsOriginAllowed(origin => true)
               .AllowAnyHeader()
               .AllowAnyMethod();
    });
});
```

**⚠️ PONTOS CRÍTICOS:**

- A chave JWT está hardcoded no código (deveria estar em User Secrets ou variáveis de ambiente)
- CORS muito permissivo (aceita qualquer origem)
- Connection String vem do `appsettings.json` (mas você usa User Secrets localmente)

#### 1.2 appsettings.json

```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Server=db.supabase.co;Database=postgres;User Id=postgres;Password=SENHA_FALSA_PARA_GITHUB;"
  }
}
```

**⚠️ PROBLEMA IDENTIFICADO:**

- A senha é falsa (conforme você informou)
- No Render, a API provavelmente NÃO está usando User Secrets
- A API não consegue conectar ao banco → Login falha

#### 1.3 Dockerfile

```dockerfile
ENV ASPNETCORE_URLS=http://+:8080
EXPOSE 8080
```

**✅ Configuração correta** para o Render (porta 8080)

---

### 2. CONTROLADOR DE AUTENTICAÇÃO

**Arquivo:** `Controllers/AuthController.cs`

#### 2.1 Endpoint de Login

```csharp
[HttpPost("login")]
public async Task<IActionResult> Login([FromBody] Usuario login)
{
    // 1. Busca usuário no banco (comparação PLAINTEXT de senha ⚠️)
    var usuario = await _context.Usuarios
        .FirstOrDefaultAsync(u => u.Email == login.Email && u.Senha == login.Senha);

    if (usuario == null)
        return Unauthorized("Email ou senha inválidos.");

    // 2. Gera Token JWT
    var tokenHandler = new JwtSecurityTokenHandler();
    var key = Encoding.ASCII.GetBytes("ESTA_E_UMA_CHAVE_MUITO_SECRETA_DO_LUKE_MUKE_SYSTEM_2025");
    var tokenDescriptor = new SecurityTokenDescriptor
    {
        Subject = new ClaimsIdentity(new Claim[]
        {
            new Claim(ClaimTypes.Name, usuario.Email)
        }),
        Expires = DateTime.UtcNow.AddHours(8),
        SigningCredentials = new SigningCredentials(
            new SymmetricSecurityKey(key),
            SecurityAlgorithms.HmacSha256Signature)
    };
    var token = tokenHandler.CreateToken(tokenDescriptor);
    var tokenString = tokenHandler.WriteToken(token);

    return Ok(new { token = tokenString, email = usuario.Email });
}
```

**⚠️ VULNERABILIDADES DE SEGURANÇA:**

1. **Senha em texto plano** (não usa hash bcrypt/argon2)
2. **Chave JWT hardcoded** (mesma em todos os ambientes)
3. **Comparação direta de senha** sem salt

---

### 3. MODELOS DE DADOS

#### 3.1 Usuario.cs

```csharp
public class Usuario
{
    public int Id { get; set; }
    public string Email { get; set; } = string.Empty;
    public string Senha { get; set; } = string.Empty; // ⚠️ Texto plano
}
```

#### 3.2 Produto.cs

```csharp
public class Produto
{
    public int Id { get; set; }
    public string Nome { get; set; } = string.Empty;
    public string Categoria { get; set; } = string.Empty;
    [Column(TypeName = "decimal(18,2)")]
    public decimal PrecoCusto { get; set; }
    [Column(TypeName = "decimal(18,2)")]
    public decimal PrecoVenda { get; set; }
    public string? FotoUrl { get; set; }
    public List<Variante> Variantes { get; set; } = new();
}
```

#### 3.3 Variante.cs (Sistema de Grade)

```csharp
public class Variante
{
    public int Id { get; set; }
    public string Tamanho { get; set; } = string.Empty; // P, M, G
    public string Cor { get; set; } = string.Empty;
    public int QuantidadeEstoque { get; set; }
    public int ProdutoId { get; set; }
    [JsonIgnore]
    public Produto? Produto { get; set; }
}
```

#### 3.4 Venda.cs

```csharp
public class Venda
{
    public int Id { get; set; }
    public DateTime DataVenda { get; set; }
    public decimal ValorTotal { get; set; }
}
```

---

### 4. MIGRAÇÕES DO BANCO DE DADOS

**Migrações Aplicadas:**

1. `20251207220216_InitialCreate` - Criação inicial (Produtos, Variantes)
2. `20251208023108_AddVendas` - Adição da tabela Vendas
3. `20251208023821_AddTableVendas` - Ajuste da tabela Vendas
4. `20251208041824_AddUsuario` - **Criação da tabela Usuarios**

**⚠️ VERIFICAÇÃO NECESSÁRIA:**

- Confirmar se as migrations foram executadas no banco Supabase
- Verificar se existe algum usuário cadastrado na tabela `Usuarios`

---

## 🎨 ESTRUTURA DO FRONTEND (REACT)

### 1. CONFIGURAÇÃO DA API

**Arquivo:** `store-manager-web/src/services/api.js`

```javascript
export const api = axios.create({
  baseURL: "https://lukemuke-system.onrender.com/api", // ✅ URL do Render
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("luke_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
```

**✅ Configuração correta:** Aponta para o Render

---

### 2. COMPONENTE DE LOGIN

**Arquivo:** `store-manager-web/src/pages/Auth/Login.jsx`

```javascript
const handleLogin = async (data) => {
  try {
    const response = await api.post("/auth/login", {
      email: data.email,
      senha: data.password, // ✅ Mapeia 'password' → 'senha'
    });

    const { token } = response.data;
    localStorage.setItem("luke_token", token);
    navigate("/dashboard");
  } catch (error) {
    console.error(error);
    alert("Acesso negado! Verifique seu email e senha."); // ⚠️ Mensagem genérica
  }
};
```

**⚠️ PROBLEMA:**

- O erro "Acesso negado" pode vir de:
  1. API não consegue conectar ao banco (connection string inválida)
  2. Usuário não existe no banco de produção
  3. Senha incorreta
  4. CORS bloqueando a requisição

---

### 3. ROTAS DO SISTEMA

**Arquivo:** `store-manager-web/src/routes/AppRoutes.jsx`

```javascript
<Routes>
  {/* Área Pública */}
  <Route path="/loja" element={<Vitrine />} />

  {/* Área Restrita (Admin) */}
  <Route path="/" element={<Login />} />
  <Route path="/dashboard" element={<Dashboard />} />
  <Route path="/products" element={<ProductList />} />
  <Route path="/products/new" element={<ProductForm />} />
  <Route path="/sales" element={<Sales />} />
  <Route path="/products/edit/:id" element={<ProductForm />} />
</Routes>
```

**⚠️ SEM PROTEÇÃO:** As rotas `/dashboard`, `/products` etc. não têm PrivateRoute (qualquer um pode acessar se souber a URL)

---

## 🔍 DIAGNÓSTICO DO PROBLEMA "ACESSO NEGADO"

### CENÁRIO ATUAL

1. **Frontend (Vercel):** `https://seu-app.vercel.app`
2. **Backend (Render):** `https://lukemuke-system.onrender.com`
3. **Banco (Supabase):** `db.supabase.co`

### POSSÍVEIS CAUSAS DO ERRO

#### ❌ CAUSA 1: Connection String Inválida no Render

**Sintoma:** API não consegue conectar ao banco  
**Explicação:**

- Localmente você usa **User Secrets** com a senha real
- No `appsettings.json` a senha é `SENHA_FALSA_PARA_GITHUB`
- O Render está tentando usar essa senha falsa
- Resultado: `_context.Usuarios.FirstOrDefaultAsync()` lança exceção

**Solução:**

```bash
# No painel do Render, adicionar variável de ambiente:
ConnectionStrings__DefaultConnection=Server=db.supabase.co;Database=postgres;User Id=postgres;Password=SUA_SENHA_REAL;
```

---

#### ❌ CAUSA 2: Tabela Usuarios Vazia no Supabase

**Sintoma:** Login retorna "Email ou senha inválidos"  
**Explicação:**

- As migrations podem não ter sido executadas no Supabase
- Ou você não criou nenhum usuário no ambiente de produção

**Como Verificar:**

```sql
-- No painel do Supabase, executar:
SELECT * FROM "Usuarios";
```

**Solução:**

```bash
# Criar usuário via endpoint /auth/register
POST https://lukemuke-system.onrender.com/api/auth/register
{
  "email": "admin@lukemuke.com",
  "senha": "suasenha123"
}
```

---

#### ❌ CAUSA 3: CORS Bloqueando Requisição

**Sintoma:** Erro no Console do navegador (F12)  
**Mensagem:** `CORS policy: No 'Access-Control-Allow-Origin' header`

**Verificação:**

```javascript
// Abra F12 no navegador e veja se há erro CORS
// Se houver, o backend não está respondendo corretamente
```

**Solução:** O código já tem `SetIsOriginAllowed(origin => true)`, mas pode estar faltando `app.UseCors("AllowReactApp")` antes de `app.UseAuthentication()`

---

#### ❌ CAUSA 4: Chave JWT Diferente entre Ambientes

**Sintoma:** Token gerado, mas não validado  
**Explicação:**

- Se você alterou a chave JWT em produção (via User Secrets), mas o código hardcoded tem outra chave, o token não será aceito

**Solução:** Usar a **mesma chave** em todos os ambientes (ou mover para variável de ambiente)

---

#### ❌ CAUSA 5: Render em "Sleeping Mode"

**Sintoma:** Primeira requisição demora muito ou falha  
**Explicação:**

- Planos gratuitos do Render hibernam após 15 min de inatividade
- A primeira chamada pode dar timeout

**Solução:**

- Aguardar 30-60 segundos após fazer a primeira requisição
- Ou usar um serviço de "keep-alive" (ping a cada 10 minutos)

---

## 🛠️ CHECKLIST DE VERIFICAÇÃO

### NO RENDER (Backend)

- [ ] **Variáveis de Ambiente Configuradas:**

  ```
  ConnectionStrings__DefaultConnection=Server=db.supabase.co;Database=postgres;User Id=postgres;Password=SENHA_REAL_AQUI;
  ASPNETCORE_ENVIRONMENT=Production
  ```

- [ ] **Build Bem-sucedido:**

  - Verificar logs do Render para erros de build
  - Confirmar que o container subiu na porta 8080

- [ ] **Endpoint de Health Check:**
  ```bash
  curl https://lukemuke-system.onrender.com/api/produtos/dashboard
  # Deve retornar JSON com totalProdutos, valorEstoque, vendasHoje
  ```

### NO SUPABASE (Banco de Dados)

- [ ] **Migrations Aplicadas:**

  ```sql
  -- Verificar se tabelas existem
  SELECT table_name FROM information_schema.tables
  WHERE table_schema = 'public';

  -- Deve retornar: Produtos, Variantes, Vendas, Usuarios
  ```

- [ ] **Usuário Cadastrado:**

  ```sql
  SELECT * FROM "Usuarios";
  -- Se vazio, criar via API ou manualmente
  ```

- [ ] **Permissões de Firewall:**
  - Supabase permite conexões de qualquer IP por padrão
  - Verificar se o IP do Render não está bloqueado

### NA VERCEL (Frontend)

- [ ] **Variáveis de Ambiente (se necessário):**

  ```
  VITE_API_URL=https://lukemuke-system.onrender.com/api
  ```

  _(Atualmente está hardcoded no `api.js`, mas ideal seria usar variável)_

- [ ] **Build Bem-sucedido:**
  - Verificar logs da Vercel
  - Confirmar que o `baseURL` no `api.js` está correto

### NO NAVEGADOR (Cliente)

- [ ] **Console de Erros (F12 → Console):**

  - Procurar por erros CORS
  - Verificar se a requisição POST chegou no backend
  - Ver o status HTTP retornado (401? 500? 404?)

- [ ] **Network Tab (F12 → Rede):**
  - Verificar a requisição `POST /api/auth/login`
  - Ver o corpo da resposta (se houver erro detalhado)

---

## 🔐 RECOMENDAÇÕES DE SEGURANÇA

### CRÍTICO (Resolver ANTES de produção)

1. **Hash de Senhas:**

   ```csharp
   // Usar BCrypt.Net-Next
   using BCrypt.Net;

   // Ao cadastrar:
   usuario.Senha = BCrypt.HashPassword(senha);

   // Ao logar:
   if (!BCrypt.Verify(login.Senha, usuario.Senha))
       return Unauthorized();
   ```

2. **Mover Chave JWT para Variável de Ambiente:**

   ```csharp
   // Program.cs
   var jwtKey = builder.Configuration["JwtKey"]
       ?? throw new Exception("JWT Key não configurada!");
   var key = Encoding.ASCII.GetBytes(jwtKey);
   ```

3. **CORS Restrito:**

   ```csharp
   options.AddPolicy("AllowReactApp", builder =>
   {
       builder.WithOrigins("https://seu-app.vercel.app")
              .AllowAnyHeader()
              .AllowAnyMethod();
   });
   ```

4. **HTTPS Obrigatório:**
   ```csharp
   x.RequireHttpsMetadata = true; // Ativar em produção
   ```

---

## 📝 SCRIPT DE TESTE RÁPIDO

### Teste 1: Verificar se a API está online

```bash
curl https://lukemuke-system.onrender.com/api/produtos/dashboard
```

**Resultado Esperado:**

```json
{ "totalProdutos": 5, "valorEstoque": 1500.0, "vendasHoje": 0 }
```

**Se falhar:** A API não está respondendo (problema no Render)

---

### Teste 2: Tentar Criar um Usuário

```bash
curl -X POST https://lukemuke-system.onrender.com/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"teste@lukemuke.com","senha":"senha123"}'
```

**Resultado Esperado:**

```
Usuário criado com sucesso!
```

**Se falhar com erro 500:** Problema na connection string (banco não conecta)

---

### Teste 3: Tentar Logar

```bash
curl -X POST https://lukemuke-system.onrender.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"teste@lukemuke.com","senha":"senha123"}'
```

**Resultado Esperado:**

```json
{ "token": "eyJhbGciOiJIUzI1NiIs...", "email": "teste@lukemuke.com" }
```

**Se falhar com "Email ou senha inválidos":** Usuário não existe ou senha errada

---

## 🎯 PLANO DE AÇÃO IMEDIATO

### PASSO 1: Configurar Connection String no Render

1. Acessar painel do Render
2. Ir em **Environment Variables**
3. Adicionar:
   ```
   Chave: ConnectionStrings__DefaultConnection
   Valor: Server=db.supabase.co;Database=postgres;User Id=postgres;Password=SENHA_REAL_SUPABASE;
   ```
4. Salvar e **fazer redeploy**

### PASSO 2: Verificar Banco de Dados

1. Abrir painel do Supabase
2. SQL Editor → executar:
   ```sql
   SELECT * FROM "Usuarios";
   ```
3. Se vazio, executar:
   ```sql
   INSERT INTO "Usuarios" ("Email", "Senha")
   VALUES ('admin@lukemuke.com', 'senha123');
   ```

### PASSO 3: Testar Login

1. Abrir `https://seu-app.vercel.app`
2. Tentar login com:
   - Email: `admin@lukemuke.com`
   - Senha: `senha123`
3. Abrir F12 → Console e verificar erros

### PASSO 4: Verificar Logs do Render

1. No painel do Render, clicar em **Logs**
2. Procurar por:
   - Erros de conexão com banco
   - Exceções não tratadas
   - Timeout de requisições

---

## 📊 ESTRUTURA COMPLETA DE PASTAS

```
SistemadeVendaDT/
├── StoreManagerApi/                    # Backend .NET
│   ├── Controllers/
│   │   ├── AuthController.cs          # Login/Register
│   │   └── ProdutosController.cs      # CRUD Produtos
│   ├── Data/
│   │   └── AppDbContext.cs            # EF Core Context
│   ├── Models/
│   │   ├── Usuario.cs                 # Model de Autenticação
│   │   ├── Produto.cs                 # Produto Pai
│   │   ├── Variantes.cs               # Grades (Tamanho/Cor)
│   │   └── Venda.cs                   # Registro de Vendas
│   ├── Migrations/                    # Histórico do Banco
│   │   └── 20251208041824_AddUsuario.cs
│   ├── Program.cs                     # Configuração Principal
│   ├── appsettings.json               # Config (senha falsa)
│   ├── Dockerfile                     # Containerização
│   └── StoreManagerApi.csproj         # Dependências NuGet
│
├── store-manager-web/                 # Frontend React
│   ├── src/
│   │   ├── pages/
│   │   │   ├── Auth/Login.jsx         # Tela de Login
│   │   │   ├── Dashboard/Dashboard.jsx
│   │   │   ├── Products/
│   │   │   │   ├── ProductList.jsx
│   │   │   │   └── ProductForm.jsx
│   │   │   ├── Sales/Sales.jsx        # PDV
│   │   │   └── Shop/Vitrine.jsx       # Catálogo Público
│   │   ├── services/
│   │   │   └── api.js                 # Axios + Interceptors
│   │   └── routes/
│   │       └── AppRoutes.jsx          # Roteamento
│   ├── package.json                   # Dependências NPM
│   └── vite.config.js                 # Bundler Config
│
└── readme.md                          # Documentação
```

---

## 🔗 URLs DO PROJETO

| Ambiente           | URL                                            | Status Esperado |
| ------------------ | ---------------------------------------------- | --------------- |
| Frontend (Vercel)  | `https://seu-dominio.vercel.app`               | 🟢 Online       |
| Backend (Render)   | `https://lukemuke-system.onrender.com`         | 🟢 Online       |
| API Docs (Swagger) | `https://lukemuke-system.onrender.com/swagger` | 🟡 Só em Dev    |
| Banco (Supabase)   | `db.supabase.co:5432`                          | 🟢 Online       |

---

## 📞 INFORMAÇÕES ADICIONAIS

### Dependências do Backend (.NET)

- Microsoft.EntityFrameworkCore 8.0.0
- Npgsql.EntityFrameworkCore.PostgreSQL 8.0.0
- Microsoft.AspNetCore.Authentication.JwtBearer 8.0.0
- Swashbuckle.AspNetCore 6.6.2

### Dependências do Frontend (NPM)

- React 19.2.0
- React Router DOM 7.10.1
- Axios 1.13.2
- React Hook Form 7.68.0
- Recharts 3.5.1 (gráficos)
- Tailwind CSS 3.4.17

### User Secrets ID

```
cbe47a23-6b3a-47e4-87f0-62aa989eb891
```

---

## 🚨 ALERTAS FINAIS

1. **NUNCA COMMITAR** senhas reais no GitHub
2. **SEMPRE USAR** variáveis de ambiente em produção
3. **MIGRAR URGENTE** para hash de senhas (BCrypt)
4. **ADICIONAR** logging detalhado no backend para debug
5. **IMPLEMENTAR** PrivateRoute no frontend
6. **CONFIGURAR** HTTPS obrigatório em produção

---

## 📬 PRÓXIMOS PASSOS RECOMENDADOS

1. ✅ Configurar variáveis de ambiente no Render
2. ✅ Verificar se usuário existe no Supabase
3. ✅ Testar endpoints com Postman/cURL
4. ✅ Implementar hash de senhas
5. ✅ Adicionar logging com Serilog
6. ✅ Proteger rotas do frontend
7. ✅ Adicionar validação de email no backend
8. ✅ Criar endpoint `/health` para monitoramento

---

**FIM DO RELATÓRIO**

_Gerado automaticamente para auxiliar na resolução do problema de "Acesso Negado" no sistema Luke Muke._
