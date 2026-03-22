// components/Dashboard/Dashboard.jsx
import React, { useCallback, useState, useEffect, useRef } from "react";
import { Row, Col, Card, Button, Tag, Avatar, Dropdown, List, Skeleton, Empty } from "antd";
import {
    TeamOutlined,
    BellOutlined,
    MoreOutlined,
    EditOutlined,
    DeleteOutlined,
    PauseCircleOutlined,
    PlayCircleOutlined,
    TagOutlined,
    ClockCircleOutlined,
    UserOutlined,
    CalendarOutlined,
    CheckCircleOutlined,
    CloseCircleOutlined,
    EnvironmentOutlined,
} from "@ant-design/icons";
import StatsCards from "./StatsCards";
import { useGlobalStore } from "@/stores/global.store";
import InfiniteScroll from "react-infinite-scroll-component";

const Dashboard = ({ appContext }) => {
    const { activeGroup, setGroupSelected } = useGlobalStore();
    
    // State for infinite scroll
    const [requests, setRequests] = useState([]);
    const [activities, setActivities] = useState([]);
    const [requestsPage, setRequestsPage] = useState(1);
    const [activitiesPage, setActivitiesPage] = useState(1);
    const [hasMoreRequests, setHasMoreRequests] = useState(true);
    const [hasMoreActivities, setHasMoreActivities] = useState(true);
    const [loadingRequests, setLoadingRequests] = useState(false);
    const [loadingActivities, setLoadingActivities] = useState(false);
    const [requestsTotal, setRequestsTotal] = useState(0);
    const [activitiesTotal, setActivitiesTotal] = useState(0);

    const getImage = useCallback(() => {
        return activeGroup?.group_image || null;
    }, [activeGroup?.group_image]);

    const getBannerImage = useCallback(() => {
        const groupImage = getImage();
        if (groupImage) {
            return groupImage;
        }

        // Fallback to default images based on group code or type
        const defaultImages = {
            TEAV_TEAM:
                "https://images.unsplash.com/photo-1552664730-d307ca884978?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80",
            DESIGN_TEAM:
                "https://images.unsplash.com/photo-1561070791-2526d30994b5?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80",
            MARKETING:
                "https://images.unsplash.com/photo-1551434678-e076c223a692?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80",
            default:
                "https://images.unsplash.com/photo-1542744173-8e7e53415bb0?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80",
        };

        return defaultImages[activeGroup?.group_code] || defaultImages.default;
    }, [getImage, activeGroup?.group_code]);

    // Mock data fetch functions - replace with actual API calls
    const fetchRequests = useCallback(async (page = 1) => {
        if (!activeGroup?.id) return;
        
        setLoadingRequests(true);
        try {
            // Simulate API call - replace with actual API
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            // Mock data
            const mockRequests = [
                {
                    id: 1,
                    employeeName: "John Doe",
                    type: "Leave",
                    date: "2024-03-15",
                    status: "pending",
                    avatar: null,
                },
                {
                    id: 2,
                    employeeName: "Jane Smith",
                    type: "Overtime",
                    date: "2024-03-16",
                    status: "pending",
                    avatar: null,
                },
                {
                    id: 3,
                    employeeName: "Mike Johnson",
                    type: "Equipment",
                    date: "2024-03-14",
                    status: "approved",
                    avatar: null,
                },
                {
                    id: 4,
                    employeeName: "Sarah Wilson",
                    type: "Leave",
                    date: "2024-03-17",
                    status: "pending",
                    avatar: null,
                },
                {
                    id: 5,
                    employeeName: "Tom Brown",
                    type: "Training",
                    date: "2024-03-18",
                    status: "rejected",
                    avatar: null,
                },
                // Add more items to test scrolling
                ...Array.from({ length: 15 }, (_, i) => ({
                    id: i + 6,
                    employeeName: `Employee ${i + 6}`,
                    type: ["Leave", "Overtime", "Equipment", "Training"][i % 4],
                    date: `2024-03-${(i % 30) + 1}`,
                    status: ["pending", "approved", "rejected"][i % 3],
                    avatar: null,
                })),
            ];
            
            const total = 50; // Mock total count
            const start = (page - 1) * 10;
            const end = start + 10;
            const paginatedData = mockRequests.slice(start, end);
            
            setRequestsTotal(total);
            setHasMoreRequests(end < total);
            
            return paginatedData;
        } finally {
            setLoadingRequests(false);
        }
    }, [activeGroup?.id]);

    const fetchActivities = useCallback(async (page = 1) => {
        if (!activeGroup?.id) return;
        
        setLoadingActivities(true);
        try {
            // Simulate API call - replace with actual API
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            // Mock data
            const mockActivities = [
                {
                    id: 1,
                    user: "John Doe",
                    action: "created a new task",
                    target: "Q1 Planning",
                    time: "5 minutes ago",
                    avatar: null,
                },
                {
                    id: 2,
                    user: "Jane Smith",
                    action: "completed",
                    target: "Design Review",
                    time: "15 minutes ago",
                    avatar: null,
                },
                {
                    id: 3,
                    user: "Mike Johnson",
                    action: "commented on",
                    target: "Project Alpha",
                    time: "1 hour ago",
                    avatar: null,
                },
                {
                    id: 4,
                    user: "Sarah Wilson",
                    action: "uploaded files to",
                    target: "Documentation",
                    time: "2 hours ago",
                    avatar: null,
                },
                {
                    id: 5,
                    user: "Tom Brown",
                    action: "updated",
                    target: "Sprint Board",
                    time: "3 hours ago",
                    avatar: null,
                },
                // Add more items to test scrolling
                ...Array.from({ length: 15 }, (_, i) => ({
                    id: i + 6,
                    user: `User ${i + 6}`,
                    action: ["created", "updated", "commented on", "deleted"][i % 4],
                    target: `Item ${i + 6}`,
                    time: `${(i % 24) + 1} hours ago`,
                    avatar: null,
                })),
            ];
            
            const total = 50; // Mock total count
            const start = (page - 1) * 10;
            const end = start + 10;
            const paginatedData = mockActivities.slice(start, end);
            
            setActivitiesTotal(total);
            setHasMoreActivities(end < total);
            
            return paginatedData;
        } finally {
            setLoadingActivities(false);
        }
    }, [activeGroup?.id]);

    // Load initial data when group changes
    useEffect(() => {
        if (activeGroup?.id) {
            setRequests([]);
            setActivities([]);
            setRequestsPage(1);
            setActivitiesPage(1);
            
            fetchRequests(1).then(data => setRequests(data));
            fetchActivities(1).then(data => setActivities(data));
        }
    }, [activeGroup?.id, fetchRequests, fetchActivities]);

    // Load more requests
    const loadMoreRequests = useCallback(async () => {
        if (loadingRequests || !hasMoreRequests) return;
        
        const nextPage = requestsPage + 1;
        const newData = await fetchRequests(nextPage);
        setRequests(prev => [...prev, ...newData]);
        setRequestsPage(nextPage);
    }, [requestsPage, loadingRequests, hasMoreRequests, fetchRequests]);

    // Load more activities
    const loadMoreActivities = useCallback(async () => {
        if (loadingActivities || !hasMoreActivities) return;
        
        const nextPage = activitiesPage + 1;
        const newData = await fetchActivities(nextPage);
        setActivities(prev => [...prev, ...newData]);
        setActivitiesPage(nextPage);
    }, [activitiesPage, loadingActivities, hasMoreActivities, fetchActivities]);

    // Handle request actions
    const handleRequestAction = (requestId, action) => {
        console.log(`Request ${requestId} ${action}`);
        // Implement actual action handling
    };

    // Get status color and icon
    const getStatusConfig = (status) => {
        const configs = {
            pending: { color: "gold", icon: <ClockCircleOutlined /> },
            approved: { color: "green", icon: <CheckCircleOutlined /> },
            rejected: { color: "red", icon: <CloseCircleOutlined /> },
        };
        return configs[status] || configs.pending;
    };

    // Handle group deletion
    const handleDeleteGroup = (group) => {
        console.log("Delete group:", group);
        // Implement actual delete logic
    };

    return (
        <div className="dashboard-grid">
            {/* Image Banner with Gradient Overlay using group image */}
            <div
                className="group-banner-container"
                style={{ marginBottom: "24px" }}
            >
                <div
                    className="banner-image-wrapper"
                    style={{
                        position: "relative",
                        borderRadius: "12px",
                        overflow: "hidden",
                        height: "180px",
                        backgroundImage: `url(${getBannerImage()})`,
                        backgroundSize: "cover",
                        backgroundPosition: "center",
                    }}
                >
                    <div
                        style={{
                            position: "absolute",
                            top: 0,
                            left: 0,
                            right: 0,
                            bottom: 0,
                            background: `linear-gradient(135deg, ${activeGroup?.group_color}80 0%, ${adjustColor(activeGroup?.group_color, -40)}80 100%)`,
                            display: "flex",
                            alignItems: "center",
                            padding: "0 32px",
                        }}
                    >
                        <Row align="middle" style={{ width: "100%" }}>
                            <Col flex="auto">
                                <div
                                    style={{
                                        display: "flex",
                                        alignItems: "center",
                                        gap: "20px",
                                    }}
                                >
                                    <div
                                        style={{
                                            width: "64px",
                                            height: "64px",
                                            background: `rgba(255, 255, 255, 0.2)`,
                                            borderRadius: "12px",
                                            display: "flex",
                                            alignItems: "center",
                                            justifyContent: "center",
                                            fontSize: "28px",
                                            color: "white",
                                            backdropFilter: "blur(10px)",
                                            border: `2px solid ${activeGroup?.group_color}`,
                                            overflow: "hidden",
                                        }}
                                    >
                                        {activeGroup?.group_image ? (
                                            <img
                                                src={activeGroup?.group_image}
                                                alt={activeGroup?.group_name}
                                                style={{
                                                    width: "100%",
                                                    height: "100%",
                                                    objectFit: "cover",
                                                }}
                                                className="image-profile"
                                            />
                                        ) : (
                                            <TeamOutlined />
                                        )}
                                    </div>
                                    <div>
                                        <div
                                            style={{
                                                display: "flex",
                                                alignItems: "center",
                                                gap: "12px",
                                                marginBottom: "8px",
                                            }}
                                        >
                                            <h1
                                                style={{
                                                    margin: 0,
                                                    color: "white",
                                                    fontSize: "28px",
                                                    fontWeight: "bold",
                                                }}
                                            >
                                                {activeGroup?.group_name}
                                            </h1>
                                            <Tag
                                                icon={<TagOutlined />}
                                                color={activeGroup?.group_color}
                                                style={{
                                                    fontSize: "12px",
                                                    fontWeight: "bold",
                                                    border: "none",
                                                }}
                                            >
                                                {activeGroup?.group_code}
                                            </Tag>
                                        </div>

                                        <div
                                            style={{
                                                display: "flex",
                                                gap: "24px",
                                                marginTop: "12px",
                                                color: "white",
                                            }}
                                        >
                                            <div>
                                                <div
                                                    style={{
                                                        fontSize: "24px",
                                                        fontWeight: "bold",
                                                    }}
                                                >
                                                    3
                                                </div>
                                                <div
                                                    style={{
                                                        fontSize: "12px",
                                                        opacity: 0.9,
                                                    }}
                                                >
                                                    Available
                                                </div>
                                            </div>
                                            <div>
                                                <div
                                                    style={{
                                                        fontSize: "24px",
                                                        fontWeight: "bold",
                                                    }}
                                                >
                                                    2
                                                </div>
                                                <div
                                                    style={{
                                                        fontSize: "12px",
                                                        opacity: 0.9,
                                                    }}
                                                >
                                                    On Leave
                                                </div>
                                            </div>
                                            <div>
                                                <div
                                                    style={{
                                                        fontSize: "24px",
                                                        fontWeight: "bold",
                                                    }}
                                                >
                                                    90%
                                                </div>
                                                <div
                                                    style={{
                                                        fontSize: "12px",
                                                        opacity: 0.9,
                                                    }}
                                                >
                                                    Availability
                                                </div>
                                            </div>
                                            <div>
                                                <div
                                                    style={{
                                                        fontSize: "24px",
                                                        fontWeight: "bold",
                                                    }}
                                                >
                                                    44
                                                </div>
                                                <div
                                                    style={{
                                                        fontSize: "12px",
                                                        opacity: 0.9,
                                                    }}
                                                >
                                                    Total Members
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </Col>
                            <Col>
                                <Dropdown
                                    menu={{
                                        items: [
                                            {
                                                key: "edit",
                                                label: "Edit Group",
                                                icon: <EditOutlined />,
                                                onClick: () =>
                                                    setGroupSelected(activeGroup),
                                            },
                                            {
                                                key: "delete",
                                                label: "Delete Group",
                                                icon: <DeleteOutlined />,
                                                danger: true,
                                                onClick: () =>
                                                    handleDeleteGroup(
                                                        activeGroup,
                                                    ),
                                            },
                                        ],
                                    }}
                                    trigger={["click"]}
                                    placement="bottomRight"
                                >
                                    <Button
                                        type="primary"
                                        shape="round"
                                        icon={<MoreOutlined />}
                                        style={{
                                            background:
                                                "rgba(255, 255, 255, 0.2)",
                                            border: `1px solid ${activeGroup?.group_color}`,
                                            color: "white",
                                            backdropFilter: "blur(10px)",
                                            fontWeight: "500",
                                        }}
                                    >
                                        Actions
                                    </Button>
                                </Dropdown>
                            </Col>
                        </Row>
                    </div>
                </div>
            </div>

            <StatsCards
                appContext={appContext}
                groupColor={activeGroup?.group_color}
            />

            {/* Upcoming Requests and Activity Feed Section */}
            <Row gutter={[24, 24]} style={{ marginTop: "24px" }}>
                <Col xs={24} lg={12}>
                    <Card 
                        title={
                            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                                <BellOutlined style={{ color: activeGroup?.group_color }} />
                                <span>Upcoming Requests</span>
                                <Tag color={activeGroup?.group_color} style={{ marginLeft: "8px" }}>
                                    {requestsTotal} Total
                                </Tag>
                            </div>
                        }
                        bordered={false}
                        className="dashboard-card"
                        style={{ height: "500px", display: "flex", flexDirection: "column" }}
                        bodyStyle={{ padding: 0, flex: 1, overflow: "hidden" }}
                    >
                        <div
                            id="scrollableRequests"
                            style={{
                                height: "100%",
                                overflow: "auto",
                                padding: "16px",
                            }}
                        >
                            <InfiniteScroll
                                dataLength={requests.length}
                                next={loadMoreRequests}
                                hasMore={hasMoreRequests}
                                loader={
                                    <div style={{ textAlign: "center", padding: "20px" }}>
                                        <Skeleton avatar paragraph={{ rows: 1 }} active />
                                    </div>
                                }
                                endMessage={
                                    requests.length > 0 ? (
                                        <div style={{ textAlign: "center", padding: "20px" }}>
                                            <Tag color="success">No more requests</Tag>
                                        </div>
                                    ) : null
                                }
                                scrollableTarget="scrollableRequests"
                            >
                                <List
                                    itemLayout="horizontal"
                                    dataSource={requests}
                                    renderItem={(item) => {
                                        const statusConfig = getStatusConfig(item.status);
                                        return (
                                            <List.Item
                                                key={item.id}
                                                actions={[
                                                    item.status === "pending" && (
                                                        <div style={{ display: "flex", gap: "8px" }}>
                                                            <Button
                                                                type="text"
                                                                icon={<CheckCircleOutlined />}
                                                                onClick={() => handleRequestAction(item.id, "approved")}
                                                                style={{ color: "#52c41a" }}
                                                            />
                                                            <Button
                                                                type="text"
                                                                icon={<CloseCircleOutlined />}
                                                                onClick={() => handleRequestAction(item.id, "rejected")}
                                                                style={{ color: "#f5222d" }}
                                                            />
                                                        </div>
                                                    ),
                                                ].filter(Boolean)}
                                            >
                                                <List.Item.Meta
                                                    avatar={
                                                        <Avatar 
                                                            src={item.avatar} 
                                                            icon={<UserOutlined />}
                                                            style={{ backgroundColor: activeGroup?.group_color }}
                                                        />
                                                    }
                                                    title={
                                                        <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
                                                            <span style={{ fontWeight: 500 }}>{item.employeeName}</span>
                                                            <Tag icon={statusConfig.icon} color={statusConfig.color}>
                                                                {item.type}
                                                            </Tag>
                                                            <Tag color={statusConfig.color}>
                                                                {item.status}
                                                            </Tag>
                                                        </div>
                                                    }
                                                    description={
                                                        <div style={{ display: "flex", alignItems: "center", gap: "8px", color: "#8c8c8c" }}>
                                                            <CalendarOutlined />
                                                            <span>{new Date(item.date).toLocaleDateString()}</span>
                                                        </div>
                                                    }
                                                />
                                            </List.Item>
                                        );
                                    }}
                                />
                                {requests.length === 0 && !loadingRequests && (
                                    <Empty 
                                        description="No pending requests" 
                                        style={{ marginTop: "100px" }}
                                    />
                                )}
                            </InfiniteScroll>
                        </div>
                    </Card>
                </Col>
                
                <Col xs={24} lg={12}>
                    <Card 
                        title={
                            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                                <ClockCircleOutlined style={{ color: activeGroup?.group_color }} />
                                <span>Activity Feed</span>
                                <Tag color={activeGroup?.group_color} style={{ marginLeft: "8px" }}>
                                    {activitiesTotal} Activities
                                </Tag>
                            </div>
                        }
                        bordered={false}
                        className="dashboard-card"
                        style={{ height: "500px", display: "flex", flexDirection: "column" }}
                        bodyStyle={{ padding: 0, flex: 1, overflow: "hidden" }}
                    >
                        <div
                            id="scrollableActivities"
                            style={{
                                height: "100%",
                                overflow: "auto",
                                padding: "16px",
                            }}
                        >
                            <InfiniteScroll
                                dataLength={activities.length}
                                next={loadMoreActivities}
                                hasMore={hasMoreActivities}
                                loader={
                                    <div style={{ textAlign: "center", padding: "20px" }}>
                                        <Skeleton avatar paragraph={{ rows: 1 }} active />
                                    </div>
                                }
                                endMessage={
                                    activities.length > 0 ? (
                                        <div style={{ textAlign: "center", padding: "20px" }}>
                                            <Tag color="success">No more activities</Tag>
                                        </div>
                                    ) : null
                                }
                                scrollableTarget="scrollableActivities"
                            >
                                <List
                                    itemLayout="horizontal"
                                    dataSource={activities}
                                    renderItem={(item) => (
                                        <List.Item key={item.id}>
                                            <List.Item.Meta
                                                avatar={
                                                    <Avatar 
                                                        src={item.avatar} 
                                                        icon={<UserOutlined />}
                                                        style={{ backgroundColor: activeGroup?.group_color }}
                                                    />
                                                }
                                                title={
                                                    <span>
                                                        <span style={{ fontWeight: 500 }}>{item.user}</span>
                                                        {" "}{item.action}{" "}
                                                        <span style={{ color: activeGroup?.group_color, fontWeight: 500 }}>
                                                            {item.target}
                                                        </span>
                                                    </span>
                                                }
                                                description={
                                                    <div style={{ display: "flex", alignItems: "center", gap: "4px", color: "#8c8c8c" }}>
                                                        <ClockCircleOutlined />
                                                        <span>{item.time}</span>
                                                    </div>
                                                }
                                            />
                                        </List.Item>
                                    )}
                                />
                                {activities.length === 0 && !loadingActivities && (
                                    <Empty 
                                        description="No recent activities" 
                                        style={{ marginTop: "100px" }}
                                    />
                                )}
                            </InfiniteScroll>
                        </div>
                    </Card>
                </Col>
            </Row>
        </div>
    );
};

// Helper function to adjust color brightness
function adjustColor(color, amount) {
    if (!color) return "#1890ff";

    let usePound = false;

    if (color[0] === "#") {
        color = color.slice(1);
        usePound = true;
    }

    const num = parseInt(color, 16);
    let r = (num >> 16) + amount;

    if (r > 255) r = 255;
    else if (r < 0) r = 0;

    let b = ((num >> 8) & 0x00ff) + amount;

    if (b > 255) b = 255;
    else if (b < 0) b = 0;

    let g = (num & 0x0000ff) + amount;

    if (g > 255) g = 255;
    else if (g < 0) g = 0;

    return (
        (usePound ? "#" : "") +
        (g | (b << 8) | (r << 16)).toString(16).padStart(6, "0")
    );
}

export default Dashboard;