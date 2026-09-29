'use client';

import React from 'react';
import { Droplet, AlertTriangle, CheckCircle2 } from 'lucide-react';

interface MoistureGaugeProps {
  currentMoisture: number;
  minThreshold: number;
  targetThreshold: number;
  cropName: string;
  isWatering: boolean;
  onToggleWatering?: () => void;
}

export const MoistureGauge: React.FC<MoistureGaugeProps> = ({
  currentMoisture,
  minThreshold,
  targetThreshold,
  cropName,
  isWatering,
  onToggleWatering
}) => {
  // Clamp value between 0 and 100
  const clampedMoisture = Math.max(0, Math.min(100, currentMoisture));

  // Determine moisture state
  let stateTextColor = 'text-emerald-400';
  let stateBorderColor = 'border-emerald-500/30';
  let stateBgColor = 'bg-emerald-500/10';
  let stateLabel = 'ความชื้นในดินเหมาะสม';
  let StateIcon = CheckCircle2;

  if (clampedMoisture < minThreshold) {
    stateTextColor = 'text-amber-400';
    stateBorderColor = 'border-amber-500/30';
    stateBgColor = 'bg-amber-500/10';
    stateLabel = 'ความชื้นต่ำกว่าเกณฑ์ - ระบบกำลังรดน้ำ';
    StateIcon = AlertTriangle;
  } else if (clampedMoisture >= targetThreshold) {
    stateTextColor = 'text-sky-400';
    stateBorderColor = 'border-sky-500/30';
    stateBgColor = 'bg-sky-500/10';
    stateLabel = 'ความชื้นเพียงพอ - อยู่ในระดับเป้าหมาย';
    StateIcon = CheckCircle2;
  }

  // SVG Gauge calculations
  const size = 200;
  const strokeWidth = 16;
  const center = size / 2;
  const radius = center - strokeWidth;
  const circumference = 2 * Math.PI * radius;
  
  // 240 degrees arc gauge
  const angleRange = 240;
  const arcLength = (angleRange / 360) * circumference;
  const strokeDashoffset = arcLength - (clampedMoisture / 100) * arcLength;

  return (
    <div 
      className="relative border rounded-3xl p-5 shadow-xl flex flex-col items-center justify-between text-center overflow-hidden h-full transition-colors duration-300" 
      style={{ background: 'var(--bg-card)', borderColor: 'var(--border-primary)' }}
    >
      
      {/* Subtle Background Glow */}
      <div className={`absolute -top-20 -left-20 w-52 h-52 rounded-full blur-3xl opacity-20 pointer-events-none ${
        clampedMoisture < minThreshold ? 'bg-amber-500' : 'bg-emerald-500'
      }`} />

      {/* Top Header */}
      <div className="w-full flex items-center justify-between mb-2">
        <div className="text-left">
          <span className="text-[11px] font-bold uppercase tracking-wider block" style={{ color: 'var(--text-secondary)' }}>
            เซนเซอร์ความชื้นในดิน
          </span>
          <h3 className="text-sm font-bold flex items-center gap-1.5" style={{ color: 'var(--text-primary)' }}>
            <span>{cropName}</span>
          </h3>
        </div>
        <div className={`flex items-center space-x-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${stateBgColor} ${stateTextColor} ${stateBorderColor}`}>
          <StateIcon className="w-3.5 h-3.5" />
          <span>{isWatering ? 'กำลังรดน้ำ' : 'ปกติ'}</span>
        </div>
      </div>

      {/* Circular Gauge SVG */}
      <div className="relative my-1 flex items-center justify-center">
        <svg width={size} height={size} className="transform rotate-90">
          
          {/* Background Arc */}
          <circle
            cx={center}
            cy={center}
            r={radius}
            fill="none"
            stroke="var(--border-primary)"
            strokeWidth={strokeWidth}
            strokeDasharray={`${arcLength} ${circumference}`}
            strokeLinecap="round"
          />

          {/* Progress Arc */}
          <circle
            cx={center}
            cy={center}
            r={radius}
            fill="none"
            stroke={`url(#moistureGradient-${clampedMoisture < minThreshold ? 'amber' : 'green'})`}
            strokeWidth={strokeWidth}
            strokeDasharray={`${arcLength} ${circumference}`}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            className="transition-all duration-700 ease-out"
          />

          <defs>
            <linearGradient id="moistureGradient-green" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#10b981" />
              <stop offset="100%" stopColor="#14b8a6" />
            </linearGradient>
            <linearGradient id="moistureGradient-amber" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#f59e0b" />
              <stop offset="100%" stopColor="#ef4444" />
            </linearGradient>
          </defs>
        </svg>

        {/* Center Display Value */}
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <div className="flex items-center mb-0.5">
            <Droplet className={`w-4 h-4 ${isWatering ? 'text-cyan-400 animate-bounce' : stateTextColor}`} />
          </div>
          <div className="flex items-baseline">
            <span className="text-4xl font-black tracking-tight" style={{ color: 'var(--text-primary)' }}>
              {clampedMoisture}
            </span>
            <span className="text-xl font-bold ml-0.5" style={{ color: 'var(--text-muted)' }}>%</span>
          </div>
          <span className="text-[11px] font-semibold mt-0.5" style={{ color: 'var(--text-secondary)' }}>
            ความชื้นปัจจุบัน
          </span>
        </div>
      </div>

      {/* Threshold Markers & Status Footer */}
      <div className="w-full mt-2 pt-3 space-y-2.5" style={{ borderTop: '1px solid var(--border-primary)' }}>
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="p-2 rounded-xl border text-center transition-colors" style={{ background: 'var(--bg-input)', borderColor: 'var(--border-primary)' }}>
            <span className="block text-[10px]" style={{ color: 'var(--text-secondary)' }}>ขั้นต่ำ (Min)</span>
            <span className="font-bold text-amber-400 text-xs">{minThreshold}%</span>
          </div>
          <div className="p-2 rounded-xl border text-center transition-colors" style={{ background: 'var(--bg-input)', borderColor: 'var(--border-primary)' }}>
            <span className="block text-[10px]" style={{ color: 'var(--text-secondary)' }}>เป้าหมาย (Target)</span>
            <span className="font-bold text-emerald-400 text-xs">{targetThreshold}%</span>
          </div>
        </div>

        {/* Status Alert Banner & Quick Control Button */}
        <div className="flex gap-2 items-center">
          <div className={`flex-1 p-2 rounded-xl border text-[11px] font-medium flex items-center justify-center space-x-1.5 ${stateBgColor} ${stateTextColor} ${stateBorderColor}`}>
            <StateIcon className="w-3.5 h-3.5 shrink-0" />
            <span className="truncate">{stateLabel}</span>
          </div>

          {onToggleWatering && (
            <button
              onClick={onToggleWatering}
              className={`px-3 py-2 rounded-xl font-bold text-xs flex items-center gap-1 shrink-0 transition shadow-md ${
                isWatering
                  ? 'bg-rose-600 hover:bg-rose-500 text-white'
                  : 'bg-cyan-600 hover:bg-cyan-500 text-white'
              }`}
            >
              <Droplet className="w-3.5 h-3.5" />
              <span>{isWatering ? 'ปิดปั๊ม' : 'เปิดปั๊ม'}</span>
            </button>
          )}
        </div>
      </div>

    </div>
  );
};
