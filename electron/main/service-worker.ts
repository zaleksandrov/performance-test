import { ipcMain, IpcMainEvent } from "electron";
import * as c from "../../src/constants";
import { convertToGPS } from "../../src/util";
import { TelemetryData } from "../../src/types";
import { Vector3 } from "three";

const sleep = async (time: number) => new Promise(r => setTimeout(r, time));

const replyLoop = async (event: IpcMainEvent) => {
    let counter = -1;
    let iteration = 1;
    const messages: string[] = [];
    const position = new Vector3();
    
    while(true) {
        for (let i = 0; i < c.iterationCount; i++) {
            counter++;
            if (counter === c.DRONE_MAX_COUNT) {
                counter = 0;
                iteration++;
            }
            
            const y = Math.sin(((counter + iteration) % c.GRID_SIZE_X) * c.speed) * c.height;
            if (counter >= messages.length) messages.push(`${c.WORKER_TO_RENDERER}${counter}`);

            position.set(0, y, 0);

            const data: TelemetryData = { id: counter, position: convertToGPS(position), timestamp: 0};
            event.sender.send(messages[counter], data);
        }

        await sleep(c.refreshRate);
    }
};

ipcMain.on(c.RENDERER_TO_WORKER, (event, message) => {
    console.log("Received message in worker: ", message);

    replyLoop(event);
});
