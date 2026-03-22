// components/Dashboard/CalendarPreview.jsx
import React, { useState, useMemo } from "react";
import {
    Card,
    Tag,
    Button,
    Row,
    Col,
    List,
    Badge,
    Popover,
    Divider,
    Space,
    Radio,
    Tooltip,
    Avatar,
    Statistic,
    Dropdown,
    Menu,
    Typography,
    theme,
    Empty,
} from "antd";
import { motion, AnimatePresence } from "framer-motion";
import {
    CalendarOutlined,
    LeftOutlined,
    RightOutlined,
    EyeOutlined,
    FilterOutlined,
    PlusOutlined,
    MoreOutlined,
    CheckCircleOutlined,
    ClockCircleOutlined,
    CloseCircleOutlined,
    UserOutlined,
    TeamOutlined,
    DownloadOutlined,
    ShareAltOutlined,
    SettingOutlined,
    BarChartOutlined,
    FireOutlined,
    RiseOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import isBetween from "dayjs/plugin/isBetween";
import advancedFormat from "dayjs/plugin/advancedFormat";
import weekday from "dayjs/plugin/weekday";
import weekOfYear from "dayjs/plugin/weekOfYear";
import {
    ResponsiveContainer,
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip as ChartTooltip,
    Cell,
    PieChart,
    Pie,
    Legend,
} from "recharts";

const { Text, Title } = Typography;
const { useToken } = theme;

// Extend dayjs plugins
dayjs.extend(isBetween);
dayjs.extend(advancedFormat);
dayjs.extend(weekday);
dayjs.extend(weekOfYear);

const CalendarPreview = ({ appContext }) => {
    const {
        calendarEvents = [],
        leaveRequests = [],
        selectedDate,
        setSelectedDate,
        setActiveTab,
        groups = [],
        employees = [],
        setLeaveModalVisible,
    } = appContext;

    const { token } = useToken();
    const [calendarView, setCalendarView] = useState("month");
    const [currentDate, setCurrentDate] = useState(dayjs());
    const [filterStatus, setFilterStatus] = useState("all");
    const [selectedGroup, setSelectedGroup] = useState("all");
    const [hoveredEvent, setHoveredEvent] = useState(null);

    // Status configuration
    const statusConfig = {
        approved: {
            color: token.colorSuccess,
            bg: token.colorSuccessBg,
            icon: <CheckCircleOutlined />,
            label: "Approved",
        },
        rejected: {
            color: token.colorError,
            bg: token.colorErrorBg,
            icon: <CloseCircleOutlined />,
            label: "Rejected",
        },
        pending: {
            color: token.colorWarning,
            bg: token.colorWarningBg,
            icon: <ClockCircleOutlined />,
            label: "Pending",
        },
    };

    // Get group info
    const getGroupInfo = (groupId) => {
        return groups.find((g) => g.id === groupId) || {
            name: "Unassigned",
            color: token.colorPrimary,
            gradient: `linear-gradient(135deg, ${token.colorPrimary} 0%, ${token.colorPrimaryActive} 100%)`,
        };
    };

    // Get employee info
    const getEmployeeInfo = (employeeId) => {
        return employees.find((e) => e.id === employeeId) || {
            name: "Unknown",
            avatar: null,
        };
    };

    // Filter events based on status and group
    const filteredEvents = useMemo(() => {
        return calendarEvents.filter((event) => {
            const statusMatch = filterStatus === "all" || event.status === filterStatus;
            const groupMatch = selectedGroup === "all" || event.group === selectedGroup;
            return statusMatch && groupMatch;
        });
    }, [calendarEvents, filterStatus, selectedGroup]);

    // Get leaves for current month
    const currentMonthLeaves = useMemo(() => {
        return filteredEvents.filter((event) =>
            dayjs(event.start).month() === currentDate.month() &&
            dayjs(event.start).year() === currentDate.year()
        );
    }, [filteredEvents, currentDate]);

    // Get upcoming leaves (next 30 days)
    const upcomingLeaves = useMemo(() => {
        const today = dayjs().startOf('day');
        const thirtyDaysLater = today.add(30, 'day');
        
        return filteredEvents
            .filter(event => {
                const startDate = dayjs(event.start);
                return startDate.isAfter(today) && startDate.isBefore(thirtyDaysLater);
            })
            .sort((a, b) => dayjs(a.start).diff(dayjs(b.start)))
            .slice(0, 10);
    }, [filteredEvents]);

    // Get leave statistics
    const leaveStats = useMemo(() => ({
        total: currentMonthLeaves.length,
        pending: currentMonthLeaves.filter((e) => e.status === "pending").length,
        approved: currentMonthLeaves.filter((e) => e.status === "approved").length,
        rejected: currentMonthLeaves.filter((e) => e.status === "rejected").length,
    }), [currentMonthLeaves]);

    // Get leaves by day of week
    const dayOfWeekData = useMemo(() => {
        const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
        return days.map((day, index) => ({
            day,
            leaves: currentMonthLeaves.filter((e) => dayjs(e.start).day() === (index + 1) % 7).length,
            fullName: day,
        }));
    }, [currentMonthLeaves]);

    // Get leave distribution by type
    const leaveTypeData = useMemo(() => {
        const typeMap = new Map();
        currentMonthLeaves.forEach(event => {
            const count = typeMap.get(event.type) || 0;
            typeMap.set(event.type, count + 1);
        });
        
        return Array.from(typeMap.entries()).map(([type, count]) => ({
            name: type,
            value: count,
            percentage: ((count / currentMonthLeaves.length) * 100).toFixed(1),
        }));
    }, [currentMonthLeaves]);

    // Get dates with leaves for the current month
    const getLeavesForDate = (date) => {
        const dateStr = date.format("YYYY-MM-DD");
        return currentMonthLeaves.filter(event => {
            const startDate = dayjs(event.start);
            const endDate = dayjs(event.end);
            const currentDate = dayjs(dateStr);
            
            return (currentDate.isSame(startDate, 'day') || currentDate.isAfter(startDate)) &&
                   (currentDate.isSame(endDate, 'day') || currentDate.isBefore(endDate));
        });
    };

    // Generate calendar days
    const calendarDays = useMemo(() => {
        const startOfMonth = currentDate.startOf('month');
        const endOfMonth = currentDate.endOf('month');
        const startDate = startOfMonth.startOf('week');
        const endDate = endOfMonth.endOf('week');
        
        const days = [];
        let currentDay = startDate;
        
        while (currentDay.isBefore(endDate) || currentDay.isSame(endDate, 'day')) {
            days.push(currentDay);
            currentDay = currentDay.add(1, 'day');
        }
        
        return days;
    }, [currentDate]);

    // Calendar cell render
    const renderCalendarCell = (date) => {
        const leavesOnDate = getLeavesForDate(date);
        const isCurrentMonth = date.month() === currentDate.month();
        const isToday = date.isSame(dayjs(), 'day');
        const isSelected = selectedDate && date.isSame(selectedDate, 'day');
        
        return (
            <motion.div
                whileHover={{ scale: 1.02 }}
                transition={{ type: "spring", stiffness: 300 }}
            >
                <Popover
                    content={
                        <div style={{ maxWidth: 280 }}>
                            <div style={{ 
                                display: 'flex', 
                                justifyContent: 'space-between', 
                                alignItems: 'center',
                                marginBottom: token.marginXS 
                            }}>
                                <Text strong>{date.format("MMMM D, YYYY")}</Text>
                                <Badge 
                                    count={leavesOnDate.length} 
                                    style={{ backgroundColor: token.colorPrimary }}
                                />
                            </div>
                            {leavesOnDate.length > 0 ? (
                                <div style={{ maxHeight: 200, overflowY: 'auto' }}>
                                    {leavesOnDate.map((leave, idx) => {
                                        const employee = getEmployeeInfo(leave.employeeId || leave.employee);
                                        const groupInfo = getGroupInfo(leave.group);
                                        return (
                                            <motion.div
                                                key={idx}
                                                initial={{ opacity: 0, x: -10 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                transition={{ delay: idx * 0.05 }}
                                                style={{
                                                    padding: token.paddingXS,
                                                    marginBottom: token.marginXS,
                                                    backgroundColor: statusConfig[leave.status]?.bg,
                                                    borderRadius: token.borderRadiusSM,
                                                    cursor: 'pointer',
                                                }}
                                                onClick={() => {
                                                    // Handle leave click
                                                    console.log('Leave clicked:', leave);
                                                }}
                                            >
                                                <div style={{ display: 'flex', alignItems: 'center', gap: token.marginXS }}>
                                                    <div style={{
                                                        width: 4,
                                                        height: 40,
                                                        backgroundColor: groupInfo.color,
                                                        borderRadius: token.borderRadius,
                                                    }} />
                                                    <div style={{ flex: 1 }}>
                                                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                                            <Text strong>{employee.name}</Text>
                                                            <Tag 
                                                                color={statusConfig[leave.status]?.color}
                                                                style={{ margin: 0 }}
                                                            >
                                                                {leave.status}
                                                            </Tag>
                                                        </div>
                                                        <div style={{ fontSize: 12, color: token.colorTextSecondary }}>
                                                            {leave.type} • {leave.duration} days
                                                        </div>
                                                    </div>
                                                </div>
                                            </motion.div>
                                        );
                                    })}
                                </div>
                            ) : (
                                <Empty 
                                    image={Empty.PRESENTED_IMAGE_SIMPLE} 
                                    description="No leaves scheduled"
                                />
                            )}
                        </div>
                    }
                    trigger="hover"
                    placement="top"
                >
                    <div
                        className={`calendar-cell ${!isCurrentMonth ? 'other-month' : ''} ${isToday ? 'today' : ''} ${isSelected ? 'selected' : ''}`}
                        style={{
                            padding: token.paddingXS,
                            minHeight: 80,
                            backgroundColor: isToday ? token.colorPrimaryBg : 'transparent',
                            border: isSelected ? `2px solid ${token.colorPrimary}` : 'none',
                            borderRadius: token.borderRadius,
                            cursor: 'pointer',
                            position: 'relative',
                        }}
                        onClick={() => setSelectedDate(date)}
                    >
                        <div style={{ 
                            display: 'flex', 
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            marginBottom: token.marginXXS 
                        }}>
                            <Text style={{ 
                                fontWeight: isToday ? 'bold' : 'normal',
                                color: isToday ? token.colorPrimary : undefined 
                            }}>
                                {date.format("D")}
                            </Text>
                            {leavesOnDate.length > 0 && (
                                <Badge 
                                    count={leavesOnDate.length} 
                                    size="small"
                                    style={{ backgroundColor: token.colorPrimary }}
                                />
                            )}
                        </div>
                        
                        <AnimatePresence>
                            {leavesOnDate.slice(0, 2).map((leave, idx) => {
                                const groupInfo = getGroupInfo(leave.group);
                                return (
                                    <motion.div
                                        key={idx}
                                        initial={{ opacity: 0, y: -5 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0 }}
                                        transition={{ delay: idx * 0.1 }}
                                        style={{
                                            fontSize: 11,
                                            padding: '2px 4px',
                                            marginBottom: 2,
                                            backgroundColor: statusConfig[leave.status]?.bg,
                                            borderRadius: token.borderRadiusSM,
                                            whiteSpace: 'nowrap',
                                            overflow: 'hidden',
                                            textOverflow: 'ellipsis',
                                            color: statusConfig[leave.status]?.color,
                                            border: `1px solid ${statusConfig[leave.status]?.color}`,
                                        }}
                                        onMouseEnter={() => setHoveredEvent(leave.id)}
                                        onMouseLeave={() => setHoveredEvent(null)}
                                    >
                                        {leave.employee?.split(' ')[0] || 'Unknown'}
                                    </motion.div>
                                );
                            })}
                            {leavesOnDate.length > 2 && (
                                <div style={{ 
                                    fontSize: 10, 
                                    color: token.colorTextSecondary,
                                    textAlign: 'center' 
                                }}>
                                    +{leavesOnDate.length - 2} more
                                </div>
                            )}
                        </AnimatePresence>
                    </div>
                </Popover>
            </motion.div>
        );
    };

    // Status filter menu
    const statusFilterMenu = (
        <Menu
            selectedKeys={[filterStatus]}
            onClick={({ key }) => setFilterStatus(key)}
            items={[
                { key: "all", label: "All Leaves", icon: <CalendarOutlined /> },
                { key: "pending", label: "Pending", icon: <ClockCircleOutlined /> },
                { key: "approved", label: "Approved", icon: <CheckCircleOutlined /> },
                { key: "rejected", label: "Rejected", icon: <CloseCircleOutlined /> },
            ]}
        />
    );

    // Group filter menu
    const groupFilterMenu = (
        <Menu
            selectedKeys={[selectedGroup]}
            onClick={({ key }) => setSelectedGroup(key)}
        >
            <Menu.Item key="all" icon={<TeamOutlined />}>
                All Groups
            </Menu.Item>
            <Menu.Divider />
            {groups.map(group => (
                <Menu.Item key={group.id}>
                    <Space>
                        <div 
                            style={{
                                width: 12,
                                height: 12,
                                borderRadius: token.borderRadius,
                                backgroundColor: group.color,
                            }}
                        />
                        {group.name}
                    </Space>
                </Menu.Item>
            ))}
        </Menu>
    );

    return (
        <Card
            title={
                <Space>
                    <CalendarOutlined style={{ color: token.colorPrimary }} />
                    <span>Leave Calendar</span>
                    {leaveStats.pending > 0 && (
                        <Badge 
                            count={leaveStats.pending} 
                            style={{ backgroundColor: token.colorWarning }}
                            title="Pending approvals"
                        />
                    )}
                </Space>
            }
            className="calendar-section"
            extra={
                <Space wrap size="small">
                    <Dropdown overlay={statusFilterMenu} trigger={["click"]}>
                        <Button icon={<FilterOutlined />} size="small">
                            Status
                        </Button>
                    </Dropdown>
                    <Dropdown overlay={groupFilterMenu} trigger={["click"]}>
                        <Button icon={<TeamOutlined />} size="small">
                            Groups
                        </Button>
                    </Dropdown>
                    <Button
                        type="primary"
                        icon={<PlusOutlined />}
                        size="small"
                        onClick={() => setLeaveModalVisible(true)}
                    >
                        New Leave
                    </Button>
                    <Button
                        icon={<EyeOutlined />}
                        onClick={() => setActiveTab("calendar")}
                        size="small"
                    >
                        Full View
                    </Button>
                </Space>
            }
        >
            <div className="calendar-preview">
                <Row gutter={[16, 16]}>
                    {/* Calendar View */}
                    <Col xs={24} xl={16}>
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.3 }}
                        >
                            {/* Calendar Header */}
                            <div style={{ 
                                display: 'flex', 
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                marginBottom: token.margin,
                                flexWrap: 'wrap',
                                gap: token.marginXS,
                            }}>
                                <Space>
                                    <Button
                                        icon={<LeftOutlined />}
                                        size="small"
                                        onClick={() => setCurrentDate(currentDate.subtract(1, 'month'))}
                                    />
                                    <Title level={5} style={{ margin: 0 }}>
                                        {currentDate.format("MMMM YYYY")}
                                    </Title>
                                    <Button
                                        icon={<RightOutlined />}
                                        size="small"
                                        onClick={() => setCurrentDate(currentDate.add(1, 'month'))}
                                    />
                                    <Button
                                        size="small"
                                        onClick={() => setCurrentDate(dayjs())}
                                    >
                                        Today
                                    </Button>
                                </Space>
                                
                                <Radio.Group 
                                    value={calendarView} 
                                    onChange={(e) => setCalendarView(e.target.value)}
                                    size="small"
                                    buttonStyle="solid"
                                >
                                    <Radio.Button value="month">Month</Radio.Button>
                                    <Radio.Button value="week">Week</Radio.Button>
                                </Radio.Group>
                            </div>

                            {/* Calendar Grid */}
                            <div style={{ 
                                display: 'grid',
                                gridTemplateColumns: 'repeat(7, 1fr)',
                                gap: token.marginXXS,
                                backgroundColor: token.colorBgContainer,
                                borderRadius: token.borderRadius,
                                overflow: 'hidden',
                            }}>
                                {/* Weekday headers */}
                                {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(day => (
                                    <div key={day} style={{
                                        padding: token.paddingXS,
                                        textAlign: 'center',
                                        backgroundColor: token.colorBgLayout,
                                        fontWeight: 'bold',
                                        fontSize: 12,
                                    }}>
                                        {day}
                                    </div>
                                ))}
                                
                                {/* Calendar cells */}
                                {calendarDays.map((date, index) => (
                                    <div key={index}>
                                        {renderCalendarCell(date)}
                                    </div>
                                ))}
                            </div>

                            {/* Quick Stats */}
                            <Row gutter={[8, 8]} style={{ marginTop: token.margin }}>
                                {Object.entries(leaveStats).map(([key, value]) => (
                                    <Col xs={12} sm={6} key={key}>
                                        <Card size="small" className="stat-card-mini">
                                            <Statistic
                                                title={key.charAt(0).toUpperCase() + key.slice(1)}
                                                value={value}
                                                valueStyle={{ 
                                                    color: key === 'total' ? token.colorPrimary :
                                                           key === 'pending' ? token.colorWarning :
                                                           key === 'approved' ? token.colorSuccess :
                                                           token.colorError,
                                                }}
                                                prefix={
                                                    key === 'total' ? <CalendarOutlined /> :
                                                    key === 'pending' ? <ClockCircleOutlined /> :
                                                    key === 'approved' ? <CheckCircleOutlined /> :
                                                    <CloseCircleOutlined />
                                                }
                                            />
                                        </Card>
                                    </Col>
                                ))}
                            </Row>
                        </motion.div>
                    </Col>

                    {/* Sidebar */}
                    <Col xs={24} xl={8}>
                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.3, delay: 0.1 }}
                        >
                            <Space direction="vertical" size="middle" style={{ width: '100%' }}>
                                {/* Upcoming Leaves */}
                                <Card
                                    title={
                                        <Space>
                                            <ClockCircleOutlined style={{ color: token.colorWarning }} />
                                            <span>Upcoming Leaves</span>
                                        </Space>
                                    }
                                    extra={
                                        <Tooltip title="View all">
                                            <Button 
                                                type="text" 
                                                size="small" 
                                                icon={<EyeOutlined />}
                                                onClick={() => setActiveTab("calendar")}
                                            />
                                        </Tooltip>
                                    }
                                    className="upcoming-leaves-card"
                                >
                                    {upcomingLeaves.length > 0 ? (
                                        <List
                                            dataSource={upcomingLeaves}
                                            renderItem={(event, index) => {
                                                const employee = getEmployeeInfo(event.employeeId || event.employee);
                                                const groupInfo = getGroupInfo(event.group);
                                                const startDate = dayjs(event.start);
                                                
                                                return (
                                                    <motion.div
                                                        initial={{ opacity: 0, x: -10 }}
                                                        animate={{ opacity: 1, x: 0 }}
                                                        transition={{ delay: index * 0.05 }}
                                                    >
                                                        <List.Item
                                                            className="upcoming-leave-item"
                                                            style={{ 
                                                                cursor: 'pointer',
                                                                padding: token.paddingSM,
                                                                borderRadius: token.borderRadius,
                                                                backgroundColor: hoveredEvent === event.id ? token.colorBgTextHover : 'transparent',
                                                            }}
                                                            onMouseEnter={() => setHoveredEvent(event.id)}
                                                            onMouseLeave={() => setHoveredEvent(null)}
                                                        >
                                                            <List.Item.Meta
                                                                avatar={
                                                                    <Avatar
                                                                        size="small"
                                                                        style={{
                                                                            background: groupInfo.gradient,
                                                                        }}
                                                                        icon={<UserOutlined />}
                                                                    />
                                                                }
                                                                title={
                                                                    <Space size={4} wrap>
                                                                        <Text strong>{employee.name}</Text>
                                                                        <Tag 
                                                                            size="small"
                                                                            color={statusConfig[event.status]?.color}
                                                                        >
                                                                            {event.status}
                                                                        </Tag>
                                                                    </Space>
                                                                }
                                                                description={
                                                                    <Space size={4} wrap style={{ fontSize: 12 }}>
                                                                        <span>{event.type}</span>
                                                                        <span>•</span>
                                                                        <span>{startDate.format("MMM DD")}</span>
                                                                        <span>•</span>
                                                                        <span>{event.duration} days</span>
                                                                    </Space>
                                                                }
                                                            />
                                                            <div
                                                                style={{
                                                                    width: 4,
                                                                    height: '100%',
                                                                    backgroundColor: groupInfo.color,
                                                                    borderRadius: token.borderRadius,
                                                                }}
                                                            />
                                                        </List.Item>
                                                    </motion.div>
                                                );
                                            }}
                                        />
                                    ) : (
                                        <Empty 
                                            image={Empty.PRESENTED_IMAGE_SIMPLE}
                                            description="No upcoming leaves"
                                        />
                                    )}
                                </Card>

                                {/* Leave Distribution Chart */}
                                {leaveTypeData.length > 0 && (
                                    <Card
                                        title={
                                            <Space>
                                                <BarChartOutlined style={{ color: token.colorPrimary }} />
                                                <span>Leave Distribution</span>
                                            </Space>
                                        }
                                        size="small"
                                    >
                                        <ResponsiveContainer width="100%" height={200}>
                                            <PieChart>
                                                <Pie
                                                    data={leaveTypeData}
                                                    cx="50%"
                                                    cy="50%"
                                                    innerRadius={40}
                                                    outerRadius={70}
                                                    paddingAngle={2}
                                                    dataKey="value"
                                                    label={({ name, percentage }) => `${name} (${percentage}%)`}
                                                    labelLine={{ stroke: token.colorTextSecondary, strokeWidth: 1 }}
                                                >
                                                    {leaveTypeData.map((entry, index) => (
                                                        <Cell 
                                                            key={`cell-${index}`}
                                                            fill={token[`colorPrimary${(index % 5) + 1}`] || token.colorPrimary}
                                                        />
                                                    ))}
                                                </Pie>
                                                <Legend />
                                            </PieChart>
                                        </ResponsiveContainer>
                                    </Card>
                                )}

                                {/* Quick Actions */}
                                <Card
                                    title={
                                        <Space>
                                            <RiseOutlined style={{ color: token.colorSuccess }} />
                                            <span>Quick Actions</span>
                                        </Space>
                                    }
                                    className="quick-actions-card"
                                >
                                    <Space direction="vertical" style={{ width: '100%' }} size="small">
                                        <Button
                                            icon={<PlusOutlined />}
                                            block
                                            type="primary"
                                            onClick={() => setLeaveModalVisible(true)}
                                        >
                                            Add New Leave
                                        </Button>
                                        <Button
                                            icon={<TeamOutlined />}
                                            block
                                            onClick={() => setActiveTab("groups")}
                                        >
                                            Manage Groups
                                        </Button>
                                        <Button icon={<DownloadOutlined />} block>
                                            Export Calendar
                                        </Button>
                                        <Button icon={<ShareAltOutlined />} block>
                                            Share Calendar
                                        </Button>
                                    </Space>
                                </Card>

                                {/* Month Summary */}
                                <Card
                                    title={
                                        <Space>
                                            <FireOutlined style={{ color: token.colorError }} />
                                            <span>This Month Summary</span>
                                        </Space>
                                    }
                                    size="small"
                                >
                                    <Row gutter={[8, 8]}>
                                        <Col span={12}>
                                            <div style={{ textAlign: 'center' }}>
                                                <Text type="secondary">Busiest Day</Text>
                                                <div>
                                                    <Text strong>
                                                        {dayOfWeekData.reduce(
                                                            (max, day) => day.leaves > max.leaves ? day : max,
                                                            { day: "Mon", leaves: 0 }
                                                        ).day}
                                                    </Text>
                                                </div>
                                            </div>
                                        </Col>
                                        <Col span={12}>
                                            <div style={{ textAlign: 'center' }}>
                                                <Text type="secondary">Avg Duration</Text>
                                                <div>
                                                    <Text strong>
                                                        {currentMonthLeaves.length > 0
                                                            ? (currentMonthLeaves.reduce((sum, e) => sum + e.duration, 0) / currentMonthLeaves.length).toFixed(1)
                                                            : 0} days
                                                    </Text>
                                                </div>
                                            </div>
                                        </Col>
                                    </Row>
                                </Card>
                            </Space>
                        </motion.div>
                    </Col>
                </Row>
            </div>

            <style jsx>{`
                .calendar-preview {
                    width: 100%;
                }

                .calendar-cell {
                    transition: all 0.2s ease;
                }

                .calendar-cell.other-month {
                    opacity: 0.5;
                }

                .calendar-cell.today {
                    font-weight: bold;
                }

                .calendar-cell.selected {
                    transform: scale(0.98);
                }

                .upcoming-leave-item {
                    transition: background-color 0.2s ease;
                }

                .stat-card-mini {
                    transition: transform 0.2s ease;
                }

                .stat-card-mini:hover {
                    transform: translateY(-2px);
                }

                @media (max-width: 768px) {
                    .calendar-cell {
                        min-height: 60px;
                        padding: ${token.paddingXXS}px;
                    }
                    
                    .calendar-cell div[style*="font-size: 11px"] {
                        font-size: 9px !important;
                    }
                }

                @media (max-width: 480px) {
                    .calendar-cell {
                        min-height: 50px;
                    }
                    
                    .ant-card-extra {
                        width: 100%;
                        margin-top: ${token.marginXS}px;
                    }
                }
            `}</style>
        </Card>
    );
};

export default CalendarPreview;