import React, { useState, useId } from 'react';
import { 
  X, 
  Zap, 
  Layers, 
  HelpCircle, 
  Copy, 
  CheckCircle2, 
  Terminal, 
  ArrowUpRight, 
  ArrowDownLeft, 
  Gauge, 
  ShieldCheck,
  Plus
} from 'lucide-react';
import { Language, PppoeProfile } from '../types';
import { buildMikrotikRateLimit } from '../data/mockMikrotikData';

interface NewPppoeProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddProfile: (profile: PppoeProfile) => void;
  lang: Language;
}

export const NewPppoeProfileModal: React.FC<NewPppoeProfileModalProps> = ({
  isOpen,
  onClose,
  onAddProfile,
  lang
}) => {
  const isUrdu = lang === 'ur';

  const [name, setName] = useState('12M-Turbo-Burst');
  const [rxNormal, setRxNormal] = useState('12M');
  const [txNormal, setTxNormal] = useState('12M');
  
  // Burst configuration
  const [enableBurst, setEnableBurst] = useState(true);
  const [rxBurst, setRxBurst] = useState('22M');
  const [txBurst, setTxBurst] = useState('22M');
  const [rxThreshold, setRxThreshold] = useState('9M');
  const [txThreshold, setTxThreshold] = useState('9M');
  const [burstTime, setBurstTime] = useState('16s');
  const [priority, setPriority] = useState(8);

  // Address Pools & DNS
  const [localAddressPool, setLocalAddressPool] = useState('10.10.10.1');
  const [remoteAddressPool, setRemoteAddressPool] = useState('pppoe-pool-1');
  const [dnsServers, setDnsServers] = useState('8.8.8.8, 1.1.1.1');

  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const rateLimit = `${rxNormal}/${txNormal}`;
  const burstLimit = enableBurst ? `${rxBurst}/${txBurst}` : '';
  const burstThreshold = enableBurst ? `${rxThreshold}/${txThreshold}` : '';
  const burstTimeFull = enableBurst ? `${burstTime}/${burstTime}` : '';

  const fullMikrotikRateLimit = enableBurst
    ? buildMikrotikRateLimit({
        rateLimit,
        burstLimit,
        burstThreshold,
        burstTime: burstTimeFull,
        burstPriority: priority
      })
    : rateLimit;

  const terminalCommand = `/ppp profile add name="${name.trim()}" rate-limit="${fullMikrotikRateLimit}" local-address="${localAddressPool}" remote-address="${remoteAddressPool}" dns-server="${dnsServers}"`;

  const handleCopyCommand = () => {
    navigator.clipboard.writeText(terminalCommand);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleApplyPreset = (presetMultiplier: number) => {
    const num = parseInt(rxNormal.replace(/[^0-9]/g, ''), 10) || 10;
    const burstVal = Math.round(num * presetMultiplier);
    const threshVal = Math.round(num * 0.75);

    setRxBurst(`${burstVal}M`);
    setTxBurst(`${burstVal}M`);
    setRxThreshold(`${threshVal}M`);
    setTxThreshold(`${threshVal}M`);
    setEnableBurst(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const newProfile: PppoeProfile = {
      id: `pp-${Date.now().toString(36)}`,
      name: name.trim(),
      rateLimit,
      burstLimit: enableBurst ? burstLimit : undefined,
      burstThreshold: enableBurst ? burstThreshold : undefined,
      burstTime: enableBurst ? burstTimeFull : undefined,
      burstPriority: enableBurst ? priority : undefined,
      localAddressPool: localAddressPool.trim(),
      remoteAddressPool: remoteAddressPool.trim(),
      dnsServers: dnsServers.trim()
    };

    onAddProfile(newProfile);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-700 w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden my-6">
        {/* Header */}
        <div className="px-6 py-4 bg-slate-950/70 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-amber-500/15 text-amber-400 rounded-lg border border-amber-500/30">
              <Zap className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                {isUrdu ? 'نیا PPPoE پروفائل اور برسٹ (Burst Speed) بنائیں' : 'Create PPPoE Profile with MikroTik Burst'}
              </h3>
              <p className="text-xs text-slate-400">
                {isUrdu
                  ? 'برسٹ سپیڈ سے کلائنٹس کے ویب پیجز اور ویڈیوز بغیر بفرنگ فوری کھلتی ہیں'
                  : 'Configure standard bandwidth, peak burst limits, threshold, and time window'}
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

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5 text-xs max-h-[80vh] overflow-y-auto">
          {/* Profile Name & Base Speeds */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-slate-400 mb-1 font-medium">
                {isUrdu ? 'پروفائل کا نام *:' : 'Profile Name *:'}
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. 15M-Turbo-Burst"
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-slate-200 font-mono text-xs focus:outline-none focus:border-amber-500"
              />
            </div>

            <div>
              <label className="block text-slate-400 mb-1 font-medium">
                {isUrdu ? 'نارمل ڈاؤن لوڈ (Rx Rate):' : 'Normal Download (Rx):'}
              </label>
              <input
                type="text"
                required
                value={rxNormal}
                onChange={(e) => setRxNormal(e.target.value)}
                placeholder="e.g. 10M"
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-cyan-300 font-mono text-xs focus:outline-none focus:border-amber-500"
              />
            </div>

            <div>
              <label className="block text-slate-400 mb-1 font-medium">
                {isUrdu ? 'نارمل اپلوڈ (Tx Rate):' : 'Normal Upload (Tx):'}
              </label>
              <input
                type="text"
                required
                value={txNormal}
                onChange={(e) => setTxNormal(e.target.value)}
                placeholder="e.g. 10M"
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-cyan-300 font-mono text-xs focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>

          {/* Burst Engine Box */}
          <div className="p-4 rounded-xl bg-amber-950/20 border border-amber-800/50 space-y-4">
            <div className="flex items-center justify-between border-b border-amber-800/40 pb-3">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-md bg-amber-500/20 text-amber-400">
                  <Zap className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-bold text-amber-200 text-xs">
                    {isUrdu ? 'مائیکروٹک برسٹ سپیڈ (MikroTik Burst Engine)' : 'MikroTik Burst Rate-Limit'}
                  </h4>
                  <span className="text-[11px] text-amber-300/80">
                    {isUrdu
                      ? 'جب کلائنٹ براؤزنگ شروع کرے تو چند سیکنڈ کیلئے زیادہ سپیڈ ملتی ہے'
                      : 'Give subscribers temporary peak speeds during initial clicks & buffering'}
                  </span>
                </div>
              </div>

              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={enableBurst}
                  onChange={(e) => setEnableBurst(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-600"></div>
              </label>
            </div>

            {enableBurst && (
              <div className="space-y-4">
                {/* Quick Presets */}
                <div className="flex items-center gap-2">
                  <span className="text-slate-400 text-[11px]">{isUrdu ? 'تیار شدہ برسٹ پریسیٹ:' : 'Quick Presets:'}</span>
                  <button
                    type="button"
                    onClick={() => handleApplyPreset(1.5)}
                    className="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-amber-300 border border-amber-800/60 text-[11px]"
                  >
                    1.5x Speed
                  </button>
                  <button
                    type="button"
                    onClick={() => handleApplyPreset(2.0)}
                    className="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-amber-300 border border-amber-800/60 text-[11px]"
                  >
                    2x (Double Speed)
                  </button>
                  <button
                    type="button"
                    onClick={() => handleApplyPreset(2.5)}
                    className="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-amber-300 border border-amber-800/60 text-[11px]"
                  >
                    2.5x Turbo
                  </button>
                </div>

                {/* Burst Inputs */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* Burst Limit */}
                  <div className="p-3 bg-slate-950 rounded-lg border border-slate-800 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-slate-200">
                        {isUrdu ? 'برسٹ کی زیادہ سے زیادہ سپیڈ (Burst Limit)' : 'Burst Limit (Peak Speed)'}
                      </span>
                      <span className="text-[10px] text-amber-400 font-mono">Max Peak</span>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="text-[10px] text-slate-400 block mb-0.5">Burst Download:</label>
                        <input
                          type="text"
                          value={rxBurst}
                          onChange={(e) => setRxBurst(e.target.value)}
                          placeholder="e.g. 20M"
                          className="w-full bg-slate-900 border border-slate-700 rounded px-2.5 py-1.5 text-amber-300 font-mono text-xs focus:outline-none focus:border-amber-500"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] text-slate-400 block mb-0.5">Burst Upload:</label>
                        <input
                          type="text"
                          value={txBurst}
                          onChange={(e) => setTxBurst(e.target.value)}
                          placeholder="e.g. 20M"
                          className="w-full bg-slate-900 border border-slate-700 rounded px-2.5 py-1.5 text-amber-300 font-mono text-xs focus:outline-none focus:border-amber-500"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Burst Threshold */}
                  <div className="p-3 bg-slate-950 rounded-lg border border-slate-800 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-slate-200">
                        {isUrdu ? 'برسٹ تھریش ہولڈ (Burst Threshold)' : 'Burst Threshold'}
                      </span>
                      <span className="text-[10px] text-slate-400 font-mono">Trigger Point</span>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="text-[10px] text-slate-400 block mb-0.5">Threshold Rx:</label>
                        <input
                          type="text"
                          value={rxThreshold}
                          onChange={(e) => setRxThreshold(e.target.value)}
                          placeholder="e.g. 8M"
                          className="w-full bg-slate-900 border border-slate-700 rounded px-2.5 py-1.5 text-slate-300 font-mono text-xs focus:outline-none focus:border-amber-500"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] text-slate-400 block mb-0.5">Threshold Tx:</label>
                        <input
                          type="text"
                          value={txThreshold}
                          onChange={(e) => setTxThreshold(e.target.value)}
                          placeholder="e.g. 8M"
                          className="w-full bg-slate-900 border border-slate-700 rounded px-2.5 py-1.5 text-slate-300 font-mono text-xs focus:outline-none focus:border-amber-500"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Burst Time & Priority */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-400 mb-1 font-medium">
                      {isUrdu ? 'برسٹ ٹائم دورانیہ (Burst Time):' : 'Burst Time Window:'}
                    </label>
                    <select
                      value={burstTime}
                      onChange={(e) => setBurstTime(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-slate-200 text-xs focus:outline-none focus:border-amber-500"
                    >
                      <option value="8s">8 Seconds (Fast snappy clicks)</option>
                      <option value="16s">16 Seconds (Recommended for general browsing)</option>
                      <option value="24s">24 Seconds (Smooth video start)</option>
                      <option value="32s">32 Seconds (Extended boost)</option>
                      <option value="60s">60 Seconds (Long burst)</option>
                    </select>
                    <span className="text-[10px] text-slate-500 mt-1 block">
                      {isUrdu
                        ? 'یہ وہ وقت ہے جس دوران مائیکروٹک اوسط سپیڈ ناپتا ہے'
                        : 'Duration used by RouterOS to calculate moving average data rate'}
                    </span>
                  </div>

                  <div>
                    <label className="block text-slate-400 mb-1 font-medium">
                      {isUrdu ? 'کیو ترجیح (Queue Priority):' : 'Queue Priority (1-8):'}
                    </label>
                    <select
                      value={priority}
                      onChange={(e) => setPriority(Number(e.target.value))}
                      className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-slate-200 text-xs focus:outline-none focus:border-amber-500"
                    >
                      <option value={8}>Priority 8 (Standard Best-effort)</option>
                      <option value={7}>Priority 7 (Medium-High)</option>
                      <option value={6}>Priority 6 (High - VIP & Gamers)</option>
                      <option value={5}>Priority 5 (Highest for PPPoE)</option>
                    </select>
                  </div>
                </div>

                {/* Explanation Card */}
                <div className="p-3 bg-slate-950 rounded-lg border border-amber-900/40 text-[11px] text-slate-300 leading-relaxed space-y-1">
                  <div className="font-semibold text-amber-300 flex items-center gap-1.5">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>{isUrdu ? 'یہ برسٹ کیسے کام کرے گا؟' : 'How this Burst behaves in MikroTik:'}</span>
                  </div>
                  <p>
                    {isUrdu
                      ? `کسٹمر کو ابتدائی ${burstTime} کیلئے ${rxBurst} کی تیز ترین سپیڈ ملے گی جس سے یوٹیوب اور ویب سائٹس فوراً کھلیں گی۔ اگر وہ مسلسل ٹورینٹ یا بڑی فائل ڈاؤن لوڈ کرے گا، تو خود بخود ریٹ لِمٹ نارمل ${rxNormal} پر آ جائے گی۔`
                      : `Subscriber immediately enjoys initial ${rxBurst} peak download bursts for ultra-responsive browsing. Once continuous transfer saturates beyond ${rxThreshold} for ${burstTime}, MikroTik gracefully limits to the steady-state ${rxNormal}.`}
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* IP Pools & DNS */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-slate-400 mb-1 font-medium">Local Address:</label>
              <input
                type="text"
                value={localAddressPool}
                onChange={(e) => setLocalAddressPool(e.target.value)}
                placeholder="10.10.10.1"
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-slate-200 font-mono text-xs focus:outline-none focus:border-amber-500"
              />
            </div>

            <div>
              <label className="block text-slate-400 mb-1 font-medium">Remote Pool:</label>
              <input
                type="text"
                value={remoteAddressPool}
                onChange={(e) => setRemoteAddressPool(e.target.value)}
                placeholder="pppoe-pool-1"
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-slate-200 font-mono text-xs focus:outline-none focus:border-amber-500"
              />
            </div>

            <div>
              <label className="block text-slate-400 mb-1 font-medium">DNS Servers:</label>
              <input
                type="text"
                value={dnsServers}
                onChange={(e) => setDnsServers(e.target.value)}
                placeholder="8.8.8.8, 1.1.1.1"
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-slate-200 font-mono text-xs focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>

          {/* RouterOS Generated Command */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-slate-300 flex items-center gap-1.5 text-[11px]">
                <Terminal className="w-3.5 h-3.5 text-cyan-400" />
                <span>RouterOS Command String:</span>
              </span>
              <button
                type="button"
                onClick={handleCopyCommand}
                className="px-2.5 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-cyan-300 border border-slate-700 text-[11px] flex items-center gap-1"
              >
                {copied ? <CheckCircle2 className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                <span>{copied ? 'Copied' : 'Copy'}</span>
              </button>
            </div>
            <code className="block p-2.5 bg-slate-950 rounded-lg border border-slate-800 text-cyan-300 font-mono text-[11px] break-all select-all">
              {terminalCommand}
            </code>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition text-xs"
            >
              {isUrdu ? 'کینسل' : 'Cancel'}
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-lg bg-amber-600 hover:bg-amber-500 text-white font-medium transition text-xs shadow flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>{isUrdu ? 'پروفائل محفوظ کریں' : 'Save Profile with Burst'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
