import React, { useState } from 'react';
import { Share2, Copy, Mail, Link, Users, Check } from 'lucide-react';

interface ShareDialogProps {
  project: any;
  onClose: () => void;
}

export default function ShareDialog({ project, onClose }: ShareDialogProps) {
  const [shareLink, setShareLink] = useState('');
  const [copied, setCopied] = useState(false);
  const [shareSettings, setShareSettings] = useState({
    allowEdit: false,
    allowComments: true,
    expiresIn: '7' // days
  });

  React.useEffect(() => {
    // Generate share link (in real app, this would be from backend)
    const link = `${window.location.origin}/design/shared/${project?.id || 'new'}`;
    setShareLink(link);
  }, [project]);

  const handleCopy = () => {
    navigator.clipboard.writeText(shareLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleEmailShare = () => {
    const subject = encodeURIComponent(`Vibelux Design: ${project?.name || 'New Design'}`);
    const body = encodeURIComponent(`Check out this lighting design:\n\n${shareLink}`);
    window.open(`mailto:?subject=${subject}&body=${body}`);
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-3">Share Settings</h3>
        <div className="space-y-3">
          <label className="flex items-center justify-between">
            <span>Allow editing</span>
            <input
              type="checkbox"
              checked={shareSettings.allowEdit}
              onChange={(e) => setShareSettings({ ...shareSettings, allowEdit: e.target.checked })}
              className="rounded bg-gray-700 border-gray-600 text-purple-600 focus:ring-purple-500"
            />
          </label>
          <label className="flex items-center justify-between">
            <span>Allow comments</span>
            <input
              type="checkbox"
              checked={shareSettings.allowComments}
              onChange={(e) => setShareSettings({ ...shareSettings, allowComments: e.target.checked })}
              className="rounded bg-gray-700 border-gray-600 text-purple-600 focus:ring-purple-500"
            />
          </label>
          <label className="flex items-center justify-between">
            <span>Link expires in</span>
            <select
              value={shareSettings.expiresIn}
              onChange={(e) => setShareSettings({ ...shareSettings, expiresIn: e.target.value })}
              className="bg-gray-700 border-gray-600 rounded px-3 py-1"
            >
              <option value="1">1 day</option>
              <option value="7">7 days</option>
              <option value="30">30 days</option>
              <option value="never">Never</option>
            </select>
          </label>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold mb-3">Share Link</h3>
        <div className="flex gap-2">
          <input
            type="text"
            value={shareLink}
            readOnly
            className="flex-1 px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-gray-300"
          />
          <button
            onClick={handleCopy}
            className="px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-md flex items-center gap-2"
          >
            {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
            {copied ? 'Copied!' : 'Copy'}
          </button>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold mb-3">Share via</h3>
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={handleEmailShare}
            className="p-3 bg-gray-700 hover:bg-gray-600 rounded-lg flex items-center gap-3"
          >
            <Mail className="w-5 h-5 text-blue-400" />
            <span>Email</span>
          </button>
          <button
            onClick={() => window.open(`https://teams.microsoft.com/share?url=${encodeURIComponent(shareLink)}`)}
            className="p-3 bg-gray-700 hover:bg-gray-600 rounded-lg flex items-center gap-3"
          >
            <Users className="w-5 h-5 text-purple-400" />
            <span>Teams</span>
          </button>
        </div>
      </div>

      <div className="bg-blue-900 bg-opacity-30 rounded-lg p-4">
        <p className="text-sm text-blue-300">
          <strong>Pro tip:</strong> Share with your team to collaborate on designs in real-time. 
          They'll be able to view and {shareSettings.allowEdit ? 'edit' : 'comment on'} your design.
        </p>
      </div>
    </div>
  );
}