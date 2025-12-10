using System.Text;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using StoreManagerApi.Data;

var builder = WebApplication.CreateBuilder(args);

// =================================================================================
// 1. CONFIGURAÇÃO DO BANCO DE DADOS (AGORA SÓ USA UMA CHAVE: ConexaoSupabase)
// =================================================================================

// Pega a string do arquivo (AGORA ESTA CHAVE DEVE TER O ENDEREÇO DIRETO)
var stringConexao = builder.Configuration.GetConnectionString("ConexaoSupabase");

// IMPRIME NO CONSOLE O QUE ELE LEU
Console.WriteLine("==================================================");
Console.WriteLine($"[DIAGNÓSTICO] O SISTEMA LEU DO ARQUIVO:");
Console.WriteLine(stringConexao);
Console.WriteLine("==================================================");

// Usa a única string lida para todas as operações
builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseNpgsql(stringConexao));



// 2. Configuração do JWT (Segurança)
// A chave é lida da variável de ambiente CHAVE_SECRETA_JWT no Vercel
var chaveSecreta = builder.Configuration["CHAVE_SECRETA_JWT"]; 
// Se não encontrar a variável, usa a chave hardcoded como fallback
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
    x.TokenValidationParameters = new ValidationParameters
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
// --- MIGRAÇÃO AUTOMÁTICA (SIMPLIFICADA) ---
// =================================================================================
using (var scope = app.Services.CreateScope())
{
    var services = scope.ServiceProvider;
    try
    {
        var context = services.GetRequiredService<AppDbContext>();
        // Agora que a stringConexao (ConexaoSupabase) é a chave Direta,
        // a migração será feita de forma estável.
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
