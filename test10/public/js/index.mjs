import tool from "js/tool";
const $ = (domSelector) => document.querySelector(domSelector);

let wsClient = null;
let messageIndex = 0;
const writeHistory = (message) => {
  const history = $("#history-list");
  const historyItem = document.createElement("li");
  historyItem.textContent = message;
  history.appendChild(historyItem);
};

$("#connect").addEventListener("click", () => {
  if (wsClient != null) {
    writeHistory(`[${tool.getDateNowText()}]已经连接服务器成功`);
    return;
  }
  writeHistory(`[${tool.getDateNowText()}]连接服务器中...`);
  const wsUrl = $("#wsUrl").value;
  wsClient = createWSClient(wsUrl);
});

$("#disconnect").addEventListener("click", () => {
  writeHistory(`[${tool.getDateNowText()}]客户端断开服务器连接成功`);
  if (wsClient != null) {
    wsClient.close(3001, "client close");
  }
});

$("#send").addEventListener("click", () => {
  if (wsClient == null) {
    writeHistory(`[${tool.getDateNowText()}]请先连接服务器`);
    return;
  }

  writeHistory(`[${tool.getDateNowText()}]消息发送中...`);
  let messageText = $("#input").value;
  let message = {
    message: messageText,
    from: "client",
    index: ++messageIndex,
  };
  writeHistory(
    `[${message.index}][${tool.getDateNowText()}][${message.from}] message:${
      message.message
    }`
  );
  // wsClient.send(JSON.stringify(message));
  wsClient.send("123,.;[");
  writeHistory(`[${tool.getDateNowText()}]客户端发送消息成功`);
});

$("#send-seq").addEventListener("click", () => {
  if (wsClient == null) {
    writeHistory(`[${tool.getDateNowText()}]请先连接服务器`);
    return;
  }
  writeHistory(`[${tool.getDateNowText()}]开始按顺序发送 msg1~msg8`);
  for (let i = 1; i <= 8; i++) {
    setTimeout(() => {
      let message = {
        message: `msg${i}`,
        from: "client",
        index: ++messageIndex,
      };
      writeHistory(
        `[${message.index}][${tool.getDateNowText()}][${message.from}] message:${
          message.message
        }`
      );
      wsClient.send(JSON.stringify(message));
    }, i * 300);
  }
});

$("#send-close").addEventListener("click", () => {
  $("#input").value = "[close]";
  $("#send").click();
});

$("#clear").addEventListener("click", () => {
  $("#history-list").innerHTML = "";
  writeHistory(`[${tool.getDateNowText()}]历史记录已清空`);
});

/**
 * 创建发送文本消息的 ws 客户端
 */
const createWSClient = (wsUrl) => {
  const webSocket = new WebSocket(wsUrl);

  webSocket.addEventListener("error", (event) => {
    writeHistory(
      `[${tool.getDateNowText()}]ws 通讯发生了错误，错误信息`,
      event
    );
  });

  webSocket.addEventListener("open", (event) => {
    writeHistory(`[${tool.getDateNowText()}]服务器连接成功`);
  });

  webSocket.addEventListener("close", (event) => {
    wsClient = null;
    messageIndex = 0;
    writeHistory(
      `[${tool.getDateNowText()}] ws 链接关闭,code:${event.code},reason:${
        event.reason
      }`
    );
  });

  webSocket.addEventListener("message", (event) => {
    let messageBody = event.data;
    let message = JSON.parse(messageBody);
    messageIndex = message.index;
    writeHistory(`[${tool.getDateNowText()}]收到服务端消息`);
    writeHistory(
      `[${message.index}][${tool.getDateNowText()}][${message.from}] message:${
        message.message
      }`
    );
  });
  return webSocket;
};
