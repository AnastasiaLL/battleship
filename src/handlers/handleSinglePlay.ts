import WebSocket from 'ws';
import { createRoom, errRes, getRandomUUID, sendJSON } from '../utils/utils';
import { Bot, BOT_SHIPS_V1, BOT_SHIPS_V2, BOT_SHIPS_V3, Ship } from '../db';

export const handleSinglePlay = (ws: { user: any; }) => {
    const user = ws.user;

    if (!user) {
        errRes.data.errorText = "Not authorized";
        console.log("User is not authorized");
        return sendJSON(ws, errRes);
    }

    const room = createRoom(user, ws);

    const idGame = getRandomUUID();
    const userId = getRandomUUID();
    const botId = getRandomUUID();

    room.idGame = idGame;
    room.isSinglePlay = true;
    room.currentPlayerId = userId;

    const currentUser = room.roomUsers[0];
    currentUser.idPlayer = userId;
    currentUser.ready = false;
    currentUser.ships = [];
    currentUser.hits = new Set();
    currentUser.isBot = false;

    const botWs = {
        send: () => {}, 
        readyState: WebSocket.OPEN,
        user: Bot
    } as any;

    room.roomUsers.push({
        name: Bot.name,
        index: Bot.index,
        ws: botWs, 
        idPlayer: botId,
        ready: true,
        ships: getRandomBotShips(),
        hits: new Set(),
        isBot: true,
    });

    const createGameRes = {
        type: 'create_game',
        data: JSON.stringify({
            idGame,
            idPlayer: userId,
        }),
        id: 0,
    };

    sendJSON(ws, createGameRes);
}

export const getRandomBotShips = (): Ship[] => {
    const variants = [BOT_SHIPS_V1, BOT_SHIPS_V2, BOT_SHIPS_V3];
    const randomIndex = Math.floor(Math.random() * variants.length);
    return variants[randomIndex];
};