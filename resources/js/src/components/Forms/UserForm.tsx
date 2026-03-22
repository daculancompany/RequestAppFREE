import React from 'react';
import {
  Form,
  Input,
  Select,
  Button,
  Space,
  Upload,
  Avatar,
  Row,
  Col,
  Card,
  Divider,
  Alert,
  Switch,
  Typography
} from 'antd';
import {
  UserOutlined,
  MailOutlined,
  LockOutlined,
  UploadOutlined,
  SafetyOutlined,
  CheckCircleOutlined
} from '@ant-design/icons';
import { useCreateUser, useUpdateUser } from '../../hooks/queries/users.queries';
import type { User, UserFormData } from '../../types';
import { beforeUpload, getBase64 } from '../../utils/file';

const { Option } = Select;
const { Text } = Typography;

interface UserFormProps {
  mode: 'create' | 'edit';
  user?: User | null;
  onSuccess: () => void;
  onCancel: () => void;
}

const UserForm: React.FC<UserFormProps> = ({
  mode,
  user,
  onSuccess,
  onCancel
}) => {
  const [form] = Form.useForm();
  const [avatarUrl, setAvatarUrl] = React.useState<string | undefined>(user?.avatar);
  
  const createMutation = useCreateUser();
  const updateMutation = useUpdateUser();
  
  const isEditing = mode === 'edit';
  const isLoading = createMutation.isLoading || updateMutation.isLoading;
  
  const handleSubmit = async (values: UserFormData) => {
    const userData = {
      ...values,
      avatar: avatarUrl,
    };
    
    if (isEditing && user) {
      updateMutation.mutate(
        { id: user.id, data: userData },
        { onSuccess }
      );
    } else {
      createMutation.mutate(userData, { onSuccess });
    }
  };
  
  const handleAvatarChange = (info: any) => {
    if (info.file.status === 'uploading') {
      return;
    }
    if (info.file.status === 'done') {
      getBase64(info.file.originFileObj, (url) => {
        setAvatarUrl(url);
      });
    }
  };
  
  return (
    <Form
      form={form}
      layout="vertical"
      onFinish={handleSubmit}
      initialValues={{
        name: user?.name || '',
        email: user?.email || '',
        role: user?.role || 'user',
        status: user?.status || 'active',
      }}
      requiredMark={false}
    >
      <Row gutter={[24, 24]}>
        <Col xs={24} md={8}>
          <Card>
            <Space direction="vertical" align="center" style={{ width: '100%' }}>
              <Avatar
                size={120}
                src={avatarUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.email || 'newuser'}`}
                icon={<UserOutlined />}
              />
              <Upload
                name="avatar"
                showUploadList={false}
                beforeUpload={beforeUpload}
                onChange={handleAvatarChange}
                customRequest={({ file, onSuccess }: any) => {
                  setTimeout(() => onSuccess('ok'), 0);
                }}
              >
                <Button icon={<UploadOutlined />} type="dashed">
                  Upload Avatar
                </Button>
              </Upload>
              <Text type="secondary">JPG, PNG up to 2MB</Text>
            </Space>
          </Card>
        </Col>
        
        <Col xs={24} md={16}>
          <Card title="Basic Information">
            <Row gutter={[16, 16]}>
              <Col xs={24} md={12}>
                <Form.Item
                  name="name"
                  label="Full Name"
                  rules={[
                    { required: true, message: 'Please enter full name' },
                    { min: 3, message: 'Name must be at least 3 characters' }
                  ]}
                >
                  <Input
                    prefix={<UserOutlined />}
                    placeholder="Enter full name"
                    size="large"
                  />
                </Form.Item>
              </Col>
              
              <Col xs={24} md={12}>
                <Form.Item
                  name="email"
                  label="Email Address"
                  rules={[
                    { required: true, message: 'Please enter email' },
                    { type: 'email', message: 'Please enter valid email' }
                  ]}
                >
                  <Input
                    prefix={<MailOutlined />}
                    placeholder="Enter email address"
                    size="large"
                    disabled={isEditing}
                  />
                </Form.Item>
              </Col>
              
              {!isEditing && (
                <>
                  <Col xs={24} md={12}>
                    <Form.Item
                      name="password"
                      label="Password"
                      rules={[
                        { required: true, message: 'Please enter password' },
                        { min: 8, message: 'Password must be at least 8 characters' }
                      ]}
                    >
                      <Input.Password
                        prefix={<LockOutlined />}
                        placeholder="Enter password"
                        size="large"
                      />
                    </Form.Item>
                  </Col>
                  
                  <Col xs={24} md={12}>
                    <Form.Item
                      name="confirm_password"
                      label="Confirm Password"
                      dependencies={['password']}
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
                        prefix={<LockOutlined />}
                        placeholder="Confirm password"
                        size="large"
                      />
                    </Form.Item>
                  </Col>
                </>
              )}
              
              <Col xs={24} md={12}>
                <Form.Item
                  name="role"
                  label="Role"
                  rules={[{ required: true, message: 'Please select role' }]}
                >
                  <Select size="large" placeholder="Select role">
                    <Option value="admin">
                      <Space>
                        <SafetyOutlined />
                        Admin
                      </Space>
                    </Option>
                    <Option value="manager">
                      <Space>
                        <UserOutlined />
                        Manager
                      </Space>
                    </Option>
                    <Option value="user">
                      <Space>
                        <UserOutlined />
                        User
                      </Space>
                    </Option>
                  </Select>
                </Form.Item>
              </Col>
              
              <Col xs={24} md={12}>
                <Form.Item
                  name="status"
                  label="Status"
                  rules={[{ required: true, message: 'Please select status' }]}
                >
                  <Select size="large" placeholder="Select status">
                    <Option value="active">
                      <Space>
                        <CheckCircleOutlined style={{ color: '#52c41a' }} />
                        Active
                      </Space>
                    </Option>
                    <Option value="inactive">
                      <Space>
                        <UserOutlined />
                        Inactive
                      </Space>
                    </Option>
                    <Option value="suspended">
                      <Space>
                        <UserOutlined />
                        Suspended
                      </Space>
                    </Option>
                  </Select>
                </Form.Item>
              </Col>
            </Row>
          </Card>
          
          {isEditing && (
            <Alert
              message="Password Change"
              description="Leave password fields blank to keep current password. Enter new password to change it."
              type="info"
              showIcon
              style={{ margin: '16px 0' }}
            />
          )}
        </Col>
      </Row>
      
      <Divider />
      
      <Space style={{ display: 'flex', justifyContent: 'flex-end' }}>
        <Button onClick={onCancel} size="large">
          Cancel
        </Button>
        <Button
          type="primary"
          htmlType="submit"
          loading={isLoading}
          size="large"
        >
          {isEditing ? 'Update User' : 'Create User'}
        </Button>
      </Space>
    </Form>
  );
};

export default UserForm;