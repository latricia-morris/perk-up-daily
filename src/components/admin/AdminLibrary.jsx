import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Trash2, Archive, CheckCircle2, Pencil, Save, X } from 'lucide-react';
import { CONTENT_TYPES, CATEGORIES, getContentTypeLabel, getCategoryLabel } from '@/lib/constants';
import CategoryBadge from '@/components/shared/CategoryBadge';

export default function AdminLibrary() {
  const queryClient = useQueryClient();
  const [typeFilter, setTypeFilter] = useState('all');
  const [catFilter, setCatFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [christianFilter, setChristianFilter] = useState('all');
  const [selected, setSelected] = useState(new Set());
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({ body: '', author: '' });

  const startEdit = (item) => {
    setEditingId(item.id);
    setEditForm({ body: item.body || '', author: item.author || '' });
  };

  const saveEdit = (id) => {
    updateMutation.mutate({ id, data: editForm });
    setEditingId(null);
  };

  const { data: items = [], isLoading } = useQuery({
    queryKey: ['admin-library'],
    queryFn: () => base44.entities.AppLibrary.list('-created_date', 200),
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.AppLibrary.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin-library'] }),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.AppLibrary.update(id, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin-library'] }),
  });

  const filtered = items.filter(item => {
    if (typeFilter !== 'all' && item.content_type !== typeFilter) return false;
    if (catFilter !== 'all' && item.category !== catFilter) return false;
    if (statusFilter !== 'all' && item.status !== statusFilter) return false;
    if (christianFilter === 'christian' && !item.is_christian) return false;
    if (christianFilter === 'general' && item.is_christian) return false;
    return true;
  });

  const toggleAll = () => {
    if (selected.size === filtered.length) {
      setSelected(new Set());
    } else {
      setSelected(new Set(filtered.map(i => i.id)));
    }
  };

  const bulkAction = async (action) => {
    const ids = [...selected];
    if (action === 'delete') {
      for (const id of ids) await deleteMutation.mutateAsync(id);
    } else {
      const status = action === 'activate' ? 'active' : 'archived';
      for (const id of ids) await updateMutation.mutateAsync({ id, data: { status } });
    }
    setSelected(new Set());
  };

  return (
    <div>
      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-4">
        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger className="w-40"><SelectValue placeholder="All types" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All types</SelectItem>
            {CONTENT_TYPES.map(t => <SelectItem key={t.slug} value={t.slug}>{t.label}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={catFilter} onValueChange={setCatFilter}>
          <SelectTrigger className="w-44"><SelectValue placeholder="All categories" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All categories</SelectItem>
            {CATEGORIES.map(c => <SelectItem key={c.slug} value={c.slug}>{c.label}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={christianFilter} onValueChange={setChristianFilter}>
          <SelectTrigger className="w-40"><SelectValue placeholder="All content" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All content</SelectItem>
            <SelectItem value="christian">Christian only</SelectItem>
            <SelectItem value="general">General only</SelectItem>
          </SelectContent>
        </Select>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-36"><SelectValue placeholder="All statuses" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="archived">Archived</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Bulk actions */}
      {selected.size > 0 && (
        <div className="flex items-center gap-3 mb-4 p-3 bg-primary/5 rounded-lg">
          <span className="text-sm text-foreground">{selected.size} selected</span>
          <Button size="sm" variant="outline" onClick={() => bulkAction('activate')} className="gap-1">
            <CheckCircle2 className="w-3 h-3" /> Activate
          </Button>
          <Button size="sm" variant="outline" onClick={() => bulkAction('archive')} className="gap-1">
            <Archive className="w-3 h-3" /> Archive
          </Button>
          <Button size="sm" variant="outline" onClick={() => bulkAction('delete')} className="gap-1 text-destructive hover:text-destructive">
            <Trash2 className="w-3 h-3" /> Delete
          </Button>
        </div>
      )}

      {/* Table */}
      <div className="border border-border rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted">
              <tr>
                <th className="p-3 text-left">
                  <Checkbox checked={selected.size === filtered.length && filtered.length > 0} onCheckedChange={toggleAll} />
                </th>
                <th className="p-3 text-left font-medium text-muted-foreground">Content</th>
                <th className="p-3 text-left font-medium text-muted-foreground">Author</th>
                <th className="p-3 text-left font-medium text-muted-foreground">Type</th>
                <th className="p-3 text-left font-medium text-muted-foreground">Category</th>
                <th className="p-3 text-left font-medium text-muted-foreground">Christian</th>
                <th className="p-3 text-left font-medium text-muted-foreground">Status</th>
                <th className="p-3 text-left font-medium text-muted-foreground">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(item => (
                <tr key={item.id} className="border-t border-border hover:bg-accent/30">
                  <td className="p-3">
                    <Checkbox
                      checked={selected.has(item.id)}
                      onCheckedChange={v => {
                        const next = new Set(selected);
                        v ? next.add(item.id) : next.delete(item.id);
                        setSelected(next);
                      }}
                    />
                  </td>
                  <td className="p-3 max-w-xs">
                    {editingId === item.id ? (
                      <Textarea
                        value={editForm.body}
                        onChange={e => setEditForm(prev => ({ ...prev, body: e.target.value }))}
                        className="min-h-[60px] text-sm"
                      />
                    ) : (
                      <p className="truncate text-foreground">{item.body}</p>
                    )}
                  </td>
                  <td className="p-3 text-muted-foreground whitespace-nowrap text-xs">
                    {editingId === item.id ? (
                      <Input
                        value={editForm.author}
                        onChange={e => setEditForm(prev => ({ ...prev, author: e.target.value }))}
                        className="text-xs h-8 w-32"
                      />
                    ) : (
                      item.author || '—'
                    )}
                  </td>
                  <td className="p-3 text-muted-foreground whitespace-nowrap">
                    {getContentTypeLabel(item.content_type)}
                  </td>
                  <td className="p-3">
                    <CategoryBadge category={item.category} />
                  </td>
                  <td className="p-3">
                    {item.is_christian ? (
                      <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">Christian</span>
                    ) : (
                      <span className="text-xs text-muted-foreground">General</span>
                    )}
                  </td>
                  <td className="p-3">
                    <span className={`text-xs px-2 py-0.5 rounded-full ${
                      item.status === 'active'
                        ? 'bg-secondary/20 text-secondary'
                        : 'bg-muted text-muted-foreground'
                    }`}>
                      {item.status}
                    </span>
                  </td>
                  <td className="p-3">
                    <div className="flex gap-1">
                      {editingId === item.id ? (
                        <>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => saveEdit(item.id)}
                            className="gap-1 text-secondary"
                          >
                            <Save className="w-3 h-3" /> Save
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => setEditingId(null)}
                          >
                            <X className="w-3 h-3" />
                          </Button>
                        </>
                      ) : (
                        <>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => startEdit(item)}
                            className="gap-1"
                          >
                            <Pencil className="w-3 h-3" /> Edit
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => updateMutation.mutate({
                              id: item.id,
                              data: { status: item.status === 'active' ? 'archived' : 'active' }
                            })}
                          >
                            {item.status === 'active' ? 'Archive' : 'Activate'}
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="text-destructive hover:text-destructive"
                            onClick={() => deleteMutation.mutate(item.id)}
                          >
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {filtered.length === 0 && (
          <div className="text-center py-12 text-muted-foreground text-sm">No items found.</div>
        )}
      </div>

      <p className="text-xs text-muted-foreground mt-3">{filtered.length} of {items.length} items shown</p>
    </div>
  );
}