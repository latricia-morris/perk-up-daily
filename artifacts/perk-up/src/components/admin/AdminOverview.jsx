import { Users, DollarSign, CreditCard, Activity, TrendingUp, AlertTriangle, Info, CheckCircle2 } from 'lucide-react';
import AdminKPI from './AdminKPI';
import { formatCurrency, formatNumber, STATUS_LABELS, STATUS_COLORS } from '@/lib/adminUtils';

export default function AdminOverview({ data }) {
  if (!data) return null;
  const { users, engagement, sales, alerts } = data;

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <AdminKPI
          label="Total Users"
          value={formatNumber(users.total)}
          sublabel={`${users.new_signups} new this period`}
          icon={Users}
          tooltip="All registered users in the app"
        />
        <AdminKPI
          label="MRR"
          value={sales?.error ? '—' : formatCurrency(sales?.mrr)}
          sublabel={`ARPU ${sales?.error ? '—' : formatCurrency(sales?.arpu)}`}
          icon={DollarSign}
          tooltip="Monthly Recurring Revenue from active subscriptions"
        />
        <AdminKPI
          label="Active Subs"
          value={sales?.error ? '—' : formatNumber(sales?.active_subs)}
          sublabel={sales?.error ? sales.error.substring(0, 30) : `${sales?.new_subs} new · ${sales?.cancellations} churned`}
          icon={CreditCard}
          tooltip="Currently active Stripe subscriptions"
        />
        <AdminKPI
          label="Active Contributors"
          value={formatNumber(engagement.active_users)}
          sublabel="created entries this period"
          icon={Activity}
          tooltip="Unique users who created entries in the selected period"
        />
      </div>

      {/* Alerts Panel */}
      <div className="bg-card border border-border rounded-xl p-5">
        <h3 className="font-heading font-semibold text-foreground mb-3 flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-primary" />
          Alerts & Insights
        </h3>
        {alerts.length === 0 ? (
          <p className="text-sm text-muted-foreground">No notable alerts. Everything looks healthy.</p>
        ) : (
          <div className="space-y-2">
            {alerts.map((alert, i) => (
              <div
                key={i}
                className={`flex items-start gap-2 p-3 rounded-lg text-sm ${
                  alert.type === 'warning' ? 'bg-amber-50 text-amber-800' : 'bg-blue-50 text-blue-800'
                }`}
              >
                {alert.type === 'warning'
                  ? <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                  : <Info className="w-4 h-4 flex-shrink-0 mt-0.5" />}
                <span>{alert.message}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Subscription Status Breakdown + Onboarding */}
      <div className="grid md:grid-cols-2 gap-4">
        <div className="bg-card border border-border rounded-xl p-5">
          <h3 className="font-heading font-semibold text-foreground mb-4">Subscription Status</h3>
          <div className="space-y-2">
            {Object.entries(users.by_status).sort((a, b) => b[1] - a[1]).map(([status, count]) => (
              <div key={status} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span
                    className="w-2.5 h-2.5 rounded-full"
                    style={{ background: STATUS_COLORS[status] || '#999' }}
                  />
                  <span className="text-sm text-foreground">{STATUS_LABELS[status] || status}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-foreground">{count}</span>
                  <span className="text-xs text-muted-foreground">
                    ({users.total > 0 ? Math.round((count / users.total) * 100) : 0}%)
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-card border border-border rounded-xl p-5">
          <h3 className="font-heading font-semibold text-foreground mb-4">Onboarding Completion</h3>
          <div className="flex items-center gap-4">
            <div className="relative w-24 h-24">
              <svg className="w-24 h-24 -rotate-90" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="40" fill="none" stroke="hsl(var(--muted))" strokeWidth="8" />
                <circle
                  cx="50" cy="50" r="40" fill="none" stroke="hsl(var(--primary))" strokeWidth="8"
                  strokeDasharray={`${2 * Math.PI * 40}`}
                  strokeDashoffset={`${2 * Math.PI * 40 * (1 - users.onboarding_completion_rate / 100)}`}
                  strokeLinecap="round"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-xl font-bold font-heading text-foreground">{users.onboarding_completion_rate}%</span>
              </div>
            </div>
            <div className="flex-1 space-y-1">
              <div className="flex items-center gap-2 text-sm">
                <CheckCircle2 className="w-4 h-4 text-green-600" />
                <span className="text-foreground">{users.onboarding_completed} completed</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <AlertTriangle className="w-4 h-4 text-amber-500" />
                <span className="text-foreground">{users.onboarding_not_completed} not completed</span>
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                {users.total} total registered users
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}