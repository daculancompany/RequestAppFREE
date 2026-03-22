import React, { useState } from "react";
import {
    Drawer,
    Form,
    Input,
    Select,
    Button,
    Avatar,
    Upload,
    message,
    Divider,
    Tooltip,
    Row,
    Col,
    Space,
    Grid,
} from "antd";
import {
    UserAddOutlined,
    UserOutlined,
    UploadOutlined,
    DeleteOutlined,
    MailOutlined,
    LockOutlined,
    EyeOutlined,
    EyeInvisibleOutlined,
    PhoneOutlined,
    EnvironmentOutlined,
    CheckOutlined,
    PlusOutlined,
    ArrowLeftOutlined,
} from "@ant-design/icons";
import { useGlobalStore } from "@/stores/global.store";
import { useCreateMember } from "@/hooks/queries/members.queries";
import { useUserDepartments } from "@/hooks/queries/departments.queries";
import { usePositions } from "@/hooks/queries/positions.queries";

const { TextArea } = Input;

const CreateMemberDrawer = () => {
    const createMemberMutation = useCreateMember();
    const { newMember, setNewMember } = useGlobalStore();
    const { data: departments = [] } = useUserDepartments();
    const { data: positions = [], refetch: refetchPositions } = usePositions();
    const [form] = Form.useForm();
    const [avatarPreview, setAvatarPreview] = useState(null);
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [newDepartment, setNewDepartment] = useState("");
    const [newPositionInput, setNewPositionInput] = useState("");
    const [selectedFile, setSelectedFile] = useState(null);

    const { useBreakpoint } = Grid;
    const screens = useBreakpoint();
    const isMobile = !screens.md;

    // Handle avatar upload
    const handleAvatarUpload = (file) => {
        const isImage = file.type.startsWith("image/");
        if (!isImage) {
            message.error("You can only upload image files!");
            return false;
        }

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

    // Get position options
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

    // Handle form submission
    const handleSubmit = async (values) => {
        try {
            setLoading(true);
            const formData = new FormData();
            if (selectedFile) {
                formData.append("avatar", selectedFile);
            }

            // Append form values
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

            // Call mutation
            const result = await createMemberMutation.mutateAsync(formData);

            // Reset form and state
            form.resetFields();
            setSelectedFile(null);
            setAvatarPreview(null);
            setNewDepartment("");
            setNewPositionInput("");
            setShowPassword(false);
            setNewMember(false);

            message.success({
                content: `Member "${values.firstName} ${values.lastName}" added successfully!`,
                duration: 3,
            });
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

    // Handle drawer close
    const handleClose = () => {
        form.resetFields();
        setAvatarPreview(null);
        setShowPassword(false);
        setNewDepartment("");
        setNewPositionInput("");
        setSelectedFile(null);
        setNewMember(false);
    };

    // Handle form submission failed
    const handleFormFailed = ({ errorFields }) => {
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
                        <ul style={{ margin: 0, paddingLeft: "20px" }}>
                            {errorFields.slice(0, 3).map((field, index) => (
                                <li key={index}>{field.errors[0]}</li>
                            ))}
                            {errorFields.length > 3 && (
                                <li>
                                    ...and {errorFields.length - 3} more errors
                                </li>
                            )}
                        </ul>
                    </div>
                ),
                duration: 5,
            });
        }
    };

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

    // Responsive drawer width
    const getDrawerWidth = () => {
        if (isMobile) {
            return "100%";
        }
        return 800;
    };

    return (
        <Drawer
            title={
                <div
                    style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "12px",
                    }}
                >
                    <UserAddOutlined
                        style={{
                            color: "#1890ff",
                            fontSize: isMobile ? "18px" : "20px",
                        }}
                    />
                    <span style={{ fontSize: isMobile ? "16px" : "18px" }}>
                        Add New Team Member
                    </span>
                </div>
            }
            placement="right"
            width={getDrawerWidth()}
            onClose={handleClose}
            open={newMember}
            className="create-member-drawer"
            destroyOnClose
            closable={!loading}
            maskClosable={!loading}
            footer={
                <div
                    style={{
                        display: "flex",
                        justifyContent: "flex-end",
                        gap: "12px",
                        padding: "10px 0",
                    }}
                >
                    <Space
                        direction={isMobile ? "vertical" : "horizontal"}
                        style={{ width: "100%" }}
                    >
                        <Button
                            onClick={handleClose}
                            block={isMobile}
                            size={isMobile ? "middle" : "large"}
                        >
                            Cancel
                        </Button>
                        <Button
                            type="primary"
                            onClick={() => form.submit()}
                            loading={loading}
                            disabled={loading}
                            icon={<CheckOutlined />}
                            block={isMobile}
                            size={isMobile ? "middle" : "large"}
                            style={{
                                background:
                                    "linear-gradient(135deg, #1890ff, #096dd9)",
                                border: "none",
                            }}
                        >
                            Create Member
                        </Button>
                    </Space>
                </div>
            }
        >
            <Form
                form={form}
                layout="vertical"
                onFinish={(values) => handleSubmit(values)}
                onFinishFailed={handleFormFailed}
                style={{
                    maxHeight: "calc(100vh - 180px)",
                    overflowY: "auto",
                    paddingRight: "8px",
                }}
            >
                {/* Avatar Upload */}
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
                            size={isMobile ? 80 : 100}
                            src={avatarPreview}
                            icon={<UserOutlined />}
                            style={{
                                cursor: "pointer",
                                border: "2px dashed #1890ff",
                                padding: "2px",
                            }}
                        />
                    </Upload>
                    <div
                        style={{
                            marginTop: "12px",
                            display: "flex",
                            gap: "8px",
                            justifyContent: "center",
                        }}
                    >
                        <Button
                            size={isMobile ? "small" : "middle"}
                            icon={<UploadOutlined />}
                            onClick={() =>
                                document
                                    .querySelector(".ant-upload input")
                                    ?.click()
                            }
                        >
                            Upload
                        </Button>
                        {avatarPreview && (
                            <Button
                                size={isMobile ? "small" : "middle"}
                                danger
                                icon={<DeleteOutlined />}
                                onClick={() => {
                                    setAvatarPreview(null);
                                    setSelectedFile(null);
                                }}
                            >
                                Remove
                            </Button>
                        )}
                    </div>
                </div>

                {/* Personal Information */}
                <Row gutter={[16, 16]}>
                    {/* Title */}
                    <Col span={isMobile ? 24 : 8}>
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
                            <Input
                                placeholder="John"
                                size={isMobile ? "middle" : "large"}
                            />
                        </Form.Item>
                    </Col>

                    <Col span={isMobile ? 24 : 8}>
                        <Form.Item name="middleName" label="Middle Name">
                            <Input
                                placeholder="Michael"
                                size={isMobile ? "middle" : "large"}
                            />
                        </Form.Item>
                    </Col>

                    <Col span={isMobile ? 24 : 8}>
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
                            <Input
                                placeholder="Doe"
                                size={isMobile ? "middle" : "large"}
                            />
                        </Form.Item>
                    </Col>
                    {/* Suffix */}
                    <Col span={isMobile ? 24 : 6}>
                        <Form.Item name="suffix" label="Suffix">
                            <Input
                                placeholder="Jr., Sr., III"
                                size={isMobile ? "middle" : "large"}
                            />
                        </Form.Item>
                    </Col>
                    <Col span={isMobile ? 24 : 6}>
                        <Form.Item name="title" label="Title">
                            <Select
                                placeholder="Select title"
                                options={[
                                    { value: "ATTY.", label: "ATTY." },
                                    { value: "MR.", label: "MR." },
                                    { value: "MRS.", label: "MRS." },
                                    { value: "DR.", label: "DR." },
                                ]}
                                allowClear
                                size={isMobile ? "middle" : "large"}
                            />
                        </Form.Item>
                    </Col>

                    {/* Contact Information */}
                    <Col span={isMobile ? 24 : 12}>
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
                                size={isMobile ? "middle" : "large"}
                            />
                        </Form.Item>
                    </Col>

                    <Col span={isMobile ? 24 : 12}>
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
                                size={isMobile ? "middle" : "large"}
                            />
                        </Form.Item>
                    </Col>

                    {/* Position */}
                    <Col span={isMobile ? 24 : 12}>
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
                                size={isMobile ? "middle" : "large"}
                            />
                        </Form.Item>
                    </Col>

                    {/* Department */}
                    <Col span={isMobile ? 24 : 12}>
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
                                //dropdownRender={departmentDropdownRender}
                                options={getDepartmentOptions()}
                                allowClear
                                size={isMobile ? "middle" : "large"}
                            />
                        </Form.Item>
                    </Col>

                    {/* Phone */}
                    <Col span={isMobile ? 24 : 12}>
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
                                size={isMobile ? "middle" : "large"}
                            />
                        </Form.Item>
                    </Col>

                    {/* Location */}
                    <Col span={isMobile ? 24 : 12}>
                        <Form.Item name="location" label="Location">
                            <Input
                                placeholder="New York, NY"
                                prefix={<EnvironmentOutlined />}
                                size={isMobile ? "middle" : "large"}
                            />
                        </Form.Item>
                    </Col>
                </Row>
            </Form>

            <style jsx>{`
                // .create-member-drawer .ant-drawer-body {
                //     padding: ${isMobile ? "16px" : "24px"};
                // }

                // .create-member-drawer .ant-drawer-header {
                //     border-bottom: 1px solid #f0f0f0;
                // }

                // .create-member-drawer .ant-drawer-footer {
                //     padding: ${isMobile ? "12px 16px" : "16px 24px"};
                //     border-top: 1px solid #f0f0f0;
                // }
            `}</style>
        </Drawer>
    );
};

export default CreateMemberDrawer;
