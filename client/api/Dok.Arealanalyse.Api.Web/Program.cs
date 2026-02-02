using Dok.Arealanalyse.Api.Application.Models.Settings;
using Dok.Arealanalyse.Api.Application.Services;
using Dok.Arealanalyse.Api.Web.Services;
using MaxRev.Gdal.Core;

var builder = WebApplication.CreateBuilder(args);
var services = builder.Services;
var configuration = builder.Configuration;

services.AddControllers()
    .AddJsonOptions(options =>
    {
        options.JsonSerializerOptions.WriteIndented = true;
    });

services.AddResponseCaching();

services.AddHttpContextAccessor();

services.Configure<PygeoapiSettings>(configuration.GetSection(PygeoapiSettings.SectionName));

services.AddTransient<IMultipartRequestService, MultipartRequestService>();
services.AddTransient<ISosiConvertService, SosiConvertService>();
services.AddTransient<IGmlConvertService, GmlConvertService>();
services.AddTransient<IGeoJsonSampleService, GeoJsonSampleService>();
services.AddTransient<IValidationService, ValidationService>();

services.AddHttpClient<IPygeoapiService, PygeoapiService>();

services.AddCors(options =>
{
    options.AddPolicy("Development", builder =>
    {
        builder
            .WithMethods("GET", "POST", "PUT", "DELETE", "OPTIONS")
            .WithHeaders("*")
            .AllowCredentials()
            .SetIsOriginAllowed(origin =>
            {
                return origin != null && origin.StartsWith("http://localhost", StringComparison.CurrentCultureIgnoreCase);
            });
    });
});

var app = builder.Build();

GdalBase.ConfigureAll();

app.UseCors("Development");

app.UseResponseCaching();

app.Use(async (context, next) =>
{
    context.Request.EnableBuffering();
    await next();
});

app.UseHttpsRedirection();

app.UseAuthorization();

app.MapControllers();

app.Run();
