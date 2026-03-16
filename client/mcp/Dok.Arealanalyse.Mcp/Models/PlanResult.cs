using System.Text.Json.Nodes;

namespace Dok.Arealanalyse.Mcp.Models;

public record PlanResult(JsonNode Geometry, string PlanName, string PlanType, string LifecycleStage);
