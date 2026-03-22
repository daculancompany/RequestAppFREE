import React, { useState, useEffect } from "react";
import {
    List,
    Avatar,
    Tag,
    Button,
    Pagination,
    Card,
    Row,
    Col,
    Typography,
    Divider,
    Badge,
    Dropdown,
    Space,
    Empty,
    message,
    Modal,
    Menu,
} from "antd";
import {
    BellOutlined,
    CheckCircleOutlined,
    ClockCircleOutlined,
    ExclamationCircleOutlined,
    InfoCircleOutlined,
    MailOutlined,
    MoreOutlined,
    DeleteOutlined,
    CheckOutlined,
    EyeOutlined,
    EyeInvisibleOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import "@/styles/NotificationListPage.scss";

dayjs.extend(relativeTime);

const { Title, Text } = Typography;
const { confirm } = Modal;

// Mock data generator
const generateMockNotifications = (count) => {
    const types = ["info", "warning", "success", "error", "system"];
    const priorities = ["low", "medium", "high"];
    const titles = [
        "New message received",
        "System maintenance scheduled",
        "Your request has been approved",
        "Payment failed",
        "Security alert",
        "New comment on your post",
        "Meeting reminder",
        "Document shared with you",
        "Password change required",
        "Weekly report ready",
    ];

    return Array.from({ length: count }, (_, i) => ({
        id: `notif-${i + 1}`,
        title: titles[i % titles.length],
        description: `This is a detailed description of the notification #${i + 1}. It contains important information that requires your attention.`,
        timestamp: new Date(
            Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000,
        ),
        read: Math.random() > 0.5,
        type: types[Math.floor(Math.random() * types.length)],
        priority: priorities[Math.floor(Math.random() * priorities.length)],
        sender: ["System", "Admin", "John Doe", "Support Team"][
            Math.floor(Math.random() * 4)
        ],
        actionUrl: i % 3 === 0 ? "/dashboard" : undefined,
    }));
};

const NotificationPage = () => {
    const [notifications, setNotifications] = useState([]);
    const [filteredNotifications, setFilteredNotifications] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);
    const [filter, setFilter] = useState("all");
    const [loading, setLoading] = useState(false);
    const [unreadCount, setUnreadCount] = useState(0);

    // Load notifications
    useEffect(() => {
        loadNotifications();
    }, []);

    // Apply filter
    useEffect(() => {
        if (filter === "all") {
            setFilteredNotifications(notifications);
        } else if (filter === "unread") {
            setFilteredNotifications(notifications.filter((n) => !n.read));
        } else {
            setFilteredNotifications(notifications.filter((n) => n.read));
        }
        setCurrentPage(1);
    }, [notifications, filter]);

    // Update unread count
    useEffect(() => {
        setUnreadCount(notifications.filter((n) => !n.read).length);
    }, [notifications]);

    const loadNotifications = () => {
        setLoading(true);
        setTimeout(() => {
            const data = generateMockNotifications(50);
            setNotifications(data);
            setFilteredNotifications(data);
            setLoading(false);
        }, 500);
    };

    const handlePageChange = (page, size) => {
        setCurrentPage(page);
        if (size) {
            setPageSize(size);
        }
    };

    const getTypeIcon = (type) => {
        const icons = {
            info: <InfoCircleOutlined />,
            warning: <ExclamationCircleOutlined />,
            success: <CheckCircleOutlined />,
            error: <ExclamationCircleOutlined />,
            system: <BellOutlined />,
        };
        return icons[type];
    };

    const getTypeColor = (type) => {
        const colors = {
            info: "#0ea5e9",
            warning: "#f59e0b",
            success: "#10b981",
            error: "#ef4444",
            system: "#3b82f6",
        };
        return colors[type];
    };

    const getPriorityColor = (priority) => {
        const colors = {
            low: "#10b981",
            medium: "#f59e0b",
            high: "#ef4444",
        };
        return colors[priority];
    };

    const getPriorityText = (priority) => {
        return priority.charAt(0).toUpperCase() + priority.slice(1);
    };

    const markAsRead = (id) => {
        setNotifications((prev) =>
            prev.map((notif) =>
                notif.id === id ? { ...notif, read: true } : notif,
            ),
        );
        message.success("Notification marked as read");
    };

    const markAllAsRead = () => {
        setNotifications((prev) =>
            prev.map((notif) => ({ ...notif, read: true })),
        );
        message.success("All notifications marked as read");
    };

    const deleteNotification = (id) => {
        setNotifications((prev) => prev.filter((notif) => notif.id !== id));
        message.success("Notification deleted");
    };

    const clearAll = () => {
        confirm({
            title: "Clear All Notifications",
            content:
                "Are you sure you want to delete all notifications? This action cannot be undone.",
            okText: "Yes, Clear All",
            okType: "danger",
            cancelText: "Cancel",
            onOk() {
                setNotifications([]);
                message.success("All notifications cleared");
            },
        });
    };

    const toggleReadStatus = (id) => {
        setNotifications((prev) =>
            prev.map((notif) =>
                notif.id === id ? { ...notif, read: !notif.read } : notif,
            ),
        );
    };

    const FilterMenu = (
        <Menu
            items={[
                {
                    key: "all",
                    label: "All Notifications",
                    onClick: () => setFilter("all"),
                },
                {
                    key: "unread",
                    label: "Unread Only",
                    onClick: () => setFilter("unread"),
                },
                {
                    key: "read",
                    label: "Read Only",
                    onClick: () => setFilter("read"),
                },
            ]}
        />
    );

    const getActionsMenu = (item) => (
        <Menu
            items={[
                {
                    key: "toggle-read",
                    icon: item.read ? (
                        <EyeInvisibleOutlined />
                    ) : (
                        <EyeOutlined />
                    ),
                    label: item.read ? "Mark as Unread" : "Mark as Read",
                    onClick: () => toggleReadStatus(item.id),
                },
                {
                    key: "delete",
                    icon: <DeleteOutlined />,
                    label: "Delete",
                    danger: true,
                    onClick: () => deleteNotification(item.id),
                },
            ]}
        />
    );

    return (
        <div className="notification-page">
            <div className="notification-content">
                <List
                    className="notification-list"
                    loading={loading}
                    dataSource={filteredNotifications.slice(
                        (currentPage - 1) * pageSize,
                        currentPage * pageSize,
                    )}
                    locale={{
                        emptyText: (
                            <Empty
                                image={Empty.PRESENTED_IMAGE_SIMPLE}
                                description="No notifications found"
                            />
                        ),
                    }}
                    renderItem={(item) => (
                        <List.Item
                            className={`notification-item ${item.read ? "read" : "unread"}`}
                        >
                            <div className="notification-item-content">
                                <div className="notification-icon">
                                    <Avatar
                                        style={{
                                            backgroundColor: getTypeColor(
                                                item.type,
                                            ),
                                            color: "white",
                                        }}
                                        icon={getTypeIcon(item.type)}
                                    />
                                </div>
                                <div className="notification-details">
                                    <div className="notification-header-row">
                                        <Title
                                            level={5}
                                            className="notification-title"
                                        >
                                            {item.title}
                                            {!item.read && (
                                                <span className="unread-dot" />
                                            )}
                                        </Title>
                                        <Space className="notification-actions">
                                            <Tag
                                                color={getPriorityColor(
                                                    item.priority,
                                                )}
                                                className="priority-tag"
                                            >
                                                {getPriorityText(item.priority)}
                                            </Tag>
                                            <Text
                                                type="secondary"
                                                className="notification-time"
                                            >
                                                {dayjs(
                                                    item.timestamp,
                                                ).fromNow()}
                                            </Text>
                                            <Dropdown
                                                overlay={getActionsMenu(item)}
                                                trigger={["click"]}
                                            >
                                                <Button
                                                    type="text"
                                                    icon={<MoreOutlined />}
                                                    size="small"
                                                />
                                            </Dropdown>
                                        </Space>
                                    </div>
                                    <Text className="notification-description">
                                        {item.description}
                                    </Text>
                                    <div className="notification-footer">
                                        {item.sender && (
                                            <Space>
                                                <MailOutlined />
                                                <Text type="secondary">
                                                    From: {item.sender}
                                                </Text>
                                            </Space>
                                        )}
                                        <Space>
                                            {!item.read && (
                                                <Button
                                                    type="link"
                                                    size="small"
                                                    onClick={() =>
                                                        markAsRead(item.id)
                                                    }
                                                    className="mark-read-btn"
                                                    icon={<CheckOutlined />}
                                                >
                                                    Mark as Read
                                                </Button>
                                            )}
                                            <Button
                                                type="link"
                                                size="small"
                                                onClick={() =>
                                                    deleteNotification(item.id)
                                                }
                                                className="delete-btn"
                                                icon={<DeleteOutlined />}
                                                danger
                                            >
                                                Delete
                                            </Button>
                                        </Space>
                                    </div>
                                </div>
                            </div>
                        </List.Item>
                    )}
                />

                <div className="notification-pagination">
                    <Pagination
                        current={currentPage}
                        pageSize={pageSize}
                        total={filteredNotifications.length}
                        onChange={handlePageChange}
                        onShowSizeChange={handlePageChange}
                        showSizeChanger
                        showQuickJumper
                        showTotal={(total, range) =>
                            `${range[0]}-${range[1]} of ${total} notifications`
                        }
                        pageSizeOptions={["5", "10", "20", "50"]}
                    />
                </div>
            </div>
        </div>
    );
};

export default NotificationPage;
