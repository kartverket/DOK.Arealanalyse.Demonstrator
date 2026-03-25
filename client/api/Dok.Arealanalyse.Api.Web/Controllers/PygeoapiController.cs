using Dok.Arealanalyse.Api.Application.Services;
using Microsoft.AspNetCore.Mvc;
using System.Text.Json.Nodes;

namespace Dok.Arealanalyse.Api.Web.Controllers;

[ApiController]
[Route("api/[controller]")]
public class PygeoapiController(
    IPygeoapiService pygeoapiService,
    ILogger<PygeoapiController> logger) : BaseController(logger)
{
    [HttpPost]
    public async Task<IActionResult> Analyze([FromBody] JsonNode payload)
    {
        try
        {
            if (payload == null)
                return BadRequest();

            var result = await pygeoapiService.ExecuteAsync(payload);

            return Ok(result);
        }
        catch (Exception exception)
        {
            var result = HandleException(exception);

            if (result != null)
                return result;

            throw;
        }
    }
}
