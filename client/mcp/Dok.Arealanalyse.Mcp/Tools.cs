using Dok.Arealanalyse.Mcp.Clients;
using ModelContextProtocol.Server;
using System.ComponentModel;
using System.Text.Json.Nodes;

namespace Dok.Arealanalyse.Mcp;

[McpServerToolType]
public static class Tools
{
    [McpServerTool, Description("Run DOK arealanalyse for a reguleringsplan. Fetches plan geometry from plandata.ft.dibk.no and passes it to DOK analysis.")]
    public static async Task<string> AnalyzeByPlan(
        DokApiClient apiClient,
        PlanDataClient planDataClient,
        [Description("Plan ID (planidentifikasjon), e.g. '911'")] string planId,
        [Description("Municipality number (kommunenummer), e.g. '3228'")] string kommunenummer,
        [Description("Buffer in meters. Defaults to 0")] int requestedBuffer = 0,
        [Description("Lifecycle stage: 'planleggingigangsatt', 'offentligettersyn', 'vedtattplan'. Searches all if omitted.")] string? lifecycleStage = null,
        [Description("Include guidance from Geolett")] bool includeGuidance = true,
        [Description("Include quality measurement")] bool includeQualityMeasurement = true,
        CancellationToken cancellationToken = default)
    {
        var plan = await planDataClient.GetPlanAsync(kommunenummer, planId, lifecycleStage, cancellationToken);

        if (plan is null)
            return $"No plan found with planId '{planId}' in kommune '{kommunenummer}'.";

        var payload = BuildAnalysisPayload(plan.Geometry, "EPSG::4326", requestedBuffer, includeGuidance, includeQualityMeasurement);
        var response = await apiClient.AnalyzeAsync(payload, null, cancellationToken);

        var summary = new JsonObject
        {
            ["planName"] = plan.PlanName,
            ["planType"] = plan.PlanType,
            ["lifecycleStage"] = plan.LifecycleStage,
            ["analysis"] = JsonNode.Parse(response)
        };

        return DokApiClient.PrettyJson(summary.ToJsonString());
    }

    [McpServerTool, Description("Run DOK arealanalyse for a property (eiendom). Fetches teig geometry from WFS and passes it to DOK analysis.")]
    public static async Task<string> AnalyzeByEiendom(
        DokApiClient apiClient,
        TeigWfsClient teigWfsClient,
        [Description("Municipality number (kommunenummer), e.g. '4020'")] string kommunenummer,
        [Description("Farm number (gårdsnummer), e.g. 56")] int gardsnummer,
        [Description("Property number (bruksnummer), e.g. 65")] int bruksnummer,
        [Description("Lease number (festenummer), optional")] int? festenummer = null,
        [Description("Section number (seksjonsnummer), optional")] int? seksjonsnummer = null,
        [Description("Buffer in meters. Defaults to 0")] int requestedBuffer = 0,
        [Description("Include guidance from Geolett")] bool includeGuidance = true,
        [Description("Include quality measurement")] bool includeQualityMeasurement = true,
        CancellationToken cancellationToken = default)
    {
        var teig = await teigWfsClient.GetTeigAsync(kommunenummer, gardsnummer, bruksnummer, festenummer, seksjonsnummer, cancellationToken);

        if (teig is null)
            return $"No teig found for eiendom {kommunenummer}/{gardsnummer}/{bruksnummer}.";

        var payload = BuildAnalysisPayload(teig.Geometry, "EPSG::4326", requestedBuffer, includeGuidance, includeQualityMeasurement);
        var response = await apiClient.AnalyzeAsync(payload, null, cancellationToken);

        var summary = new JsonObject
        {
            ["matrikkelnummer"] = teig.MatrikkelnummerTekst,
            ["teigCount"] = teig.TeigCount,
            ["analysis"] = JsonNode.Parse(response)
        };

        return DokApiClient.PrettyJson(summary.ToJsonString());
    }

