import React, { useState, useEffect, useCallback } from "react";
import {
    Drawer,
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
    message,
    Spin,
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
    LoadingOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import isSameOrBefore from "dayjs/plugin/isSameOrBefore";
import isSameOrAfter from "dayjs/plugin/isSameOrAfter";
import { motion, AnimatePresence } from "framer-motion";
import { useGlobalStore } from "@/stores/global.store";
import { useRequestStore } from "@/stores/request.store";
import "@/styles/RequestModal.scss";

const TRANSPORTATION_OPTIONS = [
    { value: "company_vehicle", label: "Company Vehicle" },
    { value: "personal_vehicle", label: "Personal Vehicle" },
    { value: "public_transport", label: "Public Transport" },
    { value: "airline", label: "Airline" },
    { value: "other", label: "Other" },
];

// Extend dayjs with plugins
dayjs.extend(isSameOrBefore);
dayjs.extend(isSameOrAfter);

const { TextArea } = Input;
const { Option } = Select;
const { Step } = Steps;
const { Title, Text } = Typography;

const RequestDrawer = ({ onSubmit, user }) => {
    const { activeGroup } = useGlobalStore();
    const { setNewRequest, newRequest, submitting, setSubmitting } =
        useRequestStore();
    const [form] = Form.useForm();
    const [currentStep, setCurrentStep] = useState(0);
    const [requestType, setRequestType] = useState(null);
    const [travelDays, setTravelDays] = useState([
        {
            from: null,
            to: null,
            transportation: "",
            perDiem: "",
            placeOfTravel: "",
        },
    ]);
    const [signatureFile, setSignatureFile] = useState(null);
    const [reviewData, setReviewData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [approvers, setApprovers] = useState([]);
    const [selectedApprover, setSelectedApprover] = useState(null);
    const [showExpectedTimeIn, setShowExpectedTimeIn] = useState(false);

    // Reset form when drawer opens
    useEffect(() => {
        if (newRequest) {
            form.resetFields();
            setCurrentStep(0);
            setRequestType(null);
            setTravelDays([
                { from: null, to: null, transportation: "", perDiem: "", placeOfTravel: "" },
            ]);
            setSignatureFile(null);
            setReviewData(null);
            setLoading(false);
            setSelectedApprover(null);
            setSubmitting(false);
            setShowExpectedTimeIn(false);
        }
    }, [newRequest, form, setSubmitting]);

    // Helper function to ensure Day.js object
    const ensureDayjs = (value) => {
        if (!value) return null;
        if (dayjs.isDayjs(value)) return value;
        try {
            return dayjs(value);
        } catch (error) {
            console.error("Error converting to dayjs:", error);
            return null;
        }
    };

    const getTransportationLabel = (value) => {
        const option = TRANSPORTATION_OPTIONS.find(
            (opt) => opt.value === value,
        );
        return option ? option.label : value;
    };

    // Handle adding more travel days
    const addTravelDay = () => {
        setTravelDays([
            ...travelDays,
            {
                from: null,
                to: null,
                transportation: "",
                perDiem: "",
                placeOfTravel: "",
            },
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
            const from = ensureDayjs(day.from);
            const to = ensureDayjs(day.to);
            if (from && to) {
                const days = to.diff(from, "day") + 1;
                return total + days;
            }
            return total;
        }, 0);
    };

    // Handle next step
    const handleNext = async () => {
        try {
            const values = await form.validateFields();

            if (currentStep === 0) {
                // Validate travel days for travel requests
                if (requestType === "travel") {
                    const invalidDays = travelDays
                        .map((day, index) => {
                            const errors = [];
                            if (!day.from) errors.push("From date");
                            if (!day.to) errors.push("To date");
                            if (!day.transportation) errors.push("Transportation");
                            if (!day.perDiem) errors.push("Per diem");
                            if (!day.placeOfTravel) errors.push("Place of travel");
                            return { index: index + 1, errors };
                        })
                        .filter((day) => day.errors.length > 0);

                    if (invalidDays.length > 0) {
                        Drawer.error({
                            title: "Missing Information",
                            content: (
                                <div>
                                    <p>Please fill in the following required fields:</p>
                                    <div
                                        style={{
                                            backgroundColor: "#fff2f0",
                                            padding: "8px",
                                            borderRadius: "4px",
                                            marginTop: "8px",
                                        }}
                                    >
                                        {invalidDays.map((day, idx) => (
                                            <div
                                                key={idx}
                                                style={{
                                                    marginBottom: "4px",
                                                    padding: "4px 8px",
                                                    backgroundColor: "#ffccc7",
                                                    borderRadius: "2px",
                                                }}
                                            >
                                                <strong>Day {day.index}:</strong>{" "}
                                                {day.errors.join(", ")}
                                            </div>
                                        ))}
                                    </div>
                                    <p
                                        style={{
                                            marginTop: "12px",
                                            fontSize: "12px",
                                            color: "#666",
                                        }}
                                    >
                                        Please fill all required fields before submitting.
                                    </p>
                                </div>
                            ),
                            okText: "Got it",
                        });
                        return;
                    }
                }

                // Prepare review data
                const reviewData = {
                    type: requestType,
                    ...values,
                    employee: user?.name || "Employee",
                    employeeId: user?.employeeId || "EMP001",
                    department: user?.department || "Department",
                    position: user?.position || "Position",
                    signature: signatureFile,
                    travelDays: requestType === "travel" ? travelDays : null,
                    totalDays: requestType === "travel" ? calculateTotalDays() : null,
                    submitted: dayjs().format("YYYY-MM-DD HH:mm:ss"),
                    status: "pending",
                    approver: approvers.find((a) => a.id === selectedApprover)?.name || "Manager",
                    approverId: selectedApprover,
                    requestId: `REQ-${Date.now().toString().slice(-6)}`,
                };

                setReviewData(reviewData);
                setCurrentStep(1);
            }
        } catch (error) {
            console.log("Validation failed:", error);
            if (error.errorFields) {
                message.error("Please fill all required fields correctly");
            }
        }
    };

    // Handle previous step
    const handlePrev = () => {
        setCurrentStep(0);
    };

    // Handle form submission
    const handleSubmit = async () => {
        if (!reviewData) {
            message.error("No review data found");
            return;
        }

        // Format the data according to Laravel expectations
        const formData = new FormData();
        formData.append("group_id", activeGroup?.id);

        // Append basic request data
        formData.append("type", reviewData.type);
        const dateOfRequest = ensureDayjs(reviewData.dateOfRequest);
        if (dateOfRequest) {
            formData.append("date_of_request", dateOfRequest.format("YYYY-MM-DD"));
        }

        if (reviewData.approverId) {
            formData.append("approver_id", reviewData.approverId);
        }

        if (reviewData.type === "leave") {
            formData.append("reason", reviewData.reason || "");
            const timeOut = ensureDayjs(reviewData.timeOut);
            const expectedTimeIn = ensureDayjs(reviewData.expectedTimeIn);

            if (timeOut) {
                formData.append("time_out", timeOut.format("HH:mm:ss"));
            }
            if (expectedTimeIn) {
                formData.append("expected_time_in", expectedTimeIn.format("HH:mm:ss"));
            }
            if (reviewData.remarks) {
                formData.append("remarks", reviewData.remarks);
            }
        } else if (reviewData.type === "travel") {
            formData.append("purpose", reviewData.purpose || "");

            // Append travel days
            if (reviewData.travelDays) {
                reviewData.travelDays.forEach((day, index) => {
                    const from = ensureDayjs(day.from);
                    const to = ensureDayjs(day.to);
                    if (from && to) {
                        formData.append(
                            `travel_days[${index}][from]`,
                            from.format("YYYY-MM-DD"),
                        );
                        formData.append(
                            `travel_days[${index}][to]`,
                            to.format("YYYY-MM-DD"),
                        );
                        formData.append(
                            `travel_days[${index}][place_of_travel]`,
                            day.placeOfTravel || "",
                        );
                        formData.append(
                            `travel_days[${index}][transportation]`,
                            day.transportation || "",
                        );
                        formData.append(
                            `travel_days[${index}][per_diem]`,
                            day.perDiem || "0",
                        );
                    }
                });
            }
        }

        // Append signature file if exists
        if (signatureFile) {
            formData.append("signature", signatureFile);
        }
        
        setSubmitting(true);
        onSubmit(formData);
    };

    // Handle close drawer
    const handleClose = () => {
        if (!submitting) {
            setNewRequest(false);
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
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
        >
            <div className="request-type-selection">
                <Title level={4} style={{ textAlign: "center", marginBottom: 30 }}>
                    Select Request Type
                </Title>

                <Row gutter={[16, 16]} justify="center">
                    <Col xs={24} sm={24} md={12}>
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
                                    <Title level={3} style={{ margin: "16px 0 8px" }}>
                                        Leave of Office
                                    </Title>
                                    <Text type="secondary">
                                        Request for temporary absence from office during working hours
                                    </Text>
                                    <Divider style={{ margin: "16px 0" }} />
                                    <div className="type-features">
                                        <Text>• For appointments, meetings, or personal matters</Text>
                                        <Text>• During working hours only</Text>
                                        <Text>• Requires supervisor approval</Text>
                                    </div>
                                </div>
                            </Card>
                        </motion.div>
                    </Col>

                    <Col xs={24} sm={24} md={12}>
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
                                    <Title level={3} style={{ margin: "16px 0 8px" }}>
                                        Travel Order
                                    </Title>
                                    <Text type="secondary">
                                        Request for official travel outside the office premises
                                    </Text>
                                    <Divider style={{ margin: "16px 0" }} />
                                    <div className="type-features">
                                        <Text>• For business trips and official visits</Text>
                                        <Text>• Includes travel allowances</Text>
                                        <Text>• Requires detailed itinerary</Text>
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
    const renderLeaveForm = () => {
        // Handle Time Out selection
        const handleTimeOutChange = (time) => {
            const timeOut = ensureDayjs(time);
            if (!timeOut) {
                setShowExpectedTimeIn(false);
                form.setFieldsValue({ expectedTimeIn: null });
                return;
            }

            const dateOfRequest = form.getFieldValue("dateOfRequest");
            const dateOfRequestDayjs = ensureDayjs(dateOfRequest);
            const currentDate = dayjs();

            // If date is today, validate time is in the future
            if (dateOfRequestDayjs && dateOfRequestDayjs.isSame(currentDate, "day")) {
                const currentTime = dayjs();
                const fiveMinutesFromNow = currentTime.add(5, "minute");
                
                if (timeOut.isBefore(fiveMinutesFromNow, "minute")) {
                    message.warning(
                        "Time Out must be at least 5 minutes from now for today's request",
                    );

                    const correctedTimeOut = fiveMinutesFromNow;
                    form.setFieldsValue({ timeOut: correctedTimeOut });
                    const expectedTimeIn = correctedTimeOut.add(1, "hour");
                    form.setFieldsValue({ expectedTimeIn: expectedTimeIn });
                    setShowExpectedTimeIn(true);

                    setTimeout(() => {
                        form.validateFields(["expectedTimeIn"]);
                    }, 100);

                    return;
                }
            } else if (dateOfRequestDayjs && dateOfRequestDayjs.isAfter(currentDate, "day")) {
                // Date is in the future, no time validation needed
            } else {
                message.error("Selected date cannot be in the past");
                form.setFieldsValue({ timeOut: null });
                setShowExpectedTimeIn(false);
                return;
            }

            // Auto-calculate expected time in (1 hour after time out)
            const expectedTimeIn = timeOut.add(1, "hour");
            form.setFieldsValue({ expectedTimeIn: expectedTimeIn });
            setShowExpectedTimeIn(true);

            setTimeout(() => {
                form.validateFields(["expectedTimeIn"]);
            }, 100);
        };

        // Custom validator for Time Out
        const validateTimeOut = (_, value) => {
            const valueDayjs = ensureDayjs(value);

            if (!valueDayjs) {
                return Promise.reject(new Error("Please select Time Out"));
            }

            const dateOfRequest = form.getFieldValue("dateOfRequest");
            const dateOfRequestDayjs = ensureDayjs(dateOfRequest);
            const currentDate = dayjs();

            if (!dateOfRequestDayjs) {
                return Promise.reject(new Error("Please select Date of Request first"));
            }

            if (dateOfRequestDayjs.isSame(currentDate, "day")) {
                const currentTime = dayjs();
                const fiveMinutesFromNow = currentTime.add(5, "minute");

                if (valueDayjs.isBefore(fiveMinutesFromNow, "minute")) {
                    return Promise.reject(
                        new Error("Time Out must be at least 5 minutes from now for today's request"),
                    );
                }
            } else if (dateOfRequestDayjs.isBefore(currentDate, "day")) {
                return Promise.reject(new Error("Cannot select Time Out for a past date"));
            }

            return Promise.resolve();
        };

        // Handle Expected Time In selection
        const handleExpectedTimeInChange = (time) => {
            const expectedTimeIn = ensureDayjs(time);
            if (!expectedTimeIn) {
                form.setFieldsValue({ expectedTimeIn: null });
                return;
            }

            const timeOut = form.getFieldValue("timeOut");
            const dateOfRequest = form.getFieldValue("dateOfRequest");
            const currentDate = dayjs();

            const timeOutDayjs = ensureDayjs(timeOut);
            const dateOfRequestDayjs = ensureDayjs(dateOfRequest);

            if (!timeOutDayjs) {
                message.error("Please select Time Out first");
                form.setFieldsValue({ expectedTimeIn: null });
                return;
            }

            if (!dateOfRequestDayjs) {
                message.error("Please select Date of Request first");
                form.setFieldsValue({ expectedTimeIn: null });
                return;
            }

            // Create combined date-time objects for comparison
            const timeOutWithDate = dayjs(dateOfRequestDayjs)
                .set("hour", timeOutDayjs.hour())
                .set("minute", timeOutDayjs.minute())
                .set("second", 0);

            const expectedTimeInWithDate = dayjs(dateOfRequestDayjs)
                .set("hour", expectedTimeIn.hour())
                .set("minute", expectedTimeIn.minute())
                .set("second", 0);

            // Validate expected time in is after time out
            if (expectedTimeInWithDate.isSameOrBefore(timeOutWithDate)) {
                message.error("Expected Time In must be after Time Out");
                const minTime = timeOutDayjs.add(30, "minute");
                form.setFieldsValue({ expectedTimeIn: minTime });
                return;
            }

            // Validate expected time in is not too far in the future (max 8 hours)
            const maxAllowedTime = timeOutDayjs.add(8, "hour");
            if (expectedTimeIn.isAfter(maxAllowedTime)) {
                message.warning("Expected Time In cannot be more than 8 hours after Time Out");
                form.setFieldsValue({ expectedTimeIn: maxAllowedTime });
                return;
            }

            // If date is today, validate expected time in is in the future
            if (dateOfRequestDayjs.isSame(currentDate, "day")) {
                const currentTime = dayjs();
                if (expectedTimeIn.isBefore(currentTime, "minute")) {
                    message.warning("Expected Time In must be in the future for today's request");
                    const suggestedTime = currentTime.add(15, "minute");

                    if (suggestedTime.isAfter(timeOutDayjs)) {
                        form.setFieldsValue({ expectedTimeIn: suggestedTime });
                    } else {
                        const minTime = timeOutDayjs.add(30, "minute");
                        form.setFieldsValue({ expectedTimeIn: minTime });
                    }
                    return;
                }
            }

            setTimeout(() => {
                form.validateFields(["expectedTimeIn"]);
            }, 50);
        };

        // Custom validator for Expected Time In
        const validateExpectedTimeIn = (_, value) => {
            const timeOut = form.getFieldValue("timeOut");
            const dateOfRequest = form.getFieldValue("dateOfRequest");
            const currentDate = dayjs();

            const timeOutDayjs = ensureDayjs(timeOut);
            const dateOfRequestDayjs = ensureDayjs(dateOfRequest);
            const valueDayjs = ensureDayjs(value);

            if (!dateOfRequestDayjs) {
                return Promise.reject(new Error("Please select Date of Request first"));
            }

            if (!timeOutDayjs) {
                return Promise.reject(new Error("Please select Time Out first"));
            }

            if (!valueDayjs) {
                return Promise.reject(new Error("Please select Expected Time In"));
            }

            // Create combined date-time objects for comparison
            const timeOutWithDate = dayjs(dateOfRequestDayjs)
                .set("hour", timeOutDayjs.hour())
                .set("minute", timeOutDayjs.minute())
                .set("second", 0);

            const expectedTimeInWithDate = dayjs(dateOfRequestDayjs)
                .set("hour", valueDayjs.hour())
                .set("minute", valueDayjs.minute())
                .set("second", 0);

            if (expectedTimeInWithDate.isSameOrBefore(timeOutWithDate)) {
                return Promise.reject(new Error("Expected Time In must be after Time Out"));
            }

            const minTime = timeOutDayjs.add(30, "minute");
            if (valueDayjs.isBefore(minTime)) {
                return Promise.reject(
                    new Error("Expected Time In should be at least 30 minutes after Time Out"),
                );
            }

            const maxTime = timeOutDayjs.add(8, "hour");
            if (valueDayjs.isAfter(maxTime)) {
                return Promise.reject(
                    new Error("Expected Time In cannot be more than 8 hours after Time Out"),
                );
            }

            if (dateOfRequestDayjs.isSame(currentDate, "day")) {
                const currentTime = dayjs();
                if (valueDayjs.isBefore(currentTime, "minute")) {
                    return Promise.reject(
                        new Error("Expected Time In must be in the future for today's request"),
                    );
                }
            }

            return Promise.resolve();
        };

        // Get current time and calculate default times
        const currentTime = dayjs();
        const defaultTimeOut = currentTime.add(30, "minute");
        const defaultExpectedTimeIn = defaultTimeOut.add(1, "hour");

        return (
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
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
                        timeOut: defaultTimeOut,
                        expectedTimeIn: defaultExpectedTimeIn,
                    }}
                    onValuesChange={(changedValues, allValues) => {
                        if (changedValues.dateOfRequest !== undefined) {
                            const newDate = ensureDayjs(changedValues.dateOfRequest);
                            const currentDate = dayjs();

                            if (newDate && newDate.isSame(currentDate, "day")) {
                                const currentTime = dayjs();
                                const timeOut = allValues.timeOut;
                                const timeOutDayjs = ensureDayjs(timeOut);

                                if (timeOutDayjs && timeOutDayjs.isBefore(currentTime)) {
                                    const newTimeOut = currentTime.add(30, "minute");
                                    const newExpectedTimeIn = newTimeOut.add(1, "hour");

                                    form.setFieldsValue({
                                        timeOut: newTimeOut,
                                        expectedTimeIn: newExpectedTimeIn,
                                    });
                                    setShowExpectedTimeIn(true);
                                }
                            }
                        }

                        if (changedValues.timeOut !== undefined) {
                            const timeOutValue = changedValues.timeOut;
                            setShowExpectedTimeIn(!!timeOutValue);
                        }
                    }}
                >
                    <Form.Item
                        name="dateOfRequest"
                        label="Date of Request"
                        rules={[
                            { required: true, message: "Please select date of request" },
                            {
                                validator: (_, value) => {
                                    const valueDayjs = ensureDayjs(value);
                                    if (!valueDayjs) {
                                        return Promise.reject(new Error("Please select a valid date"));
                                    }

                                    const today = dayjs().startOf("day");
                                    const maxDate = dayjs().add(30, "days");

                                    if (valueDayjs.isBefore(today)) {
                                        return Promise.reject(new Error("Date cannot be in the past"));
                                    }

                                    if (valueDayjs.isAfter(maxDate)) {
                                        return Promise.reject(
                                            new Error("Date cannot be more than 30 days in the future"),
                                        );
                                    }

                                    return Promise.resolve();
                                },
                            },
                        ]}
                    >
                        <DatePicker
                            style={{ width: "100%" }}
                            format="MMMM DD, YYYY"
                            placeholder="Select today or a future date (within 30 days)"
                            allowClear={false}
                        />
                    </Form.Item>

                    <Form.Item
                        name="reason"
                        label="Reason of Request"
                        rules={[
                            { required: true, message: "Please provide reason" },
                            { min: 10, message: "Reason must be at least 10 characters" },
                            { max: 500, message: "Reason cannot exceed 500 characters" },
                        ]}
                    >
                        <TextArea
                            rows={3}
                            placeholder="Enter detailed reason for leaving the office (minimum 10 characters)..."
                            maxLength={500}
                            showCount
                        />
                    </Form.Item>

                    <Row gutter={16}>
                        <Col xs={24} sm={24} md={12}>
                            <Form.Item
                                name="timeOut"
                                label="Time Out"
                                rules={[
                                    { required: true, message: "Please select time out" },
                                    { validator: validateTimeOut },
                                ]}
                            >
                                <TimePicker
                                    style={{ width: "100%" }}
                                    format="h:mm A"
                                    placeholder="Select time out"
                                    use12Hours
                                    minuteStep={15}
                                    onChange={handleTimeOutChange}
                                    showNow={false}
                                    allowClear={false}
                                />
                            </Form.Item>
                        </Col>
                        <Col xs={24} sm={24} md={12}>
                            <Form.Item
                                name="expectedTimeIn"
                                label={
                                    <span>
                                        Expected Time In
                                        <Text type="secondary" style={{ fontSize: "12px", marginLeft: 4 }}>
                                            (Auto-filled)
                                        </Text>
                                    </span>
                                }
                                rules={[
                                    { required: true, message: "Please select expected time in" },
                                    { validator: validateExpectedTimeIn },
                                ]}
                            >
                                <TimePicker
                                    style={{ width: "100%" }}
                                    format="h:mm A"
                                    placeholder="Will auto-fill after Time Out"
                                    use12Hours
                                    minuteStep={15}
                                    onChange={handleExpectedTimeInChange}
                                    //disabled={!showExpectedTimeIn}
                                    showNow={false}
                                    allowClear={false}
                                />
                            </Form.Item>
                        </Col>
                    </Row>

                    {/* Time Difference Display */}
                    <Form.Item shouldUpdate>
                        {() => {
                            const timeOut = form.getFieldValue("timeOut");
                            const expectedTimeIn = form.getFieldValue("expectedTimeIn");

                            const timeOutDayjs = ensureDayjs(timeOut);
                            const expectedTimeInDayjs = ensureDayjs(expectedTimeIn);

                            let durationText = "Not calculated";
                            let isValid = false;

                            if (timeOutDayjs && expectedTimeInDayjs && expectedTimeInDayjs.isAfter(timeOutDayjs)) {
                                isValid = true;
                                const hours = expectedTimeInDayjs.diff(timeOutDayjs, "hour", true);

                                if (hours < 1) {
                                    const minutes = expectedTimeInDayjs.diff(timeOutDayjs, "minute");
                                    durationText = `${minutes} minutes`;
                                } else if (hours < 24) {
                                    const hoursInt = Math.floor(hours);
                                    const minutes = Math.round((hours - hoursInt) * 60);
                                    durationText = minutes > 0 ? `${hoursInt}h ${minutes}m` : `${hoursInt} hours`;
                                } else {
                                    durationText = "More than 24 hours (Please verify)";
                                }
                            }

                            return (
                                <div className="time-difference-display" style={{ marginBottom: 16 }}>
                                    <Card size="small">
                                        <Space>
                                            <ClockCircleOutlined />
                                            <Text type="secondary">Estimated Duration:</Text>
                                            <Text strong style={{ color: isValid ? "#1890ff" : "#999" }}>
                                                {durationText}
                                            </Text>
                                        </Space>
                                    </Card>
                                </div>
                            );
                        }}
                    </Form.Item>

                    <Form.Item
                        name="remarks"
                        label="Additional Remarks (Optional)"
                        rules={[{ max: 200, message: "Remarks cannot exceed 200 characters" }]}
                    >
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
    };

    // Render travel order form
    const renderTravelForm = () => (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
        >
            <Title level={4} style={{ marginBottom: 24 }}>
                Travel Order Request
            </Title>

            <Form
                form={form}
                layout="vertical"
                initialValues={{ dateOfRequest: dayjs() }}
            >
                <Form.Item
                    name="dateOfRequest"
                    label="Date of Request"
                    rules={[{ required: true, message: "Please select date of request" }]}
                >
                    <DatePicker
                        style={{ width: "100%" }}
                        format="MMMM DD, YYYY"
                        disabled
                    />
                </Form.Item>

                <Form.Item
                    name="purpose"
                    label="Purpose of Travel"
                    rules={[{ required: true, message: "Please enter purpose of travel" }]}
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
                        <Button type="dashed" onClick={addTravelDay} block={window.innerWidth < 768}>
                            Add Another Day
                        </Button>
                    </div>

                    <AnimatePresence>
                        {travelDays.map((day, index) => (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: "auto" }}
                                exit={{ opacity: 0, height: 0 }}
                                transition={{ duration: 0.2 }}
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
                                                onClick={() => removeTravelDay(index)}
                                            >
                                                Remove
                                            </Button>
                                        )
                                    }
                                >
                                    <Row gutter={[16, 16]}>
                                        <Col span={24}>
                                            <div className="day-label">
                                                Travel Details for Day {index + 1}
                                            </div>
                                        </Col>

                                        <Col xs={24} sm={24} md={24}>
                                            <Form.Item
                                                name={["travelDays", index, "placeOfTravel"]}
                                                label="Place of Travel"
                                                rules={[{ required: true, message: "Please enter place of travel" }]}
                                            >
                                                <Input
                                                    placeholder="Enter destination city/province"
                                                    prefix={<EnvironmentOutlined />}
                                                    value={day.placeOfTravel}
                                                    onChange={(e) => {
                                                        const newDays = [...travelDays];
                                                        newDays[index].placeOfTravel = e.target.value;
                                                        setTravelDays(newDays);
                                                    }}
                                                />
                                            </Form.Item>
                                        </Col>

                                        <Col span={24}>
                                            <div className="day-label">Date of Travel</div>
                                        </Col>
                                        
                                        <Col xs={24} sm={12} md={12}>
                                            <Form.Item
                                                name={["travelDays", index, "from"]}
                                                label="From"
                                                rules={[{ required: true, message: "Please select start date" }]}
                                            >
                                                <DatePicker
                                                    style={{ width: "100%" }}
                                                    format="MMMM DD, YYYY"
                                                    placeholder="Start date"
                                                    value={day.from}
                                                    onChange={(date) => {
                                                        const newDays = [...travelDays];
                                                        newDays[index].from = date;
                                                        setTravelDays(newDays);
                                                    }}
                                                />
                                            </Form.Item>
                                        </Col>
                                        
                                        <Col xs={24} sm={12} md={12}>
                                            <Form.Item
                                                name={["travelDays", index, "to"]}
                                                label="To"
                                                rules={[
                                                    { required: true, message: "Please select end date" },
                                                    ({ getFieldValue }) => ({
                                                        validator(_, value) {
                                                            const fromDate = getFieldValue([
                                                                "travelDays",
                                                                index,
                                                                "from",
                                                            ]);
                                                            if (!fromDate || !value || value.isSameOrAfter(fromDate)) {
                                                                return Promise.resolve();
                                                            }
                                                            return Promise.reject(
                                                                new Error("End date must be after or equal to start date"),
                                                            );
                                                        },
                                                    }),
                                                ]}
                                            >
                                                <DatePicker
                                                    style={{ width: "100%" }}
                                                    format="MMMM DD, YYYY"
                                                    placeholder="End date"
                                                    value={day.to}
                                                    onChange={(date) => {
                                                        const newDays = [...travelDays];
                                                        newDays[index].to = date;
                                                        setTravelDays(newDays);
                                                    }}
                                                />
                                            </Form.Item>
                                        </Col>
                                        
                                        <Col xs={24} sm={12} md={12}>
                                            <Form.Item
                                                name={["travelDays", index, "transportation"]}
                                                label="Transportation"
                                                rules={[{ required: true, message: "Please select transportation" }]}
                                            >
                                                <Select
                                                    placeholder="Select transportation"
                                                    value={day.transportation}
                                                    onChange={(value) => {
                                                        const newDays = [...travelDays];
                                                        newDays[index].transportation = value;
                                                        setTravelDays(newDays);
                                                    }}
                                                >
                                                    {TRANSPORTATION_OPTIONS.map((option) => (
                                                        <Option key={option.value} value={option.value}>
                                                            {option.label}
                                                        </Option>
                                                    ))}
                                                </Select>
                                            </Form.Item>
                                        </Col>
                                        
                                        <Col xs={24} sm={12} md={12}>
                                            <Form.Item
                                                name={["travelDays", index, "perDiem"]}
                                                label="Per Diem (PHP)"
                                                rules={[
                                                    { required: true, message: "Please enter per diem amount" },
                                                    { pattern: /^\d+(\.\d{1,2})?$/, message: "Please enter a valid amount (e.g., 100.50)" },
                                                ]}
                                            >
                                                <Input
                                                    type="number"
                                                    placeholder="Amount"
                                                    prefix="₱"
                                                    step="0.01"
                                                    min="0"
                                                    value={day.perDiem}
                                                    onChange={(e) => {
                                                        const newDays = [...travelDays];
                                                        newDays[index].perDiem = e.target.value;
                                                        setTravelDays(newDays);
                                                    }}
                                                />
                                            </Form.Item>
                                        </Col>
                                    </Row>
                                </Card>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </div>

                {/* Total Days Calculation */}
                <div className="total-days-display">
                    <Card size="small">
                        <Space>
                            <Text strong>Total Days of Travel:</Text>
                            <Tag color="blue" style={{ fontSize: "16px", padding: "4px 12px" }}>
                                {calculateTotalDays()} days
                            </Tag>
                        </Space>
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
                exit={{ opacity: 0, y: -20 }}
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
                                color={reviewData.type === "leave" ? "blue" : "green"}
                                style={{ fontSize: "14px", padding: "4px 12px" }}
                            >
                                {reviewData.type === "leave" ? "LEAVE OF OFFICE" : "TRAVEL ORDER"}
                            </Tag>
                            <Text strong>Request ID: {reviewData.requestId}</Text>
                        </div>
                        <Divider />
                    </div>

                    {/* Employee Information */}
                    <div className="employee-info-review">
                        <Descriptions column={{ xs: 1, sm: 2, md: 2 }} size="small">
                            <Descriptions.Item label="Employee">{reviewData.employee}</Descriptions.Item>
                            <Descriptions.Item label="Employee ID">{reviewData.employeeId}</Descriptions.Item>
                            <Descriptions.Item label="Department">{reviewData.department}</Descriptions.Item>
                            <Descriptions.Item label="Position">{reviewData.position}</Descriptions.Item>
                            <Descriptions.Item label="Date Submitted">
                                {dayjs(reviewData.submitted).format("MMMM DD, YYYY HH:mm")}
                            </Descriptions.Item>
                            <Descriptions.Item label="Approver">{reviewData.approver}</Descriptions.Item>
                        </Descriptions>
                    </div>

                    <Divider />

                    {/* Request Details */}
                    <div className="request-details-review">
                        {reviewData.type === "leave" ? (
                            <>
                                <Title level={5}>Leave of Office Details</Title>
                                <Descriptions column={{ xs: 1, sm: 1, md: 1 }} size="small">
                                    <Descriptions.Item label="Date of Request">
                                        {ensureDayjs(reviewData.dateOfRequest).format("MMMM DD, YYYY")}
                                    </Descriptions.Item>
                                    <Descriptions.Item label="Reason">{reviewData.reason}</Descriptions.Item>
                                    <Descriptions.Item label="Time Out">
                                        {ensureDayjs(reviewData.timeOut).format("HH:mm")}
                                    </Descriptions.Item>
                                    <Descriptions.Item label="Expected Time In">
                                        {ensureDayjs(reviewData.expectedTimeIn).format("HH:mm")}
                                    </Descriptions.Item>
                                    {reviewData.remarks && (
                                        <Descriptions.Item label="Remarks">{reviewData.remarks}</Descriptions.Item>
                                    )}
                                </Descriptions>
                            </>
                        ) : (
                            <>
                                <Title level={5}>Travel Order Details</Title>
                                <Descriptions column={{ xs: 1, sm: 1, md: 1 }} size="small">
                                    <Descriptions.Item label="Date of Request">
                                        {ensureDayjs(reviewData.dateOfRequest).format("MMMM DD, YYYY")}
                                    </Descriptions.Item>
                                    <Descriptions.Item label="Purpose of Travel">
                                        {reviewData.purpose}
                                    </Descriptions.Item>
                                    <Descriptions.Item label="Total Days of Travel">
                                        <Tag color="blue">{reviewData.totalDays} days</Tag>
                                    </Descriptions.Item>
                                </Descriptions>

                                {/* Travel Itinerary */}
                                <Title level={5} style={{ marginTop: 16 }}>
                                    Travel Itinerary
                                </Title>
                                {reviewData.travelDays?.map((day, index) => (
                                    <Card key={index} size="small" style={{ marginBottom: 8 }}>
                                        <Descriptions column={{ xs: 1, sm: 2, md: 2 }} size="small">
                                            <Descriptions.Item label="Place of Travel">
                                                {day.placeOfTravel}
                                            </Descriptions.Item>
                                            <Descriptions.Item label="Date of Travel">
                                                {ensureDayjs(day.from).format("MMM DD")} -{" "}
                                                {ensureDayjs(day.to).format("MMM DD, YYYY")}
                                            </Descriptions.Item>
                                            <Descriptions.Item label="Duration">
                                                {ensureDayjs(day.to).diff(ensureDayjs(day.from), "day") + 1} days
                                            </Descriptions.Item>
                                            <Descriptions.Item label="Transportation">
                                                {getTransportationLabel(day.transportation)}
                                            </Descriptions.Item>
                                            <Descriptions.Item label="Per Diem">
                                                ₱{parseFloat(day.perDiem).toFixed(2)}
                                            </Descriptions.Item>
                                        </Descriptions>
                                    </Card>
                                ))}
                            </>
                        )}
                    </div>

                    <Divider />
                </Card>
            </motion.div>
        );
    };

    return (
        <Drawer
            title={
                <div className="request-drawer-header">
                    <div className="drawer-title-content">
                        <div>
                            <h2 style={{ margin: 0 }}>New Request</h2>
                            <p style={{ margin: 0, color: "var(--text-secondary)" }}>
                                Submit Leave of Office or Travel Order request
                            </p>
                        </div>
                    </div>
                </div>
            }
            placement="right"
            width={window.innerWidth <= 768 ? "100%" : 800}
            onClose={handleClose}
            open={newRequest}
            className="request-drawer"
            destroyOnClose
            closable={!submitting}
            maskClosable={!submitting}
            footer={
                <div className="drawer-actions">
                    {currentStep === 0 ? (
                        <Space style={{ width: "100%", justifyContent: "flex-end" }}>
                            <Button onClick={handleClose} disabled={loading || submitting}>
                                Cancel
                            </Button>
                            {requestType && (
                                <Button
                                    type="primary"
                                    icon={<ArrowRightOutlined />}
                                    onClick={handleNext}
                                    disabled={loading || submitting}
                                >
                                    {loading ? <LoadingOutlined spin /> : "Next: Review Request"}
                                </Button>
                            )}
                        </Space>
                    ) : (
                        <Space style={{ width: "100%", justifyContent: "space-between" }}>
                            <Button icon={<ArrowLeftOutlined />} onClick={handlePrev} disabled={submitting}>
                                Back to Edit
                            </Button>
                            <Space>
                                <Button onClick={handleClose} disabled={submitting}>
                                    Cancel
                                </Button>
                                <Button
                                    type="primary"
                                    icon={submitting ? <LoadingOutlined spin /> : <CheckCircleOutlined />}
                                    onClick={handleSubmit}
                                    loading={submitting}
                                    disabled={submitting}
                                >
                                    {submitting ? "Submitting..." : "Submit Request"}
                                </Button>
                            </Space>
                        </Space>
                    )}
                </div>
            }
        >
            <Spin spinning={loading} tip="Loading...">
                <div className="request-drawer-container">
                    {/* Steps */}
                    <Steps current={currentStep} style={{ marginBottom: 24 }} responsive>
                        {steps.map((item) => (
                            <Step key={item.title} title={item.title} description={item.content} />
                        ))}
                    </Steps>

                    {/* Content based on step */}
                    <div className="drawer-content">
                        <AnimatePresence mode="wait">
                            {currentStep === 0 ? (
                                <React.Fragment key="step0">
                                    {!requestType ? (
                                        renderTypeSelection()
                                    ) : (
                                        <>
                                            {requestType === "leave" ? renderLeaveForm() : renderTravelForm()}
                                        </>
                                    )}
                                </React.Fragment>
                            ) : (
                                <React.Fragment key="step1">{renderReviewStep()}</React.Fragment>
                            )}
                        </AnimatePresence>
                    </div>
                </div>
            </Spin>
        </Drawer>
    );
};

export default RequestDrawer;