import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { housesAPI, matchesAPI, announcementsAPI } from '../services/api';
import {
  TrophyIcon,
  ChartBarIcon,
  SpeakerWaveIcon,
  UserGroupIcon,
  ClockIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline';

const Dashboard = () => {
  const { user } = useAuth();
  const [houses, setHouses] = useState([]);
  const [liveMatches, setLiveMatches] = useState([]);
  const [upcomingMatches, setUpcomingMatches] = useState([]);
  const [recentAnnouncements, setRecentAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [housesRes, liveMatchesRes, upcomingMatchesRes, announcementsRes] = await Promise.all([
          housesAPI.getAll(),
          matchesAPI.getLive(),
          matchesAPI.getUpcoming(),
          announcementsAPI.getRecent()
        ]);

        setHouses(housesRes.data);
        setLiveMatches(liveMatchesRes.data);
        setUpcomingMatches(upcomingMatchesRes.data);
        setRecentAnnouncements(announcementsRes.data);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  const getRoleDisplayName = (role) => {
    return role?.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="backdrop-blur bg-white/5 border border-white/10 overflow-hidden shadow rounded-lg transition hover:shadow-md">
        <div className="px-4 py-5 sm:p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div
                className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-lg"
                style={{ backgroundColor: user?.house?.color || '#6B7280' }}
              >
                {user?.name?.charAt(0)?.toUpperCase()}
              </div>
            </div>
            <div className="ml-4">
              <h1 className="text-2xl font-bold text-gray-900">
                {getGreeting()}, {user?.name}!
              </h1>
              <p className="text-gray-600">
                {getRoleDisplayName(user?.role)} {user?.house && `• ${user.house.name} House`}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
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
                    {houses.length}
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
                    Live Matches
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {liveMatches.length}
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
                    Upcoming Matches
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {upcomingMatches.length}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <SpeakerWaveIcon className="h-6 w-6 text-purple-600" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Recent Announcements
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {recentAnnouncements.length}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Leaderboard */}
        <div className="backdrop-blur bg-white/5 border border-white/10 shadow rounded-lg transition hover:shadow-md">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
              House Leaderboard
            </h3>
            <div className="space-y-3">
              {houses.slice(0, 4).map((house, index) => (
                <div key={house._id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <span className="text-lg font-bold text-gray-600">#{index + 1}</span>
                    </div>
                    <div className="ml-3 flex items-center">
                      <div
                        className="w-4 h-4 rounded-full mr-3"
                        style={{ backgroundColor: house.color }}
                      ></div>
                      <span className="text-sm font-medium text-gray-900">{house.name}</span>
                    </div>
                  </div>
                  <div className="text-sm font-bold text-gray-900">
                    {house.totalScore} pts
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Live Matches */}
        <div className="backdrop-blur bg-white/5 border border-white/10 shadow rounded-lg transition hover:shadow-md">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
              Live Matches
            </h3>
            {liveMatches.length > 0 ? (
              <div className="space-y-3">
                {liveMatches.map((match) => (
                  <div key={match._id} className="p-3 bg-red-50 border border-red-200 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-gray-900">{match.sport}</span>
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                        LIVE
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div
                          className="w-3 h-3 rounded-full mr-2"
                          style={{ backgroundColor: match.house1.color }}
                        ></div>
                        <span className="text-sm text-gray-900">{match.house1.name}</span>
                      </div>
                      <span className="text-lg font-bold text-gray-900">
                        {match.score1} - {match.score2}
                      </span>
                      <div className="flex items-center">
                        <span className="text-sm text-gray-900">{match.house2.name}</span>
                        <div
                          className="w-3 h-3 rounded-full ml-2"
                          style={{ backgroundColor: match.house2.color }}
                        ></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-sm">No live matches at the moment</p>
            )}
          </div>
        </div>
      </div>

      {/* Recent Announcements */}
      <div className="backdrop-blur bg-white/5 border border-white/10 shadow rounded-lg transition hover:shadow-md">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
            Recent Announcements
          </h3>
          {recentAnnouncements.length > 0 ? (
            <div className="space-y-4">
              {recentAnnouncements.map((announcement) => (
                <div key={announcement._id} className="border-l-4 border-blue-400 pl-4">
                  <div className="flex items-center justify-between mb-1">
                    <h4 className="text-sm font-medium text-gray-900">
                      {announcement.title}
                    </h4>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${announcement.priority === 'urgent' ? 'bg-red-100 text-red-800' :
                      announcement.priority === 'high' ? 'bg-orange-100 text-orange-800' :
                        announcement.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-gray-100 text-gray-800'
                      }`}>
                      {announcement.priority}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mb-2">{announcement.message}</p>
                  <div className="flex items-center text-xs text-gray-500">
                    <span>By {announcement.createdBy.name}</span>
                    <span className="mx-2">•</span>
                    <span>{new Date(announcement.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-sm">No recent announcements</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;

