import React from 'react';
import { useKitchenStore } from '../store';

export function KitchenBoundary() {
  const boundary = useKitchenStore((state) => state.boundary);
  const fixtures = useKitchenStore((state) => state.fixtures);

  return (
    <group>
      {/* Floor with improved material */}
      <mesh 
        position={[0, 0, 0]} 
        rotation={[-Math.PI / 2, 0, 0]}
        receiveShadow
      >
        <planeGeometry args={[boundary.width, boundary.depth]} />
        <meshStandardMaterial 
          color="#e5e5e5" 
          roughness={0.8}
          metalness={0.2}
        />
      </mesh>

      {/* Walls with improved materials */}
      <group>
        {/* Back wall */}
        <mesh 
          position={[0, boundary.height / 2, -boundary.depth / 2]}
          receiveShadow
        >
          <planeGeometry args={[boundary.width, boundary.height]} />
          <meshStandardMaterial 
            color="#f5f5f5" 
            roughness={0.9}
            metalness={0.1}
          />
        </mesh>

        {/* Left wall */}
        <mesh 
          position={[-boundary.width / 2, boundary.height / 2, 0]} 
          rotation={[0, Math.PI / 2, 0]}
          receiveShadow
        >
          <planeGeometry args={[boundary.depth, boundary.height]} />
          <meshStandardMaterial 
            color="#f0f0f0" 
            roughness={0.9}
            metalness={0.1}
          />
        </mesh>

        {/* Right wall */}
        <mesh 
          position={[boundary.width / 2, boundary.height / 2, 0]} 
          rotation={[0, -Math.PI / 2, 0]}
          receiveShadow
        >
          <planeGeometry args={[boundary.depth, boundary.height]} />
          <meshStandardMaterial 
            color="#f0f0f0" 
            roughness={0.9}
            metalness={0.1}
          />
        </mesh>
      </group>

      {/* Boundary outline on the floor for better visibility */}
      <mesh 
        position={[0, 0.001, 0]} 
        rotation={[-Math.PI / 2, 0, 0]}
      >
        <planeGeometry args={[boundary.width - 0.05, boundary.depth - 0.05]} />
        <meshBasicMaterial 
          color="#aaaaaa" 
          wireframe={true}
        />
      </mesh>

      {/* Fixed Fixtures with improved materials */}
      {fixtures.map((fixture, index) => (
        <mesh
          key={index}
          position={fixture.position}
          rotation={fixture.rotation}
          castShadow
          receiveShadow
        >
          <boxGeometry 
            args={[
              fixture.dimensions.width,
              fixture.dimensions.height,
              fixture.dimensions.depth
            ]} 
          />
          <meshStandardMaterial 
            color={fixture.type === 'door' ? '#8b4513' : '#87ceeb'}
            transparent={fixture.type === 'window'}
            opacity={fixture.type === 'window' ? 0.5 : 1}
            roughness={fixture.type === 'window' ? 0.1 : 0.7}
            metalness={fixture.type === 'window' ? 0.3 : 0.1}
          />
        </mesh>
      ))}
    </group>
  );
}