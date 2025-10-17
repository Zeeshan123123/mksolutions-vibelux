import React from 'react';

interface EquipmentOfferEmailProps {
  recipientName: string;
  offerTitle: string;
  equipment: {
    name: string;
    category: string;
    brand: string;
    condition: string;
    price: number;
    location: string;
  };
  sellerName: string;
  sellerCompany?: string;
  message?: string;
  offerUrl: string;
}

export const EquipmentOfferEmail: React.FC<EquipmentOfferEmailProps> = ({
  recipientName,
  offerTitle,
  equipment,
  sellerName,
  sellerCompany,
  message,
  offerUrl
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
          You have received a new equipment offer on VibeLux Marketplace!
        </p>
        
        <div style={{ 
          backgroundColor: 'white', 
          padding: '20px', 
          borderRadius: '8px', 
          border: '1px solid #e5e7eb',
          margin: '20px 0'
        }}>
          <h3 style={{ color: '#1f2937', marginBottom: '15px' }}>{offerTitle}</h3>
          
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <tr>
              <td style={{ padding: '8px 0', color: '#6b7280' }}>Equipment:</td>
              <td style={{ padding: '8px 0', color: '#1f2937', fontWeight: 'bold' }}>
                {equipment.name}
              </td>
            </tr>
            <tr>
              <td style={{ padding: '8px 0', color: '#6b7280' }}>Category:</td>
              <td style={{ padding: '8px 0', color: '#1f2937' }}>{equipment.category}</td>
            </tr>
            <tr>
              <td style={{ padding: '8px 0', color: '#6b7280' }}>Brand:</td>
              <td style={{ padding: '8px 0', color: '#1f2937' }}>{equipment.brand}</td>
            </tr>
            <tr>
              <td style={{ padding: '8px 0', color: '#6b7280' }}>Condition:</td>
              <td style={{ padding: '8px 0', color: '#1f2937' }}>{equipment.condition}</td>
            </tr>
            <tr>
              <td style={{ padding: '8px 0', color: '#6b7280' }}>Price:</td>
              <td style={{ padding: '8px 0', color: '#1f2937', fontWeight: 'bold' }}>
                ${equipment.price.toLocaleString()}
              </td>
            </tr>
            <tr>
              <td style={{ padding: '8px 0', color: '#6b7280' }}>Location:</td>
              <td style={{ padding: '8px 0', color: '#1f2937' }}>{equipment.location}</td>
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
            <p style={{ color: '#4b5563', margin: 0, fontStyle: 'italic' }}>
              "{message}"
            </p>
            <p style={{ color: '#6b7280', marginTop: '10px', marginBottom: 0 }}>
              - {sellerName}{sellerCompany ? `, ${sellerCompany}` : ''}
            </p>
          </div>
        )}
        
        <div style={{ textAlign: 'center', margin: '30px 0' }}>
          <a 
            href={offerUrl}
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
            View Offer Details
          </a>
        </div>
        
        <p style={{ color: '#6b7280', fontSize: '14px' }}>
          This offer was sent to you through VibeLux Marketplace. If you're not interested, 
          you can safely ignore this email.
        </p>
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