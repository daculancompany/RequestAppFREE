import React from 'react';
import { 
  Drawer, 
  Descriptions, 
  Tag, 
  Avatar, 
  Space, 
  Typography, 
  Button, 
  Divider,
  Card,
  Row,
  Col,
  Timeline,
  Statistic 
} from 'antd';
import {
  UserOutlined,
  MailOutlined,
  TagOutlined,
  ClockCircleOutlined,
  EditOutlined,
  PhoneOutlined,
  SafetyOutlined,
  LoginOutlined,
  CalendarOutlined,
} from '@ant-design/icons';
import { useUserQuery } from '../../hooks/queries/users.query';
import { useSelectedUser } from '../../stores/useUserStore';
import { LoadingSkeleton } from '../shared/Loading';
import { format } from 'date-fns';

const { Title, Text, Paragraph } = Typography;

interface UserDetailDrawerProps {
  open: boolean;
  userId: number | null;
  onClose: () => void;
  onEdit?: () => void;
}

const UserDetailDrawer: React.FC<UserDetailDrawerProps> = ({
  open,
  userId,
  onClose,
  onEdit,
}) => {
  const { data: user, isLoading, error } = useUserQuery(userId!);
  const selectedUser = useSelectedUser();

  if (isLoading) {
    return (
      <Drawer
        title="Loading User Details"
        placement="right"
        onClose={onClose}
        open={open}
        width={500}
      >
        <LoadingSkeleton rows={8} />
      </Drawer>
    );
  }

  if (error || !user) {
    return (
      <Drawer
        title="Error"
        placement="right"
        onClose={onClose}
        open={open}
        width={500}
      >
        <div style={{ textAlign: 'center', padding: '40px 20px' }}>
          <Title level={4}>Unable to load user details</Title>
          <Paragraph type="secondary">
            {error?.message || 'User not found'}
          </Paragraph>
        </div>
      </Drawer>
    );
  }

  const userData = user || selectedUser;

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'PPpp');
    } catch {
      return dateString;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'success';
      case 'inactive': return 'default';
      case 'suspended': return 'error';
      default: return 'default';
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin': return 'red';
      case 'editor': return 'blue';
      case 'viewer': return 'green';
      default: return 'default';
    }
  };

  return (
    <Drawer
      title="User Details"
      placement="right"
      onClose={onClose}
      open={open}
      width={600}
      extra={
        onEdit && (
          <Button
            type="primary"
            icon={<EditOutlined />}
            onClick={onEdit}
          >
            Edit
          </Button>
        )
      }
    >
      <Space direction="vertical" size="large" style={{ width: '100%' }}>
        {/* Header with Avatar and Basic Info */}
        <Card bordered={false}>
          <Row gutter={[16, 16]} align="middle">
            <Col flex="none">
              <Avatar 
                size={80} 
                src={userData.avatar} 
                icon={<UserOutlined />}
                style={{ border: '2px solid #f0f0f0' }}
              />
            </Col>
            <Col flex="auto">
              <Title level={4} style={{ margin: 0 }}>
                {userData.name}
              </Title>
              <Space size="middle" style={{ marginTop: 8 }}>
                <Tag color={getRoleColor(userData.role)}>
                  {userData.role.toUpperCase()}
                </Tag>
                <Tag color={getStatusColor(userData.status)}>
                  {userData.status.toUpperCase()}
                </Tag>
              </Space>
              <Paragraph type="secondary" style={{ marginTop: 8 }}>
                <MailOutlined /> {userData.email}
              </Paragraph>
            </Col>
          </Row>
        </Card>

        {/* Quick Stats */}
        <Row gutter={16}>
          <Col span={8}>
            <Card size="small">
              <Statistic
                title="Member Since"
                value={format(new Date(userData.created_at), 'yyyy')}
                prefix={<CalendarOutlined />}
              />
            </Card>
          </Col>
          <Col span={8}>
            <Card size="small">
              <Statistic
                title="Last Login"
                value={userData.last_login_at ? 'Recent' : 'Never'}
                prefix={<LoginOutlined />}
              />
            </Card>
          </Col>
          <Col span={8}>
            <Card size="small">
              <Statistic
                title="Status"
                value={userData.status}
                prefix={<SafetyOutlined />}
              />
            </Card>
          </Col>
        </Row>

        <Divider />

        {/* Detailed Information */}
        <Card title="Account Information" size="small">
          <Descriptions column={1} size="small">
            <Descriptions.Item label="Full Name">
              <Text strong>{userData.name}</Text>
            </Descriptions.Item>
            <Descriptions.Item label="Email Address">
              <Space>
                <MailOutlined />
                <a href={`mailto:${userData.email}`}>{userData.email}</a>
              </Space>
            </Descriptions.Item>
            <Descriptions.Item label="Role">
              <Tag color={getRoleColor(userData.role)}>
                {userData.role}
              </Tag>
            </Descriptions.Item>
            <Descriptions.Item label="Account Status">
              <Tag color={getStatusColor(userData.status)}>
                {userData.status}
              </Tag>
            </Descriptions.Item>
            {userData.email_verified_at && (
              <Descriptions.Item label="Email Verified">
                <Tag color="success">Verified</Tag>
                <Text type="secondary" style={{ marginLeft: 8 }}>
                  {formatDate(userData.email_verified_at)}
                </Text>
              </Descriptions.Item>
            )}
          </Descriptions>
        </Card>

        <Card title="Timeline" size="small">
          <Timeline>
            <Timeline.Item
              color="green"
              dot={<CalendarOutlined />}
            >
              <Space direction="vertical" size={0}>
                <Text strong>Account Created</Text>
                <Text type="secondary">{formatDate(userData.created_at)}</Text>
              </Space>
            </Timeline.Item>
            <Timeline.Item
              color="blue"
              dot={<ClockCircleOutlined />}
            >
              <Space direction="vertical" size={0}>
                <Text strong>Last Updated</Text>
                <Text type="secondary">{formatDate(userData.updated_at)}</Text>
              </Space>
            </Timeline.Item>
            {userData.last_login_at && (
              <Timeline.Item
                color="purple"
                dot={<LoginOutlined />}
              >
                <Space direction="vertical" size={0}>
                  <Text strong>Last Login</Text>
                  <Text type="secondary">{formatDate(userData.last_login_at)}</Text>
                </Space>
              </Timeline.Item>
            )}
          </Timeline>
        </Card>

        {/* Permissions Section */}
        {userData.permissions && userData.permissions.length > 0 && (
          <Card title="Permissions" size="small">
            <Space wrap>
              {userData.permissions.map((permission) => (
                <Tag key={permission} color="geekblue">
                  {permission}
                </Tag>
              ))}
            </Space>
          </Card>
        )}

        {/* Notes Section */}
        <Card title="Notes" size="small">
          <Paragraph type="secondary">
            No notes available. Add notes about this user here.
          </Paragraph>
          <Button type="dashed" block>
            Add Note
          </Button>
        </Card>
      </Space>
    </Drawer>
  );
};

export default UserDetailDrawer;