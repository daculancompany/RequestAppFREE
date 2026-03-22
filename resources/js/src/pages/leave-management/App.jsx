import React, { useState, useEffect, useRef, useMemo } from "react";
import { ConfigProvider, theme as antTheme, message } from "antd";
import { motion, AnimatePresence } from "framer-motion";
import dayjs from "dayjs";

// Layout Components
import Header from "./components/Layout/Header";
import Sidebar from "./components/Layout/Sidebar";
import MainContent from "./components/Layout/MainContent";

// Modal Components
import LeaveModal from "./components/Modals/LeaveModal";
import RequestModal from "./components/Modals/RequestModal";
import GroupModal from "./components/Modals/GroupModal";
import GroupDetailsModal from "./components/Modals/GroupDetailsModal";
import ChatDrawer from "./components/Chat/ChatDrawer";
import {
    useCreateGroupMutation,
    useGroups,
} from "@/hooks/queries/group.queries";
import { useCreateRequestMutation } from "@/hooks/queries/request.queries";
import CreateMemberModal from "./components/Modals/CreateMemberModal";

// Initial Data
import { useGlobalStore } from "@/stores/global.store";
import { useRequestStore } from "@/stores/request.store";
// import "@/styles/themes.scss";
import "@/styles/App.scss";


const { defaultAlgorithm, darkAlgorithm } = antTheme;

