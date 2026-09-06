import React, { useState } from 'react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer, 
  Cell, 
  LabelList,
  PieChart,
  Pie
} from 'recharts';
import { BarChart3, PieChart as PieChartIcon } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

const PALETTE = [
  '#7847EB', // Primary Cosmic Violet
  '#A855F7', // Lilac
  '#F472B6', // Soft Rose Lavender
  '#6366F1', // Indigo Lavender
  '#38BDF8', // Cyan Ice
  '#10B981', // Mastered / Correct
];

export default function MisconceptionChart({ groups = [] }) {
  const { isDark } = useTheme();
  const [chartType, setChartType] = useState('bar'); // 'bar' or 'donut'

  if (!groups || groups.length === 0) {
    return (
      <div className="h-64 flex items-center justify-center text-xs text-[#6C5B82] dark:text-[#CAB7E4]">
        No misconception groups to display.
      </div>
    );
  }

  // Format data for Recharts
  const data = groups.map((g, index) => ({
    name: g.label,
    percentage: Number(g.percentage) || 0,
    color: PALETTE[index % PALETTE.length],
    description: g.description || ''
  }));

  // Custom tooltip with glass styling
  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const item = payload[0].payload;
      return (
        <div className="glass-surface-elevated p-3 rounded-xl border border-[#B49BDE]/30 dark:border-[#C4ABF0]/20 shadow-xl max-w-xs text-xs">
          <div className="flex items-center justify-between gap-3 mb-1">
            <span className="font-bold text-[#231735] dark:text-[#FAF7FD]">{item.name}</span>
            <span className="px-2 py-0.5 rounded text-[11px] font-bold text-white" style={{ backgroundColor: item.color }}>
              {item.percentage}%
            </span>
          </div>
          {item.description && (
            <p className="text-[11px] text-[#6C5B82] dark:text-[#CAB7E4] leading-relaxed mt-1">
              {item.description}
            </p>
          )}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="w-full">
      {/* Chart View Toggle Switch */}
      <div className="flex items-center justify-between mb-4">
        <div className="text-xs text-[#6C5B82] dark:text-[#CAB7E4] font-medium">
          Cognitive distribution across {groups.length} distinct response clusters
        </div>
        <div className="flex items-center gap-1 bg-[#F8F6FD]/80 dark:bg-[#120A21]/80 p-1 rounded-xl border border-[#B49BDE]/20 dark:border-[#C4ABF0]/10">
          <button
            onClick={() => setChartType('bar')}
            className={`px-2.5 py-1 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-all ${
              chartType === 'bar'
                ? 'bg-white dark:bg-[#2C1F42] text-[#7847EB] dark:text-[#B388FF] shadow-xs font-semibold'
                : 'text-[#6C5B82] dark:text-[#CAB7E4]'
            }`}
          >
            <BarChart3 className="w-3.5 h-3.5" />
            <span>Bars</span>
          </button>
          <button
            onClick={() => setChartType('donut')}
            className={`px-2.5 py-1 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-all ${
              chartType === 'donut'
                ? 'bg-white dark:bg-[#2C1F42] text-[#7847EB] dark:text-[#B388FF] shadow-xs font-semibold'
                : 'text-[#6C5B82] dark:text-[#CAB7E4]'
            }`}
          >
            <PieChartIcon className="w-3.5 h-3.5" />
            <span>Donut</span>
          </button>
        </div>
      </div>

      {/* Chart Canvas */}
      <div className="h-72 w-full">
        <ResponsiveContainer width="100%" height="100%">
          {chartType === 'bar' ? (
            <BarChart
              data={data}
              layout="vertical"
              margin={{ top: 10, right: 50, left: 20, bottom: 10 }}
            >
              <XAxis 
                type="number" 
                domain={[0, 100]} 
                tickFormatter={(val) => `${val}%`}
                stroke={isDark ? '#6C5B82' : '#B49BDE'}
                tick={{ fill: isDark ? '#CAB7E4' : '#6C5B82', fontSize: 11 }}
              />
              <YAxis 
                type="category" 
                dataKey="name" 
                width={160}
                tick={{ fill: isDark ? '#FAF7FD' : '#231735', fontSize: 11, fontWeight: 500 }}
                stroke={isDark ? '#6C5B82' : '#B49BDE'}
              />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.02)' }} />
              <Bar dataKey="percentage" radius={[0, 8, 8, 0]} barSize={26}>
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
                {/* Direct percentage rendering on the bar as required by judging guidelines */}
                <LabelList 
                  dataKey="percentage" 
                  position="right" 
                  formatter={(val) => `${val}%`}
                  fill={isDark ? '#FAF7FD' : '#231735'}
                  style={{ fontSize: 12, fontWeight: 700 }}
                />
              </Bar>
            </BarChart>
          ) : (
            <PieChart margin={{ top: 10, right: 10, left: 10, bottom: 10 }}>
              <Tooltip content={<CustomTooltip />} />
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={65}
                outerRadius={105}
                paddingAngle={4}
                dataKey="percentage"
                label={({ name, percentage }) => `${name.slice(0, 14)}...: ${percentage}%`}
                labelLine={true}
              >
                {data.map((entry, index) => (
                  <Cell key={`donut-${index}`} fill={entry.color} stroke={isDark ? '#1C132C' : '#FFFFFF'} strokeWidth={2} />
                ))}
              </Pie>
            </PieChart>
          )}
        </ResponsiveContainer>
      </div>

      {/* Legend Badges */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 mt-4 pt-4 border-t border-[#B49BDE]/20 dark:border-[#C4ABF0]/15">
        {data.map((item, i) => (
          <div key={i} className="flex items-center gap-2 text-xs">
            <span 
              className="w-3 h-3 rounded-full flex-shrink-0 shadow-sm"
              style={{ backgroundColor: item.color }} 
            />
            <span className="truncate text-[#3E2E54] dark:text-[#EDE4F8] font-medium flex-1">
              {item.name}
            </span>
            <span className="font-bold text-[#231735] dark:text-[#FAF7FD]">
              {item.percentage}%
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
