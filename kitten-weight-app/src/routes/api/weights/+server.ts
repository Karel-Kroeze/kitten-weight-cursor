import { json } from '@sveltejs/kit';
import { WeightService } from '$lib/kittenService.js';
import type { RequestHandler } from '@sveltejs/kit';

export const GET: RequestHandler = async ({ url }) => {
  try {
    const kittenIdParam = url.searchParams.get('kitten_id');
    const limitParam = url.searchParams.get('limit');
    
    if (kittenIdParam) {
      const kittenId = parseInt(kittenIdParam);
      if (isNaN(kittenId)) {
        return json({ error: 'Invalid kitten ID' }, { status: 400 });
      }
      const weights = WeightService.getWeightsByKittenId(kittenId);
      return json(weights);
    }

    const limit = limitParam ? parseInt(limitParam) : 10;
    const recentWeights = WeightService.getRecentWeights(limit);
    return json(recentWeights);
  } catch (error) {
    console.error('Error fetching weights:', error);
    return json({ error: 'Failed to fetch weights' }, { status: 500 });
  }
};

export const POST: RequestHandler = async ({ request }) => {
  try {
    const weightData = await request.json();
    
    // Validate required fields
    if (!weightData.kitten_id || !weightData.weight_grams) {
      return json({ error: 'Kitten ID and weight are required' }, { status: 400 });
    }

    const kittenId = parseInt(weightData.kitten_id);
    const weightGrams = parseInt(weightData.weight_grams);

    if (isNaN(kittenId) || isNaN(weightGrams)) {
      return json({ error: 'Invalid kitten ID or weight value' }, { status: 400 });
    }

    if (weightGrams <= 0) {
      return json({ error: 'Weight must be greater than 0' }, { status: 400 });
    }

    const weightId = WeightService.createWeight({
      kitten_id: kittenId,
      weight_grams: weightGrams,
      measurement_date: weightData.measurement_date || new Date().toISOString(),
      notes: weightData.notes || null
    });

    const newWeight = WeightService.getWeightById(weightId);
    return json(newWeight, { status: 201 });
  } catch (error) {
    console.error('Error creating weight:', error);
    return json({ error: 'Failed to create weight measurement' }, { status: 500 });
  }
};