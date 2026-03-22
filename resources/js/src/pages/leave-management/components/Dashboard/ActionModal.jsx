import React, { memo, useState } from "react";
import {
    Drawer,
    Button,
    Avatar,
    Alert,
    Input,
    Space,
    Checkbox,
    Typography,
    Divider,
    message,
} from "antd";
import {
    CheckCircleOutlined,
    CloseCircleOutlined,
    PrinterOutlined,
} from "@ant-design/icons";

const { Text } = Typography;
const { TextArea } = Input;

const ActionDrawer = memo(
    ({
        action,
        request,
        visible,
        comment,
        onCommentChange,
        onCancel,
        onSubmit,
        loading = false, 
    }) => {
        const actionConfig = {
            approve: {
                color: "#52c41a",
                icon: <CheckCircleOutlined />,
                text: "Approve",
                quickTemplates: [
                    "Approved. Enjoy your time off!",
                    "Approved. Have a safe trip!",
                    "Request approved. Please ensure all work is completed.",
                    "Approved pending documentation submission.",
                    "Approved. Please share updates upon return.",
                ],
            },
            reject: {
                color: "#ff4d4f",
                icon: <CloseCircleOutlined />,
                text: "Reject",
                quickTemplates: [
                    "Rejected due to scheduling conflict.",
                    "Please provide more information before approval.",
                    "Request rejected at this time.",
                    "Not approved due to policy restrictions.",
                    "Rejected. Please discuss with your manager.",
                ],
            },
        };

        const config = actionConfig[action];
        const [notifyEmployee, setNotifyEmployee] = useState(true);
        const [notifyTeam, setNotifyTeam] = useState(false);
        const [printApproved, setPrintApproved] = useState(false);

        const handlePrint = () => {
            message.success({
                content: `Printing approved request: ${request.request_id}`,
                icon: <PrinterOutlined />,
                duration: 3,
            });
        };

        const handleSubmit = () => {
            if (action === "approve" && printApproved) {
                handlePrint();
            }
            onSubmit(action);
        };

        return (
            <Drawer
                title={
                    <div
                        style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 12,
                        }}
                    >
                        <div
                            style={{
                                width: 48,
                                height: 48,
                                borderRadius: "50%",
                                background: config.color,
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                color: "#fff",
                                fontSize: 24,
                            }}
                        >
                            {config.icon}
                        </div>
                        <div>
                            <div
                                style={{
                                    fontSize: 18,
                                    fontWeight: 600,
                                    color: "var(--text-primary)",
                                }}
                            >
                                {config.text} Request
                            </div>
                            <div
                                style={{
                                    fontSize: 13,
                                    color: "var(--text-secondary)",
                                }}
                            >
                                {request.request_id} • {request.user?.name}
                            </div>
                        </div>
                    </div>
                }
                open={visible}
                onClose={onCancel}
                width={520}
                destroyOnClose
                footer={
                    <div style={{ display: "flex", justifyContent: "flex-end", gap: 8 }}>
                        <Button 
                            onClick={onCancel} 
                            size="large"
                            disabled={loading}
                        >
                            Cancel
                        </Button>
                        <Button
                            type="primary"
                            onClick={handleSubmit}
                            size="large"
                            loading={loading}
                            style={{
                                background: `linear-gradient(135deg, ${config.color}, ${action === "approve" ? "#73d13d" : "#ff7875"})`,
                                border: "none",
                                fontWeight: 500,
                            }}
                        >
                            {config.text} Request
                        </Button>
                    </div>
                }
                footerStyle={{
                    borderTop: "1px solid var(--border-color)",
                    padding: "16px 24px",
                }}
            >
                <div className="action-drawer-content">
                    <Alert
                        message={
                            <div>
                                <div
                                    style={{
                                        display: "flex",
                                        alignItems: "center",
                                        gap: 8,
                                        marginBottom: 8,
                                    }}
                                >
                                    <Avatar
                                        size="small"
                                        src={request.user?.avatar}
                                    />
                                    <div>
                                        <Text strong style={{ fontSize: 14 }}>
                                            {request.user?.name}
                                        </Text>
                                        <div
                                            style={{
                                                fontSize: 12,
                                                color: "#666",
                                            }}
                                        >
                                            {request.user?.position}
                                        </div>
                                    </div>
                                </div>
                                <div
                                    style={{
                                        fontSize: "13px",
                                        color: "#666",
                                        marginTop: 8,
                                    }}
                                >
                                    {request.type === "leave"
                                        ? `Leave: ${request.reason}`
                                        : `Travel: ${request.place_of_travel}`}
                                </div>
                            </div>
                        }
                        type="info"
                        showIcon
                        style={{ marginBottom: 24 }}
                    />

                    <div style={{ marginBottom: 24 }}>
                        <Text
                            strong
                            style={{
                                display: "block",
                                marginBottom: 8,
                                color: "var(--text-primary)",
                            }}
                        >
                            Add a comment (optional):
                        </Text>
                        <TextArea
                            rows={4}
                            placeholder={`Add a comment for ${action === "approve" ? "approval" : "rejection"}...`}
                            value={comment}
                            onChange={(e) => onCommentChange(e.target.value)}
                            style={{ marginBottom: 12 }}
                            disabled={loading}
                        />

                        <Text
                            strong
                            style={{
                                display: "block",
                                marginBottom: 8,
                                fontSize: 13,
                                color: "var(--text-secondary)",
                            }}
                        >
                            Quick templates:
                        </Text>
                        <div
                            style={{
                                display: "flex",
                                gap: 8,
                                flexWrap: "wrap",
                                marginBottom: 16,
                            }}
                        >
                            {config.quickTemplates.map((template, index) => (
                                <Button
                                    key={index}
                                    size="small"
                                    onClick={() => onCommentChange(template)}
                                    style={{ fontSize: 12 }}
                                    disabled={loading}
                                >
                                    {template}
                                </Button>
                            ))}
                        </div>
                    </div>

                    {/* Notification Settings Section - Uncomment if needed */}
                    {/* <div
                        style={{
                            marginTop: 24,
                            paddingTop: 16,
                            borderTop: "1px solid var(--border-color)",
                        }}
                    >
                        <Text
                            strong
                            style={{
                                display: "block",
                                marginBottom: 12,
                                color: "var(--text-primary)",
                            }}
                        >
                            Notification Settings:
                        </Text>
                        <Space direction="vertical" style={{ width: "100%" }}>
                            <Checkbox
                                checked={notifyEmployee}
                                onChange={(e) =>
                                    setNotifyEmployee(e.target.checked)
                                }
                                disabled={loading}
                            >
                                Notify the employee via email
                            </Checkbox>
                            <Checkbox
                                checked={notifyTeam}
                                onChange={(e) =>
                                    setNotifyTeam(e.target.checked)
                                }
                                disabled={loading}
                            >
                                Also notify team members
                            </Checkbox>
                            <Checkbox defaultChecked disabled={loading}>
                                Add to request history
                            </Checkbox>
                            
                            {action === "approve" && (
                                <>
                                    <Divider style={{ margin: "12px 0" }} />
                                    <Checkbox
                                        checked={printApproved}
                                        onChange={(e) =>
                                            setPrintApproved(e.target.checked)
                                        }
                                        disabled={loading}
                                    >
                                        <Space>
                                            <PrinterOutlined style={{ color: "#52c41a" }} />
                                            <Text>Print after approval</Text>
                                        </Space>
                                    </Checkbox>
                                </>
                            )}
                        </Space>
                    </div> */}
                </div>
            </Drawer>
        );
    },
);

ActionDrawer.displayName = "ActionDrawer";

export default ActionDrawer;