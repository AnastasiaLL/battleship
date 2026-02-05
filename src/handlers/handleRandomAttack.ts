import { WebSocketServer } from "ws";
import { getRandomStep } from "../utils/handleAttackUtils";
import { sendJSON, getRoom } from "../utils/utils";
import { handleAttack } from "./handleAttack";

export const handleRandomAttack = (ws: any, wss: WebSocketServer, msg: { type?: any; data: any; id?: any; }) => {
  const data = JSON.parse(msg.data.toString());
  const { gameId, indexPlayer } = data;

  if (!gameId || !indexPlayer) {
    const errorMsg = {
      type: "error",
      data: JSON.stringify({
        error: true,
        errorText: "Invalid random action data",
      }),
      id: 0,
    };
    console.log("Random action failed");
    return sendJSON(ws, errorMsg);
  }

  const gameSession = getRoom(gameId);

  if (!gameSession) {
    const errorMsg = {
      type: "error",
      data: JSON.stringify({
        error: true,
        errorText: "Session not available",
      }),
      id: 0,
    };
    console.log("Session unavailable");
    return sendJSON(ws, errorMsg);
  }

  const randX = getRandomStep();
  const randY = getRandomStep();

  console.log("Random coordinates", { randX, randY });

  const attackPayload = {
    type: "attack",
    data: JSON.stringify({
      gameId,
      x: randX,
      y: randY,
      indexPlayer,
    }),
    id: 0,
  };

  return handleAttack(ws, wss, attackPayload);
};