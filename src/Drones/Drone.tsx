import { FC, useEffect, useRef } from 'react';
import { Vector3, Mesh, BoxGeometry, MeshBasicMaterial } from 'three';
import { ipcRenderer, IpcRendererEvent } from 'electron';
import * as c from "../constants";
import { TelemetryData } from '../types';
// import { convertToCartesian } from '@/util';
// const {convertToCartesian} = require("../../build/Release/addon.node");
const {add} = require("./addon.node");
// const {add} = require('electron').remote.require('../../build/Release/addon.node');
console.log("C++ addon - Add Function 2 + 3: ",add(2, 3));


type DroneProps = {
    id: number;
    position: Vector3;
};

const boxGeometry = new BoxGeometry(1, 1, 1);
const basicMaterial = new MeshBasicMaterial({ color:"#333", depthTest: false });

const Drone: FC<DroneProps> = ({ id, position }) => {
    const meshRef = useRef() as React.MutableRefObject<Mesh>;

    useEffect(() => {
        meshRef.current.position.set(position.x, position.y, position.z);
        ipcRenderer.on(`${c.WORKER_TO_RENDERER}${id}`, handleMessage);

        return () => {
            ipcRenderer.removeListener(`${c.WORKER_TO_RENDERER}${id}`, handleMessage);
        };
    }, [])

    const handleMessage = async (event: IpcRendererEvent, message: TelemetryData) => {
        // if (message.id !== id) return;

        // const posCartesian = await convertToCartesian(message.position);

        // meshRef.current.position.set(
        //     meshRef.current.position.x,
        //     posCartesian.y,
        //     meshRef.current.position.z);
    };

  return (
    <mesh ref={meshRef} geometry={boxGeometry} material={basicMaterial} />
  );
};

export default Drone;