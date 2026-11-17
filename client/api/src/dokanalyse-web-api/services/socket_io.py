import logging
from dataclasses import dataclass
from uuid import uuid4
from typing import Any, Awaitable, Callable, Dict, Set
import socketio
from ..utils.helpers import describe_error

_logger = logging.getLogger(__name__)

# Videreformidler fremdriften i analysen fra pygeoapi til front-end.
# Koblingene ligger i minnet, så api-et må kjøres som én prosess.
# CORS håndteres av CORSMiddleware i api-et, derfor er CORS-håndteringen i Socket.IO slått av.
sio = socketio.AsyncServer(cors_allowed_origins=[], async_mode='asgi')
sio_app = socketio.ASGIApp(sio, socketio_path='/ws/socket.io')

_sid_by_correlation_id: Dict[str, str] = {}
_correlation_id_by_sid: Dict[str, str] = {}

JobIdCallback = Callable[[str], Awaitable[None]]


# Hver analyse får sin egen mottaker-id, så fremdriften kan knyttes til forespørselen som startet den.
# Front-end ser fortsatt bare én kobling.
@dataclass
class _Request:
    correlation_id: str
    on_job_id: JobIdCallback | None


_requests: Dict[str, _Request] = {}
_request_ids_by_correlation_id: Dict[str, Set[str]] = {}


def register_request(correlation_id: str, on_job_id: JobIdCallback | None = None) -> str | None:
    # Mottaker-id-en gjelder til front-end kobler fra, siden asynkrone jobber sender fremdrift etter at
    # forespørselen er ferdig. None betyr at front-end ikke er koblet til.
    if correlation_id not in _sid_by_correlation_id:
        return None

    request_id = str(uuid4())
    _requests[request_id] = _Request(correlation_id, on_job_id)
    _request_ids_by_correlation_id.setdefault(correlation_id, set()).add(request_id)

    return request_id


def clear_job_id_callback(request_id: str) -> None:
    request = _requests.get(request_id)

    if request:
        request.on_job_id = None


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

        for request_id in _request_ids_by_correlation_id.pop(correlation_id, set()):
            _requests.pop(request_id, None)

    _logger.info('Client disconnected: %s', sid)


@sio.event
async def state_updated_api(sid: str, data: Any) -> None:
    recipient = data.get('recipient') if isinstance(data, dict) else None

    if not isinstance(recipient, str):
        _logger.warning('Invalid state update from %s: missing recipient', sid)
        return

    request = _requests.get(recipient)
    correlation_id = request.correlation_id if request else recipient
    recipient_sid = _sid_by_correlation_id.get(correlation_id)

    if recipient_sid:
        await sio.emit('state_updated', data, to=recipient_sid)

    job_id = data.get('jobId')

    if request and request.on_job_id and isinstance(job_id, str):
        on_job_id = request.on_job_id
        request.on_job_id = None

        try:
            await on_job_id(job_id)
        except Exception as err:
            _logger.error('Job ID callback failed for job %s: %s', job_id, describe_error(err))
