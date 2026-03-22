import React, { useState, useEffect } from "react";
import {
    Drawer,
    Form,
    Input,
    Select,
    Upload,
    Avatar,
    Button,
    message,
    Descriptions,
    Tag,
    Space,
    Divider,
    Row,
    Col,
    Card,
    Grid,
    Spin,
} from "antd";
import {
    UserOutlined,
    MailOutlined,
    LockOutlined,
    HomeOutlined,
    EditOutlined,
    SaveOutlined,
    CloseOutlined,
    CameraOutlined,
    UploadOutlined,
    EnvironmentOutlined,
    BankOutlined,
    TeamOutlined,
    IdcardOutlined,
    SignatureOutlined,
} from "@ant-design/icons";
import ImgCrop from "antd-img-crop";
import { useProfile, useUpdateProfile } from "@/hooks/queries/members.queries";

const { TextArea } = Input;
const { Option } = Select;
const { useBreakpoint } = Grid;

const ProfileDrawer = ({
    open,
    onClose,
    branches = [],
    departments = [],
    positions = [],
}) => {
    const [form] = Form.useForm();
    const [editMode, setEditMode] = useState(false);
    const [avatarFile, setAvatarFile] = useState(null);
    const [signatureFile, setSignatureFile] = useState(null);
    const [previewAvatar, setPreviewAvatar] = useState(null);
    const [previewSignature, setPreviewSignature] = useState(null);
    const screens = useBreakpoint();
    const isMobile = !screens.md;
    const role = "member";

    // Use the profile hook
    const {
        data: profileResponse,
        isLoading: profileLoading,
        refetch: refetchProfile,
    } = useProfile({
        enabled: open,
    });

    // Use update profile mutation
    const updateProfileMutation = useUpdateProfile();

    // Extract user data from response
    const userData = profileResponse?.data;

    // Update previews when userData changes
    useEffect(() => {
        if (userData) {
            setPreviewAvatar(userData.avatar);
            setPreviewSignature(userData.esignature);
        }
    }, [userData]);

    // Reset form when drawer opens
    useEffect(() => {
        if (open && userData) {
            form.setFieldsValue({
                email: userData.email,
                role: userData.role,
                status: userData.status,
                address: userData.address,
                fname: userData.fname,
                lname: userData.lname,
                mname: userData.mname,
                branch_id: userData.branch_id,
                department_id: userData.department_id,
                position_id: userData.position_id,
            });
            setEditMode(false);
        }
    }, [open, userData, form]);

    const handleSubmit = async () => {
        try {
            const values = await form.validateFields();

            const formData = new FormData();

            // Append all form values
            Object.keys(values).forEach((key) => {
                if (
                    values[key] !== undefined &&
                    values[key] !== null &&
                    values[key] !== ""
                ) {
                    formData.append(key, values[key]);
                }
            });

            // Override method for Laravel
            formData.append("_method", "PUT");

            // Append files if they exist
            if (avatarFile) {
                console.log("Appending avatar:", avatarFile);
                formData.append("avatar", avatarFile);
            }

            if (signatureFile) {
                console.log("Appending signature:", signatureFile);
                formData.append("esignature", signatureFile);
            }

            // Log FormData contents for debugging
            for (let pair of formData.entries()) {
                console.log(pair[0] + ": " + pair[1]);
            }

            // Use the mutation
            await updateProfileMutation.mutateAsync(formData);

            message.success("Profile updated successfully");
            setEditMode(false);
            setAvatarFile(null);
            setSignatureFile(null);

            // Refetch profile to get updated data
            refetchProfile();
        } catch (error) {
            console.error("Update failed:", error);
            message.error(
                error.response?.data?.message || "Failed to update profile",
            );
        }
    };

    // Handle avatar upload
    const handleAvatarUpload = ({ file, onSuccess }) => {
        console.log("Avatar upload:", file);

        // Check file type and size
        const isImage = file.type.startsWith("image/");
        const isLt2M = file.size / 1024 / 1024 < 2;

        if (!isImage) {
            message.error("You can only upload image files!");
            return;
        }
        if (!isLt2M) {
            message.error("Image must be smaller than 2MB!");
            return;
        }

        setAvatarFile(file);
        const reader = new FileReader();
        reader.onload = (e) => {
            setPreviewAvatar(e.target.result);
        };
        reader.readAsDataURL(file);

        // Call onSuccess to complete the upload
        onSuccess?.("ok");
    };

    // Handle signature upload
    const handleSignatureUpload = ({ file, onSuccess }) => {
        console.log("Signature upload:", file);

        // Check file type and size
        const isImage = file.type.startsWith("image/");
        const isLt1M = file.size / 1024 / 1024 < 1;

        if (!isImage) {
            message.error("You can only upload image files!");
            return;
        }
        if (!isLt1M) {
            message.error("Signature must be smaller than 1MB!");
            return;
        }

        setSignatureFile(file);
        const reader = new FileReader();
        reader.onload = (e) => {
            setPreviewSignature(e.target.result);
        };
        reader.readAsDataURL(file);

        // Call onSuccess to complete the upload
        onSuccess?.("ok");
    };

    // Custom upload component
    const CustomUpload = ({ children, onCustomUpload, ...props }) => {
        return (
            <Upload
                {...props}
                customRequest={({ file, onSuccess }) => {
                    onCustomUpload({ file, onSuccess });
                }}
                showUploadList={false}
            >
                {children}
            </Upload>
        );
    };

    // Get status color
    const getStatusColor = (status) => {
        switch (status?.toLowerCase()) {
            case "active":
                return "green";
            case "inactive":
                return "red";
            case "on_leave":
                return "orange";
            case "on_travel":
                return "blue";
            default:
                return "default";
        }
    };

    // Get role color
    const getRoleColor = (role) => {
        switch (role?.toLowerCase()) {
            case "admin":
                return "red";
            case "manager":
                return "blue";
            case "supervisor":
                return "green";
            case "staff":
                return "default";
            default:
                return "default";
        }
    };

    // Handle cancel edit
    const handleCancelEdit = () => {
        setEditMode(false);
        setAvatarFile(null);
        setSignatureFile(null);
        setPreviewAvatar(userData?.avatar);
        setPreviewSignature(userData?.esignature);
        form.setFieldsValue({
            email: userData?.email,
            role: userData?.role,
            status: userData?.status,
            address: userData?.address,
            fname: userData?.fname,
            lname: userData?.lname,
            mname: userData?.mname,
            branch_id: userData?.branch_id,
            department_id: userData?.department_id,
            position_id: userData?.position_id,
        });
    };

    return (
        <Drawer
            title="User Profile"
            placement="right"
            width={720}
            onClose={onClose}
            open={open}
            bodyStyle={{ paddingBottom: 80, paddingTop: 16 }}
            destroyOnClose
            extra={
                <Space>
                    {editMode ? (
                        <>
                            <Button
                                onClick={handleCancelEdit}
                                icon={<CloseOutlined />}
                                disabled={updateProfileMutation.isPending}
                            >
                                Cancel
                            </Button>
                            <Button
                                type="primary"
                                onClick={handleSubmit}
                                icon={<SaveOutlined />}
                                loading={updateProfileMutation.isPending}
                            >
                                Save
                            </Button>
                        </>
                    ) : (
                        <Button
                            type="primary"
                            onClick={() => setEditMode(true)}
                            icon={<EditOutlined />}
                            disabled={!userData || profileLoading}
                        >
                            Edit Profile
                        </Button>
                    )}
                </Space>
            }
        >
            {profileLoading ? (
                <div style={{ textAlign: "center", padding: "50px 0" }}>
                    <Spin size="large" />
                    <p style={{ marginTop: 16 }}>Loading profile data...</p>
                </div>
            ) : !userData ? (
                <div style={{ textAlign: "center", padding: "50px 0" }}>
                    <p>No profile data available</p>
                </div>
            ) : editMode ? (
                <Form
                    form={form}
                    layout="vertical"
                    size="large"
                    onFinish={handleSubmit}
                    initialValues={userData}
                >
                    {/* Profile Image and Signature Section */}
                    <Row gutter={[24, 24]}>
                        <Col xs={24} sm={12}>
                            <Form.Item label="Profile Picture">
                                <div style={{ textAlign: "center" }}>
                                    <Avatar
                                        size={120}
                                        src={previewAvatar}
                                        icon={<UserOutlined />}
                                        style={{ marginBottom: 16 }}
                                    />
                                    <div>
                                        <ImgCrop rotationSlider aspect={1}>
                                            <CustomUpload
                                                accept="image/*"
                                                onCustomUpload={
                                                    handleAvatarUpload
                                                }
                                            >
                                                <Button
                                                    icon={<CameraOutlined />}
                                                    disabled={
                                                        updateProfileMutation.isPending
                                                    }
                                                >
                                                    Upload Avatar
                                                </Button>
                                            </CustomUpload>
                                        </ImgCrop>
                                    </div>
                                    {avatarFile && (
                                        <div
                                            style={{
                                                marginTop: 8,
                                                fontSize: 12,
                                                color: "#52c41a",
                                            }}
                                        >
                                            New avatar selected:{" "}
                                            {avatarFile.name}
                                        </div>
                                    )}
                                    <div
                                        style={{
                                            fontSize: 12,
                                            color: "#999",
                                            marginTop: 8,
                                        }}
                                    >
                                        Recommended: 500x500px, max 2MB
                                    </div>
                                </div>
                            </Form.Item>
                        </Col>
                        <Col xs={24} sm={12}>
                            <Form.Item label="E-Signature">
                                <div style={{ textAlign: "center" }}>
                                    <div
                                        style={{
                                            width: "100%",
                                            maxWidth: 200,
                                            height: 80,
                                            border: "1px dashed #d9d9d9",
                                            borderRadius: 8,
                                            display: "flex",
                                            alignItems: "center",
                                            justifyContent: "center",
                                            margin: "0 auto 16px",
                                            backgroundColor: "#fafafa",
                                            overflow: "hidden",
                                        }}
                                    >
                                        {previewSignature ? (
                                            <img
                                                src={previewSignature}
                                                alt="Signature"
                                                style={{
                                                    maxWidth: "90%",
                                                    maxHeight: "70px",
                                                    objectFit: "contain",
                                                }}
                                            />
                                        ) : (
                                            <SignatureOutlined
                                                style={{
                                                    fontSize: 32,
                                                    color: "#999",
                                                }}
                                            />
                                        )}
                                    </div>
                                    <CustomUpload
                                        accept="image/*"
                                        onCustomUpload={handleSignatureUpload}
                                    >
                                        <Button
                                            icon={<UploadOutlined />}
                                            disabled={
                                                updateProfileMutation.isPending
                                            }
                                        >
                                            Upload Signature
                                        </Button>
                                    </CustomUpload>
                                    {signatureFile && (
                                        <div
                                            style={{
                                                marginTop: 8,
                                                fontSize: 12,
                                                color: "#52c41a",
                                            }}
                                        >
                                            New signature selected:{" "}
                                            {signatureFile.name}
                                        </div>
                                    )}
                                    <div
                                        style={{
                                            fontSize: 12,
                                            color: "#999",
                                            marginTop: 8,
                                        }}
                                    >
                                        Recommended: Transparent PNG, max 1MB
                                    </div>
                                </div>
                            </Form.Item>
                        </Col>
                    </Row>

                    <Divider orientation="left">Personal Information</Divider>

                    <Row gutter={[16, 16]}>
                        <Col xs={24} sm={24} md={8}>
                            <Form.Item
                                name="fname"
                                label="First Name"
                                rules={[
                                    {
                                        required: true,
                                        message: "Please enter first name",
                                    },
                                ]}
                            >
                                <Input
                                    placeholder="First name"
                                    prefix={<UserOutlined />}
                                    size={isMobile ? "middle" : "large"}
                                    disabled={updateProfileMutation.isPending}
                                />
                            </Form.Item>
                        </Col>
                        <Col xs={24} sm={24} md={8}>
                            <Form.Item name="mname" label="Middle Name">
                                <Input
                                    placeholder="Middle name"
                                    prefix={<UserOutlined />}
                                    size={isMobile ? "middle" : "large"}
                                    disabled={updateProfileMutation.isPending}
                                />
                            </Form.Item>
                        </Col>
                        <Col xs={24} sm={24} md={8}>
                            <Form.Item
                                name="lname"
                                label="Last Name"
                                rules={[
                                    {
                                        required: true,
                                        message: "Please enter last name",
                                    },
                                ]}
                            >
                                <Input
                                    placeholder="Last name"
                                    prefix={<UserOutlined />}
                                    size={isMobile ? "middle" : "large"}
                                    disabled={updateProfileMutation.isPending}
                                />
                            </Form.Item>
                        </Col>
                    </Row>

                    <Row gutter={[16, 16]}>
                        <Col xs={24} md={12}>
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
                                    placeholder="Email"
                                    prefix={<MailOutlined />}
                                    size={isMobile ? "middle" : "large"}
                                    disabled={updateProfileMutation.isPending}
                                />
                            </Form.Item>
                        </Col>
                        <Col xs={24} md={12}>
                            <Form.Item
                                name="password"
                                label="Password"
                                tooltip="Leave blank to keep current password"
                            >
                                <Input.Password
                                    placeholder="New password"
                                    prefix={<LockOutlined />}
                                    size={isMobile ? "middle" : "large"}
                                    disabled={updateProfileMutation.isPending}
                                />
                            </Form.Item>
                        </Col>
                    </Row>

                    <Form.Item name="address" label="Address">
                        <TextArea
                            rows={isMobile ? 2 : 3}
                            placeholder="Complete address"
                            size={isMobile ? "middle" : "large"}
                            disabled={updateProfileMutation.isPending}
                        />
                    </Form.Item>

                    {role === "admin" && (
                        <>
                            <Divider orientation="left">
                                Employment Details
                            </Divider>

                            <Row gutter={[16, 16]}>
                                <Col xs={24} md={12} lg={8}>
                                    <Form.Item
                                        name="role"
                                        label="Role"
                                        rules={[
                                            {
                                                required: true,
                                                message: "Please select role",
                                            },
                                        ]}
                                    >
                                        <Select
                                            placeholder="Select role"
                                            size={isMobile ? "middle" : "large"}
                                            style={{ width: "100%" }}
                                            disabled={
                                                updateProfileMutation.isPending
                                            }
                                        >
                                            <Option value="admin">Admin</Option>
                                            <Option value="manager">
                                                Manager
                                            </Option>
                                            <Option value="supervisor">
                                                Supervisor
                                            </Option>
                                            <Option value="staff">Staff</Option>
                                        </Select>
                                    </Form.Item>
                                </Col>
                                <Col xs={24} md={12} lg={8}>
                                    <Form.Item
                                        name="status"
                                        label="Status"
                                        rules={[
                                            {
                                                required: true,
                                                message: "Please select status",
                                            },
                                        ]}
                                    >
                                        <Select
                                            placeholder="Select status"
                                            size={isMobile ? "middle" : "large"}
                                            style={{ width: "100%" }}
                                            disabled={
                                                updateProfileMutation.isPending
                                            }
                                        >
                                            <Option value="active">
                                                Active
                                            </Option>
                                            <Option value="inactive">
                                                Inactive
                                            </Option>
                                            <Option value="on_leave">
                                                On Leave
                                            </Option>
                                            <Option value="on_travel">
                                                On Travel
                                            </Option>
                                        </Select>
                                    </Form.Item>
                                </Col>
                            </Row>

                            <Row gutter={[16, 16]}>
                                <Col xs={24} md={8}>
                                    <Form.Item name="branch_id" label="Branch">
                                        <Select
                                            placeholder="Select branch"
                                            showSearch
                                            optionFilterProp="children"
                                            allowClear
                                            size={isMobile ? "middle" : "large"}
                                            style={{ width: "100%" }}
                                            disabled={
                                                updateProfileMutation.isPending
                                            }
                                        >
                                            {branches.map((branch) => (
                                                <Option
                                                    key={branch.id}
                                                    value={branch.id}
                                                >
                                                    {branch.name}
                                                </Option>
                                            ))}
                                        </Select>
                                    </Form.Item>
                                </Col>
                                <Col xs={24} md={8}>
                                    <Form.Item
                                        name="department_id"
                                        label="Department"
                                    >
                                        <Select
                                            placeholder="Select department"
                                            showSearch
                                            optionFilterProp="children"
                                            allowClear
                                            size={isMobile ? "middle" : "large"}
                                            style={{ width: "100%" }}
                                            disabled={
                                                updateProfileMutation.isPending
                                            }
                                        >
                                            {departments.map((dept) => (
                                                <Option
                                                    key={dept.id}
                                                    value={dept.id}
                                                >
                                                    {dept.name}
                                                </Option>
                                            ))}
                                        </Select>
                                    </Form.Item>
                                </Col>
                                <Col xs={24} md={8}>
                                    <Form.Item
                                        name="position_id"
                                        label="Position"
                                    >
                                        <Select
                                            placeholder="Select position"
                                            showSearch
                                            optionFilterProp="children"
                                            allowClear
                                            size={isMobile ? "middle" : "large"}
                                            style={{ width: "100%" }}
                                            disabled={
                                                updateProfileMutation.isPending
                                            }
                                        >
                                            {positions.map((position) => (
                                                <Option
                                                    key={position.id}
                                                    value={position.id}
                                                >
                                                    {position.name}
                                                </Option>
                                            ))}
                                        </Select>
                                    </Form.Item>
                                </Col>
                            </Row>
                        </>
                    )}
                </Form>
            ) : (
                // View Mode
                <div>
                    {/* Profile Header */}
                    <div style={{ textAlign: "center", marginBottom: 32 }}>
                        <Avatar
                            size={120}
                            src={userData?.avatar}
                            icon={<UserOutlined />}
                            style={{ marginBottom: 16 }}
                        />
                        <h2>
                            {`${userData?.fname || ""} ${userData?.mname || ""} ${userData?.lname || ""}`.trim()}
                        </h2>
                        <Space size={[8, 8]} wrap>
                            <Tag color={getRoleColor(userData?.role)}>
                                {userData?.role?.toUpperCase()}
                            </Tag>
                            <Tag color={getStatusColor(userData?.status)}>
                                {userData?.status
                                    ?.replace("_", " ")
                                    ?.toUpperCase()}
                            </Tag>
                        </Space>
                    </div>

                    {/* E-Signature Preview */}
                    {userData?.esignature && (
                        <Card
                            title="E-Signature"
                            style={{ marginBottom: 24 }}
                            size="small"
                        >
                            <div style={{ textAlign: "center" }}>
                                <img
                                    src={userData.esignature}
                                    alt="Signature"
                                    style={{
                                        maxWidth: "100%",
                                        maxHeight: 100,
                                        objectFit: "contain",
                                    }}
                                />
                            </div>
                        </Card>
                    )}

                    <Descriptions
                        title="Personal Information"
                        bordered
                        column={1}
                        size="small"
                        style={{ marginBottom: 24 }}
                        labelStyle={{ width: 140 }}
                    >
                        <Descriptions.Item
                            label={
                                <Space>
                                    <UserOutlined /> Full Name
                                </Space>
                            }
                        >
                            {`${userData?.fname || ""} ${userData?.mname || ""} ${userData?.lname || ""}`.trim() ||
                                "N/A"}
                        </Descriptions.Item>
                        <Descriptions.Item
                            label={
                                <Space>
                                    <MailOutlined /> Email
                                </Space>
                            }
                        >
                            {userData?.email || "N/A"}
                        </Descriptions.Item>
                        <Descriptions.Item
                            label={
                                <Space>
                                    <HomeOutlined /> Address
                                </Space>
                            }
                        >
                            {userData?.address || "N/A"}
                        </Descriptions.Item>
                    </Descriptions>

                    <Descriptions
                        title="Employment Details"
                        bordered
                        column={1}
                        size="small"
                        labelStyle={{ width: 140 }}
                    >
                        <Descriptions.Item
                            label={
                                <Space>
                                    <BankOutlined /> Branch
                                </Space>
                            }
                        >
                            {branches.find((b) => b.id === userData?.branch_id)
                                ?.name || "N/A"}
                        </Descriptions.Item>
                        <Descriptions.Item
                            label={
                                <Space>
                                    <TeamOutlined /> Department
                                </Space>
                            }
                        >
                            {departments.find(
                                (d) => d.id === userData?.department_id,
                            )?.name || "N/A"}
                        </Descriptions.Item>
                        <Descriptions.Item
                            label={
                                <Space>
                                    <IdcardOutlined /> Position
                                </Space>
                            }
                        >
                            {positions.find(
                                (p) => p.id === userData?.position_id,
                            )?.name || "N/A"}
                        </Descriptions.Item>
                        <Descriptions.Item
                            label={
                                <Space>
                                    <EnvironmentOutlined /> Status
                                </Space>
                            }
                        >
                            <Tag color={getStatusColor(userData?.status)}>
                                {userData?.status
                                    ?.replace("_", " ")
                                    ?.toUpperCase() || "N/A"}
                            </Tag>
                        </Descriptions.Item>
                    </Descriptions>
                </div>
            )}
        </Drawer>
    );
};

export default ProfileDrawer;
