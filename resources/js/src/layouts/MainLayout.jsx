import React, { useState, useEffect } from "react";
import {
    Layout,
    Menu,
    Button,
    theme,
    Typography,
    Grid,
    Avatar,
    Badge,
    Dropdown,
    Space,
    Divider,
    Tooltip,
    ConfigProvider,
    Switch,
    ColorPicker,
    message,
} from "antd";
import {
    MenuFoldOutlined,
    MenuUnfoldOutlined,
    DashboardOutlined,
    UserOutlined,
    SettingOutlined,
    FileTextOutlined,
    ShoppingCartOutlined,
    BarChartOutlined,
    TeamOutlined,
    WalletOutlined,
    BellOutlined,
    LogoutOutlined,
    SearchOutlined,
    MoonOutlined,
    SunOutlined,
    HomeOutlined,
    AppstoreOutlined,
    BarChartOutlined as AnalyticsIcon,
    SkinOutlined,
    DownOutlined,
    CheckOutlined,
} from "@ant-design/icons";
import { Link, useLocation, useNavigate } from "react-router-dom";
import "../assets/main.scss";

const { Header, Sider, Content } = Layout;
const { Title, Text } = Typography;
const { useBreakpoint } = Grid;

// Theme configuration presets
const themePresets = {
    default: {
        name: "Default",
        primaryColor: "#1890ff",
        borderRadius: 8,
        colorBgBase: "#ffffff",
        algorithm: "default",
    },
    dark: {
        name: "Dark",
        primaryColor: "#177ddc",
        borderRadius: 8,
        colorBgBase: "#141414",
        algorithm: "dark",
    },
    purple: {
        name: "Purple",
        primaryColor: "#722ed1",
        borderRadius: 8,
        colorBgBase: "#ffffff",
        algorithm: "default",
    },
    green: {
        name: "Green",
        primaryColor: "#52c41a",
        borderRadius: 8,
        colorBgBase: "#ffffff",
        algorithm: "default",
    },
    orange: {
        name: "Orange",
        primaryColor: "#fa8c16",
        borderRadius: 8,
        colorBgBase: "#ffffff",
        algorithm: "default",
    },
};

// LocalStorage keys
const STORAGE_KEYS = {
    THEME_CONFIG: "adminpro_theme_config",
    SIDEBAR_COLLAPSED: "adminpro_sidebar_collapsed",
    DARK_MODE: "adminpro_dark_mode",
};

// Save to localStorage
const saveToLocalStorage = (key, value) => {
    try {
        localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
        console.error("Error saving to localStorage:", error);
    }
};

// Load from localStorage
const loadFromLocalStorage = (key, defaultValue) => {
    try {
        const item = localStorage.getItem(key);
        return item ? JSON.parse(item) : defaultValue;
    } catch (error) {
        console.error("Error loading from localStorage:", error);
        return defaultValue;
    }
};

