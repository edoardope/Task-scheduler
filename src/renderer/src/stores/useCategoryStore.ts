import { create } from 'zustand'
import type { Category, Tag, CreateCategoryInput } from '../../../../shared/types'

interface CategoryState {
  categories: Category[]
  tags: Tag[]
  fetchCategories: () => Promise<void>
  fetchTags: () => Promise<void>
  createCategory: (input: CreateCategoryInput) => Promise<void>
  updateCategory: (id: number, updates: Partial<CreateCategoryInput>) => Promise<void>
  deleteCategory: (id: number) => Promise<void>
  createTag: (name: string) => Promise<Tag>
  deleteTag: (id: number) => Promise<void>
}

export const useCategoryStore = create<CategoryState>((set, get) => ({
  categories: [],
  tags: [],

  fetchCategories: async () => {
    const categories = await window.api.getCategories()
    set({ categories })
  },

  fetchTags: async () => {
    const tags = await window.api.getTags()
    set({ tags })
  },

  createCategory: async (input) => {
    const category = await window.api.createCategory(input)
    set({ categories: [...get().categories, category] })
  },

  updateCategory: async (id, updates) => {
    const updated = await window.api.updateCategory(id, updates)
    set({ categories: get().categories.map((c) => (c.id === id ? updated : c)) })
  },

  deleteCategory: async (id) => {
    await window.api.deleteCategory(id)
    set({ categories: get().categories.filter((c) => c.id !== id) })
  },

  createTag: async (name) => {
    const tag = await window.api.createTag(name)
    const exists = get().tags.find((t) => t.id === tag.id)
    if (!exists) set({ tags: [...get().tags, tag] })
    return tag
  },

  deleteTag: async (id) => {
    await window.api.deleteTag(id)
    set({ tags: get().tags.filter((t) => t.id !== id) })
  }
}))
