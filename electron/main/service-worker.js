const { parentPort } = require("worker_threads");
const { convertToCartesian } = require("../../build/Release/addon.node");

const c = require("./constants");
const util = require("./util");

const sleep = async (time) => new Promise(r => setTimeout(r, time));

const sendData = async (gps, message, id) => {
    await convertToCartesian(gps).then(res => parentPort.postMessage(({ message: message, id: id, position: res, timestamp: 0})));
}

const replyLoop = async () => {
    let counter = -1;
    let iteration = 1;
    const messages = [];
    const position = [0, 0, 0];
    
    while(true) {
        for (let i = 0; i < c.iterationCount; i++) {
            counter++;
            if (counter === c.DRONE_MAX_COUNT) {
                counter = 0;
                iteration++;
            }
            
            const y = Math.sin(((counter + iteration) % c.GRID_SIZE_X) * c.speed) * c.height;
            if (counter >= messages.length) messages.push(`${c.WORKER_TO_RENDERER}${counter}`);

            position[1] = y;

            const gps = util.convertToGPS(position);
            sendData(gps, messages[counter], counter);
        }

        await sleep(c.refreshRate);
    }
};

parentPort.on('message', async (message) => {
    if (message.command === 'start') {

        await replyLoop();
    }
});
