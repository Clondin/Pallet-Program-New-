export interface DisplayBranding {
  lipText?: string;        // e.g., "ALL YOUR HOLIDAY NEEDS"
  lipTextColor?: string;   // default "#FFFFFF"
  headerText?: string;     // e.g., "Rosh Hashanah"
  headerTextColor?: string; // default "#FFFFFF"  
  headerBackgroundColor?: string; // default uses cardboard color
}

export interface GhostProduct {
  slotId: string;          // "tierId-slotIndex"
  width: number;           // product case width in inches
  height: number;          // product case height
  depth: number;           // product case depth
  color: string;           // brand color hex
  label?: string;          // product name to show on the box
  isValid: boolean;        // green if valid, red if invalid
}

export interface PlacedProduct {
  id: string;              // unique placement ID
  slotId: string;          // "tierId-slotIndex"  
  width: number;           // case dimensions
  height: number;
  depth: number;
  color: string;           // brand color
  label: string;           // product name
  sku: string;             // SKU code
}

export type CameraPreset = 'front' | 'side' | 'top' | 'isometric';

export interface PalletDisplayProps {
  // Configuration
  tierCount?: number; // 2-6, default 4
  palletDimensions?: { width: number; depth: number; height: number }; // default 48×40×6
  maxDisplayHeight?: number; // inches, default 60

  // Branding
  lipColor?: string; // hex, default "#3B7DD8"
  branding?: DisplayBranding;

  // Products
  placedProducts?: PlacedProduct[];
  ghostProduct?: GhostProduct | null;
  selectedProductId?: string | null;

  // Interaction callbacks
  onSlotClick?: (tierId: number, slotIndex: number, position: [number, number, number]) => void;
  onSlotHover?: (tierId: number, slotIndex: number, position: [number, number, number]) => void;
  onSlotHoverEnd?: () => void;
  onProductClick?: (productId: string) => void;

  // Camera
  autoRotate?: boolean; // default false
  initialCameraPosition?: [number, number, number];
  cameraPreset?: CameraPreset;
  onCameraPresetChange?: (preset: CameraPreset) => void;

  // Display
  showSlotGrid?: boolean; // default true
  showHeader?: boolean; // default true
  environment?: 'retail' | 'studio' | 'clean'; // default 'retail'
}

export interface TierConfig {
  id: number;
  width: number;
  depth: number;
  height: number;
  shelfDepth: number;
  trayHeight: number;
  yOffset: number;
  slotGridSize: number;
}

