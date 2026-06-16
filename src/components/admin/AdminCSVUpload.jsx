import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Upload, Loader2, AlertCircle, Check } from 'lucide-react';
import { getContentTypeLabel, getCategoryLabel, CONTENT_TYPES, CATEGORIES } from '@/lib/constants';

const VALID_TYPES = CONTENT_TYPES.map(t => t.slug);
const VALID_CATS = CATEGORIES.map(c => c.slug);

export default function AdminCSVUpload() {
  const queryClient = useQueryClient();
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState(null);
  const [errors, setErrors] = useState([]);
  const [publishing, setPublishing] = useState(false);
  const [done, setDone] = useState(false);

  const handleFile = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    setPreview(null);
    setErrors([]);
    setDone(false);

    const { file_url } = await base44.integrations.Core.UploadFile({ file });

    const result = await base44.integrations.Core.ExtractDataFromUploadedFile({
      file_url,
      json_schema: {
        type: 'object',
        properties: {
          rows: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                content_type: { type: 'string' },
                body: { type: 'string' },
                category: { type: 'string' },
                tags: { type: 'string' },
                status: { type: 'string' },
                scheduled_date: { type: 'string' },
              },
            },
          },
        },
      },
    });

    setUploading(false);

    if (result.status === 'error') {
      setErrors([result.details]);
      return;
    }

    const rows = result.output?.rows || [];
    const rowErrors = [];

    rows.forEach((row, i) => {
      if (!row.body) rowErrors.push(`Row ${i + 1}: Missing body text`);
      if (!row.content_type || !VALID_TYPES.includes(row.content_type))
        rowErrors.push(`Row ${i + 1}: Invalid content type "${row.content_type}"`);
      if (!row.category || !VALID_CATS.includes(row.category))
        rowErrors.push(`Row ${i + 1}: Invalid category "${row.category}"`);
    });

    setErrors(rowErrors);
    setPreview(rows);
  };

  const handlePublish = async () => {
    if (!preview || errors.length > 0) return;
    setPublishing(true);

    const items = preview.map(row => ({
      content_type: row.content_type,
      body: row.body,
      category: row.category,
      tags: row.tags || '',
      status: row.status || 'active',
      scheduled_date: row.scheduled_date || '',
    }));

    await base44.entities.AppLibrary.bulkCreate(items);
    queryClient.invalidateQueries({ queryKey: ['admin-library'] });
    setPublishing(false);
    setDone(true);
    setPreview(null);
  };

  return (
    <div>
      <h2 className="font-display text-lg font-semibold mb-2">CSV Bulk Upload</h2>
      <p className="text-sm text-muted-foreground mb-6">
        Upload a CSV with columns: content_type, body, category, tags, status, scheduled_date
      </p>

      {!preview && !done && (
        <label className="flex flex-col items-center justify-center border-2 border-dashed border-border rounded-xl p-12 cursor-pointer hover:border-primary/40 transition-colors">
          {uploading ? (
            <Loader2 className="w-8 h-8 animate-spin text-muted-foreground mb-3" />
          ) : (
            <Upload className="w-8 h-8 text-muted-foreground mb-3" />
          )}
          <span className="text-sm text-muted-foreground">
            {uploading ? 'Processing...' : 'Click to upload CSV'}
          </span>
          <input type="file" accept=".csv,.xlsx" onChange={handleFile} className="hidden" />
        </label>
      )}

      {errors.length > 0 && (
        <div className="mt-4 bg-destructive/10 border border-destructive/20 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <AlertCircle className="w-4 h-4 text-destructive" />
            <span className="text-sm font-medium text-destructive">Issues found</span>
          </div>
          <ul className="text-xs text-destructive space-y-1">
            {errors.map((err, i) => <li key={i}>{err}</li>)}
          </ul>
        </div>
      )}

      {preview && errors.length === 0 && (
        <div className="mt-6">
          <h3 className="text-sm font-semibold mb-3">{preview.length} rows ready to publish</h3>
          <div className="border border-border rounded-xl overflow-hidden mb-4">
            <div className="overflow-x-auto max-h-64">
              <table className="w-full text-xs">
                <thead className="bg-muted sticky top-0">
                  <tr>
                    <th className="p-2 text-left font-medium">Type</th>
                    <th className="p-2 text-left font-medium">Body</th>
                    <th className="p-2 text-left font-medium">Category</th>
                    <th className="p-2 text-left font-medium">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {preview.slice(0, 20).map((row, i) => (
                    <tr key={i} className="border-t border-border">
                      <td className="p-2 whitespace-nowrap">{getContentTypeLabel(row.content_type)}</td>
                      <td className="p-2 max-w-xs truncate">{row.body}</td>
                      <td className="p-2 whitespace-nowrap">{getCategoryLabel(row.category)}</td>
                      <td className="p-2">{row.status || 'active'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="flex gap-3">
            <Button onClick={handlePublish} disabled={publishing} className="bg-primary hover:bg-primary/90">
              {publishing ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
              Publish {preview.length} items
            </Button>
            <Button variant="outline" onClick={() => { setPreview(null); setErrors([]); }}>
              Cancel
            </Button>
          </div>
        </div>
      )}

      {done && (
        <div className="mt-6 bg-secondary/10 border border-secondary/20 rounded-lg p-6 text-center">
          <Check className="w-8 h-8 text-secondary mx-auto mb-2" />
          <p className="text-sm font-medium text-foreground">Published successfully!</p>
          <Button
            variant="outline"
            size="sm"
            className="mt-3"
            onClick={() => { setDone(false); setPreview(null); }}
          >
            Upload another
          </Button>
        </div>
      )}
    </div>
  );
}