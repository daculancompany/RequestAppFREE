import { create } from "zustand";
import dayjs from "dayjs";

export const useRequestStore = create((set) => ({
   
    // 🔹 New Request Flag
    newRequest: false,
    setNewRequest: (value) => set({ newRequest: value }),
    submitting: false,
    setSubmitting: (value) => set({ submitting: value }),
    requestCurrentPage: 1,
    setRequestCurrentPage: (value) => set({ requestCurrentPage: value }),
    pageSize: 2,
    setPageSize: (value) => set({ pageSize: value }),

  
}));
