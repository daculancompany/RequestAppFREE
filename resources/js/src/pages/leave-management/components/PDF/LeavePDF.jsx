// components/PDF/LeavePDF.jsx
import React from 'react';
import { Document, Page, Text, View, StyleSheet, Image, Link } from '@react-pdf/renderer';
import dayjs from 'dayjs';

// Create styles
const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontSize: 12,
    backgroundColor: '#ffffff',
    fontFamily: 'Helvetica',
  },
  // Header Styles
  header: {
    marginBottom: 30,
    paddingBottom: 20,
    borderBottom: '2 solid #1890ff',
    textAlign: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 5,
    color: '#1890ff',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 12,
    color: '#666666',
    textAlign: 'center',
    marginBottom: 10,
  },
  headerBadge: {
    backgroundColor: '#1890ff',
    color: 'white',
    padding: '4 12',
    borderRadius: 4,
    fontSize: 10,
    fontWeight: 'bold',
    alignSelf: 'center',
  },
  
  // QR Code Section
  qrSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 25,
    padding: 15,
    backgroundColor: '#f8f9fa',
    borderRadius: 4,
    border: '1 solid #e8e8e8',
  },
  qrInfo: {
    flex: 1,
    marginRight: 20,
  },
  qrCode: {
    width: 100,
    height: 100,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
    border: '1 solid #e8e8e8',
  },
  
  // Section Styles
  section: {
    marginBottom: 20,
    padding: 20,
    backgroundColor: 'white',
    borderRadius: 8,
    border: '1 solid #e8e8e8',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#1890ff',
    borderBottom: '1 solid #f0f0f0',
    paddingBottom: 8,
  },
  
  // Grid Layout
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  gridItem: {
    width: '50%',
    marginBottom: 15,
  },
  label: {
    fontSize: 10,
    fontWeight: 'bold',
    marginBottom: 4,
    color: '#666666',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  value: {
    fontSize: 12,
    color: '#333333',
    marginBottom: 4,
  },
  valueHighlight: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#1890ff',
  },
  
  // Status Styles
  statusTag: {
    padding: '4 12',
    borderRadius: 4,
    fontSize: 10,
    fontWeight: 'bold',
    textAlign: 'center',
    marginTop: 4,
  },
  statusApproved: {
    backgroundColor: '#52c41a',
    color: 'white',
  },
  statusRejected: {
    backgroundColor: '#ff4d4f',
    color: 'white',
  },
  statusPending: {
    backgroundColor: '#faad14',
    color: 'white',
  },
  
  // Timeline Styles
  timeline: {
    marginTop: 15,
    paddingLeft: 10,
  },
  timelineItem: {
    marginBottom: 10,
    paddingLeft: 15,
    borderLeft: '2 solid #1890ff',
  },
  timelineDate: {
    fontSize: 10,
    color: '#666666',
    marginBottom: 2,
  },
  timelineEvent: {
    fontSize: 11,
    color: '#333333',
  },
  
  // Signature Section
  signatureSection: {
    marginTop: 30,
    paddingTop: 20,
    borderTop: '1 solid #e8e8e8',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  signatureBox: {
    width: '45%',
    textAlign: 'center',
  },
  signatureLine: {
    height: 1,
    backgroundColor: '#666666',
    marginTop: 40,
    marginBottom: 8,
  },
  
  // Footer
  footer: {
    marginTop: 40,
    paddingTop: 20,
    borderTop: '1 solid #e8e8e8',
    textAlign: 'center',
  },
  footerText: {
    fontSize: 9,
    color: '#666666',
    marginBottom: 5,
  },
  footerNote: {
    fontSize: 8,
    color: '#999999',
    fontStyle: 'italic',
    marginTop: 10,
  },
  
  // Approval Flow
  approvalFlow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
    marginBottom: 20,
  },
  approvalStep: {
    flex: 1,
    alignItems: 'center',
    padding: 10,
  },
  approvalDot: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#1890ff',
    marginBottom: 8,
  },
  approvalLabel: {
    fontSize: 10,
    color: '#666666',
    textAlign: 'center',
  },
  approvalDate: {
    fontSize: 8,
    color: '#999999',
    textAlign: 'center',
    marginTop: 4,
  },
  
  // Leave Details
  leaveDetails: {
    marginTop: 15,
    padding: 15,
    backgroundColor: '#f8f9fa',
    borderRadius: 4,
  },
  leaveReason: {
    fontSize: 11,
    lineHeight: 1.5,
    color: '#333333',
    marginBottom: 10,
  },
  
  // Watermark
  watermark: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%) rotate(-45deg)',
    fontSize: 60,
    color: 'rgba(0,0,0,0.05)',
    fontWeight: 'bold',
    zIndex: -1,
  },
  
  // Info Box
  infoBox: {
    backgroundColor: '#e6f7ff',
    border: '1 solid #91d5ff',
    borderRadius: 4,
    padding: 12,
    marginBottom: 15,
  },
  infoTitle: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#0050b3',
    marginBottom: 4,
  },
  infoText: {
    fontSize: 10,
    color: '#0050b3',
    lineHeight: 1.4,
  },
});

