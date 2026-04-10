export interface DisplayBranding {
  lipText?: string;        // e.g., "ALL YOUR HOLIDAY NEEDS"
  lipTextColor?: string;   // default "#FFFFFF"
  headerText?: string;     // e.g., "Rosh Hashanah"
  headerTextColor?: string; // default "#FFFFFF"  
  headerBackgroundColor?: string; // default uses cardboard color
}

export interface ProductDimensions {
  width: number
  height: number
  depth: number
  source: 'manual' | 'calculated'
}

export type WallFace = TrayFace

export interface WallConfig {
  type: 'shelves' | 'branded-panel'
  gridColumns: number
}

export interface PalletConfig {
  base: {
    width: number
    depth: number
    height: number
  }
  maxWeight?: number
}

export interface PlacementSuggestion {
  type:
    | 'alternative-position'
    | 'alternative-tier'
    | 'alternative-wall'
    | 'rotate'
    | 'reduce-quantity'
  message: string
  wall?: WallFace
  tier?: number
  gridCol?: number
  displayMode?: 'face-out' | 'spine-out'
  maxQuantity?: number
  priority: number
}

export interface FullValidationResult {
  valid: boolean
  errors: Array<{ rule: string; reason: string }>
  warnings: Array<{ rule: string; reason: string }>
  suggestions: PlacementSuggestion[]
}

export interface GhostProduct {
  slotId: string;          // "tierId-slotIndex"
  width: number;           // product case width in inches
  height: number;          // product case height
  depth: number;           // product case depth
  color: string;           // brand color hex
  label?: string;          // product name to show on the box
  isValid: boolean;        // green if valid, red if invalid
  worldPosition?: [number, number, number]
  rotation?: [number, number, number]
  errorReason?: string
  suggestions?: PlacementSuggestion[]
  suggestionMarkers?: Array<{
    position: [number, number, number]
    message: string
  }>
}

export type PackagingType = 'box' | 'bottle' | 'jar' | 'bag' | 'tin' | 'pouch'

export interface CaseConfig {
  unitProductId: string
  layout: {
    cols: number
    rows: number
    layers: number
  }
  caseStyle: 'open-top' | 'closed' | 'tray'
  innerPadding: number
  dividers: boolean
  dimensionOverride?: Partial<ProductDimensions>
}

export interface PlacedProduct {
  id: string;              // unique placement ID
  sourceProductId?: string; // original catalog product ID
  slotId: string;          // "tierId-slotIndex"
  width: number;           // case dimensions
  height: number;
  depth: number;
  color: string;           // brand color
  label: string;           // product name
  sku: string;             // SKU code
  category?: string;
  imageUrl?: string;       // product image URL (Tier 1)
  modelUrl?: string;       // .glb model URL (Tier 3)
  packaging?: PackagingType; // packaging type for scaling strategy
  caseConfig?: CaseConfig;
  orientation?: number;    // index into ORIENTATION_PRESETS (0-5)
  wall?: WallFace
  tier?: number
  gridCol?: number
  colSpan?: number
  quantity?: number
  displayMode?: 'face-out' | 'spine-out'
  renderStyle?: 'single' | 'facing-row' | 'deep-stock' | 'stepped-stack' | 'case'
  facings?: number
  rows?: number
  layers?: number
  merchGap?: number
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
  onRotateProduct?: (productId: string) => void;
  onDeleteProduct?: (productId: string) => void;

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

export type UnitSystem = 'imperial' | 'metric'

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
  modelUrl?: string
  packaging?: PackagingType
  variantType?: 'single' | 'case'
  parentProductId?: string
  autoGeneratedCase?: boolean
  caseConfig?: CaseConfig
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
