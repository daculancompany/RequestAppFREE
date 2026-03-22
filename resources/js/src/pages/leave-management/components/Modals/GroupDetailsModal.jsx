import React, { useState, useEffect, useMemo, useCallback } from "react";
import {
    Modal,
    Avatar,
    Card,
    Row,
    Col,
    Descriptions,
    Divider,
    Button,
    Tag,
    Space,
    Image,
    Tabs,
    Badge,
    Statistic,
    Table,
    Dropdown,
    Menu,
    Input,
    Select,
    DatePicker,
    Tooltip,
    Skeleton,
    Empty,
    message,
    Progress,
} from "antd";
import {
    TeamOutlined,
    CalendarOutlined,
    EnvironmentOutlined,
    DownloadOutlined,
    SettingOutlined,
    FilterOutlined,
    SearchOutlined,
    EyeOutlined,
    FileTextOutlined,
    CheckCircleOutlined,
    ClockCircleOutlined,
    CloseCircleOutlined,
    MoreOutlined,
    MailOutlined,
    MessageOutlined,
    SafetyCertificateOutlined,
    IdcardOutlined,
    PlusOutlined,
    ReloadOutlined,
    InfoCircleOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import RequestModal from "./RequestModal";
import useMobile from "@/hooks/useMobile";

dayjs.extend(relativeTime);

const { TabPane } = Tabs;
const { Search } = Input;
const { Option } = Select;
const { RangePicker } = DatePicker;

const GroupDetailsModal = ({
    selectedGroup,
    onClose,
    allRequests = [],
    isLoading = false,
    currentUser,
}) => {
    const isMobile = useMobile();
    const [activeTab, setActiveTab] = useState("requests");
    const [requestModalVisible, setRequestModalVisible] = useState(false);
    const [selectedRequestType, setSelectedRequestType] = useState(null);
    const [searchText, setSearchText] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");
    const [typeFilter, setTypeFilter] = useState("all");
    const [dateRange, setDateRange] = useState(null);

    // Memoized helper functions
    const getInitials = useCallback((name) => {
        if (!name) return "?";
        return name
            .split(" ")
            .map((n) => n[0])
            .join("")
            .toUpperCase()
            .slice(0, 2);
    }, []);

    const getGroupImageUrl = useCallback(() => {
        if (!selectedGroup?.group_image) return null;
        return `/storage/${selectedGroup.group_image}`;
    }, [selectedGroup?.group_image]);

    const generateGradient = useCallback((color) => {
        return `linear-gradient(135deg, ${color}20, ${color}40)`;
    }, []);

    // Memoized filtered requests with dependencies
    const filteredRequests = useMemo(() => {
        if (!selectedGroup) return [];
        
        return allRequests.filter((request) => {
            if (request.group_id !== selectedGroup.id) return false;

            if (
                searchText &&
                !request.employee_name
                    ?.toLowerCase()
                    .includes(searchText.toLowerCase()) &&
                !request.request_id
                    ?.toLowerCase()
                    .includes(searchText.toLowerCase())
            ) {
                return false;
            }

            if (statusFilter !== "all" && request.status !== statusFilter)
                return false;

            if (typeFilter !== "all") {
                if (
                    typeFilter === "leave" &&
                    request.request_type !== "leave_of_office"
                )
                    return false;
                if (
                    typeFilter === "travel" &&
                    request.request_type !== "travel_order"
                )
                    return false;
            }

            if (dateRange && dateRange[0] && dateRange[1]) {
                const requestDate = dayjs(request.created_at);
                if (
                    !requestDate.isBetween(dateRange[0], dateRange[1], "day", "[]")
                ) {
                    return false;
                }
            }

            return true;
        });
    }, [allRequests, selectedGroup, searchText, statusFilter, typeFilter, dateRange]);

    // Memoized tab configuration
    const tabs = useMemo(() => [
        {
            key: "requests",
            icon: <FileTextOutlined />,
            label: "Requests",
            badge: filteredRequests?.length || 0,
        },
        {
            key: "members",
            icon: <TeamOutlined />,
            label: "Members",
            badge: selectedGroup?.members?.length || 0,
        },
        {
            key: "approvers",
            icon: <SafetyCertificateOutlined />,
            label: "Approvers",
            badge: selectedGroup?.approvers?.length || 0,
        },
        {
            key: "signatories",
            icon: <IdcardOutlined />,
            label: "Signatories",
            badge: selectedGroup?.signatories?.length || 0,
        },
        {
            key: "settings",
            icon: <SettingOutlined />,
            label: "Settings",
            badge: null,
        },
    ], [filteredRequests.length, selectedGroup?.members?.length, selectedGroup?.approvers?.length, selectedGroup?.signatories?.length]);

    // Memoized statistics
    const statistics = useMemo(() => {
        const totalRequests = filteredRequests.length;
        const pendingRequests = filteredRequests.filter(
            (r) => r.status === "pending",
        ).length;
        const approvedRequests = filteredRequests.filter(
            (r) => r.status === "approved",
        ).length;
        const rejectedRequests = filteredRequests.filter(
            (r) => r.status === "rejected",
        ).length;

        return {
            totalRequests,
            pendingRequests,
            approvedRequests,
            rejectedRequests,
        };
    }, [filteredRequests]);

    // Memoized status tag configuration
    const statusConfig = useMemo(() => ({
        pending: {
            color: "orange",
            icon: <ClockCircleOutlined />,
            text: "PENDING",
        },
        approved: {
            color: "green",
            icon: <CheckCircleOutlined />,
            text: "APPROVED",
        },
        rejected: {
            color: "red",
            icon: <CloseCircleOutlined />,
            text: "REJECTED",
        },
    }), []);

    // Memoized request type tag configuration
    const typeConfig = useMemo(() => ({
        leave_of_office: {
            color: "blue",
            icon: <CalendarOutlined />,
            text: "LEAVE",
        },
        travel_order: {
            color: "purple",
            icon: <EnvironmentOutlined />,
            text: "TRAVEL",
        },
    }), []);

    // Memoized render functions
    const renderStatusTag = useCallback((status) => {
        const config = statusConfig[status] || statusConfig.pending;

        return (
            <Tag
                color={config.color}
                icon={config.icon}
                style={{
                    fontWeight: 600,
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 4,
                    padding: "2px 8px",
                }}
            >
                {config.text}
            </Tag>
        );
    }, [statusConfig]);

    const renderTypeTag = useCallback((type) => {
        const config = typeConfig[type] || { color: "default", text: type };

        return (
            <Tag
                color={config.color}
                icon={config.icon}
                style={{
                    fontWeight: 600,
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 4,
                    padding: "2px 8px",
                }}
            >
                {config.text}
            </Tag>
        );
    }, [typeConfig]);

    // Memoized table columns
    const columns = useMemo(() => {
        const baseColumns = [
            {
                title: "Request ID",
                dataIndex: "request_id",
                key: "request_id",
                width: isMobile ? 100 : 140,
                render: (text) => (
                    <span
                        style={{
                            fontFamily: "monospace",
                            fontWeight: 600,
                            color: selectedGroup?.group_color,
                            fontSize: isMobile ? "11px" : "inherit",
                        }}
                    >
                        {text}
                    </span>
                ),
            },
            {
                title: "Employee",
                dataIndex: "employee_name",
                key: "employee_name",
                width: isMobile ? 120 : 180,
                render: (text, record) => (
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <Avatar
                            size={isMobile ? "small" : "default"}
                            style={{
                                background: generateGradient(selectedGroup?.group_color),
                                color: selectedGroup?.group_color,
                                fontSize: isMobile ? "10px" : "inherit",
                            }}
                        >
                            {getInitials(text)}
                        </Avatar>
                        <div>
                            <div
                                style={{
                                    fontWeight: 500,
                                    fontSize: isMobile ? "12px" : "inherit",
                                }}
                            >
                                {isMobile ? text.split(" ")[0] : text}
                            </div>
                            {!isMobile && (
                                <small
                                    style={{
                                        color: "var(--text-secondary)",
                                        fontSize: 11,
                                    }}
                                >
                                    {record.employee_id}
                                </small>
                            )}
                        </div>
                    </div>
                ),
            },
            {
                title: "Type",
                dataIndex: "request_type",
                key: "request_type",
                width: isMobile ? 80 : 100,
                render: (type) => {
                    const tag = renderTypeTag(type);
                    return isMobile ? (
                        <Tooltip title={tag.props.children}>
                            <div style={{ display: "inline-block" }}>
                                {React.cloneElement(tag, {
                                    style: {
                                        ...tag.props.style,
                                        padding: "2px 4px",
                                        fontSize: "10px",
                                    },
                                })}
                            </div>
                        </Tooltip>
                    ) : (
                        tag
                    );
                },
            },
            ...(isMobile
                ? []
                : [
                      {
                          title: "Details",
                          key: "details",
                          width: 200,
                          render: (_, record) => {
                              if (record.request_type === "leave_of_office") {
                                  return (
                                      <div>
                                          <div style={{ fontWeight: 500 }}>
                                              {record.leave_type
                                                  ?.replace("_", " ")
                                                  .toUpperCase()}
                                          </div>
                                          <div
                                              style={{
                                                  fontSize: 12,
                                                  color: "var(--text-secondary)",
                                              }}
                                          >
                                              {record.reason?.substring(0, 50)}
                                              {record.reason?.length > 50
                                                  ? "..."
                                                  : ""}
                                          </div>
                                      </div>
                                  );
                              } else {
                                  return (
                                      <div>
                                          <div style={{ fontWeight: 500 }}>
                                              {record.place_of_travel}
                                          </div>
                                          <div
                                              style={{
                                                  fontSize: 12,
                                                  color: "var(--text-secondary)",
                                              }}
                                          >
                                              {record.purpose?.substring(0, 50)}
                                              {record.purpose?.length > 50
                                                  ? "..."
                                                  : ""}
                                          </div>
                                      </div>
                                  );
                              }
                          },
                      },
                      {
                          title: "Dates",
                          key: "dates",
                          width: 150,
                          render: (_, record) => {
                              if (record.request_type === "leave_of_office") {
                                  return (
                                      <div>
                                          <div
                                              style={{
                                                  fontWeight: 500,
                                                  fontSize: "12px",
                                              }}
                                          >
                                              {dayjs(record.start_date).format(
                                                  "MMM DD",
                                              )}
                                          </div>
                                          <div
                                              style={{
                                                  fontSize: 11,
                                                  color: "var(--text-secondary)",
                                              }}
                                          >
                                              {record.time_out} -{" "}
                                              {record.expected_time_in}
                                          </div>
                                      </div>
                                  );
                              } else {
                                  return (
                                      <div>
                                          <div
                                              style={{
                                                  fontWeight: 500,
                                                  fontSize: "12px",
                                              }}
                                          >
                                                  {dayjs(record.start_date).format(
                                                      "MMM DD",
                                                  )}{" "}
                                                  -{" "}
                                                  {dayjs(record.end_date).format(
                                                      "MMM DD",
                                                  )}
                                          </div>
                                          <div
                                              style={{
                                                  fontSize: 11,
                                                  color: "var(--text-secondary)",
                                              }}
                                          >
                                                  {record.total_days || record.duration}{" "}
                                                  day(s)
                                          </div>
                                      </div>
                                  );
                              }
                          },
                      },
                  ]),
            {
                title: "Status",
                dataIndex: "status",
                key: "status",
                width: isMobile ? 90 : 120,
                render: (status) => {
                    const tag = renderStatusTag(status);
                    return isMobile ? (
                        <Tooltip title={tag.props.children}>
                            <div style={{ display: "inline-block" }}>
                                {React.cloneElement(tag, {
                                    style: {
                                        ...tag.props.style,
                                        padding: "2px 4px",
                                        fontSize: "10px",
                                    },
                                })}
                            </div>
                        </Tooltip>
                    ) : (
                        tag
                    );
                },
            },
            ...(isMobile
                ? []
                : [
                      {
                          title: "Submitted",
                          dataIndex: "created_at",
                          key: "created_at",
                          width: 100,
                          render: (date) => (
                              <div>
                                  <div style={{ fontSize: 12 }}>
                                      {dayjs(date).format("MMM DD")}
                                  </div>
                                  <div
                                      style={{
                                          fontSize: 11,
                                          color: "var(--text-secondary)",
                                      }}
                                  >
                                      {dayjs(date).format("HH:mm")}
                                  </div>
                              </div>
                          ),
                      },
                  ]),
            {
                title: "Actions",
                key: "actions",
                width: isMobile ? 60 : 100,
                render: (_, record) => (
                    <Space size={isMobile ? 2 : 8}>
                        <Tooltip title="View Details">
                            <Button
                                size={isMobile ? "small" : "middle"}
                                icon={
                                    <EyeOutlined
                                        style={{
                                            fontSize: isMobile ? "12px" : "inherit",
                                        }}
                                    />
                                }
                                onClick={() =>
                                    message.info(
                                        `Viewing request ${record.request_id}`,
                                    )
                                }
                            />
                        </Tooltip>
                        {!isMobile && (
                            <Dropdown
                                menu={{
                                    items: [
                                        {
                                            key: "view",
                                            icon: <EyeOutlined />,
                                            label: "View Details",
                                        },
                                        {
                                            key: "message",
                                            icon: <MessageOutlined />,
                                            label: "Send Message",
                                        },
                                        { type: "divider" },
                                        {
                                            key: "approve",
                                            icon: <CheckCircleOutlined />,
                                            label: "Approve",
                                        },
                                        {
                                            key: "reject",
                                            icon: <CloseCircleOutlined />,
                                            label: "Reject",
                                        },
                                    ],
                                }}
                                trigger={["click"]}
                            >
                                <Button size="small" icon={<MoreOutlined />} />
                            </Dropdown>
                        )}
                    </Space>
                ),
            },
        ];

        return baseColumns;
    }, [isMobile, selectedGroup?.group_color, generateGradient, getInitials, renderTypeTag, renderStatusTag]);

    // Memoized renderTabLabel function
    const renderTabLabel = useCallback((tab) => {
        if (isMobile) {
            return (
                <div style={{ position: "relative", padding: "8px 4px" }}>
                    {tab.icon}
                    {tab.badge && tab.badge > 0 && (
                        <Badge
                            count={tab.badge}
                            size="small"
                            style={{
                                position: "absolute",
                                top: 0,
                                right: 0,
                                transform: "translate(50%, -50%)",
                                backgroundColor:
                                    tab.key === "requests"
                                        ? selectedGroup?.group_color
                                        : "#1890ff",
                            }}
                        />
                    )}
                </div>
            );
        }

        return (
            <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
                {tab.icon}
                {tab.label}
                {tab.badge && tab.badge > 0 && (
                    <Badge
                        count={tab.badge}
                        style={{
                            marginLeft: 4,
                            backgroundColor:
                                tab.key === "requests"
                                    ? selectedGroup?.group_color
                                    : "#1890ff",
                        }}
                    />
                )}
            </span>
        );
    }, [isMobile, selectedGroup?.group_color]);

    // Event handlers with useCallback
    const handleRequestSubmit = useCallback((requestData) => {
        console.log("Request submitted:", requestData);
        message.success("Request submitted successfully!");
        setRequestModalVisible(false);
    }, []);

    const handleNewRequest = useCallback((type) => {
        setSelectedRequestType(type);
        setRequestModalVisible(true);
    }, []);

    const handleResetFilters = useCallback(() => {
        setSearchText("");
        setStatusFilter("all");
        setTypeFilter("all");
        setDateRange(null);
    }, []);

    // Memoized modal title
    const modalTitle = useMemo(() => {
        if (!selectedGroup) return null;
        
        return (
            <div
                style={{
                    display: "flex",
                    alignItems: "center",
                    gap: isMobile ? 8 : 16,
                    padding: "8px 0",
                }}
            >
                <div style={{ flexShrink: 0 }}>
                    {getGroupImageUrl() ? (
                        <Avatar
                            size={isMobile ? 36 : 48}
                            src={getGroupImageUrl()}
                            shape="square"
                            style={{
                                borderRadius: 8,
                                border: `3px solid ${selectedGroup.group_color}30`,
                            }}
                        />
                    ) : (
                        <div
                            style={{
                                background: generateGradient(selectedGroup.group_color),
                                border: `3px solid ${selectedGroup.group_color}30`,
                                borderRadius: 8,
                                width: isMobile ? 36 : 48,
                                height: isMobile ? 36 : 48,
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                color: selectedGroup.group_color,
                                fontSize: isMobile ? 14 : 20,
                                fontWeight: "bold",
                            }}
                        >
                            {getInitials(selectedGroup.group_name)}
                        </div>
                    )}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                    <div
                        style={{
                            display: "flex",
                            alignItems: "center",
                            gap: isMobile ? 4 : 8,
                            marginBottom: 4,
                            flexWrap: "wrap",
                        }}
                    >
                        <h2
                            style={{
                                margin: 0,
                                fontSize: isMobile ? 16 : 20,
                                fontWeight: 600,
                                color: "white",
                                lineHeight: 1.2,
                            }}
                        >
                            {selectedGroup.group_name}
                        </h2>
                        <Tag
                            color={selectedGroup.group_color}
                            style={{
                                border: `1px solid ${selectedGroup.group_color}40`,
                                background: `${selectedGroup.group_color}15`,
                                fontWeight: 600,
                                fontSize: isMobile ? 9 : 11,
                                marginTop: isMobile ? 2 : 0,
                            }}
                        >
                            {selectedGroup.group_code}
                        </Tag>
                    </div>
                    {!isMobile && (
                        <div
                            style={{
                                display: "flex",
                                alignItems: "center",
                                gap: 12,
                                flexWrap: "wrap",
                            }}
                        >
                            <span
                                style={{
                                    color: "rgba(255, 255, 255, 0.85)",
                                    fontSize: 13,
                                    display: "flex",
                                    alignItems: "center",
                                    gap: 4,
                                }}
                            >
                                <TeamOutlined />
                                {selectedGroup.members?.length || 0} members
                            </span>
                            <span
                                style={{
                                    color: "rgba(255, 255, 255, 0.85)",
                                    fontSize: 13,
                                    display: "flex",
                                    alignItems: "center",
                                    gap: 4,
                                }}
                            >
                                <FileTextOutlined />
                                {statistics.totalRequests} requests
                            </span>
                        </div>
                    )}
                </div>
            </div>
        );
    }, [selectedGroup, isMobile, getGroupImageUrl, generateGradient, getInitials, statistics.totalRequests]);

    if (!selectedGroup) return null;

    return (
        <>
            <Modal
                title={modalTitle}
                open={!!selectedGroup}
                onCancel={onClose}
                width={isMobile ? "95%" : 1400}
                footer={null}
                className="group-details-modal"
                style={{ top: isMobile ? 10 : 20 }}
            >
                {isLoading ? (
                    <Skeleton active />
                ) : (
                    <div style={{ padding: isMobile ? 12 : 24 }}>
                        <Tabs
                            activeKey={activeTab}
                            onChange={setActiveTab}
                            style={{ marginBottom: 16 }}
                            type={isMobile ? "card" : "line"}
                            size={isMobile ? "small" : "middle"}
                        >
                            {tabs.map((tab) => (
                                <TabPane
                                    key={tab.key}
                                    tab={renderTabLabel(tab)}
                                >
                                    {/* Content for each tab - requests tab is the most expensive, so it's conditionally rendered */}
                                    {tab.key === "requests" && (
                                        <RequestsTabContent
                                            isMobile={isMobile}
                                            statistics={statistics}
                                            selectedGroup={selectedGroup}
                                            searchText={searchText}
                                            setSearchText={setSearchText}
                                            statusFilter={statusFilter}
                                            setStatusFilter={setStatusFilter}
                                            typeFilter={typeFilter}
                                            setTypeFilter={setTypeFilter}
                                            dateRange={dateRange}
                                            setDateRange={setDateRange}
                                            handleResetFilters={handleResetFilters}
                                            handleNewRequest={handleNewRequest}
                                            filteredRequests={filteredRequests}
                                            columns={columns}
                                            generateGradient={generateGradient}
                                        />
                                    )}

                                    {tab.key === "members" && (
                                        <MembersTabContent
                                            isMobile={isMobile}
                                            selectedGroup={selectedGroup}
                                            getInitials={getInitials}
                                            generateGradient={generateGradient}
                                        />
                                    )}

                                    {tab.key === "approvers" && (
                                        <ApproversTabContent
                                            isMobile={isMobile}
                                            selectedGroup={selectedGroup}
                                            getInitials={getInitials}
                                            generateGradient={generateGradient}
                                        />
                                    )}

                                    {tab.key === "signatories" && (
                                        <SignatoriesTabContent
                                            isMobile={isMobile}
                                            selectedGroup={selectedGroup}
                                            getInitials={getInitials}
                                        />
                                    )}

                                    {tab.key === "settings" && (
                                        <SettingsTabContent
                                            isMobile={isMobile}
                                            selectedGroup={selectedGroup}
                                            getGroupImageUrl={getGroupImageUrl}
                                        />
                                    )}
                                </TabPane>
                            ))}
                        </Tabs>
                    </div>
                )}
            </Modal>

            <RequestModal
                visible={requestModalVisible}
                onCancel={() => {
                    setRequestModalVisible(false);
                    setSelectedRequestType(null);
                }}
                onSubmit={handleRequestSubmit}
                user={currentUser}
                approver={selectedGroup?.approvers?.[0]?.name || "Group Approver"}
                initialType={selectedRequestType}
            />
        </>
    );
};

// Extracted components for better readability and performance
const RequestsTabContent = React.memo(({
    isMobile,
    statistics,
    selectedGroup,
    searchText,
    setSearchText,
    statusFilter,
    setStatusFilter,
    typeFilter,
    setTypeFilter,
    dateRange,
    setDateRange,
    handleResetFilters,
    handleNewRequest,
    filteredRequests,
    columns,
    generateGradient,
}) => (
    <>
        {!isMobile && (
            <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
                <Col span={6}>
                    <Card size="small" style={{ borderRadius: 8 }}>
                        <Statistic
                            title="Total"
                            value={statistics.totalRequests}
                            valueStyle={{
                                color: selectedGroup.group_color,
                                fontSize: 28,
                            }}
                            prefix={<FileTextOutlined />}
                        />
                    </Card>
                </Col>
                <Col span={6}>
                    <Card size="small" style={{ borderRadius: 8 }}>
                        <Statistic
                            title="Pending"
                            value={statistics.pendingRequests}
                            valueStyle={{
                                color: "#faad14",
                                fontSize: 28,
                            }}
                            prefix={<ClockCircleOutlined />}
                        />
                    </Card>
                </Col>
                <Col span={6}>
                    <Card size="small" style={{ borderRadius: 8 }}>
                        <Statistic
                            title="Approved"
                            value={statistics.approvedRequests}
                            valueStyle={{
                                color: "#52c41a",
                                fontSize: 28,
                            }}
                            prefix={<CheckCircleOutlined />}
                        />
                    </Card>
                </Col>
                <Col span={6}>
                    <Card size="small" style={{ borderRadius: 8 }}>
                        <Statistic
                            title="Rejected"
                            value={statistics.rejectedRequests}
                            valueStyle={{
                                color: "#ff4d4f",
                                fontSize: 28,
                            }}
                            prefix={<CloseCircleOutlined />}
                        />
                    </Card>
                </Col>
            </Row>
        )}

        <Card
            size="small"
            style={{
                marginBottom: 16,
                borderRadius: 8,
            }}
            bodyStyle={{
                padding: isMobile ? "8px" : "12px 16px",
            }}
        >
            <Row gutter={[8, 8]} align="middle">
                <Col xs={24} md={isMobile ? 24 : 8}>
                    <Search
                        placeholder="Search..."
                        value={searchText}
                        onChange={(e) => setSearchText(e.target.value)}
                        prefix={<SearchOutlined />}
                        allowClear
                        size={isMobile ? "small" : "middle"}
                    />
                </Col>
                {!isMobile && (
                    <>
                        <Col xs={12} md={4}>
                            <Select
                                placeholder="Status"
                                value={statusFilter}
                                onChange={setStatusFilter}
                                style={{ width: "100%" }}
                                suffixIcon={<FilterOutlined />}
                                size="small"
                            >
                                <Option value="all">All Status</Option>
                                <Option value="pending">Pending</Option>
                                <Option value="approved">Approved</Option>
                                <Option value="rejected">Rejected</Option>
                            </Select>
                        </Col>
                        <Col xs={12} md={4}>
                            <Select
                                placeholder="Type"
                                value={typeFilter}
                                onChange={setTypeFilter}
                                style={{ width: "100%" }}
                                suffixIcon={<FilterOutlined />}
                                size="small"
                            >
                                <Option value="all">All Types</Option>
                                <Option value="leave">Leave</Option>
                                <Option value="travel">Travel</Option>
                            </Select>
                        </Col>
                        <Col xs={24} md={6}>
                            <RangePicker
                                value={dateRange}
                                onChange={setDateRange}
                                style={{ width: "100%" }}
                                placeholder={["Start", "End"]}
                                size="small"
                            />
                        </Col>
                        <Col xs={24} md={2}>
                            <Button
                                icon={<ReloadOutlined />}
                                onClick={handleResetFilters}
                                block
                                size="small"
                            >
                                Reset
                            </Button>
                        </Col>
                    </>
                )}
            </Row>
        </Card>

        <div
            style={{
                marginBottom: 16,
                display: "flex",
                gap: 8,
                alignItems: "center",
                flexWrap: isMobile ? "wrap" : "nowrap",
            }}
        >
            <Button
                type="primary"
                icon={<CalendarOutlined />}
                onClick={() => handleNewRequest("leave")}
                style={{
                    background: selectedGroup.group_color,
                    borderColor: selectedGroup.group_color,
                    flex: isMobile ? 1 : "none",
                }}
                size={isMobile ? "small" : "middle"}
            >
                {isMobile ? "Leave" : "New Leave Request"}
            </Button>
            <Button
                type="primary"
                icon={<EnvironmentOutlined />}
                onClick={() => handleNewRequest("travel")}
                style={{
                    background: selectedGroup.group_color,
                    borderColor: selectedGroup.group_color,
                    opacity: 0.9,
                    flex: isMobile ? 1 : "none",
                }}
                size={isMobile ? "small" : "middle"}
            >
                {isMobile ? "Travel" : "New Travel Request"}
            </Button>
            {!isMobile && (
                <>
                    <Button icon={<DownloadOutlined />} size="small">
                        Export
                    </Button>
                    <div style={{ marginLeft: "auto" }}>
                        <Tooltip title="Settings">
                            <Button icon={<SettingOutlined />} size="small" />
                        </Tooltip>
                    </div>
                </>
            )}
        </div>

        <Card
            style={{
                borderRadius: 8,
                overflow: "hidden",
            }}
            bodyStyle={{ padding: 0 }}
        >
            {filteredRequests.length > 0 ? (
                <Table
                    dataSource={filteredRequests}
                    columns={columns}
                    rowKey="id"
                    size={isMobile ? "small" : "middle"}
                    pagination={{
                        pageSize: isMobile ? 5 : 10,
                        showSizeChanger: !isMobile,
                        showQuickJumper: !isMobile,
                        showTotal: !isMobile
                            ? (total) => `Total ${total} requests`
                            : false,
                        simple: isMobile,
                        size: isMobile ? "small" : "default",
                    }}
                    scroll={{
                        x: isMobile ? 600 : 1200,
                    }}
                />
            ) : (
                <Empty
                    image={Empty.PRESENTED_IMAGE_SIMPLE}
                    description="No requests found"
                    style={{ padding: 40 }}
                >
                    <Button
                        type="primary"
                        onClick={() => handleNewRequest("leave")}
                        size={isMobile ? "small" : "middle"}
                    >
                        Create New Request
                    </Button>
                </Empty>
            )}
        </Card>
    </>
));

const MembersTabContent = React.memo(({
    isMobile,
    selectedGroup,
    getInitials,
    generateGradient,
}) => (
    <Card
        title={isMobile ? null : "Group Members"}
        style={{ borderRadius: 8 }}
        extra={
            !isMobile && (
                <Button size="small" icon={<PlusOutlined />}>
                    Add Member
                </Button>
            )
        }
    >
        <Row gutter={[8, 8]}>
            {selectedGroup.members?.map((member) => (
                <Col xs={24} sm={12} md={8} lg={6} key={member.id}>
                    <Card
                        hoverable
                        size="small"
                        style={{
                            borderRadius: 8,
                            height: "100%",
                        }}
                    >
                        <div
                            style={{
                                display: "flex",
                                alignItems: "center",
                                gap: isMobile ? 8 : 12,
                                marginBottom: isMobile ? 8 : 12,
                            }}
                        >
                            <Avatar
                                size={isMobile ? 36 : 48}
                                style={{
                                    background: generateGradient(selectedGroup.group_color),
                                    color: selectedGroup.group_color,
                                    fontWeight: "bold",
                                    fontSize: isMobile ? "12px" : "inherit",
                                }}
                            >
                                {getInitials(member.name)}
                            </Avatar>
                            <div style={{ flex: 1, minWidth: 0 }}>
                                <div
                                    style={{
                                        margin: 0,
                                        fontSize: isMobile ? 12 : 14,
                                        fontWeight: 600,
                                    }}
                                >
                                    {isMobile
                                        ? member.name.split(" ")[0]
                                        : member.name}
                                </div>
                                {!isMobile && (
                                    <div
                                        style={{
                                            margin: 0,
                                            color: "var(--text-secondary)",
                                            fontSize: 12,
                                        }}
                                    >
                                        {member.email}
                                    </div>
                                )}
                                <div style={{ marginTop: 4 }}>
                                    {selectedGroup.approvers?.some(
                                        (a) => a.id === member.id,
                                    ) && (
                                        <Tag
                                            size="small"
                                            color="blue"
                                            style={{
                                                fontSize: isMobile ? 9 : 10,
                                            }}
                                        >
                                            Approver
                                        </Tag>
                                    )}
                                    {selectedGroup.signatories?.some(
                                        (s) => s.id === member.id,
                                    ) && (
                                        <Tag
                                            size="small"
                                            color="green"
                                            style={{
                                                fontSize: isMobile ? 9 : 10,
                                            }}
                                        >
                                            Signatory
                                        </Tag>
                                    )}
                                </div>
                            </div>
                        </div>

                        {!isMobile && (
                            <>
                                <Divider style={{ margin: "12px 0" }} />
                                <Space>
                                    <Button
                                        size="small"
                                        icon={<MessageOutlined />}
                                        onClick={() =>
                                            message.info(`Message ${member.name}`)
                                        }
                                    >
                                        Message
                                    </Button>
                                    <Button
                                        size="small"
                                        icon={<MailOutlined />}
                                        onClick={() =>
                                            message.info(`Email ${member.email}`)
                                        }
                                    >
                                        Email
                                    </Button>
                                </Space>
                            </>
                        )}
                    </Card>
                </Col>
            ))}
        </Row>
    </Card>
));

const ApproversTabContent = React.memo(({
    isMobile,
    selectedGroup,
    getInitials,
    generateGradient,
}) => (
    <Card
        title={isMobile ? null : "Group Approvers"}
        style={{ borderRadius: 8 }}
        extra={
            !isMobile && (
                <Button size="small" icon={<PlusOutlined />}>
                    Add Approver
                </Button>
            )
        }
    >
        {selectedGroup.approvers?.length > 0 ? (
            <Row gutter={[8, 8]}>
                {selectedGroup.approvers?.map((approver) => (
                    <Col xs={24} sm={12} md={8} lg={6} key={approver.id}>
                        <Card
                            hoverable
                            size="small"
                            style={{
                                borderRadius: 8,
                                height: "100%",
                                borderLeft: `4px solid ${selectedGroup.group_color}`,
                            }}
                        >
                            <div
                                style={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: isMobile ? 8 : 12,
                                    marginBottom: isMobile ? 8 : 12,
                                }}
                            >
                                <Avatar
                                    size={isMobile ? 36 : 48}
                                    style={{
                                        background: generateGradient(selectedGroup.group_color),
                                        color: selectedGroup.group_color,
                                        fontWeight: "bold",
                                        fontSize: isMobile ? "12px" : "inherit",
                                    }}
                                >
                                    {getInitials(approver.name)}
                                </Avatar>
                                <div style={{ flex: 1, minWidth: 0 }}>
                                    <div
                                        style={{
                                            margin: 0,
                                            fontSize: isMobile ? 12 : 14,
                                            fontWeight: 600,
                                            color: selectedGroup.group_color,
                                        }}
                                    >
                                        {isMobile
                                            ? approver.name.split(" ")[0]
                                            : approver.name}
                                    </div>
                                    {!isMobile && (
                                        <div
                                            style={{
                                                margin: 0,
                                                color: "var(--text-secondary)",
                                                fontSize: 12,
                                            }}
                                        >
                                            {approver.email}
                                        </div>
                                    )}
                                    <Tag
                                        color="blue"
                                        icon={<SafetyCertificateOutlined />}
                                        style={{
                                            marginTop: 4,
                                            fontSize: isMobile ? 9 : "inherit",
                                        }}
                                    >
                                        Approver
                                    </Tag>
                                </div>
                            </div>
                        </Card>
                    </Col>
                ))}
            </Row>
        ) : (
            <Empty
                description="No approvers assigned"
                image={Empty.PRESENTED_IMAGE_SIMPLE}
            >
                <Button
                    type="primary"
                    icon={<PlusOutlined />}
                    size={isMobile ? "small" : "middle"}
                >
                    Add Approver
                </Button>
            </Empty>
        )}
    </Card>
));

