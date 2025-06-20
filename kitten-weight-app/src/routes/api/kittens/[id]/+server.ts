import { json } from '@sveltejs/kit';
import { KittenService } from '$lib/kittenService.js';
import type { RequestHandler } from '@sveltejs/kit';

export const GET: RequestHandler = async ({ params }) => {
  try {
    if (!params.id) {
      return json({ error: 'Kitten ID is required' }, { status: 400 });
    }
    
    const id = parseInt(params.id);
    if (isNaN(id)) {
      return json({ error: 'Invalid kitten ID' }, { status: 400 });
    }

    const kitten = KittenService.getKittenById(id);
    if (!kitten) {
      return json({ error: 'Kitten not found' }, { status: 404 });
    }

    return json(kitten);
  } catch (error) {
    console.error('Error fetching kitten:', error);
    return json({ error: 'Failed to fetch kitten' }, { status: 500 });
  }
};

export const PUT: RequestHandler = async ({ params, request }) => {
  try {
    if (!params.id) {
      return json({ error: 'Kitten ID is required' }, { status: 400 });
    }
    
    const id = parseInt(params.id);
    if (isNaN(id)) {
      return json({ error: 'Invalid kitten ID' }, { status: 400 });
    }

    const kittenData = await request.json();

    // Check if kitten exists
    const existingKitten = KittenService.getKittenById(id);
    if (!existingKitten) {
      return json({ error: 'Kitten not found' }, { status: 404 });
    }

    // Validate name if provided
    if (kittenData.name !== undefined && (!kittenData.name || kittenData.name.trim() === '')) {
      return json({ error: 'Name cannot be empty' }, { status: 400 });
    }

    const success = KittenService.updateKitten(id, {
      name: kittenData.name?.trim(),
      birth_date: kittenData.birth_date,
      rescue_date: kittenData.rescue_date,
      color: kittenData.color,
      sex: kittenData.sex,
      status: kittenData.status,
      notes: kittenData.notes
    });

    if (!success) {
      return json({ error: 'Failed to update kitten' }, { status: 500 });
    }

    const updatedKitten = KittenService.getKittenById(id);
    return json(updatedKitten);
  } catch (error) {
    console.error('Error updating kitten:', error);
    return json({ error: 'Failed to update kitten' }, { status: 500 });
  }
};

export const DELETE: RequestHandler = async ({ params }) => {
  try {
    if (!params.id) {
      return json({ error: 'Kitten ID is required' }, { status: 400 });
    }
    
    const id = parseInt(params.id);
    if (isNaN(id)) {
      return json({ error: 'Invalid kitten ID' }, { status: 400 });
    }

    // Check if kitten exists
    const existingKitten = KittenService.getKittenById(id);
    if (!existingKitten) {
      return json({ error: 'Kitten not found' }, { status: 404 });
    }

    const success = KittenService.deleteKitten(id);
    if (!success) {
      return json({ error: 'Failed to delete kitten' }, { status: 500 });
    }

    return json({ message: 'Kitten deleted successfully' });
  } catch (error) {
    console.error('Error deleting kitten:', error);
    return json({ error: 'Failed to delete kitten' }, { status: 500 });
  }
};