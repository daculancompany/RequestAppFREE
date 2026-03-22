import React, { useMemo } from "react";
import { Card, Row, Col, Avatar, Tag, Button, Space, message } from "antd";
import { 
  MessageOutlined, 
  MailOutlined, 
  EyeOutlined,
  HighlightOutlined,
  UserOutlined,
  CheckCircleOutlined,
  UserSwitchOutlined
} from "@ant-design/icons";
import { useGlobalStore } from "@/stores/global.store";
import { formatFullName, getInitials } from "@/utils/helpers";

const TYPES = [
    { type: "members", value: "Group Members", icon: <UserOutlined />, badgeIcon: <UserOutlined />, badgeColor: "#52c41a" },
    { type: "signatories", value: "Group Signatories", icon: <HighlightOutlined />, badgeIcon: <HighlightOutlined />, badgeColor: "#1890ff" },
    { type: "approvers", value: "Group Approvers", icon: <CheckCircleOutlined />, badgeIcon: <CheckCircleOutlined />, badgeColor: "#fa8c16" },
];

const MembersTabContent = ({ type }) => {
    const { activeGroup } = useGlobalStore();
    
    const members = useMemo(() => {
        return activeGroup?.[type] || [];
    }, [activeGroup?.members]);

    const currentType = TYPES.find((t) => t.type === type);

    return (
        <Card
            title={
                <Space>
                    {currentType?.icon}
                    {currentType?.value}
                    {/* {type === "signatories" && (
                        <Tag 
                            icon={<HighlightOutlined />} 
                            color="blue"
                            style={{ fontSize: 12 }}
                        >
                            Can Sign
                        </Tag>
                    )}
                    {type === "approvers" && (
                        <Tag 
                            icon={<CheckCircleOutlined />} 
                            color="orange"
                            style={{ fontSize: 12 }}
                        >
                            Can Approve
                        </Tag>
                    )} */}
                </Space>
            }
            style={{ borderRadius: 8 }}
        >
            <Row gutter={[16, 16]}>
                {members.map((member) => {
                    const typeConfig = TYPES.find(t => t.type === type);
                    
                    return (
                    <Col xs={24} sm={12} md={8} lg={6} key={member.id}>
                        <Card
                            hoverable
                            size="small"
                            style={{ 
                                borderRadius: 8,
                                position: "relative"
                            }}
                        >
                            {/* Badge Icon in top-right corner */}
                            <div style={{ 
                                position: "absolute", 
                                top: 12, 
                                right: 12,
                                background: typeConfig?.badgeColor,
                                color: "white",
                                borderRadius: "50%",
                                width: 28,
                                height: 28,
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                fontSize: 14,
                                boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
                                zIndex: 1
                            }}>
                                {typeConfig?.badgeIcon}
                            </div>
                            
                            <div
                                style={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: 12,
                                    paddingRight: 40 // Space for the badge
                                }}
                            >
                                <Avatar
                                    size={48}
                                    style={{
                                        background: `linear-gradient(135deg, ${activeGroup?.group_color}20, ${activeGroup?.group_color}40)`,
                                        color: activeGroup?.group_color,
                                        fontWeight: "bold",
                                        flexShrink: 0
                                    }}
                                >
                                    {getInitials(member.name)}
                                </Avatar>
                                <div style={{ flex: 1, minWidth: 0 }}>
                                    <div style={{ fontWeight: 600, fontSize: 14 }}>
                                        {formatFullName(
                                            member.fname,
                                            member.mname,
                                            member.lname,
                                        )}
                                    </div>
                                    <div
                                        style={{ color: "#666", fontSize: 12 }}
                                    >
                                        {member.email}
                                    </div>
                                    <Space direction="vertical" size={4} style={{ marginTop: 4 }}>
                                        {/* <Tag
                                            color={activeGroup?.group_color}
                                            style={{ fontSize: 10 }}
                                        >
                                            {member.role}
                                        </Tag> */}
                                        {type === "signatories" && (
                                            <Tag 
                                                icon={<HighlightOutlined />} 
                                                color="blue"
                                                style={{ fontSize: 10 }}
                                            >
                                                Signatory
                                            </Tag>
                                        )}
                                        {type === "approvers" && (
                                            <Tag 
                                                icon={<CheckCircleOutlined />} 
                                                color="orange"
                                                style={{ fontSize: 10 }}
                                            >
                                                Approver
                                            </Tag>
                                        )}
                                    </Space>
                                </div>
                            </div>

                            {/* <Row gutter={8} style={{ marginTop: 12 }}>
                                <Col span={12}>
                                    <Button
                                        size="small"
                                        icon={<MessageOutlined />}
                                        onClick={() =>
                                            message.info(
                                                `Message ${member.name}`,
                                            )
                                        }
                                        style={{ width: "100%" }}
                                    >
                                        Remove
                                    </Button>
                                </Col>
                                <Col span={12}>
                                    <Button
                                        size="small"
                                        icon={<EyeOutlined />}
                                        onClick={() =>
                                            message.info(
                                                `View details of ${member.name}`,
                                            )
                                        }
                                        style={{ width: "100%" }}
                                    >
                                        View Details
                                    </Button>
                                </Col>
                            </Row> */}
                        </Card>
                    </Col>
                )})}
            </Row>
        </Card>
    );
};

export default MembersTabContent;