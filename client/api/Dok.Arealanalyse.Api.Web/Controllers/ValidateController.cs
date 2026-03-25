using Dok.Arealanalyse.Api.Application.Models.Api;
using Dok.Arealanalyse.Api.Application.Services;
using Dok.Arealanalyse.Api.Web.Services;
using Microsoft.AspNetCore.Mvc;

namespace Dok.Arealanalyse.Api.Web.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ValidateController(
    IValidationService validationService,
    IMultipartRequestService multipartRequestService,
    ILogger<ValidateController> logger) : BaseController(logger)
{
    [HttpPost]
    public async Task<IActionResult> Validate()
    {
        try
        {
            using var payload = await multipartRequestService.ReadFromMultipartAsync<ValidatePayload>();

            if (payload.File == null)
                return BadRequest();

            var result = await validationService.ValidateAsync(payload.File);
            
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
