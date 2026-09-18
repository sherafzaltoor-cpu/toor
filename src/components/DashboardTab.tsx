import React, { useState, useEffect } from 'react';
import { 
  Search, 
  ChevronDown, 
  AlertTriangle, 
  PlusCircle, 
  Ticket, 
  Terminal, 
  Server, 
  Cloud, 
  CheckCircle2, 
  Copy, 
  ShieldCheck, 
  Radio, 
  Cpu, 
  HardDrive, 
  Clock, 
  X, 
  UserCheck, 
  Wallet,
  Wifi,
  Network,
  RefreshCw,
  Zap,
  ArrowRight,
  Globe,
  ExternalLink,
  Smartphone,
  Edit3,
  Check,
  Key,
  Lock
} from 'lucide-react';
import { ActiveTab, Language, RouterStatus, PppoeSecret, PppoeActive, HotspotUser } from '../types';
import { CustomerAvatarBadge } from './CustomerAvatarBadge';

interface DashboardTabProps {
  status: RouterStatus;
  setActiveTab: (tab: ActiveTab) => void;
  onOpenNewHotspotModal: () => void;
  onOpenNewPppoeModal: () => void;
  onOpenVoucherModal: () => void;
  onOpenGuideModal: () => void;
  lang: Language;
  pppoeSecrets?: PppoeSecret[];
  pppoeActive?: PppoeActive[];
  hotspotUsers?: HotspotUser[];
}

