import { WebSocketServer } from "ws"
import { broadcastAll, createRoom, getWaitingRooms, sendJSON } from "../utils"


export const handleCreateRoom = (ws: WebSocket, wws: WebSocketServer) => {
    console.log('handleCreateRoom')
    const user = (ws as any).user
        
    const newRoom = createRoom(user, ws)
    console.log(newRoom)

    const okRes = {
        type: "update_room",
        data: JSON.stringify(getWaitingRooms()),
        id: 0,
    };


   broadcastAll(wws, JSON.stringify(okRes));    
}