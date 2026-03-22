//@ts-nocheck
import React, { useEffect, useState, useRef } from "react";
import { Modal, Form, Input, Select, Upload, Card, Divider, Avatar, Tag, message, Row, Col } from "antd";
import { UploadOutlined, CameraOutlined, UserOutlined, EditOutlined, DeleteOutlined } from "@ant-design/icons";
import {
    useCreateUserMutation,
    useUpdateUserMutation,
} from "../../hooks/queries/users.query";
import { User } from "../../types";

const { Option } = Select;
const { TextArea } = Input;

const UserFormModal = ({ open, editingUser, onClose, onSuccess }) => {
    const [form] = Form.useForm();
    const [avatarPreview, setAvatarPreview] = useState(null);
    const [avatarFile, setAvatarFile] = useState(null);
    const fileInputRef = useRef(null);

    const createMutation = useCreateUserMutation({
        onSuccess: () => {
            message.success("User created successfully");
            onSuccess();
        },
        onError: (error) => {
            message.error(error.message || "Failed to create user");
        },
    });

    const updateMutation = useUpdateUserMutation({
        onSuccess: () => {
            message.success("User updated successfully");
            onSuccess();
        },
        onError: (error) => {
            message.error(error.message || "Failed to update user");
        },
    });

    // Load existing user avatar preview
    useEffect(() => {
        if (open) {
            if (editingUser) {
                form.setFieldsValue(editingUser);
                if (editingUser.avatar_url) {
                    setAvatarPreview(editingUser.avatar_url);
                } else {
                    setAvatarPreview(null);
                }
            } else {
                form.resetFields();
                setAvatarPreview(null);
                setAvatarFile(null);
            }
        }
    }, [open, editingUser]);

    // Clean up object URLs
    useEffect(() => {
        return () => {
            if (avatarPreview && avatarPreview.startsWith('blob:')) {
                URL.revokeObjectURL(avatarPreview);
            }
        };
    }, [avatarPreview]);

    const handleAvatarClick = () => {
        if (fileInputRef.current) {
            fileInputRef.current.click();
        }
    };

    const handleFileChange = (event) => {
        const file = event.target.files[0];
        if (file) {
            // Validate file type
            if (!file.type.startsWith('image/')) {
                message.error('Please select an image file');
                return;
            }
            
            // Validate file size (max 5MB)
            if (file.size > 5 * 1024 * 1024) {
                message.error('Image size should be less than 5MB');
                return;
            }
            
            // Clean up previous blob URL if exists
            if (avatarPreview && avatarPreview.startsWith('blob:')) {
                URL.revokeObjectURL(avatarPreview);
            }
            
            const preview = URL.createObjectURL(file);
            setAvatarPreview(preview);
            setAvatarFile(file);
            form.setFieldsValue({ avatar: file });
        }
    };

    const removeAvatar = (e) => {
        e?.stopPropagation();
        
        // Clean up blob URL if exists
        if (avatarPreview && avatarPreview.startsWith('blob:')) {
            URL.revokeObjectURL(avatarPreview);
        }
        
        setAvatarPreview(null);
        setAvatarFile(null);
        form.setFieldsValue({ avatar: undefined });
        
        // Clear file input
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
        
        message.info('Profile picture removed');
    };

    const handleSubmit = async (values) => {
        try {
            const formData = new FormData();

            // Append all form values
            Object.keys(values).forEach((key) => {
                if (key === "avatar" && values.avatar) {
                    if (values.avatar instanceof File) {
                        formData.append("avatar", values.avatar);
                    }
                } else if (values[key] !== undefined && values[key] !== null) {
                    formData.append(key, values[key]);
                }
            });

            // Append avatar file if selected
            if (avatarFile) {
                formData.append("avatar", avatarFile);
            }

            // If editing user and avatar was removed
            if (editingUser && !avatarFile && !avatarPreview && values.avatar === undefined) {
                formData.append("remove_avatar", "true");
            }

            if (editingUser) {
                await updateMutation.mutateAsync({
                    id: editingUser.id,
                    data: formData,
                });
            } else {
                await createMutation.mutateAsync(formData);
            }
        } catch (e) {
            console.error("Form Error:", e);
        }
    };

    const isLoading = createMutation.isLoading || updateMutation.isLoading;

    const roleColors = {
        admin: 'red',
        editor: 'blue',
        viewer: 'green',
        user: 'default'
    };

    const statusColors = {
        active: 'success',
        inactive: 'default',
        suspended: 'error'
    };

    const statusLabels = {
        active: 'Active',
        inactive: 'Inactive',
        suspended: 'Suspended'
    };

    return (
        <Modal
            title={
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{ 
                        width: '40px', 
                        height: '40px', 
                        borderRadius: '50%', 
                        background: '#f0f5ff',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#2f54eb'
                    }}>
                        {editingUser ? <EditOutlined /> : <UserOutlined />}
                    </div>
                    <div>
                        <div style={{ fontSize: '18px', fontWeight: '600' }}>
                            {editingUser ? 'Edit User' : 'Create New User'}
                        </div>
                        <div style={{ fontSize: '12px', color: '#8c8c8c' }}>
                            {editingUser ? 'Update user information and settings' : 'Add a new user to the system'}
                        </div>
                    </div>
                </div>
            }
            open={open}
            onOk={() => form.submit()}
            onCancel={onClose}
            confirmLoading={isLoading}
            width={1000}
            destroyOnClose
            maskClosable={false}
            okText={editingUser ? "Update User" : "Create User"}
            okButtonProps={{
                style: { 
                    background: '#1890ff',
                    borderColor: '#1890ff'
                }
            }}
        >
            <div style={{ padding: '16px 0' }}>
                <Row gutter={24}>
                    <Col xs={24} md={8}>
                        <Card
                            title="Profile Picture"
                            size="small"
                            style={{ marginBottom: '24px' }}
                            bodyStyle={{ padding: '24px 16px' }}
                        >
                            <div style={{ textAlign: 'center' }}>
                                <div
                                    style={{
                                        position: "relative",
                                        width: 140,
                                        height: 140,
                                        margin: "0 auto 16px",
                                        borderRadius: "50%",
                                        overflow: "hidden",
                                        cursor: "pointer",
                                        border: "3px solid #e8e8e8",
                                        boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                                        transition: 'all 0.3s ease',
                                        background: avatarPreview ? 'transparent' : '#f5f5f5',
                                    }}
                                    onClick={handleAvatarClick}
                                    onMouseEnter={(e) => {
                                        e.currentTarget.style.transform = 'scale(1.05)';
                                        e.currentTarget.style.borderColor = '#1890ff';
                                    }}
                                    onMouseLeave={(e) => {
                                        e.currentTarget.style.transform = 'scale(1)';
                                        e.currentTarget.style.borderColor = '#e8e8e8';
                                    }}
                                >
                                    {avatarPreview ? (
                                        <img
                                            src={avatarPreview}
                                            alt="avatar"
                                            style={{
                                                width: "100%",
                                                height: "100%",
                                                objectFit: "cover",
                                            }}
                                            onError={(e) => {
                                                e.target.style.display = 'none';
                                            }}
                                        />
                                    ) : (
                                        <div style={{
                                            width: '100%',
                                            height: '100%',
                                            display: 'flex',
                                            flexDirection: 'column',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            color: '#bfbfbf'
                                        }}>
                                            <UserOutlined style={{ fontSize: '48px', marginBottom: '8px' }} />
                                            <span style={{ fontSize: '12px' }}>Upload Photo</span>
                                        </div>
                                    )}

                                    <div
                                        style={{
                                            position: "absolute",
                                            top: 0,
                                            left: 0,
                                            right: 0,
                                            bottom: 0,
                                            background: "rgba(0,0,0,0.6)",
                                            display: "flex",
                                            flexDirection: "column",
                                            alignItems: "center",
                                            justifyContent: "center",
                                            color: "#fff",
                                            fontSize: 14,
                                            opacity: 0,
                                            transition: "all 0.3s ease",
                                        }}
                                        className="avatar-overlay"
                                    >
                                        <CameraOutlined style={{ fontSize: '24px', marginBottom: '8px' }} />
                                        <div>{avatarPreview ? 'Change Photo' : 'Upload Photo'}</div>
                                    </div>
                                </div>

                                <input
                                    type="file"
                                    ref={fileInputRef}
                                    style={{ display: 'none' }}
                                    accept="image/*"
                                    onChange={handleFileChange}
                                />

                                {avatarPreview && (
                                    <div style={{ marginTop: '12px' }}>
                                        <button
                                            onClick={removeAvatar}
                                            style={{ 
                                                cursor: 'pointer',
                                                background: '#fff1f0',
                                                border: '1px solid #ffa39e',
                                                borderRadius: '4px',
                                                padding: '4px 12px',
                                                fontSize: '12px',
                                                color: '#cf1322',
                                                display: 'inline-flex',
                                                alignItems: 'center',
                                                gap: '4px',
                                                transition: 'all 0.3s'
                                            }}
                                            onMouseEnter={(e) => {
                                                e.target.style.background = '#ffccc7';
                                            }}
                                            onMouseLeave={(e) => {
                                                e.target.style.background = '#fff1f0';
                                            }}
                                        >
                                            <DeleteOutlined />
                                            Remove Photo
                                        </button>
                                    </div>
                                )}

                                <div style={{ fontSize: '12px', color: '#8c8c8c', marginTop: '12px' }}>
                                    Recommended: Square image, at least 400x400px
                                    <br />
                                    Max size: 5MB • JPG, PNG, GIF
                                </div>
                            </div>
                        </Card>

                        {editingUser && (
                            <Card
                                title="Current Info"
                                size="small"
                                bodyStyle={{ padding: '16px' }}
                            >
                                <div style={{ fontSize: '12px', color: '#595959' }}>
                                    <div style={{ marginBottom: '8px', display: 'flex', justifyContent: 'space-between' }}>
                                        <span>User ID:</span>
                                        <span style={{ fontWeight: '500' }}>{editingUser.id}</span>
                                    </div>
                                    <div style={{ marginBottom: '8px', display: 'flex', justifyContent: 'space-between' }}>
                                        <span>Created:</span>
                                        <span style={{ fontWeight: '500' }}>
                                            {editingUser.created_at ? new Date(editingUser.created_at).toLocaleDateString() : 'N/A'}
                                        </span>
                                    </div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                        <span>Status:</span>
                                        <Tag color={statusColors[editingUser.status]}>
                                            {statusLabels[editingUser.status]}
                                        </Tag>
                                    </div>
                                </div>
                            </Card>
                        )}
                    </Col>

                    <Col xs={24} md={16}>
                        <Card
                            title="User Information"
                            size="small"
                            style={{ marginBottom: '24px' }}
                        >
                            <Form
                                form={form}
                                layout="vertical"
                                onFinish={handleSubmit}
                                disabled={isLoading}
                            >
                                <Row gutter={16}>
                                    <Col xs={24} sm={12}>
                                        <Form.Item
                                            name="name"
                                            label="Full Name"
                                            rules={[
                                                { required: true, message: 'Please enter full name' },
                                                { min: 2, message: 'Name must be at least 2 characters' },
                                                { max: 50, message: 'Name cannot exceed 50 characters' }
                                            ]}
                                        >
                                            <Input 
                                                placeholder="Enter full name" 
                                                prefix={<UserOutlined style={{ color: '#bfbfbf' }} />}
                                            />
                                        </Form.Item>
                                    </Col>
                                    <Col xs={24} sm={12}>
                                        <Form.Item
                                            name="email"
                                            label="Email Address"
                                            rules={[
                                                { required: true, message: 'Please enter email' },
                                                { type: "email", message: 'Please enter a valid email' }
                                            ]}
                                        >
                                            <Input 
                                                placeholder="user@example.com" 
                                                type="email"
                                            />
                                        </Form.Item>
                                    </Col>
                                </Row>

                                {!editingUser && (
                                    <>
                                        <Divider orientation="left" plain style={{ fontSize: '14px' }}>
                                            Account Security
                                        </Divider>
                                        <Row gutter={16}>
                                            <Col xs={24} sm={12}>
                                                <Form.Item
                                                    name="password"
                                                    label="Password"
                                                    rules={[
                                                        { required: true, message: 'Please enter password' },
                                                        { min: 8, message: 'Password must be at least 8 characters' },
                                                        { 
                                                            pattern: /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d@$!%*#?&]/,
                                                            message: 'Must contain letters and numbers'
                                                        }
                                                    ]}
                                                >
                                                    <Input.Password 
                                                        placeholder="Enter password" 
                                                        visibilityToggle
                                                    />
                                                </Form.Item>
                                            </Col>
                                            <Col xs={24} sm={12}>
                                                <Form.Item
                                                    name="password_confirmation"
                                                    label="Confirm Password"
                                                    dependencies={["password"]}
                                                    rules={[
                                                        { required: true, message: 'Please confirm password' },
                                                        ({ getFieldValue }) => ({
                                                            validator(_, value) {
                                                                if (!value || getFieldValue('password') === value) {
                                                                    return Promise.resolve();
                                                                }
                                                                return Promise.reject(new Error('Passwords do not match'));
                                                            },
                                                        }),
                                                    ]}
                                                >
                                                    <Input.Password 
                                                        placeholder="Confirm password" 
                                                        visibilityToggle
                                                    />
                                                </Form.Item>
                                            </Col>
                                        </Row>
                                        <div style={{ fontSize: '12px', color: '#8c8c8c', marginBottom: '16px' }}>
                                            Password must be at least 8 characters and contain both letters and numbers
                                        </div>
                                    </>
                                )}

                                <Row gutter={16}>
                                    <Col xs={24} sm={12}>
                                        <Form.Item
                                            name="role"
                                            label="User Role"
                                            rules={[{ required: true, message: 'Please select a role' }]}
                                        >
                                            <Select 
                                                placeholder="Select role"
                                                style={{ width: '100%' }}
                                                optionLabelProp="label"
                                            >
                                                <Option value="admin" label={<span><Tag color="red">Admin</Tag> Administrator</span>}>
                                                    <Tag color="red">Admin</Tag> Administrator
                                                    <div style={{ fontSize: '12px', color: '#8c8c8c', marginTop: '4px' }}>
                                                        Full system access
                                                    </div>
                                                </Option>
                                                <Option value="editor" label={<span><Tag color="blue">Editor</Tag> Editor</span>}>
                                                    <Tag color="blue">Editor</Tag> Editor
                                                    <div style={{ fontSize: '12px', color: '#8c8c8c', marginTop: '4px' }}>
                                                        Can create and edit content
                                                    </div>
                                                </Option>
                                                <Option value="viewer" label={<span><Tag color="green">Viewer</Tag> Viewer</span>}>
                                                    <Tag color="green">Viewer</Tag> Viewer
                                                    <div style={{ fontSize: '12px', color: '#8c8c8c', marginTop: '4px' }}>
                                                        Read-only access
                                                    </div>
                                                </Option>
                                                <Option value="user" label={<span><Tag>User</Tag> Regular User</span>}>
                                                    <Tag>User</Tag> Regular User
                                                    <div style={{ fontSize: '12px', color: '#8c8c8c', marginTop: '4px' }}>
                                                        Basic user privileges
                                                    </div>
                                                </Option>
                                            </Select>
                                        </Form.Item>
                                    </Col>
                                    <Col xs={24} sm={12}>
                                        <Form.Item
                                            name="status"
                                            label="Account Status"
                                            rules={[{ required: true, message: 'Please select status' }]}
                                        >
                                            <Select placeholder="Select status">
                                                <Option value="active">
                                                    <Tag color="success">Active</Tag>
                                                </Option>
                                                <Option value="inactive">
                                                    <Tag color="default">Inactive</Tag>
                                                </Option>
                                                <Option value="suspended">
                                                    <Tag color="error">Suspended</Tag>
                                                </Option>
                                            </Select>
                                        </Form.Item>
                                    </Col>
                                </Row>

                                <Form.Item
                                    name="bio"
                                    label="Bio (Optional)"
                                >
                                    <TextArea 
                                        placeholder="Tell us about this user..."
                                        rows={3}
                                        maxLength={200}
                                        showCount
                                    />
                                </Form.Item>

                                {editingUser && (
                                    <Form.Item
                                        name="notes"
                                        label="Admin Notes (Optional)"
                                    >
                                        <TextArea 
                                            placeholder="Add any internal notes about this user..."
                                            rows={2}
                                            maxLength={500}
                                            showCount
                                        />
                                    </Form.Item>
                                )}

                                {/* Hidden field for avatar in form */}
                                <Form.Item name="avatar" noStyle>
                                    <Input type="hidden" />
                                </Form.Item>
                            </Form>
                        </Card>
                    </Col>
                </Row>
            </div>
        </Modal>
    );
};

export default UserFormModal;