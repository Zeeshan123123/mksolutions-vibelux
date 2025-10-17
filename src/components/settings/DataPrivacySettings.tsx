"use client"

import { useState } from 'react'
import { Shield, Download, Trash2, Eye, EyeOff, AlertTriangle, Check, X } from 'lucide-react'
import { logger } from '@/lib/logging/production-logger';

export function DataPrivacySettings() {
  const [analyticsOptIn, setAnalyticsOptIn] = useState(true)
  const [researchOptIn, setResearchOptIn] = useState(false)
  const [showDeletionModal, setShowDeletionModal] = useState(false)
  const [deletionConfirmText, setDeletionConfirmText] = useState('')
  const [isExporting, setIsExporting] = useState(false)

  const handleExportData = async () => {
    setIsExporting(true)
    try {
      const response = await fetch('/api/user/export-data', {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
      })
      
      if (response.ok) {
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `vibelux-data-export-${new Date().toISOString().split('T')[0]}.json`
        a.click()
        window.URL.revokeObjectURL(url)
      }
    } catch (error) {
      logger.error('system', 'Export failed:', error )
    } finally {
      setIsExporting(false)
    }
  }

  const handleDeleteAccount = async () => {
    if (deletionConfirmText !== 'DELETE MY ACCOUNT') return

    try {
      const response = await fetch('/api/user/delete-account', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' }
      })
      
      if (response.ok) {
        window.location.href = '/account-deleted'
      }
    } catch (error) {
      logger.error('system', 'Account deletion failed:', error )
    }
  }

  const updatePrivacySettings = async (setting: string, value: boolean) => {
    try {
      await fetch('/api/user/privacy-settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ [setting]: value })
      })
    } catch (error) {
      logger.error('system', 'Privacy settings update failed:', error )
    }
  }

  return (
    <div className="p-6 space-y-8">
      <div className="flex items-center gap-3 mb-6">
        <Shield className="w-6 h-6 text-blue-400" />
        <h2 className="text-2xl font-bold text-white">Data Privacy & Controls</h2>
      </div>

      {/* Privacy Settings */}
      <div className="bg-gray-800 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Privacy Preferences</h3>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <h4 className="text-white font-medium">Analytics & Usage Data</h4>
              <p className="text-gray-400 text-sm">
                Help improve VibeLux by sharing anonymous usage analytics
              </p>
            </div>
            <button
              onClick={() => {
                setAnalyticsOptIn(!analyticsOptIn)
                updatePrivacySettings('analyticsOptIn', !analyticsOptIn)
              }}
              className={`relative w-12 h-6 rounded-full transition-colors ${
                analyticsOptIn ? 'bg-green-600' : 'bg-gray-600'
              }`}
            >
              <div className={`absolute top-1 left-1 w-4 h-4 rounded-full bg-white transition-transform ${
                analyticsOptIn ? 'transform translate-x-6' : ''
              }`} />
            </button>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex-1">
              <h4 className="text-white font-medium">Research Program</h4>
              <p className="text-gray-400 text-sm">
                Participate in anonymized research to advance cultivation science
              </p>
            </div>
            <button
              onClick={() => {
                setResearchOptIn(!researchOptIn)
                updatePrivacySettings('researchOptIn', !researchOptIn)
              }}
              className={`relative w-12 h-6 rounded-full transition-colors ${
                researchOptIn ? 'bg-green-600' : 'bg-gray-600'
              }`}
            >
              <div className={`absolute top-1 left-1 w-4 h-4 rounded-full bg-white transition-transform ${
                researchOptIn ? 'transform translate-x-6' : ''
              }`} />
            </button>
          </div>
        </div>
      </div>

      {/* Data Export */}
      <div className="bg-gray-800 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Data Export</h3>
        <p className="text-gray-400 mb-4">
          Download a copy of all your data including designs, calculations, and account information.
        </p>
        <button
          onClick={handleExportData}
          disabled={isExporting}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white rounded-lg transition-colors"
        >
          <Download className="w-4 h-4" />
          {isExporting ? 'Exporting...' : 'Export My Data'}
        </button>
      </div>

      {/* Data Retention */}
      <div className="bg-gray-800 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Data Retention</h3>
        <div className="space-y-3 text-sm">
          <div className="flex items-center gap-2">
            <Check className="w-4 h-4 text-green-400" />
            <span className="text-gray-300">Designs: Stored while account is active</span>
          </div>
          <div className="flex items-center gap-2">
            <Check className="w-4 h-4 text-green-400" />
            <span className="text-gray-300">Usage data: Anonymized after 1 year</span>
          </div>
          <div className="flex items-center gap-2">
            <Check className="w-4 h-4 text-green-400" />
            <span className="text-gray-300">Account data: Deleted 30 days after account closure</span>
          </div>
        </div>
      </div>

      {/* Account Deletion */}
      <div className="bg-red-900/20 border border-red-800 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-red-400 mb-4 flex items-center gap-2">
          <AlertTriangle className="w-5 h-5" />
          Danger Zone
        </h3>
        <p className="text-gray-400 mb-4">
          Permanently delete your account and all associated data. This action cannot be undone.
        </p>
        <button
          onClick={() => setShowDeletionModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
        >
          <Trash2 className="w-4 h-4" />
          Delete Account
        </button>
      </div>

      {/* Deletion Confirmation Modal */}
      {showDeletionModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-gray-900 rounded-xl border border-red-800 w-full max-w-md">
            <div className="p-6 border-b border-red-800">
              <h3 className="text-xl font-semibold text-red-400 flex items-center gap-2">
                <AlertTriangle className="w-5 h-5" />
                Delete Account
              </h3>
            </div>
            
            <div className="p-6 space-y-4">
              <p className="text-gray-300">
                This will permanently delete your account and all associated data including:
              </p>
              <ul className="text-sm text-gray-400 space-y-1 ml-4">
                <li>• All lighting designs and calculations</li>
                <li>• Growing results and analytics</li>
                <li>• Account settings and preferences</li>
                <li>• Team members and collaborations</li>
              </ul>
              
              <div className="bg-red-900/30 border border-red-800 rounded-lg p-4">
                <p className="text-red-300 text-sm font-medium">
                  This action cannot be undone. Are you absolutely sure?
                </p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Type "DELETE MY ACCOUNT" to confirm:
                </label>
                <input
                  type="text"
                  value={deletionConfirmText}
                  onChange={(e) => setDeletionConfirmText(e.target.value)}
                  className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:border-red-500 text-white"
                  placeholder="DELETE MY ACCOUNT"
                />
              </div>
              
              <div className="flex gap-3 pt-4">
                <button
                  onClick={handleDeleteAccount}
                  disabled={deletionConfirmText !== 'DELETE MY ACCOUNT'}
                  className="flex-1 py-2 bg-red-600 hover:bg-red-700 disabled:bg-gray-700 disabled:cursor-not-allowed text-white rounded-lg font-medium transition-colors"
                >
                  Delete Account
                </button>
                <button
                  onClick={() => {
                    setShowDeletionModal(false)
                    setDeletionConfirmText('')
                  }}
                  className="px-6 py-2 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-lg font-medium transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}