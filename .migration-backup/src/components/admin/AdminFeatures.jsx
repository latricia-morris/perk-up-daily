import { useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { Layers, FolderOpen, Download, ArrowUpDown } from 'lucide-react';
import AdminKPI from './AdminKPI';
import { exportToCSV, formatNumber, CHART_COLORS } from '@/lib/adminUtils';
import { getEntryTypeLabel, getContentTypeLabel, getCategoryLabel, CATEGORIES } from '@/lib/constants';

export default function AdminFeatures({ data }) {
  const [sortBy, setSortBy] = useState('count');
  const [sortDir, setSortDir] = useState('desc');

  if (!data) return null;
  const { features } = data;

  const entryTypeData = features.entry_type_breakdown.map(d => ({
    ...d,
    label: getEntryTypeLabel(d.type)
  }));

  const categoryData = features.category_breakdown.map(d => ({
    ...d,
    label: getCategoryLabel(d.category)
  }));

  const libraryData = features.library_distribution.map(d => ({
    ...d,
    label: getContentTypeLabel(d.type)
  }));

  // Feature usage table (sorted)
  const totalEntries = features.total_entries || 1;
  let tableData = entryTypeData.map(d => ({
    feature: d.label,
    type: d.type,
    count: d.count,
    pct: Math.round((d.count / totalEntries) * 100)
  }));

  tableData.sort((a, b) => {
    let cmp = 0;
    if (sortBy === 'feature') cmp = a.feature.localeCompare(b.feature);
    else cmp = a[sortBy] - b[sortBy];
    return sortDir === 'desc' ? -cmp : cmp;
  });

  const toggleSort = (col) => {
    if (sortBy === col) {
      setSortDir(sortDir === 'desc' ? 'asc' : 'desc');
    } else {
      setSortBy(col);
      setSortDir('desc');
    }
  };

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <AdminKPI label="Total Entries" value={formatNumber(features.total_entries)} icon={Layers} tooltip="All user-created entries across all types" />
        <AdminKPI label="Library Items" value={formatNumber(features.total_library)} icon={FolderOpen} tooltip="Curated content in the App Library" />
        <AdminKPI label="Uplifts Shared" value={formatNumber(features.total_uplifts)} icon={ArrowUpDown} tooltip="Cards shared by users to contacts" />
        <AdminKPI label="Entry Types Used" value={formatNumber(entryTypeData.length)} sublabel="distinct types" icon={Layers} />
      </div>

      {/* Entry Type Breakdown */}
      <div className="bg-card border border-border rounded-xl p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-heading font-semibold text-foreground">User Entries by Type</h3>
          <button onClick={() => exportToCSV('entry_types.csv', entryTypeData)} className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground">
            <Download className="w-3 h-3" /> CSV
          </button>
        </div>
        <ResponsiveContainer width="100%" height={280}>
          <BarChart data={entryTypeData} layout="vertical" margin={{ left: 20 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis type="number" tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" allowDecimals={false} />
            <YAxis type="category" dataKey="label" tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" width={100} />
            <Tooltip contentStyle={{ borderRadius: '8px', border: '1px solid hsl(var(--border))', fontSize: '12px' }} />
            <Bar dataKey="count" radius={[0, 4, 4, 0]}>
              {entryTypeData.map((_, i) => <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />)}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Category Breakdown */}
      <div className="grid md:grid-cols-2 gap-4">
        <div className="bg-card border border-border rounded-xl p-5">
          <h3 className="font-heading font-semibold text-foreground mb-4">User Entries by Category</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={categoryData} layout="vertical" margin={{ left: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis type="number" tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" allowDecimals={false} />
              <YAxis type="category" dataKey="label" tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" width={110} />
              <Tooltip contentStyle={{ borderRadius: '8px', border: '1px solid hsl(var(--border))', fontSize: '12px' }} />
              <Bar dataKey="count" radius={[0, 4, 4, 0]} fill="#E8A838" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-card border border-border rounded-xl p-5">
          <h3 className="font-heading font-semibold text-foreground mb-4">Library Content by Type</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={libraryData} layout="vertical" margin={{ left: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis type="number" tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" allowDecimals={false} />
              <YAxis type="category" dataKey="label" tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" width={100} />
              <Tooltip contentStyle={{ borderRadius: '8px', border: '1px solid hsl(var(--border))', fontSize: '12px' }} />
              <Bar dataKey="count" radius={[0, 4, 4, 0]} fill="#006D5B" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Sortable Feature Usage Table */}
      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <div className="px-5 py-4 border-b border-border flex items-center justify-between">
          <h3 className="font-heading font-semibold text-foreground">Feature Usage Breakdown</h3>
          <button onClick={() => exportToCSV('feature_usage.csv', tableData)} className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground">
            <Download className="w-3 h-3" /> Export CSV
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted">
              <tr>
                <th className="p-3 text-left font-medium text-muted-foreground cursor-pointer" onClick={() => toggleSort('feature')}>
                  <span className="flex items-center gap-1">Feature <ArrowUpDown className="w-3 h-3" /></span>
                </th>
                <th className="p-3 text-left font-medium text-muted-foreground cursor-pointer" onClick={() => toggleSort('count')}>
                  <span className="flex items-center gap-1">Total Events <ArrowUpDown className="w-3 h-3" /></span>
                </th>
                <th className="p-3 text-left font-medium text-muted-foreground cursor-pointer" onClick={() => toggleSort('pct')}>
                  <span className="flex items-center gap-1">% of Entries <ArrowUpDown className="w-3 h-3" /></span>
                </th>
                <th className="p-3 text-left font-medium text-muted-foreground">Usage Bar</th>
              </tr>
            </thead>
            <tbody>
              {tableData.map((row, i) => (
                <tr key={i} className="border-t border-border hover:bg-accent/30">
                  <td className="p-3 text-foreground font-medium">{row.feature}</td>
                  <td className="p-3 text-foreground">{formatNumber(row.count)}</td>
                  <td className="p-3 text-muted-foreground">{row.pct}%</td>
                  <td className="p-3">
                    <div className="w-full max-w-[200px] bg-muted rounded-full h-2">
                      <div className="bg-primary rounded-full h-2" style={{ width: `${row.pct}%` }} />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {tableData.length === 0 && (
          <div className="text-center py-12 text-muted-foreground text-sm">No entry data yet.</div>
        )}
      </div>
    </div>
  );
}