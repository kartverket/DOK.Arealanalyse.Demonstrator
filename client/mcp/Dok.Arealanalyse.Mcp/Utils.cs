using System.Text.Json.Nodes;

namespace Dok.Arealanalyse.Mcp;

internal static class Utils
{
    public static JsonNode BuildAnalysisPayload(
        JsonNode geometry,
        string crsEpsg,
        int requestedBuffer,
        string? context,
        string? theme,
        bool includeGuidance,
        bool includeQualityMeasurement,
        bool includeFilterChosenDOK,
        bool includeFacts)
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
                ["context"] = context,
                ["theme"] = theme,
                ["includeGuidance"] = includeGuidance,
                ["includeQualityMeasurement"] = includeQualityMeasurement,
                ["includeFilterChosenDOK"] = includeFilterChosenDOK,
                ["includeFacts"] = includeFacts
            }
        };
    }
}