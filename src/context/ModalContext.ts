import { createContext, useContext } from 'react';
import React from 'react';

export interface ModalContextValue {
  openModal: (content: React.ReactElement) => void;
  closeModal: () => void;
}

export const ModalContext = createContext<ModalContextValue | null>(null);

export const useModal = (): ModalContextValue => {
  const ctx = useContext(ModalContext);
  if (!ctx) throw new Error('useModal must be used within a ModalProvider');
  return ctx;
};