import { create } from "zustand";
import dayjs from "dayjs";

export const useGlobalStore = create((set) => ({
    // 🔹 Mutations (can stay outside or inside store)
    createGroupMutation: null,
    createRequestMutation: null,
    setMutations: (payload) => set(payload),

    // 🔹 UI / Theme
    currentTheme: "dark",
    setCurrentTheme: (value) => set({ currentTheme: value }),

    activeTab: "dashboard",  //dashboard calendar
    setActiveTab: (value) => set({ activeTab: value }),

    // 🔹 Modals / Drawers
    leaveModalVisible: false,
    setLeaveModalVisible: (value) => set({ leaveModalVisible: value }),

    groupModalVisible: false,
    setGroupModalVisible: (value) => set({ groupModalVisible: value }),

    chatDrawerVisible: false,
    setChatDrawerVisible: (value) => set({ chatDrawerVisible: value }),

    // 🔹 Requests / Groups
    leaveRequests: [],
    setLeaveRequests: (value) => set({ leaveRequests: value }),

    selectedLeave: null,
    setSelectedLeave: (value) => set({ selectedLeave: value }),

    activeGroup: null,
    setActiveGroup: (value) => set({ activeGroup: value }),

    selectedGroup: null,
    setSelectedGroup: (value) => set({ selectedGroup: value }),

    expandedGroups: ["dev", "design"],
    setExpandedGroups: (value) => set({ expandedGroups: value }),

    // 🔹 Chat
    messages: [],
    setMessages: (value) => set({ messages: value }),

    messageInput: "",
    setMessageInput: (value) => set({ messageInput: value }),

    // 🔹 Search
    searchQuery: "",
    setSearchQuery: (value) => set({ searchQuery: value }),

    // 🔹 Calendar
    calendarView: "month",
    setCalendarView: (value) => set({ calendarView: value }),

    selectedDate: dayjs(),
    setSelectedDate: (value) => set({ selectedDate: value }),

    calendarEvents: [],
    setCalendarEvents: (value) => set({ calendarEvents: value }),

    calendarFilter: {
        showPending: true,
        showApproved: true,
        showRejected: false,
        groups: ["dev", "design", "qa", "hr"],
    },
    setCalendarFilter: (value) => set({ calendarFilter: value }),


    newRequest: false,
    setNewRequest: (value) => set({ newRequest: value }),

    requestCurrentPage: 1,
    setRequestCurrentPage: (value) => set({ requestCurrentPage: value }),

    pageSize: 2,
    setPageSize: (value) => set({ pageSize: value }),

    newMember: false,
    setNewMember: (value) => set({ newMember: value }),

    newGroup: false,
    setNewGroup: (value) => set({ newGroup: value }),

    newGroup: false,
    setNewGroup: (value) => set({ newGroup: value }),

    groupSelected: null,
    setGroupSelected: (value) => set({ groupSelected: value }),

  
}));
