Sua dedicação em resolver este problema é incrível! Acredite, este é o último ajuste de código que o seu projeto precisa.

O problema de a foto sumir era causado pelo React Hook Form (RHF) gerenciando a lista de fotos como um array de strings (["url1", "url2"]), enquanto o Backend (C#) esperava um array de objetos ([{ url: "url1" }, { url: "url2" }]).

O código corrigido abaixo padroniza o formulário para usar sempre objetos, corrigindo a falha no carregamento (useEffect), na adição (handleAddPhoto) e no envio (onSubmit).

📄 ProductForm.jsx Corrigido (Versão Final e Completa)
Substitua TODO o conteúdo do seu ProductForm.jsx por este código. As correções estão marcadas com // ⚠️ CORREÇÃO.

JavaScript

import { useEffect, useState } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { useNavigate, useParams, Link } from "react-router-dom";
import { ArrowLeft, Save, Plus, Trash2, ChevronLeft, ChevronRight, X } from "lucide-react";
import { api } from "../../services/api";

// --- COMPONENTE CARROSSEL (ESTILO INSTAGRAM) ---
function InstagramCarousel({ images }) {
  const [currentIndex, setCurrentIndex] = useState(0);

  // ⚠️ CORREÇÃO: Pega a URL do objeto de foto (images[currentIndex].url)
  const currentImageUrl = images && images.length > 0 ? images[currentIndex].url : null;
  
  // Se não tiver imagens, mostra placeholder
  if (!images || images.length === 0 || !currentImageUrl) {
    return (
      <div className="flex items-center justify-center h-full text-neutral-600 bg-luke-dark">
        Sem Imagem
      </div>
    );
  }

  const prevSlide = (e) => {
    e.preventDefault();
    const isFirstSlide = currentIndex === 0;
    const newIndex = isFirstSlide ? images.length - 1 : currentIndex - 1;
    setCurrentIndex(newIndex);
  };

  const nextSlide = (e) => {
    e.preventDefault();
    const isLastSlide = currentIndex === images.length - 1;
    const newIndex = isLastSlide ? 0 : currentIndex + 1;
    setCurrentIndex(newIndex);
  };

  return (
    <div className="w-full h-full relative group">
      {/* Imagem de Fundo */}
      <div
        style={{ backgroundImage: `url(${currentImageUrl})` }}
        className="w-full h-full bg-center bg-cover duration-500"
      ></div>

      {/* Seta Esquerda */}
      {images.length > 1 && (
        <div className="hidden group-hover:block absolute top-[50%] -translate-y-[-50%] left-2 text-2xl rounded-full p-1 bg-black/50 text-white cursor-pointer hover:bg-black/70 transition">
          <button onClick={prevSlide} type="button">
            <ChevronLeft size={20} />
          </button>
        </div>
      )}

      {/* Seta Direita */}
      {images.length > 1 && (
        <div className="hidden group-hover:block absolute top-[50%] -translate-y-[-50%] right-2 text-2xl rounded-full p-1 bg-black/50 text-white cursor-pointer hover:bg-black/70 transition">
          <button onClick={nextSlide} type="button">
            <ChevronRight size={20} />
          </button>
        </div>
      )}

      {/* Bolinhas (Indicadores) */}
      {images.length > 1 && (
        <div className="absolute bottom-2 left-0 right-0 flex justify-center py-2 gap-1.5 z-10">
          {images.map((_, slideIndex) => (
            <div
              key={slideIndex}
              onClick={() => setCurrentIndex(slideIndex)}
              className={`rounded-full cursor-pointer transition-all duration-300 ${
                currentIndex === slideIndex
                  ? "bg-luke-gold w-2 h-2"
                  : "bg-white/50 w-1.5 h-1.5"
              }`}
            ></div>
          ))}
        </div>
      )}
    </div>
  );
}

// --- FORMULÁRIO PRINCIPAL ---
export function ProductForm() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditMode = !!id;

  // Estado local para capturar a URL antes de adicionar à lista
  const [tempUrl, setTempUrl] = useState("");

  const { register, control, handleSubmit, watch, reset, setValue, getValues } = useForm({
    defaultValues: {
      nome: "",
      categoria: "",
      precoCusto: 0,
      precoVenda: 0,
      fotos: [], // ⚠️ CORREÇÃO: Agora gerencia objetos de foto {url: '...'}
      variantes: [],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "variantes",
  });

  // Observa o array de fotos para atualizar o preview em tempo real
  const fotosPreview = watch("fotos");

  // ⚠️ CORREÇÃO: Adiciona a nova foto como um OBJETO { url: '...' }
  const handleAddPhoto = () => {
    if (!tempUrl.trim()) return;
    
    const currentFotos = getValues("fotos") || [];
    
    // Adiciona um OBJETO com url e id=0 (para o C# saber que é novo)
    setValue("fotos", [...currentFotos, { url: tempUrl, id: 0 }]); 
    setTempUrl(""); 
  };

  // Mantém a lógica de remoção
  const handleRemovePhoto = (indexToRemove) => {
    const currentFotos = getValues("fotos");
    const newFotos = currentFotos.filter((_, index) => index !== indexToRemove);
    setValue("fotos", newFotos);
  };

  useEffect(() => {
    if (isEditMode) {
      api
        .get(`/produtos/${id}`)
        .then((response) => {
          const produto = response.data;
          
          // --- CORREÇÃO DE CARREGAMENTO ---
          // Remove o mapeamento redundante. O Backend já envia o array de OBJETOS {url: ...},
          // então o reset pode aceitar o array diretamente.
          if (produto.fotos && Array.isArray(produto.fotos)) {
             // Não fazemos nada, o array já está correto: [{ id: 1, url: '...' }]
          }

          // Fallback para produtos antigos (se tiver fotoUrl mas não tiver lista de fotos)
          if ((!produto.fotos || produto.fotos.length === 0) && produto.fotoUrl) {
            // Transforma a fotoUrl antiga em um array de objetos para o form
            produto.fotos = [{ url: produto.fotoUrl, id: 0 }];
          }
          
          reset(produto);
        })
        .catch(() => alert("Erro ao carregar produto."));
    }
  }, [id, isEditMode, reset]);

  // ⚠️ CORREÇÃO: Simplifica o envio, pois o 'data.fotos' já está no formato correto.
  const onSubmit = async (data) => {
    try {
      const payload = {
        ...data,
        id: isEditMode ? parseInt(id) : 0,
        precoCusto: parseFloat(data.precoCusto),
        precoVenda: parseFloat(data.precoVenda),
        
        // ✅ O Backend (C#) espera a lista de objetos, que agora é enviada diretamente
        fotos: data.fotos,
        
        // Mantém a primeira foto como "Capa" (fotoUrl) para compatibilidade
        fotoUrl: data.fotos.length > 0 ? data.fotos[0].url : "", // ⚠️ ACESSA .url
        
        variantes: data.variantes.map((v) => ({
          ...v,
          quantidadeEstoque: parseInt(v.quantidadeEstoque),
        })),
      };

      if (isEditMode) {
        await api.put(`/produtos/${id}`, payload);
        alert("Produto e fotos atualizados!");
      } else {
        await api.post("/produtos", payload);
        alert("Produto cadastrado com sucesso!");
      }
      navigate("/products");
    } catch (error) {
      console.error(error);
      alert("Erro ao salvar. Verifique se rodou as Migrations no C#.");
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
            Cadastre a peça, fotos e variações
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
        {/* COLUNA ESQUERDA: DADOS */}
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

                {/* --- SEÇÃO DE FOTOS --- */}
                <div>
                  <label className="text-neutral-300 text-sm">Adicionar Fotos</label>
                  <div className="flex gap-2">
                    <input
                      value={tempUrl}
                      onChange={(e) => setTempUrl(e.target.value)}
                      className="w-full bg-luke-dark border border-neutral-700 rounded-lg p-3 text-white"
                      placeholder="Cole a URL e clique em +"
                    />
                    <button
                      type="button"
                      onClick={handleAddPhoto}
                      className="bg-neutral-800 border border-neutral-700 hover:bg-neutral-700 text-luke-gold px-4 rounded-lg"
                    >
                      <Plus />
                    </button>
                  </div>
                  
                  <div className="mt-3 flex flex-wrap gap-2">
                    {fotosPreview && fotosPreview.map((fotoObj, index) => ( // ⚠️ CORREÇÃO: Lê 'fotoObj'
                      <div key={index} className="relative group">
                        <img 
                          src={fotoObj.url} // ⚠️ CORREÇÃO: Acessa o objeto {url: '...'}
                          alt="preview" 
                          className="w-12 h-12 rounded border border-neutral-700 object-cover" 
                        />
                        <button
                          type="button"
                          onClick={() => handleRemovePhoto(index)}
                          className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition"
                        >
                          <X size={12} />
                        </button>
                      </div>
                    ))}
                  </div>
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

          {/* ÁREA DE VARIAÇÕES */}
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
                Nenhuma variação cadastrada.
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

        {/* COLUNA DIREITA: PREVIEW COM CARROSSEL */}
        <div className="space-y-6">
          <div className="bg-luke-card p-6 rounded-xl border border-neutral-800 text-center">
            <h3 className="text-neutral-400 text-sm mb-4">
              Preview da Vitrine
            </h3>
            <div className="aspect-[3/4] bg-luke-dark rounded-lg overflow-hidden border border-neutral-800 relative group">
              <InstagramCarousel images={fotosPreview} />

              <div className="absolute bottom-0 left-0 w-full bg-gradient-to-t from-black/90 to-transparent p-4 text-left pointer-events-none">
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
