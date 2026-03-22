// components/Pages/GroupListPage.jsx
import React, { useState } from "react";
import { 
    Avatar, 
    Button, 
    Badge, 
    Tooltip, 
    Tag, 
    Card, 
    Row, 
    Col, 
    Input,
    Select,
    Divider,
    Space,
    Dropdown,
    Modal,
    Form,
    message,
    Tabs
} from "antd";
import { motion, AnimatePresence } from "framer-motion";
import {
    TeamOutlined,
    UserOutlined,
    GlobalOutlined,
    DownOutlined,
    RightOutlined,
    CheckCircleOutlined,
    ClockCircleOutlined,
    BookOutlined,
    EnvironmentOutlined,
    ContactsOutlined,
    SettingOutlined,
    CalendarOutlined,
    CrownOutlined,
    PlusOutlined,
    SearchOutlined,
    FilterOutlined,
    EyeOutlined,
    EditOutlined,
    DeleteOutlined,
    MoreOutlined,
    UsergroupAddOutlined,
    StarOutlined,
    MailOutlined,
    PhoneOutlined,
    IdcardOutlined,
    SafetyOutlined,
    ClockCircleOutlined as ClockIcon,
    UserAddOutlined
} from "@ant-design/icons";
import "@/styles/Generalpage.scss";

const { Search } = Input;
const { Option } = Select;

// Sample groups data
const sampleGroups = [
    {
        id: 0,
        name: "General",
        code: "GEN-001",
        color: "#1890ff",
        icon: <GlobalOutlined />,
        description: "Company-wide announcements and general communications",
        members: 156,
        membersList: [
            { id: 1, name: "John Manager", role: "HR Head", avatar: null },
            { id: 2, name: "Sarah Lead", role: "Team Lead", avatar: null },
            { id: 3, name: "Mike Developer", role: "Senior Dev", avatar: null }
        ],
        approvers: [
            { id: 1, name: "Admin User", role: "Administrator", avatar: null }
        ],
        signatories: [],
        leaveRequests: [
            { id: 1, user: "John Doe", type: "Annual Leave", days: 5, status: "approved", date: "2024-01-15" },
            { id: 2, user: "Jane Smith", type: "Sick Leave", days: 2, status: "pending", date: "2024-01-16" }
        ],
        department: "All Departments",
        location: "HQ & Branches",
        stories: [
            { id: 1, title: "Annual Leave Policy Updated", date: "2024-01-15" },
            { id: 2, title: "New HR Portal Launched", date: "2024-01-10" }
        ],
        pendingApprovals: 0,
        isDefault: true,
        createdAt: "2024-01-01",
        status: "active"
    },
    {
        id: 1,
        name: "Engineering Team",
        code: "ENG-001",
        color: "#52c41a",
        icon: <TeamOutlined />,
        description: "Software development and engineering department",
        members: 42,
        membersList: [
            { id: 4, name: "Alex Chen", role: "Lead Engineer", avatar: null },
            { id: 5, name: "Maria Garcia", role: "Frontend Dev", avatar: null },
            { id: 6, name: "David Kim", role: "Backend Dev", avatar: null }
        ],
        approvers: [
            { id: 4, name: "Alex Chen", role: "Lead Engineer", avatar: null },
            { id: 7, name: "Tech Director", role: "Director", avatar: null }
        ],
        signatories: [
            { id: 4, name: "Alex Chen", role: "Lead Engineer", avatar: null }
        ],
        leaveRequests: [
            { id: 1, user: "David Kim", type: "Annual Leave", days: 5, status: "approved", date: "2024-01-14" },
            { id: 2, user: "Maria Garcia", type: "Sick Leave", days: 2, status: "pending", date: "2024-01-16" },
            { id: 3, user: "Sam Wilson", type: "Personal Leave", days: 3, status: "pending", date: "2024-01-15" }
        ],
        department: "Engineering",
        location: "San Francisco HQ",
        stories: [
            { id: 1, title: "Q1 Sprint Planning", date: "2024-01-20" },
            { id: 2, title: "New Framework Training", date: "2024-01-18" }
        ],
        pendingApprovals: 3,
        isDefault: false,
        createdAt: "2024-01-05",
        status: "active"
    },
    {
        id: 2,
        name: "Marketing Division",
        code: "MKT-001",
        color: "#f5222d",
        icon: <TeamOutlined />,
        description: "Marketing campaigns and brand management",
        members: 28,
        membersList: [
            { id: 8, name: "Lisa Wong", role: "Marketing Head", avatar: null },
            { id: 9, name: "Tom Smith", role: "Content Writer", avatar: null },
            { id: 10, name: "Emma Davis", role: "Designer", avatar: null }
        ],
        approvers: [
            { id: 8, name: "Lisa Wong", role: "Marketing Head", avatar: null },
            { id: 11, name: "CMO", role: "Chief Marketing Officer", avatar: null }
        ],
        signatories: [
            { id: 8, name: "Lisa Wong", role: "Marketing Head", avatar: null }
        ],
        leaveRequests: [
            { id: 1, user: "Tom Smith", type: "Personal Leave", days: 3, status: "approved", date: "2024-01-12" },
            { id: 2, user: "Emma Davis", type: "Maternity Leave", days: 90, status: "approved", date: "2024-01-10" },
            { id: 3, user: "John Writer", type: "Annual Leave", days: 7, status: "pending", date: "2024-01-16" }
        ],
        department: "Marketing",
        location: "New York Office",
        stories: [
            { id: 1, title: "Q2 Campaign Launch", date: "2024-01-25" },
            { id: 2, title: "Brand Guidelines Updated", date: "2024-01-22" }
        ],
        pendingApprovals: 1,
        isDefault: false,
        createdAt: "2024-01-08",
        status: "active"
    },
    {
        id: 3,
        name: "Sales Team",
        code: "SAL-001",
        color: "#fa8c16",
        icon: <TeamOutlined />,
        description: "Sales operations and client management",
        members: 35,
        membersList: [
            { id: 12, name: "Robert Johnson", role: "Sales Manager", avatar: null },
            { id: 13, name: "Sarah Miller", role: "Account Exec", avatar: null },
            { id: 14, name: "James Wilson", role: "Business Dev", avatar: null }
        ],
        approvers: [
            { id: 12, name: "Robert Johnson", role: "Sales Manager", avatar: null }
        ],
        signatories: [
            { id: 12, name: "Robert Johnson", role: "Sales Manager", avatar: null },
            { id: 15, name: "Sales Director", role: "Director", avatar: null }
        ],
        leaveRequests: [
            { id: 1, user: "Sarah Miller", type: "Annual Leave", days: 10, status: "pending", date: "2024-01-17" },
            { id: 2, user: "James Wilson", type: "Sick Leave", days: 1, status: "approved", date: "2024-01-15" },
            { id: 3, user: "Mike Sales", type: "Emergency Leave", days: 2, status: "pending", date: "2024-01-16" }
        ],
        department: "Sales",
        location: "Chicago Branch",
        stories: [
            { id: 1, title: "Monthly Sales Review", date: "2024-01-28" },
            { id: 2, title: "New Client Onboarding", date: "2024-01-24" }
        ],
        pendingApprovals: 2,
        isDefault: false,
        createdAt: "2024-01-10",
        status: "active"
    }
];

