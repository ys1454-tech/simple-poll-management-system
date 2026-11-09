import React from 'react';
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import Navbar from './components/Navbar';
import Dashboard from './pages/Dashboard';
import CreatePoll from './pages/CreatePoll';
import PollDetails from './pages/PollDetails';

function NotFound() {
  return (
    <div className="max-w-md mx-auto px-4 py-20 text-center space-y-4">
      <h2 className="text-4xl font-black text-slate-900">404</h2>
      <p className="text-slate-600 text-sm">The page you requested could not be found.</p>
      <Link
        to="/"
        className="inline-block px-5 py-2.5 bg-indigo-600 text-white rounded-xl text-sm font-semibold hover:bg-indigo-700 transition"
      >
        Return to Dashboard
      </Link>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans selection:bg-indigo-500 selection:text-white">
        {/* Navigation Bar */}
        <Navbar />

        {/* Dynamic Route Content */}
        <main className="flex-1">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/create" element={<CreatePoll />} />
            <Route path="/polls/:id" element={<PollDetails />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </main>

        {/* Global Footer */}
        <footer className="border-t border-slate-200 bg-white py-6 mt-12">
          <div className="max-w-6xl mx-auto px-4 text-center text-xs text-slate-500 space-y-1">
            <p className="font-semibold text-slate-700">Simple Poll Management System</p>
            <p>React 19 &bull; Vite &bull; Tailwind CSS v4 &bull; FastAPI &bull; MySQL 8</p>
          </div>
        </footer>
      </div>
    </BrowserRouter>
  );
}
