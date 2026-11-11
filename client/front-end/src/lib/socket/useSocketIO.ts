import { useEffect, useRef } from 'react';
import { useDispatch } from 'react-redux';
import { io, type Socket } from 'socket.io-client';
import { setCorrelationId } from '@/app/appSlice';
import type { ServerToClientEvents } from '@/types/socket.types';

const WS_BASE_URL = import.meta.env.VITE_WS_BASE_URL;

export default function useSocketIO(messageHandlers: ServerToClientEvents) {
    const dispatch = useDispatch();
    const initRef = useRef(true);

    useEffect(
        () => {
            if (!initRef.current) {
                return;
            }

            const socket: Socket<ServerToClientEvents> = io(WS_BASE_URL, {
                path: '/ws/socket.io'
            });

            initRef.current = false;

            socket.on('disconnect', () => {
                dispatch(setCorrelationId(null));
            });

            (Object.keys(messageHandlers) as (keyof ServerToClientEvents)[]).forEach(key => {
                socket.on(key, messageHandlers[key]);
            });
        },
        [dispatch, messageHandlers]
    );
}