const App = () => {
    const {
        activeGroup,
        setActiveGroup,
        currentTheme,
        setCurrentTheme,
        activeTab,
        setActiveTab,
        leaveModalVisible,
        setLeaveModalVisible,
        leaveRequests,
        setLeaveRequests,
        groupModalVisible,
        setGroupModalVisible,
        chatDrawerVisible,
        setChatDrawerVisible,
        selectedLeave,
        setSelectedLeave,
        searchQuery,
        setSearchQuery,
        selectedGroup,
        setSelectedGroup,
        calendarView,
        setCalendarView,
        selectedDate,
        setSelectedDate,
        calendarEvents,
        setCalendarEvents,
        calendarFilter,
        setCalendarFilter,
    } = useGlobalStore();

    const { setNewRequest, setSubmitting } = useRequestStore();

    const createRequestMutation = useCreateRequestMutation();
    const createGroupMutation = useCreateGroupMutation();
    const {
        data: apiGroupData = [],
        isLoading: isLoadingGroup,
        error: groupssError,
        refetch: refetchGroups,
    } = useGroups();

    const [form] = useState({}); // Form ref
    const [groupForm] = useState({}); // Group form ref
    const messagesEndRef = useRef(null);

    useEffect(() => {
        const darkTheme = "dark";
        setCurrentTheme(darkTheme);
        localStorage.setItem("theme", darkTheme);
        document.body.className = darkTheme;
        document.documentElement.setAttribute("data-theme", darkTheme);
    }, []); 

    // Update theme when active group changes
    useEffect(() => {
        // Always ensure dark theme is applied
        document.body.className = "dark";
        document.documentElement.setAttribute("data-theme", "dark");

        // Update CSS color variables based on active group
        if (activeGroup?.group_color) {
            const primaryColor = activeGroup.group_color;

            // Set primary color variables
            document.documentElement.style.setProperty(
                "--primary-color",
                primaryColor,
            );

            // Calculate hover color (always lighten for dark theme)
            const hoverColor = lightenColor(primaryColor, 15);

            document.documentElement.style.setProperty(
                "--primary-hover",
                hoverColor,
            );

            // Calculate light color (15% opacity)
            const lightColor = `${primaryColor}26`; // 15% opacity hex value

            document.documentElement.style.setProperty(
                "--primary-light",
                lightColor,
            );

            // Also set the active-group variables for compatibility
            document.documentElement.style.setProperty(
                "--active-group-primary",
                primaryColor,
            );
            document.documentElement.style.setProperty(
                "--active-group-primary-hover",
                hoverColor,
            );
            document.documentElement.style.setProperty(
                "--active-group-primary-light",
                lightColor,
            );

            // Set RGB values for rgba usage
            const rgb = hexToRgb(primaryColor);
            document.documentElement.style.setProperty(
                "--primary-color-rgb",
                rgb,
            );
            document.documentElement.style.setProperty(
                "--active-group-primary-rgb",
                rgb,
            );
        } else {
            // Reset to dark theme defaults if no active group
            document.documentElement.style.setProperty(
                "--primary-color",
                "#60a5fa",
            );
            document.documentElement.style.setProperty(
                "--primary-hover",
                "#93c5fd",
            );
            document.documentElement.style.setProperty(
                "--primary-light",
                "rgba(96, 165, 250, 0.15)",
            );

            document.documentElement.style.setProperty(
                "--active-group-primary",
                "#60a5fa",
            );
            document.documentElement.style.setProperty(
                "--active-group-primary-hover",
                "#93c5fd",
            );
            document.documentElement.style.setProperty(
                "--active-group-primary-light",
                "rgba(96, 165, 250, 0.15)",
            );
            
            // Set default RGB
            document.documentElement.style.setProperty(
                "--primary-color-rgb",
                "96, 165, 250",
            );
            document.documentElement.style.setProperty(
                "--active-group-primary-rgb",
                "96, 165, 250",
            );
        }
    }, [activeGroup]); // Only depend on activeGroup, not currentTheme

    // Helper functions
    const hexToRgb = (hex) => {
        if (!hex) return "96, 165, 250"; // Default blue for dark theme

        hex = hex.replace("#", "");

        if (hex.length === 3) {
            hex = hex
                .split("")
                .map((char) => char + char)
                .join("");
        }

        const r = parseInt(hex.substring(0, 2), 16);
        const g = parseInt(hex.substring(2, 4), 16);
        const b = parseInt(hex.substring(4, 6), 16);

        return `${r}, ${g}, ${b}`;
    };

    const lightenColor = (color, percent) => {
        if (!color.startsWith("#")) return color;

        const num = parseInt(color.slice(1), 16);
        const amt = Math.round(2.55 * percent);

        let R = (num >> 16) + amt;
        let G = ((num >> 8) & 0x00ff) + amt;
        let B = (num & 0x0000ff) + amt;

        R = R < 255 ? (R < 1 ? 0 : R) : 255;
        G = G < 255 ? (G < 1 ? 0 : G) : 255;
        B = B < 255 ? (B < 1 ? 0 : B) : 255;

        return `#${((1 << 24) + (R << 16) + (G << 8) + B).toString(16).slice(1)}`;
    };

    // Initialize calendar events
    useEffect(() => {
        const events = leaveRequests.map((leave) => {
            let groups = apiGroupData?.data;
            return groups;
        });
        setCalendarEvents(events);
    }, [leaveRequests]); //groups

    // Handle request submission
    const handleRequestSubmit = (requestData) => {
        createRequestMutation.mutate(requestData, {
            onSuccess: () => {
                message.success("Request created successfully!");
                setTimeout(() => {
                    setNewRequest(false);
                }, 1000);
            },
            onError: (error) => {
                console.error("Group creation error:", error);

                if (error.response?.data?.message) {
                    message.error(error.response.data.message);
                } else if (error.message) {
                    message.error(error.message);
                } else {
                    message.error("Failed to create request");
                }
            },
            onSettled: () => {
                setTimeout(() => {
                    setSubmitting(false);
                }, 1000);
            },
        });
    };

    const handleGroupClick = (group) => {
        console.log({group})
        setActiveGroup(group);
        message.info(
            `Viewing ${group.group_name} (${group.group_code}) details`,
        );
    };

    const handleApprove = (id) => {
        setLeaveRequests((prev) =>
            prev.map((req) =>
                req.id === id ? { ...req, status: "approved" } : req,
            ),
        );
        message.success(`✅ Leave #${id} approved successfully`);
    };

    const handleReject = (id) => {
        setLeaveRequests((prev) =>
            prev.map((req) =>
                req.id === id ? { ...req, status: "rejected" } : req,
            ),
        );
        message.error(`❌ Leave #${id} rejected`);
    };

    const openChat = (leave) => {
        setSelectedLeave(leave);
        setChatDrawerVisible(true);
    };

    const handleSubmitLeave = (values) => {
        const selectedGroup = groups.find((g) => g.id === values.group);
        const approver = selectedGroup?.approvers[0] || "Admin";

        const newLeave = {
            id: leaveRequests.length + 1,
            employee: "You (Employee)",
            employeeId: "EMP" + (100 + leaveRequests.length),
            avatar: "",
            group: values.group,
            type: values.leaveType,
            dates: values.dates,
            duration:
                dayjs(values.dates[1]).diff(dayjs(values.dates[0]), "day") + 1,
            status: "pending",
            reason: values.reason,
            submitted: dayjs().format("YYYY-MM-DD HH:mm"),
            approver: approver,
            priority: values.priority || "medium",
            conversation: [],
            attachments: [],
            notes: "",
            rating: 0,
        };

        setLeaveRequests([newLeave, ...leaveRequests]);
        setLeaveModalVisible(false);
        form.resetFields?.();
        message.success("🎉 Leave application submitted!");
    };

    // Remove or comment out the theme toggle handler since we don't need it anymore
    // const handleThemeToggle = (checked) => {
    //     const newTheme = checked ? "dark" : "light";
    //     setCurrentTheme(newTheme);
    //     localStorage.setItem("theme", newTheme);
    // };

    const appContext = {
        // State
        leaveRequests,
        currentTheme: "dark", // Always dark
        activeTab,
        leaveModalVisible,
        groupModalVisible,
        chatDrawerVisible,
        selectedLeave,
        searchQuery,
        selectedGroup,
        calendarView,
        selectedDate,
        calendarEvents,
        calendarFilter,

        // Setters
        setLeaveRequests,
        setCurrentTheme,
        setActiveTab,
        setLeaveModalVisible,
        setGroupModalVisible,
        setChatDrawerVisible,
        setSelectedLeave,
        setSearchQuery,
        setSelectedGroup,
        setCalendarView,
        setSelectedDate,
        setCalendarEvents,
        setCalendarFilter,
        handleApprove,
        handleReject,
        openChat,
        handleSubmitLeave,
        // handleThemeToggle, // Removed

        // Refs
        messagesEndRef,
        form,
        groupForm,

        // Active group color
        activeGroupColor: activeGroup?.group_color,
    };

    return (
        <ConfigProvider
            theme={{
                algorithm: darkAlgorithm,
                token: {
                    colorPrimary: activeGroup?.group_color
                        ? activeGroup.group_color
                        : "#60a5fa", // Default dark theme blue
                    colorPrimaryHover: `var(--primary-hover)`,
                    colorPrimaryActive: `var(--primary-hover)`,
                    colorBgContainer: "#1e293b", // Dark bg
                    colorBgLayout: "#0f172a", // Darker bg
                    colorText: "#f1f5f9", // Light text
                    colorTextSecondary: "#cbd5e1", // Secondary light text
                    colorBorder: "#475569", // Dark border
                    borderRadius: 8,
                },
                components: {
                    Button: {
                        colorPrimary: `var(--primary-color)`,
                        colorPrimaryHover: `var(--primary-hover)`,
                        colorPrimaryActive: `var(--primary-hover)`,
                        controlOutline: `rgba(var(--primary-color-rgb, 96, 165, 250), 0.2)`,
                        controlOutlineWidth: 2,
                        borderRadius: 6,
                    },
                    Card: {
                        colorBgContainer: "#1e293b", // Dark bg
                    },
                    Input: {
                        colorBgContainer: "#334155", // Darker input bg
                        hoverBorderColor: `var(--primary-color)`,
                        activeBorderColor: `var(--primary-color)`,
                        activeShadow: `0 0 0 2px rgba(var(--primary-color-rgb, 96, 165, 250), 0.2)`,
                    },
                    Select: {
                        colorBgContainer: "#334155", // Darker select bg
                        colorPrimary: `var(--primary-color)`,
                        colorPrimaryHover: `var(--primary-hover)`,
                    },
                    Modal: {
                        colorBgContainer: "#1e293b", // Dark modal bg
                        colorText: "#f1f5f9", // Light text in modal
                        colorTextSecondary: "#cbd5e1", // Secondary light text
                    },
                    Dropdown: {
                        colorBgContainer: "#1e293b", // Dark dropdown bg
                        colorText: "#f1f5f9", // Light text in dropdown
                        controlItemBgHover: "#334155", // Hover state
                    },
                    Tag: {
                        colorPrimary: `var(--primary-color)`,
                        colorPrimaryBg: `var(--primary-light)`,
                        colorPrimaryBorder: `var(--primary-color)`,
                    },
                    Tabs: {
                        colorPrimary: `var(--primary-color)`,
                        colorBgContainer: "#0f172a", // Dark tabs bg
                        colorText: "#f1f5f9", // Light text
                    },
                    Steps: {
                        colorPrimary: `var(--primary-color)`,
                        colorText: "#f1f5f9",
                        colorTextSecondary: "#cbd5e1",
                    },
                    Menu: {
                        colorBgContainer: "#1e293b", // Dark menu bg
                        colorText: "#f1f5f9", // Light text
                        colorTextSecondary: "#cbd5e1",
                        itemHoverBg: "#334155", // Hover state
                    },
                    Table: {
                        colorBgContainer: "#1e293b", // Dark table bg
                        colorText: "#f1f5f9", // Light text
                        colorTextSecondary: "#cbd5e1",
                        borderColor: "#475569", // Dark border
                    },
                },
            }}
        >
            <div className="app-container dark"> {/* Always add dark class */}
                <Header
                    groups={apiGroupData?.data || []}
                    currentTheme="dark" // Always dark
                    searchQuery={searchQuery}
                    setSearchQuery={setSearchQuery}
                    // handleThemeToggle={handleThemeToggle} // Remove theme toggle prop
                    leaveRequests={leaveRequests}
                    handleGroupClick={handleGroupClick}
                />

                <div className="main-layout">
                    <Sidebar
                        groups={apiGroupData?.data || []}
                        expandedGroups={false}
                        toggleGroup={() => {}}
                        handleGroupClick={handleGroupClick}
                        setGroupModalVisible={setGroupModalVisible}
                        setActiveTab={setActiveTab}
                        leaveRequests={leaveRequests}
                        loading={isLoadingGroup}
                    />

                    <MainContent
                        activeTab={activeTab}
                        setActiveTab={setActiveTab}
                        appContext={appContext}
                        groups={apiGroupData?.data || []}
                    />
                </div>

                <RequestModal onSubmit={handleRequestSubmit} />
                <CreateMemberModal />
                <GroupModal />
            </div>
        </ConfigProvider>
    );
};

export default App;