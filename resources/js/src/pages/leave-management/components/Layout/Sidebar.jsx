// components/Layout/Sidebar.jsx
import React, { useState, useEffect, useMemo } from "react";
import {
    Button,
    Badge,
    Divider,
    Tooltip,
    Empty,
    Skeleton,
    Typography,
    Space,
} from "antd";
import {
    TeamOutlined,
    AppstoreOutlined,
    CalendarOutlined,
    UsergroupAddOutlined,
    PlusOutlined,
    BellOutlined,
} from "@ant-design/icons";
import "@/styles/Sidebar.scss";
import { useGlobalStore } from "@/stores/global.store";
import { CiLocationOn } from "react-icons/ci";
import GroupItem from "./GroupItem";

const { Text } = Typography;

const Sidebar = ({
    groups = [],
    handleGroupClick,
    setActiveTab,
    leaveRequests = [],
    loading = false,
    selectedGroupId = null,
}) => {
    const { activeGroup, setActiveGroup, setNewMember } = useGlobalStore();
    const [hoveredGroup, setHoveredGroup] = useState(null);

    const totalPendingNotifications = useMemo(() => {
        return leaveRequests.filter((request) => request.status === "pending")
            .length;
    }, [leaveRequests]);

    // Get active group ID for comparison
    const activeGroupId = useMemo(() => {
        return activeGroup?.id || null;
    }, [activeGroup]);

    // Initialize active group when groups are loaded
    useEffect(() => {
        if (!groups.length || selectedGroupId === null) return;

        if (selectedGroupId !== activeGroupId) {
            const groupToSet = groups.find((g) => g.id === selectedGroupId);
            if (groupToSet) {
                setActiveGroup(groupToSet);
            }
        }
    }, [groups.length, selectedGroupId, activeGroupId, setActiveGroup, groups]);

    // Auto-select first group if no group is selected
    useEffect(() => {
        if (!loading && groups.length > 0 && !activeGroupId) {
            const queryParams = new URLSearchParams(location.search);
            const type = queryParams.get("type");
            const requestId = queryParams.get("id"); 
            const groupId = queryParams.get("group_id"); 

            if (type === "mail-notification" && groupId) {
                const groupToSet = groups.find(
                    (g) => g.id === parseInt(groupId),
                );
                if (groupToSet) {
                    setActiveGroup(groupToSet);
                    handleGroupClick(groupToSet);
                    return;
                }
            }

            const firstGroup = groups[0];
            setActiveGroup(firstGroup);
            handleGroupClick(firstGroup);
        }
    }, [
        loading,
        groups,
        activeGroupId,
        location.search,
        setActiveGroup,
        handleGroupClick,
    ]);

    // Handler functions (you can move these to a separate file if they become complex)
    const handleEditGroup = (group) => {
        console.log("Edit group:", group);
        // Implement edit logic here
    };

    const handleToggleGroupStatus = (group) => {
        console.log("Toggle group status:", group);
        // Implement status toggle logic here
    };

    const handleManageMembers = (group) => {
        console.log("Manage members:", group);
        // Implement member management logic here
    };

    const handleDeleteGroup = (group) => {
        console.log("Delete group:", group);
        // Implement delete confirmation and logic here
    };

    // Loading state
    if (loading) {
        return (
            <aside className="fixed-sidebar">
                <div className="sidebar-header">
                    <h3>
                        <TeamOutlined /> Groups
                    </h3>
                </div>
                <div className="sidebar-content">
                    <div className="groups-scroll">
                        {[1, 2, 3].map((index) => (
                            <div
                                key={index}
                                className="sidebar-group-item loading"
                            >
                                <Skeleton
                                    avatar={{ size: 48, shape: "circle" }}
                                    paragraph={{ rows: 1 }}
                                    active
                                />
                            </div>
                        ))}
                    </div>
                </div>
            </aside>
        );
    }

    // Empty state
    const isEmpty = groups.length === 0;

    return (
        <aside className="fixed-sidebar">
            {/* Fixed Header */}
            <div className="sidebar-header">
                <h3>
                    <TeamOutlined /> Groups
                    {groups.length > 0 && (
                        <Badge
                            count={groups.length}
                            size="small"
                            style={{
                                marginLeft: 8,
                                backgroundColor: "#1890ff",
                            }}
                        />
                    )}
                </h3>

                {/* Global Notification Badge */}
                {totalPendingNotifications > 0 && (
                    <Tooltip
                        title={`${totalPendingNotifications} pending requests`}
                    >
                        <Badge
                            count={totalPendingNotifications}
                            size="small"
                            style={{
                                backgroundColor: "#faad14",
                                marginLeft: 8,
                            }}
                        >
                            <BellOutlined
                                style={{
                                    fontSize: 16,
                                    color: "var(--text-secondary)",
                                    cursor: "pointer",
                                }}
                                onClick={() => setActiveTab("requests")}
                            />
                        </Badge>
                    </Tooltip>
                )}
            </div>

            {/* Scrollable Content Area */}
            <div className="sidebar-content">
                <div className="groups-scroll">
                    {isEmpty ? (
                        <div className="empty-groups">
                            <Empty
                                image={Empty.PRESENTED_IMAGE_SIMPLE}
                                description={
                                    <div>
                                        <div style={{ marginBottom: 8 }}>
                                            No groups yet
                                        </div>
                                        <Text type="secondary">
                                            Create your first group to get
                                            started
                                        </Text>
                                    </div>
                                }
                            >
                                {/* <Button
                                    type="primary"
                                    icon={<PlusOutlined />}
                                    onClick={() => setNewMember(true)}
                                    size="small"
                                >
                                    Create Group
                                </Button> */}
                            </Empty>
                        </div>
                    ) : (
                        groups.map((group) => (
                            <GroupItem
                                key={group.id}
                                group={group}
                                isActive={group.id === activeGroupId}
                                pendingCount={
                                    leaveRequests.filter(
                                        (request) =>
                                            request.group_id === group.id &&
                                            request.status === "pending",
                                    ).length
                                }
                                leaveRequests={leaveRequests}
                                onGroupClick={handleGroupClick}
                                onEdit={handleEditGroup}
                                onToggleStatus={handleToggleGroupStatus}
                                onManageMembers={handleManageMembers}
                                onDelete={handleDeleteGroup}
                            />
                        ))
                    )}
                </div>
            </div>

            {/* Footer with Address */}
            <div className="sidebar-footer">
                <Space>
                    <CiLocationOn size={30} />
                    <div className="address">
                        <b>Carmen, Cagayan de Oro City</b>
                        <span>
                            Carmen-Patag Road, Carmen, Cagayan de Oro,
                            Philippines, 9000
                        </span>
                    </div>
                </Space>
            </div>
        </aside>
    );
};

export default Sidebar;
