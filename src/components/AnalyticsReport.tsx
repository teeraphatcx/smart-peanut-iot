'use client';

import React from 'react';
import { 
  TrendingUp, 
  Droplets, 
  Thermometer, 
  CheckCircle2, 
  Sprout 
} from 'lucide-react';
import { SensorData, WateringLog } from '@/lib/types';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  LineChart, 
  Line 
} from 'recharts';

interface AnalyticsReportProps {
  sensorHistory: SensorData[];
  wateringLogs: WateringLog[];
}

export const AnalyticsReport: React.FC<AnalyticsReportProps> = ({
  sensorHistory,
  wateringLogs
}) => {
  // Aggregate daily water consumption
  const dailyWaterData = React.useMemo(() => {
    const map: Record<string, number> = {};
    
    wateringLogs.forEach(log => {
      const dateStr = new Date(log.created_at).toLocaleDateString('th-TH', { day: '2-digit', month: 'short' });
      map[dateStr] = (map[dateStr] || 0) + (log.water_liters || 0);
    });

    const result = Object.keys(map).map(date => ({
      date,
      water: Number(map[date].toFixed(1))
    })).reverse();

    if (result.length === 0) {
      return [
        { date: '21 ก.ย.', water: 150 },
        { date: '22 ก.ย.', water: 210 },
        { date: '23 ก.ย.', water: 180 },
        { date: '24 ก.ย.', water: 240 },
        { date: '25 ก.ย.', water: 190 },
        { date: '26 ก.ย.', water: 300 },
        { date: '27 ก.ย.', water: 210 }
      ];
    }
    return result;
  }, [wateringLogs]);

  // Temperature vs Soil Moisture correlation data
  const tempMoistureData = sensorHistory.slice(-20).map(s => ({
    time: new Date(s.created_at).toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' }),
    moisture: s.soil,
    temp: s.temperature
  }));

  return (
    <div 
      className="border rounded-3xl p-6 shadow-xl space-y-6 transition-colors duration-300"
      style={{ background: 'var(--bg-card)', borderColor: 'var(--border-primary)' }}
    >
      
      {/* Header */}
      <div>
        <div className="flex items-center space-x-2">
          <TrendingUp className="w-5 h-5 text-amber-400" />
          <h3 className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>
            รายงานและวิเคราะห์การเปลี่ยนแปลงความชื้นดินแปลงถั่วลิสง (Analytics & Reports)
          </h3>
        </div>
        <p className="text-xs mt-1" style={{ color: 'var(--text-secondary)' }}>
          สรุปการใช้น้ำในการรดน้ำถั่วลิสง อัตราการสูญเสียความชื้นในดิน และความสัมพันธ์กับอุณหภูมิแปลงปลูก
        </p>
      </div>

      {/* Grid: Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Daily Water Usage Bar Chart */}
        <div 
          className="p-5 rounded-2xl border space-y-3 transition-colors"
          style={{ background: 'var(--bg-input)', borderColor: 'var(--border-primary)' }}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold flex items-center gap-1.5" style={{ color: 'var(--text-primary)' }}>
              <Droplets className="w-4 h-4 text-cyan-400" />
              รายงานการใช้น้ำในการรดน้ำแปลงถั่วลิสงรายวัน (ลิตร)
            </span>
          </div>

          <div className="h-64 w-full pt-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={dailyWaterData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(148, 163, 184, 0.15)" vertical={false} />
                <XAxis dataKey="date" stroke="#94a3b8" fontSize={11} tickLine={false} />
                <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} unit="L" />
                <Tooltip
                  contentStyle={{ 
                    backgroundColor: 'var(--bg-card)', 
                    borderColor: 'var(--border-primary)', 
                    borderRadius: '12px', 
                    color: 'var(--text-primary)', 
                    fontSize: '12px' 
                  }}
                  formatter={(val: any) => [`${val} ลิตร`, 'น้ำที่ใช้']}
                />
                <Bar dataKey="water" fill="#06b6d4" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Temperature vs Moisture Line Chart */}
        <div 
          className="p-5 rounded-2xl border space-y-3 transition-colors"
          style={{ background: 'var(--bg-input)', borderColor: 'var(--border-primary)' }}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold flex items-center gap-1.5" style={{ color: 'var(--text-primary)' }}>
              <Thermometer className="w-4 h-4 text-amber-400" />
              ความสัมพันธ์ระหว่างอุณหภูมิดินกับค่าความชื้นดินถั่วลิสง
            </span>
          </div>

          <div className="h-64 w-full pt-4">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={tempMoistureData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(148, 163, 184, 0.15)" vertical={false} />
                <XAxis dataKey="time" stroke="#94a3b8" fontSize={11} tickLine={false} />
                <YAxis yAxisId="left" domain={[0, 100]} stroke="#10b981" fontSize={11} tickLine={false} unit="%" />
                <YAxis yAxisId="right" orientation="right" domain={[15, 45]} stroke="#f59e0b" fontSize={11} tickLine={false} unit="°C" />
                <Tooltip
                  contentStyle={{ 
                    backgroundColor: 'var(--bg-card)', 
                    borderColor: 'var(--border-primary)', 
                    borderRadius: '12px', 
                    color: 'var(--text-primary)', 
                    fontSize: '12px' 
                  }}
                />
                <Line yAxisId="left" type="monotone" dataKey="moisture" name="ความชื้นดิน (%)" stroke="#10b981" strokeWidth={2} dot={false} />
                <Line yAxisId="right" type="monotone" dataKey="temp" name="อุณหภูมิดิน (°C)" stroke="#f59e0b" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>

      {/* Agro Insights & Recommendations Card for Peanuts */}
      <div 
        className="p-5 rounded-2xl border space-y-3 transition-colors"
        style={{ 
          background: 'var(--bg-input)', 
          borderColor: 'var(--border-primary)' 
        }}
      >
        <div className="flex items-center space-x-2 text-amber-400 font-bold text-sm">
          <Sprout className="w-5 h-5 text-amber-400" />
          <span>ข้อสรุปและคำแนะนำสำหรับการปลูกถั่วลิสง</span>
        </div>

        <ul className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs" style={{ color: 'var(--text-secondary)' }}>
          <li 
            className="flex items-start space-x-2 p-2.5 rounded-xl border transition-colors"
            style={{ background: 'var(--bg-card)', borderColor: 'var(--border-primary)' }}
          >
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <span>
              <strong style={{ color: 'var(--text-primary)' }}>ระยะแทงเข็มและลงหัว (50-90 วัน):</strong> ควรรักษาระดับความชื้นดินสม่ำเสมอที่ <strong>50% - 80%</strong> เพื่อให้เข็มแทงลงดินได้ง่ายและฝักถั่วลิสงขยายตัวสมบูรณ์
            </span>
          </li>
          <li 
            className="flex items-start space-x-2 p-2.5 rounded-xl border transition-colors"
            style={{ background: 'var(--bg-card)', borderColor: 'var(--border-primary)' }}
          >
            <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <span>
              <strong style={{ color: 'var(--text-primary)' }}>การจัดการรดน้ำอัตโนมัติ:</strong> การรดน้ำอัตโนมัติตามค่าเซนเซอร์ช่วยป้องกันดินแห้งแข็งซึ่งขัดขวางการขยายตัวของฝักถั่วลิสงใต้ดิน
            </span>
          </li>
        </ul>
      </div>

    </div>
  );
};
