import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Bug, Lightbulb, MessageSquare, Wrench, Clock, Sparkles, Trash2, CheckCircle2 } from 'lucide-react';

const STATUS_CONFIG = {
  pending: { label: 'Pending', color: '#7a5c3a', bg: 'rgba(122,92,58,0.1)' },
  fix_now: { label: 'Fix Now', color: '#F95826', bg: 'rgba(249,88,38,0.1)' },
  fix_later: { label: 'Fix Later', color: '#219EBC', bg: 'rgba(33,158,188,0.1)' },
  later_feature: { label: 'Later Feature', color: '#5C3B8F', bg: 'rgba(92,59,143,0.1)' },
  discarded: { label: 'Discarded', color: '#999', bg: 'rgba(153,153,153,0.1)' },
  resolved: { label: 'Resolved', color: '#006D5B', bg: 'rgba(0,109,91,0.1)' },
};

const TYPE_ICONS = {
  bug: Bug,
  feature_request: Lightbulb,
  other: MessageSquare,
};

export default function AdminBugReports() {
  const queryClient = useQueryClient();
  const [statusFilter, setStatusFilter] = useState('pending');
  const [expandedId, setExpandedId] = useState(null);

  const { data: reports = [], isLoading } = useQuery({
    queryKey: ['admin-bug-reports', statusFilter],
    queryFn: () => {
      if (statusFilter === 'all') {
        return base44.entities.BugReport.list('-created_date', 200);
      }
      return base44.entities.BugReport.filter({ status: statusFilter }, '-created_date');
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.BugReport.update(id, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin-bug-reports'] }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.BugReport.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin-bug-reports'] }),
  });

  const handleStatusChange = (id, newStatus) => {
    updateMutation.mutate({ id, data: { status: newStatus } });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-display text-lg font-semibold text-foreground">Bug Reports & Feature Requests</h2>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="fix_now">Fix Now</SelectItem>
            <SelectItem value="fix_later">Fix Later</SelectItem>
            <SelectItem value="later_feature">Later Features</SelectItem>
            <SelectItem value="discarded">Discarded</SelectItem>
            <SelectItem value="resolved">Resolved</SelectItem>
            <SelectItem value="all">All</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Summary counts */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-2 mb-6">
        {['pending', 'fix_now', 'fix_later', 'later_feature', 'resolved'].map(s => {
          const count = reports.filter(r => r.status === s).length;
          const cfg = STATUS_CONFIG[s];
          return (
            <div
              key={s}
              onClick={() => setStatusFilter(s)}
              className="cursor-pointer rounded-lg p-3 text-center transition-all hover:scale-105"
              style={{ background: cfg.bg, border: `1px solid ${cfg.color}33` }}
            >
              <p className="text-2xl font-bold" style={{ color: cfg.color }}>{count}</p>
              <p className="text-[10px] font-medium uppercase tracking-wider" style={{ color: cfg.color }}>{cfg.label}</p>
            </div>
          );
        })}
      </div>

      {reports.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground">
          <Bug className="w-8 h-8 mx-auto mb-3 opacity-40" />
          <p className="text-sm">No reports in this category.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {reports.map(report => {
            const TypeIcon = TYPE_ICONS[report.report_type] || MessageSquare;
            const cfg = STATUS_CONFIG[report.status] || STATUS_CONFIG.pending;
            const isExpanded = expandedId === report.id;
            return (
              <div key={report.id} className="bg-card border border-border rounded-xl overflow-hidden">
                {/* Header row */}
                <button
                  onClick={() => setExpandedId(isExpanded ? null : report.id)}
                  className="w-full flex items-start gap-3 p-4 text-left transition-colors hover:bg-accent/20"
                >
                  <div className="mt-0.5 shrink-0">
                    <TypeIcon className="w-4 h-4 text-muted-foreground" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span
                        className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full"
                        style={{ background: cfg.bg, color: cfg.color }}
                      >
                        {cfg.label}
                      </span>
                      <span className="text-[10px] text-muted-foreground">
                        {report.report_type === 'feature_request' ? 'Feature' : report.report_type === 'bug' ? 'Bug' : 'Other'}
                      </span>
                    </div>
                    <p className="text-sm font-medium text-foreground truncate">{report.title}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {report.reporter_name || 'Unknown'} · {report.reporter_email}
                    </p>
                  </div>
                </button>

                {/* Expanded details */}
                {isExpanded && (
                  <div className="px-4 pb-4 border-t border-border pt-3 space-y-3">
                    <div>
                      <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-1">Description</p>
                      <p className="text-sm text-foreground whitespace-pre-wrap">{report.description}</p>
                    </div>

                    {report.page_url && (
                      <div>
                        <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-1">Page</p>
                        <p className="text-xs text-muted-foreground font-mono">{report.page_url}</p>
                      </div>
                    )}

                    <div>
                      <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-1">Submitted</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(report.created_date).toLocaleString()}
                      </p>
                    </div>

                    {/* Triage actions */}
                    <div className="flex flex-wrap gap-2 pt-2 border-t border-border">
                      <p className="w-full text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-1">Triage</p>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleStatusChange(report.id, 'fix_now')}
                        className="gap-1"
                        style={report.status === 'fix_now' ? { borderColor: '#F95826', color: '#F95826' } : {}}
                      >
                        <Wrench className="w-3 h-3" /> Fix Now
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleStatusChange(report.id, 'fix_later')}
                        className="gap-1"
                        style={report.status === 'fix_later' ? { borderColor: '#219EBC', color: '#219EBC' } : {}}
                      >
                        <Clock className="w-3 h-3" /> Fix Later
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleStatusChange(report.id, 'later_feature')}
                        className="gap-1"
                        style={report.status === 'later_feature' ? { borderColor: '#5C3B8F', color: '#5C3B8F' } : {}}
                      >
                        <Sparkles className="w-3 h-3" /> Later Feature
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleStatusChange(report.id, 'resolved')}
                        className="gap-1"
                        style={report.status === 'resolved' ? { borderColor: '#006D5B', color: '#006D5B' } : {}}
                      >
                        <CheckCircle2 className="w-3 h-3" /> Resolved
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleStatusChange(report.id, 'discarded')}
                        className="gap-1"
                        style={report.status === 'discarded' ? { borderColor: '#999', color: '#999' } : {}}
                      >
                        Discard
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => deleteMutation.mutate(report.id)}
                        className="gap-1 text-destructive hover:text-destructive ml-auto"
                      >
                        <Trash2 className="w-3 h-3" /> Delete
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}