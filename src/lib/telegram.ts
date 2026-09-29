import { SensorData } from './types';

export const TELEGRAM_BOT_TOKEN = '8945151064:AAFMqGTCUZRTlyMaJ__vZ593YsE7NzoPmis';
export const TELEGRAM_CHAT_ID   = '8555656880';

let lastSentTime = 0;

export async function sendTelegramPeanutStatus(
  sensor: SensorData,
  minSoil: number,
  targetSoil: number
): Promise<boolean> {
  const now = Date.now();
  // Ensure minimum interval of 8 seconds to prevent spamming Telegram limits
  if (now - lastSentTime < 8000) {
    return false;
  }
  lastSentTime = now;

  const url = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`;
  const timeStr = new Date().toLocaleTimeString('th-TH');

  const pumpText = sensor.pump_status 
    ? '🟢 <b>กำลังรดน้ำ (Watering ON)</b>' 
    : '🔴 <b>หยุดรดน้ำ (Pump OFF)</b>';

  let statusAlert = '✅ ความชื้นดินเหมาะสม';
  if (sensor.soil < minSoil) {
    statusAlert = '⚠️ <b>ความชื้นต่ำกว่าเกณฑ์ - กำลังรดน้ำ!</b>';
  } else if (sensor.soil >= targetSoil) {
    statusAlert = '💧 <b>ความชื้นถึงระดับเป้าหมายแล้ว</b>';
  }

  const message = 
    `<b>🥜 รายงานสถานะแปลงถั่วลิสง IoT (ทุก 10 วินาที)</b>\n\n` +
    `💧 <b>ความชื้นในดิน:</b> <code>${sensor.soil}%</code>\n` +
    `🌡️ <b>อุณหภูมิดิน:</b> <code>${sensor.temperature}°C</code>\n` +
    `💨 <b>ความชื้นในอากาศ:</b> <code>${sensor.humidity}%</code>\n` +
    `🚰 <b>สถานะปั๊มน้ำ:</b> ${pumpText}\n` +
    `📊 <b>เกณฑ์รดน้ำ:</b> Min ${minSoil}% ➔ Target ${targetSoil}%\n` +
    `📢 <b>สถานะ:</b> ${statusAlert}\n` +
    `⏰ <b>เวลาอัปเดต:</b> ${timeStr}`;

  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: TELEGRAM_CHAT_ID,
        text: message,
        parse_mode: 'HTML'
      })
    });

    const data = await res.json();
    if (data.ok) {
      console.log('Successfully sent 10s Telegram status update!');
      return true;
    } else {
      console.warn('Telegram API response error:', data);
    }
  } catch (err) {
    console.error('Telegram notification fetch exception:', err);
  }

  return false;
}

export async function sendTelegramPumpAlert(
  pumpState: boolean,
  moisture: number
): Promise<boolean> {
  const url = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`;
  const timeStr = new Date().toLocaleTimeString('th-TH');

  const alertHeader = pumpState 
    ? '🚨 <b>แจ้งเตือน: สั่งเปิดปั๊มน้ำรดน้ำถั่วลิสง!</b>'
    : '✅ <b>แจ้งเตือน: สั่งปิดปั๊มน้ำ (รดน้ำเสร็จสิ้น)</b>';

  const message = 
    `${alertHeader}\n\n` +
    `💧 <b>ระดับความชื้นดิน:</b> <code>${moisture}%</code>\n` +
    `⏰ <b>เวลา:</b> ${timeStr}`;

  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: TELEGRAM_CHAT_ID,
        text: message,
        parse_mode: 'HTML'
      })
    });
    return res.ok;
  } catch (e) {
    return false;
  }
}
