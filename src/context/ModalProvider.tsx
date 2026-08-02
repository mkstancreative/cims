import React, { useState } from "react";
import ReactDOM from "react-dom";
import { ModalContext } from "./ModalContext";

interface ModalProviderProps {
  children: React.ReactNode;
}

export const ModalProvider = ({ children }: ModalProviderProps) => {
  const [modal, setModal] = useState<React.ReactElement | null>(null);

  const openModal = (content: React.ReactElement): void => setModal(content);
  const closeModal = (): void => setModal(null);

  return (
    <ModalContext.Provider value={{ openModal, closeModal }}>
      {children}
      {/* Render via portal so stacking contexts never clip the modal */}
      {modal && ReactDOM.createPortal(modal, document.body)}
    </ModalContext.Provider>
  );
};
