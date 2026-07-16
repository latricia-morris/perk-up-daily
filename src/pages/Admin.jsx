import { useState, useEffect, useCallback } from 'react';
import { base44 } from '@/api/base44Client';
import { Navigate } from 'react-router-dom';
import { LayoutDashboard, Activity, BarChart3, DollarSign, Users, Library, RefreshCw } from 'lucide-react';
import AdminOverview from '@/components/admin/AdminOverview';
import AdminEngagement from '@/components/admin/AdminEngagement';
import AdminFeatures from '@/components/admin/AdminFeatures';
import AdminSales from '@/components/admin/AdminSales';
import AdminUsers from '@/components/admin/AdminUsers';
import AdminContent from '@/components/admin/AdminContent';

const SECTIONS = [
  { key: 'overview', label: 'Overview', icon: LayoutDashboard },
  { key: 'engagement', label: 'Engagement', icon: Activity },
  { key: 'features', label: 'Features', icon: BarChart3 },
  { key: 'sales', label: 'Sales', icon: DollarSign },
  { key: 'users', label: 'Users', icon: Users },
  { key: 'content', label: 'Content', icon: Library },
];

const DATE_PRESETS = [
  { label: '7D', value: 7 },
  { label: '30D', value: 30 },
  { label: '90D', value: 90 },
  { label: 'All', value: 365 * 5 },
];

export default function Admin() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [section, setSection] = useState('overview');
  const [dateRange, setDateRange] = useState(30);
  const [data, setData] = useState(null);
  const [dataLoading, setDataLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    base44.auth.me().then(u => { setUser(u); setLoading(false); });
  }, []);

  const fetchData = useCallback(() => {
    if (user?.role !== 'admin') return;
    setDataLoading(true);
    setError(null);
    const endDate = new Date();
    const startDate = new Date(Date.now() - dateRange * 86400000);
    base44.functions.invoke('adminDashboard', {
      start_date: startDate.toISOString(),
      end_date: endDate.toISOString()
    }).then(res => {
      setData(res.data);
      setDataLoading(false);
    }).catch(err => {
      setError(err?.response?.data?.error || err?.message || 'Failed to load dashboard data');
      setDataLoading(false);
    });
  }, [user, dateRange]);

  useEffect(() => { fetchData(); }, [fetchData]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (user?.role !== 'admin') {
    return <Navigate to="/dashboard" replace />;
  }

  const showDateFilter = section !== 'content';

  return (
    <div className="min-h-screen pb-20 md:pb-8">
      <div className="max-w-6xl mx-auto px-4 md:px-6 py-6 md:py-8">
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
          <div>
            <h1 className="font-heading text-2xl font-semibold text-foreground">Admin Dashboard</h1>
            <p className="text-sm text-muted-foreground mt-0.5">Product analytics, sales, and management tools</p>
          </div>
          {showDateFilter && (
            <div className="flex items-center gap-2">
              <div className="flex items-center bg-muted rounded-lg p-0.5">
                {DATE_PRESETS.map(p => (
                  <button
                    key={p.value}
                    onClick={() => setDateRange(p.value)}
                    className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                      dateRange === p.value ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    {p.label}
                  </button>
                ))}
              </div>
              <button
                onClick={fetchData}
                className="p-1.5 rounded-lg bg-muted text-muted-foreground hover:text-foreground"
                title="Refresh data"
              >
                <RefreshCw className={`w-4 h-4 ${dataLoading ? 'animate-spin' : ''}`} />
              </button>
            </div>
          )}
        </div>

        {/* Section Tabs */}
        <div className="flex overflow-x-auto gap-1 border-b border-border mb-6 -mx-4 px-4 md:mx-0 md:px-0">
          {SECTIONS.map(s => {
            const Icon = s.icon;
            return (
              <button
                key={s.key}
                onClick={() => setSection(s.key)}
                className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${
                  section === s.key
                    ? 'border-primary text-primary'
                    : 'border-transparent text-muted-foreground hover:text-foreground'
                }`}
              >
                <Icon className="w-4 h-4" />
                {s.label}
              </button>
            );
          })}
        </div>

        {/* Truncation notice */}
        {data?.truncated && (
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 mb-4">
            <p className="text-xs text-amber-800">
              Showing partial data — over 500 records detected. Export to CSV for complete lists. Contact Base44 support for full data access.
            </p>
          </div>
        )}

        {/* Content */}
        {section === 'content' ? (
          <AdminContent />
        ) : section === 'users' ? (
          data ? <AdminUsers data={data} /> : null
        ) : dataLoading && !data ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        ) : error ? (
          <div className="bg-destructive/10 border border-destructive/20 rounded-xl p-6 text-center">
            <p className="text-sm text-destructive">{error}</p>
            <button onClick={fetchData} className="mt-3 text-xs text-destructive underline">Try again</button>
          </div>
        ) : data ? (
          section === 'overview' ? <AdminOverview data={data} /> :
          section === 'engagement' ? <AdminEngagement data={data} /> :
          section === 'features' ? <AdminFeatures data={data} /> :
          section === 'sales' ? <AdminSales data={data} /> : null
        ) : null}
      </div>
    </div>
  );
}