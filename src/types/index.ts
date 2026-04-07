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
  imageUrl?: string;       // product image URL
}

export type CameraPreset = 'front' | 'side' | 'top' | 'isometric';
export type DisplayEnvironment = 'retail' | 'studio' | 'clean'

export interface PalletDisplayProps {
  // Configuration
  tierCount?: number; // 2-6, default 4
  palletType?: PalletType; // 'full' | 'half', default 'full'
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
  environment?: DisplayEnvironment; // default 'retail'
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

export type Brand = 'tuscanini' | 'kedem' | 'gefen' | 'liebers' | 'haddar' | 'osem'

export type Holiday = 'rosh-hashanah' | 'pesach' | 'sukkos' | 'none'

export type PalletType = 'full' | 'half'

export type ViewMode = '2d' | '3d'

export type TrayFace = 'front' | 'back' | 'left' | 'right'

export interface Product {
  id: string
  name: string
  sku: string
  brand: Brand
  brandColor: string
  category: string
  width: number
  height: number
  depth: number
  weight: number
  imageUrl?: string
  holidayTags: Holiday[]
}

export type RetailerStatus = 'active' | 'pending' | 'inactive'

export type RetailerTier = 'enterprise' | 'premium' | 'standard'

export interface RetailerContact {
  id: string
  name: string
  title: string
  email: string
  phone: string
  isPrimary: boolean
}

export interface AuthorizedItem {
  productId: string
  productName: string
  sku: string
  brand: Brand
  status: 'authorized' | 'pending' | 'discontinued'
  authorizedDate: string
  lastOrderDate?: string
  avgMonthlyUnits: number
  marginPercent: number
}

export interface ComplianceRecord {
  id: string
  requirement: string
  status: 'compliant' | 'action-required' | 'pending-review'
  lastAuditDate: string
  nextAuditDate: string
  notes?: string
}

export interface RetailerPerformance {
  totalRevenueMTD: number
  totalRevenueYTD: number
  avgOrderValue: number
  fillRate: number
  onTimeDelivery: number
  returnRate: number
  displayComplianceScore: number
}

export interface DisplayHistoryEntry {
  id: string
  projectName: string
  holiday: Holiday
  createdAt: string
  status: 'active' | 'completed' | 'draft'
  tierCount: number
  productCount: number
}

export interface Retailer {
  id: string
  name: string
  logo?: string
  status: RetailerStatus
  tier: RetailerTier
  defaultTierCount: number
  maxDisplayHeight: number
  palletDimensions: { width: number; depth: number; height: number }
  notes?: string
  // Extended fields
  storeCount: number
  regions: string[]
  headquartersCity: string
  headquartersState: string
  accountManager: string
  contractStart: string
  contractEnd: string
  website: string
  contacts: RetailerContact[]
  authorizedItems: AuthorizedItem[]
  compliance: ComplianceRecord[]
  performance: RetailerPerformance
  displayHistory: DisplayHistoryEntry[]
  tags: string[]
}

export interface PalletWizardConfig {
  palletType: PalletType
  season: Holiday
  retailerId: string
}

export interface DisplayProject {
  id: string
  name: string
  retailerId: string
  holiday: Holiday
  season: Holiday
  tierCount: number
  palletType: PalletType
  lipColor: string
  branding: DisplayBranding
  placements: PlacedProduct[]
  createdAt: number
  updatedAt: number
}

export interface SlotGridItem {
  slotId: string
  tierId: number
  slotIndex: number
  face: TrayFace
  row: number
  col: number
  position: [number, number, number]
  width: number
  depth: number
}
