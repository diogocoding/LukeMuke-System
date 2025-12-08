import { Routes, Route } from "react-router-dom";
import { Login } from "../pages/Auth/Login";
import { Dashboard } from "../pages/Dashboard/Dashboard";
import { ProductList } from "../pages/Products/ProductList";
import { ProductForm } from "../pages/Products/ProductForm";
import { Vitrine } from "../pages/Shop/Vitrine"; // Importe a Vitrine
import { Sales } from "../pages/Sales/Sales";

export function AppRoutes() {
  return (
    <Routes>
      {/* Área Pública (Clientes) */}
      <Route path="/loja" element={<Vitrine />} />

      {/* Área Restrita (Admin) */}
      <Route path="/" element={<Login />} />
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/products" element={<ProductList />} />
      <Route path="/products/new" element={<ProductForm />} />
      <Route path="/sales" element={<Sales />} />
      <Route path="/products/edit/:id" element={<ProductForm />} />
    </Routes>
  );
}
