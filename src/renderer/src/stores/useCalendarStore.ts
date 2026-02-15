import { create } from 'zustand'
import { addMonths, subMonths } from 'date-fns'

interface CalendarState {
  currentDate: Date
  selectedDate: Date | null
  setCurrentDate: (d: Date) => void
  selectDate: (d: Date | null) => void
  goNextMonth: () => void
  goPrevMonth: () => void
  goToday: () => void
}

export const useCalendarStore = create<CalendarState>((set, get) => ({
  currentDate: new Date(),
  selectedDate: null,

  setCurrentDate: (d) => set({ currentDate: d }),
  selectDate: (d) => set({ selectedDate: d }),
  goNextMonth: () => set({ currentDate: addMonths(get().currentDate, 1) }),
  goPrevMonth: () => set({ currentDate: subMonths(get().currentDate, 1) }),
  goToday: () => set({ currentDate: new Date(), selectedDate: new Date() })
}))
