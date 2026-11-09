import React, { useEffect, useState, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../services/api';
import ResultsChart from '../components/ResultsChart';

export default function PollDetails() {
  const { id } = useParams();
  const [poll, setPoll] = useState(null);
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Voting state
  const [studentId, setStudentId] = useState('');
  const [selectedOptionId, setSelectedOptionId] = useState(null);
  const [submittingVote, setSubmittingVote] = useState(false);
  const [voteFeedback, setVoteFeedback] = useState(null);

  // Admin closing state
  const [closingPoll, setClosingPoll] = useState(false);

  // Fetch poll info and results in parallel
  const fetchPollData = useCallback(async () => {
    try {
      setError(null);
      const [pollRes, resultsRes] = await Promise.all([
        api.get(`/polls/${id}`),
        api.get(`/polls/${id}/results`),
      ]);
      setPoll(pollRes.data);
      setResults(resultsRes.data);
    } catch (err) {
      console.error('Failed to load poll data:', err);
      setError(
        err.response?.data?.detail || 'Failed to retrieve poll data from the server.'
      );
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchPollData();
  }, [fetchPollData]);

  // Handle Vote Submission
  const handleVoteSubmit = async (e) => {
    e.preventDefault();
    setVoteFeedback(null);

    const trimmedStudentId = studentId.trim();
    if (!trimmedStudentId) {
      setVoteFeedback({
        type: 'error',
        message: 'Please enter a valid Student ID before voting.',
      });
      return;
    }

    if (!selectedOptionId) {
      setVoteFeedback({
        type: 'error',
        message: 'Please choose an option to cast your vote.',
      });
      return;
    }

    try {
      setSubmittingVote(true);
      await api.post(`/polls/${id}/vote`, {
        student_id: trimmedStudentId,
        option_id: selectedOptionId,
      });

      setVoteFeedback({
        type: 'success',
        message: 'Your vote was cast successfully! Results have been updated.',
      });

      // Clear student ID and selection
      setStudentId('');
      setSelectedOptionId(null);

      // Re-fetch updated results
      const updatedResults = await api.get(`/polls/${id}/results`);
      setResults(updatedResults.data);
    } catch (err) {
      console.error('Voting failed:', err);
      const status = err.response?.status;
      const detail = err.response?.data?.detail;

      if (status === 409) {
        setVoteFeedback({
          type: 'error',
          message:
            detail || 'You have already voted in this poll. Multiple votes are not permitted.',
        });
      } else if (status === 400) {
        setVoteFeedback({
          type: 'error',
          message: detail || 'Voting is closed or the selected option is invalid.',
        });
      } else {
        setVoteFeedback({
          type: 'error',
          message: detail || 'Failed to submit vote. Please try again.',
        });
      }
    } finally {
      setSubmittingVote(false);
    }
  };

  // Handle Close Poll (Admin Action)
  const handleClosePoll = async () => {
    if (!window.confirm('Are you sure you want to close this poll? Further voting will be disabled.')) {
      return;
    }

    try {
      setClosingPoll(true);
      const response = await api.patch(`/polls/${id}/close`);
      setPoll(response.data);
      setVoteFeedback({
        type: 'info',
        message: 'Poll has been successfully closed. Voting is now disabled.',
      });
    } catch (err) {
      console.error('Failed to close poll:', err);
      alert(err.response?.data?.detail || 'Failed to close poll.');
    } finally {
      setClosingPoll(false);
    }
  };

  if (loading) {
    return (
      <div className="py-24 flex flex-col items-center justify-center space-y-3">
        <div className="w-10 h-10 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" />
        <p className="text-sm font-medium text-slate-500">Loading poll and live results...</p>
      </div>
    );
  }

  if (error || !poll) {
    return (
      <div className="max-w-xl mx-auto px-4 py-16 text-center space-y-4">
        <div className="bg-rose-50 border border-rose-200 text-rose-700 p-6 rounded-2xl">
          <p className="font-semibold">{error || 'Poll not found.'}</p>
        </div>
        <Link
          to="/"
          className="inline-block px-5 py-2.5 bg-indigo-600 text-white text-sm font-semibold rounded-xl hover:bg-indigo-700 transition"
        >
          Return to Dashboard
        </Link>
      </div>
    );
  }

  const isOpen = poll.status === 'open';

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10 space-y-8">
      {/* Top Navigation & Status */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <Link
            to="/"
            className="text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors inline-flex items-center gap-1 mb-1.5"
          >
            &larr; Back to Dashboard
          </Link>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              {poll.question}
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-3 self-start sm:self-auto">
          <span
            className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider ${
              isOpen
                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                : 'bg-slate-100 text-slate-600 border border-slate-200'
            }`}
          >
            <span
              className={`w-2 h-2 rounded-full mr-1.5 ${
                isOpen ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400'
              }`}
            />
            {poll.status}
          </span>

          {isOpen && (
            <button
              onClick={handleClosePoll}
              disabled={closingPoll}
              className="px-3.5 py-1.5 border border-slate-300 rounded-lg text-xs font-semibold text-slate-600 hover:bg-slate-50 hover:text-rose-600 transition disabled:opacity-50"
            >
              {closingPoll ? 'Closing...' : 'Close Poll'}
            </button>
          )}
        </div>
      </div>

      {/* Main Grid: Voting on Left, Results on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Ballot Form */}
        <div className="lg:col-span-5 bg-white rounded-2xl border border-slate-200 p-6 sm:p-7 shadow-xs space-y-6">
          <div>
            <h3 className="text-lg font-bold text-slate-900">Cast Your Vote</h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Select one option and provide your student ID to submit.
            </p>
          </div>

          {/* Feedback message banner */}
          {voteFeedback && (
            <div
              className={`p-4 rounded-xl text-xs font-medium border ${
                voteFeedback.type === 'success'
                  ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                  : voteFeedback.type === 'info'
                  ? 'bg-indigo-50 border-indigo-200 text-indigo-800'
                  : 'bg-rose-50 border-rose-200 text-rose-800'
              }`}
            >
              {voteFeedback.message}
            </div>
          )}

          {isOpen ? (
            <form onSubmit={handleVoteSubmit} className="space-y-5">
              {/* Student ID input */}
              <div>
                <label
                  htmlFor="studentId"
                  className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5"
                >
                  Student ID Number
                </label>
                <input
                  id="studentId"
                  type="text"
                  required
                  value={studentId}
                  onChange={(e) => setStudentId(e.target.value)}
                  placeholder="e.g. STU202601"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm text-slate-800 transition"
                  maxLength={100}
                />
              </div>

              {/* Options Radio List */}
              <div className="space-y-2.5">
                <span className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Select Choice
                </span>
                {poll.options.map((option) => {
                  const isSelected = selectedOptionId === option.id;
                  return (
                    <label
                      key={option.id}
                      className={`flex items-center gap-3 p-3.5 rounded-xl border cursor-pointer transition-all ${
                        isSelected
                          ? 'border-indigo-600 bg-indigo-50/50 ring-1 ring-indigo-600'
                          : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50/50'
                      }`}
                    >
                      <input
                        type="radio"
                        name="poll_option"
                        value={option.id}
                        checked={isSelected}
                        onChange={() => setSelectedOptionId(option.id)}
                        className="w-4 h-4 text-indigo-600 focus:ring-indigo-500 border-slate-300"
                      />
                      <span className="text-sm font-medium text-slate-800 flex-1">
                        {option.option_text}
                      </span>
                    </label>
                  );
                })}
              </div>

              {/* Submit Vote Button */}
              <button
                type="submit"
                disabled={submittingVote || !selectedOptionId || !studentId.trim()}
                className="w-full py-3 rounded-xl bg-indigo-600 text-white font-semibold text-sm hover:bg-indigo-700 transition shadow-xs disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {submittingVote ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Submitting Ballot...</span>
                  </>
                ) : (
                  <span>Submit My Vote</span>
                )}
              </button>
            </form>
          ) : (
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-6 text-center space-y-2">
              <span className="text-2xl">🔒</span>
              <p className="text-sm font-bold text-slate-800">Voting Closed</p>
              <p className="text-xs text-slate-500">
                This poll is closed. No further ballots can be cast, but historical results are preserved below.
              </p>
            </div>
          )}
        </div>

        {/* Right Column: Live Results */}
        <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200 p-6 sm:p-7 shadow-xs">
          <ResultsChart
            results={results?.results || []}
            totalVotes={results?.total_votes || 0}
          />
        </div>
      </div>
    </div>
  );
}
