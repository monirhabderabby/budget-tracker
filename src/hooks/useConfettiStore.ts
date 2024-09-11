import { create } from "zustand";

// Define the type for the store's state and actions
interface ConfettiStoreProps {
  isOpen: boolean;
  onOpen: () => void;
  onClose: () => void;
}

const useConfettiStore = create<ConfettiStoreProps>((set) => ({
  isOpen: false,
  onOpen: () => set({ isOpen: true }),
  onClose: () => set({ isOpen: false }),
}));

export { useConfettiStore };
