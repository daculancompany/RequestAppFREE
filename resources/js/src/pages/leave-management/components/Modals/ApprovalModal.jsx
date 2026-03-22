// components/Modals/ApprovalModal.jsx
import React, { useState } from "react";
import {
    Modal,
    Button,
    Space,
    Typography,
    Card,
    Descriptions,
    Tag,
    Divider,
    Avatar,
    Input,
    Row,
    Col,
    message,
    Image,
    Timeline,
    Badge,
} from "antd";
import {
    CheckCircleOutlined,
    CloseCircleOutlined,
    UserOutlined,
    CalendarOutlined,
    EnvironmentOutlined,
    ClockCircleOutlined,
    CarOutlined,
    DollarOutlined,
    FilePdfOutlined,
    MailOutlined,
    HistoryOutlined,
    SignatureOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import { motion } from "framer-motion";

const { TextArea } = Input;
const { Title, Text } = Typography;

const ApprovalModal = ({
    visible,
    onCancel,
    request,
    onApprove,
    onReject,
    currentUser,
}) => {
    const [comment, setComment] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    if (!request) return null;

    const isTravelOrder = request.type === "travel";
    const isLeaveOfOffice = request.type === "leave";

    // Handle approval
    const handleApprove = async () => {
        if (!comment.trim()) {
            message.warning("Please add a comment before approving");
            return;
        }

        setIsSubmitting(true);
        try {
            // Generate travel order number if applicable
            const travelOrderNo = isTravelOrder
                ? `TO-${dayjs().format("YYYYMMDD")}-${Math.random().toString(36).substr(2, 6).toUpperCase()}`
                : null;

            await onApprove({
                ...request,
                status: "approved",
                approvedBy: currentUser.name,
                approvedAt: dayjs().format("YYYY-MM-DD HH:mm:ss"),
                comment,
                travelOrderNo,
            });

            message.success("Request approved successfully!");
            onCancel();
        } catch (error) {
            message.error("Failed to approve request");
        } finally {
            setIsSubmitting(false);
        }
    };

    // Handle rejection
    const handleReject = async () => {
        if (!comment.trim()) {
            message.warning("Please add a comment before rejecting");
            return;
        }

        setIsSubmitting(true);
        try {
            await onReject({
                ...request,
                status: "rejected",
                rejectedBy: currentUser.name,
                rejectedAt: dayjs().format("YYYY-MM-DD HH:mm:ss"),
                comment,
            });

            message.success("Request rejected successfully!");
            onCancel();
        } catch (error) {
            message.error("Failed to reject request");
        } finally {
            setIsSubmitting(false);
        }
    };

    // Render approval timeline
    const renderTimeline = () => {
        const items = [
            {
                label: "Submitted",
                children: (
                    <div>
                        <Text strong>{request.employee}</Text>
                        <div>
                            {dayjs(request.submitted).format(
                                "MMM DD, YYYY HH:mm",
                            )}
                        </div>
                    </div>
                ),
                color: "green",
                dot: <HistoryOutlined />,
            },
            {
                label: "Under Review",
                children: (
                    <div>
                        <Text strong>{currentUser.name}</Text>
                        <div>Currently reviewing</div>
                    </div>
                ),
                color: "blue",
                dot: <UserOutlined />,
            },
            {
                label: "Decision",
                children: (
                    <div>
                        <Text strong>Pending Decision</Text>
                        <div>Waiting for your action</div>
                    </div>
                ),
                color: "gray",
                dot: <CheckCircleOutlined />,
            },
        ];

        return (
            <Card title="Approval Timeline" size="small">
                <Timeline items={items} mode="left" />
            </Card>
        );
    };

    return (
        <Modal
            title={
                <div className="approval-modal-header">
                    <div className="modal-title-content">
                        <Badge
                            count={
                                isTravelOrder
                                    ? "TRAVEL ORDER"
                                    : "LEAVE OF OFFICE"
                            }
                            style={{
                                backgroundColor: isTravelOrder
                                    ? "#52c41a"
                                    : "#1890ff",
                                fontSize: "12px",
                                padding: "0 8px",
                            }}
                        />
                        <div style={{ marginLeft: 12 }}>
                            <h2 style={{ margin: 0 }}>Review Request</h2>
                            <p
                                style={{
                                    margin: 0,
                                    color: "var(--text-secondary)",
                                }}
                            >
                                ID: {request.requestId}
                            </p>
                        </div>
                    </div>
                </div>
            }
            open={visible}
            onCancel={onCancel}
            width={900}
            footer={null}
            className="approval-modal"
        >
            <div className="approval-modal-container">
                <Row gutter={[24, 24]}>
                    {/* Left Column - Request Details */}
                    <Col xs={24} lg={16}>
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.3 }}
                        >
                            <Card className="request-details-card">
                                {/* Employee Information */}
                                <div className="employee-section">
                                    <Avatar
                                        size={64}
                                        src={request.employeeAvatar}
                                        icon={<UserOutlined />}
                                        style={{ marginRight: 16 }}
                                    />
                                    <div>
                                        <Title level={4} style={{ margin: 0 }}>
                                            {request.employee}
                                        </Title>
                                        <Text type="secondary">
                                            {request.position} •{" "}
                                            {request.department}
                                        </Text>
                                        <div style={{ marginTop: 8 }}>
                                            <Tag color="blue">
                                                Employee ID:{" "}
                                                {request.employeeId}
                                            </Tag>
                                        </div>
                                    </div>
                                </div>

                                <Divider />

                                {/* Request Details */}
                                <div className="request-details-section">
                                    {isLeaveOfOffice ? (
                                        <>
                                            <Title level={5}>
                                                Leave of Office Details
                                            </Title>
                                            <Descriptions
                                                column={2}
                                                bordered
                                                size="small"
                                            >
                                                <Descriptions.Item
                                                    label="Date of Request"
                                                    span={2}
                                                >
                                                    {dayjs(
                                                        request.dateOfRequest,
                                                    ).format(
                                                        "dddd, MMMM DD, YYYY",
                                                    )}
                                                </Descriptions.Item>
                                                <Descriptions.Item label="Time Out">
                                                    {dayjs(
                                                        request.timeOut,
                                                    ).format("HH:mm A")}
                                                </Descriptions.Item>
                                                <Descriptions.Item label="Expected Time In">
                                                    {dayjs(
                                                        request.expectedTimeIn,
                                                    ).format("HH:mm A")}
                                                </Descriptions.Item>
                                                <Descriptions.Item
                                                    label="Duration"
                                                    span={2}
                                                >
                                                    <Tag color="blue">
                                                        {dayjs(
                                                            request.expectedTimeIn,
                                                        ).diff(
                                                            dayjs(
                                                                request.timeOut,
                                                            ),
                                                            "hour",
                                                        )}{" "}
                                                        hours
                                                    </Tag>
                                                </Descriptions.Item>
                                                <Descriptions.Item
                                                    label="Reason"
                                                    span={2}
                                                >
                                                    <div
                                                        style={{
                                                            padding: "8px",
                                                            background:
                                                                "#fafafa",
                                                            borderRadius: "4px",
                                                        }}
                                                    >
                                                        {request.reason}
                                                    </div>
                                                </Descriptions.Item>
                                            </Descriptions>
                                        </>
                                    ) : (
                                        <>
                                            <Title level={5}>
                                                Travel Order Details
                                            </Title>
                                            <Descriptions
                                                column={2}
                                                bordered
                                                size="small"
                                            >
                                                <Descriptions.Item label="Date of Request">
                                                    {dayjs(
                                                        request.dateOfRequest,
                                                    ).format("MMMM DD, YYYY")}
                                                </Descriptions.Item>
                                                <Descriptions.Item label="Place of Travel">
                                                    {request.placeOfTravel}
                                                </Descriptions.Item>
                                                <Descriptions.Item
                                                    label="Purpose of Travel"
                                                    span={2}
                                                >
                                                    <div
                                                        style={{
                                                            padding: "8px",
                                                            background:
                                                                "#fafafa",
                                                            borderRadius: "4px",
                                                        }}
                                                    >
                                                        {request.purpose}
                                                    </div>
                                                </Descriptions.Item>
                                                <Descriptions.Item label="Total Days">
                                                    <Tag color="green">
                                                        {request.totalDays} days
                                                    </Tag>
                                                </Descriptions.Item>
                                                <Descriptions.Item label="Total Per Diem">
                                                    <Tag color="gold">
                                                        $
                                                        {request.travelDays?.reduce(
                                                            (sum, day) =>
                                                                sum +
                                                                (parseFloat(
                                                                    day.perDiem,
                                                                ) || 0),
                                                            0,
                                                        )}
                                                    </Tag>
                                                </Descriptions.Item>
                                            </Descriptions>

                                            {/* Travel Itinerary */}
                                            <Title
                                                level={5}
                                                style={{ marginTop: 24 }}
                                            >
                                                Travel Itinerary
                                            </Title>
                                            {request.travelDays?.map(
                                                (day, index) => (
                                                    <Card
                                                        key={index}
                                                        size="small"
                                                        style={{
                                                            marginBottom: 8,
                                                        }}
                                                    >
                                                        <Descriptions
                                                            column={2}
                                                            size="small"
                                                        >
                                                            <Descriptions.Item label="Dates">
                                                                {dayjs(
                                                                    day.from,
                                                                ).format(
                                                                    "MMM DD",
                                                                )}{" "}
                                                                -{" "}
                                                                {dayjs(
                                                                    day.to,
                                                                ).format(
                                                                    "MMM DD, YYYY",
                                                                )}
                                                                <div
                                                                    style={{
                                                                        fontSize:
                                                                            "12px",
                                                                        color: "#666",
                                                                    }}
                                                                >
                                                                    (
                                                                    {dayjs(
                                                                        day.to,
                                                                    ).diff(
                                                                        dayjs(
                                                                            day.from,
                                                                        ),
                                                                        "day",
                                                                    ) + 1}{" "}
                                                                    days)
                                                                </div>
                                                            </Descriptions.Item>
                                                            <Descriptions.Item label="Transportation">
                                                                <Tag
                                                                    icon={
                                                                        <CarOutlined />
                                                                    }
                                                                >
                                                                    {
                                                                        day.transportation
                                                                    }
                                                                </Tag>
                                                            </Descriptions.Item>
                                                            <Descriptions.Item label="Per Diem">
                                                                <Tag
                                                                    icon={
                                                                        <DollarOutlined />
                                                                    }
                                                                >
                                                                    $
                                                                    {
                                                                        day.perDiem
                                                                    }
                                                                </Tag>
                                                            </Descriptions.Item>
                                                        </Descriptions>
                                                    </Card>
                                                ),
                                            )}
                                        </>
                                    )}
                                </div>

                                <Divider />

                                {/* E-Signature */}
                                <div className="signature-section">
                                    <Title level={5}>
                                        Employee's E-Signature
                                    </Title>
                                    <div className="signature-display">
                                        {request.signature ? (
                                            <Image
                                                src={URL.createObjectURL(
                                                    request.signature,
                                                )}
                                                alt="E-Signature"
                                                width={200}
                                                preview={false}
                                            />
                                        ) : (
                                            <div className="default-signature">
                                                <Avatar
                                                    size={80}
                                                    icon={<UserOutlined />}
                                                    src={request.employeeAvatar}
                                                    style={{ marginBottom: 8 }}
                                                />
                                                <Text strong>
                                                    {request.employee}
                                                </Text>
                                            </div>
                                        )}
                                        <Text
                                            type="secondary"
                                            style={{ marginTop: 8 }}
                                        >
                                            Signed on{" "}
                                            {dayjs(request.submitted).format(
                                                "MMM DD, YYYY",
                                            )}
                                        </Text>
                                    </div>
                                </div>
                            </Card>
                        </motion.div>
                    </Col>

                    {/* Right Column - Approval Actions */}
                    <Col xs={24} lg={8}>
                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.3, delay: 0.1 }}
                        >
                            {/* Timeline */}
                            {renderTimeline()}

                            {/* Comment Section */}
                            <Card
                                title="Your Comment"
                                size="small"
                                style={{ marginTop: 16 }}
                            >
                                <TextArea
                                    rows={4}
                                    value={comment}
                                    onChange={(e) => setComment(e.target.value)}
                                    placeholder="Add your comments or remarks..."
                                    maxLength={500}
                                    showCount
                                />
                                <Text
                                    type="secondary"
                                    style={{ fontSize: "12px", marginTop: 8 }}
                                >
                                    This comment will be sent to the employee
                                    via email.
                                </Text>
                            </Card>

                            {/* Approval Actions */}
                            <Card
                                title="Take Action"
                                size="small"
                                style={{ marginTop: 16 }}
                            >
                                <Space
                                    direction="vertical"
                                    style={{ width: "100%" }}
                                >
                                    <Button
                                        type="primary"
                                        icon={<CheckCircleOutlined />}
                                        size="large"
                                        block
                                        loading={isSubmitting}
                                        onClick={handleApprove}
                                        style={{
                                            height: "48px",
                                            fontSize: "16px",
                                        }}
                                    >
                                        Approve Request
                                    </Button>

                                    <Button
                                        danger
                                        icon={<CloseCircleOutlined />}
                                        size="large"
                                        block
                                        loading={isSubmitting}
                                        onClick={handleReject}
                                        style={{
                                            height: "48px",
                                            fontSize: "16px",
                                        }}
                                    >
                                        Deny Request
                                    </Button>
                                </Space>

                                {/* Additional Options */}
                                <Divider />
                                <Space
                                    direction="vertical"
                                    style={{ width: "100%" }}
                                >
                                    <Button
                                        icon={<MailOutlined />}
                                        block
                                        onClick={() => {
                                            // Email functionality
                                            window.location.href = `mailto:${request.employeeEmail}?subject=Regarding your ${isTravelOrder ? "Travel Order" : "Leave of Office"} request&body=Dear ${request.employee},\n\n`;
                                        }}
                                    >
                                        Email Employee
                                    </Button>
                                    <Button
                                        icon={<FilePdfOutlined />}
                                        block
                                        onClick={() => {
                                            // Generate PDF
                                            message.info(
                                                "Generating PDF document...",
                                            );
                                        }}
                                    >
                                        Generate PDF
                                    </Button>
                                </Space>
                            </Card>

                            {/* Quick Responses */}
                            <Card
                                title="Quick Responses"
                                size="small"
                                style={{ marginTop: 16 }}
                            >
                                <Space
                                    direction="vertical"
                                    style={{ width: "100%" }}
                                >
                                    <Button
                                        size="small"
                                        block
                                        onClick={() =>
                                            setComment(
                                                "Approved. Please proceed as requested.",
                                            )
                                        }
                                    >
                                        Approved - Proceed
                                    </Button>
                                    <Button
                                        size="small"
                                        block
                                        onClick={() =>
                                            setComment(
                                                "Approved. Please submit additional documentation.",
                                            )
                                        }
                                    >
                                        Approved - Need Docs
                                    </Button>
                                    <Button
                                        size="small"
                                        block
                                        danger
                                        onClick={() =>
                                            setComment(
                                                "Denied. Please review company policy and resubmit.",
                                            )
                                        }
                                    >
                                        Denied - Policy Violation
                                    </Button>
                                    <Button
                                        size="small"
                                        block
                                        danger
                                        onClick={() =>
                                            setComment(
                                                "Denied. Please provide more information.",
                                            )
                                        }
                                    >
                                        Denied - Need More Info
                                    </Button>
                                </Space>
                            </Card>
                        </motion.div>
                    </Col>
                </Row>
            </div>
        </Modal>
    );
};

export default ApprovalModal;
