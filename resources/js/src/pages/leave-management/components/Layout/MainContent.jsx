// components/Layout/MainContent.jsx
import React, { useEffect, useState } from "react";
import { Tabs, Empty } from "antd";
import { useLocation } from "react-router-dom";
import {
    DashboardOutlined,
    BarChartOutlined,
    TeamOutlined,
    UsergroupAddOutlined,
    CalendarOutlined,
    HighlightOutlined,
} from "@ant-design/icons";

// Tab Components
import Dashboard from "../Dashboard/Dashboard";
import AnalyticsDashboard from "../Analytics/AnalyticsDashboard";
import GroupsDashboard from "../Groups/GroupsDashboard";
import TeamsDashboard from "../Teams/TeamsDashboard";
import NotificationList from "../Notifications/NotificationListPage";
import RequestList from "../Dashboard/RequestList";
import MembersTabContent from "../Dashboard/MembersTabContent";
import SignatoriesTabContent from "../Dashboard/SignatoriesTabContent";
import SettingsTabContent from "../Dashboard/SettingsTabContent";
import { useGlobalStore } from "@/stores/global.store";

const MainContent = ({ activeTab, setActiveTab, appContext, groups }) => {
    const { activeGroup } = useGlobalStore();
    const location = useLocation();
    const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

    // Check for query params and redirect to request tab
    useEffect(() => {
        const queryParams = new URLSearchParams(location.search);
        const type = queryParams.get("type");
        const requestId = queryParams.get("id");

        if (type === "mail-notification" && requestId && activeGroup) {
            setActiveTab("request");
            sessionStorage.setItem("highlightedRequestId", requestId);
        }
    }, [location, activeGroup, setActiveTab]);

    // Handle window resize for responsive design
    useEffect(() => {
        const handleResize = () => {
            setIsMobile(window.innerWidth <= 768);
        };

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    // If no group is selected, show empty message
    if (!activeGroup) {
        return (
            <main className="main-content-area">
                <div className="no-group-message">
                    <Empty
                        description="No group selected"
                        image={Empty.PRESENTED_IMAGE_SIMPLE}
                    />
                </div>
            </main>
        );
    }

    // Define tab items with mobile optimization (icons only)
    const tabItems = [
        {
            key: "dashboard",
            label: isMobile ? (
                <DashboardOutlined style={{ fontSize: '22px' }} />
            ) : (
                <span>
                    <DashboardOutlined />
                    Dashboard
                </span>
            ),
            children: <Dashboard appContext={appContext} />,
        },
        {
            key: "request",
            label: isMobile ? (
                <BarChartOutlined style={{ fontSize: '22px' }} />
            ) : (
                <span>
                    <BarChartOutlined />
                    Request
                </span>
            ),
            children: (
                <RequestList
                    highlightedRequestId={sessionStorage.getItem(
                        "highlightedRequestId",
                    )}
                />
            ),
        },
        {
            key: "members",
            label: isMobile ? (
                <TeamOutlined style={{ fontSize: '22px' }} />
            ) : (
                <span>
                    <TeamOutlined />
                    Members
                </span>
            ),
            children: <MembersTabContent type="members" />,
        },
        {
            key: "approvers",
            label: isMobile ? (
                <UsergroupAddOutlined style={{ fontSize: '22px' }} />
            ) : (
                <span>
                    <UsergroupAddOutlined />
                    Approvers
                </span>
            ),
            children: <MembersTabContent type="approvers" />,
        },
        {
            key: "signatories",
            label: isMobile ? (
                <HighlightOutlined style={{ fontSize: '22px' }} />
            ) : (
                <span>
                    <HighlightOutlined />
                    Signatories
                </span>
            ),
            children: <MembersTabContent type="signatories" />,
        },
    ];

    return (
        <main className="main-content-area">
            <Tabs
                activeKey={activeTab}
                onChange={setActiveTab}
                className={`dashboard-tabs ${isMobile ? 'mobile-tabs' : ''}`}
                items={tabItems}
                tabPosition="top"
                size={isMobile ? "small" : "middle"}
                centered={isMobile}
            />
            
           
        </main>
    );
};

export default MainContent;