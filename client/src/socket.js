import { io } from "socket.io-client";

export const socket = io("http://localhost:3001", {
  transports: ["websocket", "polling"], // Ensure WebSocket connection
  reconnectionAttempts: 5, // Retry if disconnected
  reconnectionDelay: 2000, // Wait before retrying
});
