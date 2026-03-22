import React from 'react';
import { Card, Avatar, Typography, Tag, Space, Button, Dropdown, Menu } from 'antd';
import {
  UserOutlined,
  MailOutlined,
  EditOutlined,
  DeleteOutlined,
  MoreOutlined,
  EyeOutlined,
} from '@ant-design/icons';
import { User } from '../../types';

const { Text, Paragraph } = Typography;

interface UserCardProps {
  user: User;
  onView?: (user: User) => void;
  onEdit?: (user: User) => void;
  onDelete?: (user: User) => void;
  selected?: boolean;
  onSelect?: (user: User) => void;
}

const UserCard: React.FC<UserCardProps> = ({
  user,
  onView,
  onEdit,
  onDelete,
  selected = false,
  onSelect,
}) => {
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

  const menu = (
    <Menu>
      {onView && (
        <Menu.Item key="view" icon={<EyeOutlined />} onClick={() => onView(user)}>
          View Details
        </Menu.Item>
      )}
      {onEdit && (
        <Menu.Item key="edit" icon={<EditOutlined />} onClick={() => onEdit(user)}>
          Edit
        </Menu.Item>
      )}
      {onDelete && (
        <Menu.Item 
          key="delete" 
          icon={<DeleteOutlined />} 
          danger 
          onClick={() => onDelete(user)}
        >
          Delete
        </Menu.Item>
      )}
    </Menu>
  );

  return (
    <Card
      hoverable
      style={{
        marginBottom: 16,
        border: selected ? '2px solid #1890ff' : '1px solid #f0f0f0',
        cursor: 'pointer',
      }}
      onClick={() => onSelect?.(user)}
      bodyStyle={{ padding: 16 }}
    >
      <Space direction="vertical" size="middle" style={{ width: '100%' }}>
        {/* Header */}
        <Space align="start" style={{ width: '100%', justifyContent: 'space-between' }}>
          <Space>
            <Avatar 
              size={48} 
              src={user.avatar} 
              icon={<UserOutlined />}
              style={{ backgroundColor: getStatusColor(user.status) === 'success' ? '#52c41a' : '#ff4d4f' }}
            />
            <div>
              <Paragraph strong style={{ margin: 0 }}>
                {user.name}
              </Paragraph>
              <Space size={4}>
                <MailOutlined style={{ fontSize: 12, color: '#999' }} />
                <Text type="secondary" style={{ fontSize: 12 }}>
                  {user.email}
                </Text>
              </Space>
            </div>
          </Space>
          <Dropdown overlay={menu} trigger={['click']}>
            <Button type="text" icon={<MoreOutlined />} />
          </Dropdown>
        </Space>

        {/* Tags */}
        <Space wrap>
          <Tag color={getRoleColor(user.role)}>
            {user.role.toUpperCase()}
          </Tag>
          <Tag color={getStatusColor(user.status)}>
            {user.status.toUpperCase()}
          </Tag>
        </Space>

        {/* Info */}
        <Space direction="vertical" size={2}>
          <Text type="secondary" style={{ fontSize: 12 }}>
            Created: {new Date(user.created_at).toLocaleDateString()}
          </Text>
          {user.last_login_at && (
            <Text type="secondary" style={{ fontSize: 12 }}>
              Last login: {new Date(user.last_login_at).toLocaleDateString()}
            </Text>
          )}
        </Space>

        {/* Actions */}
        <Space style={{ width: '100%', justifyContent: 'space-between' }}>
          {onView && (
            <Button size="small" icon={<EyeOutlined />} onClick={() => onView(user)}>
              View
            </Button>
          )}
          {onEdit && (
            <Button size="small" icon={<EditOutlined />} onClick={() => onEdit(user)}>
              Edit
            </Button>
          )}
        </Space>
      </Space>
    </Card>
  );
};

export default UserCard;