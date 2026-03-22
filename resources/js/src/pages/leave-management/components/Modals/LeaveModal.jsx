import React, { useState, useEffect } from "react";
import {
    Modal,
    Form,
    Input,
    Select,
    DatePicker,
    TimePicker,
    Button,
    Row,
    Col,
    Avatar,
    Upload,
    Card,
    Steps,
    Divider,
    Space,
    Typography,
    Image,
    Tag,
    Descriptions,
} from "antd";
import {
    UploadOutlined,
    UserOutlined,
    CalendarOutlined,
    ClockCircleOutlined,
    EnvironmentOutlined,
    CarOutlined,
    DollarOutlined,
    FilePdfOutlined,
    CheckCircleOutlined,
    CloseCircleOutlined,
    ArrowRightOutlined,
    ArrowLeftOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import { motion } from "framer-motion";

const { TextArea } = Input;
const { Option } = Select;
const { RangePicker } = DatePicker;
const { Step } = Steps;
const { Title, Text } = Typography;

const RequestModal = ({ visible, onCancel, onSubmit, user, approver }) => {
    const [form] = Form.useForm();
    const [currentStep, setCurrentStep] = useState(0);
    const [requestType, setRequestType] = useState(null);
    const [travelDays, setTravelDays] = useState([
        { from: null, to: null, transportation: "", perDiem: "" },
    ]);
    const [signatureFile, setSignatureFile] = useState(null);
    const [reviewData, setReviewData] = useState(null);

    // Reset form when modal opens
    useEffect(() => {
        if (visible) {
            form.resetFields();
            setCurrentStep(0);
            setRequestType(null);
            setTravelDays([
                { from: null, to: null, transportation: "", perDiem: "" },
            ]);
            setSignatureFile(null);
            setReviewData(null);
        }
    }, [visible, form]);

    // Handle adding more travel days
    const addTravelDay = () => {
        setTravelDays([
            ...travelDays,
            { from: null, to: null, transportation: "", perDiem: "" },
        ]);
    };

    // Handle removing travel day
    const removeTravelDay = (index) => {
        if (travelDays.length > 1) {
            const newDays = [...travelDays];
            newDays.splice(index, 1);
            setTravelDays(newDays);
        }
    };

    // Calculate total days
    const calculateTotalDays = () => {
        return travelDays.reduce((total, day) => {
            if (day.from && day.to) {
                const days = dayjs(day.to).diff(dayjs(day.from), "day") + 1;
                return total + days;
            }
            return total;
        }, 0);
    };

    // Handle next step
    const handleNext = () => {
        form.validateFields()
            .then((values) => {
                if (currentStep === 0) {
                    // Prepare review data
                    const reviewData = {
                        type: requestType,
                        ...values,
                        employee: user?.name || "Employee",
                        employeeId: user?.employeeId || "EMP001",
                        department: user?.department || "Department",
                        position: user?.position || "Position",
                        signature: signatureFile,
                        travelDays:
                            requestType === "travel" ? travelDays : null,
                        totalDays:
                            requestType === "travel"
                                ? calculateTotalDays()
                                : null,
                        submitted: dayjs().format("YYYY-MM-DD HH:mm:ss"),
                        status: "pending",
                        approver: approver || "Manager",
                        requestId: `REQ-${Date.now().toString().slice(-6)}`,
                    };

                    setReviewData(reviewData);
                    setCurrentStep(1);
                }
            })
            .catch((error) => {
                console.log("Validation failed:", error);
            });
    };

    // Handle previous step
    const handlePrev = () => {
        setCurrentStep(0);
    };

    // Handle form submission
    const handleSubmit = () => {
        if (reviewData) {
            onSubmit(reviewData);
            onCancel();
        }
    };

    // Steps configuration
    const steps = [
        {
            title: "Request Type",
            content: "Select request type and fill details",
        },
        {
            title: "Review",
            content: "Review and submit request",
        },
    ];

    // Render request type selection
    const renderTypeSelection = () => (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
        >
            <div className="request-type-selection">
                <Title
                    level={4}
                    style={{ textAlign: "center", marginBottom: 30 }}
                >
                    Select Request Type
                </Title>

                <Row gutter={[24, 24]} justify="center">
                    <Col xs={24} md={12}>
                        <motion.div
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                        >
                            <Card
                                className={`request-type-card ${requestType === "leave" ? "selected" : ""}`}
                                onClick={() => setRequestType("leave")}
                                hoverable
                            >
                                <div className="type-card-content">
                                    <div className="type-icon">
                                        <CalendarOutlined
                                            style={{
                                                fontSize: 36,
                                                color: "#1890ff",
                                            }}
                                        />
                                    </div>
                                    <Title
                                        level={3}
                                        style={{ margin: "16px 0 8px" }}
                                    >
                                        Leave of Office
                                    </Title>
                                    <Text type="secondary">
                                        Request for temporary absence from
                                        office during working hours
                                    </Text>
                                    <Divider style={{ margin: "16px 0" }} />
                                    <div className="type-features">
                                        <Text>
                                            • For appointments, meetings, or
                                            personal matters
                                        </Text>
                                        <Text>• During working hours only</Text>
                                        <Text>
                                            • Requires supervisor approval
                                        </Text>
                                    </div>
                                </div>
                            </Card>
                        </motion.div>
                    </Col>

                    <Col xs={24} md={12}>
                        <motion.div
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                        >
                            <Card
                                className={`request-type-card ${requestType === "travel" ? "selected" : ""}`}
                                onClick={() => setRequestType("travel")}
                                hoverable
                            >
                                <div className="type-card-content">
                                    <div className="type-icon">
                                        <EnvironmentOutlined
                                            style={{
                                                fontSize: 36,
                                                color: "#52c41a",
                                            }}
                                        />
                                    </div>
                                    <Title
                                        level={3}
                                        style={{ margin: "16px 0 8px" }}
                                    >
                                        Travel Order
                                    </Title>
                                    <Text type="secondary">
                                        Request for official travel outside the
                                        office premises
                                    </Text>
                                    <Divider style={{ margin: "16px 0" }} />
                                    <div className="type-features">
                                        <Text>
                                            • For business trips and official
                                            visits
                                        </Text>
                                        <Text>
                                            • Includes travel allowances
                                        </Text>
                                        <Text>
                                            • Requires detailed itinerary
                                        </Text>
                                    </div>
                                </div>
                            </Card>
                        </motion.div>
                    </Col>
                </Row>
            </div>
        </motion.div>
    );

    // Render leave of office form
    const renderLeaveForm = () => (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
        >
            <Title level={4} style={{ marginBottom: 24 }}>
                Leave of Office Request
            </Title>

            <Form
                form={form}
                layout="vertical"
                initialValues={{
                    dateOfRequest: dayjs(),
                }}
            >
                <Form.Item
                    name="dateOfRequest"
                    label="Date of Request"
                    rules={[
                        {
                            required: true,
                            message: "Please select date of request",
                        },
                    ]}
                >
                    <DatePicker
                        style={{ width: "100%" }}
                        format="MMMM DD, YYYY"
                        disabled
                    />
                </Form.Item>

                <Form.Item
                    name="reason"
                    label="Reason of Request"
                    rules={[
                        { required: true, message: "Please provide reason" },
                    ]}
                >
                    <TextArea
                        rows={3}
                        placeholder="Enter detailed reason for leaving the office..."
                        maxLength={500}
                        showCount
                    />
                </Form.Item>

                <Row gutter={16}>
                    <Col span={12}>
                        <Form.Item
                            name="timeOut"
                            label="Time Out"
                            rules={[
                                {
                                    required: true,
                                    message: "Please select time out",
                                },
                            ]}
                        >
                            <TimePicker
                                style={{ width: "100%" }}
                                format="HH:mm"
                                placeholder="Select time"
                            />
                        </Form.Item>
                    </Col>
                    <Col span={12}>
                        <Form.Item
                            name="expectedTimeIn"
                            label="Expected Time In"
                            rules={[
                                {
                                    required: true,
                                    message: "Please select expected time in",
                                },
                            ]}
                        >
                            <TimePicker
                                style={{ width: "100%" }}
                                format="HH:mm"
                                placeholder="Select time"
                            />
                        </Form.Item>
                    </Col>
                </Row>

                <Form.Item name="remarks" label="Additional Remarks (Optional)">
                    <TextArea
                        rows={2}
                        placeholder="Any additional information..."
                        maxLength={200}
                        showCount
                    />
                </Form.Item>
            </Form>
        </motion.div>
    );

    // Render travel order form
    const renderTravelForm = () => (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
        >
            <Title level={4} style={{ marginBottom: 24 }}>
                Travel Order Request
            </Title>

            <Form
                form={form}
                layout="vertical"
                initialValues={{
                    dateOfRequest: dayjs(),
                }}
            >
                <Form.Item
                    name="dateOfRequest"
                    label="Date of Request"
                    rules={[
                        {
                            required: true,
                            message: "Please select date of request",
                        },
                    ]}
                >
                    <DatePicker
                        style={{ width: "100%" }}
                        format="MMMM DD, YYYY"
                        disabled
                    />
                </Form.Item>

                <Form.Item
                    name="placeOfTravel"
                    label="Place of Travel"
                    rules={[
                        {
                            required: true,
                            message: "Please enter place of travel",
                        },
                    ]}
                >
                    <Input
                        placeholder="Enter destination city/province"
                        prefix={<EnvironmentOutlined />}
                    />
                </Form.Item>

                <Form.Item
                    name="purpose"
                    label="Purpose of Travel"
                    rules={[
                        {
                            required: true,
                            message: "Please enter purpose of travel",
                        },
                    ]}
                >
                    <TextArea
                        rows={3}
                        placeholder="Enter detailed purpose of travel..."
                        maxLength={500}
                        showCount
                    />
                </Form.Item>

                {/* Travel Days Section */}
                <div className="travel-days-section">
                    <div className="section-header">
                        <Title level={5}>Travel Itinerary</Title>
                        <Button type="dashed" onClick={addTravelDay}>
                            Add Another Day
                        </Button>
                    </div>

                    {travelDays.map((day, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            exit={{ opacity: 0, height: 0 }}
                            className="travel-day-card"
                        >
                            <Card
                                size="small"
                                title={`Day ${index + 1}`}
                                extra={
                                    travelDays.length > 1 && (
                                        <Button
                                            type="text"
                                            danger
                                            onClick={() =>
                                                removeTravelDay(index)
                                            }
                                        >
                                            Remove
                                        </Button>
                                    )
                                }
                            >
                                <Row gutter={[16, 16]}>
                                    <Col span={24}>
                                        <div className="day-label">
                                            Date of Travel
                                        </div>
                                    </Col>
                                    <Col span={12}>
                                        <Form.Item
                                            name={["travelDays", index, "from"]}
                                            label="From"
                                            rules={[
                                                {
                                                    required: true,
                                                    message:
                                                        "Please select start date",
                                                },
                                            ]}
                                        >
                                            <DatePicker
                                                style={{ width: "100%" }}
                                                format="MMMM DD, YYYY"
                                                placeholder="Start date"
                                                value={day.from}
                                                onChange={(date) => {
                                                    const newDays = [
                                                        ...travelDays,
                                                    ];
                                                    newDays[index].from = date;
                                                    setTravelDays(newDays);
                                                }}
                                            />
                                        </Form.Item>
                                    </Col>
                                    <Col span={12}>
                                        <Form.Item
                                            name={["travelDays", index, "to"]}
                                            label="To"
                                            rules={[
                                                {
                                                    required: true,
                                                    message:
                                                        "Please select end date",
                                                },
                                            ]}
                                        >
                                            <DatePicker
                                                style={{ width: "100%" }}
                                                format="MMMM DD, YYYY"
                                                placeholder="End date"
                                                value={day.to}
                                                onChange={(date) => {
                                                    const newDays = [
                                                        ...travelDays,
                                                    ];
                                                    newDays[index].to = date;
                                                    setTravelDays(newDays);
                                                }}
                                            />
                                        </Form.Item>
                                    </Col>
                                    <Col span={12}>
                                        <Form.Item
                                            name={[
                                                "travelDays",
                                                index,
                                                "transportation",
                                            ]}
                                            label="Transportation"
                                            rules={[
                                                {
                                                    required: true,
                                                    message:
                                                        "Please enter transportation details",
                                                },
                                            ]}
                                        >
                                            <Select placeholder="Select transportation">
                                                <Option value="company_vehicle">
                                                    Company Vehicle
                                                </Option>
                                                <Option value="personal_vehicle">
                                                    Personal Vehicle
                                                </Option>
                                                <Option value="public_transport">
                                                    Public Transport
                                                </Option>
                                                <Option value="airline">
                                                    Airline
                                                </Option>
                                                <Option value="other">
                                                    Other
                                                </Option>
                                            </Select>
                                        </Form.Item>
                                    </Col>
                                    <Col span={12}>
                                        <Form.Item
                                            name={[
                                                "travelDays",
                                                index,
                                                "perDiem",
                                            ]}
                                            label="Per Diem"
                                            rules={[
                                                {
                                                    required: true,
                                                    message:
                                                        "Please enter per diem amount",
                                                },
                                            ]}
                                        >
                                            <Input
                                                type="number"
                                                placeholder="Amount"
                                                prefix={<DollarOutlined />}
                                                addonAfter="USD"
                                                value={day.perDiem}
                                                onChange={(e) => {
                                                    const newDays = [
                                                        ...travelDays,
                                                    ];
                                                    newDays[index].perDiem =
                                                        e.target.value;
                                                    setTravelDays(newDays);
                                                }}
                                            />
                                        </Form.Item>
                                    </Col>
                                </Row>
                            </Card>
                        </motion.div>
                    ))}
                </div>

                {/* Total Days Calculation */}
                <div className="total-days-display">
                    <Card size="small">
                        <Space>
                            <Text strong>Total Days of Travel:</Text>
                            <Tag
                                color="blue"
                                style={{
                                    fontSize: "16px",
                                    padding: "4px 12px",
                                }}
                            >
                                {calculateTotalDays()} days
                            </Tag>
                        </Space>
                    </Card>
                </div>

                {/* E-Signature Upload */}
                <div className="signature-upload">
                    <Title level={5}>E-Signature</Title>
                    <Card>
                        <div className="signature-preview">
                            {signatureFile ? (
                                <div className="signature-uploaded">
                                    <Image
                                        src={URL.createObjectURL(signatureFile)}
                                        alt="E-Signature"
                                        width={200}
                                        preview={false}
                                    />
                                    <Button
                                        type="link"
                                        onClick={() => setSignatureFile(null)}
                                        danger
                                    >
                                        Remove
                                    </Button>
                                </div>
                            ) : (
                                <div className="default-signature">
                                    <Avatar
                                        size={64}
                                        icon={<UserOutlined />}
                                        src={user?.avatar}
                                    />
                                    <Text
                                        type="secondary"
                                        style={{ marginTop: 8 }}
                                    >
                                        Using default e-signature
                                    </Text>
                                </div>
                            )}
                        </div>

                        <Upload
                            accept="image/*"
                            showUploadList={false}
                            beforeUpload={(file) => {
                                setSignatureFile(file);
                                return false;
                            }}
                            maxCount={1}
                        >
                            <Button
                                icon={<UploadOutlined />}
                                style={{ marginTop: 16 }}
                            >
                                Upload Custom E-Signature
                            </Button>
                        </Upload>
                    </Card>
                </div>
            </Form>
        </motion.div>
    );

    // Render review step
    const renderReviewStep = () => {
        if (!reviewData) return null;

        return (
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
            >
                <Title level={4} style={{ marginBottom: 24 }}>
                    Review Request
                </Title>

                <Card className="review-card">
                    {/* Request Header */}
                    <div className="review-header">
                        <div className="request-type-badge">
                            <Tag
                                color={
                                    reviewData.type === "leave"
                                        ? "blue"
                                        : "green"
                                }
                                style={{
                                    fontSize: "14px",
                                    padding: "4px 12px",
                                }}
                            >
                                {reviewData.type === "leave"
                                    ? "LEAVE OF OFFICE"
                                    : "TRAVEL ORDER"}
                            </Tag>
                            <Text strong>
                                Request ID: {reviewData.requestId}
                            </Text>
                        </div>
                        <Divider />
                    </div>

                    {/* Employee Information */}
                    <div className="employee-info-review">
                        <Descriptions column={2} size="small">
                            <Descriptions.Item label="Employee">
                                {reviewData.employee}
                            </Descriptions.Item>
                            <Descriptions.Item label="Employee ID">
                                {reviewData.employeeId}
                            </Descriptions.Item>
                            <Descriptions.Item label="Department">
                                {reviewData.department}
                            </Descriptions.Item>
                            <Descriptions.Item label="Position">
                                {reviewData.position}
                            </Descriptions.Item>
                            <Descriptions.Item label="Date Submitted">
                                {dayjs(reviewData.submitted).format(
                                    "MMMM DD, YYYY HH:mm",
                                )}
                            </Descriptions.Item>
                            <Descriptions.Item label="Approver">
                                {reviewData.approver}
                            </Descriptions.Item>
                        </Descriptions>
                    </div>

                    <Divider />

                    {/* Request Details */}
                    <div className="request-details-review">
                        {reviewData.type === "leave" ? (
                            <>
                                <Title level={5}>Leave of Office Details</Title>
                                <Descriptions column={1} size="small">
                                    <Descriptions.Item label="Date of Request">
                                        {dayjs(reviewData.dateOfRequest).format(
                                            "MMMM DD, YYYY",
                                        )}
                                    </Descriptions.Item>
                                    <Descriptions.Item label="Reason">
                                        {reviewData.reason}
                                    </Descriptions.Item>
                                    <Descriptions.Item label="Time Out">
                                        {dayjs(reviewData.timeOut).format(
                                            "HH:mm",
                                        )}
                                    </Descriptions.Item>
                                    <Descriptions.Item label="Expected Time In">
                                        {dayjs(
                                            reviewData.expectedTimeIn,
                                        ).format("HH:mm")}
                                    </Descriptions.Item>
                                    {reviewData.remarks && (
                                        <Descriptions.Item label="Remarks">
                                            {reviewData.remarks}
                                        </Descriptions.Item>
                                    )}
                                </Descriptions>
                            </>
                        ) : (
                            <>
                                <Title level={5}>Travel Order Details</Title>
                                <Descriptions column={1} size="small">
                                    <Descriptions.Item label="Date of Request">
                                        {dayjs(reviewData.dateOfRequest).format(
                                            "MMMM DD, YYYY",
                                        )}
                                    </Descriptions.Item>
                                    <Descriptions.Item label="Place of Travel">
                                        {reviewData.placeOfTravel}
                                    </Descriptions.Item>
                                    <Descriptions.Item label="Purpose of Travel">
                                        {reviewData.purpose}
                                    </Descriptions.Item>
                                    <Descriptions.Item label="Total Days of Travel">
                                        <Tag color="blue">
                                            {reviewData.totalDays} days
                                        </Tag>
                                    </Descriptions.Item>
                                </Descriptions>

                                {/* Travel Itinerary */}
                                <Title level={5} style={{ marginTop: 16 }}>
                                    Travel Itinerary
                                </Title>
                                {reviewData.travelDays?.map((day, index) => (
                                    <Card
                                        key={index}
                                        size="small"
                                        style={{ marginBottom: 8 }}
                                    >
                                        <Descriptions column={2} size="small">
                                            <Descriptions.Item label="Date of Travel">
                                                {dayjs(day.from).format(
                                                    "MMM DD",
                                                )}{" "}
                                                -{" "}
                                                {dayjs(day.to).format(
                                                    "MMM DD, YYYY",
                                                )}
                                            </Descriptions.Item>
                                            <Descriptions.Item label="Duration">
                                                {dayjs(day.to).diff(
                                                    dayjs(day.from),
                                                    "day",
                                                ) + 1}{" "}
                                                days
                                            </Descriptions.Item>
                                            <Descriptions.Item label="Transportation">
                                                {day.transportation}
                                            </Descriptions.Item>
                                            <Descriptions.Item label="Per Diem">
                                                ${day.perDiem}
                                            </Descriptions.Item>
                                        </Descriptions>
                                    </Card>
                                ))}
                            </>
                        )}
                    </div>

                    <Divider />

                    {/* Signature Preview */}
                    <div className="signature-review">
                        <Title level={5}>E-Signature</Title>
                        <div className="signature-preview-review">
                            {reviewData.signature ? (
                                <Image
                                    src={URL.createObjectURL(
                                        reviewData.signature,
                                    )}
                                    alt="E-Signature"
                                    width={150}
                                    preview={false}
                                />
                            ) : (
                                <div className="default-signature-review">
                                    <Avatar
                                        size={48}
                                        icon={<UserOutlined />}
                                        src={user?.avatar}
                                    />
                                    <Text type="secondary">
                                        {reviewData.employee}
                                    </Text>
                                </div>
                            )}
                        </div>
                    </div>
                </Card>
            </motion.div>
        );
    };

    return (
        <Modal
            title={
                <div className="request-modal-header">
                    <div className="modal-title-content">
                        <FilePdfOutlined
                            style={{ fontSize: 24, marginRight: 12 }}
                        />
                        <div>
                            <h2 style={{ margin: 0 }}>New Request</h2>
                            <p
                                style={{
                                    margin: 0,
                                    color: "var(--text-secondary)",
                                }}
                            >
                                Submit Leave of Office or Travel Order request
                            </p>
                        </div>
                    </div>
                </div>
            }
            open={visible}
            onCancel={onCancel}
            width={800}
            footer={null}
            className="request-modal"
            destroyOnClose
        >
            <div className="request-modal-container">
                {/* Steps */}
                <Steps current={currentStep} style={{ marginBottom: 32 }}>
                    {steps.map((item) => (
                        <Step
                            key={item.title}
                            title={item.title}
                            description={item.content}
                        />
                    ))}
                </Steps>

                {/* Content based on step */}
                <div className="request-content">
                    {currentStep === 0 ? (
                        <>
                            {!requestType ? (
                                renderTypeSelection()
                            ) : (
                                <>
                                    {requestType === "leave"
                                        ? renderLeaveForm()
                                        : renderTravelForm()}
                                </>
                            )}
                        </>
                    ) : (
                        renderReviewStep()
                    )}
                </div>

                {/* Footer Actions */}
                <div className="modal-actions">
                    <Space>
                        {currentStep === 0 ? (
                            <>
                                <Button onClick={onCancel}>Cancel</Button>
                                {requestType && (
                                    <Button
                                        type="primary"
                                        icon={<ArrowRightOutlined />}
                                        onClick={handleNext}
                                    >
                                        Next: Review Request
                                    </Button>
                                )}
                            </>
                        ) : (
                            <>
                                <Button
                                    icon={<ArrowLeftOutlined />}
                                    onClick={handlePrev}
                                >
                                    Back to Edit
                                </Button>
                                <Button onClick={onCancel}>Cancel</Button>
                                <Button
                                    type="primary"
                                    icon={<CheckCircleOutlined />}
                                    onClick={handleSubmit}
                                >
                                    Submit Request
                                </Button>
                            </>
                        )}
                    </Space>
                </div>
            </div>
        </Modal>
    );
};

export default RequestModal;
