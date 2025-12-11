using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using StoreManagerApi.Data;
using StoreManagerApi.Models;
using System.Linq;

namespace StoreManagerApi.Controllers;

[Route("api/[controller]")]
[ApiController]
public class ProdutosController : ControllerBase
{
    private readonly AppDbContext _context;

    public ProdutosController(AppDbContext context)
    {
        _context = context;
    }

    // 1. LISTAR TUDO
    [HttpGet]
    public async Task<ActionResult<IEnumerable<Produto>>> GetProdutos()
    {
        return await _context.Produtos
            .Include(p => p.Variantes)
            .ToListAsync();
    }

    // 3. BUSCAR UM (POR ID)
    [HttpGet("{id}")]
    public async Task<ActionResult<Produto>> GetProduto(int id)
    {
        var produto = await _context.Produtos
            .Include(p => p.Variantes)
            .FirstOrDefaultAsync(p => p.Id == id);

        if (produto == null) return NotFound();
        return produto;
    }

    // 4. CRIAR
    [HttpPost]
    public async Task<ActionResult<Produto>> PostProduto(Produto produto)
    {
        _context.Produtos.Add(produto);
        await _context.SaveChangesAsync();
        return CreatedAtAction(nameof(GetProduto), new { id = produto.Id }, produto);
    }
    
    // ... (Métodos 2 e 5 omitidos, mas os deixei no seu código)

    // 6. EDITAR (PUT) - Sincronizado com os 4 campos fixos
    [HttpPut("{id}")]
    public async Task<IActionResult> PutProduto(int id, Produto produto)
    {
        if (id != produto.Id) return BadRequest();

        var produtoExistente = await _context.Produtos
            .Include(p => p.Variantes)
            .FirstOrDefaultAsync(p => p.Id == id);

        if (produtoExistente == null) return NotFound();

        // --- Atualiza dados básicos ---
        produtoExistente.Nome = produto.Nome;
        produtoExistente.Categoria = produto.Categoria;
        produtoExistente.PrecoCusto = produto.PrecoCusto;
        produtoExistente.PrecoVenda = produto.PrecoVenda;
        
        // ⚠️ ATUALIZA OS 4 CAMPOS DE URL DIRETAMENTE
        produtoExistente.FotoUrl = produto.FotoUrl; 
        produtoExistente.FotoSecundariaUrl = produto.FotoSecundariaUrl;
        produtoExistente.FotoTerciariaUrl = produto.FotoTerciariaUrl;
        produtoExistente.FotoQuartaUrl = produto.FotoQuartaUrl;


        // --- ATUALIZA VARIANTES (Mantido) ---
        if (produtoExistente.Variantes != null)
        {
            _context.Variantes.RemoveRange(produtoExistente.Variantes);
        }

        if (produto.Variantes != null)
        {
            foreach (var v in produto.Variantes)
            {
                v.Id = 0; 
                v.ProdutoId = id;
                produtoExistente.Variantes.Add(v);
            }
        }

        try
        {
            _context.Entry(produtoExistente).State = EntityState.Modified;
            await _context.SaveChangesAsync();
        }
        catch (DbUpdateConcurrencyException)
        {
            if (!ProdutoExists(id)) return NotFound();
            else throw;
        }

        return NoContent();
    }

    // ... (Método Delete e ProdutoExists)
    // ...
    private bool ProdutoExists(int id)
    {
        return _context.Produtos.Any(e => e.Id == id);
    }
}