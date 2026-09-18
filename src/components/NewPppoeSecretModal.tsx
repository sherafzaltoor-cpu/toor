import React, { useState } from 'react';
import { X, Network, Plus, Zap } from 'lucide-react';
import { Language, PppoeProfile } from '../types';

interface NewPppoeSecretModalProps {
  isOpen: boolean;
  onClose: () => void;
  profiles: PppoeProfile[];
  onAddSecret: (secretData: any) => void;
  lang: Language;
}

export const NewPppoeSecretModal: React.FC<NewPppoeSecretModalProps> = ({
  isOpen,
  onClose,
  profiles,
  onAddSecret,
  lang
}) => {
  const isUrdu = lang === 'ur';

  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [profile, setProfile] = useState(profiles[0]?.name || '5M-Home-Burst');
  const [remoteAddress, setRemoteAddress] = useState('');
  const [callerId, setCallerId] = useState('');
  const [monthlyFee, setMonthlyFee] = useState(1500);
  const [expiryDate, setExpiryDate] = useState(
    new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0]
  );
  const [comment, setComment] = useState('');

  // Custom rate-limit override
  const [customRateLimit, setCustomRateLimit] = useState(false);
  const [rateLimitVal, setRateLimitVal] = useState('');
  const [burstLimitVal, setBurstLimitVal] = useState('');

  if (!isOpen) return null;

  const selectedProfileObj = profiles.find((p) => p.name === profile) || profiles[0];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !password.trim()) return;

    onAddSecret({
      name: name.trim(),
      password: password.trim(),
      service: 'pppoe',
      profile,
      rateLimit: customRateLimit && rateLimitVal.trim() ? rateLimitVal.trim() : undefined,
      burstLimit: customRateLimit && burstLimitVal.trim() ? burstLimitVal.trim() : undefined,
      remoteAddress: remoteAddress.trim(),
      callerId: callerId.trim(),
      monthlyFee: Number(monthlyFee),
      expiryDate,
      paymentStatus: 'paid',
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
            <div className="p-2 bg-blue-500/15 text-blue-400 rounded-lg border border-blue-500/30">
              <Network className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">
                {isUrdu ? 'نیا PPPoE کسٹمر شامل کریں' : 'Add New PPPoE Subscriber'}
              </h3>
              <p className="text-xs text-slate-400">
                {isUrdu ? 'براڈبینڈ روٹر کیلئے یوزر نیم و پاس ورڈ بنائیں' : 'Create PPPoE client secret in MikroTik with Burst'}
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
                {isUrdu ? 'کسٹمر یوزر نیم *:' : 'Username *:'}
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. imran_router"
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-slate-200 font-mono text-xs focus:outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-slate-400 mb-1 font-medium">
                {isUrdu ? 'پاس ورڈ *:' : 'Password *:'}
              </label>
              <input
                type="text"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="e.g. net@12345"
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-slate-200 font-mono text-xs focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-slate-400 mb-1 font-medium">
              {isUrdu ? 'پیکج پروفائل (Speed Profile):' : 'Speed Profile:'}
            </label>
            <select
              value={profile}
              onChange={(e) => setProfile(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-slate-200 text-xs focus:outline-none focus:border-blue-500"
            >
              {profiles.map((p) => (
                <option key={p.id} value={p.name}>
                  {p.name} ({p.rateLimit} {p.burstLimit ? `• ⚡ Burst: ${p.burstLimit}` : ''})
                </option>
              ))}
            </select>

            {/* Selected Profile Burst Preview Badge */}
            {selectedProfileObj && (
              <div className="mt-2 p-2.5 rounded-lg bg-slate-950 border border-slate-800 flex items-center justify-between text-[11px]">
                <div className="flex items-center gap-2">
                  <span className="text-slate-400">Normal Speed:</span>
                  <span className="font-mono text-cyan-300 font-semibold">{selectedProfileObj.rateLimit}</span>
                </div>
                {selectedProfileObj.burstLimit ? (
                  <div className="flex items-center gap-1.5 text-amber-400 font-mono font-medium">
                    <Zap className="w-3.5 h-3.5" />
                    <span>Burst: {selectedProfileObj.burstLimit} ({selectedProfileObj.burstTime || '16s'})</span>
                  </div>
                ) : (
                  <span className="text-slate-500 font-mono">No Burst</span>
                )}
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-400 mb-1 font-medium">
                {isUrdu ? 'اسٹیٹک ریموٹ آئی پی (اختیاری):' : 'Static Remote IP (Optional):'}
              </label>
              <input
                type="text"
                value={remoteAddress}
                onChange={(e) => setRemoteAddress(e.target.value)}
                placeholder="Leave blank for auto pool"
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-slate-200 font-mono text-xs focus:outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-slate-400 mb-1 font-medium">
                {isUrdu ? 'کالر آئی ڈی / میک (اختیاری):' : 'Caller ID / Lock MAC:'}
              </label>
              <input
                type="text"
                value={callerId}
                onChange={(e) => setCallerId(e.target.value)}
                placeholder="e.g. 00:15:6D:AA:BB:CC"
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-slate-200 font-mono text-xs focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-400 mb-1 font-medium">
                {isUrdu ? 'ماہانہ فیس (روپے):' : 'Monthly Bill (PKR):'}
              </label>
              <input
                type="number"
                value={monthlyFee}
                onChange={(e) => setMonthlyFee(Number(e.target.value))}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-slate-200 font-mono text-xs focus:outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-slate-400 mb-1 font-medium">
                {isUrdu ? 'اگلی تاریخ ایکسپائری:' : 'Next Expiry Date:'}
              </label>
              <input
                type="date"
                value={expiryDate}
                onChange={(e) => setExpiryDate(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-slate-200 font-mono text-xs focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-slate-400 mb-1 font-medium">
              {isUrdu ? 'نوٹ / کسٹمر کا پتہ یا رابطہ نمبر:' : 'Comment / Address / Contact:'}
            </label>
            <input
              type="text"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="e.g. House #14, Street 2, 0300-1234567"
              className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-slate-200 text-xs focus:outline-none focus:border-blue-500"
            />
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition text-xs"
            >
              {isUrdu ? 'کینسل' : 'Cancel'}
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-medium transition text-xs shadow flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>{isUrdu ? 'کسٹمر شامل کریں' : 'Create Subscriber'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
