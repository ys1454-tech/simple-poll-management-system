import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import PollCard from '../components/PollCard';

export default function Dashboard() {
  const [polls, setPolls] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchPolls = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.get('/polls');
      setPolls(response.data);
    } catch (err) {
      console.error('Failed to load polls:', err);
      setError(
        err.response?.data?.detail ||
          'Failed to connect to the backend server. Please verify the API is running.'
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPolls();
  }, []);

  const openPollsCount = polls.filter((p) => p.status === 'open').length;
  const closedPollsCount = polls.filter((p) => p.status === 'closed').length;

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10 space-y-8">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200 pb-6">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">
            Poll Dashboard
          </h1>
          <p className="text-slate-600 text-sm mt-1">
            Browse campus polls, cast your ballots, and review live statistical results.
          </p>
        </div>
        <Link
          to="/create"
          className="inline-flex items-center justify-center space-x-2 px-5 py-2.5 rounded-xl bg-indigo-600 text-white font-semibold text-sm hover:bg-indigo-700 shadow-sm transition-all self-start sm:self-auto"
        >
          <span>+ Create New Poll</span>
        </Link>
      </div>

      {/* Summary Stat Badges */}
      {!loading && !error && polls.length > 0 && (
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-white p-4 rounded-xl border border-slate-200 text-center">
            <span className="text-2xl font-black text-slate-900">{polls.length}</span>
            <span className="block text-xs font-medium text-slate-500 uppercase mt-0.5">
              Total Polls
            </span>
          </div>
          <div className="bg-white p-4 rounded-xl border border-slate-200 text-center">
            <span className="text-2xl font-black text-emerald-600">{openPollsCount}</span>
            <span className="block text-xs font-medium text-slate-500 uppercase mt-0.5">
              Active / Open
            </span>
          </div>
          <div className="bg-white p-4 rounded-xl border border-slate-200 text-center">
            <span className="text-2xl font-black text-slate-500">{closedPollsCount}</span>
            <span className="block text-xs font-medium text-slate-500 uppercase mt-0.5">
              Closed
            </span>
          </div>
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="py-20 flex flex-col items-center justify-center space-y-3">
          <div className="w-10 h-10 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" />
          <p className="text-sm font-medium text-slate-500">Loading polls from server...</p>
        </div>
      )}

      {/* Error State */}
      {error && !loading && (
        <div className="bg-rose-50 border border-rose-200 rounded-2xl p-6 text-center space-y-3">
          <p className="text-rose-700 font-semibold">{error}</p>
          <button
            onClick={fetchPolls}
            className="px-4 py-2 bg-rose-600 text-white rounded-lg text-sm font-medium hover:bg-rose-700 transition-colors"
          >
            Retry Connection
          </button>
        </div>
      )}

      {/* Empty State */}
      {!loading && !error && polls.length === 0 && (
        <div className="bg-white rounded-2xl border border-dashed border-slate-300 p-12 text-center max-w-md mx-auto space-y-4">
          <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-full flex items-center justify-center mx-auto text-xl font-bold">
            ?
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-900">No Polls Available</h3>
            <p className="text-sm text-slate-500 mt-1">
              Be the first to create a poll for your peers and start gathering votes.
            </p>
          </div>
          <Link
            to="/create"
            className="inline-block px-4 py-2 bg-indigo-600 text-white rounded-xl text-sm font-semibold hover:bg-indigo-700 transition-colors shadow-xs"
          >
            Create First Poll
          </Link>
        </div>
      )}

      {/* Polls Grid */}
      {!loading && !error && polls.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {polls.map((poll) => (
            <PollCard key={poll.id} poll={poll} />
          ))}
        </div>
      )}
    </div>
  );
}
