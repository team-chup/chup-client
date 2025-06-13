import { create } from 'zustand';

interface DeleteStoreTYpe {
  deleteId: string | undefined;
  setDeleteId: (id: string) => void;
}

const useDeleteIdStore = create<DeleteStoreTYpe>((set) => ({
  deleteId: undefined,
  setDeleteId: (id) => set(() => ({ deleteId: id })),
}));

export default useDeleteIdStore;
