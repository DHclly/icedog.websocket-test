/**
 * 获取 id 创建器
 * @returns 
 */
const getIdCreator = () => {
    let clientIdx = 0;
    return () => {
        clientIdx += 1;
        return clientIdx;
    }
};

/**
 * 填充 0
 * @param {number} num 
 * @param {number} targetLength 
 */
const fillZero = (num, targetLength = 2) => {
    let numText = num.toString();
    let zeroCount = targetLength - numText.length;
    let data = "";
    for (let i = 0; i < zeroCount; i++) {
        data += "0";
    }
    data += numText;
    return data;
}

/**
 * 获取当前时间字符串
 * @returns 
 */
const getDateNowText = () => {
    let date = new Date();
    let year = date.getFullYear();
    let month = fillZero(date.getMonth() + 1);
    let day = fillZero(date.getDay());
    let hour = fillZero(date.getHours());
    let minute = fillZero(date.getMinutes());
    let second = fillZero(date.getSeconds());
    let millisecond = fillZero(date.getMilliseconds(), 3);
    return `${year}-${month}-${day} ${hour}:${minute}:${second}.${millisecond}`;
}

/**
 * 延迟函数
 * @param {number} ms
 * @returns
 */
const delay = (ms) =>
    new Promise((resolve) => {
        setTimeout(() => {
            resolve(ms);
        }, ms);
    });

module.exports = { delay, getDateNowText, getIdCreator };