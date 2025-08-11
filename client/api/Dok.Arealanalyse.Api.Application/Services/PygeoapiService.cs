using Dok.Arealanalyse.Api.Application.Models.Settings;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Options;
using System.Net.Http.Json;
using System.Text;
using System.Text.Json.Nodes;

namespace Dok.Arealanalyse.Api.Application.Services;

public class PygeoapiService(
    HttpClient httpClient,
    IHttpContextAccessor httpContextAccessor,
    IOptions<PygeoapiSettings> options) : IPygeoapiService
{
    private const string CORRELATION_ID_HEADER_NAME = "x-correlation-id";

    public async Task<JsonNode> ExecuteAsync(JsonNode payload)
    {
        using var message = new HttpRequestMessage(HttpMethod.Post, options.Value.ApiUrl);
        var correlationId = GetCorrelationId();

        message.Content = new StringContent(payload.ToJsonString(), Encoding.UTF8, "application/json");

        if (correlationId != null)
            message.Headers.Add(CORRELATION_ID_HEADER_NAME, correlationId);

        try
        {
            httpClient.Timeout = TimeSpan.FromMinutes(5);
            using var response = await httpClient.SendAsync(message);

            response.EnsureSuccessStatusCode();

            return await response.Content.ReadFromJsonAsync<JsonNode>();
        }
        catch (Exception)
        {
            throw;
        }
    }

    private string GetCorrelationId()
    {
        var correlationId = httpContextAccessor.HttpContext.Request.Headers
            .FirstOrDefault(kvp => kvp.Key.Equals(CORRELATION_ID_HEADER_NAME, StringComparison.CurrentCultureIgnoreCase))
            .Value.ToString();

        return !string.IsNullOrWhiteSpace(correlationId) ?
            correlationId :
            null;
    }
}
