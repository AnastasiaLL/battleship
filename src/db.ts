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
        ws: WebSocket | null;

    }[];
}

export const rooms:Room[] = [];

export const Bot = {
  name: 'Bot',
  password: '',
  index: 'bot-user',
  wins: 0,
};


users.push(Bot);

export interface Ship {
    position: { x: number; y: number };
    direction: boolean;
    length: number;
    type: 'small' | 'medium' | 'large' | 'huge';
}

export const BOT_SHIPS_V1: Ship[] = [
    { position: { x: 0, y: 6 }, direction: true,  length: 4, type: 'huge' },
    { position: { x: 7, y: 0 }, direction: false, length: 3, type: 'large' },
    { position: { x: 2, y: 7 }, direction: true,  length: 3, type: 'large' },
    { position: { x: 4, y: 0 }, direction: false, length: 2, type: 'medium' },
    { position: { x: 0, y: 2 }, direction: true,  length: 2, type: 'medium' },
    { position: { x: 8, y: 5 }, direction: false, length: 2, type: 'medium' },
    { position: { x: 9, y: 9 }, direction: false, length: 1, type: 'small' },
    { position: { x: 0, y: 0 }, direction: false, length: 1, type: 'small' },
    { position: { x: 9, y: 0 }, direction: false, length: 1, type: 'small' },
    { position: { x: 0, y: 9 }, direction: false, length: 1, type: 'small' },
];

export const BOT_SHIPS_V2: Ship[] = [
    { position: { x: 1, y: 4 }, direction: true,  length: 4, type: 'huge' },
    { position: { x: 6, y: 0 }, direction: false, length: 3, type: 'large' },
    { position: { x: 3, y: 7 }, direction: true,  length: 3, type: 'large' },
    { position: { x: 0, y: 1 }, direction: false, length: 2, type: 'medium' },
    { position: { x: 8, y: 3 }, direction: true,  length: 2, type: 'medium' },
    { position: { x: 5, y: 9 }, direction: false, length: 2, type: 'medium' },
    { position: { x: 9, y: 7 }, direction: false, length: 1, type: 'small' },
    { position: { x: 2, y: 0 }, direction: false, length: 1, type: 'small' },
    { position: { x: 7, y: 6 }, direction: false, length: 1, type: 'small' },
    { position: { x: 4, y: 2 }, direction: false, length: 1, type: 'small' },
];

export const BOT_SHIPS_V3: Ship[] = [
    { position: { x: 5, y: 2 }, direction: false, length: 4, type: 'huge' },
    { position: { x: 0, y: 7 }, direction: true,  length: 3, type: 'large' },
    { position: { x: 7, y: 5 }, direction: false, length: 3, type: 'large' },
    { position: { x: 2, y: 4 }, direction: true,  length: 2, type: 'medium' },
    { position: { x: 9, y: 1 }, direction: false, length: 2, type: 'medium' },
    { position: { x: 0, y: 0 }, direction: false, length: 2, type: 'medium' },
    { position: { x: 3, y: 8 }, direction: false, length: 1, type: 'small' },
    { position: { x: 6, y: 9 }, direction: false, length: 1, type: 'small' },
    { position: { x: 1, y: 2 }, direction: false, length: 1, type: 'small' },
    { position: { x: 8, y: 0 }, direction: false, length: 1, type: 'small' },
];