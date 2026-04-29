import { create } from 'zustand'
import type { Season } from '../types'

interface SeasonState {
  seasons: Season[]
  setSeasons: (seasons: Season[]) => void
  createSeason: (name: string) => Season
  renameSeason: (id: string, name: string) => void
  updateHolidayDate: (id: string, holidayDate: number | undefined) => void
  archiveSeason: (id: string) => void
  unarchiveSeason: (id: string) => void
  deleteSeason: (id: string) => void
  getSeason: (id: string) => Season | undefined
}

export const useSeasonStore = create<SeasonState>((set, get) => ({
  seasons: [],

  setSeasons: (seasons) => set({ seasons }),

  createSeason: (name) => {
    const trimmed = name.trim()
    const season: Season = {
      id: crypto.randomUUID(),
      name: trimmed.length === 0 ? 'Untitled season' : trimmed,
      archived: false,
      createdAt: Date.now(),
    }
    set((state) => ({ seasons: [...state.seasons, season] }))
    return season
  },

  renameSeason: (id, name) => {
    const trimmed = name.trim()
    if (trimmed.length === 0) return
    set((state) => ({
      seasons: state.seasons.map((season) =>
        season.id === id ? { ...season, name: trimmed } : season,
      ),
    }))
  },

  updateHolidayDate: (id, holidayDate) =>
    set((state) => ({
      seasons: state.seasons.map((season) =>
        season.id === id ? { ...season, holidayDate } : season,
      ),
    })),

  archiveSeason: (id) =>
    set((state) => ({
      seasons: state.seasons.map((season) =>
        season.id === id ? { ...season, archived: true } : season,
      ),
    })),

  unarchiveSeason: (id) =>
    set((state) => ({
      seasons: state.seasons.map((season) =>
        season.id === id ? { ...season, archived: false } : season,
      ),
    })),

  deleteSeason: (id) =>
    set((state) => ({
      seasons: state.seasons.filter((season) => season.id !== id),
    })),

  getSeason: (id) => get().seasons.find((season) => season.id === id),
}))