const SignatoriesTabContent = React.memo(({
    isMobile,
    selectedGroup,
    getInitials,
}) => (
    <Card
        title={isMobile ? null : "Group Signatories"}
        style={{ borderRadius: 8 }}
        extra={
            !isMobile && (
                <Button size="small" icon={<PlusOutlined />}>
                    Add Signatory
                </Button>
            )
        }
    >
        {selectedGroup.signatories?.length > 0 ? (
            <Row gutter={[8, 8]}>
                {selectedGroup.signatories?.map((signatory) => (
                    <Col xs={24} sm={12} md={8} lg={6} key={signatory.id}>
                        <Card
                            hoverable
                            size="small"
                            style={{
                                borderRadius: 8,
                                height: "100%",
                                borderLeft: `4px solid #52c41a`,
                            }}
                        >
                            <div
                                style={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: isMobile ? 8 : 12,
                                    marginBottom: isMobile ? 8 : 12,
                                }}
                            >
                                <Avatar
                                    size={isMobile ? 36 : 48}
                                    style={{
                                        background: "#52c41a20",
                                        color: "#52c41a",
                                        fontWeight: "bold",
                                        fontSize: isMobile ? "12px" : "inherit",
                                    }}
                                >
                                    {getInitials(signatory.name)}
                                </Avatar>
                                <div style={{ flex: 1, minWidth: 0 }}>
                                    <div
                                        style={{
                                            margin: 0,
                                            fontSize: isMobile ? 12 : 14,
                                            fontWeight: 600,
                                            color: "#52c41a",
                                        }}
                                    >
                                        {isMobile
                                            ? signatory.name.split(" ")[0]
                                            : signatory.name}
                                    </div>
                                    {!isMobile && (
                                        <div
                                            style={{
                                                margin: 0,
                                                color: "var(--text-secondary)",
                                                fontSize: 12,
                                            }}
                                        >
                                            {signatory.email}
                                        </div>
                                    )}
                                    <Tag
                                        color="green"
                                        icon={<IdcardOutlined />}
                                        style={{
                                            marginTop: 4,
                                            fontSize: isMobile ? 9 : "inherit",
                                        }}
                                    >
                                        Signatory
                                    </Tag>
                                </div>
                            </div>
                        </Card>
                    </Col>
                ))}
            </Row>
        ) : (
            <Empty
                description="No signatories assigned"
                image={Empty.PRESENTED_IMAGE_SIMPLE}
            >
                <Button
                    type="primary"
                    icon={<PlusOutlined />}
                    size={isMobile ? "small" : "middle"}
                >
                    Add Signatory
                </Button>
            </Empty>
        )}
    </Card>
));

