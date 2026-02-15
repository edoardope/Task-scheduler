import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Line,
  ComposedChart
} from 'recharts'
import { format, parseISO } from 'date-fns'
import type { TrendDataPoint } from '../../../../../shared/types'
import { BarChart3 } from 'lucide-react'

interface ProductivityChartProps {
  data: TrendDataPoint[]
}

export function ProductivityChart({ data }: ProductivityChartProps) {
  const chartData = data.map((d) => ({
    ...d,
    label: format(parseISO(d.date), 'dd/MM'),
    percentage: Math.round(d.ratio * 100)
  }))

  return (
    <div className="rounded-xl border border-border bg-card p-5">
      <h3 className="mb-4 text-lg font-semibold text-foreground">Trend Produttività</h3>

      {chartData.length === 0 ? (
        <div className="flex flex-col items-center py-8 text-muted-foreground">
          <BarChart3 className="mb-2 h-10 w-10" />
          <p className="text-sm">Nessun dato disponibile</p>
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={250}>
          <ComposedChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
            <XAxis dataKey="label" tick={{ fontSize: 12 }} stroke="var(--color-muted-foreground)" />
            <YAxis tick={{ fontSize: 12 }} stroke="var(--color-muted-foreground)" />
            <Tooltip
              contentStyle={{
                backgroundColor: 'var(--color-card)',
                border: '1px solid var(--color-border)',
                borderRadius: '8px',
                color: 'var(--color-foreground)'
              }}
            />
            <Bar dataKey="completed" name="Completati" fill="#6366f1" radius={[4, 4, 0, 0]} />
            <Bar dataKey="total" name="Totale" fill="#e4e4e7" radius={[4, 4, 0, 0]} />
            <Line
              type="monotone"
              dataKey="percentage"
              name="% Completamento"
              stroke="#10b981"
              strokeWidth={2}
              dot={false}
            />
          </ComposedChart>
        </ResponsiveContainer>
      )}
    </div>
  )
}
