import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Sidebar } from "./Sidebar";

export function PrivateLayout({ children }) {
  const navigate = useNavigate();

  useEffect(() => {
    // VERIFICAÇÃO DE SEGURANÇA
    const token = localStorage.getItem("luke_token");

    if (!token) {
      // Se não tem crachá, tchau! Volta pro login.
      navigate("/");
    }
  }, [navigate]);

  return (
    <div className="flex h-screen bg-luke-dark text-white overflow-hidden">
      <Sidebar />
      <main className="flex-1 overflow-y-auto p-8">{children}</main>
    </div>
  );
}
