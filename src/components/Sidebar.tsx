'use client';

import React, { useState } from 'react';
import {
  LayoutDashboard,
  Droplet,
  TrendingUp,
  Settings,
  Users,
  Activity,
  Sprout,
  ChevronDown,
  ChevronRight,
  Folder,
} from 'lucide-react';

export type TabType =
  | 'dashboard'
  | 'watering_history'
  | 'analytics'
  | 'settings'
  | 'farmers'
  | 'hardware';

interface SidebarProps {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
  currentRole: 'farmer' | 'admin';
  isMobileOpen: boolean;
  onCloseMobile: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  onTabChange,
  currentRole,
  isMobileOpen,
  onCloseMobile,
}) => {
  const [isExploreOpen, setIsExploreOpen] = useState(true);
  const [isAdminOpen, setIsAdminOpen] = useState(true);

  const handleSelect = (tab: TabType) => {
    onTabChange(tab);
    onCloseMobile();
  };

  const MenuItem = ({
    tab,
    label,
    icon: Icon,
    badge,
  }: {
    tab: TabType;
    label: string;
    icon: React.ElementType;
    badge?: string;
  }) => {
    const isActive = activeTab === tab;
    return (
      <button
        onClick={() => handleSelect(tab)}
        className="group w-full flex items-center gap-2.5 pl-10 pr-3 py-2 rounded-xl text-[13px] font-medium transition-all duration-150"
        style={{
          background: isActive ? 'var(--sidebar-item-active)' : 'transparent',
          color: isActive ? 'var(--text-primary)' : 'var(--sidebar-text)',
        }}
        onMouseEnter={(e) => {
          if (!isActive) {
            e.currentTarget.style.background = 'var(--sidebar-item-hover)';
            e.currentTarget.style.color = 'var(--text-primary)';
          }
        }}
        onMouseLeave={(e) => {
          if (!isActive) {
            e.currentTarget.style.background = 'transparent';
            e.currentTarget.style.color = 'var(--sidebar-text)';
          }
        }}
      >
        <Icon
          className="w-4 h-4 shrink-0 transition"
          style={{ color: isActive ? '#10b981' : 'var(--text-muted)' }}
        />
        <span className="flex-1 text-left truncate">{label}</span>
        {badge && (
          <span className="text-[9px] px-1.5 py-0.5 rounded-md bg-indigo-500/15 text-indigo-400 font-bold shrink-0">
            {badge}
          </span>
        )}
      </button>
    );
  };

  const SectionHeader = ({
    label,
    icon: Icon,
    isOpen,
    onToggle,
    count,
  }: {
    label: string;
    icon: React.ElementType;
    isOpen: boolean;
    onToggle: () => void;
    count?: number;
  }) => (
    <button
      onClick={onToggle}
      className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-[13px] font-semibold transition group"
      style={{ color: 'var(--text-primary)' }}
      onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--sidebar-item-hover)'; }}
      onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
    >
      <Icon className="w-4 h-4 shrink-0" style={{ color: 'var(--sidebar-text)' }} />
      <span className="flex-1 text-left">{label}</span>
      {count !== undefined && (
        <span
          className="text-[9px] px-1.5 py-0.5 rounded-md font-bold"
          style={{
            background: 'var(--sidebar-item-active)',
            color: 'var(--sidebar-text)',
            border: '1px solid var(--border-subtle)',
          }}
        >
          {count}
        </span>
      )}
      {isOpen
        ? <ChevronDown className="w-3.5 h-3.5 shrink-0" style={{ color: 'var(--text-muted)' }} />
        : <ChevronRight className="w-3.5 h-3.5 shrink-0" style={{ color: 'var(--text-muted)' }} />
      }
    </button>
  );

  return (
    <>
      {isMobileOpen && (
        <div
          className="fixed inset-0 z-30 backdrop-blur-sm md:hidden theme-overlay"
          style={{ background: 'var(--modal-overlay)' }}
          onClick={onCloseMobile}
        />
      )}

      <aside
        className={`
          fixed md:sticky top-[4.25rem] z-30
          h-[calc(100vh-5rem)] w-[250px]
          rounded-2xl border
          shadow-xl
          transition-all duration-300
          flex flex-col
          m-2 p-3
          ${isMobileOpen ? 'translate-x-0 left-2' : '-translate-x-full md:translate-x-0'}
        `}
        style={{
          background: 'var(--sidebar-bg)',
          borderColor: 'var(--border-subtle)',
          boxShadow: `0 10px 25px -5px var(--shadow-color)`,
        }}
      >
        {/* Brand */}
        <div
          className="flex items-center gap-2.5 px-2 pb-3 mb-2 border-b"
          style={{ borderColor: 'var(--border-subtle)' }}
        >
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-amber-500 via-emerald-500 to-teal-400 p-[2px] shadow shadow-emerald-500/15">
            <div
              className="w-full h-full rounded-[10px] flex items-center justify-center"
              style={{ background: 'var(--sidebar-bg)' }}
            >
              <Sprout className="w-4 h-4 text-emerald-400" />
            </div>
          </div>
          <div>
            <h2 className="text-[13px] font-extrabold leading-none" style={{ color: 'var(--text-primary)' }}>
              Smart Peanut
            </h2>
            <p className="text-[9px] mt-0.5" style={{ color: 'var(--text-muted)' }}>
              IoT Irrigation System
            </p>
          </div>
        </div>

        {/* Explore */}
        <div className="space-y-0.5">
          <SectionHeader
            label="Explore"
            icon={LayoutDashboard}
            isOpen={isExploreOpen}
            onToggle={() => setIsExploreOpen(!isExploreOpen)}
          />
          {isExploreOpen && (
            <div className="space-y-0.5">
              <MenuItem tab="dashboard" label="แดชบอร์ดเรียลไทม์" icon={LayoutDashboard} />
              <MenuItem tab="watering_history" label="ประวัติการรดน้ำ" icon={Droplet} />
              <MenuItem tab="analytics" label="รายงาน & แนวโน้ม" icon={TrendingUp} />
            </div>
          )}
        </div>

        <div className="h-px mx-1 my-2" style={{ background: 'var(--border-subtle)' }} />

        {/* Assets */}
        <div className="space-y-0.5">
          {currentRole === 'admin' ? (
            <>
              <SectionHeader
                label="Assets"
                icon={Folder}
                isOpen={isAdminOpen}
                onToggle={() => setIsAdminOpen(!isAdminOpen)}
                count={3}
              />
              {isAdminOpen && (
                <div className="space-y-0.5">
                  <MenuItem tab="settings" label="ตั้งค่าความชื้น & ระบบ" icon={Settings} />
                  <MenuItem tab="farmers" label="จัดการเกษตรกร" icon={Users} badge="Admin" />
                  <MenuItem tab="hardware" label="สถานะอุปกรณ์ IoT" icon={Activity} badge="Admin" />
                </div>
              )}
            </>
          ) : (
            <MenuItem tab="settings" label="ตั้งค่าความชื้น & ระบบ" icon={Settings} />
          )}
        </div>
      </aside>
    </>
  );
};
