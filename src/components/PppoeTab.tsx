import React, { useState } from 'react';
import { 
  Network, 
  Search, 
  Plus, 
  RefreshCw, 
  Trash2, 
  Power, 
  Eye, 
  EyeOff, 
  Filter, 
  Clock, 
  XCircle, 
  Calendar, 
  CreditCard,
  Download,
  Upload,
  CheckCircle2,
  AlertTriangle,
  Zap,
  Terminal,
  Copy,
  Layers,
  Gauge,
  ShieldCheck
} from 'lucide-react';
import { Language, PppoeActive, PppoeProfile, PppoeSecret } from '../types';
import { formatBytes, buildMikrotikRateLimit } from '../data/mockMikrotikData';
import { NewPppoeProfileModal } from './NewPppoeProfileModal';

interface PppoeTabProps {
  secrets: PppoeSecret[];
  activeConnections: PppoeActive[];
  profiles: PppoeProfile[];
  onAddSecret: () => void;
  onAddProfile?: (profile: PppoeProfile) => void;
  onToggleSecret: (id: string, currentDisabled: boolean) => void;
  onDeleteSecret: (id: string, name: string) => void;
  onDisconnectConnection: (id: string, name: string) => void;
  onRefresh: () => void;
  lang: Language;
}

export const PppoeTab: React.FC<PppoeTabProps> = ({
  secrets,
  activeConnections,
  profiles,
  onAddSecret,
  onAddProfile,
  onToggleSecret,
  onDeleteSecret,
  onDisconnectConnection,
  onRefresh,
  lang
}) => {
  const isUrdu = lang === 'ur';
  const [subTab, setSubTab] = useState<'secrets' | 'active' | 'profiles'>('secrets');
  const [searchTerm, setSearchTerm] = useState('');
  const [profileFilter, setProfileFilter] = useState('all');
  const [showPasswords, setShowPasswords] = useState<{ [id: string]: boolean }>({});
  const [copiedProfileId, setCopiedProfileId] = useState<string | null>(null);
  const [isNewProfileModalOpen, setIsNewProfileModalOpen] = useState(false);

  const togglePasswordVisibility = (id: string) => {
    setShowPasswords(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const handleCopyProfileCommand = (p: PppoeProfile) => {
    const fullRateLimit = buildMikrotikRateLimit(p);
    const cmd = `/ppp profile add name="${p.name}" rate-limit="${fullRateLimit}" local-address="${p.localAddressPool}" remote-address="${p.remoteAddressPool}" dns-server="${p.dnsServers}"`;
    navigator.clipboard.writeText(cmd);
    setCopiedProfileId(p.id);
    setTimeout(() => setCopiedProfileId(null), 2000);
  };

  const filteredSecrets = secrets.filter(secret => {
    const matchesSearch = 
      secret.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (secret.comment && secret.comment.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (secret.remoteAddress && secret.remoteAddress.includes(searchTerm));
    
    const matchesProfile = profileFilter === 'all' || secret.profile === profileFilter;
    return matchesSearch && matchesProfile;
  });

  return (
    <div className="space-y-6">
      {/* Tab Header & Control Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900 p-4 rounded-xl border border-slate-800 shadow">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-blue-500/15 text-blue-400 rounded-lg border border-blue-500/30">
            <Network className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              {isUrdu ? 'مائیکروٹک PPPoE سرور اور برسٹ مینجمنٹ' : 'MikroTik PPPoE & Burst Management'}
            </h2>
            <p className="text-xs text-slate-400">
              {isUrdu
                ? 'براڈ بینڈ کلائنٹس، مائیکروٹک برسٹ سپیڈ ریٹ لِمٹ اور فعال ڈائلز کا مکمل کنٹرول'
                : 'Manage PPPoE client credentials, MikroTik Burst rate-limits, expiry, and active dials'}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={onRefresh}
            className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition border border-slate-700"
            title="Refresh list"
          >
            <RefreshCw className="w-4 h-4" />
          </button>

          <button
            onClick={() => setIsNewProfileModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-amber-600/20 text-amber-300 border border-amber-500/40 hover:bg-amber-600/30 text-xs font-medium transition shadow-sm"
          >
            <Zap className="w-4 h-4 text-amber-400" />
            <span>{isUrdu ? 'نیا برسٹ پروفائل' : 'Add Burst Profile'}</span>
          </button>

          <button
            onClick={onAddSecret}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-medium transition shadow-sm"
          >
            <Plus className="w-4 h-4" />
            <span>{isUrdu ? 'نیا PPPoE کسٹمر' : 'Add Subscriber'}</span>
          </button>
        </div>
      </div>

      {/* Subtabs Selector */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
        <button
          onClick={() => setSubTab('secrets')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-medium transition ${
            subTab === 'secrets'
              ? 'bg-blue-600 text-white shadow'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
          }`}
        >
          <span>{isUrdu ? 'کسٹمرز (Secrets)' : 'Subscribers (Secrets)'}</span>
          <span className="bg-black/30 px-1.5 py-0.2 rounded-full text-[11px]">
            {secrets.length}
          </span>
        </button>

        <button
          onClick={() => setSubTab('active')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-medium transition ${
            subTab === 'active'
              ? 'bg-emerald-600 text-white shadow'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
          }`}
        >
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
          <span>{isUrdu ? 'آن لائن روٹرز (Active)' : 'Active Sessions'}</span>
          <span className="bg-black/30 px-1.5 py-0.2 rounded-full text-[11px]">
            {activeConnections.length}
          </span>
        </button>

        <button
          onClick={() => setSubTab('profiles')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-medium transition ${
            subTab === 'profiles'
              ? 'bg-amber-600 text-white shadow'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
          }`}
        >
          <Zap className="w-3.5 h-3.5 text-amber-300" />
          <span>{isUrdu ? 'پیکج پروفائلز و برسٹ (Burst Profiles)' : 'Speed & Burst Profiles'}</span>
          <span className="bg-black/30 px-1.5 py-0.2 rounded-full text-[11px]">
            {profiles.length}
          </span>
        </button>
      </div>

      {/* VIEW 1: PPPOE SECRETS TABLE */}
      {subTab === 'secrets' && (
        <div className="space-y-4">
          {/* Search and Filters Bar */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                type="text"
                placeholder={isUrdu ? 'کسٹمر کا نام، کمنٹ، یا آئی پی تلاش کریں...' : 'Search by username, comment, or IP...'}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded-lg pl-9 pr-4 py-2 text-xs text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-blue-500"
              />
            </div>

            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-slate-500" />
              <select
                value={profileFilter}
                onChange={(e) => setProfileFilter(e.target.value)}
                className="bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-300 focus:outline-none focus:border-blue-500"
              >
                <option value="all">{isUrdu ? 'تمام پروفائلز' : 'All Profiles'}</option>
                {profiles.map((p) => (
                  <option key={p.id} value={p.name}>
                    {p.name} ({p.rateLimit})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Table */}
          <div className="bg-slate-900 rounded-xl border border-slate-800 overflow-hidden shadow">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-950/60 border-b border-slate-800 text-slate-400 uppercase tracking-wider font-mono text-[11px]">
                  <tr>
                    <th className="py-3 px-4">{isUrdu ? 'کسٹمر یوزر' : 'Username'}</th>
                    <th className="py-3 px-4">{isUrdu ? 'پاس ورڈ' : 'Password'}</th>
                    <th className="py-3 px-4">{isUrdu ? 'پروفائل اور برسٹ' : 'Profile & Burst'}</th>
                    <th className="py-3 px-4">{isUrdu ? 'مقررہ ریموٹ آئی پی' : 'Remote IP'}</th>
                    <th className="py-3 px-4">{isUrdu ? 'بلنگ و میعاد' : 'Billing & Expiry'}</th>
                    <th className="py-3 px-4">{isUrdu ? 'نوٹ / کمنٹ' : 'Comment'}</th>
                    <th className="py-3 px-4">{isUrdu ? 'اسٹیٹس' : 'Status'}</th>
                    <th className="py-3 px-4 text-right">{isUrdu ? 'ایکشن' : 'Actions'}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {filteredSecrets.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="py-8 text-center text-slate-500">
                        {isUrdu ? 'کوئی PPPoE کسٹمر نہیں ملا۔' : 'No PPPoE subscribers found.'}
                      </td>
                    </tr>
                  ) : (
                    filteredSecrets.map((secret) => {
                      const isVisible = showPasswords[secret.id];
                      const matchedProfile = profiles.find(p => p.name === secret.profile);

                      return (
                        <tr key={secret.id} className="hover:bg-slate-800/40 transition">
                          <td className="py-3 px-4">
                            <div className="font-semibold text-slate-200 font-mono flex items-center gap-1.5">
                              <span>{secret.name}</span>
                              <span className="text-[10px] text-slate-400 bg-slate-800 px-1 rounded">
                                {secret.service}
                              </span>
                            </div>
                          </td>
                          <td className="py-3 px-4 font-mono">
                            <div className="flex items-center gap-1.5 text-slate-300">
                              <span>{isVisible ? (secret.password || '<empty>') : '••••••••'}</span>
                              <button
                                onClick={() => togglePasswordVisibility(secret.id)}
                                className="text-slate-500 hover:text-slate-300 transition"
                                title={isVisible ? 'Hide Password' : 'Show Password'}
                              >
                                {isVisible ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                              </button>
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <div className="flex flex-col gap-1">
                              <span className="px-2 py-0.5 rounded bg-blue-950 text-blue-300 border border-blue-800/70 font-mono text-[11px] self-start">
                                {secret.profile}
                              </span>
                              {matchedProfile?.burstLimit && (
                                <span className="px-1.5 py-0.2 rounded bg-amber-950/80 text-amber-300 border border-amber-800/60 font-mono text-[9px] flex items-center gap-1 self-start">
                                  <Zap className="w-2.5 h-2.5 text-amber-400" />
                                  <span>Burst: {matchedProfile.burstLimit}</span>
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="py-3 px-4 font-mono text-slate-300">
                            {secret.remoteAddress || <span className="text-slate-500">Auto Pool</span>}
                          </td>
                          <td className="py-3 px-4">
                            <div className="space-y-0.5">
                              <div className="flex items-center gap-1 font-mono text-[11px] text-slate-300">
                                <Calendar className="w-3 h-3 text-slate-500" />
                                <span>{secret.expiryDate || 'N/A'}</span>
                              </div>
                              <div className="flex items-center gap-1.5 text-[11px]">
                                <span className="text-slate-400 font-mono">Rs {secret.monthlyFee || 1500}</span>
                                {secret.paymentStatus === 'paid' && (
                                  <span className="text-[10px] text-emerald-400 bg-emerald-950/80 border border-emerald-800/60 px-1 rounded">
                                    Paid
                                  </span>
                                )}
                                {secret.paymentStatus === 'due' && (
                                  <span className="text-[10px] text-amber-400 bg-amber-950/80 border border-amber-800/60 px-1 rounded">
                                    Due
                                  </span>
                                )}
                                {secret.paymentStatus === 'expired' && (
                                  <span className="text-[10px] text-red-400 bg-red-950/80 border border-red-800/60 px-1 rounded">
                                    Expired
                                  </span>
                                )}
                              </div>
                            </div>
                          </td>
                          <td className="py-3 px-4 text-slate-300 text-xs">
                            {secret.comment || '-'}
                          </td>
                          <td className="py-3 px-4">
                            {secret.disabled ? (
                              <span className="px-2 py-0.5 rounded text-[11px] font-medium bg-red-950/80 text-red-400 border border-red-800/60">
                                {isUrdu ? 'بند (Disabled)' : 'Disabled'}
                              </span>
                            ) : (
                              <span className="px-2 py-0.5 rounded text-[11px] font-medium bg-emerald-950/80 text-emerald-400 border border-emerald-800/60">
                                {isUrdu ? 'فعال (Active)' : 'Active'}
                              </span>
                            )}
                          </td>
                          <td className="py-3 px-4 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                onClick={() => onToggleSecret(secret.id, secret.disabled)}
                                className={`p-1.5 rounded transition ${
                                  secret.disabled
                                    ? 'bg-emerald-900/40 text-emerald-300 hover:bg-emerald-800'
                                    : 'bg-amber-900/40 text-amber-300 hover:bg-amber-800'
                                }`}
                                title={secret.disabled ? 'Enable Secret' : 'Disable Secret'}
                              >
                                <Power className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => onDeleteSecret(secret.id, secret.name)}
                                className="p-1.5 rounded bg-red-900/30 text-red-400 hover:bg-red-800/60 transition"
                                title="Delete PPPoE Secret"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* VIEW 2: ACTIVE CONNECTIONS TABLE */}
      {subTab === 'active' && (
        <div className="space-y-4">
          <div className="bg-slate-900 rounded-xl border border-slate-800 overflow-hidden shadow">
            <div className="px-4 py-3 bg-slate-950/60 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs text-slate-300">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
                <span>{isUrdu ? 'آن لائن ڈائلڈ کلائنٹس (Active Routers/ONTs)' : 'Currently Dialed PPPoE Connections'}</span>
              </div>
              <span className="text-xs text-slate-400">Connected: {activeConnections.length}</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-950/60 border-b border-slate-800 text-slate-400 uppercase tracking-wider font-mono text-[11px]">
                  <tr>
                    <th className="py-3 px-4">{isUrdu ? 'کسٹمر یوزر' : 'User'}</th>
                    <th className="py-3 px-4">{isUrdu ? 'تفویض شدہ آئی پی' : 'Assigned IP'}</th>
                    <th className="py-3 px-4">{isUrdu ? 'کلائنٹ میک / کالر آئی ڈی' : 'Caller ID (MAC)'}</th>
                    <th className="py-3 px-4">{isUrdu ? 'ورچوئل انٹرفیس' : 'Interface'}</th>
                    <th className="py-3 px-4">{isUrdu ? 'کنکشن اپ ٹائم' : 'Uptime'}</th>
                    <th className="py-3 px-4">{isUrdu ? 'ٹریفک (ڈاؤن لوڈ / اپلوڈ)' : 'Traffic'}</th>
                    <th className="py-3 px-4 text-right">{isUrdu ? 'ڈس کنیکٹ' : 'Disconnect'}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {activeConnections.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-8 text-center text-slate-500">
                        {isUrdu ? 'کوئی PPPoE سیشن آن لائن نہیں ہے۔' : 'No active PPPoE connections right now.'}
                      </td>
                    </tr>
                  ) : (
                    activeConnections.map((conn) => (
                      <tr key={conn.id} className="hover:bg-slate-800/40 transition">
                        <td className="py-3 px-4 font-mono font-semibold text-blue-300">
                          {conn.name}
                        </td>
                        <td className="py-3 px-4 font-mono text-slate-200">
                          {conn.address}
                        </td>
                        <td className="py-3 px-4 font-mono text-slate-400">
                          {conn.callerId || '00:00:00:00:00:00'}
                        </td>
                        <td className="py-3 px-4 font-mono text-slate-400 text-[11px]">
                          {conn.interface}
                        </td>
                        <td className="py-3 px-4 font-mono text-slate-300 flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5 text-slate-500" />
                          <span>{conn.uptime}</span>
                        </td>
                        <td className="py-3 px-4 font-mono text-xs">
                          <div className="flex items-center gap-3">
                            <span className="text-emerald-400 flex items-center gap-1">
                              <Download className="w-3 h-3" />
                              {formatBytes(conn.bytesOut)}
                            </span>
                            <span className="text-blue-400 flex items-center gap-1">
                              <Upload className="w-3 h-3" />
                              {formatBytes(conn.bytesIn)}
                            </span>
                          </div>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <button
                            onClick={() => onDisconnectConnection(conn.id, conn.name)}
                            className="px-2.5 py-1 rounded bg-red-950 text-red-300 hover:bg-red-900 border border-red-800/80 transition text-xs flex items-center gap-1 ml-auto"
                            title="Disconnect PPPoE session"
                          >
                            <XCircle className="w-3.5 h-3.5" />
                            <span>{isUrdu ? 'ڈس کنیکٹ' : 'Disconnect'}</span>
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* VIEW 3: PPPOE PROFILES WITH BURST */}
      {subTab === 'profiles' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between bg-slate-900 p-4 rounded-xl border border-slate-800">
            <div>
              <h3 className="font-bold text-white text-sm">
                {isUrdu ? 'مائیکروٹک PPPoE پروفائلز اور برسٹ کنفیگریشن' : 'MikroTik PPPoE Profiles & Burst Configuration'}
              </h3>
              <p className="text-xs text-slate-400">
                {isUrdu 
                  ? 'برسٹ سپیڈ کا استعمال کر کے صارفین کو تیز ترین کلکس اور ہموار اسٹریمنگ فراہم کریں'
                  : 'Profiles with Burst give immediate high-speed boosts to page requests while enforcing fair data rate caps'}
              </p>
            </div>
            <button
              onClick={() => setIsNewProfileModalOpen(true)}
              className="px-3 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-500 text-white text-xs font-semibold flex items-center gap-1.5 shadow transition"
            >
              <Zap className="w-4 h-4" />
              <span>{isUrdu ? 'نیا برسٹ پروفائل بنائیں' : 'Create Burst Profile'}</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4">
            {profiles.map((p) => {
              const hasBurst = Boolean(p.burstLimit);
              const fullRateLimit = buildMikrotikRateLimit(p);

              return (
                <div key={p.id} className="bg-slate-900 p-5 rounded-xl border border-slate-800 shadow space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                    <div className="flex items-center gap-2">
                      <div className={`p-1.5 rounded-lg ${hasBurst ? 'bg-amber-500/20 text-amber-400' : 'bg-blue-500/20 text-blue-400'}`}>
                        {hasBurst ? <Zap className="w-4 h-4" /> : <Gauge className="w-4 h-4" />}
                      </div>
                      <div>
                        <h3 className="font-bold text-white text-sm font-mono">{p.name}</h3>
                        <span className="text-[10px] text-slate-400">MikroTik /ppp profile</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="bg-blue-950 text-blue-400 border border-blue-800 px-2 py-0.5 rounded text-xs font-mono font-bold">
                        {p.rateLimit}
                      </span>
                      {hasBurst && (
                        <span className="bg-amber-950 text-amber-300 border border-amber-700/80 px-2 py-0.5 rounded text-xs font-mono font-bold flex items-center gap-1">
                          <Zap className="w-3 h-3" />
                          <span>{p.burstLimit}</span>
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Burst Parameters Box */}
                  {hasBurst ? (
                    <div className="p-3 bg-amber-950/20 border border-amber-800/40 rounded-lg space-y-2">
                      <div className="flex items-center justify-between text-xs text-amber-300 font-semibold">
                        <span className="flex items-center gap-1.5">
                          <Zap className="w-3.5 h-3.5 text-amber-400" />
                          <span>{isUrdu ? 'برسٹ پیرامیٹرز (Active Burst)' : 'Active Burst Parameters'}</span>
                        </span>
                        <span className="text-[10px] bg-amber-950 px-1.5 py-0.2 rounded border border-amber-800/60 font-mono">
                          P{p.burstPriority || 8}
                        </span>
                      </div>

                      <div className="grid grid-cols-3 gap-2 text-xs font-mono pt-1">
                        <div className="bg-slate-950/80 p-2 rounded border border-slate-800">
                          <span className="text-[10px] text-slate-400 block font-sans">Burst Limit:</span>
                          <span className="font-bold text-amber-300">{p.burstLimit}</span>
                        </div>
                        <div className="bg-slate-950/80 p-2 rounded border border-slate-800">
                          <span className="text-[10px] text-slate-400 block font-sans">Threshold:</span>
                          <span className="text-slate-300">{p.burstThreshold || p.rateLimit}</span>
                        </div>
                        <div className="bg-slate-950/80 p-2 rounded border border-slate-800">
                          <span className="text-[10px] text-slate-400 block font-sans">Time Window:</span>
                          <span className="text-cyan-300">{p.burstTime || '16s/16s'}</span>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="p-3 bg-slate-950 rounded-lg border border-slate-800 text-xs text-slate-400 flex items-center justify-between">
                      <span>{isUrdu ? 'اس پروفائل پر برسٹ آن نہیں ہے' : 'No burst configured on this profile'}</span>
                      <button
                        onClick={() => setIsNewProfileModalOpen(true)}
                        className="text-amber-400 hover:underline text-[11px]"
                      >
                        {isUrdu ? 'برسٹ شامل کریں' : 'Enable Burst'}
                      </button>
                    </div>
                  )}

                  {/* Pool & DNS Information */}
                  <div className="space-y-1 text-xs text-slate-300 font-mono">
                    <div className="flex justify-between">
                      <span className="text-slate-400 font-sans">{isUrdu ? 'لوکل ایڈریس:' : 'Local Address:'}</span>
                      <span>{p.localAddressPool}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400 font-sans">{isUrdu ? 'ریموٹ آئی پی پول:' : 'Remote Pool:'}</span>
                      <span>{p.remoteAddressPool}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400 font-sans">{isUrdu ? 'ڈی این ایس سرور:' : 'DNS Servers:'}</span>
                      <span>{p.dnsServers}</span>
                    </div>
                  </div>

                  {/* RouterOS Rate Limit String & Copy Action */}
                  <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between gap-2">
                    <div className="truncate font-mono text-[10px] text-slate-400 bg-slate-950 px-2 py-1 rounded border border-slate-800 flex-1">
                      rate-limit="{fullRateLimit}"
                    </div>
                    <button
                      onClick={() => handleCopyProfileCommand(p)}
                      className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-mono flex items-center gap-1 shrink-0 border border-slate-700 transition"
                      title="Copy RouterOS WinBox Command"
                    >
                      {copiedProfileId === p.id ? (
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                      ) : (
                        <Copy className="w-3.5 h-3.5 text-cyan-400" />
                      )}
                      <span>{copiedProfileId === p.id ? 'Copied' : 'WinBox Script'}</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Modal for creating PPPoE profile with burst */}
      <NewPppoeProfileModal
        isOpen={isNewProfileModalOpen}
        onClose={() => setIsNewProfileModalOpen(false)}
        onAddProfile={(newProfile) => {
          if (onAddProfile) {
            onAddProfile(newProfile);
          }
        }}
        lang={lang}
      />
    </div>
  );
};
