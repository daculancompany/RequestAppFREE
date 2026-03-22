// components/Dashboard/RequestsInbox.jsx
import React, { useState, useMemo, useCallback, memo, useEffect } from "react";
import {
    Card,
    Avatar,
    Tag,
    Button,
    Dropdown,
    Space,
    Tooltip,
    Badge,
    Input,
    Select,
    Row,
    Col,
    Modal,
    message,
    Typography,
    Divider,
    Drawer,
    List,
    Form,
    Checkbox,
    Alert,
    InputNumber,
    DatePicker,
    TimePicker,
} from "antd";
import { motion, AnimatePresence } from "framer-motion";
import {
    MessageOutlined,
    CheckCircleOutlined,
    CloseCircleOutlined,
    ClockCircleOutlined,
    EyeOutlined,
    FilePdfOutlined,
    DownloadOutlined,
    FilterOutlined,
    SortAscendingOutlined,
    MoreOutlined,
    UserOutlined,
    TeamOutlined,
    CalendarOutlined,
    HistoryOutlined,
    SearchOutlined,
    InfoCircleOutlined,
    FileTextOutlined,
    EnvironmentOutlined,
    DollarOutlined,
    PaperClipOutlined,
    MailOutlined,
    FileSyncOutlined,
    AppstoreOutlined,
    TableOutlined,
    SendOutlined,
    EditOutlined,
    DeleteOutlined,
    StarOutlined,
    StarFilled,
    InboxOutlined,
    CheckOutlined,
    CloseOutlined,
    CommentOutlined,
    UploadOutlined,
    LinkOutlined,
    PhoneOutlined,
    BankOutlined,
    CarOutlined,
    UserSwitchOutlined,
    FileDoneOutlined,
    SafetyCertificateOutlined,
    AuditOutlined,
    CopyOutlined,
    ExclamationCircleOutlined,
} from "@ant-design/icons";
import { PDFDownloadLink } from "@react-pdf/renderer";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import "@/styles/Request.scss";

dayjs.extend(relativeTime);

const { Search } = Input;
const { Option } = Select;
const { Text, Title, Paragraph } = Typography;
const { TextArea } = Input;

// ============ MOCK DATA ============
const requests = [
    {
        id: 1,
        request_id: "REQ-2024-001",
        user_id: 101,
        user: {
            id: 101,
            name: "John Smith",
            email: "john.smith@company.com",
            avatar: null,
            position: "Senior Developer",
            department: "Engineering",
            phone: "+1 (555) 123-4567",
            employee_id: "EMP001",
        },
        approver_id: 201,
        approver: {
            id: 201,
            name: "Sarah Johnson",
            email: "sarah.johnson@company.com",
            position: "Engineering Manager",
        },
        type: "leave",
        status: "pending",
        date_of_request: "2024-01-15",
        reason: "Medical appointment for annual checkup",
        purpose: null,
        place_of_travel: null,
        remarks: "Will be available on phone for emergencies",
        time_out: "09:00:00",
        expected_time_in: "17:00:00",
        total_days: 1,
        signature_path: "/signatures/signature1.png",
        uses_default_signature: false,
        submitted_at: "2024-01-14T09:30:00Z",
        created_at: "2024-01-14T09:30:00Z",
        updated_at: "2024-01-14T09:30:00Z",
        approved_at: null,
        rejected_at: null,
        travel_days: null,
        conversation: [
            {
                id: 1,
                user_id: 101,
                user_name: "John Smith",
                message: "Request submitted for medical appointment",
                timestamp: "2024-01-14T09:30:00Z",
            },
            {
                id: 2,
                user_id: 201,
                user_name: "Sarah Johnson",
                message: "Please provide the doctor's appointment details",
                timestamp: "2024-01-14T10:15:00Z",
            },
        ],
        priority: "medium",
        attachments: [
            {
                name: "medical_appointment.pdf",
                url: "/attachments/medical_appointment.pdf",
                size: "1.2MB",
                type: "pdf",
            },
        ],
    },
    {
        id: 2,
        request_id: "REQ-2024-002",
        user_id: 102,
        user: {
            id: 102,
            name: "Maria Garcia",
            email: "maria.garcia@company.com",
            avatar: "/avatars/maria.jpg",
            position: "Sales Executive",
            department: "Sales",
            phone: "+1 (555) 234-5678",
            employee_id: "EMP002",
        },
        approver_id: 202,
        approver: {
            id: 202,
            name: "Robert Wilson",
            email: "robert.wilson@company.com",
            position: "Sales Director",
        },
        type: "travel",
        status: "approved",
        date_of_request: "2024-01-20",
        reason: null,
        purpose: "Client meeting and product demonstration",
        place_of_travel: "New York, USA",
        remarks: "Need to finalize annual contract with TechCorp",
        time_out: null,
        expected_time_in: null,
        total_days: 3,
        signature_path: "/signatures/signature2.png",
        uses_default_signature: true,
        submitted_at: "2024-01-18T14:20:00Z",
        created_at: "2024-01-18T14:20:00Z",
        updated_at: "2024-01-19T10:15:00Z",
        approved_at: "2024-01-19T10:15:00Z",
        rejected_at: null,
        travel_days: [
            {
                id: 1,
                request_id: 2,
                date_from: "2024-01-22",
                date_to: "2024-01-22",
                transportation: "airline",
                per_diem: 250.0,
                notes: "Flight AA123 - Departure 8:00 AM, Arrival 11:00 AM",
            },
            {
                id: 2,
                request_id: 2,
                date_from: "2024-01-23",
                date_to: "2024-01-23",
                transportation: "company_vehicle",
                per_diem: 150.0,
                notes: "Client meetings at TechCorp office - 9:00 AM to 5:00 PM",
            },
            {
                id: 3,
                request_id: 2,
                date_from: "2024-01-24",
                date_to: "2024-01-24",
                transportation: "airline",
                per_diem: 250.0,
                notes: "Return flight AA124 - Departure 6:00 PM, Arrival 9:00 PM",
            },
        ],
        conversation: [
            {
                id: 1,
                user_id: 102,
                user_name: "Maria Garcia",
                message: "Submitted travel request for New York client meeting",
                timestamp: "2024-01-18T14:20:00Z",
            },
            {
                id: 2,
                user_id: 202,
                user_name: "Robert Wilson",
                message: "Approved. This is an important client. Safe travels!",
                timestamp: "2024-01-19T10:15:00Z",
            },
            {
                id: 3,
                user_id: 102,
                user_name: "Maria Garcia",
                message: "Thank you! I'll prepare all the necessary materials",
                timestamp: "2024-01-19T10:30:00Z",
            },
        ],
        priority: "high",
        attachments: [
            {
                name: "flight_tickets.pdf",
                url: "/attachments/flight_tickets.pdf",
                size: "2.1MB",
                type: "pdf",
            },
            {
                name: "hotel_reservation.pdf",
                url: "/attachments/hotel_reservation.pdf",
                size: "0.8MB",
                type: "pdf",
            },
            {
                name: "meeting_agenda.docx",
                url: "/attachments/meeting_agenda.docx",
                size: "0.3MB",
                type: "docx",
            },
        ],
    },
];