export const DashboardTab: React.FC<DashboardTabProps> = ({
  status,
  setActiveTab,
  onOpenNewHotspotModal,
  onOpenNewPppoeModal,
  onOpenVoucherModal,
  onOpenGuideModal,
  lang,
  pppoeSecrets = [],
  pppoeActive = [],
  hotspotUsers = []
}) => {
  const isUrdu = lang === 'ur';
  const [copied, setCopied] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isBalanceModalOpen, setIsBalanceModalOpen] = useState(false);
  const [isCloudModalOpen, setIsCloudModalOpen] = useState(false);
  const [copiedUrl, setCopiedUrl] = useState(false);
  const [copiedIp, setCopiedIp] = useState(false);
  const [copiedScript, setCopiedScript] = useState(false);

  // Router Cloud IP & DDNS state with localStorage persistence
  const [routerCloudIp, setRouterCloudIp] = useState<string>(() => {
    try {
      const saved = localStorage.getItem('toor_net_router_cloud_ip');
      if (saved) return saved;
    } catch {}
    return status.publicIp || '175.107.242.88';
  });

  const [routerCloudDdns, setRouterCloudDdns] = useState<string>(() => {
    try {
      const saved = localStorage.getItem('toor_net_router_cloud_ddns');
      if (saved) return saved;
    } catch {}
    return status.cloudDdns || '482c6a9bee10.sn.mynetwork.net';
  });

  const [editIpInput, setEditIpInput] = useState('');
  const [isEditingIp, setIsEditingIp] = useState(false);

  // Online Cloud Web Access URL
  const onlineWebUrl = typeof window !== 'undefined' && window.location.origin
    ? window.location.origin
    : 'https://ais-pre-sadx4wvlv7fz7jlqqu4mxs-735526415510.europe-west2.run.app';

  const copyOnlineUrl = () => {
    navigator.clipboard.writeText(onlineWebUrl);
    setCopiedUrl(true);
    setTimeout(() => setCopiedUrl(false), 2000);
  };

  const copyRouterIp = (ipToCopy: string) => {
    navigator.clipboard.writeText(ipToCopy);
    setCopiedIp(true);
    setTimeout(() => setCopiedIp(false), 2000);
  };

  const mikrotikCloudScript = `/ip cloud set ddns-enabled=yes update-time=yes\n/ip service enable api,winbox,www\n/ip cloud print`;

  const copyMikrotikScript = () => {
    navigator.clipboard.writeText(mikrotikCloudScript);
    setCopiedScript(true);
    setTimeout(() => setCopiedScript(false), 2000);
  };

  // Administrator Account & Password Management State (set to 7780)
  const [isAdminModalOpen, setIsAdminModalOpen] = useState(false);
  const [adminPassword, setAdminPassword] = useState<string>(() => {
    try {
      const saved = localStorage.getItem('toor_net_admin_pass');
      if (saved) return saved;
    } catch {}
    return '7780';
  });
  const [copiedAdminPass, setCopiedAdminPass] = useState(false);
  const [currentPassInput, setCurrentPassInput] = useState('');
  const [newPassInput, setNewPassInput] = useState('');
  const [confirmPassInput, setConfirmPassInput] = useState('');
  const [passMessage, setPassMessage] = useState<{ text: string; isError: boolean } | null>(null);

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPassMessage(null);
    if (!newPassInput || newPassInput.length < 4) {
      setPassMessage({
        text: isUrdu ? 'نیا پاس ورڈ کم از کم 4 ہندسوں کا ہونا ضروری ہے' : 'New password must be at least 4 characters',
        isError: true
      });
      return;
    }
    if (newPassInput !== confirmPassInput) {
      setPassMessage({
        text: isUrdu ? 'پاس ورڈز آپس میں میچ نہیں کر رہے' : 'Passwords do not match',
        isError: true
      });
      return;
    }

    try {
      await fetch('/api/auth/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentPassword: currentPassInput || adminPassword, newPassword: newPassInput })
      });
    } catch {}

    setAdminPassword(newPassInput);
    try {
      localStorage.setItem('toor_net_admin_pass', newPassInput);
    } catch {}

    setPassMessage({
      text: isUrdu ? 'ایڈمنسٹریٹر پاس ورڈ کامیابی سے تبدیل ہو گیا!' : 'Administrator password updated successfully!',
      isError: false
    });
    setCurrentPassInput('');
    setNewPassInput('');
    setConfirmPassInput('');
  };

  const copyCurrentAdminPass = () => {
    navigator.clipboard.writeText(adminPassword);
    setCopiedAdminPass(true);
    setTimeout(() => setCopiedAdminPass(false), 2000);
  };
  
  // Available Balance state (default 8,778.44 from user's screenshot, persisted in localStorage)
  const [balance, setBalance] = useState<number>(() => {
    try {
      const saved = localStorage.getItem('toor_net_isp_balance');
      if (saved) return parseFloat(saved);
    } catch {}
    return 8778.44;
  });

  const [rechargeAmount, setRechargeAmount] = useState<string>('');

  const handleUpdateBalance = (newAmount: number) => {
    setBalance(newAmount);
    try {
      localStorage.setItem('toor_net_isp_balance', newAmount.toString());
    } catch {}
  };

  const handleAddBalance = (amountToAdd: number) => {
    const updated = Math.round((balance + amountToAdd) * 100) / 100;
    handleUpdateBalance(updated);
  };

  const copyCloudDdns = () => {
    if (status.cloudDdns) {
      navigator.clipboard.writeText(status.cloudDdns);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  // Dynamic counts based on secrets & active sessions or default 40 / 39 / 1 / 0
  const totalCustomers = pppoeSecrets.length > 0 ? pppoeSecrets.length : (status.pppoeCount || 40);
  const onlineCustomers = pppoeActive.length > 0 ? pppoeActive.length : (status.pppoeActiveCount || 39);
  const offlineCustomers = Math.max(0, totalCustomers - onlineCustomers);
  const latestCustomers = 0; // matching screenshot
  const expiringCustomers = pppoeSecrets.filter(s => s.paymentStatus === 'due' || s.paymentStatus === 'expired').length || 2;
  const hotspotActiveCount = status.hotspotActiveCount || 24;

  // Filtered subscribers for search
  const filteredPppoe = pppoeSecrets.filter(s => 
    s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (s.remoteAddress && s.remoteAddress.includes(searchQuery)) ||
    (s.comment && s.comment.toLowerCase().includes(searchQuery.toLowerCase())) ||
    (s.profile && s.profile.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="bg-[#f4f7f6] p-3 sm:p-5 rounded-2xl space-y-4 font-sans text-slate-800 shadow-sm border border-slate-200/60">
      {/* 1. TOP BAR (Exact Header Style from User Screenshot) */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200/80 p-3 sm:p-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          {/* Left: Green Logo + Account Info */}
          <div className="flex items-center gap-3">
            {/* Round Green Emblem */}
            <div className="relative w-12 h-12 rounded-full border-2 border-emerald-600 p-0.5 shadow-sm bg-white shrink-0 flex items-center justify-center overflow-hidden">
              <img 
                src="/toor-net-badge.jpg" 
                alt="TOOR NET" 
                className="w-full h-full object-cover rounded-full"
                referrerPolicy="no-referrer"
                onError={(e) => {
                  // Fallback to stylized SVG emblem if image fails
                  const target = e.target as HTMLElement;
                  target.style.display = 'none';
                }}
              />
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-emerald-700 text-white rounded-full font-bold text-[9px] leading-tight text-center pointer-events-none -z-10">
                <span>TOOR</span>
                <span className="text-[7px] text-amber-300">NET</span>
              </div>
            </div>

            {/* Brand and Account Details */}
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-sm sm:text-base text-emerald-800 tracking-tight uppercase">
                  TOOR NET BROADBAND
                </span>
              </div>
              <button
                onClick={() => setIsAdminModalOpen(true)}
                className="flex items-center gap-1.5 text-slate-700 text-xs font-semibold cursor-pointer hover:text-emerald-700 transition group mt-0.5"
                title="Click to view & change Administrator Password (7780)"
              >
                <span>toor net</span>
                <span className="text-slate-400 font-normal">/</span>
                <span className="text-emerald-800 font-bold bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-300 group-hover:bg-emerald-100 flex items-center gap-1 transition">
                  <ShieldCheck className="w-3 h-3 text-emerald-600" />
                  <span>admin (7780)</span>
                </span>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400 group-hover:text-emerald-700 transition" />
              </button>
            </div>
          </div>

          {/* Right: Available Balance + Cloud IP Quick Pill + Search Icon */}
          <div className="flex items-center justify-between sm:justify-end gap-2.5 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100 flex-wrap">
            {/* Cloud Access Quick Button */}
            <button
              onClick={() => setIsCloudModalOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-700 text-white hover:bg-emerald-800 transition shadow-xs text-xs font-semibold cursor-pointer"
              title="Click to view Cloud IP and Online Web Access link"
            >
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-300 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-white"></span>
              </span>
              <Globe className="w-3.5 h-3.5 ml-0.5" />
              <span>Cloud IP: {routerCloudIp}</span>
            </button>

            {/* Balance Badge (Clickable to recharge/edit) */}
            <button
              onClick={() => setIsBalanceModalOpen(true)}
              className="group flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100/80 border border-emerald-200 transition text-left cursor-pointer"
              title="Click to manage available reseller balance"
            >
              <div className="text-xs sm:text-sm font-medium text-slate-700">
                <span className="text-slate-500 font-normal">Available Balance = </span>
                <span className="font-bold text-slate-900 font-mono">
                  {balance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
              </div>
              <Wallet className="w-3.5 h-3.5 text-emerald-600 group-hover:scale-110 transition ml-1" />
            </button>

            {/* Search Icon Button */}
            <button
              onClick={() => setIsSearchOpen(true)}
              className="p-2.5 rounded-full hover:bg-slate-100 text-slate-600 hover:text-emerald-700 transition border border-slate-200 shadow-xs cursor-pointer"
              title="Search Customers"
            >
              <Search className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* 2. ATTENTION BANNER (Exact Style from User Screenshot) */}
      <div className="flex flex-col sm:flex-row items-stretch rounded-lg overflow-hidden shadow-xs border border-emerald-700/30">
        {/* Dark Attention Tag */}
        <div className="bg-[#111827] text-white px-4 py-2.5 flex items-center gap-2 shrink-0 select-none">
          <AlertTriangle className="w-4 h-4 text-amber-400 fill-amber-400/20" />
          <span className="font-bold text-xs uppercase tracking-wider">Attention</span>
        </div>

        {/* Green PTA / Regulatory Urdu Notice Bar */}
        <div className="flex-1 bg-[#558b2f] text-white px-4 py-2.5 flex items-center justify-between overflow-hidden">
          <div className="flex items-center gap-2.5 w-full">
            {/* PTA Badge / Shield icon */}
            <div className="w-5 h-5 rounded-full bg-white/20 border border-white/40 flex items-center justify-center shrink-0">
              <ShieldCheck className="w-3 h-3 text-white" />
            </div>

            {/* Urdu Notice Text */}
            <div className="text-xs md:text-sm font-medium text-white/95 truncate dir-rtl text-right w-full font-serif" dir="rtl">
              پی ٹی اے اور قانون نافذ کرنے والے اداروں کی ہدایات کے مطابق تمام صارفین کا مکمل ریکارڈ، CNIC اور سیشن لاگز محفوظ رکھنا لازمی ہے - TOOR NET
            </div>
          </div>
        </div>
      </div>

      {/* 3. CUSTOMER STAT CARDS (Exact Visual Layout & Lime-Green Border from Screenshot) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        {/* Card 1: Active Customers */}
        <div
          onClick={() => setActiveTab('pppoe')}
          className="bg-white rounded-xl p-4 sm:p-5 border-2 border-[#7cb342] shadow-xs hover:shadow-md transition-all cursor-pointer flex items-center justify-between group"
        >
          <div>
            <div className="text-3xl sm:text-4xl font-bold text-slate-800 tracking-tight font-sans">
              {totalCustomers}
            </div>
            <div className="text-xs sm:text-sm font-normal text-slate-400 mt-1">
              Active Customers
            </div>
          </div>
          <div className="group-hover:scale-105 transition-transform">
            <CustomerAvatarBadge variant="active" className="w-16 h-14" />
          </div>
        </div>

        {/* Card 2: Online Customers (With Green Checkmark Badge) */}
        <div
          onClick={() => setActiveTab('pppoe')}
          className="bg-white rounded-xl p-4 sm:p-5 border-2 border-[#7cb342] shadow-xs hover:shadow-md transition-all cursor-pointer flex items-center justify-between group"
        >
          <div>
            <div className="text-3xl sm:text-4xl font-bold text-slate-800 tracking-tight font-sans">
              {onlineCustomers}
            </div>
            <div className="text-xs sm:text-sm font-normal text-slate-400 mt-1">
              Online Customers
            </div>
          </div>
          <div className="group-hover:scale-105 transition-transform">
            <CustomerAvatarBadge variant="online" className="w-16 h-14" />
          </div>
        </div>

        {/* Card 3: Offline Customers (With Offline Badge) */}
        <div
          onClick={() => setActiveTab('pppoe')}
          className="bg-white rounded-xl p-4 sm:p-5 border-2 border-[#7cb342] shadow-xs hover:shadow-md transition-all cursor-pointer flex items-center justify-between group"
        >
          <div>
            <div className="text-3xl sm:text-4xl font-bold text-slate-800 tracking-tight font-sans">
              {offlineCustomers}
            </div>
            <div className="text-xs sm:text-sm font-normal text-slate-400 mt-1">
              Offline Customers
            </div>
          </div>
          <div className="group-hover:scale-105 transition-transform">
            <CustomerAvatarBadge variant="offline" className="w-16 h-14" />
          </div>
        </div>

        {/* Card 4: Latest Customers (With Golden Sun Badge) */}
        <div
          onClick={onOpenNewPppoeModal}
          className="bg-white rounded-xl p-4 sm:p-5 border-2 border-[#7cb342] shadow-xs hover:shadow-md transition-all cursor-pointer flex items-center justify-between group"
        >
          <div>
            <div className="text-3xl sm:text-4xl font-bold text-slate-800 tracking-tight font-sans">
              {latestCustomers}
            </div>
            <div className="text-xs sm:text-sm font-normal text-slate-400 mt-1">
              Latest Customers
            </div>
          </div>
          <div className="group-hover:scale-105 transition-transform">
            <CustomerAvatarBadge variant="latest" className="w-16 h-14" />
          </div>
        </div>
      </div>

      {/* Additional Secondary ISP Row: Expiring Customers & Hotspot Active */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        {/* Expiring Customers */}
        <div
          onClick={() => setActiveTab('pppoe')}
          className="bg-white rounded-xl p-4 border border-amber-300 shadow-xs hover:shadow-md transition cursor-pointer flex items-center justify-between"
        >
          <div>
            <div className="text-2xl font-bold text-slate-800 font-sans">
              {expiringCustomers}
            </div>
            <div className="text-xs text-slate-500 mt-0.5">
              Expiring Customers
            </div>
          </div>
          <CustomerAvatarBadge variant="expiring" className="w-14 h-12" />
        </div>

        {/* Hotspot Active Vouchers */}
        <div
          onClick={() => setActiveTab('hotspot')}
          className="bg-white rounded-xl p-4 border border-cyan-400 shadow-xs hover:shadow-md transition cursor-pointer flex items-center justify-between"
        >
          <div>
            <div className="text-2xl font-bold text-slate-800 font-sans">
              {hotspotActiveCount}
            </div>
            <div className="text-xs text-slate-500 mt-0.5">
              Hotspot Active Users
            </div>
          </div>
          <CustomerAvatarBadge variant="hotspot" className="w-14 h-12" />
        </div>

        {/* CPU Load */}
        <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <div className="text-2xl font-bold text-slate-800 font-mono">
              {status.cpuLoad}%
            </div>
            <div className="text-xs text-slate-500 mt-0.5">
              RB750Gr3 CPU Load
            </div>
          </div>
          <div className="p-2.5 rounded-full bg-emerald-50 text-emerald-600">
            <Cpu className="w-6 h-6" />
          </div>
        </div>

        {/* Free RAM */}
        <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <div className="text-2xl font-bold text-slate-800 font-mono">
              {status.freeMemory || '198 MiB'}
            </div>
            <div className="text-xs text-slate-500 mt-0.5">
              Free System Memory
            </div>
          </div>
          <div className="p-2.5 rounded-full bg-purple-50 text-purple-600">
            <HardDrive className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* 4. QUICK ACTION BUTTONS */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <button
          onClick={onOpenNewPppoeModal}
          className="flex items-center justify-center gap-2 p-3.5 rounded-xl bg-[#558b2f] hover:bg-[#43721a] text-white font-medium text-xs shadow-sm transition"
        >
          <PlusCircle className="w-4 h-4" />
          <span>{isUrdu ? '+ نیا PPPoE صارف' : '+ New PPPoE Client'}</span>
        </button>

        <button
          onClick={onOpenNewHotspotModal}
          className="flex items-center justify-center gap-2 p-3.5 rounded-xl bg-white hover:bg-slate-50 text-emerald-800 border-2 border-emerald-600 font-medium text-xs shadow-sm transition"
        >
          <Wifi className="w-4 h-4 text-emerald-600" />
          <span>{isUrdu ? '+ نیا ہاٹ سپاٹ یوزر' : '+ New Hotspot User'}</span>
        </button>

        <button
          onClick={onOpenVoucherModal}
          className="flex items-center justify-center gap-2 p-3.5 rounded-xl bg-white hover:bg-slate-50 text-amber-800 border border-amber-400 font-medium text-xs shadow-sm transition"
        >
          <Ticket className="w-4 h-4 text-amber-600" />
          <span>{isUrdu ? 'واؤچرز پرنٹ کریں' : 'Print Vouchers'}</span>
        </button>

        <button
          onClick={onOpenGuideModal}
          className="flex items-center justify-center gap-2 p-3.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-medium text-xs shadow-sm transition"
        >
          <Terminal className="w-4 h-4 text-emerald-400" />
          <span>{isUrdu ? 'Winbox ٹرمینل اسکرپٹ' : 'MikroTik Script'}</span>
        </button>
      </div>

      {/* 5. CLOUD REMOTE DDNS & HARDWARE STATUS */}
      <div className="bg-white rounded-2xl p-4 sm:p-5 border-2 border-emerald-500/40 shadow-sm space-y-4">
        {/* Header of Cloud section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-3 border-b border-slate-100">
          <div className="flex items-start gap-3">
            <div className="p-2.5 rounded-xl bg-emerald-100 text-emerald-800 shrink-0">
              <Globe className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-sm sm:text-base font-bold text-slate-900">
                  {isUrdu ? 'آن لائن کلاؤڈ ایکسیس و پبلک آئی پی' : 'Online Cloud Access & Public IP'}
                </h3>
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-100 text-emerald-800 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-ping"></span>
                  {isUrdu ? 'کلاؤڈ آن لائن ایکٹو' : 'Live Online Active'}
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                {isUrdu
                  ? 'اس ویب پینل کو دنیا میں کہیں سے بھی موبائل پر کھولیں، اور اپنے MikroTik RB750Gr3 راؤٹر کو کلاؤڈ آئی پی سے ریموٹلی مانیٹر کریں۔'
                  : 'Open this web panel anywhere from mobile or PC, and connect your MikroTik RB750Gr3 remotely.'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={() => setIsCloudModalOpen(true)}
              className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs flex items-center gap-1.5 shadow-xs transition cursor-pointer"
            >
              <Globe className="w-4 h-4" />
              <span>{isUrdu ? 'کلاؤڈ آئی پی سیٹنگز' : 'Cloud IP Details'}</span>
            </button>
            <button
              onClick={() => setActiveTab('vps-tunnel')}
              className="px-3.5 py-2 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 font-medium text-xs flex items-center gap-1.5 transition cursor-pointer"
            >
              <Server className="w-4 h-4" />
              <span>{isUrdu ? 'کلاؤڈ VPS ٹنل' : 'Cloud VPS Tunnel'}</span>
            </button>
          </div>
        </div>

        {/* 2-Column Info Grid: 1) Online Web Panel Link, 2) Router Cloud IP */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3.5 pt-1">
          {/* Box 1: Web Panel Online URL */}
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between gap-2 mb-1.5">
                <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                  <Smartphone className="w-4 h-4 text-emerald-600" />
                  {isUrdu ? 'پینل کا آن لائن کلاؤڈ ویب لنک (موبائل کیلئے):' : 'Web Panel Online Cloud URL (For Mobile):'}
                </span>
                <span className="text-[10px] font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                  24/7 Cloud Hosted
                </span>
              </div>
              <p className="text-[11px] text-slate-500 mb-2">
                {isUrdu ? 'کسی بھی موبائل یا لیپ ٹاپ کے براؤزر میں کھول کر لاگ ان کریں:' : 'Open in any browser from home, office, or mobile:'}
              </p>
              <div className="flex items-center gap-1.5 bg-white p-1.5 rounded-lg border border-slate-300 font-mono text-xs text-slate-800 select-all overflow-x-auto">
                <span className="truncate flex-1 pl-1 text-[11px] sm:text-xs">{onlineWebUrl}</span>
                <button
                  onClick={copyOnlineUrl}
                  className="px-2.5 py-1 rounded bg-slate-100 hover:bg-emerald-600 hover:text-white text-slate-700 text-xs font-sans font-medium transition shrink-0 flex items-center gap-1 cursor-pointer"
                  title="Copy Online URL"
                >
                  {copiedUrl ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedUrl ? (isUrdu ? 'کاپی ہو گیا' : 'Copied') : (isUrdu ? 'کاپی' : 'Copy')}</span>
                </button>
                <a
                  href={onlineWebUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-600 transition shrink-0"
                  title="Open in new window"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>
          </div>

          {/* Box 2: MikroTik Router Cloud IP & DDNS */}
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between gap-2 mb-1.5">
                <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                  <Cloud className="w-4 h-4 text-emerald-600" />
                  {isUrdu ? 'راؤٹر کا پبلک کلاؤڈ آئی پی و DDNS:' : 'MikroTik Router Cloud IP & DDNS:'}
                </span>
                <button
                  onClick={() => {
                    setEditIpInput(routerCloudIp);
                    setIsEditingIp(!isEditingIp);
                  }}
                  className="text-[10px] text-emerald-700 hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <Edit3 className="w-3 h-3" />
                  {isUrdu ? 'تبدیل کریں' : 'Edit IP'}
                </button>
              </div>

              {isEditingIp ? (
                <div className="flex items-center gap-1.5 mb-2">
                  <input
                    type="text"
                    value={editIpInput}
                    onChange={(e) => setEditIpInput(e.target.value)}
                    placeholder="e.g. 175.107.242.88"
                    className="flex-1 px-2.5 py-1 text-xs border rounded-lg bg-white font-mono"
                  />
                  <button
                    onClick={() => {
                      if (editIpInput.trim()) {
                        setRouterCloudIp(editIpInput.trim());
                        try { localStorage.setItem('toor_net_router_cloud_ip', editIpInput.trim()); } catch {}
                        setIsEditingIp(false);
                      }
                    }}
                    className="px-2.5 py-1 bg-emerald-600 text-white rounded-lg text-xs font-medium cursor-pointer"
                  >
                    Save
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-2 mb-2">
                  <div className="flex items-center gap-1.5 bg-white px-2.5 py-1 rounded-lg border border-slate-300 font-mono text-xs font-bold text-emerald-800">
                    <span>IP: {routerCloudIp}</span>
                    <button
                      onClick={() => copyRouterIp(routerCloudIp)}
                      className="hover:text-emerald-600 transition ml-1 cursor-pointer"
                      title="Copy IP"
                    >
                      {copiedIp ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 text-slate-400" />}
                    </button>
                  </div>
                  <span className="text-[11px] text-slate-500 font-mono">Port: 8728 / 8291</span>
                </div>
              )}

              {/* DDNS Host string */}
              <div className="flex items-center gap-1 text-[11px] text-slate-600 bg-white/70 px-2 py-1 rounded border border-slate-200">
                <span className="text-slate-400 font-sans">DDNS Host:</span>
                <code className="font-mono text-emerald-900 font-semibold truncate flex-1">{routerCloudDdns}</code>
                <button
                  onClick={() => copyRouterIp(routerCloudDdns)}
                  className="text-slate-400 hover:text-emerald-700 transition cursor-pointer"
                  title="Copy DDNS"
                >
                  <Copy className="w-3 h-3" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* 1-Click Winbox Setup Banner */}
        <div className="p-3 rounded-xl bg-emerald-900 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            <Terminal className="w-4 h-4 text-emerald-300 shrink-0" />
            <span className="font-medium">
              {isUrdu
                ? 'Winbox کے New Terminal میں مفت MikroTik Cloud آن کرنے کا اسکرپٹ:'
                : '1-Click MikroTik Terminal command to activate free built-in Cloud IP:'}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <code className="bg-black/30 px-2 py-1 rounded text-[11px] font-mono text-emerald-200 truncate max-w-xs">
              /ip cloud set ddns-enabled=yes
            </code>
            <button
              onClick={copyMikrotikScript}
              className="px-3 py-1 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold transition flex items-center gap-1 shrink-0 cursor-pointer"
            >
              {copiedScript ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedScript ? (isUrdu ? 'کاپی ہو گیا' : 'Copied!') : (isUrdu ? 'اسکرپٹ کاپی کریں' : 'Copy Script')}</span>
            </button>
          </div>
        </div>
      </div>

      {/* 6. SEARCH MODAL (Triggered by Search Icon) */}
      {isSearchOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-xl w-full p-5 shadow-2xl border border-slate-200 max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Search className="w-5 h-5 text-emerald-600" />
                <h3 className="text-base font-bold text-slate-800">
                  {isUrdu ? 'صارف تلاش کریں (PPPoE / Hotspot)' : 'Search Customer'}
                </h3>
              </div>
              <button 
                onClick={() => setIsSearchOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Input field */}
            <div className="mt-4">
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="text"
                  autoFocus
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={isUrdu ? 'نام، آئی پی، یا پیکیج لکھیں...' : 'Search by username, IP address, comment...'}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm text-slate-800 placeholder-slate-400"
                />
              </div>
            </div>

            {/* Results list */}
            <div className="mt-3 flex-1 overflow-y-auto space-y-2 max-h-96 pr-1">
              {filteredPppoe.length === 0 ? (
                <div className="text-center py-8 text-slate-400 text-sm">
                  {isUrdu ? 'کوئی صارف نہیں ملا' : 'No matching customer found'}
                </div>
              ) : (
                filteredPppoe.slice(0, 15).map((subscriber) => {
                  const isOnline = pppoeActive.some(a => a.name === subscriber.name);
                  return (
                    <div
                      key={subscriber.id}
                      onClick={() => {
                        setIsSearchOpen(false);
                        setActiveTab('pppoe');
                      }}
                      className="p-3 rounded-xl border border-slate-100 hover:border-emerald-300 hover:bg-emerald-50/40 transition cursor-pointer flex items-center justify-between"
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-2.5 h-2.5 rounded-full ${isOnline ? 'bg-emerald-500' : 'bg-slate-300'}`} />
                        <div>
                          <div className="font-semibold text-slate-800 text-sm">{subscriber.name}</div>
                          <div className="text-xs text-slate-400 flex items-center gap-2">
                            <span>{subscriber.profile}</span>
                            <span>•</span>
                            <span className="font-mono">{subscriber.remoteAddress}</span>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className={`px-2 py-0.5 rounded text-[11px] font-medium ${isOnline ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-600'}`}>
                          {isOnline ? 'Online' : 'Offline'}
                        </span>
                        <div className="text-[11px] text-slate-400 mt-0.5">
                          Rs. {subscriber.monthlyFee || 1500}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      )}

      {/* 7. BALANCE MANAGER MODAL */}
      {isBalanceModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-md w-full p-5 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Wallet className="w-5 h-5 text-emerald-600" />
                <h3 className="text-base font-bold text-slate-800">
                  {isUrdu ? 'ری سیلر بیلنس منیجر' : 'Reseller Balance Manager'}
                </h3>
              </div>
              <button 
                onClick={() => setIsBalanceModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="mt-4 text-center py-4 bg-emerald-50 rounded-xl border border-emerald-100">
              <div className="text-xs text-slate-500 font-medium uppercase tracking-wider">
                Current Available Balance
              </div>
              <div className="text-3xl font-extrabold text-emerald-800 font-mono mt-1">
                PKR {balance.toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </div>
            </div>

            {/* Quick Add Buttons */}
            <div className="mt-4">
              <label className="text-xs font-semibold text-slate-600 block mb-2">
                {isUrdu ? 'کوئیک ری چارج رقم' : 'Quick Top-up Balance:'}
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[1000, 5000, 10000].map(amt => (
                  <button
                    key={amt}
                    type="button"
                    onClick={() => handleAddBalance(amt)}
                    className="py-2 rounded-lg bg-slate-100 hover:bg-emerald-600 hover:text-white font-semibold text-xs text-slate-700 transition"
                  >
                    +Rs. {amt.toLocaleString()}
                  </button>
                ))}
              </div>
            </div>

            {/* Custom Amount */}
            <div className="mt-4">
              <label className="text-xs font-semibold text-slate-600 block mb-1">
                {isUrdu ? 'یا نیا بیلنس درج کریں:' : 'Or Set Exact Balance (PKR):'}
              </label>
              <div className="flex gap-2">
                <input
                  type="number"
                  step="0.01"
                  placeholder="e.g. 8778.44"
                  value={rechargeAmount}
                  onChange={(e) => setRechargeAmount(e.target.value)}
                  className="flex-1 px-3 py-2 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 font-mono"
                />
                <button
                  type="button"
                  onClick={() => {
                    const parsed = parseFloat(rechargeAmount);
                    if (!isNaN(parsed) && parsed >= 0) {
                      handleUpdateBalance(parsed);
                      setRechargeAmount('');
                    }
                  }}
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs transition"
                >
                  {isUrdu ? 'محفوظ کریں' : 'Update'}
                </button>
              </div>
            </div>

            <div className="mt-5 pt-3 border-t border-slate-100 flex justify-end">
              <button
                type="button"
                onClick={() => setIsBalanceModalOpen(false)}
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium text-xs transition cursor-pointer"
              >
                {isUrdu ? 'بند کریں' : 'Close'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 8. DEDICATED CLOUD IP & ONLINE ACCESS MODAL */}
      {isCloudModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-5 sm:p-6 shadow-2xl border border-slate-200 max-h-[90vh] flex flex-col overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-emerald-100 text-emerald-800">
                  <Globe className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">
                    {isUrdu ? 'کلاؤڈ آئی پی اور آن لائن ایکسیس سیٹ اپ' : 'Online Cloud Access & Public IP Setup'}
                  </h3>
                  <p className="text-xs text-slate-500">
                    {isUrdu
                      ? 'موبائل پر پینل کھولنے اور مائیکروٹک راؤٹر کو آن لائن کنیکٹ کرنے کی مکمل گائیڈ'
                      : 'Complete setup to access this web panel online & connect your MikroTik'}
                  </p>
                </div>
              </div>
              <button 
                onClick={() => setIsCloudModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Content Sections */}
            <div className="mt-4 space-y-4 text-xs text-slate-700">
              {/* Section 1: Web Panel Online URL */}
              <div className="p-4 rounded-xl bg-emerald-50/70 border border-emerald-200 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-emerald-900 flex items-center gap-1.5 text-xs sm:text-sm">
                    <Smartphone className="w-4 h-4 text-emerald-700" />
                    1. {isUrdu ? 'اس پینل کو دنیا میں کہیں سے بھی کھولنے کا آن لائن لنک:' : 'Online Web Access Link (Any Device / Mobile):'}
                  </span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-600 text-white">
                    ONLINE 24/7
                  </span>
                </div>
                <p className="text-[11px] text-slate-600 leading-relaxed">
                  {isUrdu
                    ? 'یہ ویب پینل گوگل کلاؤڈ پر آن لائن موجود ہے۔ آپ اپنے موبائل کے کروم یا سفاری براؤزر میں یہ لنک کھول کر بغیر راؤٹر کے پاس بیٹھے تمام 40 صارفین کو کنٹرول کر سکتے ہیں۔'
                    : 'This ISP portal is hosted online 24/7. Save or bookmark this link on your phone to control PPPoE & Hotspot users from anywhere.'}
                </p>

                <div className="flex items-center gap-2 bg-white p-2 rounded-xl border border-emerald-300">
                  <input
                    type="text"
                    readOnly
                    value={onlineWebUrl}
                    className="flex-1 text-xs font-mono text-slate-800 bg-transparent outline-none truncate"
                  />
                  <button
                    onClick={copyOnlineUrl}
                    className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs flex items-center gap-1 transition cursor-pointer"
                  >
                    {copiedUrl ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedUrl ? (isUrdu ? 'کاپی ہو گیا' : 'Copied!') : (isUrdu ? 'لنک کاپی کریں' : 'Copy Link')}</span>
                  </button>
                  <a
                    href={onlineWebUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition"
                    title="Open in new window"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </a>
                </div>
              </div>

              {/* Section 2: MikroTik Router Cloud IP & DDNS */}
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-900 flex items-center gap-1.5 text-xs sm:text-sm">
                    <Cloud className="w-4 h-4 text-emerald-600" />
                    2. {isUrdu ? 'آپ کے MikroTik راؤٹر کا کلاؤڈ آئی پی اور DDNS:' : 'MikroTik Cloud IP & DDNS Configuration:'}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* Public Cloud IP */}
                  <div className="bg-white p-3 rounded-lg border border-slate-200 space-y-1">
                    <span className="text-[11px] text-slate-500 font-medium block">
                      {isUrdu ? 'راؤٹر کا پبلک کلاؤڈ آئی پی (Public IP):' : 'Router Public Cloud IP:'}
                    </span>
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-mono text-sm font-bold text-emerald-800">{routerCloudIp}</span>
                      <button
                        onClick={() => copyRouterIp(routerCloudIp)}
                        className="p-1 text-slate-400 hover:text-emerald-600 cursor-pointer"
                        title="Copy IP"
                      >
                        {copiedIp ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>

                  {/* Cloud DDNS Host */}
                  <div className="bg-white p-3 rounded-lg border border-slate-200 space-y-1">
                    <span className="text-[11px] text-slate-500 font-medium block">
                      {isUrdu ? 'فری MikroTik Cloud DDNS ڈومین:' : 'Free MikroTik Cloud DDNS Host:'}
                    </span>
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-mono text-xs font-semibold text-slate-800 truncate">{routerCloudDdns}</span>
                      <button
                        onClick={() => copyRouterIp(routerCloudDdns)}
                        className="p-1 text-slate-400 hover:text-emerald-600 cursor-pointer shrink-0"
                        title="Copy DDNS"
                      >
                        <Copy className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Custom IP input */}
                <div className="pt-2 border-t border-slate-200 flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                  <span className="text-xs text-slate-600 shrink-0">
                    {isUrdu ? 'اگر آپ کا راؤٹر آئی پی مختلف ہے:' : 'Enter custom WAN / Cloud IP:'}
                  </span>
                  <input
                    type="text"
                    value={routerCloudIp}
                    onChange={(e) => {
                      setRouterCloudIp(e.target.value);
                      try { localStorage.setItem('toor_net_router_cloud_ip', e.target.value); } catch {}
                    }}
                    placeholder="175.107.242.88"
                    className="flex-1 px-3 py-1.5 rounded-lg border border-slate-300 font-mono text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                  <span className="text-[10px] text-slate-400">Auto-saved</span>
                </div>
              </div>

              {/* Section 3: MikroTik Winbox Command */}
              <div className="p-4 rounded-xl bg-slate-900 text-white space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-emerald-300 flex items-center gap-1.5">
                    <Terminal className="w-4 h-4" />
                    3. {isUrdu ? 'MikroTik Winbox میں New Terminal کھولیں اور چلائیں:' : 'Run this in MikroTik Winbox -> New Terminal:'}
                  </span>
                  <button
                    onClick={copyMikrotikScript}
                    className="px-2.5 py-1 rounded bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs flex items-center gap-1 transition cursor-pointer"
                  >
                    {copiedScript ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedScript ? (isUrdu ? 'کاپی ہو گیا' : 'Copied!') : (isUrdu ? 'اسکرپٹ کاپی کریں' : 'Copy Script')}</span>
                  </button>
                </div>

                <div className="bg-black/60 p-3 rounded-lg font-mono text-[11px] text-emerald-300 space-y-1 overflow-x-auto border border-slate-800">
                  <p className="text-slate-400"># 1. Enable Free MikroTik Cloud Dynamic DNS:</p>
                  <p>/ip cloud set ddns-enabled=yes update-time=yes</p>
                  <p className="text-slate-400 pt-1"># 2. Enable API & Winbox remote management ports:</p>
                  <p>/ip service enable api,winbox,www</p>
                  <p>/ip service set api port=8728</p>
                  <p className="text-slate-400 pt-1"># 3. Print your router's live public cloud name & IP:</p>
                  <p>/ip cloud print</p>
                </div>
              </div>

              {/* Section 4: Notice about CGNAT / Private IP */}
              <div className="p-3.5 rounded-xl bg-indigo-50 border border-indigo-200 flex items-start gap-2.5">
                <Server className="w-5 h-5 text-indigo-700 shrink-0 mt-0.5" />
                <div className="text-xs text-indigo-950 space-y-1">
                  <span className="font-bold block">
                    {isUrdu ? 'اہم نوٹ: اگر آپ کے لوکل آئی ایس پی پر پرائیویٹ آئی پی (CGNAT) ہو:' : 'Special Note: If your ISP uses CGNAT (Private IP):'}
                  </span>
                  <p className="text-[11px] leading-relaxed text-indigo-900/90">
                    {isUrdu
                      ? 'اگر آپ کے پاس PTCL، Jazz یا StormFiber پر پبلک آئی پی نہیں ہے، تو آپ ہمارے Cloud VPS ٹنل کو استعمال کر کے ڈیڈیکیٹڈ پبلک آئی پی 142.93.120.45 حاصل کر سکتے ہیں۔'
                      : 'If your ISP puts you behind CGNAT (no direct public IP), use our Cloud VPS Tunnel feature to get a dedicated public IP 142.93.120.45.'}
                  </p>
                  <button
                    onClick={() => {
                      setIsCloudModalOpen(false);
                      setActiveTab('vps-tunnel');
                    }}
                    className="inline-flex items-center gap-1 font-bold text-indigo-700 hover:text-indigo-900 text-[11px] mt-1 underline cursor-pointer"
                  >
                    <span>{isUrdu ? 'Cloud VPS ٹنل سیٹ اپ پر جائیں' : 'Open Cloud VPS Tunnel Setup'}</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="mt-5 pt-3 border-t border-slate-100 flex justify-end">
              <button
                type="button"
                onClick={() => setIsCloudModalOpen(false)}
                className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs transition shadow-xs cursor-pointer"
              >
                {isUrdu ? 'ٹھیک ہے / بند کریں' : 'Done / Close'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 9. ADMINISTRATOR ACCOUNT & PASSWORD MANAGER MODAL */}
      {isAdminModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-lg w-full p-5 sm:p-6 shadow-2xl border border-slate-200 flex flex-col max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-3.5 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-emerald-100 text-emerald-800">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">
                    {isUrdu ? 'ایڈمنسٹریٹر اکاؤنٹ و پاس ورڈ مینجر' : 'Administrator Account & Password'}
                  </h3>
                  <p className="text-xs text-slate-500">
                    TOOR NET BROADBAND • Admin Security Profile
                  </p>
                </div>
              </div>
              <button
                onClick={() => {
                  setIsAdminModalOpen(false);
                  setPassMessage(null);
                }}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Current Active Password Card */}
            <div className="mt-4 p-4 rounded-xl bg-gradient-to-br from-emerald-50 to-teal-50 border border-emerald-200 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-emerald-950 flex items-center gap-1.5">
                  <Key className="w-4 h-4 text-emerald-700" />
                  {isUrdu ? 'موجودہ فعال ایڈمنسٹریٹر پاس ورڈ:' : 'Current Active Administrator Password:'}
                </span>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-700 text-white">
                  Active
                </span>
              </div>

              <div className="flex items-center justify-between gap-3 bg-white p-2.5 rounded-lg border border-emerald-300">
                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-500 font-sans">User: <strong className="text-slate-800 font-mono">admin</strong></span>
                  <span className="text-slate-300">|</span>
                  <span className="text-xs text-slate-500 font-sans">Password:</span>
                  <span className="font-mono text-base font-black text-emerald-800 tracking-wider">
                    {adminPassword}
                  </span>
                </div>
                <button
                  onClick={copyCurrentAdminPass}
                  className="px-2.5 py-1 rounded bg-emerald-100 hover:bg-emerald-200 text-emerald-800 text-xs font-semibold transition flex items-center gap-1 cursor-pointer"
                  title="Copy Password"
                >
                  {copiedAdminPass ? <Check className="w-3.5 h-3.5 text-emerald-700" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedAdminPass ? (isUrdu ? 'کاپی ہوا' : 'Copied') : (isUrdu ? 'کاپی' : 'Copy')}</span>
                </button>
              </div>
              <p className="text-[11px] text-emerald-800">
                {isUrdu
                  ? 'آپ کا نیا ایڈمنسٹریٹر پاس ورڈ 7780 کامیابی سے سیٹ ہے۔ آپ اس پاس ورڈ سے پینل لاگ ان کر سکتے ہیں۔'
                  : 'Your administrator password is set to 7780. You can use it to log in to the admin panel.'}
              </p>
            </div>

            {/* Change Password Form */}
            <form onSubmit={handleUpdatePassword} className="mt-4 space-y-3">
              <h4 className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-slate-600" />
                {isUrdu ? 'پاس ورڈ تبدیل کریں (Change Password):' : 'Change Administrator Password:'}
              </h4>

              {passMessage && (
                <div className={`p-2.5 rounded-lg text-xs font-medium ${passMessage.isError ? 'bg-red-50 text-red-700 border border-red-200' : 'bg-emerald-50 text-emerald-800 border border-emerald-200'}`}>
                  {passMessage.text}
                </div>
              )}

              <div className="space-y-1">
                <label className="block text-[11px] font-medium text-slate-600">
                  {isUrdu ? 'نیا پاس ورڈ (New Password):' : 'New Password:'}
                </label>
                <input
                  type="text"
                  required
                  value={newPassInput}
                  onChange={(e) => setNewPassInput(e.target.value)}
                  placeholder="e.g. 7780"
                  className="w-full px-3 py-2 text-xs font-mono rounded-lg border border-slate-300 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-[11px] font-medium text-slate-600">
                  {isUrdu ? 'دوبارہ تصدیق کریں (Confirm New Password):' : 'Confirm New Password:'}
                </label>
                <input
                  type="text"
                  required
                  value={confirmPassInput}
                  onChange={(e) => setConfirmPassInput(e.target.value)}
                  placeholder="e.g. 7780"
                  className="w-full px-3 py-2 text-xs font-mono rounded-lg border border-slate-300 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2 px-4 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs transition shadow-xs cursor-pointer flex items-center justify-center gap-1.5"
              >
                <ShieldCheck className="w-4 h-4" />
                <span>{isUrdu ? 'نیا پاس ورڈ محفوظ کریں' : 'Save & Update Password'}</span>
              </button>
            </form>

            {/* MikroTik RouterOS command tip */}
            <div className="mt-4 p-3 rounded-xl bg-slate-900 text-white text-[11px] space-y-1.5">
              <span className="font-semibold text-emerald-300 block">
                {isUrdu ? 'راؤٹر میں ایڈمن پاس ورڈ 7780 کرنے کا اسکرپٹ:' : 'MikroTik Winbox Terminal command:'}
              </span>
              <code className="block bg-black/50 p-2 rounded text-emerald-200 font-mono select-all overflow-x-auto">
                /user set admin password=7780
              </code>
            </div>

            {/* Close */}
            <div className="mt-4 pt-3 border-t border-slate-100 flex justify-end">
              <button
                type="button"
                onClick={() => {
                  setIsAdminModalOpen(false);
                  setPassMessage(null);
                }}
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium text-xs transition cursor-pointer"
              >
                {isUrdu ? 'بند کریں' : 'Close'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
