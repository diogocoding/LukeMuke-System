import { useEffect, useState } from "react";
import { PrivateLayout } from "../../components/layout/PrivateLayout";
import {
  DollarSign,
  Package,
  ShoppingBag,
  TrendingUp,
  Users,
  CreditCard,
} from "lucide-react";
import { api } from "../../services/api";
// IMPORTS DO GRÁFICO
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";

export function Dashboard() {
  const [stats, setStats] = useState({
    totalProdutos: 0,
    valorEstoque: 0,
    vendasHoje: 0,
  });

  useEffect(() => {
    api
      .get("/produtos/dashboard")
      .then((response) => setStats(response.data))
      .catch((err) => console.error("Erro dashboard", err));
  }, []);

  // DADOS DO GRÁFICO (Simulado para mostrar beleza)
  const dataGrafico = [
    { name: "Seg", vendas: 1200 },
    { name: "Ter", vendas: 2100 },
    { name: "Qua", vendas: 800 },
    { name: "Qui", vendas: 1600 },
    { name: "Sex", vendas: 2800 }, // Hoje (simulado)
    { name: "Sáb", vendas: 3400 },
    { name: "Dom", vendas: 1100 },
  ];

  const cards = [
    {
      title: "Valor em Estoque",
      value: `R$ ${stats.valorEstoque.toFixed(2)}`,
      icon: DollarSign,
      trend: "+Estável",
    },
    {
      title: "Produtos Ativos",
      value: stats.totalProdutos,
      icon: Package,
      trend: "Atualizado",
    },
    {
      title: "Vendas Hoje",
      value: stats.vendasHoje,
      icon: ShoppingBag,
      trend: null,
    },
    { title: "Novos Clientes", value: "3", icon: Users, trend: "+1" },
  ];

  return (
    <PrivateLayout>
      <div className="mb-8">
        <h1 className="text-3xl font-serif font-bold text-white">
          Visão Geral
        </h1>
        <p className="text-neutral-400 mt-1">Resumo do desempenho do atelier</p>
      </div>

      {/* Cards de KPI */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {cards.map((stat, index) => (
          <div
            key={index}
            className="bg-luke-card p-6 rounded-xl border border-neutral-800 hover:border-luke-gold/50 transition-all shadow-lg group"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="bg-luke-gold/10 p-3 rounded-lg group-hover:bg-luke-gold/20 transition-colors">
                <stat.icon className="w-6 h-6 text-luke-gold" />
              </div>
              {stat.trend && (
                <div className="flex items-center gap-1 text-sm font-medium text-luke-gold bg-luke-gold/10 px-2.5 py-1 rounded-full">
                  <TrendingUp className="w-3 h-3" />
                  {stat.trend}
                </div>
              )}
            </div>
            <h3 className="text-neutral-400 text-sm font-medium uppercase tracking-wider">
              {stat.title}
            </h3>
            <p className="text-3xl font-bold text-white mt-2">{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Área dos Gráficos */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Gráfico Principal */}
        <div className="lg:col-span-2 bg-luke-card p-6 rounded-xl border border-neutral-800 shadow-xl">
          <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-luke-gold" />
            Desempenho Semanal
          </h3>

          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={dataGrafico}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="#333"
                  vertical={false}
                />
                <XAxis
                  dataKey="name"
                  stroke="#666"
                  tick={{ fill: "#999" }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  stroke="#666"
                  tick={{ fill: "#999" }}
                  axisLine={false}
                  tickLine={false}
                  prefix="R$ "
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#1E1E1E",
                    borderColor: "#333",
                    color: "#fff",
                  }}
                  itemStyle={{ color: "#D4AF37" }}
                  formatter={(value) => [`R$ ${value}`, "Vendas"]}
                />
                <Bar
                  dataKey="vendas"
                  fill="#D4AF37"
                  radius={[4, 4, 0, 0]}
                  barSize={40}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Lista Lateral (Transações Recentes) */}
        <div className="bg-luke-card p-6 rounded-xl border border-neutral-800 shadow-xl flex flex-col">
          <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
            <CreditCard className="w-5 h-5 text-luke-gold" />
            Últimas Vendas
          </h3>

          <div className="space-y-4">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="flex items-center justify-between p-3 bg-neutral-900/50 rounded-lg border border-neutral-800 hover:border-luke-gold/30 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="bg-luke-gold/20 w-8 h-8 rounded-full flex items-center justify-center text-luke-gold text-xs font-bold">
                    LK
                  </div>
                  <div>
                    <p className="text-sm text-white font-medium">
                      Cliente Balcão
                    </p>
                    <p className="text-xs text-neutral-500">
                      Há {i * 15} minutos
                    </p>
                  </div>
                </div>
                <span className="text-luke-gold font-bold text-sm">
                  +R$ {100 * i},00
                </span>
              </div>
            ))}
          </div>

          <button className="mt-auto w-full py-3 border border-neutral-700 rounded-lg text-neutral-400 hover:text-white hover:border-white transition-colors text-sm">
            Ver Relatório Completo
          </button>
        </div>
      </div>
    </PrivateLayout>
  );
}
