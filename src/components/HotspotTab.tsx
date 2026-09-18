import React, { useState } from 'react';
import { 
  Wifi, 
  Search, 
  Plus, 
  Ticket, 
  RefreshCw, 
  Trash2, 
  Power, 
  UserCheck, 
  Clock, 
  ShieldAlert, 
  Eye, 
  EyeOff, 
  Check, 
  XCircle,
  Activity,
  Filter,
  Download,
  Upload
} from 'lucide-react';
import { HotspotActive, HotspotProfile, HotspotUser, Language } from '../types';
import { formatBytes } from '../data/mockMikrotikData';

interface HotspotTabProps {
  users: HotspotUser[];
  activeSessions: HotspotActive[];
  profiles: HotspotProfile[];
  onAddUser: () => void;
  onOpenVouchers: () => void;
  onToggleUser: (id: string, currentDisabled: boolean) => void;
  onDeleteUser: (id: string, name: string) => void;
  onDisconnectSession: (id: string, user: string) => void;
  onRefresh: () => void;
  lang: Language;
}

export const HotspotTab: React.FC<HotspotTabProps> = ({
  users,
  activeSessions,
  profiles,
  onAddUser,
  onOpenVouchers,
  onToggleUser,
  onDeleteUser,
  onDisconnectSession,
  onRefresh,
  lang
}) => {
  const isUrdu = lang === 'ur';
  const [subTab, setSubTab] = useState<'users' | 'active' | 'profiles'>('users');
  const [searchTerm, setSearchTerm] = useState('');
  const [profileFilter, setProfileFilter] = useState('all');
  const [showPasswords, setShowPasswords] = useState<{ [id: string]: boolean }>({});

  const togglePasswordVisibility = (id: string) => {
    setShowPasswords(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = 
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (user.comment && user.comment.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (user.macAddress && user.macAddress.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesProfile = profileFilter === 'all' || user.profile === profileFilter;
    return matchesSearch && matchesProfile;
  });

  return (
    <div className="space-y-6">
      {/* Tab Header & Control Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900 p-4 rounded-xl border border-slate-800 shadow">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-cyan-500/15 text-cyan-400 rounded-lg border border-cyan-500/30">
            <Wifi className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              {isUrdu ? 'مائیکروٹک ہاٹ سپاٹ مینجمنٹ' : 'MikroTik Hotspot Management'}
            </h2>
            <p className="text-xs text-slate-400">
              {isUrdu
                ? 'وائی فائی ہاٹ سپاٹ صارفین، واؤچرز، پیکجز اور لائیو سیشنز کا انتظام'
                : 'Configure Hotspot users, bulk pin vouchers, speed profiles, and active sessions'}
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
            onClick={onOpenVouchers}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-amber-600 hover:bg-amber-500 text-white text-xs font-medium transition shadow-sm"
          >
            <Ticket className="w-4 h-4" />
            <span>{isUrdu ? 'واؤچرز جنریٹ کریں' : 'Batch Vouchers'}</span>
          </button>

          <button
            onClick={onAddUser}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-medium transition shadow-sm"
          >
            <Plus className="w-4 h-4" />
            <span>{isUrdu ? '+ نیا یوزر' : '+ Add User'}</span>
          </button>
        </div>
      </div>

      {/* Sub tabs row */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-2 text-xs">
        <button
          onClick={() => setSubTab('users')}
          className={`px-3 py-1.5 rounded-lg font-medium transition flex items-center gap-1.5 ${
            subTab === 'users'
              ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
          }`}
        >
          <span>{isUrdu ? 'صارفین کی فہرست' : 'Hotspot Users'}</span>
          <span className="bg-slate-800 px-1.5 py-0.2 rounded-full text-[10px]">
            {users.length}
          </span>
        </button>

        <button
          onClick={() => setSubTab('active')}
          className={`px-3 py-1.5 rounded-lg font-medium transition flex items-center gap-1.5 ${
            subTab === 'active'
              ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
          }`}
        >
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
          <span>{isUrdu ? 'لائیو آن لائن کلائنٹس' : 'Active Sessions'}</span>
          <span className="bg-emerald-950 text-emerald-300 px-1.5 py-0.2 rounded-full text-[10px] border border-emerald-800">
            {activeSessions.length}
          </span>
        </button>

        <button
          onClick={() => setSubTab('profiles')}
          className={`px-3 py-1.5 rounded-lg font-medium transition flex items-center gap-1.5 ${
            subTab === 'profiles'
              ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
          }`}
        >
          <span>{isUrdu ? 'یوزر پروفائلز / سپیڈ' : 'User Profiles'}</span>
          <span className="bg-slate-800 px-1.5 py-0.2 rounded-full text-[10px]">
            {profiles.length}
          </span>
        </button>
      </div>

      {/* VIEW 1: HOTSPOT USERS LIST */}
      {subTab === 'users' && (
        <div className="space-y-4">
          {/* Search and filter toolbar */}
          <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
            <div className="relative w-full sm:w-72">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder={isUrdu ? 'یوزر، میک یا کمنٹ تلاش کریں...' : 'Search username, MAC, comment...'}
                className="w-full bg-slate-900 border border-slate-800 rounded-lg pl-9 pr-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500"
              />
            </div>

            <div className="flex items-center gap-2 self-start sm:self-auto text-xs">
              <span className="text-slate-400 flex items-center gap-1">
                <Filter className="w-3.5 h-3.5" />
                {isUrdu ? 'پروفائل:' : 'Profile:'}
              </span>
              <select
                value={profileFilter}
                onChange={(e) => setProfileFilter(e.target.value)}
                className="bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
              >
                <option value="all">{isUrdu ? 'تمام پروفائلز' : 'All Profiles'}</option>
                {profiles.map(p => (
                  <option key={p.id} value={p.name}>{p.name} ({p.rateLimit})</option>
                ))}
              </select>
            </div>
          </div>

          {/* Table Container */}
          <div className="bg-slate-900 rounded-xl border border-slate-800 overflow-hidden shadow">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-950/60 border-b border-slate-800 text-slate-400 uppercase tracking-wider font-mono text-[11px]">
                  <tr>
                    <th className="py-3 px-4">{isUrdu ? 'صارف کا نام (Username)' : 'Username'}</th>
                    <th className="py-3 px-4">{isUrdu ? 'پاس ورڈ' : 'Password'}</th>
                    <th className="py-3 px-4">{isUrdu ? 'پیکج / پروفائل' : 'Profile'}</th>
                    <th className="py-3 px-4">{isUrdu ? 'ٹائم و ڈیٹا لمٹ' : 'Limits'}</th>
                    <th className="py-3 px-4">{isUrdu ? 'میک ایڈریس' : 'MAC Binding'}</th>
                    <th className="py-3 px-4">{isUrdu ? 'کمنٹ / تفصیل' : 'Comment'}</th>
                    <th className="py-3 px-4">{isUrdu ? 'حالت' : 'Status'}</th>
                    <th className="py-3 px-4 text-right">{isUrdu ? 'ایکشن' : 'Actions'}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {filteredUsers.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="py-8 text-center text-slate-500">
                        {isUrdu ? 'کوئی ہاٹ سپاٹ یوزر نہیں ملا۔' : 'No Hotspot users found.'}
                      </td>
                    </tr>
                  ) : (
                    filteredUsers.map((user) => {
                      const isVisible = showPasswords[user.id];
                      return (
                        <tr key={user.id} className="hover:bg-slate-800/40 transition">
                          <td className="py-3 px-4">
                            <div className="font-semibold text-slate-200 font-mono flex items-center gap-1.5">
                              <span>{user.name}</span>
                              {user.comment?.toLowerCase().includes('voucher') && (
                                <span className="bg-amber-950/70 text-amber-400 text-[10px] px-1.5 py-0.2 rounded border border-amber-800/60">
                                  PIN
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="py-3 px-4 font-mono">
                            <div className="flex items-center gap-1.5 text-slate-300">
                              <span>{isVisible ? (user.password || '<empty>') : '••••••'}</span>
                              <button
                                onClick={() => togglePasswordVisibility(user.id)}
                                className="text-slate-500 hover:text-slate-300 transition"
                                title={isVisible ? 'Hide Password' : 'Show Password'}
                              >
                                {isVisible ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                              </button>
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <span className="px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-800/70 font-mono text-[11px]">
                              {user.profile}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-slate-300">
                            <div className="space-y-0.5 font-mono text-[11px]">
                              {user.uptimeLimit && (
                                <div className="text-slate-300">Time: {user.uptimeLimit}</div>
                              )}
                              {user.bytesLimit && (
                                <div className="text-amber-400">Data: {formatBytes(Number(user.bytesLimit))}</div>
                              )}
                              {!user.uptimeLimit && !user.bytesLimit && (
                                <span className="text-slate-500">Unlimited</span>
                              )}
                            </div>
                          </td>
                          <td className="py-3 px-4 font-mono text-slate-400">
                            {user.macAddress || <span className="text-slate-600">Any MAC</span>}
                          </td>
                          <td className="py-3 px-4 text-slate-300 text-xs">
                            {user.comment || '-'}
                          </td>
                          <td className="py-3 px-4">
                            {user.disabled ? (
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
                                onClick={() => onToggleUser(user.id, user.disabled)}
                                className={`p-1.5 rounded transition ${
                                  user.disabled
                                    ? 'bg-emerald-900/40 text-emerald-300 hover:bg-emerald-800'
                                    : 'bg-amber-900/40 text-amber-300 hover:bg-amber-800'
                                }`}
                                title={user.disabled ? 'Enable User' : 'Disable User'}
                              >
                                <Power className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => onDeleteUser(user.id, user.name)}
                                className="p-1.5 rounded bg-red-900/30 text-red-400 hover:bg-red-800/60 transition"
                                title="Delete User"
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

      {/* VIEW 2: ACTIVE SESSIONS */}
      {subTab === 'active' && (
        <div className="space-y-4">
          <div className="bg-slate-900 rounded-xl border border-slate-800 overflow-hidden shadow">
            <div className="p-4 bg-slate-950/50 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs text-slate-300">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
                <span>{isUrdu ? 'اس وقت آن لائن کنیکٹڈ ڈیوائسز' : 'Currently Connected Live Devices'}</span>
              </div>
              <span className="text-xs text-slate-400">Total: {activeSessions.length}</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-950/60 border-b border-slate-800 text-slate-400 uppercase tracking-wider font-mono text-[11px]">
                  <tr>
                    <th className="py-3 px-4">{isUrdu ? 'یوزر' : 'User'}</th>
                    <th className="py-3 px-4">{isUrdu ? 'آئی پی ایڈریس' : 'IP Address'}</th>
                    <th className="py-3 px-4">{isUrdu ? 'میک ایڈریس' : 'MAC Address'}</th>
                    <th className="py-3 px-4">{isUrdu ? 'سیشن اپ ٹائم' : 'Uptime'}</th>
                    <th className="py-3 px-4">{isUrdu ? 'ڈاؤن لوڈ / اپلوڈ' : 'Traffic (Down/Up)'}</th>
                    <th className="py-3 px-4">{isUrdu ? 'لاگ ان کا طریقہ' : 'Login By'}</th>
                    <th className="py-3 px-4 text-right">{isUrdu ? 'ڈس کنیکٹ' : 'Action'}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {activeSessions.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-8 text-center text-slate-500">
                        {isUrdu ? 'اس وقت کوئی ہاٹ سپاٹ یوزر آن لائن نہیں ہے۔' : 'No active Hotspot sessions right now.'}
                      </td>
                    </tr>
                  ) : (
                    activeSessions.map((session) => (
                      <tr key={session.id} className="hover:bg-slate-800/40 transition">
                        <td className="py-3 px-4 font-mono font-semibold text-cyan-300">
                          {session.user}
                        </td>
                        <td className="py-3 px-4 font-mono text-slate-200">
                          {session.address}
                        </td>
                        <td className="py-3 px-4 font-mono text-slate-400">
                          {session.macAddress}
                        </td>
                        <td className="py-3 px-4 font-mono text-slate-300 flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5 text-slate-500" />
                          <span>{session.uptime}</span>
                        </td>
                        <td className="py-3 px-4 font-mono text-xs">
                          <div className="flex items-center gap-3">
                            <span className="text-emerald-400 flex items-center gap-1">
                              <Download className="w-3 h-3" />
                              {formatBytes(session.bytesOut)}
                            </span>
                            <span className="text-cyan-400 flex items-center gap-1">
                              <Upload className="w-3 h-3" />
                              {formatBytes(session.bytesIn)}
                            </span>
                          </div>
                        </td>
                        <td className="py-3 px-4 text-slate-400 font-mono text-[11px]">
                          {session.loginBy || 'http-chap'}
                        </td>
                        <td className="py-3 px-4 text-right">
                          <button
                            onClick={() => onDisconnectSession(session.id, session.user)}
                            className="px-2.5 py-1 rounded bg-red-950 text-red-300 hover:bg-red-900 border border-red-800/80 transition text-xs flex items-center gap-1 ml-auto"
                            title="Kick Session"
                          >
                            <XCircle className="w-3.5 h-3.5" />
                            <span>{isUrdu ? 'کک کریں' : 'Kick'}</span>
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

      {/* VIEW 3: PROFILES */}
      {subTab === 'profiles' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {profiles.map((p) => (
            <div key={p.id} className="bg-slate-900 p-4 rounded-xl border border-slate-800 shadow space-y-3">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
                <h3 className="font-bold text-white text-sm font-mono">{p.name}</h3>
                <span className="bg-cyan-950 text-cyan-400 border border-cyan-800 px-2 py-0.5 rounded text-xs font-mono font-bold">
                  {p.rateLimit}
                </span>
              </div>
              <div className="space-y-1.5 text-xs text-slate-300">
                <div className="flex justify-between">
                  <span className="text-slate-400">{isUrdu ? 'شیئرڈ یوزرز:' : 'Shared Users:'}</span>
                  <span className="font-mono">{p.sharedUsers} device(s)</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">{isUrdu ? 'سیشن ٹائم آؤٹ:' : 'Session Timeout:'}</span>
                  <span className="font-mono">{p.sessionTimeout}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">{isUrdu ? 'اسٹیٹس آٹو ریفریش:' : 'Status Refresh:'}</span>
                  <span className="font-mono">{p.statusAutorefresh}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
