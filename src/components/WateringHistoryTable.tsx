'use client';

import React, { useState } from 'react';
import { 
  Droplet, 
  Search, 
  Download, 
  Calendar, 
  Clock, 
  Zap, 
  User
} from 'lucide-react';
import { WateringLog } from '@/lib/types';

interface WateringHistoryTableProps {
  logs: WateringLog[];
}

export const WateringHistoryTable: React.FC<WateringHistoryTableProps> = ({ logs }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [modeFilter, setModeFilter] = useState<'ALL' | 'AUTO' | 'MANUAL'>('ALL');

  // Filter logs
  const filteredLogs = logs.filter(log => {
    const matchesSearch = 
      log.operator_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.start_time.includes(searchTerm) ||
      log.trigger_mode.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesMode = modeFilter === 'ALL' || log.trigger_mode === modeFilter;

    return matchesSearch && matchesMode;
  });

  // Calculate stats
  const totalWater = logs.reduce((acc, curr) => acc + (curr.water_liters || 0), 0);
  const autoCount = logs.filter(l => l.trigger_mode === 'AUTO').length;
  const manualCount = logs.filter(l => l.trigger_mode === 'MANUAL').length;

  // Export CSV Handler
  const handleExportCSV = () => {
    const headers = ['ID', 'วันที่', 'เวลาเริ่ม', 'เวลาสิ้นสุด', 'ระยะเวลา (วินาที)', 'โหมด', 'ความชื้นเริ่ม (%)', 'ความชื้นจบ (%)', 'ปริมาณน้ำ (ลิตร)', 'ผู้ดำเนินการ'];
    const rows = filteredLogs.map(l => [
      l.id,
      new Date(l.created_at).toLocaleDateString('th-TH'),
      l.start_time,
      l.end_time || '-',
      l.duration_seconds,
      l.trigger_mode === 'AUTO' ? 'อัตโนมัติ' : 'ด้วยตนเอง',
      l.start_moisture,
      l.end_moisture,
      l.water_liters,
      `"${l.operator_name}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `watering_history_report_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div 
      className="border rounded-3xl p-6 shadow-xl space-y-6 transition-colors duration-300"
      style={{ background: 'var(--bg-card)', borderColor: 'var(--border-primary)' }}
    >
      
      {/* Header & Export button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <Droplet className="w-5 h-5 text-cyan-400" />
            <h3 className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>
              ประวัติการรดน้ำถั่ว (Watering History Logs)
            </h3>
          </div>
          <p className="text-xs mt-1" style={{ color: 'var(--text-secondary)' }}>
            บันทึกวัน เวลา ระยะเวลาการทำงานของปั๊มน้ำ และปริมาณน้ำที่ใช้ทั้งหมด
          </p>
        </div>

        <button
          onClick={handleExportCSV}
          className="flex items-center space-x-2 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs transition shadow-lg shadow-emerald-600/20"
        >
          <Download className="w-4 h-4" />
          <span>ส่งออกรายงาน CSV</span>
        </button>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div 
          className="p-4 rounded-2xl border transition-colors"
          style={{ background: 'var(--bg-input)', borderColor: 'var(--border-primary)' }}
        >
          <span className="text-xs block" style={{ color: 'var(--text-secondary)' }}>ปริมาณน้ำรวมทั้งหมด</span>
          <span className="text-2xl font-black text-emerald-400 mt-1 block">
            {totalWater.toFixed(1)} <span className="text-sm font-normal" style={{ color: 'var(--text-muted)' }}>ลิตร</span>
          </span>
        </div>
        <div 
          className="p-4 rounded-2xl border transition-colors"
          style={{ background: 'var(--bg-input)', borderColor: 'var(--border-primary)' }}
        >
          <span className="text-xs block" style={{ color: 'var(--text-secondary)' }}>รดน้ำด้วยระบบอัตโนมัติ</span>
          <span className="text-2xl font-black text-cyan-400 mt-1 block">
            {autoCount} <span className="text-sm font-normal" style={{ color: 'var(--text-muted)' }}>ครั้ง</span>
          </span>
        </div>
        <div 
          className="p-4 rounded-2xl border transition-colors"
          style={{ background: 'var(--bg-input)', borderColor: 'var(--border-primary)' }}
        >
          <span className="text-xs block" style={{ color: 'var(--text-secondary)' }}>รดน้ำด้วยตนเอง (Manual)</span>
          <span className="text-2xl font-black text-amber-400 mt-1 block">
            {manualCount} <span className="text-sm font-normal" style={{ color: 'var(--text-muted)' }}>ครั้ง</span>
          </span>
        </div>
      </div>

      {/* Filters Toolbar */}
      <div className="flex flex-col sm:flex-row gap-3">
        {/* Search input */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3.5 top-3" style={{ color: 'var(--text-muted)' }} />
          <input
            type="text"
            placeholder="ค้นหาตามผู้เปิดปั๊ม, เวลา..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 border rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-colors"
            style={{ 
              background: 'var(--bg-input)', 
              borderColor: 'var(--border-primary)', 
              color: 'var(--text-primary)' 
            }}
          />
        </div>

        {/* Mode filter pills */}
        <div 
          className="flex items-center p-1 rounded-xl border text-xs"
          style={{ background: 'var(--bg-input)', borderColor: 'var(--border-primary)' }}
        >
          <button
            onClick={() => setModeFilter('ALL')}
            className={`px-3 py-1.5 rounded-lg font-medium transition ${
              modeFilter === 'ALL' 
                ? 'bg-emerald-600 text-white shadow' 
                : 'text-slate-400 hover:text-emerald-500'
            }`}
          >
            ทั้งหมด ({logs.length})
          </button>
          <button
            onClick={() => setModeFilter('AUTO')}
            className={`px-3 py-1.5 rounded-lg font-medium transition ${
              modeFilter === 'AUTO' 
                ? 'bg-cyan-600 text-white shadow' 
                : 'text-slate-400 hover:text-cyan-500'
            }`}
          >
            อัตโนมัติ ({autoCount})
          </button>
          <button
            onClick={() => setModeFilter('MANUAL')}
            className={`px-3 py-1.5 rounded-lg font-medium transition ${
              modeFilter === 'MANUAL' 
                ? 'bg-amber-600 text-white shadow' 
                : 'text-slate-400 hover:text-amber-500'
            }`}
          >
            แมนนวล ({manualCount})
          </button>
        </div>
      </div>

      {/* Mobile Card List View (Optimized for Smartphone Screens) */}
      <div className="sm:hidden space-y-3">
        {filteredLogs.length === 0 ? (
          <div className="p-6 text-center text-xs border rounded-2xl" style={{ background: 'var(--bg-input)', borderColor: 'var(--border-primary)', color: 'var(--text-muted)' }}>
            ไม่พบประวัติการรดน้ำในระบบ
          </div>
        ) : (
          filteredLogs.map((log) => (
            <div 
              key={log.id} 
              className="p-4 rounded-2xl border space-y-2.5 transition-colors shadow-sm"
              style={{ background: 'var(--bg-input)', borderColor: 'var(--border-primary)' }}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-1.5 text-xs font-bold" style={{ color: 'var(--text-primary)' }}>
                  <Calendar className="w-3.5 h-3.5 text-emerald-400" />
                  <span>{new Date(log.created_at).toLocaleDateString('th-TH')}</span>
                  <span style={{ color: 'var(--text-muted)' }}>•</span>
                  <span className="text-emerald-400">{log.start_time} - {log.end_time || '-'}</span>
                </div>
                <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                  log.trigger_mode === 'AUTO'
                    ? 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30'
                    : 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                }`}>
                  <Zap className="w-3 h-3" />
                  {log.trigger_mode === 'AUTO' ? 'AUTO' : 'MANUAL'}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs pt-2 border-t" style={{ borderColor: 'var(--border-primary)' }}>
                <div>
                  <span className="text-[10px] block" style={{ color: 'var(--text-secondary)' }}>ระยะเวลาทำงาน</span>
                  <span className="font-semibold" style={{ color: 'var(--text-primary)' }}>
                    <Clock className="w-3 h-3 inline mr-1 text-slate-400" />
                    {Math.floor(log.duration_seconds / 60)}m {log.duration_seconds % 60}s
                  </span>
                </div>
                <div>
                  <span className="text-[10px] block" style={{ color: 'var(--text-secondary)' }}>ปริมาณน้ำที่ใช้</span>
                  <span className="font-extrabold text-emerald-400">{log.water_liters} ลิตร</span>
                </div>
              </div>

              <div className="flex items-center justify-between text-xs pt-2 border-t" style={{ borderColor: 'var(--border-primary)' }}>
                <span className="text-[11px]">
                  ความชื้น: <strong className="text-amber-400">{log.start_moisture}%</strong> ➔ <strong className="text-emerald-400">{log.end_moisture}%</strong>
                </span>
                <span className="text-[10px] flex items-center gap-1" style={{ color: 'var(--text-secondary)' }}>
                  <User className="w-3 h-3 text-indigo-400" /> {log.operator_name}
                </span>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Desktop Table Container (For Tablets & Desktops) */}
      <div 
        className="hidden sm:block overflow-x-auto rounded-2xl border"
        style={{ borderColor: 'var(--border-primary)' }}
      >
        <table className="w-full text-left text-xs">
          <thead 
            className="uppercase text-[11px] font-semibold border-b"
            style={{ 
              background: 'var(--bg-input)', 
              borderColor: 'var(--border-primary)', 
              color: 'var(--text-secondary)' 
            }}
          >
            <tr>
              <th className="px-4 py-3.5">วันที่ & เวลา</th>
              <th className="px-4 py-3.5">ระยะเวลา</th>
              <th className="px-4 py-3.5">โหมดการทำงาน</th>
              <th className="px-4 py-3.5">ความชื้น (เริ่ม➔จบ)</th>
              <th className="px-4 py-3.5">ปริมาณน้ำ</th>
              <th className="px-4 py-3.5">ผู้ดำเนินการ</th>
            </tr>
          </thead>
          <tbody 
            className="divide-y"
            style={{ 
              background: 'var(--bg-card)', 
              borderColor: 'var(--border-primary)' 
            }}
          >
            {filteredLogs.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center" style={{ color: 'var(--text-muted)' }}>
                  ไม่พบประวัติการรดน้ำในระบบ
                </td>
              </tr>
            ) : (
              filteredLogs.map((log) => (
                <tr 
                  key={log.id} 
                  className="hover:opacity-90 transition-colors"
                  style={{ borderBottom: '1px solid var(--border-primary)' }}
                >
                  <td className="px-4 py-3 font-medium whitespace-nowrap" style={{ color: 'var(--text-primary)' }}>
                    <div className="flex items-center space-x-2">
                      <Calendar className="w-3.5 h-3.5" style={{ color: 'var(--text-muted)' }} />
                      <span>{new Date(log.created_at).toLocaleDateString('th-TH')}</span>
                      <span style={{ color: 'var(--text-muted)' }}>|</span>
                      <span className="text-emerald-500 font-semibold">{log.start_time} - {log.end_time || '-'}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 font-mono whitespace-nowrap" style={{ color: 'var(--text-secondary)' }}>
                    <div className="flex items-center space-x-1">
                      <Clock className="w-3.5 h-3.5" style={{ color: 'var(--text-muted)' }} />
                      <span>{Math.floor(log.duration_seconds / 60)} นาที {log.duration_seconds % 60} วินาที</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold border ${
                      log.trigger_mode === 'AUTO'
                        ? 'bg-cyan-500/10 text-cyan-500 border-cyan-500/30'
                        : 'bg-amber-500/10 text-amber-500 border-amber-500/30'
                    }`}>
                      <Zap className="w-3 h-3" />
                      {log.trigger_mode === 'AUTO' ? 'อัตโนมัติ (AUTO)' : 'ด้วยตนเอง (MANUAL)'}
                    </span>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <span className="font-semibold text-amber-500">{log.start_moisture}%</span>
                    <span className="mx-1.5" style={{ color: 'var(--text-muted)' }}>➔</span>
                    <span className="font-semibold text-emerald-500">{log.end_moisture}%</span>
                  </td>
                  <td className="px-4 py-3 font-bold text-emerald-500 whitespace-nowrap">
                    {log.water_liters} ลิตร
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap" style={{ color: 'var(--text-primary)' }}>
                    <div className="flex items-center space-x-1.5">
                      <User className="w-3.5 h-3.5" style={{ color: 'var(--text-muted)' }} />
                      <span>{log.operator_name}</span>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

    </div>
  );
};
