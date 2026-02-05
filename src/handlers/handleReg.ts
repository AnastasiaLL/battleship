import WebSocket, { WebSocketServer } from 'ws';
import { broadcastAll, createUser, getWaitingRooms, getWinnersTable, sendJSON } from '../utils/utils';
import { users } from '../db';



export const handleRegistration = (ws: WebSocket, data: string, wss: WebSocketServer) => {

    const userData = JSON.parse(data);

    const { name, password } = userData;

     let activeUser = users.find(
        (user) => user.name === name && user.password === password
    );

    if (!activeUser)  {
        const newUser = createUser(userData);

        (ws as any).user = newUser;
        
        console.log(`👤 Регистрация пользователя: ${name}`);
        
        const response = {
            type: 'reg',
            data:  JSON.stringify({
                name: newUser.name,
                index: newUser.index,
                error: false,
                errorText: ''
            }),
            id: 0


        };

        const winnersTable = getWinnersTable();

        const updateWinnersRes = {
            type: "update_winners",
            data: JSON.stringify(winnersTable),
            id: 0,
        };

        const publicRooms = getWaitingRooms();
        const updateRoomRes = {
            type: "update_room",
            data: JSON.stringify(publicRooms),
            id: 0,
        };
broadcastAll(wss, updateWinnersRes);
    sendJSON(ws, updateRoomRes);
        
        sendJSON(ws, response)
    }

}