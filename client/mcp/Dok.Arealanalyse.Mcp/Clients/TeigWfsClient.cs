using System.Globalization;
using System.Text;
using System.Text.Json.Nodes;
using System.Xml.Linq;

namespace Dok.Arealanalyse.Mcp.Clients;

public sealed class TeigWfsClient(HttpClient httpClient, ILogger<TeigWfsClient> logger)
{
    private const string AppNs = "http://skjema.geonorge.no/SOSI/produktspesifikasjon/Matrikkelen-Eiendomskart-Teig/20211101";
    private const string GmlNs = "http://www.opengis.net/gml/3.2";
    private const string WfsNs = "http://www.opengis.net/wfs/2.0";
    private const string FesNs = "http://www.opengis.net/fes/2.0";

    private static readonly XNamespace App = AppNs;
    private static readonly XNamespace Gml = GmlNs;

    public async Task<TeigResult?> GetTeigAsync(
        string kommunenummer, int gardsnummer, int bruksnummer,
        int? festenummer, int? seksjonsnummer, CancellationToken ct)
    {
        logger.LogDebug("WFS GetFeature for teig {Kommune}/{Gard}/{Bruk}", kommunenummer, gardsnummer, bruksnummer);
        var requestXml = BuildWfsRequest(kommunenummer, gardsnummer, bruksnummer, festenummer, seksjonsnummer);

        using var content = new StringContent(requestXml, Encoding.UTF8, "application/xml");
        using var response = await httpClient.PostAsync("", content, ct);

        if (!response.IsSuccessStatusCode)
        {
            var body = await response.Content.ReadAsStringAsync(ct);
            logger.LogError("WFS request failed with status {StatusCode}. Response: {Body}", (int)response.StatusCode, body);
            throw new HttpRequestException($"WFS request failed with status {(int)response.StatusCode} ({response.StatusCode}). Response: {body}");
        }

        var responseXml = await response.Content.ReadAsStringAsync(ct);
        var result = ParseWfsResponse(responseXml);

        if (result is null)
            logger.LogWarning("No teig found for {Kommune}/{Gard}/{Bruk}", kommunenummer, gardsnummer, bruksnummer);
        else
            logger.LogInformation("Found {TeigCount} teig(s) for {Matrikkel}", result.TeigCount, result.MatrikkelnummerTekst);

        return result;
    }

    private static string BuildWfsRequest(
        string kommunenummer, int gardsnummer, int bruksnummer,
        int? festenummer, int? seksjonsnummer)
    {
        var filters = new StringBuilder();
        filters.Append($"""
                <fes:PropertyIsEqualTo>
                  <fes:ValueReference>app:matrikkelenhet/app:Matrikkelenhet/app:kommunenummer</fes:ValueReference>
                  <fes:Literal>{EscapeXml(kommunenummer)}</fes:Literal>
                </fes:PropertyIsEqualTo>
                <fes:PropertyIsEqualTo>
                  <fes:ValueReference>app:matrikkelenhet/app:Matrikkelenhet/app:gardsnummer</fes:ValueReference>
                  <fes:Literal>{gardsnummer}</fes:Literal>
                </fes:PropertyIsEqualTo>
                <fes:PropertyIsEqualTo>
                  <fes:ValueReference>app:matrikkelenhet/app:Matrikkelenhet/app:bruksnummer</fes:ValueReference>
                  <fes:Literal>{bruksnummer}</fes:Literal>
                </fes:PropertyIsEqualTo>
            """);

        if (festenummer.HasValue)
        {
            filters.Append($"""
                <fes:PropertyIsEqualTo>
                  <fes:ValueReference>app:matrikkelenhet/app:Matrikkelenhet/app:festenummer</fes:ValueReference>
                  <fes:Literal>{festenummer.Value}</fes:Literal>
                </fes:PropertyIsEqualTo>
            """);
        }

        if (seksjonsnummer.HasValue)
        {
            filters.Append($"""
                <fes:PropertyIsEqualTo>
                  <fes:ValueReference>app:matrikkelenhet/app:Matrikkelenhet/app:seksjonsnummer</fes:ValueReference>
                  <fes:Literal>{seksjonsnummer.Value}</fes:Literal>
                </fes:PropertyIsEqualTo>
            """);
        }

        return $"""
            <?xml version="1.0" encoding="UTF-8"?>
            <wfs:GetFeature
              xmlns:wfs="{WfsNs}"
              xmlns:fes="{FesNs}"
              xmlns:app="{AppNs}"
              xmlns:gml="{GmlNs}"
              service="WFS"
              version="2.0.0"
              outputFormat="application/gml+xml; version=3.2"
              srsName="urn:ogc:def:crs:EPSG::4326"
              count="100">
              <wfs:Query typeNames="app:Teig">
                <fes:Filter>
                  <fes:And>
                    {filters}
                  </fes:And>
                </fes:Filter>
              </wfs:Query>
            </wfs:GetFeature>
            """.TrimStart();
    }

