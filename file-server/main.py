import os
from pathlib import Path
from fastapi import FastAPI, HTTPException
from fastapi.responses import FileResponse
import uvicorn


def _get_base_dir() -> Path:
    value = os.getenv('FILE_SHARE_DIR')

    if not value:
        raise RuntimeError('The environment variable FILE_SHARE_DIR is not set')

    return Path(value).resolve()


def _get_port() -> int:
    port = os.getenv('PORT')

    return int(port) if port else 5004


_base_dir = _get_base_dir()

app = FastAPI(docs_url=None, redoc_url=None, openapi_url=None)


@app.api_route('/files/{dirname}/{filename}', methods=['GET', 'HEAD'])
def get_file(dirname: str, filename: str) -> FileResponse:
    filepath = _resolve_file(dirname, filename)

    if not filepath:
        raise HTTPException(status_code=404)

    # FileResponse setter selv Content-Type, Last-Modified og ETag, og støtter Range
    return FileResponse(
        filepath,
        filename=filepath.name,
        content_disposition_type='inline',
        headers={'Cache-Control': 'public, max-age=86400'}
    )


def _resolve_file(dirname: str, filename: str) -> Path | None:
    filepath = _base_dir.joinpath(dirname, filename).resolve()

    # Hindrer tilgang til filer utenfor FILE_SHARE_DIR, f.eks. via ".." eller symlenker
    if not filepath.is_relative_to(_base_dir) or not filepath.is_file():
        return None

    return filepath


if __name__ == '__main__':
    uvicorn.run(app, host='0.0.0.0', port=_get_port())