export default function MainLayout({ children }) {
    const navigate = useNavigate();
    const location = useLocation();
    const screens = useBreakpoint();

    // Check if user is authenticated
    useEffect(() => {
        // const user = localStorage.getItem("adminpro_user");
        // const token = localStorage.getItem("adminpro_token");

        // if (!user || !token) {
        //     navigate("/login");
        // }
    }, [navigate, location.pathname]);

    // Initialize state from localStorage
    const [collapsed, setCollapsed] = useState(() =>
        loadFromLocalStorage(STORAGE_KEYS.SIDEBAR_COLLAPSED, false)
    );
    const [darkMode, setDarkMode] = useState(() =>
        loadFromLocalStorage(STORAGE_KEYS.DARK_MODE, false)
    );
    const [currentTheme, setCurrentTheme] = useState(() => {
        const savedTheme = loadFromLocalStorage(STORAGE_KEYS.THEME_CONFIG, {
            themeName: "default",
            customColor: "#1890ff",
        });
        return savedTheme.themeName;
    });
    const [customColor, setCustomColor] = useState(() => {
        const savedTheme = loadFromLocalStorage(STORAGE_KEYS.THEME_CONFIG, {
            themeName: "default",
            customColor: "#1890ff",
        });
        return savedTheme.customColor;
    });

    const { token: themeToken } = theme.useToken();

    // Save state to localStorage when they change
    useEffect(() => {
        saveToLocalStorage(STORAGE_KEYS.SIDEBAR_COLLAPSED, collapsed);
    }, [collapsed]);

    useEffect(() => {
        saveToLocalStorage(STORAGE_KEYS.DARK_MODE, darkMode);
    }, [darkMode]);

    useEffect(() => {
        const themeConfig = {
            themeName: currentTheme,
            customColor: customColor,
        };
        saveToLocalStorage(STORAGE_KEYS.THEME_CONFIG, themeConfig);
    }, [currentTheme, customColor]);

    // Handle responsive collapsing on mobile
    useEffect(() => {
        if (!screens.md) {
            setCollapsed(true);
        }
    }, [screens.md]);

    // Apply theme based on selection
    useEffect(() => {
        if (darkMode) {
            setCurrentTheme("dark");
        } else if (currentTheme === "dark" && !darkMode) {
            // If switching from dark mode to light, go to default
            setCurrentTheme("default");
        }
    }, [darkMode, currentTheme]);

    // Menu items configuration
    const menuItems = [
        {
            key: "/",
            icon: <DashboardOutlined />,
            label: <Link to="/">Dashboard</Link>,
        },
        {
            key: "/users",
            icon: <UserOutlined />,
            label: <Link to="/users">Users Management</Link>,
        },
        {
            key: "/products",
            icon: <AppstoreOutlined />,
            label: <Link to="/products">Products</Link>,
            children: [
                {
                    key: "/products/list",
                    label: <Link to="/products/list">All Products</Link>,
                },
                {
                    key: "/products/categories",
                    label: <Link to="/products/categories">Categories</Link>,
                },
                {
                    key: "/products/inventory",
                    label: <Link to="/products/inventory">Inventory</Link>,
                },
                {
                    key: "/products/reviews",
                    label: <Link to="/products/reviews">Reviews</Link>,
                },
            ],
        },
        // {
        //     key: "/orders",
        //     icon: <ShoppingCartOutlined />,
        //     label: <Link to="/orders">Orders</Link>,
        //     children: [
        //         {
        //             key: "/orders/list",
        //             label: <Link to="/orders/list">All Orders</Link>,
        //         },
        //         {
        //             key: "/orders/pending",
        //             label: <Link to="/orders/pending">Pending</Link>,
        //         },
        //         {
        //             key: "/orders/completed",
        //             label: <Link to="/orders/completed">Completed</Link>,
        //         },
        //     ],
        // },
        // {
        //     key: "/analytics",
        //     icon: <AnalyticsIcon />,
        //     label: <Link to="/analytics">Analytics</Link>,
        //     children: [
        //         {
        //             key: "/analytics/sales",
        //             label: <Link to="/analytics/sales">Sales Analytics</Link>,
        //         },
        //         {
        //             key: "/analytics/users",
        //             label: <Link to="/analytics/users">User Analytics</Link>,
        //         },
        //         {
        //             key: "/analytics/revenue",
        //             label: <Link to="/analytics/revenue">Revenue Reports</Link>,
        //         },
        //     ],
        // },
        // {
        //     key: "/team",
        //     icon: <TeamOutlined />,
        //     label: <Link to="/team">Team</Link>,
        // },
        // {
        //     key: "/billing",
        //     icon: <WalletOutlined />,
        //     label: <Link to="/billing">Billing</Link>,
        // },
        // {
        //     type: "divider",
        // },
        // {
        //     key: "/settings",
        //     icon: <SettingOutlined />,
        //     label: <Link to="/settings">Settings</Link>,
        //     children: [
        //         {
        //             key: "/settings/general",
        //             label: <Link to="/settings/general">General</Link>,
        //         },
        //         {
        //             key: "/settings/security",
        //             label: <Link to="/settings/security">Security</Link>,
        //         },
        //         {
        //             key: "/settings/notifications",
        //             label: (
        //                 <Link to="/settings/notifications">Notifications</Link>
        //             ),
        //         },
        //         {
        //             key: "/settings/appearance",
        //             label: <Link to="/settings/appearance">Appearance</Link>,
        //         },
        //     ],
        // },
    ];

    // User dropdown menu
    const userMenuItems = [
        {
            key: "profile",
            icon: <UserOutlined />,
            label: "Profile",
        },
        {
            key: "settings",
            icon: <SettingOutlined />,
            label: "Settings",
        },
        {
            type: "divider",
        },
        {
            key: "logout",
            icon: <LogoutOutlined />,
            label: "Logout",
            danger: true,
        },
    ];

    // Theme selector dropdown
    const themeMenuItems = [
        {
            key: "theme-default",
            label: (
                <Space
                    onClick={() => handleThemeChange("default")}
                    style={{ width: "100%", justifyContent: "space-between" }}
                >
                    <Space>
                        <div
                            style={{
                                width: 20,
                                height: 20,
                                borderRadius: 4,
                                background: "#1890ff",
                                border: "2px solid #d9d9d9",
                            }}
                        />
                        <span>Default</span>
                    </Space>
                    {currentTheme === "default" && !darkMode && (
                        <CheckOutlined style={{ color: "#52c41a" }} />
                    )}
                </Space>
            ),
        },
        {
            key: "theme-purple",
            label: (
                <Space
                    onClick={() => handleThemeChange("purple")}
                    style={{ width: "100%", justifyContent: "space-between" }}
                >
                    <Space>
                        <div
                            style={{
                                width: 20,
                                height: 20,
                                borderRadius: 4,
                                background: "#722ed1",
                                border: "2px solid #d9d9d9",
                            }}
                        />
                        <span>Purple</span>
                    </Space>
                    {currentTheme === "purple" && !darkMode && (
                        <CheckOutlined style={{ color: "#52c41a" }} />
                    )}
                </Space>
            ),
        },
        {
            key: "theme-green",
            label: (
                <Space
                    onClick={() => handleThemeChange("green")}
                    style={{ width: "100%", justifyContent: "space-between" }}
                >
                    <Space>
                        <div
                            style={{
                                width: 20,
                                height: 20,
                                borderRadius: 4,
                                background: "#52c41a",
                                border: "2px solid #d9d9d9",
                            }}
                        />
                        <span>Green</span>
                    </Space>
                    {currentTheme === "green" && !darkMode && (
                        <CheckOutlined style={{ color: "#52c41a" }} />
                    )}
                </Space>
            ),
        },
        {
            key: "theme-orange",
            label: (
                <Space
                    onClick={() => handleThemeChange("orange")}
                    style={{ width: "100%", justifyContent: "space-between" }}
                >
                    <Space>
                        <div
                            style={{
                                width: 20,
                                height: 20,
                                borderRadius: 4,
                                background: "#fa8c16",
                                border: "2px solid #d9d9d9",
                            }}
                        />
                        <span>Orange</span>
                    </Space>
                    {currentTheme === "orange" && !darkMode && (
                        <CheckOutlined style={{ color: "#52c41a" }} />
                    )}
                </Space>
            ),
        },
        {
            key: "theme-dark",
            label: (
                <Space
                    onClick={() => {
                        setDarkMode(true);
                        handleThemeChange("dark");
                    }}
                    style={{ width: "100%", justifyContent: "space-between" }}
                >
                    <Space>
                        <div
                            style={{
                                width: 20,
                                height: 20,
                                borderRadius: 4,
                                background: "#141414",
                                border: "2px solid #434343",
                            }}
                        />
                        <span>Dark Mode</span>
                    </Space>
                    {darkMode && <CheckOutlined style={{ color: "#52c41a" }} />}
                </Space>
            ),
        },
        {
            type: "divider",
        },
        {
            key: "theme-custom",
            label: (
                <Space direction="vertical" style={{ width: "100%" }}>
                    <Text strong style={{ fontSize: "12px" }}>
                        Custom Color
                    </Text>
                    <Space
                        style={{
                            width: "100%",
                            justifyContent: "space-between",
                        }}
                    >
                        <ColorPicker
                            value={customColor}
                            onChangeComplete={(color) => {
                                setCustomColor(color.toHexString());
                                handleCustomTheme(color.toHexString());
                            }}
                            size="small"
                            showText
                        />
                        {currentTheme === "custom" && !darkMode && (
                            <CheckOutlined style={{ color: "#52c41a" }} />
                        )}
                    </Space>
                </Space>
            ),
        },
    ];

    // Get selected keys based on current route
    const getSelectedKeys = () => {
        const path = location.pathname;
        const selectedKeys = [path];

        menuItems.forEach((item) => {
            if (item.children) {
                item.children.forEach((child) => {
                    if (child.key === path) {
                        selectedKeys.push(item.key);
                    }
                });
            }
        });

        return selectedKeys;
    };

    // Update the handleUserMenuClick function
    const handleUserMenuClick = ({ key }) => {
        if (key === "logout") {
            // Clear localStorage
            localStorage.removeItem("adminpro_user");
            localStorage.removeItem("adminpro_token");
            localStorage.removeItem("adminpro_theme_config");
            localStorage.removeItem("adminpro_sidebar_collapsed");
            localStorage.removeItem("adminpro_dark_mode");

            // Redirect to login
            //navigate("/login");
            window.location.href = "/login";
        } else if (key === "profile") {
            navigate("/settings/profile");
        } else if (key === "settings") {
            navigate("/settings/general");
        }
    };

    const handleThemeChange = (themeName) => {
        setCurrentTheme(themeName);
        if (themeName === "dark") {
            setDarkMode(true);
        } else {
            setDarkMode(false);
        }
        message.success(
            `Theme changed to ${themePresets[themeName]?.name || "Custom"}`
        );
    };

    const handleCustomTheme = (color) => {
        setCurrentTheme("custom");
        setDarkMode(false);
        message.success("Custom theme applied");

        // Apply custom color to Ant Design theme
        ConfigProvider.config({
            theme: {
                primaryColor: color,
            },
        });
    };

    // Get current theme configuration
    const getThemeConfig = () => {
        if (currentTheme === "custom") {
            return {
                ...themePresets.default,
                primaryColor: customColor,
                name: "Custom",
            };
        }
        return themePresets[currentTheme] || themePresets.default;
    };

    // Handle dark mode toggle
    const handleDarkModeToggle = (checked) => {
        setDarkMode(checked);
        if (checked) {
            setCurrentTheme("dark");
            message.success("Dark mode enabled");
        } else {
            setCurrentTheme("default");
            message.success("Light mode enabled");
        }
    };

    // Custom algorithm for theme
    const customAlgorithm = darkMode
        ? theme.darkAlgorithm
        : theme.defaultAlgorithm;

    // Clear all settings (for debugging/reset)
    const clearAllSettings = () => {
        localStorage.removeItem(STORAGE_KEYS.THEME_CONFIG);
        localStorage.removeItem(STORAGE_KEYS.SIDEBAR_COLLAPSED);
        localStorage.removeItem(STORAGE_KEYS.DARK_MODE);
        window.location.reload();
    };

    // Sidebar content with fixed logo and scrollable menu
    const sidebarContent = (
        <>
            {/* Fixed Logo Section */}
            <div
                className="sidebar-logo"
                style={{
                    padding: collapsed ? "16px 8px" : "24px 16px",
                    textAlign: collapsed ? "center" : "left",
                    borderBottom: "1px solid rgba(0,0,0,0.06)",
                    position: "sticky",
                    top: 0,
                    zIndex: 1,
                    background: darkMode ? "#001529" : "#fff",
                }}
            >
                {collapsed ? (
                    <div
                        style={{
                            display: "flex",
                            justifyContent: "center",
                            alignItems: "center",
                        }}
                    >
                        <div
                            style={{
                                width: 36,
                                height: 36,
                                borderRadius: 8,
                                background: `linear-gradient(135deg, ${
                                    getThemeConfig().primaryColor
                                }, #73d13d)`,
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                color: "white",
                                fontWeight: "bold",
                                fontSize: "18px",
                            }}
                        >
                            A
                        </div>
                    </div>
                ) : (
                    <Space
                        direction="vertical"
                        size={0}
                        style={{ width: "100%" }}
                    >
                        <div
                            style={{
                                display: "flex",
                                alignItems: "center",
                                gap: 12,
                            }}
                        >
                            <div
                                style={{
                                    width: 40,
                                    height: 40,
                                    borderRadius: 8,
                                    background: `linear-gradient(135deg, ${
                                        getThemeConfig().primaryColor
                                    }, #73d13d)`,
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    color: "white",
                                    fontWeight: "bold",
                                    fontSize: "20px",
                                }}
                            >
                                A
                            </div>
                            <div>
                                <Title
                                    level={4}
                                    style={{
                                        margin: 0,
                                        color: darkMode
                                            ? "#fff"
                                            : getThemeConfig().primaryColor,
                                    }}
                                >
                                    AdminPro
                                </Title>
                                <Text
                                    type="secondary"
                                    style={{ fontSize: "12px" }}
                                >
                                    Professional Dashboard
                                </Text>
                            </div>
                        </div>
                    </Space>
                )}
            </div>

            {/* Scrollable Menu Area */}
            <div
                style={{
                    flex: 1,
                    overflowY: "auto",
                    overflowX: "hidden",
                    height: "calc(100vh - 180px)",
                }}
            >
                <Menu
                    theme={darkMode ? "dark" : "light"}
                    mode="inline"
                    selectedKeys={getSelectedKeys()}
                    ç
                    defaultOpenKeys={[]} //"/products", "/orders", "/analytics"
                    items={menuItems}
                    style={{
                        borderRight: 0,
                        padding: "8px 0",
                    }}
                    className="custom-menu"
                />
            </div>

            {/* Fixed User Profile Section */}
            {/* <div style={{ 
        padding: "16px", 
        borderTop: "1px solid rgba(0,0,0,0.06)",
        position: "sticky",
        bottom: 0,
        background: darkMode ? "#001529" : "#fff"
      }}>
        <Space align="center" style={{ width: "100%" }}>
          <Avatar 
            size="large" 
            src="https://api.dicebear.com/7.x/avataaars/svg?seed=Admin" 
            style={{ border: `2px solid ${getThemeConfig().primaryColor}` }}
          />
          {!collapsed && (
            <div style={{ flex: 1 }}>
              <Text strong style={{ display: "block", color: darkMode ? "#fff" : "#000" }}>
                Admin User
              </Text>
              <Text type="secondary" style={{ fontSize: "12px" }}>
                Super Admin
              </Text>
            </div>
          )}
        </Space>
      </div> */}
        </>
    );

    return (
        <ConfigProvider
            theme={{
                algorithm: customAlgorithm,
                token: {
                    colorPrimary: getThemeConfig().primaryColor,
                    borderRadius: getThemeConfig().borderRadius,
                    colorBgBase: getThemeConfig().colorBgBase,
                },
                components: {
                    Layout: {
                        headerBg: darkMode ? "#1f1f1f" : "#ffffff",
                        bodyBg: darkMode ? "#141414" : "#f5f7fa",
                    },
                    Menu: {
                        itemBg: darkMode ? "#001529" : "#ffffff",
                        itemSelectedBg: darkMode
                            ? `rgba(${parseInt(
                                  getThemeConfig().primaryColor.slice(1, 3),
                                  16
                              )}, ${parseInt(
                                  getThemeConfig().primaryColor.slice(3, 5),
                                  16
                              )}, ${parseInt(
                                  getThemeConfig().primaryColor.slice(5, 7),
                                  16
                              )}, 0.2)`
                            : `rgba(${parseInt(
                                  getThemeConfig().primaryColor.slice(1, 3),
                                  16
                              )}, ${parseInt(
                                  getThemeConfig().primaryColor.slice(3, 5),
                                  16
                              )}, ${parseInt(
                                  getThemeConfig().primaryColor.slice(5, 7),
                                  16
                              )}, 0.1)`,
                        itemHoverBg: darkMode
                            ? `rgba(${parseInt(
                                  getThemeConfig().primaryColor.slice(1, 3),
                                  16
                              )}, ${parseInt(
                                  getThemeConfig().primaryColor.slice(3, 5),
                                  16
                              )}, ${parseInt(
                                  getThemeConfig().primaryColor.slice(5, 7),
                                  16
                              )}, 0.1)`
                            : "rgba(0, 0, 0, 0.04)",
                    },
                },
            }}
        >
            <Layout
                style={{ minHeight: "100vh" }}
                className={darkMode ? "dark-theme" : ""}
            >
                {/* Sidebar */}
                <Sider
                    trigger={null}
                    breakpoint="lg"
                    collapsedWidth={screens.xs ? 0 : 80}
                    collapsible
                    collapsed={collapsed}
                    onCollapse={setCollapsed}
                    width={280}
                    style={{
                        overflow: "hidden",
                        height: "100vh",
                        position: "fixed",
                        left: 0,
                        top: 0,
                        bottom: 0,
                        zIndex: 1000,
                        boxShadow: "2px 0 12px rgba(0,0,0,0.08)",
                    }}
                    theme={darkMode ? "dark" : "light"}
                >
                    {sidebarContent}
                </Sider>

                {/* Main Layout */}
                <Layout
                    style={{
                        marginLeft: collapsed ? (screens.xs ? 0 : 80) : 280,
                    }}
                >
                    {/* Header */}
                    <Header
                        style={{
                            padding: screens.xs ? "0 12px" : "0 24px",
                            background: darkMode ? "#1f1f1f" : "#ffffff",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                            position: "sticky",
                            top: 0,
                            zIndex: 999,
                            boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
                            backdropFilter: "blur(8px)",
                            borderBottom: "1px solid var(--border-color)",
                        }}
                    >
                        <div
                            style={{
                                display: "flex",
                                alignItems: "center",
                                gap: "16px",
                            }}
                        >
                            <Button
                                type="text"
                                icon={
                                    collapsed ? (
                                        <MenuUnfoldOutlined />
                                    ) : (
                                        <MenuFoldOutlined />
                                    )
                                }
                                onClick={() => setCollapsed(!collapsed)}
                                style={{
                                    fontSize: "16px",
                                    color: darkMode ? "#fff" : "#000",
                                }}
                            />
                        </div>

                        <Space size="middle" align="center">
                            {/* Theme Selector */}
                            <Dropdown
                                menu={{
                                    items: themeMenuItems,
                                }}
                                placement="bottomRight"
                                trigger={["click"]}
                            >
                                <Tooltip title="Theme Settings">
                                    <Button
                                        type="text"
                                        icon={<SkinOutlined />}
                                        style={{
                                            color: darkMode ? "#fff" : "#000",
                                        }}
                                    />
                                </Tooltip>
                            </Dropdown>

                            {/* Dark Mode Toggle */}
                            <Tooltip
                                title={
                                    darkMode
                                        ? "Switch to Light Mode"
                                        : "Switch to Dark Mode"
                                }
                            >
                                <Switch
                                    checkedChildren={<SunOutlined />}
                                    unCheckedChildren={<MoonOutlined />}
                                    checked={darkMode}
                                    onChange={handleDarkModeToggle}
                                    style={{
                                        background: darkMode
                                            ? getThemeConfig().primaryColor
                                            : "#d9d9d9",
                                    }}
                                />
                            </Tooltip>

                            {/* Notifications */}
                            <Dropdown
                                menu={{
                                    items: [
                                        {
                                            key: "1",
                                            label: (
                                                <Space>
                                                    <Badge status="success" />
                                                    <span>
                                                        New order received
                                                    </span>
                                                </Space>
                                            ),
                                        },
                                        {
                                            key: "2",
                                            label: (
                                                <Space>
                                                    <Badge status="processing" />
                                                    <span>User signed up</span>
                                                </Space>
                                            ),
                                        },
                                        {
                                            key: "3",
                                            label: (
                                                <Space>
                                                    <Badge status="warning" />
                                                    <span>System updated</span>
                                                </Space>
                                            ),
                                        },
                                    ],
                                }}
                                placement="bottomRight"
                            >
                                <Badge
                                    count={3}
                                    size="small"
                                    style={{
                                        backgroundColor:
                                            getThemeConfig().primaryColor,
                                    }}
                                >
                                    <Button
                                        type="text"
                                        shape="circle"
                                        icon={<BellOutlined />}
                                        style={{
                                            color: darkMode ? "#fff" : "#000",
                                        }}
                                    />
                                </Badge>
                            </Dropdown>

                            {/* User Menu */}
                            <Dropdown
                                menu={{
                                    items: userMenuItems,
                                    onClick: handleUserMenuClick,
                                }}
                                placement="bottomRight"
                            >
                                <Space
                                    style={{
                                        cursor: "pointer",
                                        padding: "4px 8px",
                                        borderRadius: "8px",
                                        background: darkMode
                                            ? "rgba(255,255,255,0.1)"
                                            : "rgba(0,0,0,0.04)",
                                        transition: "all 0.3s",
                                    }}
                                >
                                    <Avatar
                                        size="default"
                                        src="https://api.dicebear.com/7.x/avataaars/svg?seed=Admin"
                                        style={{
                                            border: `2px solid ${
                                                getThemeConfig().primaryColor
                                            }`,
                                        }}
                                    />
                                    {/* {screens.md && (
                                        <>
                                            <div>
                                                <Text
                                                    strong
                                                    style={{
                                                        display: "block",
                                                        fontSize: "14px",
                                                        color: darkMode
                                                            ? "#fff"
                                                            : "#000",
                                                    }}
                                                >
                                                    Admin User
                                                </Text>
                                                <Text
                                                    type="secondary"
                                                    style={{ fontSize: "12px" }}
                                                >
                                                    {getThemeConfig().name}{" "}
                                                    Theme
                                                </Text>
                                            </div>
                                            <DownOutlined
                                                style={{
                                                    fontSize: "12px",
                                                    color: darkMode
                                                        ? "#fff"
                                                        : "#000",
                                                }}
                                            />
                                        </>
                                    )} */}
                                </Space>
                            </Dropdown>
                        </Space>
                    </Header>

                    {/* Breadcrumb Area */}
                    <div
                        style={{
                            padding: screens.xs ? "12px 16px" : "16px 24px",
                            background: darkMode ? "#1f1f1f" : "#ffffff",
                            borderBottom: "1px solid var(--border-color)",
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                        }}
                    >
                        <div>
                            <Title
                                level={4}
                                style={{
                                    margin: 0,
                                    color: darkMode ? "#fff" : "#000",
                                }}
                            >
                                {location.pathname === "/"
                                    ? "Dashboard"
                                    : location.pathname
                                          .split("/")[1]
                                          .charAt(0)
                                          .toUpperCase() +
                                      location.pathname.split("/")[1].slice(1)}
                            </Title>
                            <Text type="secondary">
                                <HomeOutlined /> Dashboard /{" "}
                                {location.pathname.split("/")[1] || "Home"}
                            </Text>
                        </div>
                        <div>
                            <Text type="secondary" style={{ fontSize: "12px" }}>
                                Theme: {getThemeConfig().name}{" "}
                                {darkMode && "(Dark)"}
                            </Text>
                        </div>
                    </div>

                    {/* Main Content */}
                    <Content
                        style={{
                            margin: screens.xs ? "12px" : "24px",
                            padding: screens.xs ? 12 : 24,
                            // minHeight: "calc(100vh - 200px)",
                            background: darkMode ? "#141414" : "#ffffff",
                            borderRadius: "12px",
                            overflow: "initial",
                            boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
                        }}
                    >
                        <div
                            className="site-layout-content"
                            style={{ padding: screens.xs ? "8px" : "0" }}
                        >
                            {children}
                        </div>
                    </Content>

                    {/* Footer */}
                    <div
                        style={{
                            textAlign: "center",
                            padding: "16px 24px",
                            background: darkMode ? "#1f1f1f" : "#ffffff",
                            borderTop: "1px solid var(--border-color)",
                            marginTop: "auto",
                        }}
                    >
                        <div
                            style={{
                                display: "flex",
                                justifyContent: "space-between",
                                alignItems: "center",
                            }}
                        >
                            <div style={{ textAlign: "left" }}>
                                <Text
                                    type="secondary"
                                    style={{ fontSize: "12px" }}
                                >
                                    <Space>
                                        <span>
                                            © {new Date().getFullYear()}{" "}
                                            AdminPro
                                        </span>
                                        <Divider type="vertical" />
                                        <span>v2.1.0</span>
                                        <Divider type="vertical" />
                                        <span>React {React.version}</span>
                                        <Divider type="vertical" />
                                        <span>
                                            Theme: {getThemeConfig().name}
                                        </span>
                                    </Space>
                                </Text>
                            </div>
                            <div style={{ textAlign: "right" }}>
                                <Text
                                    type="secondary"
                                    style={{ fontSize: "12px" }}
                                >
                                    <Space>
                                        <Button
                                            type="text"
                                            size="small"
                                            onClick={clearAllSettings}
                                            style={{
                                                fontSize: "12px",
                                                padding: 0,
                                            }}
                                        >
                                            Reset Settings
                                        </Button>
                                        <Divider type="vertical" />
                                        <Link to="/support">
                                            Contact Support
                                        </Link>
                                    </Space>
                                </Text>
                            </div>
                        </div>
                    </div>
                </Layout>
            </Layout>
        </ConfigProvider>
    );
}
