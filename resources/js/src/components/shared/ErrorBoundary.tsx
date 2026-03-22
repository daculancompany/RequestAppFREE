// @ts-nocheck
import React, { Component, ErrorInfo, ReactNode } from 'react';
import { Alert, Button, Card, Space, Typography } from 'antd';
import { ReloadOutlined, WarningOutlined } from '@ant-design/icons';

const { Title, Paragraph, Text } = Typography;

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  message?: string;
  onRetry?: () => void;
  error?: Error;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error,
      errorInfo: null,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    this.setState({
      error,
      errorInfo,
    });

    // Log error to error reporting service
    console.error('ErrorBoundary caught an error:', error, errorInfo);

    // Call custom error handler if provided
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }
  }

  handleReset = (): void => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
  };

  render(): ReactNode {
    if (this.state.hasError || this.props.error) {
      // Use custom fallback if provided
      if (this.props.fallback) {
        return this.props.fallback;
      }

      const error = this.props.error || this.state.error;
      const showRetry = !!this.props.onRetry;

      return (
        <Card
          style={{
            maxWidth: 800,
            margin: '40px auto',
            borderColor: '#ff4d4f',
          }}
        >
          <Space direction="vertical" size="large" style={{ width: '100%' }}>
            <div style={{ textAlign: 'center' }}>
              <WarningOutlined style={{ fontSize: 48, color: '#ff4d4f' }} />
              <Title level={3} style={{ marginTop: 16 }}>
                {this.props.message || 'Something went wrong'}
              </Title>
            </div>

            {error && (
              <Alert
                type="error"
                showIcon
                message={
                  <div>
                    <Paragraph>
                      <Text strong>Error: </Text>
                      {error.message}
                    </Paragraph>
                    {process.env.NODE_ENV === 'development' && (
                      <Paragraph>
                        <Text strong>Stack: </Text>
                        <pre style={{ fontSize: 12, whiteSpace: 'pre-wrap' }}>
                          {error.stack}
                        </pre>
                      </Paragraph>
                    )}
                  </div>
                }
              />
            )}

            {this.state.errorInfo && process.env.NODE_ENV === 'development' && (
              <Alert
                type="info"
                message="Component Stack"
                description={
                  <pre style={{ fontSize: 12, whiteSpace: 'pre-wrap' }}>
                    {this.state.errorInfo.componentStack}
                  </pre>
                }
              />
            )}

            <Space style={{ justifyContent: 'center', width: '100%' }}>
              {showRetry ? (
                <Button
                  type="primary"
                  icon={<ReloadOutlined />}
                  onClick={this.props.onRetry}
                >
                  Try Again
                </Button>
              ) : (
                <Button
                  type="primary"
                  icon={<ReloadOutlined />}
                  onClick={this.handleReset}
                >
                  Reload Component
                </Button>
              )}
              <Button onClick={() => window.location.reload()}>
                Reload Page
              </Button>
            </Space>
          </Space>
        </Card>
      );
    }

    return this.props.children;
  }
}

// Error display component (without boundary)
export const ErrorDisplay: React.FC<{
  error: Error | string;
  onRetry?: () => void;
  title?: string;
}> = ({ error, onRetry, title = 'Error' }) => {
  const errorMessage = typeof error === 'string' ? error : error.message;

  return (
    <Alert
      message={title}
      description={
        <div>
          <p>{errorMessage}</p>
          {typeof error !== 'string' && error.stack && (
            <pre style={{ fontSize: 12, opacity: 0.7 }}>
              {error.stack.split('\n').slice(0, 3).join('\n')}
            </pre>
          )}
        </div>
      }
      type="error"
      showIcon
      action={
        onRetry && (
          <Button size="small" danger onClick={onRetry}>
            Retry
          </Button>
        )
      }
    />
  );
};

// Network error specific component
export const NetworkError: React.FC<{
  onRetry?: () => void;
}> = ({ onRetry }) => {
  return (
    <div style={{ textAlign: 'center', padding: '40px 20px' }}>
      <Alert
        message="Network Error"
        description="Unable to connect to the server. Please check your internet connection and try again."
        type="warning"
        showIcon
        style={{ maxWidth: 500, margin: '0 auto' }}
        action={
          onRetry && (
            <Button size="small" type="primary" onClick={onRetry}>
              Retry Connection
            </Button>
          )
        }
      />
    </div>
  );
};

// Empty state component
export const EmptyState: React.FC<{
  title?: string;
  description?: string;
  icon?: React.ReactNode;
  action?: React.ReactNode;
}> = ({ 
  title = 'No Data', 
  description = 'There is no data to display.',
  icon,
  action 
}) => {
  return (
    <div style={{ textAlign: 'center', padding: '40px 20px' }}>
      {icon}
      <Title level={4} style={{ marginTop: 16 }}>
        {title}
      </Title>
      <Paragraph type="secondary">{description}</Paragraph>
      {action && <div style={{ marginTop: 16 }}>{action}</div>}
    </div>
  );
};

export default ErrorBoundary;