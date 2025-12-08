import { useEffect, useState } from "react";
import { PrivateLayout } from "../../components/layout/PrivateLayout";
import { Search, ShoppingCart, Trash2, CheckCircle, Plus } from "lucide-react";
import { api } from "../../services/api";

export function Sales() {
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    loadProducts();
  }, []);

  async function loadProducts() {
    const response = await api.get("/produtos");
    setProducts(response.data);
  }

  // Filtrar produtos na busca
  const filteredProducts = products.filter((p) =>
    p.nome.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Adicionar ao carrinho
  function addToCart(product) {
    setCart([...cart, product]);
  }

  // Remover do carrinho
  function removeFromCart(indexToRemove) {
    setCart(cart.filter((_, index) => index !== indexToRemove));
  }

  // Finalizar Venda
  async function handleFinishSale() {
    if (cart.length === 0) return alert("Carrinho vazio!");

    try {
      // Manda apenas os IDs para a API dar baixa
      const productIds = cart.map((p) => p.id);

      await api.post("/produtos/checkout", productIds);

      alert("Venda realizada com sucesso!");
      setCart([]); // Limpa o carrinho
      loadProducts(); // Recarrega produtos para ver estoque atualizado
    } catch (error) {
      console.error("Erro na venda:", error);
      alert("Erro ao finalizar venda.");
    }
  }

  const total = cart.reduce((acc, item) => acc + (item.precoVenda || 0), 0);

  return (
    <PrivateLayout>
      <div className="flex h-[calc(100vh-8rem)] gap-6">
        {/* LADO ESQUERDO: Catálogo de Produtos */}
        <div className="flex-1 flex flex-col">
          {/* Barra de Busca */}
          <div className="bg-luke-card p-4 rounded-xl border border-neutral-800 mb-4 flex gap-4">
            <Search className="text-neutral-500 w-6 h-6" />
            <input
              type="text"
              placeholder="Buscar produto para vender..."
              className="bg-transparent text-white w-full focus:outline-none"
              onChange={(e) => setSearchTerm(e.target.value)}
              autoFocus
            />
          </div>

          {/* Grid de Produtos */}
          <div className="flex-1 overflow-y-auto grid grid-cols-2 lg:grid-cols-3 gap-4 pr-2">
            {filteredProducts.map((product) => (
              <button
                key={product.id}
                onClick={() => addToCart(product)}
                className="bg-luke-card p-4 rounded-xl border border-neutral-800 hover:border-luke-gold text-left group transition-all"
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="h-12 w-12 bg-neutral-900 rounded-md overflow-hidden">
                    {product.fotoUrl && (
                      <img
                        src={product.fotoUrl}
                        className="w-full h-full object-cover"
                      />
                    )}
                  </div>
                  <Plus className="text-neutral-600 group-hover:text-luke-gold" />
                </div>
                <h4 className="font-bold text-white text-sm line-clamp-1">
                  {product.nome}
                </h4>
                <p className="text-luke-gold font-bold mt-1">
                  R$ {product.precoVenda?.toFixed(2)}
                </p>
              </button>
            ))}
          </div>
        </div>

        {/* LADO DIREITO: Resumo da Venda (Cupom Fiscal) */}
        <div className="w-96 bg-white text-neutral-900 rounded-xl shadow-2xl flex flex-col overflow-hidden">
          <div className="bg-neutral-900 text-white p-4 text-center">
            <h2 className="font-bold text-lg flex items-center justify-center gap-2">
              <ShoppingCart className="w-5 h-5" />
              Caixa Atual
            </h2>
          </div>

          {/* Lista de Itens */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-neutral-100">
            {cart.length === 0 && (
              <div className="text-center text-neutral-400 mt-10 text-sm">
                Nenhum item selecionado.
              </div>
            )}
            {cart.map((item, index) => (
              <div
                key={index}
                className="flex justify-between items-center bg-white p-3 rounded shadow-sm border border-neutral-200"
              >
                <div className="flex flex-col">
                  <span className="font-bold text-sm">{item.nome}</span>
                  <span className="text-xs text-neutral-500">
                    1x R$ {item.precoVenda?.toFixed(2)}
                  </span>
                </div>
                <button
                  onClick={() => removeFromCart(index)}
                  className="text-red-400 hover:text-red-600"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>

          {/* Total e Botão */}
          <div className="p-6 bg-white border-t border-neutral-200 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)]">
            <div className="flex justify-between items-end mb-4">
              <span className="text-neutral-500 text-sm">Total a Pagar</span>
              <span className="text-3xl font-bold text-neutral-900">
                R$ {total.toFixed(2)}
              </span>
            </div>

            <button
              onClick={handleFinishSale}
              disabled={cart.length === 0}
              className="w-full bg-green-600 text-white font-bold py-4 rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <CheckCircle className="w-5 h-5" />
              FINALIZAR VENDA
            </button>
          </div>
        </div>
      </div>
    </PrivateLayout>
  );
}
