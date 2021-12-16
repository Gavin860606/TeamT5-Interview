import WebSocket from 'ws'

const ws = new WebSocket('ws://localhost:8090')

ws.onopen = () => {
    console.log('open connection')
}

//關閉後執行的動作，指定一個 function 會在連結中斷後執行
ws.onclose = () => {
    console.log('close connection')
}
ws.onmessage = (event) => {
    console.log(event.data)
}
