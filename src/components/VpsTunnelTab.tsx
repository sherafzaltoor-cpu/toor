import React, { useState } from 'react';
import { 
  Server, 
  Terminal, 
  Copy, 
  CheckCircle2, 
  ShieldCheck, 
  Globe, 
  ExternalLink, 
  Zap, 
  ArrowRight, 
  RefreshCw, 
  Check, 
  Key, 
  Activity, 
  Layers,
  HelpCircle,
  Network
} from 'lucide-react';
import { Language, VpsTunnelConfig } from '../types';
import { 
  generateVpsLinuxSetupScript, 
  generateVpsTunnelMikrotikScript 
} from '../data/mockMikrotikData';

interface VpsTunnelTabProps {
  vpsConfig: VpsTunnelConfig;
  onUpdateVpsConfig: (newConfig: VpsTunnelConfig) => void;
  lang: Language;
}

export const VpsTunnelTab: React.FC<VpsTunnelTabProps> = ({
  vpsConfig,
  onUpdateVpsConfig,
  lang
}) => {
  const isUrdu = lang === 'ur';

  const [vpsIp, setVpsIp] = useState(vpsConfig.vpsIp || '142.93.120.45');
  const [tunnelType, setTunnelType] = useState<'sstp' | 'l2tp' | 'ovpn'>(vpsConfig.tunnelType || 'sstp');
  const [tunnelUser, setTunnelUser] = useState(vpsConfig.tunnelUser || 'mikrotik_gr3');
  const [tunnelPass, setTunnelPass] = useState(vpsConfig.tunnelPass || 'VpsSecurePass2026');
  const [vpsTunnelPort, setVpsTunnelPort] = useState(vpsConfig.vpsTunnelPort || 443);
  const [forwardedApiPort, setForwardedApiPort] = useState(vpsConfig.forwardedApiPort || 8728);
  const [forwardedWinboxPort, setForwardedWinboxPort] = useState(vpsConfig.forwardedWinboxPort || 8291);
  const [forwardedWebPort, setForwardedWebPort] = useState(vpsConfig.forwardedWebPort || 8080);
  const [routerTunnelIp, setRouterTunnelIp] = useState(vpsConfig.routerTunnelIp || '10.8.0.2');
  const [vpsGatewayIp, setVpsGatewayIp] = useState(vpsConfig.vpsGatewayIp || '10.8.0.1');

  const [activeSubTab, setActiveSubTab] = useState<'overview' | 'mikrotik-script' | 'vps-script'>('overview');
  const [copiedMikrotik, setCopiedMikrotik] = useState(false);
  const [copiedLinux, setCopiedLinux] = useState(false);
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<any>(null);

  const currentConfig: VpsTunnelConfig = {
    vpsIp: vpsIp.trim(),
    tunnelType,
    tunnelUser: tunnelUser.trim(),
    tunnelPass: tunnelPass.trim(),
    vpsTunnelPort: Number(vpsTunnelPort),
    forwardedApiPort: Number(forwardedApiPort),
    forwardedWinboxPort: Number(forwardedWinboxPort),
    forwardedWebPort: Number(forwardedWebPort),
    routerTunnelIp: routerTunnelIp.trim(),
    vpsGatewayIp: vpsGatewayIp.trim(),
    isConnected: true
  };

  const mikrotikScript = generateVpsTunnelMikrotikScript(currentConfig);
  const linuxScript = generateVpsLinuxSetupScript(currentConfig);

  const handleSave = () => {
    onUpdateVpsConfig(currentConfig);
  };

  const handleCopyMikrotik = () => {
    navigator.clipboard.writeText(mikrotikScript);
    setCopiedMikrotik(true);
    setTimeout(() => setCopiedMikrotik(false), 2000);
  };

  const handleCopyLinux = () => {
    navigator.clipboard.writeText(linuxScript);
    setCopiedLinux(true);
    setTimeout(() => setCopiedLinux(false), 2000);
  };

  const handleTestTunnel = async () => {
    setTesting(true);
    setTestResult(null);
    try {
      const res = await fetch('/api/mikrotik/vps/test-tunnel', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ vpsConfig: currentConfig })
      });
      const data = await res.json();
      setTestResult(data);
    } catch (e: any) {
      setTestResult({ success: false, message: e.message || 'VPS connection failed' });
    } finally {
      setTesting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner: RouterOS v6 + Cloud VPS Architecture */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950/40 to-slate-900 rounded-xl p-5 border border-indigo-800/40 shadow-lg">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="p-2.5 rounded-lg bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
              <Server className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-white">
                  {isUrdu ? 'کلاؤڈ VPS ٹنل برائے RouterOS v6' : 'Cloud VPS Tunnel for RouterOS v6'}
                </h2>
                <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping"></span>
                  {isUrdu ? 'v6 بائی پاس آن لائن' : 'v6 CGNAT Bypass Ready'}
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-1 max-w-2xl leading-relaxed">
                {isUrdu
                  ? 'RouterOS Version 6 میں CGNAT بائی پاس کرنے کا بہترین طریقہ یہ ہے کہ راؤٹر Cloud VPS (ڈیجیٹل اوشن، ہٹزنر یا لوکل VPS) سے SSTP VPN کے ذریعے کنیکٹ ہو جائے۔ اس طرح آپ کا راؤٹر بغیر اسٹیٹک آئی پی کے دنیا کے کسی بھی شہر سے آن لائن اوپن ہوگا۔'
                  : 'On RouterOS Version 6, connecting your RB750Gr3 to a Cloud VPS via SSTP VPN bypasses ISP CGNAT without a costly static IP, enabling full out-of-city access to WinBox, Hotspot, and PPPoE.'}
              </p>
              
              <div className="mt-3 flex flex-wrap items-center gap-3 text-xs">
                <div className="flex items-center gap-1.5 text-slate-300 font-mono bg-slate-950 px-2.5 py-1 rounded border border-slate-800">
                  <span className="text-indigo-400">VPS Public IP:</span>
                  <span className="text-white font-bold">{vpsIp}</span>
                </div>
                <div className="flex items-center gap-1.5 text-slate-300 font-mono bg-slate-950 px-2.5 py-1 rounded border border-slate-800">
                  <span className="text-cyan-400">API Port:</span>
                  <span>{forwardedApiPort}</span>
                </div>
                <div className="flex items-center gap-1.5 text-slate-300 font-mono bg-slate-950 px-2.5 py-1 rounded border border-slate-800">
                  <span className="text-emerald-400">WinBox Remote:</span>
                  <span>{vpsIp}:{forwardedWinboxPort}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 self-start md:self-center">
            <button
              onClick={handleTestTunnel}
              disabled={testing}
              className="px-3.5 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-xs flex items-center gap-1.5 shadow transition"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${testing ? 'animate-spin' : ''}`} />
              <span>{testing ? 'Testing...' : (isUrdu ? 'ٹنل ٹیسٹ کریں' : 'Test VPS Tunnel')}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-2 text-xs">
        <button
          onClick={() => setActiveSubTab('overview')}
          className={`px-3 py-1.5 rounded-lg font-medium transition flex items-center gap-1.5 ${
            activeSubTab === 'overview'
              ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/40'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
          }`}
        >
          <Server className="w-3.5 h-3.5" />
          <span>{isUrdu ? 'VPS سیٹنگز و پورٹ فارورڈنگ' : 'VPS Config & Ports'}</span>
        </button>

        <button
          onClick={() => setActiveSubTab('mikrotik-script')}
          className={`px-3 py-1.5 rounded-lg font-medium transition flex items-center gap-1.5 ${
            activeSubTab === 'mikrotik-script'
              ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/40'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
          }`}
        >
          <Terminal className="w-3.5 h-3.5 text-cyan-400" />
          <span>{isUrdu ? 'MikroTik v6 کلائنٹ اسکرپٹ' : 'MikroTik v6 Script'}</span>
        </button>

        <button
          onClick={() => setActiveSubTab('vps-script')}
          className={`px-3 py-1.5 rounded-lg font-medium transition flex items-center gap-1.5 ${
            activeSubTab === 'vps-script'
              ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/40'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
          }`}
        >
          <Terminal className="w-3.5 h-3.5 text-emerald-400" />
          <span>{isUrdu ? 'Linux VPS سرور سیٹ اپ اسکرپٹ' : 'Linux VPS Setup (1-Click)'}</span>
        </button>
      </div>

      {/* Test feedback */}
      {testResult && (
        <div className="p-4 rounded-xl bg-slate-900 border border-indigo-800/60 shadow text-xs space-y-2">
          <div className="flex items-center gap-2 text-emerald-400 font-bold">
            <CheckCircle2 className="w-4 h-4" />
            <span>{testResult.message}</span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-slate-300 font-mono text-[11px] pt-1 border-t border-slate-800">
            <div>VPS IP: <span className="text-white">{testResult.vpsIp}</span></div>
            <div>Tunnel IP: <span className="text-cyan-300">{testResult.routerTunnelIp}</span></div>
            <div>Latency: <span className="text-emerald-400">{testResult.latency}</span></div>
            <div>WinBox Remote: <span className="text-indigo-300">{testResult.vpsIp}:{testResult.forwardedPorts?.winbox}</span></div>
          </div>
        </div>
      )}

      {/* SUB-TAB 1: VPS OVERVIEW & CONFIGURATION */}
      {activeSubTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-slate-900 rounded-xl p-5 border border-slate-800 shadow space-y-4">
            <div className="border-b border-slate-800 pb-3">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Server className="w-4 h-4 text-indigo-400" />
                <span>{isUrdu ? 'کلاؤڈ VPS ٹنل پیرامیٹرز' : 'Cloud VPS Tunnel Parameters'}</span>
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                {isUrdu 
                  ? 'اپنے Cloud VPS کی پبلک آئی پی اور ٹنل کریڈینشلز درج کریں' 
                  : 'Enter your Cloud VPS Public IP and tunnel credentials'}
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block text-slate-400 mb-1 font-medium">Cloud VPS Public IP *:</label>
                <input
                  type="text"
                  value={vpsIp}
                  onChange={(e) => setVpsIp(e.target.value)}
                  placeholder="e.g. 142.93.120.45"
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-cyan-300 font-mono text-xs focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1 font-medium">Tunnel Type (RouterOS v6):</label>
                <select
                  value={tunnelType}
                  onChange={(e: any) => setTunnelType(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-slate-200 text-xs focus:outline-none focus:border-indigo-500"
                >
                  <option value="sstp">SSTP (Recommended for v6 - TCP 443)</option>
                  <option value="l2tp">L2TP / IPsec</option>
                  <option value="ovpn">OpenVPN (TCP)</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-400 mb-1 font-medium">Tunnel Username:</label>
                <input
                  type="text"
                  value={tunnelUser}
                  onChange={(e) => setTunnelUser(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-slate-200 font-mono text-xs focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1 font-medium">Tunnel Password:</label>
                <input
                  type="text"
                  value={tunnelPass}
                  onChange={(e) => setTunnelPass(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-slate-200 font-mono text-xs focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>

            <div className="border-t border-slate-800 pt-3">
              <h4 className="text-xs font-semibold text-slate-300 mb-2">
                {isUrdu ? 'فارورڈ شدہ پورٹس (Port Forwarding):' : 'Forwarded Inbound Ports on VPS:'}
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs font-mono">
                <div>
                  <label className="block text-slate-400 mb-1 text-[11px]">API Port (Forwarded):</label>
                  <input
                    type="number"
                    value={forwardedApiPort}
                    onChange={(e) => setForwardedApiPort(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-slate-200 text-xs focus:outline-none focus:border-indigo-500"
                  />
                  <span className="text-[10px] text-slate-500">RouterOS v6 API (8728)</span>
                </div>

                <div>
                  <label className="block text-slate-400 mb-1 text-[11px]">Winbox Remote Port:</label>
                  <input
                    type="number"
                    value={forwardedWinboxPort}
                    onChange={(e) => setForwardedWinboxPort(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-slate-200 text-xs focus:outline-none focus:border-indigo-500"
                  />
                  <span className="text-[10px] text-slate-500">Connect in WinBox: {vpsIp}:{forwardedWinboxPort}</span>
                </div>

                <div>
                  <label className="block text-slate-400 mb-1 text-[11px]">WebFig Port:</label>
                  <input
                    type="number"
                    value={forwardedWebPort}
                    onChange={(e) => setForwardedWebPort(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-slate-200 text-xs focus:outline-none focus:border-indigo-500"
                  />
                  <span className="text-[10px] text-slate-500">Browser access</span>
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-3 border-t border-slate-800">
              <button
                onClick={handleSave}
                className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-xs flex items-center gap-1.5 transition shadow"
              >
                <Check className="w-4 h-4" />
                <span>{isUrdu ? 'سیٹنگز محفوظ کریں' : 'Save & Update VPS Config'}</span>
              </button>
            </div>
          </div>

          {/* Quick Guide & How It Works */}
          <div className="bg-slate-900 rounded-xl p-5 border border-slate-800 shadow space-y-4 text-xs">
            <h3 className="font-bold text-white text-sm border-b border-slate-800 pb-3 flex items-center gap-2">
              <Zap className="w-4 h-4 text-amber-400" />
              <span>{isUrdu ? 'RouterOS v6 میں کلاؤڈ VPS کیوں؟' : 'Why Cloud VPS for v6?'}</span>
            </h3>

            <div className="space-y-3 text-slate-300 leading-relaxed">
              <div className="p-3 bg-slate-950 rounded-lg border border-slate-800">
                <span className="font-semibold text-white block mb-1">1. CGNAT کا مکمل خاتمہ</span>
                <p className="text-[11px] text-slate-400">
                  {isUrdu 
                    ? 'پاکستان میں انٹرنیٹ فراہم کرنے والے راؤٹر کو پرائیویٹ آئی پی دیتے ہیں۔ VPS ٹنل کے ذریعے راؤٹر خود باہر رابطہ کرتا ہے، اس لیے کوئی آئی پی بلاک نہیں ہو سکتی۔' 
                    : 'Bypasses carrier-grade NAT by making the router dial outbound to your VPS.'}
                </p>
              </div>

              <div className="p-3 bg-slate-950 rounded-lg border border-slate-800">
                <span className="font-semibold text-white block mb-1">2. ون باکس کسی بھی شہر سے</span>
                <p className="text-[11px] text-slate-400">
                  {isUrdu 
                    ? `آپ کسی بھی لیپ ٹاپ پر WinBox کھول کر "${vpsIp}:${forwardedWinboxPort}" لکھیں اور اپنا راؤٹر فورا کھل جائے گا۔`
                    : `Open WinBox anywhere, connect to ${vpsIp}:${forwardedWinboxPort} directly.`}
                </p>
              </div>

              <div className="p-3 bg-slate-950 rounded-lg border border-slate-800">
                <span className="font-semibold text-white block mb-1">3. ہاٹ سپاٹ اور PPPoE کنٹرول</span>
                <p className="text-[11px] text-slate-400">
                  {isUrdu
                    ? 'یہ کلاؤڈ پینل اسی VPS آئی پی پر راؤٹر سے بات کر کے سیکنڈز میں ہاٹ سپاٹ اور PPPoE یوزرز اپڈیٹ کر دیتا ہے۔'
                    : 'This Web Panel communicates through the VPS port forward to manage Hotspot and PPPoE secrets.'}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SUB-TAB 2: MIKROTIK ROUTEROS V6 SCRIPT */}
      {activeSubTab === 'mikrotik-script' && (
        <div className="space-y-4">
          <div className="bg-slate-900 p-5 rounded-xl border border-slate-800 shadow space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
              <div>
                <h3 className="font-bold text-white text-sm flex items-center gap-2">
                  <Terminal className="w-4 h-4 text-cyan-400" />
                  <span>{isUrdu ? 'مائیکروٹک RB750Gr3 (RouterOS v6) ون باکس کمانڈ' : 'MikroTik RB750Gr3 v6 Terminal Script'}</span>
                </h3>
                <p className="text-xs text-slate-400">
                  {isUrdu 
                    ? 'اس اسکرپٹ کو کاپی کر کے Winbox -> New Terminal میں پیسٹ کریں تاکہ راؤٹر VPS سے کنیکٹ ہو جائے' 
                    : 'Paste this in WinBox -> New Terminal to connect your router to the Cloud VPS'}
                </p>
              </div>
              <button
                onClick={handleCopyMikrotik}
                className="px-3.5 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-medium text-xs flex items-center gap-1.5 transition shadow self-start sm:self-auto"
              >
                {copiedMikrotik ? <CheckCircle2 className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedMikrotik ? 'Copied!' : 'Copy Script'}</span>
              </button>
            </div>

            <pre className="p-4 bg-slate-950 rounded-lg border border-slate-800 text-cyan-300 font-mono text-xs overflow-x-auto leading-relaxed select-all">
              {mikrotikScript}
            </pre>
          </div>
        </div>
      )}

      {/* SUB-TAB 3: LINUX CLOUD VPS SERVER SCRIPT */}
      {activeSubTab === 'vps-script' && (
        <div className="space-y-4">
          <div className="bg-slate-900 p-5 rounded-xl border border-slate-800 shadow space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
              <div>
                <h3 className="font-bold text-white text-sm flex items-center gap-2">
                  <Terminal className="w-4 h-4 text-emerald-400" />
                  <span>{isUrdu ? 'لینکس کلاؤڈ VPS سیٹ اپ اسکرپٹ (Ubuntu / Debian)' : 'Linux Cloud VPS Auto-Install Script'}</span>
                </h3>
                <p className="text-xs text-slate-400">
                  {isUrdu 
                    ? 'اپنے Cloud VPS میں SSH کے ذریعے لاگ ان ہوں اور یہ کمانڈ چلائیں۔ یہ SSTP اور پورٹ فارورڈنگ خود سیٹ کر دے گی۔' 
                    : 'Run this once on your Ubuntu/Debian Cloud VPS as root to configure SSTP & iptables NAT'}
                </p>
              </div>
              <button
                onClick={handleCopyLinux}
                className="px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-xs flex items-center gap-1.5 transition shadow self-start sm:self-auto"
              >
                {copiedLinux ? <CheckCircle2 className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedLinux ? 'Copied!' : 'Copy Script'}</span>
              </button>
            </div>

            <pre className="p-4 bg-slate-950 rounded-lg border border-slate-800 text-emerald-400 font-mono text-xs overflow-x-auto leading-relaxed select-all max-h-96">
              {linuxScript}
            </pre>
          </div>
        </div>
      )}
    </div>
  );
};
