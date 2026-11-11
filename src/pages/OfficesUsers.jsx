import React, { useState, useEffect } from 'react';
import {
  Building2,
  Users,
  Plus,
  Shield,
  Phone,
  MapPin,
  CheckCircle,
  XCircle,
  Edit2
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { useToast } from '../context/ToastContext';
import { getOffices, createOffice, getUsers, createUser, updateUserRole } from '../services/api';
import { NEPAL_PROVINCES } from '../services/mockData';
import { LevelBadge } from '../components/common/Badge';
import Modal from '../components/common/Modal';

export default function OfficesUsers() {
  const { currentUser, isSuperAdmin } = useAuth();
  const { t, isNepali } = useLanguage();
  const toast = useToast();

  const [tab, setTab] = useState('offices'); // 'offices' or 'users'
  const [offices, setOffices] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  // New Office Modal
  const [officeModalOpen, setOfficeModalOpen] = useState(false);
  const [officeForm, setOfficeForm] = useState({
    name: '',
    government_level: 3,
    province: 'Bagmati',
    district: '',
    municipality: '',
    phone: ''
  });

  // New User Modal
  const [userModalOpen, setUserModalOpen] = useState(false);
  const [userForm, setUserForm] = useState({
    full_name: '',
    email: '',
    phone: '',
    office_id: '',
    role: 'data_entry'
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      const offList = await getOffices();
      setOffices(offList);
      const userList = await getUsers();
      setUsers(userList);
    } catch (e) {
      console.error(e);
      toast.error('Error', 'Failed to load administrative records');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCreateOffice = async (e) => {
    e.preventDefault();
    if (!officeForm.name.trim() || !officeForm.district.trim()) {
      toast.error('Validation Error', 'Office name and district are required.');
      return;
    }

    try {
      await createOffice(officeForm, currentUser);
      toast.success('Office Registered', `${officeForm.name} added to central directory.`);
      setOfficeModalOpen(false);
      setOfficeForm({
        name: '',
        government_level: 3,
        province: 'Bagmati',
        district: '',
        municipality: '',
        phone: ''
      });
      await fetchData();
    } catch (err) {
      toast.error('Error', err.message);
    }
  };

  const handleCreateUser = async (e) => {
    e.preventDefault();
    if (!userForm.full_name.trim() || !userForm.email.trim() || !userForm.office_id) {
      toast.error('Validation Error', 'Full name, email, and assigned office are required.');
      return;
    }

    try {
      await createUser(userForm, currentUser);
      toast.success('User Created', `User ${userForm.full_name} created successfully.`);
      setUserModalOpen(false);
      setUserForm({
        full_name: '',
        email: '',
        phone: '',
        office_id: '',
        role: 'data_entry'
      });
      await fetchData();
    } catch (err) {
      toast.error('Error', err.message);
    }
  };

  const handleRoleChange = async (userId, newRole) => {
    try {
      await updateUserRole(userId, newRole, currentUser);
      toast.success('Role Updated', 'User permissions updated successfully.');
      await fetchData();
    } catch (err) {
      toast.error('Error', err.message);
    }
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            {t('navOfficesUsers')}
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            {isNepali
              ? 'संघीय, प्रादेशिक र स्थानीय कार्यालयहरू तथा अधिकृतहरूको भूमिका व्यवस्थापन'
              : 'Jurisdictional administration: manage government offices and user access roles'}
          </p>
        </div>

        <div className="flex items-center gap-2">
          {tab === 'offices' ? (
            <button
              onClick={() => setOfficeModalOpen(true)}
              className="px-4 py-2 bg-gov-700 hover:bg-gov-800 text-white text-xs font-bold rounded-xl shadow-md flex items-center gap-2 transition"
            >
              <Plus className="w-4 h-4" />
              <span>Register Office</span>
            </button>
          ) : (
            <button
              onClick={() => {
                if (offices.length > 0) {
                  setUserForm(prev => ({ ...prev, office_id: offices[0].id }));
                }
                setUserModalOpen(true);
              }}
              className="px-4 py-2 bg-gov-700 hover:bg-gov-800 text-white text-xs font-bold rounded-xl shadow-md flex items-center gap-2 transition"
            >
              <Plus className="w-4 h-4" />
              <span>Create User Profile</span>
            </button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 text-xs font-bold">
        <button
          onClick={() => setTab('offices')}
          className={`pb-3 px-2 border-b-2 flex items-center gap-2 transition ${
            tab === 'offices'
              ? 'border-gov-700 text-gov-800'
              : 'border-transparent text-slate-400 hover:text-slate-700'
          }`}
        >
          <Building2 className="w-4 h-4" />
          <span>Government Offices ({offices.length})</span>
        </button>

        <button
          onClick={() => setTab('users')}
          className={`pb-3 px-2 border-b-2 flex items-center gap-2 transition ${
            tab === 'users'
              ? 'border-gov-700 text-gov-800'
              : 'border-transparent text-slate-400 hover:text-slate-700'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Authorized Users ({users.length})</span>
        </button>
      </div>

      {/* OFFICES TAB */}
      {tab === 'offices' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50/80 border-b border-slate-200 text-slate-600 font-semibold uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="px-5 py-3.5">Office Name</th>
                  <th className="px-5 py-3.5">Government Tier</th>
                  <th className="px-5 py-3.5">Location & Jurisdiction</th>
                  <th className="px-5 py-3.5">Contact</th>
                  <th className="px-5 py-3.5">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {offices.map(o => (
                  <tr key={o.id} className="hover:bg-slate-50/60 transition">
                    <td className="px-5 py-3.5">
                      <p className="font-bold text-slate-900">{o.name}</p>
                      {o.nameNe && <p className="text-[10px] text-slate-400">{o.nameNe}</p>}
                    </td>
                    <td className="px-5 py-3.5">
                      <LevelBadge level={o.government_level} isNepali={isNepali} />
                    </td>
                    <td className="px-5 py-3.5 text-slate-600">
                      <p className="font-semibold text-slate-800">{o.municipality || o.district}</p>
                      <p className="text-[10px] text-slate-400">{o.district}, {o.province} Province</p>
                    </td>
                    <td className="px-5 py-3.5 font-mono text-slate-700">
                      {o.phone || 'N/A'}
                    </td>
                    <td className="px-5 py-3.5">
                      {o.is_active ? (
                        <span className="inline-flex items-center gap-1 text-gov-700 text-xs font-semibold">
                          <CheckCircle className="w-3.5 h-3.5" />
                          <span>Active</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-slate-400 text-xs">
                          <XCircle className="w-3.5 h-3.5" />
                          <span>Inactive</span>
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* USERS TAB */}
      {tab === 'users' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50/80 border-b border-slate-200 text-slate-600 font-semibold uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="px-5 py-3.5">Full Name & Email</th>
                  <th className="px-5 py-3.5">Assigned Government Office</th>
                  <th className="px-5 py-3.5">Role & Access Level</th>
                  <th className="px-5 py-3.5">Phone</th>
                  <th className="px-5 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {users.map(u => (
                  <tr key={u.id} className="hover:bg-slate-50/60 transition">
                    <td className="px-5 py-3.5">
                      <p className="font-bold text-slate-900">{u.full_name}</p>
                      <p className="text-[10px] font-mono text-slate-500">{u.email}</p>
                    </td>

                    <td className="px-5 py-3.5 text-slate-700">
                      <p className="font-semibold text-slate-800 line-clamp-1">{u.office?.name || 'Central Office'}</p>
                      <p className="text-[10px] text-slate-400">Level {u.office?.government_level} ({u.office?.province})</p>
                    </td>

                    <td className="px-5 py-3.5">
                      <select
                        disabled={!isSuperAdmin && currentUser?.id !== u.id}
                        value={u.role}
                        onChange={(e) => handleRoleChange(u.id, e.target.value)}
                        className="px-2.5 py-1 text-xs font-semibold rounded-lg border border-slate-300 bg-white focus:ring-2 focus:ring-gov-500 focus:outline-none"
                      >
                        <option value="super_admin">Super Admin (Federal)</option>
                        <option value="office_admin">Office Admin</option>
                        <option value="data_entry">Data Entry</option>
                        <option value="viewer">Viewer (Auditor)</option>
                      </select>
                    </td>

                    <td className="px-5 py-3.5 font-mono text-slate-700">
                      {u.phone || 'N/A'}
                    </td>

                    <td className="px-5 py-3.5 text-right">
                      <span className="text-[11px] text-slate-400">
                        {u.is_active ? 'Active' : 'Disabled'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* CREATE OFFICE MODAL */}
      <Modal
        isOpen={officeModalOpen}
        onClose={() => setOfficeModalOpen(false)}
        title="Register Government Office"
        maxWidth="max-w-md"
      >
        <form onSubmit={handleCreateOffice} className="space-y-4 text-xs">
          <div>
            <label className="block font-bold text-slate-700 mb-1">Office Name (English)</label>
            <input
              type="text"
              required
              value={officeForm.name}
              onChange={(e) => setOfficeForm({ ...officeForm, name: e.target.value })}
              placeholder="e.g. Agriculture Section, Hetauda Municipality"
              className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-gov-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Government Administrative Level</label>
            <select
              value={officeForm.government_level}
              onChange={(e) => setOfficeForm({ ...officeForm, government_level: Number(e.target.value) })}
              className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-gov-500 focus:outline-none"
            >
              <option value={1}>Level 1: Federal (National Central)</option>
              <option value={2}>Level 2: Provincial (Directorate / Ministry)</option>
              <option value={3}>Level 3: Local (Metropolitan / Municipality / Rural)</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Province</label>
              <select
                value={officeForm.province}
                onChange={(e) => setOfficeForm({ ...officeForm, province: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-gov-500 focus:outline-none"
              >
                {NEPAL_PROVINCES.map(p => (
                  <option key={p} value={p}>{p}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">District</label>
              <input
                type="text"
                required
                value={officeForm.district}
                onChange={(e) => setOfficeForm({ ...officeForm, district: e.target.value })}
                placeholder="e.g. Makwanpur"
                className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-gov-500 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Municipality (for Local offices)</label>
            <input
              type="text"
              value={officeForm.municipality}
              onChange={(e) => setOfficeForm({ ...officeForm, municipality: e.target.value })}
              placeholder="e.g. Hetauda Sub-Metropolitan City"
              className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-gov-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Office Telephone</label>
            <input
              type="text"
              value={officeForm.phone}
              onChange={(e) => setOfficeForm({ ...officeForm, phone: e.target.value })}
              placeholder="e.g. 057-520344"
              className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-gov-500 focus:outline-none"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setOfficeModalOpen(false)}
              className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-xl font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-gov-700 hover:bg-gov-800 text-white font-bold rounded-xl shadow-md"
            >
              Create Office
            </button>
          </div>
        </form>
      </Modal>

      {/* CREATE USER MODAL */}
      <Modal
        isOpen={userModalOpen}
        onClose={() => setUserModalOpen(false)}
        title="Add Authorized Officer Profile"
        maxWidth="max-w-md"
      >
        <form onSubmit={handleCreateUser} className="space-y-4 text-xs">
          <div>
            <label className="block font-bold text-slate-700 mb-1">Officer Full Name</label>
            <input
              type="text"
              required
              value={userForm.full_name}
              onChange={(e) => setUserForm({ ...userForm, full_name: e.target.value })}
              placeholder="e.g. Sushil Shrestha"
              className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-gov-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Government Email (Login)</label>
            <input
              type="email"
              required
              value={userForm.email}
              onChange={(e) => setUserForm({ ...userForm, email: e.target.value })}
              placeholder="e.g. officer@bharatpurmun.gov.np"
              className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-gov-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Assigned Office Jurisdiction</label>
            <select
              required
              value={userForm.office_id}
              onChange={(e) => setUserForm({ ...userForm, office_id: e.target.value })}
              className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-gov-500 focus:outline-none"
            >
              {offices.map(o => (
                <option key={o.id} value={o.id}>{o.name} (L{o.government_level})</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Access Role</label>
            <select
              value={userForm.role}
              onChange={(e) => setUserForm({ ...userForm, role: e.target.value })}
              className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-gov-500 focus:outline-none"
            >
              <option value="data_entry">Data Entry Officer (Enter & View subsidies)</option>
              <option value="office_admin">Office Admin (Resolve local alerts & manage)</option>
              <option value="super_admin">Super Admin (Federal full access across Nepal)</option>
              <option value="viewer">Auditor / Viewer (Read-only)</option>
            </select>
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Contact Phone</label>
            <input
              type="tel"
              value={userForm.phone}
              onChange={(e) => setUserForm({ ...userForm, phone: e.target.value })}
              placeholder="e.g. 9855012345"
              className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-gov-500 focus:outline-none"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setUserModalOpen(false)}
              className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-xl font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-gov-700 hover:bg-gov-800 text-white font-bold rounded-xl shadow-md"
            >
              Create Officer Profile
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
