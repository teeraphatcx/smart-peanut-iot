'use client';

import React, { useState, useEffect, useRef } from 'react';
import confetti from 'canvas-confetti';
import { supabase } from '@/lib/supabaseClient';
import { Navbar } from '@/components/Navbar';
import { Sidebar, TabType } from '@/components/Sidebar';
import { MoistureGauge } from '@/components/MoistureGauge';
import { SensorStatsGrid } from '@/components/SensorStatsGrid';
import { RealtimeChart } from '@/components/RealtimeChart';
import { WateringHistoryTable } from '@/components/WateringHistoryTable';
import { FarmersManager } from '@/components/FarmersManager';
import { SettingsManager } from '@/components/SettingsManager';
import { HardwareHealth } from '@/components/HardwareHealth';
import { AnalyticsReport } from '@/components/AnalyticsReport';
import { AuthModal } from '@/components/AuthModal';
import { MobileBottomNav } from '@/components/MobileBottomNav';

import { 
  DeviceStatus, 
  FarmerUser, 
  SensorData, 
  SystemSettings, 
  WateringLog 
} from '@/lib/types';
import { 
  DEFAULT_SETTINGS, 
  INITIAL_DEVICES, 
  INITIAL_FARMERS 
} from '@/lib/mockData';
import { 
  deleteFarmerFromSupabase, 
  deriveWateringLogsFromSensorData, 
  fetchFarmersFromSupabase, 
  fetchSensorHistoryFromSupabase, 
  fetchSettingsFromSupabase,
  getStoredDevices, 
  getStoredSettings, 
  pushFarmerToSupabase, 
  pushSensorReadingToSupabase, 
  pushSettingsToSupabase,
  saveStoredSettings, 
  updateFarmerInSupabase 
} from '@/lib/storage';
import { sendTelegramPeanutStatus, sendTelegramPumpAlert } from '@/lib/telegram';

