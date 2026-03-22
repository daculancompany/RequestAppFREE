import React from "react";
import { Card, Avatar, Tag, Button, Space } from "antd";
import {
    MessageOutlined,
    CheckCircleOutlined,
    CloseCircleOutlined,
    FilePdfOutlined,
} from "@ant-design/icons";
import { LeaveRequest } from "../types";
import { useStore } from "../stores/useStore";

interface LeaveCardProps {
    leave: LeaveRequest;
}

const LeaveCard: React.FC<LeaveCardProps> = ({ leave }) => {
    const { groups, handleApprove, handleReject, openChat } = useStore();

    const groupInfo = groups.find((g) => g.id === leave.group);

    const getStatusColor = (status: LeaveRequest["status"]) => {
        switch (status) {
            case "approved":
                return "#52c41a";
            case "rejected":
                return "#ff4d4f";
            case "pending":
                return "#faad14";
            default:
                return "#1890ff";
        }
    };

    return (
        <Card className="leave-card">
            <div className="leave-header">
                <Avatar src={leave.avatar} />
                <div className="leave-info">
                    <h4>{leave.employee}</h4>
                    <p>
                        {leave.type} • {leave.duration} days
                    </p>
                </div>
                <Tag color={getStatusColor(leave.status)}>{leave.status}</Tag>
            </div>

            <div className="leave-details">
                <p>{leave.reason}</p>
                <div className="leave-meta">
                    <span>Group: {groupInfo?.name}</span>
                    <span>Approver: {leave.approver}</span>
                    <span>Submitted: {leave.submitted}</span>
                </div>
            </div>

            <Space className="leave-actions">
                <Button
                    icon={<MessageOutlined />}
                    onClick={() => openChat(leave)}
                >
                    Chat
                </Button>
                {leave.status === "pending" && (
                    <>
                        <Button
                            type="primary"
                            icon={<CheckCircleOutlined />}
                            onClick={() => handleApprove(leave.id)}
                        >
                            Approve
                        </Button>
                        <Button
                            danger
                            icon={<CloseCircleOutlined />}
                            onClick={() => handleReject(leave.id)}
                        >
                            Reject
                        </Button>
                    </>
                )}
                <Button icon={<FilePdfOutlined />}>PDF</Button>
            </Space>
        </Card>
    );
};

export default LeaveCard;
