import { GPSData } from "./types";
import * as c from "./constants";
import { Vector3 } from "three";

export const calculateAuxiliaryVariable = (latitude: number): number => {
    return c.semiMajorAxis / Math.sqrt(1 - c.ellipsoidFlattening * (2 - c.ellipsoidFlattening) * Math.pow(Math.sin(latitude), 2));
}

export const convertToCartesian = (data: GPSData): Vector3 => {
    const N = calculateAuxiliaryVariable(data.latitude);

    const cosLat = Math.cos(data.latitude);
    const cosLong = Math.cos(data.longitude);
    const sinLong = Math.sin(data.longitude);
    const sinLat = Math.sin(data.latitude);

    const x = (N + data.altitude) * cosLat * cosLong;
    const y = (N + data.altitude) * cosLat * sinLong;
    const z = (c.semiAxisRatioSqr * N + data.altitude) * sinLat;

    return new Vector3(x, y, z);
}

export const convertToGPS = (position : Vector3): GPSData => {
    const latitude = Math.atan(position.z / Math.sqrt(position.x * position.x + position.y * position.y));
    const longitude = Math.atan2(position.y, position.x);

    const N = calculateAuxiliaryVariable(latitude);

    const positionMag = position.length();

    const altitude = positionMag / Math.cos(latitude) - N;

    return { longitude, latitude, altitude };
}