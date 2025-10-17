'use client';

import React, { useState } from 'react';
import { X, Shield, CheckCircle, XCircle, AlertCircle, FileText, Download, RefreshCw } from 'lucide-react';

interface StandardsCompliancePanelProps {
  onClose: () => void;
}

interface ComplianceCheck {
  id: string;
  category: string;
  requirement: string;
  status: 'pass' | 'fail' | 'warning' | 'not-checked';
  details: string;
  standard: string;
}

export function StandardsCompliancePanel({ onClose }: StandardsCompliancePanelProps) {
  const [selectedStandard, setSelectedStandard] = useState<string>('all');
  const [autoCheck, setAutoCheck] = useState(true);
  
  const standards = [
    { id: 'all', name: 'All Standards' },
    { id: 'dlc', name: 'DLC Horticultural' },
    { id: 'ul', name: 'UL Safety' },
    { id: 'energy-star', name: 'Energy Star' },
    { id: 'ashrae', name: 'ASHRAE 90.1' },
    { id: 'ies', name: 'IES Guidelines' },
    { id: 'nec', name: 'NEC Electrical' }
  ];

  const [complianceChecks] = useState<ComplianceCheck[]>([
    {
      id: '1',
      category: 'Lighting Efficacy',
      requirement: 'Minimum 2.5 μmol/J for DLC qualification',
      status: 'pass',
      details: 'Average fixture efficacy: 2.8 μmol/J',
      standard: 'dlc'
    },
    {
      id: '2',
      category: 'Electrical Safety',
      requirement: 'All fixtures must be UL listed',
      status: 'warning',
      details: '3 fixtures pending UL certification',
      standard: 'ul'
    },
    {
      id: '3',
      category: 'Power Density',
      requirement: 'Maximum 35W/sq ft for cultivation areas',
      status: 'pass',
      details: 'Current density: 28W/sq ft',
      standard: 'ashrae'
    },
    {
      id: '4',
      category: 'Emergency Egress',
      requirement: 'Minimum 1 fc emergency lighting',
      status: 'fail',
      details: 'Emergency lighting not configured',
      standard: 'ies'
    },
    {
      id: '5',
      category: 'Circuit Loading',
      requirement: 'Maximum 80% continuous load',
      status: 'pass',
      details: 'Highest circuit load: 72%',
      standard: 'nec'
    }
  ]);

  const filteredChecks = selectedStandard === 'all' 
    ? complianceChecks 
    : complianceChecks.filter(check => check.standard === selectedStandard);

  const getStatusIcon = (status: ComplianceCheck['status']) => {
    switch (status) {
      case 'pass':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'fail':
        return <XCircle className="h-5 w-5 text-red-500" />;
      case 'warning':
        return <AlertCircle className="h-5 w-5 text-yellow-500" />;
      case 'not-checked':
        return <div className="h-5 w-5 rounded-full border-2 border-gray-500" />;
    }
  };

  const getStatusColor = (status: ComplianceCheck['status']) => {
    switch (status) {
      case 'pass': return 'text-green-500';
      case 'fail': return 'text-red-500';
      case 'warning': return 'text-yellow-500';
      case 'not-checked': return 'text-gray-500';
    }
  };

  const summary = {
    pass: complianceChecks.filter(c => c.status === 'pass').length,
    fail: complianceChecks.filter(c => c.status === 'fail').length,
    warning: complianceChecks.filter(c => c.status === 'warning').length,
    notChecked: complianceChecks.filter(c => c.status === 'not-checked').length
  };

  return (
    <div className="bg-gray-900 rounded-lg shadow-xl p-4 w-96">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-white flex items-center gap-2">
          <Shield className="h-5 w-5" />
          Standards Compliance
        </h3>
        <button
          onClick={onClose}
          className="p-1 hover:bg-gray-800 rounded transition-colors"
        >
          <X className="h-4 w-4 text-gray-400" />
        </button>
      </div>

      {/* Standard Selection */}
      <div className="mb-4">
        <select
          value={selectedStandard}
          onChange={(e) => setSelectedStandard(e.target.value)}
          className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-blue-500"
        >
          {standards.map(standard => (
            <option key={standard.id} value={standard.id}>
              {standard.name}
            </option>
          ))}
        </select>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-4 gap-2 mb-4">
        <div className="bg-gray-800 rounded-lg p-3 text-center">
          <div className="text-2xl font-bold text-green-500">{summary.pass}</div>
          <div className="text-xs text-gray-400">Pass</div>
        </div>
        <div className="bg-gray-800 rounded-lg p-3 text-center">
          <div className="text-2xl font-bold text-red-500">{summary.fail}</div>
          <div className="text-xs text-gray-400">Fail</div>
        </div>
        <div className="bg-gray-800 rounded-lg p-3 text-center">
          <div className="text-2xl font-bold text-yellow-500">{summary.warning}</div>
          <div className="text-xs text-gray-400">Warning</div>
        </div>
        <div className="bg-gray-800 rounded-lg p-3 text-center">
          <div className="text-2xl font-bold text-gray-500">{summary.notChecked}</div>
          <div className="text-xs text-gray-400">Pending</div>
        </div>
      </div>

      {/* Compliance Checks */}
      <div className="space-y-2 mb-4 max-h-64 overflow-y-auto">
        {filteredChecks.map((check) => (
          <div key={check.id} className="bg-gray-800 rounded-lg p-3">
            <div className="flex items-start gap-3">
              {getStatusIcon(check.status)}
              <div className="flex-1">
                <h4 className="font-medium text-white">{check.category}</h4>
                <p className="text-sm text-gray-400 mt-1">{check.requirement}</p>
                <p className={`text-sm mt-1 ${getStatusColor(check.status)}`}>
                  {check.details}
                </p>
                <span className="text-xs text-gray-500 mt-1">{check.standard.toUpperCase()}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Auto-Check Setting */}
      <div className="mb-4 flex items-center justify-between">
        <span className="text-sm text-gray-300">Auto-check compliance</span>
        <input
          type="checkbox"
          checked={autoCheck}
          onChange={(e) => setAutoCheck(e.target.checked)}
          className="rounded border-gray-600 text-blue-600 focus:ring-blue-500"
        />
      </div>

      {/* Actions */}
      <div className="space-y-2">
        <button className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg transition-colors">
          <RefreshCw className="h-4 w-4" />
          Run Compliance Check
        </button>
        <button className="w-full flex items-center justify-center gap-2 bg-gray-800 hover:bg-gray-700 text-white py-2 px-4 rounded-lg transition-colors">
          <FileText className="h-4 w-4" />
          Generate Report
        </button>
        <button className="w-full flex items-center justify-center gap-2 bg-gray-800 hover:bg-gray-700 text-white py-2 px-4 rounded-lg transition-colors">
          <Download className="h-4 w-4" />
          Export Checklist
        </button>
      </div>
    </div>
  );
}