import React from 'react';
import { Card, Avatar, Tag, Button, Space } from 'antd';
import { 
  EditOutlined, 
  DeleteOutlined, 
  ShareAltOutlined, 
  MoreOutlined,
  UserOutlined 
} from '@ant-design/icons';
import { Group } from '../types';

interface GroupCardProps {
  group: Group;
}

const GroupCard: React.FC<GroupCardProps> = ({ group }) => {
  return (
    <Card
      className="group-detail-card"
      cover={
        <div className="group-card-cover" style={{ background: group.gradient }}>
          <Avatar 
            size={64} 
            icon={<UserOutlined />}
            className="group-card-icon"
          />
        </div>
      }
      actions={[
        <EditOutlined key="edit" />,
        <DeleteOutlined key="delete" />,
        <ShareAltOutlined key="share" />,
        <MoreOutlined key="more" />
      ]}
    >
      <Card.Meta
        title={group.name}
        description={group.description}
      />
      
      <div className="group-stats">
        <div className="stat">
          <strong>{group.members}</strong>
          <span>Members</span>
        </div>
        <div className="stat">
          <strong>{group.pending}</strong>
          <span>Pending</span>
        </div>
        <div className="stat">
          <strong>{group.stats.approvalRate}%</strong>
          <span>Approval Rate</span>
        </div>
      </div>
      
      <div className="group-tags">
        {group.tags.map((tag, idx) => (
          <Tag key={idx} color="blue">{tag}</Tag>
        ))}
      </div>
      
      <div className="group-approvers">
        <small>Approvers:</small>
        {group.approvers.slice(0, 2).map((approver, idx) => (
          <div key={idx} className="approver">
            <Avatar size="small" icon={<UserOutlined />} />
            <span>{approver}</span>
          </div>
        ))}
        {group.approvers.length > 2 && (
          <Tag>+{group.approvers.length - 2} more</Tag>
        )}
      </div>
      
      <Button 
        type="dashed" 
        block
        className="group-action-btn"
      >
        View Details
      </Button>
    </Card>
  );
};

export default GroupCard;