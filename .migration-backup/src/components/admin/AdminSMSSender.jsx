import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Loader2, Send, CheckCircle2, AlertCircle, Users } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

const DEFAULT_PHONE = '+17178749787';

export default function AdminSMSSender() {
  const { toast } = useToast();
  const [phone, setPhone] = useState(DEFAULT_PHONE);
  const [message, setMessage] = useState('');
  const [mode, setMode] = useState('test'); // 'test' | 'user' | 'broadcast'
  const [selectedUserId, setSelectedUserId] = useState('');
  const [sending, setSending] = useState(false);
  const [result, setResult] = useState(null);

  const { data: users = [], isLoading: usersLoading } = useQuery({
    queryKey: ['admin-users-sms'],
    queryFn: () => base44.entities.User.list('-created_date', 500),
    enabled: mode === 'user' || mode === 'broadcast',
  });

  const smsUsers = users.filter(u => u.sms_consent && u.phone_number);

  const handleSend = async () => {
    if (!message.trim()) return;
    setSending(true);
    setResult(null);
    try {
      const payload = { body: message };
      if (mode === 'test') {
        payload.to = phone;
      } else if (mode === 'user') {
        payload.userId = selectedUserId;
      } else if (mode === 'broadcast') {
        payload.broadcast = true;
      }
      const response = await base44.functions.invoke('send_sms', payload);
      setResult(response.data);
      toast({
        title: response.data.sent > 0 ? 'Messages sent!' : 'Send failed',
        description: `${response.data.sent} sent, ${response.data.failed} failed`,
      });
    } catch (err) {
      toast({ title: 'Error', description: err.message, variant: 'destructive' });
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="max-w-xl">
      {/* Mode selector */}
      <div className="flex gap-2 mb-6">
        {[
          { key: 'test', label: 'Test Message' },
          { key: 'user', label: 'Specific User' },
          { key: 'broadcast', label: 'All Users' },
        ].map(opt => (
          <button
            key={opt.key}
            onClick={() => { setMode(opt.key); setResult(null); }}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              mode === opt.key
                ? 'bg-primary text-primary-foreground'
                : 'bg-muted text-muted-foreground hover:bg-accent'
            }`}
          >
            {opt.label}
          </button>
        ))}
      </div>

      {/* Recipient — Test mode */}
      {mode === 'test' && (
        <div className="bg-card border border-border rounded-xl p-4 mb-4">
          <Label className="text-sm font-medium mb-1.5 block">Phone Number</Label>
          <Input
            type="tel"
            value={phone}
            onChange={e => setPhone(e.target.value)}
            placeholder="+17178749787"
          />
          <p className="text-xs text-muted-foreground mt-1.5">Include country code (e.g. +1 for US)</p>
        </div>
      )}

      {/* Recipient — User mode */}
      {mode === 'user' && (
        <div className="bg-card border border-border rounded-xl p-4 mb-4">
          <Label className="text-sm font-medium mb-1.5 block">Select User</Label>
          {usersLoading ? (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="w-4 h-4 animate-spin" /> Loading users…
            </div>
          ) : (
            <select
              value={selectedUserId}
              onChange={e => setSelectedUserId(e.target.value)}
              className="w-full h-10 px-3 rounded-md border border-input bg-card text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
            >
              <option value="">Choose a user…</option>
              {users.map(u => (
                <option key={u.id} value={u.id}>
                  {u.full_name || u.email} {u.phone_number ? `(${u.phone_number})` : '(no phone)'}
                </option>
              ))}
            </select>
          )}
          {selectedUserId && (
            <p className="text-xs text-muted-foreground mt-1.5">
              {(() => {
                const u = users.find(x => x.id === selectedUserId);
                return u?.sms_consent
                  ? `✅ SMS consent given — will send to ${u.phone_number}`
                  : '⚠️ This user has not opted in to SMS';
              })()}
            </p>
          )}
        </div>
      )}

      {/* Recipient — Broadcast mode */}
      {mode === 'broadcast' && (
        <div className="bg-card border border-border rounded-xl p-4 mb-4">
          <div className="flex items-center gap-2 mb-2">
            <Users className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium text-foreground">Broadcast to all SMS-consented users</span>
          </div>
          {usersLoading ? (
            <p className="text-sm text-muted-foreground">Loading users…</p>
          ) : (
            <p className="text-xs text-muted-foreground">
              {smsUsers.length} user{smsUsers.length !== 1 ? 's' : ''} have opted in to SMS and have a phone number on file.
            </p>
          )}
          <div className="mt-2 p-2.5 rounded-lg bg-amber-50 border border-amber-200 text-xs text-amber-800">
            ⚠️ This will send the same message to all {smsUsers.length} opted-in users at once.
          </div>
        </div>
      )}

      {/* Message body */}
      <div className="bg-card border border-border rounded-xl p-4 mb-4">
        <Label className="text-sm font-medium mb-1.5 block">Message</Label>
        <Textarea
          value={message}
          onChange={e => setMessage(e.target.value)}
          placeholder="Type your message here…"
          className="min-h-[120px]"
          maxLength={1600}
        />
        <div className="flex justify-between mt-1.5">
          <p className="text-xs text-muted-foreground">SMS segments: {Math.ceil(message.length / 160)}</p>
          <p className="text-xs text-muted-foreground">{message.length}/1600</p>
        </div>
      </div>

      {/* Send button */}
      <Button
        onClick={handleSend}
        disabled={sending || !message.trim() || (mode === 'user' && !selectedUserId) || (mode === 'broadcast' && smsUsers.length === 0)}
        className="w-full bg-primary hover:bg-primary/90"
        size="lg"
      >
        {sending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Send className="w-4 h-4 mr-2" />}
        {sending ? 'Sending…' : `Send ${mode === 'broadcast' ? 'Broadcast' : 'Message'}`}
      </Button>

      {/* Results */}
      {result && (
        <div className="mt-4 space-y-2">
          <div className={`flex items-center gap-2 p-3 rounded-lg ${
            result.failed === 0 ? 'bg-green-50 border border-green-200' : 'bg-amber-50 border border-amber-200'
          }`}>
            {result.failed === 0
              ? <CheckCircle2 className="w-4 h-4 text-green-600" />
              : <AlertCircle className="w-4 h-4 text-amber-600" />
            }
            <p className="text-sm font-medium">
              {result.sent} sent{result.failed > 0 ? `, ${result.failed} failed` : ''}
            </p>
          </div>
          {mode === 'broadcast' && result.results && (
            <div className="max-h-60 overflow-y-auto space-y-1">
              {result.results.map((r, i) => (
                <div key={i} className={`text-xs p-2 rounded-md flex items-center justify-between ${
                  r.success ? 'bg-green-50' : 'bg-red-50'
                }`}>
                  <span>{r.name} — {r.phone}</span>
                  <span className={r.success ? 'text-green-600' : 'text-red-600'}>
                    {r.success ? '✓' : `✗ ${r.error}`}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}