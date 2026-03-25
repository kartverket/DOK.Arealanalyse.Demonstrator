using System.Net.Http.Json;
using System.Text.Json.Nodes;
using Microsoft.Extensions.Caching.Memory;


namespace Dok.Arealanalyse.Api.Application.Services;

public class DokThemesHttpClient(
    HttpClient httpClient,
    IMemoryCache cache
) : IDokThemesHttpClient
{
    private const string ApiUrl = "https://register.geonorge.no/api/dok-statusregisteret.json";
    private const string CacheKey = "DokThemes";

    public async Task<List<string>> GetDokThemesAsync()
    {
        return await cache.GetOrCreateAsync<List<string>>(CacheKey, async entry =>
        {
            entry.AbsoluteExpirationRelativeToNow = TimeSpan.FromDays(1);

            var result = await FetchDokThemesAsync();

            return [.. result["containedItems"]
                .AsArray()
                .Where(item => item["status"].GetValue<string>() == "Gyldig")
                .Select(item => item["theme"].GetValue<string>())
                .OrderBy(theme => theme)
                .Distinct()];
            });
    }

    private async Task<JsonNode> FetchDokThemesAsync()
    {
        try
        {
            using var response = await httpClient.GetAsync(ApiUrl);

            response.EnsureSuccessStatusCode();

            return await response.Content.ReadFromJsonAsync<JsonNode>();
        }
        catch
        {
            throw;
        }
    }
}
