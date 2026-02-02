using Dok.Arealanalyse.Api.Application.Models.Settings;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Options;

namespace Dok.Arealanalyse.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ConfigController(
    IOptions<DatafunnSettings> datafunnOptions,
    ILogger<ConfigController> logger) : BaseController(logger)
{
    [HttpGet("datafunn/url")]
    [ResponseCache(Duration = 300, Location = ResponseCacheLocation.Any)]
    public IActionResult GetDatafunnUrl() => Ok(datafunnOptions.Value?.Url);
}
