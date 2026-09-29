'use client';

import React from 'react';
import { 
  Activity, 
  Wifi, 
  BatteryCharging, 
  Cpu, 
  RefreshCw, 
  Zap, 
  Radio, 
  ShieldCheck 
} from 'lucide-react';
import { DeviceStatus } from '@/lib/types';

interface HardwareHealthProps {
  devices: DeviceStatus[];
  onRefreshDevices: () => void;
  isSupabaseConnected: boolean;
}

export const HardwareHealth: React.FC<HardwareHealthProps> = ({
  devices,
  onRefreshDevices,
  isSupabaseConnected
}) => {
  return (
    <div 
      className="border rounded-3xl p-6 shadow-xl space-y-6 transition-colors duration-300"
      style={{ background: 'var(--bg-card)', borderColor: 'var(--border-primary)' }}
    >
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <Activity className="w-5 h-5 text-indigo-400" />
            <h3 className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>
              ตรวจสอบสถานะการเชื่อมต่อและอุปกรณ์ในระบบ (Hardware Diagnostics)
            </h3>
          </div>
          <p className="text-xs mt-1" style={{ color: 'var(--text-secondary)' }}>
            ติดตามการทำงานของไมโครคอนโทรลเลอร์ ESP32, เซนเซอร์วัดความชื้นดิน, มอดูลรีเลย์ปั๊มน้ำ และสัญญาณไร้สาย
          </p>
        </div>

        <button
          onClick={onRefreshDevices}
          className="flex items-center space-x-2 px-4 py-2 rounded-xl border text-xs font-semibold transition"
          style={{ 
            background: 'var(--bg-input)', 
            borderColor: 'var(--border-primary)', 
            color: 'var(--text-primary)' 
          }}
        >
          <RefreshCw className="w-4 h-4 text-emerald-400" />
          <span>ตรวจสอบฮาร์ดแวร์</span>
        </button>
      </div>

      {/* Database & Gateway Connectivity Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div 
          className="p-4 rounded-2xl border flex items-center space-x-3 transition-colors"
          style={{ background: 'var(--bg-input)', borderColor: 'var(--border-primary)' }}
        >
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center justify-center">
            <Radio className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <span className="text-xs block font-medium" style={{ color: 'var(--text-secondary)' }}>เกตเวย์หลัก (Main Gateway)</span>
            <span className="font-bold text-emerald-400 text-sm flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              ออนไลน์ (100% Online)
            </span>
          </div>
        </div>

        <div 
          className="p-4 rounded-2xl border flex items-center space-x-3 transition-colors"
          style={{ background: 'var(--bg-input)', borderColor: 'var(--border-primary)' }}
        >
          <div className="w-10 h-10 rounded-xl bg-sky-500/10 border border-sky-500/30 text-sky-400 flex items-center justify-center">
            <Wifi className="w-5 h-5" />
          </div>
          <div>
            <span className="text-xs block font-medium" style={{ color: 'var(--text-secondary)' }}>ความแรงสัญญาณ Wi-Fi</span>
            <span className="font-bold text-sky-400 text-sm">-62 dBm (สัญญาณดีมาก)</span>
          </div>
        </div>

        <div 
          className="p-4 rounded-2xl border flex items-center space-x-3 transition-colors"
          style={{ background: 'var(--bg-input)', borderColor: 'var(--border-primary)' }}
        >
          <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/30 text-purple-400 flex items-center justify-center">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <span className="text-xs block font-medium" style={{ color: 'var(--text-secondary)' }}>เซิร์ฟเวอร์ Supabase DB</span>
            <span className={`font-bold text-sm ${isSupabaseConnected ? 'text-emerald-400' : 'text-amber-400'}`}>
              {isSupabaseConnected ? 'เชื่อมต่อปกติ (200 OK)' : 'กำลังใช้แคชสำรอง'}
            </span>
          </div>
        </div>
      </div>

      {/* Node Hardware List */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {devices.map((device) => (
          <div
            key={device.device_id}
            className="p-5 rounded-2xl border space-y-4 transition"
            style={{ 
              background: 'var(--bg-input)', 
              borderColor: 'var(--border-primary)' 
            }}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Cpu className="w-5 h-5 text-indigo-400" />
                <div>
                  <h4 className="font-bold text-xs" style={{ color: 'var(--text-primary)' }}>{device.device_name}</h4>
                  <span className="text-[10px] font-mono" style={{ color: 'var(--text-muted)' }}>{device.device_id}</span>
                </div>
              </div>

              <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                device.status === 'online'
                  ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                  : 'bg-rose-500/10 text-rose-400 border-rose-500/30'
              }`}>
                {device.status === 'online' ? 'ออนไลน์' : 'ออฟไลน์'}
              </span>
            </div>

            <div className="space-y-2 text-xs pt-2 border-t" style={{ borderColor: 'var(--border-primary)' }}>
              
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1" style={{ color: 'var(--text-secondary)' }}>
                  <BatteryCharging className="w-3.5 h-3.5 text-emerald-400" />
                  แรงดันแบตเตอรี่ (Solar)
                </span>
                <span className="font-bold" style={{ color: 'var(--text-primary)' }}>{device.battery_v}V</span>
              </div>

              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1" style={{ color: 'var(--text-secondary)' }}>
                  <Wifi className="w-3.5 h-3.5 text-sky-400" />
                  ความแรง Wi-Fi RSSI
                </span>
                <span className="font-bold" style={{ color: 'var(--text-primary)' }}>{device.wifi_rssi} dBm</span>
              </div>

              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1" style={{ color: 'var(--text-secondary)' }}>
                  <Activity className="w-3.5 h-3.5 text-amber-400" />
                  ความสมบูรณ์เซนเซอร์
                </span>
                <span className="font-bold text-emerald-400">{device.probe_health}% (ปกติ)</span>
              </div>

              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1" style={{ color: 'var(--text-secondary)' }}>
                  <Zap className="w-3.5 h-3.5 text-cyan-400" />
                  มอดูลรีเลย์ (Relay Switch)
                </span>
                <span className="font-bold" style={{ color: 'var(--text-primary)' }}>{device.relay_status ? 'กำลังเปิด' : 'สแตนบายด์'}</span>
              </div>

            </div>

            <div className="pt-2 border-t flex justify-between items-center text-[10px]" style={{ borderColor: 'var(--border-primary)', color: 'var(--text-muted)' }}>
              <span>อัปเดตล่าสุด:</span>
              <span>{new Date(device.last_seen).toLocaleTimeString('th-TH')}</span>
            </div>
          </div>
        ))}
      </div>

    </div>
  );
};
