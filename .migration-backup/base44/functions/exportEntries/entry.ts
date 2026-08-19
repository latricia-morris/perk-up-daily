import { createClientFromRequest } from 'npm:@base44/sdk@0.8.34';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Fetch all user entries
    const entries = await base44.entities.UserEntry.filter({ created_by_id: user.id });

    // Format as JSON with metadata
    const exportData = {
      exportDate: new Date().toISOString(),
      userName: user.full_name,
      userEmail: user.email,
      totalEntries: entries.length,
      entries: entries.map(e => ({
        id: e.id,
        type: e.entry_type,
        title: e.title || '',
        body: e.body,
        oldBelief: e.old_belief || '',
        category: e.category,
        date: e.entry_date || '',
        location: e.location || '',
        photoUrl: e.photo_url || '',
        status: e.status,
        createdDate: e.created_date,
        updatedDate: e.updated_date,
      }))
    };

    const jsonString = JSON.stringify(exportData, null, 2);
    const fileName = `perk-up-export-${new Date().toISOString().split('T')[0]}.json`;

    return new Response(jsonString, {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Content-Disposition': `attachment; filename="${fileName}"`,
      },
    });
  } catch (error) {
    console.error('Export error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});