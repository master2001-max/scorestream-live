import React, { useState, useEffect } from 'react';
import { matchesAPI } from '../services/api';
import {
  ClockIcon,
  PlayIcon,
  CheckCircleIcon,
  PlusIcon,
  MinusIcon
} from '@heroicons/react/24/outline';
import { useAuth } from '../contexts/AuthContext';

const Scoreboard = () => {
  const { user, isScoreUploader, isAdmin } = useAuth();
  const [matches, setMatches] = useState([]);
  const [filter, setFilter] = useState('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMatches();
  }, [filter]);

  const fetchMatches = async () => {
    try {
      let response;
      switch (filter) {
        case 'live':
          response = await matchesAPI.getLive();
          break;
        case 'upcoming':
          response = await matchesAPI.getUpcoming();
          break;
        case 'finished':
          response = await matchesAPI.getFinished();
          break;
        default:
          response = await matchesAPI.getAll();
      }
      setMatches(response.data);
    } catch (error) {
      console.error('Error fetching matches:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateScore = async (matchId, team, increment) => {
    if (!isScoreUploader && !isAdmin) return;

    try {
      const match = matches.find(m => m._id === matchId);
      if (!match) return;

      const newScore1 = team === 'house1' ? match.score1 + increment : match.score1;
      const newScore2 = team === 'house2' ? match.score2 + increment : match.score2;

      await matchesAPI.update(matchId, {
        score1: Math.max(0, newScore1),
        score2: Math.max(0, newScore2)
      });

      // Update local state
      setMatches(prev => prev.map(m =>
        m._id === matchId
          ? {
            ...m,
            score1: Math.max(0, newScore1),
            score2: Math.max(0, newScore2)
          }
          : m
      ));
    } catch (error) {
      console.error('Error updating score:', error);
    }
  };

  const startMatch = async (matchId) => {
    if (!isScoreUploader && !isAdmin) return;

    try {
      await matchesAPI.start(matchId);
      setMatches(prev => prev.map(m =>
        m._id === matchId ? { ...m, status: 'live' } : m
      ));
    } catch (error) {
      console.error('Error starting match:', error);
    }
  };

  const finishMatch = async (matchId) => {
    if (!isScoreUploader && !isAdmin) return;

    try {
      await matchesAPI.finish(matchId);
      setMatches(prev => prev.map(m =>
        m._id === matchId ? { ...m, status: 'finished' } : m
      ));
    } catch (error) {
      console.error('Error finishing match:', error);
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'live':
        return <PlayIcon className="h-5 w-5 text-red-500" />;
      case 'upcoming':
        return <ClockIcon className="h-5 w-5 text-blue-500" />;
      case 'finished':
        return <CheckCircleIcon className="h-5 w-5 text-green-500" />;
      default:
        return null;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'live':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'upcoming':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'finished':
        return 'bg-green-100 text-green-800 border-green-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString();
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
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-bold text-gray-900">Match Scoreboard</h1>
            <div className="flex space-x-2">
              {['all', 'live', 'upcoming', 'finished'].map((status) => (
                <button
                  key={status}
                  onClick={() => setFilter(status)}
                  className={`px-3 py-1 rounded-full text-sm font-medium ${filter === status
                      ? 'bg-blue-100 text-blue-800'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                >
                  {status.charAt(0).toUpperCase() + status.slice(1)}
                </button>
              ))}
            </div>
          </div>

          {matches.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500">No matches found</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {matches.map((match) => (
                <div
                  key={match._id}
                  className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm"
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-2">
                      {getStatusIcon(match.status)}
                      <span className="text-lg font-semibold text-gray-900">
                        {match.sport}
                      </span>
                    </div>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(match.status)}`}>
                      {match.status.toUpperCase()}
                    </span>
                  </div>

                  {match.description && (
                    <p className="text-sm text-gray-600 mb-4">{match.description}</p>
                  )}

                  {/* Teams and Scores */}
                  <div className="space-y-3 mb-4">
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div
                          className="w-4 h-4 rounded-full"
                          style={{ backgroundColor: match.house1.color }}
                        ></div>
                        <span className="font-medium text-gray-900">
                          {match.house1.name}
                        </span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="text-2xl font-bold text-gray-900">
                          {match.score1}
                        </span>
                        {(isScoreUploader || isAdmin) && match.status === 'live' && (
                          <div className="flex space-x-1">
                            <button
                              onClick={() => updateScore(match._id, 'house1', -1)}
                              className="p-1 text-gray-400 hover:text-gray-600"
                            >
                              <MinusIcon className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => updateScore(match._id, 'house1', 1)}
                              className="p-1 text-gray-400 hover:text-gray-600"
                            >
                              <PlusIcon className="h-4 w-4" />
                            </button>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="text-center text-gray-400 text-sm">VS</div>

                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div
                          className="w-4 h-4 rounded-full"
                          style={{ backgroundColor: match.house2.color }}
                        ></div>
                        <span className="font-medium text-gray-900">
                          {match.house2.name}
                        </span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="text-2xl font-bold text-gray-900">
                          {match.score2}
                        </span>
                        {(isScoreUploader || isAdmin) && match.status === 'live' && (
                          <div className="flex space-x-1">
                            <button
                              onClick={() => updateScore(match._id, 'house2', -1)}
                              className="p-1 text-gray-400 hover:text-gray-600"
                            >
                              <MinusIcon className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => updateScore(match._id, 'house2', 1)}
                              className="p-1 text-gray-400 hover:text-gray-600"
                            >
                              <PlusIcon className="h-4 w-4" />
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Match Info */}
                  <div className="text-sm text-gray-500 space-y-1">
                    <p>Time: {formatDate(match.matchTime)}</p>
                    {match.venue && <p>Venue: {match.venue}</p>}
                    {match.winner && (
                      <p className="font-medium text-green-600">
                        Winner: {match.winner.name}
                      </p>
                    )}
                  </div>

                  {/* Action Buttons */}
                  {(isScoreUploader || isAdmin) && (
                    <div className="mt-4 flex space-x-2">
                      {match.status === 'upcoming' && (
                        <button
                          onClick={() => startMatch(match._id)}
                          className="flex-1 bg-green-600 text-white px-3 py-2 rounded-md text-sm font-medium hover:bg-green-700"
                        >
                          Start Match
                        </button>
                      )}
                      {match.status === 'live' && (
                        <button
                          onClick={() => finishMatch(match._id)}
                          className="flex-1 bg-red-600 text-white px-3 py-2 rounded-md text-sm font-medium hover:bg-red-700"
                        >
                          Finish Match
                        </button>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Scoreboard;

