let q = Promise.resolve();
q = q
//   .then(() => { throw new Error("boom"); })   // 这环 reject 了
  .then(()=>"good")
  .catch((e) => { console.log("接住:", e.message); return "ok"; });

q.then((v) => console.log("存回去的 q 是:", v));
// 输出：
// 接住: boom
// 存回去的 q 是: ok

const p = Promise.resolve();
const r1 = p.then(() => 1);
const r2 = p.then(() => undefined);
const r3 = p.catch(() => {});
console.log(r1 instanceof Promise);  // true
console.log(r2 instanceof Promise);  // true
console.log(r3 instanceof Promise);  // true
