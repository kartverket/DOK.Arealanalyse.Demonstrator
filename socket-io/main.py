import logging
import os
from uuid import uuid4
from typing import Any, Dict, List
import socketio
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import uvicorn

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s %(levelname)s %(name)s: %(message)s'
)

_logger = logging.getLogger('socket-io')


def _get_allowed_origins() -> List[str]:
    # Kommaseparert liste, f.eks. "http://localhost:5173,https://example.com"
    value = os.getenv('CORS_ALLOWED_ORIGINS', '')
    origins = [origin.strip().rstrip('/') for origin in value.split(',')]

    return [origin for origin in origins if origin]


def _get_port() -> int:
    port = os.getenv('PORT')

    return int(port) if port else 5002


_allowed_origins = _get_allowed_origins()

if not _allowed_origins:
    _logger.warning(
        'CORS_ALLOWED_ORIGINS is not set, cross-origin requests will be rejected')

# CORS håndteres av CORSMiddleware, derfor er CORS-håndteringen i Socket.IO slått av
sio = socketio.AsyncServer(cors_allowed_origins=[], async_mode='asgi')
sio_app = socketio.ASGIApp(sio, socketio_path='/ws/socket.io')

app = FastAPI(docs_url=None, redoc_url=None, openapi_url=None)
app.mount('/ws', sio_app)

app.add_middleware(
    CORSMiddleware,
    allow_origins=_allowed_origins,
    allow_methods=['GET', 'POST'],
    allow_headers=['*'],
    allow_credentials=True
)

_sid_by_correlation_id: Dict[str, str] = {}
_correlation_id_by_sid: Dict[str, str] = {}


@sio.event
async def connect(sid: str, *_) -> None:
    correlation_id = str(uuid4())
    _sid_by_correlation_id[correlation_id] = sid
    _correlation_id_by_sid[sid] = correlation_id

    await sio.emit('client_connected', correlation_id, to=sid)
    _logger.info('Client connected: %s', sid)


@sio.event
async def disconnect(sid: str, *_) -> None:
    correlation_id = _correlation_id_by_sid.pop(sid, None)

    if correlation_id:
        _sid_by_correlation_id.pop(correlation_id, None)

    _logger.info('Client disconnected: %s', sid)


@sio.event
async def state_updated_api(sid: str, data: Any) -> None:
    recipient = data.get('recipient') if isinstance(data, dict) else None

    if not isinstance(recipient, str):
        _logger.warning('Invalid state update from %s: missing recipient', sid)
        return

    recipient_sid = _sid_by_correlation_id.get(recipient)

    if recipient_sid:
        await sio.emit('state_updated', data, to=recipient_sid)


if __name__ == '__main__':
    uvicorn.run(app, host='0.0.0.0', port=_get_port())
