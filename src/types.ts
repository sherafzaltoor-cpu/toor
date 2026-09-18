export interface VpsTunnelConfig {
  vpsIp: string;
  tunnelType: 'sstp' | 'l2tp' | 'ovpn';
  tunnelUser: string;
  tunnelPass: string;
  vpsTunnelPort: number;
  forwardedApiPort: number;
  forwardedWinboxPort: number;
  forwardedWebPort: number;
  routerTunnelIp: string;
  vpsGatewayIp: string;
  isConnected?: boolean;
}

export interface RouterConnectionConfig {
  host: string;
  port: number;
  useSsl: boolean;
  username: string;
  password?: string;
  simulate: boolean;
  routerOsVersion: 'v6' | 'v7';
  connectionMethod: 'cloud-vps' | 'mikrotik-ddns' | 'direct';
  vpsConfig?: VpsTunnelConfig;
}

export interface RouterStatus {
  simulated: boolean;
  identity?: string;
  boardName: string;
  model?: string;
  architecture?: string;
  cpuCount?: number;
  cpuFrequency?: string;
  cpuLoad: number;
  freeMemoryBytes?: number;
  totalMemoryBytes?: number;
  freeMemory?: string;
  totalMemory?: string;
  freeHddBytes?: number;
  totalHddBytes?: number;
  uptime: string;
  version: string;
  temperature?: string;
  voltage?: string;
  cloudDdns?: string;
  publicIp?: string;
  hotspotCount?: number;
  hotspotActiveCount?: number;
  pppoeCount?: number;
  pppoeActiveCount?: number;
}

export interface HotspotUser {
  id: string;
  name: string;
  password?: string;
  profile: string;
  uptimeLimit?: string;
  bytesLimit?: string;
  macAddress?: string;
  comment?: string;
  disabled: boolean;
  bytesIn?: number;
  bytesOut?: number;
  uptime?: string;
}

export interface HotspotActive {
  id: string;
  user: string;
  address: string;
  macAddress: string;
  uptime: string;
  bytesIn: number;
  bytesOut: number;
  loginBy?: string;
}

export interface HotspotProfile {
  id: string;
  name: string;
  rateLimit: string;
  sharedUsers: number;
  sessionTimeout: string;
  statusAutorefresh: string;
}

export interface PppoeSecret {
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

export interface PppoeActive {
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

export interface PppoeProfile {
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

export interface VoucherCard {
  id: string;
  code: string;
  pin: string;
  profile: string;
  validity: string;
  quota: string;
  price: string;
  createdAt: string;
}

export type ActiveTab = 'dashboard' | 'hotspot' | 'pppoe' | 'vps-tunnel' | 'cloud-guide';
export type Language = 'en' | 'ur';
