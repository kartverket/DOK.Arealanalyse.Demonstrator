using Dok.Arealanalyse.Api.Application.Models.Settings;
using Microsoft.Extensions.Options;
using System.Net.Http.Json;
using System.Text;
using System.Text.Json.Nodes;

namespace Dok.Arealanalyse.Api.Application.Services;

public class PygeoapiService(
    HttpClient httpClient,
    IOptions<PygeoapiSettings> options) : IPygeoapiService
{
    public async Task<JsonNode> ExecuteAsync(JsonNode payload)
    {
        using var message = new HttpRequestMessage(HttpMethod.Post, options.Value.ApiUrl);

        message.Content = new StringContent(payload.ToJsonString(), Encoding.UTF8, "application/json");

        try
        {
            httpClient.Timeout = TimeSpan.FromMinutes(5);
            using var response = await httpClient.SendAsync(message);

            response.EnsureSuccessStatusCode();

            return await response.Content.ReadFromJsonAsync<JsonNode>();
        }
        catch
        {
            throw;
        }
    }
}
