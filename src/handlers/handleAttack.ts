import { 
    errRes, getRoom, broadcastAll, sendJSON, 
    getWinnersTable
} from "../utils/utils";
import { 
    areAllShipsKilled, coordKey, findHitShip, 
    getKilledShipBorderCells, isShipKilled, 
    removeRoom, sendJsonPlayers, getRandomStep 
} from "../utils/handleAttackUtils";

import { WebSocketServer } from "ws";
import { Bot } from "../db";
import { handleRandomAttack } from "./handleRandomAttack";

export const handleAttack = (ws: { user: any; send?: Function; }, wss: WebSocketServer, msg: { type?: any; data: any; id?: any; }) => {
    const { gameId, x, y, indexPlayer } = JSON.parse(msg.data.toString()) || {};

    if (!gameId || typeof x !== "number" || typeof y !== "number" || !indexPlayer) {
        errRes.data.errorText = "Invalid attack payload";
        console.log("Invalid attack payload", { gameId, x, y, indexPlayer });
        return sendJSON(ws, errRes);
    }

    const room = getRoom(gameId);

    if (!room) {
        errRes.data.errorText = "Room not found for attack";
        console.log("Room not found for attack", { gameId });
        return sendJSON(ws, errRes);
    }

    const shooter = room.roomUsers.find((user) => user.idPlayer === indexPlayer);

    if (!shooter) {
        errRes.data.errorText = "Shooter not found in this game";
        console.log("Shooter not found in this game", { gameId, indexPlayer });
        return sendJSON(ws, errRes);
    }

    const opponent = room.roomUsers.find((user) => user.idPlayer !== indexPlayer);

    if (!opponent) {
        errRes.data.errorText = "Opponent not found";
        console.log("Opponent not found for attack", { gameId, indexPlayer });
        return sendJSON(ws, errRes);
    }

    if (room.currentPlayerId && room.currentPlayerId !== indexPlayer) {
        errRes.data.errorText = "Not your turn";
        console.log("Attack rejected: not shooter turn", {
            expected: room.currentPlayerId,
            actual: indexPlayer,
        });
        return sendJSON(ws, errRes);
    }

    if (!opponent.hits) {
        opponent.hits = new Set();
    }

    const shotKey = coordKey(x, y);
    const hitInfo = findHitShip(opponent.ships, x, y);

    if (!hitInfo) {
        const attackRes = {
            type: "attack",
            data: JSON.stringify({
                position: { x, y },
                currentPlayer: indexPlayer,
                status: "miss",
            }),
            id: 0,
        };

        sendJsonPlayers(room, attackRes);
        
        room.currentPlayerId = opponent.idPlayer;
        
        const turnRes = {
            type: "turn",
            data: JSON.stringify({
                currentPlayer: room.currentPlayerId,
            }),
            id: 0,
        };

        sendJsonPlayers(room, turnRes);

        if (room.isSinglePlay && opponent.isBot) {
            setTimeout(() => {
                const randomMsg = {
                    type: "randomAttack",
                    data: JSON.stringify({
                        gameId,
                        indexPlayer: opponent.idPlayer,
                    }),
                    id: 0,
                };

                const botWs = {
                    user: Bot,
                    send: () => {},
                };

                handleRandomAttack(botWs, wss, randomMsg);
            }, 1000);
        }
        return;
    }

    const { ship, cells: shipCells } = hitInfo;
    opponent.hits.add(shotKey);
    const killed = isShipKilled(shipCells, opponent.hits);

    const mainAttackRes = {
        type: "attack",
        data: JSON.stringify({
            position: { x, y },
            currentPlayer: indexPlayer,
            status: killed ? "killed" : "shot",
        }),
        id: 0,
    };

    sendJsonPlayers(room, mainAttackRes);

    if (killed) {
        const borderCells = getKilledShipBorderCells(shipCells);

        for (const cell of borderCells) {
            const borderAttackRes = {
                type: "attack",
                data: JSON.stringify({
                    position: { x: cell.x, y: cell.y },
                    currentPlayer: indexPlayer,
                    status: "miss",
                }),
                id: 0,
            };

            sendJsonPlayers(room, borderAttackRes);
        }
    }

    const allKilled = areAllShipsKilled(opponent.ships, opponent.hits);

    if (allKilled) {
        const winnerGlobal = ws.user;

        if (winnerGlobal) {
            winnerGlobal.wins = (winnerGlobal.wins || 0) + 1;
            console.log(`WINNER updated`, {
                name: winnerGlobal.name,
                wins: winnerGlobal.wins,
            });
        }

        const winnersTable = getWinnersTable();

        const finishRes = {
            type: "finish",
            data: JSON.stringify({
                winPlayer: indexPlayer,
            }),
            id: 0,
        };

        sendJsonPlayers(room, finishRes);

        const updateWinnersRes = {
            type: "update_winners",
            data: JSON.stringify(winnersTable),
            id: 0,
        };

        broadcastAll(wss, updateWinnersRes);
        removeRoom(gameId);
        return;
    }

    room.currentPlayerId = indexPlayer;
    
    const turnRes = {
        type: "turn",
        data: JSON.stringify({
            currentPlayer: room.currentPlayerId,
        }),
        id: 0,
    };

    sendJsonPlayers(room, turnRes);

    if (room.isSinglePlay && shooter.isBot && room.currentPlayerId === shooter.idPlayer) {
        setTimeout(() => {
            const randomMsg = {
                type: "randomAttack",
                data: JSON.stringify({
                    gameId,
                    indexPlayer: shooter.idPlayer,
                }),
                id: 0,
            };

            const botWs = {
                user: Bot,
                send: () => {},
            };

            handleRandomAttack(botWs, wss, randomMsg);
        }, 1000);
    }
};