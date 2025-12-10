using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using StoreManagerApi.Data;
using StoreManagerApi.Models;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;

namespace StoreManagerApi.Controllers;

[Route("api/[controller]")]
[ApiController]
public class AuthController : ControllerBase
{
    private readonly AppDbContext _context;

    public AuthController(AppDbContext context)
    {
        _context = context;
    }

    // REGISTRAR (Cria o primeiro usuário)
    [HttpPost("register")]
    public async Task<IActionResult> Register(Usuario usuario)
    {
        _context.Usuarios.Add(usuario);
        await _context.SaveChangesAsync();
        return Ok("Usuário criado com sucesso!");
    }

    // LOGIN (Gera o Token)
    [HttpPost("login")]
    public async Task<IActionResult> Login([FromBody] Usuario login)
    {
        // 1. Verifica se existe no banco
        var usuario = await _context.Usuarios
            .FirstOrDefaultAsync(u => u.Email == login.Email && u.Senha == login.Senha);

        if (usuario == null)
            return Unauthorized("Email ou senha inválidos.");

        // 2. Gera o Token JWT
        var tokenHandler = new JwtSecurityTokenHandler();
        
        // ⚠️ CORREÇÃO FINAL: Força a leitura da Service Role Key (que está em CHAVE_SECRETA_DO_BANCO)
        // O valor é lido do Environment Variable para ser usado como chave de segurança.
        var keyString = Environment.GetEnvironmentVariable("CHAVE_SECRETA_DO_BANCO") ?? "ESTA_E_UMA_CHAVE_MUITO_SECRETA_DO_LUKE_MUKE_SYSTEM_2025";
        
        var key = Encoding.ASCII.GetBytes(keyString);
        
        var tokenDescriptor = new SecurityTokenDescriptor
        {
            Subject = new ClaimsIdentity(new Claim[]
            {
                new Claim(ClaimTypes.Name, usuario.Email)
            }),
            Expires = DateTime.UtcNow.AddHours(8), // Token dura 8 horas
            SigningCredentials = new SigningCredentials(new SymmetricSecurityKey(key), SecurityAlgorithms.HmacSha256Signature)
        };
        var token = tokenHandler.CreateToken(tokenDescriptor);
        var tokenString = tokenHandler.WriteToken(token);

        // 3. Devolve o token para o React
        return Ok(new { token = tokenString, email = usuario.Email });
    }
}
