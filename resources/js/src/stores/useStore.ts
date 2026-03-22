import { create } from 'zustand';
import { AppState, LeaveRequest, Group, ChatMessage } from '../types';
import dayjs from 'dayjs';

export const useStore = create<AppState>((set, get) => ({
  // Initial State
  currentTheme: 'light',
  activeTab: 'dashboard',
  leaveModalVisible: false,
  groupModalVisible: false,
  chatDrawerVisible: false,
  selectedLeave: null,
  messageInput: '',
  expandedGroups: ['dev', 'design'],
  searchQuery: '',
  
  groups: [
    { 
      id: 'dev', 
      name: 'Development Team', 
      description: 'Software Engineering Department',
      members: 8, 
      pending: 3, 
      color: '#1890ff',
      gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      icon: 'CodeOutlined',
      image: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=400&h=300&fit=crop',
      approvers: ['Sarah Johnson (Lead)', 'Mike Chen (Manager)'],
      tags: ['Engineering', 'Tech', 'Agile'],
      stats: { avgLeave: 12, approvalRate: 95, responseTime: '2h' },
      createdAt: '2024-01-01',
      createdBy: 'Admin'
    },
    // ... other initial groups
  ],

  leaveRequests: [
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
    // ... other initial leaves
  ],

  archivedLeaves: [
    {
      id: 101,
      employee: 'Alex Brown',
      avatar: '',
      employeeId: 'EMP101',
      group: 'design',
      type: 'Vacation',
      dates: ['2024-05-20', '2024-06-05'],
      duration: 15,
      status: 'approved',
      reason: 'Year-end vacation with family',
      submitted: '',
      approver: '',
      priority: 'medium',
      conversation: [],
      attachments: [],
      notes: '',
      rating: 4.8,
      archivedDate: '2024-06-06'
    }
  ],

  // Actions
  setCurrentTheme: (theme) => set({ currentTheme: theme }),
  setActiveTab: (tab) => set({ activeTab: tab }),
  setLeaveModalVisible: (visible) => set({ leaveModalVisible: visible }),
  setGroupModalVisible: (visible) => set({ groupModalVisible: visible }),
  setChatDrawerVisible: (visible) => set({ chatDrawerVisible: visible }),
  setSelectedLeave: (leave) => set({ selectedLeave: leave }),
  setMessageInput: (input) => set({ messageInput: input }),
  
  setExpandedGroups: (groups) => 
    set(state => ({
      expandedGroups: typeof groups === 'function' ? groups(state.expandedGroups) : groups
    })),
  
  setSearchQuery: (query) => set({ searchQuery: query }),
  
  setGroups: (groups) =>
    set(state => ({
      groups: typeof groups === 'function' ? groups(state.groups) : groups
    })),
  
  setLeaveRequests: (requests) =>
    set(state => ({
      leaveRequests: typeof requests === 'function' ? requests(state.leaveRequests) : requests
    })),
  
  setArchivedLeaves: (leaves) =>
    set(state => ({
      archivedLeaves: typeof leaves === 'function' ? leaves(state.archivedLeaves) : leaves
    })),

  // Business Logic Actions
  toggleTheme: () => 
    set(state => ({ 
      currentTheme: state.currentTheme === 'light' ? 'dark' : 'light' 
    })),

  toggleGroup: (groupId) =>
    set(state => ({
      expandedGroups: state.expandedGroups.includes(groupId)
        ? state.expandedGroups.filter(id => id !== groupId)
        : [...state.expandedGroups, groupId]
    })),

  handleApprove: (id) =>
    set(state => ({
      leaveRequests: state.leaveRequests.map(req => 
        req.id === id ? { ...req, status: 'approved' } : req
      )
    })),

  handleReject: (id) =>
    set(state => ({
      leaveRequests: state.leaveRequests.map(req => 
        req.id === id ? { ...req, status: 'rejected' } : req
      )
    })),

  handleSendMessage: () => {
    const { messageInput, selectedLeave, leaveRequests } = get();
    
    if (!messageInput.trim() || !selectedLeave) return;

    const newMessage: ChatMessage = {
      id: Date.now(),
      sender: 'You (Admin)',
      senderRole: 'Administrator',
      avatar: '',
      message: messageInput,
      time: dayjs().format('YYYY-MM-DD HH:mm'),
      type: 'message',
      reactions: {}
    };

    set({
      leaveRequests: leaveRequests.map(req => 
        req.id === selectedLeave.id 
          ? { ...req, conversation: [...req.conversation, newMessage] }
          : req
      ),
      messageInput: '',
      selectedLeave: {
        ...selectedLeave,
        conversation: [...selectedLeave.conversation, newMessage]
      }
    });
  },

  openChat: (leave) => {
    set({ 
      selectedLeave: leave, 
      chatDrawerVisible: true 
    });
  },

  handleSubmitLeave: (values) => {
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
    
    set({ 
      leaveRequests: [newLeave, ...leaveRequests],
      leaveModalVisible: false 
    });
  },

  handleCreateGroup: (values) => {
    const { groups } = get();
    
    const newGroup: Group = {
      id: values.name.toLowerCase().replace(/\s+/g, '_'),
      name: values.name,
      description: values.description,
      members: 0,
      pending: 0,
      color: values.color,
      gradient: `linear-gradient(135deg, ${values.color}80, ${values.color}40)`,
      icon: 'TeamOutlined',
      image: values.imageUrl || 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=400&h=300&fit=crop',
      approvers: values.approvers?.split('\n') || ['Admin'],
      tags: values.tags?.split(',') || ['New'],
      stats: { avgLeave: 0, approvalRate: 0, responseTime: 'N/A' },
      createdAt: dayjs().format('YYYY-MM-DD'),
      createdBy: 'You'
    };
    
    set({ 
      groups: [...groups, newGroup],
      groupModalVisible: false 
    });
  },

  clearMessages: () => set({ messageInput: '' })
}));