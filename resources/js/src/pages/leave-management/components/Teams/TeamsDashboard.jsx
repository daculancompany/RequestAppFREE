import React, { useState, useEffect } from "react";
import {
    Row,
    Col,
    Card,
    Avatar,
    Tag,
    Button,
    Input,
    Modal,
    Form,
    Select,
    Pagination,
    Space,
    Table,
    Tooltip,
    Badge,
    DatePicker,
    Upload,
    message,
    Divider,
    Typography,
    Spin,
} from "antd";
import {
    SearchOutlined,
    UserAddOutlined,
    EditOutlined,
    ExportOutlined,
    TeamOutlined,
    MailOutlined,
    PhoneOutlined,
    EnvironmentOutlined,
    UserOutlined,
    StarOutlined,
    PlusOutlined,
    CheckOutlined,
    UploadOutlined,
    DeleteOutlined,
    SortAscendingOutlined,
    EyeOutlined,
    EyeInvisibleOutlined,
    CalendarOutlined,
    ApartmentOutlined,
    LockOutlined,
    ReloadOutlined,
} from "@ant-design/icons";
import { motion } from "framer-motion";
import dayjs from "dayjs";
import { useUserDepartments } from "@/hooks/queries/departments.queries";
import { usePositions } from "@/hooks/queries/positions.queries";
import { useMembers, useCreateMember } from "@/hooks/queries/members.queries";

const { TextArea } = Input;
const { Option } = Select;
const { Text } = Typography;

// Transform API data to match your component's structure
const transformMembersData = (members) => {
    if (!members || !Array.isArray(members)) return [];

    return members.map((member) => ({
        id: member.id,
        firstName: member.name?.split(" ")[0] || member.name || "",
        lastName: member.name?.split(" ").slice(1).join(" ") || "",
        email: member.email,
        phone: member.details?.phone || "",
        position: member.details?.position?.position || "N/A",
        department: member.details?.department?.department || "N/A",
        avatar:
            member.avatar ||
            `https://ui-avatars.com/api/?name=${encodeURIComponent(member.name)}&background=random`,
        joinDate: member.created_at
            ? dayjs(member.created_at).format("YYYY-MM-DD")
            : "N/A",
        status: member.status || "active",
        employeeId: `EMP-${member.id.toString().padStart(3, "0")}`,
        location: member.details?.address || "",
        // Store original data for reference
        originalData: member,
    }));
};

// Status badge color
const getStatusColor = (status) => {
    switch (status) {
        case "active":
            return "success";
        case "on-leave":
            return "warning";
        case "inactive":
            return "default";
        default:
            return "processing";
    }
};

// Status text
const getStatusText = (status) => {
    switch (status) {
        case "active":
            return "Active";
        case "on-leave":
            return "On Leave";
        case "inactive":
            return "Inactive";
        default:
            return status;
    }
};

