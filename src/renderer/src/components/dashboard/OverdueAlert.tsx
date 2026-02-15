import { AlertTriangle } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

interface OverdueAlertProps {
  count: number
}

export function OverdueAlert({ count }: OverdueAlertProps) {
  const navigate = useNavigate()

  return (
    <div className="flex items-center gap-3 rounded-lg border border-red-200 bg-red-50 p-4 dark:border-red-900 dark:bg-red-950">
      <AlertTriangle className="h-5 w-5 flex-shrink-0 text-red-500" />
      <div className="flex-1">
        <p className="text-sm font-medium text-red-800 dark:text-red-200">
          Hai {count} task scadut{count === 1 ? 'o' : 'i'}
        </p>
      </div>
      <button
        onClick={() => navigate('/tasks')}
        className="rounded-md bg-red-100 px-3 py-1.5 text-xs font-medium text-red-700 hover:bg-red-200 dark:bg-red-900 dark:text-red-200 dark:hover:bg-red-800"
      >
        Vedi
      </button>
    </div>
  )
}
