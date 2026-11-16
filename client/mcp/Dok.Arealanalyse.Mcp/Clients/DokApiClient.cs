using System.Net;
using System.Net.Http.Headers;
using System.Text;
using System.Text.Json;
using System.Text.Json.Nodes;

namespace Dok.Arealanalyse.Mcp.Clients;

public sealed class DokApiClient(HttpClient httpClient, ILogger<DokApiClient> logger)
{
    private static readonly JsonSerializerOptions JsonOptions = new()
    {
        WriteIndented = true
    };

    public async Task<string> ListSamplesAsync(CancellationToken cancellationToken)
    {
        logger.LogDebug("GET eksempler");
        using var response = await httpClient.GetAsync("eksempler", cancellationToken);
        await EnsureSuccessAsync(response, "GET eksempler", cancellationToken);
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

    public async Task<string> ConvertOutlineAsync(string filePath, int destEpsg, CancellationToken cancellationToken)
    {
        logger.LogDebug("POST omrade for file {FilePath}", filePath);

        await using var stream = File.OpenRead(filePath);
        using var response = await PostOmradeAsync(stream, Path.GetFileName(filePath), destEpsg, cancellationToken);
        await EnsureSuccessAsync(response, "POST omrade", cancellationToken);
        return await response.Content.ReadAsStringAsync(cancellationToken);
    }

    public async Task<string> ValidateGeoJsonAsync(string geoJson, CancellationToken cancellationToken)
    {
        logger.LogDebug("POST omrade for validation");

        await using var stream = new MemoryStream(Encoding.UTF8.GetBytes(geoJson));
        using var response = await PostOmradeAsync(stream, "geometry.geojson", null, cancellationToken);

        // /omrade svarer 400 med en forklaring i «detail» når filen eller geometrien er ugyldig
        if (response.StatusCode == HttpStatusCode.BadRequest)
        {
            var body = await response.Content.ReadAsStringAsync(cancellationToken);
            var detail = JsonNode.Parse(body)?["detail"]?.GetValue<string>();

            return new JsonObject { ["valid"] = false, ["message"] = detail }.ToJsonString();
        }

        await EnsureSuccessAsync(response, "POST omrade", cancellationToken);
        return new JsonObject { ["valid"] = true }.ToJsonString();
    }

    private async Task<HttpResponseMessage> PostOmradeAsync(Stream stream, string fileName, int? outEpsg, CancellationToken cancellationToken)
    {
        using var content = new MultipartFormDataContent();
        var fileContent = new StreamContent(stream);

        fileContent.Headers.ContentType = new MediaTypeHeaderValue("application/octet-stream");
        content.Add(fileContent, "file", fileName);

        if (outEpsg is not null)
            content.Add(new StringContent(outEpsg.Value.ToString()), "out_epsg");

        return await httpClient.PostAsync("omrade", content, cancellationToken);
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
        logger.LogError("DOK API {Operation} failed with status {StatusCode}. Response: {Body}", operation, (int)response.StatusCode, body);
        throw new HttpRequestException($"DOK API request failed with status {(int)response.StatusCode} ({response.StatusCode}). Response: {body}");
    }
}
