import { useState } from 'react'
import { useCategoryStore } from '@/stores/useCategoryStore'
import { useToast } from '@/components/ui/Toast'
import { Plus, X } from 'lucide-react'

export function TagManager() {
  const { tags, createTag, deleteTag } = useCategoryStore()
  const { toast } = useToast()
  const [newTag, setNewTag] = useState('')

  async function handleCreate() {
    if (!newTag.trim()) return
    await createTag(newTag.trim())
    toast('Tag creato', 'success')
    setNewTag('')
  }

  return (
    <div className="rounded-xl border border-border bg-card p-5">
      <h3 className="mb-4 text-lg font-semibold text-foreground">Tag</h3>

      {/* Existing tags */}
      <div className="mb-4 flex flex-wrap gap-2">
        {tags.map((tag) => (
          <span
            key={tag.id}
            className="group inline-flex items-center gap-1 rounded-full border border-border bg-secondary px-3 py-1 text-sm text-secondary-foreground"
          >
            #{tag.name}
            <button
              onClick={async () => {
                await deleteTag(tag.id)
                toast('Tag eliminato', 'info')
              }}
              className="rounded-full p-0.5 opacity-0 transition-opacity hover:bg-destructive/10 hover:text-destructive group-hover:opacity-100"
            >
              <X className="h-3 w-3" />
            </button>
          </span>
        ))}
        {tags.length === 0 && (
          <p className="text-sm text-muted-foreground">Nessun tag creato</p>
        )}
      </div>

      {/* Add new */}
      <div className="flex items-center gap-2">
        <input
          type="text"
          value={newTag}
          onChange={(e) => setNewTag(e.target.value)}
          placeholder="Nuovo tag..."
          className="flex-1 rounded-md border border-input bg-background px-3 py-1.5 text-sm placeholder:text-muted-foreground"
          onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
        />
        <button
          onClick={handleCreate}
          disabled={!newTag.trim()}
          className="rounded-lg bg-primary p-1.5 text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
        >
          <Plus className="h-4 w-4" />
        </button>
      </div>
    </div>
  )
}
