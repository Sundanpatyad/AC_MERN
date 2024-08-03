import React, { useRef, useState, useEffect } from 'react';
import * as THREE from 'three';
import { Canvas, useFrame } from '@react-three/fiber';
import { Text } from '@react-three/drei';

const Star = ({ position }) => {
  const meshRef = useRef();

  useFrame(() => {
    meshRef.current.scale.setScalar(Math.random() * 0.5 + 0.5);
  });

  return (
    <mesh ref={meshRef} position={position}>
      <sphereGeometry args={[0.05, 16, 16]} />
      <meshBasicMaterial color="white" />
    </mesh>
  );
};

const CelestialBody = ({ isSun }) => {
  const meshRef = useRef();

  useFrame((state) => {
    meshRef.current.rotation.y += 0.005;
  });

  return (
    <mesh ref={meshRef}>
      <sphereGeometry args={[1, 32, 32]} />
      <meshPhongMaterial
        color={isSun ? 0xFDB813 : 0xC6C6C6}
        emissive={isSun ? 0xFDB813 : 0x718096}
        emissiveIntensity={isSun ? 0.5 : 0.2}
      />
      {!isSun && (
        <>
          <mesh position={[0.5, 0.5, 0.7]} scale={0.2}>
            <sphereGeometry args={[1, 16, 16]} />
            <meshBasicMaterial color={0x718096} />
          </mesh>
          <mesh position={[-0.3, -0.5, 0.8]} scale={0.15}>
            <sphereGeometry args={[1, 16, 16]} />
            <meshBasicMaterial color={0x718096} />
          </mesh>
          <mesh position={[0.1, 0.1, 0.9]} scale={0.1}>
            <sphereGeometry args={[1, 16, 16]} />
            <meshBasicMaterial color={0x718096} />
          </mesh>
        </>
      )}
    </mesh>
  );
};

const LoadingText = () => {
  const [dots, setDots] = useState('');

  useEffect(() => {
    const interval = setInterval(() => {
      setDots((prev) => (prev.length < 3 ? prev + '.' : ''));
    }, 500);

    return () => clearInterval(interval);
  }, []);

  return (
    <Text
      position={[0, -2, 0]}
      fontSize={0.5}
      color="white"
      anchorX="center"
      anchorY="middle"
    >
      {`Awakening Classes${dots}`}
    </Text>
  );
};

const Scene = () => {
  const [isSun, setIsSun] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      setIsSun((prev) => !prev);
    }, 3000);

    return () => clearInterval(timer);
  }, []);

  return (
    <>
      <ambientLight intensity={0.1} />
      <pointLight position={[10, 10, 10]} intensity={1} />
      {[...Array(50)].map((_, i) => (
        <Star
          key={i}
          position={[
            Math.random() * 10 - 5,
            Math.random() * 10 - 5,
            Math.random() * 10 - 5,
          ]}
        />
      ))}
      <CelestialBody isSun={isSun} />
      <LoadingText />
    </>
  );
};

const PageLoader3D = () => {
  return (
    <div style={{ width: '100vw', height: '100vh', background: '#000' }}>
      <Canvas camera={{ position: [0, 0, 5] }}>
        <Scene />
      </Canvas>
    </div>
  );
};

export default PageLoader3D;