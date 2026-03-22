// components/Chat/ChatDrawer.jsx
import React, { useEffect, useRef } from 'react';
import { Drawer, Input, Button, Avatar, Tag, Badge, Space, Divider, Popover } from 'antd';
import { motion } from 'framer-motion';
import {
  SendOutlined,
  PaperClipOutlined,
  SmileOutlined,
  LikeOutlined,
  DislikeOutlined,
  StarOutlined,
  HeartOutlined,
  MoreOutlined,
  UserOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  FilePdfOutlined,
  DownloadOutlined,
  MessageOutlined,
  CalendarOutlined
} from '@ant-design/icons';
import dayjs from 'dayjs';

const { TextArea } = Input;

const ChatDrawer = ({ 
  visible, 
  onClose, 
  selectedLeave, 
  messages, 
  messageInput, 
  setMessageInput,
  handleSendMessage 
}) => {
  const messagesEndRef = useRef(null);

  // Auto scroll to bottom
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  // Get status color
  const getStatusColor = (status) => {
    const colors = {
      approved: { bg: '#52c41a', text: '#fff', icon: <CheckCircleOutlined /> },
      rejected: { bg: '#ff4d4f', text: '#fff', icon: <CloseCircleOutlined /> },
      pending: { bg: '#faad14', text: '#fff', icon: <ClockCircleOutlined /> },
    };
    return colors[status] || colors.pending;
  };

  // Sample emoji reactions
  const emojiReactions = [
    { emoji: '👍', label: 'Like' },
    { emoji: '👎', label: 'Dislike' },
    { emoji: '❤️', label: 'Love' },
    { emoji: '🎉', label: 'Celebrate' },
    { emoji: '🤔', label: 'Thinking' },
    { emoji: '🚀', label: 'Rocket' },
  ];

  // Sample quick replies
  const quickReplies = [
    "Approved. Please submit your handover notes.",
    "Rejected. Please check company policy.",
    "Need more information about this leave.",
    "Please update the dates and resubmit.",
    "I'll discuss this with HR and get back to you.",
    "Can you provide a medical certificate?"
  ];

  if (!selectedLeave) return null;

  return (
    <Drawer
      title={
        <div className="chat-drawer-header">
          <div className="leave-chat-info">
            <Avatar src={selectedLeave.avatar} size="large" />
            <div className="leave-chat-details">
              <h4 style={{ margin: 0 }}>{selectedLeave.employee}</h4>
              <div className="leave-chat-meta">
                <Tag color={getStatusColor(selectedLeave.status).bg}>
                  {getStatusColor(selectedLeave.status).icon} {selectedLeave.status}
                </Tag>
                <span>•</span>
                <span>{selectedLeave.type}</span>
                <span>•</span>
                <span>{selectedLeave.duration} days</span>
              </div>
            </div>
          </div>
          <Space>
            <Badge count={selectedLeave.conversation?.length || 0}>
              <MessageOutlined />
            </Badge>
          </Space>
        </div>
      }
      placement="right"
      onClose={onClose}
      open={visible}
      width={500}
      className="chat-drawer"
      extra={
        <Space>
          <Button icon={<FilePdfOutlined />} size="small">
            PDF
          </Button>
          <Button icon={<DownloadOutlined />} size="small">
            Export
          </Button>
        </Space>
      }
    >
      <div className="chat-container">
        {/* Leave Summary */}
        <motion.div 
          className="leave-summary-chat"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="leave-summary-content">
            <div className="summary-header">
              <h5>Leave Request #{selectedLeave.id}</h5>
              <Tag color="blue" icon={<CalendarOutlined />}>
                {dayjs(selectedLeave.dates[0]).format('MMM DD')} - {dayjs(selectedLeave.dates[1]).format('MMM DD')}
              </Tag>
            </div>
            <p>{selectedLeave.reason}</p>
            <div className="summary-footer">
              <small>
                Submitted: {dayjs(selectedLeave.submitted).format('MMM DD, HH:mm')}
              </small>
              <small>
                Approver: {selectedLeave.approver}
              </small>
            </div>
          </div>
        </motion.div>

        {/* Quick Actions */}
        <div className="chat-quick-actions">
          <div className="quick-replies">
            <h5>Quick Replies:</h5>
            <Space wrap>
              {quickReplies.slice(0, 3).map((reply, idx) => (
                <Button 
                  key={idx} 
                  size="small"
                  onClick={() => setMessageInput(reply)}
                >
                  {reply.length > 30 ? reply.substring(0, 30) + '...' : reply}
                </Button>
              ))}
              <Popover
                content={
                  <div className="quick-replies-popover">
                    {quickReplies.map((reply, idx) => (
                      <div 
                        key={idx} 
                        className="quick-reply-item"
                        onClick={() => {
                          setMessageInput(reply);
                        }}
                      >
                        {reply}
                      </div>
                    ))}
                  </div>
                }
                trigger="click"
              >
                <Button size="small" type="text">
                  More...
                </Button>
              </Popover>
            </Space>
          </div>
        </div>

        {/* Messages */}
        <div className="chat-messages-container">
          <Divider orientation="left">
            <small>Conversation History</small>
          </Divider>
          
          <div className="chat-messages">
            {messages.length === 0 ? (
              <div className="no-messages">
                <MessageOutlined style={{ fontSize: 48, color: '#d9d9d9' }} />
                <p>No messages yet. Start the conversation!</p>
              </div>
            ) : (
              messages.map((msg, index) => (
                <motion.div 
                  key={msg.id || index}
                  className={`chat-message ${msg.sender.includes('You') ? 'sent' : 'received'}`}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <div className="message-sender">
                    {!msg.sender.includes('You') && (
                      <Avatar 
                        size="small" 
                        icon={<UserOutlined />} 
                        src={selectedLeave.avatar}
                      />
                    )}
                    <div className="sender-info">
                      <strong>{msg.sender}</strong>
                      {msg.senderRole && <small>{msg.senderRole}</small>}
                    </div>
                    {msg.sender.includes('You') && (
                      <Avatar 
                        size="small" 
                        icon={<UserOutlined />}
                        style={{ backgroundColor: '#1890ff' }}
                      />
                    )}
                  </div>
                  
                  <div className="message-content">
                    <div className="message-text">{msg.message}</div>
                    <div className="message-time">
                      <ClockCircleOutlined style={{ marginRight: 4 }} />
                      {dayjs(msg.time).format('HH:mm')}
                    </div>
                    
                    {/* Message Reactions */}
                    {msg.reactions && Object.keys(msg.reactions).length > 0 && (
                      <div className="message-reactions">
                        {Object.entries(msg.reactions).map(([emoji, count]) => (
                          <div key={emoji} className="reaction">
                            <span>{emoji}</span>
                            <span className="reaction-count">{count}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                  
                  {/* Message Actions */}
                  <div className="message-actions">
                    <Space size={0}>
                      <Popover
                        content={
                          <div className="emoji-picker">
                            <div className="emoji-grid">
                              {emojiReactions.map((item, idx) => (
                                <div 
                                  key={idx}
                                  className="emoji-item"
                                  onClick={() => {
                                    // Handle emoji reaction
                                    console.log('Reacted with:', item.emoji);
                                  }}
                                >
                                  {item.emoji}
                                </div>
                              ))}
                            </div>
                          </div>
                        }
                        trigger="click"
                      >
                        <Button 
                          type="text" 
                          size="small" 
                          icon={<SmileOutlined />}
                        />
                      </Popover>
                      <Button 
                        type="text" 
                        size="small" 
                        icon={<LikeOutlined />}
                        onClick={() => {
                          // Handle like
                          console.log('Liked message:', msg.id);
                        }}
                      />
                      <Button 
                        type="text" 
                        size="small" 
                        icon={<MoreOutlined />}
                      />
                    </Space>
                  </div>
                </motion.div>
              ))
            )}
            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* Input Area */}
        <div className="chat-input-container">
          <Divider style={{ margin: '16px 0' }} />
          
          <div className="chat-input-wrapper">
            <div className="input-tools">
              <Space>
                <Button 
                  type="text" 
                  icon={<PaperClipOutlined />}
                  title="Attach file"
                />
                <Popover
                  content={
                    <div className="emoji-picker">
                      <div className="emoji-grid">
                        {emojiReactions.map((item, idx) => (
                          <div 
                            key={idx}
                            className="emoji-item"
                            onClick={() => {
                              setMessageInput(prev => prev + item.emoji);
                            }}
                          >
                            {item.emoji}
                          </div>
                        ))}
                      </div>
                    </div>
                  }
                  trigger="click"
                >
                  <Button 
                    type="text" 
                    icon={<SmileOutlined />}
                    title="Insert emoji"
                  />
                </Popover>
                <Button 
                  type="text" 
                  icon={<StarOutlined />}
                  title="Save as template"
                />
              </Space>
            </div>
            
            <TextArea
              value={messageInput}
              onChange={(e) => setMessageInput(e.target.value)}
              placeholder="Type your message here..."
              autoSize={{ minRows: 2, maxRows: 4 }}
              onPressEnter={(e) => {
                if (e.shiftKey) {
                  return; // Allow new line with Shift+Enter
                }
                e.preventDefault();
                handleSendMessage();
              }}
              className="chat-textarea"
            />
            
            <div className="input-actions">
              <Space>
                <Button
                  type="primary"
                  icon={<SendOutlined />}
                  onClick={handleSendMessage}
                  disabled={!messageInput.trim()}
                  className="send-button"
                >
                  Send
                </Button>
                <Popover
                  content={
                    <div className="message-templates">
                      <h5>Message Templates</h5>
                      <div className="template-list">
                        <div 
                          className="template-item"
                          onClick={() => setMessageInput("Approved. Please complete your handover before leaving.")}
                        >
                          <CheckCircleOutlined style={{ color: '#52c41a' }} />
                          <span>Approval Template</span>
                        </div>
                        <div 
                          className="template-item"
                          onClick={() => setMessageInput("Rejected. This period conflicts with important project deadlines.")}
                        >
                          <CloseCircleOutlined style={{ color: '#ff4d4f' }} />
                          <span>Rejection Template</span>
                        </div>
                        <div 
                          className="template-item"
                          onClick={() => setMessageInput("Please provide more details about your leave request.")}
                        >
                          <MessageOutlined style={{ color: '#1890ff' }} />
                          <span>Request More Info</span>
                        </div>
                      </div>
                    </div>
                  }
                  trigger="click"
                >
                  <Button type="text" size="small">
                    Templates
                  </Button>
                </Popover>
              </Space>
            </div>
          </div>
          
          {/* Status Actions */}
          {selectedLeave.status === 'pending' && (
            <div className="status-actions">
              <Divider>
                <small>Quick Actions</small>
              </Divider>
              <Space className="status-buttons">
                <Button 
                  type="primary" 
                  icon={<CheckCircleOutlined />}
                  // onClick={() => handleApprove(selectedLeave.id)} // Pass from parent
                >
                  Approve & Send
                </Button>
                <Button 
                  danger
                  icon={<CloseCircleOutlined />}
                  // onClick={() => handleReject(selectedLeave.id)} // Pass from parent
                >
                  Reject & Notify
                </Button>
                <Button 
                  type="dashed"
                  icon={<ClockCircleOutlined />}
                >
                  Request Changes
                </Button>
              </Space>
            </div>
          )}
        </div>
      </div>
    </Drawer>
  );
};

export default ChatDrawer;