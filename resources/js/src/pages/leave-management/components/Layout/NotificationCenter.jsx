// components/Layout/NotificationCenter.jsx
import React, { useState, useEffect } from "react";
import {
    Popover,
    Badge,
    Button,
    List,
    Tag,
    Dropdown,
    Spin,
    Empty,
    Typography,
    Space,
    Tooltip,
    message,
} from "antd";
import {
    BellOutlined,
    CheckOutlined,
    DeleteOutlined,
    EyeOutlined,
    ClockCircleOutlined,
    ExclamationCircleOutlined,
    CheckCircleOutlined,
    CloseCircleOutlined,
    CalendarOutlined,
    CarOutlined,
    FileTextOutlined,
    UserOutlined,
    ReloadOutlined,
    SettingOutlined,
    MoreOutlined,
    LoadingOutlined,
    InfoCircleOutlined,
    WarningOutlined,
} from "@ant-design/icons";
import { motion, AnimatePresence } from "framer-motion";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import "@/styles/Notification.scss";

dayjs.extend(relativeTime);

const { Text } = Typography;

const NotificationCenter = ({
    notifications = [],
    isLoading = false,
    unreadCount = 0,
    onNotificationClick,
    onMarkAllAsRead,
    onMarkAsRead,
    onDeleteNotification,
    onRefresh,
}) => {
    const [popoverVisible, setPopoverVisible] = useState(false);
    const [refreshing, setRefreshing] = useState(false);
    const [activeTab, setActiveTab] = useState('all');
    const [isMobile, setIsMobile] = useState(false);

    // Check if mobile on mount and resize
    useEffect(() => {
        const checkMobile = () => {
            setIsMobile(window.innerWidth <= 768);
        };
        
        checkMobile();
        window.addEventListener('resize', checkMobile);
        
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    const handleRefresh = async () => {
        if (onRefresh) {
            setRefreshing(true);
            try {
                await onRefresh();
                message.success('Notifications refreshed');
            } finally {
                setRefreshing(false);
            }
        }
    };

    const handleMarkAsRead = (id) => {
        if (onMarkAsRead) {
            onMarkAsRead(id);
        }
    };

    const handleMarkAllAsRead = () => {
        if (onMarkAllAsRead) {
            onMarkAllAsRead();
            message.success('All notifications marked as read');
        }
    };

    const handleDeleteNotification = (id) => {
        if (onDeleteNotification) {
            onDeleteNotification(id);
            message.success('Notification deleted');
        }
    };

    const handleDeleteAllNotifications = () => {
        if (notifications.length > 0) {
            notifications.forEach((notification) => {
                handleDeleteNotification(notification.id);
            });
            message.success('All notifications deleted');
        }
    };

    // Get notification icon based on type with proper colors
    const getNotificationIcon = (type) => {
        const iconStyle = { fontSize: '20px' };
        
        switch (type?.toLowerCase()) {
            case "leave":
                return <CalendarOutlined style={{ ...iconStyle, color: '#1890ff' }} />;
            case "travel":
                return <CarOutlined style={{ ...iconStyle, color: '#52c41a' }} />;
            case "classwork":
                return <FileTextOutlined style={{ ...iconStyle, color: '#722ed1' }} />;
            case "approval":
                return <CheckCircleOutlined style={{ ...iconStyle, color: '#52c41a' }} />;
            case "rejected":
                return <CloseCircleOutlined style={{ ...iconStyle, color: '#f5222d' }} />;
            case "reminder":
                return <ClockCircleOutlined style={{ ...iconStyle, color: '#fa8c16' }} />;
            case "warning":
                return <WarningOutlined style={{ ...iconStyle, color: '#faad14' }} />;
            case "info":
                return <InfoCircleOutlined style={{ ...iconStyle, color: '#1890ff' }} />;
            default:
                return <ExclamationCircleOutlined style={{ ...iconStyle, color: '#8c8c8c' }} />;
        }
    };

    // Get status tag with better styling
    const getStatusTag = (type, priority) => {
        const statusConfig = {
            leave: { color: "processing", text: "Leave" },
            travel: { color: "success", text: "Travel" },
            classwork: { color: "purple", text: "Classwork" },
            approval: { color: "warning", text: "Pending Approval" },
            approved: { color: "success", text: "Approved" },
            rejected: { color: "error", text: "Rejected" },
            reminder: { color: "orange", text: "Reminder" },
            info: { color: "blue", text: "Info" },
            warning: { color: "warning", text: "Warning" },
        };

        const config = statusConfig[type?.toLowerCase()] || {
            color: "default",
            text: type || "Notification",
        };
        
        return <Tag color={config.color}>{config.text}</Tag>;
    };

    // Format time
    const formatTime = (timestamp) => {
        return dayjs(timestamp).fromNow();
    };

    // Filter notifications based on active tab
    const getFilteredNotifications = () => {
        switch(activeTab) {
            case 'unread':
                return notifications.filter(n => !n.read);
            case 'read':
                return notifications.filter(n => n.read);
            default:
                return notifications;
        }
    };

    // Group notifications by date
    const groupNotificationsByDate = (notificationsToGroup) => {
        const groups = {
            today: [],
            yesterday: [],
            thisWeek: [],
            older: [],
        };

        const now = dayjs();
        notificationsToGroup.forEach((notification) => {
            const date = dayjs(notification.timestamp);
            const diffDays = now.diff(date, "day");

            if (diffDays === 0) {
                groups.today.push(notification);
            } else if (diffDays === 1) {
                groups.yesterday.push(notification);
            } else if (diffDays <= 7) {
                groups.thisWeek.push(notification);
            } else {
                groups.older.push(notification);
            }
        });

        return groups;
    };

    // Handle notification click
    const handleNotificationClick = (notification) => {
        if (!notification.read) {
            handleMarkAsRead(notification.id);
        }

        if (onNotificationClick) {
            onNotificationClick(notification);
        }

        setPopoverVisible(false);
    };

    // Notification item component
    const renderNotificationItem = (notification) => (
        <motion.div
            key={notification.id}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className={`notification-item ${!notification.read ? "unread" : ""} ${notification.highlighted ? "highlighted" : ""}`}
            onClick={() => handleNotificationClick(notification)}
        >
            <div className={`notification-read-indicator ${!notification.read ? "unread" : ""}`} />

            <div className="notification-content-wrapper">
                <div className={`notification-icon ${notification.type?.toLowerCase() || 'default'}`}>
                    {getNotificationIcon(notification.type)}
                </div>

                <div className="notification-details">
                    <div className="notification-header-row">
                        <span className="notification-title">{notification.title}</span>
                        <span className="notification-time">
                            <ClockCircleOutlined className="time-icon" />
                            {formatTime(notification.timestamp)}
                        </span>
                    </div>

                    <div className="notification-description">
                        {notification.description}
                    </div>

                    <div className="notification-meta">
                        {getStatusTag(notification.type, notification.priority)}
                        
                        {notification.employee && (
                            <span className="meta-employee">
                                <UserOutlined />
                                {notification.employee}
                            </span>
                        )}
                        
                        {notification.department && (
                            <span className="meta-department">
                                {notification.department}
                            </span>
                        )}
                    </div>
                </div>

                <div className="notification-actions">
                    <Dropdown
                        menu={{
                            items: [
                                {
                                    key: "view",
                                    label: "View Details",
                                    icon: <EyeOutlined />,
                                    onClick: (e) => {
                                        e.domEvent.stopPropagation();
                                        handleNotificationClick(notification);
                                    },
                                },
                                {
                                    key: "mark-read",
                                    label: "Mark as Read",
                                    icon: <CheckOutlined />,
                                    disabled: notification.read,
                                    onClick: (e) => {
                                        e.domEvent.stopPropagation();
                                        handleMarkAsRead(notification.id);
                                    },
                                },
                                { type: "divider" },
                                {
                                    key: "delete",
                                    label: "Delete",
                                    icon: <DeleteOutlined />,
                                    danger: true,
                                    onClick: (e) => {
                                        e.domEvent.stopPropagation();
                                        handleDeleteNotification(notification.id);
                                    },
                                },
                            ],
                        }}
                        trigger={["click"]}
                        onClick={(e) => e.stopPropagation()}
                    >
                        <Button
                            type="text"
                            icon={<MoreOutlined />}
                            size="small"
                            className="notification-more-btn"
                            onClick={(e) => e.stopPropagation()}
                        />
                    </Dropdown>
                </div>
            </div>
        </motion.div>
    );

    // Empty state component
    const renderEmptyState = () => (
        <div className="notification-empty">
            <div className="empty-illustration">
                <BellOutlined className="empty-icon" />
                <div className="empty-icon-bg" />
            </div>
            <h4>No notifications yet</h4>
            <p>
                When you receive notifications, they'll appear here
            </p>
            <div className="empty-actions">
                <Button 
                    type="primary" 
                    onClick={handleRefresh} 
                    loading={refreshing}
                    className="primary-action"
                >
                    Refresh
                </Button>
                <Button onClick={() => setPopoverVisible(false)}>
                    Close
                </Button>
            </div>
        </div>
    );

    // Loading state component
    const renderLoadingState = () => (
        <div className="notification-loading">
            <Spin 
                size="large" 
                indicator={<LoadingOutlined style={{ fontSize: 32 }} spin />}
            />
            <p>Loading notifications...</p>
        </div>
    );

    // Skeleton loading for notifications
    const renderSkeleton = () => (
        <>
            {[1, 2, 3].map((key) => (
                <div key={key} className="notification-skeleton">
                    <div className="skeleton-content">
                        <div className="skeleton-icon" />
                        <div className="skeleton-text">
                            <div className="skeleton-line" />
                            <div className="skeleton-line" />
                            <div className="skeleton-line" />
                        </div>
                    </div>
                </div>
            ))}
        </>
    );

    const filteredNotifications = getFilteredNotifications();
    const groupedNotifications = groupNotificationsByDate(filteredNotifications);
    const hasNotifications = filteredNotifications.length > 0;

    // Notification panel content
    const notificationContent = (
        <div className="notification-panel">
            <div className="notification-header">
                <h3>
                    Notifications
                    {unreadCount > 0 && (
                        <span className="notification-count">{unreadCount}</span>
                    )}
                </h3>
                <Space className="header-actions">
                    <Tooltip title="Mark all as read">
                        <Button
                            size="small"
                            icon={<CheckOutlined />}
                            onClick={handleMarkAllAsRead}
                            disabled={unreadCount === 0}
                        >
                            {!isMobile && 'Mark all read'}
                        </Button>
                    </Tooltip>
                    <Tooltip title="Refresh">
                        <Button
                            size="small"
                            icon={<ReloadOutlined />}
                            onClick={handleRefresh}
                            loading={refreshing}
                        />
                    </Tooltip>
                    <Tooltip title="Settings">
                        <Button 
                            size="small" 
                            icon={<SettingOutlined />}
                            className="settings-btn"
                        />
                    </Tooltip>
                </Space>
            </div>

            <div className="notification-tabs">
                <button 
                    className={`notification-tab ${activeTab === 'all' ? 'active' : ''}`}
                    onClick={() => setActiveTab('all')}
                >
                    All
                    <span className="tab-badge">{notifications.length}</span>
                </button>
                <button 
                    className={`notification-tab ${activeTab === 'unread' ? 'active' : ''}`}
                    onClick={() => setActiveTab('unread')}
                >
                    Unread
                    <span className="tab-badge">{unreadCount}</span>
                </button>
                <button 
                    className={`notification-tab ${activeTab === 'read' ? 'active' : ''}`}
                    onClick={() => setActiveTab('read')}
                >
                    Read
                    <span className="tab-badge">{notifications.length - unreadCount}</span>
                </button>
            </div>

            <div className="notification-content">
                <AnimatePresence>
                    {isLoading ? (
                        renderSkeleton()
                    ) : !hasNotifications ? (
                        renderEmptyState()
                    ) : (
                        <div className="notification-list">
                            {Object.entries(groupedNotifications).map(([groupName, groupNotifications]) => {
                                if (groupNotifications.length === 0) return null;

                                return (
                                    <div key={groupName} className="notification-group">
                                        <div className="group-header">
                                            <span>
                                                {groupName
                                                    .replace(/([A-Z])/g, " $1")
                                                    .replace(/^./, (str) => str.toUpperCase())}
                                            </span>
                                            <span className="group-count">
                                                {groupNotifications.length}
                                            </span>
                                        </div>
                                        <div className="group-items">
                                            {groupNotifications.map(renderNotificationItem)}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </AnimatePresence>
            </div>

            {hasNotifications && (
                <div className="notification-footer">
                    <div className="footer-actions">
                        <Button
                            danger
                            icon={<DeleteOutlined />}
                            onClick={handleDeleteAllNotifications}
                            className="clear-all-btn"
                            size={isMobile ? 'small' : 'middle'}
                        >
                            {!isMobile && 'Clear All'}
                        </Button>
                    </div>
                    <div className="footer-info">
                        <ClockCircleOutlined />
                        <span>Updated just now</span>
                    </div>
                </div>
            )}
        </div>
    );

    return (
        <div className="notification-container">
            {unreadCount > 0 && (
                <div className="ring-animation active" />
            )}
            
            <Popover
                content={notificationContent}
                trigger="click"
                placement={isMobile ? "top" : "bottomRight"}
                overlayClassName={`notification-popover ${isMobile ? 'mobile' : ''}`}
                open={popoverVisible}
                onOpenChange={setPopoverVisible}
                overlayStyle={{
                    boxShadow: "0 6px 16px 0 rgba(0, 0, 0, 0.08)",
                    borderRadius: "8px",
                }}
            >
                <Badge
                    count={unreadCount}
                    size={isMobile ? "small" : "default"}
                    offset={isMobile ? [-4, 4] : [-6, 6]}
                    className="notification-badge-wrapper"
                >
                    <Button
                        type="text"
                        icon={<BellOutlined className="notification-bell-icon" />}
                        shape="circle"
                        size="large"
                        className="notification-btn"
                    />
                </Badge>
            </Popover>
        </div>
    );
};

export default NotificationCenter;