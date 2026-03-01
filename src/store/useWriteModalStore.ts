import { create } from 'zustand';

interface WriteModalState {
    isOpen: boolean;
    openModal: () => void;
    closeModal: () => void;
}

export const useWriteModalStore = create<WriteModalState>((set) => ({
    isOpen: false,
    openModal: () => set({ isOpen: true }),
    closeModal: () => set({ isOpen: false }),
}));
