import { Vector3 } from "three";
import { DroneState, TelemetryData } from "@/types";
import * as c from "../constants";

export interface HAL {
    setApprovedDrones: (approvedDrones: number[]) => void;

    subscribeDroneState: (callback: () => DroneState) => void;
    unsubscribeDroneState: () => void;

    subscribeTelemetryStream: (callback: () => TelemetryData) => void;
    unsubscribeTelemetryStream: () => void;
};

export class FakeHall implements HAL {
    fakeDrones: number[] = [];
    fakeDroneCount = c.DRONE_MAX_COUNT;
    approvedDrones: number[] = [];
    counter: number = -1;
    iteration: number = 1;
    timer: NodeJS.Timeout = null!;

    constructor() {
        for (let i = 0; i < this.fakeDroneCount; i++) {
            this.fakeDrones.push(i);
        }
    }

    public setApprovedDrones (approvedDrones: number[]) {
        this.approvedDrones.length = 0;
        this.approvedDrones.push(...approvedDrones);
    }

    public subscribeDroneState (callback: () => DroneState) {

    }

    public unsubscribeDroneState () {
        
    }

    public subscribeTelemetryStream (callback: (data: TelemetryData) => void) {
        this.counter = -1;
        this.iteration = 1;

        this.timer = setInterval(() => {
            for (let i = 0; i < c.iterationCount; i++) {
                this.counter++;
                if (this.counter === c.DRONE_MAX_COUNT) {
                    this.counter = 0;
                    this.iteration++;
                }
                
                const y = Math.sin(((this.counter + this.iteration) % c.GRID_SIZE_X) * c.speed) * c.height;
    
                const data: TelemetryData = { id: this.counter, position: {latitude: 0, longitude: y, altitude: 0}, timestamp: 0};
                callback(data);
            }
        }, c.refreshRate);
    }

    public unsubscribeTelemetryStream () {
        if (this.timer) clearInterval(this.timer);
    }
};