// ============ CONSTANTS & UTILITIES ============
const STATUS_CONFIG = {
    approved: {
        color: "#52c41a",
        bg: "#f6ffed",
        icon: <CheckCircleOutlined style={{ color: "#52c41a" }} />,
        text: "Approved",
    },
    rejected: {
        color: "#ff4d4f",
        bg: "#fff1f0",
        icon: <CloseCircleOutlined style={{ color: "#ff4d4f" }} />,
        text: "Rejected",
    },
    cancelled: {
        color: "#8c8c8c",
        bg: "#f5f5f5",
        icon: <CloseCircleOutlined style={{ color: "#8c8c8c" }} />,
        text: "Cancelled",
    },
    pending: {
        color: "#faad14",
        bg: "#fffbe6",
        icon: <ClockCircleOutlined style={{ color: "#faad14" }} />,
        text: "Pending",
    },
};

const REQUEST_TYPE_CONFIG = {
    leave: {
        label: "Leave",
        icon: <CalendarOutlined />,
        color: "#1890ff",
        bg: "#e6f7ff",
    },
    travel: {
        label: "Travel",
        icon: <EnvironmentOutlined />,
        color: "#722ed1",
        bg: "#f9f0ff",
    },
};

// ============ REUSABLE COMPONENTS ============

/**
 * Request Statistics Component
 * Displays statistics for different request categories
 */
const RequestStatistics = memo(({ stats }) => {
    const statItems = [
        {
            key: "total",
            label: "Total",
            value: stats.total,
            icon: <FileSyncOutlined />,
            className: "total",
        },
        {
            key: "pending",
            label: "Pending",
            value: stats.pending,
            icon: <ClockCircleOutlined />,
            className: "pending",
        },
        {
            key: "leave",
            label: "Leave",
            value: stats.leave,
            icon: <CalendarOutlined />,
            className: "leave",
        },
        {
            key: "travel",
            label: "Travel",
            value: stats.travel,
            icon: <EnvironmentOutlined />,
            className: "travel",
        },
    ];

    return (
        <div className="inbox-statistics">
            <Row gutter={[16, 16]}>
                {statItems.map((item) => (
                    <Col span={6} key={item.key}>
                        <div className={`stat-item ${item.className}`}>
                            {item.icon}
                            <div>
                                <strong>{item.value}</strong>
                                <span>{item.label}</span>
                            </div>
                        </div>
                    </Col>
                ))}
            </Row>
        </div>
    );
});

/**
 * Comment Item Component
 * Displays individual comment with actions (reply, edit, delete)
 */
const CommentItem = memo(({ comment, onDelete, onReply }) => {
    const [isDeleting, setIsDeleting] = useState(false);

    const handleDelete = useCallback(async () => {
        try {
            setIsDeleting(true);
            await onDelete?.(comment.id);
            message.success("Comment deleted successfully");
        } catch (error) {
            message.error("Failed to delete comment");
        } finally {
            setIsDeleting(false);
        }
    }, [comment.id, onDelete]);

    const menuItems = [
        {
            key: "reply",
            label: "Reply",
            icon: <SendOutlined />,
            onClick: () => onReply?.(comment),
        },
        {
            key: "edit",
            label: "Edit",
            icon: <EditOutlined />,
            onClick: () => message.info("Edit functionality coming soon"),
        },
        {
            type: "divider",
        },
        {
            key: "delete",
            label: "Delete",
            icon: <DeleteOutlined />,
            danger: true,
            onClick: () => {
                Modal.confirm({
                    title: "Delete Comment",
                    content: "Are you sure you want to delete this comment?",
                    icon: <ExclamationCircleOutlined />,
                    okText: "Delete",
                    okType: "danger",
                    cancelText: "Cancel",
                    onOk: handleDelete,
                });
            },
        },
    ];

    return (
        <div className="comment-item">
            <div className="comment-header">
                <Avatar size="small" src={comment.user_avatar}>
                    {comment.user_name?.charAt(0) || "U"}
                </Avatar>
                <div className="comment-meta">
                    <Text strong style={{ fontSize: 13 }}>
                        {comment.user_name || "Unknown User"}
                    </Text>
                    <Text type="secondary" style={{ fontSize: 11 }}>
                        {dayjs(comment.timestamp).format("MMM DD, YYYY HH:mm")}
                        {" • "}
                        {dayjs(comment.timestamp).fromNow()}
                    </Text>
                </div>
                <div className="comment-actions">
                    <Dropdown menu={{ items: menuItems }} trigger={["click"]}>
                        <Button
                            type="text"
                            size="small"
                            icon={<MoreOutlined />}
                            loading={isDeleting}
                        />
                    </Dropdown>
                </div>
            </div>
            <div className="comment-content">
                <Text style={{ fontSize: 13, lineHeight: 1.5 }}>
                    {comment.message}
                </Text>
            </div>
        </div>
    );
});

