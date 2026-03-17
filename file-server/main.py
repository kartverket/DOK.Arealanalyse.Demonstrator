#! /usr/bin/env python3

import os
import mimetypes
import multiprocessing
from pathlib import Path
import uvicorn
from fastapi import FastAPI, HTTPException
from fastapi.responses import FileResponse
from email.utils import formatdate

app = FastAPI()
BASE_DIR = Path(os.environ['FILE_SHARE_DIR']).resolve()


@app.get('/files/{dirname}/{filename}')
def get_file(dirname: str, filename: str) -> FileResponse:
    filepath = Path(BASE_DIR).joinpath(dirname).joinpath(filename)

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


if __name__ == '__main__':
    multiprocessing.freeze_support()
    uvicorn.run('main:app', host='0.0.0.0', port=5003, reload=True)