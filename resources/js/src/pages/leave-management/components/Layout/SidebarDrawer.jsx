import { useState, useEffect, useCallback, useMemo } from "react";
import {
    TeamOutlined,
    CloseOutlined,
    UserOutlined,
    LogoutOutlined,
    MoonOutlined,
    SunOutlined,
    SettingOutlined,
    BellOutlined,
    PlusOutlined,
    SearchOutlined,
    FilterOutlined,
    CalendarOutlined,
    AppstoreOutlined,
    UsergroupAddOutlined,
} from "@ant-design/icons";
import {
    Avatar,
    Button,
    Tooltip,
    Switch,
    Badge,
    Space,
    Drawer,
    Input,
    Tag,
    Divider,
    Card,
} from "antd";
import "@/styles/SidebarDrawer.scss";
import { motion, AnimatePresence } from "framer-motion";
import GroupItem from "./GroupItem"; // Import your existing GroupItem component
import { getUser } from "@/utils/helpers"; // Import your user helper

// Enhanced Group Filter Component
const GroupFilterSection = ({ groups, onFilterChange, stats }) => {
    const [searchQuery, setSearchQuery] = useState("");
    const [activeFilter, setActiveFilter] = useState("all");

    const filterOptions = [
        { key: "all", label: "All Groups", icon: <AppstoreOutlined /> },
        {
            key: "active",
            label: "Active",
            icon: <TeamOutlined />,
            color: "#10b981",
        },
        {
            key: "mine",
            label: "My Groups",
            icon: <UserOutlined />,
            color: "#3b82f6",
        },
        {
            key: "pending",
            label: "Pending",
            icon: <BellOutlined />,
            color: "#f59e0b",
        },
    ];

    const handleFilterClick = (filterKey) => {
        setActiveFilter(filterKey);
        onFilterChange?.(filterKey, searchQuery);
    };

    return (
        <div className="filter-section">
            <div className="search-bar">
                <Input
                    prefix={<SearchOutlined />}
                    placeholder="Search groups..."
                    value={searchQuery}
                    onChange={(e) => {
                        setSearchQuery(e.target.value);
                        onFilterChange?.(activeFilter, e.target.value);
                    }}
                    size="small"
                    className="mobile-search-input"
                    allowClear
                />
            </div>

            <div className="filter-tags">
                {filterOptions.map((filter) => (
                    <motion.button
                        key={filter.key}
                        className={`filter-tag ${activeFilter === filter.key ? "active" : ""}`}
                        onClick={() => handleFilterClick(filter.key)}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        style={{
                            "--filter-color": filter.color,
                        }}
                    >
                        <span className="filter-icon">{filter.icon}</span>
                        <span className="filter-label">{filter.label}</span>
                        {stats[filter.key] > 0 && (
                            <span className="filter-count">
                                {stats[filter.key]}
                            </span>
                        )}
                    </motion.button>
                ))}
            </div>
        </div>
    );
};

