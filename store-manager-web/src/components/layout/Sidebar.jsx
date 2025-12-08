import { Link, useLocation } from "react-router-dom";
import { LayoutDashboard, Package, ShoppingCart, LogOut } from "lucide-react";

export function Sidebar() {
  const location = useLocation();

  const isActive = (path) => location.pathname === path;

  const menuItems = [
    { path: "/dashboard", label: "Visão Geral", icon: LayoutDashboard },
    { path: "/products", label: "Produtos", icon: Package },
    { path: "/sales", label: "Vendas (PDV)", icon: ShoppingCart },
  ];

  return (
    // Mudança: Cor de fundo para 'bg-luke-card'
    <aside className="w-64 bg-luke-card text-white flex flex-col h-screen border-r border-neutral-800">
      {/* Logo */}
      <div className="h-24 flex items-center justify-center border-b border-neutral-800 p-4">
        <img
          src="https://i.postimg.cc/pXqzQ4sL/Whats-App-Image-2025-12-07-at-21-20-40-removebg-preview-(1).png"
          alt="Luke Muke Logo"
          className="h-full w-auto object-contain hover:scale-105 transition-transform duration-300"
        />
      </div>

      {/* Menu de Navegação */}
      <nav className="flex-1 p-4 space-y-2">
        {menuItems.map((item) => {
          const active = isActive(item.path);
          return (
            <Link
              key={item.path}
              to={item.path}
              // Mudança: Lógica de cores para item ativo e inativo
              className={`flex items-center gap-3 px-4 py-3 rounded-md transition-all duration-200 group ${
                active
                  ? "bg-luke-gold text-luke-dark font-medium shadow-md shadow-luke-gold/20" // Ativo: Fundo dourado, texto escuro
                  : "text-neutral-400 hover:bg-neutral-800 hover:text-luke-gold-light" // Inativo: Texto cinza, hover sutil
              }`}
            >
              {/* Ícone muda de cor no hover se não estiver ativo */}
              <item.icon
                className={`w-5 h-5 transition-colors ${
                  !active ? "group-hover:text-luke-gold" : ""
                }`}
              />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Botão Sair */}
      <div className="p-4 border-t border-neutral-800">
        <Link
          to="/"
          // Mudança: Hover vermelho sutil para manter a semântica de "sair"
          className="flex items-center gap-3 px-4 py-3 text-neutral-400 hover:text-red-500 hover:bg-red-500/10 rounded-md transition-colors group"
        >
          <LogOut className="w-5 h-5 group-hover:text-red-500" />
          <span>Sair do Sistema</span>
        </Link>
      </div>
    </aside>
  );
}
