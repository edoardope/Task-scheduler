import { useEffect } from 'react'
import { useCategoryStore } from '@/stores/useCategoryStore'
import { CategoryManager } from '@/components/categories/CategoryManager'
import { TagManager } from '@/components/categories/TagManager'
import { AnimalHubSettings } from '@/components/settings/AnimalHubSettings'

export function SettingsPage() {
  const { fetchCategories, fetchTags } = useCategoryStore()

  useEffect(() => {
    fetchCategories()
    fetchTags()
  }, [fetchCategories, fetchTags])

  return (
    <div className="mx-auto max-w-3xl space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-foreground">Impostazioni</h2>
        <p className="text-muted-foreground">Gestisci integrazioni, categorie e tag</p>
      </div>

      <AnimalHubSettings />
      <CategoryManager />
      <TagManager />
    </div>
  )
}
