import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';

const COLORS = [
  '#4f46e5', // indigo-600
  '#8b5cf6', // violet-500
  '#06b6d4', // cyan-500
  '#10b981', // emerald-500
  '#f59e0b', // amber-500
  '#ec4899', // pink-500
  '#3b82f6', // blue-500
  '#6366f1', // indigo-500
  '#14b8a6', // teal-500
  '#f97316', // orange-500
];

export default function ResultsChart({ results, totalVotes }) {
  if (!results || results.length === 0) {
    return (
      <div className="py-12 text-center text-slate-400">
        No result data available.
      </div>
    );
  }

  // Format chart data
  const chartData = results.map((item) => ({
    name: item.option_text,
    votes: item.vote_count,
    percentage: item.percentage,
  }));

  return (
    <div className="space-y-6">
      {/* Visual Chart Header */}
      <div className="flex items-center justify-between">
        <h4 className="text-base font-semibold text-slate-900">Vote Distribution</h4>
        <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-100 text-slate-700">
          Total Votes: {totalVotes}
        </span>
      </div>

      {/* Bar Chart Visualization */}
      <div className="h-64 w-full bg-slate-50/50 rounded-xl p-2 border border-slate-100">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 25 }}>
            <XAxis
              dataKey="name"
              stroke="#94a3b8"
              fontSize={11}
              interval={0}
              angle={-20}
              textAnchor="end"
            />
            <YAxis stroke="#94a3b8" fontSize={11} allowDecimals={false} />
            <Tooltip
              formatter={(value) => [`${value} votes`, 'Votes']}
              labelFormatter={(label) => `Option: ${label}`}
              contentStyle={{
                backgroundColor: '#ffffff',
                borderColor: '#e2e8f0',
                borderRadius: '0.5rem',
                fontSize: '0.85rem',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
              }}
            />
            <Bar dataKey="votes" radius={[6, 6, 0, 0]}>
              {chartData.map((_, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Numerical Breakdown List */}
      <div className="space-y-3 pt-2">
        {results.map((opt, index) => {
          const color = COLORS[index % COLORS.length];
          return (
            <div key={opt.option_id} className="space-y-1.5">
              <div className="flex justify-between items-center text-sm">
                <span className="font-medium text-slate-800 truncate pr-2">
                  {opt.option_text}
                </span>
                <span className="text-xs font-semibold text-slate-600 whitespace-nowrap">
                  {opt.vote_count} {opt.vote_count === 1 ? 'vote' : 'votes'} ({opt.percentage}%)
                </span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-500 ease-out"
                  style={{
                    width: `${opt.percentage}%`,
                    backgroundColor: color,
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
