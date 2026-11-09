import React from 'react';
import { Link, useLocation } from 'react-router-dom';

export default function Navbar() {
  const location = useLocation();

  const isActive = (path) => location.pathname === path;

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-xs">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center space-x-2.5 group">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-600 flex items-center justify-center text-white font-black text-lg shadow-sm group-hover:scale-105 transition-transform">
            P
          </div>
          <div>
            <span className="text-xl font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">
              PollPulse
            </span>
            <span className="hidden sm:inline-block ml-2 text-xs font-medium px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200">
              College Edition
            </span>
          </div>
        </Link>

        <nav className="flex items-center space-x-2">
          <Link
            to="/"
            className={`px-3.5 py-2 rounded-lg text-sm font-medium transition-colors ${
              isActive('/')
                ? 'bg-indigo-50 text-indigo-700'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            All Polls
          </Link>
          <Link
            to="/create"
            className={`inline-flex items-center space-x-1 px-4 py-2 rounded-lg text-sm font-medium transition-all shadow-xs ${
              isActive('/create')
                ? 'bg-indigo-700 text-white'
                : 'bg-indigo-600 hover:bg-indigo-700 text-white hover:shadow-md'
            }`}
          >
            <span className="text-base leading-none mr-1">+</span>
            <span>Create Poll</span>
          </Link>
        </nav>
      </div>
    </header>
  );
}
