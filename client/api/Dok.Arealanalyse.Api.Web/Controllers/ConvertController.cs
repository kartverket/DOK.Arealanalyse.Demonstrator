using Dok.Arealanalyse.Api.Application.Models.Api;
using Dok.Arealanalyse.Api.Application.Services;
using Dok.Arealanalyse.Api.Web.Services;
using Microsoft.AspNetCore.Mvc;

namespace Dok.Arealanalyse.Api.Web.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ConvertController(
    IMultipartRequestService multipartRequestService,
    ISosiConvertService sosiConvertService,
    IGmlConvertService gmlConvertService,
    ILogger<ConvertController> logger) : BaseController(logger)
{
    [HttpPost("sosi/featureCollection")]
    public async Task<IActionResult> GetFeatureCollection()
    {
        try
        {
            using var payload = await multipartRequestService.ReadFromMultipartAsync<Payload>();

            if (payload.File == null)
                return BadRequest();

            var result = await sosiConvertService.GetFeatureCollectionAsync(payload);

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

    [HttpPost("sosi/outline")]
    public async Task<IActionResult> GetOutline()
    {
        try
        {
            using var payload = await multipartRequestService.ReadFromMultipartAsync<Payload>();

            if (payload.File == null)
                return BadRequest();

            var result = await sosiConvertService.GetOutlineAsync(payload);

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

    [HttpPost("gml/outline")]
    public async Task<IActionResult> GetGmlOutline()
    {        
        try
        {
            using var payload = await multipartRequestService.ReadFromMultipartAsync<Payload>();

            if (payload.File == null)
                return BadRequest();

            var result = await gmlConvertService.GetOutlineAsync(payload);

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
