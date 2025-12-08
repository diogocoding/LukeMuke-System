using System;

namespace StoreManagerApi.Models;

public class Venda
{
    public int Id { get; set; }
    public DateTime DataVenda { get; set; }
    public decimal ValorTotal { get; set; }
    // Pode adicionar "MetodoPagamento", "ClienteNome" depois se quiser
}