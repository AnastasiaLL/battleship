import { rooms } from "../db";
import { sendJSON } from "./utils";

export const BOARD_SIZE = 10;
export const coordKey = (x: any, y: any) => `${x}:${y}`;

export const getRandomStep = () => Math.floor(Math.random() * BOARD_SIZE);

export const getShipCells = (ship: { position: any; direction: any; length: any; }) => {
  const cells = [];
  const { position, direction, length } = ship;
  const startX = position.x;
  const startY = position.y;

  for (let i = 0; i < length; i++) {
    const x = direction ? startX : startX + i;
    const y = direction ? startY + i : startY;
    cells.push({ x, y });
  }

  return cells;
};

export const findHitShip = (ships: any, x: any, y: any) => {
  if (!Array.isArray(ships)) return null;

  for (const ship of ships) {
    const cells = getShipCells(ship);
    if (cells.some((cell) => cell.x === x && cell.y === y)) {
      return { ship, cells };
    }
  }

  return null;
};

export const isShipKilled = (shipCells: any[], hitsSet: { has: (arg0: string) => any; }) => {
  return shipCells.every((cell: { x: any; y: any; }) => hitsSet.has(coordKey(cell.x, cell.y)));
};

export const areAllShipsKilled = (ships: any[], hitsSet: any) => {
  if (!Array.isArray(ships)) return false;
  return ships.every((ship) => {
    const cells = getShipCells(ship);
    return isShipKilled(cells, hitsSet);
  });
};

export const getKilledShipBorderCells = (shipCells: any[]) => {
  const border = new Set();

  for (const cell of shipCells) {
    for (let dx = -1; dx <= 1; dx++) {
      for (let dy = -1; dy <= 1; dy++) {
        const nx = cell.x + dx;
        const ny = cell.y + dy;

        if (dx === 0 && dy === 0) continue;
        if (nx < 0 || ny < 0 || nx >= BOARD_SIZE || ny >= BOARD_SIZE) continue;

        border.add(coordKey(nx, ny));
      }
    }
  }

  const shipCellKeys = new Set(shipCells.map((c: { x: any; y: any; }) => coordKey(c.x, c.y)));
  shipCellKeys.forEach((key) => border.delete(key));

  return Array.from(border).map((key:any) => {
    const [x, y] = key.split(":").map((n: any) => Number(n));
    return { x, y };
  });
};

export const sendJsonPlayers = (room: { roomUsers: any[]; }, data: any) => {
  room.roomUsers.forEach((user: { ws: { send: (arg0: string) => void; }; }) => sendJSON(user.ws, data));
};

export const removeRoom = (gameId: string) => {
    const index = rooms.findIndex((room) => room.idGame === gameId);

    if (index !== -1) {
        const [removed] = rooms.splice(index, 1);
        console.log(`removed after finish`, {
            gameId,
            roomId: removed.roomId,
        });
    }
};

