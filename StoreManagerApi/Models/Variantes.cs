using System.Text.Json.Serialization;

namespace StoreManagerApi.Models;

public class Variante
{
    public int Id { get; set; }
    public string Tamanho { get; set; } = string.Empty; // P, M, G, GG
    public string Cor { get; set; } = string.Empty; // Preto, Verde, Chumbo
    public int QuantidadeEstoque { get; set; } // Quantas peças tem dessa cor/tamanho

    // Chave estrangeira para saber de qual produto é
    public int ProdutoId { get; set; }
    
    [JsonIgnore] // Para evitar loop infinito no JSON
    public Produto? Produto { get; set; }
}