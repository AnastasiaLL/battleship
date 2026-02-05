import { errRes, getRoom, sendJSON } from "../utils/utils";
import { getRandomStep } from "../utils/handleAttackUtils";
import { Bot } from "../db";
import { WebSocketServer } from "ws";
import { handleAttack } from "./handleAttack";

export const handleRandomAttack = (ws: any, wss: WebSocketServer, msg: { type?: any; data: any; id?: any; }) => {
    const data = JSON.parse(msg.data.toString());
    const { gameId, indexPlayer } = data;

    if (!gameId || !indexPlayer) {
        const errorResponse = {
            type: "error",
            data: JSON.stringify({
                error: true,
                errorText: "Invalid randomAttack payload",
            }),
            id: 0,
        };
        console.log("Invalid randomAttack payload", { gameId, indexPlayer });
        return sendJSON(ws, errorResponse);
    }

    const room = getRoom(gameId);

    if (!room) {
        const errorResponse = {
            type: "error",
            data: JSON.stringify({
                error: true,
                errorText: "Room not found for randomAttack",
            }),
            id: 0,
        };
        console.log("Room not found for randomAttack", { gameId });
        return sendJSON(ws, errorResponse);
    }

    const x = getRandomStep();
    const y = getRandomStep();

    console.log("Bot random attack generated", { x, y, gameId, indexPlayer });

    const attackMsg = {
        type: "attack",
        data: JSON.stringify({
            gameId,
            x,
            y,
            indexPlayer,
        }),
        id: 0,
    };

    const botWs = {
        user: Bot,
        send: () => {}
    };

    return handleAttack(botWs, wss, attackMsg);
};