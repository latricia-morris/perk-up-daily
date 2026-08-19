import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import { DollarSign, CreditCard, TrendingDown, Users, Download, AlertCircle } from 'lucide-react';
import AdminKPI from './AdminKPI';
import { exportToCSV, formatCurrency, formatNumber, CHART_COLORS } from '@/lib/adminUtils';

export default function AdminSales({ data }) {
  if (!data) return null;
  const { sales } = data;

  if (sales?.error) {
    return (
      <div className="bg-card border border-border rounded-xl p-8 text-center">
        <AlertCircle className="w-8 h-8 text-destructive mx-auto mb-3" />
        <p className="text-sm text-muted-foreground">Unable to load Stripe data: {sales.error}</p>
        <p className="text-xs text-muted-foreground mt-2">Check that STRIPE_SECRET_KEY is set correctly.</p>
      </div>
    );
  }

  if (!sales) return null;

  const planData = sales.plan_breakdown.map(p => ({
    ...p,
    name: p.plan === 'month' ? 'Monthly' : p.plan === 'year' ? 'Annual' : p.plan
  }));

  // Build forecast chart data (current + projected)
  const forecastData = [
    { month: 'Now', mrr: sales.mrr, projected: sales.mrr },
    ...sales.forecast.map(f => ({
      month: f.month,
      projected: f.projected_mrr
    }))
  ];

  const salesCsv = [{
    mrr: sales.mrr,
    total_revenue: sales.total_revenue,
    active_subs: sales.active_subs,
    new_subs: sales.new_subs,
    cancellations: sales.cancellations,
    churn_rate: sales.churn_rate,
    arpu: sales.arpu
  }];

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <AdminKPI
          label="MRR"
          value={formatCurrency(sales.mrr)}
          sublabel={`Total revenue ${formatCurrency(sales.total_revenue)}`}
          icon={DollarSign}
          tooltip="Monthly Recurring Revenue — sum of all active subscription monthly contributions"
        />
        <AdminKPI
          label="Active Subs"
          value={formatNumber(sales.active_subs)}
          sublabel={`${sales.new_subs} new this period`}
          icon={CreditCard}
        />
        <AdminKPI
          label="Churn Rate"
          value={`${sales.churn_rate}%`}
          sublabel={`${sales.cancellations} cancellations`}
          icon={TrendingDown}
          tooltip="Cancellations as a % of total subscriptions in the period"
        />
        <AdminKPI
          label="ARPU"
          value={formatCurrency(sales.arpu)}
          sublabel="avg revenue / user"
          icon={Users}
          tooltip="Average Revenue Per User — MRR divided by active subscriptions"
        />
      </div>

      {/* Plan Breakdown + Forecast */}
      <div className="grid lg:grid-cols-2 gap-4">
        {/* Plan Breakdown */}
        <div className="bg-card border border-border rounded-xl p-5">
          <h3 className="font-heading font-semibold text-foreground mb-4">Plan Breakdown</h3>
          {planData.length > 0 ? (
            <>
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie data={planData} dataKey="users" nameKey="name" cx="50%" cy="50%" outerRadius={70} innerRadius={40}>
                    {planData.map((_, i) => <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />)}
                  </Pie>
                  <Tooltip contentStyle={{ borderRadius: '8px', border: '1px solid hsl(var(--border))', fontSize: '12px' }} />
                  <Legend wrapperStyle={{ fontSize: '12px' }} />
                </PieChart>
              </ResponsiveContainer>
              <div className="mt-4 space-y-2">
                {planData.map((p, i) => (
                  <div key={i} className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full" style={{ background: CHART_COLORS[i % CHART_COLORS.length] }} />
                      <span className="text-foreground">{p.name}</span>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="text-muted-foreground">{p.users} users</span>
                      <span className="text-foreground font-medium">{formatCurrency(p.mrr)}/mo</span>
                    </div>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <p className="text-sm text-muted-foreground text-center py-8">No subscription data available.</p>
          )}
        </div>

        {/* Forecast */}
        <div className="bg-card border border-border rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-heading font-semibold text-foreground">6-Month MRR Forecast</h3>
            <button onClick={() => exportToCSV('sales_summary.csv', salesCsv)} className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground">
              <Download className="w-3 h-3" /> CSV
            </button>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={forecastData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="month" tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
              <YAxis tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" tickFormatter={(v) => `$${Math.round(v)}`} />
              <Tooltip
                contentStyle={{ borderRadius: '8px', border: '1px solid hsl(var(--border))', fontSize: '12px' }}
                formatter={(v) => formatCurrency(v)}
              />
              <Line type="monotone" dataKey="mrr" stroke="#E8A838" strokeWidth={2} dot={{ r: 4 }} name="Current MRR" />
              <Line type="monotone" dataKey="projected" stroke="#006D5B" strokeWidth={2} strokeDasharray="5 5" dot={{ r: 4 }} name="Projected" />
            </LineChart>
          </ResponsiveContainer>

          {/* Forecast Assumptions */}
          <div className="mt-4 p-3 bg-muted/50 rounded-lg">
            <p className="text-xs font-medium text-muted-foreground mb-2">Assumptions:</p>
            <ul className="space-y-1 text-xs text-muted-foreground">
              <li>• New subscriptions: <span className="text-foreground font-medium">{sales.forecast_assumptions.avg_new_subs_per_month}/month</span></li>
              <li>• Churn rate: <span className="text-foreground font-medium">{sales.forecast_assumptions.churn_rate}%</span>/month</li>
              <li>• Avg revenue/sub: <span className="text-foreground font-medium">{formatCurrency(sales.forecast_assumptions.avg_revenue_per_sub)}</span></li>
            </ul>
          </div>
        </div>
      </div>

      {/* Forecast Table */}
      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <div className="px-5 py-4 border-b border-border">
          <h3 className="font-heading font-semibold text-foreground">Forecast Detail</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted">
              <tr>
                <th className="p-3 text-left font-medium text-muted-foreground">Month</th>
                <th className="p-3 text-left font-medium text-muted-foreground">Projected MRR</th>
                <th className="p-3 text-left font-medium text-muted-foreground">Projected Subs</th>
                <th className="p-3 text-left font-medium text-muted-foreground">Change</th>
              </tr>
            </thead>
            <tbody>
              {sales.forecast.map((f, i) => (
                <tr key={i} className="border-t border-border">
                  <td className="p-3 text-foreground font-medium">{f.month}</td>
                  <td className="p-3 text-foreground">{formatCurrency(f.projected_mrr)}</td>
                  <td className="p-3 text-muted-foreground">{f.projected_subs}</td>
                  <td className="p-3 text-muted-foreground">
                    {i === 0
                      ? <span className="text-green-600">+{formatCurrency(f.projected_mrr - sales.mrr)}</span>
                      : <span className="text-green-600">+{formatCurrency(f.projected_mrr - sales.forecast[i - 1].projected_mrr)}</span>
                    }
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}