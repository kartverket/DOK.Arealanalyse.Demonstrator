import aiofiles
import tempfile
from pathlib import Path
from typing import Annotated, Any, Dict
from fastapi import APIRouter, HTTPException, Request, UploadFile, File, Form, status
from ..services import omrade
from ..services.exceptions import (
    DatasetTooLargeError, InvalidDatasetError, InvalidGeometryError, GeometryConversionError)
from ..utils.helpers import format_bytes

_CHUNK_SIZE = 1024 * 1024
_MAX_SIZE = 10 * 1024 * 1024

router = APIRouter()


@router.post('/omrade')
async def get_omrade(
    request: Request,
    file: UploadFile = File(...),
    out_epsg: Annotated[int | None, Form(...)] = None,
) -> Dict[str, Any] | None:
    content_length = request.headers.get('content-length')
    response: Dict[str, Any] | None = None
    filesize = 0

    try:
        if content_length and int(content_length) > _MAX_SIZE:
            raise DatasetTooLargeError()

        with tempfile.TemporaryDirectory() as tmp_dirpath:
            tmp_filepath = Path(tmp_dirpath).joinpath(str(file.filename))

            async with aiofiles.open(tmp_filepath, 'wb') as out:
                while chunk := await file.read(_CHUNK_SIZE):
                    filesize += len(chunk)

                    if filesize > _MAX_SIZE:
                        raise DatasetTooLargeError()

                    await out.write(chunk)

            response = await omrade.get_omrade(tmp_filepath, out_epsg)
    except DatasetTooLargeError:
        raise HTTPException(
            status_code=status.HTTP_413_CONTENT_TOO_LARGE,
            detail=f'Filen «{file.filename}» er for stor. Maks. tillatt filstørrelse er {format_bytes(_MAX_SIZE)}'
        )
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
        await file.close()

    return response
