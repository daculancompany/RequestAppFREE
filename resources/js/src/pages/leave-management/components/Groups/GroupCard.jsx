// components/Groups/GroupCard.jsx
import React from 'react';
import { Card, Avatar, Tag, Button, Space, Tooltip, Badge, Progress } from 'antd';
import {
  TeamOutlined,
  EyeOutlined,
  StarOutlined,
  StarFilled,
  CalendarOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined,
  MoreOutlined
} from '@ant-design/icons';
import { motion } from 'framer-motion';

const GroupCard = ({ 
  group, 
  onViewDetails, 
  onToggleFavorite, 
  isFavorite,
  showStats = true 
}) => {
  return (
    <motion.div
      whileHover={{ y: -4, transition: { duration: 0.2 } }}
      className="group-card-wrapper"
    >
      <Card
        className="group-card"
        hoverable
        onClick={onViewDetails}
        cover={
          group.group_image ? (
            <div className="group-card-cover">
              <img
                alt={group.group_name}
                src={group.group_image}
                style={{ height: 120, objectFit: 'cover' }}
              />
              <div className="cover-overlay" />
            </div>
          ) : (
            <div 
              className="group-card-cover-placeholder"
              style={{ 
                height: 120,
                background: `linear-gradient(135deg, ${group.group_color || '#1890ff'} 0%, ${group.group_color ? `${group.group_color}80` : '#40a9ff'} 100%)`
              }}
            >
              <TeamOutlined style={{ fontSize: 48, color: 'rgba(255,255,255,0.9)' }} />
            </div>
          )
        }
        actions={[
          <Tooltip title="Toggle Favorite" key="favorite">
            <Button
              type="text"
              icon={isFavorite ? <StarFilled /> : <StarOutlined />}
              onClick={(e) => {
                e.stopPropagation();
                onToggleFavorite();
              }}
              style={{ color: isFavorite ? '#faad14' : undefined }}
            />
          </Tooltip>,
          <Tooltip title="View Details" key="view">
            <Button
              type="text"
              icon={<EyeOutlined />}
              onClick={(e) => {
                e.stopPropagation();
                onViewDetails();
              }}
            />
          </Tooltip>,
          <Tooltip title="More Actions" key="more">
            <Button type="text" icon={<MoreOutlined />} />
          </Tooltip>
        ]}
      >
        <div className="group-card-content">
          {/* Group Header */}
          <div className="group-header">
            <Avatar
              size={48}
              style={{ 
                background: group.group_color || '#1890ff',
                color: 'white',
                fontWeight: 'bold',
                border: '3px solid white',
                boxShadow: '0 2px 8px rgba(0,0,0,0.15)'
              }}
              icon={!group.group_image && <TeamOutlined />}
              src={group.group_image}
            />
            <div className="group-info">
              <div className="group-name" title={group.group_name}>
                {group.group_name}
              </div>
              <div className="group-code">{group.group_code}</div>
              <div className="group-meta">
                <Tag 
                  color={group.group_color || 'blue'} 
                  style={{ fontSize: 10, padding: '0 6px' }}
                >
                  {group.members?.length || 0} members
                </Tag>
              </div>
            </div>
          </div>

          {/* Group Stats */}
          {showStats && group.stats && (
            <div className="group-stats">
              <Space size={16} style={{ width: '100%', justifyContent: 'space-between' }}>
                <div className="stat-item">
                  <Badge
                    count={group.stats.pendingRequests}
                    style={{ 
                      backgroundColor: group.stats.pendingRequests > 0 ? '#faad14' : '#d9d9d9'
                    }}
                  />
                  <div className="stat-label">Pending</div>
                </div>
                <div className="stat-item">
                  <div className="stat-value">
                    {group.stats.approvalRate}%
                  </div>
                  <div className="stat-label">Approval</div>
                </div>
                <div className="stat-item">
                  <div className="stat-value">
                    {group.stats.avgResponseTime || 0}h
                  </div>
                  <div className="stat-label">Response</div>
                </div>
              </Space>

              {/* Progress Bar */}
              {group.stats.totalRequests > 0 && (
                <div style={{ marginTop: 12 }}>
                  <div style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between',
                    fontSize: 11,
                    marginBottom: 4
                  }}>
                    <span>Approval Rate</span>
                    <span>{group.stats.approvalRate}%</span>
                  </div>
                  <Progress
                    percent={group.stats.approvalRate}
                    size="small"
                    strokeColor={
                      group.stats.approvalRate > 80 ? '#52c41a' :
                      group.stats.approvalRate > 50 ? '#faad14' : '#ff4d4f'
                    }
                    showInfo={false}
                  />
                </div>
              )}
            </div>
          )}

          {/* Approvers Preview */}
          {group.approvers && group.approvers.length > 0 && (
            <div className="approvers-preview">
              <div className="preview-label">Approvers</div>
              <Space size={4}>
                {group.approvers.slice(0, 3).map((approver, index) => (
                  <Tooltip key={approver.id} title={approver.name}>
                    <Avatar
                      size={24}
                      src={approver.avatar}
                      style={{ 
                        border: '2px solid white',
                        marginLeft: index > 0 ? -8 : 0
                      }}
                    >
                      {approver.name?.charAt(0)}
                    </Avatar>
                  </Tooltip>
                ))}
                {group.approvers.length > 3 && (
                  <Avatar size={24} style={{ marginLeft: -8 }}>
                    +{group.approvers.length - 3}
                  </Avatar>
                )}
              </Space>
            </div>
          )}
        </div>
      </Card>
    </motion.div>
  );
};

export default GroupCard;