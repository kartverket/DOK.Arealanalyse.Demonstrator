import shutil
import tempfile
from pathlib import Path
from typing import Annotated, Any, Dict, List
from fastapi import (FastAPI, HTTPException, Response,
                     UploadFile, File, Form, status)
from fastapi.middleware.cors import CORSMiddleware
import uvicorn
import services
from services.exceptions import (
    InvalidDatasetError, InvalidGeometryError, GeometryConversionError)

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


@app.post('/pygeoapi')
async def analyze(payload: Dict[str, Any]) -> Dict[str, Any]:
    try:
        return await services.analyze(payload)
    except Exception as err:
        detail = err.args[0]       

        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=detail
        )


@app.get('/dokthemes')
async def get_dok_themes(response: Response) -> List[str]:
    response.headers['Cache-Control'] = 'public, max-age=86400'

    try:
        return await services.get_dok_themes()
    except:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail='Kunne ikke hente DOK-temaer'
        )


@app.get('/samples')
async def get_samples(response: Response) -> List[Dict[str, Any]]:
    response.headers['Cache-Control'] = 'public, max-age=86400'

    try:
        return await services.get_samples()
    except:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail='Kunne ikke hente eksempler'
        )


@app.post('/area')
async def area(
    file: UploadFile = File(...),
    out_epsg: Annotated[int | None, Form(...)] = None
) -> Dict[str, Any] | None:
    response: Dict[str, Any] | None = None

    try:
        with tempfile.TemporaryDirectory() as tmp_dirpath:
            tmp_filepath = Path(tmp_dirpath).joinpath(str(file.filename))

            with open(tmp_filepath, 'wb') as buffer:
                shutil.copyfileobj(file.file, buffer)

            response = await services.get_area(tmp_filepath, out_epsg)
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
    uvicorn.run('main:app', host='0.0.0.0', port=5001)
