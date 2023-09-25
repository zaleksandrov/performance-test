module.exports = {
    WORKER_TO_RENDERER: "worker-to-renderer",
    RENDERER_TO_WORKER: "renderer-to-worker",
    
    refreshRate: 10,
    iterationCount: 1000,
    speed: 0.25,
    height: 20,
    
    DRONE_MAX_COUNT: 10_000,
    CELL_SIZE: 10,
    GRID_SIZE_X: 100,
    GRID_SIZE_Y: 100,
    
    semiMajorAxis: 6_378_137,
    semiMinorAxis: 6_356_752.3142,
    semiAxisRatioSqr: (6_356_752.3142 * 6_356_752.3142) / (6_378_137 * 6_378_137),
    ellipsoidFlattening: 1 / 298.257223563,

};