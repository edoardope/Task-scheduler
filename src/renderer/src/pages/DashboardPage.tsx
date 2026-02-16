import { useEffect } from 'react'
import { useStatsStore } from '@/stores/useStatsStore'
import { useTaskStore } from '@/stores/useTaskStore'
import { useAnimalHubStore } from '@/stores/useAnimalHubStore'
import { format } from 'date-fns'
import { it } from 'date-fns/locale'
import { StatsCards } from '@/components/dashboard/StatsCards'
import { TodayTasks } from '@/components/dashboard/TodayTasks'
import { ProductivityChart } from '@/components/dashboard/ProductivityChart'
import { OverdueAlert } from '@/components/dashboard/OverdueAlert'
import { HubSection } from '@/components/animalhub/HubSection'

export function DashboardPage() {
  const { fetchAll, dashboard, streak, trend } = useStatsStore()
  const { fetchTasksForRange, tasks } = useTaskStore()
  const { todayEvents, missedEvents } = useAnimalHubStore()

  useEffect(() => {
    fetchAll()
    const today = format(new Date(), 'yyyy-MM-dd')
    fetchTasksForRange(today, today)
  }, [fetchAll, fetchTasksForRange])

  const totalOverdue = (dashboard?.overdueCount ?? 0) + missedEvents.length

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground">Dashboard</h2>
        <p className="text-muted-foreground">
          {format(new Date(), "EEEE d MMMM yyyy", { locale: it })}
        </p>
      </div>

      {totalOverdue > 0 && (
        <OverdueAlert count={totalOverdue} />
      )}

      <HubSection />

      <StatsCards
        dashboard={dashboard}
        streak={streak}
        hubTodayCount={todayEvents.length}
        hubMissedCount={missedEvents.length}
      />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <TodayTasks tasks={tasks} />
        <ProductivityChart data={trend} />
      </div>
    </div>
  )
}
