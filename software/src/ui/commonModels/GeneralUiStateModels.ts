import { useState } from 'qx';

type ModalDisplayStateModel = {
  isOpen: boolean;
  open: () => void;
  close: () => void;
};

export function useModalDisplayStateModel(): ModalDisplayStateModel {
  const [isOpen, setIsOpen] = useState(false);
  const open = () => setIsOpen(true);
  const close = () => setIsOpen(false);
  return { isOpen, open, close };
}
