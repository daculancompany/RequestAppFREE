import React, { useState, useEffect } from "react";
import {
    Form,
    Input,
    Button,
    Card,
    Typography,
    Space,
    Alert,
    Layout,
    Row,
    Col,
    message,
    ConfigProvider,
    theme as antTheme,
} from "antd";
import {
    UserOutlined,
    LockOutlined,
    DashboardOutlined,
} from "@ant-design/icons";
import { useNavigate, useLocation } from "react-router-dom";
import { authService } from "../services/auth";
import "@/styles/themes.scss";
import "@/styles/Login.scss";
const { defaultAlgorithm, darkAlgorithm } = antTheme;

const { Title, Text, Link } = Typography;
const { Content } = Layout;

const Login = () => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const navigate = useNavigate();
    const location = useLocation();

    const onFinish = async (values) => {
        setLoading(true);
        setError("");

        try {
            const result = await authService.login(
                values.email,
                values.password,
            );

            if (result.success) {
                message.success("Login successful! Welcome back.");
                setTimeout(() => {
                    window.location.href = "/";
                }, 1000);
                // const from = location.state?.from?.pathname || "/dashboard";
                // navigate(from, { replace: true });
            } else {
                setError(result.message || "Invalid email or password");
            }
        } catch (err) {
            setError("Unable to connect. Please check your network.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const darkTheme = "dark";
        document.body.className = darkTheme;
        document.documentElement.setAttribute("data-theme", darkTheme);
    }, []); 

    return (
        <ConfigProvider
            theme={{
                algorithm: darkAlgorithm,
                token: {
                    colorPrimary: "#60a5fa", // Default dark theme blue
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
            <Layout className="login-layout">
                <Content className="login-content">
                    <Row
                        justify="center"
                        align="middle"
                        className="full-height"
                    >
                        <Col xs={22} sm={16} md={12} lg={8} xl={6}>
                            <Card className="login-card" bordered={false}>
                                <div className="login-header">
                                    <div className="login-logo-wrapper">
                                        <img
                                            width={70}
                                            src="https://sso.sss.gov.ph/wsso/assets/common/images/sss/ssslogov2.png"
                                            alt="SSS Logo"
                                        />
                                    </div>
                                    <Title level={3} className="login-title">
                                        Legal Hub
                                    </Title>
                                    <Text
                                        type="secondary"
                                        className="login-subtitle"
                                    >
                                        Enter your credentials to continue
                                    </Text>
                                </div>

                                {error && (
                                    <Alert
                                        message="Login Failed"
                                        description={error}
                                        type="error"
                                        showIcon
                                        className="login-alert"
                                        closable
                                        onClose={() => setError("")}
                                    />
                                )}

                                <Form
                                    name="login"
                                    onFinish={onFinish}
                                    layout="vertical"
                                    className="login-form"
                                    initialValues={{ remember: true }}
                                >
                                    <Form.Item
                                        name="email"
                                        rules={[
                                            {
                                                required: true,
                                                message: "Email is required",
                                            },
                                            {
                                                type: "email",
                                                message:
                                                    "Please enter a valid email",
                                            },
                                        ]}
                                    >
                                        <Input
                                            prefix={<UserOutlined />}
                                            placeholder="Email address"
                                            autoComplete="email"
                                            size="large"
                                        />
                                    </Form.Item>

                                    <Form.Item
                                        name="password"
                                        rules={[
                                            {
                                                required: true,
                                                message: "Password is required",
                                            },
                                        ]}
                                    >
                                        <Input.Password
                                            prefix={<LockOutlined />}
                                            placeholder="Password"
                                            autoComplete="current-password"
                                            size="large"
                                        />
                                    </Form.Item>

                                    {/* <div className="login-options">
                                    <Checkbox className="remember-checkbox">
                                        Remember me
                                    </Checkbox>
                                    <Link className="forgot-link" href="/forgot-password">
                                        Forgot password?
                                    </Link>
                                </div> */}

                                    <Form.Item>
                                        <Button
                                            type="primary"
                                            htmlType="submit"
                                            loading={loading}
                                            block
                                            size="large"
                                            className="login-button"
                                        >
                                            {loading
                                                ? "Signing in..."
                                                : "Sign in"}
                                        </Button>
                                    </Form.Item>

                                    {/* <div className="login-footer">
                                    <Text type="secondary">
                                        Don't have an account?{" "}
                                        <Link href="/register">Contact admin</Link>
                                    </Text>
                                </div> */}
                                </Form>
                            </Card>
                        </Col>
                    </Row>
                </Content>
            </Layout>
        </ConfigProvider>
    );
};

export default Login;
