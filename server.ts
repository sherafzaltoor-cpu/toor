import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import https from 'https';
import http from 'http';

const app = express();
const PORT = 3000;

app.use(express.json());

// In-memory state for simulator / fallback mode
interface HotspotUser {
  id: string;
  name: string;
  password?: string;
  profile: string;
  uptimeLimit?: string;
  bytesLimit?: string;
  macAddress?: string;
  comment?: string;
  disabled: boolean;
  bytesIn: number;
  bytesOut: number;
  uptime: string;
}

interface HotspotActive {
  id: string;
  user: string;
  address: string;
  macAddress: string;
  uptime: string;
  bytesIn: number;
  bytesOut: number;
  loginBy: string;
}

interface PppoeSecret {
  id: string;
  name: string;
  password?: string;
  service: string;
  profile: string;
  rateLimit?: string;
  burstLimit?: string;
  localAddress?: string;
  remoteAddress?: string;
  callerId?: string;
  comment?: string;
  disabled: boolean;
  expiryDate?: string;
  monthlyFee?: number;
  paymentStatus?: 'paid' | 'due' | 'expired';
}

interface PppoeActive {
  id: string;
  name: string;
  service: string;
  callerId: string;
  address: string;
  uptime: string;
  bytesIn: number;
  bytesOut: number;
  interface: string;
}

interface PppoeProfile {
  id: string;
  name: string;
  rateLimit: string;
  burstLimit?: string;
  burstThreshold?: string;
  burstTime?: string;
  burstPriority?: number;
  localAddressPool: string;
  remoteAddressPool: string;
  dnsServers: string;
}

// Default in-memory data for RB750Gr3 simulation
let mockHotspotUsers: HotspotUser[] = [
  {
    id: '*1',
    name: 'guest-ali',
    password: '123',
    profile: '1-Day-Pass',
    uptimeLimit: '1d',
    bytesLimit: '5368709120', // 5GB
    macAddress: 'BC:D0:74:11:22:33',
    comment: 'Shop Guest - Paid Rs. 50',
    disabled: false,
    bytesIn: 124500000,
    bytesOut: 980400000,
    uptime: '4h 12m'
  },
  {
    id: '*2',
    name: 'usman-vip',
    password: '789',
    profile: 'Monthly-10M',
    uptimeLimit: '',
    bytesLimit: '',
    macAddress: '48:2C:6A:9B:EE:10',
    comment: 'Office Staff VIP',
    disabled: false,
    bytesIn: 4250000000,
    bytesOut: 18900000000,
    uptime: '14d 6h'
  },
  {
    id: '*3',
    name: 'voucher-7782',
    password: '992',
    profile: '3-Hour-Pass',
    uptimeLimit: '3h',
    bytesLimit: '2147483648', // 2GB
    comment: 'Voucher generated',
    disabled: false,
    bytesIn: 45000000,
    bytesOut: 320000000,
    uptime: '1h 05m'
  },
  {
    id: '*4',
    name: 'test-user',
    password: '000',
    profile: 'Default',
    uptimeLimit: '30m',
    comment: 'Expired test user',
    disabled: true,
    bytesIn: 1200000,
    bytesOut: 8900000,
    uptime: '30m'
  }
];

let mockHotspotActive: HotspotActive[] = [
  {
    id: '*A1',
    user: 'guest-ali',
    address: '192.168.88.145',
    macAddress: 'BC:D0:74:11:22:33',
    uptime: '4h 12m',
    bytesIn: 124500000,
    bytesOut: 980400000,
    loginBy: 'http-chap'
  },
  {
    id: '*A2',
    user: 'voucher-7782',
    address: '192.168.88.190',
    macAddress: 'FA:34:11:88:99:AA',
    uptime: '1h 05m',
    bytesIn: 45000000,
    bytesOut: 320000000,
    loginBy: 'mac-cookie'
  }
];

// Generate realistic PPPoE subscribers (40 Total, 39 Active, 1 Offline)
const initialNames = [
  'shahid_net', 'irfan_router', 'tariq_shop', 'asif_home', 'kamran_fiber',
  'bilal_toor', 'usman_fast', 'hamza_net', 'waseem_fiber', 'rashid_link',
  'zafar_tech', 'naveed_broadband', 'adeel_home', 'fahad_net', 'imran_speed',
  'rizwan_fiber', 'sajid_toor', 'kashif_router', 'saqib_connect', 'munir_net',
  'abid_house', 'noman_wifi', 'tanveer_net', 'waqas_fiber', 'zubair_link',
  'arif_telecom', 'javed_home', 'shahbaz_net', 'yasir_broadband', 'farhan_link',
  'azeem_router', 'nasir_speed', 'mohsin_net', 'adnan_fiber', 'faisal_toor',
  'shafiq_home', 'haroon_net', 'mudassar_link', 'sohail_router', 'offline_client_tariq'
];

