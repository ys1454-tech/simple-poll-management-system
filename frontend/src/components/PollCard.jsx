import React from 'react';
import { Link } from 'react-router-dom';

export default function PollCard({ poll }) {
  const isOpen = poll.status === 'open';

  // Format creation timestamp
  const formattedDate = new Date(poll.created_at).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-6 flex flex-col justify-between hover:border-indigo-300 hover:shadow-md transition-all">
      <div>
        <div className="flex items-center justify-between gap-2 mb-3">
          <span
            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold uppercase tracking-wider ${
              isOpen
                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                : 'bg-slate-100 text-slate-600 border border-slate-200'
            }`}
          >
            <span
              className={`w-1.5 h-1.5 rounded-full mr-1.5 ${
                isOpen ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400'
              }`}
            />
            {poll.status}
          </span>
          <span className="text-xs text-slate-400">{formattedDate}</span>
        </div>

        <h3 className="text-lg font-semibold text-slate-900 mb-2 line-clamp-2">
          {poll.question}
        </h3>

        <p className="text-xs text-slate-500 mb-6">
          {poll.options ? `${poll.options.length} options available` : 'Multiple choices'}
        </p>
      </div>

      <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
        <span className="text-xs font-medium text-slate-400">Poll #{poll.id}</span>
        <Link
          to={`/polls/${poll.id}`}
          className="inline-flex items-center text-sm font-semibold text-indigo-600 hover:text-indigo-700 group"
        >
          <span>{isOpen ? 'Vote & Results' : 'View Results'}</span>
          <span className="ml-1 group-hover:translate-x-1 transition-transform">&rarr;</span>
        </Link>
      </div>
    </div>
  );
}
