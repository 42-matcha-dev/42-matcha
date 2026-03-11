import { io } from 'socket.io-client';
import { getCookie } from '@/utils/cookie.util';

export function createSocket(token?: string | null) {
    return io(process.env.NEXT_PUBLIC_API_URL!, {
        auth: { token: token ?? getCookie('token') },
        autoConnect: true
    });
}

let socketInstance: ReturnType<typeof io> | null = null;
let socketToken: string | null = null;

export function getSocket() {
    const latestToken = getCookie('token') ?? null;

    if (!socketInstance || socketToken !== latestToken) {
        if (socketInstance) {
            socketInstance.disconnect();
        }
        socketInstance = createSocket(latestToken);
        socketToken = latestToken;
    } else if (!socketInstance.connected) {
        socketInstance.connect();
    }
    return socketInstance;
}

export function disconnectSocket() {
    if (socketInstance) {
        socketInstance.disconnect();
        socketInstance = null;
        socketToken = null;
    }
}