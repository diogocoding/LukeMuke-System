using Microsoft.EntityFrameworkCore;
using StoreManagerApi.Models;

namespace StoreManagerApi.Data;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

    public DbSet<Produto> Produtos { get; set; }
    public DbSet<Variante> Variantes { get; set; }
    public DbSet<Venda> Vendas { get; set; }
    public DbSet<Usuario> Usuarios { get; set; }
    
}
