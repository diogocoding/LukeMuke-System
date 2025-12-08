import { useEffect, useState } from "react"; // <--- useState adicionado
import { useForm, useFieldArray } from "react-hook-form"; // <--- useFieldArray para listas
import { useNavigate, useParams, Link } from "react-router-dom";
import { ArrowLeft, Save, Plus, Trash2 } from "lucide-react";
import { api } from "../../services/api";

export function ProductForm() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditMode = !!id;

  // Configuração do Formulário com suporte a array de variantes
  const { register, control, handleSubmit, watch, reset, setValue } = useForm({
    defaultValues: {
      nome: "",
      categoria: "",
      precoCusto: 0,
      precoVenda: 0,
      fotoUrl: "",
      variantes: [], // Começa vazio
    },
  });

  // Gerenciador da lista de variantes (Adicionar/Remover linhas)
  const { fields, append, remove } = useFieldArray({
    control,
    name: "variantes",
  });

  const fotoUrlPreview = watch("fotoUrl");

  useEffect(() => {
    if (isEditMode) {
      // No GET, precisamos pedir para incluir as variantes na busca
      // Nota: Seu C# precisa incluir .Include(p => p.Variantes) no GetProduto
      api
        .get(`/produtos/${id}`)
        .then((response) => {
          const produto = response.data;
          reset(produto);
        })
        .catch(() => alert("Erro ao carregar produto."));
    }
  }, [id, isEditMode, reset]);

  const onSubmit = async (data) => {
    try {
      // Formata os dados numéricos antes de enviar
      const payload = {
        ...data,
        id: isEditMode ? parseInt(id) : 0,
        precoCusto: parseFloat(data.precoCusto),
        precoVenda: parseFloat(data.precoVenda),
        variantes: data.variantes.map((v) => ({
          ...v,
          quantidadeEstoque: parseInt(v.quantidadeEstoque),
        })),
      };

      if (isEditMode) {
        await api.put(`/produtos/${id}`, payload);
        alert("Produto e estoque atualizados!");
      } else {
        await api.post("/produtos", payload);
        alert("Produto cadastrado com variações!");
      }
      navigate("/products");
    } catch (error) {
      console.error(error);
      alert("Erro ao salvar. Verifique se o C# está aceitando variantes.");
    }
  };

  return (
    <div className="min-h-screen bg-luke-dark text-white p-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-serif font-bold text-white">
            {isEditMode ? "Gerenciar Produto" : "Novo Produto"}
          </h1>
          <p className="text-neutral-400 mt-1">
            Cadastre a peça e suas variações de estoque
          </p>
        </div>
        <Link
          to="/products"
          className="text-neutral-400 hover:text-white flex items-center gap-2"
        >
          <ArrowLeft className="w-5 h-5" /> Voltar
        </Link>
      </div>

      <form
        onSubmit={handleSubmit(onSubmit)}
        className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8"
      >
        {/* COLUNA ESQUERDA: DADOS GERAIS */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-luke-card p-6 rounded-xl border border-neutral-800">
            <h2 className="text-luke-gold font-bold mb-4">Dados da Peça</h2>
            <div className="grid gap-4">
              <div>
                <label className="text-neutral-300 text-sm">Nome</label>
                <input
                  {...register("nome", { required: true })}
                  className="w-full bg-luke-dark border border-neutral-700 rounded-lg p-3 text-white"
                  placeholder="Ex: Camisa Linho Premium"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-neutral-300 text-sm">Categoria</label>
                  <select
                    {...register("categoria")}
                    className="w-full bg-luke-dark border border-neutral-700 rounded-lg p-3 text-white"
                  >
                    <option value="Ternos">Ternos</option>
                    <option value="Camisas">Camisas</option>
                    <option value="Calças">Calças</option>
                    <option value="Shorts">Shorts</option>
                    <option value="Acessórios">Acessórios</option>
                  </select>
                </div>
                <div>
                  <label className="text-neutral-300 text-sm">URL Foto</label>
                  <input
                    {...register("fotoUrl")}
                    className="w-full bg-luke-dark border border-neutral-700 rounded-lg p-3 text-white"
                    placeholder="http://..."
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-neutral-300 text-sm">Custo (R$)</label>
                  <input
                    type="number"
                    step="0.01"
                    {...register("precoCusto")}
                    className="w-full bg-luke-dark border border-neutral-700 rounded-lg p-3 text-white"
                  />
                </div>
                <div>
                  <label className="text-neutral-300 text-sm">Venda (R$)</label>
                  <input
                    type="number"
                    step="0.01"
                    {...register("precoVenda")}
                    className="w-full bg-luke-dark border border-neutral-700 rounded-lg p-3 text-white"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* ÁREA DE VARIAÇÕES (ESTOQUE) */}
          <div className="bg-luke-card p-6 rounded-xl border border-neutral-800 border-l-4 border-l-luke-gold">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-white font-bold text-lg">
                Estoque & Variações
              </h2>
              <button
                type="button"
                onClick={() =>
                  append({ tamanho: "M", cor: "Única", quantidadeEstoque: 1 })
                }
                className="text-xs bg-neutral-800 hover:bg-neutral-700 text-luke-gold px-3 py-2 rounded border border-neutral-700 flex gap-1"
              >
                <Plus className="w-4 h-4" /> Adicionar Variação
              </button>
            </div>

            {fields.length === 0 && (
              <p className="text-neutral-500 text-sm text-center py-4 border border-dashed border-neutral-800 rounded">
                Nenhuma variação cadastrada. Clique em adicionar para controlar
                o estoque.
              </p>
            )}

            <div className="space-y-3">
              {fields.map((field, index) => (
                <div
                  key={field.id}
                  className="flex gap-3 items-end bg-luke-dark p-3 rounded border border-neutral-800"
                >
                  <div className="w-20">
                    <label className="text-xs text-neutral-400">Tam.</label>
                    <input
                      {...register(`variantes.${index}.tamanho`)}
                      className="w-full bg-neutral-900 border border-neutral-700 rounded p-2 text-white text-sm"
                      placeholder="M"
                    />
                  </div>
                  <div className="flex-1">
                    <label className="text-xs text-neutral-400">
                      Cor / Detalhe
                    </label>
                    <input
                      {...register(`variantes.${index}.cor`)}
                      className="w-full bg-neutral-900 border border-neutral-700 rounded p-2 text-white text-sm"
                      placeholder="Azul Marinho"
                    />
                  </div>
                  <div className="w-24">
                    <label className="text-xs text-luke-gold font-bold">
                      Qtd.
                    </label>
                    <input
                      type="number"
                      {...register(`variantes.${index}.quantidadeEstoque`)}
                      className="w-full bg-neutral-900 border border-luke-gold/50 rounded p-2 text-white text-sm font-bold text-center"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => remove(index)}
                    className="p-2 text-neutral-500 hover:text-red-500 bg-neutral-900 rounded border border-neutral-800"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* COLUNA DIREITA: PREVIEW */}
        <div className="space-y-6">
          <div className="bg-luke-card p-6 rounded-xl border border-neutral-800 text-center">
            <h3 className="text-neutral-400 text-sm mb-4">
              Preview da Vitrine
            </h3>
            <div className="aspect-[3/4] bg-luke-dark rounded-lg overflow-hidden border border-neutral-800 relative group">
              {fotoUrlPreview ? (
                <img
                  src={fotoUrlPreview}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="flex items-center justify-center h-full text-neutral-600">
                  Sem Imagem
                </div>
              )}
              <div className="absolute bottom-0 left-0 w-full bg-gradient-to-t from-black/90 to-transparent p-4 text-left">
                <p className="text-luke-gold font-bold text-lg">
                  R$ {watch("precoVenda") || "0,00"}
                </p>
                <p className="text-white text-sm line-clamp-1">
                  {watch("nome") || "Nome do Produto"}
                </p>
              </div>
            </div>
          </div>

          <button
            type="submit"
            className="w-full bg-luke-gold text-luke-dark font-bold py-4 rounded-xl hover:bg-luke-gold-light transition-all flex items-center justify-center gap-2 shadow-lg shadow-luke-gold/20"
          >
            <Save className="w-5 h-5" />
            SALVAR TUDO
          </button>
        </div>
      </form>
    </div>
  );
}