const GroupListPage = () => {
    const [groups, setGroups] = useState(sampleGroups);
    const [expandedGroupId, setExpandedGroupId] = useState(null);
    const [searchText, setSearchText] = useState("");
    const [filterStatus, setFilterStatus] = useState("all");
    const [isCreateModalVisible, setIsCreateModalVisible] = useState(false);
    const [selectedGroup, setSelectedGroup] = useState(null);
    const [loading, setLoading] = useState(false);
    
    const [form] = Form.useForm();

    // Toggle group expansion
    const toggleGroup = (groupId) => {
        if (expandedGroupId === groupId) {
            setExpandedGroupId(null);
        } else {
            setExpandedGroupId(groupId);
        }
    };

    // Filter groups based on search and filter
    const filteredGroups = groups.filter(group => {
        const matchesSearch = searchText === "" || 
            group.name.toLowerCase().includes(searchText.toLowerCase()) ||
            group.code.toLowerCase().includes(searchText.toLowerCase()) ||
            group.description.toLowerCase().includes(searchText.toLowerCase());
        
        const matchesFilter = filterStatus === "all" || 
            (filterStatus === "default" && group.isDefault) ||
            (filterStatus === "active" && group.status === "active");
        
        return matchesSearch && matchesFilter;
    });

    // Handle create group
    const handleCreateGroup = (values) => {
        setLoading(true);
        // Simulate API call
        setTimeout(() => {
            const newGroup = {
                id: groups.length,
                ...values,
                members: 0,
                pendingApprovals: 0,
                isDefault: false,
                status: "active",
                createdAt: new Date().toISOString().split('T')[0],
                membersList: [],
                approvers: [],
                signatories: [],
                leaveRequests: [],
                stories: []
            };
            
            setGroups([...groups, newGroup]);
            setIsCreateModalVisible(false);
            form.resetFields();
            message.success("Group created successfully!");
            setLoading(false);
        }, 1000);
    };

    // Handle delete group
    const handleDeleteGroup = (groupId) => {
        Modal.confirm({
            title: 'Delete Group',
            content: 'Are you sure you want to delete this group? This action cannot be undone.',
            okText: 'Delete',
            okType: 'danger',
            cancelText: 'Cancel',
            onOk: () => {
                const updatedGroups = groups.filter(group => group.id !== groupId);
                setGroups(updatedGroups);
                message.success('Group deleted successfully');
            }
        });
    };

    // Get status color
    const getStatusColor = (status) => {
        switch(status?.toLowerCase()) {
            case 'approved': return '#52c41a';
            case 'pending': return '#fa8c16';
            case 'rejected': return '#f5222d';
            default: return '#d9d9d9';
        }
    };

    // Get status icon
    const getStatusIcon = (status) => {
        switch(status?.toLowerCase()) {
            case 'approved': return <CheckCircleOutlined />;
            case 'pending': return <ClockCircleOutlined />;
            default: return null;
        }
    };

    // Group dropdown menu items
    const getGroupMenuItems = (group) => [
        {
            key: 'view',
            icon: <EyeOutlined />,
            label: 'View Details'
        },
        {
            key: 'edit',
            icon: <EditOutlined />,
            label: 'Edit Group'
        },
        {
            key: 'members',
            icon: <UserAddOutlined />,
            label: 'Manage Members'
        },
        {
            type: 'divider'
        },
        {
            key: 'delete',
            icon: <DeleteOutlined />,
            label: 'Delete Group',
            danger: true,
            disabled: group.isDefault
        }
    ];

    return (
        <div className="group-list-page">
            {/* Header */}
            <div className="page-header">
                <div className="header-left">
                    <h1>
                        <TeamOutlined /> Groups
                    </h1>
                    <p className="subtitle">Manage and organize your team groups</p>
                </div>
                <div className="header-right">
                    <Button 
                        type="primary" 
                        icon={<PlusOutlined />}
                        onClick={() => setIsCreateModalVisible(true)}
                    >
                        Create Group
                    </Button>
                </div>
            </div>

            {/* Filters and Search */}
            <Card className="filters-card">
                <Row gutter={[16, 16]} align="middle">
                    <Col xs={24} sm={12} md={8} lg={6}>
                        <Search
                            placeholder="Search groups..."
                            prefix={<SearchOutlined />}
                            value={searchText}
                            onChange={(e) => setSearchText(e.target.value)}
                            allowClear
                        />
                    </Col>
                    <Col xs={24} sm={12} md={8} lg={6}>
                        <Select
                            placeholder="Filter by status"
                            style={{ width: '100%' }}
                            value={filterStatus}
                            onChange={setFilterStatus}
                            suffixIcon={<FilterOutlined />}
                        >
                            <Option value="all">All Groups</Option>
                            <Option value="active">Active Only</Option>
                            <Option value="default">Default Groups</Option>
                        </Select>
                    </Col>
                    <Col xs={24} md={8} lg={6}>
                        <Space>
                            <Badge count={groups.length} showZero>
                                <Tag color="blue">Total Groups</Tag>
                            </Badge>
                            <Badge count={groups.reduce((sum, g) => sum + g.pendingApprovals, 0)}>
                                <Tag color="orange">Pending</Tag>
                            </Badge>
                        </Space>
                    </Col>
                </Row>
            </Card>

            {/* Groups List */}
            <div className="groups-container">
                {filteredGroups.map((group) => {
                    const isExpanded = expandedGroupId === group.id;
                    
                    return (
                        <motion.div
                            key={group.id}
                            className="group-card-wrapper"
                            layout
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.3 }}
                        >
                            <Card 
                                className={`group-card ${isExpanded ? 'expanded' : ''} ${group.isDefault ? 'default-group' : ''}`}
                                hoverable
                            >
                                {/* Card Header */}
                                <div className="group-card-header" onClick={() => toggleGroup(group.id)}>
                                    <div className="header-left">
                                        <Badge 
                                            dot={group.isDefault}
                                            color="blue"
                                            offset={[-5, 0]}
                                        >
                                            <Avatar
                                                size={48}
                                                icon={group.icon}
                                                style={{
                                                    backgroundColor: group.color,
                                                    cursor: 'pointer'
                                                }}
                                            />
                                        </Badge>
                                        
                                        <div className="group-basic-info">
                                            <div className="group-title">
                                                <h3>
                                                    {group.name}
                                                    {group.isDefault && (
                                                        <Tag color="blue" size="small" style={{ marginLeft: 8 }}>
                                                            Default
                                                        </Tag>
                                                    )}
                                                </h3>
                                                <span className="group-code">{group.code}</span>
                                            </div>
                                            <p className="group-description">{group.description}</p>
                                            
                                            <div className="group-meta">
                                                <Space size={[16, 8]} wrap>
                                                    <span>
                                                        <UserOutlined /> {group.members} members
                                                    </span>
                                                    <span>
                                                        <CrownOutlined /> {group.approvers.length} approvers
                                                    </span>
                                                    <span>
                                                        <EnvironmentOutlined /> {group.location}
                                                    </span>
                                                    {group.pendingApprovals > 0 && (
                                                        <Badge 
                                                            count={group.pendingApprovals} 
                                                            style={{ 
                                                                backgroundColor: group.color 
                                                            }}
                                                        />
                                                    )}
                                                </Space>
                                            </div>
                                        </div>
                                    </div>
                                    
                                    <div className="header-right">
                                        <Button
                                            type="text"
                                            icon={isExpanded ? <DownOutlined /> : <RightOutlined />}
                                            size="small"
                                        />
                                        <Dropdown
                                            menu={{
                                                items: getGroupMenuItems(group),
                                                onClick: ({ key }) => {
                                                    if (key === 'delete') {
                                                        handleDeleteGroup(group.id);
                                                    }
                                                }
                                            }}
                                            trigger={['click']}
                                            placement="bottomRight"
                                        >
                                            <Button type="text" icon={<MoreOutlined />} size="small" />
                                        </Dropdown>
                                    </div>
                                </div>

                                {/* Expanded Content */}
                                <AnimatePresence>
                                    {isExpanded && (
                                        <motion.div
                                            className="expanded-content"
                                            initial={{ opacity: 0, height: 0 }}
                                            animate={{ opacity: 1, height: 'auto' }}
                                            exit={{ opacity: 0, height: 0 }}
                                            transition={{ duration: 0.2 }}
                                        >
                                            <Divider />
                                            
                                            <Row gutter={[24, 16]}>
                                                {/* Left Column - Details */}
                                                <Col xs={24} lg={12}>
                                                    <div className="details-section">
                                                        <h4><BookOutlined /> Group Details</h4>
                                                        <div className="detail-item">
                                                            <span className="label">Department:</span>
                                                            <span className="value">{group.department}</span>
                                                        </div>
                                                        <div className="detail-item">
                                                            <span className="label">Created:</span>
                                                            <span className="value">{group.createdAt}</span>
                                                        </div>
                                                        <div className="detail-item">
                                                            <span className="label">Status:</span>
                                                            <Tag color={group.status === 'active' ? 'green' : 'red'}>
                                                                {group.status}
                                                            </Tag>
                                                        </div>
                                                    </div>

                                                    {/* Approvers */}
                                                    <div className="details-section">
                                                        <h4><CrownOutlined /> Approvers</h4>
                                                        <div className="approvers-list">
                                                            {group.approvers.map((approver, index) => (
                                                                <Tooltip key={index} title={`${approver.name} - ${approver.role}`}>
                                                                    <div className="approver-item">
                                                                        <Avatar 
                                                                            size="small"
                                                                            icon={<UserOutlined />}
                                                                            style={{ marginRight: 8 }}
                                                                        />
                                                                        <span>{approver.name}</span>
                                                                    </div>
                                                                </Tooltip>
                                                            ))}
                                                        </div>
                                                    </div>
                                                </Col>

                                                {/* Right Column - Activity */}
                                                <Col xs={24} lg={12}>
                                                    {/* Recent Leave Requests */}
                                                    <div className="details-section">
                                                        <h4><CalendarOutlined /> Recent Leave Requests</h4>
                                                        <div className="leave-requests">
                                                            {group.leaveRequests.slice(0, 3).map((leave, index) => (
                                                                <div key={index} className="leave-item">
                                                                    <div className="leave-info">
                                                                        <span className="user">{leave.user}</span>
                                                                        <span className="type">{leave.type}</span>
                                                                        <span className="days">{leave.days} days</span>
                                                                    </div>
                                                                    <Tag 
                                                                        color={getStatusColor(leave.status)}
                                                                        icon={getStatusIcon(leave.status)}
                                                                        style={{ marginLeft: 'auto' }}
                                                                    >
                                                                        {leave.status}
                                                                    </Tag>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>

                                                    {/* Recent Updates */}
                                                    <div className="details-section">
                                                        <h4><ClockIcon /> Recent Updates</h4>
                                                        <div className="updates-list">
                                                            {group.stories.map((story, index) => (
                                                                <div key={index} className="update-item">
                                                                    <div className="update-dot" style={{ backgroundColor: group.color }} />
                                                                    <div className="update-content">
                                                                        <p>{story.title}</p>
                                                                        <small>{story.date}</small>
                                                                    </div>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>
                                                </Col>
                                            </Row>

                                            {/* Action Buttons */}
                                            <Divider />
                                            <div className="action-buttons">
                                                <Space>
                                                    <Button 
                                                        type="primary" 
                                                        icon={<EyeOutlined />}
                                                        onClick={() => setSelectedGroup(group)}
                                                    >
                                                        View Full Details
                                                    </Button>
                                                    <Button 
                                                        icon={<EditOutlined />}
                                                        onClick={() => message.info('Edit feature coming soon')}
                                                    >
                                                        Edit Group
                                                    </Button>
                                                    <Button 
                                                        icon={<UsergroupAddOutlined />}
                                                        onClick={() => message.info('Manage members feature coming soon')}
                                                    >
                                                        Manage Members
                                                    </Button>
                                                </Space>
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </Card>
                        </motion.div>
                    );
                })}
            </div>

            {/* Create Group Modal */}
            <Modal
                title="Create New Group"
                open={isCreateModalVisible}
                onCancel={() => {
                    setIsCreateModalVisible(false);
                    form.resetFields();
                }}
                footer={null}
                width={600}
            >
                <Form
                    form={form}
                    layout="vertical"
                    onFinish={handleCreateGroup}
                >
                    <Row gutter={16}>
                        <Col span={12}>
                            <Form.Item
                                name="name"
                                label="Group Name"
                                rules={[{ required: true, message: 'Please enter group name' }]}
                            >
                                <Input placeholder="Enter group name" />
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item
                                name="code"
                                label="Group Code"
                                rules={[{ required: true, message: 'Please enter group code' }]}
                            >
                                <Input placeholder="Enter group code" />
                            </Form.Item>
                        </Col>
                    </Row>
                    
                    <Form.Item
                        name="description"
                        label="Description"
                    >
                        <Input.TextArea 
                            placeholder="Enter group description" 
                            rows={3}
                        />
                    </Form.Item>
                    
                    <Row gutter={16}>
                        <Col span={12}>
                            <Form.Item
                                name="department"
                                label="Department"
                            >
                                <Input placeholder="Enter department" />
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item
                                name="location"
                                label="Location"
                            >
                                <Input placeholder="Enter location" />
                            </Form.Item>
                        </Col>
                    </Row>
                    
                    <Form.Item
                        name="color"
                        label="Group Color"
                        initialValue="#1890ff"
                    >
                        <Input type="color" style={{ width: 60, height: 32 }} />
                    </Form.Item>
                    
                    <div className="modal-footer">
                        <Button 
                            onClick={() => {
                                setIsCreateModalVisible(false);
                                form.resetFields();
                            }}
                        >
                            Cancel
                        </Button>
                        <Button 
                            type="primary" 
                            htmlType="submit"
                            loading={loading}
                        >
                            Create Group
                        </Button>
                    </div>
                </Form>
            </Modal>

            {/* Empty State */}
            {filteredGroups.length === 0 && (
                <Card className="empty-state">
                    <div className="empty-content">
                        <TeamOutlined style={{ fontSize: 64, color: '#d9d9d9' }} />
                        <h3>No groups found</h3>
                        <p>Try adjusting your search or create a new group</p>
                        <Button 
                            type="primary" 
                            icon={<PlusOutlined />}
                            onClick={() => setIsCreateModalVisible(true)}
                        >
                            Create Your First Group
                        </Button>
                    </div>
                </Card>
            )}
        </div>
    );
};

export default GroupListPage;