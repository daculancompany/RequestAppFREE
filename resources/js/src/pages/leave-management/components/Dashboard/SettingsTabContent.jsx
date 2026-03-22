import React, { useState } from "react";
import {
    Card,
    Descriptions,
    Divider,
    Image,
    Button,
    Switch,
    Input,
    message,
    Space,
    Tag,
} from "antd";
import {
    EyeOutlined,
    SaveOutlined,
    UploadOutlined,
} from "@ant-design/icons";

const SettingsTabContent = () => {
    // Simple sample data
    const [settings, setSettings] = useState({
        group_name: "Engineering Team",
        group_code: "ENG-2024",
        group_color: "#1890ff",
        description: "Engineering department team",
        created_at: "2024-01-15",
        updated_at: "2024-10-25",
        is_active: true,
    });

    const handleSave = () => {
        message.success("Settings saved!");
    };

    const handleToggle = () => {
        setSettings({ ...settings, is_active: !settings.is_active });
    };

    return (
        <Card
            title="Group Settings"
            style={{ borderRadius: 8 }}
            extra={
                <Button
                    type="primary"
                    icon={<SaveOutlined />}
                    onClick={handleSave}
                >
                    Save
                </Button>
            }
        >
            {/* Basic Settings */}
            <div style={{ marginBottom: 24 }}>
                <h4>Basic Settings</h4>
                <Space direction="vertical" style={{ width: '100%' }}>
                    <Input
                        value={settings.group_name}
                        onChange={(e) => setSettings({ ...settings, group_name: e.target.value })}
                        placeholder="Group Name"
                    />
                    <Input
                        value={settings.group_code}
                        onChange={(e) => setSettings({ ...settings, group_code: e.target.value })}
                        placeholder="Group Code"
                    />
                    <Input.TextArea
                        value={settings.description}
                        onChange={(e) => setSettings({ ...settings, description: e.target.value })}
                        placeholder="Description"
                        rows={3}
                    />
                </Space>
            </div>

            <Divider />

            {/* Status Toggle */}
            <div style={{ marginBottom: 24 }}>
                <Space>
                    <Switch checked={settings.is_active} onChange={handleToggle} />
                    <span>Group Active</span>
                    <Tag color={settings.is_active ? "green" : "red"}>
                        {settings.is_active ? "ACTIVE" : "INACTIVE"}
                    </Tag>
                </Space>
            </div>

            <Divider />

            {/* Group Info */}
            <Descriptions
                column={1}
                bordered
                size="small"
                style={{ borderRadius: 6 }}
            >
                <Descriptions.Item label="Created">
                    {settings.created_at}
                </Descriptions.Item>
                <Descriptions.Item label="Last Updated">
                    {settings.updated_at}
                </Descriptions.Item>
                <Descriptions.Item label="Color">
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <div
                            style={{
                                width: 20,
                                height: 20,
                                borderRadius: 4,
                                backgroundColor: settings.group_color,
                            }}
                        />
                        <span>{settings.group_color}</span>
                    </div>
                </Descriptions.Item>
            </Descriptions>

            {/* Image Upload */}
            <Divider />
            <div>
                <h4>Group Image</h4>
                <Image
                    src="https://picsum.photos/400/200"
                    alt="Group"
                    style={{
                        width: '100%',
                        height: 200,
                        objectFit: 'cover',
                        borderRadius: 8,
                        marginBottom: 12,
                    }}
                    preview={{
                        mask: <EyeOutlined />,
                    }}
                />
                <Button icon={<UploadOutlined />}>
                    Change Image
                </Button>
            </div>
        </Card>
    );
};

export default SettingsTabContent;