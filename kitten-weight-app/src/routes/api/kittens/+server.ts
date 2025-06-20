import { json } from '@sveltejs/kit';
import { KittenService } from '$lib/kittenService.js';
import type { RequestHandler } from '@sveltejs/kit';

export const GET: RequestHandler = async () => {
  try {
    const kittens = KittenService.getAllKittens();
    return json(kittens);
  } catch (error) {
    console.error('Error fetching kittens:', error);
    return json({ error: 'Failed to fetch kittens' }, { status: 500 });
  }
};

export const POST: RequestHandler = async ({ request }) => {
  try {
    const kittenData = await request.json();
    
    // Validate required fields
    if (!kittenData.name || kittenData.name.trim() === '') {
      return json({ error: 'Name is required' }, { status: 400 });
    }

    const kittenId = KittenService.createKitten({
      name: kittenData.name.trim(),
      birth_date: kittenData.birth_date || null,
      rescue_date: kittenData.rescue_date || null,
      color: kittenData.color || null,
      sex: kittenData.sex || 'Unknown',
      status: kittenData.status || 'Active',
      notes: kittenData.notes || null
    });

    const newKitten = KittenService.getKittenById(kittenId);
    return json(newKitten, { status: 201 });
  } catch (error) {
    console.error('Error creating kitten:', error);
    return json({ error: 'Failed to create kitten' }, { status: 500 });
  }
};