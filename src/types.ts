import { Vector3 } from "three";

type DroneData = {
  id: number;
};

export type GPSData = {
  longitude: number;
  latitude: number;
  altitude: number;
};

export type TelemetryData = DroneData & {
  position: Vector3;
  timestamp: number;
};

export type DroneState = DroneData & {
  state: "connected" | "disconnected";
};
