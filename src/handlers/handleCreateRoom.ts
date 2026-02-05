import { WebSocketServer } from "ws"
import { broadcastAll, createRoom, errRes, getWaitingRooms, sendJSON } from "../utils/utils"
import { rooms } from "../db"


export const handleCreateRoom = (ws: WebSocket, wws: WebSocketServer) => {
    console.log('handleCreateRoom')

    const user = (ws as any).user

     const roomAlreadyCreated = rooms.some(
        (room) =>
            room.roomUsers.length === 1 && room.roomUsers[0].index === user.index
    );

    if (roomAlreadyCreated) {
        errRes.data.errorText = "User already created room";
        console.log("User already created room");
        return sendJSON(ws, errRes);
    }
        
    const newRoom = createRoom(user, ws)
    console.log(newRoom)

    const okRes = {
        type: "update_room",
        data: JSON.stringify(getWaitingRooms()),
        id: 0,
    };


   broadcastAll(wws, JSON.stringify(okRes));    
}