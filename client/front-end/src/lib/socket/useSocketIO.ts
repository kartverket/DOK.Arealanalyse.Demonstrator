import { useEffect } from 'react';
import { io, type Socket } from 'socket.io-client';

import type { ServerToClientEvents } from '@/types/socket.types';

const SIO_BASE_URL = import.meta.env.VITE_SIO_BASE_URL;

export default function useSocketIO(
    messageHandlers: ServerToClientEvents,
    onDisconnect: () => void,
) {
    useEffect(() => {
        const socket: Socket<ServerToClientEvents> = io(SIO_BASE_URL, {
            path: '/ws/socket.io',
        });
        socket.on('disconnect', onDisconnect);

        (
            Object.keys(messageHandlers) as (keyof ServerToClientEvents)[]
        ).forEach((key) => {
            socket.on(key, messageHandlers[key]);
        });

        return () => {
            socket.disconnect();
        };
    }, [messageHandlers, onDisconnect]);
}
