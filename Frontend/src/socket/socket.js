import { io } from "socket.io-client";

let socket;

export const initiateSocket = (token) => {
  const API_URL = import.meta.env.VITE_API_URL || "";
  socket = io(API_URL, {
    auth: { token },
  });
  console.log("Connecting to socket...");
  return socket;
};

export const disconnectSocket = () => {
  if (socket) socket.disconnect();
};

export const getSocket = () => socket;
