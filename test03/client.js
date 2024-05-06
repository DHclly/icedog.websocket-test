const { WebSocket } = require('ws');
const tool = require('../tools/tool');

/**
 * 创建发送文本消息的 ws 客户端
 */
const createWSTextClient = (clientId) => {

    let dataIdx = 1;
    const wsUrl = 'ws://localhost:3000';
    const webSocket = new WebSocket(wsUrl);

    /**
     * 发送消息到服务端
     */
    const sendMessage = () => {
        let data = {
            type: "client",
            data: dataIdx,
            fromServer: false,
            clientId:clientId,
        }
        dataIdx++;

        webSocket.send(JSON.stringify(data));
    }

    webSocket.on('error', (error) => {
        console.error(`[${tool.getDateNowText()}]ws 通讯发生了错误，错误信息`, error)
    });

    webSocket.on('open', () => {
        console.log(`[${tool.getDateNowText()}] WebSocket 客户端开启`);
        console.log(`[${tool.getDateNowText()}] 向服务端发送消息`);
        sendMessage();
    });

    webSocket.on('close', (code, reason) => {
        console.log(`[${tool.getDateNowText()}] WebSocket 客户端关闭,code:${code},reason:${reason}`);
    });

    webSocket.on('message', (bufferData, isBinary) => {
        let data = bufferData.toString();
        console.log(`[${tool.getDateNowText()}] 收到WebSocket 服务端消息：${data}`);

        if (dataIdx > 3) {
            console.log(`[${tool.getDateNowText()}] 和服务端通讯了 3 次，关闭通讯`);
            webSocket.close(3001, "client close");
            return;
        }

        console.log(`[${tool.getDateNowText()}] 向服务端发送消息`);
        setTimeout(() => {
            sendMessage();
        }, 100);
    });

    console.log(`[${tool.getDateNowText()}] ws 客户端启动成功`);
}

const createClientList = (clientCount) => {
    for (let i = 1; i <= clientCount; i++) {
        createWSTextClient(i);
    }
}

createClientList(10)