"use client";

import { useRef, useMemo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Float, Stars, Environment } from "@react-three/drei";
import * as THREE from "three";

function Geometry({ position, color, geometry: GeometryType, args, speed = 1 }: any) {
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (!meshRef.current) return;
    meshRef.current.rotation.x += 0.002 * speed;
    meshRef.current.rotation.y += 0.003 * speed;
  });

  return (
    <Float speed={2 * speed} rotationIntensity={1} floatIntensity={1}>
      <mesh ref={meshRef} position={position}>
        <GeometryType args={args} />
        <meshStandardMaterial
          color={color}
          roughness={0.2}
          metalness={0.8}
          emissive={color}
          emissiveIntensity={0.2}
        />
      </mesh>
    </Float>
  );
}

function FloatingShapes() {
  const groupRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (!groupRef.current) return;
    const { mouse } = state;
    // Parallax effect based on mouse position
    groupRef.current.rotation.x = THREE.MathUtils.lerp(
      groupRef.current.rotation.x,
      mouse.y * 0.1,
      0.1
    );
    groupRef.current.rotation.y = THREE.MathUtils.lerp(
      groupRef.current.rotation.y,
      mouse.x * 0.1,
      0.1
    );
  });

  const shapes = useMemo(() => [
    { type: "box", pos: [-4, 2, -5], color: "#BFFF00", args: [0.8, 0.8, 0.8] }, // Lime Cube
    { type: "sphere", pos: [5, -2, -4], color: "#333333", args: [0.6, 32, 32] }, // Dark Sphere
    { type: "torus", pos: [-3, -3, -2], color: "#555555", args: [0.5, 0.2, 16, 32] }, // Grey Torus
    { type: "cone", pos: [4, 3, -6], color: "#BFFF00", args: [0.6, 1.2, 32] }, // Lime Cone
    { type: "icosahedron", pos: [0, 4, -8], color: "#1a1a1a", args: [0.7, 0] }, // Dark Icosahedron
  ], []);

  return (
    <group ref={groupRef}>
      {shapes.map((shape, i) => {
        let GeometryType: any;
        switch (shape.type) {
          case "box": GeometryType = "boxGeometry"; break;
          case "sphere": GeometryType = "sphereGeometry"; break;
          case "torus": GeometryType = "torusGeometry"; break;
          case "cone": GeometryType = "coneGeometry"; break;
          case "icosahedron": GeometryType = "icosahedronGeometry"; break;
          default: GeometryType = "boxGeometry";
        }
        
        return (
          <Geometry
            key={i}
            position={shape.pos}
            color={shape.color}
            geometry={GeometryType}
            args={shape.args}
            speed={0.8 + Math.random() * 0.4}
          />
        );
      })}
    </group>
  );
}

export function HeroCanvas() {
  return (
    <div className="absolute inset-0 z-0 pointer-events-none">
      <Canvas camera={{ position: [0, 0, 8], fov: 45 }}>
        <fog attach="fog" args={["#000000", 5, 20]} />
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} intensity={1} color="#BFFF00" />
        <pointLight position={[-10, -10, -10]} intensity={0.5} color="#ffffff" />
        
        <FloatingShapes />
        
        <Stars 
          radius={50} 
          depth={50} 
          count={2000} 
          factor={4} 
          saturation={0} 
          fade 
          speed={1} 
        />
        
        <Environment preset="city" />
      </Canvas>
    </div>
  );
}
