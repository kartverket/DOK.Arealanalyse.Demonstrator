using Dok.Arealanalyse.Mcp.Models;
using System.Text.Json.Nodes;

namespace Dok.Arealanalyse.Mcp.Clients;

public sealed class PlanDataClient(HttpClient httpClient, ILogger<PlanDataClient> logger)
{
    public async Task<PlanResult?> GetPlanAsync(string kommunenummer, string planId, CancellationToken ct)
    {
        logger.LogDebug("Searching for plan {PlanId} in kommune {Kommune}", planId, kommunenummer);

        var url = $"?nasjonalArealplanId.kommunenummer={Uri.EscapeDataString(kommunenummer)}"
            + $"&nasjonalArealplanId.planid={Uri.EscapeDataString(planId)}"
            + $"&crs={Uri.EscapeDataString($"http://www.opengis.net/def/crs/EPSG/0/{Tools.Epsg}")}"
            + "&limit=1&f=json";

        using var response = await httpClient.GetAsync(url, ct);

        if (!response.IsSuccessStatusCode)
        {
            var body = await response.Content.ReadAsStringAsync(ct);
            logger.LogError("PlanData request failed with status {StatusCode}. Response: {Body}", (int)response.StatusCode, body);
            throw new HttpRequestException($"PlanData request failed with status {(int)response.StatusCode} ({response.StatusCode}). Response: {body}");
        }

        var json = await response.Content.ReadAsStringAsync(ct);
        var result = TryExtractPlan(json, kommunenummer, planId);

        if (result is not null)
        {
            logger.LogInformation("Found plan '{PlanName}' ({PlanType})", result.PlanName, result.PlanType);
            return result;
        }

        logger.LogWarning("No plan found with planId {PlanId} in kommune {Kommune}", planId, kommunenummer);
        return null;
    }

    private static PlanResult? TryExtractPlan(string json, string kommunenummer, string planId)
    {
        var root = JsonNode.Parse(json);
        var features = root?["features"]?.AsArray();

        if (features is null || features.Count == 0)
            return null;

        foreach (var feature in features)
        {
            if (feature is null)
                continue;

            var properties = feature["properties"];
            if (properties is null)
                continue;

            var geometry = feature["geometry"];
            if (geometry is null)
                continue;

            var planName = properties["planNavn"]?.GetValue<string>() ?? "Unknown";
            var planType = properties["plantype"]?.GetValue<string>() ?? "Unknown";

            return new PlanResult(geometry.DeepClone(), planName, planType);
        }

        return null;
    }
}