    [McpServerTool, Description("Get configured sample GeoJSON entries from the DOK API.")]
    public static Task<string> ListSamples(DokApiClient apiClient, CancellationToken cancellationToken)
    {
        return apiClient.ListSamplesAsync(cancellationToken);
    }

    [McpServerTool, Description("Run DOK arealanalyse through /api/pygeoapi with a JSON payload.")]
    public static async Task<string> AnalyzeIntersections(
        DokApiClient apiClient,
        [Description("JSON payload passed to /api/pygeoapi")] string payloadJson,
        [Description("Optional x-correlation-id header value")] string? correlationId,
        CancellationToken cancellationToken)
    {
        JsonNode payload;

        try
        {
            payload = JsonNode.Parse(payloadJson)
                ?? throw new ArgumentException("Payload JSON cannot be null.", nameof(payloadJson));
        }
        catch (Exception ex)
        {
            throw new ArgumentException("payloadJson must be valid JSON.", nameof(payloadJson), ex);
        }

        var response = await apiClient.AnalyzeAsync(payload, correlationId, cancellationToken);
        return DokApiClient.PrettyJson(response);
    }

    [McpServerTool, Description("Convert a local SOSI or GML file to outline by calling /api/convert/{fileType}/outline.")]
    public static async Task<string> ConvertOutline(
        DokApiClient apiClient,
        [Description("Absolute or relative path to a local file readable by the MCP server process")] string filePath,
        [Description("Allowed values: sosi or gml")] string fileType,
        [Description("Destination EPSG. Defaults to 25833")] int destEpsg = 25833,
        CancellationToken cancellationToken = default)
    {
        if (!File.Exists(filePath))
            throw new FileNotFoundException("File path does not exist.", filePath);

        if (!string.Equals(fileType, "sosi", StringComparison.OrdinalIgnoreCase) &&
            !string.Equals(fileType, "gml", StringComparison.OrdinalIgnoreCase))
            throw new ArgumentException("fileType must be either 'sosi' or 'gml'.", nameof(fileType));

        var response = await apiClient.ConvertOutlineAsync(
            filePath,
            fileType.ToLowerInvariant(),
            destEpsg,
            cancellationToken);

        return DokApiClient.PrettyJson(response);
    }

    [McpServerTool, Description("Validate a GeoJSON object by calling /api/validate as multipart form-data.")]
    public static async Task<string> ValidateGeoJson(
        DokApiClient apiClient,
        [Description("GeoJSON content as a JSON string")] string geoJson,
        CancellationToken cancellationToken)
    {
        try
        {
            JsonNode.Parse(geoJson);
        }
        catch (Exception ex)
        {
            throw new ArgumentException("geoJson must be valid JSON.", nameof(geoJson), ex);
        }

        var response = await apiClient.ValidateGeoJsonAsync(geoJson, cancellationToken);
        return DokApiClient.PrettyJson(response);
    }

    private static JsonNode BuildAnalysisPayload(
        JsonNode geometry,
        string crsEpsg,
        int requestedBuffer,
        bool includeGuidance,
        bool includeQualityMeasurement)
    {
        var inputGeometry = geometry.DeepClone();

        inputGeometry["crs"] = new JsonObject
        {
            ["type"] = "name",
            ["properties"] = new JsonObject
            {
                ["name"] = $"urn:ogc:def:crs:{crsEpsg}"
            }
        };

        return new JsonObject
        {
            ["inputs"] = new JsonObject
            {
                ["inputGeometry"] = inputGeometry,
                ["requestedBuffer"] = requestedBuffer,
                ["context"] = "Reguleringsplan",
                ["theme"] = null,
                ["includeGuidance"] = includeGuidance,
                ["includeQualityMeasurement"] = includeQualityMeasurement,
                ["includeFilterChosenDOK"] = false,
                ["includeFacts"] = true
            }
        };
    }
}
