import { Card } from '@/components/ui/card';

export default function AdminKPI({ label, value, sublabel, icon: Icon, trend, tooltip }) {
  return (
    <Card className="p-4 border-border">
      <div className="flex items-start justify-between">
        <div className="min-w-0">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide" title={tooltip}>
            {label}
          </p>
          <p className="text-2xl font-bold text-foreground mt-1 font-heading">{value}</p>
          {sublabel && <p className="text-xs text-muted-foreground mt-0.5">{sublabel}</p>}
        </div>
        {Icon && (
          <div className="flex-shrink-0 ml-2">
            <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center">
              <Icon className="w-4 h-4 text-primary" />
            </div>
          </div>
        )}
      </div>
      {trend != null && (
        <div className="mt-2">
          <span className={`text-xs font-medium ${trend >= 0 ? 'text-green-600' : 'text-red-500'}`}>
            {trend >= 0 ? '↑' : '↓'} {Math.abs(trend)}%
          </span>
          <span className="text-xs text-muted-foreground ml-1">vs last period</span>
        </div>
      )}
    </Card>
  );
}