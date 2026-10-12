using Microsoft.AspNetCore.Mvc;
using System.Text.Json;

namespace DevPortfolio.API.Controllers; // namespace
[ApiController] 
[Route("api/[controller]")] 
public class CoverLetterController: ControllerBase
{

          [HttpPost]
         public async Task <IActionResult> CoverLetter([FromForm] CoverLetterRequest request)
    {
        if(request.Cv==null)
        {
            return BadRequest("Invalid request data.");
        }
        var cvText = await ExtractTextAsync(request.Cv);
        var results = await GenerateCoverLetter(cvText, request.jobDesc, request.jobTitle, request.company);
        return Ok(results);
    }

     private readonly IConfiguration _config;
     private readonly HttpClient _client; // http client field
     public CoverLetterController(IConfiguration config, IHttpClientFactory httpClientFactory) // injecting the factory
    {
        _config = config;
        _client = httpClientFactory.CreateClient(); // creating the client from the factory

    }
    private async Task<object> GenerateCoverLetter(string cvText, string jobDesc, string jobTitle, string company)
    {
       var apiKey = _config["Groq:ApiKey"];
var model = _config["Groq:Model"] ?? "llama-3.3-70b-versatile";

    _client.DefaultRequestHeaders.Authorization = new System.Net.Http.Headers.AuthenticationHeaderValue("Bearer", apiKey); // using the injected client

   var prompt = "You are a cover letter writing expert. Write a professional cover letter based on the job description, company, job title and the user's CV.\n\n" +
   $"Job Title: {jobTitle}\n" +
   $"Company: {company}\n\n" +
   $"CV:\n{cvText}\n\n" +
   $"Job Description:\n{jobDesc}\n\n" +
   "Write a professional cover letter only. No explanations, no extra text, just the cover letter.";
 
   var body = new
{
    model,
    messages = new[]
    {
        new { role = "user", content = prompt }
    }
};

 var response = await _client.PostAsJsonAsync("https://api.groq.com/openai/v1/chat/completions", body); // using the injected client
var json = await response.Content.ReadFromJsonAsync<JsonElement>();

var content = json
    .GetProperty("choices")[0]
    .GetProperty("message")
    .GetProperty("content")
    .GetString() ?? "";

return new { coverLetter = content };
    }
       
        
    
     private async Task<string> ExtractTextAsync(IFormFile file)
    {


    
        var extension = Path.GetExtension(file.FileName).ToLower();

        if(extension == ".pdf")
        {
            
        using var stream = file.OpenReadStream();// closed opened file
        using var pdf = UglyToad.PdfPig.PdfDocument.Open(stream);// reads file
        var text = string.Join(" ", pdf.GetPages().Select(p => p.Text)); // converts file into text
        return text;
        }
        if (extension == ".docx")
    {
         using var stream = file.OpenReadStream();
    using var doc = DocumentFormat.OpenXml.Packaging.WordprocessingDocument.Open(stream, false);
    if (doc.MainDocumentPart == null)
        return "";

    if (doc.MainDocumentPart.Document == null)
        return "";

    if (doc.MainDocumentPart.Document.Body == null)
        return "";

    return doc.MainDocumentPart.Document.Body.InnerText;
    }
    using var reader = new StreamReader(file.OpenReadStream());
return await reader.ReadToEndAsync();

    }
    
    }