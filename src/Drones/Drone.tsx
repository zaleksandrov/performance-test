import { FC, useEffect, useRef } from 'react';
import { Vector3, Mesh } from 'three';
import { ipcRenderer, IpcRendererEvent } from 'electron';
import * as c from "../constants";
import { TelemetryData } from '../types';

type DroneProps = {
    id: number;
    position: Vector3;
};

const Drone: FC<DroneProps> = ({ id, position }) => {
    const meshRef = useRef() as React.MutableRefObject<Mesh>;

    useEffect(() => {
        meshRef.current.position.set(position.x, position.y, position.z);
        ipcRenderer.on(c.WORKER_TO_RENDERER, handleMessage);

        return () => {
            ipcRenderer.removeListener(c.WORKER_TO_RENDERER, handleMessage);
        };
    }, [])

    const handleMessage = (event: IpcRendererEvent, message: TelemetryData) => {
        if (id === 1 && id === message.id) console.log("Delta Time: ", (new Date().getTime() - message.timestamp));
        if (message.id !== id) return;
        meshRef.current.position.set(
            meshRef.current.position.x,
            message.position.y,
            meshRef.current.position.z);
    };

  return (
    <mesh ref={meshRef}>
        <boxGeometry />
        <meshBasicMaterial color="#333" depthTest={false} />
    </mesh>
  );
};

export default Drone;