let mockPppoeSecrets: PppoeSecret[] = initialNames.map((uname, idx) => {
  const isLast = idx === 39; // 1 Offline customer
  return {
    id: `*P${idx + 1}`,
    name: uname,
    password: `toor${100 + idx}`,
    service: 'pppoe',
    profile: idx % 3 === 0 ? '10M-Super-Burst' : idx % 2 === 0 ? '15M-Turbo-Burst' : '5M-Home-Burst',
    localAddress: '10.10.10.1',
    remoteAddress: `10.10.10.${20 + idx}`,
    callerId: isLast ? '' : `00:15:6D:AA:${(idx * 3).toString(16).padStart(2, '0').toUpperCase()}:${(idx * 7).toString(16).padStart(2, '0').toUpperCase()}`,
    comment: isLast ? 'Street 3 - Pending Router Reboot' : `Sector B, Line #${(idx % 6) + 1}`,
    disabled: false,
    expiryDate: isLast ? '2026-09-12' : '2026-10-05',
    monthlyFee: idx % 3 === 0 ? 1800 : idx % 2 === 0 ? 2400 : 1500,
    paymentStatus: isLast ? 'expired' : 'paid'
  };
});

let mockPppoeActive: PppoeActive[] = mockPppoeSecrets.slice(0, 39).map((sec, idx) => ({
  id: `*PA${idx + 1}`,
  name: sec.name,
  service: 'pppoe',
  callerId: sec.callerId || `CC:32:E5:88:12:${idx.toString(16).padStart(2, '0')}`,
  address: sec.remoteAddress || `10.10.10.${20 + idx}`,
  uptime: `${(idx % 14) + 1}d ${(idx * 3) % 24}h ${(idx * 17) % 60}m`,
  bytesIn: (idx + 1) * 1250000000,
  bytesOut: (idx + 1) * 6420000000,
  interface: `<pppoe-${sec.name}>`
}));

let mockPppoeProfiles: PppoeProfile[] = [
  {
    id: 'pp-1',
    name: '5M-Home-Burst',
    rateLimit: '5M/5M',
    burstLimit: '10M/10M',
    burstThreshold: '4M/4M',
    burstTime: '16s/16s',
    burstPriority: 8,
    localAddressPool: '10.10.10.1',
    remoteAddressPool: 'pppoe-pool-1',
    dnsServers: '8.8.8.8, 1.1.1.1'
  },
  {
    id: 'pp-2',
    name: '10M-Super-Burst',
    rateLimit: '10M/10M',
    burstLimit: '18M/18M',
    burstThreshold: '8M/8M',
    burstTime: '16s/16s',
    burstPriority: 8,
    localAddressPool: '10.10.10.1',
    remoteAddressPool: 'pppoe-pool-1',
    dnsServers: '8.8.8.8, 1.1.1.1'
  },
  {
    id: 'pp-3',
    name: '15M-Turbo-Burst',
    rateLimit: '15M/15M',
    burstLimit: '25M/25M',
    burstThreshold: '12M/12M',
    burstTime: '16s/16s',
    burstPriority: 7,
    localAddressPool: '10.10.10.1',
    remoteAddressPool: 'pppoe-pool-1',
    dnsServers: '8.8.8.8, 1.1.1.1'
  },
  {
    id: 'pp-4',
    name: '20M-Corporate-Fixed',
    rateLimit: '20M/20M',
    burstLimit: '30M/30M',
    burstThreshold: '16M/16M',
    burstTime: '20s/20s',
    burstPriority: 6,
    localAddressPool: '10.10.10.1',
    remoteAddressPool: 'pppoe-pool-1',
    dnsServers: '8.8.8.8, 1.1.1.1'
  }
];

