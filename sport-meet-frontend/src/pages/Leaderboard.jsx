import React, { useState, useEffect } from 'react';
import { housesAPI } from '../services/api';
import { TrophyIcon, UserGroupIcon, ChartBarIcon } from '@heroicons/react/24/outline';

const Leaderboard = () => {
  const [houses, setHouses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHouses = async () => {
      try {
        const response = await housesAPI.getAll();
        setHouses(response.data);
      } catch (error) {
        console.error('Error fetching houses:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchHouses();
  }, []);

  const getRankIcon = (index) => {
    switch (index) {
      case 0:
        return <TrophyIcon className="h-8 w-8 text-yellow-500" />;
      case 1:
        return <TrophyIcon className="h-6 w-6 text-gray-400" />;
      case 2:
        return <TrophyIcon className="h-5 w-5 text-orange-600" />;
      default:
        return <span className="text-lg font-bold text-gray-600">#{index + 1}</span>;
    }
  };

  const getRankColor = (index) => {
    switch (index) {
      case 0:
        return 'bg-gradient-to-r from-yellow-400 to-yellow-600';
      case 1:
        return 'bg-gradient-to-r from-gray-300 to-gray-500';
      case 2:
        return 'bg-gradient-to-r from-orange-400 to-orange-600';
      default:
        return 'bg-white';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-bold text-gray-900">House Leaderboard</h1>
            <div className="text-sm text-gray-500">
              Last updated: {new Date().toLocaleString()}
            </div>
          </div>

          <div className="space-y-4">
            {houses.map((house, index) => (
              <div
                key={house._id}
                className={`${getRankColor(index)} rounded-lg p-6 shadow-lg ${
                  index < 3 ? 'ring-2 ring-opacity-50' : ''
                } ${
                  index === 0 ? 'ring-yellow-500' :
                  index === 1 ? 'ring-gray-400' :
                  index === 2 ? 'ring-orange-500' : ''
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="flex-shrink-0">
                      {getRankIcon(index)}
                    </div>
                    <div className="flex items-center space-x-3">
                      <div 
                        className="w-8 h-8 rounded-full border-2 border-white shadow-md"
                        style={{ backgroundColor: house.color }}
                      ></div>
                      <div>
                        <h3 className={`text-xl font-bold ${
                          index < 3 ? 'text-white' : 'text-gray-900'
                        }`}>
                          {house.name}
                        </h3>
                        {house.motto && (
                          <p className={`text-sm ${
                            index < 3 ? 'text-white opacity-90' : 'text-gray-600'
                          }`}>
                            "{house.motto}"
                          </p>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className={`text-3xl font-bold ${
                      index < 3 ? 'text-white' : 'text-gray-900'
                    }`}>
                      {house.totalScore}
                    </div>
                    <div className={`text-sm ${
                      index < 3 ? 'text-white opacity-90' : 'text-gray-600'
                    }`}>
                      points
                    </div>
                  </div>
                </div>

                {/* Stats */}
                {house.stats && (
                  <div className="mt-4 grid grid-cols-3 gap-4">
                    <div className="text-center">
                      <div className={`text-lg font-semibold ${
                        index < 3 ? 'text-white' : 'text-gray-900'
                      }`}>
                        {house.stats.wins}
                      </div>
                      <div className={`text-xs ${
                        index < 3 ? 'text-white opacity-90' : 'text-gray-600'
                      }`}>
                        Wins
                      </div>
                    </div>
                    <div className="text-center">
                      <div className={`text-lg font-semibold ${
                        index < 3 ? 'text-white' : 'text-gray-900'
                      }`}>
                        {house.stats.losses}
                      </div>
                      <div className={`text-xs ${
                        index < 3 ? 'text-white opacity-90' : 'text-gray-600'
                      }`}>
                        Losses
                      </div>
                    </div>
                    <div className="text-center">
                      <div className={`text-lg font-semibold ${
                        index < 3 ? 'text-white' : 'text-gray-900'
                      }`}>
                        {house.stats.draws}
                      </div>
                      <div className={`text-xs ${
                        index < 3 ? 'text-white opacity-90' : 'text-gray-600'
                      }`}>
                        Draws
                      </div>
                    </div>
                  </div>
                )}

                {/* Captain Info */}
                {house.captain && (
                  <div className="mt-4 flex items-center space-x-2">
                    <UserGroupIcon className={`h-4 w-4 ${
                      index < 3 ? 'text-white opacity-90' : 'text-gray-500'
                    }`} />
                    <span className={`text-sm ${
                      index < 3 ? 'text-white opacity-90' : 'text-gray-600'
                    }`}>
                      Captain: {house.captain.name}
                    </span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Additional Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white overflow-hidden shadow rounded-lg">
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

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <ChartBarIcon className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Total Points
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {houses.reduce((sum, house) => sum + house.totalScore, 0)}
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
                <UserGroupIcon className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Leading House
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {houses[0]?.name || 'N/A'}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Leaderboard;

