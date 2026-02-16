import { useEffect, useState } from 'react'
import { Link2, Unlink, FolderOpen } from 'lucide-react'
import { useSettingsStore } from '@/stores/useSettingsStore'
import { useAnimalHubStore } from '@/stores/useAnimalHubStore'
import { useToast } from '@/components/ui/Toast'
import { format } from 'date-fns'
import { cn } from '@/lib/utils'

export function AnimalHubSettings() {
  const { animalhubPath, fetchAnimalHubPath, setAnimalHubPath, clearAnimalHubPath } =
    useSettingsStore()
  const { status, fetchStatus, connect, disconnect } = useAnimalHubStore()
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    fetchAnimalHubPath()
    fetchStatus()
  }, [fetchAnimalHubPath, fetchStatus])

  async function handleSelectPath() {
    const path = await window.api.selectDirectory()
    if (path) {
      await setAnimalHubPath(path)
      toast('Percorso Husbandry Hub salvato', 'success')
      await fetchStatus()
    }
  }

  async function handleConnect() {
    setLoading(true)
    try {
      await connect()
      toast('Connesso a Husbandry Hub', 'success')
    } catch (error) {
      toast('Errore nella connessione', 'error')
    }
    setLoading(false)
  }

  async function handleDisconnect() {
    setLoading(true)
    try {
      await disconnect()
      toast('Disconnesso da Husbandry Hub', 'info')
    } catch (error) {
      toast('Errore nella disconnessione', 'error')
    }
    setLoading(false)
  }

  async function handleClearPath() {
    await clearAnimalHubPath()
    await disconnect()
    toast('Percorso rimosso', 'info')
  }

  const isConnected = status?.connected === true

  return (
    <div className="rounded-xl border border-border bg-card p-5">
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-foreground">Integrazione Husbandry Hub</h3>
        <p className="mt-1 text-sm text-muted-foreground">
          Sincronizza gli eventi programmati dal tuo database Husbandry Hub per gestirli
          direttamente nel Task Scheduler.
        </p>
      </div>

      {/* Path selector */}
      <div className="mb-4">
        <label className="mb-2 block text-sm font-medium text-foreground">
          Percorso Database
        </label>
        <div className="flex gap-2">
          <div className="flex-1 rounded-md border border-input bg-muted px-3 py-2 text-sm text-muted-foreground">
            {animalhubPath || 'Non configurato'}
          </div>
          <button
            onClick={handleSelectPath}
            className="flex items-center gap-2 rounded-lg border border-border px-3 py-2 text-sm text-foreground hover:bg-accent"
          >
            <FolderOpen className="h-4 w-4" />
            Sfoglia...
          </button>
          {animalhubPath && (
            <button
              onClick={handleClearPath}
              className="rounded-lg border border-border px-3 py-2 text-sm text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
            >
              Rimuovi
            </button>
          )}
        </div>
      </div>

      {/* Connection status */}
      {animalhubPath && status && (
        <div className="mb-4 rounded-lg border border-border bg-muted/50 p-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div
                className={cn(
                  'h-2 w-2 rounded-full',
                  isConnected ? 'bg-emerald-500' : 'bg-gray-400'
                )}
              />
              <span className="text-sm font-medium text-foreground">
                {isConnected ? 'Connesso' : 'Disconnesso'}
              </span>
            </div>
            <button
              onClick={isConnected ? handleDisconnect : handleConnect}
              disabled={loading}
              className={cn(
                'flex items-center gap-2 rounded-md px-3 py-1.5 text-sm font-medium',
                isConnected
                  ? 'border border-border bg-background text-muted-foreground hover:bg-accent'
                  : 'bg-primary text-primary-foreground hover:bg-primary/90',
                loading && 'opacity-50 cursor-not-allowed'
              )}
            >
              {isConnected ? (
                <>
                  <Unlink className="h-3.5 w-3.5" />
                  Disconnetti
                </>
              ) : (
                <>
                  <Link2 className="h-3.5 w-3.5" />
                  Connetti
                </>
              )}
            </button>
          </div>

          {isConnected && (
            <div className="mt-2 space-y-1 text-xs text-muted-foreground">
              {status.lastSync && (
                <p>
                  Ultimo sync: {format(new Date(status.lastSync), 'dd/MM/yyyy HH:mm')}
                </p>
              )}
              <p>App attiva: {status.appRunning ? 'Si' : 'No'}</p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
