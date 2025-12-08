import axios from "axios";

export const api = axios.create({
  baseURL: "http://localhost:5083/api", // Verifique se a porta continua 5083
});

// INTERCEPTOR
api.interceptors.request.use((config) => {
  // 1. Tenta pegar o token do cofre (localStorage)
  const token = localStorage.getItem("luke_token");

  // 2. Se tiver token, adiciona no cabeçalho (Authorization: Bearer XXXXX)
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});
