// components/Modals/PersonDetailsDrawer.jsx
import React from 'react';
import {
  Drawer,
  Avatar,
  Descriptions,
  Divider,
  Button,
  Tag,
  Space,
  Timeline,
  Card,
  Statistic,
  Row,
  Col,
  Empty,
  Tabs,
  List,
  Badge,
  Tooltip
} from 'antd';
import {
  UserOutlined,
  MailOutlined,
  PhoneOutlined,
  EnvironmentOutlined,
  CalendarOutlined,
  EnvironmentFilled,
  HistoryOutlined,
  FileTextOutlined,
  IdcardOutlined,
  SafetyCertificateOutlined,
  TeamOutlined,
  EditOutlined,
  MessageOutlined
} from '@ant-design/icons';
import dayjs from 'dayjs';

const { TabPane } = Tabs;

const PersonDetailsDrawer = ({ 
  person, 
  group, 
  visible, 
  onClose,
  onCreateRequest,
  leaveRequests,
  travelRequests 
}) => {
  if (!person) return null;

  // Helper function to get user initials
  const getInitials = (name) => {
    if (!name) return '?';
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  // Generate gradient from group color
  const generateGradient = (color) => {
    return `linear-gradient(135deg, ${color}20, ${color}40)`;
  };

  const pendingLeaves = leaveRequests.filter(req => req.status === 'pending');
  const pendingTravels = travelRequests.filter(req => req.status === 'pending');

  return (
    <Drawer
      title="Person Details"
      placement="right"
      width={600}
      onClose={onClose}
      open={visible}
      extra={
        <Space>
          <Button 
            size="small" 
            icon={<MessageOutlined />}
            onClick={() => console.log('Message', person)}
          >
            Message
          </Button>
          <Button 
            size="small" 
            icon={<EditOutlined />}
            onClick={() => console.log('Edit', person)}
          >
            Edit
          </Button>
        </Space>
      }
    >
      <div className="person-details">
        {/* Header */}
        <div className="person-header-drawer">
          <Avatar 
            size={80} 
            style={{ 
              background: generateGradient(group.group_color),
              color: group.group_color,
              fontSize: 24,
              fontWeight: 'bold'
            }}
          >
            {getInitials(person.name)}
          </Avatar>
          <div className="person-title">
            <h2 style={{ margin: 0 }}>{person.name}</h2>
            <p style={{ margin: 0, color: 'var(--text-secondary)' }}>
              {person.email}
            </p>
            <div style={{ marginTop: 8 }}>
              {person.roles?.isApprover && (
                <Tag color="blue" icon={<SafetyCertificateOutlined />}>
                  Approver
                </Tag>
              )}
              {person.roles?.isSignatory && (
                <Tag color="green" icon={<IdcardOutlined />}>
                  Signatory
                </Tag>
              )}
              {person.roles?.isMember && (
                <Tag color="default" icon={<TeamOutlined />}>
                  Member
                </Tag>
              )}
            </div>
          </div>
        </div>

        <Divider />

        {/* Quick Stats */}
        <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
          <Col span={8}>
            <Card size="small">
              <Statistic
                title="Leave Requests"
                value={leaveRequests.length}
                prefix={<CalendarOutlined />}
                valueStyle={{ fontSize: 24 }}
              />
            </Card>
          </Col>
          <Col span={8}>
            <Card size="small">
              <Statistic
                title="Travel Requests"
                value={travelRequests.length}
                prefix={<EnvironmentFilled />}
                valueStyle={{ fontSize: 24 }}
              />
            </Card>
          </Col>
          <Col span={8}>
            <Card size="small">
              <Statistic
                title="Pending"
                value={pendingLeaves.length + pendingTravels.length}
                valueStyle={{ 
                  fontSize: 24,
                  color: (pendingLeaves.length + pendingTravels.length) > 0 ? '#faad14' : '#52c41a'
                }}
              />
            </Card>
          </Col>
        </Row>

        {/* Action Buttons */}
        <div style={{ marginBottom: 24 }}>
          <Space>
            <Button 
              type="primary"
              icon={<CalendarOutlined />}
              onClick={() => onCreateRequest('leave')}
            >
              Create Leave Request
            </Button>
            <Button 
              type="primary"
              icon={<EnvironmentFilled />}
              onClick={() => onCreateRequest('travel')}
            >
              Create Travel Request
            </Button>
          </Space>
        </div>

        {/* Tabs */}
        <Tabs defaultActiveKey="details">
          <TabPane tab="Details" key="details">
            <Descriptions column={1} bordered size="small">
              <Descriptions.Item label="Full Name">
                {person.name}
              </Descriptions.Item>
              <Descriptions.Item label="Email">
                {person.email}
              </Descriptions.Item>
              <Descriptions.Item label="Department">
                {person.department_id || 'Not specified'}
              </Descriptions.Item>
              <Descriptions.Item label="Position">
                {person.position_id || 'Not specified'}
              </Descriptions.Item>
              <Descriptions.Item label="Branch">
                {person.branch_id || 'Not specified'}
              </Descriptions.Item>
              <Descriptions.Item label="Address">
                {person.address || 'Not specified'}
              </Descriptions.Item>
              <Descriptions.Item label="Status">
                <Tag color={person.status === 'active' ? 'green' : 'red'}>
                  {person.status?.toUpperCase() || 'UNKNOWN'}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Last Login">
                {person.last_login_at 
                  ? dayjs(person.last_login_at).format('MMM DD, YYYY HH:mm')
                  : 'Never logged in'
                }
              </Descriptions.Item>
            </Descriptions>
          </TabPane>

          <TabPane 
            tab={
              <span>
                Leave History
                {pendingLeaves.length > 0 && (
                  <Badge 
                    count={pendingLeaves.length} 
                    style={{ marginLeft: 8 }} 
                  />
                )}
              </span>
            } 
            key="leaves"
          >
            {leaveRequests.length > 0 ? (
              <List
                dataSource={leaveRequests}
                renderItem={request => (
                  <List.Item
                    actions={[
                      <Button size="small" icon={<FileTextOutlined />}>
                        Details
                      </Button>
                    ]}
                  >
                    <List.Item.Meta
                      title={
                        <Space>
                          <span>{request.leave_type}</span>
                          <Tag 
                            color={
                              request.status === 'approved' ? 'green' :
                              request.status === 'rejected' ? 'red' : 'orange'
                            }
                            size="small"
                          >
                            {request.status}
                          </Tag>
                        </Space>
                      }
                      description={
                        <div>
                          <div>
                            {dayjs(request.start_date).format('MMM DD')} - {dayjs(request.end_date).format('MMM DD, YYYY')}
                          </div>
                          <small style={{ color: 'var(--text-secondary)' }}>
                            Duration: {request.duration} days
                          </small>
                        </div>
                      }
                    />
                  </List.Item>
                )}
              />
            ) : (
              <Empty description="No leave requests found" />
            )}
          </TabPane>

          <TabPane 
            tab={
              <span>
                Travel History
                {pendingTravels.length > 0 && (
                  <Badge 
                    count={pendingTravels.length} 
                    style={{ marginLeft: 8 }} 
                  />
                )}
              </span>
            } 
            key="travel"
          >
            {travelRequests.length > 0 ? (
              <List
                dataSource={travelRequests}
                renderItem={request => (
                  <List.Item
                    actions={[
                      <Button size="small" icon={<FileTextOutlined />}>
                        Details
                      </Button>
                    ]}
                  >
                    <List.Item.Meta
                      title={
                        <Space>
                          <span>{request.destination}</span>
                          <Tag 
                            color={
                              request.status === 'approved' ? 'green' :
                              request.status === 'rejected' ? 'red' : 'orange'
                            }
                            size="small"
                          >
                            {request.status}
                          </Tag>
                        </Space>
                      }
                      description={
                        <div>
                          <div>{request.purpose}</div>
                          <small style={{ color: 'var(--text-secondary)' }}>
                            {dayjs(request.start_date).format('MMM DD')} - {dayjs(request.end_date).format('MMM DD, YYYY')}
                          </small>
                        </div>
                      }
                    />
                  </List.Item>
                )}
              />
            ) : (
              <Empty description="No travel requests found" />
            )}
          </TabPane>
        </Tabs>
      </div>
    </Drawer>
  );
};

export default PersonDetailsDrawer;