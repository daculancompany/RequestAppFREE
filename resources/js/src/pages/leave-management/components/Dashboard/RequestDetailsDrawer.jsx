import React, { memo, useState, useCallback } from "react";
import {
    Avatar,
    Tag,
    Button,
    Space,
    Drawer,
    Typography,
    Divider,
    Row,
    Col,
    Card,
    Timeline,
    List,
    Tooltip,
    message,
} from "antd";
import { motion } from "framer-motion";
import {
    UserOutlined,
    TeamOutlined,
    HistoryOutlined,
    FileTextOutlined,
    CalendarOutlined,
    EnvironmentOutlined,
    PaperClipOutlined,
    FilePdfOutlined,
    FileExcelOutlined,
    FileWordOutlined,
    FileImageOutlined,
    EyeOutlined,
    DownloadOutlined,
    CheckOutlined,
    CloseOutlined,
    PrinterOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import advancedFormat from "dayjs/plugin/advancedFormat";
import isBetween from "dayjs/plugin/isBetween";
import weekday from "dayjs/plugin/weekday";
import { useUpdateRequestStatusMutation } from "@/hooks/queries/request.queries";
import { useGlobalStore } from "@/stores/global.store";
import ActionModal from "./ActionModal";
import useMobile from "@/hooks/useMobile";

dayjs.extend(relativeTime);
dayjs.extend(advancedFormat);
dayjs.extend(isBetween);
dayjs.extend(weekday);

const { Text, Title, Paragraph } = Typography;

const STATUS_CONFIG = {
    approved: {
        color: "#52c41a",
        bg: "#f6ffed",
        icon: <CheckOutlined style={{ color: "#52c41a" }} />,
        text: "Approved",
    },
    rejected: {
        color: "#ff4d4f",
        bg: "#fff1f0",
        icon: <CloseOutlined style={{ color: "#ff4d4f" }} />,
        text: "Rejected",
    },
    cancelled: {
        color: "#8c8c8c",
        bg: "#f5f5f5",
        icon: <CloseOutlined style={{ color: "#8c8c8c" }} />,
        text: "Cancelled",
    },
    pending: {
        color: "#faad14",
        bg: "#fffbe6",
        icon: <CalendarOutlined style={{ color: "#faad14" }} />,
        text: "Pending",
    },
};

const REQUEST_TYPE_CONFIG = {
    leave: {
        label: "Leave",
        icon: <CalendarOutlined />,
        color: "#1890ff",
        bg: "#e6f7ff",
        gradient: "linear-gradient(135deg, #1890ff 0%, #69c0ff 100%)",
    },
    travel: {
        label: "Travel",
        icon: <EnvironmentOutlined />,
        color: "#722ed1",
        bg: "#f9f0ff",
        gradient: "linear-gradient(135deg, #722ed1 0%, #b37feb 100%)",
    },
};

const TRANSPORTATION_CONFIG = {
    company_vehicle: {
        label: "Company Vehicle",
        icon: <EnvironmentOutlined />,
        color: "#13c2c2",
    },
    personal_vehicle: {
        label: "Personal Vehicle",
        icon: <EnvironmentOutlined />,
        color: "#fa8c16",
    },
    public_transport: {
        label: "Public Transport",
        icon: <EnvironmentOutlined />,
        color: "#52c41a",
    },
    airline: {
        label: "Airline",
        icon: <EnvironmentOutlined />,
        color: "#1890ff",
    },
    other: { label: "Other", icon: <EnvironmentOutlined />, color: "#8c8c8c" },
};

const RequestDetailsDrawer = memo(
    ({
        request,
        visible,
        onClose,
        onQuickAction,
        isApprover,
        comments = [],
    }) => {
        if (!request) return null;
        const isMobile = useMobile();

        const { activeGroup } = useGlobalStore();
        const updateRequestStatusMutation = useUpdateRequestStatusMutation();

        // State for action modal
        const [approveModalVisible, setApproveModalVisible] = useState(false);
        const [rejectModalVisible, setRejectModalVisible] = useState(false);
        const [commentText, setCommentText] = useState("");

        const statusConfig =
            STATUS_CONFIG[request.status] || STATUS_CONFIG.pending;
        const typeConfig =
            REQUEST_TYPE_CONFIG[request.type] || REQUEST_TYPE_CONFIG.leave;
        const timeAgo = dayjs(request.created_at).fromNow();

        // Get comments for this specific request
        const requestComments = comments.filter(
            (c) => c.request_id === request.id,
        );

        const handleApproveClick = useCallback(() => {
            setApproveModalVisible(true);
        }, []);

        const handleRejectClick = useCallback(() => {
            setRejectModalVisible(true);
        }, []);

        const handleActionSubmit = useCallback(
            (action) => {
                const formData = new FormData();
                formData.append("group_id", activeGroup?.id || "");
                formData.append("comment", commentText);
                formData.append("action", action);

                updateRequestStatusMutation.mutate(
                    {
                        formData: formData,
                        requestId: request?.id,
                    },
                    {
                        onSuccess: (msg) => {
                            message.success({
                                content: `Request ${action === "approve" ? "approved" : "rejected"} successfully!`,
                            });
                            setApproveModalVisible(false);
                            setRejectModalVisible(false);
                            setCommentText("");
                            onClose(); // Close drawer after action
                        },
                        onError: (error) => {
                            console.log(error);
                            if (error.response?.data?.message) {
                                message.error(error.response.data.message);
                            } else {
                                message.error(
                                    "Failed to update request status",
                                );
                            }
                        },
                    },
                );
            },
            [activeGroup?.id, commentText, request?.id, onClose],
        );

        const handleActionCancel = useCallback(() => {
            setApproveModalVisible(false);
            setRejectModalVisible(false);
            setCommentText("");
        }, []);

        const handlePrint = useCallback(() => {
            // Check if mobile device
            const isMobile = window.innerWidth <= 768;
            const isSmallMobile = window.innerWidth <= 480;

            // Create modal container
            const modal = document.createElement("div");
            modal.id = "print-modal";
            modal.style.cssText = `
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(0, 0, 0, ${isMobile ? 0.9 : 0.7});
                display: flex;
                justify-content: center;
                align-items: ${isMobile ? "flex-end" : "center"};
                z-index: 9999;
                padding: 0;
                transition: all 0.3s ease;
            `;

            // Create modal content - Responsive with slide-up animation for mobile
            const modalContent = document.createElement("div");
            modalContent.style.cssText = `
                background: white;
                width: ${isMobile ? "100%" : "95%"};
                height: ${isMobile ? "92%" : "95%"};
                border-radius: ${isMobile ? "20px 20px 0 0" : "12px"};
                box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);
                display: flex;
                flex-direction: column;
                overflow: hidden;
                max-width: 1400px;
                animation: ${isMobile ? "slideUp 0.3s ease" : "fadeIn 0.3s ease"};
                
                @keyframes slideUp {
                    from { transform: translateY(100%); }
                    to { transform: translateY(0); }
                }
                
                @keyframes fadeIn {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }
            `;

            // Create header - Mobile optimized
            const header = document.createElement("div");
            header.style.cssText = `
                padding: ${isMobile ? "16px 20px" : "12px 24px"};
                background: linear-gradient(135deg, #52c41a, #73d13d);
                color: white;
                display: flex;
                justify-content: space-between;
                align-items: center;
                border-bottom: 1px solid rgba(255,255,255,0.1);
                
                /* Mobile drag handle */
                ${
                    isMobile
                        ? `
                    &::before {
                        content: '';
                        position: absolute;
                        top: 8px;
                        left: 50%;
                        transform: translateX(-50%);
                        width: 40px;
                        height: 4px;
                        background: rgba(255,255,255,0.5);
                        border-radius: 4px;
                    }
                `
                        : ""
                }
            `;

            // Mobile drag handle
            const dragHandle = isMobile
                ? `
                <div style="
                    position: absolute;
                    top: 8px;
                    left: 50%;
                    transform: translateX(-50%);
                    width: 40px;
                    height: 4px;
                    background: rgba(255,255,255,0.5);
                    border-radius: 4px;
                "></div>
            `
                : "";

            header.innerHTML = `
                ${dragHandle}
                <div style="
                    display: flex; 
                    align-items: center; 
                    gap: ${isMobile ? "8px" : "12px"}; 
                    width: 100%;
                    margin-top: ${isMobile ? "12px" : "0"};
                ">
                    <span style="
                        font-size: ${isMobile ? "18px" : "20px"}; 
                        font-weight: 600; 
                        white-space: nowrap;
                    ">
                        Print Preview
                    </span>
                    <span style="
                        background: rgba(255,255,255,0.2); 
                        padding: ${isMobile ? "4px 10px" : "4px 12px"}; 
                        border-radius: 20px; 
                        font-size: ${isMobile ? "12px" : "14px"};
                        overflow: hidden;
                        text-overflow: ellipsis;
                        white-space: nowrap;
                        max-width: ${isMobile ? "120px" : "200px"};
                    ">
                        ${request.request_id}
                    </span>
                </div>
                <div style="
                    display: flex; 
                    gap: ${isMobile ? "8px" : "12px"};
                    margin-top: ${isMobile ? "12px" : "0"};
                ">
                    <button id="print-button" style="
                        background: white;
                        color: #52c41a;
                        border: none;
                        padding: ${isMobile ? "8px 16px" : "8px 20px"};
                        border-radius: ${isMobile ? "8px" : "6px"};
                        font-weight: 600;
                        font-size: ${isMobile ? "13px" : "14px"};
                        display: flex;
                        align-items: center;
                        gap: ${isMobile ? "6px" : "8px"};
                        cursor: pointer;
                        transition: all 0.3s;
                        box-shadow: 0 2px 4px rgba(0,0,0,0.1);
                    ">
                        <svg width="${isMobile ? "14" : "16"}" height="${isMobile ? "14" : "16"}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/>
                            <path d="M6 9V3h12v6"/>
                            <rect x="6" y="15" width="12" height="6" rx="2"/>
                        </svg>
                        ${!isSmallMobile ? "<span>Print</span>" : ""}
                    </button>
                    <button id="close-modal" style="
                        background: rgba(255,255,255,0.2);
                        color: white;
                        border: none;
                        padding: ${isMobile ? "8px 16px" : "8px 16px"};
                        border-radius: ${isMobile ? "8px" : "6px"};
                        font-size: ${isMobile ? "13px" : "14px"};
                        display: flex;
                        align-items: center;
                        gap: ${isMobile ? "6px" : "8px"};
                        cursor: pointer;
                        transition: all 0.3s;
                        backdrop-filter: blur(4px);
                    ">
                        <svg width="${isMobile ? "14" : "16"}" height="${isMobile ? "14" : "16"}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <line x1="18" y1="6" x2="6" y2="18"/>
                            <line x1="6" y1="6" x2="18" y2="18"/>
                        </svg>
                        ${!isSmallMobile ? "<span>Close</span>" : ""}
                    </button>
                </div>
            `;

            // Create iframe container - Mobile optimized
            const iframeContainer = document.createElement("div");
            iframeContainer.style.cssText = `
                flex: 1;
                padding: ${isMobile ? "12px" : "20px"};
                background: #f0f2f5;
                overflow: auto;
                position: relative;
                -webkit-overflow-scrolling: touch;
            `;

            // Create iframe - Mobile optimized
            const iframe = document.createElement("iframe");
            iframe.src = `/requests/${request.id}/print`;
            iframe.style.cssText = `
                width: 100%;
                height: 100%;
                border: none;
                border-radius: ${isMobile ? "8px" : "8px"};
                background: white;
                box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
            `;

            // Create loading indicator - Mobile optimized
            const loading = document.createElement("div");
            loading.id = "iframe-loading";
            loading.style.cssText = `
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        text-align: center;
        color: #666;
        width: 100%;
        padding: ${isMobile ? "16px" : "20px"};
        box-sizing: border-box;
    `;
            loading.innerHTML = `
        <div style="margin-bottom: ${isMobile ? "12px" : "16px"};">
            <svg width="${isMobile ? "40" : "48"}" height="${isMobile ? "40" : "48"}" viewBox="0 0 24 24" fill="none" stroke="#52c41a" stroke-width="2">
                <circle cx="12" cy="12" r="10" stroke-dasharray="32" stroke-dashoffset="32">
                    <animate attributeName="stroke-dashoffset" values="32;0" dur="1s" repeatCount="indefinite"/>
                </circle>
            </svg>
        </div>
        <div style="font-size: ${isMobile ? "15px" : "16px"}; font-weight: 500; margin-bottom: 8px;">
            Loading print preview...
        </div>
        <div style="font-size: ${isMobile ? "13px" : "14px"}; color: #999;">
            This may take a few moments
        </div>
    `;

            // Assemble modal
            iframeContainer.appendChild(iframe);
            iframeContainer.appendChild(loading);
            modalContent.appendChild(header);
            modalContent.appendChild(iframeContainer);
            modal.appendChild(modalContent);
            document.body.appendChild(modal);

            // Remove loading when iframe loads
            iframe.onload = () => {
                loading.style.display = "none";
            };

            // Handle iframe error
            iframe.onerror = () => {
                loading.innerHTML = `
            <div style="color: #ff4d4f;">
                <svg width="${isMobile ? "40" : "48"}" height="${isMobile ? "40" : "48"}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <circle cx="12" cy="12" r="10"/>
                    <line x1="12" y1="8" x2="12" y2="12"/>
                    <circle cx="12" cy="16" r="1"/>
                </svg>
                <div style="font-size: ${isMobile ? "15px" : "16px"}; font-weight: 500; margin-top: 16px;">
                    Failed to load print preview
                </div>
                <div style="font-size: ${isMobile ? "13px" : "14px"}; color: #999; margin-top: 8px;">
                    Please try again later
                </div>
            </div>
        `;
            };

            // Print button functionality
            const printButton = document.getElementById("print-button");
            if (printButton) {
                printButton.addEventListener("click", () => {
                    try {
                        iframe.contentWindow.print();
                        message.success({
                            content: "Sending to printer...",
                            duration: 2,
                        });
                    } catch (error) {
                        message.error("Failed to print. Please try again.");
                    }
                });
            }

            // Close modal functionality
            const closeButton = document.getElementById("close-modal");
            if (closeButton) {
                closeButton.addEventListener("click", () => {
                    if (document.body.contains(modal)) {
                        document.body.removeChild(modal);
                    }
                });
            }

            // Click outside to close (desktop only)
            if (!isMobile) {
                modal.addEventListener("click", (e) => {
                    if (e.target === modal) {
                        if (document.body.contains(modal)) {
                            document.body.removeChild(modal);
                        }
                    }
                });
            }

            // Escape key to close
            const escHandler = (e) => {
                if (
                    e.key === "Escape" &&
                    document.getElementById("print-modal")
                ) {
                    if (document.body.contains(modal)) {
                        document.body.removeChild(modal);
                    }
                    document.removeEventListener("keydown", escHandler);
                }
            };
            document.addEventListener("keydown", escHandler);

            // Mobile touch gestures for swipe down to close
            if (isMobile) {
                let touchStartY = 0;
                let touchMoveY = 0;

                modalContent.addEventListener(
                    "touchstart",
                    (e) => {
                        touchStartY = e.touches[0].clientY;
                    },
                    { passive: true },
                );

                modalContent.addEventListener(
                    "touchmove",
                    (e) => {
                        touchMoveY = e.touches[0].clientY;
                        const diff = touchMoveY - touchStartY;

                        // Pull to close effect
                        if (diff > 0) {
                            modalContent.style.transform = `translateY(${diff}px)`;
                            modalContent.style.transition = "none";
                        }
                    },
                    { passive: true },
                );

                modalContent.addEventListener(
                    "touchend",
                    (e) => {
                        const diff = touchMoveY - touchStartY;

                        // If pulled down more than 100px, close the modal
                        if (diff > 100) {
                            if (document.body.contains(modal)) {
                                document.body.removeChild(modal);
                            }
                        } else {
                            // Reset position
                            modalContent.style.transform = "";
                            modalContent.style.transition =
                                "transform 0.3s ease";
                        }

                        touchStartY = 0;
                        touchMoveY = 0;
                    },
                    { passive: true },
                );
            }

            // Prevent body scroll when modal is open
            document.body.style.overflow = "hidden";

            // Restore body scroll when modal is removed
            const observer = new MutationObserver((mutations) => {
                mutations.forEach((mutation) => {
                    mutation.removedNodes.forEach((node) => {
                        if (node.id === "print-modal") {
                            document.body.style.overflow = "";
                            observer.disconnect();
                        }
                    });
                });
            });

            observer.observe(document.body, {
                childList: true,
                subtree: false,
            });
        }, [request]);

        const renderLeaveDetails = () => (
            <div className="leave-details">
                <Row gutter={[16, 16]}>
                    <Col span={24}>
                        <Card
                            size="small"
                            style={{
                                background: typeConfig.bg,
                                borderLeft: `4px solid ${typeConfig.color}`,
                            }}
                        >
                            <div
                                style={{
                                    display: "flex",
                                    justifyContent: "space-between",
                                    alignItems: "center",
                                }}
                            >
                                <div>
                                    <Text
                                        strong
                                        style={{
                                            color: typeConfig.color,
                                            display: "block",
                                            fontSize: 16,
                                        }}
                                    >
                                        {request.reason || "Leave of Office"}
                                    </Text>
                                    <Text
                                        style={{
                                            color: typeConfig.color + "90",
                                            fontSize: 13,
                                        }}
                                    >
                                        {request.total_days || 1} day
                                        {request.total_days !== 1 ? "s" : ""}
                                    </Text>
                                </div>
                                <CalendarOutlined
                                    style={{
                                        fontSize: 32,
                                        color: typeConfig.color,
                                        opacity: 0.8,
                                    }}
                                />
                            </div>
                        </Card>
                    </Col>

                    <Col span={12}>
                        <Card
                            size="small"
                            title="Date"
                            style={{ height: "100%" }}
                        >
                            <div style={{ padding: 8 }}>
                                <Text
                                    style={{
                                        fontSize: 15,
                                        fontWeight: 500,
                                        display: "block",
                                    }}
                                >
                                    {dayjs(request.date_of_request).format(
                                        "dddd, MMMM DD, YYYY",
                                    )}
                                </Text>
                                <Text type="secondary" style={{ fontSize: 12 }}>
                                    {dayjs(request.date_of_request).fromNow()}
                                </Text>
                            </div>
                        </Card>
                    </Col>

                    <Col span={12}>
                        <Card
                            size="small"
                            title="Time"
                            style={{ height: "100%" }}
                        >
                            <div style={{ padding: 8 }}>
                                <Text
                                    style={{
                                        fontSize: 15,
                                        fontWeight: 500,
                                        display: "block",
                                    }}
                                >
                                    {request.time_out
                                        ? dayjs(
                                              request.time_out,
                                              "HH:mm:ss",
                                          ).format("hh:mm A")
                                        : "Full day"}
                                    {" → "}
                                    {request.expected_time_in
                                        ? dayjs(
                                              request.expected_time_in,
                                              "HH:mm:ss",
                                          ).format("hh:mm A")
                                        : "Full day"}
                                </Text>
                                <Text type="secondary" style={{ fontSize: 12 }}>
                                    {request.time_out &&
                                    request.expected_time_in
                                        ? `${dayjs(request.expected_time_in, "HH:mm:ss").diff(dayjs(request.time_out, "HH:mm:ss"), "hour")} hours`
                                        : "Full day leave"}
                                </Text>
                            </div>
                        </Card>
                    </Col>

                    <Col span={24}>
                        <Card
                            size="small"
                            title="Reason"
                            style={{
                                borderLeft: `3px solid ${typeConfig.color}`,
                            }}
                        >
                            <Paragraph
                                style={{
                                    margin: 0,
                                    fontSize: 14,
                                    lineHeight: 1.6,
                                    color: "var(--text-primary)",
                                }}
                            >
                                {request.reason || "No reason provided"}
                            </Paragraph>
                        </Card>
                    </Col>
                </Row>
            </div>
        );

        const renderTravelDetails = () => (
            <div className="travel-details">
                <Row gutter={[16, 16]}>
                    <Col span={24}>
                        <Card
                            size="small"
                            style={{
                                background: typeConfig.bg,
                                borderLeft: `4px solid ${typeConfig.color}`,
                            }}
                        >
                            <div
                                style={{
                                    display: "flex",
                                    justifyContent: "space-between",
                                    alignItems: "center",
                                }}
                            >
                                <div>
                                    <Text
                                        strong
                                        style={{
                                            color: typeConfig.color,
                                            display: "block",
                                            fontSize: 16,
                                        }}
                                    >
                                        {request.place_of_travel ||
                                            "Business Travel"}
                                    </Text>
                                    <Text
                                        style={{
                                            color: typeConfig.color + "90",
                                            fontSize: 13,
                                        }}
                                    >
                                        {request.total_days || 1} day
                                        {request.total_days !== 1 ? "s" : ""}
                                    </Text>
                                </div>
                                <EnvironmentOutlined
                                    style={{
                                        fontSize: 32,
                                        color: typeConfig.color,
                                        opacity: 0.8,
                                    }}
                                />
                            </div>
                        </Card>
                    </Col>

                    <Col span={12}>
                        <Card
                            size="small"
                            title="Destination"
                            style={{ height: "100%" }}
                        >
                            <div style={{ padding: 8 }}>
                                <Text
                                    style={{
                                        fontSize: 15,
                                        fontWeight: 500,
                                        display: "block",
                                    }}
                                >
                                    {request.place_of_travel || "Not specified"}
                                </Text>
                                <Text type="secondary" style={{ fontSize: 12 }}>
                                    Business Travel
                                </Text>
                            </div>
                        </Card>
                    </Col>

                    <Col span={12}>
                        <Card
                            size="small"
                            title="Duration"
                            style={{ height: "100%" }}
                        >
                            <div style={{ padding: 8 }}>
                                <Text
                                    style={{
                                        fontSize: 15,
                                        fontWeight: 500,
                                        display: "block",
                                    }}
                                >
                                    {request.total_days || 1} day
                                    {request.total_days !== 1 ? "s" : ""}
                                </Text>
                                <Text type="secondary" style={{ fontSize: 12 }}>
                                    {dayjs(request.date_of_request).format(
                                        "MMM DD",
                                    )}
                                    {request.total_days > 1
                                        ? ` - ${dayjs(request.date_of_request)
                                              .add(
                                                  request.total_days - 1,
                                                  "day",
                                              )
                                              .format("MMM DD")}`
                                        : ""}
                                </Text>
                            </div>
                        </Card>
                    </Col>

                    <Col span={24}>
                        <Card
                            size="small"
                            title="Purpose"
                            style={{
                                borderLeft: `3px solid ${typeConfig.color}`,
                            }}
                        >
                            <Paragraph
                                style={{
                                    margin: 0,
                                    fontSize: 14,
                                    lineHeight: 1.6,
                                    color: "var(--text-primary)",
                                }}
                            >
                                {request.purpose || "No purpose provided"}
                            </Paragraph>
                        </Card>
                    </Col>

                    {request.travel_days && request.travel_days.length > 0 && (
                        <Col span={24}>
                            <Card
                                size="small"
                                title={`Travel Days (${request.travel_days.length})`}
                            >
                                <List
                                    size="small"
                                    dataSource={request.travel_days}
                                    renderItem={(day, idx) => (
                                        <List.Item>
                                            <div
                                                style={{
                                                    width: "100%",
                                                    padding: "8px 0",
                                                }}
                                            >
                                                <div
                                                    style={{
                                                        display: "flex",
                                                        justifyContent:
                                                            "space-between",
                                                        alignItems: "center",
                                                        marginBottom: 4,
                                                    }}
                                                >
                                                    <Text
                                                        strong
                                                        style={{ fontSize: 13 }}
                                                    >
                                                        Day {idx + 1}:{" "}
                                                        {day.date_from ===
                                                        day.date_to
                                                            ? dayjs(
                                                                  day.date_from,
                                                              ).format(
                                                                  "MMM DD, YYYY",
                                                              )
                                                            : `${dayjs(day.date_from).format("MMM DD")} - ${dayjs(day.date_to).format("MMM DD, YYYY")}`}
                                                    </Text>
                                                    <Tag
                                                        color={
                                                            TRANSPORTATION_CONFIG[
                                                                day
                                                                    .transportation
                                                            ]?.color ||
                                                            "default"
                                                        }
                                                        size="small"
                                                    >
                                                        {
                                                            TRANSPORTATION_CONFIG[
                                                                day
                                                                    .transportation
                                                            ]?.label
                                                        }
                                                    </Tag>
                                                </div>
                                                <div
                                                    style={{
                                                        display: "flex",
                                                        justifyContent:
                                                            "space-between",
                                                        alignItems: "center",
                                                    }}
                                                >
                                                    <Text
                                                        type="secondary"
                                                        style={{ fontSize: 12 }}
                                                    >
                                                        {day.notes}
                                                    </Text>
                                                    <Text
                                                        strong
                                                        style={{
                                                            fontSize: 12,
                                                            color: "#52c41a",
                                                        }}
                                                    >
                                                        ₱
                                                        {(
                                                            day.per_diem || 0
                                                        ).toFixed(2)}{" "}
                                                        per diem
                                                    </Text>
                                                </div>
                                            </div>
                                        </List.Item>
                                    )}
                                />
                            </Card>
                        </Col>
                    )}
                </Row>
            </div>
        );

        const renderAttachments = () => (
            <div className="attachments-section" style={{ marginTop: 24 }}>
                <Divider />
                <Title level={5} style={{ marginBottom: 12 }}>
                    <PaperClipOutlined /> Attachments (
                    {request.attachments.length})
                </Title>
                <List
                    size="small"
                    dataSource={request.attachments}
                    renderItem={(file) => (
                        <List.Item>
                            <motion.div
                                style={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: 12,
                                    padding: 12,
                                    background: "var(--bg-tertiary)",
                                    borderRadius: 8,
                                    width: "100%",
                                    cursor: "pointer",
                                }}
                                whileHover={{
                                    backgroundColor: "var(--bg-secondary)",
                                }}
                                onClick={() =>
                                    message.info(`Opening ${file.name}`)
                                }
                            >
                                {file.type === "pdf" && (
                                    <FilePdfOutlined
                                        style={{
                                            color: "#ff4d4f",
                                            fontSize: 24,
                                        }}
                                    />
                                )}
                                {file.type === "excel" && (
                                    <FileExcelOutlined
                                        style={{
                                            color: "#52c41a",
                                            fontSize: 24,
                                        }}
                                    />
                                )}
                                {file.type === "powerpoint" && (
                                    <FileWordOutlined
                                        style={{
                                            color: "#1890ff",
                                            fontSize: 24,
                                        }}
                                    />
                                )}
                                {file.type === "image" && (
                                    <FileImageOutlined
                                        style={{
                                            color: "#722ed1",
                                            fontSize: 24,
                                        }}
                                    />
                                )}
                                <div style={{ flex: 1, minWidth: 0 }}>
                                    <Text
                                        strong
                                        style={{
                                            display: "block",
                                            fontSize: 13,
                                            color: "var(--text-primary)",
                                        }}
                                    >
                                        {file.name}
                                    </Text>
                                    <Space size={8} style={{ marginTop: 2 }}>
                                        <Text
                                            type="secondary"
                                            style={{ fontSize: 11 }}
                                        >
                                            {file.size}
                                        </Text>
                                        <Text
                                            type="secondary"
                                            style={{ fontSize: 11 }}
                                        >
                                            •
                                        </Text>
                                        <Text
                                            type="secondary"
                                            style={{ fontSize: 11 }}
                                        >
                                            {file.type?.toUpperCase()}
                                        </Text>
                                        <Text
                                            type="secondary"
                                            style={{ fontSize: 11 }}
                                        >
                                            •
                                        </Text>
                                        <Text
                                            type="secondary"
                                            style={{ fontSize: 11 }}
                                        >
                                            {dayjs(file.uploaded_at).format(
                                                "MMM DD, HH:mm",
                                            )}
                                        </Text>
                                    </Space>
                                </div>
                                <Space>
                                    <Tooltip title="Preview">
                                        <Button
                                            type="text"
                                            size="small"
                                            icon={<EyeOutlined />}
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                message.info(
                                                    `Previewing ${file.name}`,
                                                );
                                            }}
                                        />
                                    </Tooltip>
                                    <Tooltip title="Download">
                                        <Button
                                            type="text"
                                            size="small"
                                            icon={<DownloadOutlined />}
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                message.info(
                                                    `Downloading ${file.name}`,
                                                );
                                            }}
                                        />
                                    </Tooltip>
                                </Space>
                            </motion.div>
                        </List.Item>
                    )}
                />
            </div>
        );

        return (
            <>
                <Drawer
                    title={
                        <div className="detail-drawer-header">
                            <div className="request-title">
                                {!isMobile && (
                                    <div
                                        className="type-icon-large"
                                        style={{
                                            background: typeConfig.gradient,
                                        }}
                                    >
                                        {typeConfig.icon}
                                    </div>
                                )}
                                <div>
                                    <Title
                                        level={4}
                                        style={{
                                            margin: 0,
                                            color: "var(--text-primary)",
                                        }}
                                    >
                                        {request.request_id}
                                    </Title>
                                    <div
                                        style={{
                                            display: "flex",
                                            alignItems: "center",
                                            gap: 8,
                                        }}
                                    >
                                        <Text type="secondary">
                                            {typeConfig.label} Request •
                                            Submitted {timeAgo}
                                        </Text>
                                        {/* {request.status === "approved" && (
                                            <Button
                                                type="text"
                                                icon={<PrinterOutlined />}
                                                onClick={handlePrint}
                                                size="small"
                                                style={{ color: "#52c41a" }}
                                            >
                                                Print
                                            </Button>
                                        )} */}
                                    </div>
                                </div>
                            </div>
                            {!isMobile && (
                                <Space className="status-content">
                                    <Tag
                                        icon={statusConfig.icon}
                                        color={statusConfig.color}
                                    >
                                        {statusConfig.text}
                                    </Tag>
                                </Space>
                            )}
                        </div>
                    }
                    placement="right"
                    width={700}
                    onClose={onClose}
                    open={visible}
                    footer={
                        isApprover && request.status === "pending" ? (
                            <div className="drawer-footer-actions">
                                <Space
                                    style={{
                                        width: "100%",
                                        justifyContent: "center",
                                    }}
                                >
                                    <Button
                                        type="primary"
                                        icon={<CheckOutlined />}
                                        onClick={handleApproveClick}
                                        size="large"
                                        style={{
                                            minWidth: 140,
                                            background:
                                                "linear-gradient(135deg, #52c41a, #73d13d)",
                                            border: "none",
                                        }}
                                    >
                                        Approve Request
                                    </Button>
                                    <Button
                                        danger
                                        icon={<CloseOutlined />}
                                        onClick={handleRejectClick}
                                        size="large"
                                        style={{
                                            minWidth: 140,
                                            background:
                                                "linear-gradient(135deg, #ff4d4f, #ff7875)",
                                            border: "none",
                                        }}
                                    >
                                        Reject Request
                                    </Button>
                                </Space>
                            </div>
                        ) : request.status === "approved" ? (
                            <div className="drawer-footer-actions">
                                <Space
                                    style={{
                                        width: "100%",
                                        justifyContent: "center",
                                    }}
                                >
                                    <Button
                                        icon={<PrinterOutlined />}
                                        onClick={handlePrint}
                                        size="large"
                                        style={{
                                            minWidth: 140,
                                            background:
                                                "linear-gradient(135deg, #52c41a, #73d13d)",
                                            border: "none",
                                            color: "#fff",
                                        }}
                                    >
                                        Print Request
                                    </Button>
                                    <Button onClick={onClose} size="large">
                                        Close
                                    </Button>
                                </Space>
                            </div>
                        ) : null
                    }
                >
                    {/* Header Info */}
                    <div className="detail-header">
                        {isMobile && (
                            <Space>
                                <div
                                    className="type-icon-large"
                                    style={{ background: typeConfig.gradient }}
                                >
                                    {typeConfig.icon}
                                </div>

                                <Tag
                                    icon={statusConfig.icon}
                                    color={statusConfig.color}
                                >
                                    {statusConfig.text}
                                </Tag>
                            </Space>
                        )}

                        <div className="requester-info">
                            <Avatar
                                size={64}
                                src={request.user?.avatar}
                                icon={<UserOutlined />}
                                style={{
                                    border: `3px solid ${typeConfig.color}`,
                                }}
                            >
                                {request.user?.name?.charAt(0) || "U"}
                            </Avatar>
                            <div className="requester-details">
                                <Title level={5} style={{ margin: 0 }}>
                                    {request.user?.name || "Unknown User"}
                                </Title>
                                <Text type="secondary">
                                    {request.user?.email}
                                </Text>
                                <div className="requester-meta">
                                    <Space size={8}>
                                        <Tag
                                            color="blue"
                                            icon={<UserOutlined />}
                                        >
                                            {request.user?.position}
                                        </Tag>
                                        <Tag
                                            color="purple"
                                            icon={<TeamOutlined />}
                                        >
                                            {request.user?.department ||
                                                "No department"}
                                        </Tag>
                                        <Tag color="cyan">
                                            {request.user?.employee_id}
                                        </Tag>
                                    </Space>
                                </div>
                            </div>
                        </div>

                        <Divider />
                    </div>

                    {/* Timeline Info */}
                    <div className="timeline-info" style={{ marginBottom: 24 }}>
                        <Title level={5} style={{ marginBottom: 16 }}>
                            <HistoryOutlined /> Timeline
                        </Title>
                        <Timeline
                            items={[
                                {
                                    color: "blue",
                                    children: (
                                        <>
                                            <Text strong>Request Created</Text>
                                            <div>
                                                <Text
                                                    type="secondary"
                                                    style={{ fontSize: 12 }}
                                                >
                                                    {dayjs(
                                                        request.created_at,
                                                    ).format(
                                                        "MMM DD, YYYY HH:mm",
                                                    )}
                                                </Text>
                                            </div>
                                        </>
                                    ),
                                },
                                {
                                    color: "orange",
                                    children: (
                                        <>
                                            <Text strong>
                                                Submitted for Approval
                                            </Text>
                                            <div>
                                                <Text
                                                    type="secondary"
                                                    style={{ fontSize: 12 }}
                                                >
                                                    {dayjs(
                                                        request.submitted_at,
                                                    ).format(
                                                        "MMM DD, YYYY HH:mm",
                                                    )}
                                                </Text>
                                            </div>
                                        </>
                                    ),
                                },
                                request.approved_at && {
                                    color: "green",
                                    children: (
                                        <>
                                            <Text strong>Approved</Text>
                                            <div>
                                                <Text
                                                    type="secondary"
                                                    style={{ fontSize: 12 }}
                                                >
                                                    {dayjs(
                                                        request.approved_at,
                                                    ).format(
                                                        "MMM DD, YYYY HH:mm",
                                                    )}
                                                    {" • by "}
                                                    {request.approver?.name}
                                                </Text>
                                            </div>
                                        </>
                                    ),
                                },
                                request.rejected_at && {
                                    color: "red",
                                    children: (
                                        <>
                                            <Text strong>Rejected</Text>
                                            <div>
                                                <Text
                                                    type="secondary"
                                                    style={{ fontSize: 12 }}
                                                >
                                                    {dayjs(
                                                        request.rejected_at,
                                                    ).format(
                                                        "MMM DD, YYYY HH:mm",
                                                    )}
                                                    {" • by "}
                                                    {request.approver?.name}
                                                </Text>
                                            </div>
                                        </>
                                    ),
                                },
                            ].filter(Boolean)}
                        />
                    </div>

                    {/* Request Type Specific Details */}
                    <div className="request-details-section">
                        <Title level={5} style={{ marginBottom: 16 }}>
                            <FileTextOutlined /> Request Details
                        </Title>

                        {request.type === "leave"
                            ? renderLeaveDetails()
                            : renderTravelDetails()}

                        {/* Remarks if exists */}
                        {request.remarks && (
                            <div
                                className="detail-field"
                                style={{ marginTop: 16 }}
                            >
                                <Card
                                    size="small"
                                    title="Additional Remarks"
                                    style={{
                                        border: "1px dashed var(--border-color)",
                                    }}
                                >
                                    <Text
                                        type="secondary"
                                        style={{
                                            fontSize: 13,
                                            lineHeight: 1.5,
                                        }}
                                    >
                                        {request.remarks}
                                    </Text>
                                </Card>
                            </div>
                        )}

                        {request.comment && (
                            <div
                                className="detail-field"
                                style={{ marginTop: 16 }}
                            >
                                <Card
                                    size="small"
                                    title="Approver's Comment"
                                    style={{
                                        border: "1px dashed var(--border-color)",
                                    }}
                                >
                                    <Text
                                        type="secondary"
                                        style={{
                                            fontSize: 13,
                                            lineHeight: 1.5,
                                        }}
                                    >
                                        {request.comment}
                                    </Text>
                                </Card>
                            </div>
                        )}
                    </div>

                    {/* Attachments */}
                    {request.attachments &&
                        request.attachments.length > 0 &&
                        renderAttachments()}
                </Drawer>

                {/* Action Modals */}
                <ActionModal
                    action="approve"
                    request={request}
                    visible={approveModalVisible}
                    comment={commentText}
                    onCommentChange={setCommentText}
                    onCancel={handleActionCancel}
                    onSubmit={handleActionSubmit}
                    loading={updateRequestStatusMutation.isPending}
                />

                <ActionModal
                    action="reject"
                    request={request}
                    visible={rejectModalVisible}
                    comment={commentText}
                    onCommentChange={setCommentText}
                    onCancel={handleActionCancel}
                    loading={updateRequestStatusMutation.isPending}
                />
            </>
        );
    },
);

RequestDetailsDrawer.displayName = "RequestDetailsDrawer";

export default RequestDetailsDrawer;
