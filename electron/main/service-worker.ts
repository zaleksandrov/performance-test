import { ipcMain, IpcMainEvent } from "electron";
import * as c from "../../src/constants";
import { TelemetryData } from "@/types";
import { Vector3 } from "three";

const sleep = async (time: number) => new Promise(r => setTimeout(r, time))

const replyLoop = async (event: IpcMainEvent) => {
    let counter = -1;
    let iteration = 1;
    while(true) {
        for (let i = 0; i < c.iterationCount; i++) {
            counter++;
            if (counter === 2000) {
                counter = 0;
                iteration++;
            }

            const y = Math.sin(counter * iteration * c.speed) * c.height;
            let timestamp = new Date().getTime();

            const data: TelemetryData = { id: counter, position: new Vector3(0, y, 0), timestamp};
            event.sender.send(c.WORKER_TO_RENDERER, data);
        }

        await sleep(c.refreshRate);
    }
};

ipcMain.on(c.RENDERER_TO_WORKER, (event, message) => {
    console.log("Received message in worker: ", message);

    replyLoop(event);
});
