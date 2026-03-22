import React, {
    useState,
    useMemo,
    useCallback,
    memo,
    useEffect,
    useRef,
} from "react";
import {
    Card,
    Avatar,
    Tag,
    Button,
    Tooltip,
    Input,
    Select,
    Modal,
    message,
    Typography,
    Spin,
    Pagination,
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
    UserOutlined,
    TeamOutlined,
    CalendarOutlined,
    HistoryOutlined,
    SearchOutlined,
    FileTextOutlined,
    EnvironmentOutlined,
    PaperClipOutlined,
    DeleteOutlined,
    StarOutlined,
    StarFilled,
    InboxOutlined,
    CheckOutlined,
    CloseOutlined,
    CommentOutlined,
    ExclamationCircleOutlined,
    ShareAltOutlined,
    PrinterOutlined,
    SyncOutlined,
    RightOutlined,
    ArrowUpOutlined,
    ArrowDownOutlined,
    WarningOutlined,
    LeftOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import advancedFormat from "dayjs/plugin/advancedFormat";
import isBetween from "dayjs/plugin/isBetween";
import weekday from "dayjs/plugin/weekday";
import "@/styles/Request.scss";
import {
    useRequest,
    useUpdateRequestStatusMutation,
} from "@/hooks/queries/request.queries";
import { useRequestStore } from "@/stores/request.store";
import { useGlobalStore } from "@/stores/global.store";
import { getUser, isUserApprover, isUserAdd } from "@/utils/helpers";
import RequestDetailsDrawer from "./RequestDetailsDrawer";
import ActionModal from "./ActionModal";

dayjs.extend(relativeTime);
dayjs.extend(advancedFormat);
dayjs.extend(isBetween);
dayjs.extend(weekday);

const { Search } = Input;
const { Option } = Select;
const { Text, Title, Paragraph } = Typography;

export const STATUS_CONFIG = {
    approved: {
        color: "#52c41a",
        bg: "#f6ffed",
        icon: <CheckCircleOutlined style={{ color: "#52c41a" }} />,
        text: "Approved",
        badgeStyle: { backgroundColor: "#52c41a", color: "#fff" },
    },
    rejected: {
        color: "#ff4d4f",
        bg: "#fff1f0",
        icon: <CloseCircleOutlined style={{ color: "#ff4d4f" }} />,
        text: "Rejected",
        badgeStyle: { backgroundColor: "#ff4d4f", color: "#fff" },
    },
    cancelled: {
        color: "#8c8c8c",
        bg: "#f5f5f5",
        icon: <CloseCircleOutlined style={{ color: "#8c8c8c" }} />,
        text: "Cancelled",
        badgeStyle: { backgroundColor: "#8c8c8c", color: "#fff" },
    },
    pending: {
        color: "#faad14",
        bg: "#fffbe6",
        icon: <ClockCircleOutlined style={{ color: "#faad14" }} />,
        text: "Pending",
        badgeStyle: { backgroundColor: "#faad14", color: "#fff" },
    },
};

export const REQUEST_TYPE_CONFIG = {
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

export const PRIORITY_CONFIG = {
    low: { color: "#52c41a", label: "Low", icon: <ArrowDownOutlined /> },
    medium: { color: "#faad14", label: "Medium", icon: <ArrowUpOutlined /> },
    high: { color: "#ff4d4f", label: "High", icon: <WarningOutlined /> },
    urgent: {
        color: "#f5222d",
        label: "Urgent",
        icon: <ExclamationCircleOutlined />,
    },
};

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
        index,
        isApprover,
    }) => {
        const statusConfig =
            STATUS_CONFIG[request.status] || STATUS_CONFIG.pending;
        const typeConfig =
            REQUEST_TYPE_CONFIG[request.type] || REQUEST_TYPE_CONFIG.leave;
        const timeAgo = dayjs(request.created_at).fromNow();
        const isUnread = request.status === "pending";
        const hasAttachments =
            request.attachments && request.attachments.length > 0;
        const hasConversation =
            request.conversation && request.conversation.length > 0;

        return (
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
                className={`request-list-item ${isSelected ? "selected" : ""} ${isUnread ? "unread" : ""}`}
                onClick={() => onViewDetails(request)}
                whileHover={{ backgroundColor: "var(--bg-tertiary)" }}
            >
                <div className="list-item-content">
                    {/* Checkbox */}
                    {/* <div
                        className="list-item-checkbox"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <Checkbox
                            checked={isSelected}
                            onChange={onToggleSelect}
                        />
                    </div> */}

                    {/* Star */}
                    {/* <div
                        className="list-item-star"
                        onClick={(e) => {
                            e.stopPropagation();
                            onToggleStar(request.id);
                        }}
                    >
                        {isStarred ? (
                            <StarFilled
                                style={{ color: "#faad14", fontSize: 16 }}
                            />
                        ) : (
                            <StarOutlined
                                style={{
                                    color: "var(--text-secondary)",
                                    fontSize: 16,
                                }}
                            />
                        )}
                    </div> */}

                    {/* Type Icon with Badge */}
                    <div className="list-item-type">
                        <div className="type-badge">
                            <div
                                className="type-icon"
                                style={{ background: typeConfig.gradient }}
                            >
                                {typeConfig.icon}
                            </div>
                            {isUnread && <div className="unread-badge" />}
                        </div>
                    </div>

                    {/* Sender/Requester with Avatar */}
                    <div className="list-item-sender">
                        <div className="sender-info">
                            <Avatar
                                size={32}
                                src={request.user?.avatar}
                                style={{
                                    backgroundColor: typeConfig.color,
                                    flexShrink: 0,
                                }}
                            >
                                {request.user?.name?.charAt(0) || "U"}
                            </Avatar>
                            <div className="sender-details">
                                <strong className="sender-name">
                                    {request.user?.name || "Unknown User"}
                                </strong>
                                <span className="sender-email">
                                    {request.user?.email}
                                </span>
                                {request.user?.position && (
                                    <span className="sender-position">
                                        {request.user.position}
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="list-item-details">
                        <div className="request-header">
                            <div className="request-subject">
                                <span className="request-id">
                                    #{request.request_id}
                                </span>
                                <span className="request-title">
                                    {request.type === "leave"
                                        ? request.reason || "Leave Request"
                                        : request.purpose || "Travel Request"}
                                </span>
                                {isUnread && <span className="unread-dot" />}
                            </div>
                            <div className="request-preview">
                                {request.type === "leave"
                                    ? `Leave for ${request.total_days || 1} day${request.total_days !== 1 ? "s" : ""}`
                                    : `Travel for ${request.total_days || 1} day${request.total_days !== 1 ? "s" : ""}`}
                            </div>
                        </div>

                        {request.tags && request.tags.length > 0 && (
                            <div className="request-tags">
                                {request.tags.slice(0, 2).map((tag, idx) => (
                                    <Tag
                                        key={idx}
                                        size="small"
                                        style={{ fontSize: 11 }}
                                    >
                                        {tag}
                                    </Tag>
                                ))}
                                {request.tags.length > 2 && (
                                    <Tag size="small" style={{ fontSize: 11 }}>
                                        +{request.tags.length - 2}
                                    </Tag>
                                )}
                            </div>
                        )}

                        {/* Indicators */}
                        <div className="request-indicators">
                            {hasAttachments && (
                                <Tooltip
                                    title={`${request.attachments.length} attachment${request.attachments.length !== 1 ? "s" : ""}`}
                                >
                                    <PaperClipOutlined />
                                </Tooltip>
                            )}
                            {hasConversation && (
                                <Tooltip
                                    title={`${request.conversation.length} comment${request.conversation.length !== 1 ? "s" : ""}`}
                                >
                                    <CommentOutlined />
                                </Tooltip>
                            )}
                        </div>
                    </div>

                    {/* Status Badge */}
                    <div className="list-item-status">
                        <Tag
                            className="status-tag"
                            style={{
                                backgroundColor: statusConfig.bg,
                                color: statusConfig.color,
                                border: `1px solid ${statusConfig.color}20`,
                            }}
                        >
                            {statusConfig.icon}
                            {statusConfig.text}
                        </Tag>
                    </div>

                    {/* Date */}
                    <div className="list-item-date">
                        <Tooltip
                            title={dayjs(request.created_at).format(
                                "MMMM DD, YYYY h:mm A",
                            )}
                        >
                            <span className="date-text">{timeAgo}</span>
                            <span className="date-hover">
                                {dayjs(request.created_at).format(
                                    "MMM DD, YYYY",
                                )}
                            </span>
                        </Tooltip>
                    </div>

                    {/* Quick Actions */}
                    <div
                        className="list-item-actions"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {isApprover && request.status === "pending" && (
                            <div className="action-buttons">
                                <Tooltip title="Approve">
                                    <Button
                                        type="text"
                                        size="small"
                                        icon={
                                            <CheckOutlined
                                                style={{ color: "#52c41a" }}
                                            />
                                        }
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            onQuickAction("approve", request);
                                        }}
                                    />
                                </Tooltip>
                                <Tooltip title="Reject">
                                    <Button
                                        type="text"
                                        size="small"
                                        icon={
                                            <CloseOutlined
                                                style={{ color: "#ff4d4f" }}
                                            />
                                        }
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            onQuickAction("reject", request);
                                        }}
                                    />
                                </Tooltip>
                            </div>
                        )}
                    </div>
                </div>
            </motion.div>
        );
    },
);

