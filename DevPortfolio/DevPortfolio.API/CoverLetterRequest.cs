public class CoverLetterRequest
{
   public string jobTitle {get;set;}= "";
    public string company {get;set;} = "";
    public string jobDesc{get;set;} = "";
     public IFormFile Cv {get;set;} = null!;


}