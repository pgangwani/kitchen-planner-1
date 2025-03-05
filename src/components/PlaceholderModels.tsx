import React from 'react';
import * as THREE from 'three';

// This component creates placeholder 3D models when real GLB files aren't available
export function createPlaceholderModel(type: 'cabinet' | 'countertop' | 'appliance', dimensions: { width: number; height: number; depth: number }, color: string) {
  const group = new THREE.Group();
  
  switch (type) {
    case 'cabinet': {
      // Create a basic cabinet with doors
      const body = new THREE.Mesh(
        new THREE.BoxGeometry(dimensions.width, dimensions.height, dimensions.depth),
        new THREE.MeshStandardMaterial({ 
          color,
          roughness: 0.7,
          metalness: 0.1
        })
      );
      
      // Door
      const doorWidth = dimensions.width * 0.9;
      const doorHeight = dimensions.height * 0.9;
      const door = new THREE.Mesh(
        new THREE.BoxGeometry(doorWidth, doorHeight, 0.02),
        new THREE.MeshStandardMaterial({ 
          color: new THREE.Color(color).multiplyScalar(0.9),
          roughness: 0.5,
          metalness: 0.1
        })
      );
      door.position.set(0, 0, dimensions.depth / 2 + 0.01);
      
      // Handle
      const handle = new THREE.Mesh(
        new THREE.CylinderGeometry(0.01, 0.01, 0.1, 8),
        new THREE.MeshStandardMaterial({ 
          color: '#c0c0c0',
          roughness: 0.3,
          metalness: 0.8
        })
      );
      handle.rotation.set(0, 0, Math.PI / 2);
      handle.position.set(doorWidth * 0.3, 0, dimensions.depth / 2 + 0.03);
      
      // Enable shadows
      body.castShadow = true;
      body.receiveShadow = true;
      door.castShadow = true;
      handle.castShadow = true;
      
      group.add(body, door, handle);
      break;
    }
    
    case 'countertop': {
      // Create a basic countertop
      const top = new THREE.Mesh(
        new THREE.BoxGeometry(dimensions.width, dimensions.height, dimensions.depth),
        new THREE.MeshStandardMaterial({ 
          color, 
          roughness: 0.3,
          metalness: 0.2
        })
      );
      
      // Add a subtle texture pattern
      const edges = new THREE.EdgesGeometry(top.geometry);
      const line = new THREE.LineSegments(
        edges,
        new THREE.LineBasicMaterial({ color: new THREE.Color(color).multiplyScalar(0.8) })
      );
      
      // Enable shadows
      top.castShadow = true;
      top.receiveShadow = true;
      
      group.add(top, line);
      break;
    }
    
    case 'appliance': {
      // Create a basic refrigerator
      const body = new THREE.Mesh(
        new THREE.BoxGeometry(dimensions.width, dimensions.height, dimensions.depth),
        new THREE.MeshStandardMaterial({ 
          color, 
          roughness: 0.2,
          metalness: 0.8
        })
      );
      
      // Door divider (for double-door fridge)
      const divider = new THREE.Mesh(
        new THREE.BoxGeometry(0.01, dimensions.height * 0.98, 0.01),
        new THREE.MeshStandardMaterial({ color: '#aaaaaa' })
      );
      divider.position.set(0, 0, dimensions.depth / 2 + 0.01);
      
      // Upper door
      const upperDoor = new THREE.Mesh(
        new THREE.BoxGeometry(dimensions.width * 0.98, dimensions.height * 0.6, 0.02),
        new THREE.MeshStandardMaterial({ 
          color: new THREE.Color(color).multiplyScalar(0.95),
          roughness: 0.2,
          metalness: 0.9
        })
      );
      upperDoor.position.set(0, dimensions.height * 0.2, dimensions.depth / 2 + 0.02);
      
      // Lower door
      const lowerDoor = new THREE.Mesh(
        new THREE.BoxGeometry(dimensions.width * 0.98, dimensions.height * 0.35, 0.02),
        new THREE.MeshStandardMaterial({ 
          color: new THREE.Color(color).multiplyScalar(0.95),
          roughness: 0.2,
          metalness: 0.9
        })
      );
      lowerDoor.position.set(0, -dimensions.height * 0.315, dimensions.depth / 2 + 0.02);
      
      // Handles
      const upperHandle = new THREE.Mesh(
        new THREE.CylinderGeometry(0.01, 0.01, 0.3, 8),
        new THREE.MeshStandardMaterial({ 
          color: '#c0c0c0',
          roughness: 0.3,
          metalness: 0.8
        })
      );
      upperHandle.rotation.set(0, 0, Math.PI / 2);
      upperHandle.position.set(-dimensions.width * 0.4, dimensions.height * 0.2, dimensions.depth / 2 + 0.04);
      
      const lowerHandle = new THREE.Mesh(
        new THREE.CylinderGeometry(0.01, 0.01, 0.3, 8),
        new THREE.MeshStandardMaterial({ 
          color: '#c0c0c0',
          roughness: 0.3,
          metalness: 0.8
        })
      );
      lowerHandle.rotation.set(0, 0, Math.PI / 2);
      lowerHandle.position.set(-dimensions.width * 0.4, -dimensions.height * 0.315, dimensions.depth / 2 + 0.04);
      
      // Enable shadows
      body.castShadow = true;
      body.receiveShadow = true;
      upperDoor.castShadow = true;
      lowerDoor.castShadow = true;
      upperHandle.castShadow = true;
      lowerHandle.castShadow = true;
      
      group.add(body, divider, upperDoor, lowerDoor, upperHandle, lowerHandle);
      break;
    }
  }
  
  return group;
}