const RequestList = ({ appContext }) => {
    const { activeGroup } = useGlobalStore();
    const {
        requestCurrentPage,
        pageSize,
        setRequestCurrentPage,
        setPageSize,
        setNewRequest,
    } = useRequestStore();
    const {
        groups = [],
        handleApprove,
        handleReject,
        openChat,
        setSelectedRequest,
        setRequestModalVisible,
    } = appContext || {};
    const updateRequestStatusMutation = useUpdateRequestStatusMutation();
    const user = getUser();

    const [filterStatus, setFilterStatus] = useState("all");
    const [filterType, setFilterType] = useState("all");
    const [sortBy, setSortBy] = useState("recent");
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedRequests, setSelectedRequests] = useState([]);
    const [starredRequests, setStarredRequests] = useState([]);
    const [selectedRequestDetails, setSelectedRequestDetails] = useState(null);
    const [detailDrawerVisible, setDetailDrawerVisible] = useState(false);
    const [approveModalVisible, setApproveModalVisible] = useState(false);
    const [rejectModalVisible, setRejectModalVisible] = useState(false);
    const [selectedActionRequest, setSelectedActionRequest] = useState(null);
    const [commentText, setCommentText] = useState("");
    const [quickActionMode, setQuickActionMode] = useState(false);
    const [isAddingComment, setIsAddingComment] = useState(false);
    const [comments, setComments] = useState([]);
    const [showFilters, setShowFilters] = useState(false);

    const isApprover = isUserApprover(user, activeGroup);
    const isAdd = isUserAdd(user, activeGroup);
    const {
        data,
        isLoading: isLoadingRequest,
        error: requestError,
        refetch: refetchRequest,
        isFetching,
    } = useRequest({
        page: requestCurrentPage,
        status: filterStatus === "all" ? undefined : filterStatus,
        type: filterType === "all" ? undefined : filterType,
        search: searchQuery || undefined,
        group_id: activeGroup?.id,
    });
    const [loading, setIsActionLoading] = useState(false);

    const [cachedData, setCachedData] = useState({
        data: [],
        pagination: { current: 1, per_page: 10, total: 0 },
    });

    const firstPageCounts = useRef({
        status_counts: {},
        type_counts: {},
    });

    useEffect(() => {
        if (data?.data) {
            setCachedData({
                data: data.data,
                pagination: data.pagination || cachedData.pagination,
            });

            // Store counts from first page only - this will only run once
            if (
                requestCurrentPage === 1 &&
                data.status_counts &&
                data.type_counts
            ) {
                firstPageCounts.current = {
                    status_counts: data.status_counts,
                    type_counts: data.type_counts,
                };
            }
        }
    }, [data, requestCurrentPage]);

    // Use cached data during loading
    const apiRequests =
        isFetching && !data?.data ? cachedData.data : data?.data || [];
    const pagination =
        isFetching && !data?.pagination
            ? cachedData.pagination
            : data?.pagination || cachedData.pagination;

    const status_counts = firstPageCounts.current.status_counts;
    const type_counts = firstPageCounts.current.type_counts;

    useEffect(() => {
        setRequestCurrentPage(1);
    }, [filterStatus, filterType, searchQuery]);

    const handlePageChange = useCallback((page, newPageSize) => {
        setRequestCurrentPage(page);
        if (newPageSize) {
            setPageSize(newPageSize);
        }
    }, []);

    const toggleRequestSelection = useCallback((requestId) => {
        setSelectedRequests((prev) =>
            prev.includes(requestId)
                ? prev.filter((id) => id !== requestId)
                : [...prev, requestId],
        );
    }, []);

    const toggleAllSelection = useCallback(() => {
        setSelectedRequests((prev) =>
            prev.length === apiRequests.length
                ? []
                : apiRequests.map((r) => r.id),
        );
    }, [apiRequests]);

    const toggleStar = useCallback((requestId) => {
        setStarredRequests((prev) =>
            prev.includes(requestId)
                ? prev.filter((id) => id !== requestId)
                : [...prev, requestId],
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

    const submitAction = useCallback(
        (action) => {
            if (!selectedActionRequest) return;

            const formData = new FormData();
            formData.append("group_id", activeGroup?.id || "");
            formData.append("comment", commentText);
            formData.append("action", action);

            setIsActionLoading(true);

            updateRequestStatusMutation.mutate(
                {
                    formData: formData,
                    requestId: selectedActionRequest?.id,
                },
                {
                    onSuccess: (msg) => {
                        message.success({
                            content: `Request ${action === "approve" ? "approved" : "rejected"} successfully!`,
                            icon:
                                action === "approve" ? (
                                    <CheckCircleOutlined />
                                ) : (
                                    <CloseCircleOutlined />
                                ),
                        });
                        setApproveModalVisible(false);
                        setRejectModalVisible(false);
                        setSelectedActionRequest(null);
                        setCommentText("");
                        refetchRequest();
                        // Set loading state to false on success
                        setIsActionLoading(false);
                    },
                    onError: (error) => {
                        console.log(error);
                        if (error.response?.data?.message) {
                            message.error(error.response.data.message);
                        } else {
                            message.error("Failed to update request status");
                        }
                        // Set loading state to false on error
                        setIsActionLoading(false);
                    },
                },
            );
        },
        [selectedActionRequest, commentText, refetchRequest, activeGroup?.id],
    );
    const viewRequestDetails = useCallback((request) => {
        setSelectedRequestDetails(request);
        setDetailDrawerVisible(true);
    }, []);

    const handleCloseDrawer = useCallback(() => {
        setDetailDrawerVisible(false);
        setSelectedRequestDetails(null);
    }, []);

    const handleBulkApprove = useCallback(() => {
        Modal.confirm({
            title: `Approve ${selectedRequests.length} request${selectedRequests.length !== 1 ? "s" : ""}?`,
            content: "This action will approve all selected requests.",
            okText: "Approve",
            okType: "primary",
            cancelText: "Cancel",
            onOk: () => {
                message.success(
                    `${selectedRequests.length} request${selectedRequests.length !== 1 ? "s" : ""} approved`,
                );
                setSelectedRequests([]);
                refetchRequest();
            },
        });
    }, [selectedRequests, refetchRequest]);

    const handleBulkReject = useCallback(() => {
        Modal.confirm({
            title: `Reject ${selectedRequests.length} request${selectedRequests.length !== 1 ? "s" : ""}?`,
            content: "This action will reject all selected requests.",
            okText: "Reject",
            okType: "danger",
            cancelText: "Cancel",
            onOk: () => {
                message.success(
                    `${selectedRequests.length} request${selectedRequests.length !== 1 ? "s" : ""} rejected`,
                );
                setSelectedRequests([]);
                refetchRequest();
            },
        });
    }, [selectedRequests, refetchRequest]);

    const handleBulkStar = useCallback(() => {
        selectedRequests.forEach((id) => toggleStar(id));
        message.success(
            `${selectedRequests.length} request${selectedRequests.length !== 1 ? "s" : ""} starred`,
        );
        setSelectedRequests([]);
    }, [selectedRequests, toggleStar]);

    const handleBulkDelete = useCallback(() => {
        Modal.confirm({
            title: `Delete ${selectedRequests.length} request${selectedRequests.length !== 1 ? "s" : ""}?`,
            content: "This action cannot be undone.",
            okText: "Delete",
            okType: "danger",
            cancelText: "Cancel",
            onOk: () => {
                setSelectedRequests([]);
                message.success(
                    `${selectedRequests.length} request${selectedRequests.length !== 1 ? "s" : ""} deleted`,
                );
                refetchRequest();
            },
        });
    }, [selectedRequests, refetchRequest]);

    const handleResetFilters = useCallback(() => {
        setSearchQuery("");
        setFilterStatus("all");
        setFilterType("all");
        setSortBy("recent");
        setRequestCurrentPage(1);
        refetchRequest();
        message.success("Filters reset");
    }, [refetchRequest]);

    return (
        <>
            <Card
                className="requests-inbox"
                title={
                    <div className="inbox-header">
                        <div className="inbox-title">
                            <div className="inbox-icon">
                                <InboxOutlined />
                            </div>
                            <div className="inbox-title-content">
                                <span className="inbox-title-text">
                                    Requests Inbox
                                </span>
                                <div className="inbox-subtitle">
                                    {isFetching ? (
                                        <Spin size="small" />
                                    ) : (
                                        `${pagination?.total || 0} total requests`
                                    )}
                                </div>
                            </div>
                        </div>
                        {/* <div className="inbox-header-actions">
                            <Tooltip title="Refresh">
                                <Button
                                    type="text"
                                    icon={<SyncOutlined spin={isFetching} />}
                                    onClick={() => refetchRequest()}
                                    loading={isFetching}
                                />
                            </Tooltip>
                            <Tooltip title="Print">
                                <Button
                                    type="text"
                                    icon={<PrinterOutlined />}
                                />
                            </Tooltip>
                            <Tooltip title="Share">
                                <Button
                                    type="text"
                                    icon={<ShareAltOutlined />}
                                />
                            </Tooltip>
                        </div> */}
                    </div>
                }
                extra={null}
            >
                {/* Filter Bar */}
                <div className="filter-bar-container">
                    <div className="filter-bar">
                        <div className="filter-left">
                            <div className="filter-toggle">
                                <Button
                                    icon={<FilterOutlined />}
                                    onClick={() => setShowFilters(!showFilters)}
                                    type={showFilters ? "primary" : "default"}
                                    className="filter-button"
                                >
                                    Filters
                                    {showFilters && (
                                        <span className="filter-badge">•</span>
                                    )}
                                </Button>
                            </div>
                            <div className="quick-filters">
                                <Button
                                    type={
                                        filterStatus === "all"
                                            ? "primary"
                                            : "text"
                                    }
                                    className={`quick-filter-btn ${filterStatus === "all" ? "active" : ""}`}
                                    onClick={() => setFilterStatus("all")}
                                >
                                    All
                                    {status_counts?.all && (
                                        <span className="filter-count">
                                            {status_counts.all}
                                        </span>
                                    )}
                                </Button>
                                <Button
                                    type={
                                        filterStatus === "pending"
                                            ? "primary"
                                            : "text"
                                    }
                                    className={`quick-filter-btn ${filterStatus === "pending" ? "active" : ""}`}
                                    onClick={() => setFilterStatus("pending")}
                                >
                                    Pending
                                    {status_counts?.pending > 0 && (
                                        <span className="filter-count">
                                            {status_counts.pending}
                                        </span>
                                    )}
                                </Button>
                                <Button
                                    type={
                                        filterStatus === "approved"
                                            ? "primary"
                                            : "text"
                                    }
                                    className={`quick-filter-btn ${filterStatus === "approved" ? "active" : ""}`}
                                    onClick={() => setFilterStatus("approved")}
                                >
                                    Approved
                                    {status_counts?.approved > 0 && (
                                        <span className="filter-count">
                                            {status_counts.approved}
                                        </span>
                                    )}
                                </Button>
                            </div>
                        </div>
                        <div className="filter-right">
                            <span className="pagination-info">
                                {pagination?.from || 0}-
                                {Math.min(
                                    (pagination?.from || 0) +
                                        (pagination?.per_page || 10) -
                                        1,
                                    pagination?.total || 0,
                                )}{" "}
                                of {pagination?.total || 0}
                            </span>
                            <Tooltip title="Reset filters">
                                <Button
                                    icon={<SyncOutlined />}
                                    onClick={handleResetFilters}
                                    size="small"
                                />
                            </Tooltip>
                        </div>
                    </div>

                    {/* Expandable Filters Panel */}
                    <AnimatePresence>
                        {showFilters && (
                            <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: "auto" }}
                                exit={{ opacity: 0, height: 0 }}
                                transition={{ duration: 0.2 }}
                                className="filters-panel expanded"
                            >
                                <div className="filters-grid">
                                    <div className="filter-item">
                                        <span className="filter-label">
                                            <SearchOutlined /> Search
                                        </span>
                                        <Input
                                            placeholder="Search by title, ID, or requester..."
                                            allowClear
                                            value={searchQuery}
                                            onChange={(e) =>
                                                setSearchQuery(e.target.value)
                                            }
                                            onPressEnter={() => {
                                                setRequestCurrentPage(1);
                                                refetchRequest();
                                            }}
                                            prefix={<SearchOutlined />}
                                            size="middle"
                                        />
                                    </div>
                                    <div className="filter-item">
                                        <span className="filter-label">
                                            <FilterOutlined /> Status
                                        </span>
                                        <Select
                                            value={filterStatus}
                                            onChange={setFilterStatus}
                                            style={{ width: "100%" }}
                                            size="middle"
                                            dropdownMatchSelectWidth={false}
                                        >
                                            <Option value="all">
                                                All Status
                                            </Option>
                                            <Option value="pending">
                                                Pending (
                                                {status_counts?.pending || 0})
                                            </Option>
                                            <Option value="approved">
                                                Approved (
                                                {status_counts?.approved || 0})
                                            </Option>
                                            <Option value="rejected">
                                                Rejected (
                                                {status_counts?.rejected || 0})
                                            </Option>
                                            <Option value="cancelled">
                                                Cancelled (
                                                {status_counts?.cancelled || 0})
                                            </Option>
                                        </Select>
                                    </div>
                                    <div className="filter-item">
                                        <span className="filter-label">
                                            <EnvironmentOutlined /> Type
                                        </span>
                                        <Select
                                            value={filterType}
                                            onChange={setFilterType}
                                            style={{ width: "100%" }}
                                            size="middle"
                                            dropdownMatchSelectWidth={false}
                                        >
                                            <Option value="all">
                                                All Types
                                            </Option>
                                            <Option value="leave">
                                                Leave ({type_counts?.leave || 0}
                                                )
                                            </Option>
                                            <Option value="travel">
                                                Travel (
                                                {type_counts?.travel || 0})
                                            </Option>
                                        </Select>
                                    </div>
                                    <div className="filter-item">
                                        <span className="filter-label">
                                            <SortAscendingOutlined /> Sort by
                                        </span>
                                        <Select
                                            value={sortBy}
                                            onChange={setSortBy}
                                            style={{ width: "100%" }}
                                            size="middle"
                                            dropdownMatchSelectWidth={false}
                                        >
                                            <Option value="recent">
                                                Newest first
                                            </Option>
                                            <Option value="oldest">
                                                Oldest first
                                            </Option>
                                            <Option value="name">
                                                Name (A-Z)
                                            </Option>
                                            <Option value="name_desc">
                                                Name (Z-A)
                                            </Option>
                                            <Option value="department">
                                                Department
                                            </Option>
                                        </Select>
                                    </div>
                                    <div className="filter-actions">
                                        <Button
                                            icon={<CloseOutlined />}
                                            onClick={() =>
                                                setShowFilters(false)
                                            }
                                        >
                                            Close
                                        </Button>
                                        <Button
                                            type="primary"
                                            onClick={() => {
                                                setRequestCurrentPage(1);
                                                refetchRequest();
                                                setShowFilters(false);
                                            }}
                                        >
                                            Apply Filters
                                        </Button>
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                {/* Inbox Toolbar */}
                <div className="inbox-toolbar">
                    <div className="toolbar-left">
                        {/* <Checkbox
                            indeterminate={
                                selectedRequests.length > 0 &&
                                selectedRequests.length < apiRequests.length
                            }
                            checked={
                                apiRequests.length > 0 &&
                                selectedRequests.length === apiRequests.length
                            }
                            onChange={toggleAllSelection}
                        /> */}
                        {/* <div className="selection-info">
                            {selectedRequests.length > 0 ? (
                                <span className="selected-count">
                                    {selectedRequests.length} selected
                                </span>
                            ) : (
                                <span className="select-all-hint">
                                    Select all
                                </span>
                            )}
                        </div> */}
                    </div>
                    <div className="toolbar-right">
                        {selectedRequests.length > 0 ? (
                            <div className="bulk-actions">
                                <Button
                                    icon={<CheckOutlined />}
                                    type="primary"
                                    onClick={handleBulkApprove}
                                    className="bulk-approve"
                                >
                                    Approve
                                </Button>
                                <Button
                                    icon={<CloseOutlined />}
                                    danger
                                    onClick={handleBulkReject}
                                    className="bulk-reject"
                                >
                                    Reject
                                </Button>
                                <Button
                                    icon={<StarOutlined />}
                                    onClick={handleBulkStar}
                                >
                                    Star
                                </Button>
                                <Button
                                    icon={<DeleteOutlined />}
                                    danger
                                    onClick={handleBulkDelete}
                                >
                                    Delete
                                </Button>
                            </div>
                        ) : (
                            <>
                                {!isApprover && (
                                    <Tooltip title="New request">
                                        <Button
                                            type="primary"
                                            icon={<FileTextOutlined />}
                                            onClick={() => setNewRequest(true)}
                                            //className="new-request-btn"
                                        >
                                            New Request
                                        </Button>
                                    </Tooltip>
                                )}
                            </>
                        )}
                    </div>
                </div>

                {/* Requests List */}
                <div className="requests-list-inbox">
                    {isFetching || isLoadingRequest ? (
                        <div className="loading-inbox">
                            <div className="loading-spinner" />
                            <h4>Loading requests...</h4>
                            <p>Please wait while we fetch your requests</p>
                            {/* Optional: Skeleton items for better UX */}
                            <div className="loading-skeleton">
                                {[1, 2, 3, 4, 5].map((item) => (
                                    <div key="{item}" className="skeleton-item">
                                        <div className="skeleton-checkbox" />
                                        <div className="skeleton-star" />
                                        <div className="skeleton-icon" />
                                        <div className="skeleton-content">
                                            <div className="skeleton-line line-lg" />
                                            <div className="skeleton-line line-md" />
                                        </div>
                                        <div className="skeleton-status" />
                                        <div className="skeleton-date" />
                                    </div>
                                ))}
                            </div>
                            {/* Alternative: Progress bar style */}{" "}
                            {false && (
                                <div className="loading-progress">
                                    <div className="progress-bar">
                                        <div className="progress-fill" />
                                    </div>
                                    <div className="progress-text">
                                        <span>Loading data...</span>
                                        <span>Please wait</span>
                                    </div>
                                </div>
                            )}
                        </div>
                    ) : apiRequests.length > 0 ? (
                        <div className="list-container">
                            <AnimatePresence>
                                {apiRequests.map((request, index) => (
                                    <RequestListItem
                                        key={request.id}
                                        request={request}
                                        isApprover={isApprover}
                                        index={index}
                                        isSelected={selectedRequests.includes(
                                            request.id,
                                        )}
                                        isStarred={starredRequests.includes(
                                            request.id,
                                        )}
                                        onToggleSelect={() =>
                                            toggleRequestSelection(request.id)
                                        }
                                        onToggleStar={() =>
                                            toggleStar(request.id)
                                        }
                                        onViewDetails={viewRequestDetails}
                                        onQuickAction={handleQuickAction}
                                        onOpenChat={openChat}
                                    />
                                ))}
                            </AnimatePresence>
                        </div>
                    ) : (
                        <div className="empty-inbox">
                            <motion.div
                                initial={{ scale: 0.9, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                transition={{ duration: 0.3 }}
                            >
                                <InboxOutlined />
                                <h4>No requests found</h4>
                                <p>
                                    Try adjusting your filters or search terms
                                </p>
                                <div className="empty-actions">
                                    <Button
                                        type="primary"
                                        onClick={() => setShowFilters(true)}
                                    >
                                        Adjust Filters
                                    </Button>
                                    <Button onClick={handleResetFilters}>
                                        Reset All
                                    </Button>
                                </div>
                            </motion.div>
                        </div>
                    )}
                </div>

                {/* Pagination Bar - Always Visible */}
                {apiRequests.length > 0 && (
                    <div className="pagination-bar">
                        <div className="pagination-left">
                            <span className="results-count">
                                Showing <strong>{pagination?.from || 0}</strong>{" "}
                                to{" "}
                                <strong>
                                    {Math.min(
                                        (pagination?.from || 0) +
                                            (pagination?.per_page || 10) -
                                            1,
                                        pagination?.total || 0,
                                    )}
                                </strong>{" "}
                                of <strong>{pagination?.total || 0}</strong>{" "}
                                results
                            </span>
                        </div>
                        <div className="pagination-right">
                            <Pagination
                                current={
                                    pagination.current || requestCurrentPage
                                }
                                pageSize={pagination.per_page || pageSize || 10}
                                total={pagination.total || 0}
                                onChange={handlePageChange}
                                showSizeChanger={false}
                                showQuickJumper={false}
                                showTotal={false}
                                disabled={isFetching}
                                // Remove the 'simple' prop entirely
                                // Add these for better UX
                                hideOnSinglePage={false} // Always show, even on single page
                                itemRender={(page, type, originalElement) => {
                                    if (type === "prev") {
                                        return (
                                            <Button
                                                type="text"
                                                icon={<LeftOutlined />}
                                                size="small"
                                            />
                                        );
                                    }
                                    if (type === "next") {
                                        return (
                                            <Button
                                                type="text"
                                                icon={<RightOutlined />}
                                                size="small"
                                            />
                                        );
                                    }
                                    return originalElement;
                                }}
                            />
                        </div>
                    </div>
                )}

                {apiRequests.length === 0 && (
                    <div className="pagination-bar">
                        <div className="pagination-left">
                            <span className="results-count">
                                {apiRequests.length > 0 ? (
                                    <>
                                        Showing{" "}
                                        <strong>{pagination?.from || 0}</strong>{" "}
                                        to{" "}
                                        <strong>
                                            {Math.min(
                                                (pagination?.from || 0) +
                                                    (pagination?.per_page ||
                                                        10) -
                                                    1,
                                                pagination?.total || 0,
                                            )}
                                        </strong>{" "}
                                        of{" "}
                                        <strong>
                                            {pagination?.total || 0}
                                        </strong>{" "}
                                        results
                                    </>
                                ) : (
                                    <>
                                        Showing <strong>0</strong> results
                                    </>
                                )}
                            </span>
                        </div>
                        <div className="pagination-right">
                            <Pagination
                                simple={{
                                    readOnly: true,
                                }}
                                current={
                                    pagination?.current ||
                                    requestCurrentPage ||
                                    1
                                }
                                defaultCurrent={1}
                                total={pagination?.total || 0}
                                pageSize={
                                    pagination?.per_page || pageSize || 10
                                }
                                onChange={handlePageChange}
                                disabled={isFetching}
                                showSizeChanger={false}
                                showQuickJumper={false}
                                hideOnSinglePage={false}
                            />
                        </div>
                    </div>
                )}
            </Card>

            {/* Details Drawer */}
            <RequestDetailsDrawer
                request={selectedRequestDetails}
                visible={detailDrawerVisible}
                onClose={handleCloseDrawer}
                onQuickAction={handleQuickAction}
                isApprover={isApprover}
                comments={comments}
            />

            {/* Action Modals */}
            {selectedActionRequest && (
                <>
                    <ActionModal
                        loading={loading}
                        action="approve"
                        request={selectedActionRequest}
                        visible={approveModalVisible}
                        comment={commentText}
                        onCommentChange={setCommentText}
                        onCancel={() => {
                            setApproveModalVisible(false);
                            setSelectedActionRequest(null);
                            setCommentText("");
                        }}
                        onSubmit={() => submitAction("approve")}
                    />
                    <ActionModal
                        loading={loading}
                        action="reject"
                        request={selectedActionRequest}
                        visible={rejectModalVisible}
                        comment={commentText}
                        onCommentChange={setCommentText}
                        onCancel={() => {
                            setRejectModalVisible(false);
                            setSelectedActionRequest(null);
                            setCommentText("");
                        }}
                        onSubmit={() => submitAction("reject")}
                    />
                </>
            )}
        </>
    );
};

export default memo(RequestList);
