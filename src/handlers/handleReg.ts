import WebSocket from 'ws';
import { createUser, sendJSON } from '../utils';



export const handleRegistration = (ws: WebSocket, data: string) => {

    const userData = JSON.parse(data);

    const { name, password } = userData;

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
    
    sendJSON(ws, response)
    // ws.send(JSON.stringify(response));
    console.log(`📤 Отправлен ответ на регистрацию:`, response);
}