import { useEffect, useRef } from 'react';
import { useDispatch } from 'react-redux';
import { setCorrelationId } from 'store/slices/appSlice';
import { io } from 'socket.io-client';

const WS_BASE_URL = import.meta.env.VITE_WS_BASE_URL;

export default function useSocketIO(messageHandlers) {
    const dispatch = useDispatch();
    const initRef = useRef(true);

    useEffect(
        () => {
            if (!initRef.current) {
                return;
            }

            const socket = io(WS_BASE_URL, {
                path: '/ws/socket.io'
            });

            initRef.current = false;
            
            socket.on('disconnect', () => {
                dispatch(setCorrelationId(null));
            });

            [...messageHandlers.keys()].forEach(key => {
                socket.on(key, messageHandlers.get(key));
            });
        },
        [dispatch, messageHandlers]
    );
}