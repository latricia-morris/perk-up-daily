import { createClientFromRequest } from 'npm:@base44/sdk@0.8.40';

export default async function(req: Request): Promise<Response> {
  try {
    const base44 = createClientFromRequest(req);

    // Get today's date in MM-DD format (using ET to match user timezone)
    const now = new Date();
    const etFormatter = new Intl.DateTimeFormat('en-US', {
      timeZone: 'America/New_York',
      month: '2-digit',
      day: '2-digit',
    });
    const etParts = etFormatter.formatToParts(now);
    const month = etParts.find(p => p.type === 'month').value;
    const day = etParts.find(p => p.type === 'day').value;
    const todayMMDD = `${month}-${day}`;

    // Fetch all users
    const allUsers = await base44.asServiceRole.entities.User.list();

    if (!allUsers || allUsers.length === 0) {
      console.log('No users found');
      return Response.json({ processed: 0 });
    }

    let birthdayCount = 0;

    // Check each user's birthday
    for (const user of allUsers) {
      if (!user.birthday) continue;

      // Extract MM-DD from the birthday field (assumes date format YYYY-MM-DD)
      const birthdayMMDD = user.birthday.substring(5, 10);

      if (birthdayMMDD === todayMMDD) {
        // Mark this user's birthday
        await base44.asServiceRole.entities.User.update(user.id, {
          is_birthday_today: true,
        });
        birthdayCount++;
        console.log(`Marked birthday for user ${user.id}`);
      }
    }

    console.log(`Birthday check complete. ${birthdayCount} users have birthdays today.`);
    return Response.json({ processed: birthdayCount });
  } catch (error) {
    console.error('Birthday check error:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
}