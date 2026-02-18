import { io, type Socket } from "socket.io-client";

const SERVER_URL = import.meta.env.SERVER_URL;

// SINGLETON - one socket instance shared across the app
let socket: Socket | null = null;


export function getSocket(): Socket {
  if (!socket) {
    socket = io(SERVER_URL, {
      autoConnect: false,
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

  }

  console.log('socet', socket)

  return socket;
}

export function disconnectSocket() {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
}

export type { Socket }; 
