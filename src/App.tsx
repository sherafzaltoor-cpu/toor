/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState, useCallback } from 'react';
import { Header } from './components/Header';
import { DashboardTab } from './components/DashboardTab';
import { HotspotTab } from './components/HotspotTab';
import { PppoeTab } from './components/PppoeTab';
import { VpsTunnelTab } from './components/VpsTunnelTab';
import { CloudSetupGuideModal } from './components/CloudSetupGuideModal';
import { VoucherGeneratorModal } from './components/VoucherGeneratorModal';
import { NewHotspotUserModal } from './components/NewHotspotUserModal';
import { NewPppoeSecretModal } from './components/NewPppoeSecretModal';
import { RouterConnectModal } from './components/RouterConnectModal';
import { AdminLogin } from './components/AdminLogin';
import { 
  ActiveTab, 
  HotspotActive, 
  HotspotProfile, 
  HotspotUser, 
  Language, 
  PppoeActive, 
  PppoeProfile, 
  PppoeSecret, 
  RouterConnectionConfig, 
  RouterStatus,
  VpsTunnelConfig
} from './types';
import { 
  DEFAULT_HOTSPOT_PROFILES, 
  DEFAULT_PPPOE_PROFILES, 
  DEFAULT_ROUTER_STATUS,
  DEFAULT_VPS_CONFIG
} from './data/mockMikrotikData';

