/**
 * Invoice Email Template
 * Professional invoice for VibeLux services
 */

import * as React from 'react';
import {
  BaseEmailTemplate,
  EmailHeading,
  EmailText,
  EmailButton,
  EmailCard,
  EmailDivider,
  colors,
} from '../base-template';
import { Text, Link } from '@react-email/components';

interface InvoiceItem {
  description: string;
  quantity: number;
  price: number;
  total?: number;
}

interface InvoiceEmailProps {
  invoiceNumber: string;
  invoiceDate?: string;
  dueDate: string;
  recipientName?: string;
  recipientCompany?: string;
  recipientAddress?: string;
  items: InvoiceItem[];
  subtotal: number;
  tax?: number;
  discount?: number;
  total: number;
  paymentUrl: string;
  pdfUrl?: string;
  notes?: string;
  paymentTerms?: string;
}

export function InvoiceEmail({
  invoiceNumber,
  invoiceDate = new Date().toLocaleDateString(),
  dueDate,
  recipientName,
  recipientCompany,
  recipientAddress,
  items,
  subtotal,
  tax = 0,
  discount = 0,
  total,
  paymentUrl,
  pdfUrl,
  notes,
  paymentTerms = 'Net 30',
}: InvoiceEmailProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  return (
    <BaseEmailTemplate preview={`Invoice ${invoiceNumber} - ${formatCurrency(total)}`}>
      <div style={{ textAlign: 'center', marginBottom: '30px' }}>
        <Text style={{ 
          fontSize: '14px', 
          color: colors.textMuted,
          textTransform: 'uppercase',
          letterSpacing: '1px',
          margin: '0 0 8px',
        }}>
          INVOICE
        </Text>
        <EmailHeading>{invoiceNumber}</EmailHeading>
      </div>
      
      {/* Invoice Header */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between',
        marginBottom: '30px',
      }}>
        <div>
          <Text style={{ fontSize: '14px', color: colors.textMuted, margin: '0 0 4px' }}>
            Bill To:
          </Text>
          {recipientName && (
            <Text style={{ color: colors.text, margin: '0 0 2px' }}>
              {recipientName}
            </Text>
          )}
          {recipientCompany && (
            <Text style={{ color: colors.text, margin: '0 0 2px', fontWeight: '600' }}>
              {recipientCompany}
            </Text>
          )}
          {recipientAddress && (
            <Text style={{ color: colors.textMuted, fontSize: '14px', margin: 0 }}>
              {recipientAddress}
            </Text>
          )}
        </div>
        
        <div style={{ textAlign: 'right' }}>
          <div style={{ marginBottom: '8px' }}>
            <Text style={{ fontSize: '14px', color: colors.textMuted, margin: 0 }}>
              Invoice Date
            </Text>
            <Text style={{ color: colors.text, margin: 0 }}>
              {invoiceDate}
            </Text>
          </div>
          <div style={{ marginBottom: '8px' }}>
            <Text style={{ fontSize: '14px', color: colors.textMuted, margin: 0 }}>
              Due Date
            </Text>
            <Text style={{ color: colors.text, fontWeight: '600', margin: 0 }}>
              {dueDate}
            </Text>
          </div>
          <div>
            <Text style={{ fontSize: '14px', color: colors.textMuted, margin: 0 }}>
              Payment Terms
            </Text>
            <Text style={{ color: colors.text, margin: 0 }}>
              {paymentTerms}
            </Text>
          </div>
        </div>
      </div>
      
      {/* Line Items */}
      <EmailCard>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: `2px solid ${colors.border}` }}>
              <th style={{ 
                textAlign: 'left',
                padding: '12px 0',
                fontSize: '14px',
                color: colors.textMuted,
                fontWeight: '600',
              }}>
                Description
              </th>
              <th style={{ 
                textAlign: 'center',
                padding: '12px 0',
                fontSize: '14px',
                color: colors.textMuted,
                fontWeight: '600',
                width: '80px',
              }}>
                Qty
              </th>
              <th style={{ 
                textAlign: 'right',
                padding: '12px 0',
                fontSize: '14px',
                color: colors.textMuted,
                fontWeight: '600',
                width: '100px',
              }}>
                Price
              </th>
              <th style={{ 
                textAlign: 'right',
                padding: '12px 0',
                fontSize: '14px',
                color: colors.textMuted,
                fontWeight: '600',
                width: '100px',
              }}>
                Total
              </th>
            </tr>
          </thead>
          <tbody>
            {items.map((item, index) => (
              <tr key={index} style={{ borderBottom: `1px solid ${colors.border}` }}>
                <td style={{ 
                  padding: '16px 0',
                  fontSize: '14px',
                  color: colors.text,
                }}>
                  {item.description}
                </td>
                <td style={{ 
                  padding: '16px 0',
                  fontSize: '14px',
                  color: colors.text,
                  textAlign: 'center',
                }}>
                  {item.quantity}
                </td>
                <td style={{ 
                  padding: '16px 0',
                  fontSize: '14px',
                  color: colors.text,
                  textAlign: 'right',
                }}>
                  {formatCurrency(item.price)}
                </td>
                <td style={{ 
                  padding: '16px 0',
                  fontSize: '14px',
                  color: colors.text,
                  textAlign: 'right',
                  fontWeight: '500',
                }}>
                  {formatCurrency(item.total || item.quantity * item.price)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        
        {/* Totals */}
        <div style={{ marginTop: '20px', paddingTop: '20px', borderTop: `2px solid ${colors.border}` }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
            <Text style={{ fontSize: '14px', color: colors.textMuted, margin: 0 }}>
              Subtotal
            </Text>
            <Text style={{ fontSize: '14px', color: colors.text, margin: 0 }}>
              {formatCurrency(subtotal)}
            </Text>
          </div>
          
          {discount > 0 && (
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
              <Text style={{ fontSize: '14px', color: colors.textMuted, margin: 0 }}>
                Discount
              </Text>
              <Text style={{ fontSize: '14px', color: '#10B981', margin: 0 }}>
                -{formatCurrency(discount)}
              </Text>
            </div>
          )}
          
          {tax > 0 && (
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
              <Text style={{ fontSize: '14px', color: colors.textMuted, margin: 0 }}>
                Tax
              </Text>
              <Text style={{ fontSize: '14px', color: colors.text, margin: 0 }}>
                {formatCurrency(tax)}
              </Text>
            </div>
          )}
          
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between',
            marginTop: '16px',
            paddingTop: '16px',
            borderTop: `1px solid ${colors.border}`,
          }}>
            <Text style={{ fontSize: '18px', color: colors.text, fontWeight: '600', margin: 0 }}>
              Total Due
            </Text>
            <Text style={{ fontSize: '24px', color: colors.primary, fontWeight: '700', margin: 0 }}>
              {formatCurrency(total)}
            </Text>
          </div>
        </div>
      </EmailCard>
      
      <EmailButton href={paymentUrl}>
        Pay Invoice Now
      </EmailButton>
      
      {pdfUrl && (
        <div style={{ textAlign: 'center', marginTop: '16px' }}>
          <Link href={pdfUrl} style={{ color: colors.primary, fontSize: '14px' }}>
            📄 Download PDF Invoice
          </Link>
        </div>
      )}
      
      {notes && (
        <EmailCard title="Notes">
          <EmailText muted>{notes}</EmailText>
        </EmailCard>
      )}
      
      <EmailDivider />
      
      {/* Payment Methods */}
      <EmailCard title="Payment Methods">
        <EmailText muted>
          <strong>Online:</strong> Pay securely with credit card or ACH transfer
        </EmailText>
        <EmailText muted>
          <strong>Check:</strong> Make payable to "VibeLux AI" and mail to:
          <br />
          VibeLux AI
          <br />
          1234 Innovation Drive
          <br />
          San Francisco, CA 94105
        </EmailText>
        <EmailText muted>
          <strong>Wire Transfer:</strong> Contact accounting@vibelux.ai for details
        </EmailText>
      </EmailCard>
      
      <EmailText muted>
        Thank you for your business! If you have any questions about this invoice,
        please contact our billing department at{' '}
        <Link href="mailto:billing@vibelux.ai" style={{ color: colors.primary }}>
          billing@vibelux.ai
        </Link>
      </EmailText>
    </BaseEmailTemplate>
  );
}

export default InvoiceEmail;