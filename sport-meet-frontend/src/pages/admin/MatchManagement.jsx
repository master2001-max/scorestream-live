import React, { useEffect, useState } from 'react';
import { ChartBarIcon, PlayIcon, FlagIcon, TrashIcon, PlusIcon } from '@heroicons/react/24/outline';
import { matchesAPI, housesAPI } from '../../services/api';

const MatchManagement = () => {
  const [matches, setMatches] = useState([]);
  const [houses, setHouses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({ house1: '', house2: '', sport: 'Cricket', customSport: '', matchTime: '', venue: '', points: 10 });

  const fetchAll = async () => {
    setLoading(true);
    setError('');
    try {
      const [mRes, hRes] = await Promise.all([
        matchesAPI.getAll(),
        housesAPI.getAll()
      ]);
      setMatches(mRes.data);
      setHouses(hRes.data);
    } catch (e) {
      setError('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchAll(); }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    setCreating(true);
    setError('');
    try {
      const payload = {
        ...form,
        sport: form.sport === 'Other' ? (form.customSport || '').trim() : form.sport
      };
      if (payload.sport.length === 0) {
        throw new Error('Please enter a sport name');
      }
      await matchesAPI.create(payload);
      setForm({ house1: '', house2: '', sport: 'Cricket', customSport: '', matchTime: '', venue: '', points: 10 });
      await fetchAll();
    } catch (e) {
      setError(e.response?.data?.message || 'Failed to create match');
    } finally {
      setCreating(false);
    }
  };

  const startMatch = async (id) => {
    await matchesAPI.start(id);
    await fetchAll();
  };
  const finishMatch = async (id) => {
    await matchesAPI.finish(id);
    await fetchAll();
  };
  const deleteMatch = async (id) => {
    if (!confirm('Delete this match?')) return;
    await matchesAPI.delete(id);
    setMatches((prev) => prev.filter((m) => m._id !== id));
  };

  const houseOptions = houses.map((h) => (
    <option key={h._id} value={h._id}>{h.name}</option>
  ));

  return (
    <div className="space-y-6">
      <div className="backdrop-blur bg-white/5 border border-white/10 shadow rounded-lg transition hover:shadow-md">
        <div className="px-4 py-5 sm:p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center">
              <ChartBarIcon className="h-8 w-8 text-blue-600 mr-3" />
              <h1 className="text-2xl font-bold text-gray-900">Match Management</h1>
            </div>
          </div>

          {error && (
            <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">{error}</div>
          )}

          <form onSubmit={handleCreate} className="mb-8 grid grid-cols-1 md:grid-cols-6 gap-3">
            <select className="border rounded px-3 py-2 bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500" value={form.house1} onChange={(e) => setForm({ ...form, house1: e.target.value })} required>
              <option value="">House 1</option>
              {houseOptions}
            </select>
            <select className="border rounded px-3 py-2 bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500" value={form.house2} onChange={(e) => setForm({ ...form, house2: e.target.value })} required>
              <option value="">House 2</option>
              {houseOptions}
            </select>
            <select className="border rounded px-3 py-2 bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500" value={form.sport} onChange={(e) => setForm({ ...form, sport: e.target.value })} required>
              <option>Cricket</option>
              <option>Athletics</option>
              <option>Football</option>
              <option>Basketball</option>
              <option>Volleyball</option>
              <option>Badminton</option>
              <option>Swimming</option>
              <option>Other</option>
            </select>
            {form.sport === 'Other' && (
              <input className="border rounded px-3 py-2 md:col-span-2 focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="Enter sport name" value={form.customSport} onChange={(e) => setForm({ ...form, customSport: e.target.value })} required />
            )}
            <input className="border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" type="datetime-local" value={form.matchTime} onChange={(e) => setForm({ ...form, matchTime: e.target.value })} required />
            <input className="border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="Venue" value={form.venue} onChange={(e) => setForm({ ...form, venue: e.target.value })} />
            <input className="border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" type="number" min="0" placeholder="Points for win" value={form.points} onChange={(e) => setForm({ ...form, points: Number(e.target.value) })} />
            <button type="submit" disabled={creating} className="md:col-span-6 inline-flex items-center justify-center gap-2 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50 transition-transform active:scale-[0.99]">
              <PlusIcon className="h-4 w-4" /> {creating ? 'Creating...' : 'Create Match'}
            </button>
          </form>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Match</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Time</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Venue</th>
                  <th className="px-4 py-3"></th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {loading ? (
                  <tr><td colSpan="4" className="px-4 py-6 text-center text-gray-500">Loading...</td></tr>
                ) : matches.length === 0 ? (
                  <tr><td colSpan="4" className="px-4 py-6 text-center text-gray-500">No matches</td></tr>
                ) : (
                  matches.map((m) => (
                    <tr key={m._id} className="transition hover:bg-gray-50">
                      <td className="px-4 py-3">
                        <div className="font-medium text-gray-900">{m.house1?.name} vs {m.house2?.name}</div>
                        <div className="text-sm text-gray-500">{m.sport}{m.venue ? ` • ${m.venue}` : ''}</div>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-700">{new Date(m.matchTime).toLocaleString()}</td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-1 rounded text-xs font-medium ${m.status === 'live' ? 'bg-green-100 text-green-800' : m.status === 'finished' ? 'bg-gray-100 text-gray-800' : 'bg-blue-100 text-blue-800'}`}>{m.status}</span>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-700">{m.venue || '-'}</td>
                      <td className="px-4 py-3 flex items-center gap-2 justify-end">
                        {m.status === 'upcoming' && (
                          <button onClick={() => startMatch(m._id)} className="inline-flex items-center gap-1 px-3 py-1 rounded bg-blue-100 hover:bg-blue-200 text-blue-700">
                            <PlayIcon className="h-4 w-4" /> Start
                          </button>
                        )}
                        {m.status !== 'finished' && (
                          <button onClick={() => finishMatch(m._id)} className="inline-flex items-center gap-1 px-3 py-1 rounded bg-green-100 hover:bg-green-200 text-green-700">
                            <FlagIcon className="h-4 w-4" /> Finish
                          </button>
                        )}
                        <button onClick={() => deleteMatch(m._id)} className="inline-flex items-center gap-1 px-3 py-1 rounded bg-red-100 hover:bg-red-200 text-red-700">
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

export default MatchManagement;

