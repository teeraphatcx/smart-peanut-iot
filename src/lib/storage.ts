import { supabase } from './supabaseClient';
import { DEFAULT_SETTINGS, INITIAL_DEVICES, INITIAL_FARMERS } from './mockData';
import { DeviceStatus, FarmerUser, SensorData, SystemSettings, WateringLog } from './types';

const STORAGE_KEYS = {
  SETTINGS: 'bean_iot_settings',
  FARMERS: 'bean_iot_farmers',
  DEVICES: 'bean_iot_devices'
};

// --- SETTINGS STORAGE (LOCAL CACHE + SUPABASE CLOUD SYNC) ---
export function getStoredSettings(): SystemSettings {
  if (typeof window === 'undefined') return DEFAULT_SETTINGS;
  const data = localStorage.getItem(STORAGE_KEYS.SETTINGS);
  if (!data) return DEFAULT_SETTINGS;
  try {
    return { ...DEFAULT_SETTINGS, ...JSON.parse(data) };
  } catch {
    return DEFAULT_SETTINGS;
  }
}

export function saveStoredSettings(settings: SystemSettings): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
}

// Fetch real system_settings from Supabase for ESP32 coordination
export async function fetchSettingsFromSupabase(): Promise<SystemSettings | null> {
  try {
    const { data, error } = await supabase
      .from('system_settings')
      .select('*')
      .eq('id', 1)
      .single();

    if (error) {
      console.warn('Supabase system_settings fetch notice:', error.message);
      return null;
    }

    if (data) {
      const settings: SystemSettings = {
        min_soil: Number(data.min_soil) || 30,
        target_soil: Number(data.target_soil) || 65,
        auto_mode: Boolean(data.auto_mode),
        max_duration: Number(data.max_duration) || 300,
        crop_type: data.crop_type || 'ถั่วลิสง (Peanut)',
        polling_interval: 3,
        pump_status: data.pump_status !== undefined ? Boolean(data.pump_status) : false
      };
      saveStoredSettings(settings);
      return settings;
    }
  } catch (err) {
    console.warn('Failed to fetch settings from Supabase:', err);
  }
  return null;
}

// Push system_settings to Supabase so ESP32 can fetch and apply in real time
export async function pushSettingsToSupabase(settings: SystemSettings): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('system_settings')
      .upsert({
        id: 1,
        min_soil: settings.min_soil,
        target_soil: settings.target_soil,
        auto_mode: settings.auto_mode,
        max_duration: settings.max_duration,
        crop_type: settings.crop_type,
        pump_status: settings.pump_status !== undefined ? settings.pump_status : false,
        updated_at: new Date().toISOString()
      });

    if (error) {
      console.warn('Supabase system_settings push error:', error.message);
      return false;
    }
    saveStoredSettings(settings);
    return true;
  } catch (err) {
    console.warn('Failed to push settings to Supabase:', err);
    return false;
  }
}

// --- REAL SENSOR DATA FETCHING FROM SUPABASE ---
export async function fetchSensorHistoryFromSupabase(limit = 200): Promise<SensorData[]> {
  try {
    const { data, error } = await supabase
      .from('sensor_data')
      .select('*')
      .order('id', { ascending: false })
      .limit(limit);

    if (error) {
      console.warn('Supabase sensor_data fetch error:', error.message);
      return [];
    }

    if (data && data.length > 0) {
      const formatted: SensorData[] = data.map((row: any) => ({
        id: row.id,
        created_at: row.created_at || new Date().toISOString(),
        soil: row.soil !== undefined && row.soil !== null ? Number(row.soil) : 50,
        temperature: row.temperature !== undefined && row.temperature !== null ? Number(row.temperature) : 29.5,
        humidity: row.humidity !== undefined && row.humidity !== null ? Number(row.humidity) : 65.0,
        pump_status: Boolean(row.pump_status)
      })).reverse();

      return formatted;
    }
  } catch (err) {
    console.warn('Supabase query exception:', err);
  }

  return [];
}

