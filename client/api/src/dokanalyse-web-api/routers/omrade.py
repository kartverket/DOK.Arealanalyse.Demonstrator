import shutil
import tempfile
from pathlib import Path
from typing import Annotated, Any, Dict
from fastapi import (APIRouter, HTTPException, UploadFile, File, Form, status)
from ..services import omrade
from ..services.exceptions import (
    InvalidDatasetError, InvalidGeometryError, GeometryConversionError)

router = APIRouter()


@router.post('/omrade')
async def get_omrade(
    file: UploadFile = File(...),
    out_epsg: Annotated[int | None, Form(...)] = None,
) -> Dict[str, Any] | None:
    response: Dict[str, Any] | None = None

    try:
        with tempfile.TemporaryDirectory() as tmp_dirpath:
            tmp_filepath = Path(tmp_dirpath).joinpath(str(file.filename))

            with open(tmp_filepath, 'wb') as buffer:
                shutil.copyfileobj(file.file, buffer)

            response = await omrade.get_omrade(tmp_filepath, out_epsg)
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
