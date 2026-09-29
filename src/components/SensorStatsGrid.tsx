'use client';

import React from 'react';
import { 
  Droplet, 
  Thermometer, 
  Wind, 
  Zap, 
  Activity 
} from 'lucide-react';
import { SensorData } from '@/lib/types';

interface SensorStatsGridProps {
  latestData: SensorData;
  minMoisture: number;
  targetMoisture: number;
  onTogglePump?: () => void;
}

export const SensorStatsGrid: React.FC<SensorStatsGridProps> = ({
  latestData,
  minMoisture,
  targetMoisture,
  onTogglePump
}) => {
  const isPumpOn = latestData.pump_status;

  const stats = [
    {
      title: 'ความชื้นในดิน (Soil Moisture)',
      value: `${latestData.soil}%`,
      subtitle: `เกณฑ์: ${minMoisture}% - ${targetMoisture}%`,
      icon: Droplet,
      iconColor: 'text-emerald-400',
      borderColor: latestData.soil < minMoisture ? 'border-amber-500/40' : 'border-emerald-500/30',
      trend: latestData.soil < minMoisture ? 'ต่ำกว่าเกณฑ์' : 'อยู่ในระดับดี',
      isWarning: latestData.soil < minMoisture
    },
    {
      title: 'อุณหภูมิดิน (Soil Temp)',
      value: `${latestData.temperature}°C`,
      subtitle: 'อุณหภูมิแปลงถั่วลิสง',
      icon: Thermometer,
      iconColor: 'text-amber-400',
      borderColor: 'border-amber-500/30',
      trend: 'เหมาะสมสำหรับพืช',
      isWarning: false
    },
    {
      title: 'ความชื้นในอากาศ (Air Humidity)',
      value: `${latestData.humidity}%`,
      subtitle: 'ความชื้นสัมพัทธ์อากาศ',
      icon: Wind,
      iconColor: 'text-sky-400',
      borderColor: 'border-sky-500/30',
      trend: 'สภาวะปกติ',
      isWarning: false
    },
    {
      title: 'สถานะปั๊มน้ำ (Pump Control)',
      value: isPumpOn ? 'เปิดรดน้ำ' : 'หยุดรดน้ำ',
      subtitle: isPumpOn ? 'ปั๊มน้ำกำลังทำงาน...' : 'ปั๊มน้ำสแตนบาย',
      icon: Zap,
      iconColor: isPumpOn ? 'text-cyan-400 animate-pulse' : 'text-slate-400',
      borderColor: isPumpOn ? 'border-cyan-500/50' : '',
      trend: isPumpOn ? 'ปั๊มทำงาน (ON)' : 'ปั๊มปิดอยู่ (OFF)',
      isWarning: isPumpOn,
      isPumpCard: true
    }
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-3.5">
      {stats.map((stat, idx) => {
        const Icon = stat.icon;
        return (
          <div
            key={idx}
            className={`relative border ${stat.borderColor} rounded-2xl p-3 sm:p-4 shadow-md flex flex-col justify-between overflow-hidden transition-colors duration-300`}
            style={{ 
              background: 'var(--bg-card)', 
              borderColor: stat.borderColor ? undefined : 'var(--border-primary)' 
            }}
          >
            <div className="flex items-center justify-between mb-1">
              <span className="text-[11px] sm:text-xs font-semibold truncate pr-1" style={{ color: 'var(--text-secondary)' }}>
                {stat.title}
              </span>
              <div
                className={`p-1 sm:p-1.5 rounded-xl border shrink-0 ${stat.iconColor}`}
                style={{ background: 'var(--bg-input)', borderColor: 'var(--border-primary)' }}
              >
                <Icon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              </div>
            </div>

            <div className="my-1">
              <div className="text-xl sm:text-2xl font-black tracking-tight" style={{ color: 'var(--text-primary)' }}>
                {stat.value}
              </div>
              <div className="text-[10px] sm:text-[11px] mt-0.5 truncate" style={{ color: 'var(--text-secondary)' }}>
                {stat.subtitle}
              </div>
            </div>

            <div className="mt-2 pt-2 flex items-center justify-between gap-1 text-xs" style={{ borderTop: '1px solid var(--border-primary)' }}>
              <span className={`inline-flex items-center gap-1 font-semibold text-[10px] sm:text-[11px] truncate ${
                stat.isWarning ? 'text-amber-400' : 'text-emerald-400'
              }`}>
                <Activity className="w-3 h-3 shrink-0" />
                <span className="truncate">{stat.trend}</span>
              </span>

              {stat.isPumpCard && onTogglePump ? (
                <button
                  onClick={onTogglePump}
                  className={`px-2 sm:px-3 py-1 rounded-xl font-bold text-[10px] sm:text-xs transition shadow-sm border shrink-0 ${
                    isPumpOn
                      ? 'bg-rose-500/20 text-rose-400 border-rose-500/40 hover:bg-rose-500/30'
                      : 'bg-cyan-500/20 text-cyan-400 border-cyan-500/40 hover:bg-cyan-500/30'
                  }`}
                >
                  {isPumpOn ? 'สั่งปิดปั๊ม' : 'สั่งเปิดปั๊ม'}
                </button>
              ) : (
                <span className="text-[9px] sm:text-[10px] shrink-0" style={{ color: 'var(--text-muted)' }}>Supabase DB</span>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};