    private static TeigResult? ParseWfsResponse(string xml)
    {
        var doc = XDocument.Parse(xml);
        var teigElements = doc.Descendants(App + "Teig").ToList();

        if (teigElements.Count == 0)
            return null;

        var polygons = new List<JsonArray>();
        string? matrikkelnummerTekst = null;

        foreach (var teig in teigElements)
        {
            matrikkelnummerTekst ??= teig.Descendants(App + "matrikkelnummerTekst").FirstOrDefault()?.Value;

            var omraade = teig.Descendants(App + "område").FirstOrDefault();
            if (omraade is null)
                continue;

            foreach (var gmlPolygon in omraade.Descendants(Gml + "Polygon"))
            {
                var rings = ParsePolygonRings(gmlPolygon);
                if (rings is not null)
                    polygons.Add(rings);
            }
        }

        if (polygons.Count == 0)
            return null;

        JsonNode geometry;

        if (polygons.Count == 1)
        {
            geometry = new JsonObject
            {
                ["type"] = "Polygon",
                ["coordinates"] = polygons[0]
            };
        }
        else
        {
            var multiCoords = new JsonArray();
            foreach (var p in polygons)
                multiCoords.Add(p);

            geometry = new JsonObject
            {
                ["type"] = "MultiPolygon",
                ["coordinates"] = multiCoords
            };
        }

        return new TeigResult(geometry, matrikkelnummerTekst ?? "Unknown", teigElements.Count);
    }

    private static JsonArray? ParsePolygonRings(XElement gmlPolygon)
    {
        var rings = new JsonArray();

        var exterior = gmlPolygon.Element(Gml + "exterior");
        var exteriorRing = ParseLinearRing(exterior);
        if (exteriorRing is null)
            return null;

        rings.Add(exteriorRing);

        foreach (var interior in gmlPolygon.Elements(Gml + "interior"))
        {
            var interiorRing = ParseLinearRing(interior);
            if (interiorRing is not null)
                rings.Add(interiorRing);
        }

        return rings;
    }

    private static JsonArray? ParseLinearRing(XElement? ringParent)
    {
        var linearRing = ringParent?.Element(Gml + "LinearRing");
        var posList = linearRing?.Element(Gml + "posList")?.Value;

        if (string.IsNullOrWhiteSpace(posList))
            return null;

        var values = posList.Split((char[]?)null, StringSplitOptions.RemoveEmptyEntries);
        var coordinates = new JsonArray();

        for (var i = 0; i + 1 < values.Length; i += 2)
        {
            if (double.TryParse(values[i], NumberStyles.Float, CultureInfo.InvariantCulture, out var lat) &&
                double.TryParse(values[i + 1], NumberStyles.Float, CultureInfo.InvariantCulture, out var lon))
            {
                coordinates.Add(new JsonArray(JsonValue.Create(lon), JsonValue.Create(lat)));
            }
        }

        return coordinates.Count > 0 ? coordinates : null;
    }

    private static string EscapeXml(string value)
    {
        return value
            .Replace("&", "&amp;")
            .Replace("<", "&lt;")
            .Replace(">", "&gt;")
            .Replace("\"", "&quot;")
            .Replace("'", "&apos;");
    }
}

public record TeigResult(JsonNode Geometry, string MatrikkelnummerTekst, int TeigCount);
