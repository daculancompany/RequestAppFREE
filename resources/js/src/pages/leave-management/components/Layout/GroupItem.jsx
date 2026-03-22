
import React, { useState } from "react";
import { Avatar, Badge, Tag, Tooltip } from "antd";
import { motion } from "framer-motion";
import {
    TeamOutlined,
    FolderOutlined,
    FolderOpenOutlined,
    MoreOutlined,
    EditOutlined,
    DeleteOutlined,
    PauseCircleOutlined,
    PlayCircleOutlined,
} from "@ant-design/icons";
import UserRoleDisplay from "./UserRoleDisplay";

const GroupItem = ({
    group,
    isActive = false,
    pendingCount = 0,
    leaveRequests = [],
    onGroupClick,
    onEdit,
    onToggleStatus,
    onManageMembers,
    onDelete,
}) => {
    const [isHovered, setIsHovered] = useState(false);

    // Format group data
    const formattedGroup = {
        id: group.id,
        name: group.group_name,
        code: group.group_code,
        color: group.group_color,
        gradient: `linear-gradient(135deg, ${group.group_color}20, ${group.group_color}40)`,
        image: group.group_image || null,
        icon: group.members?.length > 0 ? <FolderOpenOutlined /> : <FolderOutlined />,
        members: group.members?.length || 0,
        approvers: group.approvers || [],
        signatories: group.signatories || [],
        isActive,
        hasMembers: group.members?.length > 0,
        rawData: group,
    };

    // Calculate group-specific pending count
    const groupPendingCount = leaveRequests.filter(
        (request) => request.group_id === group.id && request.status === "pending"
    ).length;

    const handleClick = (e) => {
        if (!e.target.closest(".group-actions-menu")) {
            onGroupClick(group);
        }
    };

    return (
        <Badge.Ribbon
            text={formattedGroup.code}
            color={group.group_color}
            placement="start"
        >
            <motion.div
                className={`sidebar-group-item ${isActive ? "active" : ""}`}
                style={{ border: `1px solid ${group.group_color}` }}
                whileHover={{ x: 5 }}
                title={formattedGroup.name || "Unnamed Group"}
                onClick={handleClick}
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
            >
                <div className="group-summary">
                    <div
                        className="group-avatar-wrapper"
                        style={{
                            background: "transparent",
                            border: formattedGroup.gradient
                                ? `2px solid transparent`
                                : `2px solid ${formattedGroup.color}`,
                            backgroundImage: formattedGroup.gradient || "none",
                            backgroundOrigin: formattedGroup.gradient ? "border-box" : undefined,
                            backgroundClip: formattedGroup.gradient ? "border-box" : undefined,
                            position: "relative",
                        }}
                    >
                        {/* Active indicator */}
                        {isActive && <div className="active-indicator" />}

                        {/* Group notification count */}
                        {groupPendingCount > 0 && (
                            <Badge
                                count={groupPendingCount > 99 ? "99+" : groupPendingCount}
                                overflowCount={99}
                                style={{
                                    position: "absolute",
                                    top: -4,
                                    right: -4,
                                    zIndex: 2,
                                    backgroundColor: formattedGroup.color,
                                    boxShadow: "0 0 0 2px var(--bg-secondary)",
                                    fontSize: "10px",
                                    height: "18px",
                                    minWidth: "18px",
                                    lineHeight: "18px",
                                }}
                            />
                        )}

                        <Avatar
                            size={40}
                            src={formattedGroup.image}
                            icon={!formattedGroup.image && formattedGroup.icon}
                            style={{
                                backgroundColor: formattedGroup.color,
                                border: isActive ? `2px solid ${formattedGroup.color}` : "none",
                                transform: isHovered ? "scale(1.05)" : "scale(1)",
                                transition: "all 0.2s ease",
                            }}
                        />

                        {/* Members indicator */}
                        {formattedGroup.hasMembers && (
                            <div className="members-indicator">
                                <TeamOutlined style={{ fontSize: 10 }} />
                            </div>
                        )}
                    </div>

                    <div className="group-info">
                        <div className="wrapper">
                            <span className="text">
                                {formattedGroup.name || "Unnamed Group"}
                            </span>
                        </div>
                        <div className="group-meta">
                            <span>
                                {formattedGroup.members} member
                                {formattedGroup.members !== 1 ? "s" : ""}
                            </span>

                            <Tag
                                size="small"
                                color={group.status === "active" ? "success" : "default"}
                                style={{ marginLeft: 8 }}
                            >
                                {group.status === "active" ? "Active" : "Inactive"}
                            </Tag>
                        </div>
                        <UserRoleDisplay group={group} />
                    </div>
                </div>
            </motion.div>
        </Badge.Ribbon>
    );
};

export default GroupItem;