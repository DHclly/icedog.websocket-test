import tool from 'js/tool';

/**
 * 创建发送文本消息的 ws 客户端
 */
const createWSClient = (id) => {

    let dataIdx = 1;
    const wsUrl = `ws://localhost:3000/client/websocket-${tool.fillZero(id,3)}`;
    const webSocket = new WebSocket(wsUrl);

    /**
     * 发送消息到服务端
     */
    const sendMessage = () => {
        let data = {
            type: "client",
            data: dataIdx,
            fromServer: false,
        }
        dataIdx++;

        webSocket.send(JSON.stringify(data));
    }

    webSocket.addEventListener('error', (event) => {
        console.error(`[${tool.getDateNowText()}]ws 通讯发生了错误，错误信息:${event.currentTarget.url}`)
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
        let data = event.data;
        console.log(`[${tool.getDateNowText()}] 收到WebSocket 服务端消息：${data}`);

        if (dataIdx > 3) {
            console.log(`[${tool.getDateNowText()}] 和服务端通讯了 3 次，关闭通讯`);
            webSocket.close(3001,"client close");
            return;
        }

        console.log(`[${tool.getDateNowText()}] 向服务端发送消息`);
        setTimeout(() => {
            sendMessage();
        }, 50);
    });

    console.log(`[${tool.getDateNowText()}] ws 客户端启动成功`);
}

const createWSClientList= async (wsCount)=>{
    for (let i = 1; i <= wsCount; i++) {
        await tool.delay(50); // 等待一会，之前的ws连接任务完成了就关闭了，新开的就没事
        createWSClient(i);
    }
}

createWSClientList(3000);

// 不同浏览器对于同时打开的 ws（WebSocket）连接数有不同的限制，具体数量取决于浏览器的实现。
// 例如，
// IE 浏览器最多允许同时打开 6 个 ws 连接，
// chrome 内核浏览器最多允许同时打开 254 个 ws 连接，
// Firefox 浏览器最多允许同时打开 200 个 ws 连接，
// safari（MAC 版本）浏览器最多允许同时打开 1273 个 ws 连接。
// 需要注意的是，这些限制可能会因浏览器版本、操作系统等因素而有所不同。
// 同时，实际应用中还需要考虑服务器的性能和负载能力等因素，以确保系统的稳定性和性能。
// 如果打开后再开启新的ws则没有限制