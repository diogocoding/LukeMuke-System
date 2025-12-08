import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { Mail, Lock, LogIn } from "lucide-react";
import { api } from "../../services/api"; // <--- Importando a API configurada

export function Login() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();
  const navigate = useNavigate();

  const handleLogin = async (data) => {
    try {
      // 1. Chama a API Real para verificar a senha
      const response = await api.post("/auth/login", {
        email: data.email,
        senha: data.password, // Mapeia o campo 'password' do form para 'senha' do C#
      });

      // 2. Se deu certo, pega o token da resposta
      const { token } = response.data;

      // 3. Guarda o token no navegador (localStorage)
      localStorage.setItem("luke_token", token);

      // 4. Entra no sistema
      navigate("/dashboard");
    } catch (error) {
      console.error(error);
      alert("Acesso negado! Verifique seu email e senha.");
    }
  };

  return (
    <div className="min-h-screen bg-luke-dark flex items-center justify-center p-4">
      {/* Card de Login Escuro */}
      <div className="bg-luke-card p-8 rounded-2xl shadow-2xl border border-neutral-800 w-full max-w-md relative overflow-hidden">
        {/* Efeito de brilho dourado no topo */}
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-luke-gold to-transparent opacity-50"></div>

        {/* Logo Centralizada */}
        <div className="flex justify-center mb-8">
          <img
            src="https://i.postimg.cc/pXqzQ4sL/Whats-App-Image-2025-12-07-at-21-20-40-removebg-preview-(1).png"
            alt="Luke Muke"
            className="h-20 w-auto"
          />
        </div>

        <div className="text-center mb-8">
          <h1 className="text-2xl font-serif font-bold text-white tracking-wide">
            Bem-vindo ao Atelier
          </h1>
          <p className="text-neutral-400 text-sm mt-2 font-light">
            Faça login para gerenciar suas criações
          </p>
        </div>

        <form onSubmit={handleSubmit(handleLogin)} className="space-y-6">
          <div>
            <label className="block text-xs uppercase tracking-wider text-luke-gold mb-2 font-medium">
              Email
            </label>
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Mail className="h-5 w-5 text-neutral-500 group-focus-within:text-luke-gold transition-colors" />
              </div>
              <input
                type="email"
                className={`w-full pl-10 pr-3 py-3 bg-luke-dark border rounded-lg text-white placeholder-neutral-600 focus:outline-none focus:border-luke-gold focus:ring-1 focus:ring-luke-gold transition-all
                  ${errors.email ? "border-red-500" : "border-neutral-700"}`}
                placeholder="admin@lukemuke.com"
                {...register("email", { required: "O email é obrigatório" })}
              />
            </div>
            {errors.email && (
              <p className="text-red-500 text-xs mt-1 ml-1">
                {errors.email.message}
              </p>
            )}
          </div>

          <div>
            <label className="block text-xs uppercase tracking-wider text-luke-gold mb-2 font-medium">
              Senha
            </label>
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Lock className="h-5 w-5 text-neutral-500 group-focus-within:text-luke-gold transition-colors" />
              </div>
              <input
                type="password"
                className={`w-full pl-10 pr-3 py-3 bg-luke-dark border rounded-lg text-white placeholder-neutral-600 focus:outline-none focus:border-luke-gold focus:ring-1 focus:ring-luke-gold transition-all
                  ${errors.password ? "border-red-500" : "border-neutral-700"}`}
                placeholder="••••••••"
                {...register("password", { required: "A senha é obrigatória" })}
              />
            </div>
            {errors.password && (
              <p className="text-red-500 text-xs mt-1 ml-1">
                {errors.password.message}
              </p>
            )}
          </div>

          <button
            type="submit"
            className="w-full bg-luke-gold text-luke-dark font-bold py-3 rounded-lg hover:bg-luke-gold-light transform hover:-translate-y-0.5 transition-all duration-200 shadow-lg shadow-luke-gold/20 flex items-center justify-center gap-2"
          >
            <LogIn className="w-5 h-5" />
            ACESSAR SISTEMA
          </button>
        </form>

        <div className="mt-8 text-center text-sm">
          <a
            href="#"
            className="text-neutral-500 hover:text-luke-gold transition-colors text-xs uppercase tracking-wide"
          >
            Esqueceu sua senha?
          </a>
        </div>
      </div>
    </div>
  );
}
