import React from 'react';

interface ServiceBidEmailProps {
  recipientName: string;
  serviceName: string;
  bidAmount: number;
  bidderName: string;
  bidderCompany?: string;
  proposedTimeline?: string;
  message?: string;
  bidUrl: string;
  totalBids: number;
}

export const ServiceBidEmail: React.FC<ServiceBidEmailProps> = ({
  recipientName,
  serviceName,
  bidAmount,
  bidderName,
  bidderCompany,
  proposedTimeline,
  message,
  bidUrl,
  totalBids
}) => {
  return (
    <div style={{ fontFamily: 'Arial, sans-serif', maxWidth: '600px', margin: '0 auto' }}>
      <div style={{ backgroundColor: '#8b5cf6', padding: '20px', textAlign: 'center' }}>
        <h1 style={{ color: 'white', margin: 0 }}>VibeLux Marketplace</h1>
      </div>
      
      <div style={{ padding: '30px', backgroundColor: '#f9fafb' }}>
        <h2 style={{ color: '#1f2937', marginBottom: '20px' }}>
          Hi {recipientName},
        </h2>
        
        <p style={{ color: '#4b5563', fontSize: '16px', lineHeight: '1.6' }}>
          You have received a new bid for your service request!
        </p>
        
        <div style={{ 
          backgroundColor: 'white', 
          padding: '20px', 
          borderRadius: '8px', 
          border: '1px solid #e5e7eb',
          margin: '20px 0'
        }}>
          <h3 style={{ color: '#1f2937', marginBottom: '15px' }}>{serviceName}</h3>
          
          <div style={{ 
            backgroundColor: '#f0fdf4', 
            padding: '15px', 
            borderRadius: '6px',
            marginBottom: '15px'
          }}>
            <p style={{ margin: 0, fontSize: '24px', fontWeight: 'bold', color: '#16a34a' }}>
              ${bidAmount.toLocaleString()}
            </p>
            <p style={{ margin: '5px 0 0 0', color: '#15803d', fontSize: '14px' }}>
              Bid Amount
            </p>
          </div>
          
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <tr>
              <td style={{ padding: '8px 0', color: '#6b7280' }}>From:</td>
              <td style={{ padding: '8px 0', color: '#1f2937', fontWeight: 'bold' }}>
                {bidderName}{bidderCompany ? ` - ${bidderCompany}` : ''}
              </td>
            </tr>
            {proposedTimeline && (
              <tr>
                <td style={{ padding: '8px 0', color: '#6b7280' }}>Timeline:</td>
                <td style={{ padding: '8px 0', color: '#1f2937' }}>{proposedTimeline}</td>
              </tr>
            )}
            <tr>
              <td style={{ padding: '8px 0', color: '#6b7280' }}>Total Bids:</td>
              <td style={{ padding: '8px 0', color: '#1f2937' }}>{totalBids}</td>
            </tr>
          </table>
        </div>
        
        {message && (
          <div style={{ 
            backgroundColor: '#f3f4f6', 
            padding: '15px', 
            borderRadius: '8px',
            margin: '20px 0'
          }}>
            <h4 style={{ color: '#4b5563', margin: '0 0 10px 0' }}>Proposal Details:</h4>
            <p style={{ color: '#4b5563', margin: 0 }}>
              {message}
            </p>
          </div>
        )}
        
        <div style={{ textAlign: 'center', margin: '30px 0' }}>
          <a 
            href={bidUrl}
            style={{
              backgroundColor: '#8b5cf6',
              color: 'white',
              padding: '12px 30px',
              textDecoration: 'none',
              borderRadius: '6px',
              display: 'inline-block',
              fontWeight: 'bold'
            }}
          >
            Review All Bids
          </a>
        </div>
        
        <div style={{ 
          backgroundColor: '#eff6ff', 
          padding: '15px', 
          borderRadius: '6px',
          margin: '20px 0'
        }}>
          <p style={{ color: '#1e40af', margin: 0, fontSize: '14px' }}>
            💡 Tip: Compare all bids to find the best combination of price, timeline, and expertise 
            for your project.
          </p>
        </div>
      </div>
      
      <div style={{ 
        backgroundColor: '#1f2937', 
        padding: '20px', 
        textAlign: 'center',
        color: '#9ca3af',
        fontSize: '12px'
      }}>
        <p style={{ margin: '0 0 10px 0' }}>
          © {new Date().getFullYear()} VibeLux. All rights reserved.
        </p>
        <p style={{ margin: 0 }}>
          <a href="https://vibelux.ai/settings/notifications" style={{ color: '#8b5cf6' }}>
            Manage notification preferences
          </a>
        </p>
      </div>
    </div>
  );
};