using System.Text;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using StoreManagerApi.Data;
// ❌ REMOVA QUALQUER USING QUE APONTE PARA StoreManagerApi.Models;

var builder = WebApplication.CreateBuilder(args);

// =================================================================================
// 1. CONFIGURAÇÃO DO BANCO DE DADOS
// =================================================================================

// Pega a string de conexão (Conexão Direta: db.tmhtk...)
var stringConexao = builder.Configuration.GetConnectionString("ConexaoSupabase");

// DIAGNÓSTICO
Console.WriteLine("==================================================");
Console.WriteLine($"[DIAGNÓSTICO] O SISTEMA LEU DO ARQUIVO:");
Console.WriteLine(stringConexao);
Console.WriteLine("==================================================");

// Usa a string lida para todas as operações
builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseNpgsql(stringConexao));



// 2. Configuração do JWT (Segurança)
// Lendo a CHAVE_SECRETA_DO_BANCO (Service Role Key)
var chaveDeSeguranca = Environment.GetEnvironmentVariable("CHAVE_SECRETA_DO_BANCO");

var key = Encoding.ASCII.GetBytes(chaveDeSeguranca ?? "ESTA_E_UMA_CHAVE_MUITO_SECRETA_DO_LUKE_MUKE_SYSTEM_2025");

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
// --- MIGRAÇÃO AUTOMÁTICA ---
// =================================================================================
using (var scope = app.Services.CreateScope())
{
    var services = scope.ServiceProvider;
    try
    {
        var context = services.GetRequiredService<AppDbContext>();
        context.Database.Migrate(); 
        Console.WriteLine("✅ SUCESSO! Banco de dados conectado e migrado!");
    }
    catch (Exception ex)
    {
        var logger = services.GetRequiredService<ILogger<Program>>();
        logger.LogError(ex, "❌ ERRO CRÍTICO AO CONECTAR.");
    }
}
// --- FIM MIGRAÇÃO AUTOMÁTICA ---

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