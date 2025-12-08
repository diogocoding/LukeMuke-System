# 👔 Luke Muke System - Atelier Management

![Project Banner](https://via.placeholder.com/1200x400?text=Luke+Muke+System+Preview)
_(Substitua este link depois por um print real da sua tela de Dashboard)_

## 📖 Sobre o Projeto

O **Luke Muke System** é uma solução completa de gestão (ERP) desenvolvida para um atelier de moda masculina. O sistema resolve o problema de controle de estoque complexo (grades de tamanhos e cores) e agiliza as vendas tanto no balcão (PDV) quanto online (Vitrine com integração WhatsApp).

O projeto foi construído seguindo os princípios de **Arquitetura Limpa**, utilizando uma API robusta em .NET e um Frontend moderno e responsivo em React.

## 🚀 Tecnologias Utilizadas

### Frontend (Web)

- **React + Vite:** Para uma interface rápida e reativa.
- **Tailwind CSS:** Para estilização moderna e tema "Dark & Gold".
- **React Router DOM:** Navegação SPA (Single Page Application).
- **Recharts:** Gráficos interativos para o Dashboard.
- **React Hook Form:** Gerenciamento de formulários complexos.
- **Axios:** Consumo de API REST.

### Backend (API)

- **C# .NET 8:** Framework principal.
- **Entity Framework Core:** ORM para manipulação de dados.
- **JWT (JSON Web Token):** Autenticação e Segurança.
- **Swagger:** Documentação automática da API.

### Banco de Dados & Infra

- **PostgreSQL (Supabase):** Banco de dados relacional na nuvem.
- **Docker:** (Opcional) Containerização da aplicação.

## ✨ Funcionalidades Principais

### 🛡️ Módulo Administrativo (Backoffice)

- [x] **Dashboard Interativo:** KPIs de vendas, valor em estoque e gráficos de desempenho semanal.
- [x] **Gestão de Produtos:** CRUD completo com suporte a imagens via URL.
- [x] **Controle de Variantes:** Sistema inteligente para gerenciar grades (Ex: Tamanho P/M/G e Cores) dentro de um único produto.
- [x] **PDV (Ponto de Venda):** Interface ágil para vendas no balcão, com baixa automática de estoque.
- [x] **Segurança:** Login autenticado via Token JWT.

### 🛍️ Módulo do Cliente (Vitrine)

- [x] **Catálogo Público:** Página acessível sem login para clientes visualizarem peças.
- [x] **Carrinho de Compras:** Adição dinâmica de itens.
- [x] **Checkout via WhatsApp:** Gera um pedido formatado e envia diretamente para o vendedor.

## 📸 Screenshots

|                            Dashboard                             |                         PDV                          |
| :--------------------------------------------------------------: | :--------------------------------------------------: |
| ![Dashboard](https://via.placeholder.com/400x200?text=Dashboard) | ![PDV](https://via.placeholder.com/400x200?text=PDV) |

|                      Cadastro de Variantes                       |                       Vitrine Virtual                        |
| :--------------------------------------------------------------: | :----------------------------------------------------------: |
| ![Variantes](https://via.placeholder.com/400x200?text=Variantes) | ![Vitrine](https://via.placeholder.com/400x200?text=Vitrine) |

## ⚙️ Como Rodar Localmente

### Pré-requisitos

- Node.js (v18+)
- .NET SDK 8.0
- Conta no Supabase (PostgreSQL)

### Passo 1: Configurar a API

1.  Clone o repositório.
2.  Navegue até a pasta da API:
    ```bash
    cd StoreManagerApi
    ```
3.  Configure a string de conexão no `appsettings.json`.
4.  Rode as migrations para criar o banco:
    ```bash
    dotnet ef database update
    ```
5.  Inicie o servidor:
    ```bash
    dotnet run
    ```

### Passo 2: Configurar o Frontend

1.  Navegue até a pasta web:
    ```bash
    cd store-manager-web
    ```
2.  Instale as dependências:
    ```bash
    npm install
    ```
3.  Rode o projeto:
    ```bash
    npm run dev
    ```
