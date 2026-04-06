import { useState, useEffect } from 'react';
import { PalletDisplay } from './components/PalletDisplay';
import { DisplayBranding, PlacedProduct, GhostProduct, CameraPreset } from './types';

export default function App() {
  const [cameraPreset, setCameraPreset] = useState<CameraPreset>('isometric');
  const [selectedProductId, setSelectedProductId] = useState<string | null>(null);

  const branding: DisplayBranding = {
    lipText: "HOLIDAY SPECIAL",
    lipTextColor: "#FFFFFF",
    headerText: "FESTIVE\nDEALS",
    headerTextColor: "#FFFFFF",
    headerBackgroundColor: "#EF4444", // Red header
  };

  const placedProducts: PlacedProduct[] = [
    {
      id: "prod-1",
      slotId: "tier-0-12",
      width: 5,
      height: 12,
      depth: 5,
      color: "#F59E0B",
      label: "Sparkling Cider",
      sku: "CIDER-750"
    },
    {
      id: "prod-2",
      slotId: "tier-0-13",
      width: 5,
      height: 12,
      depth: 5,
      color: "#F59E0B",
      label: "Sparkling Cider",
      sku: "CIDER-750"
    },
    {
      id: "prod-3",
      slotId: "tier-1-8",
      width: 4,
      height: 8,
      depth: 4,
      color: "#10B981",
      label: "Mixed Nuts",
      sku: "NUTS-500"
    },
    {
      id: "prod-4",
      slotId: "tier-2-4",
      width: 3,
      height: 6,
      depth: 3,
      color: "#8B5CF6",
      label: "Chocolates",
      sku: "CHOC-250"
    }
  ];

  const ghostProduct: GhostProduct = {
    slotId: "tier-1-9",
    width: 4,
    height: 8,
    depth: 4,
    isValid: true,
    label: "Place Here"
  };

  // Cycle camera presets for demonstration
  useEffect(() => {
    const presets: CameraPreset[] = ['isometric', 'front', 'side', 'top'];
    let currentIndex = 0;
    
    const interval = setInterval(() => {
      currentIndex = (currentIndex + 1) % presets.length;
      setCameraPreset(presets[currentIndex]);
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  return (
    <main className="w-full h-screen overflow-hidden bg-gray-100">
      <PalletDisplay 
        branding={branding}
        placedProducts={placedProducts}
        ghostProduct={ghostProduct}
        selectedProductId={selectedProductId}
        onProductClick={(id) => setSelectedProductId(id === selectedProductId ? null : id)}
        cameraPreset={cameraPreset}
        lipColor="#1E3A8A" // Dark blue lips
      />
    </main>
  );
}
