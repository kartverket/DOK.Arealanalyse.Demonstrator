#!/usr/bin/env python3

from uuid import uuid4
import multiprocessing
from typing import Dict, Any
import socketio
import uvicorn
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

sio = socketio.AsyncServer(cors_allowed_origins=[], async_mode='asgi')
sio_app = socketio.ASGIApp(sio, socketio_path='/ws/socket.io')
app = FastAPI()

app.mount('/ws', sio_app)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        'https://dok-arealanalyse-api.azurewebsites.net',
        'http://localhost:5173',
        'http://localhost:5000',
        'http://localhost'
    ],
    allow_methods=['GET', 'POST'],
    allow_headers=['*'],
    allow_credentials=True
)


@sio.on('connect')
async def connect(sid, *args) -> None:
    await sio.emit('client_connected', str(uuid4()), sid)
    print(f'Client connected: {str(sid)}')


@sio.on('disconnect')
async def disconnect(sid) -> None:
    print(f'Client disconnected: {str(sid)}')


@sio.on('datasets_counted_api')
async def datasets_counted(_, data: Dict[str, Any]) -> None:
    recipient = data.pop('recipient')

    await sio.emit('datasets_counted', data, recipient)


@sio.on('dataset_analyzed_api')
async def dataset_analyzed(_, data: Dict[str, Any]) -> None:
    recipient = data.pop('recipient')

    await sio.emit('dataset_analyzed', data, recipient)


@sio.on('create_fact_sheet_api')
async def create_fact_sheet(_, data: Dict[str, Any]) -> None:
    await sio.emit('create_fact_sheet', None, data['recipient'])


@sio.on('state_updated_api')
async def state_updated(_, data: Dict[str, Any]) -> None:
    recipient = data['recipient']

    await sio.emit('state_updated', data, recipient)


@sio.on('create_map_images_api')
async def create_fact_sheet(_, data: Dict[str, Any]) -> None:
    recipient = data.pop('recipient')

    await sio.emit('create_map_images', data, recipient)


@sio.on('map_image_created_api')
async def create_fact_sheet(_, data: Dict[str, Any]) -> None:
    recipient = data.pop('recipient')

    await sio.emit('map_image_created', data, recipient)


@sio.on('create_report_api')
async def create_fact_sheet(_, data: Dict[str, Any]) -> None:
    await sio.emit('create_report', None, data['recipient'])


if __name__ == '__main__':
    multiprocessing.freeze_support()
    uvicorn.run('main:app', host='0.0.0.0', port=5002, reload=True)
