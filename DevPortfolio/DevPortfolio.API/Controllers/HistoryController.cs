using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using DevPortfolio.API.Data;
using DevPortfolio.API.Models;

[ApiController]
[Route("api/[controller]")]
public class HistoryController : ControllerBase
{
    private readonly AppDbContext _context;

    public HistoryController(AppDbContext context)
    {
        _context = context;
    }

  [HttpGet]
public async Task<ActionResult<List<History>>> GetHistory()
{
    var history = await _context.Histories
        .OrderByDescending(h => h.Date)
        .ToListAsync();

    return Ok(history);
}

[HttpPost]
public async Task<ActionResult<History>> AddHistory(History newEntry)
{
    _context.Histories.Add(newEntry);
    await _context.SaveChangesAsync();

    return Ok(newEntry);
}
}
