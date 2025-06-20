import { json } from '@sveltejs/kit';
import { createSampleData, clearAllData } from '$lib/sampleData.js';
import type { RequestHandler } from '@sveltejs/kit';

export const GET: RequestHandler = async ({ }) => {
  try {
    
      createSampleData();
      return json({ message: 'Sample data created successfully' });
    
  } catch (error) {
    console.error('Error managing sample data:', error);
    return json({ error: 'Failed to manage sample data' }, { status: 500 });
  }
};