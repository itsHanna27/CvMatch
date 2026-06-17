using Microsoft.AspNetCore.Mvc;

public class AnalyseRequest
{
   public  string JobTitle{get;set;} ="";
   public string Company{get;set;} = "";
    public IFormFile Cv {get;set;} = null!;
    public string JobDescription {get;set;} = "";

}