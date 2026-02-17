using System.Net.Http.Headers;
using System.Text;
using System.Text.Json;
using System.Text.Json.Nodes;

namespace Dok.Arealanalyse.Api.Mcp.Clients;

public sealed class DokApiClient(HttpClient httpClient, ILogger<DokApiClient> logger)
{
    private static readonly JsonSerializerOptions JsonOptions = new()
    {
        WriteIndented = true
    };

    public async Task<string> ListSamplesAsync(CancellationToken cancellationToken)
    {
        logger.LogDebug("GET sample");
        using var response = await httpClient.GetAsync("sample", cancellationToken);
        await EnsureSuccessAsync(response, "GET sample", cancellationToken);
        return await response.Content.ReadAsStringAsync(cancellationToken);
    }

    public async Task<string> AnalyzeAsync(JsonNode payload, string? correlationId, CancellationToken cancellationToken)
    {
        logger.LogDebug("POST pygeoapi");
        using var message = new HttpRequestMessage(HttpMethod.Post, "pygeoapi");
        message.Content = new StringContent(payload.ToJsonString(), Encoding.UTF8, "application/json");

        if (!string.IsNullOrWhiteSpace(correlationId))
            message.Headers.Add("x-correlation-id", correlationId);

        using var response = await httpClient.SendAsync(message, cancellationToken);
        await EnsureSuccessAsync(response, "POST pygeoapi", cancellationToken);
        return await response.Content.ReadAsStringAsync(cancellationToken);
    }

    public async Task<string> ConvertOutlineAsync(string filePath, string fileType, int destEpsg, CancellationToken cancellationToken)
    {
        var endpoint = $"convert/{fileType}/outline";
        logger.LogDebug("POST {Endpoint} for file {FilePath}", endpoint, filePath);

        await using var stream = File.OpenRead(filePath);
        using var content = new MultipartFormDataContent();
        using var fileContent = new StreamContent(stream);

        fileContent.Headers.ContentType = new MediaTypeHeaderValue("application/octet-stream");
        content.Add(fileContent, "file", Path.GetFileName(filePath));
        content.Add(new StringContent(destEpsg.ToString()), "destEpsg");

        using var response = await httpClient.PostAsync(endpoint, content, cancellationToken);
        await EnsureSuccessAsync(response, $"POST {endpoint}", cancellationToken);
        return await response.Content.ReadAsStringAsync(cancellationToken);
    }

    public async Task<string> ValidateGeoJsonAsync(string geoJson, CancellationToken cancellationToken)
    {
        logger.LogDebug("POST validate");
        var bytes = Encoding.UTF8.GetBytes(geoJson);

        await using var stream = new MemoryStream(bytes);
        using var content = new MultipartFormDataContent();
        using var fileContent = new StreamContent(stream);

        fileContent.Headers.ContentType = new MediaTypeHeaderValue("application/json");
        content.Add(fileContent, "file", "geometry.json");

        using var response = await httpClient.PostAsync("validate", content, cancellationToken);
        await EnsureSuccessAsync(response, "POST validate", cancellationToken);
        return await response.Content.ReadAsStringAsync(cancellationToken);
    }

    public static string PrettyJson(string json)
    {
        using var document = JsonDocument.Parse(json);
        return JsonSerializer.Serialize(document.RootElement, JsonOptions);
    }

    private async Task EnsureSuccessAsync(HttpResponseMessage response, string operation, CancellationToken cancellationToken)
    {
        if (response.IsSuccessStatusCode)
            return;

        var body = await response.Content.ReadAsStringAsync(cancellationToken);
        logger.LogError("DOK API {Operation} failed with status {StatusCode}. Response: {Body}",
            operation, (int)response.StatusCode, body);
        throw new HttpRequestException($"DOK API request failed with status {(int)response.StatusCode} ({response.StatusCode}). Response: {body}");
    }
}
