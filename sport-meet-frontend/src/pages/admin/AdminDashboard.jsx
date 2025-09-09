import React, { useState, useEffect } from 'react';
import { housesAPI, matchesAPI, announcementsAPI } from '../../services/api';
import {
  TrophyIcon,
  ChartBarIcon,
  SpeakerWaveIcon,
  UserGroupIcon,
  ClockIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline';

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    houses: 0,
    totalMatches: 0,
    liveMatches: 0,
    upcomingMatches: 0,
    finishedMatches: 0,
    totalAnnouncements: 0,
    activeAnnouncements: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [housesRes, matchesRes, announcementsRes] = await Promise.all([
          housesAPI.getAll(),
          matchesAPI.getStats(),
          announcementsAPI.getStats()
        ]);

        setStats({
          houses: housesRes.data.length,
          totalMatches: matchesRes.data.totalMatches,
          liveMatches: matchesRes.data.liveMatches,
          upcomingMatches: matchesRes.data.upcomingMatches,
          finishedMatches: matchesRes.data.finishedMatches,
          totalAnnouncements: announcementsRes.data.totalAnnouncements,
          activeAnnouncements: announcementsRes.data.activeAnnouncements
        });
      } catch (error) {
        console.error('Error fetching admin stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="backdrop-blur bg-white/5 border border-white/10 shadow rounded-lg transition hover:shadow-md">
        <div className="px-4 py-5 sm:p-6">
          <h1 className="text-2xl font-bold heading-light mb-6">Admin Dashboard</h1>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 mb-8">
            <div className="backdrop-blur bg-white/5 border border-white/10 overflow-hidden shadow rounded-lg transition hover:shadow-md">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <TrophyIcon className="h-6 w-6 text-yellow-600" />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">
                        Total Houses
                      </dt>
                      <dd className="text-lg font-medium text-gray-900">
                        {stats.houses}
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>

            <div className="backdrop-blur bg-white/5 border border-white/10 overflow-hidden shadow rounded-lg transition hover:shadow-md">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <ChartBarIcon className="h-6 w-6 text-green-600" />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">
                        Total Matches
                      </dt>
                      <dd className="text-lg font-medium text-gray-900">
                        {stats.totalMatches}
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>

            <div className="backdrop-blur bg-white/5 border border-white/10 overflow-hidden shadow rounded-lg transition hover:shadow-md">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <ClockIcon className="h-6 w-6 text-blue-600" />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">
                        Live Matches
                      </dt>
                      <dd className="text-lg font-medium text-gray-900">
                        {stats.liveMatches}
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>

            <div className="backdrop-blur bg-white/5 border border-white/10 overflow-hidden shadow rounded-lg transition hover:shadow-md">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <SpeakerWaveIcon className="h-6 w-6 text-purple-600" />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">
                        Active Announcements
                      </dt>
                      <dd className="text-lg font-medium text-gray-900">
                        {stats.activeAnnouncements}
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="border-t border-gray-200 pt-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Quick Actions</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <a
                href="/admin/houses"
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
              >
                <TrophyIcon className="h-4 w-4 mr-2" />
                Manage Houses
              </a>
              <a
                href="/admin/users"
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700"
              >
                <UserGroupIcon className="h-4 w-4 mr-2" />
                Manage Users
              </a>
              <a
                href="/admin/matches"
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
              >
                <ChartBarIcon className="h-4 w-4 mr-2" />
                Manage Matches
              </a>
              <a
                href="/admin/announcements"
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-purple-600 hover:bg-purple-700"
              >
                <SpeakerWaveIcon className="h-4 w-4 mr-2" />
                Manage Announcements
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;

