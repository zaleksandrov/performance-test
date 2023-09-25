const c = require("./constants");

const calculateAuxiliaryVariable = (latitude) => c.semiMajorAxis / Math.sqrt(1 - c.ellipsoidFlattening * (2 - c.ellipsoidFlattening) * Math.pow(Math.sin(latitude), 2));

module.exports = {

    convertToCartesian: (data) => {
        const N = calculateAuxiliaryVariable(data.latitude);

        const cosLat = Math.cos(data.latitude);
        const cosLong = Math.cos(data.longitude);
        const sinLong = Math.sin(data.longitude);
        const sinLat = Math.sin(data.latitude);

        const x = (N + data.altitude) * cosLat * cosLong;
        const y = (N + data.altitude) * cosLat * sinLong;
        const z = (c.semiAxisRatioSqr * N + data.altitude) * sinLat;

        return [x, y, z];
    },

    convertToGPS: (position) => {
        const latitude = Math.atan(position[2] / Math.sqrt(position[0] * position[0] + position[1] * position[1]));
        const longitude = Math.atan2(position[1], position[0]);

        const N = calculateAuxiliaryVariable(latitude);

        const positionMag = Math.sqrt(position[0] * position[0] + position[1] * position[1] + position[2] * position[2]);

        const altitude = positionMag / Math.cos(latitude) - N;

        return { longitude, latitude, altitude };
    },
}