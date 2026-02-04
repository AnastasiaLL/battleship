import crypto from "crypto";
import { rooms, User, users } from "./db";
import { WebSocket, WebSocketServer } from 'ws';

export const getRandomUUID = () => crypto.randomUUID();

export const createUser = (userData: {name: string, password: string}): User => {
   const newUser: User = { 
       ...userData, 
       index: crypto.randomUUID(), 
       wins: 0 
   };
   users.push(newUser);
   return newUser;
};

export const createRoom = (user: User, ws: any) => {
    const room = {
        roomId: crypto.randomUUID(),
        roomUsers: [{ name: user.name, index: user.index, ws }],

    };
    rooms.push(room);
    return room;
};

export const addUserToRoom = (user: User, id: string, ws: WebSocket) => {
    rooms.forEach((room) => {
        if (room.roomId === id) {
            room.roomUsers.push({ name: user.name, index: user.index, ws });
        }
    });
    rooms.forEach((room, index) => {
        if (room.roomUsers.length === 1 && room.roomUsers[0].index === user.index) {
            rooms.splice(index, 1);
        }
    });
};

export const sendJSON = (ws: { send: (arg0: string) => void; }, data: any) => {
     ws.send(JSON.stringify(data));
}

export const broadcastAll = (wss: WebSocketServer, message: any) => {
     wss.clients.forEach(client => {
        if (client.readyState === 1) { 
            client.send(message);
        }
    });
};

export const getWaitingRooms = () => {
    return rooms
        .filter((room) => room.roomUsers.length === 1)
        .map((room) => ({
            roomId: room.roomId,
            roomUsers: room.roomUsers.map((user) => ({
                name: user.name,
                index: user.index,
            })),
        }));
};

export const getRoom = (gameId: string) => rooms.find((room) => room.idGame === gameId);


export const errRes = {
    type: "error",
    data: { error: true, errorText: "" },
    id: 0,
};