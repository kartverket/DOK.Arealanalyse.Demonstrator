using Dok.Arealanalyse.Mcp;
using Dok.Arealanalyse.Mcp.Clients;

var builder = WebApplication.CreateBuilder(args);
var configuration = builder.Configuration;
var services = builder.Services;

services.AddHttpClient<DokApiClient>(client =>
{
    client.BaseAddress = new Uri($"{configuration["DokApi:BaseUrl"]}/");
    client.Timeout = TimeSpan.FromMinutes(5);
});

services.AddHttpClient<PlanDataClient>(client =>
{
    client.BaseAddress = new Uri($"{configuration["PlanData:BaseUrl"]}");
    client.Timeout = TimeSpan.FromSeconds(30);
});

services.AddHttpClient<EiendomClient>(client =>
{
    client.BaseAddress = new Uri($"{configuration["Kartverket:EiendomApiUrl"]}/");
    client.Timeout = TimeSpan.FromSeconds(30);
});

services
    .AddMcpServer()
    .WithHttpTransport()
    .WithToolsFromAssembly(typeof(Tools).Assembly);

var app = builder.Build();

app.Use(async (context, next) =>
{
    try
    {
        await next(context);
    }
    catch (Exception ex)
    {
        var logger = context.RequestServices.GetRequiredService<ILogger<Program>>();
        logger.LogError(ex, "Unhandled exception on {Method} {Path}", context.Request.Method, context.Request.Path);
        if (!context.Response.HasStarted)
        {
            context.Response.StatusCode = 500;
            await context.Response.WriteAsync("Internal server error");
        }
    }
});

app.MapGet("/health", () => Results.Ok(new { status = "ok" }));
app.MapMcp("/mcp");

await app.RunAsync();
