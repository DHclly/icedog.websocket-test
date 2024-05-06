import tool from 'js/tool';

let serverId = 2;
/**
 * 创建发送文本消息的 ws 客户端
 */
const createWSClient = (id) => {

    let dataIdx = 1;
    serverId = 1;
    const wsUrl = `ws://localhost:3000/server/${serverId}/client/websocket-${tool.fillZero(id, 3)}`;
    let webSocket= new WebSocket(wsUrl);

    webSocket.addEventListener('error', (event) => {
        console.error(`[${tool.getDateNowText()}]ws 通讯发生了错误，错误信息:${event.currentTarget.url}`)
    });

    webSocket.addEventListener('close', (event) => {
        console.log(`[${tool.getDateNowText()}] WebSocket 客户端关闭,code:${event.code},reason:${event.reason}`);
    });

    webSocket.addEventListener('message', (event) => {
        let data = event.data;
        console.log(`[${tool.getDateNowText()}] 收到WebSocket 服务端消息：${data}`);
    });

    if(id==1){
        setInterval(()=>{
            // 发送给其他客户端，不包括自己
            // webSocket.send("1:broad");
            // 包括自己
            webSocket.send("1:broad:self");
        },1000)
    }
}

const createWSClientList = async (wsCount) => {
    for (let i = 1; i <= wsCount; i++) {
        createWSClient(i);
    }
}

createWSClientList(10);