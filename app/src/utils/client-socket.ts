// import { createContext } from 'react';
import { io } from 'socket.io-client';

const domain = 'http://localhost:3080/';

export const socket_game = io(`${domain}game`, {
  withCredentials: true,
  transports: ['websocket', 'polling'],
});

// export const socket_chat = io(`${domain}chat`, {
//   withCredentials: true,
//   transports: ['websocket', 'polling'],
// });