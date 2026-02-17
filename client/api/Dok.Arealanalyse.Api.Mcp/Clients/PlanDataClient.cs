using System.Text.Json.Nodes;

namespace Dok.Arealanalyse.Api.Mcp.Clients;

public sealed class PlanDataClient(HttpClient httpClient, ILogger<PlanDataClient> logger)
{
    private static readonly string[] DefaultLifecycleStages = ["planleggingigangsatt", "offentligettersyn", "vedtattplan"];

    public async Task<PlanResult?> GetPlanAsync(
        string kommunenummer, string planId, string? lifecycleStage, CancellationToken ct)
    {
        var stages = !string.IsNullOrWhiteSpace(lifecycleStage)
            ? [lifecycleStage]
            : DefaultLifecycleStages;

        foreach (var stage in stages)
        {
            logger.LogDebug("Searching for plan {PlanId} in kommune {Kommune}, stage {Stage}", planId, kommunenummer, stage);
            var result = await TryGetPlanFromStageAsync(stage, kommunenummer, planId, ct);
            if (result is not null)
            {
                logger.LogInformation("Found plan '{PlanName}' ({PlanType}) in stage {Stage}", result.PlanName, result.PlanType, stage);
                return result;
            }
        }

        logger.LogWarning("No plan found with planId {PlanId} in kommune {Kommune}", planId, kommunenummer);
        return null;
    }

    private async Task<PlanResult?> TryGetPlanFromStageAsync(string stage, string kommunenummer, string planId, CancellationToken ct)
    {
        var url = $"{stage}/collections/planomrade/items"
            + $"?nasjonalArealplanId.kommunenummer={Uri.EscapeDataString(kommunenummer)}"
            + $"&nasjonalArealplanId.planid={Uri.EscapeDataString(planId)}"
            + "&limit=1&f=json";

        using var response = await httpClient.GetAsync(url, ct);

        if (!response.IsSuccessStatusCode)
        {
            logger.LogDebug("Server-side filter returned {StatusCode} for stage {Stage}, falling back to client-side",
                (int)response.StatusCode, stage);
            return await TryGetPlanClientSideAsync(stage, kommunenummer, planId, ct);
        }

        var json = await response.Content.ReadAsStringAsync(ct);
        var result = TryExtractPlan(json, kommunenummer, planId, stage, serverFiltered: true);

        if (result is not null)
            return result;

        return await TryGetPlanClientSideAsync(stage, kommunenummer, planId, ct);
    }

    private async Task<PlanResult?> TryGetPlanClientSideAsync(
        string stage, string kommunenummer, string planId, CancellationToken ct)
    {
        var url = $"{stage}/collections/planomrade/items?limit=100&f=json";

        using var response = await httpClient.GetAsync(url, ct);

        if (!response.IsSuccessStatusCode)
            return null;

        var json = await response.Content.ReadAsStringAsync(ct);
        return TryExtractPlan(json, kommunenummer, planId, stage, serverFiltered: false);
    }

    private static PlanResult? TryExtractPlan(string json, string kommunenummer, string planId, string stage, bool serverFiltered)
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

            if (!serverFiltered)
            {
                var nasjonalId = properties["nasjonalArealplanId"];
                var featureKommune = nasjonalId?["kommunenummer"]?.GetValue<string>();
                var featurePlanId = nasjonalId?["planid"]?.GetValue<string>();

                if (!string.Equals(featureKommune, kommunenummer, StringComparison.OrdinalIgnoreCase) ||
                    !string.Equals(featurePlanId, planId, StringComparison.OrdinalIgnoreCase))
                    continue;
            }

            var geometry = feature["geometry"];
            if (geometry is null)
                continue;

            var planName = properties["planNavn"]?.GetValue<string>()
                ?? properties["navn"]?.GetValue<string>()
                ?? "Unknown";

            var planType = properties["plantype"]?.GetValue<string>()
                ?? properties["plantypeKode"]?.GetValue<string>()
                ?? "Unknown";

            return new PlanResult(geometry.DeepClone(), planName, planType, stage);
        }

        return null;
    }
}

public record PlanResult(JsonNode Geometry, string PlanName, string PlanType, string LifecycleStage);
