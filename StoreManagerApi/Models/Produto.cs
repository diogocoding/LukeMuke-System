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
    
    // ⚠️ CORREÇÃO CRÍTICA: Ignora este campo ao receber o JSON do React.
    // Isso evita que a string 'FotoUrl' (a capa) sobrescreva a coleção 'Fotos'.
    [JsonIgnore] 
    public string? FotoUrl { get; set; } 
    
    // NOVA LISTA: Onde ficam todas as fotos do carrossel
    public List<ProdutoFoto> Fotos { get; set; } = new();

    // Relacionamento com Variantes (que já existia)
    public List<Variante> Variantes { get; set; } = new();
}
