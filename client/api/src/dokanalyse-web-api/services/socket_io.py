import logging
from uuid import uuid4
from typing import Any, Dict
import socketio

_logger = logging.getLogger(__name__)

# Videreformidler fremdriften i analysen fra pygeoapi til front-end.
# Koblingene ligger i minnet, så api-et må kjøres som én prosess.
# CORS håndteres av CORSMiddleware i api-et, derfor er CORS-håndteringen i Socket.IO slått av.
sio = socketio.AsyncServer(cors_allowed_origins=[], async_mode='asgi')
sio_app = socketio.ASGIApp(sio, socketio_path='/ws/socket.io')

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
