import { useState } from 'react'
import { useCategoryStore } from '@/stores/useCategoryStore'
import { useToast } from '@/components/ui/Toast'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'
import { Plus, Trash2, Pencil, Check, X } from 'lucide-react'

export function CategoryManager() {
  const { categories, createCategory, updateCategory, deleteCategory } = useCategoryStore()
  const { toast } = useToast()
  const [newName, setNewName] = useState('')
  const [newColor, setNewColor] = useState('#6366f1')
  const [editingId, setEditingId] = useState<number | null>(null)
  const [editName, setEditName] = useState('')
  const [editColor, setEditColor] = useState('')
  const [deleteId, setDeleteId] = useState<number | null>(null)

  async function handleCreate() {
    if (!newName.trim()) return
    await createCategory({ name: newName.trim(), color: newColor })
    toast('Categoria creata', 'success')
    setNewName('')
    setNewColor('#6366f1')
  }

  async function handleUpdate(id: number) {
    if (!editName.trim()) return
    await updateCategory(id, { name: editName.trim(), color: editColor })
    toast('Categoria aggiornata', 'success')
    setEditingId(null)
  }

  async function handleDelete() {
    if (deleteId === null) return
    await deleteCategory(deleteId)
    toast('Categoria eliminata', 'info')
    setDeleteId(null)
  }

  return (
    <div className="rounded-xl border border-border bg-card p-5">
      <h3 className="mb-4 text-lg font-semibold text-foreground">Categorie</h3>

      {/* Existing categories */}
      <div className="mb-4 space-y-2">
        {categories.map((cat) =>
          editingId === cat.id ? (
            <div key={cat.id} className="flex items-center gap-2">
              <input
                type="color"
                value={editColor}
                onChange={(e) => setEditColor(e.target.value)}
                className="h-8 w-8 cursor-pointer rounded border-0"
              />
              <input
                type="text"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                className="flex-1 rounded-md border border-input bg-background px-3 py-1.5 text-sm"
                onKeyDown={(e) => e.key === 'Enter' && handleUpdate(cat.id)}
              />
              <button
                onClick={() => handleUpdate(cat.id)}
                className="rounded p-1.5 text-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-950"
              >
                <Check className="h-4 w-4" />
              </button>
              <button
                onClick={() => setEditingId(null)}
                className="rounded p-1.5 text-muted-foreground hover:bg-accent"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          ) : (
            <div
              key={cat.id}
              className="group flex items-center gap-3 rounded-lg border border-border px-3 py-2"
            >
              <span
                className="h-4 w-4 rounded-full"
                style={{ backgroundColor: cat.color }}
              />
              <span className="flex-1 text-sm text-foreground">
                {cat.icon} {cat.name}
              </span>
              <div className="flex gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                <button
                  onClick={() => {
                    setEditingId(cat.id)
                    setEditName(cat.name)
                    setEditColor(cat.color)
                  }}
                  className="rounded p-1 text-muted-foreground hover:bg-accent"
                >
                  <Pencil className="h-3.5 w-3.5" />
                </button>
                <button
                  onClick={() => setDeleteId(cat.id)}
                  className="rounded p-1 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          )
        )}
      </div>

      {/* Add new */}
      <div className="flex items-center gap-2">
        <input
          type="color"
          value={newColor}
          onChange={(e) => setNewColor(e.target.value)}
          className="h-8 w-8 cursor-pointer rounded border-0"
        />
        <input
          type="text"
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          placeholder="Nuova categoria..."
          className="flex-1 rounded-md border border-input bg-background px-3 py-1.5 text-sm placeholder:text-muted-foreground"
          onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
        />
        <button
          onClick={handleCreate}
          disabled={!newName.trim()}
          className="rounded-lg bg-primary p-1.5 text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
        >
          <Plus className="h-4 w-4" />
        </button>
      </div>

      <ConfirmDialog
        open={deleteId !== null}
        title="Elimina Categoria"
        message="Vuoi davvero eliminare questa categoria? I task associati non verranno eliminati."
        confirmLabel="Elimina"
        destructive
        onConfirm={handleDelete}
        onCancel={() => setDeleteId(null)}
      />
    </div>
  )
}
