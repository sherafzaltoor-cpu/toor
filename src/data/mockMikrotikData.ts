import { HotspotProfile, PppoeProfile, RouterStatus, VpsTunnelConfig } from '../types';

export const DEFAULT_ROUTER_STATUS: RouterStatus = {
  simulated: true,
  identity: 'MikroTik-GR3-Cloud',
  boardName: 'hEX (RB750Gr3)',
  model: 'RB750Gr3',
  architecture: 'MMIPS (MT7621A)',
  cpuCount: 2,
  cpuFrequency: '880 MHz',
  cpuLoad: 14,
  freeMemoryBytes: 208000000,
  totalMemoryBytes: 268435456,
  freeMemory: '198.4 MiB',
  totalMemory: '256.0 MiB',
  uptime: '28d 14h 52m',
  version: '6.49.10 (Long-term)',
  temperature: '43 °C',
  voltage: '12.2 V',
  cloudDdns: '482c6a9bee10.sn.mynetwork.net',
  publicIp: '175.107.242.88',
  hotspotCount: 28,
  hotspotActiveCount: 24,
  pppoeCount: 40,
  pppoeActiveCount: 39
};

export const DEFAULT_HOTSPOT_PROFILES: HotspotProfile[] = [
  {
    id: 'hp-1',
    name: 'Default',
    rateLimit: '2M/2M',
    sharedUsers: 1,
    sessionTimeout: '2h',
    statusAutorefresh: '1m'
  },
  {
    id: 'hp-2',
    name: '1-Day-Pass',
    rateLimit: '4M/4M',
    sharedUsers: 1,
    sessionTimeout: '24h',
    statusAutorefresh: '1m'
  },
  {
    id: 'hp-3',
    name: '3-Hour-Pass',
    rateLimit: '5M/5M',
    sharedUsers: 1,
    sessionTimeout: '3h',
    statusAutorefresh: '1m'
  },
  {
    id: 'hp-4',
    name: 'Monthly-10M',
    rateLimit: '10M/10M',
    sharedUsers: 2,
    sessionTimeout: '30d',
    statusAutorefresh: '1m'
  },
  {
    id: 'hp-5',
    name: 'Unlimited-VIP',
    rateLimit: '20M/20M',
    sharedUsers: 3,
    sessionTimeout: '0s',
    statusAutorefresh: '1m'
  }
];

