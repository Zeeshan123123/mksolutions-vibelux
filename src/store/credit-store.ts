import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';

interface CreditStore {
  // Credit balance
  credits: {
    available: number;
    used: number;
    purchased: number;
    bonus: number;
    monthlyAllocation: number;
    lastUpdated?: Date;
  };
  
  // Usage tracking
  recentUsage: Array<{
    action: string;
    cost: number;
    timestamp: Date;
    success: boolean;
  }>;
  
  // UI state
  showLowCreditWarning: boolean;
  showPurchaseModal: boolean;
  
  // Actions
  updateCredits: (credits: Partial<CreditStore['credits']>) => void;
  useCredits: (action: string, cost: number) => Promise<boolean>;
  addUsage: (usage: CreditStore['recentUsage'][0]) => void;
  setShowLowCreditWarning: (show: boolean) => void;
  setShowPurchaseModal: (show: boolean) => void;
  refreshCredits: () => Promise<void>;
}

export const useCreditStore = create<CreditStore>()(
  devtools(
    persist(
      (set, get) => ({
        // Initial state
        credits: {
          available: 0,
          used: 0,
          purchased: 0,
          bonus: 0,
          monthlyAllocation: 0,
        },
        
        recentUsage: [],
        showLowCreditWarning: false,
        showPurchaseModal: false,
        
        // Actions
        updateCredits: (credits) =>
          set((state) => ({
            credits: {
              ...state.credits,
              ...credits,
              lastUpdated: new Date(),
            },
          })),
          
        useCredits: async (action, cost) => {
          const { credits } = get();
          
          if (credits.available < cost) {
            set({ showLowCreditWarning: true });
            return false;
          }
          
          // Optimistically update UI
          set((state) => ({
            credits: {
              ...state.credits,
              available: state.credits.available - cost,
              used: state.credits.used + cost,
            },
          }));
          
          return true;
        },
        
        addUsage: (usage) =>
          set((state) => ({
            recentUsage: [usage, ...state.recentUsage.slice(0, 49)], // Keep last 50
          })),
          
        setShowLowCreditWarning: (show) =>
          set({ showLowCreditWarning: show }),
          
        setShowPurchaseModal: (show) =>
          set({ showPurchaseModal: show }),
          
        refreshCredits: async () => {
          try {
            const response = await fetch('/api/credits/balance');
            if (response.ok) {
              const data = await response.json();
              set({
                credits: {
                  available: data.available,
                  used: data.used,
                  purchased: data.purchased,
                  bonus: data.bonus,
                  monthlyAllocation: data.monthlyAllocation,
                  lastUpdated: new Date(),
                },
              });
            }
          } catch (error) {
            logger.error('api', 'Failed to refresh credits:', error );
          }
        },
      }),
      {
        name: 'vibelux-credit-store',
        partialize: (state) => ({
          credits: state.credits,
          recentUsage: state.recentUsage.slice(0, 10), // Only persist last 10
        }),
      }
    ),
    {
      name: 'Credit Store',
    }
  )
);

// Selectors
export const useAvailableCredits = () => useCreditStore((state) => state.credits.available);
export const useIsLowOnCredits = () => useCreditStore((state) => state.credits.available < 50);
export const useCreditPercentage = () => useCreditStore((state) => {
  const total = state.credits.monthlyAllocation + state.credits.purchased + state.credits.bonus;
  return total > 0 ? (state.credits.available / total) * 100 : 0;
});