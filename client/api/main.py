import locale
import shutil
import tempfile
from pathlib import Path
from typing import Annotated, Any, Dict, List
from fastapi import (FastAPI, HTTPException, Response,
                     UploadFile, File, Form, status)
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.gzip import GZipMiddleware
import uvicorn
import services
from services.exceptions import (
    HttpError, InvalidDatasetError, InvalidGeometryError, GeometryConversionError)

locale.setlocale(locale.LC_COLLATE, 'nb_NO.UTF-8')

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        'https://dok-arealanalyse-api.azurewebsites.net',
        'https://dok-arealanalyse-api-staging.azurewebsites.net',
        'http://localhost:5173',
        'http://localhost'
    ],
    allow_methods=['GET', 'POST'],
    allow_headers=['*'],
    allow_credentials=True
)

app.add_middleware(
    GZipMiddleware,
    minimum_size=1000,
    compresslevel=5
)


@app.post('/api/pygeoapi')
async def analyze(payload: Dict[str, Any]) -> Dict[str, Any]:
    try:
        return await services.analyze(payload)
    except HttpError as err:
        raise HTTPException(
            status_code=err.status,
            detail=err.body
        )


@app.get('/api/doktema')
async def get_dok_themes(response: Response) -> List[str]:
    response.headers['Cache-Control'] = 'public, max-age=86400'

    try:
        return await services.get_dok_tema()
    except:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail='Kunne ikke hente DOK-temaer'
        )


@app.get('/api/reguleringsplaner/planids/{kommunenummer}')
async def get_plan_ids(response: Response, kommunenummer: str) -> List[str]:
    response.headers['Cache-Control'] = 'public, max-age=86400'

    try:
        return await services.get_plan_ids(kommunenummer)
    except:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f'Kunne ikke hente planidentifikasjoner for kommune {kommunenummer}'
        )


@app.get('/api/reguleringsplaner/{kommunenummer}/{plan_id}')
async def get_reguleringsplan(response: Response, kommunenummer: str, plan_id: str) -> Dict[str, Any] | None:
    response.headers['Cache-Control'] = 'public, max-age=86400'

    try:
        return await services.get_reguleringsplan(kommunenummer, plan_id)
    except:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f'Kunne ikke hente reguleringsplan {kommunenummer}_{plan_id}'
        )


@app.get('/api/eiendom/sok')
async def search_for_eiendom(q: str) -> Dict[str, Any] | None:
    try:
        return await services.search(q)
    except:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f'Kunne ikke søke etter eiendom'
        )
    
@app.post('/api/eiendom')
async def get_eiendom(geometry: Dict[str, Any]) -> Dict[str, Any] | None:
    try:
        return await services.get_eiendom_from_matrikkel(geometry)
    except:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f'Kunne ikke hente eiendom fra Matrikkel WFS'
        )


@app.get('/api/kommuner')
async def get_kommuner(response: Response) -> List[Dict[str, Any]]:
    response.headers['Cache-Control'] = 'public, max-age=86400'

    try:
        return await services.get_kommuner()
    except:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail='Kunne ikke hente kommuner'
        )


@app.get('/api/eksempler')
async def get_eksempler(response: Response) -> List[Dict[str, Any]]:
    response.headers['Cache-Control'] = 'public, max-age=86400'

    try:
        return await services.get_eksempler()
    except:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail='Kunne ikke hente eksempler'
        )


@app.post('/api/omrade')
async def get_omrade(
    file: UploadFile = File(...),
    out_epsg: Annotated[int | None, Form(...)] = None
) -> Dict[str, Any] | None:
    response: Dict[str, Any] | None = None

    try:
        with tempfile.TemporaryDirectory() as tmp_dirpath:
            tmp_filepath = Path(tmp_dirpath).joinpath(str(file.filename))

            with open(tmp_filepath, 'wb') as buffer:
                shutil.copyfileobj(file.file, buffer)

            response = await services.get_omrade(tmp_filepath, out_epsg)
    except InvalidDatasetError:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f'Filen «{file.filename}» er ugyldig'
        )
    except InvalidGeometryError:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f'Geometrien(e) i «{file.filename}» er ugyldig'
        )
    except GeometryConversionError:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f'Kunne ikke prosessere «{file.filename}»'
        )
    except Exception as err:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f'Ukjent feil: {err}'
        )
    finally:
        file.file.close()

    return response


if __name__ == '__main__':
    uvicorn.run('main:app', host='0.0.0.0', port=5001, reload=True)
