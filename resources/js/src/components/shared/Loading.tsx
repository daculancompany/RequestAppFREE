// @ts-nocheck
import React from 'react';
import { Spin, Row, Col, Card } from 'antd';
import { LoadingOutlined } from '@ant-design/icons';

interface LoadingSpinnerProps {
  tip?: string;
  size?: 'small' | 'default' | 'large';
  fullScreen?: boolean;
  delay?: number;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  tip = 'Loading...',
  size = 'large',
  fullScreen = false,
  delay = 0,
}) => {
  const spinner = (
    <Spin
      tip={tip}
      size={size}
      delay={delay}
      indicator={<LoadingOutlined style={{ fontSize: 24 }} spin />}
    />
  );

  if (fullScreen) {
    return (
      <div
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: 'rgba(255, 255, 255, 0.8)',
          zIndex: 9999,
        }}
      >
        {spinner}
      </div>
    );
  }

  return (
    <Row justify="center" align="middle" style={{ minHeight: 200 }}>
      <Col>{spinner}</Col>
    </Row>
  );
};

// Skeleton loading component for content
export const LoadingSkeleton: React.FC<{ rows?: number }> = ({ rows = 3 }) => {
  return (
    <Card style={{ width: '100%' }}>
      {Array.from({ length: rows }).map((_, index) => (
        <div
          key={index}
          style={{
            height: 16,
            backgroundColor: '#f0f0f0',
            borderRadius: 4,
            marginBottom: 12,
            width: `${Math.random() * 40 + 60}%`,
          }}
        />
      ))}
    </Card>
  );
};

// Inline loading indicator
export const InlineLoading: React.FC<{ text?: string }> = ({ text }) => {
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
      <Spin size="small" indicator={<LoadingOutlined spin />} />
      {text && <span>{text}</span>}
    </span>
  );
};

export default LoadingSpinner;