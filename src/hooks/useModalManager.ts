import { useState, useCallback } from 'react';

interface ModalState {
  [key: string]: {
    isOpen: boolean;
    data?: any;
  };
}

interface UseModalManagerOptions {
  initialModals?: string[];
}

interface ModalManager {
  isOpen: (modalId: string) => boolean;
  getData: <T = any>(modalId: string) => T | undefined;
  openModal: (modalId: string, data?: any) => void;
  closeModal: (modalId: string) => void;
  toggleModal: (modalId: string, data?: any) => void;
  closeAllModals: () => void;
  openModals: string[];
}

/**
 * Custom hook for managing multiple modal/dialog states
 * Reduces useState hooks for modal management
 */
export function useModalManager({ 
  initialModals = [] 
}: UseModalManagerOptions = {}): ModalManager {
  const [modalStates, setModalStates] = useState<ModalState>(() => {
    const initial: ModalState = {};
    initialModals.forEach(modalId => {
      initial[modalId] = { isOpen: false };
    });
    return initial;
  });
  
  const isOpen = useCallback((modalId: string): boolean => {
    return modalStates[modalId]?.isOpen ?? false;
  }, [modalStates]);
  
  const getData = useCallback(<T = any>(modalId: string): T | undefined => {
    return modalStates[modalId]?.data as T;
  }, [modalStates]);
  
  const openModal = useCallback((modalId: string, data?: any) => {
    setModalStates(prev => ({
      ...prev,
      [modalId]: { isOpen: true, data }
    }));
  }, []);
  
  const closeModal = useCallback((modalId: string) => {
    setModalStates(prev => ({
      ...prev,
      [modalId]: { isOpen: false, data: undefined }
    }));
  }, []);
  
  const toggleModal = useCallback((modalId: string, data?: any) => {
    setModalStates(prev => {
      const currentState = prev[modalId];
      const isCurrentlyOpen = currentState?.isOpen ?? false;
      
      return {
        ...prev,
        [modalId]: { 
          isOpen: !isCurrentlyOpen, 
          data: !isCurrentlyOpen ? data : undefined 
        }
      };
    });
  }, []);
  
  const closeAllModals = useCallback(() => {
    setModalStates(prev => {
      const newState: ModalState = {};
      Object.keys(prev).forEach(modalId => {
        newState[modalId] = { isOpen: false, data: undefined };
      });
      return newState;
    });
  }, []);
  
  const openModals = Object.keys(modalStates).filter(modalId => 
    modalStates[modalId]?.isOpen
  );
  
  return {
    isOpen,
    getData,
    openModal,
    closeModal,
    toggleModal,
    closeAllModals,
    openModals,
  };
}