import { useEffect, useRef } from 'react';
import { io, type Socket } from 'socket.io-client';

import type { ServerToClientEvents } from '@/types/socket.types';

const SIO_BASE_URL = import.meta.env.VITE_SIO_BASE_URL;

export default function useSocketIO(
    messageHandlers: ServerToClientEvents,
    onDisconnect: () => void,
) {
    const initRef = useRef(true);

    useEffect(() => {
        if (!initRef.current) {
            return;
        }

        const socket: Socket<ServerToClientEvents> = io(SIO_BASE_URL, {
            path: '/ws/socket.io',
        });

        initRef.current = false;

        socket.on('disconnect', onDisconnect);

        (Object.keys(messageHandlers) as (keyof ServerToClientEvents)[])
            .forEach((key) => {
                socket.on(key, messageHandlers[key]);
            });
    }, [messageHandlers, onDisconnect]);
}