const TeamsDashboard = ({ appContext }) => {
    // Dynamic members from API
    const {
        data: apiMembersData = [],
        isLoading: isLoadingMembers,
        error: membersError,
        refetch: refetchMembers,
    } = useMembers();

    const createMemberMutation = useCreateMember();
    const { data: departments = [] } = useUserDepartments();
    const { data: positions = [], refetch: refetchPositions } = usePositions();

    const [form] = Form.useForm();
    const [createModalVisible, setCreateModalVisible] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);
    const [loading, setLoading] = useState(false);

    // Local states for form
    const [avatarPreview, setAvatarPreview] = useState(null);
    const [showPassword, setShowPassword] = useState(false);
    const [newDepartment, setNewDepartment] = useState("");
    const [newPositionInput, setNewPositionInput] = useState("");

    const [filterStatus, setFilterStatus] = useState("all");
    const [sortField, setSortField] = useState("name");
    const [sortOrder, setSortOrder] = useState("asc");

    const [selectedFile, setSelectedFile] = useState(null);

    const { groups, handleTeamClick } = appContext;

    // Dynamic team members from API
    const teamMembers = transformMembersData(apiMembersData?.data);

    // Filtered and sorted members
    const filteredMembers = React.useMemo(() => {
        let result = [...teamMembers];

        // Apply status filter
        if (filterStatus !== "all") {
            result = result.filter((member) => member.status === filterStatus);
        }

        // Apply search filter
        if (searchQuery) {
            const query = searchQuery.toLowerCase();
            result = result.filter(
                (member) =>
                    member.firstName.toLowerCase().includes(query) ||
                    member.lastName.toLowerCase().includes(query) ||
                    member.email.toLowerCase().includes(query) ||
                    member.position.toLowerCase().includes(query) ||
                    member.department.toLowerCase().includes(query) ||
                    member.employeeId.toLowerCase().includes(query),
            );
        }

        // Apply sorting
        result.sort((a, b) => {
            let aValue = a[sortField];
            let bValue = b[sortField];

            if (sortField === "name") {
                aValue = `${a.firstName} ${a.lastName}`;
                bValue = `${b.firstName} ${b.lastName}`;
            }

            if (typeof aValue === "string") {
                aValue = aValue.toLowerCase();
                bValue = bValue.toLowerCase();
            }

            if (sortOrder === "asc") {
                return aValue > bValue ? 1 : -1;
            } else {
                return aValue < bValue ? 1 : -1;
            }
        });

        return result;
    }, [teamMembers, filterStatus, searchQuery, sortField, sortOrder]);

    // Pagination calculations
    const startIndex = (currentPage - 1) * pageSize;
    const paginatedMembers = filteredMembers.slice(
        startIndex,
        startIndex + pageSize,
    );
    const totalMembers = filteredMembers.length;

    // Handle avatar upload
    const handleAvatarUpload = (file) => {
        // Validate file type
        const isImage = file.type.startsWith("image/");
        if (!isImage) {
            message.error("You can only upload image files!");
            return false;
        }

        // Validate file size (5MB max)
        const isLt5M = file.size / 1024 / 1024 < 5;
        if (!isLt5M) {
            message.error("Image must be smaller than 5MB!");
            return false;
        }

        setSelectedFile(file);
        const reader = new FileReader();
        reader.onload = (e) => {
            setAvatarPreview(e.target.result);
        };
        reader.readAsDataURL(file);
        return false;
    };

    // Get position options - ensure value is ID
    const getPositionOptions = () => {
        return (
            positions?.map((position) => ({
                value: position.id,
                label: position.position,
                data: position,
            })) || []
        );
    };

    // Get department options
    const getDepartmentOptions = () => {
        return (
            departments?.map((dept) => ({
                value: dept.id,
                label: dept.department,
            })) || []
        );
    };

    // Filter function for Select search
    const filterOption = (input, option) =>
        (option?.label ?? "").toLowerCase().includes(input.toLowerCase());

    // Custom dropdown render for departments
    const departmentDropdownRender = (menu) => (
        <>
            {menu}
            <Divider style={{ margin: "8px 0" }} />
            <div style={{ padding: "8px 12px" }}>
                <div
                    style={{
                        marginBottom: "8px",
                        color: "#666",
                        fontSize: "12px",
                    }}
                >
                    <PlusOutlined style={{ marginRight: "8px" }} />
                    Add new department
                </div>
                <div style={{ display: "flex", gap: "8px" }}>
                    <Input
                        placeholder="Enter new department"
                        value={newDepartment}
                        onChange={(e) => setNewDepartment(e.target.value)}
                        onPressEnter={() => {
                            if (newDepartment.trim()) {
                                // Handle new department creation
                                console.log(
                                    "New department:",
                                    newDepartment.trim(),
                                );
                                setNewDepartment("");
                            }
                        }}
                        style={{ flex: 1 }}
                    />
                    <Button
                        type="primary"
                        icon={<PlusOutlined />}
                        onClick={() => {
                            if (newDepartment.trim()) {
                                console.log(
                                    "New department:",
                                    newDepartment.trim(),
                                );
                                setNewDepartment("");
                            }
                        }}
                        disabled={!newDepartment.trim()}
                    >
                        Add
                    </Button>
                </div>
            </div>
        </>
    );

    // Custom dropdown render for positions
    const positionDropdownRender = (menu) => (
        <>
            {menu}
            <Divider style={{ margin: "8px 0" }} />
            <div style={{ padding: "0 8px 4px" }}>
                <Input
                    placeholder="Enter new position"
                    value={newPositionInput}
                    onChange={(e) => setNewPositionInput(e.target.value)}
                    onPressEnter={() => {
                        if (newPositionInput.trim()) {
                            console.log(
                                "New position:",
                                newPositionInput.trim(),
                            );
                            setNewPositionInput("");
                        }
                    }}
                />
            </div>
        </>
    );

    // Handle member creation
    const handleCreateMember = async (values) => {
        try {
            setLoading(true);
            setLoading(true);

            // Create FormData object
            const formData = new FormData();
            // Append the file if exists
            if (selectedFile) {
                formData.append("avatar", selectedFile);
            }

            // Append other form data
            formData.append("firstName", values.firstName);
            formData.append("lastName", values.lastName);
            if (values.middleName) {
                formData.append("middleName", values.middleName);
            }
            formData.append("email", values.email);
            formData.append("password", values.password);
            formData.append("address", values.location || "");
            formData.append("phone", values.phone || "");
            formData.append("position_id", values.position_id);
            formData.append("department_id", values.department_id);

            // Use FormData with your mutation
            const result = await createMemberMutation.mutateAsync(formData);

            setSelectedFile(null);
            setAvatarPreview(null);
            form.resetFields();
            setCreateModalVisible(false);

            refetchMembers();

            message.success("Member created successfully!");

            return result;

            return result;
        } catch (error) {
            console.error("Create member error:", error);

            if (error.response?.data?.success === false) {
                if (error.response.data.message === "Validation error") {
                    const errors = error.response.data.errors;

                    Object.entries(errors).forEach(([field, messages]) => {
                        if (field === "email") {
                            message.error(`Email: ${messages[0]}`);
                            form.setFields([
                                { name: "email", errors: messages },
                            ]);
                        } else if (field === "department_id") {
                            message.error(`Department: ${messages[0]}`);
                            form.setFields([
                                { name: "department_id", errors: messages },
                            ]);
                        } else {
                            message.error(`${field}: ${messages[0]}`);
                        }
                    });
                } else {
                    message.error(error.response.data.message);
                }
            } else if (error.message) {
                message.error(error.message);
            } else {
                message.error("Failed to create member. Please try again.");
            }

            throw error;
        } finally {
            setLoading(false);
        }
    };

    // Table columns
    const columns = [
        {
            title: "Employee",
            key: "name",
            render: (_, record) => (
                <div
                    style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "12px",
                    }}
                >
                    <Avatar src={record.avatar} size="large" />
                    <div>
                        <div style={{ fontWeight: 600 }}>
                            {record.firstName} {record.lastName}
                        </div>
                        <div style={{ fontSize: "12px", color: "#666" }}>
                            {record.employeeId}
                        </div>
                    </div>
                </div>
            ),
        },
        {
            title: "Position",
            dataIndex: "position",
            key: "position",
        },
        {
            title: "Department",
            dataIndex: "department",
            key: "department",
        },
        {
            title: "Email",
            dataIndex: "email",
            key: "email",
            render: (email) => (
                <a href={`mailto:${email}`} style={{ fontSize: "12px" }}>
                    {email}
                </a>
            ),
        },
        {
            title: "Status",
            dataIndex: "status",
            key: "status",
            render: (status) => (
                <Badge
                    status={getStatusColor(status)}
                    text={getStatusText(status)}
                />
            ),
        },
        {
            title: "Actions",
            key: "actions",
            render: (_, record) => (
                <Space>
                    <Button
                        size="small"
                        icon={<EyeOutlined />}
                        onClick={() => handleTeamClick(record.originalData)}
                    >
                        View
                    </Button>
                    <Button size="small" icon={<EditOutlined />}>
                        Edit
                    </Button>
                </Space>
            ),
        },
    ];

    // Reset form when modal closes
    const handleModalClose = () => {
        setCreateModalVisible(false);
        form.resetFields();
        setAvatarPreview(null);
        setShowPassword(false);
        setNewDepartment("");
        setNewPositionInput("");
    };

    // Show loading state
    if (isLoadingMembers) {
        return (
            <div
                style={{
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    height: "50vh",
                }}
            >
                <Spin size="large" tip="Loading team members..." />
            </div>
        );
    }

    // Show error state
    if (membersError) {
        return (
            <Card>
                <div style={{ textAlign: "center", padding: "50px" }}>
                    <div
                        style={{
                            fontSize: "48px",
                            color: "#ff4d4f",
                            marginBottom: "20px",
                        }}
                    >
                        ❌
                    </div>
                    <h3>Failed to load team members</h3>
                    <p style={{ color: "#666", marginBottom: "20px" }}>
                        {membersError.message ||
                            "An error occurred while loading data"}
                    </p>
                    <Button
                        type="primary"
                        icon={<ReloadOutlined />}
                        onClick={() => refetchMembers()}
                    >
                        Retry
                    </Button>
                </div>
            </Card>
        );
    }

    return (
        <div className="teams-dashboard">
            {/* Header Section */}
            <div className="teams-header">
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="header-content"
                >
                    <div className="header-title">
                        <TeamOutlined
                            style={{
                                fontSize: "28px",
                                color: "#1890ff",
                                marginRight: "12px",
                            }}
                        />
                        <div>
                            <h2>Team Members</h2>
                            <Text type="secondary">
                                Manage your team members, their roles, and
                                assignments
                            </Text>
                        </div>
                    </div>

                    <Space size="middle">
                        <Button
                            icon={<ReloadOutlined />}
                            onClick={() => refetchMembers()}
                            loading={isLoadingMembers}
                        >
                            Refresh
                        </Button>

                        <Input
                            placeholder="Search team members..."
                            prefix={<SearchOutlined />}
                            style={{ width: 300 }}
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            allowClear
                        />

                        <Select
                            value={filterStatus}
                            onChange={setFilterStatus}
                            style={{ width: 120 }}
                            placeholder="Status"
                        >
                            <Option value="all">All Status</Option>
                            <Option value="active">Active</Option>
                            <Option value="on-leave">On Leave</Option>
                            <Option value="inactive">Inactive</Option>
                        </Select>

                        <Select
                            value={sortField}
                            onChange={setSortField}
                            style={{ width: 140 }}
                            placeholder="Sort by"
                        >
                            <Option value="name">Name</Option>
                            <Option value="position">Position</Option>
                            <Option value="department">Department</Option>
                            <Option value="joinDate">Join Date</Option>
                        </Select>

                        <Button
                            icon={<SortAscendingOutlined />}
                            onClick={() =>
                                setSortOrder((prev) =>
                                    prev === "asc" ? "desc" : "asc",
                                )
                            }
                        >
                            {sortOrder === "asc" ? "A-Z" : "Z-A"}
                        </Button>

                        <Button
                            type="primary"
                            icon={<UserAddOutlined />}
                            onClick={() => setCreateModalVisible(true)}
                        >
                            Add Member
                        </Button>
                    </Space>
                </motion.div>
            </div>

            {/* Stats Cards - Now Dynamic */}
            <Row gutter={[16, 16]} style={{ marginBottom: "24px" }}>
                <Col xs={24} sm={12} md={6}>
                    <Card size="small">
                        <div
                            style={{
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "space-between",
                            }}
                        >
                            <div>
                                <div
                                    style={{ fontSize: "12px", color: "#666" }}
                                >
                                    Total Members
                                </div>
                                <div
                                    style={{
                                        fontSize: "24px",
                                        fontWeight: 600,
                                    }}
                                >
                                    {teamMembers.length}
                                </div>
                            </div>
                            <TeamOutlined
                                style={{ fontSize: "32px", color: "#1890ff" }}
                            />
                        </div>
                    </Card>
                </Col>
                <Col xs={24} sm={12} md={6}>
                    <Card size="small">
                        <div
                            style={{
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "space-between",
                            }}
                        >
                            <div>
                                <div
                                    style={{ fontSize: "12px", color: "#666" }}
                                >
                                    Active Members
                                </div>
                                <div
                                    style={{
                                        fontSize: "24px",
                                        fontWeight: 600,
                                    }}
                                >
                                    {
                                        teamMembers.filter(
                                            (m) => m.status === "active",
                                        ).length
                                    }
                                </div>
                            </div>
                            <UserOutlined
                                style={{ fontSize: "32px", color: "#52c41a" }}
                            />
                        </div>
                    </Card>
                </Col>
                <Col xs={24} sm={12} md={6}>
                    <Card size="small">
                        <div
                            style={{
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "space-between",
                            }}
                        >
                            <div>
                                <div
                                    style={{ fontSize: "12px", color: "#666" }}
                                >
                                    Departments
                                </div>
                                <div
                                    style={{
                                        fontSize: "24px",
                                        fontWeight: 600,
                                    }}
                                >
                                    {
                                        [
                                            ...new Set(
                                                teamMembers.map(
                                                    (m) => m.department,
                                                ),
                                            ),
                                        ].length
                                    }
                                </div>
                            </div>
                            <ApartmentOutlined
                                style={{ fontSize: "32px", color: "#722ed1" }}
                            />
                        </div>
                    </Card>
                </Col>
                <Col xs={24} sm={12} md={6}>
                    <Card size="small">
                        <div
                            style={{
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "space-between",
                            }}
                        >
                            <div>
                                <div
                                    style={{ fontSize: "12px", color: "#666" }}
                                >
                                    Positions
                                </div>
                                <div
                                    style={{
                                        fontSize: "24px",
                                        fontWeight: 600,
                                    }}
                                >
                                    {
                                        [
                                            ...new Set(
                                                teamMembers.map(
                                                    (m) => m.position,
                                                ),
                                            ),
                                        ].length
                                    }
                                </div>
                            </div>
                            <StarOutlined
                                style={{ fontSize: "32px", color: "#faad14" }}
                            />
                        </div>
                    </Card>
                </Col>
            </Row>

            {/* Main Content - Table View */}
            <Card
                title={
                    <div
                        style={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                        }}
                    >
                        <span>Team Members ({totalMembers})</span>
                        <Text type="secondary">
                            Showing {startIndex + 1}-
                            {Math.min(startIndex + pageSize, totalMembers)} of{" "}
                            {totalMembers}
                        </Text>
                    </div>
                }
                className="team-members-table-card"
            >
                <Table
                    columns={columns}
                    dataSource={paginatedMembers}
                    rowKey="id"
                    pagination={false}
                    scroll={{ x: true }}
                    loading={isLoadingMembers}
                />

                <div
                    style={{
                        marginTop: "24px",
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                    }}
                >
                    <Text type="secondary">
                        Page {currentPage} of{" "}
                        {Math.ceil(totalMembers / pageSize)}
                    </Text>
                    <Pagination
                        current={currentPage}
                        pageSize={pageSize}
                        total={totalMembers}
                        onChange={(page, size) => {
                            setCurrentPage(page);
                            setPageSize(size);
                        }}
                        showSizeChanger
                        showQuickJumper
                        showTotal={(total, range) =>
                            `${range[0]}-${range[1]} of ${total} items`
                        }
                    />
                </div>
            </Card>

            {/* Create Member Modal */}
            <Modal
                title={
                    <div
                        style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "12px",
                        }}
                    >
                        <UserAddOutlined
                            style={{ color: "#1890ff", fontSize: "20px" }}
                        />
                        <span>Add New Team Member</span>
                    </div>
                }
                open={createModalVisible}
                onCancel={handleModalClose}
                footer={null}
                width={1000}
                destroyOnClose
            >
                <Form
                    form={form}
                    layout="vertical"
                    onFinish={handleCreateMember}
                    onFinishFailed={({ errorFields }) => {
                        if (errorFields.length > 0) {
                            message.error({
                                content: (
                                    <div>
                                        <div
                                            style={{
                                                fontWeight: "bold",
                                                marginBottom: "8px",
                                            }}
                                        >
                                            Please fix the following errors:
                                        </div>
                                        <ul
                                            style={{
                                                margin: 0,
                                                paddingLeft: "20px",
                                            }}
                                        >
                                            {errorFields
                                                .slice(0, 3)
                                                .map((field, index) => (
                                                    <li key={index}>
                                                        {field.errors[0]}
                                                    </li>
                                                ))}
                                            {errorFields.length > 3 && (
                                                <li>
                                                    ...and{" "}
                                                    {errorFields.length - 3}{" "}
                                                    more errors
                                                </li>
                                            )}
                                        </ul>
                                    </div>
                                ),
                                duration: 5,
                            });
                        }
                    }}
                >
                    <Row gutter={[24, 16]}>
                        {/* Avatar Upload */}
                        <Col span={24}>
                            <div
                                style={{
                                    textAlign: "center",
                                    marginBottom: "24px",
                                }}
                            >
                                <Upload
                                    accept="image/*"
                                    showUploadList={false}
                                    beforeUpload={handleAvatarUpload}
                                >
                                    <Avatar
                                        size={100}
                                        src={avatarPreview}
                                        icon={<UserOutlined />}
                                    />
                                </Upload>
                                <div style={{ marginTop: "12px" }}>
                                    <Button
                                        icon={<UploadOutlined />}
                                        onClick={() =>
                                            document
                                                .querySelector(
                                                    ".ant-upload input",
                                                )
                                                ?.click()
                                        }
                                    >
                                        Upload Photo
                                    </Button>
                                    {avatarPreview && (
                                        <Button
                                            danger
                                            icon={<DeleteOutlined />}
                                            onClick={() =>
                                                setAvatarPreview(null)
                                            }
                                            style={{ marginLeft: "8px" }}
                                        >
                                            Remove
                                        </Button>
                                    )}
                                </div>
                            </div>
                        </Col>

                        {/* Personal Information */}
                        <Col span={8}>
                            <Form.Item
                                name="firstName"
                                label="First Name"
                                rules={[
                                    {
                                        required: true,
                                        message: "Please enter first name",
                                    },
                                ]}
                            >
                                <Input placeholder="John" />
                            </Form.Item>
                        </Col>

                        <Col span={8}>
                            <Form.Item name="middleName" label="Middle Name">
                                <Input placeholder="Michael" />
                            </Form.Item>
                        </Col>

                        <Col span={8}>
                            <Form.Item
                                name="lastName"
                                label="Last Name"
                                rules={[
                                    {
                                        required: true,
                                        message: "Please enter last name",
                                    },
                                ]}
                            >
                                <Input placeholder="Doe" />
                            </Form.Item>
                        </Col>

                        {/* Contact Information */}
                        <Col span={12}>
                            <Form.Item
                                name="email"
                                label="Email"
                                rules={[
                                    {
                                        required: true,
                                        message: "Please enter email",
                                    },
                                    {
                                        type: "email",
                                        message: "Please enter valid email",
                                    },
                                ]}
                            >
                                <Input
                                    placeholder="john.doe@company.com"
                                    prefix={<MailOutlined />}
                                />
                            </Form.Item>
                        </Col>

                        <Col span={12}>
                            <Form.Item
                                name="password"
                                label="Password"
                                rules={[
                                    {
                                        required: true,
                                        message: "Please enter password",
                                    },
                                    {
                                        min: 6,
                                        message:
                                            "Password must be at least 6 characters",
                                    },
                                ]}
                            >
                                <Input
                                    type={showPassword ? "text" : "password"}
                                    placeholder="Enter password"
                                    prefix={<LockOutlined />}
                                    suffix={
                                        <Tooltip
                                            title={
                                                showPassword
                                                    ? "Hide password"
                                                    : "Show password"
                                            }
                                        >
                                            {showPassword ? (
                                                <EyeInvisibleOutlined
                                                    onClick={() =>
                                                        setShowPassword(false)
                                                    }
                                                    style={{
                                                        cursor: "pointer",
                                                        color: "#666",
                                                    }}
                                                />
                                            ) : (
                                                <EyeOutlined
                                                    onClick={() =>
                                                        setShowPassword(true)
                                                    }
                                                    style={{
                                                        cursor: "pointer",
                                                        color: "#666",
                                                    }}
                                                />
                                            )}
                                        </Tooltip>
                                    }
                                />
                            </Form.Item>
                        </Col>

                        {/* Position */}
                        <Col span={12}>
                            <Form.Item
                                label="Position"
                                name="position_id"
                                rules={[
                                    {
                                        required: true,
                                        message: "Please select position",
                                    },
                                ]}
                            >
                                <Select
                                    showSearch
                                    placeholder="Search or select position"
                                    optionFilterProp="label"
                                    filterOption={filterOption}
                                    dropdownRender={positionDropdownRender}
                                    options={getPositionOptions()}
                                    allowClear
                                />
                            </Form.Item>
                        </Col>

                        {/* Department */}
                        <Col span={12}>
                            <Form.Item
                                name="department_id"
                                label="Department"
                                rules={[
                                    {
                                        required: true,
                                        message: "Please select department",
                                    },
                                ]}
                            >
                                <Select
                                    showSearch
                                    placeholder="Search or select department"
                                    optionFilterProp="label"
                                    filterOption={filterOption}
                                    dropdownRender={departmentDropdownRender}
                                    options={getDepartmentOptions()}
                                    allowClear
                                />
                            </Form.Item>
                        </Col>

                        {/* Phone */}
                        <Col span={12}>
                            <Form.Item
                                name="phone"
                                label="Phone"
                                rules={[
                                    {
                                        required: true,
                                        message: "Please enter phone number",
                                    },
                                ]}
                            >
                                <Input
                                    placeholder="+1 (555) 123-4567"
                                    prefix={<PhoneOutlined />}
                                />
                            </Form.Item>
                        </Col>

                        {/* Location */}
                        <Col span={12}>
                            <Form.Item name="location" label="Location">
                                <Input
                                    placeholder="New York, NY"
                                    prefix={<EnvironmentOutlined />}
                                />
                            </Form.Item>
                        </Col>
                    </Row>

                    <Divider />

                    {/* Form Actions */}
                    <div
                        style={{
                            display: "flex",
                            justifyContent: "flex-end",
                            gap: "12px",
                        }}
                    >
                        <Button onClick={handleModalClose}>Cancel</Button>
                        <Button
                            type="primary"
                            htmlType="submit"
                            loading={loading}
                            disabled={loading}
                            icon={<CheckOutlined />}
                        >
                            Create Member
                        </Button>
                    </div>
                </Form>
            </Modal>
        </div>
    );
};

export default TeamsDashboard;
