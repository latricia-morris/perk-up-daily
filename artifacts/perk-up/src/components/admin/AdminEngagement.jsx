import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { UserPlus, Activity, Repeat, Calendar, Download } from 'lucide-react';
import AdminKPI from './AdminKPI';
import { exportToCSV, formatNumber } from '@/lib/adminUtils';

export default function AdminEngagement({ data }) {
  if (!data) return null;
  const { users, engagement } = data;

  const signupData = (users.signup_timeline || []).map(d => ({
    date: new Date(d.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    signups: d.count
  }));

  const activeData = (engagement.active_timeline || []).map(d => ({
    date: new Date(d.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    active: d.count
  }));

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <AdminKPI
          label="New Signups"
          value={formatNumber(users.new_signups)}
          sublabel="in selected period"
          icon={UserPlus}
        />
        <AdminKPI
          label="Sessions"
          value={formatNumber(engagement.sessions)}
          sublabel="delivery log entries"
          icon={Activity}
          tooltip="Total deliveries sent (morning, midday, evening)"
        />
        <AdminKPI
          label="Active Users"
          value={formatNumber(engagement.active_users)}
          sublabel="in selected period"
          icon={Calendar}
          tooltip="Unique users with entries or deliveries in the date range"
        />
        <AdminKPI
          label="Uplifts Sent"
          value={formatNumber(engagement.uplifts_sent)}
          sublabel="cards shared"
          icon={Repeat}
        />
      </div>

      {/* DAU / WAU / MAU */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-card border border-border rounded-xl p-4 text-center">
          <p className="text-xs font-medium text-muted-foreground uppercase">DAU</p>
          <p className="text-2xl font-bold font-heading text-foreground mt-1">{formatNumber(engagement.dau)}</p>
          <p className="text-xs text-muted-foreground mt-0.5">last 24h</p>
        </div>
        <div className="bg-card border border-border rounded-xl p-4 text-center">
          <p className="text-xs font-medium text-muted-foreground uppercase">WAU</p>
          <p className="text-2xl font-bold font-heading text-foreground mt-1">{formatNumber(engagement.wau)}</p>
          <p className="text-xs text-muted-foreground mt-0.5">last 7 days</p>
        </div>
        <div className="bg-card border border-border rounded-xl p-4 text-center">
          <p className="text-xs font-medium text-muted-foreground uppercase">MAU</p>
          <p className="text-2xl font-bold font-heading text-foreground mt-1">{formatNumber(engagement.mau)}</p>
          <p className="text-xs text-muted-foreground mt-0.5">last 30 days</p>
        </div>
      </div>

      {/* Signup Timeline */}
      <div className="bg-card border border-border rounded-xl p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-heading font-semibold text-foreground">Signup Timeline</h3>
          <button
            onClick={() => exportToCSV('signups.csv', signupData)}
            className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
          >
            <Download className="w-3 h-3" /> CSV
          </button>
        </div>
        <ResponsiveContainer width="100%" height={250}>
          <AreaChart data={signupData}>
            <defs>
              <linearGradient id="signupGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#E8A838" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#E8A838" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis dataKey="date" tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
            <YAxis tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" allowDecimals={false} />
            <Tooltip contentStyle={{ borderRadius: '8px', border: '1px solid hsl(var(--border))', fontSize: '12px' }} />
            <Area type="monotone" dataKey="signups" stroke="#E8A838" strokeWidth={2} fill="url(#signupGrad)" />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Active Users Timeline */}
      <div className="bg-card border border-border rounded-xl p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-heading font-semibold text-foreground">Daily Active Users</h3>
          <button
            onClick={() => exportToCSV('active_users.csv', activeData)}
            className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
          >
            <Download className="w-3 h-3" /> CSV
          </button>
        </div>
        <ResponsiveContainer width="100%" height={250}>
          <AreaChart data={activeData}>
            <defs>
              <linearGradient id="activeGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#006D5B" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#006D5B" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis dataKey="date" tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
            <YAxis tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" allowDecimals={false} />
            <Tooltip contentStyle={{ borderRadius: '8px', border: '1px solid hsl(var(--border))', fontSize: '12px' }} />
            <Area type="monotone" dataKey="active" stroke="#006D5B" strokeWidth={2} fill="url(#activeGrad)" />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Retention */}
      <div className="bg-card border border-border rounded-xl p-5">
        <h3 className="font-heading font-semibold text-foreground mb-4">Retention Rates</h3>
        <p className="text-xs text-muted-foreground mb-4">
          Percentage of users who returned and had activity (entries or deliveries) within N days of signing up.
        </p>
        <div className="grid grid-cols-3 gap-4">
          {[
            { label: 'Day 1', value: engagement.retention.d1, color: '#E8A838' },
            { label: 'Day 7', value: engagement.retention.d7, color: '#006D5B' },
            { label: 'Day 30', value: engagement.retention.d30, color: '#5C3B8F' },
          ].map(r => (
            <div key={r.label} className="text-center">
              <div className="relative inline-flex items-center justify-center">
                <svg className="w-20 h-20 -rotate-90" viewBox="0 0 100 100">
                  <circle cx="50" cy="50" r="40" fill="none" stroke="hsl(var(--muted))" strokeWidth="6" />
                  <circle
                    cx="50" cy="50" r="40" fill="none" stroke={r.color} strokeWidth="6"
                    strokeDasharray={`${2 * Math.PI * 40}`}
                    strokeDashoffset={`${2 * Math.PI * 40 * (1 - r.value / 100)}`}
                    strokeLinecap="round"
                  />
                </svg>
                <span className="absolute text-sm font-bold font-heading text-foreground">{r.value}%</span>
              </div>
              <p className="text-sm text-muted-foreground mt-2">{r.label}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}