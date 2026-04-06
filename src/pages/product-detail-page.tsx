import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import {
  ArrowLeft,
  ArrowUpRight,
  Boxes,
  Building2,
  CalendarDays,
  Package,
  PencilLine,
  Save,
  Scale,
  Sparkles,
  Tag,
  Trash2,
  X,
} from 'lucide-react'
import type { Brand, Holiday, Product } from '../types'
import { BRAND_COLORS } from '../lib/mock-data'
import { useCatalogStore } from '../stores/catalog-store'
import { useRetailerStore } from '../stores/retailer-store'

const BRANDS: Brand[] = ['tuscanini', 'kedem', 'gefen', 'liebers', 'haddar', 'osem']
const HOLIDAYS: Holiday[] = ['rosh-hashanah', 'pesach', 'sukkos', 'none']
const HOLIDAY_LABELS: Record<string, string> = {
  'rosh-hashanah': 'Rosh Hashanah',
  pesach: 'Pesach',
  sukkos: 'Sukkos',
  none: 'Year-round',
}
const HOLIDAY_COLORS: Record<string, { color: string; bg: string }> = {
  'rosh-hashanah': { color: '#166534', bg: '#dcfce7' },
  pesach: { color: '#1d4ed8', bg: '#dbeafe' },
  sukkos: { color: '#b45309', bg: '#fef3c7' },
  none: { color: '#475569', bg: '#e2e8f0' },
}
const dimensionFields = ['width', 'height', 'depth', 'weight'] as const

function getSeasonality(product: Product) {
  if (product.holidayTags.length === 0) {
    return 'Evergreen item with year-round merchandising flexibility.'
  }

  if (product.holidayTags.length === 1) {
    return `Seasonal driver aligned to ${HOLIDAY_LABELS[product.holidayTags[0]]}.`
  }

  return `Cross-season item used across ${product.holidayTags
    .map((holiday) => HOLIDAY_LABELS[holiday])
    .join(' and ')}.`
}

function getStackingGuidance(product: Product) {
  if (product.weight >= 4) {
    return 'Heavy case. Best suited for lower tiers or center-support positions.'
  }

  if (product.height >= 10) {
    return 'Tall case. Works best away from header sightlines and with stable neighboring items.'
  }

  if (product.width <= 3) {
    return 'Narrow footprint. Useful for filling gaps and balancing mixed-brand displays.'
  }

  return 'Standard case. Flexible placement across most shelf tiers.'
}

function getCaseVolume(product: Product) {
  return product.width * product.height * product.depth
}

