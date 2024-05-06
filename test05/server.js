const { WebSocketServer } = require('ws');
const http = require('http');
const fs = require('fs');
const path = require('path');
const tool = require('../tools/tool');


/**
 * 创建http 服务集成 ws 服务端
 */
const createHttpServerWithWSServer = () => {

    const mineTypeDict = {
        ".js": "application/javascript",
        ".mjs": "application/javascript",
        ".html": "text.html",
        ".css": "text/css",
    };

    const httpServer = http.createServer((req, res) => {
        let fileNameSegment = "";
        if (req.url == "/") {
            fileNameSegment = ["index.html"];
        } else {
            fileNameSegment = req.url.substring(1).split("/");
        }

        // 定义HTML文件的路径
        const filePath = path.join(__dirname, 'public', ...fileNameSegment);
        
        let extName = path.extname(filePath);
        let contentType=mineTypeDict[extName];
        // 设置响应头，指定内容类型和编码
        res.setHeader('Server','icedog');
        res.setHeader('Content-Type', contentType);

        // 读取HTML文件内容并返回
        fs.readFile(filePath, (err, data) => {
            if (err) {
                // 如果发生错误，返回500状态码和错误信息
                res.writeHead(500);
                res.end(`Error: ${err.message}`);
            } else {
                // 否则，返回200状态码和HTML内容
                res.writeHead(200);
                res.end(data);
            }
        });
    })

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
     * 创建 ws 服务器实例
     */
    const webSocketServer = new WebSocketServer({ server: httpServer });
    // const webSocketServer = new WebSocketServer({ noServer: true });// 不绑定 httpserver 前端ws就会报错

    webSocketServer.on('connection', (webSocket, request) => {

        console.log(`[${tool.getDateNowText()}] 接收到一个新的 ws 链接`);
        /**
         * 每当一个客户端 ws 实例创建，ws 服务器会创建一个和ws客户端对应的ws服务端实例进行通讯
         */

        // webSocket.binaryType="nodebuffer";
        webSocket.binaryType="arraybuffer";
        // webSocket.binaryType="fragments";

        webSocket.on('error', (error) => {
            console.error(`[${tool.getDateNowText()}] ws 通讯发生了错误，错误信息`, error)
        });

        webSocket.on('message', (bufferData, isBinary) => {
            let int32Arr=processBufferDataToInt32Array(bufferData);
            let data = int32Arr.toString();
            console.log(`[${tool.getDateNowText()}] 收到 WebSocket 客户端消息：${data},isBinary:${isBinary}`);

            console.log(`[${tool.getDateNowText()}] 向客户端发送消息`);
            let sendData = new Int32Array(3);
            sendData[0] = 999;
            sendData[1] = 666;
            sendData[2] = 999;
            webSocket.send(sendData);

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