import { CropPreset, DeviceStatus, FarmerUser, SystemSettings } from './types';

export const CROP_PRESETS: CropPreset[] = [
  {
    id: 'peanut_stage_1',
    name: 'ระยะงอกและเจริญเติบโต (1-30 วัน)',
    min_moisture: 40,
    target_moisture: 70,
    description: 'ถั่วลิสงระยะแรกเริ่มสร้างลำต้นและใบ ต้องการความชื้นปานกลาง รดน้ำสม่ำเสมอ',
    stage: 'ระยะเจริญเติบโต'
  },
  {
    id: 'peanut_stage_2',
    name: 'ระยะออกดอกและแทงเข็ม (31-50 วัน)',
    min_moisture: 45,
    target_moisture: 75,
    description: 'ระยะสำคัญ ดอกเริ่มสลัดกลีบและแทงเข็มลงดิน ดินต้องมีความชื้นพอเหมาะเพื่อให้เข็มแทงลงดินได้ง่าย',
    stage: 'ระยะแทงเข็ม'
  },
  {
    id: 'peanut_stage_3',
    name: 'ระยะสร้างฝักและขยายหัวใต้ดิน (51-90 วัน) ★ แนะนำ',
    min_moisture: 50,
    target_moisture: 80,
    description: 'ช่วงวิกฤตที่ต้องการน้ำสูงสุด ฝักขยายตัวสร้างเมล็ดใต้ดิน ความชื้น 50-80% ช่วยให้ฝักสมบูรณ์ น้ำหนักดี',
    stage: 'ระยะสร้างฝักใต้ดิน'
  },
  {
    id: 'peanut_stage_4',
    name: 'ระยะฝักแก่ก่อนเก็บเกี่ยว (91-110 วัน)',
    min_moisture: 35,
    target_moisture: 65,
    description: 'ลดปริมาณน้ำเพื่อให้ฝักสุกแก่เต็มที่ และช่วยให้ขุดเก็บเกี่ยวฝักถั่วลิสงได้ง่าย ป้องกันเมล็ดงอกในฝัก',
    stage: 'ระยะก่อนเก็บเกี่ยว'
  }
];

export const DEFAULT_SETTINGS: SystemSettings = {
  min_soil: 30,
  target_soil: 65,
  auto_mode: false,
  max_duration: 300,
  crop_type: 'ถั่วลิสง (Peanut) - ระยะเติบโตมาตรฐาน',
  polling_interval: 3
};

export const INITIAL_FARMERS: FarmerUser[] = [
  {
    id: 'usr-001',
    name: 'สมชาย การเกษตร',
    email: 'somchai@farm.com',
    phone: '081-234-5678',
    password: 'password123',
    role: 'farmer',
    plot_name: 'แปลงปลูกถั่วลิสง A1 (พันธุ์ขอนแก่น 60)',
    device_id: 'ESP32-SOIL-NODE-01',
    status: 'active',
    created_at: '2026-08-10T09:00:00Z'
  },
  {
    id: 'usr-002',
    name: 'วิชัย สายเขียว',
    email: 'wichai@farm.com',
    phone: '089-876-5432',
    password: 'password123',
    role: 'farmer',
    plot_name: 'แปลงปลูกถั่วลิสง B2 (พันธุ์ไทนาน 9)',
    device_id: 'ESP32-SOIL-NODE-02',
    status: 'active',
    created_at: '2026-08-15T11:30:00Z'
  },
  {
    id: 'usr-999',
    name: 'ผู้ดูแลระบบ (Admin IoT)',
    email: 'admin@beanfarm.io',
    phone: '02-111-9999',
    password: 'admin123',
    role: 'admin',
    plot_name: 'ศูนย์ควบคุมไร่ถั่วลิสงหลัก',
    device_id: 'MASTER-GATEWAY-01',
    status: 'active',
    created_at: '2026-01-01T08:00:00Z'
  }
];

export const INITIAL_DEVICES: DeviceStatus[] = [
  {
    device_id: 'ESP32-SOIL-NODE-01',
    device_name: 'โหนดเซนเซอร์ แปลงถั่วลิสง A1',
    status: 'online',
    battery_v: 12.4,
    wifi_rssi: -62,
    probe_health: 98,
    relay_status: false,
    last_seen: new Date().toISOString()
  },
  {
    device_id: 'ESP32-SOIL-NODE-02',
    device_name: 'โหนดเซนเซอร์ แปลงถั่วลิสง B2',
    status: 'online',
    battery_v: 11.9,
    wifi_rssi: -71,
    probe_health: 95,
    relay_status: false,
    last_seen: new Date().toISOString()
  }
];