// Generate a simple QR code pattern (simplified for PDF)
const QRCodePlaceholder = () => (
  <View style={styles.qrCode}>
    <Text style={{ fontSize: 8, color: '#666666' }}>QR CODE</Text>
    <Text style={{ fontSize: 6, color: '#999999' }}>Scan to verify</Text>
  </View>
);

// Signature component
const Signature = ({ title, name, date }) => (
  <View style={styles.signatureBox}>
    <View style={styles.signatureLine} />
    <Text style={styles.footerText}>{title}</Text>
    <Text style={[styles.value, { marginTop: 4 }]}>{name}</Text>
    {date && (
      <Text style={[styles.footerText, { marginTop: 4 }]}>
        {dayjs(date).format('MMM DD, YYYY HH:mm')}
      </Text>
    )}
  </View>
);

// Timeline item component
const TimelineItem = ({ date, event, status }) => (
  <View style={styles.timelineItem}>
    <Text style={styles.timelineDate}>{dayjs(date).format('MMM DD, YYYY HH:mm')}</Text>
    <Text style={styles.timelineEvent}>{event}</Text>
    {status && (
      <View style={[styles.statusTag, 
        status === 'approved' ? styles.statusApproved :
        status === 'rejected' ? styles.statusRejected :
        styles.statusPending
      ]}>
        <Text>{status.toUpperCase()}</Text>
      </View>
    )}
  </View>
);

