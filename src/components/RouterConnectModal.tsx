import React, { useState } from 'react';
import { 
  X, 
  Settings2, 
  CheckCircle2, 
  AlertCircle, 
  RefreshCw, 
  ShieldCheck, 
  Cloud, 
  Radio, 
  Server,
  Layers,
  HelpCircle 
} from 'lucide-react';
import { Language, RouterConnectionConfig, RouterStatus, VpsTunnelConfig } from '../types';

interface RouterConnectModalProps {
  isOpen: boolean;
  onClose: () => void;
  config: RouterConnectionConfig;
  onSaveConfig: (newConfig: RouterConnectionConfig) => void;
  onTestConnection: (config: RouterConnectionConfig) => Promise<{ success: boolean; message: string; details?: any }>;
  lang: Language;
}

export const RouterConnectModal: React.FC<RouterConnectModalProps> = ({
  isOpen,
  onClose,
  config,
  onSaveConfig,
  onTestConnection,
  lang
}) => {
  const isUrdu = lang === 'ur';

  const [routerOsVersion, setRouterOsVersion] = useState<'v6' | 'v7'>(config.routerOsVersion || 'v6');
  const [connectionMethod, setConnectionMethod] = useState<'cloud-vps' | 'mikrotik-ddns' | 'direct'>(
    config.connectionMethod || 'cloud-vps'
  );

  const [host, setHost] = useState(config.host || '482c6a9bee10.sn.mynetwork.net');
  const [port, setPort] = useState(config.port || (routerOsVersion === 'v6' ? 8728 : 443));
  const [useSsl, setUseSsl] = useState(config.useSsl ?? (routerOsVersion === 'v7'));
  const [username, setUsername] = useState(config.username || 'admin');
  const [password, setPassword] = useState(config.password || '7780');
  const [simulate, setSimulate] = useState(config.simulate ?? true);

  // VPS Tunnel settings
  const [vpsIp, setVpsIp] = useState(config.vpsConfig?.vpsIp || '142.93.120.45');
  const [forwardedApiPort, setForwardedApiPort] = useState(config.vpsConfig?.forwardedApiPort || 8728);

  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string; details?: any } | null>(null);

  if (!isOpen) return null;

  const handleVersionChange = (newVer: 'v6' | 'v7') => {
    setRouterOsVersion(newVer);
    if (newVer === 'v6') {
      setPort(8728);
      setUseSsl(false);
    } else {
      setPort(443);
      setUseSsl(true);
    }
  };

  const getEffectiveConfig = (): RouterConnectionConfig => ({
    host: connectionMethod === 'cloud-vps' ? vpsIp.trim() : host.trim(),
    port: connectionMethod === 'cloud-vps' ? Number(forwardedApiPort) : Number(port),
    useSsl,
    username: username.trim(),
    password: password.trim(),
    simulate,
    routerOsVersion,
    connectionMethod,
    vpsConfig: {
      vpsIp: vpsIp.trim(),
      tunnelType: config.vpsConfig?.tunnelType || 'sstp',
      tunnelUser: config.vpsConfig?.tunnelUser || 'mikrotik_gr3',
      tunnelPass: config.vpsConfig?.tunnelPass || 'VpsSecurePass2026',
      vpsTunnelPort: config.vpsConfig?.vpsTunnelPort || 443,
      forwardedApiPort: Number(forwardedApiPort),
      forwardedWinboxPort: config.vpsConfig?.forwardedWinboxPort || 8291,
      forwardedWebPort: config.vpsConfig?.forwardedWebPort || 8080,
      routerTunnelIp: config.vpsConfig?.routerTunnelIp || '10.8.0.2',
      vpsGatewayIp: config.vpsConfig?.vpsGatewayIp || '10.8.0.1',
      isConnected: true
    }
  });

  const handleTest = async () => {
    setTesting(true);
    setTestResult(null);
    try {
      const result = await onTestConnection(getEffectiveConfig());
      setTestResult(result);
    } catch (err: any) {
      setTestResult({
        success: false,
        message: err.message || 'Connection failed'
      });
    } finally {
      setTesting(false);
    }
  };

  const handleSave = () => {
    onSaveConfig(getEffectiveConfig());
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-700 w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden my-6">
        {/* Header */}
        <div className="px-6 py-4 bg-slate-950/70 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-500/15 text-indigo-400 rounded-lg border border-indigo-500/30">
              <Settings2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">
                {isUrdu ? 'مائیکروٹک کنکشن سیٹنگز (v6 / v7)' : 'MikroTik Connection Settings'}
              </h3>
              <p className="text-xs text-slate-400">
                {isUrdu
                  ? 'RouterOS Version 6 یا Cloud VPS کے ذریعے آن لائن کنیکٹ کریں'
                  : 'Configure RouterOS v6 / v7 connection & Cloud VPS Tunnel'}
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

        {/* Body */}
        <div className="p-6 space-y-4 text-xs">
          {/* Simulator Toggle Box */}
          <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
            <div className="space-y-0.5">
              <span className="font-semibold text-slate-200 block">
                {isUrdu ? 'سمولیٹر موڈ (ٹیسٹنگ موڈ)' : 'Simulator Demo Mode'}
              </span>
              <span className="text-[11px] text-slate-400">
                {isUrdu
                  ? 'اگر راؤٹر ابھی آن لائن نہیں، تو اس موڈ میں تمام فیچرز ٹیسٹ کر سکتے ہیں'
                  : 'Test all features with full simulated RB750Gr3 hardware state'}
              </span>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={simulate}
                onChange={(e) => setSimulate(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-cyan-600"></div>
            </label>
          </div>

          {/* RouterOS Version Selector */}
          <div>
            <label className="block text-slate-400 mb-1.5 font-medium">
              {isUrdu ? 'آپ کے راؤٹر کا RouterOS ورژن:' : 'MikroTik RouterOS Version:'}
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => handleVersionChange('v6')}
                className={`p-2.5 rounded-lg border text-left transition flex items-center gap-2.5 ${
                  routerOsVersion === 'v6'
                    ? 'bg-indigo-950/60 border-indigo-500 text-white'
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                }`}
              >
                <div className={`w-3 h-3 rounded-full border ${routerOsVersion === 'v6' ? 'bg-indigo-500 border-indigo-400' : 'border-slate-600'}`}></div>
                <div>
                  <div className="font-bold text-xs">RouterOS v6</div>
                  <div className="text-[10px] text-slate-400">v6.48 / v6.49 (Port 8728)</div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => handleVersionChange('v7')}
                className={`p-2.5 rounded-lg border text-left transition flex items-center gap-2.5 ${
                  routerOsVersion === 'v7'
                    ? 'bg-indigo-950/60 border-indigo-500 text-white'
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                }`}
              >
                <div className={`w-3 h-3 rounded-full border ${routerOsVersion === 'v7' ? 'bg-indigo-500 border-indigo-400' : 'border-slate-600'}`}></div>
                <div>
                  <div className="font-bold text-xs">RouterOS v7</div>
                  <div className="text-[10px] text-slate-400">v7.1+ REST API (Port 443)</div>
                </div>
              </button>
            </div>
          </div>

          {/* Connection Method Selector */}
          <div>
            <label className="block text-slate-400 mb-1.5 font-medium">
              {isUrdu ? 'کنکشن کا طریقہ کار (Out-of-City Method):' : 'Out-of-City Connection Method:'}
            </label>
            <div className="space-y-1.5">
              <label
                onClick={() => setConnectionMethod('cloud-vps')}
                className={`flex items-start gap-2.5 p-2.5 rounded-lg border cursor-pointer transition ${
                  connectionMethod === 'cloud-vps'
                    ? 'bg-indigo-950/50 border-indigo-500/80 text-slate-200'
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                }`}
              >
                <input
                  type="radio"
                  name="connMethod"
                  checked={connectionMethod === 'cloud-vps'}
                  onChange={() => setConnectionMethod('cloud-vps')}
                  className="mt-0.5 text-indigo-600 focus:ring-0"
                />
                <div>
                  <span className="font-bold text-white block">
                    {isUrdu ? 'Cloud VPS ٹنل (CGNAT بائی پاس - بہترین برائے v6)' : 'Cloud VPS Tunnel (Bypasses CGNAT - Best for v6)'}
                  </span>
                  <span className="text-[10px] text-slate-400">
                    {isUrdu
                      ? 'جب راؤٹر پر پبلک آئی پی نہ ہو، تو Cloud VPS کی پبلک آئی پی پر ٹنل کے ذریعے رابطہ ہوتا ہے'
                      : 'Router dials out to Cloud VPS; access via VPS public IP without needing a static IP'}
                  </span>
                </div>
              </label>

              <label
                onClick={() => setConnectionMethod('mikrotik-ddns')}
                className={`flex items-start gap-2.5 p-2.5 rounded-lg border cursor-pointer transition ${
                  connectionMethod === 'mikrotik-ddns'
                    ? 'bg-indigo-950/50 border-indigo-500/80 text-slate-200'
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                }`}
              >
                <input
                  type="radio"
                  name="connMethod"
                  checked={connectionMethod === 'mikrotik-ddns'}
                  onChange={() => setConnectionMethod('mikrotik-ddns')}
                  className="mt-0.5 text-indigo-600 focus:ring-0"
                />
                <div>
                  <span className="font-bold text-white block">
                    {isUrdu ? 'MikroTik IP Cloud DDNS (*.sn.mynetwork.net)' : 'MikroTik IP Cloud DDNS (*.sn.mynetwork.net)'}
                  </span>
                  <span className="text-[10px] text-slate-400">
                    {isUrdu ? 'اگر راؤٹر پر براہ راست پبلک آئی پی آتی ہے' : 'Direct connection if your ISP provides a public WAN IP'}
                  </span>
                </div>
              </label>
            </div>
          </div>

          {/* Conditional Host Inputs */}
          {connectionMethod === 'cloud-vps' ? (
            <div className="p-3 bg-slate-950 rounded-xl border border-indigo-900/60 space-y-3">
              <div className="flex items-center gap-1.5 text-indigo-300 font-semibold text-[11px]">
                <Server className="w-3.5 h-3.5" />
                <span>Cloud VPS Connection Details:</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2">
                  <label className="block text-slate-400 mb-1 text-[11px]">VPS Public IP:</label>
                  <input
                    type="text"
                    value={vpsIp}
                    onChange={(e) => setVpsIp(e.target.value)}
                    placeholder="e.g. 142.93.120.45"
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-cyan-300 font-mono text-xs focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1 text-[11px]">Forwarded Port:</label>
                  <input
                    type="number"
                    value={forwardedApiPort}
                    onChange={(e) => setForwardedApiPort(Number(e.target.value))}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-slate-200 font-mono text-xs focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>
            </div>
          ) : (
            <div>
              <label className="block text-slate-400 mb-1 font-medium">
                {isUrdu ? 'مائیکروٹک کلاؤڈ DDNS یا آئی پی:' : 'MikroTik Cloud DNS / IP Address:'}
              </label>
              <input
                type="text"
                value={host}
                onChange={(e) => setHost(e.target.value)}
                placeholder="e.g. 482c6a9bee10.sn.mynetwork.net"
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-cyan-300 font-mono text-xs focus:outline-none focus:border-indigo-500"
              />
              <div className="grid grid-cols-2 gap-3 mt-2">
                <div>
                  <label className="block text-slate-400 mb-1 text-[11px]">API Port:</label>
                  <input
                    type="number"
                    value={port}
                    onChange={(e) => setPort(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-slate-200 font-mono text-xs focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div className="flex items-center pt-4">
                  <label className="flex items-center gap-1.5 cursor-pointer text-slate-300 text-xs">
                    <input
                      type="checkbox"
                      checked={useSsl}
                      onChange={(e) => setUseSsl(e.target.checked)}
                      className="rounded bg-slate-950 border-slate-700 text-indigo-500 focus:ring-0"
                    />
                    <span>SSL (HTTPS)</span>
                  </label>
                </div>
              </div>
            </div>
          )}

          {/* Router Credentials */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-400 mb-1 font-medium">Router API Username:</label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-slate-200 font-mono text-xs focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-slate-400 mb-1 font-medium">Router API Password:</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-slate-200 font-mono text-xs focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          {/* Test Status Feedback */}
          {testResult && (
            <div
              className={`p-3 rounded-xl border text-xs flex items-start gap-2.5 ${
                testResult.success
                  ? 'bg-emerald-950/40 border-emerald-800/80 text-emerald-300'
                  : 'bg-red-950/40 border-red-800/80 text-red-300'
              }`}
            >
              {testResult.success ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              ) : (
                <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
              )}
              <div className="space-y-0.5">
                <p className="font-semibold">{testResult.message}</p>
                {testResult.details && (
                  <p className="text-[11px] opacity-80">
                    Model: {testResult.details.model} | Version: {testResult.details.version} | CPU: {testResult.details.cpuLoad}%
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center justify-between pt-3 border-t border-slate-800">
            <button
              type="button"
              disabled={testing}
              onClick={handleTest}
              className="px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 transition text-xs flex items-center gap-1.5 border border-slate-700"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${testing ? 'animate-spin' : ''}`} />
              <span>{testing ? 'Checking...' : (isUrdu ? 'کنکشن ٹیسٹ کریں' : 'Test Connection')}</span>
            </button>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition text-xs"
              >
                {isUrdu ? 'بند کریں' : 'Close'}
              </button>
              <button
                type="button"
                onClick={handleSave}
                className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-medium transition text-xs shadow"
              >
                {isUrdu ? 'محفوظ کریں' : 'Save & Connect'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
