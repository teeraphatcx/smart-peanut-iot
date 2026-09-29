'use client';

import React from 'react';
import { 
  Cpu, 
  Play, 
  Square, 
  Flame, 
  Droplets, 
  Send, 
  CheckCircle2, 
  AlertCircle,
  X,
  Sliders
} from 'lucide-react';
import { SensorData } from '@/lib/types';

interface IotSimulatorModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentMoisture: number;
  onChangeMoisture: (val: number) => void;
  isWatering: boolean;
  onToggleWatering: (state?: boolean) => void;
  onPushToSupabase: () => void;
  autoDryRate: number;
  onChangeDryRate: (rate: number) => void;
}

export const IotSimulatorModal: React.FC<IotSimulatorModalProps> = ({
  isOpen,
  onClose,
  currentMoisture,
  onChangeMoisture,
  isWatering,
  onToggleWatering,
  onPushToSupabase,
  autoDryRate,
  onChangeDryRate
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 w-96 max-w-[calc(100vw-2rem)] bg-slate-900 border-2 border-amber-500/50 rounded-3xl p-5 shadow-2xl shadow-amber-500/10 space-y-4 text-xs">
      
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <div className="flex items-center space-x-2">
          <Cpu className="w-5 h-5 text-amber-400 animate-pulse" />
          <div>
            <h4 className="font-bold text-white text-sm">เครื่องมือจำลองอุปกรณ์ IoT (Simulator)</h4>
            <span className="text-[10px] text-amber-400 font-medium">ทดสอบค่าความชื้น & ส่งข้อมูลเข้า Supabase</span>
          </div>
        </div>

        <button onClick={onClose} className="text-slate-400 hover:text-white p-1">
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Manual Moisture Slider */}
      <div className="space-y-2 bg-slate-950/60 p-3 rounded-2xl border border-slate-800">
        <div className="flex justify-between items-center font-bold">
          <span className="text-slate-300">ปรับค่าความชื้นดินจำลอง:</span>
          <span className="text-emerald-400 text-sm font-mono">{currentMoisture}%</span>
        </div>

        <input
          type="range"
          min="10"
          max="95"
          value={currentMoisture}
          onChange={(e) => onChangeMoisture(parseInt(e.target.value))}
          className="w-full accent-emerald-500 cursor-pointer"
        />
        <div className="flex justify-between text-[10px] text-slate-500">
          <span>10% (แห้งกริบ)</span>
          <span>50%</span>
          <span>95% (ชุ่มน้ำ)</span>
        </div>
      </div>

      {/* Drying Rate Selection */}
      <div className="space-y-1.5">
        <span className="text-slate-400 font-semibold block">จำลองอัตราดินแห้งตามธรรมชาติ:</span>
        <div className="grid grid-cols-3 gap-1.5">
          <button
            onClick={() => onChangeDryRate(0)}
            className={`p-2 rounded-xl border text-center font-semibold transition ${
              autoDryRate === 0 ? 'bg-slate-800 text-white border-slate-700' : 'bg-slate-950 text-slate-400 border-slate-800'
            }`}
          >
            ปิด
          </button>
          <button
            onClick={() => onChangeDryRate(1)}
            className={`p-2 rounded-xl border text-center font-semibold transition ${
              autoDryRate === 1 ? 'bg-amber-600 text-white border-amber-500' : 'bg-slate-950 text-slate-400 border-slate-800'
            }`}
          >
            ปกติ (-1%/3s)
          </button>
          <button
            onClick={() => onChangeDryRate(3)}
            className={`p-2 rounded-xl border text-center font-semibold transition ${
              autoDryRate === 3 ? 'bg-rose-600 text-white border-rose-500' : 'bg-slate-950 text-slate-400 border-slate-800'
            }`}
          >
            แดดจัด (-3%/3s)
          </button>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="grid grid-cols-2 gap-2 pt-1">
        <button
          onClick={() => onToggleWatering()}
          className={`py-2.5 px-3 rounded-xl font-bold flex items-center justify-center space-x-1.5 transition ${
            isWatering
              ? 'bg-rose-600 hover:bg-rose-500 text-white'
              : 'bg-cyan-600 hover:bg-cyan-500 text-white'
          }`}
        >
          <Droplets className="w-4 h-4" />
          <span>{isWatering ? 'หยุดรดน้ำ' : 'เริ่มรดน้ำ'}</span>
        </button>

        <button
          onClick={onPushToSupabase}
          className="py-2.5 px-3 rounded-xl font-bold bg-emerald-600 hover:bg-emerald-500 text-white flex items-center justify-center space-x-1.5 transition shadow-md shadow-emerald-600/20"
        >
          <Send className="w-4 h-4" />
          <span>ส่งไป Supabase</span>
        </button>
      </div>

    </div>
  );
};
