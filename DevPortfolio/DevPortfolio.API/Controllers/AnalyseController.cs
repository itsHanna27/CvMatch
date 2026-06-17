using Microsoft.AspNetCore.Mvc;
using System.Text.Json;

namespace DevPortfolio.API.Controllers; // namespace
[ApiController] 
[Route("api/[controller]")] 
public class AnalyseController : ControllerBase
{
     private readonly IConfiguration _config;
     private readonly HttpClient _client; // http client field

    public AnalyseController(IConfiguration config, IHttpClientFactory httpClientFactory) // injecting the factory
    {
        _config = config;
        _client = httpClientFactory.CreateClient(); // creating the client from the factory
    }
    [HttpPost]
    //taking input from frontend
    public async Task <IActionResult> Analyse([FromForm] AnalyseRequest request)
    {
        var cvText = await ExtractTextAsync(request.Cv);
        var results = await AnalyseWithGroqAsync (cvText, request.JobDescription, request.JobTitle, request.Company);
        return Ok(results);// returning results
    }

    private async Task<string> ExtractTextAsync(IFormFile file)
{
    var extension = Path.GetExtension(file.FileName).ToLower();//getting the type of the cv

    if (extension == ".pdf")
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

    // plain text fallback
    using var reader = new StreamReader(file.OpenReadStream());
    return await reader.ReadToEndAsync();
    
}
private async Task<object> AnalyseWithGroqAsync(string cvText, string jobDesc, string jobTitle, string company)
{
    var apiKey = _config["Groq:ApiKey"];
var model = _config["Groq:Model"] ?? "llama3-8b-8192"; 

    _client.DefaultRequestHeaders.Authorization = new System.Net.Http.Headers.AuthenticationHeaderValue("Bearer", apiKey); // using the injected client
//propt
var prompt = "You are a CV analysis expert. Compare this CV against the job description and return ONLY a JSON object with no extra text.\n\n" +
             $"Job Title: {jobTitle}\n" +
             $"Company: {company}\n\n" +
             $"CV:\n{cvText}\n\n" +
             $"Job Description:\n{jobDesc}\n\n" +
             "Return this exact JSON structure:\n" +
             "{\n" +
             "  \"score\": <number 0-100>,\n" +
             "  \"strengths\": [ { \"title\": \"...\", \"detail\": \"...\" } ],\n" +
             "  \"missing\": [ { \"keyword\": \"...\", \"detail\": \"...\", \"priority\": \"High|Medium|Low\" } ]\n" +
             "}";

//content body
var body = new
{
    model,
    messages = new[]
    {
        new { role = "user", content = prompt }
    }
};

//sending the data
var response = await _client.PostAsJsonAsync("https://api.groq.com/openai/v1/chat/completions", body); // using the injected client
//reading the data
var json = await response.Content.ReadFromJsonAsync<JsonElement>();
var rawResponse = await response.Content.ReadAsStringAsync();
Console.WriteLine(rawResponse);

var content = json
    .GetProperty("choices")[0]  // get first choice
    .GetProperty("message")     // get the message
    .GetProperty("content")     // get the content
    .GetString() ?? "{}";       // get as string, or empty JSON if null
    
    content = content.Trim();
if (content.StartsWith("```")) 
{
    content = content.Replace("```json", "").Replace("```", "").Trim();
}
return JsonSerializer.Deserialize<object>(content)!; // convert string to object
}


}