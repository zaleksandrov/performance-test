import { useState } from 'react'
import { Canvas } from '@react-three/fiber'
import {
  Select,
  useSelect,
  Sky,
  ContactShadows,
  Edges,
  Environment,
  OrbitControls,
  MeshTransmissionMaterial,
  useCursor
} from '@react-three/drei'

const Cube = ({index = 0, color = 'white', thickness = 1, roughness = 0.5, envMapIntensity = 1, transmission = 1, metalness = 0.5, ...props }) => {
  const [hovered, setHover] = useState(false)
  const isSelected = !!useSelect().find(sel => sel.userData.index === index)
  useCursor(hovered)
  return (
    <mesh
      {...props}
      userData={{index}}
      onPointerOver={(e) => (e.stopPropagation(), setHover(true))}
      onPointerOut={() => setHover(false)}>
      <boxGeometry />
      <MeshTransmissionMaterial 
      resolution={128} 
      samples={16} 
      color={color} 
      roughness={roughness} 
      thickness={thickness} 
      envMapIntensity={envMapIntensity} 
      transmission={transmission} 
      metalness={metalness}
      distortionScale={0}
      temporalDistortion={0}
      />
      <Edges visible={hovered || isSelected} scale={1.1} renderOrder={1000}>
        <meshBasicMaterial transparent color="#333" depthTest={false} />
      </Edges>
    </mesh>
  )
}

const ExampleScene = () => {
  return (
      <Canvas dpr={[1, 2]} orthographic camera={{ position: [-10, 10, 10], zoom: 100 }}>
        <pointLight position={[10, 10, 10]} />
        <Select multiple box>
          <Cube index={1} scale={0.9} position={[-1, 0, 0]} color="orange" thickness={2} envMapIntensity={5} />
          <Cube index={2} scale={0.9} position={[0, 0, 0]} color="#eb8686" envMapIntensity={2} />
          <Cube index={3} scale={0.9} position={[0, 0, -1]} color="hotpink" thickness={2} envMapIntensity={5} />
          <Cube index={4} scale={[1, 0.9, 0.9]} position={[0.05, 0, 1]} color="aquamarine" metalness={0} transmission={0} />
          <Cube index={5} scale={[0.9, 0.9, 1.9]} position={[1, 0, 0.5]} color="aquamarine" metalness={0} transmission={0} />
        </Select>
        <Environment preset="city" />
        <ContactShadows frames={1} position={[0, -0.5, 0]} scale={10} opacity={0.4} far={1} blur={2} />
        <OrbitControls makeDefault rotateSpeed={2} minPolarAngle={0} maxPolarAngle={Math.PI / 2.5} />
        <Sky />
      </Canvas>
  )
}
export default ExampleScene;
