import { io } from 'socket.io-client';
import { getCookie } from '@/utils/cookie.util';

export function createSocket() {
    const token = getCookie('token');
    return io(process.env.NEXT_PUBLIC_API_URL!, {
        auth: { token },
        autoConnect: true
    });
}

let socketInstance: ReturnType<typeof io> | null = null;

export function getSocket() {
    if (!socketInstance) {
        socketInstance = createSocket();
    }
    return socketInstance;
}

export function disconnectSocket() {
    if (socketInstance) {
        socketInstance.disconnect();
        socketInstance = null;
    }
}