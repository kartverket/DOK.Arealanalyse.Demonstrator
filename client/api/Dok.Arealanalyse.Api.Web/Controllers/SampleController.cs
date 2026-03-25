using Dok.Arealanalyse.Api.Application.Services;
using Microsoft.AspNetCore.Mvc;

namespace Dok.Arealanalyse.Api.Web.Controllers;

[ApiController]
[Route("api/[controller]")]
public class SampleController(
    IGeoJsonSampleService geoJsonSampleService,
    ILogger<SampleController> logger) : BaseController(logger)
{
    [HttpGet]
    [ResponseCache(Duration = 86400)]
    public async Task<IActionResult> GetAll()
    {
        try
        {
            var result = await geoJsonSampleService.GetSamplesAsync();

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
