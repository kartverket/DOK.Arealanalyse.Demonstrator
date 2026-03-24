using Dok.Arealanalyse.Mcp.Models;
using System.Text.Json.Nodes;

namespace Dok.Arealanalyse.Mcp.Clients;

public sealed class EiendomClient(HttpClient httpClient, ILogger<EiendomClient> logger)
{
    public async Task<EiendomResult?> GetEiendomAsync(
        string kommunenummer, int gardsnummer, int bruksnummer,
        int? festenummer, int? seksjonsnummer, CancellationToken ct)
    {
        var url = $"geokoding?kommunenummer={Uri.EscapeDataString(kommunenummer)}&gardsnummer={gardsnummer}&bruksnummer={bruksnummer}&omrade=true&utkoordsys={Tools.Epsg}&filtrer=features.geometry";

        if (festenummer.HasValue)
            url += $"&festenummer={festenummer.Value}";
        if (seksjonsnummer.HasValue)
            url += $"&seksjonsnummer={seksjonsnummer.Value}";

        logger.LogDebug("Geokoding request: {Url}", url);

        using var response = await httpClient.GetAsync(url, ct);

        if (!response.IsSuccessStatusCode)
        {
            var body = await response.Content.ReadAsStringAsync(ct);
            logger.LogError("Geokoding request failed with status {StatusCode}. Response: {Body}", (int)response.StatusCode, body);
            throw new HttpRequestException($"Geokoding request failed with status {(int)response.StatusCode} ({response.StatusCode}). Response: {body}");
        }

        var json = JsonNode.Parse(await response.Content.ReadAsStringAsync(ct));
        var features = json?["features"]?.AsArray();

        if (features is null || features.Count == 0)
        {
            logger.LogWarning("No features returned from geokoding for {Kommune}/{Gard}/{Bruk}", kommunenummer, gardsnummer, bruksnummer);
            return null;
        }

        var geometry = features[0]?["geometry"];

        if (geometry is null)
        {
            logger.LogWarning("Geokoding feature has no geometry for {Kommune}/{Gard}/{Bruk}", kommunenummer, gardsnummer, bruksnummer);
            return null;
        }

        var matrikkelnummerTekst = features[0]?["properties"]?["matrikkelnummertekst"]?.GetValue<string>() ?? $"{gardsnummer}/{bruksnummer}";

        logger.LogInformation("Found eiendom geometry for {Matrikkel}", matrikkelnummerTekst);

        return new EiendomResult(geometry.DeepClone(), matrikkelnummerTekst);
    }
}
