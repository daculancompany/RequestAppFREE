// components/Dashboard/StatsCards.jsx
import React from 'react';
import { Row, Col, Card, Statistic } from 'antd';
import {
  CalendarOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined,
  HistoryOutlined
} from '@ant-design/icons';

const StatsCards = ({ appContext }) => {
  const { leaveRequests } = appContext;
  
  const stats = [
    {
      title: "Total Leaves",
      value: leaveRequests.length,
      prefix: <CalendarOutlined />,
      color: '#1890ff',
      trend: "+12% this month",
      trendType: "up"
    },
    {
      title: "Pending Approval",
      value: leaveRequests.filter(l => l.status === 'pending').length,
      prefix: <ClockCircleOutlined />,
      color: '#faad14',
      trend: "-5% this week",
      trendType: "down"
    },
    {
      title: "Approval Rate",
      value: 92,
      suffix: "%",
      prefix: <CheckCircleOutlined />,
      color: '#52c41a',
      trend: "+3% this month",
      trendType: "up"
    },
    {
      title: "Avg Response Time",
      value: 2.5,
      suffix: "hours",
      prefix: <HistoryOutlined />,
      color: '#722ed1',
      trend: "-0.5h faster",
      trendType: "up"
    }
  ];

  return (
    <Row gutter={[16, 16]} className="stats-overview">
      {stats.map((stat, index) => (
        <Col xs={24} sm={12} md={6} key={index}>
          <Card className="stat-card">
            <Statistic 
              title={stat.title}
              value={stat.value}
              prefix={stat.prefix}
              suffix={stat.suffix}
              valueStyle={{ color: stat.color }}
            />
            <div className={`stat-trend ${stat.trendType}`}>{stat.trend}</div>
          </Card>
        </Col>
      ))}
    </Row>
  );
};

export default StatsCards;