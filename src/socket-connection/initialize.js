import {io} from "socket.io-client";

const SOCKET_URL = '192.168.0.100:3000';

export const initializeSocket = () => {
    const socket = io(SOCKET_URL);
    socket.on('connect', () => {
        console.log(socket.id);
    })
    return socket;
}
