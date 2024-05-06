import tool from 'js/tool';

/**
 * 创建发送文本消息的 ws 客户端
 */
const createWSClient = () => {

    let dataIdx = 1;
    const wsUrl = 'ws://localhost:3000';
    const webSocket = new WebSocket(wsUrl);

    // webSocket.binaryType="blob";
    webSocket.binaryType="arraybuffer";

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

    /**
     * 
     * @param {*} bufferData 
     * @returns 
     */
    const processBufferDataToInt32Array = (bufferData) => {
        let bufferDataView = new DataView(bufferData);
        let int32numArr = [];
        for (let i = 0; i < bufferDataView.byteLength; i += Int32Array.BYTES_PER_ELEMENT/*4*/) {
            let n = bufferDataView.getInt32(i,true);
            int32numArr.push(n);
        }
        let int32data = new Int32Array(int32numArr);
        return int32data;
    }

    const processBufferDataToInt32Array2 = (bufferData) => {
        let int32data = new Int32Array(bufferData);
        return int32data;
    }

    webSocket.addEventListener('error', (event) => {
        console.error(`[${tool.getDateNowText()}]ws 通讯发生了错误，错误信息`, event)
    });

    webSocket.addEventListener('open', (event) => {
        console.log(`[${tool.getDateNowText()}] WebSocket 客户端开启`);
        console.log(`[${tool.getDateNowText()}] 向服务端发送消息`);
        sendMessage();
    });

    webSocket.addEventListener('close', (event) => {
        console.log(`[${tool.getDateNowText()}] WebSocket 客户端关闭,code:${event.code},reason:${event.reason}`);
    });

    webSocket.addEventListener('message', (event) => {
        let bufferData=event.data;
        // let int32Arr=processBufferDataToInt32Array(bufferData);
        let int32Arr=processBufferDataToInt32Array2(bufferData);
        let data = int32Arr.toString();

        console.log(`[${tool.getDateNowText()}] 收到WebSocket 服务端消息：${data}`);

        if (dataIdx > 3) {
            console.log(`[${tool.getDateNowText()}] 和服务端通讯了 3 次，关闭通讯`);
            webSocket.close(3001,"client close");
            return;
        }

        console.log(`[${tool.getDateNowText()}] 向服务端发送消息`);
        setTimeout(() => {
            sendMessage();
        }, 100);
    });

    console.log(`[${tool.getDateNowText()}] ws 客户端启动成功`);
}

createWSClient();