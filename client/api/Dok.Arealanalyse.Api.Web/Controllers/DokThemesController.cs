using Dok.Arealanalyse.Api.Application.Services;
using Microsoft.AspNetCore.Mvc;

namespace Dok.Arealanalyse.Api.Web.Controllers;

[ApiController]
[Route("api/[controller]")]
public class DokThemesController(
    IDokThemesHttpClient dokThemesHttpClient,
    ILogger<DokThemesController> logger) : BaseController(logger)
{
    [HttpGet]
    [ResponseCache(Duration = 86400)]
    public async Task<IActionResult> GetAll()
    {
        try
        {
            var result = await dokThemesHttpClient.GetDokThemesAsync();

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
