// components/Layout/Header.jsx
import React, { useState, useEffect } from "react";
import {
    Input,
    Button,
    Avatar,
    Dropdown,
    Tooltip,
    Switch,
    Badge,
    Drawer,
} from "antd";
import { motion } from "framer-motion";
import {
    PlusOutlined,
    SunOutlined,
    MoonOutlined,
    SearchOutlined,
    UserOutlined,
    SettingOutlined,
    PoweroffOutlined,
    CrownFilled,
    BellOutlined,
    UserAddOutlined,
    UsergroupAddOutlined,
    MenuOutlined,
    CloseOutlined,
    TeamOutlined,
} from "@ant-design/icons";
import NotificationCenter from "./NotificationCenter";
import { useGlobalStore } from "@/stores/global.store";
import { useRequestStore } from "@/stores/request.store";
import secureLocalStorage from "react-secure-storage";
import SidebarDrawer from "./SidebarDrawer";
import { useNotificationsPage } from "@/hooks/queries/notification.queries";
import ProfileDrawer from "./ProfileDrawer";

const Header = ({
    currentTheme,
    searchQuery,
    setSearchQuery,
    setLeaveModalVisible,
    handleThemeToggle,
    leaveRequests,
    groups = [],
    handleGroupClick,
    loading = false,
    selectedGroupId = null,
}) => {
    const { setNewRequest } = useRequestStore();
    const { setNewMember, setNewGroup } = useGlobalStore();
    const [activeTab, setActiveTab] = useState("dashboard");
    const [sidebarVisible, setSidebarVisible] = useState(false);
    const [isMounted, setIsMounted] = useState(false);
    const [profileVisible, setProfileVisible] = useState(false);
    // const { user, updateProfile } = useUserStore();
    const user = [];
    const updateProfile = (values) => {
        
    };
    const branches = [];
    const departments = [];
    const positions = [];

    // Use the real notification hook
    const {
        notifications = [],
        isLoading: notificationsLoading,
        markAsRead,
        markAllAsRead,
        deleteNotification,
        getUnreadCount,
        refetch: refetchNotifications,
    } = useNotificationsPage();

    // Set mounted state
    useEffect(() => {
        setIsMounted(true);
    }, []);

    // Auto-refresh notifications every 30 seconds
    useEffect(() => {
        if (!isMounted) return;

        const interval = setInterval(() => {
            refetchNotifications();
        }, 30000);

        return () => clearInterval(interval);
    }, [isMounted, refetchNotifications]);

    // Handle notification click
    const handleNotificationClick = (notification) => {
        // Mark as read when clicked
        if (!notification.read) {
            markAsRead(notification.id);
        }

        // Handle navigation based on notification type and data
        if (notification.data) {
            switch (notification.type) {
                case "leave":
                    console.log(
                        "Navigate to leave request:",
                        notification.data.id,
                    );
                    break;
                case "travel":
                    console.log(
                        "Navigate to travel order:",
                        notification.data.id,
                    );
                    break;
                case "classwork":
                    console.log("Navigate to classwork:", notification.data.id);
                    break;
                default:
                    console.log("Notification clicked:", notification);
            }
        }
    };

    // Handle refreshing notifications
    const handleRefreshNotifications = () => {
        refetchNotifications();
    };

    const handleNewLeaveRequest = () => {
        setLeaveModalVisible(true);
    };

    const handleNewGroup = () => {
        setNewGroup(true);
    };

    const handleNewMember = () => {
        setNewMember(true);
    };

    const logout = () => {
        secureLocalStorage.removeItem("access_token");
        secureLocalStorage.removeItem("adminpro_refresh_token");
        secureLocalStorage.removeItem("adminpro_user");
        window.location.href = "/login";
    };

    const toggleSidebar = () => {
        setSidebarVisible(!sidebarVisible);
    };

    // Quick actions dropdown menu items
    const newItemsMenu = {
        items: [
            {
                key: "request",
                label: "New Request",
                icon: <PlusOutlined />,
                onClick: () => setNewRequest(true),
            },
            {
                key: "group",
                label: "New Group",
                icon: <UsergroupAddOutlined />,
                onClick: handleNewGroup,
            },
            {
                key: "member",
                label: "New Member",
                icon: <UserAddOutlined />,
                onClick: handleNewMember,
            },
        ],
    };

    // User dropdown menu items
    const userMenuItems = [
        {
            key: "profile",
            label: "My Profile",
            icon: <UserOutlined />,
            onClick: () => setProfileVisible(true),
        },
        // {
        //     key: "settings",
        //     label: "Settings",
        //     icon: <SettingOutlined />,
        //     onClick: () => console.log("Settings clicked"),
        // },
        // {
        //     key: "notifications",
        //     label: `Notification Settings`,
        //     icon: <BellOutlined />,
        //     onClick: () => console.log("Notification settings clicked"),
        // },
        { type: "divider" },
        {
            key: "logout",
            label: "Logout",
            icon: <PoweroffOutlined />,
            danger: true,
            onClick: logout,
        },
    ];

    const isMobile = typeof window !== "undefined" && window.innerWidth < 768;

    return (
        <>
            <header className="fixed-header">
                <div className="header-content">
                    <div className="logo-section">
                        {isMobile && (
                            <Button
                                type="text"
                                icon={<MenuOutlined />}
                                onClick={toggleSidebar}
                                className="hamburger-menu"
                                style={{
                                    marginRight: "16px",
                                    fontSize: "18px",
                                }}
                            />
                        )}
                        {!isMobile && (
                            <h1>
                                <img
                                    width={40}
                                    src="https://sso.sss.gov.ph/wsso/assets/common/images/sss/ssslogov2.png"
                                    alt="SSS Logo"
                                />{" "}
                                Legal Hub
                            </h1>
                        )}
                    </div>

                    <div className="header-actions">
                        {!isMobile && (
                            <Dropdown
                                menu={newItemsMenu}
                                trigger={["click"]}
                                placement="bottomRight"
                            >
                                <Button
                                    type="primary"
                                    icon={<PlusOutlined />}
                                    className="custom-primary-btn new-item-btn"
                                >
                                    New
                                </Button>
                            </Dropdown>
                        )}
                        {/* {!isMobile && (
                            <Tooltip
                                title={
                                    currentTheme === "light"
                                        ? "Switch to Dark Mode"
                                        : "Switch to Light Mode"
                                }
                            >
                                <Switch
                                    checked={currentTheme === "dark"}
                                    onChange={handleThemeToggle}
                                    checkedChildren={<MoonOutlined />}
                                    unCheckedChildren={<SunOutlined />}
                                   className="theme-toggle"
                                />
                            </Tooltip>
                        )} */}
                        <div className="notification-wrapper">
                            <NotificationCenter
                                notifications={notifications}
                                isLoading={notificationsLoading}
                                unreadCount={getUnreadCount()}
                                onNotificationClick={handleNotificationClick}
                                onMarkAllAsRead={markAllAsRead}
                                onMarkAsRead={markAsRead}
                                onDeleteNotification={deleteNotification}
                                onRefresh={handleRefreshNotifications}
                            />
                        </div>

                        <Dropdown
                            menu={{ items: userMenuItems }}
                            trigger={["click"]}
                            placement="bottomRight"
                        >
                            <motion.div
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                            >
                                <Avatar
                                    src="https://randomuser.me/api/portraits/men/1.jpg"
                                    className="user-avatar"
                                    size="large"
                                    icon={<UserOutlined />}
                                />
                            </motion.div>
                        </Dropdown>
                    </div>
                </div>
            </header>

            <ProfileDrawer
                open={profileVisible}
                onClose={() => setProfileVisible(false)}
                userData={user}
                onUpdate={updateProfile}
                branches={branches}
                departments={departments}
                positions={positions}
                loading={loading}
            />
            <SidebarDrawer
                groups={groups}
                sidebarVisible={sidebarVisible}
                setSidebarVisible={setSidebarVisible}
                selectedGroupId={selectedGroupId}
                handleGroupClick={handleGroupClick}
                loading={loading}
            />
        </>
    );
};

export default Header;
