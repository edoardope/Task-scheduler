import { CheckCircle2, Clock, Flame, AlertTriangle } from 'lucide-react'
import type { DashboardStats, StreakInfo } from '../../../../../shared/types'

interface StatsCardsProps {
  dashboard: DashboardStats | null
  streak: StreakInfo | null
  hubTodayCount?: number
  hubMissedCount?: number
}

export function StatsCards({ dashboard, streak, hubTodayCount = 0, hubMissedCount = 0 }: StatsCardsProps) {
  const totalToday = (dashboard?.totalToday ?? 0) + hubTodayCount
  const completedToday = dashboard?.completedToday ?? 0
  const overdueCount = (dashboard?.overdueCount ?? 0) + hubMissedCount

  const cards = [
    {
      label: 'Oggi',
      value: dashboard
        ? `${completedToday}/${totalToday}`
        : '-',
      sub: dashboard && totalToday > 0
        ? `${Math.round((completedToday / totalToday) * 100)}% completato`
        : 'Nessun task',
      icon: CheckCircle2,
      color: 'text-emerald-500'
    },
    {
      label: 'Questa settimana',
      value: dashboard
        ? `${dashboard.weeklyCompleted}/${dashboard.weeklyTotal}`
        : '-',
      sub: dashboard && dashboard.weeklyTotal > 0
        ? `${Math.round((dashboard.weeklyCompleted / dashboard.weeklyTotal) * 100)}%`
        : 'Nessun task',
      icon: Clock,
      color: 'text-blue-500'
    },
    {
      label: 'Streak',
      value: streak ? `${streak.currentStreak} giorni` : '-',
      sub: streak ? `Record: ${streak.longestStreak} giorni` : '',
      icon: Flame,
      color: 'text-orange-500'
    },
    {
      label: 'Scaduti',
      value: dashboard ? `${overdueCount}` : '-',
      sub: overdueCount > 0
        ? 'Richiedono attenzione'
        : 'Tutto in regola',
      icon: AlertTriangle,
      color: overdueCount > 0 ? 'text-red-500' : 'text-emerald-500'
    }
  ]

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {cards.map((card) => (
        <div
          key={card.label}
          className="rounded-xl border border-border bg-card p-5"
        >
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-muted-foreground">{card.label}</p>
            <card.icon className={`h-5 w-5 ${card.color}`} />
          </div>
          <p className="mt-2 text-2xl font-bold text-foreground">{card.value}</p>
          <p className="mt-1 text-xs text-muted-foreground">{card.sub}</p>
        </div>
      ))}
    </div>
  )
}
