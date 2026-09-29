'use client';

import React from 'react';
import { 
  LayoutDashboard, 
  Droplet, 
  TrendingUp, 
  Settings, 
  Users,
  Activity
} from 'lucide-react';
import { TabType } from './Sidebar';

interface MobileBottomNavProps {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
  currentRole: 'farmer' | 'admin';
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({
  activeTab,
  onTabChange,
  currentRole
}) => {
  const navItems = [
    { id: 'dashboard' as TabType, label: 'แดชบอร์ด', icon: LayoutDashboard },
    { id: 'watering_history' as TabType, label: 'ประวัติ', icon: Droplet },
    { id: 'analytics' as TabType, label: 'แนวโน้ม', icon: TrendingUp },
    { id: 'settings' as TabType, label: 'ตั้งค่า', icon: Settings },
    ...(currentRole === 'admin'
      ? [{ id: 'farmers' as TabType, label: 'เกษตรกร', icon: Users }]
      : [])
  ];

  return (
    <div 
      className="md:hidden fixed bottom-0 left-0 right-0 z-40 backdrop-blur-lg border-t px-2 py-1.5 transition-all duration-300"
      style={{ 
        background: 'var(--navbar-bg)', 
        borderColor: 'var(--border-primary)',
        boxShadow: '0 -4px 20px rgba(0, 0, 0, 0.15)'
      }}
    >
      <div className="flex items-center justify-around max-w-md mx-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-xl transition-all duration-200 min-w-[56px] ${
                isActive ? 'scale-105' : 'opacity-70 hover:opacity-100'
              }`}
              style={{
                color: isActive ? '#10b981' : 'var(--text-secondary)'
              }}
            >
              <div 
                className={`p-1 rounded-lg transition-colors ${
                  isActive ? 'bg-emerald-500/15 text-emerald-400' : ''
                }`}
              >
                <Icon className="w-5 h-5" />
              </div>
              <span className={`text-[10px] mt-0.5 font-medium tracking-tight ${
                isActive ? 'font-bold text-emerald-400' : ''
              }`}>
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
