import { create } from 'zustand'
import type { DashboardStats, StreakInfo, TrendDataPoint } from '../../../../shared/types'

interface StatsState {
  dashboard: DashboardStats | null
  streak: StreakInfo | null
  trend: TrendDataPoint[]
  loading: boolean
  fetchDashboard: () => Promise<void>
  fetchStreak: () => Promise<void>
  fetchTrend: (days: number) => Promise<void>
  fetchAll: () => Promise<void>
}

export const useStatsStore = create<StatsState>((set) => ({
  dashboard: null,
  streak: null,
  trend: [],
  loading: false,

  fetchDashboard: async () => {
    const dashboard = await window.api.getDashboardStats()
    set({ dashboard })
  },

  fetchStreak: async () => {
    const streak = await window.api.getStreakInfo()
    set({ streak })
  },

  fetchTrend: async (days) => {
    const trend = await window.api.getCompletionTrend(days)
    set({ trend })
  },

  fetchAll: async () => {
    set({ loading: true })
    const [dashboard, streak, trend] = await Promise.all([
      window.api.getDashboardStats(),
      window.api.getStreakInfo(),
      window.api.getCompletionTrend(14)
    ])
    set({ dashboard, streak, trend, loading: false })
  }
}))
