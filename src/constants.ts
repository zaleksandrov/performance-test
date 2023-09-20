export const WORKER_TO_RENDERER = "worker-to-renderer";
export const RENDERER_TO_WORKER = "renderer-to-worker";

export const refreshRate = 10;
export const iterationCount = 1000;
export const speed = 0.25;
export const height = 20;

export const DRONE_MAX_COUNT = 10_000;
export const CELL_SIZE = 10;
export const GRID_SIZE_X = 100;
export const GRID_SIZE_Y = 100;

export const semiMajorAxis = 6_378_137;
export const semiMinorAxis = 6_356_752.3142;
export const semiAxisRatioSqr = (semiMinorAxis * semiMinorAxis) / (semiMajorAxis * semiMajorAxis);
export const ellipsoidFlattening = 1 / 298.257223563;