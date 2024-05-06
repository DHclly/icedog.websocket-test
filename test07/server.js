const { WebSocketServer } = require('ws');
const http = require('http');
const express = require('express');
const path = require('path')
const tool = require('../tools/tool');
const url = require('url');

/**
 * 概念：
 * ws服务器：WebSocketServer
 * ws 实例：WebSocket
 */

/**
 * 创建http 服务集成 ws 服务端
 */
const createHttpServerWithWSServer = () => {

    const expressServer = express();

    // 指定静态文件路径，同时public路径是从程序文件所在的目录定位，而不是启动程序的目录
    expressServer.use(express.static(path.join(__dirname, 'public')));

    // 指定文件也可以从 /public路径访问
    expressServer.use("/public", express.static(path.join(__dirname, 'public')));

    expressServer.get("/", (req, res) => {
        res.sendFile("index.html");
    });

    expressServer.get("/ping", (req, res) => {
        res.send("pong");
    });

    const httpServer = http.createServer(expressServer);


    /**
     * 创建 ws 服务器实例
     */
    const webSocketServer1 = new WebSocketServer({ noServer: true });// 不绑定 httpserver 前端ws就会报错
    const webSocketServer2 = new WebSocketServer({ noServer: true });// 不绑定 httpserver 前端ws就会报错

    /**
     * 
     * @param {*} webSocket 
     * @param {*} request 
     */
    const wsConnectionHandler = (webSocket, request,id) => {

        console.log(`[${tool.getDateNowText()}] wss ${id} 接收到一个新的 ws 链接`);
        /**
         * 每当一个客户端 ws 实例创建，ws 服务器会创建一个和ws客户端对应的ws服务端实例进行通讯
         */

        webSocket.on('error', (error) => {
            console.error(`[${tool.getDateNowText()}] ws 通讯发生了错误，错误信息`, error)
        });

        webSocket.on('message', (bufferData, isBinary) => {
            let data = bufferData.toString();
            console.log(`[${tool.getDateNowText()}] 收到 WebSocket 客户端消息：${data}`);
            let dataJson = JSON.parse(data);
            dataJson.fromServer = true;

            console.log(`[${tool.getDateNowText()}] 向客户端发送消息`);
            webSocket.send(JSON.stringify(dataJson));

        });
        webSocket.on('close', (code, reason) => {
            console.log(`[${tool.getDateNowText()}] WebSocket 服务端关闭,code:${code},reason:${reason}`);
        });
    };

    webSocketServer1.on('connection', wsConnectionHandler);
    webSocketServer2.on('connection', wsConnectionHandler);

    /**
     * 处理 WebSocket 协议升级事件
     */
    httpServer.on('upgrade', (request, webSocket, head) => {
        const { pathname } = url.parse(request.url);
        
        const errorHandler=(error) => {
            console.error(`[${tool.getDateNowText()}] ws 通讯发生了错误，错误信息`, error)
        };

        webSocket.on('error', errorHandler);

        if (pathname.startsWith('/server/1/')) {
            // 使用 ws.handleUpgrade 方法处理升级
            webSocketServer1.handleUpgrade(request, webSocket, head, (webSocket) => {
                webSocketServer1.emit('connection', webSocket, request,1);
            });

        } else if (pathname.startsWith('/server/2/')) {
            // 使用 ws.handleUpgrade 方法处理升级
            webSocketServer2.handleUpgrade(request, webSocket, head, (webSocket) => {
                webSocketServer2.emit('connection', webSocket, request,2);
            });
        }else{
            webSocket.write('HTTP/1.1 401 Unauthorized\r\n\r\n');
            webSocket.destroy();
            webSocket.removeListener('error', errorHandler);
            console.error(`[${tool.getDateNowText()}] 请求的url:${request.url} 无效，中断连接`);
        }
    });

    httpServer.listen(3000, () => {
        console.log(`[${tool.getDateNowText()}] http 服务和ws 服务启动成功\n - http 访问地址：http://localhost:3000 \n - ws 访问地址：ws://localhost:3000 `);
    });
}

createHttpServerWithWSServer();