// --- DERIVE REAL WATERING LOGS FROM REAL SUPABASE SENSOR ROWS ---
export function deriveWateringLogsFromSensorData(sensorRows: SensorData[]): WateringLog[] {
  const logs: WateringLog[] = [];
  if (!sensorRows || sensorRows.length === 0) return logs;

  // Sort by ascending order
  const sorted = [...sensorRows].sort((a, b) => a.id - b.id);

  let currentBlock: { startRow: SensorData; endRow: SensorData } | null = null;

  for (let i = 0; i < sorted.length; i++) {
    const row = sorted[i];
    if (row.pump_status && !currentBlock) {
      currentBlock = {
        startRow: row,
        endRow: row
      };
    } else if (row.pump_status && currentBlock) {
      currentBlock.endRow = row;
    } else if (!row.pump_status && currentBlock) {
      // Block ended
      const startTime = new Date(currentBlock.startRow.created_at);
      const endTime = new Date(currentBlock.endRow.created_at);
      const durationSeconds = Math.max(3, Math.round((endTime.getTime() - startTime.getTime()) / 1000));
      const waterLiters = Number(((durationSeconds / 60) * 30).toFixed(1));

      logs.push({
        id: `db-log-${currentBlock.startRow.id}`,
        created_at: currentBlock.startRow.created_at,
        start_time: startTime.toLocaleTimeString('th-TH'),
        end_time: endTime.toLocaleTimeString('th-TH'),
        duration_seconds: durationSeconds,
        trigger_mode: 'AUTO',
        start_moisture: currentBlock.startRow.soil,
        end_moisture: currentBlock.endRow.soil,
        water_liters: waterLiters,
        operator_name: 'ระบบรดน้ำอัตโนมัติ (Supabase DB)'
      });
      currentBlock = null;
    }
  }

  // Handle active block if currently watering
  if (currentBlock) {
    const startTime = new Date(currentBlock.startRow.created_at);
    const endTime = new Date(currentBlock.endRow.created_at);
    const durationSeconds = Math.max(3, Math.round((endTime.getTime() - startTime.getTime()) / 1000));
    logs.push({
      id: `db-log-${currentBlock.startRow.id}`,
      created_at: currentBlock.startRow.created_at,
      start_time: startTime.toLocaleTimeString('th-TH'),
      end_time: 'กำลังทำงาน...',
      duration_seconds: durationSeconds,
      trigger_mode: 'AUTO',
      start_moisture: currentBlock.startRow.soil,
      end_moisture: currentBlock.endRow.soil,
      water_liters: Number(((durationSeconds / 60) * 30).toFixed(1)),
      operator_name: 'ระบบรดน้ำอัตโนมัติ (Supabase DB)'
    });
  }

  return logs.reverse(); // Most recent first
}

// --- PUSH REAL SENSOR READING TO SUPABASE ---
export async function pushSensorReadingToSupabase(reading: Omit<SensorData, 'id'>): Promise<SensorData> {
  try {
    const { data, error } = await supabase
      .from('sensor_data')
      .insert([
        {
          soil: Math.round(reading.soil),
          temperature: reading.temperature,
          humidity: reading.humidity,
          pump_status: reading.pump_status,
          created_at: reading.created_at
        }
      ])
      .select();

    if (!error && data && data.length > 0) {
      return {
        id: data[0].id,
        created_at: data[0].created_at,
        soil: Number(data[0].soil),
        temperature: Number(data[0].temperature),
        humidity: Number(data[0].humidity),
        pump_status: Boolean(data[0].pump_status)
      };
    }
  } catch (err) {
    console.warn('Failed to push sensor_data to Supabase:', err);
  }

  return {
    id: Date.now(),
    ...reading
  };
}

