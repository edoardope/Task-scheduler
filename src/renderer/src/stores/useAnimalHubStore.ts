import { create } from 'zustand'
import type { AnimalHubStatus, HubScheduledEvent, HubCompleteInput } from '../../../../shared/types'

interface AnimalHubState {
  status: AnimalHubStatus | null
  todayEvents: HubScheduledEvent[]
  missedEvents: HubScheduledEvent[]
  futureEvents: HubScheduledEvent[]
  allEvents: HubScheduledEvent[]
  loading: boolean
  fetchStatus: () => Promise<void>
  connect: () => Promise<void>
  disconnect: () => Promise<void>
  fetchEvents: () => Promise<void>
  completeEvent: (id: string, input: HubCompleteInput) => Promise<void>
  skipEvent: (id: string) => Promise<void>
  dismissEvent: (id: string) => Promise<void>
}

export const useAnimalHubStore = create<AnimalHubState>((set, get) => ({
  status: null,
  todayEvents: [],
  missedEvents: [],
  futureEvents: [],
  allEvents: [],
  loading: false,

  fetchStatus: async () => {
    const status = await window.api.hubGetStatus()
    set({ status })
  },

  connect: async () => {
    set({ loading: true })
    await window.api.hubConnect()
    await get().fetchStatus()
    await get().fetchEvents()
    set({ loading: false })
  },

  disconnect: async () => {
    set({ loading: true })
    await window.api.hubDisconnect()
    await get().fetchStatus()
    set({
      todayEvents: [],
      missedEvents: [],
      futureEvents: [],
      allEvents: [],
      loading: false
    })
  },

  fetchEvents: async () => {
    set({ loading: true })
    const [today, missed, future] = await Promise.all([
      window.api.hubGetScheduledToday(),
      window.api.hubGetScheduledMissed(),
      window.api.hubGetScheduledFuture(30)
    ])
    // Tag each event with its status for UI rendering
    const taggedToday = today.map((e: HubScheduledEvent) => ({ ...e, status: 'today' as const }))
    const taggedMissed = missed.map((e: HubScheduledEvent) => ({ ...e, status: 'missed' as const }))
    const taggedFuture = future.map((e: HubScheduledEvent) => ({ ...e, status: 'future' as const }))
    set({
      todayEvents: taggedToday,
      missedEvents: taggedMissed,
      futureEvents: taggedFuture,
      allEvents: [...taggedToday, ...taggedMissed, ...taggedFuture],
      loading: false
    })
  },

  completeEvent: async (id: string, input: HubCompleteInput) => {
    await window.api.hubCompleteEvent(id, input)
    await get().fetchEvents()
  },

  skipEvent: async (id: string) => {
    await window.api.hubSkipEvent(id)
    await get().fetchEvents()
  },

  dismissEvent: async (id: string) => {
    await window.api.hubDismissEvent(id)
    await get().fetchEvents()
  }
}))
