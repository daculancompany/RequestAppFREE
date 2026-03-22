// components/Analytics/AnalyticsDashboard.jsx
import React from 'react';
import { Row, Col, Card } from 'antd';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as ChartTooltip,
  Legend,
  ResponsiveContainer,
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis
} from 'recharts';
import {
  LineChartOutlined,
  PieChartOutlined,
  AreaChartOutlined
} from '@ant-design/icons';

const AnalyticsDashboard = ({ appContext }) => {
  // Sample data (you can move this to utils/constants.js)
  const leaveTrendsData = [
    { month: 'Jan', pending: 12, approved: 8, rejected: 2 },
    { month: 'Feb', pending: 8, approved: 10, rejected: 1 },
    { month: 'Mar', pending: 15, approved: 12, rejected: 3 },
    { month: 'Apr', pending: 10, approved: 9, rejected: 1 },
    { month: 'May', pending: 18, approved: 15, rejected: 2 },
    { month: 'Jun', pending: 14, approved: 11, rejected: 3 }
  ];

  const departmentLeaveData = [
    { name: 'Development', leaves: 45, avgDays: 4.2 },
    { name: 'Design', leaves: 32, avgDays: 3.8 },
    { name: 'QA', leaves: 28, avgDays: 2.5 },
    { name: 'HR', leaves: 15, avgDays: 5.1 },
    { name: 'Sales', leaves: 38, avgDays: 3.2 }
  ];

  const leaveTypeData = [
    { name: 'Vacation', value: 45, color: '#0088FE' },
    { name: 'Sick', value: 25, color: '#00C49F' },
    { name: 'Personal', value: 18, color: '#FFBB28' },
    { name: 'Maternity', value: 8, color: '#FF8042' },
    { name: 'Emergency', value: 4, color: '#8884D8' }
  ];

  const performanceData = [
    { subject: 'Approval Speed', A: 90, B: 75, fullMark: 100 },
    { subject: 'Accuracy', A: 95, B: 80, fullMark: 100 },
    { subject: 'Response Time', A: 85, B: 70, fullMark: 100 },
    { subject: 'Satisfaction', A: 92, B: 78, fullMark: 100 },
    { subject: 'Efficiency', A: 88, B: 72, fullMark: 100 }
  ];

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

  return (
    <div className="analytics-dashboard">
      <Row gutter={[16, 16]}>
        {/* Leave Trends Chart */}
        <Col xs={24} lg={12}>
          <Card 
            title="Leave Trends - Last 6 Months"
            className="chart-card"
            extra={<LineChartOutlined />}
          >
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={leaveTrendsData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <ChartTooltip />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="pending" 
                  stroke="#faad14" 
                  activeDot={{ r: 8 }}
                  name="Pending"
                />
                <Line 
                  type="monotone" 
                  dataKey="approved" 
                  stroke="#52c41a"
                  name="Approved"
                />
                <Line 
                  type="monotone" 
                  dataKey="rejected" 
                  stroke="#ff4d4f"
                  name="Rejected"
                />
              </LineChart>
            </ResponsiveContainer>
          </Card>
        </Col>
        
        {/* Department Leave Distribution */}
        <Col xs={24} lg={12}>
          <Card 
            title="Leaves by Department"
            className="chart-card"
            extra={<PieChartOutlined />}
          >
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={departmentLeaveData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="leaves"
                >
                  {departmentLeaveData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <ChartTooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </Card>
        </Col>
        
        {/* Leave Type Distribution */}
        <Col xs={24} lg={12}>
          <Card 
            title="Leave Type Distribution"
            className="chart-card"
            extra={<AreaChartOutlined />}
          >
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={leaveTypeData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <ChartTooltip />
                <Legend />
                <Bar dataKey="value" name="Number of Leaves">
                  {leaveTypeData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </Col>
        
        {/* Performance Radar */}
        <Col xs={24} lg={12}>
          <Card 
            title="Performance Metrics"
            className="chart-card"
            extra={<div>Radar</div>}
          >
            <ResponsiveContainer width="100%" height={300}>
              <RadarChart data={performanceData}>
                <PolarGrid />
                <PolarAngleAxis dataKey="subject" />
                <PolarRadiusAxis />
                <Radar
                  name="Current"
                  dataKey="A"
                  stroke="#8884d8"
                  fill="#8884d8"
                  fillOpacity={0.6}
                />
                <Radar
                  name="Target"
                  dataKey="B"
                  stroke="#82ca9d"
                  fill="#82ca9d"
                  fillOpacity={0.6}
                />
                <Legend />
                <ChartTooltip />
              </RadarChart>
            </ResponsiveContainer>
          </Card>
        </Col>
        
        {/* Summary Statistics */}
        <Col xs={24}>
          <Card title="Summary Statistics">
            <Row gutter={[16, 16]}>
              <Col xs={24} md={8}>
                <div className="summary-item">
                  <h4>Total Leave Days</h4>
                  <h2>{appContext.leaveRequests.reduce((sum, req) => sum + req.duration, 0)}</h2>
                  <p>Days taken this year</p>
                </div>
              </Col>
              <Col xs={24} md={8}>
                <div className="summary-item">
                  <h4>Avg Leave Duration</h4>
                  <h2>{appContext.leaveRequests.length > 0 
                    ? (appContext.leaveRequests.reduce((sum, req) => sum + req.duration, 0) / appContext.leaveRequests.length).toFixed(1) 
                    : 0}
                  </h2>
                  <p>Days per request</p>
                </div>
              </Col>
              <Col xs={24} md={8}>
                <div className="summary-item">
                  <h4>Peak Leave Month</h4>
                  <h2>May</h2>
                  <p>18 pending leaves</p>
                </div>
              </Col>
            </Row>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default AnalyticsDashboard;