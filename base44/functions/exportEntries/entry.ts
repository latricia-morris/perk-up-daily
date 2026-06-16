import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
    }

    // Fetch all user entries
    const entries = await base44.entities.UserEntry.filter({ created_by_id: user.id });

    // Convert to CSV
    const headers = ['Type', 'Body', 'Title', 'Category', 'Date', 'Location', 'Photo URL', 'Status', 'Created'];
    const rows = entries.map(e => [
      e.entry_type || '',
      (e.body || '').replace(/"/g, '""'), // Escape quotes
      (e.title || '').replace(/"/g, '""'),
      e.category || '',
      e.entry_date || '',
      (e.location || '').replace(/"/g, '""'),
      e.photo_url || '',
      e.status || '',
      e.created_date || '',
    ]);

    const csvContent = [
      headers.map(h => `"${h}"`).join(','),
      ...rows.map(r => r.map(v => `"${v}"`).join(',')),
    ].join('\n');

    return new Response(csvContent, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="perk-up-entries-${new Date().toISOString().split('T')[0]}.csv"`,
      },
    });
  } catch (error) {
    console.error('Export error:', error);
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
});