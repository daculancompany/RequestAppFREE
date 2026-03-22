export interface LeaveRequest {
    id: number;
    employee: string;
    employeeId: string;
    avatar?: string;
    group: string;
    type: string;
    dates: [string, string];
    duration: number;
    status: "pending" | "approved" | "rejected" | "in_review";
    reason: string;
    submitted: string;
    approver: string;
    priority: "high" | "medium" | "low";
    conversation: Message[];
    attachments: string[];
    notes: string;
    rating: number;
}

export interface Group {
    id: string;
    name: string;
    description: string;
    members: number;
    pending: number;
    color: string;
    gradient: string;
    icon: React.ReactNode;
    image?: string;
    approvers: string[];
    tags: string[];
    stats: {
        avgLeave: number;
        approvalRate: number;
        responseTime: string;
    };
    createdAt: string;
    createdBy: string;
}

export interface Message {
    id: number;
    sender: string;
    senderRole: string;
    avatar?: string;
    message: string;
    time: string;
    type: string;
    reactions: Record<string, any>;
}

export interface AppState {
    // Theme
    currentTheme: "light" | "dark";
    activeTab: string;

    // UI States
    leaveModalVisible: boolean;
    groupModalVisible: boolean;
    chatDrawerVisible: boolean;

    // Data
    selectedLeave: LeaveRequest | null;
    messages: Message[];
    messageInput: string;
    expandedGroups: string[];
    searchQuery: string;
    groups: Group[];
    leaveRequests: LeaveRequest[];
    archivedLeaves: LeaveRequest[];

    // Actions
    setCurrentTheme: (theme: "light" | "dark") => void;
    setActiveTab: (tab: string) => void;
    setLeaveModalVisible: (visible: boolean) => void;
    setGroupModalVisible: (visible: boolean) => void;
    setChatDrawerVisible: (visible: boolean) => void;
    setSelectedLeave: (leave: LeaveRequest | null) => void;
    setMessages: (messages: Message[]) => void;
    setMessageInput: (input: string) => void;
    setExpandedGroups: (groups: string[]) => void;
    setSearchQuery: (query: string) => void;
    setGroups: (groups: Group[]) => void;
    setLeaveRequests: (requests: LeaveRequest[]) => void;
    setArchivedLeaves: (leaves: LeaveRequest[]) => void;

    // Complex Actions
    toggleGroup: (groupId: string) => void;
    handleApprove: (id: number) => void;
    handleReject: (id: number) => void;
    handleSendMessage: () => void;
    openChat: (leave: LeaveRequest) => void;
    handleSubmitLeave: (values: any) => void;
    handleCreateGroup: (values: any) => void;
}

export interface ChartData {
    month?: string;
    name?: string;
    value?: number;
    pending?: number;
    approved?: number;
    rejected?: number;
    leaves?: number;
    avgDays?: number;
    subject?: string;
    A?: number;
    B?: number;
    fullMark?: number;
    color?: string;
}

export interface PerformanceData extends ChartData {
    subject: string;
    A: number;
    B: number;
    fullMark: number;
}
