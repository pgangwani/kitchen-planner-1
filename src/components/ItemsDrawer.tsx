import React, { useState } from 'react';
import { ChevronRight, ChevronLeft, Refrigerator, Box, Square } from 'lucide-react';
import { KitchenItem } from '../types';
import { useKitchenStore } from '../store';

interface Props {
  onSelectItem: (type: KitchenItem['type'], position: { x: number, y: number }) => void;
}

interface ItemCategory {
  title: string;
  items: {
    name: string;
    type: KitchenItem['type'];
    icon: React.ReactNode;
    description: string;
    defaultDimensions: {
      width: number;
      height: number;
      depth: number;
    };
    modelPath: string;
  }[];
}

// Simplified to only include the 3 items with GLB models
const categories: ItemCategory[] = [
  {
    title: 'Kitchen Items',
    items: [
      {
        name: 'Refrigerator',
        type: 'appliance',
        icon: <Refrigerator className="w-8 h-8" />,
        description: 'Standard size refrigerator',
        defaultDimensions: { width: 0.9, height: 1.8, depth: 0.7 },
        modelPath: '/models/refrigerator.glb'
      },
      {
        name: 'Cabinet',
        type: 'cabinet',
        icon: <Box className="w-8 h-8" />,
        description: 'Standard base cabinet',
        defaultDimensions: { width: 0.6, height: 0.8, depth: 0.6 },
        modelPath: '/models/cabinet.glb'
      },
      {
        name: 'Countertop',
        type: 'countertop',
        icon: <Square className="w-8 h-2" />,
        description: 'Standard kitchen countertop',
        defaultDimensions: { width: 0.6, height: 0.04, depth: 0.6 },
        modelPath: '/models/countertop.glb'
      }
    ]
  }
];

export function ItemsDrawer({ onSelectItem }: Props) {
  const [isOpen, setIsOpen] = useState(true);
  const [draggedItem, setDraggedItem] = useState<KitchenItem['type'] | null>(null);

  const handleDragStart = (e: React.DragEvent, type: KitchenItem['type']) => {
    e.dataTransfer.setData('text/plain', type);
    setDraggedItem(type);
  };

  const handleDragEnd = () => {
    setDraggedItem(null);
  };

  return (
    <div 
      className={`fixed left-0 top-1/2 -translate-y-1/2 bg-white/90 backdrop-blur-sm rounded-r-xl shadow-lg transition-transform duration-300 ${
        isOpen ? 'translate-x-0' : '-translate-x-full'
      }`}
    >
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-full bg-white/90 backdrop-blur-sm p-2 rounded-r-xl shadow-lg"
      >
        {isOpen ? <ChevronLeft /> : <ChevronRight />}
      </button>

      <div className="w-80 max-h-[80vh] overflow-y-auto p-4">
        <h2 className="text-xl font-bold mb-4">Kitchen Items</h2>
        
        {categories.map((category, index) => (
          <div key={index} className="mb-6">
            <h3 className="text-lg font-semibold mb-3">{category.title}</h3>
            <div className="space-y-2">
              {category.items.map((item, itemIndex) => (
                <div
                  key={itemIndex}
                  draggable
                  onDragStart={(e) => handleDragStart(e, item.type)}
                  onDragEnd={handleDragEnd}
                  className={`w-full flex items-center gap-3 p-3 rounded-lg hover:bg-black/5 transition-colors text-left group cursor-move ${
                    draggedItem === item.type ? 'opacity-50' : ''
                  }`}
                >
                  <div className="text-gray-700 group-hover:text-gray-900">
                    {item.icon}
                  </div>
                  <div>
                    <div className="font-medium">{item.name}</div>
                    <div className="text-sm text-gray-500">{item.description}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}