/**
 * Add Comment Component
 * Form for adding new comments with attachments
 */
/**
 * Add Comment Component - UPDATED
 * Form for adding new comments with attachments
 */
const AddComment = memo(({ requestId, onSubmit, isLoading }) => {
    const [comment, setComment] = useState("");
    const [attachments, setAttachments] = useState([]);
    const [replyTo, setReplyTo] = useState(null);

    const handleSubmit = useCallback(() => {
        if (!comment.trim()) {
            message.warning("Please enter a comment");
            return;
        }

        const commentData = {
            request_id: requestId,
            message: comment.trim(),
            attachments: attachments,
            reply_to: replyTo?.id,
            timestamp: new Date().toISOString(),
            user_id: 201, // Current user ID - in real app, get from auth
            user_name: "You",
        };

        onSubmit?.(commentData);
        setComment("");
        setAttachments([]);
        setReplyTo(null);
    }, [comment, attachments, replyTo, requestId, onSubmit]);

    const handleKeyPress = useCallback(
        (e) => {
            if (e.ctrlKey && e.key === "Enter") {
                handleSubmit();
            }
        },
        [handleSubmit]
    );

    const quickTemplates = [
        "Please provide more information",
        "I need to check availability",
        "Can we schedule a meeting to discuss?",
        "Approved pending documentation",
        "Please review and resubmit",
    ];

    // Clear reply if comment is cleared
    useEffect(() => {
        if (!comment.includes(`@${replyTo?.user_name}`)) {
            setReplyTo(null);
        }
    }, [comment, replyTo]);

    return (
        <div className="add-comment">
            {replyTo && (
                <Alert
                    message={
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span>
                                Replying to <strong>{replyTo.user_name}</strong>
                            </span>
                            <Button
                                type="text"
                                size="small"
                                icon={<CloseOutlined />}
                                onClick={() => setReplyTo(null)}
                            />
                        </div>
                    }
                    type="info"
                    style={{ marginBottom: 12 }}
                />
            )}

            <Text strong style={{ display: "block", marginBottom: 8 }}>
                Add a comment
            </Text>
            
            <TextArea
                rows={3}
                placeholder="Type your comment here... (Ctrl+Enter to submit)"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                onKeyDown={handleKeyPress}
                style={{
                    marginBottom: 12,
                    resize: "vertical",
                    minHeight: 80,
                }}
            />

            {/* Quick Templates */}
            <div className="quick-templates" style={{ marginBottom: 12 }}>
                <Text type="secondary" style={{ fontSize: 12, marginRight: 8 }}>
                    Quick replies:
                </Text>
                <Space wrap size={[4, 4]}>
                    {quickTemplates.map((template, index) => (
                        <Button
                            key={index}
                            size="small"
                            type="dashed"
                            onClick={() => setComment(template)}
                        >
                            {template}
                        </Button>
                    ))}
                </Space>
            </div>

            {/* Action Bar */}
            <div className="comment-actions-bar" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Space>
                    <Button
                        type="text"
                        size="small"
                        icon={<PaperClipOutlined />}
                        onClick={() => {
                            // Simulate file upload
                            message.info("Attachment functionality coming soon");
                        }}
                    >
                        Attach file
                    </Button>
                    <Button
                        type="text"
                        size="small"
                        icon={<EditOutlined />}
                        onClick={() =>
                            message.info("Formatting options coming soon")
                        }
                    >
                        Format
                    </Button>
                    <Button
                        type="text"
                        size="small"
                        icon={<CopyOutlined />}
                        onClick={() => {
                            if (comment) {
                                navigator.clipboard.writeText(comment);
                                message.success("Comment copied to clipboard");
                            }
                        }}
                    >
                        Copy
                    </Button>
                </Space>

                <Button
                    type="primary"
                    icon={<SendOutlined />}
                    onClick={handleSubmit}
                    disabled={!comment.trim()}
                    loading={isLoading}
                >
                    Post Comment
                </Button>
            </div>
        </div>
    );
});

/**
 * Request List Item Component
 * Individual request item in list view
 */
