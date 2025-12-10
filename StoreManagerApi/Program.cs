using System.Text;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using StoreManagerApi.Data;

var builder = WebApplication.CreateBuilder(args);

// =================================================================================
// 1. CONFIGURAÇÃO DO BANCO DE DADOS (COM DIAGNÓSTICO)
// =================================================================================

// Pega a string do arquivo (ESTA É A CHAVE DO POOLER, USADA EM TEMPO REAL)
var stringConexao = builder.Configuration.GetConnectionString("ConexaoSupabase");

// IMPRIME NO CONSOLE O QUE ELE LEU
Console.WriteLine("==================================================");
Console.WriteLine($"[DIAGNÓSTICO] O SISTEMA LEU DO ARQUIVO:");
Console.WriteLine(stringConexao);
Console.WriteLine("==================================================");

// Usa a string lida (Pooler) para a operação normal da API
builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseNpgsql(stringConexao));



// 2. Configuração do JWT (Segurança)
// A chave é lida da variável de ambiente CHAVE_SECRETA_JWT no Vercel
var chaveSecreta = builder.Configuration["CHAVE_SECRETA_JWT"]; 
// Se não encontrar a variável, usa a chave hardcoded como fallback para não quebrar
var key = Encoding.ASCII.GetBytes(chaveSecreta ?? "ESTA_E_UMA_CHAVE_MUITO_SECRETA_DO_LUKE_MUKE_SYSTEM_2025");

builder.Services.AddAuthentication(x =>
{
    x.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    x.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
})
.AddJwtBearer(x =>
{
    x.RequireHttpsMetadata = false;
    x.SaveToken = true;
    x.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuerSigningKey = true,
        IssuerSigningKey = new SymmetricSecurityKey(key),
        ValidateIssuer = false,
        ValidateAudience = false
    };
});

// 3. Configuração do CORS
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowReactApp", builder =>
    {
        builder.SetIsOriginAllowed(origin => true)
                .AllowAnyHeader()
                .AllowAnyMethod();
    });
});

builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

var app = builder.Build();

// =================================================================================
// --- MIGRAÇÃO FORÇADA (USA CONEXÃO DIRETA DO AMBIENTE) ---
// =================================================================================
using (var scope = app.Services.CreateScope())
{
    var services = scope.ServiceProvider;
    try
    {
        var context = services.GetRequiredService<AppDbContext>();

        // ⚠️ Tenta pegar a string de conexão direta do Vercel
        var migrationConnectionString = builder.Configuration["MIGRATION_CONNECTION_STRING"];

        if (!string.IsNullOrEmpty(migrationConnectionString))
        {
            // Se a string direta existir, força o contexto a usá-la.
            // Isso evita o cache do Pooler (aws-1) para a migração.
            context.Database.SetConnectionString(migrationConnectionString);
        }
        
        // Executa a migração com a conexão mais forte disponível
        context.Database.Migrate();
        Console.WriteLine("✅ SUCESSO! Banco de dados conectado e migrado!");
    }
    catch (Exception ex)
    {
        var logger = services.GetRequiredService<ILogger<Program>>();
        logger.LogError(ex, "❌ ERRO CRÍTICO AO CONECTAR.");
    }
}
// --- FIM MIGRAÇÃO FORÇADA ---

// Pipeline
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseCors("AllowReactApp");
app.UseAuthentication();
app.UseAuthorization();
app.MapControllers();

app.Run();
