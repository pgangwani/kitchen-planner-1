import React, { useRef } from 'react';
import { PivotControls, Html } from '@react-three/drei';
import { KitchenItem as KitchenItemType } from '../types';
import * as THREE from 'three';
import { createPlaceholderModel } from './PlaceholderModels';

interface Props {
  item: KitchenItemType;
  isDragging: boolean;
  showDimensions: boolean;
  isSelected: boolean;
  onDrag: (matrix: THREE.Matrix4, deltaMatrix: THREE.Matrix4) => void;
  onDragStart: () => void;
  onDragEnd: () => void;
  onClick: (e: THREE.Event) => void;
}

// This component renders a fallback 3D model when GLB files aren't available
export function FallbackKitchenItem({ 
  item, 
  isDragging, 
  showDimensions, 
  isSelected,
  onDrag,
  onDragStart,
  onDragEnd,
  onClick
}: Props) {
  const groupRef = useRef<THREE.Group>(null);
  
  // Create a placeholder model based on item type
  const model = createPlaceholderModel(
    item.type, 
    item.dimensions, 
    isSelected ? '#ff9999' : item.color
  );

  return (
    <PivotControls
      visible={isSelected}
      scale={0.75}
      anchor={[0, -1, 0]}
      onDrag={onDrag}
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
      autoTransform={false}
    >
      <group
        ref={groupRef}
        position={item.position}
        rotation={item.rotation as [number, number, number]}
        onClick={onClick}
      >
        <primitive object={model} />
        
        {(showDimensions || isDragging) && (
          <Html position={[0, item.dimensions.height / 2, 0]}>
            <div className="bg-black/75 text-white px-2 py-1 rounded text-sm whitespace-nowrap">
              {item.type} ({item.dimensions.width}m × {item.dimensions.height}m × {item.dimensions.depth}m)
            </div>
          </Html>
        )}
      </group>
    </PivotControls>
  );
}