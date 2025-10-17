'use client';

import React from 'react';
import { Download, Receipt, ExternalLink } from 'lucide-react';
import { format } from 'date-fns';

interface Invoice {
  id: string;
  date: Date;
  amount: number;
  status: string;
  description: string;
  pdfUrl?: string | null;
  hostedUrl?: string | null;
}

interface BillingHistoryProps {
  invoices: Invoice[];
}

export function BillingHistory({ invoices }: BillingHistoryProps) {
  const getStatusBadge = (status: string) => {
    const statusStyles = {
      paid: 'bg-green-600/20 text-green-400',
      open: 'bg-yellow-600/20 text-yellow-400',
      void: 'bg-gray-600/20 text-gray-400',
      uncollectible: 'bg-red-600/20 text-red-400',
      draft: 'bg-gray-600/20 text-gray-400'
    };

    return (
      <span className={`px-2 py-1 text-xs rounded-full ${statusStyles[status as keyof typeof statusStyles] || statusStyles.draft}`}>
        {status}
      </span>
    );
  };

  return (
    <div className="bg-gray-800 rounded-lg p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-white">Recent Invoices</h3>
        <Receipt className="w-5 h-5 text-gray-500" />
      </div>

      {invoices.length === 0 ? (
        <p className="text-sm text-gray-400">No invoices yet</p>
      ) : (
        <div className="space-y-3">
          {invoices.slice(0, 5).map((invoice) => (
            <div
              key={invoice.id}
              className="flex items-center justify-between p-3 bg-gray-700 rounded-lg"
            >
              <div className="flex-1">
                <p className="text-sm text-white">
                  ${invoice.amount.toFixed(2)}
                </p>
                <p className="text-xs text-gray-400">
                  {format(invoice.date, 'MMM d, yyyy')}
                </p>
              </div>
              
              <div className="flex items-center gap-2">
                {getStatusBadge(invoice.status)}
                
                {invoice.pdfUrl && (
                  <a
                    href={invoice.pdfUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gray-400 hover:text-white transition-colors"
                    title="Download PDF"
                  >
                    <Download className="w-4 h-4" />
                  </a>
                )}
                
                {invoice.hostedUrl && (
                  <a
                    href={invoice.hostedUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gray-400 hover:text-white transition-colors"
                    title="View invoice"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {invoices.length > 5 && (
        <p className="text-xs text-gray-500 mt-3 text-center">
          Showing {Math.min(5, invoices.length)} of {invoices.length} invoices
        </p>
      )}
    </div>
  );
}