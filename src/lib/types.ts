export interface SensorData {
  id: number;
  created_at: string;
  soil: number; // Moisture %
  temperature: number; // °C
  humidity: number; // Air humidity %
  pump_status: boolean; // true = watering, false = stopped
}

export interface SystemSettings {
  min_soil: number; // Minimum threshold to start watering
  target_soil: number; // Target threshold to stop watering
  auto_mode: boolean; // Auto-irrigation toggle
  max_duration: number; // Max duration safety limit in seconds
  crop_type: string; // Crop name e.g. ถั่วเหลือง
  polling_interval: number; // Seconds
  pump_status?: boolean; // Manual pump override state
}

export interface WateringLog {
  id: string | number;
  created_at: string;
  start_time: string;
  end_time?: string;
  duration_seconds: number;
  trigger_mode: 'AUTO' | 'MANUAL';
  start_moisture: number;
  end_moisture: number;
  water_liters: number;
  operator_name: string;
}

export interface FarmerUser {
  id: string;
  name: string;
  email: string;
  phone: string;
  password?: string;
  role: 'admin' | 'farmer';
  plot_name: string;
  device_id: string;
  status: 'active' | 'inactive';
  created_at: string;
}

export interface DeviceStatus {
  device_id: string;
  device_name: string;
  status: 'online' | 'offline';
  battery_v: number;
  wifi_rssi: number;
  probe_health: number;
  relay_status: boolean;
  last_seen: string;
}

export interface CropPreset {
  id: string;
  name: string;
  min_moisture: number;
  target_moisture: number;
  description: string;
  stage: string;
}

export interface AuthSession {
  user: FarmerUser;
  token: string;
  loginAt: string;
}
