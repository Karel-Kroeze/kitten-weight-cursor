import { json } from '@sveltejs/kit';
import { createSampleData, clearAllData } from '$lib/sampleData.js';
import type { RequestHandler } from '@sveltejs/kit';

export const POST: RequestHandler = async ({ request }) => {
  try {
    const { action } = await request.json();

    if (action === 'create') {
      createSampleData();
      return json({ message: 'Sample data created successfully' });
    } else if (action === 'clear') {
      clearAllData();
      return json({ message: 'All data cleared successfully' });
    } else {
      return json({ error: 'Invalid action. Use "create" or "clear"' }, { status: 400 });
    }
  } catch (error) {
    console.error('Error managing sample data:', error);
    return json({ error: 'Failed to manage sample data' }, { status: 500 });
  }
};