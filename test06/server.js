const { WebSocketServer } = require('ws');
const http = require('http');
const express = require('express');
const path = require('path')
const tool = require('../tools/tool');

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
    expressServer.use("/public",express.static(path.join(__dirname, 'public')));

    expressServer.get("/",(req,res)=>{
        res.sendFile("index.html");
    });

    expressServer.get("/ping",(req,res)=>{
        res.send("pong");
    });

    const httpServer = http.createServer(expressServer);


    /**
     * 创建 ws 服务器实例
     */
    const webSocketServer = new WebSocketServer({ server: httpServer });
    // const webSocketServer = new WebSocketServer({ noServer: true });// 不绑定 httpserver 前端ws就会报错

    webSocketServer.on('connection', (webSocket, request) => {

        console.log(`[${tool.getDateNowText()}] 接收到一个新的 ws 链接`);
        /**
         * 每当一个客户端 ws 实例创建，ws 服务器会创建一个和ws客户端对应的ws服务端实例进行通讯
         */

        webSocket.on('error', (error) => {
            console.error(`[${tool.getDateNowText()}] ws 通讯发生了错误，错误信息`, error)
        });

        webSocket.on('message', (bufferData, isBinary) => {
            debugger;
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
    });

    httpServer.listen(3000, () => {
        console.log(`[${tool.getDateNowText()}] http 服务和ws 服务启动成功\n - http 访问地址：http://localhost:3000 \n - ws 访问地址：ws://localhost:3000 `);
    });
}

createHttpServerWithWSServer();