export const DEFAULT_PPPOE_PROFILES: PppoeProfile[] = [
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

export function buildMikrotikRateLimit(options: {
  rateLimit: string;
  burstLimit?: string;
  burstThreshold?: string;
  burstTime?: string;
  burstPriority?: number;
}): string {
  if (!options.burstLimit || options.burstLimit.trim() === '') {
    return options.rateLimit;
  }
  const thresh = options.burstThreshold || options.rateLimit;
  const time = options.burstTime || '16s/16s';
  const priority = options.burstPriority || 8;
  return `${options.rateLimit} ${options.burstLimit} ${thresh} ${time} ${priority}`;
}

export const DEFAULT_VPS_CONFIG: VpsTunnelConfig = {
  vpsIp: '142.93.120.45',
  tunnelType: 'sstp',
  tunnelUser: 'mikrotik_gr3',
  tunnelPass: 'VpsSecurePass2026',
  vpsTunnelPort: 443,
  forwardedApiPort: 8728,
  forwardedWinboxPort: 8291,
  forwardedWebPort: 8080,
  routerTunnelIp: '10.8.0.2',
  vpsGatewayIp: '10.8.0.1',
  isConnected: true
};

// RouterOS Version 6 Script
export function generateMikrotikV6TerminalScript(options: {
  username?: string;
  password?: string;
  apiPort?: number;
}): string {
  const user = options.username || 'admin';
  const pass = options.password || 'admin';
  const apiPort = options.apiPort || 8728;

  return `# ========================================================
# MikroTik RB750Gr3 (hEX) - RouterOS Version 6 Setup Script
# Run in WinBox -> "New Terminal"
# ========================================================

# 1. Enable MikroTik Cloud DDNS (v6 syntax)
/ip cloud set ddns-enabled=yes update-time=yes
/ip cloud force-update

# 2. Enable RouterOS v6 API and WWW services
/ip service set api port=${apiPort} disabled=no
/ip service set api-ssl port=8729 disabled=no
/ip service set www port=80 disabled=no
/ip service set www-ssl port=443 disabled=no

# 3. Create Cloud Web Panel User with required API permissions
/user group add name=cloud-manager policy=api,read,write,test,!ftp,!reboot,!policy,!winbox,!password
/user add name=${user} group=cloud-manager password="${pass}" comment="Cloud Web Panel Manager"

# 4. Allow incoming API & Web connections in Firewall
/ip firewall filter add chain=input protocol=tcp dst-port=${apiPort},8729,80,443 action=accept comment="Allow Cloud Panel Access (v6)" place-before=1

# 5. Verify your RouterOS v6 Cloud DNS address:
:put "Your MikroTik Cloud DNS Hostname is:"
/ip cloud print

# ========================================================
# Setup Complete! Copy your *.sn.mynetwork.net into Cloud Panel
# ========================================================`;
}

// RouterOS Version 7 Script
export function generateMikrotikTerminalScript(options: {
  username?: string;
  password?: string;
  port?: number;
}): string {
  const user = options.username || 'admin';
  const pass = options.password || 'admin';
  const port = options.port || 443;

  return `# ========================================================
# MikroTik RB750Gr3 (hEX) - RouterOS v7 Cloud Access Script
# Run in WinBox -> "New Terminal"
# ========================================================

# 1. Enable Free MikroTik Cloud DDNS
/ip cloud set ddns-enabled=yes update-time=yes
/ip cloud force-update

# 2. Enable RouterOS REST API / Web SSL service on port ${port}
/ip service set www-ssl port=${port} disabled=no
/ip service set api-ssl disabled=no

# 3. Create Cloud Web Panel User with required permissions
/user group add name=cloud-manager policy=api,read,write,test,!ftp,!reboot,!policy,!winbox,!password
/user add name=${user} group=cloud-manager password="${pass}" comment="Cloud Web Panel API User"

# 4. Add Firewall Rule to allow incoming Cloud API traffic on port ${port}
/ip firewall filter add chain=input protocol=tcp dst-port=${port} action=accept comment="Allow Cloud Panel Access (${port})" place-before=1

# 5. Check your permanent Cloud DDNS address:
:put "Your MikroTik Cloud DNS Hostname is:"
/ip cloud print

# ========================================================
# Setup Complete! Copy your *.sn.mynetwork.net into Cloud Panel
# ========================================================`;
}

// Cloud VPS Tunnel Client Script for MikroTik (RouterOS v6 & v7)
export function generateVpsTunnelMikrotikScript(vps: VpsTunnelConfig): string {
  return `# ========================================================
# MikroTik RB750Gr3 (RouterOS v6 / v7) -> Cloud VPS Tunnel Client
# Run in WinBox -> "New Terminal"
# This bypasses ISP CGNAT & enables 100% Out-of-City Remote Access!
# ========================================================

# 1. Add SSTP Client Interface connected to your Cloud VPS
/interface sstp-client add name="sstp-cloud-vps" \\
    connect-to=${vps.vpsIp} \\
    port=${vps.vpsTunnelPort || 443} \\
    user="${vps.tunnelUser}" \\
    password="${vps.tunnelPass}" \\
    profile=default-encryption \\
    add-default-route=no \\
    verify-server-certificate=no \\
    disabled=no \\
    comment="Cloud VPS Remote Access Tunnel"

# 2. Ensure RouterOS API service is listening on port ${vps.forwardedApiPort}
/ip service set api port=${vps.forwardedApiPort} disabled=no
/ip service set winbox port=8291 disabled=no

# 3. Allow incoming traffic from your Cloud VPS tunnel IP (${vps.vpsGatewayIp})
/ip firewall filter add chain=input in-interface=sstp-cloud-vps action=accept comment="Allow Cloud VPS Panel Access" place-before=1

# ========================================================
# Done! Your router is now securely tunneled to your Cloud VPS.
# ========================================================`;
}

// Linux Cloud VPS Server Setup Script (1-Click for Ubuntu/Debian)
export function generateVpsLinuxSetupScript(vps: VpsTunnelConfig): string {
  return `#!/bin/bash
# ====================================================================
# Cloud VPS Server Setup Script for MikroTik RB750Gr3 (RouterOS v6)
# Works on Ubuntu 20.04 / 22.04 / 24.04 & Debian
# Run this on your Cloud VPS via SSH as root (sudo bash setup-vps.sh)
# ====================================================================

set -e

echo ">>> 1. Updating packages and installing SSTP server & iptables..."
apt-get update -y
apt-get install -y accel-ppp iptables-persistent socat curl ufw

echo ">>> 2. Enabling IP Forwarding on Cloud VPS kernel..."
sysctl -w net.ipv4.ip_forward=1
sed -i 's/#net.ipv4.ip_forward=1/net.ipv4.ip_forward=1/' /etc/sysctl.conf

echo ">>> 3. Configuring SSTP credentials for MikroTik RB750Gr3..."
cat <<EOF > /etc/accel-ppp.conf
[modules]
log_file
sstp
auth_mschap_v2
ippool

[core]
log-error=/var/log/accel-ppp/accel-ppp.log
thread-count=2

[sstp]
verbose=1
ip-change=1
accept=all
ssl=0
port=${vps.vpsTunnelPort || 443}

[client-ip-range]
0.0.0.0/0

[ip-pool]
gw-ip-address=${vps.vpsGatewayIp || '10.8.0.1'}
${vps.routerTunnelIp || '10.8.0.2'}

[auth]
${vps.tunnelUser} * ${vps.tunnelPass} *

[log]
log-file=/var/log/accel-ppp/accel-ppp.log
log-emerg=/var/log/accel-ppp/emerg.log
log-fail-file=/var/log/accel-ppp/auth-fail.log
copy=1
color=1
level=3
EOF

echo ">>> 4. Configuring Port Forwarding from VPS Public IP to MikroTik (${vps.routerTunnelIp})..."
# Forward API Port (${vps.forwardedApiPort})
iptables -t nat -A PREROUTING -p tcp --dport ${vps.forwardedApiPort} -j DNAT --to-destination ${vps.routerTunnelIp}:${vps.forwardedApiPort}

# Forward Winbox Port (${vps.forwardedWinboxPort})
iptables -t nat -A PREROUTING -p tcp --dport ${vps.forwardedWinboxPort} -j DNAT --to-destination ${vps.routerTunnelIp}:8291

# Forward Web Panel Port (${vps.forwardedWebPort})
iptables -t nat -A PREROUTING -p tcp --dport ${vps.forwardedWebPort} -j DNAT --to-destination ${vps.routerTunnelIp}:80

# NAT masquerade to tunnel
iptables -t nat -A POSTROUTING -j MASQUERADE

# Save iptables rules
netfilter-persistent save

echo ">>> 5. Starting SSTP Tunnel service on Cloud VPS..."
systemctl restart accel-ppp || true

echo "===================================================================="
echo " Cloud VPS Setup Complete!"
echo " VPS Public IP: ${vps.vpsIp}"
echo " MikroTik API Forwarded: ${vps.vpsIp}:${vps.forwardedApiPort}"
echo " WinBox Out-of-City Port: ${vps.vpsIp}:${vps.forwardedWinboxPort}"
echo "===================================================================="
`;
}

export function formatBytes(bytes: number = 0): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}
