import { useState } from 'react'
import { MessageSquare, Send, Trash2 } from 'lucide-react'
import { useDisplayStore } from '../../stores/display-store'
import { useRoleStore, ROLE_LABELS } from '../../stores/role-store'
import type { PalletComment } from '../../types'

const ROLE_BADGE: Record<PalletComment['authorRole'], string> = {
  salesman: 'bg-[#eff6ff] text-[#0a72ef]',
  buyer: 'bg-emerald-50 text-emerald-700',
  builder: 'bg-amber-50 text-amber-700',
  manager: 'bg-purple-50 text-purple-700',
}

function timeAgo(ms: number) {
  const diff = Date.now() - ms
  const minute = 60_000
  const hour = 3_600_000
  const day = 86_400_000
  if (diff < minute) return 'just now'
  if (diff < hour) return `${Math.floor(diff / minute)}m ago`
  if (diff < day) return `${Math.floor(diff / hour)}h ago`
  if (diff < day * 7) return `${Math.floor(diff / day)}d ago`
  return new Date(ms).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

export function CommentsThread({ palletId }: { palletId: string }) {
  const project = useDisplayStore((state) =>
    state.projects.find((p) => p.id === palletId),
  )
  const role = useRoleStore((state) => state.role)
  const addComment = useDisplayStore((state) => state.addComment)
  const removeComment = useDisplayStore((state) => state.removeComment)
  const [text, setText] = useState('')

  if (!project) return null
  const comments = project.comments ?? []

  const handleSend = () => {
    const trimmed = text.trim()
    if (!trimmed) return
    addComment(palletId, { authorRole: role, text: trimmed })
    setText('')
  }

  return (
    <div className="bg-white shadow-card rounded-xl p-5">
      <div className="flex items-center gap-2 mb-4">
        <MessageSquare className="w-4 h-4 text-[#666]" />
        <h3 className="text-[15px] font-semibold text-[#171717]">Notes</h3>
        <span className="text-[11px] text-[#888] ml-1">({comments.length})</span>
      </div>

      {comments.length > 0 && (
        <div className="space-y-3 mb-4">
          {comments
            .slice()
            .sort((a, b) => b.createdAt - a.createdAt)
            .map((comment) => (
              <div key={comment.id} className="rounded-lg bg-[#fafafa] p-3 group">
                <div className="flex items-center justify-between gap-2 mb-1">
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-[10px] uppercase tracking-wider font-medium px-1.5 py-0.5 rounded ${
                        ROLE_BADGE[comment.authorRole]
                      }`}
                    >
                      {ROLE_LABELS[comment.authorRole]}
                    </span>
                    <span className="text-[11px] text-[#888]">
                      {timeAgo(comment.createdAt)}
                    </span>
                  </div>
                  <button
                    onClick={() => removeComment(palletId, comment.id)}
                    className="opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded text-[#888] hover:text-[#c0392b]"
                    title="Delete"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
                <p className="text-[13px] text-[#171717] whitespace-pre-wrap">
                  {comment.text}
                </p>
              </div>
            ))}
        </div>
      )}

      <div className="flex items-end gap-2">
        <textarea
          value={text}
          onChange={(event) => setText(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === 'Enter' && (event.metaKey || event.ctrlKey)) {
              event.preventDefault()
              handleSend()
            }
          }}
          placeholder={`Leave a note as ${ROLE_LABELS[role]}…`}
          rows={2}
          className="flex-1 px-3 py-2 text-[13px] shadow-border rounded-md focus:outline-none focus:ring-2 focus:ring-[#0a72ef]/30 focus:shadow-none resize-none"
        />
        <button
          onClick={handleSend}
          disabled={!text.trim()}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-md bg-[#171717] text-white text-[12px] font-medium hover:bg-[#333] transition-colors disabled:opacity-40"
        >
          <Send className="w-3.5 h-3.5" />
          Post
        </button>
      </div>
    </div>
  )
}
