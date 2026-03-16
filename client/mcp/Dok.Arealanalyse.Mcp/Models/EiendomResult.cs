using System.Text.Json.Nodes;

namespace Dok.Arealanalyse.Mcp.Models;

public record EiendomResult(JsonNode Geometry, string MatrikkelnummerTekst);