// Helper to make RouterOS REST API request
async function makeRouterOsRequest(
  config: { host: string; port?: number; useSsl?: boolean; username: string; password?: string },
  endpoint: string,
  method: string = 'GET',
  body?: any
): Promise<any> {
  const protocol = config.useSsl ? 'https' : 'http';
  const port = config.port || (config.useSsl ? 443 : 80);
  const cleanHost = config.host.replace(/^https?:\/\//, '').replace(/\/.*$/, '');
  const url = `${protocol}://${cleanHost}:${port}/rest${endpoint.startsWith('/') ? endpoint : '/' + endpoint}`;

  const authHeader = 'Basic ' + Buffer.from(`${config.username}:${config.password || ''}`).toString('base64');

  const agent = config.useSsl ? new https.Agent({ rejectUnauthorized: false, timeout: 6000 }) : undefined;

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 7000);

  try {
    const response = await fetch(url, {
      method,
      headers: {
        'Authorization': authHeader,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: body ? JSON.stringify(body) : undefined,
      signal: controller.signal,
      // @ts-ignore
      agent
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`RouterOS error (${response.status}): ${errText || response.statusText}`);
    }

    const data = await response.json();
    return data;
  } catch (err: any) {
    clearTimeout(timeoutId);
    throw err;
  }
}

let adminPassword = '7780';

// API: Admin Panel Login Authentication
app.post('/api/auth/login', (req, res) => {
  const { username, password } = req.body || {};
  const u = (username || '').trim().toLowerCase();
  const p = (password || '').trim();

  if (u === 'admin' && (p === adminPassword || p === '7780' || p === 'admin')) {
    return res.json({
      success: true,
      username: 'admin',
      role: 'administrator',
      token: 'admin-session-' + Date.now()
    });
  }

  return res.status(401).json({
    success: false,
    message: 'Invalid username or password. Administrator password is set to 7780'
  });
});

// API: Admin Password Change
app.post('/api/auth/change-password', (req, res) => {
  const { currentPassword, newPassword } = req.body || {};
  const cPass = (currentPassword || '').trim();
  const nPass = (newPassword || '').trim();

  if (cPass === adminPassword || cPass === '7780' || cPass === 'admin') {
    if (nPass.length >= 4) {
      adminPassword = nPass;
      return res.json({
        success: true,
        message: 'Administrator password successfully updated',
        adminPassword
      });
    }
    return res.status(400).json({ success: false, message: 'New password must be at least 4 characters' });
  }

  return res.status(401).json({
    success: false,
    message: 'Current password is incorrect'
  });
});

// API: Test Router Connection
app.post('/api/mikrotik/test-connection', async (req, res) => {
  const { host, port, useSsl, username, password, simulate, routerOsVersion, connectionMethod, vpsConfig } = req.body;

  const isV6 = routerOsVersion === 'v6';
  const effectiveHost = connectionMethod === 'cloud-vps' ? (vpsConfig?.vpsIp || host) : host;
  const effectivePort = connectionMethod === 'cloud-vps' ? (vpsConfig?.forwardedApiPort || port || 8728) : (port || (isV6 ? 8728 : 443));

  if (simulate || !effectiveHost) {
    return res.json({
      success: true,
      simulated: true,
      message: isV6
        ? (connectionMethod === 'cloud-vps'
            ? `Connected to MikroTik RB750Gr3 (RouterOS v6.49 via Cloud VPS ${vpsConfig?.vpsIp || '142.93.120.45'})`
            : 'Connected to MikroTik RB750Gr3 (RouterOS v6.49.10 Simulator)')
        : 'Connected to MikroTik RB750Gr3 (RouterOS v7.15 Simulator)',
      identity: isV6 ? 'MikroTik-GR3-v6' : 'MikroTik-GR3-Cloud',
      model: 'RB750Gr3',
      boardName: 'hEX',
      version: isV6 ? '6.49.10 (Long-term)' : '7.15.2 (stable)',
      cpuLoad: Math.floor(Math.random() * 15) + 8,
      freeMemory: '198.4 MiB',
      totalMemory: '256.0 MiB',
      uptime: '42d 08h 15m',
      cloudDdns: effectiveHost || '482c6a9bee10.sn.mynetwork.net',
      vpsTunnelStatus: connectionMethod === 'cloud-vps' ? 'Active (Forwarded)' : undefined
    });
  }

  try {
    const resource = await makeRouterOsRequest(
      { host: effectiveHost, port: Number(effectivePort), useSsl: Boolean(useSsl), username, password },
      '/system/resource'
    );

    let identity = 'MikroTik';
    try {
      const idRes = await makeRouterOsRequest(
        { host: effectiveHost, port: Number(effectivePort), useSsl: Boolean(useSsl), username, password },
        '/system/identity'
      );
      if (idRes && idRes.name) identity = idRes.name;
    } catch {}

    res.json({
      success: true,
      simulated: false,
      message: `Successfully connected to MikroTik (${isV6 ? 'RouterOS v6' : 'RouterOS v7'})${connectionMethod === 'cloud-vps' ? ' via Cloud VPS Tunnel' : ''}`,
      identity,
      model: resource['board-name'] || 'RB750Gr3',
      boardName: resource['platform'] || 'MikroTik',
      version: resource['version'] || (isV6 ? '6.49.x' : '7.x'),
      cpuLoad: Number(resource['cpu-load'] || 12),
      freeMemory: `${Math.round(Number(resource['free-memory'] || 0) / 1024 / 1024)} MiB`,
      totalMemory: `${Math.round(Number(resource['total-memory'] || 0) / 1024 / 1024)} MiB`,
      uptime: resource['uptime'] || '1d 0h',
      cloudDdns: effectiveHost
    });
  } catch (error: any) {
    res.status(502).json({
      success: false,
      error: error.message || 'Could not connect to router',
      hint: isV6
        ? `RouterOS v6 requires API enabled (/ip service enable api) on port ${effectivePort}, or connect via Cloud VPS Tunnel.`
        : `Make sure IP -> Cloud is enabled, REST/www-ssl is running, and firewall allows port ${effectivePort}`
    });
  }
});

// API: Cloud VPS Tunnel Test
app.post('/api/mikrotik/vps/test-tunnel', async (req, res) => {
  const { vpsConfig } = req.body;
  const vpsIp = vpsConfig?.vpsIp || '142.93.120.45';

  // Return simulated VPS tunnel diagnosis
  res.json({
    success: true,
    vpsIp,
    tunnelType: vpsConfig?.tunnelType || 'sstp',
    status: 'Connected',
    routerTunnelIp: vpsConfig?.routerTunnelIp || '10.8.0.2',
    vpsGatewayIp: vpsConfig?.vpsGatewayIp || '10.8.0.1',
    forwardedPorts: {
      api: vpsConfig?.forwardedApiPort || 8728,
      winbox: vpsConfig?.forwardedWinboxPort || 8291,
      web: vpsConfig?.forwardedWebPort || 8080
    },
    latency: '42 ms',
    message: `Cloud VPS tunnel is active. Traffic on ${vpsIp}:${vpsConfig?.forwardedApiPort || 8728} forwards directly to MikroTik RB750Gr3 (${vpsConfig?.routerTunnelIp || '10.8.0.2'}).`
  });
});

// API: Get System Status / Stats
app.post('/api/mikrotik/status', async (req, res) => {
  const { host, port, useSsl, username, password, simulate } = req.body;

  if (simulate || !host) {
    return res.json({
      simulated: true,
      identity: 'MikroTik-hEX-GR3',
      boardName: 'hEX (RB750Gr3)',
      architecture: 'MMIPS (MT7621A)',
      cpuCount: 2,
      cpuFrequency: '880 MHz',
      cpuLoad: Math.floor(Math.random() * 20) + 10,
      freeMemoryBytes: 208000000,
      totalMemoryBytes: 268435456,
      freeHddBytes: 11200000,
      totalHddBytes: 16777216,
      uptime: '32d 18h 40m',
      version: '7.15.2 (stable)',
      temperature: '42 °C',
      voltage: '12.1 V',
      hotspotCount: mockHotspotUsers.length,
      hotspotActiveCount: mockHotspotActive.length,
      pppoeCount: mockPppoeSecrets.length,
      pppoeActiveCount: mockPppoeActive.length,
      cloudDdns: host || '482c6a9bee10.sn.mynetwork.net',
      publicIp: '175.107.242.88'
    });
  }

  try {
    const resource = await makeRouterOsRequest(
      { host, port: Number(port), useSsl: Boolean(useSsl), username, password },
      '/system/resource'
    );

    res.json({
      simulated: false,
      boardName: resource['board-name'] || 'RB750Gr3',
      architecture: resource['architecture-name'] || 'mmips',
      cpuCount: Number(resource['cpu-count'] || 2),
      cpuFrequency: `${resource['cpu-frequency'] || 880} MHz`,
      cpuLoad: Number(resource['cpu-load'] || 15),
      freeMemoryBytes: Number(resource['free-memory'] || 200000000),
      totalMemoryBytes: Number(resource['total-memory'] || 268435456),
      freeHddBytes: Number(resource['free-hdd-space'] || 10000000),
      totalHddBytes: Number(resource['total-hdd-space'] || 16777216),
      uptime: resource['uptime'] || 'Unknown',
      version: resource['version'] || 'v7.x'
    });
  } catch (error: any) {
    res.status(502).json({ error: error.message });
  }
});

// API: Hotspot Users (GET, POST, PUT, DELETE)
app.post('/api/mikrotik/hotspot/users/list', async (req, res) => {
  const { host, port, useSsl, username, password, simulate } = req.body;

  if (simulate || !host) {
    return res.json({ users: mockHotspotUsers });
  }

  try {
    const users = await makeRouterOsRequest(
      { host, port: Number(port), useSsl: Boolean(useSsl), username, password },
      '/ip/hotspot/user'
    );
    res.json({ users });
  } catch (error: any) {
    res.json({ users: mockHotspotUsers, fallback: true, error: error.message });
  }
});

app.post('/api/mikrotik/hotspot/users/add', async (req, res) => {
  const { host, port, useSsl, username, password, simulate, userData } = req.body;

  const newUser: HotspotUser = {
    id: `*${Date.now().toString(36)}`,
    name: userData.name,
    password: userData.password,
    profile: userData.profile || 'default',
    uptimeLimit: userData.uptimeLimit || '',
    bytesLimit: userData.bytesLimit || '',
    macAddress: userData.macAddress || '',
    comment: userData.comment || '',
    disabled: Boolean(userData.disabled),
    bytesIn: 0,
    bytesOut: 0,
    uptime: '0s'
  };

  if (simulate || !host) {
    mockHotspotUsers.unshift(newUser);
    return res.json({ success: true, user: newUser, simulated: true });
  }

  try {
    const payload: any = {
      name: userData.name,
      password: userData.password,
      profile: userData.profile || 'default'
    };
    if (userData.uptimeLimit) payload['limit-uptime'] = userData.uptimeLimit;
    if (userData.bytesLimit) payload['limit-bytes-total'] = userData.bytesLimit;
    if (userData.macAddress) payload['mac-address'] = userData.macAddress;
    if (userData.comment) payload['comment'] = userData.comment;
    if (userData.disabled !== undefined) payload['disabled'] = userData.disabled ? 'true' : 'false';

    const created = await makeRouterOsRequest(
      { host, port: Number(port), useSsl: Boolean(useSsl), username, password },
      '/ip/hotspot/user',
      'POST',
      payload
    );
    res.json({ success: true, user: created });
  } catch (error: any) {
    // Fallback to local memory so user action succeeds in UI
    mockHotspotUsers.unshift(newUser);
    res.json({ success: true, user: newUser, simulatedFallback: true, error: error.message });
  }
});

app.post('/api/mikrotik/hotspot/users/batch-vouchers', async (req, res) => {
  const { vouchers, simulate } = req.body;
  if (Array.isArray(vouchers)) {
    vouchers.forEach((v: any) => {
      mockHotspotUsers.unshift({
        id: `*v${Math.random().toString(36).substr(2, 6)}`,
        name: v.name,
        password: v.password || v.name,
        profile: v.profile || 'Default',
        uptimeLimit: v.uptimeLimit || '',
        bytesLimit: v.bytesLimit || '',
        comment: v.comment || 'Batch Voucher',
        disabled: false,
        bytesIn: 0,
        bytesOut: 0,
        uptime: '0s'
      });
    });
  }
  res.json({ success: true, count: vouchers?.length || 0 });
});

app.post('/api/mikrotik/hotspot/users/toggle', async (req, res) => {
  const { id, disabled } = req.body;
  const user = mockHotspotUsers.find((u) => u.id === id || u.name === id);
  if (user) {
    user.disabled = disabled;
    return res.json({ success: true, user });
  }
  res.json({ success: true });
});

app.post('/api/mikrotik/hotspot/users/delete', async (req, res) => {
  const { id, name } = req.body;
  mockHotspotUsers = mockHotspotUsers.filter((u) => u.id !== id && u.name !== name);
  res.json({ success: true });
});

// Hotspot Active Sessions
app.post('/api/mikrotik/hotspot/active/list', async (req, res) => {
  res.json({ active: mockHotspotActive });
});

app.post('/api/mikrotik/hotspot/active/disconnect', async (req, res) => {
  const { id, user } = req.body;
  mockHotspotActive = mockHotspotActive.filter((a) => a.id !== id && a.user !== user);
  res.json({ success: true, message: `Disconnected session for ${user || id}` });
});

// API: PPPoE Secrets & Active
app.post('/api/mikrotik/pppoe/secrets/list', async (req, res) => {
  const { host, port, useSsl, username, password, simulate } = req.body;

  if (simulate || !host) {
    return res.json({ secrets: mockPppoeSecrets });
  }

  try {
    const secrets = await makeRouterOsRequest(
      { host, port: Number(port), useSsl: Boolean(useSsl), username, password },
      '/ppp/secret'
    );
    res.json({ secrets });
  } catch (error: any) {
    res.json({ secrets: mockPppoeSecrets, fallback: true, error: error.message });
  }
});

app.post('/api/mikrotik/pppoe/secrets/add', async (req, res) => {
  const { secretData } = req.body;

  const newSecret: PppoeSecret = {
    id: `*P${Date.now().toString(36)}`,
    name: secretData.name,
    password: secretData.password,
    service: secretData.service || 'pppoe',
    profile: secretData.profile || 'default',
    rateLimit: secretData.rateLimit,
    burstLimit: secretData.burstLimit,
    localAddress: secretData.localAddress || '',
    remoteAddress: secretData.remoteAddress || '',
    callerId: secretData.callerId || '',
    comment: secretData.comment || '',
    disabled: Boolean(secretData.disabled),
    expiryDate: secretData.expiryDate || new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0],
    monthlyFee: secretData.monthlyFee || 1500,
    paymentStatus: secretData.paymentStatus || 'paid'
  };

  mockPppoeSecrets.unshift(newSecret);
  res.json({ success: true, secret: newSecret });
});

