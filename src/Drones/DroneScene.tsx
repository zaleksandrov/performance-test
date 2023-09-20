import { FC } from 'react';
import { Canvas } from '@react-three/fiber';
import {
  Sky,
  Environment,
  OrbitControls,
} from '@react-three/drei';
import DroneSwarm from "./DroneSwarm";

const DroneScene: FC = () => {

  return (
      <Canvas dpr={[1, 2]} orthographic camera={{ position: [-10, 10, 10], zoom: 100, far: 5000 }}>
        <pointLight position={[10, 10, 10]} />
        <DroneSwarm />
        <Environment preset="city" />
        <OrbitControls makeDefault rotateSpeed={2} minPolarAngle={0} maxPolarAngle={Math.PI / 2.5} />
        <Sky />
      </Canvas>
  );
};

export default DroneScene;
