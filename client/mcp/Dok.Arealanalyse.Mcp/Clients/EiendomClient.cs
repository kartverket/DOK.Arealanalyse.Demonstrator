using Dok.Arealanalyse.Mcp.Models;
using System.Globalization;
using System.Text.Json.Nodes;

namespace Dok.Arealanalyse.Mcp.Clients;

public sealed class EiendomClient(HttpClient httpClient, ILogger<EiendomClient> logger)
{
    public async Task<EiendomResult?> GetEiendomAsync(
        string kommunenummer, int gardsnummer, int bruksnummer,
        int? festenummer, int? seksjonsnummer, CancellationToken ct)
    {
        var geoUrl = $"geokoding?kommunenummer={Uri.EscapeDataString(kommunenummer)}&gardsnummer={gardsnummer}&bruksnummer={bruksnummer}";

        if (festenummer.HasValue)
            geoUrl += $"&festenummer={festenummer.Value}";
        if (seksjonsnummer.HasValue)
            geoUrl += $"&seksjonsnummer={seksjonsnummer.Value}";

        logger.LogDebug("Geokoding request: {Url}", geoUrl);

        using var geoResponse = await httpClient.GetAsync(geoUrl, ct);

        if (!geoResponse.IsSuccessStatusCode)
        {
            var body = await geoResponse.Content.ReadAsStringAsync(ct);
            logger.LogError("Geokoding request failed with status {StatusCode}. Response: {Body}", (int)geoResponse.StatusCode, body);
            throw new HttpRequestException($"Geokoding request failed with status {(int)geoResponse.StatusCode} ({geoResponse.StatusCode}). Response: {body}");
        }

        var geoJson = JsonNode.Parse(await geoResponse.Content.ReadAsStringAsync(ct));
        var features = geoJson?["features"]?.AsArray();

        if (features is null || features.Count == 0)
        {
            logger.LogWarning("No features returned from geokoding for {Kommune}/{Gard}/{Bruk}", kommunenummer, gardsnummer, bruksnummer);
            return null;
        }

        var coords = features[0]?["geometry"]?["coordinates"]?.AsArray();
        if (coords is null || coords.Count < 2)
        {
            logger.LogWarning("Geokoding feature has no valid coordinates for {Kommune}/{Gard}/{Bruk}", kommunenummer, gardsnummer, bruksnummer);
            return null;
        }

        var lon = coords[0]!.GetValue<double>();
        var lat = coords[1]!.GetValue<double>();

        var matrikkelnummerTekst = features[0]?["properties"]?["matrikkelnummertekst"]?.GetValue<string>() ?? $"{gardsnummer}/{bruksnummer}";

        logger.LogDebug("Geokoding resolved to point ({Lon}, {Lat}), matrikkel: {Matrikkel}", lon, lat, matrikkelnummerTekst);

        var lonStr = lon.ToString(CultureInfo.InvariantCulture);
        var latStr = lat.ToString(CultureInfo.InvariantCulture);
        var punktUrl = $"punkt/omrader?ost={lonStr}&nord={latStr}&koordsys=4326&radius=1&maksTreff=1&filtrer=features.geometry";

        logger.LogDebug("Punkt/omrader request: {Url}", punktUrl);

        using var punktResponse = await httpClient.GetAsync(punktUrl, ct);

        if (!punktResponse.IsSuccessStatusCode)
        {
            var body = await punktResponse.Content.ReadAsStringAsync(ct);
            logger.LogError("Punkt/omrader request failed with status {StatusCode}. Response: {Body}", (int)punktResponse.StatusCode, body);
            throw new HttpRequestException($"Punkt/omrader request failed with status {(int)punktResponse.StatusCode} ({punktResponse.StatusCode}). Response: {body}");
        }

        var punktJson = JsonNode.Parse(await punktResponse.Content.ReadAsStringAsync(ct));
        var punktFeatures = punktJson?["features"]?.AsArray();

        if (punktFeatures is null || punktFeatures.Count == 0)
        {
            logger.LogWarning("No polygon features returned from punkt/omrader for ({Lon}, {Lat})", lon, lat);
            return null;
        }

        var geometry = punktFeatures[0]?["geometry"];

        if (geometry is null)
        {
            logger.LogWarning("Punkt/omrader feature has no geometry for ({Lon}, {Lat})", lon, lat);
            return null;
        }

        logger.LogInformation("Found eiendom geometry for {Matrikkel}", matrikkelnummerTekst);

        return new EiendomResult(geometry.DeepClone(), matrikkelnummerTekst);
    }
}