const RequestListItem = memo(
    ({
        request,
        isSelected,
        isStarred,
        onToggleSelect,
        onToggleStar,
        onViewDetails,
        onQuickAction,
        onOpenChat,
    }) => {
        const statusConfig = STATUS_CONFIG[request.status] || STATUS_CONFIG.pending;
        const typeConfig = REQUEST_TYPE_CONFIG[request.type] || REQUEST_TYPE_CONFIG.leave;
        const timeAgo = dayjs(request.created_at).fromNow();
        const isUnread = request.status === "pending";

        const menuItems = useMemo(() => [
            {
                key: "view",
                label: "View details",
                icon: <EyeOutlined />,
                onClick: () => onViewDetails(request),
            },
            {
                key: "comment",
                label: "Add comment",
                icon: <CommentOutlined />,
            },
            {
                key: "message",
                label: "Send message",
                icon: <MessageOutlined />,
                onClick: () => onOpenChat?.(request),
            },
            { type: "divider" },
            {
                key: "download",
                label: "Download PDF",
                icon: <FilePdfOutlined />,
            },
            {
                key: "duplicate",
                label: "Duplicate",
                icon: <CopyOutlined />,
            },
        ], [request, onViewDetails, onOpenChat]);

        return (
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.2 }}
                className={`request-list-item ${isSelected ? "selected" : ""} ${isUnread ? "unread" : ""}`}
                onClick={() => onViewDetails(request)}
            >
                <div className="list-item-content">
                    {/* Checkbox */}
                    <div className="list-item-checkbox" onClick={(e) => e.stopPropagation()}>
                        <Checkbox checked={isSelected} onChange={onToggleSelect} />
                    </div>

                    {/* Star */}
                    <div className="list-item-star" onClick={(e) => { e.stopPropagation(); onToggleStar(request.id); }}>
                        {isStarred ? <StarFilled style={{ color: "#fadb14" }} /> : <StarOutlined />}
                    </div>

                    {/* Type Icon */}
                    <div className="list-item-type">
                        <div className="type-icon" style={{ backgroundColor: typeConfig.bg, color: typeConfig.color }}>
                            {typeConfig.icon}
                        </div>
                    </div>

                    {/* Sender/Requester */}
                    <div className="list-item-sender">
                        <strong>{request.user?.name || "Unknown User"}</strong>
                        <span className="sender-email">{request.user?.email}</span>
                    </div>

                    {/* Request Details */}
                    <div className="list-item-details">
                        <div className="request-subject">
                            <span className="request-id">[{request.request_id}]</span>
                            <span className="request-title">
                                {request.type === "leave" ? request.reason : request.place_of_travel}
                            </span>
                        </div>
                        <div className="request-preview">
                            {request.type === "leave"
                                ? `Leave for ${request.total_days || 1} day(s)`
                                : `Travel to ${request.place_of_travel} (${request.total_days || 1} days)`}
                        </div>
                    </div>

                    {/* Status Badge */}
                    <div className="list-item-status">
                        <Tag icon={statusConfig.icon} color={statusConfig.color} style={{ backgroundColor: statusConfig.bg, border: "none", margin: 0 }}>
                            {statusConfig.text}
                        </Tag>
                    </div>

                    {/* Date */}
                    <div className="list-item-date">
                        <span>{timeAgo}</span>
                    </div>

                    {/* Quick Actions */}
                    <div className="list-item-actions" onClick={(e) => e.stopPropagation()}>
                        {request.status === "pending" && (
                            <Space>
                                <Tooltip title="Approve">
                                    <Button
                                        type="text"
                                        icon={<CheckOutlined style={{ color: "#52c41a" }} />}
                                        size="small"
                                        onClick={() => onQuickAction("approve", request)}
                                    />
                                </Tooltip>
                                <Tooltip title="Reject">
                                    <Button
                                        type="text"
                                        icon={<CloseOutlined style={{ color: "#ff4d4f" }} />}
                                        size="small"
                                        onClick={() => onQuickAction("reject", request)}
                                    />
                                </Tooltip>
                            </Space>
                        )}
                        <Tooltip title="More actions">
                            <Dropdown menu={{ items: menuItems }} trigger={["click"]}>
                                <Button type="text" icon={<MoreOutlined />} size="small" />
                            </Dropdown>
                        </Tooltip>
                    </div>
                </div>
            </motion.div>
        );
    }
);

// ============ MAIN COMPONENT ============

