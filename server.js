import { WebSocketServer } from 'ws'
import emmiter from './lib/eventEmitter.js'
import * as engine from './engine.js'


//Websocket Server Initialize
const wss = new WebSocketServer({ port: 8090 })
console.log('Start WebSocket Server on ws://localhost:8090\n')
let wsClient = []

//WebSocket Client Connection 
wss.on('connection', (ws) => {
    //連結時執行此 console 提示
    console.log('Received Client Connection')
    //Push Socket Instance into my wsClient
    wsClient.push(ws)
    //當 WebSocket 的連線關閉時執行
    ws.on('close', () => {
        console.log('Close connected')
    })
})


//When receive eventEmitter , send event to clients
emmiter.on('Bingo', function (data) {
    wsClient.forEach((ws) => {
        ws.send(data)
    })
})

//Main function
const Route = await engine.getRouteStop('672', 1)
engine.alert(Route, '三張犁')
setInterval(() => {
    engine.alert(Route, '三張犁')
}, 10 * 1000)
