'use client';

import React, { useState } from 'react';
import { 
  Sprout, 
  Lock, 
  Mail, 
  ArrowRight, 
  ShieldCheck, 
  AlertCircle,
  Eye,
  EyeOff
} from 'lucide-react';
import { FarmerUser } from '@/lib/types';

interface AuthModalProps {
  isOpen: boolean;
  onLoginSuccess: (user: FarmerUser) => void;
  farmersList: FarmerUser[];
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onLoginSuccess,
  farmersList
}) => {
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loginError, setLoginError] = useState('');

  if (!isOpen) return null;

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');

    // Check against farmers list
    const foundUser = farmersList.find(
      f => f.email.toLowerCase() === loginEmail.trim().toLowerCase()
    );

    if (foundUser) {
      if (foundUser.status === 'inactive') {
        setLoginError('บัญชีนี้ถูกระงับการใช้งานชั่วคราว กรุณาติดต่อผู้ดูแลระบบ');
        return;
      }
      onLoginSuccess(foundUser);
    } else {
      // Default fallback demo admin account
      if (loginEmail.trim().toLowerCase() === 'admin@beanfarm.io') {
        const adminUser: FarmerUser = {
          id: 'usr-admin-01',
          name: 'ผู้ดูแลระบบ (Admin IoT)',
          email: 'admin@beanfarm.io',
          phone: '089-999-8888',
          role: 'admin',
          device_id: 'GATEWAY-MAIN-01',
          plot_name: 'ศูนย์ควบคุมไร่ถั่วลิสงหลัก',
          status: 'active',
          created_at: new Date().toISOString()
        };
        onLoginSuccess(adminUser);
        return;
      }

      setLoginError('ไม่พบบัญชีผู้ใช้นี้ในระบบฐานข้อมูล Supabase กรุณาติดต่อผู้ดูแลระบบเพื่อเพิ่มบัญชี');
    }
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto backdrop-blur-md"
      style={{ background: 'var(--modal-overlay)' }}
    >
      <div 
        className="relative w-full max-w-md border rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6 transition-colors duration-300"
        style={{ background: 'var(--bg-card)', borderColor: 'var(--border-primary)' }}
      >
        
        {/* Glow backdrop effect */}
        <div className="absolute -top-12 -left-12 w-48 h-48 bg-emerald-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-12 -right-12 w-48 h-48 bg-teal-500/20 rounded-full blur-3xl pointer-events-none" />

        {/* Brand Logo & Header */}
        <div className="text-center space-y-2">
          <div className="mx-auto w-14 h-14 rounded-2xl bg-gradient-to-tr from-emerald-600 via-green-500 to-teal-400 flex items-center justify-center shadow-lg shadow-emerald-500/30 ring-4 ring-emerald-500/20">
            <Sprout className="w-8 h-8 text-white animate-bounce-short" />
          </div>
          <h2 className="text-xl font-black bg-gradient-to-r from-emerald-500 via-teal-500 to-green-600 bg-clip-text text-transparent">
            Smart Peanut Irrigation System
          </h2>
          <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>
            ระบบตรวจวัดและควบคุมการรดน้ำถั่วลิสงอัตโนมัติ ด้วย IoT Realtime
          </p>
        </div>

        {/* LOGIN FORM */}
        <form onSubmit={handleLoginSubmit} className="space-y-4 text-xs">
          
          {loginError && (
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-500 flex items-start space-x-2">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{loginError}</span>
            </div>
          )}

          <div>
            <label className="block font-semibold mb-1" style={{ color: 'var(--text-secondary)' }}>อีเมลผู้ใช้งาน (Email)</label>
            <div className="relative">
              <Mail className="w-4 h-4 absolute left-3.5 top-3" style={{ color: 'var(--text-muted)' }} />
              <input
                type="email"
                required
                placeholder="somchai@farm.com"
                value={loginEmail}
                onChange={(e) => setLoginEmail(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-colors"
                style={{ 
                  background: 'var(--bg-input)', 
                  borderColor: 'var(--border-primary)', 
                  color: 'var(--text-primary)' 
                }}
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold mb-1" style={{ color: 'var(--text-secondary)' }}>รหัสผ่าน (Password)</label>
            <div className="relative">
              <Lock className="w-4 h-4 absolute left-3.5 top-3" style={{ color: 'var(--text-muted)' }} />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                placeholder="••••••••"
                value={loginPassword}
                onChange={(e) => setLoginPassword(e.target.value)}
                className="w-full pl-10 pr-10 py-2.5 border rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-colors"
                style={{ 
                  background: 'var(--bg-input)', 
                  borderColor: 'var(--border-primary)', 
                  color: 'var(--text-primary)' 
                }}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-3"
                style={{ color: 'var(--text-muted)' }}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-3 rounded-2xl bg-gradient-to-r from-emerald-600 via-teal-600 to-green-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-sm shadow-lg shadow-emerald-600/30 ring-2 ring-emerald-500/30 transition flex items-center justify-center space-x-2"
          >
            <span>เข้าสู่ระบบ</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          {/* Admin Managed Notice */}
          <div 
            className="p-3 rounded-xl border text-[11px] flex items-center space-x-2 transition-colors"
            style={{ 
              background: 'var(--bg-input)', 
              borderColor: 'var(--border-primary)', 
              color: 'var(--text-secondary)' 
            }}
          >
            <ShieldCheck className="w-4 h-4 text-indigo-400 shrink-0" />
            <span>บัญชีเกษตรกรใหม่จะถูกสร้างและจัดสรรโดย <strong>ผู้ดูแลระบบ (Admin)</strong> เท่านั้น</span>
          </div>

        </form>

      </div>
    </div>
  );
};


