import os
import mimetypes
from pathlib import Path
from email.utils import formatdate
from fastapi import FastAPI, HTTPException
from fastapi.responses import FileResponse
import uvicorn

_base_dir = Path(os.environ['FILE_SHARE_DIR']).resolve()

app = FastAPI()


@app.get('/files/{dirname}/{filename}')
def get_file(dirname: str, filename: str) -> FileResponse:
    filepath = Path(_base_dir).joinpath(dirname).joinpath(filename)

    if not filepath.exists() or not filepath.is_file():
        raise HTTPException(status_code=404)

    stat = filepath.stat()

    headers = {
        'Content-Disposition': f'inline; filename="{filepath.name}"',
        'Cache-Control': 'public, max-age=86400',
        'Last-Modified': formatdate(stat.st_mtime, usegmt=True)
    }

    media_type, _ = mimetypes.guess_type(filename)

    return FileResponse(
        filepath,
        headers=headers,
        media_type=media_type
    )


def _get_port() -> int:
    port = os.getenv('PORT')

    return int(port) if port else 5004


if __name__ == '__main__':
    uvicorn.run('main:app', host='0.0.0.0', port=_get_port())
