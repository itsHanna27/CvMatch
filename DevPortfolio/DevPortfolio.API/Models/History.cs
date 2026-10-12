namespace DevPortfolio.API.Models; // namespace
public class History
{
    public int Id {get;set;}
    public string Title {get;set;}
    public string Company {get;set;}
    public int score {get;set;}

    public DateTime Date {get;set;} = DateTime.UtcNow; // returns current sate time in UTC format
    
}