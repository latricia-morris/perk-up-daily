import { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Search, UserPlus, Mail, Phone, Calendar, Shield, Download, Eye, X, CheckCircle2, XCircle } from 'lucide-react';
import { exportToCSV, formatDate, formatNumber, STATUS_LABELS, STATUS_COLORS } from '@/lib/adminUtils';

export default function AdminUsers({ data }) {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedUser, setSelectedUser] = useState(null);
  const [inviteOpen, setInviteOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState('user');
  const [inviteLoading, setInviteLoading] = useState(false);
  const [updateLoading, setUpdateLoading] = useState(false);

  if (!data) return null;

  const users = data.user_list || [];

  const filtered = users.filter(u => {
    const q = search.toLowerCase();
    const matchesSearch = !q ||
      (u.email || '').toLowerCase().includes(q) ||
      (u.full_name || '').toLowerCase().includes(q) ||
      (u.id || '').toLowerCase().includes(q);
    const matchesStatus = statusFilter === 'all' || u.subscription_status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleInvite = async () => {
    if (!inviteEmail) return;
    setInviteLoading(true);
    try {
      await base44.users.inviteUser(inviteEmail, inviteRole);
      setInviteEmail('');
      setInviteOpen(false);
      queryClient.invalidateQueries({ queryKey: ['admin-dashboard'] });
    } catch (err) {
      alert('Failed to invite: ' + err.message);
    } finally {
      setInviteLoading(false);
    }
  };

  const handleUpdateUser = async (userId, updates) => {
    setUpdateLoading(true);
    try {
      await base44.entities.User.update(userId, updates);
      queryClient.invalidateQueries({ queryKey: ['admin-dashboard'] });
      // Update the selected user locally
      if (selectedUser?.id === userId) {
        setSelectedUser({ ...selectedUser, ...updates });
      }
    } catch (err) {
      alert('Failed to update: ' + err.message);
    } finally {
      setUpdateLoading(false);
    }
  };

  const handleDeactivate = async (userId) => {
    if (!confirm('Deactivate this user? Their subscription will be marked as cancelled.')) return;
    await handleUpdateUser(userId, {
      subscription_status: 'cancelled',
      cancelled_date: new Date().toISOString().split('T')[0]
    });
  };

  const handleCompAccess = async (userId) => {
    const farFuture = new Date();
    farFuture.setFullYear(farFuture.getFullYear() + 1);
    await handleUpdateUser(userId, {
      subscription_status: 'active',
      renewal_date: farFuture.toISOString()
    });
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2 flex-1">
          <div className="relative flex-1 max-w-xs">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search name, email, ID…"
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="pl-8"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-36"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All statuses</SelectItem>
              {Object.entries(STATUS_LABELS).map(([slug, label]) => (
                <SelectItem key={slug} value={slug}>{label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => exportToCSV('users.csv', filtered.map(u => ({
            name: u.full_name, email: u.email, role: u.role, status: u.subscription_status,
            signup_date: formatDate(u.created_date), onboarding: u.onboarding_completed ? 'Yes' : 'No',
            phone: u.phone_number || '', sms_consent: u.sms_consent ? 'Yes' : 'No'
          })))} className="gap-1">
            <Download className="w-3.5 h-3.5" /> CSV
          </Button>
          <Button size="sm" onClick={() => setInviteOpen(true)} className="gap-1 bg-primary hover:bg-primary/90">
            <UserPlus className="w-3.5 h-3.5" /> Invite User
          </Button>
        </div>
      </div>

      <p className="text-xs text-muted-foreground">{formatNumber(filtered.length)} of {formatNumber(users.length)} users</p>

      {/* Table */}
      <div className="border border-border rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted">
              <tr>
                <th className="p-3 text-left font-medium text-muted-foreground">User</th>
                <th className="p-3 text-left font-medium text-muted-foreground">Status</th>
                <th className="p-3 text-left font-medium text-muted-foreground">Signup</th>
                <th className="p-3 text-left font-medium text-muted-foreground">Onboarding</th>
                <th className="p-3 text-left font-medium text-muted-foreground">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.slice(0, 100).map(u => (
                <tr key={u.id} className="border-t border-border hover:bg-accent/30">
                  <td className="p-3">
                    <div>
                      <p className="text-foreground font-medium">{u.full_name || '—'}</p>
                      <p className="text-xs text-muted-foreground">{u.email}</p>
                    </div>
                  </td>
                  <td className="p-3">
                    <span
                      className="text-xs px-2 py-0.5 rounded-full font-medium"
                      style={{
                        background: `${STATUS_COLORS[u.subscription_status] || '#999'}20`,
                        color: STATUS_COLORS[u.subscription_status] || '#999'
                      }}
                    >
                      {STATUS_LABELS[u.subscription_status] || u.subscription_status || 'Unknown'}
                    </span>
                  </td>
                  <td className="p-3 text-muted-foreground text-xs whitespace-nowrap">{formatDate(u.created_date)}</td>
                  <td className="p-3">
                    {u.onboarding_completed
                      ? <CheckCircle2 className="w-4 h-4 text-green-600" />
                      : <XCircle className="w-4 h-4 text-muted-foreground" />
                    }
                  </td>
                  <td className="p-3">
                    <div className="flex gap-1">
                      <Button size="sm" variant="ghost" onClick={() => setSelectedUser(u)} className="gap-1">
                        <Eye className="w-3.5 h-3.5" /> View
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {filtered.length === 0 && (
          <div className="text-center py-12 text-muted-foreground text-sm">No users found.</div>
        )}
        {filtered.length > 100 && (
          <div className="text-center py-3 text-xs text-muted-foreground border-t border-border">
            Showing first 100 of {filtered.length} results. Export CSV for full list.
          </div>
        )}
      </div>

      {/* User Detail Modal */}
      <Dialog open={!!selectedUser} onOpenChange={(open) => !open && setSelectedUser(null)}>
        <DialogContent className="max-w-lg">
          {selectedUser && (
            <>
              <DialogHeader>
                <DialogTitle className="font-heading">{selectedUser.full_name || 'User'}</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div className="flex items-center gap-2">
                    <Mail className="w-3.5 h-3.5 text-muted-foreground" />
                    <span className="text-foreground">{selectedUser.email}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone className="w-3.5 h-3.5 text-muted-foreground" />
                    <span className="text-foreground">{selectedUser.phone_number || '—'}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="w-3.5 h-3.5 text-muted-foreground" />
                    <span className="text-foreground">{formatDate(selectedUser.created_date)}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Shield className="w-3.5 h-3.5 text-muted-foreground" />
                    <span className="text-foreground">{selectedUser.role}</span>
                  </div>
                </div>

                <div className="bg-muted/50 rounded-lg p-3 space-y-2 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Subscription Status</span>
                    <Select
                      value={selectedUser.subscription_status || 'unknown'}
                      onValueChange={(v) => handleUpdateUser(selectedUser.id, { subscription_status: v })}
                      disabled={updateLoading}
                    >
                      <SelectTrigger className="w-32 h-8"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {Object.entries(STATUS_LABELS).map(([slug, label]) => (
                          <SelectItem key={slug} value={slug}>{label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Onboarding</span>
                    <span className="text-foreground">{selectedUser.onboarding_completed ? '✓ Completed' : '✗ Not completed'}</span>
                  </div>
                  {selectedUser.renewal_date && (
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Renewal Date</span>
                      <span className="text-foreground">{formatDate(selectedUser.renewal_date)}</span>
                    </div>
                  )}
                  {selectedUser.trial_end_date && (
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Trial Ends</span>
                      <span className="text-foreground">{formatDate(selectedUser.trial_end_date)}</span>
                    </div>
                  )}
                  {selectedUser.stripe_customer_id && (
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Stripe Customer</span>
                      <span className="text-foreground text-xs font-mono">{selectedUser.stripe_customer_id}</span>
                    </div>
                  )}
                </div>

                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleCompAccess(selectedUser.id)}
                    disabled={updateLoading}
                    className="flex-1"
                  >
                    Grant Comp Access (1yr)
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleDeactivate(selectedUser.id)}
                    disabled={updateLoading}
                    className="flex-1 text-destructive hover:text-destructive"
                  >
                    Deactivate
                  </Button>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Invite User Dialog */}
      <Dialog open={inviteOpen} onOpenChange={setInviteOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="font-heading">Invite New User</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label className="text-sm font-medium mb-1.5 block">Email Address</Label>
              <Input
                type="email"
                placeholder="user@example.com"
                value={inviteEmail}
                onChange={e => setInviteEmail(e.target.value)}
              />
            </div>
            <div>
              <Label className="text-sm font-medium mb-1.5 block">Role</Label>
              <Select value={inviteRole} onValueChange={setInviteRole}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="user">User</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setInviteOpen(false)}>Cancel</Button>
            <Button onClick={handleInvite} disabled={!inviteEmail || inviteLoading} className="bg-primary hover:bg-primary/90">
              {inviteLoading ? 'Sending…' : 'Send Invite'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}