import { useEffect, useState } from "react";
import { PrivateLayout } from "../../components/layout/PrivateLayout";
import { Plus, Search, Edit2, Trash2, Package } from "lucide-react";
import { Link } from "react-router-dom";
import { api } from "../../services/api";

export function ProductList() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  // Função para carregar produtos
  async function loadProducts() {
    try {
      const response = await api.get("/produtos");
      setProducts(response.data);
    } catch (error) {
      console.error("Erro ao buscar:", error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadProducts();
  }, []);

  // --- FUNÇÃO DE DELETAR ---
  async function handleDelete(id) {
    const confirmacao = window.confirm(
      "Tem certeza que deseja excluir este produto?"
    );

    if (confirmacao) {
      try {
        // Chama a API para deletar no banco
        await api.delete(`/produtos/${id}`);

        // Remove o item da tela instantaneamente
        setProducts(products.filter((product) => product.id !== id));

        alert("Produto excluído com sucesso!");
      } catch (error) {
        console.error("Erro ao deletar:", error);
        alert(
          "Erro ao excluir. Verifique se o produto não tem vendas vinculadas."
        );
      }
    }
  }

  return (
    <PrivateLayout>
      <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-serif font-bold text-white">Produtos</h1>
          <p className="text-neutral-400 mt-1">Gerencie o estoque do atelier</p>
        </div>

        <Link
          to="/products/new"
          className="bg-luke-gold text-luke-dark font-bold py-2.5 px-6 rounded-lg hover:bg-luke-gold-light transition-colors flex items-center gap-2 shadow-lg shadow-luke-gold/20"
        >
          <Plus className="w-5 h-5" />
          Novo Produto
        </Link>
      </div>

      <div className="bg-luke-card p-4 rounded-xl border border-neutral-800 mb-6 flex gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500 w-5 h-5" />
          <input
            type="text"
            placeholder="Buscar..."
            className="w-full bg-luke-dark border border-neutral-800 rounded-lg pl-10 pr-4 py-2 text-white focus:outline-none focus:border-luke-gold focus:ring-1 focus:ring-luke-gold"
          />
        </div>
      </div>

      <div className="bg-luke-card rounded-xl border border-neutral-800 overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          {loading ? (
            <div className="p-8 text-center text-white">Carregando...</div>
          ) : (
            <table className="w-full text-left">
              <thead className="bg-neutral-900/50 text-luke-gold uppercase text-xs tracking-wider font-medium">
                <tr>
                  <th className="px-6 py-4">Produto</th>
                  <th className="px-6 py-4">Categoria</th>
                  <th className="px-6 py-4">Preço</th>
                  <th className="px-6 py-4 text-center">Estoque</th>
                  <th className="px-6 py-4 text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-800">
                {products.map((product) => (
                  <tr
                    key={product.id}
                    className="hover:bg-neutral-800/50 transition-colors group"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-md bg-luke-dark border border-neutral-800 flex items-center justify-center overflow-hidden">
                          {product.fotoUrl ? (
                            <img
                              src={product.fotoUrl}
                              alt={product.nome}
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <Package className="w-5 h-5 text-neutral-500" />
                          )}
                        </div>
                        <span className="text-white font-medium">
                          {product.nome || product.Nome}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-neutral-400">
                      {product.categoria || product.Categoria}
                    </td>
                    <td className="px-6 py-4 text-white font-bold">
                      R${" "}
                      {(product.precoVenda || product.PrecoVenda || 0)
                        .toFixed(2)
                        .replace(".", ",")}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className="bg-green-500/10 text-green-500 px-2 py-1 rounded-full text-xs">
                        {product.quantidadeEstoque || 0} un
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {/* --- BOTÃO DE EDITAR --- */}
                        <Link
                          to={`/products/edit/${product.id || product.Id}`}
                          className="p-2 text-neutral-400 hover:text-luke-gold hover:bg-luke-gold/10 rounded-lg transition-colors"
                          title="Editar"
                        >
                          <Edit2 className="w-4 h-4" />
                        </Link>

                        {/* --- BOTÃO DE DELETAR --- */}
                        <button
                          onClick={() => handleDelete(product.id || product.Id)}
                          className="p-2 text-neutral-400 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-colors"
                          title="Excluir"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </PrivateLayout>
  );
}
