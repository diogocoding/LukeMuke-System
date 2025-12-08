# 1. Imagem de Construção (Build)
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src
COPY ["StoreManagerApi.csproj", "./"]
RUN dotnet restore "StoreManagerApi.csproj"
COPY . .
RUN dotnet build "StoreManagerApi.csproj" -c Release -o /app/build

# 2. Publicação
FROM build AS publish
RUN dotnet publish "StoreManagerApi.csproj" -c Release -o /app/publish

# 3. Imagem Final (Rodar)
FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS final
WORKDIR /app
COPY --from=publish /app/publish .
# A porta que o Render usa (importante)
ENV ASPNETCORE_URLS=http://+:8080
EXPOSE 8080
ENTRYPOINT ["dotnet", "StoreManagerApi.dll"]