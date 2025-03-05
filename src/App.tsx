import React, { Suspense, useState, useRef } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Grid, Loader } from '@react-three/drei';
import { KitchenItem } from './components/KitchenItem';
import { KitchenBoundary } from './components/KitchenBoundary';
import { Controls } from './components/Controls';
import { LayoutConfig } from './components/LayoutConfig';
import { ItemsDrawer } from './components/ItemsDrawer';
import { ModelLoader } from './components/ModelLoader';
import { useKitchenStore } from './store';
import * as THREE from 'three';

function Scene() {
  const items = useKitchenStore((state) => state.items);

  return (
    <>
      {/* Improved lighting for better model visibility */}
      <ambientLight intensity={0.8} />
      <directionalLight position={[10, 10, 5]} intensity={1.5} castShadow />
      <directionalLight position={[-10, 10, -5]} intensity={1} />
      <directionalLight position={[0, 10, 0]} intensity={1.2} />
      
      <Grid infiniteGrid position={[0, -0.01, 0]} />
      
      <KitchenBoundary />
      
      {items.map((item) => (
        <KitchenItem key={item.id} item={item} />
      ))}
      
      <OrbitControls />
      <ModelLoader />
    </>
  );
}

function App() {
  const [showConfig, setShowConfig] = useState(true);
  const addItem = useKitchenStore((state) => state.addItem);
  const boundary = useKitchenStore((state) => state.boundary);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const type = e.dataTransfer.getData('text/plain') as KitchenItem['type'];
    
    if (!type) return;

    const canvasRect = canvasRef.current?.getBoundingClientRect();
    if (!canvasRect) return;

    // Convert screen coordinates to normalized device coordinates
    const x = ((e.clientX - canvasRect.left) / canvasRect.width) * 2 - 1;
    const z = ((e.clientY - canvasRect.top) / canvasRect.height) * 2 - 1;

    // Scale to world coordinates within boundary limits
    const worldX = THREE.MathUtils.clamp(
      x * boundary.width / 2,
      -boundary.width / 2 + 0.3,
      boundary.width / 2 - 0.3
    );
    const worldZ = THREE.MathUtils.clamp(
      z * boundary.depth / 2,
      -boundary.depth / 2 + 0.3,
      boundary.depth / 2 - 0.3
    );

    const colors = {
      cabinet: '#8B4513',
      countertop: '#808080',
      appliance: '#C0C0C0',
    };

    // Set appropriate Y position based on item type
    const yPos = type === 'countertop' ? 0.9 : 0;

    // Set appropriate dimensions based on item type
    let dimensions = {
      width: 0.6,
      height: 0.8,
      depth: 0.6
    };

    if (type === 'appliance') {
      dimensions = {
        width: 0.9,
        height: 1.8,
        depth: 0.7
      };
    } else if (type === 'countertop') {
      dimensions = {
        width: 0.6,
        height: 0.04,
        depth: 0.6
      };
    }

    addItem({
      id: Math.random().toString(36).substr(2, 9),
      type,
      position: [worldX, yPos, worldZ],
      rotation: [0, 0, 0],
      scale: [1, 1, 1],
      color: colors[type],
      dimensions,
    });
  };

  return (
    <div 
      className="w-full h-screen"
      onDragOver={handleDragOver}
      onDrop={handleDrop}
    >
      <Canvas
        ref={canvasRef}
        camera={{ position: [5, 5, 5], fov: 75 }}
        className="w-full h-full bg-gray-900"
        shadows
        gl={{ 
          antialias: true,
          outputEncoding: THREE.sRGBEncoding,
          toneMapping: THREE.ACESFilmicToneMapping,
          toneMappingExposure: 1.0
        }}
      >
        <Suspense fallback={null}>
          <Scene />
        </Suspense>
      </Canvas>
      <Loader />
      <Controls />
      <ItemsDrawer onSelectItem={() => {}} />
      {showConfig && <LayoutConfig onComplete={() => setShowConfig(false)} />}
    </div>
  );
}

export default App;