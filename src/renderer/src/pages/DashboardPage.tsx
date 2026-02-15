import { useEffect } from 'react'
import { useStatsStore } from '@/stores/useStatsStore'
import { useTaskStore } from '@/stores/useTaskStore'
import { format } from 'date-fns'
import { it } from 'date-fns/locale'
import { StatsCards } from '@/components/dashboard/StatsCards'
import { TodayTasks } from '@/components/dashboard/TodayTasks'
import { ProductivityChart } from '@/components/dashboard/ProductivityChart'
import { OverdueAlert } from '@/components/dashboard/OverdueAlert'

export function DashboardPage() {
  const { fetchAll, dashboard, streak, trend } = useStatsStore()
  const { fetchTasksForRange, tasks } = useTaskStore()

  useEffect(() => {
    fetchAll()
    const today = format(new Date(), 'yyyy-MM-dd')
    fetchTasksForRange(today, today)
  }, [fetchAll, fetchTasksForRange])

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground">Dashboard</h2>
        <p className="text-muted-foreground">
          {format(new Date(), "EEEE d MMMM yyyy", { locale: it })}
        </p>
      </div>

      {dashboard && dashboard.overdueCount > 0 && (
        <OverdueAlert count={dashboard.overdueCount} />
      )}

      <StatsCards dashboard={dashboard} streak={streak} />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <TodayTasks tasks={tasks} />
        <ProductivityChart data={trend} />
      </div>
    </div>
  )
}
