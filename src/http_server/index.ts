import * as fs from 'fs';
import * as path from 'path';
import * as http from 'http';
import { Server, WebSocket, WebSocketServer } from 'ws';
import { handleRegistration, handleCreateRoom, handleAddUserToRoom } from '../handlers/index';


export const httpServer = http.createServer(function (req, res) {
    const __dirname = path.resolve(path.dirname(''));
    const file_path = __dirname + (req.url === '/' ? '/front/index.html' : '/front' + req.url);
    fs.readFile(file_path, function (err, data) {
        if (err) {
            res.writeHead(404);
            res.end(JSON.stringify(err));
            return;
        }
        res.writeHead(200);
        res.end(data);
    });
});

export const wss = new WebSocketServer({ port: 3000 });
wss.on('connection', (ws) => {
  console.log('New client was connected!');

     ws.send(JSON.stringify({
        type: 'welcome',
        data: 'Welcome to the Battleship!',
        id: 0
    }));

    ws.on('message', (message) => {
        console.log(`Получено сообщение: ${message}`);
        try {
            let data = JSON.parse(message.toString())
            console.log(' Получено сообщение:', data);
            handleMessage(ws, data, wss);
        } catch (err) {
            console.error('Ошибка парсинга JSON:', err);
            
        }
       
    });


});

function handleMessage(ws: any, message: { type: any; data: any; id: any; }, wss: WebSocketServer) {
    const { type, data, id } = message;
    
    switch (type) {
        case 'reg':
            handleRegistration(ws, data);
            break;
        case 'create_room':
            handleCreateRoom(ws, wss);
            break;
        case 'add_user_to_room':
            handleAddUserToRoom(ws, wss, data);
            break;

        default:
            console.log(` Неизвестный тип сообщения: ${type}`);
           
    }
}


