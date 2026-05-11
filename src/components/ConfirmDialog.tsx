import { useCallback, useState } from 'react'
import { AlertTriangle, X } from 'lucide-react'

export interface ConfirmOptions {
  title: string
  description?: string
  confirmLabel?: string
  cancelLabel?: string
  destructive?: boolean
}

interface ConfirmDialogProps extends ConfirmOptions {
  open: boolean
  onConfirm: () => void
  onCancel: () => void
}

export function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  destructive = false,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  if (!open) return null

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onCancel} />
      <div className="relative w-full max-w-md mx-4 bg-white rounded-2xl shadow-elevated">
        <div className="flex items-start gap-4 p-6">
          {destructive && (
            <div className="w-10 h-10 rounded-full bg-red-50 flex items-center justify-center shrink-0">
              <AlertTriangle className="w-5 h-5 text-red-600" />
            </div>
          )}
          <div className="flex-1 min-w-0">
            <h3 className="text-[16px] font-semibold text-[#171717]">{title}</h3>
            {description && (
              <p className="text-[13px] text-[#666] mt-2 leading-relaxed">{description}</p>
            )}
          </div>
          <button
            onClick={onCancel}
            className="p-1 rounded-md hover:bg-[#f5f5f5] text-[#ccc] hover:text-[#888] transition-colors shrink-0"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
        <div className="flex items-center justify-end gap-2 px-6 py-4 border-t border-[#f0f0f0]">
          <button
            onClick={onCancel}
            className="px-4 py-2 rounded-md text-[12px] font-medium text-[#555] hover:bg-[#fafafa] transition-colors"
          >
            {cancelLabel}
          </button>
          <button
            onClick={onConfirm}
            className={`px-4 py-2 rounded-md text-[12px] font-medium text-white transition-colors ${
              destructive ? 'bg-red-600 hover:bg-red-700' : 'bg-[#171717] hover:bg-[#333]'
            }`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  )
}

interface PendingConfirm extends ConfirmOptions {
  resolve: (ok: boolean) => void
}

export function useConfirm(): {
  confirm: (options: ConfirmOptions) => Promise<boolean>
  dialog: React.ReactNode
} {
  const [pending, setPending] = useState<PendingConfirm | null>(null)

  const confirm = useCallback((options: ConfirmOptions) => {
    return new Promise<boolean>((resolve) => {
      setPending({ ...options, resolve })
    })
  }, [])

  const handleConfirm = useCallback(() => {
    pending?.resolve(true)
    setPending(null)
  }, [pending])

  const handleCancel = useCallback(() => {
    pending?.resolve(false)
    setPending(null)
  }, [pending])

  const dialog = pending ? (
    <ConfirmDialog
      open
      title={pending.title}
      description={pending.description}
      confirmLabel={pending.confirmLabel}
      cancelLabel={pending.cancelLabel}
      destructive={pending.destructive}
      onConfirm={handleConfirm}
      onCancel={handleCancel}
    />
  ) : null

  return { confirm, dialog }
}
