const { WebSocketServer } = require('ws');
const tool = require('../tools/tool');

/**
 * 概念：
 * ws服务器：WebSocketServer
 * ws 实例：WebSocket
 */

/**
 * 创建发送文本消息的 ws 服务端
 */
const createWSTextServer = () => {
    let dataIdx = 1;

    /**
     * 创建 ws 服务器实例
     */
    const webSocketServer = new WebSocketServer({ port: 3000 });

    webSocketServer.on('connection', (webSocket, request) => {

        console.log(`[${tool.getDateNowText()}] 接收到一个新的 ws 链接`);
        /**
         * 每当一个客户端 ws 实例创建，ws 服务器会创建一个和ws客户端对应的ws服务端实例进行通讯
         */

        webSocket.on('error', (error) => {
            console.error(`[${tool.getDateNowText()}] ws 通讯发生了错误，错误信息`, error)
        });

        webSocket.on('message', (bufferData,isBinary) => {
            let data = bufferData.toString();
            console.log(`[${tool.getDateNowText()}] 收到 WebSocket 客户端消息：${data}`);
            let dataJson = JSON.parse(data);
            dataJson.fromServer = true;

            console.log(`[${tool.getDateNowText()}] 向客户端发送消息`);
            webSocket.send(JSON.stringify(dataJson));

            // if (dataIdx > 3) {
            //     console.log(`[${tool.getDateNowText()}] 和客户端通讯了 3 次，关闭通讯`);
            //     webSocket.close(3002,'server close');
            // }

            // dataIdx++;
        });
        webSocket.on('close', (code, reason) => {
            console.log(`[${tool.getDateNowText()}] WebSocket 服务端关闭,code:${code},reason:${reason}`);
        });
    });

    console.log(`[${tool.getDateNowText()}] ws 服务器启动成功`);
}

createWSTextServer();