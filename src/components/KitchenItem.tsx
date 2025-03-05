import React, { useRef, useState, useEffect } from 'react';
import { PivotControls, Html, useGLTF } from '@react-three/drei';
import { KitchenItem as KitchenItemType } from '../types';
import { useKitchenStore } from '../store';
import * as THREE from 'three';
import { FallbackKitchenItem } from './FallbackKitchenItem';

interface Props {
  item: KitchenItemType;
}

export function KitchenItem({ item }: Props) {
  const setSelectedItem = useKitchenStore((state) => state.setSelectedItem);
  const selectedItemId = useKitchenStore((state) => state.selectedItemId);
  const updateItem = useKitchenStore((state) => state.updateItem);
  const boundary = useKitchenStore((state) => state.boundary);
  
  const [isDragging, setIsDragging] = useState(false);
  const [showDimensions, setShowDimensions] = useState(false);
  const [modelError, setModelError] = useState(false);
  const groupRef = useRef<THREE.Group>(null);
  
  // Path to the GLB model - use the correct path based on type
  let modelPath = '';
  if (item.type === 'appliance') {
    modelPath = '/models/refrigerator.glb';
  } else {
    modelPath = `/models/${item.type}.glb`;
  }
  
  // Try to load the model, but catch errors
  let gltf;
  try {
    gltf = useGLTF(modelPath);
  } catch (error) {
    console.error(`Error loading model: ${modelPath}`, error);
    if (!modelError) setModelError(true);
  }

  const handleDrag = (_matrix: THREE.Matrix4, deltaMatrix: THREE.Matrix4) => {
    const position = new THREE.Vector3();
    const rotation = new THREE.Quaternion();
    const scale = new THREE.Vector3();
    deltaMatrix.decompose(position, rotation, scale);

    const newX = Math.max(
      -boundary.width / 2 + item.dimensions.width / 2,
      Math.min(boundary.width / 2 - item.dimensions.width / 2, item.position[0] + position.x)
    );
    
    const newZ = Math.max(
      -boundary.depth / 2 + item.dimensions.depth / 2,
      Math.min(boundary.depth / 2 - item.dimensions.depth / 2, item.position[2] + position.z)
    );

    // Extract rotation in radians around Y axis
    const euler = new THREE.Euler().setFromQuaternion(rotation);
    const currentRotation = new THREE.Euler().fromArray([...item.rotation]);
    const newRotation = [
      currentRotation.x,
      currentRotation.y + euler.y,
      currentRotation.z
    ] as [number, number, number];

    updateItem(item.id, {
      ...item,
      position: [newX, item.position[1], newZ],
      rotation: newRotation,
    });
  };

  const handleClick = (e: THREE.Event) => {
    e.stopPropagation();
    if (!isDragging) {
      setSelectedItem(item.id);
      setShowDimensions(true);
    }
  };

  const isSelected = selectedItemId === item.id;

  // If model loading failed, use the fallback component
  if (modelError) {
    console.warn(`Using fallback for ${item.type} model`);
    return (
      <FallbackKitchenItem
        item={item}
        isDragging={isDragging}
        showDimensions={showDimensions}
        isSelected={isSelected}
        onDrag={handleDrag}
        onDragStart={() => {
          setIsDragging(true);
          setShowDimensions(true);
        }}
        onDragEnd={() => {
          setIsDragging(false);
          setTimeout(() => setShowDimensions(false), 2000);
        }}
        onClick={handleClick}
      />
    );
  }

  // If we have a model, use it
  if (gltf) {
    // Clone the scene to avoid sharing issues
    const model = gltf.scene.clone();
    
    // Scale and position the model
    useEffect(() => {
      if (model) {
        // Calculate bounding box of the model
        const box = new THREE.Box3().setFromObject(model);
        const size = box.getSize(new THREE.Vector3());
        
        // Calculate scale factors to match desired dimensions
        const scaleX = item.dimensions.width / (size.x || 1);
        const scaleY = item.dimensions.height / (size.y || 1);
        const scaleZ = item.dimensions.depth / (size.z || 1);
        
        // Apply scale to the model
        model.scale.set(scaleX, scaleY, scaleZ);
        
        // Center the model horizontally and place it on the floor
        const center = box.getCenter(new THREE.Vector3());
        model.position.x = -center.x * scaleX;
        model.position.z = -center.z * scaleZ;
        
        // Adjust vertical position based on item type
        if (item.type === 'countertop') {
          // Place countertops at their specified height
          model.position.y = -center.y * scaleY;
        } else {
          // Place other items on the floor
          model.position.y = -box.min.y * scaleY;
        }
      }
    }, [model, item.dimensions, item.type]);

    // Fix materials and lighting
    useEffect(() => {
      if (model) {
        // Add lights to the model to ensure it's properly lit
        const light = new THREE.DirectionalLight(0xffffff, 1);
        light.position.set(1, 1, 1);
        model.add(light);
        
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
        model.add(ambientLight);
        
        // Process all materials in the model
        model.traverse((child) => {
          if (child instanceof THREE.Mesh) {
            // Ensure materials are properly configured
            if (Array.isArray(child.material)) {
              child.material = child.material.map(mat => {
                const newMat = mat.clone();
                
                // Preserve original textures if they exist
                if (newMat.map) {
                  newMat.map.needsUpdate = true;
                  // Ensure texture settings are correct
                  newMat.map.encoding = THREE.sRGBEncoding;
                  newMat.map.flipY = false;
                }
                
                // Only tint the material if no texture exists
                if (!newMat.map) {
                  newMat.color.set(isSelected ? '#ff9999' : item.color);
                }
                
                // Ensure material is visible and properly lit
                newMat.transparent = isDragging;
                newMat.opacity = isDragging ? 0.7 : 1;
                newMat.needsUpdate = true;
                newMat.side = THREE.DoubleSide; // Render both sides
                
                // Improve material rendering
                newMat.roughness = 0.7;
                newMat.metalness = 0.3;
                
                return newMat;
              });
            } else if (child.material) {
              const newMat = child.material.clone();
              
              // Preserve original textures if they exist
              if (newMat.map) {
                newMat.map.needsUpdate = true;
                // Ensure texture settings are correct
                newMat.map.encoding = THREE.sRGBEncoding;
                newMat.map.flipY = false;
              }
              
              // Only tint the material if no texture exists
              if (!newMat.map) {
                newMat.color.set(isSelected ? '#ff9999' : item.color);
              }
              
              // Ensure material is visible and properly lit
              newMat.transparent = isDragging;
              newMat.opacity = isDragging ? 0.7 : 1;
              newMat.needsUpdate = true;
              newMat.side = THREE.DoubleSide; // Render both sides
              
              // Improve material rendering
              newMat.roughness = 0.7;
              newMat.metalness = 0.3;
              
              child.material = newMat;
            }
            
            // Enable shadows
            child.castShadow = true;
            child.receiveShadow = true;
          }
        });
      }
    }, [model, isSelected, isDragging, item.color]);

    return (
      <PivotControls
        visible={isSelected}
        scale={0.75}
        anchor={[0, -1, 0]}
        onDrag={handleDrag}
        onDragStart={() => {
          setIsDragging(true);
          setShowDimensions(true);
        }}
        onDragEnd={() => {
          setIsDragging(false);
          setTimeout(() => setShowDimensions(false), 2000);
        }}
        autoTransform={false}
      >
        <group
          ref={groupRef}
          position={item.position}
          rotation={item.rotation as [number, number, number]}
          onClick={handleClick}
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

  // If model is still loading, show a fallback
  return (
    <FallbackKitchenItem
      item={item}
      isDragging={isDragging}
      showDimensions={showDimensions}
      isSelected={isSelected}
      onDrag={handleDrag}
      onDragStart={() => {
        setIsDragging(true);
        setShowDimensions(true);
      }}
      onDragEnd={() => {
        setIsDragging(false);
        setTimeout(() => setShowDimensions(false), 2000);
      }}
      onClick={handleClick}
    />
  );
}

// Preload models to improve performance
useGLTF.preload('/models/refrigerator.glb');
useGLTF.preload('/models/cabinet.glb');
useGLTF.preload('/models/countertop.glb');