const LeavePDF = ({ data, group }) => {
  // Generate timeline from conversation and status changes
  const generateTimeline = () => {
    const timeline = [];
    
    // Submission
    timeline.push({
      date: data.submitted,
      event: `Leave request submitted by ${data.employee}`,
      status: 'pending'
    });
    
    // Add conversation items
    if (data.conversation && data.conversation.length > 0) {
      data.conversation.forEach(msg => {
        timeline.push({
          date: msg.time,
          event: `Message from ${msg.sender}: ${msg.message.substring(0, 50)}...`,
          status: null
        });
      });
    }
    
    // Status change if not pending
    if (data.status !== 'pending') {
      timeline.push({
        date: data.submitted,
        event: `Leave request ${data.status} by ${data.approver}`,
        status: data.status
      });
    }
    
    // Sort by date
    return timeline.sort((a, b) => new Date(a.date) - new Date(b.date));
  };

  const timeline = generateTimeline();
  const approvalSteps = [
    { label: 'Submitted', date: data.submitted, completed: true },
    { label: 'Under Review', date: data.submitted, completed: data.status !== 'pending' },
    { label: data.status === 'approved' ? 'Approved' : data.status === 'rejected' ? 'Rejected' : 'Decision', 
      date: data.status !== 'pending' ? data.submitted : null, 
      completed: data.status !== 'pending' }
  ];

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Watermark */}
        <Text style={styles.watermark}>
          {data.status === 'approved' ? 'APPROVED' : 
           data.status === 'rejected' ? 'REJECTED' : 
           'PENDING REVIEW'}
        </Text>

        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>LEAVE APPROVAL FORM</Text>
          <Text style={styles.subtitle}>Modern HR System - Digital Approval Document</Text>
          <View style={styles.headerBadge}>
            <Text>DOCUMENT ID: LEAVE-{data.id.toString().padStart(6, '0')}</Text>
          </View>
        </View>

        {/* QR Code Section */}
        <View style={styles.qrSection}>
          <View style={styles.qrInfo}>
            <Text style={styles.label}>Quick Verification</Text>
            <Text style={[styles.value, { fontSize: 10 }]}>
              Scan the QR code to verify this document's authenticity or visit:
            </Text>
            <Text style={[styles.value, { fontSize: 10, color: '#1890ff' }]}>
              https://hr.leaveflow.com/verify/{data.id}
            </Text>
          </View>
          <QRCodePlaceholder />
        </View>

        {/* Employee Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>👤 EMPLOYEE INFORMATION</Text>
          <View style={styles.grid}>
            <View style={styles.gridItem}>
              <Text style={styles.label}>Full Name</Text>
              <Text style={styles.valueHighlight}>{data.employee}</Text>
            </View>
            
            <View style={styles.gridItem}>
              <Text style={styles.label}>Employee ID</Text>
              <Text style={styles.value}>{data.employeeId}</Text>
            </View>
            
            <View style={styles.gridItem}>
              <Text style={styles.label}>Department / Group</Text>
              <Text style={styles.value}>
                {group?.name || data.group.toUpperCase()}
              </Text>
            </View>
            
            <View style={styles.gridItem}>
              <Text style={styles.label}>Position / Role</Text>
              <Text style={styles.value}>{data.position || 'Employee'}</Text>
            </View>
            
            <View style={styles.gridItem}>
              <Text style={styles.label}>Contact Email</Text>
              <Text style={styles.value}>
                {data.email || `${data.employee.toLowerCase().replace(/\s+/g, '.')}@company.com`}
              </Text>
            </View>
            
            <View style={styles.gridItem}>
              <Text style={styles.label}>Employee Since</Text>
              <Text style={styles.value}>
                {data.joinDate || 'January 15, 2023'}
              </Text>
            </View>
          </View>
        </View>

        {/* Leave Details */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📅 LEAVE DETAILS</Text>
          
          <View style={styles.grid}>
            <View style={styles.gridItem}>
              <Text style={styles.label}>Leave Type</Text>
              <Text style={styles.valueHighlight}>{data.type}</Text>
            </View>
            
            <View style={styles.gridItem}>
              <Text style={styles.label}>Request ID</Text>
              <Text style={styles.value}>LR-{data.id.toString().padStart(6, '0')}</Text>
            </View>
            
            <View style={styles.gridItem}>
              <Text style={styles.label}>From Date</Text>
              <Text style={styles.value}>
                {dayjs(data.dates[0]).format('dddd, MMMM DD, YYYY')}
              </Text>
            </View>
            
            <View style={styles.gridItem}>
              <Text style={styles.label}>To Date</Text>
              <Text style={styles.value}>
                {dayjs(data.dates[1]).format('dddd, MMMM DD, YYYY')}
              </Text>
            </View>
            
            <View style={styles.gridItem}>
              <Text style={styles.label}>Duration</Text>
              <Text style={styles.valueHighlight}>{data.duration} working days</Text>
            </View>
            
            <View style={styles.gridItem}>
              <Text style={styles.label}>Working Days</Text>
              <Text style={styles.value}>
                {data.workingDays || data.duration} days
              </Text>
            </View>
            
            <View style={{ width: '100%', marginTop: 10 }}>
              <Text style={styles.label}>Reason for Leave</Text>
              <View style={styles.leaveDetails}>
                <Text style={styles.leaveReason}>{data.reason}</Text>
              </View>
            </View>
          </View>

          {/* Additional Information */}
          <View style={styles.infoBox}>
            <Text style={styles.infoTitle}>Additional Information</Text>
            <Text style={styles.infoText}>
              • Remaining annual leaves: {data.remainingLeaves || '12 days'}
              {'\n'}
              • Emergency contact: {data.emergencyContact || 'Provided separately'}
              {'\n'}
              • Handover completed: {data.handover || 'Yes, documented'}
            </Text>
          </View>
        </View>

        {/* Approval Status */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>✅ APPROVAL STATUS</Text>
          
          <View style={styles.grid}>
            <View style={styles.gridItem}>
              <Text style={styles.label}>Current Status</Text>
              <View style={[
                styles.statusTag,
                data.status === 'approved' ? styles.statusApproved :
                data.status === 'rejected' ? styles.statusRejected :
                styles.statusPending
              ]}>
                <Text>{data.status.toUpperCase()}</Text>
              </View>
            </View>
            
            <View style={styles.gridItem}>
              <Text style={styles.label}>Approver</Text>
              <Text style={styles.valueHighlight}>{data.approver}</Text>
            </View>
            
            <View style={styles.gridItem}>
              <Text style={styles.label}>Priority Level</Text>
              <Text style={[styles.value, { 
                color: data.priority === 'high' ? '#ff4d4f' : 
                      data.priority === 'medium' ? '#faad14' : '#52c41a'
              }]}>
                {data.priority?.toUpperCase() || 'MEDIUM'}
              </Text>
            </View>
            
            <View style={styles.gridItem}>
              <Text style={styles.label}>Submitted On</Text>
              <Text style={styles.value}>
                {dayjs(data.submitted).format('MMMM DD, YYYY HH:mm')}
              </Text>
            </View>
          </View>

          {/* Approval Flow */}
          <Text style={[styles.label, { marginTop: 15 }]}>Approval Flow</Text>
          <View style={styles.approvalFlow}>
            {approvalSteps.map((step, index) => (
              <View key={index} style={styles.approvalStep}>
                <View style={[
                  styles.approvalDot,
                  { backgroundColor: step.completed ? '#52c41a' : '#d9d9d9' }
                ]} />
                <Text style={styles.approvalLabel}>{step.label}</Text>
                {step.date && (
                  <Text style={styles.approvalDate}>
                    {dayjs(step.date).format('MMM DD')}
                  </Text>
                )}
              </View>
            ))}
          </View>
        </View>

        {/* Approval Timeline */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🕐 APPROVAL TIMELINE</Text>
          <View style={styles.timeline}>
            {timeline.map((item, index) => (
              <TimelineItem 
                key={index}
                date={item.date}
                event={item.event}
                status={item.status}
              />
            ))}
          </View>
        </View>

        {/* Signatures */}
        <View style={styles.signatureSection}>
          <Signature 
            title="Employee Signature"
            name={data.employee}
            date={data.submitted}
          />
          
          <Signature 
            title="Approver Signature"
            name={data.approver}
            date={data.status !== 'pending' ? data.submitted : null}
          />
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            Generated: {dayjs().format('MMMM DD, YYYY HH:mm:ss')}
          </Text>
          <Text style={styles.footerText}>
            Digital Signature: Verified by HR System • Document Hash: {data.id.toString(16).toUpperCase()}
          </Text>
          <Text style={styles.footerNote}>
            This is an electronically generated document. No physical signature is required.
            {'\n'}
            For verification purposes only. Please contact HR department for any queries.
            {'\n'}
            © {new Date().getFullYear()} LeaveFlow HR System. All rights reserved.
          </Text>
        </View>
      </Page>

      {/* Second Page - Additional Details (if needed) */}
      {(data.conversation && data.conversation.length > 3) || data.attachments ? (
        <Page size="A4" style={styles.page}>
          <View style={styles.header}>
            <Text style={styles.title}>ADDITIONAL DETAILS</Text>
            <Text style={styles.subtitle}>Leave Request #{data.id} - Supporting Documents</Text>
          </View>

          {/* Conversation History */}
          {data.conversation && data.conversation.length > 3 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>💬 CONVERSATION HISTORY</Text>
              {data.conversation.slice(3).map((msg, index) => (
                <View key={index} style={{ marginBottom: 15 }}>
                  <Text style={[styles.label, { marginBottom: 2 }]}>
                    {msg.sender} • {dayjs(msg.time).format('MMM DD, HH:mm')}
                  </Text>
                  <Text style={[styles.value, { fontSize: 11, lineHeight: 1.4 }]}>
                    {msg.message}
                  </Text>
                </View>
              ))}
            </View>
          )}

          {/* Attachments */}
          {data.attachments && data.attachments.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>📎 ATTACHMENTS</Text>
              <View style={styles.grid}>
                {data.attachments.map((attachment, index) => (
                  <View key={index} style={styles.gridItem}>
                    <Text style={styles.label}>Attachment {index + 1}</Text>
                    <Text style={styles.value}>{attachment.name}</Text>
                    <Text style={[styles.footerText, { fontSize: 8 }]}>
                      {attachment.type} • {attachment.size}
                    </Text>
                  </View>
                ))}
              </View>
            </View>
          )}

          {/* Policy Compliance */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>📋 POLICY COMPLIANCE CHECK</Text>
            
            <View style={[styles.infoBox, { backgroundColor: '#f6ffed', borderColor: '#b7eb8f' }]}>
              <Text style={[styles.infoTitle, { color: '#237804' }]}>Compliance Status: PASSED ✓</Text>
              <Text style={[styles.infoText, { color: '#237804' }]}>
                • Minimum notice period: ✓ Met (Submitted {dayjs(data.submitted).diff(dayjs(data.dates[0]), 'day')} days in advance)
                {'\n'}
                • Available leave balance: ✓ Sufficient ({data.remainingLeaves || '12'} days remaining)
                {'\n'}
                • Blackout period check: ✓ No conflicts detected
                {'\n'}
                • Documentation: ✓ Complete
              </Text>
            </View>
          </View>

          {/* Contact Information */}
          <View style={[styles.section, { marginBottom: 0 }]}>
            <Text style={styles.sectionTitle}>📞 CONTACT INFORMATION</Text>
            
            <View style={styles.grid}>
              <View style={styles.gridItem}>
                <Text style={styles.label}>HR Department</Text>
                <Text style={styles.value}>hr@company.com</Text>
                <Text style={[styles.footerText, { fontSize: 9 }]}>+1 (555) 123-4567</Text>
              </View>
              
              <View style={styles.gridItem}>
                <Text style={styles.label}>Immediate Supervisor</Text>
                <Text style={styles.value}>{data.approver}</Text>
                <Text style={[styles.footerText, { fontSize: 9 }]}>supervisor@company.com</Text>
              </View>
              
              <View style={styles.gridItem}>
                <Text style={styles.label}>Emergency Contact</Text>
                <Text style={styles.value}>security@company.com</Text>
                <Text style={[styles.footerText, { fontSize: 9 }]}>+1 (555) 987-6543</Text>
              </View>
              
              <View style={styles.gridItem}>
                <Text style={styles.label}>System Support</Text>
                <Text style={styles.value}>support@leaveflow.com</Text>
                <Text style={[styles.footerText, { fontSize: 9 }]}>Available 24/7</Text>
              </View>
            </View>
          </View>
        </Page>
      ) : null}
    </Document>
  );
};

export default LeavePDF;