const SidebarDrawer = ({
    sidebarVisible,
    setSidebarVisible,
    groups = [],
    handleGroupClick,
    setActiveTab,
    leaveRequests = [],
    loading,
    selectedGroupId,
}) => {
    const user = getUser(); // Get actual user data
    const [theme, setTheme] = useState("light");
    const [activeFilter, setActiveFilter] = useState("all");
    const [searchQuery, setSearchQuery] = useState("");

    // Memoize user ID to prevent unnecessary re-renders
    const userId = useMemo(() => user?.id, [user?.id]);

    // Calculate stats directly without useState to avoid infinite loops
    const stats = useMemo(() => {
        const total = groups.length;
        const active = groups.filter((g) => g.status === "active").length;
        const pending = leaveRequests.filter(
            (r) => r.status === "pending",
        ).length;
        const mine = groups.filter((g) =>
            g.members?.some((member) => {
                const memberId =
                    typeof member === "object" ? member?.id : member;
                return String(memberId) === String(userId);
            }),
        ).length;

        return {
            total,
            active,
            pending,
            mine,
            all: total,
        };
    }, [groups, leaveRequests, userId]);

    // Initialize theme
    useEffect(() => {
        const savedTheme = localStorage.getItem("app-theme") || "light";
        setTheme(savedTheme);
        document.documentElement.setAttribute("data-theme", savedTheme);
    }, []);

    const filteredGroups = useMemo(() => {
        let filtered = [...groups];

        switch (activeFilter) {
            case "active":
                filtered = filtered.filter((g) => g.status === "active");
                break;
            case "mine":
                filtered = filtered.filter((g) =>
                    g.members?.some((member) => {
                        const memberId =
                            typeof member === "object" ? member?.id : member;
                        return String(memberId) === String(userId);
                    }),
                );
                break;
            case "pending":
                // Get groups with pending requests
                const groupsWithPending = leaveRequests
                    .filter((r) => r.status === "pending")
                    .map((r) => r.group_id);
                filtered = filtered.filter((g) =>
                    groupsWithPending.includes(g.id),
                );
                break;
            case "all":
            default:
                // Show all groups
                break;
        }

        // Apply search
        if (searchQuery) {
            filtered = filtered.filter(
                (g) =>
                    g.group_name
                        ?.toLowerCase()
                        .includes(searchQuery.toLowerCase()) ||
                    g.group_code
                        ?.toLowerCase()
                        .includes(searchQuery.toLowerCase()) ||
                    g.description
                        ?.toLowerCase()
                        .includes(searchQuery.toLowerCase()),
            );
        }

        return filtered;
    }, [groups, activeFilter, searchQuery, leaveRequests, userId]);

    // Memoize handleFilterGroups to prevent unnecessary re-renders
    const handleFilterGroups = useCallback((filter, search) => {
        setActiveFilter(filter);
        setSearchQuery(search);
    }, []); // Empty dependency array because we're just updating local state

    // Memoize the filter predicates for better performance
    const filterPredicates = useMemo(
        () => ({
            active: (g) => g.status === "active",
            mine: (g) =>
                g.members?.some((member) => {
                    const memberId =
                        typeof member === "object" ? member?.id : member;
                    return String(memberId) === String(userId);
                }),
            pending: (g) => {
                const groupsWithPending = leaveRequests
                    .filter((r) => r.status === "pending")
                    .map((r) => r.group_id);
                return groupsWithPending.includes(g.id);
            },
            all: () => true,
        }),
        [userId, leaveRequests],
    );

    // Memoize getPendingCountForGroup with useCallback
    const getPendingCountForGroup = useCallback(
        (groupId) => {
            if (!leaveRequests || leaveRequests.length === 0) return 0;
            return leaveRequests.filter(
                (r) => r.group_id === groupId && r.status === "pending",
            ).length;
        },
        [leaveRequests],
    );

      const handleThemeToggle = (checked) => {
        const newTheme = checked ? "dark" : "light";
        setTheme(newTheme);
        document.documentElement.setAttribute("data-theme", newTheme);
        localStorage.setItem("app-theme", newTheme);
    };

      const handleLogout = () => {
        console.log("Logout clicked");
        // Add your logout logic here
    };

    // Memoize the handlers for GroupItem actions
    const handleEditGroup = useCallback(
        (group) => {
            console.log("Edit group:", group);
            setSidebarVisible(false);
        },
        [setSidebarVisible],
    );

    const handleToggleGroupStatus = useCallback((group) => {
        console.log("Toggle group status:", group);
    }, []);

    const handleManageMembers = useCallback(
        (group) => {
            console.log("Manage members:", group);
            setSidebarVisible(false);
            setActiveTab?.("members");
        },
        [setSidebarVisible, setActiveTab],
    );

    const handleDeleteGroup = useCallback((group) => {
        console.log("Delete group:", group);
    }, []);

    return (
        <Drawer
            title={
                <Space
                    align="end"
                    style={{ width: "100%", justifyContent: "flex-end" }}
                >

                    {/* <div className="theme-switcher">
                        <SunOutlined />
                        <Switch
                            checked={theme === "dark"}
                            onChange={handleThemeToggle}
                            className="theme-switch"
                            checkedChildren={<MoonOutlined />}
                            unCheckedChildren={<SunOutlined />}
                        />
                        <MoonOutlined />
                        <span className="theme-label">
                            {theme === "dark" ? "Dark" : "Light"}
                        </span>
                    </div> */}
                </Space>
            }
            placement="left"
            onClose={() => setSidebarVisible(false)}
            open={sidebarVisible}
            width="var(--sidebar-width)"
            closeIcon={<CloseOutlined />}
            className="sidebar-drawer enhanced"
            styles={{
                body: {
                    padding: 0,
                    display: "flex",
                    flexDirection: "column",
                },
                header: {
                    padding: "12px 16px",
                    borderBottom: "1px solid var(--border-color)",
                    background: "var(--bg-secondary)",
                },
            }}
        >
            <div className="drawer-container">
                {/* Logo Banner with Stats */}
                <div className="logo-banner">
                    <div className="logo">
                        <motion.div
                            className="logo-icon"
                            whileHover={{ rotate: 360 }}
                            transition={{ duration: 0.5 }}
                        >
                            <TeamOutlined />
                        </motion.div>
                        <div className="logo-text">
                            <h3 className="app-name">Legal Hub</h3>
                            <p className="app-description">
                                Request Collaboration Platform
                            </p>
                        </div>
                    </div>

                    <div className="quick-stats">
                        <div className="stat-item">
                            <span className="stat-value">{stats.active}</span>
                            <span className="stat-label">Active</span>
                        </div>
                        <div className="stat-item">
                            <span className="stat-value">{stats.pending}</span>
                            <span className="stat-label">Pending</span>
                        </div>
                        <div className="stat-item">
                            <span className="stat-value">{stats.mine}</span>
                            <span className="stat-label">Mine</span>
                        </div>
                    </div>
                </div>

                {/* Theme & Actions Section */}
                <motion.div
                    className="theme-actions-section"
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                >
                    <div className="quick-actions">
                        {/* Your quick actions buttons */}
                    </div>
                </motion.div>

                {/* Groups Content */}
                <div className="groups-content-wrapper">
                    {/* Optional: Uncomment if you want the filter section */}
                    {/* <GroupFilterSection
                        groups={groups}
                        onFilterChange={handleFilterGroups}
                        stats={stats}
                    /> */}

                    <div className="groups-header">
                        <h4>Your Groups ({filteredGroups.length})</h4>
                        {stats.pending > 0 && (
                            <Badge
                                count={`${stats.pending} pending`}
                                style={{
                                    backgroundColor: "var(--warning-color)",
                                    fontSize: "11px",
                                }}
                                size="small"
                            />
                        )}
                    </div>

                    <div className="groups-content">
                        <AnimatePresence mode="wait">
                            {loading ? (
                                <motion.div
                                    key="loading"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    className="groups-loading"
                                >
                                    {[1, 2, 3].map((i) => (
                                        <div
                                            key={i}
                                            className="group-item-loading"
                                        >
                                            <div className="loading-avatar" />
                                            <div className="loading-content">
                                                <div
                                                    className="loading-line"
                                                    style={{ width: "70%" }}
                                                />
                                                <div
                                                    className="loading-line"
                                                    style={{ width: "50%" }}
                                                />
                                            </div>
                                        </div>
                                    ))}
                                </motion.div>
                            ) : filteredGroups.length === 0 ? (
                                <motion.div
                                    key="empty"
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    className="groups-empty"
                                >
                                    <div className="empty-illustration">
                                        <TeamOutlined />
                                    </div>
                                    <p className="empty-title">
                                        No groups found
                                    </p>
                                    <p className="empty-subtitle">
                                        {groups.length === 0
                                            ? "Create your first group to get started"
                                            : "Try changing your filters or search term"}
                                    </p>
                                    {groups.length === 0 && (
                                        <Button
                                            type="primary"
                                            icon={<PlusOutlined />}
                                            size="small"
                                            className="empty-action"
                                            onClick={() => {
                                                setSidebarVisible(false);
                                            }}
                                        >
                                            Create Group
                                        </Button>
                                    )}
                                </motion.div>
                            ) : (
                                <motion.div
                                    key="groups"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    className="groups-list"
                                >
                                    {filteredGroups.map((group) => (
                                        <div
                                            key={group.id}
                                            className="mobile-group-item-wrapper"
                                        >
                                            <GroupItem
                                                group={group}
                                                isActive={
                                                    group.id === selectedGroupId
                                                }
                                                pendingCount={getPendingCountForGroup(
                                                    group.id,
                                                )}
                                                leaveRequests={leaveRequests}
                                                onGroupClick={(g) => {
                                                    handleGroupClick(g);
                                                    setSidebarVisible(false);
                                                }}
                                                onEdit={handleEditGroup}
                                                onToggleStatus={
                                                    handleToggleGroupStatus
                                                }
                                                onManageMembers={
                                                    handleManageMembers
                                                }
                                                onDelete={handleDeleteGroup}
                                            />
                                        </div>
                                    ))}
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>

                {/* Footer Actions */}
                <motion.div
                    className="drawer-footer"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                >
                    <div className="address-section">
                        <div className="address">
                            <b>Carmen, Cagayan de Oro City</b>
                            <span>
                                Carmen-Patag Road, Carmen, Cagayan de Oro,
                                Philippines, 9000
                            </span>
                        </div>
                    </div>

                    <div className="footer-actions">
                        <Button
                            type="text"
                            icon={<SettingOutlined />}
                            size="small"
                            className="footer-btn"
                            onClick={() => {
                                setActiveTab?.("settings");
                                setSidebarVisible(false);
                            }}
                        >
                            Settings
                        </Button>
                        <Button
                            type="text"
                            icon={<LogoutOutlined />}
                            size="small"
                            className="footer-btn logout"
                            onClick={handleLogout}
                        >
                            Logout
                        </Button>
                    </div>
                    <div className="footer-info">
                        <small>v1.0.0 • Legal HUb © 2026</small>
                    </div>
                </motion.div>
            </div>
        </Drawer>
    );
};

export default SidebarDrawer;
