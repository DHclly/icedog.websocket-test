const { EventEmitter } = require("events");
const e = new EventEmitter();
e.on("boom", () => { throw new Error("炸了"); });
console.log("hello 1");
e.emit("boom");  // 进程直接崩，和 ws 完全无关
console.log("hello 2");