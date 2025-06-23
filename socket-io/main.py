#!/usr/bin/env python3

import multiprocessing
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
async def connect(sid, *args):
    print(f'Client connected: {str(sid)}')


@sio.on('disconnect')
async def disconnect(sid):
    print(f'Client disconnected: {str(sid)}')


@sio.on('datasets_counted_api')
async def datasets_counted(_, data):
    await sio.emit('datasets_counted', data['count'], data['recipient'])


@sio.on('dataset_analyzed_api')
async def dataset_analyzed(_, data):
    await sio.emit('dataset_analyzed', data['dataset'], data['recipient'])


@sio.on('create_fact_sheet_api')
async def create_fact_sheet(_, data):
    await sio.emit('create_fact_sheet', None, data['recipient'])


@sio.on('create_map_images_api')
async def create_fact_sheet(_, data):
    await sio.emit('create_map_images', None, data['recipient'])


@sio.on('create_report_api')
async def create_fact_sheet(_, data):
    await sio.emit('create_report', None, data['recipient'])


if __name__ == '__main__':
    multiprocessing.freeze_support()
    uvicorn.run('main:app', host='0.0.0.0', port=5002, reload=True)