// --- FARMER USERS SUPABASE SYNC ---
export async function fetchFarmersFromSupabase(): Promise<FarmerUser[]> {
  try {
    const { data, error } = await supabase
      .from('farmer_users')
      .select('*')
      .order('created_at', { ascending: true });

    if (!error && data && data.length > 0) {
      const farmers: FarmerUser[] = data.map((row: any) => ({
        id: String(row.id),
        name: row.name,
        email: row.email,
        phone: row.phone || '',
        password: row.password || 'password123',
        role: row.role === 'admin' ? 'admin' : 'farmer',
        plot_name: row.plot_name || 'แปลงปลูกถั่วลิสง',
        device_id: row.device_id || 'ESP32-SOIL-NODE-01',
        status: row.status === 'inactive' ? 'inactive' : 'active',
        created_at: row.created_at || new Date().toISOString()
      }));

      if (typeof window !== 'undefined') {
        localStorage.setItem(STORAGE_KEYS.FARMERS, JSON.stringify(farmers));
      }
      return farmers;
    }
  } catch (err) {
    console.warn('Supabase farmer_users fetch warning:', err);
  }

  return getStoredFarmers();
}

export function getStoredFarmers(): FarmerUser[] {
  if (typeof window === 'undefined') return INITIAL_FARMERS;
  const data = localStorage.getItem(STORAGE_KEYS.FARMERS);
  if (!data) {
    localStorage.setItem(STORAGE_KEYS.FARMERS, JSON.stringify(INITIAL_FARMERS));
    return INITIAL_FARMERS;
  }
  try {
    return JSON.parse(data);
  } catch {
    return INITIAL_FARMERS;
  }
}

export async function pushFarmerToSupabase(farmer: FarmerUser): Promise<void> {
  const current = getStoredFarmers();
  const updated = [...current.filter(f => f.id !== farmer.id), farmer];
  saveFarmers(updated);

  try {
    const { error } = await supabase
      .from('farmer_users')
      .insert([
        {
          id: farmer.id,
          name: farmer.name,
          email: farmer.email,
          phone: farmer.phone,
          password: farmer.password || 'password123',
          role: farmer.role,
          plot_name: farmer.plot_name,
          device_id: farmer.device_id,
          status: farmer.status,
          created_at: farmer.created_at
        }
      ]);

    if (error) console.warn('Supabase farmer_users insert note:', error.message);
  } catch (e) {
    console.warn('Supabase farmer_users exception:', e);
  }
}

export async function updateFarmerInSupabase(id: string, updatedFields: Partial<FarmerUser>): Promise<void> {
  const current = getStoredFarmers();
  const updated = current.map(f => f.id === id ? { ...f, ...updatedFields } : f);
  saveFarmers(updated);

  try {
    const { error } = await supabase
      .from('farmer_users')
      .update(updatedFields)
      .eq('id', id);

    if (error) console.warn('Supabase update farmer warning:', error.message);
  } catch (e) {
    console.warn('Supabase update farmer exception:', e);
  }
}

export async function deleteFarmerFromSupabase(id: string): Promise<void> {
  const current = getStoredFarmers();
  const updated = current.filter(f => f.id !== id);
  saveFarmers(updated);

  try {
    const { error } = await supabase
      .from('farmer_users')
      .delete()
      .eq('id', id);

    if (error) console.warn('Supabase delete farmer warning:', error.message);
  } catch (e) {
    console.warn('Supabase delete farmer exception:', e);
  }
}

export function saveFarmers(farmers: FarmerUser[]): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEYS.FARMERS, JSON.stringify(farmers));
}

// --- DEVICES STORAGE ---
export function getStoredDevices(): DeviceStatus[] {
  if (typeof window === 'undefined') return INITIAL_DEVICES;
  const data = localStorage.getItem(STORAGE_KEYS.DEVICES);
  if (!data) {
    localStorage.setItem(STORAGE_KEYS.DEVICES, JSON.stringify(INITIAL_DEVICES));
    return INITIAL_DEVICES;
  }
  try {
    return JSON.parse(data);
  } catch {
    return INITIAL_DEVICES;
  }
}
