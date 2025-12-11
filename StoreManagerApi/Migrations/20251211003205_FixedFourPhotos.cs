using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

#nullable disable

namespace StoreManagerApi.Migrations
{
    /// <inheritdoc />
    public partial class FixedFourPhotos : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "ProdutoFotos");

            migrationBuilder.AddColumn<string>(
                name: "FotoQuartaUrl",
                table: "Produtos",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "FotoSecundariaUrl",
                table: "Produtos",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "FotoTerciariaUrl",
                table: "Produtos",
                type: "text",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "FotoQuartaUrl",
                table: "Produtos");

            migrationBuilder.DropColumn(
                name: "FotoSecundariaUrl",
                table: "Produtos");

            migrationBuilder.DropColumn(
                name: "FotoTerciariaUrl",
                table: "Produtos");

            migrationBuilder.CreateTable(
                name: "ProdutoFotos",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    ProdutoId = table.Column<int>(type: "integer", nullable: false),
                    Url = table.Column<string>(type: "text", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ProdutoFotos", x => x.Id);
                    table.ForeignKey(
                        name: "FK_ProdutoFotos_Produtos_ProdutoId",
                        column: x => x.ProdutoId,
                        principalTable: "Produtos",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_ProdutoFotos_ProdutoId",
                table: "ProdutoFotos",
                column: "ProdutoId");
        }
    }
}