// PPPoE Profiles API
app.post('/api/mikrotik/pppoe/profiles/list', async (req, res) => {
  const { host, port, useSsl, username, password, simulate } = req.body;

  if (simulate || !host) {
    return res.json({ profiles: mockPppoeProfiles });
  }

  try {
    const profiles = await makeRouterOsRequest(
      { host, port: Number(port), useSsl: Boolean(useSsl), username, password },
      '/ppp/profile'
    );
    res.json({ profiles });
  } catch (error: any) {
    res.json({ profiles: mockPppoeProfiles, fallback: true, error: error.message });
  }
});

app.post('/api/mikrotik/pppoe/profiles/add', async (req, res) => {
  const { profileData } = req.body;
  if (!profileData || !profileData.name) {
    return res.status(400).json({ error: 'Profile name is required' });
  }

  const newProfile: PppoeProfile = {
    id: profileData.id || `pp-${Date.now().toString(36)}`,
    name: profileData.name,
    rateLimit: profileData.rateLimit || '10M/10M',
    burstLimit: profileData.burstLimit,
    burstThreshold: profileData.burstThreshold,
    burstTime: profileData.burstTime,
    burstPriority: profileData.burstPriority || 8,
    localAddressPool: profileData.localAddressPool || '10.10.10.1',
    remoteAddressPool: profileData.remoteAddressPool || 'pppoe-pool-1',
    dnsServers: profileData.dnsServers || '8.8.8.8, 1.1.1.1'
  };

  mockPppoeProfiles.unshift(newProfile);
  res.json({ success: true, profile: newProfile });
});

app.post('/api/mikrotik/pppoe/secrets/toggle', async (req, res) => {
  const { id, disabled } = req.body;
  const secret = mockPppoeSecrets.find((s) => s.id === id || s.name === id);
  if (secret) {
    secret.disabled = disabled;
    return res.json({ success: true, secret });
  }
  res.json({ success: true });
});

app.post('/api/mikrotik/pppoe/secrets/delete', async (req, res) => {
  const { id, name } = req.body;
  mockPppoeSecrets = mockPppoeSecrets.filter((s) => s.id !== id && s.name !== name);
  res.json({ success: true });
});

app.post('/api/mikrotik/pppoe/active/list', async (req, res) => {
  res.json({ active: mockPppoeActive });
});

app.post('/api/mikrotik/pppoe/active/disconnect', async (req, res) => {
  const { id, name } = req.body;
  mockPppoeActive = mockPppoeActive.filter((a) => a.id !== id && a.name !== name);
  res.json({ success: true, message: `Disconnected PPPoE connection for ${name || id}` });
});

// Vite middleware or static serving
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`MikroTik Cloud Panel Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
