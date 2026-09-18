import React, { useState } from 'react';
import { X, Wifi, Plus } from 'lucide-react';
import { HotspotProfile, Language } from '../types';

interface NewHotspotUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  profiles: HotspotProfile[];
  onAddUser: (userData: any) => void;
  lang: Language;
}

export const NewHotspotUserModal: React.FC<NewHotspotUserModalProps> = ({
  isOpen,
  onClose,
  profiles,
  onAddUser,
  lang
}) => {
  const isUrdu = lang === 'ur';

  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [profile, setProfile] = useState(profiles[0]?.name || 'Default');
  const [uptimeLimit, setUptimeLimit] = useState('');
  const [bytesLimit, setBytesLimit] = useState('');
  const [macAddress, setMacAddress] = useState('');
  const [comment, setComment] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    let calculatedBytes = '';
    if (bytesLimit) {
      // If user inputs e.g. 5, assume GB or direct number
      const num = parseFloat(bytesLimit);
      if (!isNaN(num)) {
        calculatedBytes = (num * 1024 * 1024 * 1024).toString();
      }
    }

    onAddUser({
      name: name.trim(),
      password: password.trim(),
      profile,
      uptimeLimit: uptimeLimit.trim(),
      bytesLimit: calculatedBytes,
      macAddress: macAddress.trim(),
      comment: comment.trim(),
      disabled: false
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-700 w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden my-6">
        {/* Header */}
        <div className="px-6 py-4 bg-slate-950/70 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-cyan-500/15 text-cyan-400 rounded-lg border border-cyan-500/30">
              <Wifi className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">
                {isUrdu ? 'نیا ہاٹ سپاٹ یوزر شامل کریں' : 'Add New Hotspot User'}
              </h3>
              <p className="text-xs text-slate-400">
                {isUrdu ? 'مائیکروٹک راؤٹر میں نیا وائی فائی یوزر رجسٹر کریں' : 'Create Hotspot client in RouterOS'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-400 mb-1 font-medium">
                {isUrdu ? 'صارف کا نام (Username) *:' : 'Username *:'}
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. ali_khan"
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-slate-200 font-mono text-xs focus:outline-none focus:border-cyan-500"
              />
            </div>

            <div>
              <label className="block text-slate-400 mb-1 font-medium">
                {isUrdu ? 'پاس ورڈ:' : 'Password:'}
              </label>
              <input
                type="text"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="e.g. 123456"
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-slate-200 font-mono text-xs focus:outline-none focus:border-cyan-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-slate-400 mb-1 font-medium">
              {isUrdu ? 'پروفائل / سپیڈ لمٹ:' : 'Profile / Speed Limit:'}
            </label>
            <select
              value={profile}
              onChange={(e) => setProfile(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-slate-200 text-xs focus:outline-none focus:border-cyan-500"
            >
              {profiles.map((p) => (
                <option key={p.id} value={p.name}>
                  {p.name} ({p.rateLimit})
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-400 mb-1 font-medium">
                {isUrdu ? 'ٹائم لمٹ (اختیاری):' : 'Uptime Limit (Optional):'}
              </label>
              <input
                type="text"
                value={uptimeLimit}
                onChange={(e) => setUptimeLimit(e.target.value)}
                placeholder="e.g. 1d, 3h, 30m"
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-slate-200 font-mono text-xs focus:outline-none focus:border-cyan-500"
              />
            </div>

            <div>
              <label className="block text-slate-400 mb-1 font-medium">
                {isUrdu ? 'ڈیٹا کوٹہ (GB میں):' : 'Data Limit (in GB):'}
              </label>
              <input
                type="number"
                step="0.5"
                value={bytesLimit}
                onChange={(e) => setBytesLimit(e.target.value)}
                placeholder="e.g. 5 (means 5GB)"
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-slate-200 font-mono text-xs focus:outline-none focus:border-cyan-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-slate-400 mb-1 font-medium">
              {isUrdu ? 'میک ایڈریس بائنڈنگ (اختیاری):' : 'MAC Address Binding (Optional):'}
            </label>
            <input
              type="text"
              value={macAddress}
              onChange={(e) => setMacAddress(e.target.value)}
              placeholder="e.g. 00:1A:2B:3C:4D:5E"
              className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-slate-200 font-mono text-xs focus:outline-none focus:border-cyan-500"
            />
          </div>

          <div>
            <label className="block text-slate-400 mb-1 font-medium">
              {isUrdu ? 'کمنٹ / کسٹمر تفصیل:' : 'Comment / Note:'}
            </label>
            <input
              type="text"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="e.g. Room #3, Paid Rs 300"
              className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-slate-200 text-xs focus:outline-none focus:border-cyan-500"
            />
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition text-xs"
            >
              {isUrdu ? 'منسوخ' : 'Cancel'}
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-medium transition text-xs flex items-center gap-1.5 shadow"
            >
              <Plus className="w-4 h-4" />
              <span>{isUrdu ? 'یوزر شامل کریں' : 'Add User'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
