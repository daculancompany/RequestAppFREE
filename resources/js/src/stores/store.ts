import { create } from 'zustand';
import { AppState, LeaveRequest, Group, Message } from '../types/types';
import dayjs from 'dayjs';

const initialGroups: Group[] = [
  { 
    id: 'dev', 
    name: 'Development Team', 
    description: 'Software Engineering Department',
    members: 8, 
    pending: 3, 
    color: '#1890ff',
    gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    icon: null, // Will be set in component
    image: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=400&h=300&fit=crop',
    approvers: ['Sarah Johnson (Lead)', 'Mike Chen (Manager)'],
    tags: ['Engineering', 'Tech', 'Agile'],
    stats: { avgLeave: 12, approvalRate: 95, responseTime: '2h' },
    createdAt: '2024-01-01',
    createdBy: 'Admin'
  },
  // ... other initial groups
];

const initialLeaveRequests: LeaveRequest[] = [
  {
    id: 1,
    employee: 'John Doe',
    employeeId: 'EMP001',
    avatar: 'https://randomuser.me/api/portraits/men/32.jpg',
    group: 'dev',
    type: 'Vacation',
    dates: ['2024-06-15', '2024-06-18'],
    duration: 4,
    status: 'pending',
    reason: 'Family vacation to Hawaii. Need time off for family trip.',
    submitted: '2024-06-10 09:30',
    approver: 'Sarah Johnson (Lead)',
    priority: 'high',
    conversation: [],
    attachments: [],
    notes: 'Employee has remaining leaves: 12 days',
    rating: 4.5
  },
  // ... other initial leave requests
];

export const useAppStore = create<AppState>((set, get) => ({
  // Initial State
  currentTheme: 'light',
  activeTab: 'dashboard',
  leaveModalVisible: false,
  groupModalVisible: false,
  chatDrawerVisible: false,
  selectedLeave: null,
  messages: [],
  messageInput: '',
  expandedGroups: ['dev', 'design'],
  searchQuery: '',
  groups: initialGroups,
  leaveRequests: initialLeaveRequests,
  archivedLeaves: [
    {
      id: 101,
      employee: 'Alex Brown',
      employeeId: 'EMP101',
      group: 'design',
      type: 'Vacation',
      dates: ['2024-05-20', '2024-06-05'],
      duration: 15,
      status: 'approved',
      reason: 'Year-end vacation with family',
      submitted: '2024-05-15',
      approver: 'Emma Wilson (Lead)',
      priority: 'medium',
      conversation: [],
      attachments: [],
      notes: '',
      rating: 4.8,
      archivedDate: '2024-06-06'
    } as LeaveRequest
  ],

  // Setters
  setCurrentTheme: (theme) => set({ currentTheme: theme }),
  setActiveTab: (tab) => set({ activeTab: tab }),
  setLeaveModalVisible: (visible) => set({ leaveModalVisible: visible }),
  setGroupModalVisible: (visible) => set({ groupModalVisible: visible }),
  setChatDrawerVisible: (visible) => set({ chatDrawerVisible: visible }),
  setSelectedLeave: (leave) => set({ selectedLeave: leave }),
  setMessages: (messages) => set({ messages }),
  setMessageInput: (input) => set({ messageInput: input }),
  setExpandedGroups: (groups) => set({ expandedGroups: groups }),
  setSearchQuery: (query) => set({ searchQuery: query }),
  setGroups: (groups) => set({ groups }),
  setLeaveRequests: (requests) => set({ leaveRequests: requests }),
  setArchivedLeaves: (leaves) => set({ archivedLeaves: leaves }),

  // Complex Actions
  toggleGroup: (groupId) => {
    const { expandedGroups } = get();
    set({
      expandedGroups: expandedGroups.includes(groupId)
        ? expandedGroups.filter(id => id !== groupId)
        : [...expandedGroups, groupId]
    });
  },

  handleApprove: (id) => {
    set(state => ({
      leaveRequests: state.leaveRequests.map(req => 
        req.id === id ? { ...req, status: 'approved' } : req
      )
    }));
  },

  handleReject: (id) => {
    set(state => ({
      leaveRequests: state.leaveRequests.map(req => 
        req.id === id ? { ...req, status: 'rejected' } : req
      )
    }));
  },

  handleSendMessage: () => {
    const { messageInput, selectedLeave } = get();
    if (!messageInput.trim() || !selectedLeave) return;

    const newMessage: Message = {
      id: Date.now(),
      sender: 'You (Admin)',
      senderRole: 'Administrator',
      avatar: '',
      message: messageInput,
      time: dayjs().format('YYYY-MM-DD HH:mm'),
      type: 'message',
      reactions: {}
    };

    set(state => ({
      leaveRequests: state.leaveRequests.map(req => 
        req.id === selectedLeave.id 
          ? { ...req, conversation: [...req.conversation, newMessage] }
          : req
      ),
      messages: [...state.messages, newMessage],
      messageInput: ''
    }));
  },

  openChat: (leave) => {
    set({
      selectedLeave: leave,
      messages: leave.conversation,
      chatDrawerVisible: true
    });
  },

  handleSubmitLeave: (values: any) => {
    const { groups, leaveRequests } = get();
    const selectedGroup = groups.find(g => g.id === values.group);
    const approver = selectedGroup?.approvers[0] || 'Admin';
    
    const newLeave: LeaveRequest = {
      id: leaveRequests.length + 1,
      employee: 'You (Employee)',
      employeeId: 'EMP' + (100 + leaveRequests.length),
      avatar: '',
      group: values.group,
      type: values.leaveType,
      dates: values.dates,
      duration: dayjs(values.dates[1]).diff(dayjs(values.dates[0]), 'day') + 1,
      status: 'pending',
      reason: values.reason,
      submitted: dayjs().format('YYYY-MM-DD HH:mm'),
      approver: approver,
      priority: values.priority || 'medium',
      conversation: [],
      attachments: [],
      notes: '',
      rating: 0
    };
    
    set(state => ({
      leaveRequests: [newLeave, ...state.leaveRequests],
      leaveModalVisible: false
    }));
  },

  handleCreateGroup: (values: any) => {
    const newGroup: Group = {
      id: values.name.toLowerCase().replace(/\s+/g, '_'),
      name: values.name,
      description: values.description,
      members: 0,
      pending: 0,
      color: values.color,
      gradient: `linear-gradient(135deg, ${values.color}80, ${values.color}40)`,
      icon: null, // Will be set in component
      image: values.imageUrl || 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=400&h=300&fit=crop',
      approvers: values.approvers?.split('\n') || ['Admin'],
      tags: values.tags?.split(',') || ['New'],
      stats: { avgLeave: 0, approvalRate: 0, responseTime: 'N/A' },
      createdAt: dayjs().format('YYYY-MM-DD'),
      createdBy: 'You'
    };
    
    set(state => ({
      groups: [...state.groups, newGroup],
      groupModalVisible: false
    }));
  }
}));