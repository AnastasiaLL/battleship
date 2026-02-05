import { WebSocket, WebSocketServer } from 'ws';
import { rooms, User } from '../db';
import { addUserToRoom, broadcastAll, errRes, getRandomUUID, getWaitingRooms, sendJSON } from '../utils/utils';

export const handleAddUserToRoom = (ws: WebSocket, wss: WebSocketServer, data: string) => {
 
    const indexRoom = JSON.parse(data).indexRoom;
    const user = (ws as any).user
    const room = rooms.find(room => room.roomId === indexRoom)
    


    if (room){

        if (room.roomUsers.length >= 2) {
            errRes.data.errorText = "Room is full";
            return sendJSON(ws, errRes);
        }

        let userInRoom = room.roomUsers.find((u) => u.index === user.index);

        if (userInRoom) {
            errRes.data.errorText = "User already in room";
            console.log(` User already in room`,);
            return sendJSON(ws, errRes);
        } else {

            addUserToRoom(user, indexRoom, ws)
            console.log('room', room)
            room.idGame = getRandomUUID();

            room.roomUsers.forEach(user=> {
                user.idPlayer = getRandomUUID()
            })

            const okRes = {
                type: "create_game",
                data: "",
                id: 0,
            };
            for (const player of room.roomUsers) {
                okRes.data = JSON.stringify({
                    idGame: room.idGame,
                    idPlayer: player.idPlayer,
                });
                sendJSON(player.ws, okRes);
            }

             const upradeRes = {
                type: "update_room",
                data: JSON.stringify(getWaitingRooms()),
                id: 0,
            };
        
            broadcastAll(wss, JSON.stringify(upradeRes)); 
        }

    }else{
        errRes.data.errorText = "Room not found";
        console.log(errRes);
        return sendJSON(ws, errRes);
    }



 



      

}