const { WebSocket } = require('ws');
const tool = require('../tools/tool');

/**
 * 创建发送二进制消息的 ws 客户端
 */
const createWSBinaryClient = () => {

    let dataIdx = 1;
    const wsUrl = 'ws://localhost:3000';
    const webSocket = new WebSocket(wsUrl);

    const processBufferDataToInt32Array = (bufferData) => {
        let int32numArr = [];
        for (let i = 0; i < bufferData.length; i += 4) {
            let n = bufferData.readInt32LE(i);
            int32numArr.push(n);
        }
        let int32data = new Int32Array(int32numArr);
        return int32data;
    }

    /**
     * 发送消息到服务端
     */
    const sendMessage = () => {
        let data = new Int32Array(10);
        for (let i = 0; i < data.length; i++) {
            data[i] = i + 5000;
        }
        dataIdx++;

        webSocket.send(data);
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
        let int32Arr=processBufferDataToInt32Array(bufferData);
        let data = int32Arr.toString();

        console.log(`[${tool.getDateNowText()}] 收到WebSocket 服务端消息：${data},isBinary:${isBinary}`);

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

createWSBinaryClient();