import React, { useEffect, useState } from 'react';
import { TrophyIcon, TrashIcon, PlusIcon } from '@heroicons/react/24/outline';
import { housesAPI } from '../../services/api';

const HouseManagement = () => {
  const [houses, setHouses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({ name: '', color: '#FF0000' });
  const palette = ['#FF0000', '#0000FF', '#008000', '#FFA500', '#800080', '#00BFFF'];

  const fetchHouses = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await housesAPI.getAll();
      setHouses(res.data);
    } catch (e) {
      setError('Failed to load houses');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchHouses(); }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    setCreating(true);
    setError('');
    try {
      await housesAPI.create(form);
      setForm({ name: '', color: '#000000' });
      await fetchHouses();
    } catch (e) {
      setError(e.response?.data?.message || 'Failed to create house');
    } finally {
      setCreating(false);
    }
  };

  const deleteHouse = async (id) => {
    if (!confirm('Delete this house?')) return;
    try {
      await housesAPI.delete(id);
      setHouses((prev) => prev.filter((h) => h._id !== id));
    } catch { }
  };

  return (
    <div className="space-y-6">
      <div className="backdrop-blur bg-white/5 border border-white/10 shadow rounded-lg transition hover:shadow-md">
        <div className="px-4 py-5 sm:p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center">
              <TrophyIcon className="h-8 w-8 text-yellow-400 mr-3" />
              <h1 className="text-2xl font-bold heading-light">House Management</h1>
            </div>
          </div>

          {error && (
            <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">{error}</div>
          )}

          <form onSubmit={handleCreate} className="mb-8 grid grid-cols-1 md:grid-cols-6 gap-3">
            <input className="md:col-span-3 border rounded px-3 py-2" placeholder="House name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
            <div className="md:col-span-2 flex items-center gap-2 flex-wrap">
              {palette.map((c) => (
                <button type="button" key={c} onClick={() => setForm({ ...form, color: c })} className={`w-8 h-8 rounded-full border ${form.color === c ? 'ring-2 ring-blue-500' : ''}`} style={{ backgroundColor: c }} />
              ))}
            </div>
            <button type="submit" disabled={creating} className="md:col-span-1 inline-flex items-center justify-center gap-2 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50 transition-transform active:scale-[0.99]">
              <PlusIcon className="h-4 w-4" /> {creating ? 'Creating...' : 'Create'}
            </button>
          </form>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Color</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total Score</th>
                  <th className="px-4 py-3"></th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {loading ? (
                  <tr><td colSpan="4" className="px-4 py-6 text-center text-gray-500">Loading...</td></tr>
                ) : houses.length === 0 ? (
                  <tr><td colSpan="4" className="px-4 py-6 text-center text-gray-500">No houses</td></tr>
                ) : (
                  houses.map((h) => (
                    <tr key={h._id}>
                      <td className="px-4 py-3 font-medium text-gray-900">{h.name}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <div className="w-5 h-5 rounded-full border" style={{ backgroundColor: h.color }}></div>
                          <span className="text-sm text-gray-700">{h.color}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-700">{h.totalScore}</td>
                      <td className="px-4 py-3 flex items-center gap-2 justify-end">
                        <button onClick={() => deleteHouse(h._id)} className="inline-flex items-center gap-1 px-3 py-1 rounded bg-red-100 hover:bg-red-200 text-red-700">
                          <TrashIcon className="h-4 w-4" /> Delete
                        </button>
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

export default HouseManagement;