const RequestsInbox = ({ appContext }) => {
    const {
        // requests = [],
        groups = [],
        handleApprove,
        handleReject,
        openChat,
        setSelectedRequest,
        setRequestModalVisible,
    } = appContext || {};

    // State management
    const [filterStatus, setFilterStatus] = useState("pending");
    const [filterType, setFilterType] = useState("all");
    const [sortBy, setSortBy] = useState("recent");
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedRequests, setSelectedRequests] = useState([]);
    const [viewMode, setViewMode] = useState("list");
    const [showDetails, setShowDetails] = useState({});
    const [starredRequests, setStarredRequests] = useState([]);
    const [selectedRequestDetails, setSelectedRequestDetails] = useState(null);
    const [detailDrawerVisible, setDetailDrawerVisible] = useState(false);
    const [approveModalVisible, setApproveModalVisible] = useState(false);
    const [rejectModalVisible, setRejectModalVisible] = useState(false);
    const [selectedActionRequest, setSelectedActionRequest] = useState(null);
    const [commentText, setCommentText] = useState("");
    const [quickActionMode, setQuickActionMode] = useState(false);
    const [isAddingComment, setIsAddingComment] = useState(false);
    const [comments, setComments] = useState(requests.flatMap(r => r.conversation || []));

    // Calculate statistics - memoized
    const stats = useMemo(() => ({
        total: requests.length,
        pending: requests.filter((r) => r.status === "pending").length,
        approved: requests.filter((r) => r.status === "approved").length,
        rejected: requests.filter((r) => r.status === "rejected").length,
        cancelled: requests.filter((r) => r.status === "cancelled").length,
        leave: requests.filter((r) => r.type === "leave").length,
        travel: requests.filter((r) => r.type === "travel").length,
    }), [requests]);

    // Filter and sort requests - memoized
    const filteredRequests = useMemo(() => {
        let result = [...requests];

        // Apply filters
        if (filterStatus !== "all") {
            result = result.filter((r) => r.status === filterStatus);
        }

        if (filterType !== "all") {
            result = result.filter((r) => r.type === filterType);
        }

        if (searchQuery) {
            const query = searchQuery.toLowerCase();
            result = result.filter((r) => {
                return (
                    r.request_id?.toLowerCase().includes(query) ||
                    r.user?.name?.toLowerCase().includes(query) ||
                    r.user?.email?.toLowerCase().includes(query) ||
                    r.reason?.toLowerCase().includes(query) ||
                    r.purpose?.toLowerCase().includes(query) ||
                    r.place_of_travel?.toLowerCase().includes(query)
                );
            });
        }

        // Apply sorting
        result.sort((a, b) => {
            switch (sortBy) {
                case "recent":
                    return new Date(b.created_at) - new Date(a.created_at);
                case "oldest":
                    return new Date(a.created_at) - new Date(b.created_at);
                case "name":
                    return (a.user?.name || "").localeCompare(b.user?.name || "");
                case "priority":
                    const priorityOrder = { high: 3, medium: 2, low: 1 };
                    return (priorityOrder[b.priority] || 0) - (priorityOrder[a.priority] || 0);
                default:
                    return 0;
            }
        });

        return result;
    }, [requests, filterStatus, filterType, searchQuery, sortBy]);

    // Memoized callbacks
    const toggleRequestSelection = useCallback((requestId) => {
        setSelectedRequests((prev) =>
            prev.includes(requestId)
                ? prev.filter((id) => id !== requestId)
                : [...prev, requestId]
        );
    }, []);

    const toggleAllSelection = useCallback(() => {
        setSelectedRequests(prev =>
            prev.length === filteredRequests.length
                ? []
                : filteredRequests.map(r => r.id)
        );
    }, [filteredRequests]);

    const toggleStar = useCallback((requestId) => {
        setStarredRequests((prev) =>
            prev.includes(requestId)
                ? prev.filter((id) => id !== requestId)
                : [...prev, requestId]
        );
    }, []);

    const handleQuickAction = useCallback((action, request) => {
        setSelectedActionRequest(request);
        if (action === "approve") {
            setApproveModalVisible(true);
        } else if (action === "reject") {
            setRejectModalVisible(true);
        }
    }, []);

    const submitAction = useCallback((action) => {
        if (!selectedActionRequest) return;

        const actionFunc = action === "approve" ? handleApprove : handleReject;
        if (actionFunc) {
            actionFunc(selectedActionRequest.id, commentText);
        }

        message.success(`Request ${action === "approve" ? "approved" : "rejected"} successfully!`);
        
        setApproveModalVisible(false);
        setRejectModalVisible(false);
        setSelectedActionRequest(null);
        setCommentText("");
    }, [selectedActionRequest, commentText, handleApprove, handleReject]);

    const viewRequestDetails = useCallback((request) => {
        setSelectedRequestDetails(request);
        setDetailDrawerVisible(true);
    }, []);

    const handleAddComment = useCallback(async (commentData) => {
    if (!selectedRequestDetails) return;

    setIsAddingComment(true);
    try {
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 500));
        
        const newComment = {
            id: Date.now(),
            request_id: selectedRequestDetails.id,
            user_id: commentData.user_id || 201,
            user_name: commentData.user_name || "You",
            message: commentData.message,
            timestamp: commentData.timestamp || new Date().toISOString(),
            reply_to: commentData.reply_to,
        };

        // Update local state
        setComments(prev => [...prev, newComment]);
        
        // Update the current request details
        setSelectedRequestDetails(prev => ({
            ...prev,
            conversation: [...(prev.conversation || []), newComment]
        }));
        
        message.success("Comment added successfully!");
    } catch (error) {
        message.error("Failed to add comment");
        console.error("Error adding comment:", error);
    } finally {
        setIsAddingComment(false);
    }
}, [selectedRequestDetails]);

    const handleDeleteComment = useCallback(async (commentId) => {
        try {
            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 300));
            
            setComments(prev => prev.filter(comment => comment.id !== commentId));
            
            // Update request conversation
            const updatedRequests = requests.map(req => {
                if (req.id === selectedRequestDetails?.id) {
                    return {
                        ...req,
                        conversation: (req.conversation || []).filter(comment => comment.id !== commentId)
                    };
                }
                return req;
            });
            
            return true;
        } catch (error) {
            throw error;
        }
    }, [selectedRequestDetails]);

    // Render request details drawer
   const renderRequestDetails = useCallback(() => {
    if (!selectedRequestDetails) return null;

    const request = selectedRequestDetails;
    const statusConfig = STATUS_CONFIG[request.status] || STATUS_CONFIG.pending;
    const typeConfig = REQUEST_TYPE_CONFIG[request.type] || REQUEST_TYPE_CONFIG.leave;
    const timeAgo = dayjs(request.created_at).fromNow();
    
    // Get comments for this specific request
    const requestComments = comments.filter(c => c.request_id === request.id);

    return (
        <Drawer
            title={
                <div className="detail-drawer-header">
                    <div className="request-title">
                        <div className="type-icon-large" style={{ backgroundColor: typeConfig.bg, color: typeConfig.color }}>
                            {typeConfig.icon}
                        </div>
                        <div>
                            <Title level={4} style={{ margin: 0 }}>
                                {request.request_id}
                            </Title>
                            <Text type="secondary">
                                {typeConfig.label} Request • Submitted {timeAgo}
                            </Text>
                        </div>
                    </div>
                    <Tag icon={statusConfig.icon} color={statusConfig.color} style={{ backgroundColor: statusConfig.bg, fontSize: "14px", padding: "4px 12px", fontWeight: 600 }}>
                        {statusConfig.text}
                    </Tag>
                </div>
            }
            placement="right"
            width={600}
            onClose={() => {
                setDetailDrawerVisible(false);
                setSelectedRequestDetails(null);
            }}
            open={detailDrawerVisible}
            footer={
                request.status === "pending" ? (
                    <div className="drawer-footer-actions">
                        <Space style={{ width: '100%', justifyContent: 'center' }}>
                            <Button
                                type="primary"
                                icon={<CheckOutlined />}
                                onClick={() => handleQuickAction("approve", request)}
                                size="large"
                                style={{
                                    minWidth: 120,
                                    background: "linear-gradient(135deg, #52c41a, #73d13d)",
                                    border: "none",
                                }}
                            >
                                Approve
                            </Button>
                            <Button
                                danger
                                icon={<CloseOutlined />}
                                onClick={() => handleQuickAction("reject", request)}
                                size="large"
                                style={{
                                    minWidth: 120,
                                    background: "linear-gradient(135deg, #ff4d4f, #ff7875)",
                                    border: "none",
                                }}
                            >
                                Reject
                            </Button>
                        </Space>
                    </div>
                ) : null
            }
        >
            {/* Request Details Content */}
            <div className="detail-content">
                {/* Header Info */}
                <div className="detail-header">
                    <div className="requester-info">
                        <Avatar
                            size={48}
                            src={request.user?.avatar}
                            icon={<UserOutlined />}
                            style={{
                                border: `2px solid ${typeConfig.color}`,
                            }}
                        >
                            {request.user?.name?.charAt(0) || "U"}
                        </Avatar>
                        <div className="requester-details">
                            <Title level={5} style={{ margin: 0 }}>
                                {request.user?.name || "Unknown User"}
                            </Title>
                            <Text type="secondary">{request.user?.email}</Text>
                            <div className="requester-meta">
                                <Space size={4}>
                                    {request.user?.position && (
                                        <>
                                            <Text type="secondary">
                                                {request.user.position}
                                            </Text>
                                            <Text type="secondary">•</Text>
                                        </>
                                    )}
                                    <Text type="secondary">
                                        {request.user?.department || "No department"}
                                    </Text>
                                </Space>
                            </div>
                        </div>
                    </div>
                    <div className="approver-info">
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                            <UserOutlined style={{ color: 'var(--primary-color)' }} />
                            <Text strong>Approver:</Text>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <Avatar size="small" style={{ backgroundColor: '#1890ff' }}>
                                {request.approver?.name?.charAt(0) || "A"}
                            </Avatar>
                            <Text>{request.approver?.name || "Not assigned"}</Text>
                        </div>
                        {request.approver?.email && (
                            <Text type="secondary" style={{ fontSize: 12, marginTop: 2 }}>
                                {request.approver.email}
                            </Text>
                        )}
                    </div>
                </div>

                <Divider />

                {/* Timeline Info */}
                <div className="timeline-info" style={{ marginBottom: 20 }}>
                    <Space direction="vertical" size={2} style={{ width: '100%' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <Text type="secondary" style={{ fontSize: 12 }}>Submitted</Text>
                            <Text style={{ fontSize: 12, fontWeight: 500 }}>
                                {dayjs(request.submitted_at || request.created_at).format("MMM DD, YYYY HH:mm")}
                            </Text>
                        </div>
                        {request.approved_at && (
                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                <Text type="secondary" style={{ fontSize: 12 }}>Approved</Text>
                                <Text style={{ fontSize: 12, fontWeight: 500, color: '#52c41a' }}>
                                    {dayjs(request.approved_at).format("MMM DD, YYYY HH:mm")}
                                </Text>
                            </div>
                        )}
                        {request.rejected_at && (
                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                <Text type="secondary" style={{ fontSize: 12 }}>Rejected</Text>
                                <Text style={{ fontSize: 12, fontWeight: 500, color: '#ff4d4f' }}>
                                    {dayjs(request.rejected_at).format("MMM DD, YYYY HH:mm")}
                                </Text>
                            </div>
                        )}
                    </Space>
                </div>

                {/* Request Type Specific Details */}
                <div className="request-details-section">
                    <Title level={5} style={{ marginBottom: 16 }}>
                        Request Details
                    </Title>

                    {request.type === "leave" ? (
                        <div className="leave-details">
                            {/* Leave details rendering */}
                            <Card size="small" style={{ marginBottom: 16, background: typeConfig.bg, color: 'white' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <div>
                                        <Text strong style={{ color: 'white', display: 'block' }}>
                                            {request.reason || "Leave of Office"}
                                        </Text>
                                        <Text style={{ color: 'rgba(255,255,255,0.85)', fontSize: 12 }}>
                                            {request.total_days || 1} day{request.total_days !== 1 ? 's' : ''}
                                        </Text>
                                    </div>
                                    <CalendarOutlined style={{ fontSize: 24, opacity: 0.8 }} />
                                </div>
                            </Card>

                            {/* Date */}
                            <div className="detail-field">
                                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                                    <CalendarOutlined style={{ color: typeConfig.color }} />
                                    <Text strong>Date</Text>
                                </div>
                                <div style={{ background: 'var(--bg-tertiary)', padding: 12, borderRadius: 6, borderLeft: `3px solid ${typeConfig.color}` }}>
                                    <Text style={{ fontSize: 15, fontWeight: 500 }}>
                                        {dayjs(request.date_of_request).format("dddd, MMMM DD, YYYY")}
                                    </Text>
                                    <Text type="secondary" style={{ display: 'block', fontSize: 12, marginTop: 4 }}>
                                        {dayjs(request.date_of_request).fromNow()}
                                    </Text>
                                </div>
                            </div>

                            {/* Reason */}
                            <div className="detail-field" style={{ marginTop: 16 }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                                    <FileTextOutlined style={{ color: typeConfig.color }} />
                                    <Text strong>Reason</Text>
                                </div>
                                <div style={{ background: 'var(--bg-tertiary)', padding: 16, borderRadius: 6, borderLeft: `3px solid ${typeConfig.color}` }}>
                                    <Paragraph style={{ margin: 0, fontSize: 14, lineHeight: 1.6 }}>
                                        {request.reason || "No reason provided"}
                                    </Paragraph>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="travel-details">
                            {/* Travel details rendering */}
                            <Card size="small" style={{ marginBottom: 16, background: typeConfig.bg, color: 'white' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <div>
                                        <Text strong style={{ color: 'white', display: 'block' }}>
                                            {request.place_of_travel || "Business Travel"}
                                        </Text>
                                        <Text style={{ color: 'rgba(255,255,255,0.85)', fontSize: 12 }}>
                                            {request.total_days || 1} day{request.total_days !== 1 ? 's' : ''}
                                        </Text>
                                    </div>
                                    <EnvironmentOutlined style={{ fontSize: 24, opacity: 0.8 }} />
                                </div>
                            </Card>

                            {/* Destination */}
                            <div className="detail-field">
                                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                                    <EnvironmentOutlined style={{ color: typeConfig.color }} />
                                    <Text strong>Destination</Text>
                                </div>
                                <div style={{ background: 'var(--bg-tertiary)', padding: 12, borderRadius: 6, borderLeft: `3px solid ${typeConfig.color}` }}>
                                    <Text style={{ fontSize: 15, fontWeight: 500 }}>
                                        {request.place_of_travel || "Not specified"}
                                    </Text>
                                </div>
                            </div>

                            {/* Purpose */}
                            <div className="detail-field" style={{ marginTop: 16 }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                                    <FileTextOutlined style={{ color: typeConfig.color }} />
                                    <Text strong>Purpose</Text>
                                </div>
                                <div style={{ background: 'var(--bg-tertiary)', padding: 16, borderRadius: 6, borderLeft: `3px solid ${typeConfig.color}` }}>
                                    <Paragraph style={{ margin: 0, fontSize: 14, lineHeight: 1.6 }}>
                                        {request.purpose || "No purpose provided"}
                                    </Paragraph>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Remarks if exists */}
                    {request.remarks && (
                        <div className="detail-field" style={{ marginTop: 16 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                                <InfoCircleOutlined style={{ color: typeConfig.color }} />
                                <Text strong>Additional Remarks</Text>
                            </div>
                            <div style={{ background: 'var(--bg-tertiary)', padding: 12, borderRadius: 6, border: '1px dashed var(--border-color)' }}>
                                <Text type="secondary" style={{ fontSize: 13, lineHeight: 1.5 }}>
                                    {request.remarks}
                                </Text>
                            </div>
                        </div>
                    )}
                </div>

                {/* Attachments */}
                {request.attachments && request.attachments.length > 0 && (
                    <>
                        <Divider />
                        <div className="attachments-section">
                            <Title level={5} style={{ marginBottom: 12 }}>
                                Attachments ({request.attachments.length})
                            </Title>
                            <List
                                size="small"
                                dataSource={request.attachments}
                                renderItem={(file) => (
                                    <List.Item>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: 8, background: 'var(--bg-tertiary)', borderRadius: 6, width: '100%' }}>
                                            <FileTextOutlined style={{ color: typeConfig.color, fontSize: 20 }} />
                                            <div style={{ flex: 1, minWidth: 0 }}>
                                                <Text strong style={{ display: 'block', fontSize: 13 }}>
                                                    {file.name}
                                                </Text>
                                                <Text type="secondary" style={{ fontSize: 11 }}>
                                                    {file.size} • {file.type?.toUpperCase()}
                                                </Text>
                                            </div>
                                            <Button
                                                type="link"
                                                size="small"
                                                icon={<DownloadOutlined />}
                                                onClick={() => message.info(`Downloading ${file.name}`)}
                                            />
                                        </div>
                                    </List.Item>
                                )}
                            />
                        </div>
                    </>
                )}
            </div>

            {/* Comments Section */}
            <Divider />
            <div className="comments-section">
                {/* <Title level={5} style={{ marginBottom: 16 }}>
                    Comments ({requestComments.length})
                </Title>

                {requestComments.length > 0 ? (
                    <div className="comments-list" style={{ maxHeight: 300, overflowY: 'auto', paddingRight: 8 }}>
                        {requestComments.map((comment) => (
                            <CommentItem
                                key={comment.id}
                                comment={comment}
                                onDelete={handleDeleteComment}
                                onReply={(parentComment) => {
                                    // This will be handled in the AddComment component
                                    message.info("Reply functionality coming soon");
                                }}
                            />
                        ))}
                    </div>
                ) : (
                    <div className="no-comments">
                        <CommentOutlined style={{ fontSize: 48, color: "#d9d9d9", marginBottom: 16 }} />
                        <Text type="secondary">No comments yet</Text>
                        <Text type="secondary" style={{ fontSize: 12, marginTop: 4 }}>
                            Start the conversation
                        </Text>
                    </div>
                )} */}

                {/* Add Comment Component */}
                {/* <div style={{ marginTop: 24 }}>
                    <AddComment
                        requestId={request.id}
                        onSubmit={handleAddComment}
                        isLoading={isAddingComment}
                    />
                </div> */}
            </div>
        </Drawer>
    );
}, [selectedRequestDetails, detailDrawerVisible, comments, isAddingComment, handleAddComment, handleDeleteComment, handleQuickAction]);

    return (
        <>
            <Card
                title={
                    <div className="inbox-header">
                        <div className="inbox-title">
                            <InboxOutlined style={{ fontSize: "20px", marginRight: "12px" }} />
                            <span style={{ fontSize: "18px", fontWeight: "600" }}>
                                Requests Inbox
                            </span>
                            <Badge count={stats.pending} style={{ backgroundColor: "#faad14", marginLeft: 12 }} showZero />
                        </div>
                    </div>
                }
                className="requests-inbox"
                extra={
                    <Space wrap>
                        <Search
                            placeholder="Search requests..."
                            allowClear
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            style={{ width: 250 }}
                            size="small"
                            prefix={<SearchOutlined />}
                        />

                        <Select
                            value={filterStatus}
                            onChange={setFilterStatus}
                            style={{ width: 120 }}
                            size="small"
                        >
                            <Option value="all">All</Option>
                            <Option value="pending">Pending ({stats.pending})</Option>
                            <Option value="approved">Approved ({stats.approved})</Option>
                            <Option value="rejected">Rejected ({stats.rejected})</Option>
                            <Option value="cancelled">Cancelled ({stats.cancelled})</Option>
                        </Select>

                        <Select
                            value={filterType}
                            onChange={setFilterType}
                            style={{ width: 120 }}
                            size="small"
                        >
                            <Option value="all">All Types</Option>
                            <Option value="leave">Leave ({stats.leave})</Option>
                            <Option value="travel">Travel ({stats.travel})</Option>
                        </Select>

                        <Select
                            value={sortBy}
                            onChange={setSortBy}
                            style={{ width: 140 }}
                            size="small"
                        >
                            <Option value="recent">Newest first</Option>
                            <Option value="oldest">Oldest first</Option>
                            <Option value="name">By name</Option>
                            <Option value="priority">By priority</Option>
                        </Select>
                    </Space>
                }
            >
                {/* Inbox Toolbar */}
                <div className="inbox-toolbar">
                    <Space>
                        <Checkbox
                            indeterminate={selectedRequests.length > 0 && selectedRequests.length < filteredRequests.length}
                            checked={filteredRequests.length > 0 && selectedRequests.length === filteredRequests.length}
                            onChange={toggleAllSelection}
                        />
                        <Tooltip title="Mark as read">
                            <Button icon={<CheckOutlined />} size="small" />
                        </Tooltip>
                        <Tooltip title="Mark as unread">
                            <Button icon={<MailOutlined />} size="small" />
                        </Tooltip>
                        <Tooltip title="Star selected">
                            <Button icon={<StarOutlined />} size="small" />
                        </Tooltip>
                        <Tooltip title="Delete selected">
                            <Button icon={<DeleteOutlined />} size="small" danger />
                        </Tooltip>
                        <Divider type="vertical" />
                        <Button
                            type="primary"
                            icon={<FileTextOutlined />}
                            size="small"
                            onClick={() => setRequestModalVisible?.(true)}
                        >
                            New Request
                        </Button>
                    </Space>

                    <Space>
                        <span className="selected-count">
                            {selectedRequests.length} selected
                        </span>
                        {selectedRequests.length > 0 && (
                            <Space>
                                <Button
                                    type="primary"
                                    icon={<CheckOutlined />}
                                    size="small"
                                    onClick={() => setQuickActionMode("approve")}
                                >
                                    Approve All
                                </Button>
                                <Button
                                    danger
                                    icon={<CloseOutlined />}
                                    size="small"
                                    onClick={() => setQuickActionMode("reject")}
                                >
                                    Reject All
                                </Button>
                            </Space>
                        )}
                    </Space>
                </div>

                {/* Statistics */}
                <RequestStatistics stats={stats} />

                {/* Requests List */}
                <div className="requests-list-inbox">
                    {filteredRequests.length > 0 ? (
                        <div className="list-container">
                            <AnimatePresence>
                                {filteredRequests.map((request) => (
                                    <RequestListItem
                                        key={request.id}
                                        request={request}
                                        isSelected={selectedRequests.includes(request.id)}
                                        isStarred={starredRequests.includes(request.id)}
                                        onToggleSelect={() => toggleRequestSelection(request.id)}
                                        onToggleStar={() => toggleStar(request.id)}
                                        onViewDetails={viewRequestDetails}
                                        onQuickAction={handleQuickAction}
                                        onOpenChat={openChat}
                                    />
                                ))}
                            </AnimatePresence>
                        </div>
                    ) : (
                        <div className="empty-inbox">
                            <InboxOutlined style={{ fontSize: 64, color: "#d9d9d9" }} />
                            <h4>No requests found</h4>
                            <p>Try adjusting your filters or search terms</p>
                            <Button
                                type="primary"
                                icon={<FileTextOutlined />}
                                onClick={() => setRequestModalVisible?.(true)}
                                size="large"
                            >
                                Create New Request
                            </Button>
                        </div>
                    )}
                </div>

                {/* List Footer */}
                {filteredRequests.length > 0 && (
                    <div className="list-footer">
                        <Text type="secondary">
                            Showing {filteredRequests.length} of {requests.length} requests
                        </Text>
                        <Space>
                            <Button icon={<FilePdfOutlined />} size="small">
                                Generate Report
                            </Button>
                        </Space>
                    </div>
                )}
            </Card>

            {/* Details Drawer */}
            {renderRequestDetails()}

            {/* Action Modals */}
            {selectedActionRequest && (approveModalVisible || rejectModalVisible) && (
                <ActionModal
                    action={approveModalVisible ? "approve" : "reject"}
                    request={selectedActionRequest}
                    visible={approveModalVisible || rejectModalVisible}
                    comment={commentText}
                    onCommentChange={setCommentText}
                    onCancel={() => {
                        setApproveModalVisible(false);
                        setRejectModalVisible(false);
                        setSelectedActionRequest(null);
                        setCommentText("");
                    }}
                    onSubmit={submitAction}
                />
            )}
        </>
    );
};

/**
 * Action Modal Component
 * Reusable modal for approve/reject actions
 */
const ActionModal = memo(({ action, request, visible, comment, onCommentChange, onCancel, onSubmit }) => {
    const actionConfig = {
        approve: {
            color: "#52c41a",
            icon: <CheckCircleOutlined />,
            text: "Approve",
            quickTemplates: [
                "Approved. Enjoy your time off!",
                "Approved. Have a safe trip!",
                "Request approved.",
                "Approved pending documentation",
            ],
        },
        reject: {
            color: "#ff4d4f",
            icon: <CloseCircleOutlined />,
            text: "Reject",
            quickTemplates: [
                "Rejected due to scheduling conflict.",
                "Please provide more information.",
                "Request rejected.",
                "Not approved at this time.",
            ],
        },
    };

    const config = actionConfig[action];

    return (
        <Modal
            title={
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <div style={{ color: config.color }}>{config.icon}</div>
                    <span>{config.text} Request</span>
                </div>
            }
            open={visible}
            onCancel={onCancel}
            onOk={() => onSubmit(action)}
            okText={config.text}
            okButtonProps={{ style: { backgroundColor: config.color, borderColor: config.color } }}
            cancelText="Cancel"
            width={500}
        >
            <div className="action-modal-content">
                <Alert
                    message={
                        <div>
                            <strong>{request.user?.name}</strong>
                            <div style={{ fontSize: "12px", color: "#666", marginTop: 4 }}>
                                {request.type === "leave"
                                    ? `Leave: ${request.reason}`
                                    : `Travel: ${request.place_of_travel}`}
                            </div>
                        </div>
                    }
                    type="info"
                    showIcon
                    style={{ marginBottom: 16 }}
                />

                <div style={{ marginBottom: 16 }}>
                    <Text strong>Add a comment (optional):</Text>
                    <TextArea
                        rows={3}
                        placeholder={`Add a comment for ${action === "approve" ? "approval" : "rejection"}...`}
                        value={comment}
                        onChange={(e) => onCommentChange(e.target.value)}
                        style={{ marginTop: 8 }}
                    />
                </div>

                <div style={{ marginBottom: 16 }}>
                    <Text strong>Quick templates:</Text>
                    <div style={{ marginTop: 8, display: "flex", gap: 8, flexWrap: "wrap" }}>
                        {config.quickTemplates.map((template, index) => (
                            <Button
                                key={index}
                                size="small"
                                onClick={() => onCommentChange(template)}
                            >
                                {template}
                            </Button>
                        ))}
                    </div>
                </div>

                <div style={{ marginTop: 16 }}>
                    <Checkbox defaultChecked>Notify the employee via email</Checkbox>
                    <Checkbox style={{ marginLeft: 16 }}>Also notify team members</Checkbox>
                </div>
            </div>
        </Modal>
    );
});

export default memo(RequestsInbox);