export default function App() {
  const [lang, setLang] = useState<Language>(() => {
    try {
      const saved = localStorage.getItem('mikrotik_panel_lang');
      if (saved === 'ur' || saved === 'en') return saved;
    } catch {}
    return 'en';
  });

  const handleSetLang = (newLang: Language) => {
    setLang(newLang);
    try {
      localStorage.setItem('mikrotik_panel_lang', newLang);
    } catch {}
  };

  const [activeTab, setActiveTab] = useState<ActiveTab>('dashboard');

  // Administrator login authentication state
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    try {
      return (
        localStorage.getItem('mikrotik_admin_auth') === 'true' ||
        sessionStorage.getItem('mikrotik_admin_auth') === 'true'
      );
    } catch {
      return false;
    }
  });

  const handleLoginSuccess = () => {
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    try {
      localStorage.removeItem('mikrotik_admin_auth');
      localStorage.removeItem('mikrotik_admin_user');
      sessionStorage.removeItem('mikrotik_admin_auth');
      sessionStorage.removeItem('mikrotik_admin_user');
    } catch {}
    setIsAuthenticated(false);
  };

  // Connection settings state
  const [config, setConfig] = useState<RouterConnectionConfig>(() => {
    try {
      const saved = localStorage.getItem('mikrotik_cloud_config');
      if (saved) {
        const parsed = JSON.parse(saved);
        return {
          routerOsVersion: 'v6',
          connectionMethod: 'cloud-vps',
          vpsConfig: DEFAULT_VPS_CONFIG,
          username: 'admin',
          password: '7780',
          ...parsed
        };
      }
    } catch {}
    return {
      host: '142.93.120.45',
      port: 8728,
      useSsl: false,
      username: 'admin',
      password: '7780',
      simulate: true,
      routerOsVersion: 'v6',
      connectionMethod: 'cloud-vps',
      vpsConfig: DEFAULT_VPS_CONFIG
    };
  });

  // Router hardware & status state
  const [status, setStatus] = useState<RouterStatus>(DEFAULT_ROUTER_STATUS);

  // Hotspot state
  const [hotspotUsers, setHotspotUsers] = useState<HotspotUser[]>([]);
  const [hotspotActive, setHotspotActive] = useState<HotspotActive[]>([]);
  const [hotspotProfiles] = useState<HotspotProfile[]>(DEFAULT_HOTSPOT_PROFILES);

  // PPPoE state
  const [pppoeSecrets, setPppoeSecrets] = useState<PppoeSecret[]>([]);
  const [pppoeActive, setPppoeActive] = useState<PppoeActive[]>([]);
  const [pppoeProfiles, setPppoeProfiles] = useState<PppoeProfile[]>(DEFAULT_PPPOE_PROFILES);

  // Modals state
  const [isConnectModalOpen, setIsConnectModalOpen] = useState(false);
  const [isGuideModalOpen, setIsGuideModalOpen] = useState(false);
  const [isNewHotspotModalOpen, setIsNewHotspotModalOpen] = useState(false);
  const [isNewPppoeModalOpen, setIsNewPppoeModalOpen] = useState(false);
  const [isVoucherModalOpen, setIsVoucherModalOpen] = useState(false);

  // Fetch router status
  const fetchStatus = useCallback(async () => {
    try {
      const res = await fetch('/api/mikrotik/status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(config)
      });
      if (res.ok) {
        const data = await res.json();
        setStatus(prev => ({ 
          ...prev, 
          ...data,
          version: config.routerOsVersion === 'v6' ? '6.49.10 (Long-term)' : '7.15.2 (stable)'
        }));
      }
    } catch (e) {
      console.error('Status fetch error', e);
    }
  }, [config]);

  // Fetch Hotspot users & sessions
  const fetchHotspotData = useCallback(async () => {
    try {
      const [uRes, aRes] = await Promise.all([
        fetch('/api/mikrotik/hotspot/users/list', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(config)
        }),
        fetch('/api/mikrotik/hotspot/active/list', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(config)
        })
      ]);

      if (uRes.ok) {
        const uData = await uRes.json();
        if (uData.users) {
          setHotspotUsers(uData.users);
          setStatus(prev => ({ ...prev, hotspotCount: uData.users.length }));
        }
      }
      if (aRes.ok) {
        const aData = await aRes.json();
        if (aData.active) {
          setHotspotActive(aData.active);
          setStatus(prev => ({ ...prev, hotspotActiveCount: aData.active.length }));
        }
      }
    } catch (e) {
      console.error('Hotspot fetch error', e);
    }
  }, [config]);

  // Fetch PPPoE secrets, active connections & profiles
  const fetchPppoeData = useCallback(async () => {
    try {
      const [sRes, aRes, pRes] = await Promise.all([
        fetch('/api/mikrotik/pppoe/secrets/list', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(config)
        }),
        fetch('/api/mikrotik/pppoe/active/list', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(config)
        }),
        fetch('/api/mikrotik/pppoe/profiles/list', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(config)
        })
      ]);

      if (sRes.ok) {
        const sData = await sRes.json();
        if (sData.secrets) {
          setPppoeSecrets(sData.secrets);
          setStatus(prev => ({ ...prev, pppoeCount: sData.secrets.length }));
        }
      }
      if (aRes.ok) {
        const aData = await aRes.json();
        if (aData.active) {
          setPppoeActive(aData.active);
          setStatus(prev => ({ ...prev, pppoeActiveCount: aData.active.length }));
        }
      }
      if (pRes.ok) {
        const pData = await pRes.json();
        if (pData.profiles && pData.profiles.length > 0) {
          setPppoeProfiles(pData.profiles);
        }
      }
    } catch (e) {
      console.error('PPPoE fetch error', e);
    }
  }, [config]);

  // Initial load
  useEffect(() => {
    fetchStatus();
    fetchHotspotData();
    fetchPppoeData();
  }, [fetchStatus, fetchHotspotData, fetchPppoeData]);

  // Auto-refresh interval (every 15s)
  useEffect(() => {
    const interval = setInterval(() => {
      fetchStatus();
    }, 15000);
    return () => clearInterval(interval);
  }, [fetchStatus]);

  // Save config
  const handleSaveConfig = (newConfig: RouterConnectionConfig) => {
    setConfig(newConfig);
    try {
      localStorage.setItem('mikrotik_cloud_config', JSON.stringify(newConfig));
    } catch {}
    setTimeout(() => {
      fetchStatus();
      fetchHotspotData();
      fetchPppoeData();
    }, 100);
  };

  const handleUpdateVpsConfig = (newVpsConfig: VpsTunnelConfig) => {
    const updated: RouterConnectionConfig = {
      ...config,
      connectionMethod: 'cloud-vps',
      host: newVpsConfig.vpsIp,
      port: newVpsConfig.forwardedApiPort || 8728,
      vpsConfig: newVpsConfig
    };
    handleSaveConfig(updated);
  };

  // Test connection
  const handleTestConnection = async (testConfig: RouterConnectionConfig) => {
    const res = await fetch('/api/mikrotik/test-connection', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(testConfig)
    });
    const data = await res.json();
    if (res.ok && data.success) {
      return {
        success: true,
        message: data.message || 'Connected successfully!',
        details: data
      };
    } else {
      throw new Error(data.error || data.hint || 'Could not connect to router');
    }
  };

  // Hotspot handlers
  const handleAddHotspotUser = async (userData: any) => {
    try {
      const res = await fetch('/api/mikrotik/hotspot/users/add', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...config, userData })
      });
      if (res.ok) {
        fetchHotspotData();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleBatchVouchers = async (vouchers: any[]) => {
    try {
      await fetch('/api/mikrotik/hotspot/users/batch-vouchers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...config, vouchers })
      });
      fetchHotspotData();
    } catch (e) {
      console.error(e);
    }
  };

  const handleToggleHotspotUser = async (id: string, currentDisabled: boolean) => {
    try {
      await fetch('/api/mikrotik/hotspot/users/toggle', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, disabled: !currentDisabled })
      });
      setHotspotUsers(prev =>
        prev.map(u => (u.id === id ? { ...u, disabled: !currentDisabled } : u))
      );
    } catch (e) {
      console.error(e);
    }
  };

  const handleDeleteHotspotUser = async (id: string, name: string) => {
    try {
      await fetch('/api/mikrotik/hotspot/users/delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, name })
      });
      setHotspotUsers(prev => prev.filter(u => u.id !== id && u.name !== name));
      setStatus(prev => ({ ...prev, hotspotCount: Math.max(0, (prev.hotspotCount || 1) - 1) }));
    } catch (e) {
      console.error(e);
    }
  };

  const handleDisconnectHotspotSession = async (id: string, user: string) => {
    try {
      await fetch('/api/mikrotik/hotspot/active/disconnect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, user })
      });
      setHotspotActive(prev => prev.filter(s => s.id !== id && s.user !== user));
      setStatus(prev => ({ ...prev, hotspotActiveCount: Math.max(0, (prev.hotspotActiveCount || 1) - 1) }));
    } catch (e) {
      console.error(e);
    }
  };

  // PPPoE handlers
  const handleAddPppoeSecret = async (secretData: any) => {
    try {
      const res = await fetch('/api/mikrotik/pppoe/secrets/add', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...config, secretData })
      });
      if (res.ok) {
        fetchPppoeData();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleTogglePppoeSecret = async (id: string, currentDisabled: boolean) => {
    try {
      await fetch('/api/mikrotik/pppoe/secrets/toggle', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, disabled: !currentDisabled })
      });
      setPppoeSecrets(prev =>
        prev.map(s => (s.id === id ? { ...s, disabled: !currentDisabled } : s))
      );
    } catch (e) {
      console.error(e);
    }
  };

  const handleDeletePppoeSecret = async (id: string, name: string) => {
    try {
      await fetch('/api/mikrotik/pppoe/secrets/delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, name })
      });
      setPppoeSecrets(prev => prev.filter(s => s.id !== id && s.name !== name));
      setStatus(prev => ({ ...prev, pppoeCount: Math.max(0, (prev.pppoeCount || 1) - 1) }));
    } catch (e) {
      console.error(e);
    }
  };

  const handleDisconnectPppoeConnection = async (id: string, name: string) => {
    try {
      await fetch('/api/mikrotik/pppoe/active/disconnect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, name })
      });
      setPppoeActive(prev => prev.filter(a => a.id !== id && a.name !== name));
      setStatus(prev => ({ ...prev, pppoeActiveCount: Math.max(0, (prev.pppoeActiveCount || 1) - 1) }));
    } catch (e) {
      console.error(e);
    }
  };

  const handleAddPppoeProfile = async (profileData: PppoeProfile) => {
    try {
      const res = await fetch('/api/mikrotik/pppoe/profiles/add', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...config, profileData })
      });
      if (res.ok) {
        const data = await res.json();
        if (data.profile) {
          setPppoeProfiles(prev => [data.profile, ...prev]);
        }
      }
    } catch (e) {
      console.error(e);
      setPppoeProfiles(prev => [profileData, ...prev]);
    }
  };

  if (!isAuthenticated) {
    return (
      <AdminLogin
        onLoginSuccess={handleLoginSuccess}
        lang={lang}
        setLang={handleSetLang}
      />
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      {/* Top Navigation */}
      <Header
        activeTab={activeTab}
        setActiveTab={(tab) => {
          if (tab === 'cloud-guide') {
            setIsGuideModalOpen(true);
          } else {
            setActiveTab(tab);
          }
        }}
        status={status}
        config={config}
        onOpenConnectModal={() => setIsConnectModalOpen(true)}
        lang={lang}
        setLang={handleSetLang}
        currentUser="admin"
        onLogout={handleLogout}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {activeTab === 'dashboard' && (
          <DashboardTab
            status={status}
            setActiveTab={setActiveTab}
            onOpenNewHotspotModal={() => setIsNewHotspotModalOpen(true)}
            onOpenNewPppoeModal={() => setIsNewPppoeModalOpen(true)}
            onOpenVoucherModal={() => setIsVoucherModalOpen(true)}
            onOpenGuideModal={() => setIsGuideModalOpen(true)}
            lang={lang}
            pppoeSecrets={pppoeSecrets}
            pppoeActive={pppoeActive}
            hotspotUsers={hotspotUsers}
          />
        )}

        {activeTab === 'hotspot' && (
          <HotspotTab
            users={hotspotUsers}
            activeSessions={hotspotActive}
            profiles={hotspotProfiles}
            onAddUser={() => setIsNewHotspotModalOpen(true)}
            onOpenVouchers={() => setIsVoucherModalOpen(true)}
            onToggleUser={handleToggleHotspotUser}
            onDeleteUser={handleDeleteHotspotUser}
            onDisconnectSession={handleDisconnectHotspotSession}
            onRefresh={fetchHotspotData}
            lang={lang}
          />
        )}

        {activeTab === 'pppoe' && (
          <PppoeTab
            secrets={pppoeSecrets}
            activeConnections={pppoeActive}
            profiles={pppoeProfiles}
            onAddSecret={() => setIsNewPppoeModalOpen(true)}
            onAddProfile={handleAddPppoeProfile}
            onToggleSecret={handleTogglePppoeSecret}
            onDeleteSecret={handleDeletePppoeSecret}
            onDisconnectConnection={handleDisconnectPppoeConnection}
            onRefresh={fetchPppoeData}
            lang={lang}
          />
        )}

        {activeTab === 'vps-tunnel' && (
          <VpsTunnelTab
            vpsConfig={config.vpsConfig || DEFAULT_VPS_CONFIG}
            onUpdateVpsConfig={handleUpdateVpsConfig}
            lang={lang}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-900 bg-slate-950 py-4 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <div>
            MikroTik RB750Gr3 (hEX) Cloud Remote Manager • RouterOS v6 & v7 Supported • Cloud VPS Tunneling
          </div>
          <div className="flex items-center gap-3 text-[11px]">
            <button 
              onClick={() => setActiveTab('vps-tunnel')}
              className="text-indigo-400 hover:underline"
            >
              Cloud VPS Tunnel (v6)
            </button>
            <span>•</span>
            <button 
              onClick={() => setIsGuideModalOpen(true)}
              className="text-cyan-400 hover:underline"
            >
              {lang === 'ur' ? 'آؤٹ آف سٹی سیٹ اپ گائیڈ' : 'Out-of-City Guide'}
            </button>
            <span>•</span>
            <button 
              onClick={() => setIsConnectModalOpen(true)}
              className="text-slate-400 hover:text-slate-200"
            >
              {lang === 'ur' ? 'کنکشن سیٹنگز' : 'Connection Config'}
            </button>
          </div>
        </div>
      </footer>

      {/* Modals */}
      <CloudSetupGuideModal
        isOpen={isGuideModalOpen}
        onClose={() => setIsGuideModalOpen(false)}
        onOpenConnectModal={() => setIsConnectModalOpen(true)}
        lang={lang}
      />

      <VoucherGeneratorModal
        isOpen={isVoucherModalOpen}
        onClose={() => setIsVoucherModalOpen(false)}
        profiles={hotspotProfiles}
        onGenerateBatch={handleBatchVouchers}
        lang={lang}
      />

      <NewHotspotUserModal
        isOpen={isNewHotspotModalOpen}
        onClose={() => setIsNewHotspotModalOpen(false)}
        profiles={hotspotProfiles}
        onAddUser={handleAddHotspotUser}
        lang={lang}
      />

      <NewPppoeSecretModal
        isOpen={isNewPppoeModalOpen}
        onClose={() => setIsNewPppoeModalOpen(false)}
        profiles={pppoeProfiles}
        onAddSecret={handleAddPppoeSecret}
        lang={lang}
      />

      <RouterConnectModal
        isOpen={isConnectModalOpen}
        onClose={() => setIsConnectModalOpen(false)}
        config={config}
        onSaveConfig={handleSaveConfig}
        onTestConnection={handleTestConnection}
        lang={lang}
      />
    </div>
  );
}
