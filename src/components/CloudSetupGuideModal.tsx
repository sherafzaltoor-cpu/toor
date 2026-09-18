import React, { useState } from 'react';
import { 
  X, 
  Terminal, 
  Copy, 
  CheckCircle2, 
  ShieldCheck, 
  Cloud, 
  Globe, 
  ExternalLink,
  ChevronRight,
  HelpCircle,
  Zap,
  Info,
  Server,
  Layers
} from 'lucide-react';
import { Language } from '../types';
import { generateMikrotikTerminalScript, generateMikrotikV6TerminalScript } from '../data/mockMikrotikData';

interface CloudSetupGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenConnectModal: () => void;
  lang: Language;
}

export const CloudSetupGuideModal: React.FC<CloudSetupGuideModalProps> = ({
  isOpen,
  onClose,
  onOpenConnectModal,
  lang
}) => {
  const isUrdu = lang === 'ur';
  const [copied, setCopied] = useState(false);
  const [activeStep, setActiveStep] = useState(1);
  const [versionTab, setVersionTab] = useState<'v6' | 'v7' | 'vps'>('v6');
  const [apiUser, setApiUser] = useState('admin');
  const [apiPass, setApiPass] = useState('admin');
  const [apiPort, setApiPort] = useState(8728);

  if (!isOpen) return null;

  const scriptV6 = generateMikrotikV6TerminalScript({
    username: apiUser,
    password: apiPass,
    apiPort: 8728
  });

  const scriptV7 = generateMikrotikTerminalScript({
    username: apiUser,
    password: apiPass,
    port: 443
  });

  const currentScript = versionTab === 'v6' ? scriptV6 : scriptV7;

  const handleCopy = () => {
    navigator.clipboard.writeText(currentScript);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-700 w-full max-w-3xl rounded-2xl shadow-2xl overflow-hidden my-6">
        {/* Modal Header */}
        <div className="px-6 py-4 bg-slate-950/70 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-500/15 text-indigo-400 rounded-lg border border-indigo-500/30">
              <Cloud className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">
                {isUrdu 
                  ? 'مائیکروٹک RB750Gr3 آؤٹ آف سٹی کلاؤڈ و VPS سیٹ اپ' 
                  : 'MikroTik RB750Gr3 Out-of-City Cloud & VPS Guide'}
              </h3>
              <p className="text-xs text-slate-400">
                {isUrdu
                  ? 'RouterOS Version 6 یا Cloud VPS کے ذریعے راؤٹر دنیا کے کسی بھی شہر سے کھولیں'
                  : 'How to remotely manage your MikroTik hEX via RouterOS v6 & Cloud VPS'}
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

        {/* Modal Body */}
        <div className="p-6 space-y-5 max-h-[75vh] overflow-y-auto text-xs">
          {/* Version Switcher */}
          <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
            <span className="text-slate-400 font-medium mr-1">Select Architecture:</span>
            <button
              onClick={() => {
                setVersionTab('v6');
                setApiPort(8728);
              }}
              className={`px-3 py-1.5 rounded-lg font-bold transition flex items-center gap-1.5 ${
                versionTab === 'v6'
                  ? 'bg-indigo-600 text-white shadow'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              <span>RouterOS Version 6 (v6.49)</span>
            </button>

            <button
              onClick={() => {
                setVersionTab('vps');
              }}
              className={`px-3 py-1.5 rounded-lg font-bold transition flex items-center gap-1.5 ${
                versionTab === 'vps'
                  ? 'bg-purple-600 text-white shadow'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              <Server className="w-3.5 h-3.5" />
              <span>Cloud VPS Tunnel (CGNAT Bypass)</span>
            </button>

            <button
              onClick={() => {
                setVersionTab('v7');
                setApiPort(443);
              }}
              className={`px-3 py-1.5 rounded-lg font-bold transition flex items-center gap-1.5 ${
                versionTab === 'v7'
                  ? 'bg-cyan-600 text-white shadow'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              <span>RouterOS v7 (REST API)</span>
            </button>
          </div>

          {/* VPS Info Box */}
          {versionTab === 'vps' ? (
            <div className="space-y-4">
              <div className="bg-purple-950/40 border border-purple-800/60 rounded-xl p-4 text-xs text-slate-300 space-y-2">
                <div className="flex items-center gap-2 text-purple-300 font-bold">
                  <Server className="w-4 h-4" />
                  <span>{isUrdu ? 'Cloud VPS کی ضرورت کیوں پیش آتی ہے؟' : 'Why use a Cloud VPS with RouterOS v6?'}</span>
                </div>
                <p className="leading-relaxed">
                  {isUrdu 
                    ? 'پاکستان کے زیادہ تر انٹرنیٹ سروس پرووائیڈرز (PTCL, StormFiber, Nayatel یا لوکل کیبل آپریٹرز) اپنے کسٹمرز کو Carrier-Grade NAT (CGNAT) کی پرائیویٹ آئی پی (100.64.x.x یا 10.x.x.x) دیتے ہیں۔ اس وجہ سے باہر کے شہر سے راؤٹر براہ راست نہیں کھلتا۔'
                    : 'Most ISPs put customer connections behind Carrier-Grade NAT (CGNAT) with private IPs, blocking incoming connection attempts from outside your local city.'}
                </p>
                <p className="leading-relaxed">
                  {isUrdu
                    ? 'جب آپ 3 سے 5 ڈالر ماہانہ کا Cloud VPS (جیسے DigitalOcean یا Hetzner) استعمال کرتے ہیں، تو آپ کا RB750Gr3 راؤٹر خود باہر VPS سے SSTP VPN ٹنل بنا لیتا ہے۔ پھر آپ دنیا کے کسی بھی کونے میں بیٹھ کر اپنے VPS کی پبلک آئی پی کے ذریعے راؤٹر کا WinBox اور یہ ویب پینل کھول سکتے ہیں۔'
                    : 'With a Cloud VPS, your MikroTik initiates an outbound SSTP tunnel to your VPS dedicated public IP. All WinBox and API traffic routes straight through the tunnel with zero blocked ports.'}
                </p>
              </div>

              <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-3">
                <h4 className="font-bold text-white text-sm">
                  {isUrdu ? 'کلاؤڈ VPS سیٹ اپ کے آسان 3 اقدامات:' : '3 Simple Steps to Connect via Cloud VPS:'}
                </h4>
                <ol className="list-decimal list-inside space-y-2 text-slate-300">
                  <li>
                    <strong>Ubuntu / Debian VPS</strong> پر لاگ ان کریں اور ہمارے پینل کے <em>"Cloud VPS Tunnel"</em> ٹیب سے 1-Click اسکرپٹ چلائیں۔
                  </li>
                  <li>
                    WinBox میں جا کر <em>"MikroTik v6 Script"</em> پیسٹ کریں۔ راؤٹر سیکنڈز میں VPS سے جڑ جائے گا۔
                  </li>
                  <li>
                    اب آپ کہیں بھی ہوں، WinBox میں <strong>YOUR_VPS_IP:8291</strong> لکھیں یا اس پینل میں VPS IP ڈالیں!
                  </li>
                </ol>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Explanation Alert */}
              <div className="bg-indigo-950/40 border border-indigo-800/60 rounded-xl p-4 text-xs text-slate-300 flex gap-3">
                <Info className="w-5 h-5 text-indigo-400 shrink-0 mt-0.5" />
                <div className="space-y-1 leading-relaxed">
                  <p className="font-semibold text-indigo-200">
                    {versionTab === 'v6' ? 'RouterOS Version 6 Setup Info' : 'RouterOS Version 7 Setup Info'}
                  </p>
                  <p className="text-slate-300">
                    {versionTab === 'v6'
                      ? (isUrdu
                          ? 'RouterOS v6 میں API پورٹ 8728 پر چلتی ہے اور DDNS کمانڈ "/ip cloud set ddns-enabled=yes" استعمال ہوتی ہے۔ نیچے دیا گیا اسکرپٹ خاص طور پر RouterOS v6 کے لیے تیار کیا گیا ہے۔'
                          : 'RouterOS v6 natively communicates via API on port 8728 and Webfig on port 80/443. The script below configures RouterOS v6 services, firewall rules, and cloud DDNS.')
                      : (isUrdu
                          ? 'RouterOS v7 میں REST API اور Web SSL پورٹ 443 پر چلتی ہے۔'
                          : 'RouterOS v7 serves REST API natively over port 443 with HTTPS.')}
                  </p>
                </div>
              </div>

              {/* Step 1: Script Generator */}
              <div className="space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-400 mb-1 font-medium">API Username:</label>
                    <input
                      type="text"
                      value={apiUser}
                      onChange={(e) => setApiUser(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-slate-200 font-mono text-xs focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-400 mb-1 font-medium">API Password:</label>
                    <input
                      type="text"
                      value={apiPass}
                      onChange={(e) => setApiPass(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-slate-200 font-mono text-xs focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-200 flex items-center gap-1.5">
                      <Terminal className="w-4 h-4 text-cyan-400" />
                      {versionTab === 'v6' ? 'RouterOS v6 WinBox Terminal Script:' : 'RouterOS v7 Terminal Script:'}
                    </span>
                    <button
                      onClick={handleCopy}
                      className="px-3 py-1 rounded bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-xs flex items-center gap-1 transition"
                    >
                      {copied ? <CheckCircle2 className="w-3.5 h-3.5 text-white" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copied ? 'Copied!' : 'Copy Script'}</span>
                    </button>
                  </div>
                  <pre className="p-3.5 bg-slate-950 rounded-lg border border-slate-800 text-cyan-300 font-mono text-xs overflow-x-auto leading-relaxed max-h-56 select-all">
                    {currentScript}
                  </pre>
                </div>
              </div>
            </div>
          )}

          {/* Footer CTA */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t border-slate-800">
            <div className="text-[11px] text-slate-400">
              {isUrdu 
                ? 'اسکرپٹ رن کرنے کے بعد "راؤٹر کنکشن سیٹنگز" میں اپنی آئی پی درج کریں'
                : 'After running the script, configure your IP in Connection Settings'}
            </div>
            <button
              onClick={() => {
                onClose();
                onOpenConnectModal();
              }}
              className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-xs flex items-center gap-1.5 shadow transition self-stretch sm:self-auto justify-center"
            >
              <span>{isUrdu ? 'کنکشن سیٹنگز کھولیں' : 'Open Connection Settings'}</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
