'use client';

import React, { useState } from 'react';
import { 
  Settings, 
  Save, 
  Sprout, 
  Clock, 
  Zap, 
  CheckCircle2,
  Cpu,
  ChevronDown,
  ChevronUp,
  Copy,
  Check
} from 'lucide-react';
import { SystemSettings } from '@/lib/types';
import { CROP_PRESETS } from '@/lib/mockData';

interface SettingsManagerProps {
  settings: SystemSettings;
  onSaveSettings: (newSettings: SystemSettings) => void;
  currentRole: 'farmer' | 'admin';
}

export const SettingsManager: React.FC<SettingsManagerProps> = ({
  settings,
  onSaveSettings
}) => {
  const [formData, setFormData] = useState<SystemSettings>(settings);
  const [isSaved, setIsSaved] = useState(false);
  const [showEsp32Guide, setShowEsp32Guide] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveSettings(formData);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3500);
  };

  const applyPreset = (presetId: string) => {
    const preset = CROP_PRESETS.find(p => p.id === presetId);
    if (!preset) return;

    setFormData(prev => ({
      ...prev,
      crop_type: preset.name,
      min_soil: preset.min_moisture,
      target_soil: preset.target_moisture
    }));
  };

  const esp32CodeSnippet = `// ฟังก์ชันใน ESP32 สำหรับดึงค่าเกณฑ์ความชื้นจาก Supabase
#include <HTTPClient.h>
#include <ArduinoJson.h>

const char* supabase_url = "https://yoummvsjxuhomfurseym.supabase.co/rest/v1/system_settings?id=eq.1&select=*";
const char* supabase_key = "sb_publishable_qDhinvz2nEw8XwuJ-1mFaQ_fabl4BsV";

int min_soil = 50;       // เกณฑ์เปิดปั๊ม
int target_soil = 80;    // เกณฑ์ปิดปั๊ม
bool auto_mode = true;   // โหมดอัตโนมัติ

void fetchSettingsFromSupabase() {
  if (WiFi.status() == WL_CONNECTED) {
    HTTPClient http;
    http.begin(supabase_url);
    http.addHeader("apikey", supabase_key);
    http.addHeader("Authorization", String("Bearer ") + supabase_key);
    
    int httpCode = http.GET();
    if (httpCode == 200) {
      String payload = http.getString();
      StaticJsonDocument<512> doc;
      deserializeJson(doc, payload);
      
      min_soil = doc[0]["min_soil"];
      target_soil = doc[0]["target_soil"];
      auto_mode = doc[0]["auto_mode"];
      
      Serial.printf("Settings Updated: Min=%d, Target=%d, Auto=%d\\n", min_soil, target_soil, auto_mode);
    }
    http.end();
  }
}`;

  const handleCopyCode = () => {
    navigator.clipboard.writeText(esp32CodeSnippet);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  return (
    <div 
      className="border rounded-3xl p-6 shadow-xl space-y-6 transition-colors duration-300"
      style={{ background: 'var(--bg-card)', borderColor: 'var(--border-primary)' }}
    >
      
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center space-x-2">
            <Settings className="w-5 h-5 text-amber-400" />
            <h3 className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>
              ตั้งค่าเกณฑ์ความชื้นดิน & ระบบรดน้ำถั่วลิสงอัตโนมัติ
            </h3>
          </div>
          <p className="text-xs mt-1" style={{ color: 'var(--text-secondary)' }}>
            กำหนดค่าความชื้นขั้นต่ำ (Min Threshold %) และระดับเป้าหมาย (Target Threshold %) ซิงค์ไปยัง Supabase DB สู่ ESP32
          </p>
        </div>

        {isSaved && (
          <div className="flex items-center space-x-1.5 px-3 py-1.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-xs font-bold animate-bounce">
            <CheckCircle2 className="w-4 h-4" />
            <span>ซิงค์ไปยัง Supabase DB สำหรับ ESP32 เรียบร้อย!</span>
          </div>
        )}
      </div>

      {/* Preset Buttons for Peanut Growth Stages */}
      <div>
        <label className="block text-xs font-bold uppercase tracking-wider mb-2" style={{ color: 'var(--text-secondary)' }}>
          เลือกเกณฑ์ความชื้นตามระยะการเจริญเติบโตของถั่วลิสง (Peanut Growth Stages)
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {CROP_PRESETS.map((crop) => {
            const isSelected = formData.crop_type.includes(crop.name);
            return (
              <button
                key={crop.id}
                type="button"
                onClick={() => applyPreset(crop.id)}
                className={`p-3.5 rounded-2xl border text-left transition duration-200 flex flex-col justify-between ${
                  isSelected
                    ? 'border-amber-500 ring-2 ring-amber-500/30 shadow-md'
                    : 'hover:border-emerald-500/40'
                }`}
                style={{ 
                  background: isSelected ? 'var(--bg-input)' : 'var(--bg-card)', 
                  borderColor: isSelected ? '#f59e0b' : 'var(--border-primary)' 
                }}
              >
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-xs flex items-center gap-1" style={{ color: 'var(--text-primary)' }}>
                      <Sprout className={`w-3.5 h-3.5 ${isSelected ? 'text-amber-400' : 'text-slate-400'}`} />
                      {crop.name}
                    </span>
                    {isSelected && (
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-500 font-bold">
                        เลือกอยู่
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] line-clamp-2" style={{ color: 'var(--text-secondary)' }}>
                    {crop.description}
                  </p>
                </div>
                <div 
                  className="mt-2 pt-2 border-t flex items-center justify-between text-[11px]"
                  style={{ borderColor: 'var(--border-primary)' }}
                >
                  <span className="text-amber-500 font-semibold">Min: {crop.min_moisture}%</span>
                  <span className="text-emerald-500 font-semibold">Target: {crop.target_moisture}%</span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Settings Form */}
      <form onSubmit={handleSubmit} className="space-y-6 pt-2">
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* Min Soil Moisture Slider & Input */}
          <div 
            className="p-5 rounded-2xl border space-y-4 transition-colors"
            style={{ background: 'var(--bg-input)', borderColor: 'var(--border-primary)' }}
          >
            <div className="flex items-center justify-between">
              <div>
                <label className="text-sm font-bold block" style={{ color: 'var(--text-primary)' }}>
                  1. ค่าความชื้นในดินขั้นต่ำ (Min Threshold %)
                </label>
                <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                  เมื่อความชื้นในดินต่ำกว่าค่านิ้ว ปั๊มน้ำจะสั่ง <strong className="text-amber-500">เปิดทำงานอัตโนมัติ</strong>
                </span>
              </div>
              <span className="text-2xl font-black text-amber-500 font-mono px-3 py-1 rounded-xl bg-amber-500/10 border border-amber-500/30">
                {formData.min_soil}%
              </span>
            </div>

            <input
              type="range"
              min="10"
              max="65"
              step="1"
              value={formData.min_soil}
              onChange={(e) => setFormData({ ...formData, min_soil: parseInt(e.target.value) })}
              className="w-full accent-amber-500 h-2 rounded-lg cursor-pointer"
            />
            <div className="flex justify-between text-[11px]" style={{ color: 'var(--text-muted)' }}>
              <span>10% (แห้งเกินไป)</span>
              <span>45-50% (แนะนำสำหรับถั่วลิสง)</span>
              <span>65%</span>
            </div>
          </div>

          {/* Target Soil Moisture Slider & Input */}
          <div 
            className="p-5 rounded-2xl border space-y-4 transition-colors"
            style={{ background: 'var(--bg-input)', borderColor: 'var(--border-primary)' }}
          >
            <div className="flex items-center justify-between">
              <div>
                <label className="text-sm font-bold block" style={{ color: 'var(--text-primary)' }}>
                  2. ระดับความชื้นเป้าหมาย (Target Threshold %)
                </label>
                <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                  เมื่อความชื้นในดินเพิ่มขึ้นถึงค่านิ้ว ปั๊มน้ำจะสั่ง <strong className="text-emerald-500">ปิดการทำงานอัตโนมัติ</strong>
                </span>
              </div>
              <span className="text-2xl font-black text-emerald-500 font-mono px-3 py-1 rounded-xl bg-emerald-500/10 border border-emerald-500/30">
                {formData.target_soil}%
              </span>
            </div>

            <input
              type="range"
              min="50"
              max="95"
              step="1"
              value={formData.target_soil}
              onChange={(e) => setFormData({ ...formData, target_soil: parseInt(e.target.value) })}
              className="w-full accent-emerald-500 h-2 rounded-lg cursor-pointer"
            />
            <div className="flex justify-between text-[11px]" style={{ color: 'var(--text-muted)' }}>
              <span>50%</span>
              <span>75-80% (ระดับสมบูรณ์ของฝัก)</span>
              <span>95% (ชุ่มน้ำเต็มที่)</span>
            </div>
          </div>

        </div>

        {/* Additional Controls */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          
          {/* Auto Mode Switch */}
          <div 
            className="p-4 rounded-2xl border flex items-center justify-between transition-colors"
            style={{ background: 'var(--bg-input)', borderColor: 'var(--border-primary)' }}
          >
            <div className="space-y-0.5">
              <span className="text-xs font-bold flex items-center gap-1.5" style={{ color: 'var(--text-primary)' }}>
                <Zap className="w-4 h-4 text-emerald-500" />
                โหมดควบคุมอัตโนมัติ (Auto Peanut Irrigation)
              </span>
              <p className="text-[11px]" style={{ color: 'var(--text-secondary)' }}>
                เปิดระบบให้ ESP32 สั่งเปิด-ปิดปั๊มน้ำอัตโนมัติตามเกณฑ์ที่กำหนด
              </p>
            </div>
            <button
              type="button"
              onClick={() => setFormData({ ...formData, auto_mode: !formData.auto_mode })}
              className={`w-14 h-8 flex items-center rounded-full p-1 transition duration-300 ${
                formData.auto_mode ? 'bg-emerald-600 justify-end' : 'bg-slate-400 dark:bg-slate-700 justify-start'
              }`}
            >
              <span className="w-6 h-6 rounded-full bg-white shadow-md transform transition" />
            </button>
          </div>

          {/* Max Duration Safety limit */}
          <div 
            className="p-4 rounded-2xl border flex items-center justify-between transition-colors"
            style={{ background: 'var(--bg-input)', borderColor: 'var(--border-primary)' }}
          >
            <div className="space-y-0.5">
              <span className="text-xs font-bold flex items-center gap-1.5" style={{ color: 'var(--text-primary)' }}>
                <Clock className="w-4 h-4 text-cyan-500" />
                จำกัดเวลารดน้ำสูงสุด (Max Safety Timeout)
              </span>
              <p className="text-[11px]" style={{ color: 'var(--text-secondary)' }}>
                ตัดการทำงานของปั๊มน้ำทันทีเมื่อทำงานเกินเวลานี้เพื่อป้องกันแปลงถั่วลิสงน้ำขัง
              </p>
            </div>
            <select
              value={formData.max_duration}
              onChange={(e) => setFormData({ ...formData, max_duration: parseInt(e.target.value) })}
              className="p-2 border rounded-xl text-xs font-bold focus:outline-none transition-colors"
              style={{ 
                background: 'var(--bg-card)', 
                borderColor: 'var(--border-primary)', 
                color: 'var(--text-primary)' 
              }}
            >
              <option value={180}>3 นาที (180s)</option>
              <option value={300}>5 นาที (300s)</option>
              <option value={600}>10 นาที (600s)</option>
              <option value={900}>15 นาที (900s)</option>
            </select>
          </div>

        </div>

        {/* Submit Button */}
        <div className="flex items-center justify-between pt-2">
          <button
            type="button"
            onClick={() => setShowEsp32Guide(!showEsp32Guide)}
            className="flex items-center space-x-1.5 text-xs font-semibold px-3 py-2 rounded-xl border transition"
            style={{ 
              background: 'var(--bg-input)', 
              borderColor: 'var(--border-primary)', 
              color: 'var(--text-secondary)' 
            }}
          >
            <Cpu className="w-4 h-4 text-cyan-400" />
            <span>วิธีให้ ESP32 ดึงค่าเกณฑ์นี้ไปใช้ (Arduino Code)</span>
            {showEsp32Guide ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>

          <button
            type="submit"
            className="flex items-center space-x-2 px-6 py-3 rounded-2xl bg-gradient-to-r from-amber-600 via-emerald-600 to-teal-600 hover:from-amber-500 hover:to-emerald-500 text-white font-bold text-sm shadow-xl shadow-amber-600/20 ring-2 ring-amber-500/30 transition"
          >
            <Save className="w-4 h-4" />
            <span>บันทึกการตั้งค่าลง Supabase DB</span>
          </button>
        </div>

      </form>

      {/* Collapsible ESP32 Integration Guide */}
      {showEsp32Guide && (
        <div 
          className="p-5 rounded-2xl border space-y-3 transition-all animate-fadeIn"
          style={{ background: 'var(--bg-input)', borderColor: 'var(--border-primary)' }}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Cpu className="w-5 h-5 text-emerald-400" />
              <h4 className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>
                โค้ด ESP32 (C++/Arduino) สำหรับดึงค่าเกณฑ์จาก Supabase DB
              </h4>
            </div>
            <button
              onClick={handleCopyCode}
              className="flex items-center space-x-1 px-3 py-1.5 rounded-xl border text-xs font-medium transition hover:opacity-80"
              style={{ background: 'var(--bg-card)', borderColor: 'var(--border-primary)', color: 'var(--text-primary)' }}
            >
              {copiedCode ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedCode ? 'คัดลอกแล้ว!' : 'คัดลอกโค้ด'}</span>
            </button>
          </div>

          <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>
            เมื่อคุณปรับค่า Min/Target Moisture บนเว็บแล้วกดบันทึก ข้อมูลจะวิ่งเข้าตาราง <code>system_settings</code> ใน Supabase ทันที บอร์ด ESP32 สามารถใช้คำสั่ง <code>HTTP GET</code> ด้านล่างนี้เพื่อดึงค่าเกณฑ์ล่าสุดไปควบคุมรีเลย์ปั๊มน้ำได้แบบสองทาง (Two-Way Communication):
          </p>

          <pre 
            className="p-4 rounded-xl text-[11px] font-mono overflow-x-auto border"
            style={{ 
              background: 'var(--bg-root)', 
              borderColor: 'var(--border-primary)', 
              color: 'var(--text-primary)' 
            }}
          >
            <code>{esp32CodeSnippet}</code>
          </pre>
        </div>
      )}

    </div>
  );
};
