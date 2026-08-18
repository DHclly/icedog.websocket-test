const { WebSocketServer } = require("ws");
const http = require("http");
const fs = require("fs");
const path = require("path");
const tool = require("../tools/tool");

/**
 * 概念：
 * ws服务器：WebSocketServer
 * ws 实例：WebSocket
 */

/**
 * 创建http 服务集成 ws 服务端
 */
const createHttpServerWithWSServer = () => {
  const mineTypeDict = {
    ".js": "application/javascript",
    ".mjs": "application/javascript",
    ".json": "application/json",
    ".html": "text/html",
    ".css": "text/css",
    ".txt": "text/plain",
    ".ico": "image/x-icon",
  };

  const httpServer = http.createServer((req, res) => {
    let fileNameSegment = "";
    if (req.url == "/") {
      fileNameSegment = ["index.html"];
    } else {
      fileNameSegment = req.url.substring(1).split("/");
    }

    // 定义HTML文件的路径
    const filePath = path.join(__dirname, "public", ...fileNameSegment);

    let extName = path.extname(filePath);
    let contentType = mineTypeDict[extName];
    if(contentType == null || contentType == undefined){
      contentType="text/plain";
    }
    // 设置响应头，指定内容类型和编码
    res.setHeader("Server", "icedog");
    res.setHeader("Content-Type", contentType);

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
  });

  /**
   * 创建 ws 服务器实例
   */
  const webSocketServer = new WebSocketServer({ server: httpServer });
  // const webSocketServer = new WebSocketServer({ noServer: true });// 不绑定 httpserver 前端ws就会报错
  var allClients = [];
  webSocketServer.on("connection", (webSocket, request) => {
    console.log(`[${tool.getDateNowText()}] 接收到一个新的 ws 链接`);
    allClients.push(webSocket);

    /**
     * 每当一个客户端 ws 实例创建，ws 服务器会创建一个和ws客户端对应的ws服务端实例进行通讯
     */

    webSocket.on("error", (error) => {
      console.error(
        `[${tool.getDateNowText()}] ws 通讯发生了错误，错误信息`,
        error
      );
    });

    // 每条连接独立的处理队列：上一个消息处理完（含 await），才处理下一个
    let messageQueue = Promise.resolve();
    const handleMessage = async (data) => {
      console.log(
        `[${tool.getDateNowText()}] 收到 WebSocket 客户端消息：${data}`
      );
      await tool.delay(Math.random() * 10);
      let dataJson;
      try {
        dataJson = JSON.parse(data);
      } catch (error) {
        console.error(
          `[${tool.getDateNowText()}] 消息不是合法 JSON，已忽略：${data}`
        );
        return;
      }
      dataJson.from = "server";
      dataJson.index += 1;
      if (dataJson.message == "[close]") {
        dataJson.message = "bye";
        webSocket.send(JSON.stringify(dataJson));
        webSocket.close(3000, "server close");
        console.log(`[${tool.getDateNowText()}] 关闭 WebSocket 客户端连接`);
      } else {
        dataJson.message = dataJson.message + "【已处理】";
        setTimeout(() => {
          console.log(`[${tool.getDateNowText()}] 向客户端发送消息`);
          webSocket.send(JSON.stringify(dataJson));
        }, 1000);
      }
    };

    webSocket.on("message", (bufferData, isBinary) => {
      const data = bufferData.toString();
      messageQueue = messageQueue
        .then(() => handleMessage(data))
        .catch((error) => {
          console.error(
            `[${tool.getDateNowText()}] 处理消息发生错误：`,
            error
          );
        });
    });

    webSocket.on("close", (code, reason) => {
      console.log(
        `[${tool.getDateNowText()}] WebSocket 服务端关闭,code:${code},reason:${reason}`
      );
    });
  });

  httpServer.listen(3000, () => {
    console.log(
      `[${tool.getDateNowText()}] http 服务和ws 服务启动成功\n - http 访问地址：http://localhost:3000 \n - ws 访问地址：ws://localhost:3000 `
    );
  });
};

createHttpServerWithWSServer();
