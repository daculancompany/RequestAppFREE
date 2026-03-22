// components/Groups/GroupsDashboard.jsx
import React, { useState, useMemo } from "react";
import {
    Row,
    Col,
    Button,
    Input,
    Select,
    Card,
    Tag,
    Avatar,
    Badge,
    Space,
    Dropdown,
    Menu,
    Empty,
    Skeleton,
    Tooltip,
    Divider,
    Typography,
    Progress,
} from "antd";
import {
    SearchOutlined,
    UsergroupAddOutlined,
    FilterOutlined,
    SortAscendingOutlined,
    TeamOutlined,
    CalendarOutlined,
    EyeOutlined,
    MoreOutlined,
    StarOutlined,
    StarFilled,
    UserOutlined,
    ClockCircleOutlined,
    AppstoreOutlined,
    TableOutlined,
    DownloadOutlined,
    ReloadOutlined,
    SettingOutlined,
    FileTextOutlined,
    BarChartOutlined,
} from "@ant-design/icons";
import GroupCard from "./GroupCard";
import { motion, AnimatePresence } from "framer-motion";
import "@/styles/GroupsDashboard.scss";

const { Title, Text } = Typography;
const { Option } = Select;
const { Search } = Input;

const GroupsDashboard = ({ 
    groups = [], 
    setGroupModalVisible, 
    handleGroupClick, 
    leaveRequests = [], 
    isLoading = false 
}) => {

    
    // State for filtering and sorting
    const [searchText, setSearchText] = useState("");
    const [filterBy, setFilterBy] = useState("all");
    const [sortBy, setSortBy] = useState("name");
    const [viewMode, setViewMode] = useState("grid"); // 'grid' or 'list'
    const [favorites, setFavorites] = useState([]);

    // Toggle favorite
    const toggleFavorite = (groupId) => {
        if (favorites.includes(groupId)) {
            setFavorites(favorites.filter((id) => id !== groupId));
        } else {
            setFavorites([...favorites, groupId]);
        }
    };

    // Calculate statistics for each group
    const groupsWithStats = useMemo(() => {
        return groups.map((group) => {
            if (!group) return null;
            
            const groupRequests = Array.isArray(leaveRequests) 
                ? leaveRequests.filter((req) => req?.group_id === group.id) 
                : [];

            const pendingRequests = groupRequests.filter(
                (req) => req?.status === "pending",
            ).length;

            const today = new Date();
            const recentRequests = groupRequests.filter((req) => {
                if (!req?.created_at) return false;
                const reqDate = new Date(req.created_at);
                const diffTime = Math.abs(today - reqDate);
                const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                return diffDays <= 7;
            }).length;

            return {
                ...group,
                stats: {
                    totalRequests: groupRequests.length,
                    pendingRequests,
                    recentRequests,
                    approvalRate:
                        groupRequests.length > 0
                            ? Math.round(
                                  (groupRequests.filter(
                                      (r) => r?.status === "approved",
                                  ).length /
                                      groupRequests.length) *
                                      100,
                              )
                            : 0,
                    avgResponseTime:
                        groupRequests.length > 0
                            ? Math.round(
                                  groupRequests.reduce((acc, req) => {
                                      if (req?.approved_at && req?.created_at) {
                                          const created = new Date(
                                              req.created_at,
                                          );
                                          const approved = new Date(
                                              req.approved_at,
                                          );
                                          return (
                                              acc +
                                              Math.abs(approved - created) /
                                                  (1000 * 60 * 60)
                                          );
                                      }
                                      return acc;
                                  }, 0) / groupRequests.length,
                              )
                            : 0,
                },
                isFavorite: favorites.includes(group.id),
            };
        }).filter(Boolean); // Remove any null entries
    }, [groups, leaveRequests, favorites]);

    // Filter and sort groups
    const filteredAndSortedGroups = useMemo(() => {
        let filtered = groupsWithStats;

        // Apply search filter
        if (searchText) {
            filtered = filtered.filter((group) => {
                if (!group) return false;
                const searchLower = searchText.toLowerCase();
                const name = (
                    group.group_name ||
                    group.name ||
                    ""
                ).toLowerCase();
                const code = (
                    group.group_code ||
                    group.code ||
                    ""
                ).toLowerCase();
                const description = (group.description || "").toLowerCase();

                return (
                    name.includes(searchLower) ||
                    code.includes(searchLower) ||
                    description.includes(searchLower)
                );
            });
        }

        // Apply status filter
        switch (filterBy) {
            case "pending":
                filtered = filtered.filter(
                    (group) => group?.stats?.pendingRequests > 0,
                );
                break;
            case "active":
                filtered = filtered.filter(
                    (group) => group?.stats?.totalRequests > 0,
                );
                break;
            case "inactive":
                filtered = filtered.filter(
                    (group) => group?.stats?.totalRequests === 0,
                );
                break;
            case "favorites":
                filtered = filtered.filter((group) => group?.isFavorite);
                break;
            default:
                break;
        }

        // Apply sorting
        switch (sortBy) {
            case "name":
                filtered.sort((a, b) => {
                    const nameA = a?.group_name || a?.name || "";
                    const nameB = b?.group_name || b?.name || "";
                    return nameA.localeCompare(nameB);
                });
                break;
            case "members":
                filtered.sort((a, b) => {
                    const membersA = a?.members?.length || 0;
                    const membersB = b?.members?.length || 0;
                    return membersB - membersA;
                });
                break;
            case "pending":
                filtered.sort((a, b) => {
                    const pendingA = a?.stats?.pendingRequests || 0;
                    const pendingB = b?.stats?.pendingRequests || 0;
                    return pendingB - pendingA;
                });
                break;
            case "recent":
                filtered.sort((a, b) => {
                    const recentA = a?.stats?.recentRequests || 0;
                    const recentB = b?.stats?.recentRequests || 0;
                    return recentB - recentA;
                });
                break;
            case "favorites":
                filtered.sort((a, b) => {
                    if (a?.isFavorite && !b?.isFavorite) return -1;
                    if (!a?.isFavorite && b?.isFavorite) return 1;
                    return 0;
                });
                break;
            default:
                break;
        }

        return filtered;
    }, [groupsWithStats, searchText, filterBy, sortBy]);

    // Get total statistics
    const totalStats = useMemo(
        () => ({
            totalGroups: groups.length || 0,
            totalMembers: groups.reduce(
                (acc, group) => acc + (group?.members?.length || 0),
                0,
            ),
            totalPending: groupsWithStats.reduce(
                (acc, group) => acc + (group?.stats?.pendingRequests || 0),
                0,
            ),
            totalRequests: groupsWithStats.reduce(
                (acc, group) => acc + (group?.stats?.totalRequests || 0),
                0,
            ),
        }),
        [groups, groupsWithStats],
    );

    // More actions dropdown menu
    const moreMenu = (
        <Menu>
            <Menu.Item key="export" icon={<DownloadOutlined />}>
                Export Groups
            </Menu.Item>
            <Menu.Item key="refresh" icon={<ReloadOutlined />}>
                Refresh Data
            </Menu.Item>
            <Menu.Divider />
            <Menu.Item key="settings" icon={<SettingOutlined />}>
                Dashboard Settings
            </Menu.Item>
        </Menu>
    );

    if (isLoading) {
        return (
            <div className="groups-dashboard">
                <Skeleton active paragraph={{ rows: 8 }} />
            </div>
        );
    }

    return (
        <div className="groups-dashboard">
            {/* Header with Stats */}
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="dashboard-header"
            >
                <div className="header-main">
                    <div className="header-title">
                        <Title level={2} style={{ margin: 0 }}>
                            <TeamOutlined style={{ marginRight: 12 }} />
                            Groups & Departments
                        </Title>
                        <Text type="secondary">
                            Manage and monitor all your organizational groups
                        </Text>
                    </div>
                    <Button
                        type="primary"
                        icon={<UsergroupAddOutlined />}
                        size="large"
                        onClick={() => setGroupModalVisible && setGroupModalVisible(true)}
                    >
                        Create Group
                    </Button>
                </div>

                {/* Statistics Cards */}
                <Row gutter={[16, 16]} style={{ marginTop: 24 }}>
                    <Col xs={24} sm={12} md={6}>
                        <Card className="stat-card" size="small">
                            <div className="stat-content">
                                <div
                                    className="stat-icon"
                                    style={{
                                        background: "#1890ff20",
                                        color: "#1890ff",
                                    }}
                                >
                                    <AppstoreOutlined />
                                </div>
                                <div className="stat-info">
                                    <Title
                                        level={3}
                                        style={{ margin: 0, color: "#1890ff" }}
                                    >
                                        {totalStats.totalGroups}
                                    </Title>
                                    <Text type="secondary">Total Groups</Text>
                                </div>
                            </div>
                        </Card>
                    </Col>
                    <Col xs={24} sm={12} md={6}>
                        <Card className="stat-card" size="small">
                            <div className="stat-content">
                                <div
                                    className="stat-icon"
                                    style={{
                                        background: "#52c41a20",
                                        color: "#52c41a",
                                    }}
                                >
                                    <TeamOutlined />
                                </div>
                                <div className="stat-info">
                                    <Title
                                        level={3}
                                        style={{ margin: 0, color: "#52c41a" }}
                                    >
                                        {totalStats.totalMembers}
                                    </Title>
                                    <Text type="secondary">Total Members</Text>
                                </div>
                            </div>
                        </Card>
                    </Col>
                    <Col xs={24} sm={12} md={6}>
                        <Card className="stat-card" size="small">
                            <div className="stat-content">
                                <div
                                    className="stat-icon"
                                    style={{
                                        background: "#faad1420",
                                        color: "#faad14",
                                    }}
                                >
                                    <ClockCircleOutlined />
                                </div>
                                <div className="stat-info">
                                    <Title
                                        level={3}
                                        style={{ margin: 0, color: "#faad14" }}
                                    >
                                        {totalStats.totalPending}
                                    </Title>
                                    <Text type="secondary">
                                        Pending Requests
                                    </Text>
                                </div>
                            </div>
                        </Card>
                    </Col>
                    <Col xs={24} sm={12} md={6}>
                        <Card className="stat-card" size="small">
                            <div className="stat-content">
                                <div
                                    className="stat-icon"
                                    style={{
                                        background: "#722ed120",
                                        color: "#722ed1",
                                    }}
                                >
                                    <FileTextOutlined />
                                </div>
                                <div className="stat-info">
                                    <Title
                                        level={3}
                                        style={{ margin: 0, color: "#722ed1" }}
                                    >
                                        {totalStats.totalRequests}
                                    </Title>
                                    <Text type="secondary">Total Requests</Text>
                                </div>
                            </div>
                        </Card>
                    </Col>
                </Row>
            </motion.div>

            {/* Controls Bar */}
            <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="dashboard-controls"
            >
                <div className="controls-left">
                    <Search
                        placeholder="Search groups..."
                        prefix={<SearchOutlined />}
                        value={searchText}
                        onChange={(e) => setSearchText(e.target.value)}
                        style={{ width: 300 }}
                        allowClear
                    />

                    <Select
                        placeholder="Filter by"
                        value={filterBy}
                        onChange={setFilterBy}
                        style={{ width: 150 }}
                        suffixIcon={<FilterOutlined />}
                    >
                        <Option value="all">All Groups</Option>
                        <Option value="pending">With Pending</Option>
                        <Option value="active">Active</Option>
                        <Option value="inactive">Inactive</Option>
                        <Option value="favorites">Favorites</Option>
                    </Select>

                    <Select
                        placeholder="Sort by"
                        value={sortBy}
                        onChange={setSortBy}
                        style={{ width: 150 }}
                        suffixIcon={<SortAscendingOutlined />}
                    >
                        <Option value="name">Name (A-Z)</Option>
                        <Option value="members">Most Members</Option>
                        <Option value="pending">Most Pending</Option>
                        <Option value="recent">Recently Active</Option>
                        <Option value="favorites">Favorites First</Option>
                    </Select>
                </div>

                <div className="controls-right">
                    <Space>
                        <Tooltip title="Grid View">
                            <Button
                                type={
                                    viewMode === "grid" ? "primary" : "default"
                                }
                                icon={<AppstoreOutlined />}
                                onClick={() => setViewMode("grid")}
                            />
                        </Tooltip>
                        <Tooltip title="List View">
                            <Button
                                type={
                                    viewMode === "list" ? "primary" : "default"
                                }
                                icon={<TableOutlined />}
                                onClick={() => setViewMode("list")}
                            />
                        </Tooltip>
                        <Dropdown overlay={moreMenu} trigger={["click"]}>
                            <Button icon={<MoreOutlined />} />
                        </Dropdown>
                    </Space>
                </div>
            </motion.div>

            {/* Groups Display */}
            <AnimatePresence>
                {filteredAndSortedGroups.length > 0 ? (
                    viewMode === "grid" ? (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.2 }}
                        >
                            <Row gutter={[16, 16]} style={{ marginTop: 24 }}>
                                {filteredAndSortedGroups.map((group, index) => (
                                    group && (
                                        <Col
                                            key={group.id || index}
                                            xs={24}
                                            sm={12}
                                            md={8}
                                            lg={6}
                                            xl={4}
                                        >
                                            <motion.div
                                                initial={{ opacity: 0, scale: 0.9 }}
                                                animate={{ opacity: 1, scale: 1 }}
                                                transition={{ delay: index * 0.05 }}
                                            >
                                                <GroupCard
                                                    group={group}
                                                    onViewDetails={() =>
                                                        handleGroupClick && handleGroupClick(group)
                                                    }
                                                    onToggleFavorite={() =>
                                                        toggleFavorite(group.id)
                                                    }
                                                    isFavorite={group.isFavorite}
                                                    showStats={true}
                                                />
                                            </motion.div>
                                        </Col>
                                    )
                                ))}
                            </Row>
                        </motion.div>
                    ) : (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.2 }}
                            className="list-view"
                        >
                            <Card style={{ marginTop: 24 }}>
                                <table className="groups-table">
                                    <thead>
                                        <tr>
                                            <th style={{ width: "50px" }}></th>
                                            <th>Group</th>
                                            <th>Members</th>
                                            <th>Pending</th>
                                            <th>Approval Rate</th>
                                            <th>Response Time</th>
                                            <th style={{ width: "100px" }}>
                                                Actions
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {filteredAndSortedGroups.map(
                                            (group, index) => (
                                                group && (
                                                    <motion.tr
                                                        key={group.id || index}
                                                        initial={{
                                                            opacity: 0,
                                                            y: 20,
                                                        }}
                                                        animate={{
                                                            opacity: 1,
                                                            y: 0,
                                                        }}
                                                        transition={{
                                                            delay: index * 0.05,
                                                        }}
                                                        className="group-row"
                                                        onClick={() =>
                                                            handleGroupClick && handleGroupClick(group)
                                                        }
                                                    >
                                                        <td>
                                                            <Button
                                                                type="text"
                                                                icon={
                                                                    group.isFavorite ? (
                                                                        <StarFilled />
                                                                    ) : (
                                                                        <StarOutlined />
                                                                    )
                                                                }
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    toggleFavorite(
                                                                        group.id,
                                                                    );
                                                                }}
                                                                style={{
                                                                    color: group.isFavorite
                                                                        ? "#faad14"
                                                                        : undefined,
                                                                }}
                                                            />
                                                        </td>
                                                        <td>
                                                            <div className="group-info-cell">
                                                                <Avatar
                                                                    size={40}
                                                                    style={{
                                                                        background:
                                                                            group.group_color ||
                                                                            "#1890ff",
                                                                        marginRight: 12,
                                                                    }}
                                                                    icon={
                                                                        !group.group_image && (
                                                                            <TeamOutlined />
                                                                        )
                                                                    }
                                                                    src={
                                                                        group.group_image
                                                                    }
                                                                />
                                                                <div>
                                                                    <div className="group-name">
                                                                        {
                                                                            group.group_name || "Unnamed Group"
                                                                        }
                                                                    </div>
                                                                    <div className="group-code">
                                                                        {
                                                                            group.group_code || "NO_CODE"
                                                                        }
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </td>
                                                        <td>
                                                            <Badge
                                                                count={
                                                                    group.members
                                                                        ?.length ||
                                                                    0
                                                                }
                                                                showZero
                                                                style={{
                                                                    backgroundColor:
                                                                        "#52c41a",
                                                                }}
                                                            />
                                                        </td>
                                                        <td>
                                                            {group.stats
                                                                ?.pendingRequests >
                                                            0 ? (
                                                                <Badge
                                                                    count={
                                                                        group.stats
                                                                            .pendingRequests
                                                                    }
                                                                    style={{
                                                                        backgroundColor:
                                                                            "#faad14",
                                                                    }}
                                                                />
                                                            ) : (
                                                                <span
                                                                    style={{
                                                                        color: "#d9d9d9",
                                                                    }}
                                                                >
                                                                    0
                                                                </span>
                                                            )}
                                                        </td>
                                                        <td>
                                                            <div className="progress-cell">
                                                                <Progress
                                                                    percent={
                                                                        group.stats
                                                                            ?.approvalRate || 0
                                                                    }
                                                                    size="small"
                                                                    strokeColor={
                                                                        group.stats
                                                                            ?.approvalRate >
                                                                        80
                                                                            ? "#52c41a"
                                                                            : group
                                                                                .stats
                                                                                ?.approvalRate >
                                                                              50
                                                                              ? "#faad14"
                                                                              : "#ff4d4f"
                                                                    }
                                                                />
                                                                <span
                                                                    style={{
                                                                        marginLeft: 8,
                                                                        fontSize: 12,
                                                                    }}
                                                                >
                                                                    {
                                                                        group.stats
                                                                            ?.approvalRate || 0
                                                                    }
                                                                    %
                                                                </span>
                                                            </div>
                                                        </td>
                                                        <td>
                                                            {group.stats
                                                                ?.avgResponseTime >
                                                            0 ? (
                                                                <Tag color="blue">
                                                                    {
                                                                        group.stats
                                                                            ?.avgResponseTime
                                                                    }
                                                                    h
                                                                </Tag>
                                                            ) : (
                                                                <span
                                                                    style={{
                                                                        color: "#d9d9d9",
                                                                    }}
                                                                >
                                                                    N/A
                                                                </span>
                                                            )}
                                                        </td>
                                                        <td>
                                                            <Space>
                                                                <Tooltip title="View Details">
                                                                    <Button
                                                                        type="text"
                                                                        icon={
                                                                            <EyeOutlined />
                                                                        }
                                                                        onClick={(
                                                                            e,
                                                                        ) => {
                                                                            e.stopPropagation();
                                                                            handleGroupClick &&
                                                                            handleGroupClick(
                                                                                group,
                                                                            );
                                                                        }}
                                                                    />
                                                                </Tooltip>
                                                                <Tooltip title="Quick Actions">
                                                                    <Dropdown
                                                                        menu={{
                                                                            items: [
                                                                                {
                                                                                    key: "members",
                                                                                    icon: (
                                                                                        <TeamOutlined />
                                                                                    ),
                                                                                    label: "View Members",
                                                                                },
                                                                                {
                                                                                    key: "requests",
                                                                                    icon: (
                                                                                        <FileTextOutlined />
                                                                                    ),
                                                                                    label: "View Requests",
                                                                                },
                                                                                {
                                                                                    key: "calendar",
                                                                                    icon: (
                                                                                        <CalendarOutlined />
                                                                                    ),
                                                                                    label: "Calendar View",
                                                                                },
                                                                                {
                                                                                    key: "analytics",
                                                                                    icon: (
                                                                                        <BarChartOutlined />
                                                                                    ),
                                                                                    label: "Analytics",
                                                                                },
                                                                            ],
                                                                        }}
                                                                        trigger={[
                                                                            "click",
                                                                        ]}
                                                                    >
                                                                        <Button
                                                                            type="text"
                                                                            icon={
                                                                                <MoreOutlined />
                                                                            }
                                                                        />
                                                                    </Dropdown>
                                                                </Tooltip>
                                                            </Space>
                                                        </td>
                                                    </motion.tr>
                                                )
                                            ),
                                        )}
                                    </tbody>
                                </table>
                            </Card>
                        </motion.div>
                    )
                ) : (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.2 }}
                        style={{ marginTop: 48 }}
                    >
                        <Empty
                            image={Empty.PRESENTED_IMAGE_SIMPLE}
                            description={
                                <div>
                                    <div style={{ marginBottom: 8 }}>
                                        {groups.length === 0 
                                            ? "No groups available" 
                                            : "No groups found"}
                                    </div>
                                    <Text type="secondary">
                                        {searchText
                                            ? `No groups match "${searchText}"`
                                            : filterBy !== "all"
                                              ? `No groups match the selected filter`
                                              : "Create your first group to get started"}
                                    </Text>
                                </div>
                            }
                        >
                            {!searchText && filterBy === "all" && groups.length === 0 && (
                                <Button
                                    type="primary"
                                    icon={<UsergroupAddOutlined />}
                                    onClick={() => setGroupModalVisible && setGroupModalVisible(true)}
                                >
                                    Create First Group
                                </Button>
                            )}
                        </Empty>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default GroupsDashboard;