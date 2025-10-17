import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';

// App-wide state interface
interface AppState {
  // User preferences
  preferences: {
    theme: 'light' | 'dark' | 'system';
    units: 'metric' | 'imperial';
    currency: string;
    language: string;
  };
  
  // UI state
  ui: {
    sidebarOpen: boolean;
    commandPaletteOpen: boolean;
    notificationsOpen: boolean;
    activeModal: string | null;
  };
  
  // Cached data
  cache: {
    recentProjects: Array<{ id: string; name: string; updatedAt: Date }>;
    favoriteFixtures: string[];
  };
  
  // Actions
  setTheme: (theme: 'light' | 'dark' | 'system') => void;
  setUnits: (units: 'metric' | 'imperial') => void;
  setCurrency: (currency: string) => void;
  setLanguage: (language: string) => void;
  toggleSidebar: () => void;
  setSidebarOpen: (open: boolean) => void;
  toggleCommandPalette: () => void;
  setCommandPaletteOpen: (open: boolean) => void;
  toggleNotifications: () => void;
  setNotificationsOpen: (open: boolean) => void;
  openModal: (modalId: string) => void;
  closeModal: () => void;
  addRecentProject: (project: { id: string; name: string }) => void;
  toggleFavoriteFixture: (fixtureId: string) => void;
  clearCache: () => void;
}

// Create the store with middleware
export const useAppStore = create<AppState>()(
  devtools(
    persist(
      immer((set) => ({
        // Initial state
        preferences: {
          theme: 'system',
          units: 'metric',
          currency: 'USD',
          language: 'en',
        },
        
        ui: {
          sidebarOpen: true,
          commandPaletteOpen: false,
          notificationsOpen: false,
          activeModal: null,
        },
        
        cache: {
          recentProjects: [],
          favoriteFixtures: [],
        },
        
        // Actions
        setTheme: (theme) =>
          set((state) => {
            state.preferences.theme = theme;
          }),
          
        setUnits: (units) =>
          set((state) => {
            state.preferences.units = units;
          }),
          
        setCurrency: (currency) =>
          set((state) => {
            state.preferences.currency = currency;
          }),
          
        setLanguage: (language) =>
          set((state) => {
            state.preferences.language = language;
          }),
          
        toggleSidebar: () =>
          set((state) => {
            state.ui.sidebarOpen = !state.ui.sidebarOpen;
          }),
          
        setSidebarOpen: (open) =>
          set((state) => {
            state.ui.sidebarOpen = open;
          }),
          
        toggleCommandPalette: () =>
          set((state) => {
            state.ui.commandPaletteOpen = !state.ui.commandPaletteOpen;
          }),
          
        setCommandPaletteOpen: (open) =>
          set((state) => {
            state.ui.commandPaletteOpen = open;
          }),
          
        toggleNotifications: () =>
          set((state) => {
            state.ui.notificationsOpen = !state.ui.notificationsOpen;
          }),
          
        setNotificationsOpen: (open) =>
          set((state) => {
            state.ui.notificationsOpen = open;
          }),
          
        openModal: (modalId) =>
          set((state) => {
            state.ui.activeModal = modalId;
          }),
          
        closeModal: () =>
          set((state) => {
            state.ui.activeModal = null;
          }),
          
        addRecentProject: (project) =>
          set((state) => {
            const exists = state.cache.recentProjects.find(p => p.id === project.id);
            if (exists) {
              // Update timestamp
              exists.updatedAt = new Date();
            } else {
              // Add new project (keep max 10)
              state.cache.recentProjects.unshift({
                ...project,
                updatedAt: new Date(),
              });
              if (state.cache.recentProjects.length > 10) {
                state.cache.recentProjects.pop();
              }
            }
          }),
          
        toggleFavoriteFixture: (fixtureId) =>
          set((state) => {
            const index = state.cache.favoriteFixtures.indexOf(fixtureId);
            if (index > -1) {
              state.cache.favoriteFixtures.splice(index, 1);
            } else {
              state.cache.favoriteFixtures.push(fixtureId);
            }
          }),
          
        clearCache: () =>
          set((state) => {
            state.cache.recentProjects = [];
            state.cache.favoriteFixtures = [];
          }),
      })),
      {
        name: 'vibelux-app-store',
        partialize: (state) => ({
          preferences: state.preferences,
          cache: state.cache,
        }),
      }
    ),
    {
      name: 'VibeLux Store',
    }
  )
);

// Selectors for common use cases
export const useTheme = () => useAppStore((state) => state.preferences.theme);
export const useUnits = () => useAppStore((state) => state.preferences.units);
export const useCurrency = () => useAppStore((state) => state.preferences.currency);
export const useSidebarOpen = () => useAppStore((state) => state.ui.sidebarOpen);
export const useCommandPaletteOpen = () => useAppStore((state) => state.ui.commandPaletteOpen);
export const useActiveModal = () => useAppStore((state) => state.ui.activeModal);
export const useRecentProjects = () => useAppStore((state) => state.cache.recentProjects);
export const useFavoriteFixtures = () => useAppStore((state) => state.cache.favoriteFixtures);