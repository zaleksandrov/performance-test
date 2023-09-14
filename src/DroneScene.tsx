import React, { FC, useEffect, useRef, useState } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { BoxGeometry, Mesh, Vector3 } from 'three';
import {
  Sky,
  ContactShadows,
  Environment,
  OrbitControls,
} from '@react-three/drei'
import { ipcRenderer, IpcRendererEvent } from 'electron';
import * as msg from "./constants";
import { TelemetryData } from './types';

const DRONE_SPAWN_DELTA_TIME = 0.01;
const DRONE_MAX_COUNT = 2000;
const CELL_SIZE = 2;
const GRID_SIZE = 45;

type DroneProps = {
    position: Vector3
};

const Drone: FC<DroneProps> = ({ position = new Vector3(0, 0, 0) }) => {

  const boxRef = React.useRef() as React.MutableRefObject<Mesh>;

  useFrame(() => {
    boxRef.current.position.set(position.x, position.y, position.z);
    boxRef.current.updateMatrix();
  })

  return (
    <mesh ref={boxRef}>
        <boxGeometry />
        <meshBasicMaterial color="#333" depthTest={false} />
    </mesh>
  );
};

const DroneSwarm: FC = () => {
    const [timer, setTimer] = useState(0);
    const [droneCount, setDroneCount] = useState(0);
    const [dronePosition, setDronePosition] = useState<Vector3[]>([]);

    useFrame((state, delta) => {
        if (droneCount >= DRONE_MAX_COUNT) return;

        if (timer <= 0) {
            setTimer(timer + DRONE_SPAWN_DELTA_TIME);

            const x = Math.floor(droneCount / GRID_SIZE) * CELL_SIZE;
            const z = Math.floor(droneCount % GRID_SIZE) * CELL_SIZE;
            
            setDroneCount(droneCount + 1);
            setDronePosition([...dronePosition, new Vector3(x, 0, z)]);
            return;
        }

        setTimer(timer - delta);
    });

    const handleMessage = (event: IpcRendererEvent, message: TelemetryData) => {
      console.log("Received message in Renderer: ", message);
      if (message.id >= dronePosition.length) return;
      const positions = dronePosition.map((v, i) => i === message.id ? new Vector3(v.x, message.position.y, v.z) : v);
      setDronePosition(positions)
    };

    useEffect(() => {
        ipcRenderer.on(msg.WORKER_TO_RENDERER, handleMessage);

        console.log("Message sent to main");
        ipcRenderer.send(msg.RENDERER_TO_WORKER, "Message from renderer");

        return () => {
            ipcRenderer.removeListener(msg.WORKER_TO_RENDERER, handleMessage);
        };
    }, []);

  return (
    <group>
        {dronePosition.map((position, index) => <Drone key={index} position={position} />)}
    </group>
  );
};

const DroneScene = () => {

  return (
      <Canvas dpr={[1, 2]} orthographic camera={{ position: [-10, 10, 10], zoom: 100, far: 5000 }}>
        <pointLight position={[10, 10, 10]} />
        <DroneSwarm />
        <Environment preset="city" />
        <ContactShadows frames={1} position={[0, -0.5, 0]} scale={10} opacity={0.4} far={1} blur={2} />
        <OrbitControls makeDefault rotateSpeed={2} minPolarAngle={0} maxPolarAngle={Math.PI / 2.5} />
        <Sky />
      </Canvas>
  );
};

export default DroneScene;
