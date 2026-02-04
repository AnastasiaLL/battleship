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
    index: '12346a4c-123c-123d-1b1e-c123dc123ww1',
    wins: 5,
  }
];


export interface Room {
    [x: string]: any;
    roomId: string;
    idGame?:string;
    roomUsers: {
        [x: string]: any;
        name: string;
        index: string;
        idPlayer?:string;
        ws: WebSocket;
    }[];
}

export const rooms:Room[] = [];