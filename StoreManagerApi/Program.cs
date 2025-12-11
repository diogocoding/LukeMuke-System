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
    
    // ⚠️ OS QUATRO CAMPOS FIXOS (URLs SIMPLES)
    // 1. Foto Principal (Capa)
    public string? FotoUrl { get; set; } 
    // 2. Segunda Foto
    public string? FotoSecundariaUrl { get; set; }
    // 3. Terceira Foto
    public string? FotoTerciariaUrl { get; set; }
    // 4. Quarta Foto
    public string? FotoQuartaUrl { get; set; }

    // ❌ REMOVIDA: A LISTA 'Fotos'
    // ❌ REMOVIDA: A CLASSE 'ProdutoFoto'

    // Relacionamento com Variantes (mantido)
    public List<Variante> Variantes { get; set; } = new();
}
