import React from 'react';
import { 
  Server, 
  Wifi, 
  Network, 
  BookOpen, 
  Cpu, 
  Radio, 
  Settings2, 
  Globe2, 
  ShieldCheck, 
  CheckCircle2,
  AlertCircle,
  Layers,
  LogOut,
  UserCheck
} from 'lucide-react';
import { ActiveTab, Language, RouterConnectionConfig, RouterStatus } from '../types';

interface HeaderProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  status: RouterStatus;
  config: RouterConnectionConfig;
  onOpenConnectModal: () => void;
  lang: Language;
  setLang: (lang: Language) => void;
  currentUser?: string;
  onLogout?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  status,
  config,
  onOpenConnectModal,
  lang,
  setLang,
  currentUser = 'admin',
  onLogout
}) => {
  const isUrdu = lang === 'ur';

  return (
    <header className="border-b border-slate-800 bg-slate-900/90 backdrop-blur sticky top-0 z-30">
      {/* Top micro-bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2 flex flex-wrap items-center justify-between gap-3 text-xs border-b border-slate-800/60 text-slate-400">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 font-medium text-slate-300">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span>MikroTik RouterBOARD</span>
            <span className="bg-cyan-950 text-cyan-400 px-2 py-0.5 rounded border border-cyan-800/70 font-mono font-bold">
              hEX RB750Gr3
            </span>
          </div>

          <div className="hidden sm:flex items-center gap-2 text-slate-400">
            <span>•</span>
            <span className="px-1.5 py-0.2 rounded bg-indigo-950 text-indigo-300 border border-indigo-800 font-semibold text-[10px]">
              {config.routerOsVersion === 'v6' ? 'RouterOS v6.49' : 'RouterOS v7'}
            </span>
            <span>•</span>
            <span className="font-mono text-slate-300">
              {config.simulate ? (
                <span className="text-amber-400 bg-amber-950/60 border border-amber-800/60 px-1.5 py-0.2 rounded text-[11px]">
                  {isUrdu ? 'سمولیٹر موڈ (ریڈی فار ٹیسٹ)' : 'Simulator Mode'}
                </span>
              ) : (
                <span className="text-emerald-400 font-mono">
                  {config.connectionMethod === 'cloud-vps' ? (config.vpsConfig?.vpsIp || config.host) : config.host}
                </span>
              )}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Quick Hardware load metrics */}
          <div className="hidden md:flex items-center gap-3 bg-slate-950/80 px-2.5 py-1 rounded-md border border-slate-800 font-mono text-[11px]">
            <div className="flex items-center gap-1.5">
              <Cpu className="w-3.5 h-3.5 text-cyan-400" />
              <span>CPU:</span>
              <span className={`font-semibold ${status.cpuLoad > 60 ? 'text-amber-400' : 'text-slate-200'}`}>
                {status.cpuLoad}%
              </span>
            </div>
            <span className="text-slate-700">|</span>
            <div>
              <span className="text-slate-400">RAM: </span>
              <span className="text-slate-200">{status.freeMemory || '198MB'} free</span>
            </div>
            <span className="text-slate-700">|</span>
            <div>
              <span className="text-slate-400">Uptime: </span>
              <span className="text-slate-200">{status.uptime}</span>
            </div>
          </div>

          {/* Language Toggle */}
          <button
            onClick={() => setLang(isUrdu ? 'en' : 'ur')}
            className="flex items-center gap-1 px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors border border-slate-700"
            title="Switch Language (اردو / Roman Urdu / English)"
          >
            <Globe2 className="w-3.5 h-3.5 text-cyan-400" />
            <span className="font-medium">{isUrdu ? 'English' : 'Roman Urdu'}</span>
          </button>

          {/* Router Connect Settings */}
          <button
            onClick={onOpenConnectModal}
            className="flex items-center gap-1.5 px-3 py-1 rounded-md bg-cyan-600 hover:bg-cyan-500 text-white font-medium transition shadow-sm"
          >
            <Settings2 className="w-3.5 h-3.5" />
            <span>{isUrdu ? 'راؤٹر کنکشن' : 'Router Settings'}</span>
          </button>

          {/* Admin User Badge & Logout */}
          <div className="flex items-center gap-1.5 pl-2 border-l border-slate-800">
            <div className="hidden sm:flex items-center gap-1 px-2 py-0.5 rounded bg-slate-950 border border-slate-800 font-mono text-[11px] text-cyan-300">
              <UserCheck className="w-3 h-3 text-cyan-400" />
              <span>{currentUser}</span>
            </div>
            {onLogout && (
              <button
                onClick={onLogout}
                className="flex items-center gap-1 px-2.5 py-1 rounded bg-red-950/60 hover:bg-red-900/80 text-red-300 hover:text-white transition border border-red-800/60 text-xs"
                title={isUrdu ? 'پینل سے لاگ آؤٹ کریں' : 'Log out of Admin Panel'}
              >
                <LogOut className="w-3.5 h-3.5 text-red-400" />
                <span className="hidden sm:inline">{isUrdu ? 'لاگ آؤٹ' : 'Logout'}</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Main navigation row */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full overflow-hidden border border-amber-400/90 shadow-lg ring-2 ring-amber-500/20 shrink-0">
              <img 
                src="/toor-net-badge.jpg" 
                alt="TOOR NET" 
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            </div>
            <div>
              <h1 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
                TOOR NET PANEL
                <span className="text-[10px] font-normal uppercase tracking-wider px-1.5 py-0.5 bg-amber-950/80 text-amber-300 border border-amber-800 rounded">
                  MikroTik Cloud
                </span>
              </h1>
              <p className="text-xs text-slate-400">
                {isUrdu 
                  ? 'آؤٹ آف سٹی ہاٹ سپاٹ اور PPPoE کنٹرول پینل (RB750Gr3)' 
                  : 'Remote Hotspot & PPPoE Cloud Control for RB750Gr3'}
              </p>
            </div>
          </div>

          {/* Nav Tabs */}
          <nav className="flex items-center gap-1 sm:gap-2">
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs sm:text-sm font-medium transition-all ${
                activeTab === 'dashboard'
                  ? 'bg-cyan-500/15 text-cyan-400 border border-cyan-500/30'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              <Server className="w-4 h-4" />
              <span>{isUrdu ? 'ڈیش بورڈ' : 'Dashboard'}</span>
            </button>

            <button
              onClick={() => setActiveTab('hotspot')}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs sm:text-sm font-medium transition-all ${
                activeTab === 'hotspot'
                  ? 'bg-cyan-500/15 text-cyan-400 border border-cyan-500/30'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              <Wifi className="w-4 h-4" />
              <span>{isUrdu ? 'ہاٹ سپاٹ (Hotspot)' : 'Hotspot'}</span>
              <span className="ml-1 text-[11px] bg-slate-800 text-slate-300 px-1.5 py-0.2 rounded-full">
                {status.hotspotCount || 0}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('pppoe')}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs sm:text-sm font-medium transition-all ${
                activeTab === 'pppoe'
                  ? 'bg-cyan-500/15 text-cyan-400 border border-cyan-500/30'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              <Network className="w-4 h-4" />
              <span>{isUrdu ? 'پی پی پی او ای (PPPoE)' : 'PPPoE'}</span>
              <span className="ml-1 text-[11px] bg-slate-800 text-slate-300 px-1.5 py-0.2 rounded-full">
                {status.pppoeCount || 0}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('vps-tunnel')}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs sm:text-sm font-medium transition-all ${
                activeTab === 'vps-tunnel'
                  ? 'bg-indigo-500/15 text-indigo-300 border border-indigo-500/30'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              <Layers className="w-4 h-4 text-indigo-400" />
              <span>{isUrdu ? 'کلاؤڈ VPS ٹنل (v6)' : 'Cloud VPS (v6)'}</span>
              <span className="ml-1 text-[9px] bg-indigo-950 text-indigo-300 border border-indigo-800 px-1 rounded uppercase font-bold">
                Online
              </span>
            </button>

            <button
              onClick={() => setActiveTab('cloud-guide')}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs sm:text-sm font-medium transition-all ${
                activeTab === 'cloud-guide'
                  ? 'bg-cyan-500/15 text-cyan-400 border border-cyan-500/30'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              <BookOpen className="w-4 h-4 text-emerald-400" />
              <span className="text-emerald-400 font-semibold">{isUrdu ? 'آؤٹ آف سٹی سیٹ اپ' : 'Out-of-City Guide'}</span>
            </button>
          </nav>
        </div>
      </div>
    </header>
  );
};
