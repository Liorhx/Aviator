import { io } from "socket.io-client";

let socket;

export const initiateSocket = (token) => {
  const rawApiUrl = import.meta.env.VITE_API_URL || "";
  // Strip trailing slash and trailing /api to get the root server host for Socket.IO
  const cleanApiUrl = rawApiUrl.replace(/\/+$/, "").replace(/\/api$/, "");

  // If cleanApiUrl is empty, io() defaults to window.location.origin
  const socketUrl = cleanApiUrl || undefined;

  socket = io(socketUrl, {
    auth: { token },
    transports: ["websocket", "polling"],
    reconnection: true,
    reconnectionAttempts: 20,
    reconnectionDelay: 1000,
    reconnectionDelayMax: 5000,
    timeout: 20000,
  });

  console.log("Connecting to socket at:", socketUrl || window.location.origin);
  return socket;
};

export const disconnectSocket = () => {
  if (socket) socket.disconnect();
};

export const getSocket = () => socket;
