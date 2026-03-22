import React, { useState, useEffect } from "react";
import {
    Card,
    Form,
    Input,
    Select,
    DatePicker,
    Button,
    Row,
    Col,
    Space,
    Divider,
    Collapse,
    Tag,
} from "antd";
import {
    SearchOutlined,
    FilterOutlined,
    ReloadOutlined,
    CloseOutlined,
    PlusOutlined,
    MinusOutlined,
} from "@ant-design/icons";
import { useUserFilters, useUserActions } from "../../stores/useUserStore";
import { format } from "date-fns";

const { RangePicker } = DatePicker;
const { Option } = Select;
const { Panel } = Collapse;

interface UserFiltersProps {
    compact?: boolean;
    onSearch?: (values: any) => void;
    onReset?: () => void;
}

const UserFilters: React.FC<UserFiltersProps> = ({
    compact = false,
    onSearch,
    onReset,
}) => {
    const [form] = Form.useForm();
    const [activeFilters, setActiveFilters] = useState<string[]>([]);
    const filters = useUserFilters();
    const { setFilters, resetFilters } = useUserActions();

    // Initialize form with current filters
    useEffect(() => {
        form.setFieldsValue(filters);
        updateActiveFilters(filters);
    }, [filters, form]);

    const updateActiveFilters = (values: any) => {
        const active: string[] = [];
        Object.entries(values).forEach(([key, value]) => {
            if (value !== undefined && value !== "" && value !== null) {
                active.push(key);
            }
        });
        setActiveFilters(active);
    };

    const handleSubmit = (values: any) => {
        // Format date range
        if (values.dateRange) {
            values.created_after = format(
                values.dateRange[0].toDate(),
                "yyyy-MM-dd"
            );
            values.created_before = format(
                values.dateRange[1].toDate(),
                "yyyy-MM-dd"
            );
            delete values.dateRange;
        }

        // Reset to page 1 when filtering
        const newFilters = { ...values, page: 1 };
        setFilters(newFilters);
        updateActiveFilters(values);
        onSearch?.(values);
    };

    const handleReset = () => {
        form.resetFields();
        resetFilters();
        setActiveFilters([]);
        onReset?.();
    };

    const removeFilter = (filterKey: string) => {
        const values = form.getFieldsValue();
        form.setFieldsValue({ [filterKey]: undefined });
        const newValues = { ...values, [filterKey]: undefined };
        handleSubmit(newValues);
    };

    const getFilterLabel = (key: string): string => {
        const labels: Record<string, string> = {
            search: "Search",
            role: "Role",
            status: "Status",
            dateRange: "Date Range",
            sortBy: "Sort By",
            sortOrder: "Sort Order",
        };
        return labels[key] || key;
    };

    const getFilterValue = (key: string, value: any): string => {
        if (key === "dateRange" && Array.isArray(value)) {
            return `${format(value[0].toDate(), "MMM d, yyyy")} - ${format(
                value[1].toDate(),
                "MMM d, yyyy"
            )}`;
        }

        if (key === "role" || key === "status") {
            return (
                String(value).charAt(0).toUpperCase() + String(value).slice(1)
            );
        }

        return String(value);
    };

    const renderActiveFilters = () => (
        <div style={{ marginBottom: 16 }}>
            <Space wrap>
                <span style={{ fontWeight: 500 }}>Active Filters:</span>
                {activeFilters.map((key) => {
                    const value = form.getFieldValue(key);
                    if (!value) return null;

                    return (
                        <Tag
                            key={key}
                            closable
                            onClose={() => removeFilter(key)}
                            style={{
                                display: "flex",
                                alignItems: "center",
                                gap: 4,
                            }}
                        >
                            {getFilterLabel(key)}: {getFilterValue(key, value)}
                        </Tag>
                    );
                })}
                {activeFilters.length > 0 && (
                    <Button
                        type="link"
                        size="small"
                        onClick={handleReset}
                        icon={<CloseOutlined />}
                    >
                        Clear All
                    </Button>
                )}
            </Space>
        </div>
    );

    const filterForm = (
        <Form
            form={form}
            layout="vertical"
            onFinish={handleSubmit}
            autoComplete="off"
        >
            <Row gutter={[16, 16]}>
                <Col xs={24} sm={12} md={8} lg={6}>
                    <Form.Item name="search" label="Search">
                        <Input
                            placeholder="Search name or email"
                            prefix={<SearchOutlined />}
                            allowClear
                        />
                    </Form.Item>
                </Col>

                <Col xs={24} sm={12} md={8} lg={6}>
                    <Form.Item name="role" label="Role">
                        <Select placeholder="All roles" allowClear>
                            <Option value="admin">Administrator</Option>
                            <Option value="editor">Editor</Option>
                            <Option value="viewer">Viewer</Option>
                            <Option value="user">User</Option>
                        </Select>
                    </Form.Item>
                </Col>

                <Col xs={24} sm={12} md={8} lg={6}>
                    <Form.Item name="status" label="Status">
                        <Select placeholder="All statuses" allowClear>
                            <Option value="active">Active</Option>
                            <Option value="inactive">Inactive</Option>
                            <Option value="suspended">Suspended</Option>
                        </Select>
                    </Form.Item>
                </Col>

                <Col xs={24} sm={12} md={8} lg={6}>
                    <Form.Item name="dateRange" label="Created Date">
                        {/* <RangePicker style={{ width: "100%" }} /> */}
                    </Form.Item>
                </Col>

                {/* Advanced Filters */}
                <Col xs={24}>
                    <Collapse ghost size="small">
                        <Panel header="Advanced Filters" key="1">
                            <Row gutter={[16, 16]}>
                                <Col xs={24} sm={12} md={8} lg={6}>
                                    <Form.Item name="sortBy" label="Sort By">
                                        <Select placeholder="Default sorting">
                                            <Option value="name">Name</Option>
                                            <Option value="email">Email</Option>
                                            <Option value="role">Role</Option>
                                            <Option value="status">
                                                Status
                                            </Option>
                                            <Option value="created_at">
                                                Created Date
                                            </Option>
                                            <Option value="updated_at">
                                                Updated Date
                                            </Option>
                                        </Select>
                                    </Form.Item>
                                </Col>

                                <Col xs={24} sm={12} md={8} lg={6}>
                                    <Form.Item
                                        name="sortOrder"
                                        label="Sort Order"
                                    >
                                        <Select placeholder="Default order">
                                            <Option value="asc">
                                                Ascending
                                            </Option>
                                            <Option value="desc">
                                                Descending
                                            </Option>
                                        </Select>
                                    </Form.Item>
                                </Col>

                                <Col xs={24} sm={12} md={8} lg={6}>
                                    <Form.Item
                                        name="per_page"
                                        label="Items Per Page"
                                    >
                                        <Select placeholder="Default (10)">
                                            <Option value={5}>5 items</Option>
                                            <Option value={10}>10 items</Option>
                                            <Option value={25}>25 items</Option>
                                            <Option value={50}>50 items</Option>
                                            <Option value={100}>
                                                100 items
                                            </Option>
                                        </Select>
                                    </Form.Item>
                                </Col>
                            </Row>
                        </Panel>
                    </Collapse>
                </Col>

                <Col xs={24}>
                    <Form.Item>
                        <Space>
                            <Button
                                type="primary"
                                htmlType="submit"
                                icon={<FilterOutlined />}
                            >
                                Apply Filters
                            </Button>
                            <Button
                                onClick={handleReset}
                                icon={<ReloadOutlined />}
                            >
                                Reset
                            </Button>
                        </Space>
                    </Form.Item>
                </Col>
            </Row>
        </Form>
    );

    if (compact) {
        return (
            <Card size="small" style={{ marginBottom: 16 }}>
                {renderActiveFilters()}
                {filterForm}
            </Card>
        );
    }

    return (
        <Card
            title={
                <Space>
                    <FilterOutlined />
                    <span>Filters</span>
                    {activeFilters.length > 0 && (
                        <Tag color="blue">{activeFilters.length} active</Tag>
                    )}
                </Space>
            }
            style={{ marginBottom: 24 }}
            extra={
                <Button
                    type="text"
                    size="small"
                    icon={
                        activeFilters.length > 0 ? (
                            <MinusOutlined />
                        ) : (
                            <PlusOutlined />
                        )
                    }
                    onClick={() => {
                        /* Toggle collapse logic here */
                    }}
                />
            }
        >
            {renderActiveFilters()}
            <Divider />
            {filterForm}
        </Card>
    );
};

export default UserFilters;
