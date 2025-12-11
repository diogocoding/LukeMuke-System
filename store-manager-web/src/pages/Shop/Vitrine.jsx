import { useEffect, useState } from "react";
import { ShoppingCart, Trash2, MessageCircle, Plus, Instagram } from "lucide-react";
import { api } from "../../services/api";

export function Vitrine() {
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("Todos");

  const TELEFONE_LOJA = "5581996897368";
  const categories = ["Todos", "Camisas", "Shorts", "Regata"];
  const instagramLink = "https://www.instagram.com/lukemuke_atelier";
  const instagramUser = "@lukemuke_atelier";

  useEffect(() => {
    api.get("/produtos").then((res) => setProducts(res.data));
  }, []);

  const addToCart = (product) => {
    setCart([...cart, product]);
    setIsCartOpen(true);
  };

  const removeFromCart = (indexToRemove) => {
    setCart(cart.filter((_, index) => index !== indexToRemove));
  };

  const total = cart.reduce((acc, item) => acc + (item.precoVenda || 0), 0);

  const handleFinalize = () => {
    if (cart.length === 0) return;

    let message = "*Olá! Gostaria de fazer um pedido no site:*\n\n";
    cart.forEach((item) => {
      message += `- ${item.nome} (R$ ${item.precoVenda?.toFixed(2)})\n`;
    });
    message += `\n*Total: R$ ${total.toFixed(2)}*`;
    message += "\n\nAguardo confirmação!";

    const url = `https://wa.me/${TELEFONE_LOJA}?text=${encodeURIComponent(message)}`;
    window.open(url, "_blank");
  };

  const filteredProducts =
    selectedCategory === "Todos"
      ? products
      : products.filter((product) => product.categoria === selectedCategory);

  return (
    <div className="min-h-screen bg-neutral-900 text-white font-sans">

      {/* NAVBAR RESPONSIVA */}
      <header className="bg-black/95 border-b border-neutral-800 shadow-lg sticky top-0 z-20 backdrop-blur-xl">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">

          {/* LADO ESQUERDO */}
          <div className="flex items-center gap-3">
            <img
              src="https://i.postimg.cc/pXqzQ4sL/Whats-App-Image-2025-12-07-at-21-20-40-removebg-preview-(1).png"
              alt="Logo"
              className="h-10 w-auto"
            />

            <h1 className="text-xl sm:text-2xl font-serif font-bold tracking-wide text-luke-gold">
              Luke Muke Store
            </h1>

            {/* Instagram: Ícone sempre visível, nome só no sm+ */}
            <a
              href={instagramLink}
              target="_blank"
              rel="noopener noreferrer"
              className="
                flex items-center gap-2 ml-2 sm:ml-4 
                px-2 sm:px-3 py-1.5 rounded-lg text-neutral-300 
                hover:text-luke-gold hover:bg-neutral-800 
                transition-all border border-neutral-700 
                text-sm sm:text-base
              "
            >
              <Instagram className="w-5 h-5" />
              <span className="font-medium hidden sm:block">{instagramUser}</span>
            </a>
          </div>

          {/* BOTÃO DO CARRINHO */}
          <button
            onClick={() => setIsCartOpen(!isCartOpen)}
            className="relative p-2 bg-luke-gold text-black rounded-full hover:bg-white transition-all shadow-md"
          >
            <ShoppingCart className="w-6 h-6" />
            {cart.length > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-600 text-white text-xs font-bold w-5 h-5 flex items-center justify-center rounded-full">
                {cart.length}
              </span>
            )}
          </button>
        </div>
      </header>

      {/* FILTROS */}
      <main className="max-w-6xl mx-auto p-4 sm:p-6">
        <div className="flex gap-3 mb-6 overflow-x-auto pb-2">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-4 py-2 rounded-lg font-semibold transition-all text-sm
                ${
                  selectedCategory === category
                    ? "bg-luke-gold text-black shadow-lg"
                    : "bg-neutral-800 text-neutral-300 hover:bg-neutral-700"
                }`}
            >
              {category}
            </button>
          ))}
        </div>

        {/* GRID DE PRODUTOS */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 sm:gap-10">
          {filteredProducts.map((product) => (
            <div
              key={product.id}
              className="bg-neutral-800 rounded-xl overflow-hidden shadow-lg border border-neutral-700 hover:border-luke-gold hover:shadow-luke-gold/20 transition-all group"
            >
                {/* INÍCIO DA CORREÇÃO DA IMAGEM */}
              <div className="relative w-full overflow-hidden bg-neutral-900" style={{ paddingBottom: '75%' /* Proporção 4:3 */ }}>
                <img
                  src={product.fotoUrl || "https://via.placeholder.com/300?text=Sem+Foto"}
                  alt={product.nome}
                  className="absolute top-0 left-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
              </div>
                {/* FIM DA CORREÇÃO DA IMAGEM */}

              <div className="p-5 sm:p-6">
                <h3 className="text-lg sm:text-xl font-bold">{product.nome}</h3>
                <p className="text-neutral-400 text-sm mb-4">{product.categoria}</p>

                <div className="flex items-center justify-between">
                  <span className="text-xl sm:text-2xl font-bold text-luke-gold">
                    R$ {product.precoVenda?.toFixed(2)}
                  </span>

                  <button
                    onClick={() => addToCart(product)}
                    className="bg-white text-black p-2.5 sm:p-3 rounded-full hover:bg-luke-gold transition-colors shadow-lg"
                  >
                    <Plus className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </main>

      {/* CARRINHO */}
      {isCartOpen && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setIsCartOpen(false)}
          ></div>

          <div className="relative w-full max-w-sm bg-neutral-900 h-full shadow-2xl border-l border-neutral-800 flex flex-col p-6">
            <div className="flex justify-between items-center mb-6 border-b border-neutral-800 pb-4">
              <h2 className="text-xl sm:text-2xl font-serif font-bold text-luke-gold">Seu Carrinho</h2>
              <button onClick={() => setIsCartOpen(false)} className="text-neutral-400 hover:text-white">
                Fechar
              </button>
            </div>

            <div className="flex-1 overflow-y-auto space-y-4">
              {cart.length === 0 ? (
                <p className="text-neutral-500 text-center mt-10">Seu carrinho está vazio.</p>
              ) : (
                cart.map((item, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-4 bg-neutral-800 p-3 rounded-lg border border-neutral-700"
                  >
                    <img src={item.fotoUrl} className="w-16 h-16 object-cover rounded-md" alt="" />

                    <div className="flex-1">
                      <h4 className="font-bold">{item.nome}</h4>
                      <p className="text-luke-gold">R$ {item.precoVenda?.toFixed(2)}</p>
                    </div>

                    <button
                      onClick={() => removeFromCart(index)}
                      className="text-neutral-500 hover:text-red-500"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                ))
              )}
            </div>

            <div className="mt-6 border-t border-neutral-800 pt-4">
              <div className="flex justify-between text-lg sm:text-xl font-bold mb-6">
                <span>Total:</span>
                <span>R$ {total.toFixed(2)}</span>
              </div>

              <button
                onClick={handleFinalize}
                className="w-full bg-green-600 text-white font-bold py-4 rounded-xl hover:bg-green-500 transition-colors flex items-center justify-center gap-2 shadow-lg shadow-green-900/20"
              >
                <MessageCircle className="w-6 h-6" />
                FINALIZAR NO WHATSAPP
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
