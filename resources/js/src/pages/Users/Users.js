// src/components/users/Users.tsx
import React, {
    useState,
    useEffect,
    useCallback,
    useMemo,
    useRef,
} from "react";
import {
    Card,
    Table,
    Button,
    Space,
    Modal,
    message,
    Tooltip,
    Tag,
    Avatar,
    Popconfirm,
    Input,
    Select,
    Form,
    Row,
    Col,
    Badge,
    Dropdown,
    MenuProps,
    Typography,
    Divider,
    Upload,
    Statistic,
    Progress,
    Grid,
    Segmented,
    Alert,
} from "antd";
import {
    PlusCircleOutlined,
    EditOutlined,
    DeleteOutlined,
    EyeOutlined,
    SearchOutlined,
    FilterOutlined,
    ReloadOutlined,
    DownloadOutlined,
    UploadOutlined,
    MoreOutlined,
    UserOutlined,
    ExportOutlined,
    ImportOutlined,
    TeamOutlined,
    CheckCircleOutlined,
    ClockCircleOutlined,
    StopOutlined,
    UserAddOutlined,
    CrownOutlined,
    EditFilled,
    EyeFilled,
    SettingOutlined,
    FilterFilled,
    SortAscendingOutlined,
    SortDescendingOutlined,
    StarOutlined,
    MailOutlined,
    CalendarOutlined,
    IdcardOutlined,
    SafetyCertificateOutlined,
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";

// Hooks
import {
    useUsersQuery,
    useDeleteUserMutation,
    useBulkDeleteUsersMutation,
    useExportUsersMutation,
    useUserQuery,
} from "../../hooks/queries/users.query";
import {
    useUserFilters,
    useUserActions,
    useFilteredUsers,
} from "../../stores/useUserStore";

// Types
import { User, UserRole, UserStatus } from "../../types";

// Components
import LoadingSpinner from "../../components/shared/Loading";
import ErrorBoundary from "../../components/shared/ErrorBoundary";
import UserFormModal from "../../components/Users/UserFormModal";
import UserDetailDrawer from "../../components/Users/UserDetailDrawer";
import UserFilters from "../../components/Users/UserFilters";
import BulkActions from "../../components/Users/BulkActions";

// Constants
const PAGE_SIZE_OPTIONS = ["10", "20", "50", "100"];
const { useBreakpoint } = Grid;

const Users: React.FC = () => {
    const navigate = useNavigate();
    const [form] = Form.useForm();
    const prevIsFetchingRef = useRef(false);
    const screens = useBreakpoint();

    // State
    const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
    const [showFilters, setShowFilters] = useState(false);
    const [showFormModal, setShowFormModal] = useState(false);
    const [showDetailDrawer, setShowDetailDrawer] = useState(false);
    const [editingUser, setEditingUser] = useState<User | null>(null);
    const [selectedUserId, setSelectedUserId] = useState<number | null>(null);
    const [searchText, setSearchText] = useState("");
    const [exportLoading, setExportLoading] = useState(false);
    const [importVisible, setImportVisible] = useState(false);
    const [viewMode, setViewMode] = useState<"table" | "card">("table");
    const [stats, setStats] = useState({
        total: 0,
        active: 0,
        inactive: 0,
        suspended: 0,
    });

    // Store hooks
    const filters = useUserFilters();
    const { setFilters, resetFilters, setLoading, selectUser } = useUserActions();
    const filteredUsers = useFilteredUsers();

    // Query hooks
    const {
        data: usersData,
        isLoading: isLoadingQuery,
        error,
        refetch,
        isFetching,
    } = useUsersQuery(filters, {
        onError: (error: any) => {
            message.error(`Failed to load users: ${error.message}`);
        },
    });

    const { data: selectedUserData } = useUserQuery(selectedUserId!, {
        enabled: !!selectedUserId,
    });

    // Mutation hooks
    const deleteUserMutation = useDeleteUserMutation();
    const bulkDeleteMutation = useBulkDeleteUsersMutation();
    const exportMutation = useExportUsersMutation();

    // Calculate statistics
    useEffect(() => {
        if (usersData && (usersData as any).users) {
            const users = (usersData as any).users;
            const stats = {
                total: users.length,
                active: users.filter((u: User) => u.status === "active").length,
                inactive: users.filter((u: User) => u.status === "inactive").length,
                suspended: users.filter((u: User) => u.status === "suspended").length,
            };
            setStats(stats);
        }
    }, [usersData]);

    const isLoading = isLoadingQuery || isFetching;
    const hasUsers = usersData && typeof usersData === "object" && "users" in usersData;
    const users: User[] = hasUsers ? (usersData as any).users : filteredUsers;
    const pagination = usersData && typeof usersData === "object" && "pagination" in usersData
        ? (usersData as any).pagination
        : undefined;
    const selectedUsers = useMemo(
        () => users.filter((user) => selectedRowKeys.includes(user.id)),
        [users, selectedRowKeys]
    );

    // Effects
    useEffect(() => {
        if (selectedUserData) {
            selectUser(selectedUserData);
        }
    }, [selectedUserData, selectUser]);

    useEffect(() => {
        if (prevIsFetchingRef.current !== isFetching) {
            setLoading(isFetching);
            prevIsFetchingRef.current = isFetching;
        }
    }, [isFetching, setLoading]);

    // Handlers
    const handleTableChange = useCallback(
        (pagination: any, filters: any, sorter: any) => {
            const newFilters: any = {};

            if (pagination) {
                newFilters.page = pagination.current;
                newFilters.limit = pagination.pageSize;
            }

            if (sorter && sorter.field) {
                newFilters.sortBy = sorter.field;
                newFilters.sortOrder = sorter.order === "ascend" ? "asc" : "desc";
            }

            if (filters.role) {
                newFilters.role = filters.role[0];
            }

            if (filters.status) {
                newFilters.status = filters.status[0];
            }

            setFilters(newFilters);
        },
        [setFilters]
    );

    const handleSearch = useCallback(
        (value: string) => {
            setFilters({ search: value, page: 1 });
            setSearchText(value);
        },
        [setFilters]
    );

    const handleAddUser = () => {
        setEditingUser(null);
        setShowFormModal(true);
    };

    const handleEditUser = (user: User) => {
        setEditingUser(user);
        setShowFormModal(true);
    };

    const handleViewUser = (userId: number) => {
        setSelectedUserId(userId);
        setShowDetailDrawer(true);
    };

    const handleDeleteUser = async (userId: number) => {
        try {
            await deleteUserMutation.mutateAsync(userId);
            message.success("User deleted successfully");
            setSelectedRowKeys(selectedRowKeys.filter((key) => key !== userId));
        } catch (error) {
            message.error("Failed to delete user");
        }
    };

    const handleBulkDelete = async () => {
        if (selectedRowKeys.length === 0) return;

        Modal.confirm({
            title: (
                <Space>
                    <DeleteOutlined style={{ color: '#ff4d4f' }} />
                    <span>Confirm Bulk Delete</span>
                </Space>
            ),
            content: (
                <div>
                    <Alert
                        message="Warning"
                        description={`Are you sure you want to delete ${selectedRowKeys.length} selected user(s)? This action cannot be undone.`}
                        type="warning"
                        showIcon
                        style={{ marginBottom: 16 }}
                    />
                    <div style={{ fontSize: '12px', color: '#8c8c8c' }}>
                        Selected users will be permanently removed from the system.
                    </div>
                </div>
            ),
            okText: "Delete",
            okType: "danger",
            cancelText: "Cancel",
            icon: null,
            onOk: async () => {
                try {
                    await bulkDeleteMutation.mutateAsync(selectedRowKeys as number[]);
                    message.success(`${selectedRowKeys.length} user(s) deleted successfully`);
                    setSelectedRowKeys([]);
                } catch (error) {
                    message.error("Failed to delete users");
                }
            },
        });
    };

    const handleExport = async () => {
        setExportLoading(true);
        try {
            const response = await exportMutation.mutateAsync(filters);
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement("a");
            link.href = url;
            link.setAttribute("download", `users_export_${Date.now()}.xlsx`);
            document.body.appendChild(link);
            link.click();
            link.remove();
            message.success("Export completed successfully");
        } catch (error) {
            message.error("Export failed");
        } finally {
            setExportLoading(false);
        }
    };

    const handleResetFilters = () => {
        resetFilters();
        form.resetFields();
        setSelectedRowKeys([]);
        message.success("Filters have been reset");
    };

    const handleRowSelection = {
        selectedRowKeys,
        onChange: setSelectedRowKeys,
        selections: [
            Table.SELECTION_ALL,
            Table.SELECTION_INVERT,
            Table.SELECTION_NONE,
        ],
    };

    // Statistics Cards
    const statCards = (
        <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
            <Col xs={24} sm={12} md={6}>
                <Card
                    hoverable
                    style={{ 
                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                        color: 'white'
                    }}
                    bodyStyle={{ padding: '16px' }}
                >
                    <Statistic
                        title={
                            <Space align="center" style={{ color: 'rgba(255,255,255,0.8)' }}>
                                <TeamOutlined />
                                <span>Total Users</span>
                            </Space>
                        }
                        value={stats.total}
                        valueStyle={{ color: 'white', fontSize: '28px', fontWeight: 'bold' }}
                        prefix={<UserOutlined />}
                    />
                </Card>
            </Col>
            <Col xs={24} sm={12} md={6}>
                <Card
                    hoverable
                    style={{ 
                        background: 'linear-gradient(135deg, #52c41a 0%, #389e0d 100%)',
                        color: 'white'
                    }}
                    bodyStyle={{ padding: '16px' }}
                >
                    <Statistic
                        title={
                            <Space align="center" style={{ color: 'rgba(255,255,255,0.8)' }}>
                                <CheckCircleOutlined />
                                <span>Active</span>
                            </Space>
                        }
                        value={stats.active}
                        valueStyle={{ color: 'white', fontSize: '28px', fontWeight: 'bold' }}
                        prefix={<CheckCircleOutlined />}
                    />
                </Card>
            </Col>
            <Col xs={24} sm={12} md={6}>
                <Card
                    hoverable
                    style={{ 
                        background: 'linear-gradient(135deg, #faad14 0%, #d48806 100%)',
                        color: 'white'
                    }}
                    bodyStyle={{ padding: '16px' }}
                >
                    <Statistic
                        title={
                            <Space align="center" style={{ color: 'rgba(255,255,255,0.8)' }}>
                                <ClockCircleOutlined />
                                <span>Inactive</span>
                            </Space>
                        }
                        value={stats.inactive}
                        valueStyle={{ color: 'white', fontSize: '28px', fontWeight: 'bold' }}
                        prefix={<ClockCircleOutlined />}
                    />
                </Card>
            </Col>
            <Col xs={24} sm={12} md={6}>
                <Card
                    hoverable
                    style={{ 
                        background: 'linear-gradient(135deg, #ff4d4f 0%, #cf1322 100%)',
                        color: 'white'
                    }}
                    bodyStyle={{ padding: '16px' }}
                >
                    <Statistic
                        title={
                            <Space align="center" style={{ color: 'rgba(255,255,255,0.8)' }}>
                                <StopOutlined />
                                <span>Suspended</span>
                            </Space>
                        }
                        value={stats.suspended}
                        valueStyle={{ color: 'white', fontSize: '28px', fontWeight: 'bold' }}
                        prefix={<StopOutlined />}
                    />
                </Card>
            </Col>
        </Row>
    );

    // Enhanced Columns configuration
    const columns = [
        {
            title: (
                <Space>
                    <UserOutlined />
                    <span>User</span>
                </Space>
            ),
            dataIndex: "name",
            key: "user",
            width: 280,
            fixed: "left" as const,
            render: (text: string, record: User) => (
                <Space align="start">
                    <Badge
                        status={record.status === "active" ? "success" : "default"}
                        offset={[-5, 40]}
                        size="default"
                    >
                        <Avatar
                            size={44}
                            src={record.avatar}
                            style={{
                                backgroundColor: '#1890ff',
                                border: '2px solid #fff',
                                boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                            }}
                            icon={<UserOutlined />}
                        >
                            {!record.avatar && text?.charAt(0).toUpperCase()}
                        </Avatar>
                    </Badge>
                    <div style={{ lineHeight: 1.4 }}>
                        <Space align="center" style={{ marginBottom: 4 }}>
                            <Typography.Text strong style={{ fontSize: '15px' }}>
                                {text}
                            </Typography.Text>
                            {record.role === "admin" && (
                                <CrownOutlined style={{ color: '#faad14', fontSize: '14px' }} />
                            )}
                        </Space>
                        <Space size={4} align="center" style={{ marginBottom: 4 }}>
                            <MailOutlined style={{ fontSize: '12px', color: '#8c8c8c' }} />
                            <Typography.Text
                                type="secondary"
                                style={{ fontSize: "12px" }}
                            >
                                {record.email}
                            </Typography.Text>
                        </Space>
                        <Tag
                            color={record.role === "admin" ? "gold" : "blue"}
                            style={{ 
                                fontSize: '11px', 
                                padding: '2px 8px',
                                borderRadius: '10px'
                            }}
                        >
                            {record.role}
                        </Tag>
                    </div>
                </Space>
            ),
            sorter: true,
        },
        {
            title: (
                <Space>
                    <IdcardOutlined />
                    <span>Role</span>
                </Space>
            ),
            dataIndex: "role",
            key: "role",
            width: 140,
            filters: [
                { text: "Admin", value: "admin" },
                { text: "Editor", value: "editor" },
                { text: "Viewer", value: "viewer" },
                { text: "User", value: "user" },
            ],
            render: (role: UserRole) => {
                const roleConfig: Record<UserRole, { color: string; icon: React.ReactNode }> = {
                    admin: { color: "gold", icon: <CrownOutlined /> },
                    editor: { color: "blue", icon: <EditFilled /> },
                    viewer: { color: "green", icon: <EyeFilled /> },
                    user: { color: "default", icon: <UserOutlined /> },
                };
                return (
                    <Space>
                        {roleConfig[role].icon}
                        <Tag
                            color={roleConfig[role].color}
                            style={{ 
                                textTransform: "capitalize",
                                borderRadius: '12px',
                                padding: '2px 12px'
                            }}
                        >
                            {role}
                        </Tag>
                    </Space>
                );
            },
        },
        {
            title: (
                <Space>
                    <SafetyCertificateOutlined />
                    <span>Status</span>
                </Space>
            ),
            dataIndex: "status",
            key: "status",
            width: 130,
            filters: [
                { text: "Active", value: "active" },
                { text: "Inactive", value: "inactive" },
                { text: "Suspended", value: "suspended" },
            ],
            render: (status: UserStatus) => {
                const statusConfig: Record<
                    UserStatus,
                    { color: string; text: string; icon: React.ReactNode }
                > = {
                    active: { 
                        color: "success", 
                        text: "Active", 
                        icon: <CheckCircleOutlined /> 
                    },
                    inactive: { 
                        color: "default", 
                        text: "Inactive", 
                        icon: <ClockCircleOutlined /> 
                    },
                    suspended: { 
                        color: "error", 
                        text: "Suspended", 
                        icon: <StopOutlined /> 
                    },
                };
                return (
                    <Badge
                        status={statusConfig[status].color as any}
                        text={
                            <Space size={4}>
                                {statusConfig[status].icon}
                                <span>{statusConfig[status].text}</span>
                            </Space>
                        }
                    />
                );
            },
        },
        {
            title: (
                <Space>
                    <CalendarOutlined />
                    <span>Last Login</span>
                </Space>
            ),
            dataIndex: "last_login_at",
            key: "last_login_at",
            width: 200,
            render: (date: string) => (
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <Typography.Text type="secondary" style={{ fontSize: '12px' }}>
                        {date ? new Date(date).toLocaleDateString() : "Never"}
                    </Typography.Text>
                    {date && (
                        <Typography.Text type="secondary" style={{ fontSize: '11px' }}>
                            {new Date(date).toLocaleTimeString()}
                        </Typography.Text>
                    )}
                </div>
            ),
            sorter: true,
        },
        {
            title: (
                <Space>
                    <CalendarOutlined />
                    <span>Created</span>
                </Space>
            ),
            dataIndex: "created_at",
            key: "created_at",
            width: 160,
            render: (date: string) => (
                <Typography.Text type="secondary">
                    {new Date(date).toLocaleDateString()}
                </Typography.Text>
            ),
            sorter: true,
        },
        {
            title: (
                <Space>
                    <SettingOutlined />
                    <span>Actions</span>
                </Space>
            ),
            key: "actions",
            width: 150,
            fixed: "right" as const,
            render: (_: any, record: User) => {
                const menuItems: MenuProps["items"] = [
                    {
                        key: "view",
                        icon: <EyeOutlined />,
                        label: "View Details",
                        onClick: () => handleViewUser(record.id),
                    },
                    {
                        key: "edit",
                        icon: <EditOutlined />,
                        label: "Edit User",
                        onClick: () => handleEditUser(record),
                    },
                    {
                        type: "divider",
                    },
                    {
                        key: "delete",
                        icon: <DeleteOutlined />,
                        label: "Delete User",
                        danger: true,
                        onClick: () => handleDeleteUser(record.id),
                    },
                ];

                return (
                    <Space size="small">
                        <Tooltip title="Quick View">
                            <Button
                                type="text"
                                icon={<EyeOutlined style={{ color: '#1890ff' }} />}
                                onClick={() => handleViewUser(record.id)}
                                style={{ padding: '4px 8px' }}
                            />
                        </Tooltip>
                        <Tooltip title="Edit User">
                            <Button
                                type="text"
                                icon={<EditOutlined style={{ color: '#52c41a' }} />}
                                onClick={() => handleEditUser(record)}
                                style={{ padding: '4px 8px' }}
                            />
                        </Tooltip>
                        <Dropdown
                            menu={{ items: menuItems }}
                            trigger={["click"]}
                            placement="bottomRight"
                        >
                            <Button 
                                type="text" 
                                icon={<MoreOutlined />}
                                style={{ padding: '4px 8px' }}
                            />
                        </Dropdown>
                    </Space>
                );
            },
        },
    ];

    // Enhanced Search and Filter components
    const searchBar = (
        <Card 
            size="small" 
            style={{ marginBottom: 16, borderRadius: '8px' }}
            bodyStyle={{ padding: '16px' }}
        >
            <Row gutter={[16, 16]} align="middle">
                <Col xs={24} sm={12} md={6}>
                    <Input.Search
                        placeholder="Search by name, email..."
                        allowClear
                        value={searchText}
                        onChange={(e) => setSearchText(e.target.value)}
                        onSearch={handleSearch}
                        prefix={<SearchOutlined style={{ color: '#bfbfbf' }} />}
                        enterButton={<SearchOutlined />}
                        size="large"
                        style={{ width: "100%" }}
                    />
                </Col>
                <Col xs={24} sm={12} md={5}>
                    <Select
                        placeholder="All Roles"
                        size="large"
                        style={{ width: "100%" }}
                        allowClear
                        suffixIcon={<UserOutlined />}
                        value={filters.role}
                        onChange={(value) => setFilters({ role: value, page: 1 })}
                        options={[
                            { label: "Administrator", value: "admin" },
                            { label: "Editor", value: "editor" },
                            { label: "Viewer", value: "viewer" },
                            { label: "Regular User", value: "user" },
                        ]}
                    />
                </Col>
                <Col xs={24} sm={12} md={5}>
                    <Select
                        placeholder="All Status"
                        size="large"
                        style={{ width: "100%" }}
                        allowClear
                        suffixIcon={<SafetyCertificateOutlined />}
                        value={filters.status}
                        onChange={(value) => setFilters({ status: value, page: 1 })}
                        options={[
                            { label: "Active", value: "active" },
                            { label: "Inactive", value: "inactive" },
                            { label: "Suspended", value: "suspended" },
                        ]}
                    />
                </Col>
                <Col xs={24} sm={12} md={8}>
                    <Space wrap style={{ width: '100%', justifyContent: screens.xs ? 'flex-start' : 'flex-end' }}>
                        <Button
                            icon={<FilterFilled />}
                            onClick={() => setShowFilters(!showFilters)}
                            type={showFilters ? "primary" : "default"}
                            size="large"
                        >
                            {showFilters ? "Hide Filters" : "Advanced Filters"}
                        </Button>
                        <Button
                            icon={<ReloadOutlined />}
                            onClick={handleResetFilters}
                            size="large"
                            danger={selectedRowKeys.length > 0}
                        >
                            Reset
                        </Button>
                    </Space>
                </Col>
            </Row>
        </Card>
    );

    // Enhanced Main table
    const mainTable = (
        <Card
            bodyStyle={{ padding: 0 }}
            style={{ 
                borderRadius: '8px',
                overflow: 'hidden',
                boxShadow: '0 2px 8px rgba(0,0,0,0.06)'
            }}
        >
            <Table
                columns={columns}
                dataSource={users}
                rowKey="id"
                rowSelection={handleRowSelection}
                loading={isLoading}
                scroll={{ x: 1300 }}
                pagination={{
                    current: pagination?.current_page || 1,
                    pageSize: pagination?.per_page || 10,
                    total: pagination?.total || 0,
                    pageSizeOptions: PAGE_SIZE_OPTIONS,
                    showSizeChanger: true,
                    showQuickJumper: true,
                    showTotal: (total, range) => (
                        <Space style={{ padding: '8px' }}>
                            <Typography.Text type="secondary">
                                Showing {range[0]}-{range[1]} of {total} users
                            </Typography.Text>
                            {selectedRowKeys.length > 0 && (
                                <Tag color="blue" style={{ marginLeft: 8 }}>
                                    <UserOutlined style={{ marginRight: 4 }} />
                                    {selectedRowKeys.length} selected
                                </Tag>
                            )}
                        </Space>
                    ),
                    size: "default",
                }}
                onChange={handleTableChange}
                rowClassName={(record) =>
                    record.status === "inactive" ? "row-inactive" : ""
                }
                onRow={(record) => ({
                    onClick: () => {
                        // Optional: Handle row click
                    },
                    onDoubleClick: () => handleViewUser(record.id),
                })}
            />
        </Card>
    );

    // Enhanced Bulk actions
    const bulkActions = selectedRowKeys.length > 0 && (
        <Card
            style={{ 
                marginBottom: 16,
                background: 'linear-gradient(135deg, #f6ffed 0%, #e6f7ff 100%)',
                border: '1px solid #91d5ff'
            }}
        >
            <BulkActions
                selectedCount={selectedRowKeys.length}
                onDelete={handleBulkDelete}
                onExport={() => {
                    handleExport();
                }}
                onStatusChange={(status) => {
                    // Bulk status update
                    message.info(`Bulk status update to ${status} coming soon!`);
                }}
                loading={bulkDeleteMutation.isLoading}
            />
        </Card>
    );

    if (error) {
        return (
            <ErrorBoundary
                message={error.message}
                onRetry={refetch}
                error={error}
                children={undefined}
            />
        );
    }

    return (
        <ErrorBoundary>
            <div className="users-page">
                {/* Statistics Section */}
                {/* {statCards} */}

                {/* Main Content Card */}
                <Card
                    title={
                        <Space align="center">
                            <div style={{
                                width: 40,
                                height: 40,
                                borderRadius: '50%',
                                background: 'linear-gradient(135deg, #1890ff 0%, #0050b3 100%)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                color: 'white'
                            }}>
                                <TeamOutlined style={{ fontSize: '20px' }} />
                            </div>
                            <div>
                                <Typography.Title level={4} style={{ margin: 0 }}>
                                    User Management
                                </Typography.Title>
                                {/* <Typography.Text type="secondary" style={{ fontSize: '12px' }}>
                                    Manage and monitor all system users
                                </Typography.Text> */}
                            </div>
                        </Space>
                    }
                    extra={
                        <Space wrap>
                            <Tooltip title="Add New User">
                                <Button
                                    type="primary"
                                    icon={<PlusCircleOutlined />}
                                    onClick={handleAddUser}
                                    loading={isLoading}
                                   // size="large"
                                    // style={{
                                    //     background: 'linear-gradient(135deg, #52c41a 0%, #389e0d 100%)',
                                    //     border: 'none'
                                    // }}
                                >
                                    <UserAddOutlined style={{ marginRight: 6 }} />
                                    Add User
                                </Button>
                            </Tooltip>
                            <Tooltip title="Export Users">
                                <Button
                                    icon={<ExportOutlined />}
                                    onClick={handleExport}
                                    loading={exportLoading}
                                    //size="large"
                                >
                                    Export Data
                                </Button>
                            </Tooltip>
                            <Tooltip title="Import Users">
                                <Button
                                    icon={<ImportOutlined />}
                                    onClick={() => setImportVisible(true)}
                                   // size="large"
                                >
                                    Import Users
                                </Button>
                            </Tooltip>
                            <Button
                                type="text"
                                icon={isFetching ? <ReloadOutlined spin /> : <ReloadOutlined />}
                                onClick={() => refetch()}
                                size="large"
                                loading={isFetching}
                            />
                        </Space>
                    }
                    style={{ borderRadius: '8px' }}
                    bodyStyle={{ padding: "24px" }}
                >
                    {/* Search and Filters */}
                    {searchBar}

                    {/* Advanced Filters */}
                    {showFilters && (
                        <>
                            <Divider orientation="left" style={{ color: '#1890ff' }}>
                                <FilterFilled style={{ marginRight: 8 }} />
                                Advanced Filters
                            </Divider>
                            <UserFilters />
                            <Divider />
                        </>
                    )}

                    {/* Bulk Actions */}
                    {bulkActions}

                    {/* Users Table */}
                    {mainTable}
                </Card>

                {/* Form Modal */}
                <UserFormModal
                    open={showFormModal}
                    editingUser={editingUser}
                    onClose={() => {
                        setShowFormModal(false);
                        setEditingUser(null);
                    }}
                    onSuccess={() => {
                        setShowFormModal(false);
                        setEditingUser(null);
                        refetch();
                    }}
                />

                {/* Detail Drawer */}
                <UserDetailDrawer
                    open={showDetailDrawer}
                    userId={selectedUserId}
                    onClose={() => {
                        setShowDetailDrawer(false);
                        setSelectedUserId(null);
                    }}
                />

                {/* Import Modal */}
                <Modal
                    title={
                        <Space>
                            <ImportOutlined style={{ color: '#1890ff' }} />
                            <span>Import Users</span>
                        </Space>
                    }
                    open={importVisible}
                    onCancel={() => setImportVisible(false)}
                    footer={null}
                    width={600}
                    styles={{
                        body: { paddingTop: 24 }
                    }}
                >
                    <Alert
                        message="Import Guidelines"
                        description="Upload a CSV or Excel file with user data. The file should contain columns: name, email, role, status."
                        type="info"
                        showIcon
                        style={{ marginBottom: 24 }}
                    />
                    
                    <Form layout="vertical">
                        <Form.Item label="Select File">
                            <Upload.Dragger
                                name="file"
                                multiple={false}
                                accept=".csv,.xlsx,.xls"
                                beforeUpload={() => false}
                                style={{ 
                                    background: '#fafafa',
                                    borderRadius: '8px'
                                }}
                            >
                                <div style={{ padding: '40px 20px' }}>
                                    <p className="ant-upload-drag-icon">
                                        <UploadOutlined style={{ fontSize: '48px', color: '#1890ff' }} />
                                    </p>
                                    <p className="ant-upload-text" style={{ fontSize: '16px', marginBottom: 8 }}>
                                        Click or drag file to upload
                                    </p>
                                    <p className="ant-upload-hint" style={{ color: '#8c8c8c' }}>
                                        Support for CSV or Excel files. Max file size: 10MB
                                    </p>
                                </div>
                            </Upload.Dragger>
                        </Form.Item>
                        
                        <Form.Item style={{ marginTop: 32 }}>
                            <Space>
                                <Button 
                                    type="primary" 
                                    size="large"
                                    icon={<UploadOutlined />}
                                >
                                    Start Import
                                </Button>
                                <Button 
                                    onClick={() => setImportVisible(false)}
                                    size="large"
                                >
                                    Cancel
                                </Button>
                                <Button 
                                    type="link" 
                                    href="/templates/users_template.csv"
                                    download
                                    icon={<DownloadOutlined />}
                                    size="large"
                                >
                                    Download Template
                                </Button>
                            </Space>
                        </Form.Item>
                    </Form>
                </Modal>
            </div>
        </ErrorBoundary>
    );
};

export default Users;