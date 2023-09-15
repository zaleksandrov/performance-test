import { FC } from 'react';
import { Canvas } from '@react-three/fiber';
import {
  Sky,
  ContactShadows,
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
        <ContactShadows frames={1} position={[0, -0.5, 0]} scale={10} opacity={0.4} far={1} blur={2} />
        <OrbitControls makeDefault rotateSpeed={2} minPolarAngle={0} maxPolarAngle={Math.PI / 2.5} />
        <Sky />
      </Canvas>
  );
};

export default DroneScene;
