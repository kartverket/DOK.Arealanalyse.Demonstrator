using Dok.Arealanalyse.Mcp.Clients;
using Dok.Arealanalyse.Mcp.Models;
using ModelContextProtocol.Server;
using System.ComponentModel;
using System.Text.Json.Nodes;

namespace Dok.Arealanalyse.Mcp;

[McpServerToolType]
public static class Tools
{
    public const int Epsg = 25833;
    private readonly static string EpsgProjection = $"EPSG::{Epsg}";

    [McpServerTool, Description(
        "Run DOK arealanalyse for a reguleringsplan (zoning plan). " +
        "This is the preferred tool when the user has a plan ID and municipality number. " +
        "Searches across lifecycle stages (planleggingigangsatt, offentligettersyn, vedtattplan) unless a specific stage is provided. " +
        "The analysis may take up to a few minutes. " +
        "Returns JSON with planName, planType, lifecycleStage, reportUrl (link to generated PDF report), and the full analysis result.")]
    public static async Task<string> AnalyzeByPlan(
        DokApiClient apiClient,
        PlanDataClient planDataClient,
        [Description("Plan ID (planidentifikasjon), e.g. '911'")] string planId,
        [Description("Municipality number (kommunenummer), e.g. '3228'")] string kommunenummer,
        [Description("Buffer in meters. Defaults to 0")] int requestedBuffer = 0,
        [Description("Lifecycle stage: 'planleggingigangsatt', 'offentligettersyn', 'vedtattplan'. Searches all if omitted.")] string? lifecycleStage = null,
        [Description("Use case context: 'Reguleringsplan', 'Kommuneplan', or 'Byggesak'. Defaults to null (all).")] string? context = null,
        [Description("Theme filter: 'Geologi', 'Kulturminner', 'Klima', 'Kyst og fiskeri', 'Landbruk', 'Natur', 'Plan', 'Samferdsel', or 'Samfunnssikkerhet'. Defaults to null (all).")] string? theme = null,
        [Description("Include guidance from Geolett")] bool includeGuidance = true,
        [Description("Include quality measurement")] bool includeQualityMeasurement = true,
        [Description("Only include the municipality's chosen DOK data")] bool includeFilterChosenDOK = false,
        [Description("Include factual information")] bool includeFacts = true,
        CancellationToken cancellationToken = default)
    {
        PlanResult? plan;

        try
        {
            plan = await planDataClient.GetPlanAsync(kommunenummer, planId, lifecycleStage, cancellationToken);
        }
        catch (HttpRequestException ex)
        {
            return $"Failed to fetch plan geometry from PlanData (plandata.ft.dibk.no): {ex.Message}";
        }
        catch (TaskCanceledException)
        {
            return "Request to PlanData (plandata.ft.dibk.no) timed out while fetching plan geometry.";
        }

        if (plan is null)
            return $"No plan found with planId '{planId}' in kommune '{kommunenummer}'.";

        string response;

        try
        {
            var payload = Utils.BuildAnalysisPayload(plan.Geometry, EpsgProjection, requestedBuffer, context, theme, includeGuidance, includeQualityMeasurement, includeFilterChosenDOK, includeFacts);
            response = await apiClient.AnalyzeAsync(payload, null, cancellationToken);
        }
        catch (HttpRequestException ex)
        {
            return $"Plan '{plan.PlanName}' was found, but the DOK analysis request failed: {ex.Message}";
        }
        catch (TaskCanceledException)
        {
            return $"Plan '{plan.PlanName}' was found, but the DOK analysis request timed out.";
        }

        var analysisNode = JsonNode.Parse(response);

        var summary = new JsonObject
        {
            ["planName"] = plan.PlanName,
            ["planType"] = plan.PlanType,
            ["lifecycleStage"] = plan.LifecycleStage,
            ["reportUrl"] = analysisNode?["report"]?.GetValue<string>(),
            ["analysis"] = analysisNode
        };

        return DokApiClient.PrettyJson(summary.ToJsonString());
    }

