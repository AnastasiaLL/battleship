import { WebSocket } from 'ws';


export interface User {
    name: string;
    password: string;
    index: string;
    wins: number;
}

export const users: User[] = [
  {
    name: 'Test',
    password: 'qwerty',
    index: '49933e4c-664c-479d-9b1a-c654dc953ee6',
    wins: 5,
  }
];


export interface Room {
    roomId: string;
    idGame?:string;
    roomUsers: {
        name: string;
        index: string;
        idPlayer?:string;
        ws: WebSocket;
    }[];
}

export const rooms:Room[] = [];