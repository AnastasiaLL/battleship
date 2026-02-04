import { WebSocketServer } from "ws"
import { broadcastAll, createRoom, errRes, getRoom, getWaitingRooms, sendJSON } from "../utils"
import { rooms } from "../db"


export const handleAddShips = (ws: WebSocket, message: { type: any; data: any; id: any; }) => {
   const { gameId, ships, indexPlayer } = JSON.parse(message.data.toString()) || {};

     if (!gameId || !Array.isArray(ships) || !indexPlayer) {
        errRes.data.errorText = "Invalid add_ships payload";
        console.log( "Invalid add_ships payload");
        return sendJSON(ws, errRes);
    }

    const room = getRoom(gameId);

    if (!room) {
        errRes.data.errorText = "Room not found";
        console.log("Room not found");
        return sendJSON(ws, errRes);
    }

    const player = room.roomUsers.find((user) => user.idPlayer === indexPlayer);

    if (!player) {
        errRes.data.errorText = "Player not in this game";
        console.log("Player not in this game");
        return sendJSON(ws, errRes);
    }
   
    console.log('infoAboutroom', room, )
    console.log('infoAboutPlayer', player )

    if (player.ready) {
        console.log(` ships already set for ${player.name}`);
        return;
    }

    if (!room.firstPlayerId) room.firstPlayerId = indexPlayer;

    player.ships = ships;
    player.ready = true;

    const bothReady = room.roomUsers.every((user) => user.ready);

    if (!bothReady) return;
     room.currentPlayerId = room.firstPlayerId;

    for (const user of room.roomUsers) {
        const startRes = {
            type: "start_game",
            data: JSON.stringify({
                ships: user.ships,
                currentPlayerIndex: room.currentPlayerId,
            }),
            id: 0,
        };

        sendJSON(user.ws, startRes);
    }

     const turnRes = {
        type: "turn",
        data: JSON.stringify({ currentPlayer: room.currentPlayerId }),
        id: 0,
    };

    room.roomUsers.forEach((user) => sendJSON(user.ws, turnRes));


}