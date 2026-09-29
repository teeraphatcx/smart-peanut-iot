'use client';

import React, { useState } from 'react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  ReferenceLine 
} from 'recharts';
import { SensorData } from '@/lib/types';
import { BarChart2 } from 'lucide-react';

interface RealtimeChartProps {
  history: SensorData[];
  minThreshold: number;
  targetThreshold: number;
}

export const RealtimeChart: React.FC<RealtimeChartProps> = ({
  history,
  minThreshold,
  targetThreshold
}) => {
  const [timeFilter, setTimeFilter] = useState<'all' | '1h' | '24h'>('all');

  // Filter history based on range
  const filteredHistory = React.useMemo(() => {
    if (timeFilter === '1h') {
      return history.slice(-12);
    } else if (timeFilter === '24h') {
      return history.slice(-48);
    }
    return history;
  }, [history, timeFilter]);

  // Format data for Recharts
  const chartData = filteredHistory.map((item) => {
    const dateObj = new Date(item.created_at);
    const timeStr = dateObj.toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' });
    return {
      time: timeStr,
      soil: item.soil,
      temperature: item.temperature,
      humidity: item.humidity,
      pump: item.pump_status ? 100 : 0
    };
  });

  // Calculate statistics
  const soils = filteredHistory.map(d => d.soil);
  const avgSoil = soils.length ? (soils.reduce((a, b) => a + b, 0) / soils.length).toFixed(1) : '0';
  const minSoil = soils.length ? Math.min(...soils) : 0;
  const maxSoil = soils.length ? Math.max(...soils) : 0;

  return (
    <div 
      className="border rounded-3xl p-5 shadow-xl flex flex-col justify-between h-full transition-colors duration-300" 
      style={{ background: 'var(--bg-card)', borderColor: 'var(--border-primary)' }}
    >
      
      {/* Header & Filter Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
        <div>
          <div className="flex items-center space-x-2">
            <BarChart2 className="w-5 h-5 text-emerald-400" />
            <h3 className="text-base font-bold" style={{ color: 'var(--text-primary)' }}>
              กราฟความชื้นในดินเรียลไทม์
            </h3>
          </div>
          <p className="text-xs mt-0.5" style={{ color: 'var(--text-secondary)' }}>
            เปรียบเทียบค่าความชื้นดินกับเกณฑ์รดน้ำ
          </p>
        </div>

        {/* Range Filter Pills */}
        <div 
          className="flex items-center p-1 rounded-xl border text-xs" 
          style={{ background: 'var(--bg-input)', borderColor: 'var(--border-primary)' }}
        >
          <button
            onClick={() => setTimeFilter('1h')}
            className={`px-2.5 py-1 rounded-lg font-medium transition ${
              timeFilter === '1h' 
                ? 'bg-emerald-600 text-white shadow' 
                : 'text-slate-400 hover:text-emerald-500'
            }`}
          >
            1 ชม.
          </button>
          <button
            onClick={() => setTimeFilter('24h')}
            className={`px-2.5 py-1 rounded-lg font-medium transition ${
              timeFilter === '24h' 
                ? 'bg-emerald-600 text-white shadow' 
                : 'text-slate-400 hover:text-emerald-500'
            }`}
          >
            24 ชม.
          </button>
          <button
            onClick={() => setTimeFilter('all')}
            className={`px-2.5 py-1 rounded-lg font-medium transition ${
              timeFilter === 'all' 
                ? 'bg-emerald-600 text-white shadow' 
                : 'text-slate-400 hover:text-emerald-500'
            }`}
          >
            ทั้งหมด
          </button>
        </div>
      </div>

      {/* Summary Stat Badges */}
      <div className="grid grid-cols-3 gap-2.5 mb-4">
        <div 
          className="p-2.5 rounded-2xl border text-center transition-colors"
          style={{ background: 'var(--bg-input)', borderColor: 'var(--border-primary)' }}
        >
          <span className="text-[11px] block" style={{ color: 'var(--text-secondary)' }}>เฉลี่ย</span>
          <span className="text-base font-extrabold text-emerald-400">{avgSoil}%</span>
        </div>
        <div 
          className="p-2.5 rounded-2xl border text-center transition-colors"
          style={{ background: 'var(--bg-input)', borderColor: 'var(--border-primary)' }}
        >
          <span className="text-[11px] block" style={{ color: 'var(--text-secondary)' }}>ต่ำสุด</span>
          <span className="text-base font-extrabold text-amber-400">{minSoil}%</span>
        </div>
        <div 
          className="p-2.5 rounded-2xl border text-center transition-colors"
          style={{ background: 'var(--bg-input)', borderColor: 'var(--border-primary)' }}
        >
          <span className="text-[11px] block" style={{ color: 'var(--text-secondary)' }}>สูงสุด</span>
          <span className="text-base font-extrabold text-sky-400">{maxSoil}%</span>
        </div>
      </div>

      {/* Recharts Area Container */}
      <div className="w-full flex-1 min-h-[220px]">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="colorSoil" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10b981" stopOpacity={0.6}/>
                <stop offset="95%" stopColor="#10b981" stopOpacity={0.0}/>
              </linearGradient>
            </defs>

            <CartesianGrid strokeDasharray="3 3" stroke="rgba(148, 163, 184, 0.15)" vertical={false} />
            
            <XAxis 
              dataKey="time" 
              stroke="#94a3b8" 
              fontSize={11} 
              tickLine={false}
            />
            
            <YAxis 
              domain={[0, 100]} 
              stroke="#94a3b8" 
              fontSize={11} 
              tickLine={false} 
              unit="%" 
            />

            <Tooltip 
              contentStyle={{ 
                backgroundColor: 'var(--bg-card)', 
                borderColor: 'var(--border-primary)', 
                borderRadius: '12px',
                color: 'var(--text-primary)',
                fontSize: '12px',
                boxShadow: '0 8px 24px rgba(0,0,0,0.15)'
              }}
              formatter={(val: any, name: any) => {
                if (name === 'soil') return [`${val}%`, 'ความชื้นดิน'];
                if (name === 'temperature') return [`${val}°C`, 'อุณหภูมิ'];
                return [val, name];
              }}
            />

            {/* Threshold Reference Lines */}
            <ReferenceLine 
              y={minThreshold} 
              stroke="#f59e0b" 
              strokeDasharray="4 4" 
              label={{ value: `ขั้นต่ำ ${minThreshold}%`, fill: '#f59e0b', fontSize: 10, position: 'insideBottomLeft' }} 
            />
            <ReferenceLine 
              y={targetThreshold} 
              stroke="#06b6d4" 
              strokeDasharray="4 4" 
              label={{ value: `เป้าหมาย ${targetThreshold}%`, fill: '#06b6d4', fontSize: 10, position: 'insideTopLeft' }} 
            />

            <Area 
              type="monotone" 
              dataKey="soil" 
              stroke="#10b981" 
              strokeWidth={3} 
              fillOpacity={1} 
              fill="url(#colorSoil)" 
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

    </div>
  );
};
