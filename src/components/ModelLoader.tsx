import React, { useEffect } from 'react';
import { useGLTF } from '@react-three/drei';

// This component preloads all models when the app starts
export function ModelLoader() {
  useEffect(() => {
    // Preload all models
    const modelPaths = [
      '/models/refrigerator.glb',
      '/models/cabinet.glb',
      '/models/countertop.glb'
    ];
    
    modelPaths.forEach(path => {
      try {
        useGLTF.preload(path);
      } catch (error) {
        console.error(`Failed to preload model: ${path}`, error);
      }
    });
    
    // Cleanup function
    return () => {
      modelPaths.forEach(path => {
        useGLTF.clear(path);
      });
    };
  }, []);
  
  return null; // This component doesn't render anything
}