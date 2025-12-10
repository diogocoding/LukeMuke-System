using System.ComponentModel.DataAnnotations.Schema;
using System.Collections.Generic;
using System.Text.Json.Serialization;

namespace StoreManagerApi.Models;

public class Produto
{
    public int Id { get; set; }
    
    public string Nome { get; set; } = string.Empty;
    
    public string Categoria { get; set; } = string.Empty;

    [Column(TypeName = "decimal(18,2)")]
    public decimal PrecoCusto { get; set; }

    [Column(TypeName = "decimal(18,2)")]
    public decimal PrecoVenda { get; set; }
    
    // Mantemos esse campo para ser a "Capa" do produto (a primeira foto)
    public string? FotoUrl { get; set; } 
    
    // NOVA LISTA: Onde ficam todas as fotos do carrossel
    public List<ProdutoFoto> Fotos { get; set; } = new();

    // Relacionamento com Variantes (que já existia)
    public List<Variante> Variantes { get; set; } = new();
}
