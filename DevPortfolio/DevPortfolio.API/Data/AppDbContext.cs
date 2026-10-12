using Microsoft.EntityFrameworkCore;
using DevPortfolio.API.Models;

namespace DevPortfolio.API.Data; // namespace

public class AppDbContext : DbContext // inheriting EF Core's DbContext class
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options)//
    {
    }

    public DbSet<History> Histories { get; set; } // DbSet for History model
}