import React from 'react';
import {
  Alert,
  Space,
  Button,
  Select,
  Dropdown,
  Menu,
  Typography,
  Popconfirm,
  message,
} from 'antd';
import {
  DeleteOutlined,
  ExportOutlined,
  MoreOutlined,
  LockOutlined,
  UnlockOutlined,
  UserSwitchOutlined,
  DownloadOutlined,
  MailOutlined,
} from '@ant-design/icons';

const { Text } = Typography;
const { Option } = Select;

interface BulkActionsProps {
  selectedCount: number;
  onDelete: () => void;
  onExport: () => void;
  onStatusChange: (status: string) => void;
  onRoleChange?: (role: string) => void;
  onSendEmail?: () => void;
  loading?: boolean;
  disabled?: boolean;
}

const BulkActions: React.FC<BulkActionsProps> = ({
  selectedCount,
  onDelete,
  onExport,
  onStatusChange,
  onRoleChange,
  onSendEmail,
  loading = false,
  disabled = false,
}) => {
  if (selectedCount === 0) return null;

  const handleMenuClick = (e: any) => {
    switch (e.key) {
      case 'activate':
        onStatusChange('active');
        break;
      case 'deactivate':
        onStatusChange('inactive');
        break;
      case 'suspend':
        onStatusChange('suspended');
        break;
      case 'export_selected':
        onExport();
        break;
      case 'send_email':
        onSendEmail?.();
        break;
    }
  };

  const moreMenu = (
    <Menu onClick={handleMenuClick}>
      <Menu.Item key="activate" icon={<UnlockOutlined />}>
        Activate Selected
      </Menu.Item>
      <Menu.Item key="deactivate" icon={<LockOutlined />}>
        Deactivate Selected
      </Menu.Item>
      <Menu.Item key="suspend" icon={<LockOutlined />}>
        Suspend Selected
      </Menu.Item>
      <Menu.Divider />
      <Menu.Item key="export_selected" icon={<DownloadOutlined />}>
        Export Selected
      </Menu.Item>
      <Menu.Item key="send_email" icon={<MailOutlined />}>
        Send Email
      </Menu.Item>
    </Menu>
  );

  return (
    <Alert
      message={
        <Space direction="vertical" size="small" style={{ width: '100%' }}>
          <Space align="center" style={{ justifyContent: 'space-between', width: '100%' }}>
            <Text strong>
              {selectedCount} user{selectedCount !== 1 ? 's' : ''} selected
            </Text>
            <Space>
              <Text type="secondary">Bulk Actions:</Text>
            </Space>
          </Space>
          
          <Space wrap style={{ marginTop: 8 }}>
            {/* Status Change */}
            <Select
              placeholder="Change Status"
              style={{ width: 150 }}
              size="small"
              onChange={onStatusChange}
              disabled={disabled || loading}
              loading={loading}
            >
              <Option value="active">
                <Space>
                  <UnlockOutlined />
                  <span>Activate</span>
                </Space>
              </Option>
              <Option value="inactive">
                <Space>
                  <LockOutlined />
                  <span>Deactivate</span>
                </Space>
              </Option>
              <Option value="suspended">
                <Space>
                  <LockOutlined />
                  <span>Suspend</span>
                </Space>
              </Option>
            </Select>

            {/* Role Change */}
            {onRoleChange && (
              <Select
                placeholder="Change Role"
                style={{ width: 150 }}
                size="small"
                onChange={onRoleChange}
                disabled={disabled || loading}
                loading={loading}
              >
                <Option value="admin">Administrator</Option>
                <Option value="editor">Editor</Option>
                <Option value="viewer">Viewer</Option>
                <Option value="user">User</Option>
              </Select>
            )}

            {/* Export Button */}
            <Button
              size="small"
              icon={<ExportOutlined />}
              onClick={onExport}
              disabled={disabled || loading}
              loading={loading}
            >
              Export
            </Button>

            {/* Delete Button with Confirmation */}
            <Popconfirm
              title={`Delete ${selectedCount} user(s)?`}
              description="This action cannot be undone. Are you sure?"
              onConfirm={onDelete}
              okText="Delete"
              okType="danger"
              cancelText="Cancel"
              disabled={disabled}
            >
              <Button
                danger
                size="small"
                icon={<DeleteOutlined />}
                loading={loading}
                disabled={disabled}
              >
                Delete
              </Button>
            </Popconfirm>

            {/* More Actions Dropdown */}
            <Dropdown overlay={moreMenu} trigger={['click']}>
              <Button
                size="small"
                icon={<MoreOutlined />}
                disabled={disabled || loading}
              />
            </Dropdown>
          </Space>
        </Space>
      }
      type="info"
      showIcon
      style={{ 
        marginBottom: 16,
        backgroundColor: '#e6f7ff',
        border: '1px solid #91d5ff',
      }}
      action={
        <Button
          type="link"
          size="small"
          onClick={() => message.info('Selection cleared')}
          disabled={disabled}
        >
          Clear Selection
        </Button>
      }
    />
  );
};

// Bulk actions toolbar for mobile
export const BulkActionsMobile: React.FC<BulkActionsProps> = (props) => {
  const { selectedCount, onDelete, loading, disabled } = props;

  return (
    <div
      style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: '#1890ff',
        color: 'white',
        padding: '12px 16px',
        zIndex: 1000,
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
      }}
    >
      <Text strong style={{ color: 'white' }}>
        {selectedCount} selected
      </Text>
      <Space>
        <Button
          size="small"
          type="default"
          style={{ color: '#1890ff', backgroundColor: 'white' }}
          onClick={props.onExport}
          disabled={disabled || loading}
        >
          Export
        </Button>
        <Popconfirm
          title={`Delete ${selectedCount} user(s)?`}
          onConfirm={onDelete}
          okText="Delete"
          okType="danger"
          cancelText="Cancel"
          disabled={disabled}
        >
          <Button
            danger
            size="small"
            type="default"
            style={{ backgroundColor: 'white' }}
            loading={loading}
            disabled={disabled}
          >
            Delete
          </Button>
        </Popconfirm>
      </Space>
    </div>
  );
};

export default BulkActions;