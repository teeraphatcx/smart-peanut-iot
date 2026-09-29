'use client';

import React, { useState } from 'react';
import { 
  Users, 
  UserPlus, 
  Search, 
  Edit3, 
  Trash2, 
  ShieldCheck, 
  Sprout, 
  Cpu, 
  X,
  Mail,
  Phone
} from 'lucide-react';
import { FarmerUser } from '@/lib/types';

interface FarmersManagerProps {
  farmers: FarmerUser[];
  onAddFarmer: (farmer: Omit<FarmerUser, 'id' | 'created_at'>) => void;
  onUpdateFarmer: (id: string, updatedFields: Partial<FarmerUser>) => void;
  onDeleteFarmer: (id: string) => void;
}

export const FarmersManager: React.FC<FarmersManagerProps> = ({
  farmers,
  onAddFarmer,
  onUpdateFarmer,
  onDeleteFarmer
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingFarmer, setEditingFarmer] = useState<FarmerUser | null>(null);

  // Form State for Add
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    role: 'farmer' as 'farmer' | 'admin',
    device_id: 'NODE-ESP32-01',
    plot_name: 'แปลงถั่วลิสง A1 (ทิศเหนือ)',
    status: 'active' as 'active' | 'inactive'
  });

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email) return;

    onAddFarmer(formData);
    setFormData({
      name: '',
      email: '',
      phone: '',
      role: 'farmer',
      device_id: 'NODE-ESP32-01',
      plot_name: 'แปลงถั่วลิสง A1 (ทิศเหนือ)',
      status: 'active'
    });
    setIsAddModalOpen(false);
  };

  const handleUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingFarmer) return;

    onUpdateFarmer(editingFarmer.id, {
      name: editingFarmer.name,
      phone: editingFarmer.phone,
      plot_name: editingFarmer.plot_name,
      device_id: editingFarmer.device_id,
      status: editingFarmer.status,
      role: editingFarmer.role
    });
    setEditingFarmer(null);
  };

  const filteredFarmers = farmers.filter(f => 
    f.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    f.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    f.plot_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    f.device_id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div 
      className="border rounded-3xl p-4 sm:p-6 shadow-xl space-y-6 transition-colors duration-300"
      style={{ background: 'var(--bg-card)', borderColor: 'var(--border-primary)' }}
    >
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <Users className="w-5 h-5 text-indigo-400" />
            <h3 className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>
              จัดการข้อมูลเกษตรกรและผู้ใช้งาน (Farmers Management)
            </h3>
          </div>
          <p className="text-xs mt-1" style={{ color: 'var(--text-secondary)' }}>
            เพิ่ม ลบ แก้ไขข้อมูลเกษตรกร กำหนดแปลงปลูก และอุปกรณ์ IoT ประจำแปลง
          </p>
        </div>

        <button
          onClick={() => setIsAddModalOpen(true)}
          className="flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs transition shadow-lg shadow-indigo-600/20"
        >
          <UserPlus className="w-4 h-4" />
          <span>เพิ่มเกษตรกรใหม่</span>
        </button>
      </div>

      {/* Search Input */}
      <div className="relative">
        <Search className="w-4 h-4 absolute left-3.5 top-3" style={{ color: 'var(--text-muted)' }} />
        <input
          type="text"
          placeholder="ค้นหาชื่อเกษตรกร, อีเมล, แปลงปลูก, รหัสอุปกรณ์..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 border rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-colors"
          style={{ 
            background: 'var(--bg-input)', 
            borderColor: 'var(--border-primary)', 
            color: 'var(--text-primary)' 
          }}
        />
      </div>

      {/* Mobile Farmers Card List (Optimized for Smartphone Screens) */}
      <div className="md:hidden space-y-3">
        {filteredFarmers.length === 0 ? (
          <div className="p-6 text-center text-xs border rounded-2xl" style={{ background: 'var(--bg-input)', borderColor: 'var(--border-primary)', color: 'var(--text-muted)' }}>
            ไม่พบข้อมูลเกษตรกรตามคำค้นหา
          </div>
        ) : (
          filteredFarmers.map((farmer) => (
            <div 
              key={farmer.id}
              className="p-4 rounded-2xl border space-y-3 transition-colors shadow-sm"
              style={{ background: 'var(--bg-input)', borderColor: 'var(--border-primary)' }}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 rounded-full bg-indigo-500/20 text-indigo-500 flex items-center justify-center font-bold text-xs">
                    {farmer.name.charAt(0)}
                  </div>
                  <div>
                    <h4 className="font-bold text-xs" style={{ color: 'var(--text-primary)' }}>{farmer.name}</h4>
                    <span className={`inline-flex items-center gap-1 text-[9px] font-bold uppercase ${
                      farmer.role === 'admin' ? 'text-indigo-400' : 'text-emerald-400'
                    }`}>
                      <ShieldCheck className="w-3 h-3" />
                      {farmer.role}
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => onUpdateFarmer(farmer.id, { status: farmer.status === 'active' ? 'inactive' : 'active' })}
                  className={`px-2.5 py-1 rounded-full text-[10px] font-bold border ${
                    farmer.status === 'active'
                      ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                      : 'bg-rose-500/10 text-rose-400 border-rose-500/30'
                  }`}
                >
                  {farmer.status === 'active' ? 'ใช้งานอยู่' : 'ระงับการใช้งาน'}
                </button>
              </div>

              <div className="space-y-1.5 text-xs pt-2 border-t" style={{ borderColor: 'var(--border-primary)' }}>
                <div className="flex flex-col space-y-1 text-[11px]" style={{ color: 'var(--text-secondary)' }}>
                  <span className="flex items-center gap-1"><Mail className="w-3 h-3 text-slate-400" /> {farmer.email}</span>
                  <span className="flex items-center gap-1"><Phone className="w-3 h-3 text-slate-400" /> {farmer.phone}</span>
                </div>
                <div className="flex items-center justify-between text-[11px] pt-1">
                  <span className="flex items-center gap-1" style={{ color: 'var(--text-primary)' }}>
                    <Sprout className="w-3.5 h-3.5 text-emerald-500" /> {farmer.plot_name}
                  </span>
                  <span className="font-mono text-cyan-400 text-[10px] flex items-center gap-1">
                    <Cpu className="w-3 h-3 text-slate-400" /> {farmer.device_id}
                  </span>
                </div>
              </div>

              <div className="flex justify-end space-x-2 pt-2 border-t" style={{ borderColor: 'var(--border-primary)' }}>
                <button
                  onClick={() => setEditingFarmer(farmer)}
                  className="px-3 py-1.5 rounded-xl border text-xs font-semibold transition"
                  style={{ background: 'var(--bg-card)', borderColor: 'var(--border-primary)', color: 'var(--text-secondary)' }}
                >
                  <Edit3 className="w-3.5 h-3.5 inline mr-1" />
                  แก้ไข
                </button>
                <button
                  onClick={() => onDeleteFarmer(farmer.id)}
                  className="px-3 py-1.5 rounded-xl bg-rose-500/10 text-rose-400 border border-rose-500/30 text-xs font-semibold transition"
                >
                  <Trash2 className="w-3.5 h-3.5 inline mr-1" />
                  ลบ
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Desktop Table (For Tablets & Desktops) */}
      <div 
        className="hidden md:block overflow-x-auto rounded-2xl border transition-colors"
        style={{ borderColor: 'var(--border-primary)' }}
      >
        <table className="w-full text-left text-xs">
          <thead 
            className="uppercase text-[11px] font-semibold border-b transition-colors"
            style={{ 
              background: 'var(--bg-input)', 
              borderColor: 'var(--border-primary)', 
              color: 'var(--text-secondary)' 
            }}
          >
            <tr>
              <th className="px-4 py-3.5">ชื่อ-นามสกุล</th>
              <th className="px-4 py-3.5">การติดต่อ</th>
              <th className="px-4 py-3.5">สิทธิ์ระบบ</th>
              <th className="px-4 py-3.5">แปลงปลูกที่ดูแล</th>
              <th className="px-4 py-3.5">โหนด IoT</th>
              <th className="px-4 py-3.5">สถานะ</th>
              <th className="px-4 py-3.5 text-right">จัดการ</th>
            </tr>
          </thead>
          <tbody 
            className="divide-y transition-colors"
            style={{ 
              background: 'var(--bg-card)', 
              borderColor: 'var(--border-primary)' 
            }}
          >
            {filteredFarmers.map((farmer) => (
              <tr 
                key={farmer.id} 
                className="hover:opacity-90 transition-colors"
                style={{ borderBottom: '1px solid var(--border-primary)' }}
              >
                <td className="px-4 py-3 font-semibold whitespace-nowrap" style={{ color: 'var(--text-primary)' }}>
                  <div className="flex items-center space-x-2">
                    <div className="w-7 h-7 rounded-full bg-indigo-500/20 text-indigo-500 flex items-center justify-center font-bold text-xs">
                      {farmer.name.charAt(0)}
                    </div>
                    <span>{farmer.name}</span>
                  </div>
                </td>
                <td className="px-4 py-3 whitespace-nowrap" style={{ color: 'var(--text-secondary)' }}>
                  <div className="space-y-0.5">
                    <div className="flex items-center space-x-1">
                      <Mail className="w-3 h-3" style={{ color: 'var(--text-muted)' }} />
                      <span>{farmer.email}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Phone className="w-3 h-3" style={{ color: 'var(--text-muted)' }} />
                      <span>{farmer.phone}</span>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3 whitespace-nowrap">
                  <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold border uppercase ${
                    farmer.role === 'admin'
                      ? 'bg-indigo-500/10 text-indigo-500 border-indigo-500/30'
                      : 'bg-emerald-500/10 text-emerald-500 border-emerald-500/30'
                  }`}>
                    <ShieldCheck className="w-3 h-3" />
                    {farmer.role}
                  </span>
                </td>
                <td className="px-4 py-3 whitespace-nowrap" style={{ color: 'var(--text-primary)' }}>
                  <div className="flex items-center space-x-1.5">
                    <Sprout className="w-3.5 h-3.5 text-emerald-500" />
                    <span>{farmer.plot_name}</span>
                  </div>
                </td>
                <td className="px-4 py-3 font-mono text-cyan-500 whitespace-nowrap">
                  <div className="flex items-center space-x-1">
                    <Cpu className="w-3.5 h-3.5" style={{ color: 'var(--text-muted)' }} />
                    <span>{farmer.device_id}</span>
                  </div>
                </td>
                <td className="px-4 py-3 whitespace-nowrap">
                  <button
                    onClick={() => onUpdateFarmer(farmer.id, { status: farmer.status === 'active' ? 'inactive' : 'active' })}
                    className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold border transition ${
                      farmer.status === 'active'
                        ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/30 hover:bg-emerald-500/20'
                        : 'bg-rose-500/10 text-rose-500 border-rose-500/30 hover:bg-rose-500/20'
                    }`}
                  >
                    <span className={`w-1.5 h-1.5 rounded-full ${farmer.status === 'active' ? 'bg-emerald-500' : 'bg-rose-500'}`} />
                    <span>{farmer.status === 'active' ? 'ใช้งานอยู่' : 'ระงับการใช้งาน'}</span>
                  </button>
                </td>
                <td className="px-4 py-3 text-right whitespace-nowrap space-x-2">
                  <button
                    onClick={() => setEditingFarmer(farmer)}
                    className="p-1.5 rounded-lg border transition hover:opacity-80"
                    style={{ 
                      background: 'var(--bg-input)', 
                      borderColor: 'var(--border-primary)', 
                      color: 'var(--text-secondary)' 
                    }}
                    title="แก้ไขข้อมูล"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => onDeleteFarmer(farmer.id)}
                    className="p-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-500 border border-rose-500/30 transition"
                    title="ลบผู้ใช้งาน"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal: Add Farmer */}
      {isAddModalOpen && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-sm overflow-y-auto"
          style={{ background: 'var(--modal-overlay)' }}
        >
          <div 
            className="border rounded-3xl p-6 w-full max-w-md shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto"
            style={{ background: 'var(--bg-card)', borderColor: 'var(--border-primary)' }}
          >
            <div className="flex items-center justify-between border-b pb-3" style={{ borderColor: 'var(--border-primary)' }}>
              <h3 className="text-base font-bold flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
                <UserPlus className="w-5 h-5 text-indigo-500" />
                <span>เพิ่มข้อมูลเกษตรกรใหม่</span>
              </h3>
              <button onClick={() => setIsAddModalOpen(false)} style={{ color: 'var(--text-secondary)' }}>
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreate} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold mb-1" style={{ color: 'var(--text-secondary)' }}>ชื่อ-นามสกุล เกษตรกร</label>
                <input
                  type="text"
                  required
                  placeholder="เช่น นายสมชาย การเกษตร"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full p-2.5 border rounded-xl focus:ring-2 focus:ring-indigo-500 transition-colors"
                  style={{ 
                    background: 'var(--bg-input)', 
                    borderColor: 'var(--border-primary)', 
                    color: 'var(--text-primary)' 
                  }}
                />
              </div>

              <div>
                <label className="block font-semibold mb-1" style={{ color: 'var(--text-secondary)' }}>อีเมลผู้ใช้งาน</label>
                <input
                  type="email"
                  required
                  placeholder="somchai@farm.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full p-2.5 border rounded-xl focus:ring-2 focus:ring-indigo-500 transition-colors"
                  style={{ 
                    background: 'var(--bg-input)', 
                    borderColor: 'var(--border-primary)', 
                    color: 'var(--text-primary)' 
                  }}
                />
              </div>

              <div>
                <label className="block font-semibold mb-1" style={{ color: 'var(--text-secondary)' }}>เบอร์โทรศัพท์</label>
                <input
                  type="text"
                  placeholder="081-234-5678"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full p-2.5 border rounded-xl focus:ring-2 focus:ring-indigo-500 transition-colors"
                  style={{ 
                    background: 'var(--bg-input)', 
                    borderColor: 'var(--border-primary)', 
                    color: 'var(--text-primary)' 
                  }}
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-semibold mb-1" style={{ color: 'var(--text-secondary)' }}>สิทธิ์ในระบบ</label>
                  <select
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value as any })}
                    className="w-full p-2.5 border rounded-xl focus:ring-2 focus:ring-indigo-500 transition-colors"
                    style={{ 
                      background: 'var(--bg-input)', 
                      borderColor: 'var(--border-primary)', 
                      color: 'var(--text-primary)' 
                    }}
                  >
                    <option value="farmer">เกษตรกร (Farmer)</option>
                    <option value="admin">ผู้ดูแลระบบ (Admin)</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold mb-1" style={{ color: 'var(--text-secondary)' }}>โหนด IoT</label>
                  <input
                    type="text"
                    value={formData.device_id}
                    onChange={(e) => setFormData({ ...formData, device_id: e.target.value })}
                    className="w-full p-2.5 border rounded-xl focus:ring-2 focus:ring-indigo-500 font-mono transition-colors"
                    style={{ 
                      background: 'var(--bg-input)', 
                      borderColor: 'var(--border-primary)', 
                      color: 'var(--text-primary)' 
                    }}
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold mb-1" style={{ color: 'var(--text-secondary)' }}>ชื่อแปลงปลูกที่ดูแล</label>
                <input
                  type="text"
                  value={formData.plot_name}
                  onChange={(e) => setFormData({ ...formData, plot_name: e.target.value })}
                  className="w-full p-2.5 border rounded-xl focus:ring-2 focus:ring-indigo-500 transition-colors"
                  style={{ 
                    background: 'var(--bg-input)', 
                    borderColor: 'var(--border-primary)', 
                    color: 'var(--text-primary)' 
                  }}
                />
              </div>

              <div className="pt-3 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 rounded-xl border font-semibold transition"
                  style={{ 
                    background: 'var(--bg-input)', 
                    borderColor: 'var(--border-primary)', 
                    color: 'var(--text-secondary)' 
                  }}
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-indigo-600 text-white font-semibold hover:bg-indigo-500 shadow-lg shadow-indigo-600/20"
                >
                  บันทึกข้อมูล
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Edit Farmer */}
      {editingFarmer && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-sm overflow-y-auto"
          style={{ background: 'var(--modal-overlay)' }}
        >
          <div 
            className="border rounded-3xl p-6 w-full max-w-md shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto"
            style={{ background: 'var(--bg-card)', borderColor: 'var(--border-primary)' }}
          >
            <div className="flex items-center justify-between border-b pb-3" style={{ borderColor: 'var(--border-primary)' }}>
              <h3 className="text-base font-bold flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
                <Edit3 className="w-5 h-5 text-indigo-500" />
                <span>แก้ไขข้อมูลเกษตรกร</span>
              </h3>
              <button onClick={() => setEditingFarmer(null)} style={{ color: 'var(--text-secondary)' }}>
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleUpdate} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold mb-1" style={{ color: 'var(--text-secondary)' }}>ชื่อ-นามสกุล</label>
                <input
                  type="text"
                  required
                  value={editingFarmer.name}
                  onChange={(e) => setEditingFarmer({ ...editingFarmer, name: e.target.value })}
                  className="w-full p-2.5 border rounded-xl"
                  style={{ 
                    background: 'var(--bg-input)', 
                    borderColor: 'var(--border-primary)', 
                    color: 'var(--text-primary)' 
                  }}
                />
              </div>

              <div>
                <label className="block font-semibold mb-1" style={{ color: 'var(--text-secondary)' }}>เบอร์โทรศัพท์</label>
                <input
                  type="text"
                  value={editingFarmer.phone}
                  onChange={(e) => setEditingFarmer({ ...editingFarmer, phone: e.target.value })}
                  className="w-full p-2.5 border rounded-xl"
                  style={{ 
                    background: 'var(--bg-input)', 
                    borderColor: 'var(--border-primary)', 
                    color: 'var(--text-primary)' 
                  }}
                />
              </div>

              <div>
                <label className="block font-semibold mb-1" style={{ color: 'var(--text-secondary)' }}>แปลงปลูก</label>
                <input
                  type="text"
                  value={editingFarmer.plot_name}
                  onChange={(e) => setEditingFarmer({ ...editingFarmer, plot_name: e.target.value })}
                  className="w-full p-2.5 border rounded-xl"
                  style={{ 
                    background: 'var(--bg-input)', 
                    borderColor: 'var(--border-primary)', 
                    color: 'var(--text-primary)' 
                  }}
                />
              </div>

              <div className="pt-3 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setEditingFarmer(null)}
                  className="px-4 py-2 rounded-xl border font-semibold"
                  style={{ 
                    background: 'var(--bg-input)', 
                    borderColor: 'var(--border-primary)', 
                    color: 'var(--text-secondary)' 
                  }}
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-indigo-600 text-white font-semibold hover:bg-indigo-500"
                >
                  อัปเดตข้อมูล
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
