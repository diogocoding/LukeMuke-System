using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using StoreManagerApi.Data;
using StoreManagerApi.Models;

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
            .Include(p => p.Fotos) // <--- Inclui as fotos na listagem geral
            .ToListAsync();
    }

    // 2. DASHBOARD
    [HttpGet("dashboard")]
    public async Task<ActionResult<dynamic>> GetDashboardStats()
    {
        var totalProdutos = await _context.Produtos.CountAsync();
        var valorEstoque = await _context.Produtos.SumAsync(p => p.PrecoVenda);
        var hoje = DateTime.UtcNow.Date;
        var vendasHoje = await _context.Vendas.CountAsync(v => v.DataVenda.Date == hoje);

        return new { totalProdutos, valorEstoque, vendasHoje };
    }

    // 3. BUSCAR UM (POR ID)
    [HttpGet("{id}")]
    public async Task<ActionResult<Produto>> GetProduto(int id)
    {
        var produto = await _context.Produtos
            .Include(p => p.Variantes)
            .Include(p => p.Fotos) // <--- Essencial para carregar as fotos na tela de edição
            .FirstOrDefaultAsync(p => p.Id == id);

        if (produto == null) return NotFound();

        return produto;
    }

    // 4. CRIAR
    [HttpPost]
    public async Task<ActionResult<Produto>> PostProduto(Produto produto)
    {
        // O EF Core identifica automaticamente as fotos na lista produto.Fotos
        // e as salva na tabela ProdutoFotos
        _context.Produtos.Add(produto);
        await _context.SaveChangesAsync();

        return CreatedAtAction(nameof(GetProduto), new { id = produto.Id }, produto);
    }

    // 5. CHECKOUT
    [HttpPost("checkout")]
    public async Task<IActionResult> Checkout([FromBody] List<int> productIds)
    {
        var produtos = await _context.Produtos.Where(p => productIds.Contains(p.Id)).ToListAsync();
        if (!produtos.Any()) return BadRequest("Carrinho vazio.");

        decimal total = produtos.Sum(p => p.PrecoVenda);
        var venda = new Venda { ValorTotal = total, DataVenda = DateTime.UtcNow };
        
        _context.Vendas.Add(venda);
        await _context.SaveChangesAsync();

        return Ok(new { message = "Venda registrada!" });
    }

    // 6. EDITAR
    [HttpPut("{id}")]
    public async Task<IActionResult> PutProduto(int id, Produto produto)
    {
        if (id != produto.Id) return BadRequest();

        var produtoExistente = await _context.Produtos
            .Include(p => p.Variantes)
            .Include(p => p.Fotos) // <--- Carrega as antigas para poder remover
            .FirstOrDefaultAsync(p => p.Id == id);

        if (produtoExistente == null) return NotFound();

        // --- Atualiza dados básicos ---
        produtoExistente.Nome = produto.Nome;
        produtoExistente.Categoria = produto.Categoria;
        produtoExistente.PrecoCusto = produto.PrecoCusto;
        produtoExistente.PrecoVenda = produto.PrecoVenda;
        produtoExistente.FotoUrl = produto.FotoUrl; // Capa principal

        // --- ATUALIZA VARIANTES ---
        if (produtoExistente.Variantes != null)
        {
            _context.Variantes.RemoveRange(produtoExistente.Variantes);
        }
        
        if (produto.Variantes != null)
        {
            foreach (var v in produto.Variantes)
            {
                v.Id = 0; // Zera o ID para forçar inserção
                v.ProdutoId = id;
                produtoExistente.Variantes.Add(v);
            }
        }

        // --- ATUALIZA FOTOS (NOVO) ---
        if (produtoExistente.Fotos != null)
        {
             // Remove todas as fotos antigas do banco
            _context.ProdutoFotos.RemoveRange(produtoExistente.Fotos);
        }

        if (produto.Fotos != null)
        {
            foreach (var f in produto.Fotos)
            {
                f.Id = 0; // Zera o ID para garantir que o banco crie novas linhas
                f.ProdutoId = id;
                produtoExistente.Fotos.Add(f);
            }
        }

        try
        {
            await _context.SaveChangesAsync();
        }
        catch (DbUpdateConcurrencyException)
        {
            if (!ProdutoExists(id)) return NotFound();
            else throw;
        }

        return NoContent();
    }

    // 7. DELETAR
    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteProduto(int id)
    {
        var produto = await _context.Produtos.FindAsync(id);
        if (produto == null) return NotFound();

        _context.Produtos.Remove(produto);
        await _context.SaveChangesAsync();
        return NoContent();
    }

    private bool ProdutoExists(int id)
    {
        return _context.Produtos.Any(e => e.Id == id);
    }
}
