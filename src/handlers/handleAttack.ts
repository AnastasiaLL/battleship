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

export const handleAttack = (ws: { user: any; }, wss: WebSocketServer, msg: { type?: any; data: any; id?: any; }) => {
  const { gameId, x, y, indexPlayer } = JSON.parse(msg.data.toString()) || {};

  if (
    !gameId ||
    typeof x !== "number" ||
    typeof y !== "number" ||
    !indexPlayer
  ) {
    errRes.data.errorText = "Invalid payload format";
    console.log("Invalid request data");
    return sendJSON(ws, errRes);
  }

  const gameSession = getRoom(gameId);

  if (!gameSession) {
    errRes.data.errorText = "Session not found";
    console.log("Session missing", { gameId });
    return sendJSON(ws, errRes);
  }

  const attacker = gameSession.roomUsers.find((user) => user.idPlayer === indexPlayer);

  if (!attacker) {
    errRes.data.errorText = "Player not in session";
    console.log("Player not found");
    return sendJSON(ws, errRes);
  }

  const targetPlayer = gameSession.roomUsers.find((user) => user.idPlayer !== indexPlayer);

  if (!targetPlayer) {
    errRes.data.errorText = "No opponent found";
    console.log("No opponent");
    return sendJSON(ws, errRes);
  }

  if (gameSession.currentPlayerId && gameSession.currentPlayerId !== indexPlayer) {
    errRes.data.errorText = "Action out of sequence";
    console.log("Invalid action sequence");
    return sendJSON(ws, errRes);
  }

  if (!targetPlayer.hits) {
    targetPlayer.hits = new Set();
  }

  const targetCoord = coordKey(x, y);
  const impactData = findHitShip(targetPlayer.ships, x, y);

  if (!impactData) {
    const response = {
      type: "attack",
      data: JSON.stringify({
        position: { x, y },
        currentPlayer: indexPlayer,
        status: "miss",
      }),
      id: 0,
    };

    sendJsonPlayers(gameSession, response);
    
    gameSession.currentPlayerId = targetPlayer.idPlayer;
    
    const turnUpdate = {
      type: "turn",
      data: JSON.stringify({
        currentPlayer: gameSession.currentPlayerId,
      }),
      id: 0,
    };

    sendJsonPlayers(gameSession, turnUpdate);
    return;
  }

  const { ship, cells: shipStructure } = impactData;
  targetPlayer.hits.add(targetCoord);
  const isDestroyed = isShipKilled(shipStructure, targetPlayer.hits);

  const attackResult = {
    type: "attack",
    data: JSON.stringify({
      position: { x, y },
      currentPlayer: indexPlayer,
      status: isDestroyed ? "killed" : "shot",
    }),
    id: 0,
  };

  sendJsonPlayers(gameSession, attackResult);

  if (isDestroyed) {
    const adjacentCoords = getKilledShipBorderCells(shipStructure);

    for (const coord of adjacentCoords) {
      const borderResponse = {
        type: "attack",
        data: JSON.stringify({
          position: { x: coord.x, y: coord.y },
          currentPlayer: indexPlayer,
          status: "miss",
        }),
        id: 0,
      };

      sendJsonPlayers(gameSession, borderResponse);
    }
  }

  const allDestroyed = areAllShipsKilled(targetPlayer.ships, targetPlayer.hits);

  if (allDestroyed) {
    const victoryUser = ws.user;

        if (victoryUser) {
        victoryUser.wins = (victoryUser.wins || 0) + 1;
        console.log(`Victory recorded`);
        }

        const winnersTable = getWinnersTable();
        
        const endGame = {
        type: "finish",
        data: JSON.stringify({
            winPlayer: indexPlayer,
        }),
        id: 0,
        };

        sendJsonPlayers(gameSession, endGame);

        const updateWinnersRes = {
        type: "update_winners",
        data: JSON.stringify(winnersTable),
        id: 0,
        };

        broadcastAll(wss, updateWinnersRes);

        removeRoom(gameId);
        return;
  }

  gameSession.currentPlayerId = indexPlayer;
  
  const turnChange = {
    type: "turn",
    data: JSON.stringify({
      currentPlayer: gameSession.currentPlayerId,
    }),
    id: 0,
  };

  sendJsonPlayers(gameSession, turnChange);
};

