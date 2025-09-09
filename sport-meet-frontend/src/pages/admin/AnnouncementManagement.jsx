import React, { useEffect, useState } from 'react';
import { SpeakerWaveIcon, TrashIcon, PowerIcon, PlusIcon } from '@heroicons/react/24/outline';
import { announcementsAPI } from '../../services/api';

const AnnouncementManagement = () => {
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(false);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({ title: '', message: '', priority: 'medium' });

  const fetchAnnouncements = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await announcementsAPI.getAll({ limit: 100 });
      setAnnouncements(res.data.announcements || []);
    } catch (e) {
      setError('Failed to load announcements');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    setCreating(true);
    setError('');
    try {
      await announcementsAPI.create(form);
      setForm({ title: '', message: '', priority: 'medium' });
      await fetchAnnouncements();
    } catch (e) {
      setError(e.response?.data?.message || 'Failed to create announcement');
    } finally {
      setCreating(false);
    }
  };

  const handleToggle = async (id) => {
    try {
      await announcementsAPI.toggleStatus(id);
      await fetchAnnouncements();
    } catch { }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this announcement?')) return;
    try {
      await announcementsAPI.delete(id);
      setAnnouncements((prev) => prev.filter((a) => a._id !== id));
    } catch { }
  };

  const priorityBadge = (p) => ({
    urgent: 'bg-red-100 text-red-800',
    high: 'bg-orange-100 text-orange-800',
    medium: 'bg-yellow-100 text-yellow-800',
    low: 'bg-green-100 text-green-800'
  })[p] || 'bg-gray-100 text-gray-800';

  return (
    <div className="space-y-6">
      <div className="backdrop-blur bg-white/5 border border-white/10 shadow rounded-lg transition hover:shadow-md">
        <div className="px-4 py-5 sm:p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center">
              <SpeakerWaveIcon className="h-8 w-8 text-purple-400 mr-3" />
              <h1 className="text-2xl font-bold heading-light">Announcement Management</h1>
            </div>
          </div>

          {error && (
            <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">{error}</div>
          )}

          <form onSubmit={handleCreate} className="mb-8 grid grid-cols-1 md:grid-cols-6 gap-3">
            <input
              className="md:col-span-2 border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Title"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              required
            />
            <input
              className="md:col-span-3 border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Message"
              value={form.message}
              onChange={(e) => setForm({ ...form, message: e.target.value })}
              required
            />
            <select
              className="border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={form.priority}
              onChange={(e) => setForm({ ...form, priority: e.target.value })}
            >
              <option value="urgent">Urgent</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
            <button
              type="submit"
              disabled={creating}
              className="md:col-span-6 inline-flex items-center justify-center gap-2 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50 transition-transform active:scale-[0.99]"
            >
              <PlusIcon className="h-4 w-4" /> {creating ? 'Creating...' : 'Create Announcement'}
            </button>
          </form>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Title</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Priority</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Active</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created By</th>
                  <th className="px-4 py-3"></th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {loading ? (
                  <tr>
                    <td colSpan="5" className="px-4 py-6 text-center text-gray-500">Loading...</td>
                  </tr>
                ) : announcements.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="px-4 py-6 text-center text-gray-500">No announcements</td>
                  </tr>
                ) : (
                  announcements.map((a) => (
                    <tr key={a._id}>
                      <td className="px-4 py-3">
                        <div className="font-medium text-gray-900">{a.title}</div>
                        <div className="text-sm text-gray-500 truncate max-w-xl">{a.message}</div>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-1 rounded text-xs font-medium ${priorityBadge(a.priority)}`}>{a.priority}</span>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-1 rounded text-xs font-medium ${a.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>{a.isActive ? 'Active' : 'Inactive'}</span>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-700">{a.createdBy?.name || '-'}</td>
                      <td className="px-4 py-3 flex items-center gap-2 justify-end">
                        <button onClick={() => handleToggle(a._id)} className="inline-flex items-center gap-1 px-3 py-1 rounded bg-gray-100 hover:bg-gray-200 text-gray-700">
                          <PowerIcon className="h-4 w-4" /> Toggle
                        </button>
                        <button onClick={() => handleDelete(a._id)} className="inline-flex items-center gap-1 px-3 py-1 rounded bg-red-100 hover:bg-red-200 text-red-700">
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

export default AnnouncementManagement;

