import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import { useMemo } from "react";
import * as THREE from "three";

const DNAHelix = () => {
  const spheres = useMemo(() => {
    const arr = [];
    for (let i = 0; i < 50; i++) {
      const angle = i * 0.3;
      const y = i * 0.4 - 10;

      arr.push({
        position1: [Math.cos(angle) * 2, y, Math.sin(angle) * 2],
        position2: [Math.cos(angle + Math.PI) * 2, y, Math.sin(angle + Math.PI) * 2],
      });
    }
    return arr;
  }, []);

  return (
    <group rotation={[0, 0, 0]}>
      {spheres.map((pos, i) => (
        <group key={i}>
          <mesh position={pos.position1}>
            <sphereGeometry args={[0.2, 16, 16]} />
            <meshPhongMaterial color={0x00ffea} />
          </mesh>
          <mesh position={pos.position2}>
            <sphereGeometry args={[0.2, 16, 16]} />
            <meshPhongMaterial color={0xff007f} />
          </mesh>
        </group>
      ))}
    </group>
  );
};

const DNABackground = () => {
  return (
    <Canvas camera={{ position: [0, 0, 15], fov: 75 }}>
      {/* Lights */}
      <ambientLight intensity={0.4} />
      <pointLight position={[10, 10, 10]} />

      {/* DNA Helix */}
      <DNAHelix />

      {/* Controls (optional) */}
      <OrbitControls enableZoom={false} autoRotate autoRotateSpeed={2} />
    </Canvas>
  );
};

export default DNABackground;