const SettingsTabContent = React.memo(({
    isMobile,
    selectedGroup,
    getGroupImageUrl,
}) => (
    <Card
        title={isMobile ? null : "Group Settings"}
        style={{ borderRadius: 8 }}
    >
        <Descriptions
            column={1}
            bordered
            size="small"
            style={{
                borderRadius: 6,
                overflow: "hidden",
            }}
        >
            <Descriptions.Item label="Group Name">
                {selectedGroup.group_name}
            </Descriptions.Item>
            <Descriptions.Item label="Group Code">
                {selectedGroup.group_code}
            </Descriptions.Item>
            <Descriptions.Item label="Primary Color">
                <div
                    style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 8,
                    }}
                >
                    <div
                        style={{
                            width: 20,
                            height: 20,
                            borderRadius: 4,
                            backgroundColor: selectedGroup.group_color,
                            border: "1px solid var(--border-color)",
                        }}
                    />
                    <code>{selectedGroup.group_color}</code>
                </div>
            </Descriptions.Item>
            {!isMobile && (
                <>
                    <Descriptions.Item label="Created Date">
                        {dayjs(selectedGroup.created_at).format(
                            "MMMM DD, YYYY",
                        )}
                    </Descriptions.Item>
                    <Descriptions.Item label="Created By">
                        User ID: {selectedGroup.created_by}
                    </Descriptions.Item>
                    <Descriptions.Item label="Last Updated">
                        {dayjs(selectedGroup.updated_at).format(
                            "MMMM DD, YYYY HH:mm",
                        )}
                    </Descriptions.Item>
                </>
            )}
        </Descriptions>

        {getGroupImageUrl() && !isMobile && (
            <>
                <Divider>Group Cover Image</Divider>
                <div
                    style={{
                        marginTop: 16,
                        borderRadius: 8,
                        overflow: "hidden",
                        border: "1px solid var(--border-color)",
                    }}
                >
                    <Image
                        src={getGroupImageUrl()}
                        alt={selectedGroup.group_name}
                        style={{
                            width: "100%",
                            height: 200,
                            objectFit: "cover",
                        }}
                        preview={{
                            mask: (
                                <div
                                    style={{
                                        display: "flex",
                                        alignItems: "center",
                                        gap: 8,
                                    }}
                                >
                                    <EyeOutlined />
                                    <span>Preview</span>
                                </div>
                            ),
                        }}
                    />
                </div>
            </>
        )}
    </Card>
));

export default GroupDetailsModal;