using System.Text.Json.Serialization;

namespace StoreManagerApi.Models;

public class ProdutoFoto
{
    public int Id { get; set; }

    public string Url { get; set; } = string.Empty;

    // A "chave estrangeira" para saber de qual produto é essa foto
    public int ProdutoId { get; set; }

    [JsonIgnore] // Evita loop infinito no JSON
    public Produto? Produto { get; set; }
}
