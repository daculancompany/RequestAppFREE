import React, { useMemo } from "react";
import { Card, Row, Col, Avatar, Tag, Button, Space, message } from "antd";
import { MessageOutlined, EyeOutlined, PlusOutlined } from "@ant-design/icons";
import { useGlobalStore } from "@/stores/global.store";
import { formatFullName, getInitials } from "@/utils/helpers";

const SignatoriesTabContent = () => {
    const { activeGroup } = useGlobalStore();
    // Simple sample data

    const handleAdd = () => {
        message.info("Add signatory");
    };

    const members = useMemo(() => {
        return activeGroup?.signatories || [];
    }, [activeGroup?.signatories]);

    return (
        <Card
            title="Signatories"
            style={{ borderRadius: 8 }}
        >
            <Row gutter={[16, 16]}>
                {members.map((member) => (
                    <Col xs={24} sm={12} md={8} lg={6} key={member.id}>
                        <Card
                            hoverable
                            size="small"
                            style={{ borderRadius: 8 }}
                        >
                            <div
                                style={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: 12,
                                }}
                            >
                                <Avatar
                                    size={48}
                                    style={{
                                        background: `linear-gradient(135deg, ${activeGroup?.group_color}20, ${activeGroup?.group_color}40)`,
                                        color: activeGroup?.group_color,
                                        fontWeight: "bold",
                                    }}
                                >
                                    {getInitials(member.name)}
                                </Avatar>
                                <div>
                                    <div style={{ fontWeight: 600 }}>
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
                                    <Tag
                                        color={activeGroup?.group_color}
                                        style={{ marginTop: 4, fontSize: 10 }}
                                    >
                                        {member.role}
                                    </Tag>
                                </div>
                            </div>

                            <Row gutter={8} style={{ marginTop: 12 }}>
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
                            </Row>
                        </Card>
                    </Col>
                ))}
            </Row>
        </Card>
    );
};

export default SignatoriesTabContent;