    [McpServerTool, Description(
        "Run DOK arealanalyse for a property (eiendom/matrikkelenhet). " +
        "This is the preferred tool when the user has a property identifier (kommunenummer, gårdsnummer, bruksnummer). " +
        "The analysis may take up to a few minutes. " +
        "Returns JSON with matrikkelnummer, reportUrl (link to generated PDF report), and the full analysis result.")]
    public static async Task<string> AnalyzeByEiendom(
        DokApiClient apiClient,
        EiendomClient eiendomClient,
        [Description("Municipality number (kommunenummer), e.g. '4020'")] string kommunenummer,
        [Description("Farm number (gårdsnummer), e.g. 56")] int gardsnummer,
        [Description("Property number (bruksnummer), e.g. 65")] int bruksnummer,
        [Description("Lease number (festenummer), optional")] int? festenummer = null,
        [Description("Section number (seksjonsnummer), optional")] int? seksjonsnummer = null,
        [Description("Buffer in meters. Defaults to 0")] int requestedBuffer = 0,
        [Description("Use case context: 'Reguleringsplan', 'Kommuneplan', or 'Byggesak'. Defaults to null (all).")] string? context = null,
        [Description("Theme filter: 'Geologi', 'Kulturminner', 'Klima', 'Kyst og fiskeri', 'Landbruk', 'Natur', 'Plan', 'Samferdsel', or 'Samfunnssikkerhet'. Defaults to null (all).")] string? theme = null,
        [Description("Include guidance from Geolett")] bool includeGuidance = true,
        [Description("Include quality measurement")] bool includeQualityMeasurement = true,
        [Description("Only include the municipality's chosen DOK data")] bool includeFilterChosenDOK = false,
        [Description("Include factual information")] bool includeFacts = true,
        CancellationToken cancellationToken = default)
    {
        EiendomResult? eiendom;

        try
        {
            eiendom = await eiendomClient.GetEiendomAsync(kommunenummer, gardsnummer, bruksnummer, festenummer, seksjonsnummer, cancellationToken);
        }
        catch (HttpRequestException ex)
        {
            return $"Failed to fetch property geometry from Kartverket (api.kartverket.no): {ex.Message}";
        }
        catch (TaskCanceledException)
        {
            return "Request to Kartverket (api.kartverket.no) timed out while fetching property geometry.";
        }

        if (eiendom is null)
            return $"No property found for eiendom {kommunenummer}/{gardsnummer}/{bruksnummer}.";

        string response;

        try
        {
            var payload = Utils.BuildAnalysisPayload(eiendom.Geometry, EpsgProjection, requestedBuffer, context, theme, includeGuidance, includeQualityMeasurement, includeFilterChosenDOK, includeFacts);
            response = await apiClient.AnalyzeAsync(payload, null, cancellationToken);
        }
        catch (HttpRequestException ex)
        {
            return $"Property {eiendom.MatrikkelnummerTekst} was found, but the DOK analysis request failed: {ex.Message}";
        }
        catch (TaskCanceledException)
        {
            return $"Property {eiendom.MatrikkelnummerTekst} was found, but the DOK analysis request timed out.";
        }

        var analysisNode = JsonNode.Parse(response);

        var summary = new JsonObject
        {
            ["matrikkelnummer"] = eiendom.MatrikkelnummerTekst,
            ["reportUrl"] = analysisNode?["report"]?.GetValue<string>(),
            ["analysis"] = analysisNode
        };

        return DokApiClient.PrettyJson(summary.ToJsonString());
    }

    [McpServerTool, Description(
        "Get sample GeoJSON geometries from the DOK API. " +
        "Use this to discover available test geometries that can be passed to AnalyzeIntersections. " +
        "Returns an array of sample entries with GeoJSON geometry and metadata.")]
    public static Task<string> ListSamples(DokApiClient apiClient, CancellationToken cancellationToken)
    {
        return apiClient.ListSamplesAsync(cancellationToken);
    }

    [McpServerTool, Description(
        "Run DOK arealanalyse with a raw JSON payload. " +
        "Prefer AnalyzeByPlan or AnalyzeByEiendom when you have a plan ID or property identifier — use this only when you already have GeoJSON geometry. " +
        "The analysis may take up to a few minutes. " +
        "The payload must follow this structure: " +
        "{\"inputs\":{\"inputGeometry\":<GeoJSON with crs>,\"requestedBuffer\":0,\"context\":null,\"theme\":null,\"includeGuidance\":true,\"includeQualityMeasurement\":true,\"includeFilterChosenDOK\":false,\"includeFacts\":true}}. " +
        "The inputGeometry must include a crs property: {\"crs\":{\"type\":\"name\",\"properties\":{\"name\":\"urn:ogc:def:crs:EPSG::25833\"}}}. " +
        "Returns the full analysis result as JSON.")]
    public static async Task<string> AnalyzeIntersections(
        DokApiClient apiClient,
        [Description(
            "JSON payload. Must contain an 'inputs' object with 'inputGeometry' (GeoJSON with crs property set to urn:ogc:def:crs:EPSG::25833), " +
            "'requestedBuffer' (int), and optional 'context', 'theme', 'includeGuidance', 'includeQualityMeasurement', 'includeFilterChosenDOK', 'includeFacts'.")] string payloadJson,
        [Description("Optional x-correlation-id header value")] string? correlationId,
        CancellationToken cancellationToken)
    {
        JsonNode payload;

        try
        {
            payload = JsonNode.Parse(payloadJson) ?? throw new ArgumentException("Payload JSON cannot be null.", nameof(payloadJson));
        }
        catch (Exception ex)
        {
            throw new ArgumentException("payloadJson must be valid JSON.", nameof(payloadJson), ex);
        }

        string response;

        try
        {
            response = await apiClient.AnalyzeAsync(payload, correlationId, cancellationToken);
        }
        catch (HttpRequestException ex)
        {
            return $"DOK analysis request failed: {ex.Message}";
        }
        catch (TaskCanceledException)
        {
            return "DOK analysis request timed out.";
        }

        return DokApiClient.PrettyJson(response);
    }

    [McpServerTool, Description(
        "Convert a local SOSI or GML file to an outline GeoJSON geometry. " +
        "The returned GeoJSON can be used as inputGeometry in AnalyzeIntersections. " +
        "The output is projected to the specified EPSG (default 25833 / UTM zone 33N).")]
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

    [McpServerTool, Description(
        "Validate a GeoJSON geometry before passing it to analysis. " +
        "Use this to check that GeoJSON is well-formed and has valid geometry. " +
        "Returns validation result indicating whether the geometry is valid.")]
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
}
