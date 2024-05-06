import tool from 'js/tool';

let serverId = 2;
/**
 * 创建发送文本消息的 ws 客户端
 */
const createWSClient = (id) => {

    let dataIdx = 1;
    serverId = 1;
    const wsUrl = `ws://localhost:3000/server/${serverId}/client/websocket-${tool.fillZero(id, 3)}`;
    let webSocket = new WebSocket(wsUrl);

    webSocket.addEventListener('error', (event) => {
        console.error(`[${tool.getDateNowText()}]ws 通讯发生了错误，错误信息:${event.currentTarget.url}`)
    });

    webSocket.addEventListener('close', (event) => {
        console.log(`[${tool.getDateNowText()}] WebSocket 客户端关闭,code:${event.code},reason:${event.reason}`);
    });

    webSocket.addEventListener('open', (event) => {
        console.log(`[${tool.getDateNowText()}] 连接成功`);
        webSocket.send(Date.now());
    });

    let pingCount=0;

    webSocket.addEventListener('message', (event) => {
        let data = event.data;
        let span=Date.now() - data;
        console.log(`[${tool.getDateNowText()}] 请求往返耗时: ${span} ms,当前 ws 状态：${webSocket.readyState}`);
        setTimeout(function timeout() {
            if(webSocket.readyState==WebSocket.OPEN){
                webSocket.send(Date.now());
            }else{
                console.log(`[${tool.getDateNowText()}] 当前 ws 状态：${webSocket.readyState}`);
            }
        }, 500);
    });

    let pingTimeout=null;

    webSocket.addEventListener('pong',()=>{
        clearTimeout(pingTimeout);

        pingTimeout=setTimeout(() => {
            webSocket.close();
        }, 1000*30);
    })
}

const createWSClientList = async (wsCount) => {
    for (let i = 1; i <= wsCount; i++) {
        createWSClient(i);
    }
}

createWSClientList(1);