import {io} from "socket.io-client";

const SOCKET_URL = '37.157.168.223:3000';

export const initializeSocket = () => {
    const socket = io(SOCKET_URL);
    socket.on('connect', () => {
        console.log(socket.id);
    })
    return socket;
}