export default function Home() {
  // Authentication State
  const [currentUser, setCurrentUser] = useState<FarmerUser | null>(null);
  const [isAuthOpen, setIsAuthOpen] = useState(true);

  // App State
  const [activeTab, setActiveTab] = useState<TabType>('dashboard');
  const [currentRole, setCurrentRole] = useState<'farmer' | 'admin'>('farmer');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Theme State (dark / light)
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');

  useEffect(() => {
    const saved = localStorage.getItem('bean_iot_theme') as 'dark' | 'light' | null;
    if (saved) setTheme(saved);
  }, []);

  const toggleTheme = () => {
    const next = theme === 'dark' ? 'light' : 'dark';
    setTheme(next);
    localStorage.setItem('bean_iot_theme', next);
  };

  // Settings & Users State
  const [settings, setSettings] = useState<SystemSettings>(DEFAULT_SETTINGS);
  const [farmers, setFarmers] = useState<FarmerUser[]>(INITIAL_FARMERS);
  const [devices, setDevices] = useState<DeviceStatus[]>(INITIAL_DEVICES);

  // Sensor Data & Real Supabase State
  const [sensorHistory, setSensorHistory] = useState<SensorData[]>([]);
  const [isWatering, setIsWatering] = useState(false);
  const [wateringTimer, setWateringTimer] = useState(0);
  const [isSupabaseConnected, setIsSupabaseConnected] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Session ref
  const wateringSessionRef = useRef<{
    startTime: string;
    startDate: Date;
    startMoisture: number;
  } | null>(null);

  // Load Initial Data & User Session
  useEffect(() => {
    // 1. Check local session
    const savedUserJson = localStorage.getItem('bean_iot_active_user');
    if (savedUserJson) {
      try {
        const user = JSON.parse(savedUserJson);
        setCurrentUser(user);
        setCurrentRole(user.role || 'farmer');
        setIsAuthOpen(false);
      } catch {
        setIsAuthOpen(true);
      }
    } else {
      setIsAuthOpen(true);
    }

    // 2. Load settings & devices (from Cache & real Supabase DB)
    setSettings(getStoredSettings());
    setDevices(getStoredDevices());
    fetchSettingsFromSupabase().then(dbSettings => {
      if (dbSettings) setSettings(dbSettings);
    });

    // 3. Fetch Farmers / Users from Supabase DB
    fetchFarmersFromSupabase().then(data => {
      setFarmers(data);
    });

    // 4. Initial Fetch Real sensor history directly from Supabase DB
    fetchSensorHistoryFromSupabase(200).then(history => {
      setSensorHistory(history);
      if (history.length > 0) {
        setIsWatering(history[history.length - 1].pump_status);
        setIsSupabaseConnected(true);
      }
    });
  }, []);

  // INSTANT SUPABASE REALTIME SUBSCRIPTION (WebSocket Instant Streaming)
  useEffect(() => {
    if (!currentUser) return;

    const channel = supabase
      .channel('realtime_sensor_data')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'sensor_data' },
        (payload) => {
          if (payload.new) {
            const newRow: SensorData = {
              id: payload.new.id,
              created_at: payload.new.created_at || new Date().toISOString(),
              soil: Number(payload.new.soil) || 0,
              temperature: Number(payload.new.temperature) || 0,
              humidity: Number(payload.new.humidity) || 0,
              pump_status: Boolean(payload.new.pump_status)
            };

            // Trigger instant Telegram Alert when pump status changes!
            setSensorHistory(prev => {
              if (prev.length > 0 && prev[prev.length - 1].pump_status !== newRow.pump_status) {
                sendTelegramPumpAlert(newRow.pump_status, newRow.soil);
              }
              return [...prev.slice(-199), newRow];
            });

            setIsWatering(newRow.pump_status);
            setIsSupabaseConnected(true);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [currentUser]);

  // Derived REAL watering logs directly from Supabase DB sensor records
  const wateringLogs: WateringLog[] = React.useMemo(() => {
    return deriveWateringLogsFromSensorData(sensorHistory);
  }, [sensorHistory]);

  // Auth Handlers
  const handleLoginSuccess = (user: FarmerUser) => {
    setCurrentUser(user);
    setCurrentRole(user.role);
    localStorage.setItem('bean_iot_active_user', JSON.stringify(user));
    setIsAuthOpen(false);
  };

  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem('bean_iot_active_user');
    setIsAuthOpen(true);
  };

  // Latest REAL sensor reading from Supabase DB
  const latestSensor: SensorData = sensorHistory.length > 0 
    ? sensorHistory[sensorHistory.length - 1] 
    : {
        id: 0,
        created_at: new Date().toISOString(),
        soil: 50,
        temperature: 29.5,
        humidity: 68.0,
        pump_status: false
      };

  // Timer tick for active watering session
  useEffect(() => {
    let timerInterval: any = null;
    if (isWatering) {
      timerInterval = setInterval(() => {
        setWateringTimer(prev => prev + 1);
      }, 1000);
    } else {
      setWateringTimer(0);
    }
    return () => clearInterval(timerInterval);
  }, [isWatering]);

  // Main 3-Second Real-time Polling directly from Supabase DB
  useEffect(() => {
    if (!currentUser) return; // Only loop when logged in

    const loopInterval = setInterval(async () => {
      // Fetch REAL latest rows directly from Supabase DB
      const freshHistory = await fetchSensorHistoryFromSupabase(200);

      if (freshHistory.length > 0) {
        setSensorHistory(freshHistory);
        setIsSupabaseConnected(true);
        const latestFromDb = freshHistory[freshHistory.length - 1];
        setIsWatering(latestFromDb.pump_status);

        // Auto Irrigation Controller logic (if enabled)
        if (settings.auto_mode) {
          if (!latestFromDb.pump_status && latestFromDb.soil < settings.min_soil) {
            // Auto start watering -> Push real command to Supabase DB
            const pushed = await pushSensorReadingToSupabase({
              created_at: new Date().toISOString(),
              soil: latestFromDb.soil,
              temperature: latestFromDb.temperature,
              humidity: latestFromDb.humidity,
              pump_status: true
            });
            sendTelegramPumpAlert(true, pushed.soil);
          } else if (latestFromDb.pump_status && latestFromDb.soil >= settings.target_soil) {
            // Auto stop watering -> Push real command to Supabase DB
            const pushed = await pushSensorReadingToSupabase({
              created_at: new Date().toISOString(),
              soil: latestFromDb.soil,
              temperature: latestFromDb.temperature,
              humidity: latestFromDb.humidity,
              pump_status: false
            });
            sendTelegramPumpAlert(false, pushed.soil);
            try {
              confetti({ particleCount: 80, spread: 70, origin: { y: 0.6 } });
            } catch (e) {}
          }
        }
      }

    }, 3000);

    return () => clearInterval(loopInterval);
  }, [latestSensor, isWatering, settings, currentUser]);

  // DEDICATED 10-SECOND TELEGRAM LOOP: Sends REAL Supabase DB Row
  useEffect(() => {
    if (!currentUser) return;

    // Send immediately on mount
    sendTelegramPeanutStatus(latestSensor, settings.min_soil, settings.target_soil);

    // Loop every 10 seconds with REAL data
    const telegramInterval = setInterval(async () => {
      const freshHistory = await fetchSensorHistoryFromSupabase(1);
      const realLatest = freshHistory.length > 0 ? freshHistory[0] : latestSensor;
      sendTelegramPeanutStatus(realLatest, settings.min_soil, settings.target_soil);
    }, 10000);

    return () => clearInterval(telegramInterval);
  }, [latestSensor, settings, currentUser]);

  // Manual Toggle Pump Switch -> Pushes directly to Supabase DB & sends Telegram alert
  const handleManualTogglePump = async (targetState?: boolean) => {
    const nextState = targetState !== undefined ? targetState : !isWatering;
    setIsWatering(nextState);

    // Push new pump_status and set auto_mode=false in system_settings table (Clean 1-way command to ESP32)
    const updatedSettings: SystemSettings = { 
      ...settings, 
      auto_mode: false, 
      pump_status: nextState 
    };
    setSettings(updatedSettings);
    saveStoredSettings(updatedSettings);
    await pushSettingsToSupabase(updatedSettings);

    const pushed = await pushSensorReadingToSupabase({
      created_at: new Date().toISOString(),
      soil: latestSensor.soil,
      temperature: latestSensor.temperature,
      humidity: latestSensor.humidity,
      pump_status: nextState
    });

    setSensorHistory(prev => [...prev, pushed]);
    sendTelegramPumpAlert(nextState, pushed.soil);
  };

  // Refresh data button -> Queries REAL Supabase DB
  const handleRefresh = async () => {
    setIsRefreshing(true);
    const [history, farmerData] = await Promise.all([
      fetchSensorHistoryFromSupabase(200),
      fetchFarmersFromSupabase()
    ]);
    setSensorHistory(history);
    setFarmers(farmerData);
    setIsRefreshing(false);
  };

  // Settings save handler (Sync directly to Supabase DB for ESP32)
  const handleSaveSettings = async (newSettings: SystemSettings) => {
    setSettings(newSettings);
    saveStoredSettings(newSettings);
    await pushSettingsToSupabase(newSettings);
  };

  // Farmers CRUD Handlers (Admin Only - Syncs to Supabase DB)
  const handleAddFarmer = async (newFarmerData: Omit<FarmerUser, 'id' | 'created_at'>) => {
    const newFarmer: FarmerUser = {
      ...newFarmerData,
      id: `usr-${Date.now()}`,
      created_at: new Date().toISOString()
    };
    setFarmers(prev => [...prev, newFarmer]);
    await pushFarmerToSupabase(newFarmer);
  };

  const handleUpdateFarmer = async (id: string, updatedFields: Partial<FarmerUser>) => {
    setFarmers(prev => prev.map(f => f.id === id ? { ...f, ...updatedFields } : f));
    await updateFarmerInSupabase(id, updatedFields);
  };

  const handleDeleteFarmer = async (id: string) => {
    setFarmers(prev => prev.filter(f => f.id !== id));
    await deleteFarmerFromSupabase(id);
  };

  // Total water used today derived from REAL Supabase DB logs
  const totalWaterToday = wateringLogs.reduce((acc, curr) => acc + (curr.water_liters || 0), 0);

  return (
    <div data-theme={theme} className="min-h-screen flex flex-col font-sans selection:bg-emerald-500" style={{ background: 'var(--bg-root)', color: 'var(--text-primary)' }}>
      
      {/* AUTHENTICATION MODAL */}
      <AuthModal
        isOpen={isAuthOpen || !currentUser}
        onLoginSuccess={handleLoginSuccess}
        farmersList={farmers}
      />

      {/* Main App Bar */}
      <Navbar
        currentRole={currentRole}
        onRoleChange={setCurrentRole}
        currentUser={currentUser}
        onLogout={handleLogout}
        isRefreshing={isRefreshing}
        onRefresh={handleRefresh}
        isMobileMenuOpen={isMobileMenuOpen}
        onToggleMobileMenu={() => setIsMobileMenuOpen(prev => !prev)}
        theme={theme}
        onToggleTheme={toggleTheme}
      />

      {/* Body layout with Sidebar and Main Content */}
      <div className="flex-1 flex max-w-7xl w-full mx-auto px-3 sm:px-6 lg:px-8 py-4 gap-4 sm:gap-5 pb-20 md:pb-6">
        
        {/* Navigation Sidebar */}
        <Sidebar
          activeTab={activeTab}
          onTabChange={setActiveTab}
          currentRole={currentRole}
          isMobileOpen={isMobileMenuOpen}
          onCloseMobile={() => setIsMobileMenuOpen(false)}
        />

        {/* Main Content Area */}
        <main className="flex-1 space-y-4 min-w-0">
          
          {/* TAB 1: Real-time Dashboard */}
          {activeTab === 'dashboard' && (
            <div className="space-y-4">
              
              {/* Sensor Stats Cards */}
              <SensorStatsGrid
                latestData={latestSensor}
                minMoisture={settings.min_soil}
                targetMoisture={settings.target_soil}
                onTogglePump={() => handleManualTogglePump()}
              />

              {/* Side-by-Side: Moisture Gauge (left) & Realtime Chart (right) */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-stretch">
                <div className="lg:col-span-5 flex flex-col">
                  <MoistureGauge
                    currentMoisture={latestSensor.soil}
                    minThreshold={settings.min_soil}
                    targetThreshold={settings.target_soil}
                    cropName={settings.crop_type}
                    isWatering={isWatering}
                    onToggleWatering={() => handleManualTogglePump()}
                  />
                </div>
                <div className="lg:col-span-7 flex flex-col">
                  <RealtimeChart
                    history={sensorHistory}
                    minThreshold={settings.min_soil}
                    targetThreshold={settings.target_soil}
                  />
                </div>
              </div>

            </div>
          )}

          {/* TAB 2: Watering History derived 100% from Supabase DB */}
          {activeTab === 'watering_history' && (
            <WateringHistoryTable logs={wateringLogs} />
          )}

          {/* TAB 3: Analytics & Reports */}
          {activeTab === 'analytics' && (
            <AnalyticsReport
              sensorHistory={sensorHistory}
              wateringLogs={wateringLogs}
            />
          )}

          {/* TAB 4: Moisture & System Settings */}
          {activeTab === 'settings' && (
            <SettingsManager
              settings={settings}
              onSaveSettings={handleSaveSettings}
              currentRole={currentRole}
            />
          )}

          {/* TAB 5: Admin - Farmers Management */}
          {activeTab === 'farmers' && currentRole === 'admin' && (
            <FarmersManager
              farmers={farmers}
              onAddFarmer={handleAddFarmer}
              onUpdateFarmer={handleUpdateFarmer}
              onDeleteFarmer={handleDeleteFarmer}
            />
          )}

          {/* TAB 6: Admin - Hardware Diagnostics */}
          {activeTab === 'hardware' && currentRole === 'admin' && (
            <HardwareHealth
              devices={devices}
              onRefreshDevices={handleRefresh}
              isSupabaseConnected={isSupabaseConnected}
            />
          )}

        </main>
      </div>

      {/* Mobile Bottom Navigation Bar (For Smartphones) */}
      <MobileBottomNav
        activeTab={activeTab}
        onTabChange={setActiveTab}
        currentRole={currentRole}
      />

    </div>
  );
}
