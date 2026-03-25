namespace Dok.Arealanalyse.Api.Application.Services;

public interface IDokThemesHttpClient
{
    Task<List<string>> GetDokThemesAsync();
}
