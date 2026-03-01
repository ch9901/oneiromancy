import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface Dream {
    id: string;
    title: string;
    content: string;
    tags: string[];
    date: string;
    createdAt: number;
}

interface DreamStoreState {
    dreams: Dream[];
    addDream: (dream: Dream) => void;
}

export const useDreamStore = create<DreamStoreState>()(
    persist(
        (set) => ({
            dreams: [],
            addDream: (dream) => set((state) => ({ dreams: [dream, ...state.dreams] })),
        }),
        {
            name: 'oneiromancy-dreams-storage',
        }
    )
);
