import { FC, useEffect, useState } from 'react';
import { Vector3 } from 'three';
import { ipcRenderer } from 'electron';
import Drone from "./Drone";
import * as c from "../constants";

const DroneSwarm: FC = () => {
    const [dronePosition, setDronePosition] = useState<Vector3[]>([]);

    useEffect(() => {
        const positions = [];
        
        for (let i = 0; i < c.DRONE_MAX_COUNT; i++) {
          const x = Math.floor(i / c.GRID_SIZE_X) * c.CELL_SIZE;
          const z = Math.floor(i % c.GRID_SIZE_Y) * c.CELL_SIZE;

          positions.push(new Vector3(x, 0, z));
        };
          
        setDronePosition(positions);

        console.log("Message sent to main");
        ipcRenderer.send(c.RENDERER_TO_WORKER, "Message from renderer");

    }, []);

  return (
    <group>
        {dronePosition.map((position, index) => <Drone key={index} id={index} position={position} />)}
    </group>
  );
};

export default DroneSwarm;
