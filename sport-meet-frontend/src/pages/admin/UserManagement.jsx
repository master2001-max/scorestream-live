import React, { useEffect, useMemo, useState } from 'react';
import { UserGroupIcon, PlusIcon } from '@heroicons/react/24/outline';
import { authAPI, housesAPI } from '../../services/api';

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [houses, setHouses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState('');

  const roleOptions = [
    { value: 'score_uploader', label: 'Score Uploader' },
    { value: 'captain', label: 'House Captain' },
    { value: 'student', label: 'Student' }
  ];

  const fetchAll = async () => {
    setLoading(true);
    setError('');
    try {
      const [u, h] = await Promise.all([authAPI.adminListUsers(), housesAPI.getAll()]);
      setUsers((u.data || []).filter(x => x.role === 'score_uploader' || x.role === 'captain'));
      setHouses(h.data);
    } catch (e) {
      setError('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchAll(); }, []);

  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'score_uploader', house: '' });

  const houseOptions = useMemo(() => houses.map(h => ({ id: h._id, name: h.name })), [houses]);

  const handleCreate = async (e) => {
    e.preventDefault();
    setCreating(true);
    setError('');
    try {
      const payload = { ...form };
      if (payload.role !== 'captain') payload.house = undefined;
      await authAPI.adminCreateUser(payload);
      setForm({ name: '', email: '', password: '', role: 'score_uploader', house: '' });
      await fetchAll();
    } catch (e) {
      setError(e.response?.data?.message || 'Failed to create user');
    } finally {
      setCreating(false);
    }
  };

  const handleResetPassword = async (userId) => {
    const newPass = prompt('Enter a new password (min 6 chars):');
    if (!newPass || newPass.length < 6) return;
    try {
      await authAPI.adminUpdateUser(userId, { password: newPass });
      alert('Password updated');
    } catch (e) {
      alert(e.response?.data?.message || 'Failed to reset password');
    }
  };

  const handleRoleChange = async (userId, role) => {
    try {
      await authAPI.adminUpdateUser(userId, { role });
      await fetchAll();
    } catch (e) {
      alert('Failed to update role');
    }
  };

  const handleHouseChange = async (userId, house) => {
    try {
      await authAPI.adminUpdateUser(userId, { house: house || null });
      await fetchAll();
    } catch (e) {
      alert('Failed to update house');
    }
  };

  return (
    <div className="space-y-6">
      <div className="backdrop-blur bg-white/5 border border-white/10 shadow rounded-lg transition hover:shadow-md">
        <div className="px-4 py-5 sm:p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center">
              <UserGroupIcon className="h-8 w-8 text-blue-600 mr-3" />
              <h1 className="text-2xl font-bold heading-light">User Management</h1>
            </div>
          </div>

          {error && (
            <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">{error}</div>
          )}

          {/* Create user */}
          <form onSubmit={handleCreate} className="mb-8 grid grid-cols-1 md:grid-cols-7 gap-3">
            <input className="border rounded px-3 py-2 md:col-span-2 bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="Full name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
            <input className="border rounded px-3 py-2 md:col-span-2 bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500" type="email" placeholder="Email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
            <input className="border rounded px-3 py-2 bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500" type="password" placeholder="Temp password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required />
            <select className="border rounded px-3 py-2 bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500" value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })}>
              {roleOptions.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
            </select>
            <select className="border rounded px-3 py-2 bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500" value={form.house} onChange={(e) => setForm({ ...form, house: e.target.value })} disabled={form.role !== 'captain'}>
              <option value="">House (captain only)</option>
              {houseOptions.map(h => <option key={h.id} value={h.id}>{h.name}</option>)}
            </select>
            <button type="submit" disabled={creating} className="md:col-span-7 inline-flex items-center justify-center gap-2 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50 transition-transform active:scale-[0.99]">
              <PlusIcon className="h-4 w-4" /> {creating ? 'Creating...' : 'Create User'}
            </button>
          </form>

          {/* Users table */}
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">House</th>
                  <th className="px-4 py-3"></th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {loading ? (
                  <tr><td colSpan="5" className="px-4 py-6 text-center text-gray-500">Loading...</td></tr>
                ) : users.length === 0 ? (
                  <tr><td colSpan="5" className="px-4 py-6 text-center text-gray-500">No users</td></tr>
                ) : (
                  users.map((u) => (
                    <tr key={u._id} className="transition hover:bg-gray-50">
                      <td className="px-4 py-3 font-medium text-gray-900">{u.name}</td>
                      <td className="px-4 py-3 text-sm text-gray-700">{u.email}</td>
                      <td className="px-4 py-3">
                        <select value={u.role} onChange={(e) => handleRoleChange(u._id, e.target.value)} className="text-sm border-gray-300 rounded-md bg-white text-gray-900 focus:ring-blue-500 focus:border-blue-500">
                          {['admin', 'score_uploader', 'captain', 'student', 'guest'].map(r => <option key={r} value={r}>{r}</option>)}
                        </select>
                      </td>
                      <td className="px-4 py-3">
                        <select value={u.house?._id || ''} onChange={(e) => handleHouseChange(u._id, e.target.value)} className="text-sm border-gray-300 rounded-md bg-white text-gray-900 focus:ring-blue-500 focus:border-blue-500">
                          <option value="">None</option>
                          {houseOptions.map(h => <option key={h.id} value={h.id}>{h.name}</option>)}
                        </select>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <button onClick={() => handleResetPassword(u._id)} className="inline-flex items-center px-3 py-1 rounded bg-blue-100 hover:bg-blue-200 text-blue-700 text-sm">Reset Password</button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserManagement;

