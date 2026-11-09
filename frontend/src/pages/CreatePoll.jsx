import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../services/api';

export default function CreatePoll() {
  const navigate = useNavigate();
  const [question, setQuestion] = useState('');
  const [options, setOptions] = useState(['', '']);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Handle changing an individual option text
  const handleOptionChange = (index, value) => {
    const updated = [...options];
    updated[index] = value;
    setOptions(updated);
  };

  // Add a new option input (up to 10)
  const addOption = () => {
    if (options.length < 10) {
      setOptions([...options, '']);
    }
  };

  // Remove an option (minimum 2 must remain)
  const removeOption = (indexToRemove) => {
    if (options.length > 2) {
      setOptions(options.filter((_, idx) => idx !== indexToRemove));
    }
  };

  // Handle Form Submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    // Client-side validation checks
    const trimmedQuestion = question.trim();
    if (trimmedQuestion.length < 5) {
      setError('Question prompt must be at least 5 characters long.');
      return;
    }

    const trimmedOptions = options.map((opt) => opt.trim());
    if (trimmedOptions.some((opt) => opt.length === 0)) {
      setError('All options must contain text. Please fill in or remove empty choices.');
      return;
    }

    // Case-insensitive duplicate check
    const normalizedOptions = trimmedOptions.map((opt) => opt.toLowerCase());
    const uniqueOptions = new Set(normalizedOptions);
    if (uniqueOptions.size !== trimmedOptions.length) {
      setError('Options must be unique. Duplicate choices are not allowed.');
      return;
    }

    try {
      setLoading(true);
      const payload = {
        question: trimmedQuestion,
        options: trimmedOptions,
      };

      const response = await api.post('/polls', payload);
      navigate(`/polls/${response.data.id}`);
    } catch (err) {
      console.error('Failed to create poll:', err);
      const detail = err.response?.data?.detail;
      if (Array.isArray(detail)) {
        setError(detail.map((d) => d.msg).join(', '));
      } else {
        setError(detail || 'Failed to create poll. Please check the backend connection.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-10">
      <div className="mb-6">
        <Link
          to="/"
          className="text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors inline-flex items-center gap-1 mb-2"
        >
          &larr; Back to Dashboard
        </Link>
        <h1 className="text-3xl font-black text-slate-900 tracking-tight">Create a New Poll</h1>
        <p className="text-sm text-slate-600 mt-1">
          Define a question and provide between 2 and 10 choices for students to vote on.
        </p>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xs">
        {error && (
          <div className="mb-6 bg-rose-50 border border-rose-200 text-rose-700 text-sm font-medium rounded-xl p-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Question Input */}
          <div>
            <label htmlFor="question" className="block text-sm font-bold text-slate-900 mb-2">
              Poll Question
            </label>
            <textarea
              id="question"
              rows={3}
              required
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder="e.g., Which programming language should we use for our project?"
              className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm text-slate-800 transition"
              maxLength={500}
            />
            <span className="block text-right text-xs text-slate-400 mt-1">
              {question.trim().length} / 500 characters
            </span>
          </div>

          {/* Options Input List */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-bold text-slate-900">
                Poll Options ({options.length}/10)
              </label>
              {options.length < 10 && (
                <button
                  type="button"
                  onClick={addOption}
                  className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 transition"
                >
                  + Add Choice
                </button>
              )}
            </div>

            <div className="space-y-3">
              {options.map((option, index) => (
                <div key={index} className="flex items-center gap-2">
                  <span className="w-6 text-xs font-bold text-slate-400 text-center">
                    {index + 1}.
                  </span>
                  <input
                    type="text"
                    required
                    value={option}
                    onChange={(e) => handleOptionChange(index, e.target.value)}
                    placeholder={`Option ${index + 1}`}
                    className="flex-1 px-4 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm text-slate-800 transition"
                    maxLength={255}
                  />
                  {options.length > 2 && (
                    <button
                      type="button"
                      onClick={() => removeOption(index)}
                      className="p-2 text-slate-400 hover:text-rose-600 transition"
                      title="Remove option"
                    >
                      &times;
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
            <Link
              to="/"
              className="px-5 py-2.5 rounded-xl border border-slate-300 text-slate-700 text-sm font-semibold hover:bg-slate-50 transition"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2.5 rounded-xl bg-indigo-600 text-white text-sm font-semibold hover:bg-indigo-700 transition shadow-xs disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Publishing...</span>
                </>
              ) : (
                <span>Publish Poll</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
