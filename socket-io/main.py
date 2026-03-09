from uuid import uuid4
from typing import Dict, Any
import socketio
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import uvicorn

sio = socketio.AsyncServer(cors_allowed_origins=[], async_mode='asgi')
sio_app = socketio.ASGIApp(sio, socketio_path='/ws/socket.io')
app = FastAPI()

app.mount('/ws', sio_app)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        'https://dok-arealanalyse-api.azurewebsites.net',
        'https://dok-arealanalyse-api-staging.azurewebsites.net',
        'http://localhost:5173',
        'http://localhost:5000',
        'http://localhost'
    ],
    allow_methods=['GET', 'POST'],
    allow_headers=['*'],
    allow_credentials=True
)

_sids: Dict[str, str] = {}


@sio.event
async def connect(sid: str, *args) -> None:
    correlation_id = str(uuid4())
    _sids[correlation_id] = sid

    await sio.emit('client_connected', correlation_id, sid)
    print(f'Client connected: {sid}')


@sio.event
async def disconnect(sid: str) -> None:
    _remove_sid(sid)
    print(f'Client disconnected: {sid}')


@sio.event
async def state_updated_api(_, data: Dict[str, Any]) -> None:
    recipient: str = data['recipient']
    sid = _get_sid_from_correlation_id(recipient)

    if sid:
        await sio.emit('state_updated', data, sid)


def _get_sid_from_correlation_id(correlation_id: str) -> str | None:
    return _sids.get(correlation_id)


def _remove_sid(sid: str) -> None:
    for key in list(_sids.keys()):
        if _sids[key] == sid:
            del _sids[key]


if __name__ == '__main__':
    uvicorn.run('main:app', host='0.0.0.0', port=5002)
