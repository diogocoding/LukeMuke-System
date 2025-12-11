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
    
    // OS QUATRO CAMPOS FIXOS (URLs SIMPLES)
    public string? FotoUrl { get; set; } // 1ª Foto
    public string? FotoSecundariaUrl { get; set; } // 2ª Foto
    public string? FotoTerciariaUrl { get; set; } // 3ª Foto
    public string? FotoQuartaUrl { get; set; } // 4ª Foto

    // ⚠️ ATENÇÃO: A LISTA 'Fotos' E A CLASSE 'ProdutoFoto' FORAM REMOVIDAS DO PROJETO.

    // Relacionamento com Variantes (mantido)
    public List<Variante> Variantes { get; set; } = new();
}