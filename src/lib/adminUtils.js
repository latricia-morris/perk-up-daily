export function exportToCSV(filename, data) {
  if (!data || data.length === 0) return;
  const headers = Object.keys(data[0]);
  const csv = [
    headers.join(','),
    ...data.map(row =>
      headers.map(h => `"${String(row[h] ?? '').replace(/"/g, '""')}"`).join(',')
    )
  ].join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export function formatCurrency(value) {
  if (value == null || isNaN(value)) return '$0.00';
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value);
}

export function formatNumber(value) {
  if (value == null) return '0';
  return new Intl.NumberFormat('en-US').format(value);
}

export function formatDate(dateStr) {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

export function formatDateTime(dateStr) {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit' });
}

export const CHART_COLORS = ['#E8A838', '#F95826', '#5C3B8F', '#219EBC', '#FFAD09', '#006D5B', '#BA1650'];

export const STATUS_LABELS = {
  trial: 'Trial',
  active: 'Active',
  grace_period: 'Grace Period',
  cancelled: 'Cancelled',
  expired: 'Expired',
  unknown: 'Unknown'
};

export const STATUS_COLORS = {
  trial: '#219EBC',
  active: '#006D5B',
  grace_period: '#E8A838',
  cancelled: '#BA1650',
  expired: '#999999',
  unknown: '#999999'
};