export function ProductDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const product = useCatalogStore((s) => s.getProduct(id ?? ''))
  const products = useCatalogStore((s) => s.products)
  const updateProduct = useCatalogStore((s) => s.updateProduct)
  const deleteProduct = useCatalogStore((s) => s.deleteProduct)
  const retailers = useRetailerStore((s) => s.retailers)
  const [isEditing, setIsEditing] = useState(false)

  const [form, setForm] = useState(() => ({
    name: product?.name ?? '',
    sku: product?.sku ?? '',
    brand: product?.brand ?? ('tuscanini' as Brand),
    category: product?.category ?? '',
    width: product?.width ?? 0,
    height: product?.height ?? 0,
    depth: product?.depth ?? 0,
    weight: product?.weight ?? 0,
    holiday: product?.holidayTags[0] ?? ('none' as string),
  }))

  const retailerCoverage = useMemo(() => {
    if (!product) return []
    return retailers
      .map((retailer) => {
        const item = retailer.authorizedItems.find(
          (authorizedItem) => authorizedItem.productId === product.id
        )
        return item ? { retailer, item } : null
      })
      .filter(Boolean)
  }, [product, retailers]) as {
    retailer: (typeof retailers)[number]
    item: (typeof retailers)[number]['authorizedItems'][number]
  }[]

  const relatedProducts = useMemo(() => {
    if (!product) return []
    return products
      .filter((candidate) => candidate.id !== product.id)
      .filter(
        (candidate) =>
          candidate.brand === product.brand || candidate.category === product.category
      )
      .slice(0, 4)
  }, [product, products])

  const caseVolume = product ? getCaseVolume(product) : 0
  const density = product && caseVolume > 0 ? product.weight / caseVolume : 0

  useEffect(() => {
    if (!product) return
    setForm({
      name: product.name,
      sku: product.sku,
      brand: product.brand,
      category: product.category,
      width: product.width,
      height: product.height,
      depth: product.depth,
      weight: product.weight,
      holiday: product.holidayTags[0] ?? 'none',
    })
    setIsEditing(false)
  }, [product])

  if (!product) {
    return (
      <div className="px-10 py-16 max-w-5xl mx-auto">
        <div className="bg-white rounded-2xl border border-slate-200 p-10 text-center">
          <Package className="w-10 h-10 text-slate-300 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-slate-900">Product not found</h2>
          <p className="text-sm text-slate-500 mt-2 mb-5">
            This product may have been deleted from the catalog.
          </p>
          <button
            onClick={() => navigate('/catalog')}
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-slate-700 bg-slate-100 rounded-xl hover:bg-slate-200 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Catalog
          </button>
        </div>
      </div>
    )
  }

  const brandColor = BRAND_COLORS[product.brand]
  const primaryHoliday = product.holidayTags[0] ?? 'none'
  const holidayStyle = HOLIDAY_COLORS[primaryHoliday] ?? HOLIDAY_COLORS.none

  const handleReset = () => {
    setForm({
      name: product.name,
      sku: product.sku,
      brand: product.brand,
      category: product.category,
      width: product.width,
      height: product.height,
      depth: product.depth,
      weight: product.weight,
      holiday: product.holidayTags[0] ?? 'none',
    })
    setIsEditing(false)
  }

  const handleSave = () => {
    const holidayTags =
      form.holiday === 'none' ? [] : [form.holiday as Holiday]

    updateProduct(product.id, {
      name: form.name,
      sku: form.sku,
      brand: form.brand,
      brandColor: BRAND_COLORS[form.brand],
      category: form.category,
      width: form.width,
      height: form.height,
      depth: form.depth,
      weight: form.weight,
      holidayTags,
    })
    setIsEditing(false)
  }

  const handleDelete = () => {
    if (!window.confirm(`Delete "${product.name}" from the catalog?`)) return
    deleteProduct(product.id)
    navigate('/catalog')
  }

  return (
    <div className="px-10 py-10 max-w-[1500px] mx-auto">
      <button
        onClick={() => navigate('/catalog')}
        className="inline-flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-slate-800 transition-colors mb-6"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Catalog
      </button>

      <div className="grid grid-cols-1 xl:grid-cols-[1.25fr_0.85fr] gap-6">
        <div className="space-y-6">
          <section className="rounded-[28px] overflow-hidden bg-white border border-slate-200 shadow-sm">
            <div
              className="px-8 py-8"
              style={{
                background: `linear-gradient(135deg, ${brandColor} 0%, #171717 100%)`,
              }}
            >
              <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
                <div className="min-w-0">
                  <div className="flex items-center gap-3 mb-4 flex-wrap">
                    <span className="px-3 py-1 rounded-full bg-white/12 text-white text-[11px] font-semibold uppercase tracking-wider">
                      {product.brand}
                    </span>
                    <span
                      className="px-3 py-1 rounded-full text-[11px] font-semibold uppercase tracking-wider"
                      style={{
                        backgroundColor: 'rgba(255,255,255,0.9)',
                        color: holidayStyle.color,
                      }}
                    >
                      {HOLIDAY_LABELS[primaryHoliday]}
                    </span>
                  </div>
                  <h1 className="text-4xl font-black tracking-tight text-white max-w-3xl">
                    {product.name}
                  </h1>
                  <div className="flex items-center gap-4 mt-4 text-sm text-white/72 flex-wrap">
                    <span className="inline-flex items-center gap-1.5">
                      <Tag className="w-4 h-4" />
                      {product.sku}
                    </span>
                    <span className="inline-flex items-center gap-1.5">
                      <Boxes className="w-4 h-4" />
                      {product.category}
                    </span>
                    <span className="inline-flex items-center gap-1.5">
                      <Sparkles className="w-4 h-4" />
                      {getSeasonality(product)}
                    </span>
                  </div>
                </div>

                <div className="bg-black/20 rounded-3xl px-5 py-4 min-w-[220px]">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-white/45 mb-3">
                    Merchandising Snapshot
                  </p>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between gap-3">
                      <span className="text-white/60 text-sm">Retailers</span>
                      <span className="text-white font-bold">{retailerCoverage.length}</span>
                    </div>
                    <div className="flex items-center justify-between gap-3">
                      <span className="text-white/60 text-sm">Case Volume</span>
                      <span className="text-white font-bold">{caseVolume.toFixed(1)} in³</span>
                    </div>
                    <div className="flex items-center justify-between gap-3">
                      <span className="text-white/60 text-sm">Density</span>
                      <span className="text-white font-bold">{density.toFixed(3)} lb/in³</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-px bg-slate-200">
              {[
                { label: 'Width', value: `${product.width}"`, icon: ArrowUpRight },
                { label: 'Height', value: `${product.height}"`, icon: ArrowUpRight },
                { label: 'Depth', value: `${product.depth}"`, icon: ArrowUpRight },
                { label: 'Weight', value: `${product.weight} lb`, icon: Scale },
              ].map((item) => (
                <div key={item.label} className="bg-white px-6 py-5">
                  <item.icon className="w-4 h-4 text-slate-300 mb-3" />
                  <p className="text-[11px] font-semibold uppercase tracking-widest text-slate-400">
                    {item.label}
                  </p>
                  <p className="text-xl font-black text-slate-900 mt-1">{item.value}</p>
                </div>
              ))}
            </div>
          </section>

          <section className="bg-white rounded-3xl border border-slate-200 p-8">
            <div className="flex items-center justify-between gap-4 mb-6">
              <div>
                <h2 className="text-xl font-bold text-slate-900">Product Profile</h2>
                <p className="text-sm text-slate-500 mt-1">
                  Maintain core product data and merchandising metadata.
                </p>
              </div>
              <div className="flex items-center gap-2">
                {!isEditing ? (
                  <button
                    onClick={() => setIsEditing(true)}
                    className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-semibold text-white bg-slate-900 rounded-xl hover:bg-slate-700 transition-colors"
                  >
                    <PencilLine className="w-4 h-4" />
                    Edit Product
                  </button>
                ) : (
                  <>
                    <button
                      onClick={handleReset}
                      className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-semibold text-slate-600 bg-slate-100 rounded-xl hover:bg-slate-200 transition-colors"
                    >
                      <X className="w-4 h-4" />
                      Cancel
                    </button>
                    <button
                      onClick={handleSave}
                      className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-semibold text-white bg-blue-600 rounded-xl hover:bg-blue-700 transition-colors"
                    >
                      <Save className="w-4 h-4" />
                      Save Changes
                    </button>
                  </>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-2">
                  Product Name
                </label>
                <input
                  type="text"
                  disabled={!isEditing}
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full px-4 py-3 rounded-2xl border border-slate-200 bg-white disabled:bg-slate-50 disabled:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-2">
                  SKU
                </label>
                <input
                  type="text"
                  disabled={!isEditing}
                  value={form.sku}
                  onChange={(e) => setForm({ ...form, sku: e.target.value })}
                  className="w-full px-4 py-3 rounded-2xl border border-slate-200 bg-white font-mono disabled:bg-slate-50 disabled:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-2">
                  Brand
                </label>
                <select
                  disabled={!isEditing}
                  value={form.brand}
                  onChange={(e) => setForm({ ...form, brand: e.target.value as Brand })}
                  className="w-full px-4 py-3 rounded-2xl border border-slate-200 bg-white disabled:bg-slate-50 disabled:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 capitalize"
                >
                  {BRANDS.map((brand) => (
                    <option key={brand} value={brand} className="capitalize">
                      {brand}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-2">
                  Category
                </label>
                <input
                  type="text"
                  disabled={!isEditing}
                  value={form.category}
                  onChange={(e) => setForm({ ...form, category: e.target.value })}
                  className="w-full px-4 py-3 rounded-2xl border border-slate-200 bg-white disabled:bg-slate-50 disabled:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                />
              </div>

              {dimensionFields.map((field) => (
                <div key={field}>
                  <label className="block text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-2">
                    {field === 'weight'
                      ? 'Weight (lb)'
                      : `${field.charAt(0).toUpperCase() + field.slice(1)} (in)`}
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    disabled={!isEditing}
                    value={form[field]}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        [field]: parseFloat(e.target.value) || 0,
                      })
                    }
                    className="w-full px-4 py-3 rounded-2xl border border-slate-200 bg-white disabled:bg-slate-50 disabled:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  />
                </div>
              ))}

              <div className="md:col-span-2">
                <label className="block text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-2">
                  Holiday Alignment
                </label>
                <div className="flex flex-wrap gap-2">
                  {HOLIDAYS.map((holiday) => (
                    <button
                      key={holiday}
                      type="button"
                      disabled={!isEditing}
                      onClick={() => setForm({ ...form, holiday })}
                      className={`px-3 py-2 rounded-full text-sm font-semibold transition-colors ${
                        form.holiday === holiday
                          ? 'bg-slate-900 text-white'
                          : 'bg-slate-100 text-slate-600'
                      } disabled:opacity-60`}
                    >
                      {HOLIDAY_LABELS[holiday]}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </section>
        </div>

        <div className="space-y-6">
          <section className="bg-white rounded-3xl border border-slate-200 p-6">
            <h2 className="text-lg font-bold text-slate-900 mb-4">Placement Guidance</h2>
            <div className="space-y-4">
              <div className="rounded-2xl bg-slate-50 px-4 py-4">
                <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-2">
                  Shelf Guidance
                </p>
                <p className="text-sm text-slate-700 leading-relaxed">
                  {getStackingGuidance(product)}
                </p>
              </div>
              <div className="rounded-2xl bg-slate-50 px-4 py-4">
                <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-2">
                  Seasonal Positioning
                </p>
                <p className="text-sm text-slate-700 leading-relaxed">
                  {getSeasonality(product)}
                </p>
              </div>
              <div className="rounded-2xl bg-slate-50 px-4 py-4">
                <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-2">
                  Packaging Footprint
                </p>
                <p className="text-sm text-slate-700 leading-relaxed">
                  Occupies {caseVolume.toFixed(1)} cubic inches with a density profile of{' '}
                  {density.toFixed(3)} lb/in³.
                </p>
              </div>
            </div>
          </section>

          <section className="bg-white rounded-3xl border border-slate-200 p-6">
            <div className="flex items-center gap-2 mb-4">
              <Building2 className="w-4 h-4 text-slate-400" />
              <h2 className="text-lg font-bold text-slate-900">Retailer Coverage</h2>
            </div>

            {retailerCoverage.length === 0 ? (
              <div className="rounded-2xl bg-slate-50 px-4 py-5 text-sm text-slate-500">
                This SKU is not yet authorized in any retailer accounts.
              </div>
            ) : (
              <div className="space-y-3">
                {retailerCoverage.map(({ retailer, item }) => (
                  <div
                    key={retailer.id}
                    className="rounded-2xl border border-slate-200 px-4 py-4"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="text-sm font-bold text-slate-900">{retailer.name}</p>
                        <p className="text-xs text-slate-500 mt-1">
                          {item.status} · avg monthly units {item.avgMonthlyUnits.toLocaleString()}
                        </p>
                      </div>
                      <span className="text-xs font-semibold text-slate-500">
                        {item.marginPercent}% margin
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>

          <section className="bg-white rounded-3xl border border-slate-200 p-6">
            <div className="flex items-center gap-2 mb-4">
              <CalendarDays className="w-4 h-4 text-slate-400" />
              <h2 className="text-lg font-bold text-slate-900">Related Products</h2>
            </div>

            {relatedProducts.length === 0 ? (
              <div className="rounded-2xl bg-slate-50 px-4 py-5 text-sm text-slate-500">
                No related products found in this catalog yet.
              </div>
            ) : (
              <div className="space-y-3">
                {relatedProducts.map((related) => (
                  <button
                    key={related.id}
                    onClick={() => navigate(`/catalog/${related.id}`)}
                    className="w-full text-left rounded-2xl border border-slate-200 px-4 py-4 hover:bg-slate-50 transition-colors"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="text-sm font-bold text-slate-900">{related.name}</p>
                        <p className="text-xs text-slate-500 mt-1">
                          {related.brand} · {related.category}
                        </p>
                      </div>
                      <span className="text-xs font-semibold text-slate-400">
                        {related.width}" × {related.height}" × {related.depth}"
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </section>

          <section className="bg-white rounded-3xl border border-red-100 p-6">
            <h2 className="text-lg font-bold text-slate-900 mb-3">Danger Zone</h2>
            <p className="text-sm text-slate-500 mb-4">
              Remove this SKU from the catalog if it should no longer be merchandised.
            </p>
            <button
              onClick={handleDelete}
              className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-semibold text-red-600 bg-red-50 rounded-xl hover:bg-red-100 transition-colors"
            >
              <Trash2 className="w-4 h-4" />
              Delete Product
            </button>
          </section>
        </div>
      </div>
    </div>
  )
}
