using System.ComponentModel.DataAnnotations.Schema;
using System.Collections.Generic;
using System.Text.Json.Serialization; // Necessário para evitar loops no JSON

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
    
    // CORREÇÃO 1: Adicionei o '?' para dizer que a foto pode ser nula (sem foto)
    public string? FotoUrl { get; set; } 
    
    // CORREÇÃO 2: Relacionamento com Variantes
    public List<Variante> Variantes { get; set; } = new();
}