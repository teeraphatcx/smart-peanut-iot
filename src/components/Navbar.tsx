'use client';

import React from 'react';
import { 
  Sprout, 
  RefreshCw, 
  Menu,
  X,
  LogOut,
  Sun,
  Moon
} from 'lucide-react';
import { FarmerUser } from '@/lib/types';

interface NavbarProps {
  currentRole: 'farmer' | 'admin';
  onRoleChange: (role: 'farmer' | 'admin') => void;
  currentUser: FarmerUser | null;
  onLogout: () => void;
  isRefreshing: boolean;
  onRefresh: () => void;
  isMobileMenuOpen: boolean;
  onToggleMobileMenu: () => void;
  theme: 'dark' | 'light';
  onToggleTheme: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentRole,
  onRoleChange,
  currentUser,
  onLogout,
  isRefreshing,
  onRefresh,
  isMobileMenuOpen,
  onToggleMobileMenu,
  theme,
  onToggleTheme
}) => {
  const isDark = theme === 'dark';

  return (
    <header
      className="sticky top-0 z-40 backdrop-blur-md shadow-lg theme-navbar border-b transition-colors duration-300"
      style={{
        background: 'var(--navbar-bg)',
        borderColor: 'var(--border-primary)',
        color: 'var(--text-primary)',
      }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        
        {/* Left: Brand Logo & Title */}
        <div className="flex items-center space-x-3">
          <button
            onClick={onToggleMobileMenu}
            className="md:hidden p-2 rounded-lg hover:bg-[var(--bg-card-hover)] focus:outline-none transition"
            style={{ color: 'var(--text-secondary)' }}
            aria-label="Toggle Menu"
          >
            {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>

          <div className="flex items-center space-x-2.5 cursor-pointer">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-600 via-emerald-500 to-teal-400 flex items-center justify-center shadow-md shadow-amber-500/20 ring-2 ring-amber-500/30">
              <Sprout className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-bold text-lg bg-gradient-to-r from-emerald-400 via-amber-300 to-teal-200 bg-clip-text text-transparent">
                  Smart Peanut Irrigation
                </span>
                <span
                  className="text-[10px] uppercase font-semibold px-2 py-0.5 rounded-full border"
                  style={{
                    background: isDark ? 'rgba(245,158,11,0.1)' : 'rgba(245,158,11,0.08)',
                    color: '#f59e0b',
                    borderColor: isDark ? 'rgba(245,158,11,0.3)' : 'rgba(245,158,11,0.2)',
                  }}
                >
                  ถั่วลิสง IoT v2.4
                </span>
              </div>
              <p className="text-xs hidden sm:block" style={{ color: 'var(--text-secondary)' }}>
                ระบบตรวจวัดความชื้นดินและรดน้ำถั่วลิสงอัตโนมัติด้วย IoT
              </p>
            </div>
          </div>
        </div>

        {/* Right Actions */}
        <div className="flex items-center space-x-2 sm:space-x-3">

          {/* Theme Toggle */}
          <button
            onClick={onToggleTheme}
            className="p-2 rounded-lg border transition-all duration-300 hover:scale-105"
            style={{
              background: isDark ? 'var(--bg-card)' : 'var(--bg-input)',
              borderColor: 'var(--border-primary)',
              color: isDark ? '#f59e0b' : '#6366f1',
            }}
            title={isDark ? 'เปลี่ยนเป็นโหมดสว่าง' : 'เปลี่ยนเป็นโหมดมืด'}
          >
            {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>

          {/* Refresh Button */}
          <button
            onClick={onRefresh}
            disabled={isRefreshing}
            className="p-2 rounded-lg border transition duration-150 disabled:opacity-50 flex items-center space-x-1 text-xs"
            style={{
              background: 'var(--bg-card)',
              borderColor: 'var(--border-primary)',
              color: 'var(--text-secondary)',
            }}
            title="รีเฟรชข้อมูลเรียลไทม์"
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin text-emerald-400' : ''}`} />
            <span className="hidden sm:inline">รีเฟรชข้อมูล</span>
          </button>

          {/* Current User & Logout Section */}
          {currentUser ? (
            <div className="flex items-center space-x-2 pl-2" style={{ borderLeft: '1px solid var(--border-primary)' }}>
              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-amber-600 to-emerald-500 flex items-center justify-center text-white font-bold text-xs border border-amber-400 shadow-md">
                {currentUser.name.charAt(0)}
              </div>
              <div className="hidden xl:block text-left text-xs">
                <div className="font-semibold" style={{ color: 'var(--text-primary)' }}>{currentUser.name}</div>
                <div className="text-[10px] text-amber-400 capitalize">
                  {currentUser.role === 'admin' ? 'ผู้ดูแลระบบ (Admin)' : 'เกษตรกรถั่วลิสง'}
                </div>
              </div>

              {/* Logout Button */}
              <button
                onClick={onLogout}
                className="p-2 rounded-lg bg-rose-950/60 hover:bg-rose-900/60 text-rose-400 hover:text-rose-200 border border-rose-800/50 transition flex items-center space-x-1 text-xs font-semibold"
                title="ออกจากระบบ (Sign Out)"
              >
                <LogOut className="w-4 h-4" />
                <span className="hidden sm:inline">ออกจากระบบ</span>
              </button>
            </div>
          ) : (
            <div className="text-xs text-amber-400 font-semibold px-2 py-1 rounded bg-amber-500/10 border border-amber-500/20">
              ยังไม่ได้เข้าระบบ
            </div>
          )}

        </div>
      </div>
    </header>
  );
};

